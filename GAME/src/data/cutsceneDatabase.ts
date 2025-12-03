import { create } from 'zustand';
import { Cutscene } from '../types';

/**
 * Loads all cutscenes from the cutscenes.json file.
 * @returns {Promise<Record<string, Cutscene>>} A promise that resolves to a record of cutscenes.
 */
async function loadAllCutscenes(): Promise<Record<string, Cutscene>> {
    try {
        const response = await fetch('data/cutscenes.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch cutscenes: ${response.statusText}`);
        }
        const cutscenesArray: Cutscene[] = await response.json();
        const cutsceneDb: Record<string, Cutscene> = {};
        cutscenesArray.forEach(scene => {
            cutsceneDb[scene.id] = scene;
        });
        return cutsceneDb;
    } catch (error) {
        console.error("Error loading cutscene database:", error);
        return {};
    }
}

/**
 * @interface CutsceneDatabaseState
 * @description Represents the state of the cutscene database store.
 * @property {boolean} isLoaded - Whether the cutscene database has been loaded.
 * @property {Record<string, Cutscene>} cutscenes - A record of cutscenes.
 * @property {() => Promise<void>} loadDatabase - Function to load the cutscene database.
 */
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
        const db = await loadAllCutscenes();
        set({ cutscenes: db, isLoaded: true });
    }
}));
