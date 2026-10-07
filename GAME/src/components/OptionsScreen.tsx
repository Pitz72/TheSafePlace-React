import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, VisualTheme } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { isFullScreen, setFullScreen } from '../utils/desktop';

type OptionId = 'fullscreen' | 'audio' | 'volume' | 'display';

type OptionRow =
  | { type: 'header'; label: string }
  | { type: 'spacer' }
  | { type: 'option'; id: OptionId; label: string; kind: 'multiple'; values: string[] }
  | { type: 'option'; id: OptionId; label: string; kind: 'slider'; max: number };

const THEMES: VisualTheme[] = ['standard', 'crt', 'high_contrast'];

const OPTIONS_CONFIG: readonly OptionRow[] = [
  { type: 'header', label: 'Schermo' },
  { type: 'option', id: 'fullscreen', label: 'Modalità', kind: 'multiple', values: ['Schermo intero', 'Finestra'] },
  { type: 'spacer' },
  { type: 'header', label: 'Audio' },
  { type: 'option', id: 'audio', label: 'Suono', kind: 'multiple', values: ['On', 'Off'] },
  { type: 'option', id: 'volume', label: 'Volume', kind: 'slider', max: 10 },
  { type: 'spacer' },
  { type: 'header', label: 'Video' },
  { type: 'option', id: 'display', label: 'Visualizzazione', kind: 'multiple', values: ['Standard', 'CRT Fosfori Verdi', 'Alto Contrasto'] },
];

const SELECTABLE_ROWS = OPTIONS_CONFIG.map((row, index) => (row.type === 'option' ? index : -1)).filter(i => i >= 0);

const VolumeBar: React.FC<{ level: number, max: number }> = ({ level, max }) => (
  <span className="font-mono">{`[${'█'.repeat(level)}${'░'.repeat(Math.max(0, max - level))}]`}</span>
);

const OptionsScreen: React.FC = () => {
  const setGameState = useGameStore(state => state.setGameState);
  const previousGameState = useGameStore(state => state.previousGameState);
  const visualTheme = useGameStore(state => state.visualTheme);
  const setVisualTheme = useGameStore(state => state.setVisualTheme);

  const [settings, setSettings] = useState<Record<OptionId, number>>({
    fullscreen: 1,
    audio: audioManager.getIsMutedForUI() ? 1 : 0,
    volume: audioManager.getVolumeForUI(),
    display: Math.max(0, THEMES.indexOf(visualTheme)),
  });
  const [selected, setSelected] = useState(0);
  // Where we came from: the pause menu returns there, the main menu otherwise.
  const [returnState] = useState(previousGameState === GameState.PAUSE_MENU ? GameState.PAUSE_MENU : GameState.MAIN_MENU);

  // Show the real window state (it can also change with F11 / the OS).
  useEffect(() => {
    let cancelled = false;
    const sync = () => isFullScreen().then(full => { if (!cancelled) setSettings(s => ({ ...s, fullscreen: full ? 0 : 1 })); });
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => { cancelled = true; document.removeEventListener('fullscreenchange', sync); };
  }, []);

  const apply = useCallback((id: OptionId, value: number) => {
    switch (id) {
      case 'fullscreen':
        setFullScreen(value === 0).then(full => setSettings(s => ({ ...s, fullscreen: full ? 0 : 1 })));
        break;
      case 'audio':
        audioManager.setMuted(value === 1);
        break;
      case 'volume':
        audioManager.setVolume(value);
        break;
      case 'display':
        setVisualTheme(THEMES[value]);
        break;
    }
  }, [setVisualTheme]);

  const move = useCallback((delta: number) => {
    setSelected(prev => (prev + delta + SELECTABLE_ROWS.length) % SELECTABLE_ROWS.length);
    audioManager.playSound('navigate');
  }, []);

  const change = useCallback((delta: number) => {
    const row = OPTIONS_CONFIG[SELECTABLE_ROWS[selected]];
    if (row.type !== 'option') return;
    const current = settings[row.id];
    const next = row.kind === 'multiple'
      ? (current + delta + row.values.length) % row.values.length
      : Math.max(0, Math.min(row.max, current + delta));
    setSettings(s => ({ ...s, [row.id]: next }));
    apply(row.id, next);
    audioManager.playSound('navigate');
  }, [selected, settings, apply]);

  const exit = useCallback(() => {
    audioManager.playSound('cancel');
    setGameState(returnState);
  }, [setGameState, returnState]);

  const handlerMap = useMemo(() => ({
    ArrowUp: () => move(-1), w: () => move(-1),
    ArrowDown: () => move(1), s: () => move(1),
    ArrowLeft: () => change(-1), a: () => change(-1),
    ArrowRight: () => change(1), d: () => change(1),
    Enter: () => change(1),
    Escape: exit,
  }), [move, change, exit]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl md:text-6xl mb-2 text-center">═══ IMPOSTAZIONI ═══</h1>
      <p className="text-2xl md:text-3xl mb-8 text-center text-[var(--text-secondary)]">Le impostazioni vengono salvate automaticamente</p>
      <div className="w-full max-w-4xl text-3xl space-y-3">
        {OPTIONS_CONFIG.map((row, index) => {
          if (row.type === 'header') return <h2 key={index} className="text-4xl pt-4">{row.label}</h2>;
          if (row.type === 'spacer') return <div key={index} className="h-4" />;
          const isSelected = SELECTABLE_ROWS[selected] === index;
          return (
            <div key={row.id} className={`flex justify-between items-center transition-colors duration-100 px-2 ${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''}`}>
              <span>{row.label}:</span>
              <span>{row.kind === 'multiple' ? `< ${row.values[settings[row.id]]} >` : <VolumeBar level={settings.volume} max={row.max} />}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-auto text-2xl md:text-3xl text-center">
        [W/S/↑↓] Muovi | [A/D/←→] Cambia | [ESC] Torna Indietro
      </div>
    </div>
  );
};

export default OptionsScreen;
