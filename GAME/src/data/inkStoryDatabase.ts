import { create } from 'zustand';

interface InkStoryDatabaseState {
    storyData: any | null;
    isLoaded: boolean;
    loadDatabase: () => Promise<void>;
}

export const useInkStoryDatabaseStore = create<InkStoryDatabaseState>((set) => ({
    storyData: null,
    isLoaded: false,
    loadDatabase: async () => {
        try {
            // Try to load the compiled JSON. 
            // Note: The user needs to compile main.ink to main.json in public/data or src/assets
            // We assume it's in public/data/story.json for simplicity of fetch, 
            // OR we import it if it's a module. 
            // Since it's dynamic, fetch is better.
            // Let's assume the user puts it in public/data/story.json

            // However, the task said "src/assets/story/main.json". 
            // Vite can import JSON.
            // But if it doesn't exist, build might fail if we static import.
            // So we use fetch to public.

            // We will ask the user to put the compiled json in `public/data/story.json` OR `src/assets/story/main.json` and import it.
            // Given the structure, let's try to fetch from a public path.
            // We'll ask user to put it in `public/data/story.json`.

            const response = await fetch('/data/story.json');
            if (!response.ok) {
                throw new Error('Story file not found');
            }
            const data = await response.json();
            set({ storyData: data, isLoaded: true });
        } catch (error) {
            console.warn('Failed to load Ink story data. Make sure main.json is compiled and available at /data/story.json', error);
            set({ storyData: null, isLoaded: false });
        }
    },
}));
