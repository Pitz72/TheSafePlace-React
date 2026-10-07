import React, { useCallback, useMemo, useState } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { GameState, JournalEntryType } from '../types';
import { narrativeService } from '../services/NarrativeService';
import { tradingService } from '../services/tradingService';
import { audioManager } from '../utils/audio';

const REST_HOURS = 8;

const OPTIONS = [
    'Parla con Marcus (il mercante)',
    'Parla con Anya (la tecnica)',
    'Parla con Silas (il cacciatore)',
    'Commercia con Marcus',
    `Riposa in un luogo sicuro (${REST_HOURS} ore)`,
    "Lascia l'Avamposto",
] as const;

/** "Il Crocevia": the outpost hub with its NPCs, trade and a safe place to sleep. */
const OutpostScreen: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const setGameState = useGameStore(state => state.setGameState);

    const navigate = useCallback((direction: number) => {
        setActionMessage(null);
        setSelectedIndex(prev => (prev + direction + OPTIONS.length) % OPTIONS.length);
        audioManager.playSound('navigate');
    }, []);

    const leave = useCallback(() => {
        useGameStore.getState().addJournalEntry({ text: "Lasci l'Avamposto e torni nel mondo ostile.", type: JournalEntryType.NARRATIVE });
        audioManager.playSound('cancel');
        setGameState(GameState.IN_GAME);
    }, [setGameState]);

    const rest = useCallback(() => {
        const { addJournalEntry } = useGameStore.getState();
        const minutes = REST_HOURS * 60;
        const before = useCharacterStore.getState();
        const { satietyCost, hydrationCost } = before.calculateSurvivalCost(minutes);
        const fed = before.satiety.current >= satietyCost && before.hydration.current >= hydrationCost;
        addJournalEntry({ text: "Ti sistemi in un angolo tranquillo dell'avamposto e ti addormenti...", type: JournalEntryType.NARRATIVE });
        useTimeStore.getState().advanceTime(minutes, true);
        const character = useCharacterStore.getState();
        if (character.hp.current <= 0) return;
        const healAmount = Math.floor(character.hp.max * (fed ? 0.75 : 0.3));
        character.heal(healAmount);
        character.rest(fed ? 50 : 25);
        const text = fed
            ? `Hai riposato per ${REST_HOURS} ore: +${healAmount} HP e molta meno stanchezza.`
            : `Hai dormito a stomaco vuoto: solo +${healAmount} HP. Mangia e bevi prima di riposare.`;
        setActionMessage(text);
        addJournalEntry({ text, type: fed ? JournalEntryType.SKILL_CHECK_SUCCESS : JournalEntryType.SYSTEM_WARNING });
    }, []);

    const confirm = useCallback(() => {
        audioManager.playSound('confirm');
        switch (selectedIndex) {
            case 0: narrativeService.startDialogue('marcus_main', GameState.OUTPOST); break;
            case 1: narrativeService.startDialogue('anya_main', GameState.OUTPOST); break;
            case 2: narrativeService.startDialogue('silas_main', GameState.OUTPOST); break;
            case 3: tradingService.startTradingSession('marcus', GameState.OUTPOST); break;
            case 4: rest(); break;
            case 5: leave(); break;
        }
    }, [selectedIndex, rest, leave]);

    const handlerMap = useMemo(() => ({
        w: () => navigate(-1), ArrowUp: () => navigate(-1),
        s: () => navigate(1), ArrowDown: () => navigate(1),
        Enter: confirm,
        Escape: leave,
    }), [navigate, confirm, leave]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl border-8 border-double border-amber-600/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6 text-amber-500">═══ IL CROCEVIA ═══</h1>
                <p className="text-2xl text-center text-amber-400/80 mb-6 px-4 leading-relaxed">
                    Non è molto: un pugno di container arrugginiti e tende rattoppate disposte in cerchio attorno a un fuoco
                    fumante. Eppure è il primo luogo da settimane che odora di umanità e non di decadenza.
                </p>
                {actionMessage && (
                    <div className="text-3xl text-center text-yellow-400 mb-6 p-4 border border-yellow-400/50 bg-yellow-400/10">{actionMessage}</div>
                )}
                <div className="w-full max-w-2xl mx-auto text-3xl space-y-2 mb-6">
                    {OPTIONS.map((option, index) => (
                        <div key={option} className={`pl-4 py-1 ${index === selectedIndex ? 'bg-amber-500 text-black' : 'bg-transparent text-amber-400'}`}>
                            {index === selectedIndex && '> '}{option}
                        </div>
                    ))}
                </div>
                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-amber-600/50 pt-4">
                    [W/S / ↑↓] Seleziona | [INVIO] Conferma | [ESC] Esci
                </div>
            </div>
        </div>
    );
};

export default OutpostScreen;
