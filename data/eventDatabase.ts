import { create } from 'zustand';
import { GameEvent } from '../types';

async function loadEvents(): Promise<{ biomeEvents: GameEvent[], globalEncounters: GameEvent[], loreEvents: GameEvent[] }> {
    const biomeFiles = [
        './data/events/plains.json',
        './data/events/forest.json',
        './data/events/village.json',
        './data/events/city.json'
    ];
    const encounterFile = './data/events/encounters.json';
    const loreFile = './data/events/lore.json';

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

        return { biomeEvents, globalEncounters, loreEvents };

    } catch (error) {
        console.error("Error loading event database:", error);
        return { biomeEvents: [], globalEncounters: [], loreEvents: [] };
    }
}


interface EventDatabaseState {
    isLoaded: boolean;
    biomeEvents: GameEvent[];
    globalEncounters: GameEvent[];
    loreEvents: GameEvent[];
    loadDatabase: () => Promise<void>;
}

export const useEventDatabaseStore = create<EventDatabaseState>((set, get) => ({
    isLoaded: false,
    biomeEvents: [],
    globalEncounters: [],
    loreEvents: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const { biomeEvents, globalEncounters, loreEvents } = await loadEvents();
        set({ biomeEvents, globalEncounters, loreEvents, isLoaded: true });
    }
}));