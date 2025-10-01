import { useCraftingStore } from '../stores/craftingStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useGameStore } from '../stores/gameStore';
import { SURVIVOR_STARTER_KIT } from '../rules/characterGenerator';
import { createTestCharacter } from '../rules/characterGenerator';
import { act } from '@testing-library/react';

// Mock dependencies that are not the focus of this test
jest.mock('../stores/notifications/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      addLogEntry: jest.fn(),
    }),
  },
}));

describe('Crafting and Recipe Synchronization', () => {

  // This function resets all relevant stores to a clean state.
  const resetAllStores = () => {
    act(() => {
      // Use the actual reset methods from the stores
      useCharacterStore.getState().resetCharacter();
      useCraftingStore.getState().resetCraftingState();

      // For gameStore, we reset its internal state but keep the proxy getters functional
      const gameStoreResetState = useGameStore.getInitialState ? useGameStore.getInitialState() : {};
      useGameStore.setState(gameStoreResetState, true);
    });
  };

  beforeEach(() => {
    resetAllStores();
  });

  test('unlockStarterRecipes should add starter recipes to a character who has none', () => {
    // 1. Setup: Ensure character starts with no recipes
    act(() => {
      const cleanCharacter = createTestCharacter({}, false); // false = no starter kit
      useCharacterStore.getState().updateCharacterSheet(cleanCharacter);
      useCraftingStore.getState().syncWithGameStore();
    });

    // Initial state verification
    expect(useCraftingStore.getState().knownRecipeIds).toHaveLength(0);
    expect(useCharacterStore.getState().characterSheet.knownRecipes).toHaveLength(0);

    // 2. Action: Unlock the starter recipes
    act(() => {
      useCraftingStore.getState().unlockStarterRecipes();
    });

    // 3. Assertions
    const craftingState = useCraftingStore.getState();
    const characterState = useCharacterStore.getState();
    const expectedRecipes = SURVIVOR_STARTER_KIT.knownRecipes;

    // Check crafting store
    expect(craftingState.knownRecipeIds).toHaveLength(expectedRecipes.length);
    expect(craftingState.knownRecipeIds).toEqual(expect.arrayContaining(expectedRecipes));

    // Check if character store was also updated
    expect(characterState.characterSheet.knownRecipes).toHaveLength(expectedRecipes.length);
    expect(characterState.characterSheet.knownRecipes).toEqual(expect.arrayContaining(expectedRecipes));
  });

  test('unlockStarterRecipes should not add duplicate recipes if already known', () => {
    // 1. Setup: Ensure character starts WITH the starter kit
    act(() => {
      const characterWithKit = createTestCharacter({}, true); // true = with starter kit
      useCharacterStore.getState().updateCharacterSheet(characterWithKit);
      useCraftingStore.getState().syncWithGameStore();
    });

    const initialRecipeCount = useCraftingStore.getState().knownRecipeIds.length;
    expect(initialRecipeCount).toBe(SURVIVOR_STARTER_KIT.knownRecipes.length);

    // 2. Action: Try to unlock the starter recipes again
    act(() => {
      useCraftingStore.getState().unlockStarterRecipes();
    });

    // 3. Assertions: The number of known recipes should not have changed
    const finalRecipeCount = useCraftingStore.getState().knownRecipeIds.length;
    expect(finalRecipeCount).toBe(initialRecipeCount);
  });

  test('syncWithGameStore should correctly sync recipes from gameStore to craftingStore', () => {
    // 1. Setup: Directly modify the character sheet with custom recipes
    const customRecipes = ['CUSTOM_RECIPE_1', 'CUSTOM_RECIPE_2'];
    act(() => {
      const character = useCharacterStore.getState().characterSheet;
      useCharacterStore.getState().updateCharacterSheet({
        ...character,
        knownRecipes: customRecipes,
      });
    });

    // At this point, craftingStore is out of sync
    expect(useCraftingStore.getState().knownRecipeIds).not.toEqual(customRecipes);

    // 2. Action: Synchronize the stores
    act(() => {
      useCraftingStore.getState().syncWithGameStore();
    });

    // 3. Assertions: The crafting store should now have the custom recipes
    expect(useCraftingStore.getState().knownRecipeIds).toEqual(customRecipes);
  });

  test('unlockRecipe should add a new recipe and sync it to the character', () => {
    const newRecipeId = 'NEW_TEST_RECIPE';
    
    // Initial state verification
    expect(useCraftingStore.getState().knownRecipeIds).not.toContain(newRecipeId);
    expect(useCharacterStore.getState().characterSheet.knownRecipes).not.toContain(newRecipeId);

    // 2. Action: Unlock a single new recipe
    act(() => {
      useCraftingStore.getState().unlockRecipe(newRecipeId);
    });

    // 3. Assertions
    expect(useCraftingStore.getState().knownRecipeIds).toContain(newRecipeId);
    expect(useCharacterStore.getState().characterSheet.knownRecipes).toContain(newRecipeId);
  });
});