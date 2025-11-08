import { create } from 'zustand';
import { Enemy } from '../types';

/**
 * Loads all enemies from the enemies.json file.
 * @returns {Promise<Record<string, Enemy>>} A promise that resolves to a record of enemies.
 */
async function loadAllEnemies(): Promise<Record<string, Enemy>> {
    try {
        const response = await fetch('data/enemies.json');
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

/**
 * @interface EnemyDatabaseState
 * @description Represents the state of the enemy database store.
 * @property {boolean} isLoaded - Whether the enemy database has been loaded.
 * @property {Record<string, Enemy>} enemyDatabase - A record of enemies.
 * @property {() => Promise<void>} loadDatabase - Function to load the enemy database.
 */
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