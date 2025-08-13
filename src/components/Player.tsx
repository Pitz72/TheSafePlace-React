import React from 'react';
import { useGameContext } from '../hooks/useGameContext';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className = '' }) => {
  const { playerPosition, mapData, cameraPosition } = useGameContext();
  
  // Non renderizzare se la posizione non è valida
  if (playerPosition.x === -1 || playerPosition.y === -1 || mapData.length === 0) {
    return null;
  }
  
  // Configurazione rendering - deve corrispondere a MapViewport
  const CHAR_WIDTH = 25.6; // Larghezza carattere in pixel
  const CHAR_HEIGHT = 38.4; // Altezza carattere in pixel
  
  // Calcola la posizione del giocatore relativa alla camera
  const left = (playerPosition.x * CHAR_WIDTH) - cameraPosition.x;
  const top = (playerPosition.y * CHAR_HEIGHT) - cameraPosition.y;
  
  return (
    <div
      className={`absolute pointer-events-none z-50 font-mono leading-none select-none flex items-center justify-center ${className}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${CHAR_WIDTH}px`,
        height: `${CHAR_HEIGHT}px`,
        fontSize: '38.4px',
        lineHeight: '1.2'
      }}
    >
      <span 
        className="text-phosphor-400 glow-phosphor-bright text-shadow-phosphor-bright animate-glow"
        style={{
          animation: 'player-blink 1.2s ease-in-out infinite'
        }}
      >
        @
      </span>
    </div>
  );
};

export default Player;