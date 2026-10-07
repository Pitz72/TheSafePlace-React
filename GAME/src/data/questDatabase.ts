import { create } from 'zustand';
import { Quest } from '../types';
import { fetchJson, indexById } from './fetchJson';

interface QuestDatabaseState {
    isLoaded: boolean;
    quests: Record<string, Quest>;
    loadDatabase: () => Promise<void>;
}

export const useQuestDatabaseStore = create<QuestDatabaseState>((set, get) => ({
    isLoaded: false,
    quests: {},
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const quests = await fetchJson<Quest[]>('data/quests.json');
        set({ quests: indexById(quests), isLoaded: true });
    },
}));
