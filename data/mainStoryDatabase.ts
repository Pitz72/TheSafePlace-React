import { create } from 'zustand';
import { MainStoryChapter } from '../types';

/**
 * Loads the main story from the mainStory.json file.
 * @returns {Promise<MainStoryChapter[]>} A promise that resolves to an array of main story chapters.
 */
async function loadMainStory(): Promise<MainStoryChapter[]> {
    try {
        const response = await fetch('/data/mainStory.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch main story: ${response.statusText}`);
        }
        const chapters: MainStoryChapter[] = await response.json();
        // Sort by stage just in case the JSON is out of order
        return chapters.sort((a, b) => a.stage - b.stage);
    } catch (error) {
        console.error("Error loading main story database:", error);
        return [];
    }
}

/**
 * @interface MainStoryDatabaseState
 * @description Represents the state of the main story database store.
 * @property {boolean} isLoaded - Whether the main story database has been loaded.
 * @property {MainStoryChapter[]} mainStoryChapters - An array of main story chapters.
 * @property {() => Promise<void>} loadDatabase - Function to load the main story database.
 */
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
        const chapters = await loadMainStory();
        set({ mainStoryChapters: chapters, isLoaded: true });
    }
}));

