/**
 * craftingStore.ts
 * 
 * Zustand store per la gestione dello stato del sistema di crafting.
 * Gestisce ricette, navigazione UI e operazioni di crafting.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Recipe,
  CraftingState
} from '../types/crafting';
import { CRAFTING_ERRORS } from '../types/crafting';
import {
  loadRecipes,
  getRecipeById,
  getRecipeStats
} from '../utils/recipeLoader';
import {
  getAvailableRecipes,
  canCraftRecipe,
  getMaterialStatus,
  validateCraftingAttempt,
  calculateCraftingXP,
  debugLog,
  groupRecipesByAvailability
} from '../utils/craftingUtils';

import { useGameStore } from './gameStore';
import { MessageType } from '../data/MessageArchive';
import type { IInventorySlot } from '../interfaces/items';

// ===== EXTENDED STATE INTERFACE =====

/**
 * Stato esteso del crafting store con funzionalità aggiuntive
 */
interface ExtendedCraftingState extends CraftingState {
  // ===== LOADING STATE =====
  isLoading: boolean;
  loadError: string | null;

  // ===== RECIPE MANAGEMENT =====
  initializeRecipes: () => Promise<void>;
  reloadRecipes: () => Promise<void>;

  // ===== NAVIGATION =====
  moveSelectionUp: () => void;
  moveSelectionDown: () => void;
  getSelectedRecipe: () => Recipe | null;

  // ===== RECIPE OPERATIONS =====
  getRecipeStats: () => Record<string, any>;
  getGroupedRecipes: () => {
    craftable: Recipe[];
    missingMaterials: Recipe[];
    missingSkills: Recipe[];
    unavailable: Recipe[];
  };

  // ===== RECIPE UNLOCKING =====
  unlockRecipesByLevel: (level: number) => void;
  unlockRecipesByManual: (manualId: string) => void;

  // ===== INTEGRATION =====
  syncWithGameStore: () => void;
}

// ===== STORE IMPLEMENTATION =====

export const useCraftingStore = create<ExtendedCraftingState>()(
  subscribeWithSelector((set, get) => ({
    // ===== INITIAL STATE =====
    selectedRecipeIndex: 0,
    isOpen: false,
    allRecipes: [],
    knownRecipeIds: [],
    isLoading: false,
    loadError: null,

    // ===== BASIC ACTIONS =====

    setSelectedRecipe: (index: number) => {
      const availableRecipes = get().getAvailableRecipes();
      const clampedIndex = Math.max(0, Math.min(index, availableRecipes.length - 1));

      set({ selectedRecipeIndex: clampedIndex });
      debugLog(`Selected recipe index: ${clampedIndex}`);
    },

    openCrafting: () => {
      debugLog('Opening crafting screen');
      set({ isOpen: true });

      // Sincronizza con il game store quando si apre
      get().syncWithGameStore();
    },

    closeCrafting: () => {
      debugLog('Closing crafting screen');
      set({ isOpen: false, selectedRecipeIndex: 0 });
    },

    unlockRecipe: (recipeId: string) => {
      const { knownRecipeIds } = get();

      if (!knownRecipeIds.includes(recipeId)) {
        const newKnownRecipes = [...knownRecipeIds, recipeId];
        set({ knownRecipeIds: newKnownRecipes });

        // Aggiorna anche il game store
        const gameStore = useGameStore.getState();
        if (gameStore.characterSheet) {
          gameStore.characterSheet.knownRecipes = newKnownRecipes;
        }

        // Aggiungi notifica
        gameStore.addLogEntry(MessageType.DISCOVERY, {
          discovery: `Nuova ricetta sbloccata: ${recipeId}`
        });

        debugLog(`Recipe unlocked: ${recipeId}`);
      }
    },

    craftItem: async (recipeId: string): Promise<boolean> => {
      const { allRecipes, knownRecipeIds } = get();
      const gameStore = useGameStore.getState();

      debugLog(`Attempting to craft: ${recipeId}`);

      // Trova la ricetta
      const recipe = getRecipeById(allRecipes, recipeId);
      if (!recipe) {
        debugLog(`Recipe not found: ${recipeId}`);
        gameStore.addLogEntry(MessageType.ACTION_FAIL, {
          reason: CRAFTING_ERRORS.RECIPE_NOT_FOUND
        });
        return false;
      }

      // Ottieni stato corrente dal game store
      const inventory = (gameStore.characterSheet?.inventory || []).filter((item): item is IInventorySlot => item !== null);
      const characterSheet = gameStore.characterSheet;

      if (!characterSheet) {
        debugLog('No character sheet available');
        return false;
      }

      // Valida il tentativo di crafting
      const validationError = validateCraftingAttempt(
        recipe,
        inventory,
        characterSheet,
        knownRecipeIds
      );

      if (validationError) {
        debugLog(`Crafting validation failed: ${validationError}`);
        gameStore.addLogEntry(MessageType.ACTION_FAIL, { reason: validationError });
        return false;
      }

      try {
        // Rimuovi materiali dall'inventario
        recipe.components.forEach(component => {
          // Trova e rimuovi i materiali
          for (let i = 0; i < inventory.length; i++) {
            const slot = inventory[i];
            if (slot && slot.itemId === component.itemId) {
              const toRemove = Math.min(slot.quantity, component.quantity);
              gameStore.removeItem(i, toRemove);
              component.quantity -= toRemove;

              if (component.quantity <= 0) break;
            }
          }
        });

        // Aggiungi oggetto risultante
        const addSuccess = gameStore.addItem(recipe.resultItemId, recipe.resultQuantity);

        if (!addSuccess) {
          debugLog('Failed to add crafted item to inventory');
          gameStore.addLogEntry(MessageType.ACTION_FAIL, {
            reason: CRAFTING_ERRORS.INVENTORY_FULL
          });
          return false;
        }

        // Calcola e assegna XP
        const xpGained = calculateCraftingXP(recipe);
        gameStore.addExperience(xpGained);

        // Ottieni nome oggetto per il messaggio
        const resultItem = gameStore.items[recipe.resultItemId];
        const itemName = resultItem?.name || 'Oggetto Sconosciuto';

        // Messaggio di successo nel journal
        gameStore.addLogEntry(MessageType.ACTION_SUCCESS, {
          action: `Usando il banco di lavoro, hai creato: ${itemName} (x${recipe.resultQuantity}).`
        });

        debugLog(`Crafting successful: ${itemName} x${recipe.resultQuantity}, XP gained: ${xpGained}`);
        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        debugLog(`Crafting failed with error: ${errorMessage}`);

        gameStore.addLogEntry(MessageType.ACTION_FAIL, {
          reason: CRAFTING_ERRORS.UNKNOWN_ERROR
        });
        return false;
      }
    },

    // ===== SELECTORS =====

    getAvailableRecipes: () => {
      const { allRecipes, knownRecipeIds } = get();
      return getAvailableRecipes(allRecipes, knownRecipeIds);
    },

    canCraftRecipe: (recipeId: string) => {
      const { allRecipes } = get();
      const gameStore = useGameStore.getState();

      const recipe = getRecipeById(allRecipes, recipeId);
      if (!recipe || !gameStore.characterSheet) return false;

      const inventory = (gameStore.characterSheet.inventory || []).filter((item): item is IInventorySlot => item !== null);
      return canCraftRecipe(recipe, inventory, gameStore.characterSheet);
    },

    getMaterialStatus: (recipeId: string) => {
      const { allRecipes } = get();
      const gameStore = useGameStore.getState();

      const recipe = getRecipeById(allRecipes, recipeId);
      if (!recipe || !gameStore.characterSheet) return [];

      const inventory = (gameStore.characterSheet.inventory || []).filter((item): item is IInventorySlot => item !== null);
      return getMaterialStatus(recipe, inventory, gameStore.items);
    },

    // ===== EXTENDED ACTIONS =====

    initializeRecipes: async () => {
      set({ isLoading: true, loadError: null });
      debugLog('Initializing recipes');

      try {
        const result = await loadRecipes();

        if (result.success) {
          set({
            allRecipes: result.recipes,
            isLoading: false,
            loadError: null
          });

          debugLog(`Recipes initialized: ${result.recipes.length} recipes loaded`);

          // Log warnings se presenti
          if (result.warnings.length > 0) {
            console.warn('Recipe loading warnings:', result.warnings);
          }
        } else {
          set({
            isLoading: false,
            loadError: result.errors.join('; ')
          });

          console.error('Failed to load recipes:', result.errors);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set({
          isLoading: false,
          loadError: errorMessage
        });

        console.error('Recipe initialization error:', error);
      }
    },

    reloadRecipes: async () => {
      debugLog('Reloading recipes');
      await get().initializeRecipes();
    },

    // ===== NAVIGATION =====

    moveSelectionUp: () => {
      const { selectedRecipeIndex } = get();
      const availableRecipes = get().getAvailableRecipes();

      if (availableRecipes.length === 0) return;

      const newIndex = selectedRecipeIndex > 0
        ? selectedRecipeIndex - 1
        : availableRecipes.length - 1;

      get().setSelectedRecipe(newIndex);
    },

    moveSelectionDown: () => {
      const { selectedRecipeIndex } = get();
      const availableRecipes = get().getAvailableRecipes();

      if (availableRecipes.length === 0) return;

      const newIndex = selectedRecipeIndex < availableRecipes.length - 1
        ? selectedRecipeIndex + 1
        : 0;

      get().setSelectedRecipe(newIndex);
    },

    getSelectedRecipe: () => {
      const { selectedRecipeIndex } = get();
      const availableRecipes = get().getAvailableRecipes();

      return availableRecipes[selectedRecipeIndex] || null;
    },

    // ===== RECIPE OPERATIONS =====

    getRecipeStats: () => {
      const { allRecipes } = get();
      return getRecipeStats(allRecipes);
    },

    getGroupedRecipes: () => {
      const availableRecipes = get().getAvailableRecipes();
      const gameStore = useGameStore.getState();

      if (!gameStore.characterSheet) {
        return {
          craftable: [],
          missingMaterials: [],
          missingSkills: [],
          unavailable: []
        };
      }

      const inventory = (gameStore.characterSheet.inventory || []).filter((item): item is IInventorySlot => item !== null);
      return groupRecipesByAvailability(availableRecipes, inventory, gameStore.characterSheet);
    },

    // ===== RECIPE UNLOCKING =====

    unlockRecipesByLevel: (level: number) => {
      const { allRecipes, knownRecipeIds } = get();
      const gameStore = useGameStore.getState();

      const recipesToUnlock = allRecipes.filter(recipe =>
        recipe.unlockedByLevel !== undefined &&
        recipe.unlockedByLevel <= level &&
        !knownRecipeIds.includes(recipe.id)
      );

      if (recipesToUnlock.length > 0) {
        const newKnownRecipes = [...knownRecipeIds, ...recipesToUnlock.map(r => r.id)];
        set({ knownRecipeIds: newKnownRecipes });

        // Aggiorna game store
        if (gameStore.characterSheet) {
          gameStore.characterSheet.knownRecipes = newKnownRecipes;
        }

        // Notifica per ogni ricetta sbloccata
        recipesToUnlock.forEach(recipe => {
          const resultItem = gameStore.items[recipe.resultItemId];
          const itemName = resultItem?.name || 'Oggetto Sconosciuto';

          gameStore.addLogEntry(MessageType.DISCOVERY, {
            discovery: `Nuova ricetta sbloccata: ${itemName}`
          });
        });

        debugLog(`Unlocked ${recipesToUnlock.length} recipes for level ${level}`);
      }
    },

    unlockRecipesByManual: (manualId: string) => {
      const { allRecipes, knownRecipeIds } = get();
      const gameStore = useGameStore.getState();

      const recipesToUnlock = allRecipes.filter(recipe =>
        recipe.unlockedByManual === manualId &&
        !knownRecipeIds.includes(recipe.id)
      );

      if (recipesToUnlock.length > 0) {
        const newKnownRecipes = [...knownRecipeIds, ...recipesToUnlock.map(r => r.id)];
        set({ knownRecipeIds: newKnownRecipes });

        // Aggiorna game store
        if (gameStore.characterSheet) {
          gameStore.characterSheet.knownRecipes = newKnownRecipes;
        }

        // Notifica per ogni ricetta sbloccata
        recipesToUnlock.forEach(recipe => {
          const resultItem = gameStore.items[recipe.resultItemId];
          const itemName = resultItem?.name || 'Oggetto Sconosciuto';

          gameStore.addLogEntry(MessageType.DISCOVERY, {
            discovery: `Dal manuale hai imparato: ${itemName}`
          });
        });

        debugLog(`Unlocked ${recipesToUnlock.length} recipes from manual ${manualId}`);
      }
    },

    // ===== INTEGRATION =====

    syncWithGameStore: () => {
      const gameStore = useGameStore.getState();

      if (gameStore.characterSheet?.knownRecipes) {
        const currentKnownRecipes = get().knownRecipeIds;
        const gameStoreRecipes = gameStore.characterSheet.knownRecipes;

        // Sincronizza solo se diversi
        if (JSON.stringify(currentKnownRecipes) !== JSON.stringify(gameStoreRecipes)) {
          set({ knownRecipeIds: [...gameStoreRecipes] });
          debugLog('Synced known recipes with game store');
        }
      }
    }
  }))
);

// ===== STORE INITIALIZATION =====

/**
 * Inizializza il crafting store
 * Deve essere chiamato all'avvio dell'applicazione
 */
export async function initializeCraftingStore(): Promise<void> {
  const store = useCraftingStore.getState();
  await store.initializeRecipes();
}

// ===== STORE SUBSCRIPTIONS =====

/**
 * Sottoscrizione per sincronizzazione automatica con game store
 */
useCraftingStore.subscribe(
  (state) => state.isOpen,
  (isOpen) => {
    if (isOpen) {
      // Sincronizza quando si apre la schermata
      const store = useCraftingStore.getState();
      store.syncWithGameStore();
    }
  }
);

// ===== UTILITY HOOKS =====

/**
 * Hook per ottenere lo stato di una ricetta specifica
 */
export function useRecipeState(recipeId: string) {
  return useCraftingStore((state) => {
    const recipe = getRecipeById(state.allRecipes, recipeId);
    const canCraft = recipe ? state.canCraftRecipe(recipeId) : false;
    const materialStatus = recipe ? state.getMaterialStatus(recipeId) : [];
    const isKnown = state.knownRecipeIds.includes(recipeId);

    return {
      recipe,
      canCraft,
      materialStatus,
      isKnown
    };
  });
}

/**
 * Hook per ottenere le ricette raggruppate per stato
 */
export function useGroupedRecipes() {
  return useCraftingStore((state) => state.getGroupedRecipes());
}

/**
 * Hook per la navigazione delle ricette
 */
export function useRecipeNavigation() {
  return useCraftingStore((state) => ({
    selectedIndex: state.selectedRecipeIndex,
    selectedRecipe: state.getSelectedRecipe(),
    moveUp: state.moveSelectionUp,
    moveDown: state.moveSelectionDown,
    setSelected: state.setSelectedRecipe
  }));
}