import { create } from 'zustand';
import { IItem } from '../types';

type RawItem = Omit<IItem, 'color'>;

/**
 * Loads all items from the items directory.
 * @returns {Promise<Record<string, IItem>>} A promise that resolves to a record of items.
 */
async function loadAllItems(): Promise<Record<string, IItem>> {
    const files = [
        './data/items/weapons.json',
        './data/items/armor.json',
        './data/items/consumables.json',
        './data/items/materials.json',
        './data/items/quest.json',
        './data/items/ammo.json',
        './data/items/repair_kits.json'
    ];
    try {
        const responses = await Promise.all(files.map(file => fetch(file)));
        for(const res of responses) {
            if (!res.ok) {
                throw new Error(`Failed to fetch ${res.url}: ${res.statusText}`);
            }
        }
        const jsonDataArrays = await Promise.all(responses.map(res => res.json()));

        const allRawItems: RawItem[] = jsonDataArrays.flat();
        
        const finalDatabase: Record<string, IItem> = {};

        allRawItems.forEach(item => {
            let color = '#ffffff'; // Default color: white

            switch (item.type) {
                case 'weapon':    color = '#ef4444'; break; // red-500
                case 'ammo':      color = '#f97316'; break; // orange-500
                case 'armor':     color = '#d1d5db'; break; // gray-300
                case 'material':  color = '#a16207'; break; // yellow-700
                case 'quest':     color = '#facc15'; break; // yellow-400
                case 'manual':    color = '#c084fc'; break; // purple-400
                case 'tool':      color = '#3b82f6'; break; // blue-500
                case 'consumable':
                    if (item.id.includes('med') || item.effects?.some(e => e.type === 'heal')) {
                        color = '#4ade80'; // green-400 for medical
                    } else if (item.effects?.some(e => e.type === 'hydration')) {
                        color = '#7dd3fc'; // sky-300
                    } else if (item.effects?.some(e => e.type === 'satiety')) {
                        color = '#fb923c'; // orange-400
                    } else {
                        color = '#a78bfa'; // violet-400 for other consumables
                    }
                    break;
                default:
                     color = '#ffffff';
            }
            finalDatabase[item.id] = { ...item, color };
        });

        return finalDatabase;
    } catch (error) {
        console.error("Error loading item database:", error);
        return {}; // Return empty DB on error
    }
}

/**
 * @interface ItemDatabaseState
 * @description Represents the state of the item database store.
 * @property {boolean} isLoaded - Whether the item database has been loaded.
 * @property {Record<string, IItem>} itemDatabase - A record of items.
 * @property {() => Promise<void>} loadDatabase - Function to load the item database.
 */
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
        const db = await loadAllItems();
        set({ itemDatabase: db, isLoaded: true });
    }
}));