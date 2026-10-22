/**
 * Procedural vector scenery: deterministic SVG path builders for skylines,
 * trees, grass, clouds and the traveller. Every builder takes a seed, so the
 * same scene is drawn identically on every start.
 */

export type Rng = () => number;

/** mulberry32: small, fast, good enough for scenery. */
export const createRng = (seed: number): Rng => {
    let state = seed | 0;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const between = (rng: Rng, min: number, max: number) => min + rng() * (max - min);
const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (x: number, y: number) => `${r1(x)} ${r1(y)}`;

/** Circle as a path segment (for unions of circles in one path). */
export const circlePath = (cx: number, cy: number, r: number) =>
    `M${pt(cx - r, cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(r * 2)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-r * 2)} 0Z`;

export const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
    `M${pt(cx - rx, cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(rx * 2)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-rx * 2)} 0Z`;

export interface SkylineOptions {
    x0: number;
    x1: number;
    baseY: number;
    minH: number;
    maxH: number;
    minW: number;
    maxW: number;
    /** Space between buildings (can be negative to overlap). */
    gap?: [number, number];
    seed: number;
    /** Ranges of x where buildings stay low: [from, to, maxHeight]. */
    low?: [number, number, number][];
    /** Probability of a crumbled top. */
    broken?: number;
    /** Probability of an antenna or a mast. */
    antennas?: number;
    /** Window holes (for the closer layers). */
    windows?: boolean;
}

export interface Skyline {
    body: string;
    /** Thin lines: antennas, rebar, cranes (stroke). */
    lines: string;
    windows: string;
    /** Overgrowth: vines hanging from the roofs and bushes on top. */
    growth: string;
}

/** Ruined city skyline: one filled path, plus antennas and window holes. */
export const skyline = (o: SkylineOptions): Skyline => {
    const rng = createRng(o.seed);
    let body = '';
    let lines = '';
    let windows = '';
    let growth = '';
    let x = o.x0;
    while (x < o.x1) {
        const w = between(rng, o.minW, o.maxW);
        let maxH = o.maxH;
        for (const [from, to, cap] of o.low ?? []) if (x + w > from && x < to) maxH = Math.min(maxH, cap);
        const h = between(rng, o.minH, Math.max(o.minH + 1, maxH));
        const top = o.baseY - h;
        const kind = rng();
        const pts: [number, number][] = [[x, o.baseY]];
        if (rng() < (o.broken ?? 0.4)) {
            // Crumbled top: a jagged line falling away on one side.
            const steps = 3 + Math.floor(rng() * 4);
            const fallLeft = rng() < 0.5;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const slope = fallLeft ? 1 - t : t;
                const drop = slope * h * between(rng, 0.05, 0.4) + between(rng, 0, h * 0.06);
                pts.push([x + w * t, top + drop]);
            }
        } else if (kind < 0.35) {
            // Setbacks.
            const s = Math.min(26, h * 0.12);
            pts.push([x, top + s], [x + w * 0.22, top + s], [x + w * 0.22, top], [x + w * 0.78, top], [x + w * 0.78, top + s], [x + w, top + s]);
        } else if (kind < 0.5) {
            // Collapsed roof, slanting.
            pts.push([x, top + w * 0.35], [x + w, top]);
        } else {
            pts.push([x, top], [x + w, top]);
        }
        pts.push([x + w, o.baseY]);
        body += `M${pts.map(([px, py]) => pt(px, py)).join('L')}Z`;

        if (rng() < (o.antennas ?? 0.15)) {
            const ax = x + between(rng, 0.2, 0.8) * w;
            const ah = between(rng, 18, 60);
            lines += `M${pt(ax, top + 2)}L${pt(ax + between(rng, -4, 4), top - ah)}`;
            if (rng() < 0.5) lines += `M${pt(ax - 7, top - ah * 0.6)}L${pt(ax + 7, top - ah * 0.6)}`;
        }
        if (o.windows && rng() < 0.75) {
            // Bushes on the roof and vines hanging down the walls.
            const roofY = pts[Math.floor(pts.length / 2)][1];
            for (let i = 0, n = 2 + Math.floor(rng() * 3); i < n; i++) {
                growth += circlePath(x + rng() * w, roofY + between(rng, 0, 8), between(rng, 6, 16));
            }
            for (let i = 0, n = 3 + Math.floor(rng() * 6); i < n; i++) {
                const vx = x + rng() * w;
                const len = between(rng, 20, h * 0.5);
                const vw = between(rng, 2, 5);
                const sway = between(rng, -8, 8);
                growth += `M${pt(vx, roofY)}q${r1(sway)} ${r1(len / 2)} ${r1(sway * 0.4)} ${r1(len)}h${r1(vw)}q${r1(sway * 0.6)} ${r1(-len / 2)} ${r1(vw - sway * 0.4)} ${r1(-len)}Z`;
            }
            if (pts.length > 6) {
                // Floor slabs sticking out of the broken side.
                for (let fy = roofY + 20; fy < o.baseY - 30; fy += 22) {
                    if (rng() < 0.4) lines += `M${pt(x - between(rng, 0, 10), fy)}h${r1(between(rng, 8, 22))}`;
                }
            }
        }
        if (o.windows && h > 60) {
            const cols = Math.max(2, Math.floor(w / 15));
            const rows = Math.floor((h - 26) / 22);
            const cw = w / cols;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (rng() < 0.55) continue;
                    const wx = x + col * cw + cw * 0.3;
                    const wy = top + 20 + row * 22;
                    if (wy > o.baseY - 14) continue;
                    windows += `M${pt(wx, wy)}h${r1(cw * 0.42)}v${r1(between(rng, 8, 12))}h${r1(-cw * 0.42)}Z`;
                }
            }
        }
        const [g0, g1] = o.gap ?? [2, 26];
        x += w + between(rng, g0, g1);
    }
    return { body, lines, windows, growth };
};

/** Tower crane (stroke path), a staple of every unfinished city. */
export const crane = (x: number, baseY: number, height: number, jib: number) => {
    const top = baseY - height;
    let d = `M${pt(x, baseY)}V${r1(top)}M${pt(x - jib * 0.28, top)}H${r1(x + jib)}M${pt(x, top - 22)}L${pt(x - jib * 0.28, top)}M${pt(x, top - 22)}L${pt(x + jib * 0.7, top)}`;
    d += `M${pt(x + jib * 0.62, top)}V${r1(top + height * 0.32)}`;
    for (let y = baseY; y > top + 12; y -= 18) d += `M${pt(x - 5, y)}L${pt(x + 5, y - 18)}`;
    return d;
};

export interface TreeOptions {
    x0: number;
    x1: number;
    baseY: number;
    /** Canopy radius range. */
    size: [number, number];
    density: number;
    seed: number;
    conifers?: number;
    /** Vertical jitter of the tree bases. */
    jitter?: number;
}

/** A band of trees (broadleaf and conifers) as a single silhouette path. */
export const treeLine = (o: TreeOptions): string => {
    const rng = createRng(o.seed);
    let d = '';
    let x = o.x0;
    while (x < o.x1) {
        const r = between(rng, o.size[0], o.size[1]);
        const base = o.baseY + between(rng, -(o.jitter ?? 0), o.jitter ?? 0);
        if (rng() < (o.conifers ?? 0.2)) {
            const h = r * between(rng, 3, 4.2);
            const tiers = 4;
            for (let i = 0; i < tiers; i++) {
                const ty = base - h * (i / tiers) - r * 0.2;
                const tw = r * (1.15 - i * 0.22);
                d += `M${pt(x - tw, ty)}L${pt(x, ty - h * 0.42)}L${pt(x + tw, ty)}Z`;
            }
            d += `M${pt(x - 2, base)}h4v${r1(-r * 0.5)}h-4Z`;
        } else {
            const trunk = r * between(rng, 0.6, 1.1);
            d += `M${pt(x - r * 0.08, base)}L${pt(x - r * 0.05, base - trunk)}L${pt(x + r * 0.05, base - trunk)}L${pt(x + r * 0.08, base)}Z`;
            const cy = base - trunk - r * 0.6;
            const blobs = 3 + Math.floor(rng() * 3);
            for (let i = 0; i < blobs; i++) {
                const a = (i / blobs) * Math.PI * 2 + rng();
                d += circlePath(x + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.35, r * between(rng, 0.55, 0.8));
            }
            d += circlePath(x, cy - r * 0.15, r * 0.7);
        }
        x += r * between(rng, 0.9, 2.2) / o.density;
    }
    return d;
};

/** Grass blades along a base line (filled path). */
export const grass = (x0: number, x1: number, baseY: number, height: [number, number], seed: number, density = 1): string => {
    const rng = createRng(seed);
    let d = '';
    let x = x0;
    while (x < x1) {
        const h = between(rng, height[0], height[1]);
        const w = between(rng, 3, 7);
        const bend = between(rng, -h * 0.45, h * 0.45);
        const by = baseY + between(rng, 0, 14);
        d += `M${pt(x, by)}Q${pt(x + bend * 0.3, by - h * 0.55)} ${pt(x + bend, by - h)}Q${pt(x + bend * 0.3 + w * 0.6, by - h * 0.5)} ${pt(x + w, by)}Z`;
        x += between(rng, 2, 9) / density;
    }
    return d;
};

/** Long, low cloud made of overlapping ellipses. */
export const cloud = (cx: number, cy: number, length: number, thickness: number, seed: number): string => {
    const rng = createRng(seed);
    let d = '';
    const n = Math.max(4, Math.round(length / 60));
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x = cx - length / 2 + t * length;
        const swell = Math.sin(t * Math.PI);
        d += ellipsePath(x, cy - swell * thickness * between(rng, 0.2, 0.6), between(rng, 40, 90) * (0.6 + swell * 0.6), thickness * (0.35 + swell * 0.5));
    }
    return d;
};

/** Thin sunset streaks (cirrus): long flat ellipses. */
export const streaks = (x0: number, x1: number, y0: number, y1: number, count: number, seed: number): string => {
    const rng = createRng(seed);
    let d = '';
    for (let i = 0; i < count; i++) {
        const len = between(rng, 160, 520);
        d += ellipsePath(between(rng, x0, x1), between(rng, y0, y1), len / 2, between(rng, 2, 7));
    }
    return d;
};

/**
 * A tree drawn branch by branch (tapered segments), with leaf clusters at the
 * tips: big framing trees in the foreground.
 */
export const branchingTree = (x: number, y: number, length: number, angle: number, width: number, seed: number, depth = 7) => {
    const rng = createRng(seed);
    let wood = '';
    let leaves = '';
    const grow = (bx: number, by: number, len: number, ang: number, w: number, level: number) => {
        const bend = between(rng, -0.25, 0.25);
        const ex = bx + Math.cos(ang) * len;
        const ey = by + Math.sin(ang) * len;
        const mx = bx + Math.cos(ang + bend) * len * 0.5;
        const my = by + Math.sin(ang + bend) * len * 0.5;
        const nx = Math.cos(ang + Math.PI / 2);
        const ny = Math.sin(ang + Math.PI / 2);
        const w2 = w * 0.62;
        wood += `M${pt(bx + nx * w, by + ny * w)}Q${pt(mx + nx * (w + w2) / 2, my + ny * (w + w2) / 2)} ${pt(ex + nx * w2, ey + ny * w2)}L${pt(ex - nx * w2, ey - ny * w2)}Q${pt(mx - nx * (w + w2) / 2, my - ny * (w + w2) / 2)} ${pt(bx - nx * w, by - ny * w)}Z`;
        if (level >= depth || len < 14) {
            // A few ragged leaves: the tree has seen better days.
            if (rng() < 0.3) leaves += circlePath(ex + between(rng, -8, 8), ey + between(rng, -6, 6), between(rng, 3, 7));
            return;
        }
        const branches = level < 2 ? 2 : 2 + (rng() < 0.4 ? 1 : 0);
        for (let i = 0; i < branches; i++) {
            const spread = between(rng, 0.25, 0.7) * (i % 2 === 0 ? -1 : 1);
            grow(ex, ey, len * between(rng, 0.62, 0.82), ang + spread, w2, level + 1);
        }
    };
    grow(x, y, length, angle, width, 0);
    return { wood, leaves };
};

/** Stars: small circles in the upper sky. */
export const stars = (width: number, height: number, count: number, seed: number) => {
    const rng = createRng(seed);
    return Array.from({ length: count }, () => ({
        x: r1(rng() * width),
        y: r1(Math.pow(rng(), 1.6) * height),
        r: r1(between(rng, 0.6, 1.8)),
        delay: r1(rng() * 5),
    }));
};
