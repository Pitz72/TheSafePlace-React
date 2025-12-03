import React, { useEffect, useRef } from 'react';
import { createGameConfig, PhaserGame } from '../game/PhaserGame';

export const GameCanvas: React.FC = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<PhaserGame | null>(null);

    useEffect(() => {
        if (gameContainerRef.current && !gameInstanceRef.current) {
            const config = createGameConfig(gameContainerRef.current.id);
            gameInstanceRef.current = new PhaserGame(config);
        }

        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy();
                gameInstanceRef.current = null;
            }
        };
    }, []);

    return <div id="phaser-game" ref={gameContainerRef} className="w-full h-full" />;
};
