import { create } from 'zustand';
import { Cutscene } from '../types';
import { fetchJson, indexById } from './fetchJson';

interface CutsceneDatabaseState {
    isLoaded: boolean;
    cutscenes: Record<string, Cutscene>;
    loadDatabase: () => Promise<void>;
}

export const useCutsceneDatabaseStore = create<CutsceneDatabaseState>((set, get) => ({
    isLoaded: false,
    cutscenes: {},
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const cutscenes = await fetchJson<Cutscene[]>('data/cutscenes.json');
        set({ cutscenes: indexById(cutscenes), isLoaded: true });
    },
}));
