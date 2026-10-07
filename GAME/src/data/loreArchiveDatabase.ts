import { create } from 'zustand';
import { LoreEntry } from '../types';
import { fetchJson, indexById } from './fetchJson';

interface LoreArchiveDatabaseState {
    isLoaded: boolean;
    loreEntries: Record<string, LoreEntry>;
    loadDatabase: () => Promise<void>;
}

export const useLoreArchiveDatabaseStore = create<LoreArchiveDatabaseState>((set, get) => ({
    isLoaded: false,
    loreEntries: {},
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const entries = await fetchJson<LoreEntry[]>('data/lore_archive.json');
        set({ loreEntries: indexById(entries), isLoaded: true });
    },
}));
