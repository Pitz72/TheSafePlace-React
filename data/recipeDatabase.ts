import { create } from 'zustand';
import { Recipe } from '../types';

/**
 * Loads all recipes from the recipes.json file.
 * @returns {Promise<Recipe[]>} A promise that resolves to an array of recipes.
 */
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

/**
 * @interface RecipeDatabaseState
 * @description Represents the state of the recipe database store.
 * @property {boolean} isLoaded - Whether the recipe database has been loaded.
 * @property {Recipe[]} recipes - An array of recipes.
 * @property {() => Promise<void>} loadDatabase - Function to load the recipe database.
 */
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