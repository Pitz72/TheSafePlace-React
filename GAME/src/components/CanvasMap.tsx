import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { TILESET_SRC, TILE_MAP, TILE_SIZE as BASE_TILE_SIZE } from '../assets/tileset_ultima';
import { getActiveQuestMarkers } from '../services/questService';

const VIEWPORT_TILES_VERTICAL = 25;

/**
 * World map around the player. Redrawn only when something on it changes
 * (position, markers, size), not on every animation frame.
 */
const CanvasMap: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const map = useGameStore(state => state.map);
    const playerPos = useGameStore(state => state.playerPos);
    const wanderingTrader = useGameStore(state => state.wanderingTrader);
    const pois = useGameStore(state => state.pois);
    const visitedRefuges = useGameStore(state => state.visitedRefuges);
    const activeQuests = useCharacterStore(state => state.activeQuests);
    const [tileset, setTileset] = useState<HTMLImageElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const img = new Image();
        img.onload = () => setTileset(img);
        img.onerror = error => console.error('Failed to load tileset:', error);
        img.src = TILESET_SRC;
    }, []);

    useEffect(() => {
        const container = canvasRef.current?.parentElement;
        if (!container) return;
        const observer = new ResizeObserver(entries => {
            const rect = entries[0]?.contentRect;
            if (rect) setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !tileset || map.length === 0 || size.width === 0 || size.height === 0) return;
        if (canvas.width !== size.width) canvas.width = size.width;
        if (canvas.height !== size.height) canvas.height = size.height;

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const tileSize = canvas.height / VIEWPORT_TILES_VERTICAL;
        const tilesHorizontal = canvas.width / tileSize;
        const mapHeight = map.length;
        const mapWidth = Math.max(...map.map(row => row.length));
        const cameraX = Math.max(0, Math.min(playerPos.x - tilesHorizontal / 2, mapWidth - tilesHorizontal));
        const cameraY = Math.max(0, Math.min(playerPos.y - VIEWPORT_TILES_VERTICAL / 2, mapHeight - VIEWPORT_TILES_VERTICAL));
        const startCol = Math.floor(cameraX);
        const endCol = Math.ceil(cameraX + tilesHorizontal);
        const startRow = Math.floor(cameraY);
        const endRow = Math.ceil(cameraY + VIEWPORT_TILES_VERTICAL);
        const inView = (x: number, y: number) => x >= startCol && x < endCol && y >= startRow && y < endRow;

        const draw = (key: string, x: number, y: number) => {
            const tile = TILE_MAP[key] ?? TILE_MAP['.'];
            ctx.drawImage(
                tileset, tile.x, tile.y, BASE_TILE_SIZE, BASE_TILE_SIZE,
                Math.round((x - cameraX) * tileSize), Math.round((y - cameraY) * tileSize),
                Math.ceil(tileSize), Math.ceil(tileSize),
            );
        };

        const usedRefuges = new Set(visitedRefuges.map(p => `${p.x},${p.y}`));
        for (let y = Math.max(0, startRow); y < Math.min(endRow, mapHeight); y++) {
            for (let x = Math.max(0, startCol); x < Math.min(endCol, map[y].length); x++) {
                const char = map[y][x];
                draw(char === 'R' && usedRefuges.has(`${x},${y}`) ? 'R_USED' : char, x, y);
            }
        }
        // Places the player knows about that have no tile of their own.
        pois.forEach(poi => {
            if (poi.revealed && poi.marker !== false && !poi.consumed && inView(poi.x, poi.y)) draw('POI', poi.x, poi.y);
        });
        getActiveQuestMarkers().forEach(({ pos, type }) => {
            if (inView(pos.x, pos.y)) draw(type === 'MAIN' ? '!M' : '!S', pos.x, pos.y);
        });
        if (wanderingTrader && inView(wanderingTrader.position.x, wanderingTrader.position.y)) {
            draw('T', wanderingTrader.position.x, wanderingTrader.position.y);
        }
        draw('@', playerPos.x, playerPos.y);
    }, [map, playerPos, wanderingTrader, pois, visitedRefuges, activeQuests, tileset, size]);

    return (
        <div className="w-full h-full bg-black">
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default CanvasMap;
