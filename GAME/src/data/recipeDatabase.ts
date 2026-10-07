import { create } from 'zustand';
import { Recipe } from '../types';
import { fetchJson } from './fetchJson';

interface RecipeDatabaseState {
    isLoaded: boolean;
    recipes: Recipe[];
    loadDatabase: () => Promise<void>;
}

export const useRecipeDatabaseStore = create<RecipeDatabaseState>((set, get) => ({
    isLoaded: false,
    recipes: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const recipes = await fetchJson<Recipe[]>('data/recipes.json');
        set({ recipes, isLoaded: true });
    },
}));
