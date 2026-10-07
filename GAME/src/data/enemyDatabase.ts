import { create } from 'zustand';
import { Enemy } from '../types';
import { fetchJson, indexById } from './fetchJson';

interface EnemyDatabaseState {
    isLoaded: boolean;
    enemyDatabase: Record<string, Enemy>;
    loadDatabase: () => Promise<void>;
}

export const useEnemyDatabaseStore = create<EnemyDatabaseState>((set, get) => ({
    isLoaded: false,
    enemyDatabase: {},
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const enemies = await fetchJson<Enemy[]>('data/enemies.json');
        set({ enemyDatabase: indexById(enemies), isLoaded: true });
    },
}));
