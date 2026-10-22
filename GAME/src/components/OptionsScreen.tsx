import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, VisualTheme } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { isFullScreen, setFullScreen } from '../utils/desktop';
import Modal from './ui/Modal';
import Icon, { IconName } from './ui/Icon';

type OptionId = 'fullscreen' | 'audio' | 'volume' | 'display';

type OptionRow =
  | { type: 'header'; label: string }
  | { type: 'option'; id: OptionId; label: string; icon: IconName; kind: 'multiple'; values: string[] }
  | { type: 'option'; id: OptionId; label: string; icon: IconName; kind: 'slider'; max: number };

const THEMES: VisualTheme[] = ['standard', 'high_contrast'];

const OPTIONS_CONFIG: readonly OptionRow[] = [
  { type: 'header', label: 'Schermo' },
  { type: 'option', id: 'fullscreen', label: 'Modalità', icon: 'monitor', kind: 'multiple', values: ['Schermo intero', 'Finestra'] },
  { type: 'header', label: 'Audio' },
  { type: 'option', id: 'audio', label: 'Suono', icon: 'sound', kind: 'multiple', values: ['Attivo', 'Disattivo'] },
  { type: 'option', id: 'volume', label: 'Volume', icon: 'music', kind: 'slider', max: 10 },
  { type: 'header', label: 'Visualizzazione' },
  { type: 'option', id: 'display', label: 'Tema', icon: 'eye', kind: 'multiple', values: ['Crepuscolo', 'Alto contrasto'] },
];

const SELECTABLE_ROWS = OPTIONS_CONFIG.map((row, index) => (row.type === 'option' ? index : -1)).filter(i => i >= 0);

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
    <Modal
      backdrop={returnState === GameState.PAUSE_MENU ? 'blur' : 'soft'}
      eyebrow="Impostazioni"
      icon="sliders"
      title="Opzioni"
      subtitle="Le impostazioni vengono salvate automaticamente."
      size="md"
      hints={[{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['←→'], label: 'Cambia' }, { keys: ['ESC'], label: 'Indietro' }]}
    >
      <div className="px-12 pb-10">
        {OPTIONS_CONFIG.map((row, index) => {
          if (row.type === 'header') {
            return <h2 key={index} className="eyebrow mb-3 mt-7 first:mt-0">{row.label}</h2>;
          }
          const isSelected = SELECTABLE_ROWS[selected] === index;
          const value = settings[row.id];
          return (
            <div key={row.id} className={`choice mb-1.5 !py-4 text-[23px] ${isSelected ? 'is-selected' : ''}`}>
              <Icon name={row.icon} size={24} className={isSelected ? 'text-accent' : 'text-ink3'} />
              <span className="flex-1">{row.label}</span>
              {row.kind === 'multiple' ? (
                <div className="flex rounded-full border border-line2 bg-bg0/40 p-1">
                  {row.values.map((label, i) => (
                    <span
                      key={label}
                      className={`rounded-full px-5 py-1.5 text-[19px] transition-colors ${i === value ? 'bg-ink text-bg0 font-semibold' : 'text-ink3'}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-end gap-1.5">
                    {Array.from({ length: row.max }, (_, i) => (
                      <span key={i} className={`w-2.5 rounded-sm transition-colors ${i < value ? 'bg-ember' : 'bg-ink4/40'}`} style={{ height: 10 + i * 2 }} />
                    ))}
                  </div>
                  <span className="w-8 text-right font-cond text-[22px] font-semibold tnum">{value}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default OptionsScreen;
