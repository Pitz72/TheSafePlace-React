import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';

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

const MapViewport: React.FC<MapViewportProps> = ({ className = '', viewportWidth, viewportHeight }) => {
  const mapData = useGameStore(state => state.mapData);
  const isMapLoading = useGameStore(state => state.isMapLoading);
  const playerPosition = useGameStore(state => state.playerPosition);
  const cameraPosition = useGameStore(state => state.cameraPosition);
  const updateCameraPosition = useGameStore(state => state.updateCameraPosition);

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

  return (
    <div className={`overflow-hidden relative h-full bg-gray-900 bg-opacity-80 ${className}`}>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -cameraPosition.y, left: -cameraPosition.x }}>
          {mapData.slice(startRow, endRow).map((row, y) => (
            <div key={startRow + y} style={{ position: 'absolute', top: (startRow + y) * CHAR_HEIGHT, whiteSpace: 'pre' }}>
              {row.slice(startCol, endCol).split('').map((char, x) => (
                <span key={startCol + x} style={{ position: 'absolute', left: (startCol + x) * CHAR_WIDTH, color: getTileColor(char) }}>
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapViewport;