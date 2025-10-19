import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { getSaveSlots, handleSaveGame, handleLoadGame, SaveSlot } from '../src/services/saveGameService';

const NUM_SLOTS = 3;

/**
 * SaveLoadScreen component.
 * This component renders the save/load screen.
 * @param {object} props - The props for the component.
 * @param {'save' | 'load'} props.mode - The mode of the screen ('save' or 'load').
 * @returns {JSX.Element} The rendered SaveLoadScreen component.
 */
const SaveLoadScreen: React.FC<{ mode: 'save' | 'load' }> = ({ mode }) => {
    const { setGameState } = useGameStore();
    const previousGameState = useGameStore(state => state.previousGameState);
    const [slots, setSlots] = useState<SaveSlot[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const refreshSlots = useCallback(() => {
        setSlots(getSaveSlots());
    }, []);

    useEffect(() => {
        refreshSlots();
    }, [refreshSlots]);

    const handleNavigate = useCallback((direction: number) => {
        setFeedbackMessage(null);
        setSelectedIndex(prev => (prev + direction + (NUM_SLOTS + 1)) % (NUM_SLOTS + 1));
    }, []);

    const goBack = useCallback(() => {
        if (previousGameState === GameState.PAUSE_MENU) {
            setGameState(GameState.PAUSE_MENU);
        } else {
            setGameState(GameState.MAIN_MENU);
        }
    }, [previousGameState, setGameState]);

    const handleConfirm = useCallback(() => {
        setFeedbackMessage(null);
        if (selectedIndex < NUM_SLOTS) { // One of the slots is selected
            const slotNumber = selectedIndex + 1;
            if (mode === 'save') {
                if (handleSaveGame(slotNumber)) {
                    setFeedbackMessage(`Partita salvata nello slot ${slotNumber}.`);
                    refreshSlots();
                } else {
                    setFeedbackMessage('Errore durante il salvataggio.');
                }
            } else { // mode === 'load'
                if (!slots[selectedIndex].isEmpty) {
                    handleLoadGame(slotNumber);
                    // On success, the game state will change and this component will unmount
                } else {
                    setFeedbackMessage('Questo slot è vuoto.');
                }
            }
        } else { // "Torna Indietro"
            goBack();
        }
    }, [selectedIndex, mode, slots, goBack, refreshSlots]);

    const handlerMap = useMemo(() => ({
        'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
        's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
        'Enter': handleConfirm,
        'Escape': goBack
    }), [handleNavigate, handleConfirm, goBack]);

    useKeyboardInput(handlerMap);

    const title = mode === 'save' ? 'SALVA PARTITA' : 'CARICA PARTITA';

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-4xl border-8 border-double border-[var(--border-primary)] flex flex-col p-6 bg-[var(--bg-primary)]">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ {title} ═══</h1>

                {feedbackMessage && <p className="text-3xl text-center text-[var(--text-accent)] mb-4">{feedbackMessage}</p>}
                
                <div className="w-full flex-grow text-4xl space-y-3">
                    {slots.map((slot, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <div key={index} className={`pl-4 py-2 transition-colors duration-100 ${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : 'border border-[var(--border-primary)]'}`}>
                                <div className="flex justify-between">
                                    <span>{isSelected && '> '}{slot.label.startsWith('Slot') ? slot.label : `Slot ${slot.slot}`}</span>
                                    {!slot.label.startsWith('Slot') && (
                                        <span className={isSelected ? '' : 'text-[var(--text-secondary)]/80'}>
                                            {slot.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div className={`mt-6 pl-4 py-2 ${selectedIndex === NUM_SLOTS ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''}`}>
                        {selectedIndex === NUM_SLOTS && '> '}Torna Indietro
                    </div>
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-[var(--border-primary)] pt-3">
                    [↑↓] Seleziona | [INVIO] Conferma | [ESC] Indietro
                </div>
            </div>
        </div>
    );
};

export default SaveLoadScreen;