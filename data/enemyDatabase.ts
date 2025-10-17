import { create } from 'zustand';
import { Enemy } from '../types';

async function loadAllEnemies(): Promise<Record<string, Enemy>> {
    try {
        const response = await fetch('./data/enemies.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch enemies: ${response.statusText}`);
        }
        const enemiesArray: Enemy[] = await response.json();
        const enemyDb: Record<string, Enemy> = {};
        enemiesArray.forEach(enemy => {
            enemyDb[enemy.id] = enemy;
        });
        return enemyDb;
    } catch (error) {
        console.error("Error loading enemy database:", error);
        return {};
    }
}

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
        const db = await loadAllEnemies();
        set({ enemyDatabase: db, isLoaded: true });
    }
}));