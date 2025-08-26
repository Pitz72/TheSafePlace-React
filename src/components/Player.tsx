import React from 'react';
import { useGameStore } from '../stores/gameStore';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className = '' }) => {
  const playerPosition = useGameStore(state => state.playerPosition);
  const mapData = useGameStore(state => state.mapData);
  const cameraPosition = useGameStore(state => state.cameraPosition);

  if (playerPosition.x === -1 || playerPosition.y === -1 || mapData.length === 0) {
    return null;
  }

  const CHAR_WIDTH = 25.6;
  const CHAR_HEIGHT = 38.4;

  const left = (playerPosition.x * CHAR_WIDTH) - cameraPosition.x;
  const top = (playerPosition.y * CHAR_HEIGHT) - cameraPosition.y;

  return (
    <div 
      className={`absolute pointer-events-none z-50 font-mono leading-none select-none text-phosphor-400 glow-phosphor-bright text-shadow-phosphor-bright animate-glow ${className}`} 
      style={{ 
        left: `${left}px`, 
        top: `${top}px`, 
        width: `${CHAR_WIDTH}px`, 
        height: `${CHAR_HEIGHT}px`, 
        fontSize: '38.4px', 
        lineHeight: '1.2', 
        animation: 'player-blink 1.2s ease-in-out infinite' 
      }} 
    > 
      @ 
    </div>
  );
};

export default Player;