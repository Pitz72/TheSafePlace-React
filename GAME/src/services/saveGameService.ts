import { useGameStore } from '../store/gameStore';
import { NUM_SAVE_SLOTS, slotKey, storage, validateSaveData } from '../utils/saveFormat';

export const NUM_SLOTS = NUM_SAVE_SLOTS;

export interface SaveSlot {
    slot: number;
    isEmpty: boolean;
    /** The slot holds data that can't be loaded. */
    isCorrupted: boolean;
    label: string;
}

const readSlot = (slot: number): { data: any; error: string | null } | null => {
    const raw = storage.get(slotKey(slot));
    if (!raw) return null;
    try {
        const data = JSON.parse(raw);
        return { data, error: validateSaveData(data) };
    } catch {
        return { data: null, error: 'File illeggibile.' };
    }
};

export const getSaveSlots = (): SaveSlot[] =>
    Array.from({ length: NUM_SLOTS }, (_, i) => {
        const slot = i + 1;
        const saved = readSlot(slot);
        if (!saved) return { slot, isEmpty: true, isCorrupted: false, label: `Slot ${slot} (Vuoto)` };
        if (saved.error) return { slot, isEmpty: false, isCorrupted: true, label: `Slot ${slot} (Corrotto)` };
        const { level, day, hour, minute } = saved.data.metadata;
        const when = typeof saved.data.timestamp === 'number'
            ? ` | ${new Date(saved.data.timestamp).toLocaleDateString('it-IT')}`
            : '';
        return {
            slot,
            isEmpty: false,
            isCorrupted: false,
            label: `Liv. ${level} | Giorno ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}${when}`,
        };
    });

export const isSlotEmpty = (slot: number): boolean => storage.get(slotKey(slot)) === null;

export const handleLoadGame = (slot: number): boolean => useGameStore.getState().loadGame(slot);

export const handleSaveGame = (slot: number): boolean => useGameStore.getState().saveGame(slot);

/** Downloads a slot as a JSON file. Throws with a message for the player. */
export const exportSaveToFile = (slot: number): void => {
    const saved = readSlot(slot);
    if (!saved) throw new Error(`Nessun salvataggio nello slot ${slot}.`);
    if (saved.error) throw new Error(saved.error);

    const blob = new Blob([JSON.stringify(saved.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const { level, day } = saved.data.metadata;
    link.href = url;
    link.download = `TSP_Save_Slot${slot}_Lv${level}_Day${day}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/** Reads and validates a save file. Throws with a message for the player. */
export const readSaveFile = async (file: File): Promise<object> => {
    let data: unknown;
    try {
        data = JSON.parse(await file.text());
    } catch {
        throw new Error('Il file non è un salvataggio valido.');
    }
    const error = validateSaveData(data);
    if (error) throw new Error(error);
    return data as object;
};

/** Writes an already validated save into a slot (overwriting it). */
export const writeSaveToSlot = (data: object, slot: number): void => {
    try {
        storage.set(slotKey(slot), JSON.stringify(data));
    } catch {
        throw new Error('Spazio di archiviazione insufficiente.');
    }
};

export const deleteSave = (slot: number): void => storage.remove(slotKey(slot));
