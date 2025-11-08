import { create } from 'zustand';
import { Quest } from '../types';

/**
 * Loads all quests from the quests.json file.
 * @returns {Promise<Record<string, Quest>>} A promise that resolves to a record of quests indexed by ID.
 */
async function loadQuests(): Promise<Record<string, Quest>> {
    const file = 'data/quests.json';
    try {
        console.log('[QUEST DB] Loading quests from:', file);
        const response = await fetch(file);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${response.url}: ${response.statusText}`);
        }
        
        console.log('[QUEST DB] Response OK, parsing JSON...');
        const questsArray: Quest[] = await response.json();
        console.log('[QUEST DB] Quests loaded:', questsArray.length);
        
        // Convert array to Record<string, Quest> for easy lookup
        const questDatabase: Record<string, Quest> = {};
        questsArray.forEach(quest => {
            questDatabase[quest.id] = quest;
        });
        
        console.log('[QUEST DB] ✅ Database created successfully! Quests:', Object.keys(questDatabase).length);
        return questDatabase;
    } catch (error) {
        console.error("[QUEST DB] ❌ ERROR loading quests:", error);
        return {}; // Return empty DB on error
    }
}

/**
 * @interface QuestDatabaseState
 * @description Represents the state of the quest database store.
 * @property {boolean} isLoaded - Whether the quest database has been loaded.
 * @property {Record<string, Quest>} quests - A record of quests indexed by ID.
 * @property {() => Promise<void>} loadDatabase - Function to load the quest database.
 */
interface QuestDatabaseState {
    isLoaded: boolean;
    quests: Record<string, Quest>;
    loadDatabase: () => Promise<void>;
}

/**
 * Quest Database Store
 * 
 * @description Zustand store for managing the quest database.
 * Loads quest definitions from /data/quests.json and provides them as a Record<string, Quest>.
 * 
 * @remarks
 * - Follows the same pattern as itemDatabase and eventDatabase
 * - Loads asynchronously on first access
 * - Caches loaded data to prevent redundant fetches
 * - Returns empty object on error to prevent crashes
 * 
 * @example
 * const { quests, loadDatabase, isLoaded } = useQuestDatabaseStore();
 * 
 * // Load database (typically in App.tsx)
 * await loadDatabase();
 * 
 * // Access quest by ID
 * const quest = quests['find_jonas_talisman'];
 */
export const useQuestDatabaseStore = create<QuestDatabaseState>((set, get) => ({
    isLoaded: false,
    quests: {},
    
    /**
     * Loads the quest database from JSON file.
     * 
     * @description Fetches /data/quests.json and converts it to a Record<string, Quest>.
     * Only loads once - subsequent calls are no-ops.
     * 
     * @remarks
     * - Called automatically during app initialization
     * - Safe to call multiple times (idempotent)
     * - Logs detailed progress for debugging
     * - Handles errors gracefully
     */
    loadDatabase: async () => {
        console.log('[QUEST STORE] loadDatabase called, isLoaded:', get().isLoaded);
        if (get().isLoaded) {
            console.log('[QUEST STORE] Already loaded, skip');
            return;
        }
        console.log('[QUEST STORE] Loading...');
        const db = await loadQuests();
        console.log('[QUEST STORE] loadQuests completed, quests received:', Object.keys(db).length);
        set({ quests: db, isLoaded: true });
        console.log('[QUEST STORE] ✅ Store updated! Final state:', Object.keys(get().quests).length);
    }
}));