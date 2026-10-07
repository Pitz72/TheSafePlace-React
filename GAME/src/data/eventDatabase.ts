import { create } from 'zustand';
import { GameEvent } from '../types';
import { fetchJson } from './fetchJson';

/** Biome event files (random encounters by biome, plus quest/POI-only events). */
const BIOME_FILES = [
    'plains', 'forest', 'village', 'city', 'river_events', 'unique_events',
    'village_pump', 'forest_thief', 'special_locations', 'hermit_location',
    'repair_quests', 'olivia_herbalist', 'arsonist_quest', 'unique_donor_events', 'poi_events',
].map(name => `data/events/${name}.json`);

interface EventDatabaseState {
    isLoaded: boolean;
    biomeEvents: GameEvent[];
    globalEncounters: GameEvent[];
    loreEvents: GameEvent[];
    easterEggEvents: GameEvent[];
    loadDatabase: () => Promise<void>;
    /** Looks an event up by id across every list. */
    getEvent: (eventId: string) => GameEvent | undefined;
}

export const useEventDatabaseStore = create<EventDatabaseState>((set, get) => ({
    isLoaded: false,
    biomeEvents: [],
    globalEncounters: [],
    loreEvents: [],
    easterEggEvents: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const [biomeLists, globalEncounters, loreEvents, easterEggEvents] = await Promise.all([
            Promise.all(BIOME_FILES.map(file => fetchJson<GameEvent[]>(file))),
            fetchJson<GameEvent[]>('data/events/encounters.json'),
            fetchJson<GameEvent[]>('data/events/lore.json'),
            fetchJson<GameEvent[]>('data/events/easter_eggs.json'),
        ]);
        set({ biomeEvents: biomeLists.flat(), globalEncounters, loreEvents, easterEggEvents, isLoaded: true });
    },
    getEvent: (eventId) => {
        const { biomeEvents, globalEncounters, loreEvents, easterEggEvents } = get();
        return [...biomeEvents, ...globalEncounters, ...loreEvents, ...easterEggEvents].find(e => e.id === eventId);
    },
}));
