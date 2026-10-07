import { create } from 'zustand';
import { fetchJson } from './fetchJson';

export interface LootEntry {
    itemId: string;
    weight: number;
    min: number;
    max: number;
    /** Only dropped by humanoid / beast enemies. */
    humanoidOnly?: boolean;
    beastOnly?: boolean;
}

export interface LootTables {
    activeSearch: Record<string, LootEntry[]>;
    refugeSearch: LootEntry[];
    combat: Record<'common' | 'uncommon' | 'rare', LootEntry[]>;
    randomItem: LootEntry[];
    fishing: LootEntry[];
}

const EMPTY: LootTables = {
    activeSearch: {},
    refugeSearch: [],
    combat: { common: [], uncommon: [], rare: [] },
    randomItem: [],
    fishing: [],
};

interface LootTableState {
    isLoaded: boolean;
    tables: LootTables;
    loadDatabase: () => Promise<void>;
}

export const useLootTableStore = create<LootTableState>((set, get) => ({
    isLoaded: false,
    tables: EMPTY,
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const tables = await fetchJson<LootTables>('data/loot_tables.json');
        set({ tables, isLoaded: true });
    },
}));

/** Weighted pick from a loot table. Returns null on an empty table. */
export function rollLoot(table: LootEntry[], random: () => number = Math.random): { itemId: string; quantity: number } | null {
    const total = table.reduce((sum, entry) => sum + entry.weight, 0);
    if (total <= 0) return null;
    let roll = random() * total;
    for (const entry of table) {
        roll -= entry.weight;
        if (roll < 0) {
            const quantity = entry.min + Math.floor(random() * (entry.max - entry.min + 1));
            return { itemId: entry.itemId, quantity };
        }
    }
    const last = table[table.length - 1];
    return { itemId: last.itemId, quantity: last.min };
}
