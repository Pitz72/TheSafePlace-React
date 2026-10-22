/**
 * Light of the hour over the map: a color multiplied over the land, from the
 * blue of the night to the gold of the late afternoon.
 */
type Rgb = [number, number, number];

const NIGHT: Rgb = [76, 86, 132];
const DAWN: Rgb = [232, 192, 184];
const DAY: Rgb = [255, 252, 246];
const GOLD: Rgb = [250, 212, 166];
const DUSK: Rgb = [190, 142, 162];

/** Hour of the day (0-24, with minutes as a fraction) → color. */
const KEYFRAMES: [number, Rgb][] = [
    [0, NIGHT], [4.5, NIGHT], [6, DAWN], [7.5, DAY], [16.5, DAY], [18.5, GOLD], [20, DUSK], [21.5, NIGHT], [24, NIGHT],
];

export const lightAt = (hour: number): { tint: string; darkness: number } => {
    let i = 0;
    while (i < KEYFRAMES.length - 2 && hour >= KEYFRAMES[i + 1][0]) i++;
    const [h0, c0] = KEYFRAMES[i];
    const [h1, c1] = KEYFRAMES[i + 1];
    const t = h1 > h0 ? Math.max(0, Math.min(1, (hour - h0) / (h1 - h0))) : 0;
    const rgb = c0.map((v, k) => Math.round(v + (c1[k] - v) * t)) as Rgb;
    const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    return { tint: `rgb(${rgb.join(', ')})`, darkness: Math.max(0, 1 - luminance) };
};
