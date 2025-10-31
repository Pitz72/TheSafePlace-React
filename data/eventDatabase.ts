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
        '/data/events/forest_thief.json'
    ];
    const encounterFile = '/data/events/encounters.json';
    const loreFile = '/data/events/lore.json';
    const easterEggFile = '/data/events/easter_eggs.json';

    try {
        const biomeResponses = await Promise.all(biomeFiles.map(file => fetch(file)));
        for (const res of biomeResponses) {
            if (!res.ok) throw new Error(`Failed to fetch ${res.url}: ${res.statusText}`);
        }
        const biomeEventArrays: GameEvent[][] = await Promise.all(biomeResponses.map(res => res.json()));
        const biomeEvents = biomeEventArrays.flat();

        const encounterResponse = await fetch(encounterFile);
        if (!encounterResponse.ok) throw new Error(`Failed to fetch ${encounterResponse.url}: ${encounterResponse.statusText}`);
        const globalEncounters: GameEvent[] = await encounterResponse.json();
        
        const loreResponse = await fetch(loreFile);
        if (!loreResponse.ok) throw new Error(`Failed to fetch ${loreResponse.url}: ${loreResponse.statusText}`);
        const loreEvents: GameEvent[] = await loreResponse.json();
        
        const easterEggResponse = await fetch(easterEggFile);
        if (!easterEggResponse.ok) throw new Error(`Failed to fetch ${easterEggResponse.url}: ${easterEggResponse.statusText}`);
        const easterEggEvents: GameEvent[] = await easterEggResponse.json();

        return { biomeEvents, globalEncounters, loreEvents, easterEggEvents };

    } catch (error) {
        console.error("Error loading event database:", error);
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
        if (get().isLoaded) return;
        const { biomeEvents, globalEncounters, loreEvents, easterEggEvents } = await loadEvents();
        set({ biomeEvents, globalEncounters, loreEvents, easterEggEvents, isLoaded: true });
    }
}));