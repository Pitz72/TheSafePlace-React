import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { TILESET_SRC, TILE_MAP, TILE_SIZE as BASE_TILE_SIZE } from '../assets/tileset';
import { getActiveQuestMarkers } from '../services/questService';

const CanvasMap: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const map = useGameStore((state) => state.map);
    const playerPos = useGameStore((state) => state.playerPos);
    const wanderingTrader = useGameStore((state) => state.wanderingTrader);
    const activeQuests = useCharacterStore((state) => state.activeQuests);
    // FIX: Initialized useRef with 'undefined' as the starting value, as required when a generic type is provided.
    const renderMapRef = useRef<(() => void) | undefined>(undefined);

    const [tilesetImage, setTilesetImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setTilesetImage(img);
        };
        img.onerror = (error) => {
            console.error('Failed to load tileset:', error);
        };
        img.src = TILESET_SRC;
    }, []);

    // The render function now reads canvas dimensions directly from the ref.
    const renderMap = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx || !tilesetImage || !map.length || canvas.width === 0 || canvas.height === 0) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000'; // Black background for any uncovered areas
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        const { width: viewportWidth, height: viewportHeight } = canvas; // Read from canvas directly
        const mapHeight = map.length;
        const mapWidth = map[0].length;

        // --- Viewport and Camera Logic ---
        const viewportTilesVertical = 25;
        const tileSize = viewportHeight / viewportTilesVertical;
        const viewportTilesHorizontal = viewportWidth / tileSize;

        let cameraX = playerPos.x - (viewportTilesHorizontal / 2);
        let cameraY = playerPos.y - (viewportTilesVertical / 2);

        cameraX = Math.max(0, Math.min(cameraX, mapWidth - viewportTilesHorizontal));
        cameraY = Math.max(0, Math.min(cameraY, mapHeight - viewportTilesVertical));

        const startCol = Math.floor(cameraX);
        const endCol = Math.ceil(cameraX + viewportTilesHorizontal);
        const startRow = Math.floor(cameraY);
        const endRow = Math.ceil(cameraY + viewportTilesVertical);

        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
                    const char = map[y][x];
                    const tile = TILE_MAP[char] || TILE_MAP['.'];
                    const screenX = Math.round((x - cameraX) * tileSize);
                    const screenY = Math.round((y - cameraY) * tileSize);
                    ctx.drawImage(
                        tilesetImage,
                        tile.x, tile.y,
                        BASE_TILE_SIZE, BASE_TILE_SIZE,
                        screenX, screenY, 
                        Math.ceil(tileSize), Math.ceil(tileSize)
                    );
                }
            }
        }
        
        // Render quest markers (after terrain, before player)
        const questMarkers = getActiveQuestMarkers();
        questMarkers.forEach(marker => {
            const { pos, type } = marker;
            
            // Only render if marker is in viewport
            if (pos.x >= startCol && pos.x < endCol &&
                pos.y >= startRow && pos.y < endRow) {
                
                // Choose marker tile based on quest type
                const markerTileKey = type === 'MAIN' ? '!M' : '!S';
                const markerTile = TILE_MAP[markerTileKey];
                
                const screenX = Math.round((pos.x - cameraX) * tileSize);
                const screenY = Math.round((pos.y - cameraY) * tileSize);
                
                ctx.drawImage(
                    tilesetImage,
                    markerTile.x, markerTile.y,
                    BASE_TILE_SIZE, BASE_TILE_SIZE,
                    screenX, screenY,
                    Math.ceil(tileSize), Math.ceil(tileSize)
                );
            }
        });
        
        // Render Wandering Trader (v1.6.0) - after markers, before player
        if (wanderingTrader) {
            const { position } = wanderingTrader;
            
            // Only render if trader is in viewport
            if (position.x >= startCol && position.x < endCol &&
                position.y >= startRow && position.y < endRow) {
                
                const traderTile = TILE_MAP['T'];
                const screenX = Math.round((position.x - cameraX) * tileSize);
                const screenY = Math.round((position.y - cameraY) * tileSize);
                
                ctx.drawImage(
                    tilesetImage,
                    traderTile.x, traderTile.y,
                    BASE_TILE_SIZE, BASE_TILE_SIZE,
                    screenX, screenY,
                    Math.ceil(tileSize), Math.ceil(tileSize)
                );
            }
        }
        
        // Render player (always on top)
        const playerScreenX = Math.round((playerPos.x - cameraX) * tileSize);
        const playerScreenY = Math.round((playerPos.y - cameraY) * tileSize);
        const playerTile = TILE_MAP['@'];
        
        ctx.drawImage(
            tilesetImage,
            playerTile.x, playerTile.y,
            BASE_TILE_SIZE, BASE_TILE_SIZE,
            playerScreenX, playerScreenY, 
            Math.ceil(tileSize), Math.ceil(tileSize)
        );

    }, [map, playerPos, wanderingTrader, activeQuests, tilesetImage]);
    
    // Store the latest renderMap function in a ref
    useEffect(() => {
        renderMapRef.current = renderMap;
    }, [renderMap]);

    // This effect handles resizing without triggering React state updates.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        if (!container) return;
        
        const resizeObserver = new ResizeObserver(entries => {
            // Defer this logic to the next animation frame to avoid resize loops.
            window.requestAnimationFrame(() => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    const roundedWidth = Math.round(width);
                    const roundedHeight = Math.round(height);
                    if (canvas.width !== roundedWidth || canvas.height !== roundedHeight) {
                        canvas.width = roundedWidth;
                        canvas.height = roundedHeight;
                    }
                }
            });
        });
        
        resizeObserver.observe(container);

        // Disconnect observer on cleanup.
        return () => {
            resizeObserver.disconnect();
        }
    }, []);

    // This effect runs the animation loop, but it's set up only once.
    useEffect(() => {
        let animationFrameId: number;
        const renderLoop = () => {
            if (renderMapRef.current) {
                renderMapRef.current();
            }
            animationFrameId = requestAnimationFrame(renderLoop);
        };
        animationFrameId = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, []); // Empty dependency array ensures this effect runs only once.


    return (
        <div className="w-full h-full bg-black">
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default CanvasMap;