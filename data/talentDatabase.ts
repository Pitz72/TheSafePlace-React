import { create } from 'zustand';
import { Talent } from '../types';

async function loadAllTalents(): Promise<Talent[]> {
    try {
        const response = await fetch('./data/talents.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch talents: ${response.statusText}`);
        }
        const talents: Talent[] = await response.json();
        return talents;
    } catch (error) {
        console.error("Error loading talent database:", error);
        return [];
    }
}

interface TalentDatabaseState {
    isLoaded: boolean;
    talents: Talent[];
    loadDatabase: () => Promise<void>;
}

export const useTalentDatabaseStore = create<TalentDatabaseState>((set, get) => ({
    isLoaded: false,
    talents: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const talents = await loadAllTalents();
        set({ talents, isLoaded: true });
    }
}));