import { create } from 'zustand';
import { Talent } from '../types';
import { fetchJson } from './fetchJson';

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
        const talents = await fetchJson<Talent[]>('data/talents.json');
        set({ talents, isLoaded: true });
    },
}));
