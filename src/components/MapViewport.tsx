import React, { useState, useEffect, useMemo } from 'react';
import { useWorldStore } from '../stores/world/worldStore';
import { shallow } from 'zustand/shallow';

interface MapViewportProps {
  className?: string;
  viewportWidth: number;
  viewportHeight: number;
}

const TILE_COLORS: Record<string, string> = {
  '.': '#60BF77', 'F': '#336940', 'M': 'rgb(101, 67, 33)', '~': '#008888',
  'V': 'rgb(205, 133, 63)', 'C': 'rgb(192, 192, 192)', 'R': '#ffff00',
  'S': '#00ff00', 'E': '#00ff00', ' ': '#336940',
};

const Player: React.FC<{left: number, top: number, charWidth: number, charHeight: number}> = React.memo(({ left, top, charWidth, charHeight }) => (
  <div
    className="absolute pointer-events-none z-10 font-mono leading-none select-none flex items-center justify-center text-phosphor-400 animate-glow"
    style={{
      left: `${left}px`,
      top: `${top}px`,
      width: `${charWidth}px`,
      height: `${charHeight}px`,
      animation: 'player-blink 1.2s ease-in-out infinite'
    }}
  >
    @
  </div>
));

const MapViewport: React.FC<MapViewportProps> = ({ className = '', viewportWidth, viewportHeight }) => {
  const {
    mapData,
    isMapLoading,
    playerPosition,
    cameraPosition,
    updateCameraPosition
  } = useWorldStore(state => ({
    mapData: state.mapData,
    isMapLoading: state.isMapLoading,
    playerPosition: state.playerPosition,
    cameraPosition: state.cameraPosition,
    updateCameraPosition: state.updateCameraPosition
  }), shallow);

  const [blinkState, setBlinkState] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBlinkState(prev => !prev), 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (viewportWidth > 0 && viewportHeight > 0 && !isMapLoading) {
      updateCameraPosition({ width: viewportWidth, height: viewportHeight });
    }
  }, [viewportWidth, viewportHeight, playerPosition, isMapLoading, updateCameraPosition]);

  const CHAR_WIDTH = 25.6;
  const CHAR_HEIGHT = 38.4;

  const { startRow, endRow, startCol, endCol } = useMemo(() => {
    const VISIBLE_ROWS = Math.ceil(viewportHeight / CHAR_HEIGHT) + 2;
    const VISIBLE_COLS = Math.ceil(viewportWidth / CHAR_WIDTH) + 2;
    const sRow = Math.max(0, Math.floor(cameraPosition.y / CHAR_HEIGHT));
    const sCol = Math.max(0, Math.floor(cameraPosition.x / CHAR_WIDTH));
    return {
      startRow: sRow,
      endRow: Math.min(mapData.length, sRow + VISIBLE_ROWS),
      startCol: sCol,
      endCol: Math.min(mapData[0]?.length || 0, sCol + VISIBLE_COLS),
    };
  }, [cameraPosition, viewportHeight, viewportWidth, mapData]);

  const getTileColor = (char: string): string => {
    if (char === 'S' || char === 'E') return blinkState ? '#00ff00' : '#ffff00';
    return TILE_COLORS[char] || '#336940';
  };

  if (isMapLoading || mapData.length === 0) {
    return <div className={`flex items-center justify-center h-full ${className}`}>CARICAMENTO...</div>;
  }

  const playerLeft = (playerPosition.x * CHAR_WIDTH) - cameraPosition.x;
  const playerTop = (playerPosition.y * CHAR_HEIGHT) - cameraPosition.y;

  return (
    <div className={`overflow-hidden relative h-full bg-gray-900 bg-opacity-80 ${className}`}>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', fontSize: '38.4px', lineHeight: '1.2' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, fontFamily: 'monospace' }}>
          {mapData.slice(startRow, endRow).map((row, y) => (
            <div key={startRow + y} style={{ position: 'absolute', top: (startRow + y) * CHAR_HEIGHT, whiteSpace: 'pre' }}>
              {row.slice(startCol, endCol).split('').map((char, x) => (
                <span key={startCol + x} style={{ display: 'inline-block', width: CHAR_WIDTH, height: CHAR_HEIGHT, color: getTileColor(char) }}>
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
        <Player left={playerLeft} top={playerTop} charWidth={CHAR_WIDTH} charHeight={CHAR_HEIGHT} />
      </div>
    </div>
  );
};

export default MapViewport;