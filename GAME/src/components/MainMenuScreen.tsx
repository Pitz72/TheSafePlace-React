import { useState, useCallback, useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState, JournalEntryType } from '../types';
import { handleLoadGame } from '../services/saveGameService';

type MenuItem = {
  label: string;
  note?: string;
};

const ITEMS: MenuItem[] = [
  { label: 'NUOVA PARTITA' },
  { label: 'CONTINUA' },
  { label: 'CARICA' },
  { label: 'OPZIONI' },
  { label: 'TROFEI' },
  { label: 'ESCI' },
];

const MainMenuScreen: React.FC = () => {
  const [hover, setHover] = useState(0);
  const { setGameState, setMap, startCutscene, addJournalEntry, initializeWanderingTrader } = useGameStore();
  const initCharacter = useCharacterStore((state) => state.initCharacter);

  const lastSaveSlot = localStorage.getItem('tspc_last_save_slot');
  const hasSave = lastSaveSlot !== null;

  const handleSelect = useCallback((index: number) => {
    switch (index) {
      case 0: // Nuova Partita
        setMap();
        initCharacter();
        initializeWanderingTrader();
        startCutscene('CS_OPENING');
        break;
      case 1: // Continua
        if (hasSave) {
          handleLoadGame(parseInt(lastSaveSlot!, 10));
        } else {
          addJournalEntry({ text: 'Nessun salvataggio trovato.', type: JournalEntryType.SYSTEM_ERROR });
        }
        break;
      case 2: // Carica
        setGameState(GameState.LOAD_GAME);
        break;
      case 3: // Opzioni
        setGameState(GameState.OPTIONS_SCREEN);
        break;
      case 4: // Trofei
        setGameState(GameState.TROPHY_SCREEN);
        break;
      case 5: // Esci
        window.close();
        break;
    }
  }, [setGameState, setMap, initCharacter, initializeWanderingTrader, startCutscene, addJournalEntry, hasSave, lastSaveSlot]);

  const handleArrowUp = useCallback(() => setHover((p) => (p > 0 ? p - 1 : ITEMS.length - 1)), []);
  const handleArrowDown = useCallback(() => setHover((p) => (p < ITEMS.length - 1 ? p + 1 : 0)), []);
  const handleEnter = useCallback(() => handleSelect(hover), [handleSelect, hover]);

  const keyMap = useMemo(() => ({
    ArrowUp: handleArrowUp,
    ArrowDown: handleArrowDown,
    Enter: handleEnter,
  }), [handleArrowUp, handleArrowDown, handleEnter]);

  useKeyboardInput(keyMap);

  // Scattered dust particles — static positions seeded by index
  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      w: 1 + (i % 3),
      left: `${(i * 37 + 3) % 100}%`,
      top: `${(i * 23 + 5) % 90}%`,
      opacity: 0.25 + ((i * 7) % 5) / 14,
    }))
  , []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0e1115', overflow: 'hidden' }}>

      {/* Ruined skyline background */}
      <svg
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}
      >
        <defs>
          <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a3340"/>
            <stop offset="55%" stopColor="#3a4654"/>
            <stop offset="100%" stopColor="#1a2028"/>
          </linearGradient>
          <linearGradient id="mmFog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(180,195,210,0.0)"/>
            <stop offset="100%" stopColor="rgba(180,195,210,0.35)"/>
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#mmSky)"/>
        <circle cx="900" cy="220" r="80" fill="#a8b2bc" opacity="0.18"/>
        <g fill="#161a22" opacity="0.95">
          <rect x="0" y="450" width="1280" height="270"/>
          <polygon points="80,450 90,380 110,380 120,450"/>
          <polygon points="150,450 165,400 175,395 185,400 190,450"/>
          <polygon points="220,450 230,360 250,340 280,355 290,450"/>
          <polygon points="320,450 330,420 350,420 360,450"/>
          <polygon points="400,450 420,330 460,310 490,340 500,450"/>
          <polygon points="540,450 555,400 570,380 590,395 600,450"/>
          <polygon points="640,450 655,380 685,350 720,370 735,450"/>
          <polygon points="780,450 800,380 830,360 855,375 870,450"/>
          <polygon points="900,450 920,400 945,380 970,400 985,450"/>
          <polygon points="1020,450 1035,360 1075,340 1110,355 1125,450"/>
          <polygon points="1160,450 1175,400 1200,380 1220,400 1240,450"/>
        </g>
        <line x1="475" y1="335" x2="465" y2="240" stroke="#161a22" strokeWidth="2"/>
        <line x1="450" y1="270" x2="490" y2="280" stroke="#161a22" strokeWidth="1.5"/>
        <rect y="380" width="1280" height="340" fill="url(#mmFog)"/>
      </svg>

      {/* Lone figure silhouette */}
      <svg
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <g fill="#0a0d12" opacity="0.95">
          <path d="M 0 600 L 1280 580 L 1280 720 L 0 720 Z"/>
          <g transform="translate(960 510)">
            <path d="M -8 0 L 8 0 L 6 70 L -6 70 Z"/>
            <ellipse cx="0" cy="-10" rx="9" ry="12"/>
            <path d="M -12 8 L -22 38 L -18 60 L -8 35 Z"/>
            <path d="M 4 6 L 18 28 L 28 18 L 12 -4 Z"/>
            <line x1="22" y1="20" x2="18" y2="-32" stroke="#0a0d12" strokeWidth="2.5"/>
          </g>
        </g>
      </svg>

      {/* Cold dust particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: p.w, height: p.w,
          left: p.left, top: p.top,
          background: 'rgba(220,228,235,0.45)',
          borderRadius: '50%',
          opacity: p.opacity,
          pointerEvents: 'none',
        }}/>
      ))}

      {/* Large title — letterpress */}
      <div style={{ position: 'absolute', left: 80, top: 100, color: 'var(--tsp-paper)' }}>
        <div className="t-sans" style={{ fontSize: 11, letterSpacing: '0.6em', opacity: 0.55, marginBottom: 18 }}>
          UN GIOCO NARRATIVO DI SOPRAVVIVENZA
        </div>
        <div className="t-serif" style={{
          fontSize: 130, lineHeight: 0.86, fontWeight: 500, letterSpacing: '-0.02em',
          textShadow: '0 2px 0 rgba(0,0,0,0.4)',
        }}>
          The Safe<br/>
          <em style={{ fontStyle: 'italic', color: 'var(--tsp-ice-glow)' }}>Place</em>
        </div>
        <div className="t-hand" style={{ fontSize: 28, color: 'var(--tsp-rust)', marginTop: 10, opacity: 0.95 }}>
          se mai esiste.
        </div>
      </div>

      {/* Menu items — lower-left */}
      <div style={{ position: 'absolute', left: 80, bottom: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ITEMS.map((item, i) => {
          const active = hover === i;
          const disabled = i === 1 && !hasSave;
          return (
            <div
              key={item.label}
              onMouseEnter={() => !disabled && setHover(i)}
              onClick={() => !disabled && handleSelect(i)}
              style={{
                display: 'flex', alignItems: 'baseline', gap: 16,
                color: disabled
                  ? 'rgba(216,210,194,0.2)'
                  : active ? 'var(--tsp-paper)' : 'rgba(216,210,194,0.45)',
                cursor: disabled ? 'default' : 'pointer',
                padding: '4px 0',
                transition: 'all 0.2s ease',
                userSelect: 'none',
              }}
            >
              <div style={{
                width: active && !disabled ? 36 : 14,
                height: 1,
                background: active && !disabled ? 'var(--tsp-rust)' : 'rgba(216,210,194,0.4)',
                transition: 'width 0.25s ease',
                flexShrink: 0,
              }}/>
              <div className="t-sans" style={{
                fontSize: 22,
                letterSpacing: active ? '0.32em' : '0.22em',
                fontWeight: active ? 600 : 500,
                transition: 'letter-spacing 0.25s ease',
              }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Last diary entry card — right side */}
      <div style={{
        position: 'absolute', right: 90, top: 140, width: 280, padding: 22,
        background: 'rgba(216,210,194,0.06)',
        border: '1px solid rgba(216,210,194,0.18)',
        backdropFilter: 'blur(6px)',
        color: 'var(--tsp-paper)',
      }}>
        <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.32em', opacity: 0.6, marginBottom: 12 }}>
          ULTIMA VOCE · DIARIO
        </div>
        <div className="t-serif" style={{ fontSize: 15, lineHeight: 1.5, fontStyle: 'italic', color: '#e8eaed' }}>
          "Il primo passo è sempre il più difficile.
          Tutto quello che ho è dentro questo zaino
          e il ricordo di dove devo arrivare."
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(216,210,194,0.55)' }}>
          <span className="t-sans">CAP. I · PARTENZA</span>
          <span className="t-sans">ALBA</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between',
        padding: '0 80px',
      }}>
        <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.4em', color: 'rgba(216,210,194,0.45)' }}>
          ↑ ↓ NAVIGA   ·   ↵ SELEZIONA   ·   CLICK
        </div>
        <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.4em', color: 'rgba(216,210,194,0.45)' }}>
          v3.0.0 · "DIARIO" REMASTER
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;
