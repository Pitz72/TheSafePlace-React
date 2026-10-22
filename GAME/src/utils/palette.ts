/**
 * Colors of the 3.0 visual design.
 *
 * Game logic and data still speak in plain hex colors (journal entries, combat
 * log, item categories...). `harmonize` maps any of them onto the palette of
 * the current theme, so a "#00ff00" from a quest reads as the muted sage of
 * the interface instead of a terminal green.
 */

export type Tone = 'ink' | 'ink2' | 'ink3' | 'ember' | 'ember2' | 'danger' | 'gold' | 'sage' | 'teal' | 'violet' | 'lena' | 'elian';

/** CSS color of a palette tone (follows the active theme). */
export const toneColor = (tone: Tone, alpha = 1): string =>
    alpha === 1 ? `rgb(var(--c-${tone}))` : `rgb(var(--c-${tone}) / ${alpha})`;

/** Value for a `--accent` custom property (an RGB triplet). */
export const accentVar = (tone: Tone) => `var(--c-${tone})`;

const toHsl = (hex: string): [number, number, number] | null => {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return null;
    const digits = match[1].length === 3 ? match[1].split('').map(c => c + c).join('') : match[1];
    const [r, g, b] = [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
    return [h, s, l];
};

/** Palette tone closest in spirit to a legacy hex color. */
export const toneOf = (hex: string): Tone => {
    const hsl = toHsl(hex);
    if (!hsl) return 'ink2';
    const [h, s, l] = hsl;
    if (s < 0.18) return l > 0.75 ? 'ink' : l > 0.5 ? 'ink2' : 'ink3';
    if (h < 16 || h >= 340) return 'danger';
    if (h < 38) return 'ember';
    if (h < 66) return 'gold';
    if (h < 170) return 'sage';
    if (h < 212) return 'teal';
    if (h < 245) return 'lena';
    return 'violet';
};

const cache = new Map<string, string>();

/** Theme color for a legacy hex color; `fallback` when there is none. */
export const harmonize = (hex: string | undefined | null, fallback: Tone = 'ink2'): string => {
    if (!hex) return toneColor(fallback);
    let color = cache.get(hex);
    if (!color) {
        color = hex.startsWith('#') ? toneColor(toneOf(hex)) : hex;
        cache.set(hex, color);
    }
    return color;
};

/**
 * Journal and log lines can open with a tag in brackets ("[MAPPA] ...").
 * Splits it off so the interface can show it as a label.
 */
export const splitTag = (text: string): { tag: string | null; body: string } => {
    const match = /^\[([^\]]{2,24})\]\s*/.exec(text);
    return match ? { tag: match[1], body: text.slice(match[0].length) } : { tag: null, body: text };
};
