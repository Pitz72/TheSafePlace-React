import { create } from 'zustand';
import { PointOfInterest } from '../types';
import { fetchJson } from './fetchJson';

/** Static points of interest (data/pois.json). Runtime state lives in gameStore.pois. */
interface PoiDatabaseState {
    isLoaded: boolean;
    pois: PointOfInterest[];
    loadDatabase: () => Promise<void>;
}

export const usePoiDatabaseStore = create<PoiDatabaseState>((set, get) => ({
    isLoaded: false,
    pois: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const pois = await fetchJson<PointOfInterest[]>('data/pois.json');
        set({ pois, isLoaded: true });
    },
}));
