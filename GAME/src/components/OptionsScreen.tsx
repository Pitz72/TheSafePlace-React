import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, VisualTheme } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';

type OptionKind = 'multiple' | 'slider';

type OptionRow = {
  type: 'option' | 'header' | 'spacer';
  id?: 'language' | 'fullscreen' | 'audio' | 'volume' | 'display';
  label?: string;
  values?: string[];
  kind?: OptionKind;
  max?: number;
};

const OPTIONS_CONFIG: readonly OptionRow[] = [
  { type: 'header', label: 'Gioco' },
  { type: 'option', id: 'language', label: 'Lingua', kind: 'multiple', values: ['Italiano', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo', 'Portoghese', 'Russo', 'Cinese Semplificato'] },
  { type: 'option', id: 'fullscreen', label: 'Schermo', kind: 'multiple', values: ['Fullscreen', 'Finestra'] },
  { type: 'spacer' },
  { type: 'header', label: 'Audio' },
  { type: 'option', id: 'audio', label: 'Suono', kind: 'multiple', values: ['On', 'Off'] },
  { type: 'option', id: 'volume', label: 'Volume', kind: 'slider', max: 10 },
  { type: 'spacer' },
  { type: 'header', label: 'Video' },
  { type: 'option', id: 'display', label: 'Visualizzazione', kind: 'multiple', values: ['Standard', 'CRT Fosfori Verdi', 'Alto Contrasto'] },
];

const firstSelectableRow = OPTIONS_CONFIG.findIndex(opt => opt.type === 'option');

/**
 * VolumeBar component.
 * This component renders a volume bar.
 * @param {object} props - The props for the component.
 * @param {number} props.level - The current volume level.
 * @param {number} props.max - The maximum volume level.
 * @returns {JSX.Element} The rendered VolumeBar component.
 */
const VolumeBar: React.FC<{ level: number, max: number }> = ({ level, max }) => {
  const filled = '█';
  const empty = '░';
  let bar = '';
  for (let i = 0; i < max; i++) {
    bar += i < level ? filled : empty;
  }
  return <span className="font-mono">{`[${bar}]`}</span>;
};

/**
 * OptionsScreen component.
 * This component renders the options screen.
 * @returns {JSX.Element} The rendered OptionsScreen component.
 */

const OptionsScreen: React.FC = () => {
    const setGameState = useGameStore((state) => state.setGameState);
    const previousGameState = useGameStore((state) => state.previousGameState);
    const visualTheme = useGameStore(state => state.visualTheme);
    const setVisualTheme = useGameStore(state => state.setVisualTheme);
    
    const themeMap: VisualTheme[] = ['standard', 'crt', 'high_contrast'];

    const [settings, setSettings] = useState({
        language: 0,
        fullscreen: 0,
        audio: audioManager.getIsMutedForUI() ? 1 : 0, // 0 = On, 1 = Off
        volume: audioManager.getVolumeForUI(),
        display: themeMap.indexOf(visualTheme),
    });
    const [selectedRow, setSelectedRow] = useState(firstSelectableRow);
    
    // Effetti per sincronizzare lo stato della UI con l'AudioManager
    useEffect(() => {
        audioManager.setMuted(settings.audio === 1);
    }, [settings.audio]);

    useEffect(() => {
        audioManager.setVolume(settings.volume);
    }, [settings.volume]);
    
    // Sincronizza lo stato globale del tema con la selezione locale
    useEffect(() => {
        const newTheme = themeMap[settings.display];
        if (newTheme && newTheme !== visualTheme) {
            setVisualTheme(newTheme);
        }
    }, [settings.display, setVisualTheme, visualTheme, themeMap]);


    const handleArrowUp = useCallback(() => {
      setSelectedRow(currentRow => {
          let nextRow = currentRow - 1;
          while (nextRow >= 0 && OPTIONS_CONFIG[nextRow].type !== 'option') {
              nextRow--;
          }
          if (nextRow < 0) { // Wrap around from top
             let lastRow = OPTIONS_CONFIG.length - 1;
             while(lastRow >= 0 && OPTIONS_CONFIG[lastRow].type !== 'option') {
                lastRow--;
             }
             return lastRow;
          }
          return nextRow;
      });
      audioManager.playSound('navigate');
    }, []);

    const handleArrowDown = useCallback(() => {
        setSelectedRow(currentRow => {
            let nextRow = currentRow + 1;
            while (nextRow < OPTIONS_CONFIG.length && OPTIONS_CONFIG[nextRow].type !== 'option') {
                nextRow++;
            }
            return nextRow >= OPTIONS_CONFIG.length ? firstSelectableRow : nextRow;
        });
        audioManager.playSound('navigate');
    }, []);

    const handleChangeOption = useCallback((direction: 'left' | 'right') => {
        const option = OPTIONS_CONFIG[selectedRow];
        if (option.type !== 'option' || !option.id) return;
        
        const delta = direction === 'left' ? -1 : 1;

        setSettings(currentSettings => {
            const newSettings = { ...currentSettings };
            const key = option.id as keyof typeof settings;

            if (option.kind === 'multiple' && option.values) {
                const values = option.values;
                // @ts-ignore
                const currentIndex = newSettings[key];
                const newIndex = (currentIndex + delta + values.length) % values.length;
                 // @ts-ignore
                newSettings[key] = newIndex;
                
                // Handle fullscreen toggle
                if (key === 'fullscreen') {
                    if (newIndex === 0) { // Fullscreen
                        document.documentElement.requestFullscreen().catch(err => {
                            console.log('Fullscreen request failed:', err);
                        });
                    } else { // Finestra
                        if (document.fullscreenElement) {
                            document.exitFullscreen().catch(err => {
                                console.log('Exit fullscreen failed:', err);
                            });
                        }
                    }
                }
            } else if (option.kind === 'slider' && option.max) {
                 // @ts-ignore
                const currentValue = newSettings[key];
                const newValue = Math.max(0, Math.min(option.max, currentValue + delta));
                 // @ts-ignore
                newSettings[key] = newValue;
            }
            return newSettings;
        });
        audioManager.playSound('navigate');
    }, [selectedRow]);

    const handleArrowLeft = useCallback(() => handleChangeOption('left'), [handleChangeOption]);
    const handleArrowRight = useCallback(() => handleChangeOption('right'), [handleChangeOption]);
    
    const handleExit = useCallback(() => {
        audioManager.playSound('cancel');
        // Se proveniamo dal menu di pausa, torniamo lì. Altrimenti, al menu principale.
        if (previousGameState === GameState.PAUSE_MENU) {
            setGameState(GameState.PAUSE_MENU);
        } else {
            setGameState(GameState.MAIN_MENU);
        }
    }, [setGameState, previousGameState]);

    const handlerMap = useMemo(() => ({
        ArrowUp: handleArrowUp,
        w: handleArrowUp,
        ArrowDown: handleArrowDown,
        s: handleArrowDown,
        ArrowLeft: handleArrowLeft,
        a: handleArrowLeft,
        ArrowRight: handleArrowRight,
        d: handleArrowRight,
        Escape: handleExit,
    }), [handleArrowUp, handleArrowDown, handleArrowLeft, handleArrowRight, handleExit]);

    useKeyboardInput(handlerMap);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl md:text-6xl mb-2 text-center">═══ IMPOSTAZIONI ═══</h1>
            <p className="text-2xl md:text-3xl mb-8 text-center text-[var(--text-secondary)]">Configura le opzioni di gioco</p>
            
            <div className="w-full max-w-4xl text-3xl space-y-3">
              {OPTIONS_CONFIG.map((row, index) => {
                const isSelected = index === selectedRow;
                const optionStyle = `transition-colors duration-100 px-2 ${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''}`;

                if (row.type === 'header') {
                  return <h2 key={index} className="text-4xl pt-4">{row.label}</h2>;
                }
                if (row.type === 'spacer') {
                  return <div key={index} className="h-4" />;
                }
                if (row.type === 'option' && row.id && row.label) {
                  let valueDisplay;
                  const key = row.id as keyof typeof settings;
                  if (row.kind === 'multiple' && row.values) {
                    valueDisplay = `< ${row.values[settings[key]]} >`;
                  } else if (row.kind === 'slider' && row.max) {
                    valueDisplay = <VolumeBar level={settings.volume} max={row.max} />;
                  }

                  return (
                    <div key={row.id} className={`flex justify-between items-center ${optionStyle}`}>
                      <span>{row.label}:</span>
                      <span>{valueDisplay}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="mt-auto text-2xl md:text-3xl text-center">
                [W/S/↑↓] Muovi | [A/D/←→] Cambia | [ESC] Torna Indietro
            </div>
        </div>
    );
};

export default OptionsScreen;