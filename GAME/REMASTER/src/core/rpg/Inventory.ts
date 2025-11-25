export const ItemType = {
    CONSUMABLE: 'consumable',
    WEAPON: 'weapon',
    ARMOR: 'armor',
    KEY: 'key',
    MISC: 'misc'
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    stackable: boolean;
    maxStack?: number;
    value?: number;
    icon?: string; // Path to icon

    // Specific properties
    effects?: {
        hpRestore?: number;
        sanityRestore?: number;
        staminaRestore?: number;
    };
}

export interface InventorySlot {
    item: Item;
    quantity: number;
}
