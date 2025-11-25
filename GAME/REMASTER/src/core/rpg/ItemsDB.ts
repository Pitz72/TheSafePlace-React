import type { Item } from './Inventory';
import { ItemType } from './Inventory';

export const ITEMS: Record<string, Item> = {
    'medkit_small': {
        id: 'medkit_small',
        name: 'Piccolo Medikit',
        description: 'Un kit di pronto soccorso base. Restituisce 20 HP.',
        type: ItemType.CONSUMABLE,
        stackable: true,
        maxStack: 5,
        value: 10,
        effects: {
            hpRestore: 20
        }
    },
    'bandage': {
        id: 'bandage',
        name: 'Benda Sporca',
        description: 'Meglio di niente. Ferma il sanguinamento.',
        type: ItemType.CONSUMABLE,
        stackable: true,
        maxStack: 10,
        value: 2,
        effects: {
            hpRestore: 5
        }
    },
    'rusty_knife': {
        id: 'rusty_knife',
        name: 'Coltello Arrugginito',
        description: 'Un vecchio coltello da cucina. Poco affilato.',
        type: ItemType.WEAPON,
        stackable: false,
        value: 15
    },
    'apartment_key': {
        id: 'apartment_key',
        name: 'Chiave Appartamento',
        description: 'La chiave del tuo vecchio appartamento.',
        type: ItemType.KEY,
        stackable: false,
        value: 0
    },
    'canned_food': {
        id: 'canned_food',
        name: 'Cibo in Scatola',
        description: 'Fagioli stantii. Nutrienti.',
        type: ItemType.CONSUMABLE,
        stackable: true,
        maxStack: 10,
        value: 5,
        effects: {
            staminaRestore: 15
        }
    }
};

export const ItemsDB = {
    getItem: (id: string): Item | undefined => {
        return ITEMS[id];
    },

    getAllItems: (): Item[] => {
        return Object.values(ITEMS);
    }
};
