import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../hooks/useGameContext';

interface MapViewportProps {
  className?: string;
}

// Dev-only logger
const IS_DEV = import.meta.env.MODE === 'development';
const dbg = (...args: any[]) => {
  if (IS_DEV) console.debug('[MapViewport]', ...args);
};

// Mappatura caratteri mappa -> colori specifici
const TILE_COLORS: Record<string, string> = {
  '.': '#60BF77',                  // Pianura - terreno normale
  'F': '#336940',                  // Foreste - aree boscose
  'M': 'rgb(101, 67, 33)',         // Montagne - marrone scuro
  '~': '#008888',                  // Corsi d'acqua - fiumi
  'V': 'rgb(205, 133, 63)',        // Villaggi - piccoli centri abitati
  'C': 'rgb(192, 192, 192)',       // Città - grigio più chiaro
  'R': '#ffff00',                  // Rifugi - Giallo acceso
  'S': '#00ff00',                  // Start - punto di partenza (lampeggiante)
  'E': '#00ff00',                  // End - The Safe Place (lampeggiante)
  '@': '#4EA162',                  // Player - giocatore (futuro)
  ' ': '#336940',                  // Spazio - verde scuro
};

// Colori lampeggianti per S ed E
const BLINKING_COLORS = {
  primary: '#00ff00',
  secondary: '#ffff00'
};

const MapViewport: React.FC<MapViewportProps> = ({ className = '' }) => {
  // Integrazione con GameContext per camera dinamica
  const { mapData, isMapLoading, playerPosition, cameraPosition, updateCameraPosition } = useGameContext();
  
  // Stati locali per viewport
  const [error] = useState<string | null>(null);
  
  // Viewport virtualization - dimensioni viewport
  const [viewportWidth, setViewportWidth] = useState(800);
  const [viewportHeight, setViewportHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Cache dimensioni per evitare update ripetuti
  const lastSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  // Cache dipendenze per capire cosa innesca l'update camera
  const lastDepsRef = useRef<{ w: number; h: number; px: number; py: number }>({ w: 0, h: 0, px: -1, py: -1 });
  
  // Configurazione rendering - AUMENTATO DEL 100% PER MAGGIORE SFIDA
  const CHAR_WIDTH = 25.6; // Larghezza carattere in pixel (8 * 3.2 = +220%)
  const CHAR_HEIGHT = 38.4; // Altezza carattere in pixel (12 * 3.2 = +220%)
  const VISIBLE_COLS = Math.ceil(viewportWidth / CHAR_WIDTH) + 2; // +2 per buffer
  const VISIBLE_ROWS = Math.ceil(viewportHeight / CHAR_HEIGHT) + 2; // +2 per buffer

  useEffect(() => {
    dbg('init metrics', { CHAR_WIDTH, CHAR_HEIGHT });
  }, []);

  // Aggiorna dimensioni viewport in modo stabile (senza ref callback che cambia ogni render)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (lastSizeRef.current.w !== w || lastSizeRef.current.h !== h) {
        dbg('resize observed', { from: { ...lastSizeRef.current }, to: { w, h } });
      }
      if (lastSizeRef.current.w !== w) setViewportWidth(w);
      if (lastSizeRef.current.h !== h) setViewportHeight(h);
      lastSizeRef.current = { w, h };
    };

    // Primo calcolo immediato
    updateSize();

    // Osserva cambiamenti reali di dimensione del contenitore
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, []);

  // Aggiornamento camera quando cambiano le dimensioni del viewport o la posizione del player
  useEffect(() => {
    if (viewportWidth > 0 && viewportHeight > 0 && !isMapLoading) {
      const w = Math.round(viewportWidth);
      const h = Math.round(viewportHeight);
      const causes: string[] = [];
      if (lastDepsRef.current.w !== viewportWidth) causes.push('viewportWidth');
      if (lastDepsRef.current.h !== viewportHeight) causes.push('viewportHeight');
      if (lastDepsRef.current.px !== playerPosition.x) causes.push('playerX');
      if (lastDepsRef.current.py !== playerPosition.y) causes.push('playerY');

      dbg('updateCameraPosition()', {
        raw: { width: viewportWidth, height: viewportHeight },
        rounded: { width: w, height: h },
        playerPosition,
        cameraPosition,
        causes
      });

      updateCameraPosition({ width: w, height: h });
      lastDepsRef.current = { w: viewportWidth, h: viewportHeight, px: playerPosition.x, py: playerPosition.y };
    }
  }, [viewportWidth, viewportHeight, playerPosition, isMapLoading, updateCameraPosition]);

  // Stato per effetto lampeggiante
  const [blinkState, setBlinkState] = useState(true);
  
  // Effetto lampeggiante per S ed E
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkState(prev => !prev);
    }, 1000); // Lampeggia ogni secondo
    
    return () => clearInterval(interval);
  }, []);
  
  // Funzione per ottenere il colore di un carattere
  const getTileColor = (char: string): string => {
    // Effetto lampeggiante per S ed E
    if (char === 'S' || char === 'E') {
      return blinkState ? BLINKING_COLORS.primary : BLINKING_COLORS.secondary;
    }
    
    return TILE_COLORS[char] || '#336940'; // Default verde scuro
  };

  // Rendering stati di caricamento ed errore
  if (isMapLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className} crt-screen scan-lines`}>
        <div className="text-phosphor-primary animate-pulse glow-phosphor-primary">
          <div className="text-center">
            <div className="text-lg mb-2 font-mono tracking-wider text-shadow-phosphor-bright animate-glow">⚡ CARICAMENTO MAPPA ⚡</div>
            <div className="text-sm text-phosphor-dim font-mono animate-pulse">Inizializzazione sistema cartografico...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className} crt-screen scan-lines`}>
        <div className="text-phosphor-danger text-center glow-phosphor-danger">
          <div className="text-lg mb-2 font-mono tracking-wider text-shadow-phosphor-danger animate-glow">⚠ ERRORE MAPPA ⚠</div>
          <div className="text-sm text-phosphor-dim font-mono">{error}</div>
          <div className="text-xs text-phosphor-dim mt-2 font-mono animate-pulse">
            Verificare presenza file /public/map.txt
          </div>
        </div>
      </div>
    );
  }

  if (mapData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className} crt-screen scan-lines`}>
        <div className="text-yellow-400 text-center glow-phosphor-bright">
          <div className="text-lg mb-2 font-mono tracking-wider text-shadow-phosphor-bright animate-glow">⚠ MAPPA VUOTA ⚠</div>
          <div className="text-sm text-phosphor-dim font-mono animate-pulse">Nessun dato cartografico disponibile</div>
        </div>
      </div>
    );
  }

  // Calcolo viewport virtualization usando camera dinamica
  const startRow = Math.max(0, Math.floor(cameraPosition.y / CHAR_HEIGHT));
  const endRow = Math.min(mapData.length, startRow + VISIBLE_ROWS);
  const startCol = Math.max(0, Math.floor(cameraPosition.x / CHAR_WIDTH));
  const endCol = Math.min(150, startCol + VISIBLE_COLS); // 150 = larghezza mappa

  useEffect(() => {
    dbg('cameraPosition changed', {
      cameraPosition,
      window: { startRow, endRow, startCol, endCol },
      visible: { cols: VISIBLE_COLS, rows: VISIBLE_ROWS }
    });
  }, [cameraPosition, VISIBLE_COLS, VISIBLE_ROWS, startRow, endRow, startCol, endCol]);
  
  // Rendering principale mappa con viewport virtualization
  return (
    <div 
      className={`overflow-hidden relative h-full bg-gray-900 bg-opacity-80 border border-phosphor-bright crt-screen scan-lines animate-crt-flicker glow-phosphor-dim ${className}`}
      ref={containerRef}
    >
      <style>{`
        .map-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Container mappa con scroll programmato */}
      <div 
        className="relative font-mono leading-none select-none w-full h-full overflow-hidden max-h-full bg-transparent"
         style={{
           fontSize: '38.4px',
           lineHeight: '1.2',
           scrollbarWidth: 'none',
           msOverflowStyle: 'none'
         }}
      >
        {/* Rendering solo righe visibili (viewport virtualization) */}
        <div
          style={{
            position: 'absolute',
            top: -cameraPosition.y,
            left: -cameraPosition.x,
            width: `${150 * CHAR_WIDTH}px`, // Larghezza totale mappa
            height: `${mapData.length * CHAR_HEIGHT}px`, // Altezza totale mappa
            pointerEvents: 'none' // Evita interferenze con scroll
          }}
        >
          {mapData.slice(startRow, endRow).map((row, virtualRowIndex) => {
            const actualRowIndex = startRow + virtualRowIndex;
            return (
              <div 
                key={actualRowIndex} 
                className="absolute whitespace-pre"
                style={{
                  top: `${actualRowIndex * CHAR_HEIGHT}px`,
                  left: 0,
                  height: `${CHAR_HEIGHT}px`
                }}
              >
                {/* Rendering solo caratteri visibili */}
                {row.slice(startCol, endCol).split('').map((char, virtualColIndex) => {
                  const actualColIndex = startCol + virtualColIndex;
                  return (
                    <span 
                      key={`${actualRowIndex}-${actualColIndex}`}
                      className="absolute inline-block font-mono"
                      title={`(${actualColIndex}, ${actualRowIndex}): ${char}`}
                      style={{
                        left: `${actualColIndex * CHAR_WIDTH}px`,
                        width: `${CHAR_WIDTH}px`,
                        height: `${CHAR_HEIGHT}px`,
                        color: getTileColor(char)
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Info debug con viewport virtualization */}
      <div className="absolute bottom-2 right-2 text-xs text-phosphor-dim bg-gray-800 bg-opacity-90 border border-phosphor-bright px-2 py-1 rounded opacity-75 font-mono glow-phosphor-dim animate-pulse">
        <div>Viewport: {viewportWidth}x{viewportHeight}</div>
        <div>Visibili: {VISIBLE_COLS}x{VISIBLE_ROWS}</div>
        <div>Rendering: {(endRow - startRow) * (endCol - startCol)} elementi</div>
        <div>Totale mappa: {mapData.length}x{mapData[0]?.length || 0}</div>
        <div>Riduzione: {Math.round(((endRow - startRow) * (endCol - startCol)) / (mapData.length * 150) * 100)}%</div>
      </div>
    </div>
  );
};

export default MapViewport;