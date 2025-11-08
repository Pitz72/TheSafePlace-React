import { create } from 'zustand';
import { LoreEntry } from '../types';

/**
 * Loads all lore entries from the lore_archive.json file.
 * @returns {Promise<Record<string, LoreEntry>>} A promise that resolves to a record of lore entries indexed by ID.
 */
async function loadLoreEntries(): Promise<Record<string, LoreEntry>> {
    const file = 'data/lore_archive.json';
    try {
        console.log('[LORE ARCHIVE DB] Loading lore entries from:', file);
        const response = await fetch(file);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${response.url}: ${response.statusText}`);
        }
        
        console.log('[LORE ARCHIVE DB] Response OK, parsing JSON...');
        const entriesArray: LoreEntry[] = await response.json();
        console.log('[LORE ARCHIVE DB] Lore entries loaded:', entriesArray.length);
        
        // Convert array to Record<string, LoreEntry> for easy lookup
        const loreDatabase: Record<string, LoreEntry> = {};
        entriesArray.forEach(entry => {
            loreDatabase[entry.id] = entry;
        });
        
        console.log('[LORE ARCHIVE DB] ✅ Database created successfully! Entries:', Object.keys(loreDatabase).length);
        return loreDatabase;
    } catch (error) {
        console.error("[LORE ARCHIVE DB] ❌ ERROR loading lore entries:", error);
        return {}; // Return empty DB on error
    }
}

/**
 * @interface LoreArchiveDatabaseState
 * @description Represents the state of the lore archive database store.
 * @property {boolean} isLoaded - Whether the lore archive database has been loaded.
 * @property {Record<string, LoreEntry>} loreEntries - A record of lore entries indexed by ID.
 * @property {() => Promise<void>} loadDatabase - Function to load the lore archive database.
 */
interface LoreArchiveDatabaseState {
    isLoaded: boolean;
    loreEntries: Record<string, LoreEntry>;
    loadDatabase: () => Promise<void>;
}

/**
 * Lore Archive Database Store (v1.8.0)
 * 
 * @description Zustand store for managing the lore archive database.
 * Loads lore entry definitions from /data/lore_archive.json and provides them as a Record<string, LoreEntry>.
 * 
 * @remarks
 * - Follows the same pattern as questDatabase and other database stores
 * - Loads asynchronously on first access
 * - Caches loaded data to prevent redundant fetches
 * - Returns empty object on error to prevent crashes
 * 
 * @example
 * const { loreEntries, loadDatabase, isLoaded } = useLoreArchiveDatabaseStore();
 * 
 * // Load database (typically in App.tsx)
 * await loadDatabase();
 * 
 * // Access lore entry by ID
 * const entry = loreEntries['lore_project_echo'];
 */
export const useLoreArchiveDatabaseStore = create<LoreArchiveDatabaseState>((set, get) => ({
    isLoaded: false,
    loreEntries: {},
    
    /**
     * Loads the lore archive database from JSON file.
     * 
     * @description Fetches /data/lore_archive.json and converts it to a Record<string, LoreEntry>.
     * Only loads once - subsequent calls are no-ops.
     * 
     * @remarks
     * - Called automatically during app initialization
     * - Safe to call multiple times (idempotent)
     * - Logs detailed progress for debugging
     * - Handles errors gracefully
     */
    loadDatabase: async () => {
        console.log('[LORE ARCHIVE STORE] loadDatabase called, isLoaded:', get().isLoaded);
        if (get().isLoaded) {
            console.log('[LORE ARCHIVE STORE] Already loaded, skip');
            return;
        }
        console.log('[LORE ARCHIVE STORE] Loading...');
        const db = await loadLoreEntries();
        console.log('[LORE ARCHIVE STORE] loadLoreEntries completed, entries received:', Object.keys(db).length);
        set({ loreEntries: db, isLoaded: true });
        console.log('[LORE ARCHIVE STORE] ✅ Store updated! Final state:', Object.keys(get().loreEntries).length);
    }
}));