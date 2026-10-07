import { create } from 'zustand';
import { Trader } from '../types';
import { fetchJson, indexById } from './fetchJson';

interface TraderDatabaseState {
    isLoaded: boolean;
    traders: Record<string, Trader>;
    loadDatabase: () => Promise<void>;
}

export const useTraderDatabaseStore = create<TraderDatabaseState>((set, get) => ({
    isLoaded: false,
    traders: {},
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const traders = await fetchJson<Trader[]>('data/traders.json');
        set({ traders: indexById(traders), isLoaded: true });
    },
}));
