import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

const NUM_SLOTS = 5;

/**
 * @interface SaveMetadata
 * @description Represents the metadata of a save file.
 * @property {number} slot - The slot number of the save file.
 * @property {number} level - The player's level.
 * @property {number} day - The current day in the game.
 * @property {number} hour - The current hour in the game.
 * @property {number} minute - The current minute in the game.
 * @property {number} timestamp - The timestamp of the save file.
 */
interface SaveMetadata {
    slot: number;
    level: number;
    day: number;
    hour: number;
    minute: number;
    timestamp: number;
}

/**
 * Gets the metadata of a save file.
 * @param {number} slot - The slot number of the save file.
 * @returns {SaveMetadata | null} The metadata of the save file, or null if it doesn't exist.
 */
const getSaveMetadata = (slot: number): SaveMetadata | null => {
    const data = localStorage.getItem(`tspc_save_slot_${slot}`);
    if (!data) return null;
    try {
        const parsed = JSON.parse(data);
        if (parsed.metadata && parsed.timestamp) {
            return { slot, ...parsed.metadata, timestamp: parsed.timestamp };
        }
        return null;
    } catch (e) {
        return null;
    }
};

/**
 * SaveLoadScreen component.
 * This component renders the save/load screen.
 * @param {object} props - The props for the component.
 * @param {'save' | 'load'} props.mode - The mode of the screen ('save' or 'load').
 * @returns {JSX.Element} The rendered SaveLoadScreen component.
 */
const SaveLoadScreen: React.FC<{ mode: 'save' | 'load' }> = ({ mode }) => {
    const { setGameState, saveGame, loadGame } = useGameStore();
    const previousGameState = useGameStore(state => state.previousGameState);
    const [slots, setSlots] = useState<(SaveMetadata | null)[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshSlots = useCallback(() => {
        const newSlots = Array.from({ length: NUM_SLOTS }, (_, i) => getSaveMetadata(i + 1));
        setSlots(newSlots);
    }, []);

    useEffect(() => {
        refreshSlots();
    }, [refreshSlots]);

    const handleNavigate = useCallback((direction: number) => {
        setFeedbackMessage(null);
        setSelectedIndex(prev => (prev + direction + (NUM_SLOTS + 2)) % (NUM_SLOTS + 2));
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
                if (saveGame(slotNumber)) {
                    setFeedbackMessage(`Partita salvata nello slot ${slotNumber}.`);
                    refreshSlots();
                } else {
                    setFeedbackMessage('Errore durante il salvataggio.');
                }
            } else { // mode === 'load'
                if (slots[selectedIndex]) {
                    loadGame(slotNumber);
                    // On success, the game state will change and this component will unmount
                } else {
                    setFeedbackMessage('Questo slot è vuoto.');
                }
            }
        } else if (selectedIndex === NUM_SLOTS) { // "Carica da File..."
            fileInputRef.current?.click();
        } else { // "Torna Indietro"
            goBack();
        }
    }, [selectedIndex, mode, saveGame, loadGame, slots, goBack, refreshSlots]);

    const handleDownload = useCallback(() => {
        if (selectedIndex < NUM_SLOTS && slots[selectedIndex]) {
            const slotNumber = selectedIndex + 1;
            const data = localStorage.getItem(`tspc_save_slot_${slotNumber}`);
            if (data) {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const metadata = slots[selectedIndex];
                a.href = url;
                a.download = `tspc_save_slot_${slotNumber}-day${metadata?.day}-lvl${metadata?.level}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setFeedbackMessage(`Salvataggio slot ${slotNumber} scaricato.`);
            }
        }
    }, [selectedIndex, slots]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read.");
                
                // This is a complex operation, so we delegate it to the store.
                // For simplicity here, we'll parse, validate basic structure, and save.
                const parsed = JSON.parse(text);
                if (parsed.saveVersion && parsed.gameStoreState && parsed.characterStoreState) {
                    const slotToSave = selectedIndex < NUM_SLOTS ? selectedIndex + 1 : 1;
                    localStorage.setItem(`tspc_save_slot_${slotToSave}`, text);
                    localStorage.setItem('tspc_last_save_slot', slotToSave.toString());
                    setFeedbackMessage(`File importato e salvato nello slot ${slotToSave}.`);
                    refreshSlots();
                } else {
                    throw new Error("Invalid save file format.");
                }
            } catch (error) {
                setFeedbackMessage("Errore: File di salvataggio non valido o corrotto.");
            }
        };
        reader.readAsText(file);

        // Reset file input to allow uploading the same file again
        event.target.value = '';
    };

    const handlerMap = useMemo(() => ({
        'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
        's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
        'Enter': handleConfirm,
        'd': handleDownload, 'D': handleDownload,
        'Escape': goBack
    }), [handleNavigate, handleConfirm, handleDownload, goBack]);

    useKeyboardInput(handlerMap);

    const title = mode === 'save' ? 'SALVA PARTITA' : 'CARICA PARTITA';

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <div className="w-full h-full max-w-4xl border-8 border-double border-[var(--border-primary)] flex flex-col p-6 bg-[var(--bg-primary)]">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ {title} ═══</h1>

                {feedbackMessage && <p className="text-3xl text-center text-[var(--text-accent)] mb-4">{feedbackMessage}</p>}
                
                <div className="w-full flex-grow text-4xl space-y-3">
                    {slots.map((meta, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <div key={index} className={`pl-4 py-2 transition-colors duration-100 ${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : 'border border-[var(--border-primary)]'}`}>
                                <div className="flex justify-between">
                                    <span>{isSelected && '> '}Slot {index + 1}</span>
                                    {meta ? (
                                        <span className={isSelected ? '' : 'text-[var(--text-secondary)]/80'}>
                                            Giorno {meta.day}, {String(meta.hour).padStart(2, '0')}:{String(meta.minute).padStart(2, '0')} - Liv. {meta.level}
                                        </span>
                                    ) : (
                                        <span className={isSelected ? '' : 'text-[var(--text-secondary)]/50'}>-- Vuoto --</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div className={`mt-6 pl-4 py-2 ${selectedIndex === NUM_SLOTS ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''}`}>
                        {selectedIndex === NUM_SLOTS && '> '}Carica da File...
                    </div>
                    <div className={`pl-4 py-2 ${selectedIndex === NUM_SLOTS + 1 ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''}`}>
                        {selectedIndex === NUM_SLOTS + 1 && '> '}Torna Indietro
                    </div>
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-[var(--border-primary)] pt-3">
                    [↑↓] Seleziona | [INVIO] Conferma | [D] Scarica | [ESC] Indietro
                </div>
            </div>
        </div>
    );
};

export default SaveLoadScreen;