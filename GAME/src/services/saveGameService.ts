import { useGameStore } from '../../store/gameStore';

const SAVE_SLOT_KEY_PREFIX = 'tspc_save_';
export const NUM_SLOTS = 5; // Aumentato da 3 a 5

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
 * @interface SaveValidationResult
 * @description Result of save file validation.
 */
interface SaveValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * @function validateSaveData
 * @description Validates save data structure.
 * @param {any} data - The data to validate.
 * @returns {SaveValidationResult} Validation result.
 */
const validateSaveData = (data: any): SaveValidationResult => {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Dati di salvataggio non validi' };
    }
    
    if (!data.saveVersion) {
        return { valid: false, error: 'Versione salvataggio mancante' };
    }
    
    if (!data.metadata || !data.character || !data.game || !data.time) {
        return { valid: false, error: 'Dati di salvataggio incompleti' };
    }
    
    return { valid: true };
};

/**
 * @function getSaveSlots
 * @description Gets a list of save slots.
 * @returns {SaveSlot[]} A list of save slots.
 */
export const getSaveSlots = (): SaveSlot[] => {
    return Array.from({ length: NUM_SLOTS }, (_, i) => {
        const slot = i + 1;
        const saveDataJSON = localStorage.getItem(`${SAVE_SLOT_KEY_PREFIX}${slot}`);
        if (saveDataJSON) {
            try {
                const saveData = JSON.parse(saveDataJSON);
                const validation = validateSaveData(saveData);
                
                if (!validation.valid) {
                    return { slot, isEmpty: true, label: `Slot ${slot} (Corrotto)` };
                }
                
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

/**
 * @function exportSaveToFile
 * @description Exports a save slot to a JSON file.
 * @param {number} slot - The slot number to export.
 */
export const exportSaveToFile = (slot: number): void => {
    try {
        const saveDataJSON = localStorage.getItem(`${SAVE_SLOT_KEY_PREFIX}${slot}`);
        if (!saveDataJSON) {
            throw new Error(`Nessun salvataggio trovato nello slot ${slot}`);
        }
        
        const saveData = JSON.parse(saveDataJSON);
        const validation = validateSaveData(saveData);
        
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        // Create blob and download
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate filename with timestamp
        const { level, day } = saveData.metadata;
        const timestamp = new Date().toISOString().slice(0, 10);
        a.download = `TSP_Save_Slot${slot}_Lv${level}_Day${day}_${timestamp}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting save:', error);
        throw error;
    }
};

/**
 * @function importSaveFromFile
 * @description Imports a save from a JSON file to a slot.
 * @param {File} file - The file to import.
 * @param {number} slot - The slot to import to.
 * @returns {Promise<boolean>} Whether the import was successful.
 */
export const importSaveFromFile = async (file: File, slot: number): Promise<boolean> => {
    try {
        const text = await file.text();
        const saveData = JSON.parse(text);
        
        const validation = validateSaveData(saveData);
        if (!validation.valid) {
            throw new Error(validation.error || 'File di salvataggio non valido');
        }
        
        // Save to localStorage
        localStorage.setItem(`${SAVE_SLOT_KEY_PREFIX}${slot}`, JSON.stringify(saveData));
        return true;
    } catch (error) {
        console.error('Error importing save:', error);
        throw error;
    }
};

/**
 * @function deleteSave
 * @description Deletes a save from a slot.
 * @param {number} slot - The slot to delete.
 */
export const deleteSave = (slot: number): void => {
    localStorage.removeItem(`${SAVE_SLOT_KEY_PREFIX}${slot}`);
};
