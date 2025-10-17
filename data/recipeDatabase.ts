import { create } from 'zustand';
import { Recipe } from '../types';

async function loadAllRecipes(): Promise<Recipe[]> {
    try {
        const response = await fetch('./data/recipes.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch recipes: ${response.statusText}`);
        }
        const recipes: Recipe[] = await response.json();
        return recipes;
    } catch (error) {
        console.error("Error loading recipe database:", error);
        return [];
    }
}

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
        const recipes = await loadAllRecipes();
        set({ recipes, isLoaded: true });
    }
}));