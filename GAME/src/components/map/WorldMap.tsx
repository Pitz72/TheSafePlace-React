import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCharacterStore } from '../../store/characterStore';
import { useTimeStore } from '../../store/timeStore';
import { useQuestDatabaseStore } from '../../data/questDatabase';
import { getActiveQuestMarkers } from '../../services/questService';
import { Position, WeatherType } from '../../types';
import { toAbsoluteMinutes } from '../../utils/time';
import { CHUNK, VOID_COLOR, chunkSignature, drawChunk } from './terrain';
import { lightAt } from './lighting';
import Icon, { IconName } from '../ui/Icon';
import { Tone, toneColor } from '../../utils/palette';
import { createRng } from '../art/scenery';

const MOVE_MS = 150;
/** Pixels of cached terrain kept in memory (about 160 MB of RGBA at most). */
const MAX_CACHED_PIXELS = 40_000_000;

interface Marker {
    id: string;
    pos: Position;
    tone: Tone;
    icon: IconName;
    name: string;
    pulse?: boolean;
    priority: number;
}

/** Landmarks the edge indicators point to when they are out of sight. */
const LANDMARKS: Record<string, { name: string; icon: IconName; tone: Tone; priority: number }> = {
    E: { name: 'The Safe Place', icon: 'flag', tone: 'ember', priority: 90 },
    A: { name: 'Il Crocevia', icon: 'signpost', tone: 'ember2', priority: 70 },
    H: { name: 'Capanna Erborista', icon: 'leaf', tone: 'sage', priority: 65 },
    B: { name: 'Biblioteca', icon: 'columns', tone: 'gold', priority: 60 },
    L: { name: 'Laboratorio', icon: 'bolt', tone: 'teal', priority: 60 },
    N: { name: 'Nido della Cenere', icon: 'flame', tone: 'violet', priority: 50 },
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Map pin anchored at the bottom of a tile, in tile units. */
const Pin: React.FC<{ marker: Marker }> = ({ marker }) => {
    const color = toneColor(marker.tone);
    return (
        <g transform={`translate(${marker.pos.x + 0.5} ${marker.pos.y + 0.78})`}>
            {marker.pulse && <ellipse className="map-pulse" rx="0.42" ry="0.18" fill="none" stroke={color} strokeWidth="0.05" />}
            <ellipse rx="0.2" ry="0.08" fill="rgba(0,0,0,0.5)" />
            <path d="M0 0C-.1-.2-.34-.38-.34-.66A.34.34 0 1 1 .34-.66C.34-.38.1-.2 0 0Z" fill={color} stroke="rgba(10,10,12,0.75)" strokeWidth="0.045" />
            <g transform="translate(-0.2 -0.86) scale(0.0167)" color="#14161b">
                <Icon name={marker.icon} size={24} strokeWidth={2.6} />
            </g>
        </g>
    );
};

/**
 * The world map: illustrated terrain on a canvas (cached in chunks), a camera
 * that glides after the player, pins for quests and places, edge indicators
 * for what is out of sight, and the light of the hour and the weather.
 */
const WorldMap: React.FC<{
    /** Rows of tiles visible (see useMapZoom). */
    zoom: number;
    /** An overlay is open: animations stop, so nothing repaints under its blur. */
    paused?: boolean;
}> = ({ zoom, paused = false }) => {
    const map = useGameStore(state => state.map);
    const playerPos = useGameStore(state => state.playerPos);
    const wanderingTrader = useGameStore(state => state.wanderingTrader);
    const pois = useGameStore(state => state.pois);
    const visitedRefuges = useGameStore(state => state.visitedRefuges);
    const lightUntil = useGameStore(state => state.lightUntil);
    const activeQuests = useCharacterStore(state => state.activeQuests);
    const quests = useQuestDatabaseStore(state => state.quests);
    const gameTime = useTimeStore(state => state.gameTime);
    const weather = useTimeStore(state => state.weather);

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const worldRef = useRef<SVGGElement>(null);
    const playerRef = useRef<SVGGElement>(null);
    const headingRef = useRef<SVGPathElement>(null);
    const lightRef = useRef<HTMLDivElement>(null);
    const chunks = useRef(new Map<string, { canvas: HTMLCanvasElement; tilePx: number; sig: string }>());
    const view = useRef({ x: playerPos.x, y: playerPos.y });
    /** Last position the player reached: a step is a glide, anything longer a jump. */
    const lastTarget = useRef({ x: playerPos.x, y: playerPos.y });
    const tween = useRef<{ fromX: number; fromY: number; start: number } | null>(null);
    const facing = useRef(0);
    const frame = useRef(0);

    const [size, setSize] = useState({ width: 0, height: 0 });
    const [deviceScale, setDeviceScale] = useState(1);

    const usedRefuges = useMemo(() => new Set(visitedRefuges.map(p => `${p.x},${p.y}`)), [visitedRefuges]);
    const mapWidth = useMemo(() => Math.max(0, ...map.map(row => row.length)), [map]);
    const mapHeight = map.length;

    // Container size in layout pixels, and how many device pixels each one is
    // worth (the whole game is scaled to the window, then by the screen's DPI).
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const measure = () => {
            const rect = container.getBoundingClientRect();
            const width = container.clientWidth;
            setSize({ width, height: container.clientHeight });
            if (width > 0) setDeviceScale(Math.max(0.5, Math.min(3, (rect.width / width) * (window.devicePixelRatio || 1))));
        };
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        window.addEventListener('resize', measure);
        measure();
        return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
    }, []);

    const tileSize = size.height > 0 ? size.height / zoom : 0;

    /** Top-left tile of the view, clamped to the map. */
    const cameraFor = useCallback((x: number, y: number) => {
        const cols = size.width / tileSize;
        const clamp = (value: number, span: number, total: number) =>
            total <= span ? (total - span) / 2 : Math.max(0, Math.min(value, total - span));
        return { x: clamp(x + 0.5 - cols / 2, cols, mapWidth), y: clamp(y + 0.5 - zoom / 2, zoom, mapHeight), cols };
    }, [size.width, tileSize, zoom, mapWidth, mapHeight]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || tileSize <= 0 || mapHeight === 0) return;
        const pxWidth = Math.round(size.width * deviceScale);
        const pxHeight = Math.round(size.height * deviceScale);
        if (canvas.width !== pxWidth) canvas.width = pxWidth;
        if (canvas.height !== pxHeight) canvas.height = pxHeight;

        const tilePx = tileSize * deviceScale;
        const camera = cameraFor(view.current.x, view.current.y);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = VOID_COLOR;
        ctx.fillRect(0, 0, pxWidth, pxHeight);

        const firstX = Math.floor(camera.x / CHUNK);
        const firstY = Math.floor(camera.y / CHUNK);
        const lastX = Math.floor((camera.x + camera.cols) / CHUNK);
        const lastY = Math.floor((camera.y + zoom) / CHUNK);
        const cache = chunks.current;
        const visible = new Set<string>();
        for (let cy = firstY; cy <= lastY; cy++) {
            for (let cx = firstX; cx <= lastX; cx++) {
                if (cx < 0 || cy < 0 || cx * CHUNK >= mapWidth || cy * CHUNK >= mapHeight) continue;
                const key = `${cx},${cy}`;
                const sig = chunkSignature(cx, cy, usedRefuges);
                let entry = cache.get(key);
                if (!entry || entry.tilePx !== tilePx || entry.sig !== sig) {
                    const side = Math.ceil(CHUNK * tilePx) + 2;
                    const chunkCanvas = entry?.canvas ?? document.createElement('canvas');
                    chunkCanvas.width = side;
                    chunkCanvas.height = side;
                    const chunkCtx = chunkCanvas.getContext('2d');
                    if (!chunkCtx) continue;
                    chunkCtx.setTransform(tilePx, 0, 0, tilePx, -cx * CHUNK * tilePx, -cy * CHUNK * tilePx);
                    drawChunk(chunkCtx, map, cx, cy, usedRefuges, 2 / tilePx);
                    entry = { canvas: chunkCanvas, tilePx, sig };
                }
                // Most recently used last: the oldest chunks are dropped first.
                cache.delete(key);
                cache.set(key, entry);
                visible.add(key);
                ctx.drawImage(entry.canvas, Math.round((cx * CHUNK - camera.x) * tilePx), Math.round((cy * CHUNK - camera.y) * tilePx));
            }
        }
        // Keep the cache within a memory budget: chunks drawn at another size
        // (zoom, resize) go first, then the least recently used; never the visible ones.
        for (const [key, entry] of cache) {
            if (entry.tilePx === tilePx) continue;
            entry.canvas.width = entry.canvas.height = 0;
            cache.delete(key);
        }
        let pixels = 0;
        for (const entry of cache.values()) pixels += entry.canvas.width * entry.canvas.height;
        for (const [key, entry] of cache) {
            if (pixels <= MAX_CACHED_PIXELS) break;
            if (visible.has(key)) continue;
            pixels -= entry.canvas.width * entry.canvas.height;
            entry.canvas.width = entry.canvas.height = 0;
            cache.delete(key);
        }

        worldRef.current?.setAttribute('transform', `translate(${-camera.x * tileSize} ${-camera.y * tileSize}) scale(${tileSize})`);
        playerRef.current?.setAttribute('transform', `translate(${view.current.x + 0.5} ${view.current.y + 0.5})`);
        const light = lightRef.current;
        if (light) {
            light.style.setProperty('--lx', `${(view.current.x + 0.5 - camera.x) * tileSize}px`);
            light.style.setProperty('--ly', `${(view.current.y + 0.5 - camera.y) * tileSize}px`);
        }
    }, [tileSize, size.width, size.height, deviceScale, cameraFor, zoom, map, mapWidth, mapHeight, usedRefuges]);

    // The glide runs across renders: it always calls the latest draw.
    const drawRef = useRef(draw);
    drawRef.current = draw;

    // A different map (new game, load): start from a clean cache.
    useEffect(() => { chunks.current.clear(); }, [map]);

    // Glide toward the player's new position; jumps (loading, teleports) are instant.
    useEffect(() => {
        const dx = playerPos.x - view.current.x;
        const dy = playerPos.y - view.current.y;
        if (dx !== 0 || dy !== 0) {
            facing.current = Math.atan2(dy, dx);
            headingRef.current?.setAttribute('transform', `rotate(${(facing.current * 180) / Math.PI})`);
        }
        // Decided on the step, not on the camera, which lags behind while gliding.
        const jumped = Math.hypot(playerPos.x - lastTarget.current.x, playerPos.y - lastTarget.current.y) > 1.5;
        lastTarget.current = { x: playerPos.x, y: playerPos.y };
        if (dx === 0 && dy === 0) return;
        if (jumped) {
            view.current = { x: playerPos.x, y: playerPos.y };
            tween.current = null;
            drawRef.current();
            return;
        }
        tween.current = { fromX: view.current.x, fromY: view.current.y, start: performance.now() };
        cancelAnimationFrame(frame.current);
        const step = (now: number) => {
            // A frame can be stamped slightly before the step began: never go backwards.
            const t = tween.current ? Math.max(0, Math.min(1, (now - tween.current.start) / MOVE_MS)) : 1;
            const k = easeOut(t);
            if (tween.current) {
                view.current = {
                    x: tween.current.fromX + (playerPos.x - tween.current.fromX) * k,
                    y: tween.current.fromY + (playerPos.y - tween.current.fromY) * k,
                };
            }
            drawRef.current();
            if (t < 1) frame.current = requestAnimationFrame(step);
            else tween.current = null;
        };
        frame.current = requestAnimationFrame(step);
        // A new step mid-glide starts from wherever the camera is now.
        return () => cancelAnimationFrame(frame.current);
    }, [playerPos.x, playerPos.y]);

    useEffect(() => { draw(); }, [draw]);

    // --- Markers -------------------------------------------------------------

    const markers = useMemo((): Marker[] => {
        const list: Marker[] = [];
        getActiveQuestMarkers(activeQuests).forEach(({ pos, type, id }) => list.push({
            id: `q-${id}`, pos, tone: type === 'MAIN' ? 'ember' : 'gold', icon: type === 'MAIN' ? 'star' : 'alert',
            name: quests[id]?.title ?? (type === 'MAIN' ? 'Missione principale' : 'Missione'), pulse: type === 'MAIN', priority: type === 'MAIN' ? 100 : 80,
        }));
        pois.forEach(poi => {
            if (poi.revealed && poi.marker !== false && !poi.consumed) {
                list.push({ id: `p-${poi.id}`, pos: { x: poi.x, y: poi.y }, tone: 'violet', icon: 'diamond', name: poi.name, priority: 55 });
            }
        });
        if (wanderingTrader) list.push({ id: 'trader', pos: wanderingTrader.position, tone: 'sage', icon: 'coins', name: 'Commerciante', priority: 75 });
        return list;
    }, [activeQuests, quests, pois, wanderingTrader]);

    const landmarks = useMemo((): Marker[] => {
        const list: Marker[] = [];
        map.forEach((row, y) => row.forEach((tile, x) => {
            const landmark = LANDMARKS[tile];
            if (landmark) list.push({ id: `l-${tile}`, pos: { x, y }, ...landmark });
        }));
        return list;
    }, [map]);

    /** Off-screen targets, grouped by the edge they are past (up to three per edge). */
    const indicators = useMemo(() => {
        if (tileSize <= 0) return null;
        const camera = cameraFor(playerPos.x, playerPos.y);
        const sides: Record<'north' | 'south' | 'east' | 'west', (Marker & { angle: number; distance: number })[]> = { north: [], south: [], east: [], west: [] };
        for (const marker of [...markers, ...landmarks]) {
            const { x, y } = marker.pos;
            if (x >= camera.x && x < camera.x + camera.cols - 0.5 && y >= camera.y && y < camera.y + zoom - 0.5) continue;
            const dx = x - playerPos.x;
            const dy = y - playerPos.y;
            const side = Math.abs(dx) / camera.cols > Math.abs(dy) / zoom ? (dx > 0 ? 'east' : 'west') : (dy > 0 ? 'south' : 'north');
            sides[side].push({ ...marker, angle: Math.atan2(dy, dx), distance: Math.round(Math.hypot(dx, dy)) });
        }
        for (const side of Object.values(sides)) side.sort((a, b) => b.priority - a.priority || a.distance - b.distance).splice(3);
        return sides;
    }, [markers, landmarks, playerPos.x, playerPos.y, cameraFor, tileSize, zoom]);

    // --- Light and weather --------------------------------------------------

    const now = toAbsoluteMinutes(gameTime);
    const hasLight = lightUntil > now;
    const light = lightAt(gameTime.hour + gameTime.minute / 60);
    const lightRadius = (hasLight ? 4.2 : 2.2) * tileSize;

    const renderIndicator = (item: Marker & { angle: number; distance: number }) => (
        <div key={item.id} className="flex items-center gap-2 rounded-full border border-line2 py-1 pl-1.5 pr-3.5 text-[16px] text-ink shadow-lg" style={{ background: 'rgb(var(--c-bg1) / 0.82)', backdropFilter: 'blur(8px)' }}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: toneColor(item.tone), color: '#14161b' }}>
                <Icon name={item.icon} size={14} strokeWidth={2.4} />
            </span>
            <span className="max-w-[190px] truncate">{item.name}</span>
            <span className="tnum font-cond font-semibold text-ink3">{item.distance}</span>
            <Icon name="arrowRight" size={15} strokeWidth={2.2} className="text-ink2" style={{ transform: `rotate(${item.angle}rad)` }} />
        </div>
    );

    return (
        <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${paused ? 'paused' : ''}`} style={{ background: VOID_COLOR }}>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            {/* Hour of the day: multiplied over the land, with a pool of light around the player. */}
            <div
                ref={lightRef}
                className="pointer-events-none absolute inset-0"
                style={{
                    mixBlendMode: 'multiply',
                    transition: 'background 1.2s ease',
                    background: light.darkness > 0.05
                        ? `radial-gradient(circle ${lightRadius}px at var(--lx, 50%) var(--ly, 50%), ${hasLight ? '#fff1d6' : '#fffaf2'} 0%, ${light.tint} 100%), ${light.tint}`
                        : light.tint,
                }}
            />
            <WeatherLayer type={weather.type} />

            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <radialGradient id="map-player-halo">
                        <stop offset="0" stopColor="rgb(var(--c-ember))" stopOpacity="0.45" />
                        <stop offset="1" stopColor="rgb(var(--c-ember))" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <g ref={worldRef}>
                    {markers.map(marker => <Pin key={marker.id} marker={marker} />)}
                    <g ref={playerRef}>
                        <circle r="1.2" fill="url(#map-player-halo)" />
                        <circle className="map-pulse" r="0.42" fill="none" stroke="rgb(var(--c-ember))" strokeWidth="0.05" />
                        <circle r="0.3" fill="#f4ede0" stroke="rgb(var(--c-ember))" strokeWidth="0.09" />
                        <path ref={headingRef} d="M0.12 0L-0.08 -0.11L-0.08 0.11Z" fill="rgb(var(--c-ember))" />
                    </g>
                </g>
            </svg>

            {/* Inner frame: the map sinks into the card. */}
            <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 80px 10px rgba(5,6,9,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)' }} />

            {indicators && (
                <>
                    {indicators.north.length > 0 && <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-2">{indicators.north.map(renderIndicator)}</div>}
                    {indicators.south.length > 0 && <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">{indicators.south.map(renderIndicator)}</div>}
                    {indicators.east.length > 0 && <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-end gap-2">{indicators.east.map(renderIndicator)}</div>}
                    {indicators.west.length > 0 && <div className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col items-start gap-2">{indicators.west.map(renderIndicator)}</div>}
                </>
            )}

        </div>
    );
};

/**
 * A tile of short slanted rain streaks that repeats without seams: streaks
 * crossing an edge are drawn again on the opposite side.
 */
const rainTile = (width: number, height: number, count: number, length: number, alpha: number, seed: number) => {
    const rng = createRng(seed);
    let path = '';
    for (let i = 0; i < count; i++) {
        const x = Math.round(rng() * width);
        const y = Math.round(rng() * height);
        const len = Math.round(length * (0.6 + rng() * 0.6));
        for (const ox of [-width, 0, width]) {
            for (const oy of [-height, 0, height]) path += `M${x + ox} ${y + oy}l${-Math.round(len / 4)} ${len}`;
        }
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><path d='${path}' stroke='rgba(200,220,235,${alpha})' stroke-width='1.2' stroke-linecap='round'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const RAIN = `${rainTile(120, 600, 38, 46, 0.24, 7)}, ${rainTile(60, 300, 10, 32, 0.14, 8)}`;
const STORM = `${rainTile(120, 600, 80, 60, 0.32, 9)}, ${rainTile(60, 300, 16, 40, 0.16, 10)}`;

/** Rain, storm, fog and cloud shadows over the map. */
const WeatherLayer: React.FC<{ type: WeatherType }> = ({ type }) => {
    switch (type) {
        case WeatherType.PIOGGIA:
        case WeatherType.TEMPESTA: {
            const storm = type === WeatherType.TEMPESTA;
            return (
                <>
                    <div className="pointer-events-none absolute inset-0" style={{ background: storm ? 'rgba(30,38,52,0.42)' : 'rgba(40,52,66,0.22)', mixBlendMode: 'multiply' }} />
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage: storm ? STORM : RAIN,
                            backgroundSize: '120px 600px, 60px 300px',
                            animation: `rain-fall ${storm ? 0.35 : 0.6}s linear infinite`,
                        }}
                    />
                    {storm && <div className="pointer-events-none absolute inset-0 bg-white" style={{ animation: 'lightning 9s linear infinite', opacity: 0 }} />}
                </>
            );
        }
        case WeatherType.NEBBIA:
            return (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0" style={{ background: 'rgba(196,202,206,0.28)' }} />
                    <div
                        className="absolute -inset-[20%]"
                        style={{
                            background: 'radial-gradient(ellipse 30% 20% at 20% 30%, rgba(220,225,228,0.55), transparent 70%), radial-gradient(ellipse 35% 25% at 75% 60%, rgba(220,225,228,0.5), transparent 70%), radial-gradient(ellipse 25% 18% at 45% 85%, rgba(220,225,228,0.45), transparent 70%)',
                            animation: 'fog-drift 40s ease-in-out infinite alternate',
                        }}
                    />
                </div>
            );
        case WeatherType.NUVOLOSO:
            return (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ mixBlendMode: 'multiply' }}>
                    <div
                        className="absolute -inset-[25%]"
                        style={{
                            background: 'radial-gradient(ellipse 22% 16% at 25% 35%, rgba(60,66,80,0.45), transparent 70%), radial-gradient(ellipse 26% 18% at 70% 65%, rgba(60,66,80,0.4), transparent 70%), radial-gradient(ellipse 18% 14% at 60% 20%, rgba(60,66,80,0.35), transparent 70%)',
                            animation: 'fog-drift 70s linear infinite alternate',
                        }}
                    />
                </div>
            );
        default:
            return null;
    }
};

export default WorldMap;
