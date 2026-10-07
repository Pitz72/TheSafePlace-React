import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { Ingredient, JournalEntryType, Recipe } from '../types';
import { audioManager } from '../utils/audio';
import { SKILL_LABELS } from '../constants';
import { questService } from './questService';

/** Armaiolo da Campo: crafted gear is sturdier and quicker to make. */
const ARMORER_DURABILITY_BONUS = 10;
const ARMORER_TIME_FACTOR = 0.8;

const findRecipe = (recipeId: string): Recipe | undefined =>
    useRecipeDatabaseStore.getState().recipes.find(r => r.id === recipeId);

export const craftingService = {
    /** Ingredients the player is still missing (with the missing quantity). */
    getMissingIngredients: (recipe: Recipe): Ingredient[] => {
        const { getItemCount } = useCharacterStore.getState();
        return recipe.ingredients
            .map(ing => ({ itemId: ing.itemId, quantity: ing.quantity - getItemCount(ing.itemId) }))
            .filter(ing => ing.quantity > 0);
    },

    canCraft: (recipeId: string): boolean => {
        const recipe = findRecipe(recipeId);
        return !!recipe && craftingService.getMissingIngredients(recipe).length === 0;
    },

    /** Minutes the recipe takes for this character. */
    getTimeCost: (recipe: Recipe): number =>
        Math.round(recipe.timeCost * (useCharacterStore.getState().hasTalent('field_armorer') ? ARMORER_TIME_FACTOR : 1)),

    craft: (recipeId: string): boolean => {
        const recipe = findRecipe(recipeId);
        const { addJournalEntry } = useGameStore.getState();
        if (!recipe) {
            console.error(`[CRAFTING] Recipe ${recipeId} not found`);
            return false;
        }
        if (!useCharacterStore.getState().knownRecipes.includes(recipeId)) return false;
        if (!craftingService.canCraft(recipeId)) {
            addJournalEntry({ text: 'Non hai abbastanza materiali per creare questo oggetto.', type: JournalEntryType.SYSTEM_WARNING });
            audioManager.playSound('error');
            return false;
        }

        const minutes = craftingService.getTimeCost(recipe);
        useTimeStore.getState().advanceTime(minutes, true);
        if (useCharacterStore.getState().hp.current <= 0) return false;

        const character = useCharacterStore.getState();
        const check = character.performSkillCheck(recipe.skill, recipe.dc);
        const checkText = `[${SKILL_LABELS[recipe.skill] ?? recipe.skill}] ${check.roll} + ${check.bonus} = ${check.total} vs CD ${recipe.dc}`;
        if (!check.success) {
            // A failed attempt wastes half of every ingredient (rounded up).
            recipe.ingredients.forEach(ing => character.removeItem(ing.itemId, Math.ceil(ing.quantity * 0.5)));
            addJournalEntry({ text: `${checkText} — Creazione fallita: hai sprecato parte dei materiali. (${minutes} min)`, type: JournalEntryType.SKILL_CHECK_FAILURE });
            audioManager.playSound('error');
            return false;
        }

        recipe.ingredients.forEach(ing => character.removeItem(ing.itemId, ing.quantity));
        const { itemDatabase } = useItemDatabaseStore.getState();
        const armorer = character.hasTalent('field_armorer');
        for (const result of recipe.results) {
            const details = itemDatabase[result.itemId];
            const countBefore = useCharacterStore.getState().inventory.length;
            useCharacterStore.getState().addItem(result.itemId, result.quantity);
            if (armorer && details?.durability && (details.type === 'weapon' || details.type === 'armor')) {
                // The new pieces are the entries appended by addItem.
                const inventory = useCharacterStore.getState().inventory.map((item, index) =>
                    index >= countBefore && item.itemId === result.itemId && item.durability
                        ? { ...item, durability: { current: item.durability.current + ARMORER_DURABILITY_BONUS, max: item.durability.max + ARMORER_DURABILITY_BONUS } }
                        : item);
                useCharacterStore.setState({ inventory });
            }
            useCharacterStore.getState().setQuestFlag(`crafted_${result.itemId}`, true);
            addJournalEntry({
                text: `${checkText} — Hai creato: ${details?.name ?? result.itemId} x${result.quantity}.${armorer && details?.durability ? ' [Armaiolo da Campo]' : ''} (${minutes} min)`,
                type: JournalEntryType.ITEM_ACQUIRED,
            });
        }

        const crafted = useCharacterStore.getState().craftedRecipes;
        const craftedRecipes = crafted.includes(recipeId) ? crafted : [...crafted, recipeId];
        useCharacterStore.setState({ craftedRecipes });
        character.unlockTrophy('trophy_craft_first_item');
        const allRecipes = useRecipeDatabaseStore.getState().recipes;
        if (allRecipes.length > 0 && allRecipes.every(r => craftedRecipes.includes(r.id))) {
            character.unlockTrophy('trophy_craft_all_recipes');
        }
        audioManager.playSound('item_get');
        questService.checkQuestTriggers({ source: 'craft' });
        return true;
    },

    getKnownRecipes: (): Recipe[] => {
        const { knownRecipes } = useCharacterStore.getState();
        return useRecipeDatabaseStore.getState().recipes.filter(r => knownRecipes.includes(r.id));
    },
};
