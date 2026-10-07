import { create } from 'zustand';
import { IItem } from '../types';
import { fetchJson } from './fetchJson';

type RawItem = Omit<IItem, 'color'>;

const ITEM_FILES = [
    'weapons', 'armor', 'consumables', 'materials', 'quest',
    'ammo', 'restored_items', 'repair_kits', 'unique_items',
].map(name => `data/items/${name}.json`);

/** Display color by item category. */
export function itemColor(item: RawItem): string {
    switch (item.type) {
        case 'weapon': return '#ef4444';
        case 'ammo': return '#f97316';
        case 'armor': return '#d1d5db';
        case 'material': return '#a16207';
        case 'valuable': return '#fde047';
        case 'quest': return '#facc15';
        case 'manual': return '#c084fc';
        case 'tool': return '#94a3b8';
        case 'consumable':
            if (item.effects?.some(e => e.type === 'heal' || e.type === 'cureStatus')) return '#4ade80';
            if (item.effects?.some(e => e.type === 'hydration')) return '#7dd3fc';
            if (item.effects?.some(e => e.type === 'satiety')) return '#fb923c';
            return '#a78bfa';
        default: return '#ffffff';
    }
}

/** Builds the item database; later files override earlier ones on duplicate ids. */
export function buildItemDatabase(lists: RawItem[][]): Record<string, IItem> {
    const database: Record<string, IItem> = {};
    for (const item of lists.flat()) {
        database[item.id] = { ...item, color: itemColor(item) };
    }
    return database;
}

/** Quest items can't be dropped, sold or salvaged. */
export const isQuestItem = (item: Pick<IItem, 'type'> | undefined | null): boolean => item?.type === 'quest';

interface ItemDatabaseState {
    isLoaded: boolean;
    itemDatabase: Record<string, IItem>;
    loadDatabase: () => Promise<void>;
}

export const useItemDatabaseStore = create<ItemDatabaseState>((set, get) => ({
    isLoaded: false,
    itemDatabase: {},
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const lists = await Promise.all(ITEM_FILES.map(file => fetchJson<RawItem[]>(file)));
        set({ itemDatabase: buildItemDatabase(lists), isLoaded: true });
    },
}));
