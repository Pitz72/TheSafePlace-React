import { create } from 'zustand';
import { GameEvent } from '../types';

/**
 * Loads all events from the events directory.
 * @returns {Promise<{ biomeEvents: GameEvent[], globalEncounters: GameEvent[], loreEvents: GameEvent[], easterEggEvents: GameEvent[] }>} A promise that resolves to an object containing all events.
 */
async function loadEvents(): Promise<{ biomeEvents: GameEvent[], globalEncounters: GameEvent[], loreEvents: GameEvent[], easterEggEvents: GameEvent[] }> {
    const biomeFiles = [
        '/data/events/plains.json',
        '/data/events/forest.json',
        '/data/events/village.json',
        '/data/events/city.json',
        '/data/events/river_events.json',
        '/data/events/unique_events.json',
        '/data/events/village_pump.json',
        '/data/events/forest_thief.json',
        '/data/events/special_locations.json',
        '/data/events/hermit_location.json',
        '/data/events/repair_quests.json',
        '/data/events/olivia_herbalist.json',
        '/data/events/arsonist_quest.json'
    ];
    const encounterFile = '/data/events/encounters.json';
    const loreFile = '/data/events/lore.json';
    const easterEggFile = '/data/events/easter_eggs.json';

    try {
        console.log('[EVENT DB] Loading biome events from:', biomeFiles.length, 'files');
        const biomeResponses = await Promise.all(biomeFiles.map(file => fetch(file)));
        for (const res of biomeResponses) {
            if (!res.ok) throw new Error(`Failed to fetch ${res.url}: ${res.statusText}`);
        }
        console.log('[EVENT DB] All biome files fetched successfully, parsing JSON...');
        const biomeEventArrays: GameEvent[][] = await Promise.all(biomeResponses.map(res => res.json()));
        const biomeEvents = biomeEventArrays.flat();
        console.log('[EVENT DB] Biome events loaded:', biomeEvents.length);

        const encounterResponse = await fetch(encounterFile);
        if (!encounterResponse.ok) throw new Error(`Failed to fetch ${encounterResponse.url}: ${encounterResponse.statusText}`);
        const globalEncounters: GameEvent[] = await encounterResponse.json();
        console.log('[EVENT DB] Global encounters loaded:', globalEncounters.length);
        
        const loreResponse = await fetch(loreFile);
        if (!loreResponse.ok) throw new Error(`Failed to fetch ${loreResponse.url}: ${loreResponse.statusText}`);
        const loreEvents: GameEvent[] = await loreResponse.json();
        console.log('[EVENT DB] Lore events loaded:', loreEvents.length);
        
        const easterEggResponse = await fetch(easterEggFile);
        if (!easterEggResponse.ok) throw new Error(`Failed to fetch ${easterEggResponse.url}: ${easterEggResponse.statusText}`);
        const easterEggEvents: GameEvent[] = await easterEggResponse.json();
        console.log('[EVENT DB] Easter egg events loaded:', easterEggEvents.length);

        console.log('[EVENT DB] ✅ All events loaded successfully! Total:', biomeEvents.length + globalEncounters.length + loreEvents.length + easterEggEvents.length);
        return { biomeEvents, globalEncounters, loreEvents, easterEggEvents };

    } catch (error) {
        console.error("[EVENT DB] ❌ ERROR loading event database:", error);
        return { biomeEvents: [], globalEncounters: [], loreEvents: [], easterEggEvents: [] };
    }
}

/**
 * @interface EventDatabaseState
 * @description Represents the state of the event database store.
 * @property {boolean} isLoaded - Whether the event database has been loaded.
 * @property {GameEvent[]} biomeEvents - An array of biome-specific events.
 * @property {GameEvent[]} globalEncounters - An array of global encounters.
 * @property {GameEvent[]} loreEvents - An array of lore events.
 * @property {GameEvent[]} easterEggEvents - An array of easter egg events.
 * @property {() => Promise<void>} loadDatabase - Function to load the event database.
 */
interface EventDatabaseState {
    isLoaded: boolean;
    biomeEvents: GameEvent[];
    globalEncounters: GameEvent[];
    loreEvents: GameEvent[];
    easterEggEvents: GameEvent[];
    loadDatabase: () => Promise<void>;
}

export const useEventDatabaseStore = create<EventDatabaseState>((set, get) => ({
    isLoaded: false,
    biomeEvents: [],
    globalEncounters: [],
    loreEvents: [],
    easterEggEvents: [],
    loadDatabase: async () => {
        console.log('[EVENT STORE] loadDatabase called, isLoaded:', get().isLoaded);
        if (get().isLoaded) {
            console.log('[EVENT STORE] Already loaded, skip');
            return;
        }
        console.log('[EVENT STORE] Loading...');
        const { biomeEvents, globalEncounters, loreEvents, easterEggEvents } = await loadEvents();
        console.log('[EVENT STORE] loadEvents completed. Biome:', biomeEvents.length, 'Encounters:', globalEncounters.length, 'Lore:', loreEvents.length, 'Easter eggs:', easterEggEvents.length);
        set({ biomeEvents, globalEncounters, loreEvents, easterEggEvents, isLoaded: true });
        console.log('[EVENT STORE] ✅ Store updated! Final state - Total events:', biomeEvents.length + globalEncounters.length + loreEvents.length + easterEggEvents.length);
    }
}));