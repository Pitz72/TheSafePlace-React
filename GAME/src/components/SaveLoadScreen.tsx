import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import {
    getSaveSlots, handleSaveGame, handleLoadGame, SaveSlot, NUM_SLOTS, exportSaveToFile,
    readSaveFile, writeSaveToSlot, deleteSave,
} from '../services/saveGameService';
import Modal from './ui/Modal';
import Icon from './ui/Icon';
import KeyHints from './ui/KeyHints';

type View = 'slots' | 'exportPick' | 'importPick';
interface PendingConfirm { message: string; action: () => void }

const errorText = (error: unknown) => (error instanceof Error ? error.message : 'Errore sconosciuto.');

const SlotCard: React.FC<{ slot: SaveSlot; selected: boolean }> = ({ slot, selected }) => (
    <div className={`choice !gap-6 !py-4 ${selected ? 'is-selected' : 'border-line bg-white/[0.02]'}`}>
        <span className={`title-display w-12 text-center text-[46px] leading-none ${selected ? 'text-accent' : 'text-ink3'}`}>{slot.slot}</span>
        <div className="min-w-0 flex-1">
            {slot.isEmpty && <div className="text-[22px] italic text-ink3">Slot vuoto</div>}
            {slot.isCorrupted && <div className="flex items-center gap-2 text-[22px] text-danger"><Icon name="warning" size={22} /> Salvataggio danneggiato</div>}
            {slot.meta && (
                <>
                    <div className="text-[23px] text-ink">Giorno {slot.meta.day}<span className="mx-3 text-ink4">·</span>{slot.meta.time}</div>
                    <div className="mt-0.5 flex items-center gap-4 text-[18px] text-ink3">
                        <span>Livello {slot.meta.level}</span>
                        {slot.meta.date && <span>Salvato il {slot.meta.date}</span>}
                    </div>
                </>
            )}
        </div>
        <Icon name="chevronRight" size={20} className={selected ? 'text-accent' : 'opacity-0'} />
    </div>
);

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

    const title = view === 'exportPick' ? 'Esporta uno slot' : view === 'importPick' ? 'Importa in uno slot' : mode === 'save' ? 'Salva la partita' : 'Carica una partita';
    const actionRow = (index: number, icon: 'upload' | 'download' | 'arrowLeft', label: string) => (
        <div className={`choice !py-3.5 text-[21px] ${selectedIndex === index ? 'is-selected' : ''}`}>
            <Icon name={icon} size={22} className={selectedIndex === index ? 'text-accent' : 'text-ink3'} />
            <span className="flex-1">{label}</span>
        </div>
    );

    return (
        <>
            <Modal
                backdrop={inGame ? 'blur' : 'soft'}
                eyebrow={mode === 'save' ? 'Salvataggio' : 'Caricamento'}
                icon={mode === 'save' ? 'save' : 'load'}
                title={title}
                subtitle={feedback ? <span className="text-ember2">{feedback}</span> : 'Cinque slot, conservati su questo computer.'}
                size="md"
                hints={view === 'slots'
                    ? [{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }, { keys: ['E'], label: 'Esporta' }, { keys: ['CANC'], label: 'Elimina' }, { keys: ['ESC'], label: 'Indietro' }]
                    : [{ keys: ['↑↓'], label: 'Scegli lo slot' }, { keys: ['INVIO'], label: 'Conferma' }, { keys: ['ESC'], label: 'Annulla' }]}
            >
                <div className="flex flex-col gap-2 px-12 pb-9">
                    {slots.map((slot, index) => <SlotCard key={slot.slot} slot={slot} selected={index === selectedIndex} />)}
                    {view === 'slots' && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {actionRow(NUM_SLOTS, mode === 'load' ? 'upload' : 'download', mode === 'load' ? 'Importa da un file JSON' : 'Esporta uno slot in un file JSON')}
                            {actionRow(NUM_SLOTS + 1, 'arrowLeft', 'Torna indietro')}
                        </div>
                    )}
                </div>
            </Modal>

            {pendingConfirm && (
                <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: 'rgb(var(--c-bg0) / 0.6)' }}>
                    <div className="surface w-[680px] px-12 py-10 text-center anim-scale-in" style={{ background: 'var(--glass-strong)' }}>
                        <Icon name="warning" size={36} className="mx-auto mb-5 text-ember" />
                        <p className="mb-8 text-[26px] leading-snug text-ink">{pendingConfirm.message}</p>
                        <KeyHints hints={[{ keys: ['INVIO'], label: 'Sì' }, { keys: ['ESC'], label: 'No' }]} />
                    </div>
                </div>
            )}
            <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileSelected} style={{ display: 'none' }} />
        </>
    );
};

export default SaveLoadScreen;
