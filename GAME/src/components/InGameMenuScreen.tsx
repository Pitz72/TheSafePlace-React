import React, { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';

const MENU_ITEMS = ['Continua', 'Salva Partita', 'Carica Partita', 'Opzioni', 'Menu Principale'] as const;

const InGameMenuScreen: React.FC = () => {
    const gameState = useGameStore(state => state.gameState);
    const setGameState = useGameStore(state => state.setGameState);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [confirmQuit, setConfirmQuit] = useState(false);

    const navigate = useCallback((direction: number) => {
        setSelectedIndex(prev => (prev + direction + MENU_ITEMS.length) % MENU_ITEMS.length);
        audioManager.playSound('navigate');
    }, []);

    const confirm = useCallback(() => {
        audioManager.playSound('confirm');
        switch (MENU_ITEMS[selectedIndex]) {
            case 'Continua': setGameState(GameState.IN_GAME); break;
            case 'Salva Partita': setGameState(GameState.SAVE_GAME); break;
            case 'Carica Partita': setGameState(GameState.LOAD_GAME); break;
            case 'Opzioni': setGameState(GameState.OPTIONS_SCREEN); break;
            case 'Menu Principale': setConfirmQuit(true); break;
        }
    }, [selectedIndex, setGameState]);

    const handlerMap = useMemo((): KeyHandlerMap => {
        if (gameState !== GameState.PAUSE_MENU) return {};
        if (confirmQuit) {
            return {
                Enter: () => setGameState(GameState.MAIN_MENU),
                Escape: () => { setConfirmQuit(false); audioManager.playSound('cancel'); },
            };
        }
        return {
            w: () => navigate(-1), ArrowUp: () => navigate(-1),
            s: () => navigate(1), ArrowDown: () => navigate(1),
            Enter: confirm,
            Escape: () => { audioManager.playSound('cancel'); setGameState(GameState.IN_GAME); },
        };
    }, [gameState, confirmQuit, navigate, confirm, setGameState]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl border-8 border-double border-[var(--border-primary)] flex flex-col p-6 bg-[var(--bg-primary)]">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-8">═══ PAUSA ═══</h1>
                {confirmQuit ? (
                    <div className="text-center space-y-8">
                        <p className="text-4xl">Tornare al menu principale?</p>
                        <p className="text-3xl text-[var(--text-accent)]">I progressi non salvati andranno persi.</p>
                    </div>
                ) : (
                    <div className="w-full max-w-lg mx-auto text-4xl space-y-3">
                        {MENU_ITEMS.map((option, index) => (
                            <div key={option} className={`pl-4 py-1 transition-colors duration-100 ${index === selectedIndex ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : 'bg-transparent'}`}>
                                {index === selectedIndex && '> '}{option}
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-[var(--border-primary)] pt-4">
                    {confirmQuit ? '[INVIO] Sì, esci | [ESC] No' : '[W/S / ↑↓] Seleziona | [INVIO] Conferma | [ESC] Continua'}
                </div>
            </div>
        </div>
    );
};

export default InGameMenuScreen;
