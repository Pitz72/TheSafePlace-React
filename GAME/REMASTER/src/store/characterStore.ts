import { create } from 'zustand';
import type { CharacterState, Attributes } from '../types';

const initialAttributes: Attributes = {
    for: 10,
    des: 10,
    cos: 10,
    int: 10,
    sag: 10,
    car: 10,
};

export const useCharacterStore = create<CharacterState>((set) => ({
    attributes: { ...initialAttributes },
    hp: { current: 100, max: 100 },
    satiety: { current: 100, max: 100 },
    hydration: { current: 100, max: 100 },
    fatigue: { current: 0, max: 100 },
    level: 1,
    xp: { current: 0, max: 100 },
    inventory: [],

    setAttributes: (newAttributes) => {
        set(() => {
            const newCos = newAttributes.cos;
            const cosModifier = Math.floor((newCos - 10) / 2);
            const newMaxHp = 100 + (cosModifier * 10);
            return {
                attributes: newAttributes,
                hp: { max: newMaxHp, current: newMaxHp }
            };
        });
    },

    decreaseSatiety: (amount) => set((state) => ({
        satiety: { ...state.satiety, current: Math.max(0, state.satiety.current - amount) }
    })),

    decreaseHydration: (amount) => set((state) => ({
        hydration: { ...state.hydration, current: Math.max(0, state.hydration.current - amount) }
    })),

    increaseFatigue: (amount) => set((state) => ({
        fatigue: { ...state.fatigue, current: Math.min(state.fatigue.max, state.fatigue.current + amount) }
    })),

    initCharacter: () => {
        set({
            attributes: { ...initialAttributes },
            hp: { current: 100, max: 100 },
            satiety: { current: 100, max: 100 },
            hydration: { current: 100, max: 100 },
            fatigue: { current: 0, max: 100 },
            level: 1,
            xp: { current: 0, max: 100 },
            inventory: [],
        });
    },

    addItem: (item) => set((state) => {
        const existingItem = state.inventory.find(i => i.id === item.id);
        if (existingItem) {
            return {
                inventory: state.inventory.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                )
            };
        }
        return { inventory: [...state.inventory, item] };
    }),

    removeItem: (itemId, quantity) => set((state) => {
        return {
            inventory: state.inventory.map(i => {
                if (i.id === itemId) {
                    return { ...i, quantity: Math.max(0, i.quantity - quantity) };
                }
                return i;
            }).filter(i => i.quantity > 0)
        };
    })
}));
