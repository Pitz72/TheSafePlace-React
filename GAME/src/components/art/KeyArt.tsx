import React, { useId, useMemo } from 'react';
import { branchingTree, cloud, crane, createRng, grass, skyline, stars, streaks, treeLine } from './scenery';

/**
 * The key art of the game: the traveller on an overgrown highway, walking
 * toward a light on the horizon, between the ruins of a city.
 *
 * Drawn entirely in SVG at 1920×1080 and cropped to fill its container.
 * Static layers are separate from the animated ones (clouds, birds, ash),
 * so the browser moves the animated layers without repainting the scene.
 */

export type KeyArtVariant = 'dusk' | 'dawn' | 'night';

interface Palette {
    sky: [number, string][];
    sun: string;
    sunEdge: string;
    glow: string;
    glowStrength: number;
    haze: string;
    cloudTop: string;
    cloudLit: string;
    far: string;
    distant: string;
    mid: string;
    midWindows: string;
    hills: string;
    ground: string;
    road: string;
    roadSheen: string;
    fg: string;
    rim: string;
    mote: string;
    stars: number;
}

const PALETTES: Record<KeyArtVariant, Palette> = {
    dusk: {
        sky: [[0, '#090d1b'], [0.26, '#191832'], [0.44, '#432740'], [0.55, '#8e443e'], [0.61, '#d4733f'], [0.655, '#f2a860'], [0.69, '#f8cb86']],
        sun: '#fff6dc', sunEdge: '#ffd38f', glow: '#f4a257', glowStrength: 0.6, haze: '#e98a4b',
        cloudTop: '#231d38', cloudLit: '#cf6a4a',
        far: '#7a4045', distant: '#9a5147', mid: '#46283a', midWindows: '#a2563f', hills: '#29192a',
        ground: '#22161f', road: '#191119', roadSheen: '#6b4038', fg: '#0c080e', rim: '#ffc27a', mote: '#ffd7a0',
        stars: 0.75,
    },
    dawn: {
        sky: [[0, '#16203a'], [0.3, '#34416a'], [0.47, '#7b6a8f'], [0.57, '#cf8f8c'], [0.62, '#f2b48a'], [0.66, '#fbd9a6'], [0.7, '#fdeccb']],
        sun: '#fffdf2', sunEdge: '#ffe7b8', glow: '#ffd29a', glowStrength: 0.55, haze: '#f7c49a',
        cloudTop: '#4c4a74', cloudLit: '#f3b296',
        far: '#9a7e93', distant: '#b98f95', mid: '#5b4c6c', midWindows: '#c99a92', hills: '#3a3252',
        ground: '#2d2840', road: '#221e31', roadSheen: '#8f7488', fg: '#141120', rim: '#ffe2b0', mote: '#fff1d6',
        stars: 0.15,
    },
    night: {
        sky: [[0, '#03050b'], [0.35, '#080d1a'], [0.55, '#111a2e'], [0.63, '#1b2740'], [0.68, '#24324d'], [0.72, '#2a3955']],
        sun: '#dfe6f2', sunEdge: '#b9c6dc', glow: '#5d7096', glowStrength: 0.35, haze: '#3c4d6e',
        cloudTop: '#070a14', cloudLit: '#25314c',
        far: '#18213a', distant: '#1f2a45', mid: '#111729', midWindows: '#2b3654', hills: '#0c111f',
        ground: '#0b0f1a', road: '#090c15', roadSheen: '#26314a', fg: '#04060b', rim: '#9fb4d8', mote: '#b8c8e8',
        stars: 1,
    },
};

const W = 1920;
const H = 1080;
const HORIZON = 716;
const SUN = { x: 1240, y: 668, r: 60 };

const layerStyle: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

/** Small car wreck, facing right, wheels on the base line (local coords). */
const CAR = 'M0 0v-26c0-9 6-15 16-17l30-6 34-30h86l40 30 20 4c10 2 16 9 16 18v27zM58 -1a20 20 0 0 0 40 0zM168 -1a20 20 0 0 0 40 0z';
const CAR_GLASS = 'M86 -50l26-24h30v24zM150 -50v-24h22l30 24z';

interface KeyArtProps {
    variant?: KeyArtVariant;
    /**
     * Image of the traveller (transparent PNG, feet touching the bottom edge,
     * centered): placed on the road and backlit by the scene. No figure without it.
     */
    figure?: string | null;
    /** Darken the left side, where titles and menus sit. */
    shade?: 'left' | 'center' | 'none';
    /** Slow camera drift, clouds, birds and ash. */
    animated?: boolean;
    /** Part of the 1920×1080 scene to frame (an SVG viewBox), e.g. a vertical crop for covers. */
    frame?: string;
    className?: string;
}

const KeyArt: React.FC<KeyArtProps> = ({ variant = 'dusk', figure = null, shade = 'left', animated = true, frame = `0 0 ${W} ${H}`, className = '' }) => {
    const p = PALETTES[variant];
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const id = (name: string) => `${name}-${uid}`;
    const url = (name: string) => `url(#${id(name)})`;

    const scene = useMemo(() => {
        const far = skyline({ x0: -30, x1: W + 30, baseY: HORIZON + 6, minH: 34, maxH: 240, minW: 26, maxW: 78, gap: [-6, 18], seed: 11, low: [[1110, 1370, 46], [980, 1110, 120]], broken: 0.45, antennas: 0.22 });
        const distant = skyline({ x0: 560, x1: 1560, baseY: HORIZON + 4, minH: 12, maxH: 60, minW: 18, maxW: 46, gap: [0, 10], seed: 5, low: [[1180, 1300, 16]], broken: 0.5 });
        const midLeft = skyline({ x0: -60, x1: 600, baseY: 800, minH: 170, maxH: 500, minW: 80, maxW: 160, gap: [-14, 30], seed: 23, windows: true, broken: 0.55, antennas: 0.3 });
        const midRight = skyline({ x0: 1530, x1: W + 60, baseY: 810, minH: 150, maxH: 430, minW: 80, maxW: 150, gap: [-14, 24], seed: 29, windows: true, broken: 0.55, antennas: 0.3 });
        const rng = createRng(77);
        // Center dashes of the road, shrinking toward the horizon.
        let dashes = '';
        for (let i = 0; i < 16; i++) {
            const t0 = Math.pow(i / 16, 1.9);
            const t1 = Math.pow((i + 0.45) / 16, 1.9);
            const y0 = HORIZON + (H - HORIZON) * t0;
            const y1 = HORIZON + (H - HORIZON) * t1;
            const x0 = SUN.x - 30 * t0;
            const x1 = SUN.x - 30 * t1;
            const w0 = 1 + 9 * t0;
            const w1 = 1 + 9 * t1;
            if (rng() < 0.25) continue;
            dashes += `M${x0 - w0} ${y0}L${x0 + w0} ${y0}L${x1 + w1} ${y1}L${x1 - w1} ${y1}Z`;
        }
        let cracks = '';
        for (let i = 0; i < 9; i++) {
            let x = 980 + rng() * 520;
            let y = 800 + rng() * 260;
            cracks += `M${x.toFixed(0)} ${y.toFixed(0)}`;
            for (let s = 0; s < 4; s++) {
                x += (rng() - 0.5) * 60;
                y += (rng() - 0.3) * 18;
                cracks += `L${x.toFixed(0)} ${y.toFixed(0)}`;
            }
        }
        return {
            far, distant, midLeft, midRight, dashes, cracks,
            stars: stars(W, 430, 90, 3),
            streaksHigh: streaks(-100, W + 100, 380, 560, 9, 65),
            streaksLow: streaks(560, 1900, 560, 630, 5, 66),
            bigTree: branchingTree(1880, 1100, 240, -1.72, 24, 8, 8),
            cranes: crane(420, HORIZON + 4, 330, 160) + crane(1690, HORIZON + 4, 270, -130),
            treesFar: treeLine({ x0: 560, x1: 1520, baseY: HORIZON + 12, size: [7, 15], density: 1.3, seed: 41, conifers: 0.35, jitter: 4 }),
            treesLeft: treeLine({ x0: -40, x1: 700, baseY: 812, size: [22, 48], density: 1.15, seed: 31, conifers: 0.3, jitter: 10 }),
            treesRight: treeLine({ x0: 1420, x1: W + 40, baseY: 826, size: [22, 50], density: 1.1, seed: 37, conifers: 0.3, jitter: 10 }),
            fieldLeft: grass(-20, 980, 868, [10, 34], 52, 0.9) + grass(-20, 860, 930, [18, 52], 53, 0.9),
            fieldRight: grass(1500, W + 20, 900, [12, 40], 54, 0.9) + grass(1600, W + 20, 980, [20, 60], 55, 0.9),
            roadGrass: grass(1205, 1270, 860, [6, 16], 58, 0.5) + grass(1300, 1420, 1000, [10, 26], 59, 0.5),
            foreground: grass(-30, W + 30, H - 6, [26, 120], 51, 1.25),
            cloudA: cloud(520, 300, 940, 34, 61),
            cloudB: cloud(1520, 210, 720, 26, 62),
            cloudC: cloud(1060, 480, 1320, 26, 63),
            cloudD: cloud(250, 530, 640, 20, 64),
        };
    }, []);

    const motes = useMemo(() => {
        const rng = createRng(91);
        return Array.from({ length: 30 }, () => ({
            left: `${(rng() * 100).toFixed(1)}%`,
            top: `${(55 + rng() * 45).toFixed(1)}%`,
            size: 2 + rng() * 4,
            duration: 16 + rng() * 22,
            delay: -rng() * 30,
            dx: `${(rng() * 160 - 40).toFixed(0)}px`,
            opacity: (0.3 + rng() * 0.6).toFixed(2),
        }));
    }, []);

    const poles = [
        { x: 1290, base: HORIZON + 10, h: 34 },
        { x: 1360, base: HORIZON + 26, h: 54 },
        { x: 1470, base: 756, h: 86 },
        { x: 1640, base: 806, h: 150 },
        { x: 1890, base: 884, h: 250 },
    ];
    const wires = poles.slice(0, -1).map((pole, i) => {
        const next = poles[i + 1];
        return [-0.35, 0.35].map(side => {
            const ax = pole.x + side * pole.h * 0.5;
            const ay = pole.base - pole.h;
            const bx = next.x + side * next.h * 0.5;
            const by = next.base - next.h;
            return `M${ax} ${ay}Q${(ax + bx) / 2} ${Math.max(ay, by) + (bx - ax) * 0.12} ${bx} ${by}`;
        }).join('');
    }).join('');

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: p.sky[0][1] }}>
            <div style={{ ...layerStyle, animation: animated ? 'ken-burns 48s ease-in-out infinite alternate' : undefined, willChange: animated ? 'transform' : undefined }}>
                {/* Sky, stars, sun. */}
                <svg viewBox={frame} preserveAspectRatio="xMidYMid slice" style={layerStyle}>
                    <defs>
                        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
                            {p.sky.map(([offset, color]) => <stop key={offset} offset={offset} stopColor={color} />)}
                        </linearGradient>
                        <radialGradient id={id('glow')} cx={SUN.x} cy={SUN.y} r="980" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor={p.glow} stopOpacity={p.glowStrength} />
                            <stop offset="0.25" stopColor={p.glow} stopOpacity={p.glowStrength * 0.35} />
                            <stop offset="1" stopColor={p.glow} stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id={id('sun')}>
                            <stop offset="0" stopColor={p.sun} />
                            <stop offset="0.75" stopColor={p.sun} />
                            <stop offset="1" stopColor={p.sunEdge} />
                        </radialGradient>
                        <filter id={id('soft')} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="16" />
                        </filter>
                        <linearGradient id={id('ray')} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor={p.sun} stopOpacity="0.22" />
                            <stop offset="1" stopColor={p.sun} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <rect width={W} height={H} fill={url('sky')} />
                    <g fill="#fff" opacity={p.stars}>
                        {scene.stars.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} opacity={0.35 + (i % 5) * 0.12} />)}
                    </g>
                    <rect width={W} height={H} fill={url('glow')} />
                    {variant !== 'night' && (
                        <g style={{ mixBlendMode: 'screen' }} opacity="0.32" filter={url('soft')}>
                            {[-34, -16, -4, 12, 28].map((angle, i) => (
                                <path key={i} d={`M0 -4L1400 -${90 + (i % 3) * 50}L1400 ${90 + (i % 2) * 60}L0 4Z`} fill={url('ray')} transform={`translate(${SUN.x} ${SUN.y}) rotate(${angle - 90})`} />
                            ))}
                        </g>
                    )}
                    {variant === 'night'
                        ? <circle cx={1500} cy={250} r={34} fill={url('sun')} />
                        : <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={url('sun')} />}
                </svg>

                {/* Clouds drift slowly over the sky. */}
                <div style={{ ...layerStyle, animation: animated ? 'drift 110s ease-in-out infinite alternate' : undefined, willChange: animated ? 'transform' : undefined }}>
                    <svg viewBox={frame} preserveAspectRatio="xMidYMid slice" style={layerStyle}>
                        <defs>
                            <linearGradient id={id('cloud')} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor={p.cloudTop} stopOpacity="0.95" />
                                <stop offset="0.55" stopColor={p.cloudTop} stopOpacity="0.9" />
                                <stop offset="1" stopColor={p.cloudLit} stopOpacity="0.85" />
                            </linearGradient>
                        </defs>
                        <filter id={id('cloudSoft')} x="-10%" y="-50%" width="120%" height="200%">
                            <feGaussianBlur stdDeviation="3.5" />
                        </filter>
                        <g fill={p.cloudLit} filter={url('cloudSoft')}>
                            <path d={scene.streaksHigh} opacity="0.35" />
                            <path d={scene.streaksLow} opacity="0.55" />
                        </g>
                        <g fill={url('cloud')} filter={url('cloudSoft')}>
                            <path d={scene.cloudA} opacity="0.8" />
                            <path d={scene.cloudB} opacity="0.65" />
                            <path d={scene.cloudC} opacity="0.55" />
                            <path d={scene.cloudD} opacity="0.6" />
                        </g>
                    </svg>
                </div>

                {/* Birds circling far away. */}
                {variant !== 'night' && (
                    <div style={{ ...layerStyle, animation: animated ? 'glide 70s linear infinite' : undefined, ['--dx' as string]: '-260px', ['--dy' as string]: '-40px' } as React.CSSProperties}>
                        <svg viewBox={frame} preserveAspectRatio="xMidYMid slice" style={layerStyle}>
                            <g fill="none" stroke={p.hills} strokeWidth="2.2" strokeLinecap="round" opacity="0.8">
                                <path d="M1040 410q8-8 15 0q7-8 15 0" />
                                <path d="M1092 446q6-6 11 0q5-6 11 0" />
                                <path d="M1010 470q5-5 9 0q4-5 9 0" />
                                <path d="M1130 392q5-5 9 0q4-5 9 0" />
                            </g>
                        </svg>
                    </div>
                )}

                {/* The land: skylines, trees, road, wrecks, the traveller. */}
                <svg viewBox={frame} preserveAspectRatio="xMidYMid slice" style={layerStyle}>
                    <defs>
                        <linearGradient id={id('haze')} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={p.haze} stopOpacity="0" />
                            <stop offset="0.6" stopColor={p.haze} stopOpacity="0.5" />
                            <stop offset="1" stopColor={p.haze} stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id={id('ground')} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={p.distant} />
                            <stop offset="0.06" stopColor={p.far} />
                            <stop offset="0.22" stopColor={p.hills} />
                            <stop offset="0.45" stopColor={p.ground} />
                            <stop offset="1" stopColor={p.fg} />
                        </linearGradient>
                        <linearGradient id={id('road')} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={p.roadSheen} />
                            <stop offset="0.3" stopColor={p.road} />
                            <stop offset="1" stopColor={p.fg} />
                        </linearGradient>
                        <radialGradient id={id('puddle')}>
                            <stop offset="0" stopColor={p.sunEdge} stopOpacity="0.85" />
                            <stop offset="1" stopColor={p.glow} stopOpacity="0" />
                        </radialGradient>
                        <filter id={id('rim')} x="-50%" y="-20%" width="200%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="soft" />
                            <feOffset in="soft" dx="2" dy="-3" result="lifted" />
                            <feFlood floodColor={p.rim} floodOpacity="0.75" />
                            <feComposite in2="lifted" operator="in" />
                        </filter>
                        <linearGradient id={id('rimFade')} x1="0" y1="664" x2="0" y2="1004" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#fff" />
                            <stop offset="0.45" stopColor="#fff" stopOpacity="0.9" />
                            <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
                        </linearGradient>
                        <mask id={id('rimMask')} maskUnits="userSpaceOnUse" x="850" y="620" width="420" height="400">
                            <rect x="850" y="620" width="420" height="400" fill={url('rimFade')} />
                        </mask>
                        <radialGradient id={id('beacon')}>
                            <stop offset="0" stopColor={p.sun} stopOpacity="1" />
                            <stop offset="0.3" stopColor={p.sunEdge} stopOpacity="0.6" />
                            <stop offset="1" stopColor={p.glow} stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Far city, half lost in the haze. */}
                    <path d={scene.distant.body} fill={p.distant} />
                    <path d={scene.far.body} fill={p.far} />
                    <path d={scene.far.lines + scene.cranes} fill="none" stroke={p.far} strokeWidth="2.4" />
                    <path d={scene.treesFar} fill={p.far} />

                    {/* The Safe Place: a single light on the horizon. */}
                    <circle cx={SUN.x + 92} cy={HORIZON - 3} r="16" fill={url('beacon')} opacity={variant === 'night' ? 0.9 : 0.55} />

                    {/* Ground plane, lost in the haze at the horizon. */}
                    <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill={url('ground')} />
                    <rect x="0" y={HORIZON - 130} width={W} height="170" fill={url('haze')} />

                    {/* Closer ruins with empty windows, overgrown at the base. */}
                    <path d={scene.midLeft.body + scene.midRight.body} fill={p.mid} />
                    <path d={scene.midLeft.windows + scene.midRight.windows} fill={p.midWindows} opacity="0.2" />
                    <path d={scene.midLeft.lines + scene.midRight.lines} fill="none" stroke={p.mid} strokeWidth="3" />
                    <path d={scene.midLeft.growth + scene.midRight.growth} fill={p.hills} opacity="0.85" />
                    <rect x="0" y="690" width={W} height="160" fill={url('haze')} opacity="0.55" />
                    <path d={scene.treesLeft + scene.treesRight} fill={p.hills} />

                    {/* Power line along the road. */}
                    <g stroke={p.hills} fill="none" strokeLinecap="round">
                        {poles.map(pole => (
                            <path key={pole.x} d={`M${pole.x} ${pole.base}V${pole.base - pole.h}M${pole.x - pole.h * 0.22} ${pole.base - pole.h * 0.94}H${pole.x + pole.h * 0.22}`} strokeWidth={Math.max(2, pole.h / 26)} />
                        ))}
                        <path d={wires} strokeWidth="1.4" opacity="0.85" />
                    </g>

                    {/* Road sign, bent by years of wind. */}
                    <g fill={p.hills}>
                        <rect x="866" y="728" width="5" height="110" transform="rotate(-6 868 838)" />
                        <path d="M826 726l92-10 4 44-92 10z" />
                        <path d="M842 742l46-5m-10-9 12 8-10 11" stroke={p.roadSheen} strokeWidth="3" fill="none" opacity="0.5" />
                    </g>

                    {/* Fields on both sides. */}
                    <path d={scene.fieldLeft + scene.fieldRight} fill={p.hills} />

                    {/* The road toward the light. */}
                    <path d={`M${SUN.x - 14} ${HORIZON}L${SUN.x + 14} ${HORIZON}L1760 ${H}L680 ${H}Z`} fill={url('road')} />
                    <path d={`M${SUN.x - 11} ${HORIZON}L742 ${H}M${SUN.x + 11} ${HORIZON}L1700 ${H}`} stroke={p.roadSheen} strokeWidth="3" opacity="0.35" fill="none" />
                    <path d={scene.dashes} fill={p.roadSheen} opacity="0.55" />
                    <path d={scene.cracks} stroke={p.fg} strokeWidth="2" fill="none" opacity="0.6" />
                    <ellipse cx="1330" cy="968" rx="120" ry="14" fill={url('puddle')} opacity="0.6" />
                    <ellipse cx="1205" cy="842" rx="46" ry="5" fill={url('puddle')} opacity="0.5" />
                    <path d={scene.roadGrass} fill={p.fg} opacity="0.8" />

                    {/* Wrecks. */}
                    <g fill={p.hills}>
                        <g transform="translate(760 868) scale(0.78)">
                            <path d={CAR} />
                            <path d={CAR_GLASS} fill={p.roadSheen} opacity="0.35" />
                        </g>
                        <g transform="translate(1880 1010) scale(-1.25 1.25)">
                            <path d={CAR} fill={p.fg} />
                            <path d={CAR_GLASS} fill={p.roadSheen} opacity="0.25" />
                        </g>
                    </g>

                    {/* The traveller, backlit. */}
                    {figure && (
                        <g>
                            <path d="M1022 1004L1100 1004L1015 1100L815 1100Z" fill="#000" opacity="0.32" />
                            {/* Backlight: strong where the figure stands against the sky, gone at the feet. */}
                            <g mask={url('rimMask')}>
                                <image href={figure} x="892" y="664" width="340" height="340" preserveAspectRatio="xMidYMax meet" filter={url('rim')} />
                            </g>
                            <image href={figure} x="892" y="664" width="340" height="340" preserveAspectRatio="xMidYMax meet" />
                        </g>
                    )}

                    {/* A big tree frames the scene on the right. */}
                    <path d={scene.bigTree.wood} fill={p.fg} />
                    <path d={scene.bigTree.leaves} fill={p.fg} opacity="0.92" />

                    {/* Rubble and grass in the foreground. */}
                    <path d="M-20 1080V980c60-30 140-52 230-46 70 5 120 30 190 34 60 4 110-6 160 10 40 13 60 50 80 102z" fill={p.fg} />
                    <path d="M120 950l-14-46M180 944l10-58M250 950l26-40M330 960l-6-34" stroke={p.fg} strokeWidth="4" strokeLinecap="round" />
                    <path d={scene.foreground} fill={p.fg} />
                </svg>

                {/* Ash and pollen floating in the warm air. */}
                {animated && (
                    <div style={layerStyle}>
                        {motes.map((mote, i) => (
                            <span
                                key={i}
                                style={{
                                    position: 'absolute', left: mote.left, top: mote.top, width: mote.size, height: mote.size,
                                    borderRadius: '50%', background: p.mote, boxShadow: `0 0 ${mote.size * 3}px ${p.mote}`,
                                    animation: `rise ${mote.duration}s linear ${mote.delay}s infinite`,
                                    ['--dx' as string]: mote.dx, ['--o' as string]: mote.opacity, opacity: 0,
                                } as React.CSSProperties}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Vignette and the shade behind the texts. */}
            <div style={{ ...layerStyle, background: 'radial-gradient(ellipse 75% 70% at 60% 55%, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
            {shade === 'left' && <div style={{ ...layerStyle, background: 'linear-gradient(90deg, rgba(5,6,10,0.82) 0%, rgba(5,6,10,0.55) 28%, rgba(5,6,10,0) 55%)' }} />}
            {shade === 'center' && <div style={{ ...layerStyle, background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(5,6,10,0.7), rgba(5,6,10,0.35) 70%, rgba(5,6,10,0.6))' }} />}
        </div>
    );
};

export default KeyArt;
