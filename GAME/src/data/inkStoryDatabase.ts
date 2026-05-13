import { create } from 'zustand';
import storyJson from '../assets/story/main.json';

interface InkStoryDatabaseState {
    storyData: unknown;
    isLoaded: boolean;
    loadDatabase: () => Promise<void>;
}

// The compiled Ink story is bundled at build time from src/assets/story/main.json.
// Recompile by running `npm run compile:ink` (also runs automatically before dev/build).
export const useInkStoryDatabaseStore = create<InkStoryDatabaseState>((set) => ({
    storyData: storyJson,
    isLoaded: true,
    loadDatabase: async () => {
        // Story is already bundled via the static import above; this is kept
        // as a no-op for backward compatibility with callers that await it.
        set({ storyData: storyJson, isLoaded: true });
    },
}));
