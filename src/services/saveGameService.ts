import { useGameStore } from '../../store/gameStore';

const SAVE_SLOT_KEY_PREFIX = 'tspc_save_';

/**
 * @interface SaveSlot
 * @description Represents a save slot.
 * @property {number} slot - The slot number.
 * @property {boolean} isEmpty - Whether the slot is empty.
 * @property {string} label - The label for the slot.
 */
export interface SaveSlot {
    slot: number;
    isEmpty: boolean;
    label: string;
}

/**
 * @function getSaveSlots
 * @description Gets a list of save slots.
 * @returns {SaveSlot[]} A list of save slots.
 */
export const getSaveSlots = (): SaveSlot[] => {
    return Array.from({ length: 3 }, (_, i) => {
        const slot = i + 1;
        const saveDataJSON = localStorage.getItem(`${SAVE_SLOT_KEY_PREFIX}${slot}`);
        if (saveDataJSON) {
            try {
                const saveData = JSON.parse(saveDataJSON);
                const { level, day, hour, minute } = saveData.metadata;
                return {
                    slot,
                    isEmpty: false,
                    label: `Liv. ${level} | Giorno ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
                };
            } catch (e) {
                return { slot, isEmpty: true, label: `Slot ${slot} (Corrotto)` };
            }
        }
        return { slot, isEmpty: true, label: `Slot ${slot} (Vuoto)` };
    });
};

/**
 * @function handleLoadGame
 * @description Handles loading a game from a save slot.
 * @param {number} slot - The slot number to load from.
 * @returns {boolean} Whether the game was loaded successfully.
 */
export const handleLoadGame = (slot: number): boolean => {
    return useGameStore.getState().loadGame(slot);
};

/**
 * @function handleSaveGame
 * @description Handles saving a game to a save slot.
 * @param {number} slot - The slot number to save to.
 * @returns {boolean} Whether the game was saved successfully.
 */
export const handleSaveGame = (slot: number): boolean => {
    return useGameStore.getState().saveGame(slot);
};
