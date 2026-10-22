// utils/sound/sfx.ts
import { BELL, KALIMBA, MUSIC_BOX, Synth, mtof, noise, pad, rand, strike, tone } from './synth';

/**
 * The game's sound effects. Everything sits in D major (D, E, F#, A, B), so
 * cues that follow one another never clash; timbres are wood, felt, glass and
 * breath instead of the old square-wave beeps.
 *
 * - ui: interface feedback; always plays (identical requests are merged).
 * - impact: blows in a fight; always plays.
 * - feedback / stinger: rewards and story beats. Of those requested together
 *   only the most important plays, and while it rings it holds back lesser ones
 *   (a level-up also writes an XP line and may unlock a trophy: one cue, not three).
 */
export type SoundKind = 'ui' | 'impact' | 'feedback' | 'stinger';

export interface SoundDef {
    kind: SoundKind;
    /** Among feedback and stingers, the higher one wins. */
    priority: number;
    /** Seconds during which cues of equal or lower priority are held back. */
    hold: number;
    play: (s: Synth, t: number) => void;
}

const D3 = mtof(50), F3 = mtof(53), A3 = mtof(57);
const D4 = mtof(62), F4 = mtof(65), FS4 = mtof(66), A4 = mtof(69);
const D5 = mtof(74), E5 = mtof(76), FS5 = mtof(78), A5 = mtof(81);
const D6 = mtof(86), FS6 = mtof(90), A6 = mtof(93);

/** The rustle of a journal page turning. */
const page = (s: Synth, t: number, peak: number) => {
    noise(s, { t, peak, color: 'pink', attack: 0.06, decay: 0.22, filter: 'bandpass', freq: 900, freqTo: 3200, q: 0.7, send: 0.1 });
    noise(s, { t: t + 0.05, peak: peak * 0.5, attack: 0.02, decay: 0.12, filter: 'highpass', freq: 3500, q: 0.5 });
};

/** A dull blow: a falling thump, the slap that small speakers can still play, a puff of noise. */
const thump = (s: Synth, t: number, from: number, to: number, peak: number, body: number, pan: number) => {
    tone(s, { freq: from, glideTo: to, t, peak, attack: 0.003, decay: 0.16, pan });
    tone(s, { freq: from * 2.5, glideTo: to * 2, type: 'triangle', lowpass: 1400, t, peak: peak * 0.45, attack: 0.002, decay: 0.07, pan });
    noise(s, { t, peak: peak * 1.2, color: 'pink', attack: 0.002, decay: 0.12, filter: 'lowpass', freq: body, freqTo: body * 0.3, q: 0.7, pan, send: 0.08 });
};

export const SOUNDS: Record<string, SoundDef> = {
    // --- Interface --------------------------------------------------------
    navigate: {
        kind: 'ui', priority: 0, hold: 0,
        // A soft wooden tick, a hair different every time so holding a key never machine-guns.
        play: (s, t) => {
            const p = rand(0.97, 1.03);
            tone(s, { freq: 980 * p, glideTo: 720 * p, t, peak: 0.17, attack: 0.002, decay: 0.045, send: 0.04 });
            noise(s, { t, peak: 0.11, attack: 0.001, decay: 0.018, filter: 'bandpass', freq: 2400 * p, q: 1.5 });
        },
    },
    confirm: {
        kind: 'ui', priority: 0, hold: 0,
        // Two felt notes rising a fifth.
        play: (s, t) => {
            strike(s, { freq: D5, t, peak: 0.13, decay: 0.32, knock: 0.25, send: 0.12 });
            strike(s, { freq: A5, t: t + 0.055, peak: 0.09, decay: 0.45, send: 0.16 });
        },
    },
    cancel: {
        kind: 'ui', priority: 0, hold: 0,
        // The same felt, falling and duller.
        play: (s, t) => {
            strike(s, { freq: A4, t, peak: 0.12, decay: 0.24, knock: 0.2, send: 0.08 });
            strike(s, { freq: D4, t: t + 0.06, peak: 0.1, decay: 0.3, send: 0.08 });
        },
    },
    error: {
        kind: 'ui', priority: 0, hold: 0,
        // Knocking on a door that will not open: two low, slightly clashing thuds.
        play: (s, t) => {
            tone(s, { freq: 196, glideTo: 150, type: 'triangle', lowpass: 900, t, peak: 0.18, attack: 0.004, decay: 0.13 });
            tone(s, { freq: 185, glideTo: 140, type: 'triangle', lowpass: 800, t: t + 0.11, peak: 0.15, attack: 0.004, decay: 0.16 });
            noise(s, { t, peak: 0.06, color: 'pink', attack: 0.002, decay: 0.06, filter: 'lowpass', freq: 700, q: 0.7 });
            noise(s, { t: t + 0.11, peak: 0.05, color: 'pink', attack: 0.002, decay: 0.06, filter: 'lowpass', freq: 600, q: 0.7 });
        },
    },

    // --- Fights -----------------------------------------------------------
    hit_enemy: {
        kind: 'impact', priority: 0, hold: 0,
        play: (s, t) => thump(s, t, 150, 70, 0.22, 1600, 0.25),
    },
    hit_player: {
        kind: 'impact', priority: 0, hold: 0,
        // Closer and heavier than the blow you deal.
        play: (s, t) => {
            thump(s, t, 100, 42, 0.3, 900, -0.1);
            noise(s, { t: t + 0.01, peak: 0.05, color: 'brown', attack: 0.01, decay: 0.35, filter: 'lowpass', freq: 220, q: 0.5 });
        },
    },

    // --- Small rewards ------------------------------------------------------
    xp_gain: {
        kind: 'feedback', priority: 1, hold: 0.25,
        // A faint glass chime, high and far.
        play: (s, t) => {
            strike(s, { freq: A6, t, peak: 0.07, decay: 0.9, partials: BELL, attack: 0.008, send: 0.4, pan: 0.15 });
            strike(s, { freq: D6, t: t + 0.05, peak: 0.06, decay: 1.0, partials: BELL, attack: 0.008, send: 0.4, pan: -0.15 });
        },
    },
    item_get: {
        kind: 'feedback', priority: 2, hold: 0.3,
        // Three plucked tines: something useful in the hand.
        play: (s, t) => {
            [D5, FS5, A5].forEach((freq, i) => {
                strike(s, { freq, t: t + i * 0.07, peak: 0.1, decay: 0.55, partials: KALIMBA, send: 0.25, pan: (i - 1) * 0.15 });
            });
        },
    },

    // --- Story beats ----------------------------------------------------------
    quest_update: {
        kind: 'stinger', priority: 3, hold: 0.6,
        play: (s, t) => {
            page(s, t, 0.07);
            strike(s, { freq: FS5, t: t + 0.12, peak: 0.08, decay: 0.7, send: 0.3 });
        },
    },
    combat_start: {
        kind: 'stinger', priority: 4, hold: 0.9,
        // Ground rumble, two low tones rubbing against each other, a heartbeat.
        play: (s, t) => {
            noise(s, { t, peak: 0.16, color: 'brown', attack: 0.45, decay: 0.9, filter: 'lowpass', freq: 180, q: 0.6 });
            tone(s, { freq: mtof(38), t, peak: 0.08, attack: 0.3, hold: 0.3, decay: 1.0 });
            tone(s, { freq: mtof(39), t, peak: 0.06, attack: 0.3, hold: 0.3, decay: 1.0 });
            pad(s, { freqs: [D3, mtof(51)], t, peak: 0.06, attack: 0.4, hold: 0.25, release: 0.9, cutoff: 700, send: 0.4 });
            thump(s, t + 0.06, 72, 45, 0.18, 300, 0);
            thump(s, t + 0.3, 70, 44, 0.14, 300, 0);
        },
    },
    quest_start: {
        kind: 'stinger', priority: 5, hold: 1.1,
        // A page turns, an open chord swells, two notes set off.
        play: (s, t) => {
            page(s, t, 0.08);
            pad(s, { freqs: [D4, A4, E5], t: t + 0.05, peak: 0.07, attack: 0.35, hold: 0.25, release: 1.4, cutoff: 1800 });
            strike(s, { freq: A4, t: t + 0.12, peak: 0.1, decay: 0.8, send: 0.3 });
            strike(s, { freq: D5, t: t + 0.32, peak: 0.1, decay: 1.0, send: 0.35 });
        },
    },
    trophy: {
        kind: 'stinger', priority: 6, hold: 1.3,
        // Three small bells.
        play: (s, t) => {
            [A5, D6, FS6].forEach((freq, i) => {
                strike(s, { freq, t: t + i * 0.16, peak: 0.07, decay: 2.0 + i * 0.3, partials: BELL, send: 0.45, pan: (i - 1) * 0.3 });
            });
        },
    },
    quest_complete: {
        kind: 'stinger', priority: 7, hold: 1.6,
        // The motif resolves: a felt arpeggio home, a warm chord under it.
        play: (s, t) => {
            [D4, FS4, A4, D5].forEach((freq, i) => {
                strike(s, { freq, t: t + i * 0.09, peak: 0.1, decay: 1.0, send: 0.3, pan: (i - 1.5) * 0.12 });
            });
            pad(s, { freqs: [D4, FS4, A4, E5], t: t + 0.2, peak: 0.065, attack: 0.4, hold: 0.4, release: 1.8, cutoff: 2000 });
            strike(s, { freq: D6, t: t + 0.45, peak: 0.035, decay: 1.6, partials: BELL, send: 0.5 });
        },
    },
    level_up: {
        kind: 'stinger', priority: 8, hold: 1.6,
        // Tines climbing two octaves over a rising chord.
        play: (s, t) => {
            [A4, D5, E5, FS5, A5, D6].forEach((freq, i) => {
                strike(s, { freq, t: t + i * 0.065, peak: 0.085, decay: 0.9, partials: KALIMBA, send: 0.3, pan: (i - 2.5) * 0.1 });
            });
            pad(s, { freqs: [D4, A4, D5, FS5], t: t + 0.1, peak: 0.065, attack: 0.3, hold: 0.5, release: 1.6, cutoff: 2400 });
            noise(s, { t: t + 0.15, peak: 0.02, attack: 0.3, decay: 0.8, filter: 'bandpass', freq: 5000, freqTo: 9000, q: 2, send: 0.5 });
            strike(s, { freq: A6, t: t + 0.42, peak: 0.03, decay: 1.4, partials: BELL, send: 0.5 });
        },
    },
    victory: {
        kind: 'stinger', priority: 9, hold: 2,
        // Not a fanfare: relief, a breath out, a chord that opens like a sunrise.
        play: (s, t) => {
            pad(s, { freqs: [D4, FS4, A4, D5], t, peak: 0.075, attack: 0.5, hold: 0.5, release: 2.0, cutoff: 2200 });
            [A4, D5, FS5].forEach((freq, i) => {
                strike(s, { freq, t: t + 0.1 + i * 0.2, peak: 0.1, decay: 1.2, send: 0.35 });
            });
            strike(s, { freq: A5, t: t + 0.8, peak: 0.04, decay: 1.8, partials: BELL, send: 0.5 });
        },
    },
    defeat: {
        kind: 'stinger', priority: 10, hold: 2.5,
        // A dark minor chord, a low drone, three slow notes falling.
        play: (s, t) => {
            pad(s, { freqs: [D3, F3, A3], t, peak: 0.09, attack: 0.6, hold: 0.6, release: 2.6, cutoff: 900, send: 0.6 });
            tone(s, { freq: mtof(38), t, peak: 0.1, attack: 0.4, decay: 2.6 });
            [A4, F4, D4].forEach((freq, i) => {
                strike(s, { freq, t: t + i * 0.45, peak: 0.09, decay: 1.3, send: 0.4 });
            });
        },
    },
};

/** The reward cue still ringing, which holds back lesser ones. */
export interface CueState {
    holdUntil: number;
    holdPriority: number;
}

export const NO_CUE: CueState = { holdUntil: 0, holdPriority: -1 };

/**
 * Decides what plays out of the sounds requested in the same instant: every
 * distinct interface sound and blow, plus the single most important reward or
 * story cue, unless a more important one is still ringing.
 */
export const arbitrate = (names: readonly string[], now: number, state: CueState): { play: string[]; state: CueState } => {
    const unique = [...new Set(names)].filter(name => SOUNDS[name]);
    const play = unique.filter(name => SOUNDS[name].kind === 'ui' || SOUNDS[name].kind === 'impact');
    const best = unique
        .filter(name => SOUNDS[name].kind === 'feedback' || SOUNDS[name].kind === 'stinger')
        .sort((a, b) => SOUNDS[b].priority - SOUNDS[a].priority)[0];
    if (!best) return { play, state };
    const cue = SOUNDS[best];
    if (now < state.holdUntil && cue.priority <= state.holdPriority) return { play, state };
    return { play: [...play, best], state: { holdUntil: now + cue.hold, holdPriority: cue.priority } };
};

/** Old names still used by some call sites. */
export const SOUND_ALIASES: Record<string, string> = {
    enter_refuge: 'confirm',
    item_pickup: 'item_get',
    back: 'cancel',
    craft_fail: 'error',
    craft_success: 'confirm',
};

/**
 * The ash lullaby (GDD 8.3): a music box with two notes out of tune. It plays the
 * tune once, starts again while the spring runs down (slower, a little flat),
 * and stops dead around the eighth second.
 */
const LULLABY: readonly (readonly [number, number])[] = [
    [523, 1], [523, 1], [780, 1], [784, 1], [880, 1], [880, 1], [784, 2],
    [659, 1], [659, 1], [585, 1], [587, 1], [523, 2],
];
export const LULLABY_LENGTH = 8;

export const playLullaby = (s: Synth, t: number): void => {
    const beat = 0.3;
    let time = t;
    let slowdown = 1;
    let flat = 1;
    for (let pass = 0; pass < 2; pass++) {
        for (const [freq, beats] of LULLABY) {
            if (time - t >= LULLABY_LENGTH - 0.05) return;
            strike(s, { freq: freq * flat, t: time, peak: 0.075, decay: 1.3, partials: MUSIC_BOX, knock: 0.15, send: 0.45 });
            time += beat * beats * slowdown;
            if (pass === 1) {
                slowdown *= 1.12;
                flat *= 0.996;
            }
        }
    }
};
