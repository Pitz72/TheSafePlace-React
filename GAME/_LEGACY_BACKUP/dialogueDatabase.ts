import { create } from 'zustand';
import { DialogueTree } from '../types';

/**
 * Loads all dialogues from the dialogues.json file.
 * @returns {Promise<Record<string, DialogueTree>>} A promise that resolves to a record of dialogue trees indexed by ID.
 */
async function loadDialogues(): Promise<Record<string, DialogueTree>> {
    const file = 'data/dialogues.json';
    try {
        console.log('[DIALOGUE DB] Loading dialogues from:', file);
        const response = await fetch(file);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${response.url}: ${response.statusText}`);
        }
        
        console.log('[DIALOGUE DB] Response OK, parsing JSON...');
        const dialoguesArray: DialogueTree[] = await response.json();
        console.log('[DIALOGUE DB] Dialogues loaded:', dialoguesArray.length);
        
        // Convert array to Record<string, DialogueTree> for easy lookup
        const dialogueDatabase: Record<string, DialogueTree> = {};
        dialoguesArray.forEach(dialogue => {
            dialogueDatabase[dialogue.id] = dialogue;
        });
        
        console.log('[DIALOGUE DB] ✅ Database created successfully! Dialogues:', Object.keys(dialogueDatabase).length);
        return dialogueDatabase;
    } catch (error) {
        console.error("[DIALOGUE DB] ❌ ERROR loading dialogues:", error);
        return {}; // Return empty DB on error
    }
}

/**
 * @interface DialogueDatabaseState
 * @description Represents the state of the dialogue database store.
 * @property {boolean} isLoaded - Whether the dialogue database has been loaded.
 * @property {Record<string, DialogueTree>} dialogues - A record of dialogue trees indexed by ID.
 * @property {() => Promise<void>} loadDatabase - Function to load the dialogue database.
 */
interface DialogueDatabaseState {
    isLoaded: boolean;
    dialogues: Record<string, DialogueTree>;
    loadDatabase: () => Promise<void>;
}

/**
 * Dialogue Database Store (v1.7.0)
 * 
 * @description Zustand store for managing the dialogue database.
 * Loads dialogue tree definitions from /data/dialogues.json and provides them as a Record<string, DialogueTree>.
 * 
 * @remarks
 * - Follows the same pattern as questDatabase and eventDatabase
 * - Loads asynchronously on first access
 * - Caches loaded data to prevent redundant fetches
 * - Returns empty object on error to prevent crashes
 * 
 * @example
 * const { dialogues, loadDatabase, isLoaded } = useDialogueDatabaseStore();
 * 
 * // Load database (typically in App.tsx)
 * await loadDatabase();
 * 
 * // Access dialogue tree by ID
 * const marcusDialogue = dialogues['marcus_main'];
 */
export const useDialogueDatabaseStore = create<DialogueDatabaseState>((set, get) => ({
    isLoaded: false,
    dialogues: {},
    
    /**
     * Loads the dialogue database from JSON file.
     * 
     * @description Fetches /data/dialogues.json and converts it to a Record<string, DialogueTree>.
     * Only loads once - subsequent calls are no-ops.
     * 
     * @remarks
     * - Called automatically during app initialization
     * - Safe to call multiple times (idempotent)
     * - Logs detailed progress for debugging
     * - Handles errors gracefully
     */
    loadDatabase: async () => {
        console.log('[DIALOGUE STORE] loadDatabase called, isLoaded:', get().isLoaded);
        if (get().isLoaded) {
            console.log('[DIALOGUE STORE] Already loaded, skip');
            return;
        }
        console.log('[DIALOGUE STORE] Loading...');
        const db = await loadDialogues();
        console.log('[DIALOGUE STORE] loadDialogues completed, dialogues received:', Object.keys(db).length);
        set({ dialogues: db, isLoaded: true });
        console.log('[DIALOGUE STORE] ✅ Store updated! Final state:', Object.keys(get().dialogues).length);
    }
}));