import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import {
    getSaveSlots, handleSaveGame, handleLoadGame, SaveSlot, NUM_SLOTS, exportSaveToFile,
    readSaveFile, writeSaveToSlot, deleteSave,
} from '../services/saveGameService';

type View = 'slots' | 'exportPick' | 'importPick';
interface PendingConfirm { message: string; action: () => void }

const errorText = (error: unknown) => (error instanceof Error ? error.message : 'Errore sconosciuto.');

/**
 * Save slots: save, load, delete, export to a JSON file and import from one.
 * Anything that overwrites or discards data asks for confirmation.
 */
const SaveLoadScreen: React.FC<{ mode: 'save' | 'load' }> = ({ mode }) => {
    const setGameState = useGameStore(state => state.setGameState);
    const previousGameState = useGameStore(state => state.previousGameState);
    const [returnState] = useState(previousGameState === GameState.PAUSE_MENU ? GameState.PAUSE_MENU : GameState.MAIN_MENU);
    const inGame = returnState === GameState.PAUSE_MENU;

    const [slots, setSlots] = useState<SaveSlot[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [view, setView] = useState<View>('slots');
    const [importData, setImportData] = useState<object | null>(null);
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshSlots = useCallback(() => setSlots(getSaveSlots()), []);
    useEffect(() => { refreshSlots(); }, [refreshSlots]);

    const rowCount = view === 'slots' ? NUM_SLOTS + 2 : NUM_SLOTS;
    const navigate = useCallback((direction: number) => {
        setFeedback(null);
        setSelectedIndex(prev => (prev + direction + rowCount) % rowCount);
        audioManager.playSound('navigate');
    }, [rowCount]);

    const confirmThen = (message: string, action: () => void) => setPendingConfirm({ message, action });

    const backToSlots = useCallback((message: string | null = null) => {
        setView('slots');
        setImportData(null);
        setSelectedIndex(0);
        setFeedback(message);
    }, []);

    const goBack = useCallback(() => {
        audioManager.playSound('cancel');
        if (view !== 'slots') backToSlots();
        else setGameState(returnState);
    }, [view, backToSlots, setGameState, returnState]);

    const exportSlot = useCallback((slotNumber: number) => {
        try {
            exportSaveToFile(slotNumber);
            setFeedback(`Slot ${slotNumber} esportato.`);
        } catch (error) {
            setFeedback(`Esportazione non riuscita: ${errorText(error)}`);
        }
    }, []);

    const handleFileSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            setImportData(await readSaveFile(file));
            setView('importPick');
            setSelectedIndex(Math.max(0, slots.findIndex(s => s.isEmpty)));
            setFeedback('File valido. Scegli lo slot in cui importarlo.');
        } catch (error) {
            setFeedback(`Importazione non riuscita: ${errorText(error)}`);
        }
    }, [slots]);

    const confirmSlot = useCallback(() => {
        const slot = slots[selectedIndex];
        if (!slot) return;
        const n = slot.slot;

        if (view === 'exportPick') {
            if (slot.isEmpty || slot.isCorrupted) setFeedback('Scegli uno slot con un salvataggio valido.');
            else { exportSlot(n); setView('slots'); }
            return;
        }
        if (view === 'importPick') {
            const write = () => {
                try {
                    writeSaveToSlot(importData!, n);
                    refreshSlots();
                    backToSlots(`Salvataggio importato nello slot ${n}.`);
                } catch (error) {
                    setFeedback(errorText(error));
                }
            };
            if (slot.isEmpty) write();
            else confirmThen(`Sovrascrivere lo slot ${n} con il file importato?`, write);
            return;
        }
        if (mode === 'save') {
            const save = () => {
                setFeedback(handleSaveGame(n) ? `Partita salvata nello slot ${n}.` : 'Errore durante il salvataggio.');
                refreshSlots();
            };
            if (slot.isEmpty) save();
            else confirmThen(`Sovrascrivere il salvataggio nello slot ${n}?`, save);
            return;
        }
        if (slot.isEmpty) { setFeedback('Questo slot è vuoto.'); return; }
        if (slot.isCorrupted) { setFeedback('Questo salvataggio è danneggiato e non può essere caricato.'); return; }
        const load = () => { if (!handleLoadGame(n)) setFeedback('Impossibile caricare questo salvataggio.'); };
        if (inGame) confirmThen(`Caricare lo slot ${n}? I progressi non salvati andranno persi.`, load);
        else load();
    }, [slots, selectedIndex, view, mode, inGame, importData, exportSlot, refreshSlots, backToSlots]);

    const confirm = useCallback(() => {
        setFeedback(null);
        audioManager.playSound('confirm');
        if (view !== 'slots' || selectedIndex < NUM_SLOTS) { confirmSlot(); return; }
        if (selectedIndex === NUM_SLOTS) {
            if (mode === 'load') fileInputRef.current?.click();
            else { setView('exportPick'); setSelectedIndex(0); setFeedback('Scegli lo slot da esportare.'); }
            return;
        }
        setGameState(returnState);
    }, [view, selectedIndex, mode, confirmSlot, setGameState, returnState]);

    const deleteSelected = useCallback(() => {
        const slot = slots[selectedIndex];
        if (view !== 'slots' || !slot || slot.isEmpty) return;
        confirmThen(`Eliminare definitivamente lo slot ${slot.slot}?`, () => {
            deleteSave(slot.slot);
            refreshSlots();
            setFeedback(`Slot ${slot.slot} eliminato.`);
        });
    }, [slots, selectedIndex, view, refreshSlots]);

    const exportSelected = useCallback(() => {
        const slot = slots[selectedIndex];
        if (view === 'slots' && slot && !slot.isEmpty && !slot.isCorrupted) exportSlot(slot.slot);
    }, [slots, selectedIndex, view, exportSlot]);

    const handlerMap = useMemo((): KeyHandlerMap => {
        if (pendingConfirm) {
            return {
                Enter: () => { const { action } = pendingConfirm; setPendingConfirm(null); action(); },
                Escape: () => { setPendingConfirm(null); audioManager.playSound('cancel'); },
            };
        }
        return {
            w: () => navigate(-1), ArrowUp: () => navigate(-1),
            s: () => navigate(1), ArrowDown: () => navigate(1),
            Enter: confirm, Escape: goBack,
            e: exportSelected, E: exportSelected,
            Delete: deleteSelected, Backspace: deleteSelected,
        };
    }, [pendingConfirm, navigate, confirm, goBack, exportSelected, deleteSelected]);

    useKeyboardInput(handlerMap);

    const title = view === 'exportPick' ? 'ESPORTA SLOT' : view === 'importPick' ? 'IMPORTA IN SLOT' : mode === 'save' ? 'SALVA PARTITA' : 'CARICA PARTITA';
    const rowClass = (selected: boolean) => `transition-colors duration-100 pl-4 py-2 ${selected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : 'border border-[var(--border-primary)]'}`;

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-5xl border-8 border-double border-[var(--border-primary)] flex flex-col p-6 bg-[var(--bg-primary)] relative">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ {title} ═══</h1>
                {feedback && <p className="text-3xl text-center text-[var(--text-accent)] mb-4">{feedback}</p>}

                <div className="w-full flex-grow text-4xl space-y-3">
                    {slots.map((slot, index) => (
                        <div key={slot.slot} className={rowClass(index === selectedIndex)}>
                            {index === selectedIndex && '> '}
                            <span>Slot {slot.slot}</span>
                            <span className={`ml-4 ${slot.isCorrupted ? 'text-[var(--text-danger)]' : ''}`}>
                                {slot.isEmpty ? '— vuoto —' : slot.isCorrupted ? 'danneggiato' : slot.label}
                            </span>
                        </div>
                    ))}
                    {view === 'slots' && (
                        <>
                            <div className={`mt-6 ${rowClass(selectedIndex === NUM_SLOTS)}`}>
                                {selectedIndex === NUM_SLOTS && '> '}{mode === 'load' ? 'Importa da file JSON' : 'Esporta uno slot in un file JSON'}
                            </div>
                            <div className={rowClass(selectedIndex === NUM_SLOTS + 1)}>
                                {selectedIndex === NUM_SLOTS + 1 && '> '}Torna indietro
                            </div>
                        </>
                    )}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-[var(--border-primary)] pt-3">
                    {view === 'slots'
                        ? '[↑↓] Seleziona | [INVIO] Conferma | [E] Esporta | [CANC] Elimina | [ESC] Indietro'
                        : '[↑↓] Seleziona slot | [INVIO] Conferma | [ESC] Annulla'}
                </div>

                {pendingConfirm && (
                    <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                        <div className="border-4 border-double border-[var(--text-accent)] p-8 max-w-3xl text-center bg-[var(--bg-primary)]">
                            <p className="text-4xl mb-8">{pendingConfirm.message}</p>
                            <p className="text-3xl text-[var(--text-accent)]">[INVIO] Sì | [ESC] No</p>
                        </div>
                    </div>
                )}
            </div>
            <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileSelected} style={{ display: 'none' }} />
        </div>
    );
};

export default SaveLoadScreen;
