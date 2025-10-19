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
    const [exportMode, setExportMode] = useState(false); // Modalità selezione slot per esportazione
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
        if (exportMode) {
            // In export mode, naviga solo tra gli slot (0 to NUM_SLOTS-1)
            setSelectedIndex(prev => (prev + direction + NUM_SLOTS) % NUM_SLOTS);
        } else {
            // NUM_SLOTS + 2 perché abbiamo: 5 slot + "Importa/Esporta da File" + "Torna Indietro"
            setSelectedIndex(prev => (prev + direction + (NUM_SLOTS + 2)) % (NUM_SLOTS + 2));
        }
    }, [exportMode]);

    const goBack = useCallback(() => {
        if (exportMode) {
            // Esci dalla modalità export
            setExportMode(false);
            setSelectedIndex(NUM_SLOTS); // Torna su "Esporta Slot in File JSON"
            setFeedbackMessage(null);
        } else if (previousGameState === GameState.PAUSE_MENU) {
            setGameState(GameState.PAUSE_MENU);
        } else {
            setGameState(GameState.MAIN_MENU);
        }
    }, [exportMode, previousGameState, setGameState]);

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
        
        if (exportMode) {
            // In export mode, esporta lo slot selezionato
            const slotNumber = selectedIndex + 1;
            const slot = slots[selectedIndex];
            if (!slot.isEmpty) {
                try {
                    handleExport(slotNumber);
                    setExportMode(false);
                    setSelectedIndex(NUM_SLOTS); // Torna su "Esporta Slot"
                } catch (error) {
                    // L'errore è già gestito in handleExport
                }
            } else {
                setFeedbackMessage('Questo slot è vuoto. Seleziona uno slot con un salvataggio.');
            }
            return;
        }
        
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
        } else if (selectedIndex === NUM_SLOTS) { // "Importa/Esporta da File"
            if (mode === 'load') {
                handleImport();
            } else {
                // mode === 'save' - Entra in modalità selezione export
                setExportMode(true);
                setSelectedIndex(0); // Vai al primo slot
                setFeedbackMessage('Seleziona lo slot da esportare e premi INVIO');
            }
        } else { // "Torna Indietro"
            goBack();
        }
    }, [exportMode, selectedIndex, mode, slots, goBack, refreshSlots, handleImport, handleExport]);

    const toggleActions = useCallback(() => {
        if (selectedIndex < NUM_SLOTS) {
            setShowActions(prev => !prev);
        }
    }, [selectedIndex]);

    const handleActionKey = useCallback((key: string) => {
        if (!showActions || selectedIndex >= NUM_SLOTS) return;
        
        const slot = slots[selectedIndex];
        const slotNumber = slot.slot;
        
        if (key === 'e' || key === 'E') {
            if (!slot.isEmpty) {
                handleExport(slotNumber);
                setShowActions(false);
            }
        } else if (key === 'd' || key === 'D') {
            if (!slot.isEmpty) {
                handleDelete(slotNumber);
            }
        } else if (key === 'i' || key === 'I') {
            if (slot.isEmpty) {
                handleImport();
                setShowActions(false);
            }
        }
    }, [showActions, selectedIndex, slots, handleExport, handleDelete, handleImport]);

    const handlerMap = useMemo(() => ({
        'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
        's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
        'Enter': handleConfirm,
        'Escape': goBack,
        'a': toggleActions, 'A': toggleActions,
        'e': () => handleActionKey('e'), 'E': () => handleActionKey('E'),
        'd': () => handleActionKey('d'), 'D': () => handleActionKey('D'),
        'i': () => handleActionKey('i'), 'I': () => handleActionKey('I'),
    }), [handleNavigate, handleConfirm, goBack, toggleActions, handleActionKey]);

    useKeyboardInput(handlerMap);

    const title = exportMode ? 'ESPORTA SLOT' : (mode === 'save' ? 'SALVA PARTITA' : 'CARICA PARTITA');

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
                                        <div className="flex gap-4 text-2xl text-[var(--text-accent)]">
                                            <span>[E] Esporta</span>
                                            <span className="text-[var(--text-danger)]">[D] Elimina</span>
                                        </div>
                                    )}
                                    {isSelected && showActions && slot.isEmpty && (
                                        <div className="text-2xl text-[var(--text-accent)]">
                                            <span>[I] Importa</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Opzione Importa/Esporta da File - nascosta in export mode */}
                    {!exportMode && (
                        <>
                            <div className={`mt-6 pl-4 py-2 border-2 ${selectedIndex === NUM_SLOTS ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)] border-[var(--highlight-bg)]' : 'border-[var(--text-accent)]'}`}>
                                {selectedIndex === NUM_SLOTS && '> '}
                                {mode === 'load' ? 'Importa da File JSON' : 'Esporta Slot in File JSON'}
                            </div>
                            
                            <div className={`pl-4 py-2 ${selectedIndex === NUM_SLOTS + 1 ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''}`}>
                                {selectedIndex === NUM_SLOTS + 1 && '> '}Torna Indietro
                            </div>
                        </>
                    )}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-[var(--border-primary)] pt-3">
                    {exportMode ? (
                        <>[↑↓] Seleziona Slot | [INVIO] Esporta | [ESC] Annulla</>
                    ) : showActions && selectedIndex < NUM_SLOTS ? (
                        mode === 'save' && !slots[selectedIndex].isEmpty ? (
                            <>[E] Esporta | [D] Elimina | [A] Chiudi Menu | [ESC] Indietro</>
                        ) : mode === 'load' && slots[selectedIndex].isEmpty ? (
                            <>[I] Importa | [A] Chiudi Menu | [ESC] Indietro</>
                        ) : mode === 'load' && !slots[selectedIndex].isEmpty ? (
                            <>[D] Elimina | [A] Chiudi Menu | [ESC] Indietro</>
                        ) : (
                            <>[A] Chiudi Menu | [ESC] Indietro</>
                        )
                    ) : (
                        <>[↑↓] Seleziona | [INVIO] Conferma | [A] Azioni Slot | [ESC] Indietro</>
                    )}
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