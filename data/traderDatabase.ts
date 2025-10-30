import { create } from 'zustand';
import { Trader } from '../types';

/**
 * Loads all traders from the traders.json file.
 * @returns {Promise<Record<string, Trader>>} A promise that resolves to a record of traders indexed by ID.
 */
async function loadTraders(): Promise<Record<string, Trader>> {
    const file = '/data/traders.json';
    try {
        console.log('[TRADER DB] Loading traders from:', file);
        const response = await fetch(file);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${response.url}: ${response.statusText}`);
        }
        
        console.log('[TRADER DB] Response OK, parsing JSON...');
        const tradersArray: Trader[] = await response.json();
        console.log('[TRADER DB] Traders loaded:', tradersArray.length);
        
        // Convert array to Record<string, Trader> for easy lookup
        const traderDatabase: Record<string, Trader> = {};
        tradersArray.forEach(trader => {
            traderDatabase[trader.id] = trader;
        });
        
        console.log('[TRADER DB] ✅ Database created successfully! Traders:', Object.keys(traderDatabase).length);
        return traderDatabase;
    } catch (error) {
        console.error("[TRADER DB] ❌ ERROR loading traders:", error);
        return {}; // Return empty DB on error
    }
}

/**
 * @interface TraderDatabaseState
 * @description Represents the state of the trader database store.
 * @property {boolean} isLoaded - Whether the trader database has been loaded.
 * @property {Record<string, Trader>} traders - A record of traders indexed by ID.
 * @property {() => Promise<void>} loadDatabase - Function to load the trader database.
 */
interface TraderDatabaseState {
    isLoaded: boolean;
    traders: Record<string, Trader>;
    loadDatabase: () => Promise<void>;
}

/**
 * Trader Database Store (v1.7.0)
 * 
 * @description Zustand store for managing the trader database.
 * Loads trader definitions from /data/traders.json and provides them as a Record<string, Trader>.
 * 
 * @remarks
 * - Follows the same pattern as questDatabase and dialogueDatabase
 * - Loads asynchronously on first access
 * - Caches loaded data to prevent redundant fetches
 * - Returns empty object on error to prevent crashes
 * 
 * @example
 * const { traders, loadDatabase, isLoaded } = useTraderDatabaseStore();
 * 
 * // Load database (typically in App.tsx)
 * await loadDatabase();
 * 
 * // Access trader by ID
 * const marcus = traders['marcus'];
 */
export const useTraderDatabaseStore = create<TraderDatabaseState>((set, get) => ({
    isLoaded: false,
    traders: {},
    
    /**
     * Loads the trader database from JSON file.
     * 
     * @description Fetches /data/traders.json and converts it to a Record<string, Trader>.
     * Only loads once - subsequent calls are no-ops.
     * 
     * @remarks
     * - Called automatically during app initialization
     * - Safe to call multiple times (idempotent)
     * - Logs detailed progress for debugging
     * - Handles errors gracefully
     */
    loadDatabase: async () => {
        console.log('[TRADER STORE] loadDatabase called, isLoaded:', get().isLoaded);
        if (get().isLoaded) {
            console.log('[TRADER STORE] Already loaded, skip');
            return;
        }
        console.log('[TRADER STORE] Loading...');
        const db = await loadTraders();
        console.log('[TRADER STORE] loadTraders completed, traders received:', Object.keys(db).length);
        set({ traders: db, isLoaded: true });
        console.log('[TRADER STORE] ✅ Store updated! Final state:', Object.keys(get().traders).length);
    }
}));