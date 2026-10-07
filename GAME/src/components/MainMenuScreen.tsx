import React, { useState, useCallback, useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { MENU_ITEMS, GAME_VERSION } from '../constants';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState } from '../types';
import { audioManager } from '../utils/audio';
import { handleLoadGame } from '../services/saveGameService';
import { questService } from '../services/questService';
import { quitGame } from '../utils/desktop';
import { storage } from '../utils/saveFormat';

export const MAIN_QUEST_ID = 'MQ_THE_ECHO_OF_THE_JOURNEY';
const LAST_SAVE_SLOT_KEY = 'tspc_last_save_slot';

/** Fresh world, fresh character, the main quest, then the opening. */
export function startNewGame() {
    const game = useGameStore.getState();
    game.setMap();
    useCharacterStore.getState().initCharacter();
    questService.startQuest(MAIN_QUEST_ID);
    game.initializeWanderingTrader();
    game.startCutscene('CS_OPENING');
}

const MainMenuScreen: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [message, setMessage] = useState<string | null>(null);
    const setGameState = useGameStore(state => state.setGameState);

    const navigate = useCallback((direction: number) => {
        setMessage(null);
        setSelectedIndex(prev => (prev + direction + MENU_ITEMS.length) % MENU_ITEMS.length);
        audioManager.playSound('navigate');
    }, []);

    const confirm = useCallback(() => {
        audioManager.playSound('confirm');
        switch (MENU_ITEMS[selectedIndex]) {
            case 'Nuova Partita':
                startNewGame();
                break;
            case 'Continua Partita': {
                const lastSlot = Number(storage.get(LAST_SAVE_SLOT_KEY));
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
    }, [selectedIndex, setGameState]);

    const handlerMap = useMemo(() => ({
        ArrowUp: () => navigate(-1), w: () => navigate(-1),
        ArrowDown: () => navigate(1), s: () => navigate(1),
        Enter: confirm,
    }), [navigate, confirm]);

    useKeyboardInput(handlerMap);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <div className="mb-20 text-[var(--text-primary)]" style={{ textShadow: '0 0 8px var(--shadow-primary)' }}>
                <h2 className="text-4xl tracking-widest">THE SAFE PLACE CHRONICLES</h2>
                <h1 className="text-9xl font-black leading-none">THE ECHO</h1>
                <p className="text-2xl leading-none -mt-4">OF THE</p>
                <h1 className="text-9xl font-black leading-none -mt-4">JOURNEY</h1>
                <p className="text-4xl mt-6">Un GDR di Simone Pizzi</p>
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl space-y-2">
                {MENU_ITEMS.map((item, index) => (
                    <div key={item} className={`px-4 py-1 transition-colors duration-100 ${index === selectedIndex ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : 'bg-transparent text-[var(--text-primary)]'}`}>
                        {item}
                    </div>
                ))}
            </div>
            <p className="h-12 mt-6 text-3xl text-[var(--text-accent)]">{message}</p>
            <div className="mt-auto pb-4">
                <p className="text-xl text-[var(--text-primary)]/70">
                    v{GAME_VERSION} — (C) 2025 Runtime Radio - gioco di ispirazione retrocomputazionale realizzato tramite supporto LLM
                </p>
            </div>
        </div>
    );
};

export default MainMenuScreen;
