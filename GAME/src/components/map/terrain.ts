/**
 * Illustrated world map: draws the terrain of a block of tiles (a "chunk")
 * on a canvas, in world units (1 = one tile). Everything is deterministic
 * (hashes of the tile coordinates), so neighbouring chunks join seamlessly and
 * a chunk can be cached and redrawn identically at any size.
 *
 * Light comes from the north-west: lit faces up-left, shadows down-right.
 */

export const CHUNK = 8;
/** Tiles drawn around a chunk, so trees and peaks that overflow their tile are not cut. */
const MARGIN = 2;

type Grid = string[][];
type Ctx = CanvasRenderingContext2D;

const C = {
    void: '#0b0d11',
    plains: '#5d6041',
    grass: '#80804f',
    rock: '#7b766b',
    shrub: '#3f4d31',
    forestEdge: '#4d5839',
    forestFloor: '#3b4730',
    treeShadow: 'rgba(12, 16, 10, 0.34)',
    canopyDark: '#2b3a28',
    canopy: '#3e5434',
    canopyLight: '#58724a',
    canopyHigh: '#7a9467',
    pine: '#28382c',
    pineLight: '#3f5a43',
    shore: '#4a4934',
    shoreWet: '#55553b',
    dry: '#7d744a',
    meadow: '#475634',
    crater: '#3a382b',
    craterRim: '#6d6a58',
    wreck: '#6e4a32',
    deadTree: '#3b3326',
    water: '#2c5664',
    waterMid: '#3a6d7a',
    waterLight: '#6aa0a6',
    rockBase: '#6a6256',
    rockLit: '#a69a86',
    rockShade: '#544a41',
    rockLine: '#3e3630',
    snow: '#ece7dc',
    snowShade: '#c3bfb6',
    cityGround: '#4b4844',
    cityEdge: '#545248',
    roofs: ['#7c776f', '#6b675f', '#878177', '#736c62'],
    wall: '#393633',
    ruin: '#2c2926',
    roofEdge: '#a29b8f',
    rubble: '#6c675e',
    ivy: '#4f6642',
    villageGround: '#6a6245',
    roofLit: '#b5714b',
    roofShade: '#874b33',
    ridge: '#cf9064',
    houseWall: '#a48d6c',
    garden: '#5a6b3b',
    gardenRows: '#45542f',
    fence: '#5b4a34',
    clearing: '#6f6649',
};

/** Deterministic pseudo-random value in [0, 1) for a tile. */
export const hash = (x: number, y: number, salt = 0): number => {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(salt | 0, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
};

const at = (map: Grid, x: number, y: number): string => map[y]?.[x] ?? ' ';

const circle = (ctx: Ctx, x: number, y: number, r: number) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, Math.PI * 2);
};

const ellipse = (ctx: Ctx, x: number, y: number, rx: number, ry: number) => {
    ctx.moveTo(x + rx, y);
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
};

const fillPath = (ctx: Ctx, color: string, build: () => void, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    build();
    ctx.fill();
    ctx.globalAlpha = 1;
};

const poly = (ctx: Ctx, color: string, points: number[]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
    ctx.closePath();
    ctx.fill();
};

const glow = (ctx: Ctx, x: number, y: number, r: number, color: string, alpha: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
};

interface Range { x0: number; y0: number; x1: number; y1: number }

const eachTile = (r: Range, fn: (x: number, y: number) => void) => {
    for (let y = r.y0; y < r.y1; y++) for (let x = r.x0; x < r.x1; x++) fn(x, y);
};

// --- Ground ------------------------------------------------------------------

/** Plains: soft patches, grass tufts, stones and shrubs. */
const drawPlains = (ctx: Ctx, map: Grid, r: Range) => {
    ctx.strokeStyle = C.grass;
    ctx.lineWidth = 0.028;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    eachTile(r, (x, y) => {
        if (at(map, x, y) !== '.') return;
        for (let i = 0; i < 3; i++) {
            const gx = x + 0.1 + hash(x, y, 40 + i) * 0.8;
            const gy = y + 0.15 + hash(x, y, 50 + i) * 0.8;
            ctx.moveTo(gx - 0.05, gy - 0.07);
            ctx.lineTo(gx, gy);
            ctx.lineTo(gx + 0.01, gy - 0.09);
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + 0.06, gy - 0.06);
        }
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
    fillPath(ctx, C.rock, () => eachTile(r, (x, y) => {
        if (at(map, x, y) === '.' && hash(x, y, 60) < 0.07) ellipse(ctx, x + 0.2 + hash(x, y, 61) * 0.6, y + 0.2 + hash(x, y, 62) * 0.6, 0.07, 0.05);
    }));
    fillPath(ctx, C.shrub, () => eachTile(r, (x, y) => {
        if (at(map, x, y) !== '.' || hash(x, y, 70) > 0.06) return;
        const sx = x + 0.2 + hash(x, y, 71) * 0.6;
        const sy = y + 0.2 + hash(x, y, 72) * 0.6;
        circle(ctx, sx, sy, 0.1);
        circle(ctx, sx + 0.08, sy + 0.03, 0.08);
    }));
};

/**
 * Soft blob of ground under every tile of a kind, bridged to its neighbours of
 * the same kind: forests, ruins and villages get organic edges instead of squares.
 */
const drawGround = (ctx: Ctx, map: Grid, r: Range, kinds: string, color: string, radius: number, salt: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    eachTile(r, (x, y) => {
        if (!kinds.includes(at(map, x, y))) return;
        const cx = x + 0.5 + (hash(x, y, salt) - 0.5) * 0.12;
        const cy = y + 0.5 + (hash(x, y, salt + 1) - 0.5) * 0.12;
        const rad = radius * (0.88 + hash(x, y, salt + 2) * 0.24);
        circle(ctx, cx, cy, rad);
        const w = radius * 1.7;
        if (kinds.includes(at(map, x + 1, y))) ctx.rect(x + 0.5, y + 0.5 - w / 2, 1, w);
        if (kinds.includes(at(map, x, y + 1))) ctx.rect(x + 0.5 - w / 2, y + 0.5, w, 1);
        if (kinds.includes(at(map, x + 1, y)) && kinds.includes(at(map, x, y + 1)) && kinds.includes(at(map, x + 1, y + 1))) ctx.rect(x + 0.5, y + 0.5, 1, 1);
    });
    ctx.fill();
};

/** Water tile center, nudged so that straight rivers meander a little. */
const waterCenter = (x: number, y: number): [number, number] =>
    [x + 0.5 + (hash(x, y, 500) - 0.5) * 0.32, y + 0.5 + (hash(x, y, 501) - 0.5) * 0.32];

const waterWidth = (x: number, y: number) => 0.6 + hash(x, y, 502) * 0.24;

/** Rivers and lakes: curving ribbons through neighbouring water tiles, wider here and there. */
const drawWater = (ctx: Ctx, map: Grid, r: Range) => {
    const links: [number, number, number, number][] = [];
    const nodes: [number, number][] = [];
    eachTile(r, (x, y) => {
        if (at(map, x, y) !== '~') return;
        nodes.push([x, y]);
        for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
            if (at(map, x + dx, y + dy) !== '~') continue;
            // Diagonal links only when the river really turns that way.
            if (dx !== 0 && dy !== 0 && (at(map, x + dx, y) === '~' || at(map, x, y + dy) === '~')) continue;
            links.push([x, y, x + dx, y + dy]);
        }
    });
    if (nodes.length === 0) return;

    const stroke = (extra: number, color: string, alpha = 1, scale = 1) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        for (const [ax, ay, bx, by] of links) {
            const [x1, y1] = waterCenter(ax, ay);
            const [x2, y2] = waterCenter(bx, by);
            const bend = (hash(ax * 3 + bx, ay * 3 + by, 503) - 0.5) * 0.36;
            ctx.lineWidth = ((waterWidth(ax, ay) + waterWidth(bx, by)) / 2) * scale + extra;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo((x1 + x2) / 2 - (y2 - y1) * bend, (y1 + y2) / 2 + (x2 - x1) * bend, x2, y2);
            ctx.stroke();
        }
        ctx.beginPath();
        for (const [x, y] of nodes) {
            const [cx, cy] = waterCenter(x, y);
            // Lakes: tiles with water all around fill out completely.
            let around = 0;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (at(map, x + dx, y + dy) === '~') around++;
            const radius = around >= 3 ? 0.62 * scale + extra / 2 : (waterWidth(x, y) * scale + extra) / 2;
            circle(ctx, cx, cy, radius);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    stroke(0.34, C.shoreWet, 0.55);
    stroke(0.16, C.shore);
    stroke(0, C.water);
    stroke(0, C.waterMid, 0.7, 0.5);

    // Glints on the current.
    ctx.strokeStyle = C.waterLight;
    ctx.lineWidth = 0.03;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (const [x, y] of nodes) {
        const [cx, cy] = waterCenter(x, y);
        for (let i = 0; i < 2; i++) {
            if (hash(x, y, 80 + i) < 0.45) continue;
            const gx = cx + (hash(x, y, 82 + i) - 0.5) * 0.4;
            const gy = cy + (hash(x, y, 84 + i) - 0.5) * 0.4;
            ctx.moveTo(gx - 0.09, gy);
            ctx.quadraticCurveTo(gx, gy - 0.045, gx + 0.09, gy);
        }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
};

/** Smooth noise over a few tiles: broad dry and green regions on the plains. */
const valueNoise = (x: number, y: number, scale: number, salt: number) => {
    const fx = x / scale;
    const fy = y / scale;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const tx = fx - ix;
    const ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const a = hash(ix, iy, salt) + (hash(ix + 1, iy, salt) - hash(ix, iy, salt)) * sx;
    const b = hash(ix, iy + 1, salt) + (hash(ix + 1, iy + 1, salt) - hash(ix, iy + 1, salt)) * sx;
    return a + (b - a) * sy;
};

const hexRgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];

/**
 * Broad tonal regions of the plains (dry, green, mottled), computed one value
 * per tile into a tiny image and stretched with smoothing: soft as watercolor.
 */
const drawRegions = (ctx: Ctx, map: Grid, r: Range) => {
    const w = r.x1 - r.x0;
    const h = r.y1 - r.y0;
    const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
    const small = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!small) return;
    const image = small.createImageData(w, h);
    const base = hexRgb(C.plains);
    const dry = hexRgb(C.dry);
    const meadow = hexRgb(C.meadow);
    for (let ty = 0; ty < h; ty++) {
        for (let tx = 0; tx < w; tx++) {
            const x = r.x0 + tx;
            const y = r.y0 + ty;
            const n = valueNoise(x, y, 7, 600) * 0.7 + valueNoise(x, y, 2.5, 601) * 0.3;
            const target = n > 0.5 ? dry : meadow;
            const k = Math.min(0.75, Math.abs(n - 0.5) * 2.4);
            const mottle = (hash(x, y, 602) - 0.5) * 14;
            const i = (ty * w + tx) * 4;
            for (let c = 0; c < 3; c++) image.data[i + c] = base[c] + (target[c] - base[c]) * k + mottle;
            image.data[i + 3] = at(map, x, y) === ' ' ? 0 : 255;
        }
    }
    small.putImageData(image, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Pixel centers sit on tile centers.
    ctx.drawImage(canvas as CanvasImageSource, r.x0 + 0.5, r.y0 + 0.5, w, h);
};

/** Scars of the old world on the plains: craters, car wrecks, dead trees. */
const drawScars = (ctx: Ctx, x: number, y: number) => {
    const roll = hash(x, y, 700);
    const cx = x + 0.3 + hash(x, y, 701) * 0.4;
    const cy = y + 0.3 + hash(x, y, 702) * 0.4;
    if (roll < 0.008) {
        fillPath(ctx, C.craterRim, () => circle(ctx, cx, cy, 0.3));
        fillPath(ctx, C.crater, () => circle(ctx, cx + 0.03, cy + 0.03, 0.2));
        fillPath(ctx, '#2a281f', () => circle(ctx, cx + 0.05, cy + 0.05, 0.1));
    } else if (roll < 0.015) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(hash(x, y, 703) * Math.PI);
        fillPath(ctx, 'rgba(8,6,4,0.35)', () => ctx.rect(-0.16, -0.07, 0.36, 0.2));
        fillPath(ctx, C.wreck, () => ctx.rect(-0.18, -0.09, 0.36, 0.18));
        fillPath(ctx, '#2e2a26', () => ctx.rect(-0.06, -0.07, 0.14, 0.14));
        ctx.restore();
    } else if (roll < 0.032) {
        fillPath(ctx, 'rgba(8,6,4,0.3)', () => ellipse(ctx, cx + 0.06, cy + 0.06, 0.14, 0.08));
        ctx.strokeStyle = C.deadTree;
        ctx.lineWidth = 0.028;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + hash(x, y, 704);
            const len = 0.12 + hash(x, y, 705 + i) * 0.1;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
            ctx.lineTo(cx + Math.cos(a + 0.5) * len * 1.3, cy + Math.sin(a + 0.5) * len * 1.3);
        }
        ctx.stroke();
    }
};

// --- Objects -----------------------------------------------------------------

const drawTree = (ctx: Ctx, x: number, y: number, size: number, pine: boolean) => {
    fillPath(ctx, C.treeShadow, () => ellipse(ctx, x + size * 0.35, y + size * 0.45, size * 1.05, size * 0.75));
    if (pine) {
        const star = (radius: number, color: string, ox: number, oy: number) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * Math.PI * 2;
                const rad = i % 2 === 0 ? radius : radius * 0.62;
                ctx.lineTo(x + ox + Math.cos(a) * rad, y + oy + Math.sin(a) * rad);
            }
            ctx.closePath();
            ctx.fill();
        };
        star(size, C.pine, 0, 0);
        star(size * 0.62, C.pineLight, -size * 0.12, -size * 0.14);
        return;
    }
    fillPath(ctx, C.canopyDark, () => circle(ctx, x, y, size));
    fillPath(ctx, C.canopy, () => circle(ctx, x - size * 0.12, y - size * 0.12, size * 0.8));
    fillPath(ctx, C.canopyLight, () => circle(ctx, x - size * 0.26, y - size * 0.28, size * 0.46));
    fillPath(ctx, C.canopyHigh, () => circle(ctx, x - size * 0.36, y - size * 0.38, size * 0.18), 0.7);
};

const drawForestTile = (ctx: Ctx, x: number, y: number) => {
    const spots: [number, number][] = [[0.28, 0.3], [0.74, 0.36], [0.46, 0.74]];
    if (hash(x, y, 90) < 0.4) spots.push([0.82, 0.82]);
    spots.forEach(([sx, sy], i) => {
        const tx = x + sx + (hash(x, y, 91 + i) - 0.5) * 0.2;
        const ty = y + sy + (hash(x, y, 95 + i) - 0.5) * 0.2;
        drawTree(ctx, tx, ty, 0.23 + hash(x, y, 99 + i) * 0.12, hash(x, y, 103 + i) < 0.28);
    });
};

const drawMountain = (ctx: Ctx, x: number, y: number) => {
    const h = hash(x, y, 110);
    const peakX = x + 0.5 + (h - 0.5) * 0.24;
    const peakY = y - 0.28 - h * 0.18;
    const midX = x + 0.5 + (hash(x, y, 111) - 0.5) * 0.2;
    const base = y + 0.95;
    fillPath(ctx, 'rgba(10,8,6,0.32)', () => ellipse(ctx, x + 0.72, base - 0.02, 0.55, 0.16));
    poly(ctx, C.rockLit, [peakX, peakY, x - 0.1, base, midX, base + 0.04]);
    poly(ctx, C.rockShade, [peakX, peakY, midX, base + 0.04, x + 1.1, base]);
    // A secondary shoulder.
    if (h > 0.45) {
        const sx = x + 0.82;
        const sy = y + 0.22;
        poly(ctx, C.rockLit, [sx, sy, peakX + 0.2, base, x + 0.95, base]);
        poly(ctx, C.rockShade, [sx, sy, x + 0.95, base, x + 1.18, base]);
    }
    ctx.strokeStyle = C.rockLine;
    ctx.lineWidth = 0.025;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(midX, base + 0.04);
    ctx.moveTo(peakX - 0.15, peakY + 0.5);
    ctx.lineTo(peakX - 0.05, peakY + 0.62);
    ctx.stroke();
    const t = 0.24;
    poly(ctx, C.snow, [peakX, peakY, peakX + (x - 0.1 - peakX) * t, peakY + (base - peakY) * t, peakX - 0.02, peakY + (base - peakY) * t * 0.7, peakX + (midX - peakX) * t * 0.8, peakY + (base - peakY) * t * 0.85]);
    poly(ctx, C.snowShade, [peakX, peakY, peakX + (midX - peakX) * t * 0.8, peakY + (base - peakY) * t * 0.85, peakX + (x + 1.1 - peakX) * t * 0.9, peakY + (base - peakY) * t * 0.9]);
};

const drawBuilding = (ctx: Ctx, x: number, y: number, salt: number) => {
    const w = 0.42 + hash(x, y, salt) * 0.36;
    const d = 0.36 + hash(x, y, salt + 1) * 0.3;
    const bx = x + 0.04 + hash(x, y, salt + 2) * (0.92 - w);
    const by = y + 0.02 + hash(x, y, salt + 3) * (0.84 - d);
    const wallH = 0.07 + hash(x, y, salt + 4) * 0.12;
    fillPath(ctx, 'rgba(8,8,8,0.36)', () => ctx.rect(bx + 0.08, by + 0.08, w, d + wallH));
    fillPath(ctx, C.wall, () => ctx.rect(bx, by + d, w, wallH));
    ctx.fillStyle = 'rgba(20,18,16,0.6)';
    for (let wx = bx + 0.05; wx < bx + w - 0.06; wx += 0.09) ctx.fillRect(wx, by + d + wallH * 0.3, 0.04, wallH * 0.35);
    fillPath(ctx, C.roofs[Math.floor(hash(x, y, salt + 5) * C.roofs.length)], () => ctx.rect(bx, by, w, d));
    ctx.strokeStyle = C.roofEdge;
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(bx, by + d);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + w, by);
    ctx.stroke();
    if (hash(x, y, salt + 6) < 0.45) {
        // Caved-in roof: the floor below shows through.
        const cx = bx + w * (0.3 + hash(x, y, salt + 7) * 0.4);
        const cy = by + d * (0.3 + hash(x, y, salt + 8) * 0.4);
        poly(ctx, C.ruin, [cx - w * 0.3, cy - d * 0.2, cx + w * 0.05, cy - d * 0.35, cx + w * 0.3, cy - d * 0.05, cx + w * 0.12, cy + d * 0.3, cx - w * 0.22, cy + d * 0.22]);
        ctx.strokeStyle = C.rubble;
        ctx.lineWidth = 0.018;
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.25, cy);
        ctx.lineTo(cx + w * 0.25, cy - d * 0.05);
        ctx.stroke();
    }
    if (hash(x, y, salt + 9) < 0.4) {
        fillPath(ctx, C.ivy, () => {
            circle(ctx, bx + w * hash(x, y, salt + 10), by + d * 0.9, 0.08);
            circle(ctx, bx + w * hash(x, y, salt + 11), by + d * hash(x, y, salt + 12), 0.06);
        }, 0.95);
    }
};

const drawCityTile = (ctx: Ctx, x: number, y: number) => {
    fillPath(ctx, C.rubble, () => {
        for (let i = 0; i < 5; i++) circle(ctx, x + hash(x, y, 120 + i), y + hash(x, y, 130 + i), 0.015 + hash(x, y, 140 + i) * 0.03);
    });
    drawBuilding(ctx, x, y, 150);
    if (hash(x, y, 149) < 0.35) drawBuilding(ctx, x, y + 0.02, 170);
};

const drawHouse = (ctx: Ctx, x: number, y: number, salt: number) => {
    const w = 0.4 + hash(x, y, salt) * 0.16;
    const d = 0.26 + hash(x, y, salt + 1) * 0.08;
    const bx = x + 0.06 + hash(x, y, salt + 2) * (0.88 - w);
    const by = y + 0.06 + hash(x, y, salt + 3) * (0.78 - d);
    fillPath(ctx, 'rgba(10,8,6,0.32)', () => ctx.rect(bx + 0.06, by + 0.07, w, d + 0.07));
    fillPath(ctx, C.houseWall, () => ctx.rect(bx, by + d, w, 0.07));
    fillPath(ctx, C.roofLit, () => ctx.rect(bx - 0.02, by, w + 0.04, d / 2));
    fillPath(ctx, C.roofShade, () => ctx.rect(bx - 0.02, by + d / 2, w + 0.04, d / 2));
    ctx.strokeStyle = C.ridge;
    ctx.lineWidth = 0.025;
    ctx.beginPath();
    ctx.moveTo(bx - 0.02, by + d / 2);
    ctx.lineTo(bx + w + 0.02, by + d / 2);
    ctx.stroke();
    if (hash(x, y, salt + 4) < 0.28) {
        poly(ctx, '#3a2a22', [bx + w * 0.55, by + d * 0.1, bx + w * 0.85, by + d * 0.2, bx + w * 0.8, by + d * 0.75, bx + w * 0.5, by + d * 0.6]);
    }
};

const drawVillageTile = (ctx: Ctx, x: number, y: number) => {
    if (hash(x, y, 200) < 0.4) {
        const gx = x + 0.1 + hash(x, y, 201) * 0.45;
        const gy = y + 0.55 + hash(x, y, 202) * 0.2;
        fillPath(ctx, C.garden, () => ctx.rect(gx, gy, 0.36, 0.22));
        ctx.strokeStyle = C.gardenRows;
        ctx.lineWidth = 0.025;
        ctx.beginPath();
        for (let i = 1; i < 4; i++) {
            ctx.moveTo(gx + 0.03, gy + i * 0.055);
            ctx.lineTo(gx + 0.33, gy + i * 0.055);
        }
        ctx.stroke();
    }
    if (hash(x, y, 203) < 0.5) {
        ctx.strokeStyle = C.fence;
        ctx.lineWidth = 0.025;
        ctx.beginPath();
        ctx.moveTo(x + 0.05, y + 0.95);
        ctx.lineTo(x + 0.6, y + 0.95);
        for (let fx = x + 0.08; fx < x + 0.6; fx += 0.1) {
            ctx.moveTo(fx, y + 0.9);
            ctx.lineTo(fx, y + 0.98);
        }
        ctx.stroke();
    }
    drawHouse(ctx, x, y, 210);
};

/** A refuge: a little cabin seen from above, warm light at the door. Used ones are ruins. */
const drawRefuge = (ctx: Ctx, x: number, y: number, used: boolean) => {
    const cx = x + 0.5;
    const cy = y + 0.48;
    const s = 0.22;
    if (!used) glow(ctx, cx, cy + 0.2, 0.75, 'rgba(255,190,110,0.9)', 0.32);
    fillPath(ctx, 'rgba(8,6,4,0.38)', () => ctx.rect(cx - s + 0.07, cy - s + 0.08, s * 2, s * 2 + 0.05));
    if (used) {
        poly(ctx, '#575249', [cx - s, cy - s, cx + s, cy - s, cx, cy]);
        poly(ctx, '#4a463e', [cx - s, cy - s, cx, cy, cx - s, cy + s]);
        poly(ctx, '#2f2c27', [cx + s, cy - s, cx + s, cy + s, cx - s, cy + s, cx, cy]);
        ctx.strokeStyle = '#6f695e';
        ctx.lineWidth = 0.025;
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.6, cy + s * 0.2);
        ctx.lineTo(cx + s * 0.7, cy + s * 0.65);
        ctx.moveTo(cx + s * 0.1, cy - s * 0.3);
        ctx.lineTo(cx + s * 0.8, cy + s * 0.1);
        ctx.stroke();
        return;
    }
    fillPath(ctx, '#7b5a38', () => ctx.rect(cx - s, cy + s, s * 2, 0.06));
    poly(ctx, '#b48c5c', [cx - s, cy - s, cx + s, cy - s, cx, cy]);
    poly(ctx, '#a07c52', [cx - s, cy - s, cx, cy, cx - s, cy + s]);
    poly(ctx, '#7f6040', [cx + s, cy - s, cx + s, cy + s, cx, cy]);
    poly(ctx, '#6b4f33', [cx - s, cy + s, cx, cy, cx + s, cy + s]);
    fillPath(ctx, '#ffd28c', () => ctx.rect(cx - 0.035, cy + s, 0.07, 0.06));
};

// --- Landmarks -----------------------------------------------------------------

const drawStart = (ctx: Ctx, x: number, y: number) => {
    const cx = x + 0.5;
    const cy = y + 0.55;
    fillPath(ctx, '#3a3532', () => circle(ctx, cx, cy, 0.14));
    fillPath(ctx, '#8a857b', () => {
        for (let i = 0; i < 9; i++) {
            const a = (i / 9) * Math.PI * 2;
            circle(ctx, cx + Math.cos(a) * 0.17, cy + Math.sin(a) * 0.13, 0.035);
        }
    });
    fillPath(ctx, '#6d5a40', () => ctx.rect(cx + 0.22, cy - 0.1, 0.28, 0.1));
    ctx.strokeStyle = '#d8cfbf';
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(cx - 0.3, cy + 0.05);
    ctx.lineTo(cx - 0.3, cy - 0.5);
    ctx.stroke();
    poly(ctx, '#e8893f', [cx - 0.3, cy - 0.5, cx - 0.02, cy - 0.42, cx - 0.3, cy - 0.33]);
};

const drawSafePlace = (ctx: Ctx, x: number, y: number) => {
    const cx = x + 0.5;
    const cy = y + 0.5;
    glow(ctx, cx, cy + 0.1, 1.8, 'rgba(255,205,130,1)', 0.5);
    fillPath(ctx, 'rgba(8,6,4,0.4)', () => ctx.rect(cx - 0.5, cy - 0.32, 1.12, 0.84));
    fillPath(ctx, '#8d887d', () => ctx.rect(cx - 0.58, cy - 0.4, 1.16, 0.8));
    fillPath(ctx, '#a29d91', () => ctx.rect(cx - 0.58, cy - 0.4, 1.16, 0.06));
    fillPath(ctx, '#6e6a62', () => ellipse(ctx, cx, cy - 0.04, 0.36, 0.26));
    fillPath(ctx, '#85817a', () => ellipse(ctx, cx - 0.06, cy - 0.1, 0.24, 0.16));
    // The door, open, and the light pouring out.
    poly(ctx, 'rgba(255,214,150,0.5)', [cx - 0.12, cy + 0.4, cx + 0.12, cy + 0.4, cx + 0.32, cy + 0.95, cx - 0.32, cy + 0.95]);
    fillPath(ctx, '#ffe2a8', () => ctx.rect(cx - 0.12, cy + 0.26, 0.24, 0.16));
    ctx.strokeStyle = '#4c4943';
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(cx + 0.38, cy - 0.3);
    ctx.lineTo(cx + 0.38, cy - 0.9);
    ctx.stroke();
    fillPath(ctx, '#ff9a5a', () => circle(ctx, cx + 0.38, cy - 0.92, 0.04));
};

const drawOutpost = (ctx: Ctx, x: number, y: number) => {
    const cx = x + 0.5;
    const cy = y + 0.5;
    glow(ctx, cx, cy, 1.2, 'rgba(255,170,90,1)', 0.38);
    const containers: [number, number, number, number, string][] = [
        [-0.62, -0.5, 0.5, 0.22, '#9a5536'], [0.12, -0.6, 0.22, 0.48, '#4f7d80'],
        [0.38, -0.05, 0.48, 0.22, '#6b7046'], [-0.7, 0.2, 0.22, 0.46, '#8a4a30'],
    ];
    for (const [ox, oy, w, h, color] of containers) {
        fillPath(ctx, 'rgba(8,6,4,0.36)', () => ctx.rect(cx + ox + 0.05, cy + oy + 0.06, w, h));
        fillPath(ctx, color, () => ctx.rect(cx + ox, cy + oy, w, h));
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.015;
        ctx.beginPath();
        if (w > h) for (let i = 1; i < 6; i++) { ctx.moveTo(cx + ox + (w * i) / 6, cy + oy); ctx.lineTo(cx + ox + (w * i) / 6, cy + oy + h); }
        else for (let i = 1; i < 6; i++) { ctx.moveTo(cx + ox, cy + oy + (h * i) / 6); ctx.lineTo(cx + ox + w, cy + oy + (h * i) / 6); }
        ctx.stroke();
    }
    poly(ctx, '#c3b38c', [cx - 0.12, cy + 0.32, cx + 0.12, cy + 0.12, cx + 0.2, cy + 0.42]);
    poly(ctx, '#a39270', [cx + 0.12, cy + 0.12, cx + 0.2, cy + 0.42, cx + 0.32, cy + 0.3]);
    fillPath(ctx, '#3a3532', () => circle(ctx, cx - 0.08, cy - 0.02, 0.11));
    glow(ctx, cx - 0.08, cy - 0.02, 0.18, 'rgba(255,200,120,1)', 0.9);
    fillPath(ctx, 'rgba(200,195,190,0.25)', () => {
        circle(ctx, cx + 0.05, cy - 0.3, 0.1);
        circle(ctx, cx + 0.18, cy - 0.5, 0.13);
    });
};

const drawNest = (ctx: Ctx, x: number, y: number) => {
    const cx = x + 0.5;
    const cy = y + 0.5;
    glow(ctx, cx, cy, 1.3, 'rgba(150,110,220,1)', 0.35);
    fillPath(ctx, '#6e6a66', () => ellipse(ctx, cx, cy, 0.55, 0.42));
    fillPath(ctx, '#4a4547', () => ellipse(ctx, cx + 0.02, cy + 0.03, 0.42, 0.31));
    fillPath(ctx, '#1b181d', () => ellipse(ctx, cx + 0.04, cy + 0.06, 0.28, 0.2));
    fillPath(ctx, '#8b86a0', () => {
        for (let i = 0; i < 10; i++) circle(ctx, x + hash(x, y, 300 + i), y + hash(x, y, 320 + i), 0.02);
    }, 0.8);
};

const drawLab = (ctx: Ctx, x: number, y: number) => {
    const cx = x + 0.5;
    const cy = y + 0.5;
    ctx.setLineDash([0.06, 0.05]);
    ctx.strokeStyle = '#4c5252';
    ctx.lineWidth = 0.025;
    ctx.strokeRect(cx - 0.7, cy - 0.6, 1.4, 1.2);
    ctx.setLineDash([]);
    fillPath(ctx, 'rgba(8,8,8,0.38)', () => ctx.rect(cx - 0.5, cy - 0.34, 1.06, 0.78));
    fillPath(ctx, '#3e4646', () => ctx.rect(cx - 0.56, cy + 0.32, 1.06, 0.1));
    fillPath(ctx, '#6c7a7a', () => ctx.rect(cx - 0.56, cy - 0.42, 1.06, 0.74));
    fillPath(ctx, '#88979a', () => ctx.rect(cx - 0.56, cy - 0.42, 1.06, 0.05));
    fillPath(ctx, '#4f5b5c', () => {
        circle(ctx, cx - 0.3, cy - 0.15, 0.09);
        circle(ctx, cx - 0.05, cy - 0.15, 0.09);
    });
    fillPath(ctx, '#5c6869', () => ctx.rect(cx + 0.18, cy - 0.28, 0.24, 0.18));
    fillPath(ctx, '#6cd0d6', () => ctx.rect(cx - 0.46, cy + 0.12, 0.86, 0.035), 0.8);
    poly(ctx, '#e6bf5c', [cx + 0.42, cy + 0.38, cx + 0.5, cy + 0.52, cx + 0.34, cy + 0.52]);
};

const drawLibrary = (ctx: Ctx, x: number, y: number) => {
    const cx = x + 0.5;
    const cy = y + 0.5;
    fillPath(ctx, 'rgba(8,8,8,0.36)', () => ctx.rect(cx - 0.5, cy - 0.36, 1.08, 0.86));
    fillPath(ctx, '#8b806d', () => ctx.rect(cx - 0.58, cy - 0.44, 1.08, 0.64));
    fillPath(ctx, '#a69a83', () => ctx.rect(cx - 0.58, cy - 0.44, 1.08, 0.05));
    // Colonnade on the south front.
    fillPath(ctx, '#4d463c', () => ctx.rect(cx - 0.58, cy + 0.2, 1.08, 0.16));
    fillPath(ctx, '#d2c6ad', () => {
        for (let i = 0; i < 8; i++) ctx.rect(cx - 0.54 + i * 0.135, cy + 0.2, 0.05, 0.16);
    });
    fillPath(ctx, '#b9ad94', () => ctx.rect(cx - 0.62, cy + 0.36, 1.16, 0.05));
    fillPath(ctx, '#557f76', () => circle(ctx, cx - 0.04, cy - 0.12, 0.2));
    fillPath(ctx, '#78a397', () => circle(ctx, cx - 0.09, cy - 0.17, 0.1));
};

const drawHerbalist = (ctx: Ctx, x: number, y: number) => {
    const cx = x + 0.5;
    const cy = y + 0.5;
    for (let i = 0; i < 3; i++) {
        const gy = cy + 0.12 + i * 0.16;
        fillPath(ctx, '#4f3f2c', () => ctx.rect(cx - 0.62, gy, 0.5, 0.11));
        fillPath(ctx, '#6f8a4c', () => { for (let k = 0; k < 6; k++) circle(ctx, cx - 0.58 + k * 0.085, gy + 0.055, 0.035); });
        fillPath(ctx, i === 1 ? '#e0c45a' : '#d68aa0', () => { for (let k = 0; k < 3; k++) circle(ctx, cx - 0.54 + k * 0.17, gy + 0.03, 0.02); });
    }
    const s = 0.24;
    const hx = cx + 0.2;
    const hy = cy - 0.12;
    fillPath(ctx, 'rgba(8,6,4,0.36)', () => ctx.rect(hx - s + 0.06, hy - s + 0.07, s * 2, s * 2 + 0.05));
    poly(ctx, '#8a9a5c', [hx - s, hy - s, hx + s, hy - s, hx, hy]);
    poly(ctx, '#77884f', [hx - s, hy - s, hx, hy, hx - s, hy + s]);
    poly(ctx, '#5c6b3d', [hx + s, hy - s, hx + s, hy + s, hx, hy]);
    poly(ctx, '#4d5a33', [hx - s, hy + s, hx, hy, hx + s, hy + s]);
    fillPath(ctx, '#ffd28c', () => ctx.rect(hx - 0.035, hy + s, 0.07, 0.05));
};

const LANDMARKS: Record<string, (ctx: Ctx, x: number, y: number) => void> = {
    S: drawStart, E: drawSafePlace, A: drawOutpost, N: drawNest, L: drawLab, B: drawLibrary, H: drawHerbalist,
};

/** Tiles of the special places (they get a clearing under them). */
const LANDMARK_TILES = 'SEANLBH';

/** Used refuges inside a chunk (and its margin): part of the chunk's identity in the cache. */
export const chunkSignature = (cx: number, cy: number, usedRefuges: Set<string>): string => {
    let sig = '';
    for (let y = cy * CHUNK - MARGIN; y < (cy + 1) * CHUNK + MARGIN; y++) {
        for (let x = cx * CHUNK - MARGIN; x < (cx + 1) * CHUNK + MARGIN; x++) {
            if (usedRefuges.has(`${x},${y}`)) sig += `${x},${y};`;
        }
    }
    return sig;
};

/**
 * Draws chunk (cx, cy). The context must already map world units to pixels
 * and be translated so that the chunk's top-left tile is at its origin.
 */
export const drawChunk = (ctx: Ctx, map: Grid, cx: number, cy: number, usedRefuges: Set<string>, bleed: number) => {
    const x0 = cx * CHUNK;
    const y0 = cy * CHUNK;
    const range: Range = { x0: x0 - MARGIN, y0: y0 - MARGIN, x1: x0 + CHUNK + MARGIN, y1: y0 + CHUNK + MARGIN };
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, CHUNK + bleed, CHUNK + bleed);
    ctx.clip();

    ctx.fillStyle = C.plains;
    ctx.fillRect(x0, y0, CHUNK + bleed, CHUNK + bleed);
    ctx.fillStyle = C.void;
    eachTile(range, (x, y) => { if (at(map, x, y) === ' ') ctx.fillRect(x, y, 1, 1); });

    drawRegions(ctx, map, range);
    drawPlains(ctx, map, range);
    drawGround(ctx, map, range, 'F', C.forestEdge, 0.76, 1);
    drawGround(ctx, map, range, 'F', C.forestFloor, 0.64, 4);
    drawGround(ctx, map, range, 'C', C.cityEdge, 0.78, 7);
    drawGround(ctx, map, range, 'C', C.cityGround, 0.68, 10);
    drawGround(ctx, map, range, 'V', C.villageGround, 0.55, 13);
    drawGround(ctx, map, range, 'M', C.rockBase, 0.5, 16);
    drawGround(ctx, map, range, 'R' + LANDMARK_TILES, C.clearing, 0.4, 19);
    drawWater(ctx, map, range);

    for (let y = range.y0; y < range.y1; y++) {
        for (let x = range.x0; x < range.x1; x++) {
            const tile = at(map, x, y);
            switch (tile) {
                case 'F': drawForestTile(ctx, x, y); break;
                case 'M': drawMountain(ctx, x, y); break;
                case 'C': drawCityTile(ctx, x, y); break;
                case 'V': drawVillageTile(ctx, x, y); break;
                case 'R': drawRefuge(ctx, x, y, usedRefuges.has(`${x},${y}`)); break;
                case '.': drawScars(ctx, x, y); break;
                default: LANDMARKS[tile]?.(ctx, x, y);
            }
        }
    }
    ctx.restore();
};

export const VOID_COLOR = C.void;
