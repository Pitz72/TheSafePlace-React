import { create } from 'zustand';
import { MainQuestChapter } from '../types';

async function loadMainQuest(): Promise<MainQuestChapter[]> {
    try {
        const response = await fetch('./data/mainQuest.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch main quest: ${response.statusText}`);
        }
        const chapters: MainQuestChapter[] = await response.json();
        // Sort by stage just in case the JSON is out of order
        return chapters.sort((a, b) => a.stage - b.stage);
    } catch (error) {
        console.error("Error loading main quest database:", error);
        return [];
    }
}

interface MainQuestDatabaseState {
    isLoaded: boolean;
    mainQuestChapters: MainQuestChapter[];
    loadDatabase: () => Promise<void>;
}

export const useMainQuestDatabaseStore = create<MainQuestDatabaseState>((set, get) => ({
    isLoaded: false,
    mainQuestChapters: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const chapters = await loadMainQuest();
        set({ mainQuestChapters: chapters, isLoaded: true });
    }
}));
