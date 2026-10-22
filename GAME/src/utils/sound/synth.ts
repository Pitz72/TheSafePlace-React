// utils/sound/synth.ts

/**
 * The building blocks of every sound in the game. Everything is synthesised at
 * runtime with Web Audio nodes: no audio files to load, license or bundle, and
 * nothing the desktop app's Content-Security-Policy has to allow.
 */

/** Looping noise beds, each generated the first time it is needed. */
export interface NoiseBank {
    white: AudioBuffer;
    pink: AudioBuffer;
    brown: AudioBuffer;
}

/** Where a voice plays: the dry bus, the reverb send and the shared noise. */
export interface Synth {
    ctx: BaseAudioContext;
    out: AudioNode;
    verb: AudioNode;
    noise: NoiseBank;
}

const SILENCE = 0.0001;

/** MIDI note number to frequency (A4 = 69 = 440 Hz). */
export const mtof = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

/** Uniform random number in [min, max). */
export const rand = (min: number, max: number): number => min + Math.random() * (max - min);

/**
 * Fills a buffer with noise from `next` and crossfades its head with what would
 * have followed its end, so the buffer loops without a seam (brown noise wanders
 * slowly and would otherwise click at the loop point).
 */
const loopingNoise = (ctx: BaseAudioContext, seconds: number, makeNext: () => () => number): AudioBuffer => {
    const length = Math.floor(ctx.sampleRate * seconds);
    const fade = Math.floor(ctx.sampleRate * 0.25);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
        const next = makeNext();
        const raw = new Float32Array(length + fade);
        let peak = 0;
        for (let i = 0; i < raw.length; i++) {
            raw[i] = next();
            peak = Math.max(peak, Math.abs(raw[i]));
        }
        const data = buffer.getChannelData(channel);
        const scale = peak > 0 ? 0.9 / peak : 1;
        for (let i = 0; i < length; i++) {
            if (i < fade) {
                const k = (i / fade) * Math.PI / 2;
                data[i] = (raw[i] * Math.sin(k) + raw[length + i] * Math.cos(k)) * scale;
            } else {
                data[i] = raw[i] * scale;
            }
        }
    }
    return buffer;
};

export const createNoiseBank = (ctx: BaseAudioContext): NoiseBank => {
    let white: AudioBuffer | undefined;
    let pink: AudioBuffer | undefined;
    let brown: AudioBuffer | undefined;
    return {
        get white() {
            return white ??= loopingNoise(ctx, 2, () => () => Math.random() * 2 - 1);
        },
        // Paul Kellet's economy pink filter: -3 dB/octave, the colour of wind and rain.
        get pink() {
            return pink ??= loopingNoise(ctx, 5, () => {
                let b0 = 0, b1 = 0, b2 = 0;
                return () => {
                    const w = Math.random() * 2 - 1;
                    b0 = 0.99765 * b0 + w * 0.099046;
                    b1 = 0.96300 * b1 + w * 0.2965164;
                    b2 = 0.57000 * b2 + w * 1.0526913;
                    return b0 + b1 + b2 + w * 0.1848;
                };
            });
        },
        // Leaky integrator: -6 dB/octave, for rumbles, rivers and the low body of the wind.
        get brown() {
            return brown ??= loopingNoise(ctx, 6, () => {
                let last = 0;
                return () => {
                    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
                    return last;
                };
            });
        },
    };
};

/**
 * A stereo impulse response for a ConvolverNode: a soft, dark open-air tail
 * (high frequencies die out faster than the lows, as they do outdoors).
 */
export const createImpulse = (ctx: BaseAudioContext, seconds = 2.8): AudioBuffer => {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(2, length, rate);
    // Exponential decay, -60 dB after 3.2 s, faded out over the last 15% of the buffer.
    const decay = Math.exp(-Math.log(1000) / (rate * 3.2));
    const fadeIn = rate * 0.012;
    const fadeOut = length * 0.85;
    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let low = 0;
        let level = 1;
        for (let i = 0; i < length; i++) {
            const t = i / length;
            // The smoothing grows along the tail: brighter early reflections, darker end.
            low += (Math.random() * 2 - 1 - low) * (0.8 - 0.75 * t);
            level *= decay;
            const edge = i < fadeIn ? i / fadeIn : i > fadeOut ? (length - i) / (length - fadeOut) : 1;
            data[i] = low * level * edge;
        }
    }
    return buffer;
};

/** Connects a voice to the bus, panned, with an optional reverb send. */
const route = (s: Synth, node: AudioNode, pan = 0, send = 0) => {
    let out: AudioNode = node;
    if (pan !== 0) {
        const panner = s.ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        node.connect(panner);
        out = panner;
    }
    out.connect(s.out);
    if (send > 0) {
        const sendGain = s.ctx.createGain();
        sendGain.gain.value = send;
        out.connect(sendGain);
        sendGain.connect(s.verb);
    }
};

/** Attack, optional hold, exponential decay. Returns the time the voice is silent. */
const envelope = (param: AudioParam, t: number, peak: number, attack: number, hold: number, decay: number): number => {
    // A gain rests at 1 until its first event, and a source started between two samples
    // already outputs on the sample before `t`: keep it shut from the start.
    param.value = 0;
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(peak, t + attack);
    if (hold > 0) param.setValueAtTime(peak, t + attack + hold);
    param.exponentialRampToValueAtTime(SILENCE, t + attack + hold + decay);
    return t + attack + hold + decay;
};

export interface ToneOptions {
    freq: number;
    t: number;
    peak: number;
    decay: number;
    type?: OscillatorType;
    attack?: number;
    hold?: number;
    /** Glide the pitch to this frequency over `glideTime` (default: the whole decay). */
    glideTo?: number;
    glideTime?: number;
    detune?: number;
    /** Low-pass cutoff in Hz, to round off brighter waveforms. */
    lowpass?: number;
    pan?: number;
    send?: number;
}

/** One oscillator with an envelope. */
export const tone = (s: Synth, o: ToneOptions): void => {
    const { ctx } = s;
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(o.freq, o.t);
    if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, o.t + (o.glideTime ?? (o.attack ?? 0.005) + o.decay));
    if (o.detune) osc.detune.value = o.detune;
    const gain = ctx.createGain();
    const end = envelope(gain.gain, o.t, o.peak, o.attack ?? 0.005, o.hold ?? 0, o.decay);
    if (o.lowpass) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = o.lowpass;
        filter.Q.value = 0.5;
        osc.connect(filter);
        filter.connect(gain);
    } else {
        osc.connect(gain);
    }
    route(s, gain, o.pan, o.send);
    osc.start(o.t);
    osc.stop(end + 0.05);
};

/** [frequency ratio, relative level, relative decay] of each partial. */
export type Partials = readonly (readonly [number, number, number])[];

/** Felt mallet on a wooden bar: round, short, the overtone fades at once. */
export const MALLET: Partials = [[1, 1, 1], [4, 0.16, 0.18], [9.8, 0.03, 0.08]];
/** Kalimba tine: a clear fundamental with a quick metallic glint. */
export const KALIMBA: Partials = [[1, 1, 1], [5.4, 0.1, 0.12], [2, 0.08, 0.5]];
/** Small glass bell: inharmonic partials that ring on. */
export const BELL: Partials = [[1, 1, 1], [2.76, 0.42, 0.55], [5.4, 0.2, 0.32], [8.93, 0.08, 0.2]];
/** Music box comb: thin, bright, a little tinny. */
export const MUSIC_BOX: Partials = [[1, 1, 1], [2, 0.22, 0.5], [3.97, 0.14, 0.28], [6.1, 0.05, 0.15]];

export interface StrikeOptions {
    freq: number;
    t: number;
    peak: number;
    decay: number;
    partials?: Partials;
    attack?: number;
    pan?: number;
    send?: number;
    /** Level of the soft "tok" of the strike itself (0 = none). */
    knock?: number;
}

/** A struck or plucked note built from a few sine partials. */
export const strike = (s: Synth, o: StrikeOptions): void => {
    const nyquist = s.ctx.sampleRate / 2.2;
    for (const [ratio, level, decayScale] of o.partials ?? MALLET) {
        const freq = o.freq * ratio;
        if (freq >= nyquist) continue;
        tone(s, {
            freq,
            t: o.t,
            peak: o.peak * level,
            attack: o.attack ?? 0.004,
            decay: Math.max(0.03, o.decay * decayScale),
            pan: o.pan,
            send: o.send,
        });
    }
    if (o.knock) {
        noise(s, { t: o.t, peak: o.peak * o.knock, attack: 0.001, decay: 0.03, filter: 'bandpass', freq: Math.min(o.freq * 3, 6000), q: 1.2, pan: o.pan });
    }
};

export interface PadOptions {
    freqs: readonly number[];
    t: number;
    peak: number;
    attack: number;
    hold: number;
    release: number;
    /** Low-pass cutoff; the filter opens a little during the attack. */
    cutoff?: number;
    send?: number;
    pan?: number;
}

/** A soft chord: two slightly detuned triangles per note through a warm filter. */
export const pad = (s: Synth, o: PadOptions): void => {
    const { ctx } = s;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = o.cutoff ?? 1600;
    filter.frequency.value = cutoff * 0.5;
    filter.frequency.setValueAtTime(cutoff * 0.5, o.t);
    filter.frequency.linearRampToValueAtTime(cutoff, o.t + o.attack);
    filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, o.t + o.attack + o.hold + o.release);
    filter.Q.value = 0.4;
    const gain = ctx.createGain();
    const end = envelope(gain.gain, o.t, o.peak, o.attack, o.hold, o.release);
    filter.connect(gain);
    route(s, gain, o.pan, o.send ?? 0.5);
    const voiceLevel = 1 / Math.sqrt(o.freqs.length * 2);
    for (const freq of o.freqs) {
        for (const cents of [-7, 6]) {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            osc.detune.value = cents;
            const level = ctx.createGain();
            level.gain.value = voiceLevel;
            osc.connect(level);
            level.connect(filter);
            osc.start(o.t);
            osc.stop(end + 0.05);
        }
    }
};

export interface NoiseOptions {
    t: number;
    peak: number;
    decay: number;
    attack?: number;
    hold?: number;
    color?: keyof NoiseBank;
    filter?: BiquadFilterType;
    freq?: number;
    /** Sweep the filter to this frequency during the sound. */
    freqTo?: number;
    q?: number;
    pan?: number;
    send?: number;
}

/** A burst of filtered noise: paper, breath, impacts, thunder. */
export const noise = (s: Synth, o: NoiseOptions): void => {
    const { ctx } = s;
    const source = ctx.createBufferSource();
    const buffer = s.noise[o.color ?? 'white'];
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter ?? 'bandpass';
    // Set the resting value too: a filter jumping from its default 350 Hz while the
    // noise already runs throws a one-sample spike (very audible on a high-pass).
    filter.frequency.value = o.freq ?? 1000;
    filter.frequency.setValueAtTime(o.freq ?? 1000, o.t);
    const attack = o.attack ?? 0.005;
    const hold = o.hold ?? 0;
    if (o.freqTo) filter.frequency.exponentialRampToValueAtTime(o.freqTo, o.t + attack + hold + o.decay);
    filter.Q.value = o.q ?? 0.8;
    const gain = ctx.createGain();
    const end = envelope(gain.gain, o.t, o.peak, attack, hold, o.decay);
    source.connect(filter);
    filter.connect(gain);
    route(s, gain, o.pan, o.send);
    // Start somewhere random in the bed so repeated bursts never sound identical.
    source.start(o.t, Math.random() * buffer.duration * 0.9);
    source.stop(end + 0.05);
};
