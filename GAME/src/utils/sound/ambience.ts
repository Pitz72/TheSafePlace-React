// utils/sound/ambience.ts
import { WeatherType } from '../../types';
import { NoiseBank, Synth, noise, rand, tone } from './synth';

/** What the player hears around them: where they are, when, and under which sky. */
export interface AmbienceScene {
    /** Map tile under the player ('.', 'F', '~', 'M', 'C', 'V', or a special place). */
    biome: string;
    /** Hour of the day, minutes as a fraction. */
    hour: number;
    weather: WeatherType;
    /** 0-1: how much water is close by (a river, a lake). */
    water?: number;
    /** Inside a refuge: the outside comes through the walls, a small fire burns. */
    sheltered?: boolean;
    /** 0-1: lower while a menu, a fight or a cutscene has the player's attention. */
    level?: number;
}

/** Levels of every layer, 0-1. Pure function of the scene, so it can be tested. */
export interface AmbienceMix {
    wind: number;
    /** How much the wind gusts (0 = steady). */
    gusts: number;
    /** Wind whistling through ruins and rocks. */
    whistle: number;
    leaves: number;
    rain: number;
    thunder: number;
    water: number;
    birds: number;
    /** 0-1: dawn chorus (more doves and whistles) versus day and dusk song. */
    dawn: number;
    crickets: number;
    owls: number;
    creaks: number;
    creakKind: 'wood' | 'metal';
    fire: number;
    sheltered: boolean;
}

type AudioBiome = 'plains' | 'forest' | 'water' | 'mountain' | 'city' | 'village' | 'outpost';

/** Special map tiles sound like the closest landscape. */
const BIOME_OF_TILE: Record<string, AudioBiome> = {
    '.': 'plains', S: 'plains', E: 'plains', T: 'plains', R: 'plains', H: 'forest', N: 'plains',
    F: 'forest', '~': 'water', M: 'mountain', C: 'city', L: 'city', B: 'city', V: 'village', A: 'outpost',
};

interface BiomeSound {
    wind: number; whistle: number; leaves: number; birds: number; crickets: number; owls: number;
    creaks: number; creakKind: 'wood' | 'metal'; fire: number;
}

const BIOMES: Record<AudioBiome, BiomeSound> = {
    plains: { wind: 0.6, whistle: 0, leaves: 0.15, birds: 0.6, crickets: 1, owls: 0.35, creaks: 0, creakKind: 'wood', fire: 0 },
    forest: { wind: 0.35, whistle: 0, leaves: 0.8, birds: 1, crickets: 0.7, owls: 1, creaks: 0.4, creakKind: 'wood', fire: 0 },
    water: { wind: 0.45, whistle: 0, leaves: 0.15, birds: 0.6, crickets: 0.6, owls: 0.2, creaks: 0, creakKind: 'wood', fire: 0 },
    mountain: { wind: 0.85, whistle: 0.55, leaves: 0, birds: 0.2, crickets: 0.15, owls: 0.1, creaks: 0, creakKind: 'wood', fire: 0 },
    city: { wind: 0.5, whistle: 0.6, leaves: 0, birds: 0.3, crickets: 0.3, owls: 0.15, creaks: 1, creakKind: 'metal', fire: 0 },
    village: { wind: 0.45, whistle: 0.15, leaves: 0.25, birds: 0.55, crickets: 0.8, owls: 0.6, creaks: 0.8, creakKind: 'wood', fire: 0 },
    outpost: { wind: 0.35, whistle: 0.1, leaves: 0.1, birds: 0.4, crickets: 0.6, owls: 0.3, creaks: 0.5, creakKind: 'wood', fire: 0.7 },
};

const WEATHER: Record<WeatherType, { wind: number; gusts: number; rain: number; life: number; thunder: number }> = {
    [WeatherType.SERENO]: { wind: 0.8, gusts: 0.4, rain: 0, life: 1, thunder: 0 },
    [WeatherType.NUVOLOSO]: { wind: 1.05, gusts: 0.6, rain: 0, life: 0.7, thunder: 0 },
    // Rain silences birds, insects and owls alike.
    [WeatherType.PIOGGIA]: { wind: 0.9, gusts: 0.5, rain: 0.6, life: 0, thunder: 0 },
    [WeatherType.TEMPESTA]: { wind: 1.45, gusts: 1, rain: 1, life: 0, thunder: 1 },
    // Fog is still air: the wind drops, sounds come from nowhere.
    [WeatherType.NEBBIA]: { wind: 0.35, gusts: 0.15, rain: 0, life: 0.5, thunder: 0 },
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smoothstep = (x: number, a: number, b: number) => {
    const k = clamp01((x - a) / (b - a));
    return k * k * (3 - 2 * k);
};
/** 0 before `a`, 1 at `peak`, 0 again after `b`. */
const bump = (x: number, a: number, peak: number, b: number) =>
    x < peak ? smoothstep(x, a, peak) : 1 - smoothstep(x, peak, b);

/** 1 deep in the night (21:30-04:30), 0 in daylight, smooth at dusk and dawn. */
export const nightness = (hour: number): number =>
    hour >= 12 ? smoothstep(hour, 19.5, 21.5) : 1 - smoothstep(hour, 4.5, 6);

export const ambienceMix = (scene: AmbienceScene): AmbienceMix => {
    const biome = BIOMES[BIOME_OF_TILE[scene.biome] ?? 'plains'];
    const weather = WEATHER[scene.weather] ?? WEATHER[WeatherType.SERENO];
    const hour = ((scene.hour % 24) + 24) % 24;
    const night = nightness(hour);
    const dawn = bump(hour, 4.6, 6.3, 9);
    const evensong = bump(hour, 16.5, 18.5, 20.5);
    const sheltered = scene.sheltered === true;
    return {
        wind: biome.wind * weather.wind * (1 - 0.2 * night),
        gusts: weather.gusts,
        whistle: biome.whistle * Math.min(1.3, weather.wind),
        leaves: biome.leaves * Math.min(1.3, weather.wind),
        rain: weather.rain,
        thunder: weather.thunder,
        water: clamp01(scene.water ?? (scene.biome === '~' ? 1 : 0)),
        birds: clamp01(biome.birds * weather.life * ((1 - night) * 0.3 + dawn * 0.7 + evensong * 0.3)),
        dawn,
        crickets: clamp01(biome.crickets * night * weather.life),
        owls: biome.owls * night * (weather.life >= 0.5 ? 1 : 0),
        creaks: biome.creaks * (0.6 + 0.4 * weather.gusts),
        creakKind: biome.creakKind,
        fire: sheltered ? 0.8 : biome.fire,
        sheltered,
    };
};

/** Overall level of the ambience against the effects. */
const AMBIENCE_GAIN = 0.7;
const LOOKAHEAD = 0.35;
const TICK_MS = 150;

/** Exponential wait with the given mean: events that arrive "now and then". */
const wait = (mean: number) => -Math.log(1 - Math.random() * 0.95) * mean;

interface Layer {
    gain: GainNode;
    filter: BiquadFilterNode;
}

type EventKey = 'gust' | 'bird' | 'owl' | 'thunder' | 'creak' | 'bubble' | 'crackle' | 'drop';

interface Cricket {
    freq: number;
    pan: number;
    period: number;
    next: number;
}

/**
 * A running soundscape. Continuous layers (wind, leaves, rain, river) are looping
 * noise through filters whose levels glide to the targets of the mix; living
 * things and weather events are scheduled a little ahead by a timer.
 */
export class Ambience {
    private readonly ctx: BaseAudioContext;
    private readonly bus: GainNode;
    private readonly muffle: BiquadFilterNode;
    private readonly outdoor: Synth;
    private readonly indoor: Synth;
    private readonly sources: AudioBufferSourceNode[] = [];
    private readonly wind: Layer;
    private readonly windBody: Layer;
    private readonly whistle: Layer;
    private readonly leaves: Layer;
    private readonly rain: Layer;
    private readonly rainHiss: Layer;
    private readonly river: Layer;
    private readonly babble: Layer;
    private readonly fireBed: Layer;
    private mix: AmbienceMix | null = null;
    private level = 0;
    private timer: ReturnType<typeof setInterval> | null = null;
    private next: Record<EventKey, number>;
    private crickets: Cricket[] = [];
    private gust = 1;

    constructor(ctx: BaseAudioContext, destination: AudioNode, bank: NoiseBank, impulse: AudioBuffer) {
        this.ctx = ctx;
        this.bus = ctx.createGain();
        this.bus.gain.value = 0;
        this.bus.connect(destination);

        // Everything outside goes through a filter that closes when the walls of a refuge are around you.
        this.muffle = ctx.createBiquadFilter();
        this.muffle.type = 'lowpass';
        this.muffle.frequency.value = 18000;
        this.muffle.Q.value = 0.5;
        this.muffle.connect(this.bus);
        const outdoorIn = ctx.createGain();
        outdoorIn.connect(this.muffle);
        const reverb = ctx.createConvolver();
        reverb.buffer = impulse;
        reverb.connect(outdoorIn);
        this.outdoor = { ctx, out: outdoorIn, verb: reverb, noise: bank };
        const indoorIn = ctx.createGain();
        indoorIn.connect(this.bus);
        this.indoor = { ctx, out: indoorIn, verb: reverb, noise: bank };

        this.wind = this.layer(bank.pink, 'bandpass', 420, 0.7, outdoorIn);
        this.windBody = this.layer(bank.brown, 'lowpass', 150, 0.5, outdoorIn);
        this.whistle = this.layer(bank.white, 'bandpass', 950, 14, outdoorIn);
        // Leaves and the sheen of the rain are band-limited pink noise: white noise up there is just hiss.
        this.leaves = this.layer(bank.pink, 'bandpass', 3200, 0.6, outdoorIn);
        this.rain = this.layer(bank.pink, 'bandpass', 1100, 0.35, outdoorIn);
        this.rainHiss = this.layer(bank.pink, 'bandpass', 5500, 0.7, outdoorIn);
        this.river = this.layer(bank.brown, 'bandpass', 420, 0.6, outdoorIn);
        this.babble = this.layer(bank.pink, 'bandpass', 1100, 1.4, outdoorIn);
        this.fireBed = this.layer(bank.brown, 'lowpass', 260, 0.6, indoorIn);

        const now = ctx.currentTime;
        this.next = { gust: now, bird: Infinity, owl: Infinity, thunder: Infinity, creak: Infinity, bubble: Infinity, crackle: Infinity, drop: Infinity };
        this.timer = setInterval(() => this.tick(), TICK_MS);
    }

    /** Glides to a new scene and loudness (level 0 = silent but running). */
    public setScene(scene: AmbienceScene) {
        const previous = this.mix;
        const mix = ambienceMix(scene);
        const level = clamp01(scene.level ?? 1);
        this.mix = mix;
        this.level = level;
        const now = this.ctx.currentTime;
        this.bus.gain.setTargetAtTime(AMBIENCE_GAIN * level, now, 0.8);
        this.muffle.frequency.setTargetAtTime(mix.sheltered ? 700 : 18000, now, 0.4);

        this.set(this.rain, mix.rain * 0.16, 1.5);
        this.set(this.rainHiss, mix.rain * 0.04, 1.5);
        this.set(this.river, mix.water * 0.24, 1.2);
        this.set(this.babble, mix.water * 0.06, 1.2);
        this.set(this.fireBed, mix.fire * 0.12, 1);
        this.applyWind(1.2);

        // Events that just became possible start after a natural pause, not all at once.
        const start = (key: EventKey, on: boolean, mean: number) => {
            if (!on) this.next[key] = Infinity;
            else if (this.next[key] === Infinity) this.next[key] = now + rand(0.3, 1) * mean;
        };
        start('bird', mix.birds > 0.03, 4);
        start('owl', mix.owls > 0.05, 20);
        start('thunder', mix.thunder > 0, 10);
        start('creak', mix.creaks > 0.05, 15);
        start('bubble', mix.water > 0.05, 0.6);
        start('crackle', mix.fire > 0.05, 0.3);
        start('drop', mix.rain > 0.05, 0.2);

        const crickets = Math.round(mix.crickets * 4);
        if (!previous || crickets !== this.crickets.length) {
            this.crickets = Array.from({ length: crickets }, (_, i) => this.crickets[i] ?? {
                freq: rand(4200, 5200),
                pan: rand(-0.8, 0.8),
                period: rand(0.55, 1.1),
                next: now + rand(0.5, 3),
            });
        }
    }

    /** Fades out, then frees every node. */
    public dispose(fade = 0.6) {
        const now = this.ctx.currentTime;
        this.bus.gain.cancelScheduledValues(now);
        this.bus.gain.setTargetAtTime(0, now, fade / 3);
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        setTimeout(() => {
            for (const source of this.sources) {
                try { source.stop(); } catch { /* already stopped */ }
            }
            this.bus.disconnect();
        }, fade * 1000 + 300);
    }

    private layer(buffer: AudioBuffer, type: BiquadFilterType, freq: number, q: number, out: AudioNode): Layer {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = q;
        const gain = this.ctx.createGain();
        gain.gain.value = 0;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        source.start(this.ctx.currentTime, Math.random() * buffer.duration);
        this.sources.push(source);
        return { gain, filter };
    }

    private set(layer: Layer, value: number, timeConstant = 0.8) {
        layer.gain.gain.setTargetAtTime(value, this.ctx.currentTime, timeConstant);
    }

    private applyWind(timeConstant: number) {
        const mix = this.mix;
        if (!mix) return;
        const now = this.ctx.currentTime;
        const g = this.gust;
        this.set(this.wind, mix.wind * 0.2 * g, timeConstant);
        this.set(this.windBody, mix.wind * 0.22 * g * (0.6 + 0.4 * mix.gusts), timeConstant);
        this.wind.filter.frequency.setTargetAtTime((300 + 260 * mix.gusts) * (0.7 + 0.5 * g), now, timeConstant);
        this.set(this.whistle, mix.whistle * 0.14 * g ** 2, timeConstant);
        this.whistle.filter.frequency.setTargetAtTime(rand(700, 1300), now, timeConstant * 1.5);
        this.set(this.leaves, mix.leaves * 0.05 * g ** 1.5, timeConstant);
        this.babble.filter.frequency.setTargetAtTime(rand(800, 1500), now, 0.6);
    }

    private tick() {
        const mix = this.mix;
        if (!mix || this.ctx.state !== 'running' || this.level <= 0.01) return;
        const now = this.ctx.currentTime;
        const horizon = now + LOOKAHEAD;
        // After a pause (a quiet menu, a hidden window) start again from now, not with a backlog.
        for (const key of Object.keys(this.next) as EventKey[]) {
            if (this.next[key] < now - 0.2) this.next[key] = now + rand(0.05, 0.4);
        }
        const due = (key: EventKey) => this.next[key] <= horizon;
        const at = (key: EventKey) => Math.max(now + 0.02, this.next[key]);

        if (due('gust')) {
            // The wind breathes: a new strength every couple of seconds, deeper in a storm.
            this.gust = 1 + (Math.random() * 2 - 1) * (0.25 + 0.45 * mix.gusts);
            this.applyWind(rand(0.6, 1.6));
            this.next.gust = now + rand(1.2, 3.2);
        }
        if (due('bird')) {
            this.bird(at('bird'), mix.dawn);
            this.next.bird = now + wait(3.5 / Math.max(0.15, mix.birds));
        }
        if (due('owl')) {
            this.owl(at('owl'));
            this.next.owl = now + wait(35 / Math.max(0.2, mix.owls));
        }
        if (due('thunder')) {
            this.thunder(at('thunder'));
            this.next.thunder = now + rand(9, 30);
        }
        if (due('creak')) {
            if (mix.creakKind === 'metal') this.groan(at('creak'));
            else this.creak(at('creak'));
            this.next.creak = now + wait(24 / Math.max(0.2, mix.creaks));
        }
        while (this.next.bubble <= horizon) {
            this.bubble(at('bubble'), mix.water);
            this.next.bubble += wait(0.35 / mix.water);
        }
        while (this.next.crackle <= horizon) {
            this.crackle(at('crackle'), mix.fire);
            // Crackles come in little clusters.
            this.next.crackle += Math.random() < 0.6 ? rand(0.03, 0.12) : wait(0.5 / mix.fire);
        }
        while (this.next.drop <= horizon) {
            this.drop(at('drop'), mix);
            this.next.drop += wait((mix.sheltered ? 0.09 : 0.14) / mix.rain);
        }
        for (const cricket of this.crickets) {
            if (cricket.next < now) cricket.next = now + rand(0.1, 0.5);
            while (cricket.next <= horizon) {
                this.chirp(cricket, cricket.next, mix.crickets);
                // Now and then a cricket falls silent for a while.
                cricket.next += Math.random() < 0.06 ? rand(2, 7) : cricket.period * rand(0.92, 1.08);
            }
        }
    }

    // --- Events -------------------------------------------------------------

    private bird(t: number, dawn: number) {
        const s = this.outdoor;
        const near = rand(0.35, 1);
        const peak = 0.05 * near;
        const pan = rand(-0.85, 0.85);
        const send = 0.2 + (1 - near) * 0.6;
        const roll = Math.random();
        if (roll < 0.15 + 0.25 * dawn) {
            // A dove somewhere, low and round.
            const f = rand(480, 560);
            [0, 0.42, 0.95, 1.3].forEach((offset, i) => {
                tone(s, { freq: f * (i === 1 ? 1.08 : 1), glideTo: f * 0.94, t: t + offset, peak: peak * 0.45, attack: 0.05, hold: i === 1 ? 0.18 : 0.08, decay: 0.2, pan, send: send + 0.1 });
            });
        } else if (roll < 0.65) {
            // Two to four whistled notes.
            const base = rand(2300, 3600);
            const up = Math.random() < 0.5;
            const notes = 2 + Math.floor(Math.random() * 3);
            let time = t;
            for (let i = 0; i < notes; i++) {
                const f = base * rand(0.92, 1.1);
                tone(s, { freq: f, glideTo: f * (up ? rand(1.1, 1.35) : rand(0.75, 0.9)), t: time, peak, attack: 0.01, decay: rand(0.07, 0.14), pan, send });
                time += rand(0.11, 0.2);
            }
        } else {
            // A quick trill, falling.
            const base = rand(3800, 5200);
            const notes = 6 + Math.floor(Math.random() * 7);
            for (let i = 0; i < notes; i++) {
                const f = base * (1 - i * 0.015);
                tone(s, { freq: f, glideTo: f * 0.9, t: t + i * 0.048, peak: peak * 0.6, attack: 0.004, decay: 0.035, pan, send });
            }
        }
    }

    private owl(t: number) {
        const s = this.outdoor;
        const pan = rand(-0.7, 0.7);
        const f = rand(370, 420);
        tone(s, { freq: f, glideTo: f * 0.94, t, peak: 0.03, attack: 0.06, hold: 0.12, decay: 0.28, pan, send: 0.7 });
        tone(s, { freq: f * 1.02, glideTo: f * 0.92, t: t + 0.75, peak: 0.025, attack: 0.05, hold: 0.06, decay: 0.15, pan, send: 0.7 });
        tone(s, { freq: f, glideTo: f * 0.9, t: t + 1.0, peak: 0.03, attack: 0.07, hold: 0.25, decay: 0.4, pan, send: 0.7 });
    }

    private thunder(t: number) {
        const s = this.outdoor;
        const near = Math.random() < 0.35;
        const pan = rand(-0.6, 0.6);
        const peak = near ? 0.55 : 0.32;
        if (near) noise(s, { t, peak: 0.05, attack: 0.004, decay: 0.4, filter: 'highpass', freq: 1500, q: 0.5, pan, send: 0.6 });
        noise(s, { t: t + (near ? 0.03 : rand(0.2, 0.6)), peak, color: 'brown', attack: near ? 0.06 : 0.5, hold: rand(0.3, 0.9), decay: rand(2.5, 4.5), filter: 'lowpass', freq: near ? 420 : 240, freqTo: 80, q: 0.6, pan, send: 0.5 });
        noise(s, { t: t + rand(0.7, 1.5), peak: peak * 0.6, color: 'brown', attack: 0.4, decay: rand(2, 3.5), filter: 'lowpass', freq: 200, freqTo: 70, q: 0.6, pan: -pan, send: 0.6 });
    }

    /** Wood under strain: a slow train of clicks through a resonance (a door, a branch, a beam). */
    private creak(t: number) {
        const { ctx } = this;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(rand(12, 20), t);
        osc.frequency.linearRampToValueAtTime(rand(28, 46), t + rand(0.3, 0.5));
        osc.frequency.linearRampToValueAtTime(rand(10, 18), t + 0.95);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = rand(650, 1100);
        filter.Q.value = 6;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.15);
        gain.gain.setValueAtTime(0.05, t + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
        this.connectEvent(osc, filter, gain, rand(-0.7, 0.7), 0.5);
        osc.start(t);
        osc.stop(t + 1.1);
    }

    /** Metal far away, swaying in the wind: a sheet, a sign, a crane. */
    private groan(t: number) {
        const { ctx } = this;
        const source = ctx.createBufferSource();
        source.buffer = this.outdoor.noise.white;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.5);
        gain.gain.setValueAtTime(0.5, t + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
        const base = rand(170, 260);
        const pan = ctx.createStereoPanner();
        pan.pan.value = rand(-0.8, 0.8);
        for (const ratio of [1, 2.31, 3.87]) {
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(base * ratio, t);
            filter.frequency.linearRampToValueAtTime(base * ratio * rand(0.96, 0.99), t + 2.8);
            filter.Q.value = 18;
            source.connect(filter);
            filter.connect(gain);
        }
        gain.connect(pan);
        pan.connect(this.outdoor.out);
        const send = ctx.createGain();
        send.gain.value = 0.8;
        pan.connect(send);
        send.connect(this.outdoor.verb);
        source.start(t, Math.random());
        source.stop(t + 2.9);
    }

    private bubble(t: number, water: number) {
        const f = rand(350, 900);
        tone(this.outdoor, { freq: f, glideTo: f * rand(1.4, 2), glideTime: rand(0.03, 0.07), t, peak: rand(0.006, 0.018) * water, attack: 0.003, decay: rand(0.04, 0.08), pan: rand(-0.5, 0.5), send: 0.2 });
    }

    private crackle(t: number, fire: number) {
        noise(this.indoor, { t, peak: rand(0.03, 0.12) * fire, attack: 0.0008, decay: rand(0.004, 0.016), filter: 'bandpass', freq: rand(1500, 5000), q: 0.8, pan: rand(-0.3, 0.3) });
        if (Math.random() < 0.08) tone(this.indoor, { freq: rand(140, 260), t, peak: 0.03 * fire, attack: 0.001, decay: 0.03 });
    }

    /** A single drop: on leaves and stones outside, on the roof planks from a refuge. */
    private drop(t: number, mix: AmbienceMix) {
        const peak = rand(0.004, 0.016) * mix.rain;
        if (mix.sheltered) {
            const f = rand(900, 2200);
            tone(this.indoor, { freq: f, glideTo: f * 0.8, t, peak: peak * 1.4, attack: 0.001, decay: rand(0.012, 0.03), pan: rand(-0.6, 0.6) });
        } else {
            noise(this.outdoor, { t, peak: peak * 2, attack: 0.0008, decay: rand(0.004, 0.01), filter: 'bandpass', freq: rand(2500, 7000), q: 1, pan: rand(-0.9, 0.9) });
        }
    }

    private chirp(cricket: Cricket, t: number, level: number) {
        const { ctx } = this;
        const osc = ctx.createOscillator();
        osc.frequency.value = cricket.freq;
        const gain = ctx.createGain();
        const peak = 0.012 * level * rand(0.6, 1);
        const pulses = 2 + Math.floor(Math.random() * 3);
        gain.gain.value = 0;
        for (let i = 0; i < pulses; i++) {
            const start = t + i * 0.042;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(peak, start + 0.006);
            gain.gain.linearRampToValueAtTime(0, start + 0.024);
        }
        const panner = ctx.createStereoPanner();
        panner.pan.value = cricket.pan;
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.outdoor.out);
        osc.start(t);
        osc.stop(t + pulses * 0.042 + 0.03);
    }

    private connectEvent(source: AudioNode, filter: AudioNode, gain: GainNode, pan: number, send: number) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = pan;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.outdoor.out);
        const sendGain = this.ctx.createGain();
        sendGain.gain.value = send;
        panner.connect(sendGain);
        sendGain.connect(this.outdoor.verb);
    }
}
