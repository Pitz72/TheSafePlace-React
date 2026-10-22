import React, { useState, useCallback, useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { MENU_ITEMS, GAME_VERSION } from '../constants';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { audioManager } from '../utils/audio';
import { handleLoadGame } from '../services/saveGameService';
import { startNewGame } from '../services/newGameService';
import { quitGame } from '../utils/desktop';
import { lastSaveSlot } from '../utils/saveFormat';
import KeyArt from './art/KeyArt';
import Logo from './art/Logo';
import KeyHints from './ui/KeyHints';
import { TRAVELLER_FIGURE } from '../assets/art';

/** One line under the menu about the highlighted entry. */
const DESCRIPTIONS: Record<string, string> = {
    'Nuova Partita': 'Il viaggio di Ultimo comincia.',
    'Continua Partita': "Riprendi dall'ultimo salvataggio.",
    'Carica Partita': 'Scegli uno dei cinque slot, o importa un file.',
    'Storia': 'Come è cominciato tutto.',
    'Istruzioni': 'Le regole della sopravvivenza.',
    'Opzioni': 'Schermo, audio e visualizzazione.',
    'Trofei': 'I traguardi raccolti in tutte le partite.',
    'Esci': 'Chiudi il gioco.',
};

const MainMenuScreen: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [message, setMessage] = useState<string | null>(null);
    const setGameState = useGameStore(state => state.setGameState);

    const navigate = useCallback((direction: number) => {
        setMessage(null);
        setSelectedIndex(prev => (prev + direction + MENU_ITEMS.length) % MENU_ITEMS.length);
        audioManager.playSound('navigate');
    }, []);

    const activate = useCallback((index: number) => {
        audioManager.playSound('confirm');
        switch (MENU_ITEMS[index]) {
            case 'Nuova Partita':
                startNewGame();
                break;
            case 'Continua Partita': {
                const lastSlot = lastSaveSlot();
                if (!lastSlot) setMessage('Nessun salvataggio da continuare.');
                else if (!handleLoadGame(lastSlot)) setMessage(`Impossibile caricare l'ultimo salvataggio (slot ${lastSlot}).`);
                break;
            }
            case 'Carica Partita': setGameState(GameState.LOAD_GAME); break;
            case 'Istruzioni': setGameState(GameState.INSTRUCTIONS_SCREEN); break;
            case 'Storia': setGameState(GameState.STORY_SCREEN); break;
            case 'Opzioni': setGameState(GameState.OPTIONS_SCREEN); break;
            case 'Trofei': setGameState(GameState.TROPHY_SCREEN); break;
            case 'Esci':
                if (!quitGame()) setMessage('Per uscire chiudi la scheda del browser.');
                break;
        }
    }, [setGameState]);

    const handlerMap = useMemo(() => ({
        ArrowUp: () => navigate(-1), w: () => navigate(-1),
        ArrowDown: () => navigate(1), s: () => navigate(1),
        Enter: () => activate(selectedIndex),
    }), [navigate, activate, selectedIndex]);

    useKeyboardInput(handlerMap);

    const selected = MENU_ITEMS[selectedIndex];

    return (
        <div className="relative h-full w-full overflow-hidden">
            <KeyArt variant="dusk" shade="left" figure={TRAVELLER_FIGURE} />

            <div className="relative flex h-full flex-col px-[120px] pb-14 pt-[110px]">
                <Logo className="anim-fade-up" />
                <p className="prose-story mt-6 text-[22px] italic text-ink3 anim-fade-up" style={{ animationDelay: '120ms' }}>
                    Un gioco di ruolo di Simone Pizzi
                </p>

                <nav className="mt-14 flex w-[520px] flex-col anim-fade-up" style={{ animationDelay: '240ms' }}>
                    {MENU_ITEMS.map((item, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <button
                                key={item}
                                type="button"
                                tabIndex={-1}
                                onMouseEnter={() => { if (!isSelected) { setSelectedIndex(index); setMessage(null); } }}
                                onClick={() => activate(index)}
                                className="group flex h-[52px] items-center text-left outline-none"
                            >
                                <span className={`mr-4 h-[2px] bg-ember transition-all duration-300 ${isSelected ? 'w-10 opacity-100' : 'w-3 opacity-30'}`} />
                                <span
                                    className={`font-cond text-[29px] font-semibold uppercase transition-all duration-300 ${isSelected ? 'translate-x-1 text-ink' : 'text-ink2/70 group-hover:text-ink2'}`}
                                    style={{ letterSpacing: '0.16em', textShadow: isSelected ? '0 0 30px rgb(var(--c-ember) / 0.45)' : undefined }}
                                >
                                    {item}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-5 h-16 pl-14">
                    {message
                        ? <p className="text-[21px] text-ember anim-fade-in">{message}</p>
                        : <p key={selected} className="prose-story text-[20px] italic text-ink3 anim-fade-in">{DESCRIPTIONS[selected]}</p>}
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <p className="text-[16px] leading-relaxed text-ink3">
                        <span className="font-cond font-semibold tracking-[0.2em] text-ink2">v{GAME_VERSION}</span>
                        <span className="mx-3 text-ink4">·</span>
                        © 2025 Runtime Radio
                        <span className="mx-3 text-ink4">·</span>
                        realizzato con il supporto di un LLM
                    </p>
                    <KeyHints hints={[{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }]} />
                </div>
            </div>
        </div>
    );
};

export default MainMenuScreen;
