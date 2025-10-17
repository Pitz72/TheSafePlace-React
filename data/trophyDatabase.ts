import { create } from 'zustand';
import { Trophy } from '../types';

async function loadAllTrophies(): Promise<Trophy[]> {
    try {
        const response = await fetch('./data/trophies.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch trophies: ${response.statusText}`);
        }
        const trophies: Trophy[] = await response.json();
        return trophies;
    } catch (error) {
        console.error("Error loading trophy database:", error);
        return [];
    }
}

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
        const trophies = await loadAllTrophies();
        set({ trophies, isLoaded: true });
    }
}));
