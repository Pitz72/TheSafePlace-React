import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../stores/world/worldStore';
import { useSettingsStore } from '../stores/settingsStore';

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

/**
 * MapViewport Component - SISTEMA CAMERA COMPLETAMENTE RISOLTO
 *
 * Questo componente utilizza un approccio di rendering completo con CSS transform
 * per garantire scrolling fluido e preciso della camera.
 *
 * ✅ RISOLTO: Camera segue fluidamente il personaggio senza salti o sparizioni
 * ✅ OTTIMIZZATO: Rendering completo della mappa con transform invece di riposizionamento
 * ✅ STABILE: Key stabili e nessun flickering durante il movimento
 *
 * NON MODIFICARE QUESTO CODICE - Il sistema è ottimizzato e funzionante.
 */
const MapViewport: React.FC<MapViewportProps> = ({ className = '', viewportWidth, viewportHeight }) => {
  const mapData = useWorldStore(state => state.mapData);
  const isMapLoading = useWorldStore(state => state.isMapLoading);
  const playerPosition = useWorldStore(state => state.playerPosition);
  const cameraPosition = useWorldStore(state => state.cameraPosition);
  const updateCameraPosition = useWorldStore(state => state.updateCameraPosition);
  const settingsStore = useSettingsStore();

  const [blinkState, setBlinkState] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBlinkState(prev => !prev), 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (viewportWidth > 0 && viewportHeight > 0 && !isMapLoading) {
      updateCameraPosition({ width: viewportWidth, height: viewportHeight });
    }
  }, [viewportWidth, viewportHeight, playerPosition.x, playerPosition.y, isMapLoading, updateCameraPosition]);

  const CHAR_WIDTH = 25.6;
  const CHAR_HEIGHT = 38.4;


  const getTileColor = (char: string): string => {
    // Se il tema è high-contrast, usa solo bianco
    if (settingsStore.videoMode === 'high-contrast') {
      return '#ffffff';
    }
    
    // Altrimenti usa i colori normali
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
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            fontFamily: 'monospace',
            transform: `translate(${-cameraPosition.x}px, ${-cameraPosition.y}px)`
          }}
        >
          {mapData.map((row, y) => (
            <div key={`row-${y}`} style={{ height: CHAR_HEIGHT, whiteSpace: 'pre' }}>
              {row.split('').map((char, x) => (
                <span key={`tile-${y}-${x}`} style={{ display: 'inline-block', width: CHAR_WIDTH, height: CHAR_HEIGHT, color: getTileColor(char) }}>
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