import { create } from 'zustand';
import { MainStoryChapter } from '../types';
import { fetchJson } from './fetchJson';

interface MainStoryDatabaseState {
    isLoaded: boolean;
    mainStoryChapters: MainStoryChapter[];
    loadDatabase: () => Promise<void>;
}

export const useMainStoryDatabaseStore = create<MainStoryDatabaseState>((set, get) => ({
    isLoaded: false,
    mainStoryChapters: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const chapters = await fetchJson<MainStoryChapter[]>('data/mainStory.json');
        set({ mainStoryChapters: [...chapters].sort((a, b) => a.stage - b.stage), isLoaded: true });
    },
}));
