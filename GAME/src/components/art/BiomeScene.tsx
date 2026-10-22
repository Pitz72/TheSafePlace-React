import React, { useId, useMemo } from 'react';
import { WeatherType } from '../../types';
import { branchingTree, cloud, createRng, crane, grass, skyline, stars, streaks, treeLine } from './scenery';

/**
 * Illustrated banner for the overlay cards: the place the traveller is in
 * (plains, forest, river, ruins, village, mountains, a shelter, the outpost),
 * under the sky of the current hour and weather. One static SVG, 1600×260,
 * cropped to the card width. No people: only the land.
 */

type Phase = 'night' | 'dawn' | 'day' | 'golden' | 'dusk';

interface ScenePalette {
    sky: [string, string, string];
    sun: string;
    glow: string;
    far: string;
    mid: string;
    near: string;
    fg: string;
    haze: string;
    water: string;
    stars: number;
}

const PALETTES: Record<Phase, ScenePalette> = {
    night: { sky: ['#04060c', '#0d1527', '#1f2b45'], sun: '#dfe6f2', glow: '#5d7096', far: '#1b243a', mid: '#131b2d', near: '#0c111f', fg: '#05070c', haze: '#2e3d5c', water: '#16213a', stars: 1 },
    dawn: { sky: ['#283252', '#8a6f8a', '#f0b78f'], sun: '#fff3dc', glow: '#ffcf9e', far: '#8f7d8f', mid: '#5b5064', near: '#383246', fg: '#191623', haze: '#f2bd98', water: '#a98a96', stars: 0.15 },
    day: { sky: ['#4f7392', '#8eaab9', '#dccaa6'], sun: '#fff6df', glow: '#ffe6b0', far: '#8d969a', mid: '#5f6c64', near: '#3b4937', fg: '#1d241b', haze: '#d3c6aa', water: '#7f9fae', stars: 0 },
    golden: { sky: ['#363a58', '#b37a5d', '#f3b971'], sun: '#fff1d0', glow: '#f7b062', far: '#8f6552', mid: '#5c403d', near: '#392a2c', fg: '#1b1315', haze: '#f2aa6a', water: '#b07c5e', stars: 0 },
    dusk: { sky: ['#12142c', '#5a2c42', '#d8763f'], sun: '#ffe7c0', glow: '#f09a52', far: '#6f3d45', mid: '#41273a', near: '#26172a', fg: '#0f0a12', haze: '#e88a4b', water: '#6a3a40', stars: 0.6 },
};

const phaseOf = (hour: number): Phase => {
    if (hour < 5 || hour >= 21) return 'night';
    if (hour < 7.5) return 'dawn';
    if (hour < 16.5) return 'day';
    if (hour < 19) return 'golden';
    return 'dusk';
};

/** Special map tiles drawn as the closest landscape. */
const SCENE_OF: Record<string, string> = { S: '.', E: 'R', H: 'R', A: 'A', N: 'N', L: 'C', B: 'C', T: '.' };

const W = 1600;
const H = 260;
const HORIZON = 168;

/** Rolling hills: a smooth line across the scene, closed at the bottom. */
const hills = (baseY: number, amplitude: number, seed: number, bumps = 7): string => {
    const rng = createRng(seed);
    const points = Array.from({ length: bumps + 1 }, (_, i) => [(i / bumps) * (W + 200) - 100, baseY - rng() * amplitude] as const);
    let d = `M-100 ${H}L${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
        const [px, py] = points[i - 1];
        const [x, y] = points[i];
        d += `Q${px + (x - px) / 2} ${Math.min(py, y) - amplitude * 0.25} ${x} ${y}`;
    }
    return `${d}L${W + 100} ${H}Z`;
};

/** A row of mountains with snowy caps. */
const mountains = (baseY: number, minH: number, maxH: number, count: number, seed: number) => {
    const rng = createRng(seed);
    let body = '';
    let snow = '';
    for (let i = 0; i < count; i++) {
        const cx = (i + 0.5) * (W / count) + (rng() - 0.5) * 120;
        const h = minH + rng() * (maxH - minH);
        const w = h * (1.3 + rng() * 0.6);
        const peakY = baseY - h;
        body += `M${cx - w} ${baseY}L${cx - w * 0.2} ${peakY + h * 0.18}L${cx} ${peakY}L${cx + w * 0.3} ${peakY + h * 0.22}L${cx + w} ${baseY}Z`;
        const s = 0.26;
        snow += `M${cx} ${peakY}L${cx - w * 0.2 * s * 3} ${peakY + h * s}L${cx - w * 0.05} ${peakY + h * s * 0.7}L${cx + w * 0.06} ${peakY + h * s * 0.9}L${cx + w * 0.3 * s * 2.6} ${peakY + h * s * 0.85}Z`;
    }
    return { body, snow };
};

/** Small houses with pitched roofs, some caved in. */
const houses = (x0: number, x1: number, baseY: number, seed: number) => {
    const rng = createRng(seed);
    let walls = '';
    let windows = '';
    for (let x = x0; x < x1;) {
        const w = 46 + rng() * 40;
        const h = 26 + rng() * 22;
        const roof = 18 + rng() * 14;
        const top = baseY - h;
        if (rng() < 0.3) {
            walls += `M${x} ${baseY}V${top}L${x + w * 0.35} ${top - roof * 0.8}L${x + w * 0.55} ${top - roof * 0.2}L${x + w * 0.7} ${top + 6}L${x + w} ${top}V${baseY}Z`;
        } else {
            walls += `M${x} ${baseY}V${top}L${x + w / 2} ${top - roof}L${x + w} ${top}V${baseY}Z`;
        }
        if (rng() < 0.5) windows += `M${x + w * 0.3} ${top + 8}h8v10h-8Z`;
        x += w + 10 + rng() * 60;
    }
    return { walls, windows };
};

/** Dead and living trees scattered along a line. */
const sparseTrees = (x0: number, x1: number, baseY: number, seed: number, size: [number, number]) =>
    treeLine({ x0, x1, baseY, size, density: 0.35, seed, conifers: 0.35, jitter: 6 });

interface BiomeSceneProps {
    /** Map tile of the place: '.', 'F', '~', 'C', 'V', 'M', 'R', or a special tile. */
    biome: string;
    /** Hour of the day, with minutes as a fraction. */
    hour: number;
    weather?: WeatherType;
    /** 'shelter' and 'outpost' draw the refuge cabin or the Crocevia instead of the biome. */
    variant?: 'biome' | 'shelter' | 'outpost';
    /** Red cast for fights. */
    danger?: boolean;
    height?: number;
    className?: string;
}

const BiomeScene: React.FC<BiomeSceneProps> = ({ biome, hour, weather, variant = 'biome', danger = false, height = 230, className = '' }) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const id = (name: string) => `${name}-${uid}`;
    const url = (name: string) => `url(#${id(name)})`;
    const phase = phaseOf(hour);
    const p = PALETTES[phase];
    const scene = variant === 'shelter' ? 'R' : variant === 'outpost' ? 'A' : SCENE_OF[biome] ?? biome;
    const night = phase === 'night';
    const warm = night || phase === 'dusk' ? 1 : 0.55;
    const rainy = weather === WeatherType.PIOGGIA || weather === WeatherType.TEMPESTA;
    const overcast = rainy || weather === WeatherType.NUVOLOSO;
    const sunX = phase === 'dawn' ? 1180 : phase === 'golden' || phase === 'dusk' ? 420 : 900;
    const sunY = phase === 'day' ? 62 : night ? 54 : HORIZON - 26;

    const art = useMemo(() => ({
        stars: stars(W, 120, 50, 17),
        clouds: cloud(380, 60, 640, 18, 21) + cloud(1220, 44, 520, 14, 22),
        heavyClouds: cloud(300, 40, 900, 34, 23) + cloud(1150, 56, 1000, 38, 24) + cloud(760, 22, 800, 28, 25),
        streaks: streaks(-100, W + 100, 70, 140, 6, 26),
        farHills: hills(HORIZON + 4, 34, 31, 6),
        midHills: hills(HORIZON + 34, 30, 32, 5),
        farTrees: treeLine({ x0: -40, x1: W + 40, baseY: HORIZON + 6, size: [8, 15], density: 1.2, seed: 33, conifers: 0.4, jitter: 3 }),
        midTrees: treeLine({ x0: -40, x1: W + 40, baseY: HORIZON + 40, size: [16, 30], density: 1.15, seed: 34, conifers: 0.45, jitter: 8 }),
        nearTrees: treeLine({ x0: -60, x1: W + 60, baseY: H + 18, size: [34, 62], density: 0.9, seed: 35, conifers: 0.5, jitter: 14 }),
        sparse: sparseTrees(-20, W + 20, HORIZON + 38, 36, [12, 22]),
        cityFar: skyline({ x0: -30, x1: W + 30, baseY: HORIZON + 6, minH: 30, maxH: 110, minW: 22, maxW: 60, gap: [-4, 14], seed: 41, broken: 0.5, antennas: 0.2 }),
        cityMid: skyline({ x0: -40, x1: W + 40, baseY: H - 18, minH: 70, maxH: 190, minW: 60, maxW: 130, gap: [10, 90], seed: 42, windows: true, broken: 0.55, antennas: 0.3 }),
        crane: crane(1240, HORIZON + 6, 130, -90),
        mountainsFar: mountains(HORIZON + 10, 60, 120, 5, 51),
        mountainsNear: mountains(HORIZON + 46, 50, 95, 4, 52),
        village: houses(120, W - 120, HORIZON + 40, 61),
        bigTree: branchingTree(1500, H + 10, 120, -1.7, 12, 63, 6),
        fgGrass: grass(-20, W + 20, H - 2, [10, 36], 71, 1.1),
        reeds: grass(-20, W + 20, H - 2, [22, 58], 72, 0.8),
        rubble: hills(H - 14, 16, 73, 14),
        rain: Array.from({ length: 90 }, (_, i) => {
            const rng = createRng(800 + i);
            const x = rng() * (W + 200) - 100;
            const y = rng() * H;
            return `M${x.toFixed(0)} ${y.toFixed(0)}l-9 26`;
        }).join(''),
    }), []);

    const ground = (color: string) => <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill={color} />;

    const land = (() => {
        switch (scene) {
            case 'F':
                return (
                    <>
                        <path d={art.farHills} fill={p.far} />
                        <path d={art.farTrees} fill={p.far} />
                        <rect x="0" y={HORIZON - 30} width={W} height="70" fill={url('haze')} />
                        <path d={art.midTrees} fill={p.mid} />
                        {ground(p.near)}
                        <path d={art.nearTrees} fill={p.near} />
                        <path d={art.fgGrass} fill={p.fg} />
                    </>
                );
            case '~':
                return (
                    <>
                        <path d={art.farTrees} fill={p.far} />
                        <rect x="0" y={HORIZON - 30} width={W} height="60" fill={url('haze')} />
                        <rect x="0" y={HORIZON + 6} width={W} height={H - HORIZON} fill={url('water')} />
                        <g stroke={p.sun} strokeLinecap="round" opacity={night ? 0.25 : 0.4}>
                            {[0, 1, 2, 3, 4, 5, 6].map(i => (
                                <path key={i} d={`M${sunX - 60 + (i % 3) * 30} ${HORIZON + 18 + i * 9}h${80 - i * 6}`} strokeWidth={2.4 - i * 0.2} />
                            ))}
                        </g>
                        {/* A broken bridge across the river. */}
                        <path d={`M-20 ${HORIZON - 4}h470l10 6h-480zM560 ${HORIZON - 4}h1100v6h-1100z`} fill={p.mid} />
                        <path d={`M120 ${HORIZON + 2}v24M300 ${HORIZON + 2}v24M700 ${HORIZON + 2}v24M900 ${HORIZON + 2}v24M1100 ${HORIZON + 2}v24M1300 ${HORIZON + 2}v24`} stroke={p.mid} strokeWidth="9" />
                        <path d={art.reeds} fill={p.fg} />
                    </>
                );
            case 'C':
                return (
                    <>
                        <path d={art.cityFar.body} fill={p.far} />
                        <path d={art.cityFar.lines + art.crane} stroke={p.far} strokeWidth="2.4" fill="none" />
                        <rect x="0" y={HORIZON - 40} width={W} height="70" fill={url('haze')} />
                        {ground(p.near)}
                        <path d={art.cityMid.body} fill={p.mid} />
                        <path d={art.cityMid.windows} fill={p.haze} opacity={night ? 0.08 : 0.16} />
                        <path d={art.cityMid.lines} stroke={p.mid} strokeWidth="3" fill="none" />
                        <path d={art.cityMid.growth} fill={p.near} />
                        <path d={art.rubble} fill={p.fg} />
                    </>
                );
            case 'V':
                return (
                    <>
                        <path d={art.farHills} fill={p.far} />
                        <rect x="0" y={HORIZON - 30} width={W} height="60" fill={url('haze')} />
                        <path d={art.midHills} fill={p.mid} />
                        <path d={art.village.walls} fill={p.near} />
                        <path d={art.village.windows} fill={p.haze} opacity={night ? 0.12 : 0.22} />
                        {/* Bell tower. */}
                        <path d={`M760 ${HORIZON + 40}V${HORIZON - 60}l16-22 16 22V${HORIZON + 40}Z`} fill={p.near} />
                        <path d={art.sparse} fill={p.near} />
                        <rect x="0" y={HORIZON + 40} width={W} height={H} fill={p.near} />
                        <path d={art.fgGrass} fill={p.fg} />
                    </>
                );
            case 'M':
                return (
                    <>
                        <path d={art.mountainsFar.body} fill={p.far} />
                        <path d={art.mountainsFar.snow} fill={p.haze} opacity="0.75" />
                        <rect x="0" y={HORIZON - 30} width={W} height="60" fill={url('haze')} />
                        <path d={art.mountainsNear.body} fill={p.mid} />
                        <path d={art.mountainsNear.snow} fill={p.haze} opacity="0.5" />
                        {ground(p.near)}
                        <path d={art.nearTrees} fill={p.near} />
                        <path d={art.fgGrass} fill={p.fg} />
                    </>
                );
            case 'R':
                return (
                    <>
                        <path d={art.farHills} fill={p.far} />
                        <path d={art.farTrees} fill={p.far} />
                        <rect x="0" y={HORIZON - 30} width={W} height="60" fill={url('haze')} />
                        <path d={art.midHills} fill={p.mid} />
                        {/* The cabin, a warm window and smoke from the chimney. */}
                        <circle cx="560" cy={HORIZON + 22} r="150" fill={url('warm')} opacity={warm} />
                        <path d={`M470 ${HORIZON + 44}V${HORIZON - 6}L560 ${HORIZON - 58}L650 ${HORIZON - 6}V${HORIZON + 44}Z`} fill={p.near} />
                        <path d={`M610 ${HORIZON - 34}v-34h16v46z`} fill={p.near} />
                        <path d={`M528 ${HORIZON + 6}h26v22h-26z`} fill="#ffcf86" opacity={0.6 + warm * 0.4} />
                        <path d={`M618 ${HORIZON - 74}q14-18 -2-34q-14-16 6-34`} stroke={p.haze} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.25" />
                        <path d={art.bigTree.wood} fill={p.near} />
                        <rect x="0" y={HORIZON + 40} width={W} height={H} fill={p.near} />
                        <path d={art.fgGrass} fill={p.fg} />
                    </>
                );
            case 'A':
                return (
                    <>
                        <path d={art.cityFar.body} fill={p.far} opacity="0.7" />
                        <rect x="0" y={HORIZON - 30} width={W} height="60" fill={url('haze')} />
                        <path d={art.midHills} fill={p.mid} />
                        <circle cx="800" cy={HORIZON + 40} r="230" fill={url('warm')} opacity={warm} />
                        {/* Containers, tents, the fire, a string of lights. */}
                        <g fill={p.near}>
                            <path d={`M420 ${HORIZON + 48}v-56h150v56zM450 ${HORIZON - 8}v-44h120v44zM1010 ${HORIZON + 48}v-52h170v52zM1180 ${HORIZON + 48}v-40h110v40z`} />
                            <path d={`M640 ${HORIZON + 48}l60-70 60 70zM880 ${HORIZON + 48}l46-56 46 56z`} />
                        </g>
                        <path d={`M440 ${HORIZON - 52}Q800 ${HORIZON - 10} 1160 ${HORIZON - 4}`} stroke={p.near} strokeWidth="1.6" fill="none" />
                        <g fill="#ffd08a">
                            {Array.from({ length: 14 }, (_, i) => {
                                const t = i / 13;
                                const x = 440 + t * 720;
                                const y = (1 - t) * (1 - t) * (HORIZON - 52) + 2 * (1 - t) * t * (HORIZON - 10) + t * t * (HORIZON - 4);
                                return <circle key={i} cx={x} cy={y + 4} r="3" opacity={0.5 + warm * 0.5} />;
                            })}
                        </g>
                        <circle cx="800" cy={HORIZON + 42} r="40" fill={url('fire')} />
                        <rect x="0" y={HORIZON + 46} width={W} height={H} fill={p.near} />
                        <path d={art.fgGrass} fill={p.fg} />
                    </>
                );
            case 'N':
                return (
                    <>
                        <path d={art.farHills} fill={p.far} />
                        <path d={art.midHills} fill={p.mid} />
                        {/* The ash nest: a dark hollow breathing violet haze. */}
                        <ellipse cx="900" cy={HORIZON + 34} rx="420" ry="140" fill={url('ash')} />
                        <path d={`M640 ${HORIZON + 62}q260-96 520 0z`} fill="#0b0910" />
                        <path d={`M700 ${HORIZON + 62}q200-60 400 0z`} fill="#1b1424" />
                        <path d={art.sparse} fill={p.near} />
                        <rect x="0" y={HORIZON + 48} width={W} height={H} fill={p.near} />
                        <path d={art.fgGrass} fill={p.fg} />
                    </>
                );
            default:
                return (
                    <>
                        <path d={art.farHills} fill={p.far} />
                        <rect x="0" y={HORIZON - 30} width={W} height="60" fill={url('haze')} />
                        <path d={art.midHills} fill={p.mid} />
                        <path d={art.sparse} fill={p.mid} />
                        {/* Telegraph poles along a forgotten road. */}
                        <g stroke={p.near} strokeLinecap="round" fill="none">
                            <path d={`M980 ${HORIZON + 26}v-46M960 ${HORIZON - 14}h40M1180 ${HORIZON + 34}v-64M1152 ${HORIZON - 22}h56M1440 ${HORIZON + 48}v-92M1404 ${HORIZON - 34}h72`} strokeWidth="4" />
                            <path d={`M960 ${HORIZON - 14}Q1070 ${HORIZON - 4} 1152 ${HORIZON - 22}M1208 ${HORIZON - 22}Q1320 ${HORIZON - 8} 1404 ${HORIZON - 34}`} strokeWidth="1.4" />
                        </g>
                        <path d={art.bigTree.wood} fill={p.near} />
                        <rect x="0" y={HORIZON + 46} width={W} height={H} fill={p.near} />
                        <path d={art.fgGrass} fill={p.fg} />
                    </>
                );
        }
    })();

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
            width="100%"
            height={height}
            className={`block ${className}`}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={p.sky[0]} />
                    <stop offset="0.45" stopColor={p.sky[1]} />
                    <stop offset="0.68" stopColor={p.sky[2]} />
                </linearGradient>
                <radialGradient id={id('glow')} cx={sunX} cy={sunY} r="620" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor={p.glow} stopOpacity={night ? 0.3 : 0.55} />
                    <stop offset="1" stopColor={p.glow} stopOpacity="0" />
                </radialGradient>
                <linearGradient id={id('haze')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={p.haze} stopOpacity="0" />
                    <stop offset="0.6" stopColor={p.haze} stopOpacity="0.45" />
                    <stop offset="1" stopColor={p.haze} stopOpacity="0" />
                </linearGradient>
                <linearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={p.sky[2]} stopOpacity="0.85" />
                    <stop offset="0.5" stopColor={p.water} />
                    <stop offset="1" stopColor={p.fg} />
                </linearGradient>
                <radialGradient id={id('warm')}>
                    <stop offset="0" stopColor="#ffb86a" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#ffb86a" stopOpacity="0" />
                </radialGradient>
                <radialGradient id={id('fire')}>
                    <stop offset="0" stopColor="#fff1c8" />
                    <stop offset="0.35" stopColor="#ffa64d" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#ff7a2e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id={id('ash')}>
                    <stop offset="0" stopColor="#9a7ae0" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#9a7ae0" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={id('fog')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#dfe3e6" stopOpacity="0.12" />
                    <stop offset="0.62" stopColor="#dfe3e6" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#dfe3e6" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id={id('fade')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0.55" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id={id('danger')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7a1d18" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#2a0806" stopOpacity="0.75" />
                </linearGradient>
                <filter id={id('soft')} x="-10%" y="-60%" width="120%" height="220%">
                    <feGaussianBlur stdDeviation="3" />
                </filter>
            </defs>

            <rect width={W} height={H} fill={url('sky')} />
            {p.stars > 0 && !overcast && (
                <g fill="#fff" opacity={p.stars * 0.8}>
                    {art.stars.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r * 0.8} opacity={0.3 + (i % 4) * 0.15} />)}
                </g>
            )}
            {!overcast && <rect width={W} height={H} fill={url('glow')} />}
            {!overcast && <circle cx={sunX} cy={sunY} r={night ? 16 : 26} fill={p.sun} opacity={night ? 0.9 : 1} />}
            <g filter={url('soft')}>
                <path d={art.streaks} fill={p.glow} opacity={overcast ? 0.08 : 0.25} />
                <path d={overcast ? art.heavyClouds : art.clouds} fill={overcast ? p.mid : p.far} opacity={overcast ? 0.85 : 0.35} />
            </g>

            {land}

            {/* Weather over the land. */}
            {rainy && (
                <path d={art.rain} stroke={p.haze} strokeWidth={weather === WeatherType.TEMPESTA ? 1.6 : 1.1} strokeLinecap="round" opacity={weather === WeatherType.TEMPESTA ? 0.55 : 0.35} />
            )}
            {weather === WeatherType.TEMPESTA && <rect width={W} height={H} fill="#0a0f1a" opacity="0.35" />}
            {weather === WeatherType.NEBBIA && <rect width={W} height={H} fill={url('fog')} />}
            {danger && <rect width={W} height={H} fill={url('danger')} style={{ mixBlendMode: 'multiply' }} />}
            {/* Melts into the card below. */}
            <rect width={W} height={H} fill={url('fade')} />
        </svg>
    );
};

export default BiomeScene;
