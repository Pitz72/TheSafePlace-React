import { create } from 'zustand';
import type { Attributes, Vitals } from './rpg/Stats';
import { DEFAULT_ATTRIBUTES, DEFAULT_VITALS } from './rpg/Stats';
import type { Item, InventorySlot } from './rpg/Inventory';

interface GameState {
    // RPG State
    attributes: Attributes;
    vitals: Vitals;

    // Inventory
    inventory: InventorySlot[];
    gold: number;

    // Time
    timeElapsed: number; // Total minutes passed since start

    // Narrative
    isDialogueOpen: boolean;
    currentDialogueText: string;
    currentChoices: { text: string; index: number }[];

    // Actions
    setHp: (hp: number) => void;
    modifyVitals: (vital: keyof Vitals, amount: number) => void;

    addItem: (item: Item, quantity?: number) => void;
    removeItem: (itemId: string, quantity?: number) => boolean;
    hasItem: (itemId: string, quantity?: number) => boolean;

    advanceTime: (minutes: number) => void;

    setDialogueState: (isOpen: boolean, text: string, choices: any[]) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    attributes: { ...DEFAULT_ATTRIBUTES },
    vitals: { ...DEFAULT_VITALS },

    inventory: [],
    gold: 0,

    timeElapsed: 0,

    isDialogueOpen: false,
    currentDialogueText: '',
    currentChoices: [],

    setHp: (hp) => set((state) => ({
        vitals: { ...state.vitals, hp: Math.min(Math.max(hp, 0), state.vitals.maxHp) }
    })),

    modifyVitals: (vital, amount) => set((state) => {
        const current = state.vitals[vital];
        return { vitals: { ...state.vitals, [vital]: current + amount } };
    }),

    addItem: (item, quantity = 1) => set((state) => {
        const existingSlotIndex = state.inventory.findIndex(slot => slot.item.id === item.id);

        if (existingSlotIndex >= 0 && item.stackable) {
            // Stack existing item
            const newInventory = [...state.inventory];
            newInventory[existingSlotIndex].quantity += quantity;
            return { inventory: newInventory };
        } else {
            // Add new slot
            return { inventory: [...state.inventory, { item, quantity }] };
        }
    }),

    removeItem: (itemId, quantity = 1) => {
        const state = get();
        const slotIndex = state.inventory.findIndex(slot => slot.item.id === itemId);

        if (slotIndex === -1) return false;

        const slot = state.inventory[slotIndex];
        if (slot.quantity < quantity) return false;

        const newInventory = [...state.inventory];
        if (slot.quantity === quantity) {
            newInventory.splice(slotIndex, 1);
        } else {
            newInventory[slotIndex].quantity -= quantity;
        }

        set({ inventory: newInventory });
        return true;
    },

    hasItem: (itemId, quantity = 1) => {
        const state = get();
        const slot = state.inventory.find(s => s.item.id === itemId);
        return slot ? slot.quantity >= quantity : false;
    },

    advanceTime: (minutes) => set((state) => ({ timeElapsed: state.timeElapsed + minutes })),

    setDialogueState: (isOpen, text, choices) => set({
        isDialogueOpen: isOpen,
        currentDialogueText: text,
        currentChoices: choices
    }),
}));
