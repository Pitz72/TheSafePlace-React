import { create } from 'zustand';
import { MainQuestChapter } from '../types';

/**
 * Loads the main quest from the mainQuest.json file.
 * @returns {Promise<MainQuestChapter[]>} A promise that resolves to an array of main quest chapters.
 */
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

/**
 * @interface MainQuestDatabaseState
 * @description Represents the state of the main quest database store.
 * @property {boolean} isLoaded - Whether the main quest database has been loaded.
 * @property {MainQuestChapter[]} mainQuestChapters - An array of main quest chapters.
 * @property {() => Promise<void>} loadDatabase - Function to load the main quest database.
 */
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
