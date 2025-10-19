import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { getSaveSlots, handleSaveGame, handleLoadGame, SaveSlot, NUM_SLOTS, exportSaveToFile, importSaveFromFile, deleteSave } from '../src/services/saveGameService';

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
    const [showActions, setShowActions] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshSlots = useCallback(() => {
        setSlots(getSaveSlots());
    }, []);

    useEffect(() => {
        refreshSlots();
    }, [refreshSlots]);

    const handleNavigate = useCallback((direction: number) => {
        setFeedbackMessage(null);
        setShowActions(false);
        // NUM_SLOTS + 2 perché abbiamo: 5 slot + "Importa da File" + "Torna Indietro"
        setSelectedIndex(prev => (prev + direction + (NUM_SLOTS + 2)) % (NUM_SLOTS + 2));
    }, []);

    const goBack = useCallback(() => {
        if (previousGameState === GameState.PAUSE_MENU) {
            setGameState(GameState.PAUSE_MENU);
        } else {
            setGameState(GameState.MAIN_MENU);
        }
    }, [previousGameState, setGameState]);

    const handleExport = useCallback((slotNumber: number) => {
        try {
            exportSaveToFile(slotNumber);
            setFeedbackMessage(`Salvataggio slot ${slotNumber} esportato con successo!`);
        } catch (error) {
            setFeedbackMessage(`Errore durante l'esportazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
        }
    }, []);

    const handleImport = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Trova il primo slot vuoto, o usa lo slot attualmente selezionato se è uno slot valido
            let targetSlot: number;
            
            if (selectedIndex < NUM_SLOTS) {
                // Slot specifico selezionato
                targetSlot = selectedIndex + 1;
            } else {
                // "Importa da File" selezionato: trova primo slot vuoto
                const emptySlotIndex = slots.findIndex(s => s.isEmpty);
                if (emptySlotIndex !== -1) {
                    targetSlot = emptySlotIndex + 1;
                } else {
                    // Tutti gli slot sono pieni, usa lo slot 1
                    targetSlot = 1;
                    setFeedbackMessage(`Attenzione: tutti gli slot sono pieni. Sovrascrivendo lo slot 1...`);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa 2 secondi per far leggere il messaggio
                }
            }
            
            await importSaveFromFile(file, targetSlot);
            setFeedbackMessage(`Salvataggio importato nello slot ${targetSlot} con successo!`);
            refreshSlots();
        } catch (error) {
            setFeedbackMessage(`Errore durante l'importazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
        }
        
        // Reset input
        if (event.target) {
            event.target.value = '';
        }
    }, [selectedIndex, slots, refreshSlots]);

    const handleDelete = useCallback((slotNumber: number) => {
        try {
            deleteSave(slotNumber);
            setFeedbackMessage(`Slot ${slotNumber} eliminato con successo.`);
            refreshSlots();
            setShowActions(false);
        } catch (error) {
            setFeedbackMessage(`Errore durante l'eliminazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
        }
    }, [refreshSlots]);

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
        } else if (selectedIndex === NUM_SLOTS) { // "Importa da File"
            handleImport();
        } else { // "Torna Indietro"
            goBack();
        }
    }, [selectedIndex, mode, slots, goBack, refreshSlots, handleImport]);

    const toggleActions = useCallback(() => {
        if (selectedIndex < NUM_SLOTS) {
            setShowActions(prev => !prev);
        }
    }, [selectedIndex]);

    const handlerMap = useMemo(() => ({
        'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
        's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
        'Enter': handleConfirm,
        'Escape': goBack,
        'a': toggleActions, 'A': toggleActions  // 'A' key for Actions menu
    }), [handleNavigate, handleConfirm, goBack, toggleActions]);

    useKeyboardInput(handlerMap);

    const title = mode === 'save' ? 'SALVA PARTITA' : 'CARICA PARTITA';

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-5xl border-8 border-double border-[var(--border-primary)] flex flex-col p-6 bg-[var(--bg-primary)]">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ {title} ═══</h1>

                {feedbackMessage && <p className="text-3xl text-center text-[var(--text-accent)] mb-4">{feedbackMessage}</p>}
                
                <div className="w-full flex-grow text-4xl space-y-3">
                    {slots.map((slot, index) => {
                        const isSelected = index === selectedIndex;
                        const slotNumber = slot.slot;
                        return (
                            <div key={index} className={`transition-colors duration-100 ${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : 'border border-[var(--border-primary)]'}`}>
                                <div className="pl-4 py-2 flex justify-between items-center">
                                    <div className="flex-1">
                                        <span>{isSelected && '> '}{slot.label.startsWith('Slot') ? slot.label : `Slot ${slot.slot}`}</span>
                                        {!slot.label.startsWith('Slot') && (
                                            <span className={`ml-4 ${isSelected ? '' : 'text-[var(--text-secondary)]/80'}`}>
                                                {slot.label}
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && showActions && !slot.isEmpty && (
                                        <div className="flex gap-2 text-2xl">
                                            <button
                                                onClick={() => handleExport(slotNumber)}
                                                className="px-3 py-1 border-2 border-[var(--highlight-text)] text-[var(--highlight-text)] hover:bg-[var(--highlight-text)] hover:text-[var(--highlight-bg)] transition-colors"
                                            >
                                                [E] Esporta
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slotNumber)}
                                                className="px-3 py-1 border-2 border-[var(--text-danger)] text-[var(--text-danger)] hover:bg-[var(--text-danger)] hover:text-[var(--bg-primary)] transition-colors"
                                            >
                                                [D] Elimina
                                            </button>
                                        </div>
                                    )}
                                    {isSelected && showActions && slot.isEmpty && (
                                        <div className="flex gap-2 text-2xl">
                                            <button
                                                onClick={handleImport}
                                                className="px-3 py-1 border-2 border-[var(--highlight-text)] text-[var(--highlight-text)] hover:bg-[var(--highlight-text)] hover:text-[var(--highlight-bg)] transition-colors"
                                            >
                                                [I] Importa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Opzione Importa da File - sempre visibile */}
                    <div className={`mt-6 pl-4 py-2 border-2 ${selectedIndex === NUM_SLOTS ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)] border-[var(--highlight-bg)]' : 'border-[var(--text-accent)]'}`}>
                        {selectedIndex === NUM_SLOTS && '> '}Importa da File JSON
                    </div>
                    
                    <div className={`pl-4 py-2 ${selectedIndex === NUM_SLOTS + 1 ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''}`}>
                        {selectedIndex === NUM_SLOTS + 1 && '> '}Torna Indietro
                    </div>
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-[var(--border-primary)] pt-3">
                    [↑↓] Seleziona | [INVIO] Conferma | [A] Azioni | [ESC] Indietro
                </div>
            </div>
            
            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelected}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default SaveLoadScreen;