import { create } from 'zustand';
import { Trophy } from '../types';
import { fetchJson } from './fetchJson';

interface TrophyDatabaseState {
    isLoaded: boolean;
    trophies: Trophy[];
    loadDatabase: () => Promise<void>;
}

export const useTrophyDatabaseStore = create<TrophyDatabaseState>((set, get) => ({
    isLoaded: false,
    trophies: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const trophies = await fetchJson<Trophy[]>('data/trophies.json');
        set({ trophies, isLoaded: true });
    },
}));
