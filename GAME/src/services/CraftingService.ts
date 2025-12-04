import { useCharacterStore } from '../store/characterStore';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useGameStore } from '../store/gameStore';
import { JournalEntryType, Recipe } from '../types';
import { audioManager } from '../utils/audio';

export const craftingService = {
    /**
     * Checks if a recipe can be crafted by the player.
     * @param recipeId The ID of the recipe to check.
     * @returns True if the player has all ingredients, false otherwise.
     */
    canCraft: (recipeId: string): boolean => {
        const { recipes } = useRecipeDatabaseStore.getState();
        const { inventory } = useCharacterStore.getState();

        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return false;

        return recipe.ingredients.every(ing => {
            const playerItem = inventory.find(i => i.itemId === ing.itemId);
            return playerItem && playerItem.quantity >= ing.quantity;
        });
    },

    /**
     * Performs the crafting operation.
     * @param recipeId The ID of the recipe to craft.
     * @returns True if crafting was successful, false otherwise.
     */
    craft: (recipeId: string): boolean => {
        const { recipes } = useRecipeDatabaseStore.getState();
        const { addItem, removeItem, performSkillCheck } = useCharacterStore.getState();
        const { addJournalEntry } = useGameStore.getState();
        const { itemDatabase } = useItemDatabaseStore.getState();

        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) {
            console.error(`[CRAFTING] Recipe ${recipeId} not found`);
            return false;
        }

        // 1. Check ingredients again (safety check)
        if (!craftingService.canCraft(recipeId)) {
            addJournalEntry({
                text: "Non hai abbastanza materiali per creare questo oggetto.",
                type: JournalEntryType.SYSTEM_WARNING
            });
            audioManager.playSound('error');
            return false;
        }

        // 2. Skill Check (if required)
        if (recipe.skill && recipe.dc) {
            const check = performSkillCheck(recipe.skill, recipe.dc);
            if (!check.success) {
                addJournalEntry({
                    text: `[FALLIMENTO] Creazione fallita. Hai sprecato alcuni materiali.`,
                    type: JournalEntryType.SKILL_CHECK_FAILURE
                });

                // Consume 50% of materials on failure (rounded up)
                recipe.ingredients.forEach(ing => {
                    const quantityToLose = Math.ceil(ing.quantity * 0.5);
                    removeItem(ing.itemId, quantityToLose);
                });

                audioManager.playSound('craft_fail');
                return false;
            }
        }

        // 3. Consume Ingredients
        recipe.ingredients.forEach(ing => {
            removeItem(ing.itemId, ing.quantity);
        });

        // 4. Grant Results
        recipe.results.forEach(res => {
            addItem(res.itemId, res.quantity);
            const item = itemDatabase[res.itemId];
            addJournalEntry({
                text: `Hai creato: ${item?.name || res.itemId} x${res.quantity}`,
                type: JournalEntryType.ITEM_ACQUIRED
            });
        });

        // 5. Play Sound
        audioManager.playSound('craft_success');

        // 6. Check Quest Triggers (handled by addItem, but we can explicitly check here if needed)
        // questService.checkQuestTriggers(undefined, undefined, undefined, undefined); 
        // Note: addItem already triggers checkQuestTriggers('getItem')

        return true;
    },

    /**
     * Gets all recipes known by the player.
     */
    getKnownRecipes: (): Recipe[] => {
        const { recipes } = useRecipeDatabaseStore.getState();
        const { knownRecipes } = useCharacterStore.getState();
        return recipes.filter(r => knownRecipes.includes(r.id));
    }
};
