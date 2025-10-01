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
  groupRecipesByAvailability,
  debugLog
} from '../utils/craftingUtils';
import { createLogger } from '../services/loggerService';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';

import { useGameStore } from './gameStore';
import { useCharacterStore } from './character/characterStore';
import { useNotificationStore } from './notifications/notificationStore';
import { MessageType } from '../data/MessageArchive';
import type { IInventorySlot } from '../interfaces/items';
import { ensureStarterKit, SURVIVOR_STARTER_KIT } from '../rules/characterGenerator';

// Create logger instance for crafting store operations
const logger = createLogger('CRAFTING');

// ===== SINGLETON RECIPE MANAGER =====

/**
 * Singleton per gestire il caricamento e la cache delle ricette
 */
class RecipeManager {
  private static instance: RecipeManager;
  private recipes: Recipe[] = [];
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<Recipe[]> | null = null;
  private memoizedCalculations = new Map<string, any>();

  private constructor() {}

  static getInstance(): RecipeManager {
    if (!RecipeManager.instance) {
      RecipeManager.instance = new RecipeManager();
    }
    return RecipeManager.instance;
  }

  async getRecipes(): Promise<Recipe[]> {
    if (this.isLoaded) {
      return this.recipes;
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadRecipesInternal();
    
    try {
      const recipes = await this.loadPromise;
      this.recipes = recipes;
      this.isLoaded = true;
      this.isLoading = false;
      return recipes;
    } catch (error) {
      this.isLoading = false;
      this.loadPromise = null;
      throw error;
    }
  }

  private async loadRecipesInternal(): Promise<Recipe[]> {
    const result = await loadRecipes();
    if (result.success) {
      return result.recipes;
    } else {
      throw new Error(result.errors.join('; '));
    }
  }

  // Memoizzazione per calcoli costosi
  getMemoized<T>(key: string, calculator: () => T): T {
    if (this.memoizedCalculations.has(key)) {
      return this.memoizedCalculations.get(key);
    }
    
    const result = calculator();
    this.memoizedCalculations.set(key, result);
    return result;
  }

  clearMemoization(keyPattern?: string): void {
    if (keyPattern) {
      // Rimuovi solo le chiavi che matchano il pattern
      for (const key of this.memoizedCalculations.keys()) {
        if (key.includes(keyPattern)) {
          this.memoizedCalculations.delete(key);
        }
      }
    } else {
      // Pulisci tutta la cache
      this.memoizedCalculations.clear();
    }
  }

  reset(): void {
    this.recipes = [];
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    this.memoizedCalculations.clear();
  }
}

// ===== EXTENDED STATE INTERFACE =====

/**
 * Stato esteso del crafting store con funzionalità aggiuntive
 */
interface ExtendedCraftingState extends CraftingState {
  // ===== LOADING STATE =====
  isLoading: boolean;
  loadError: string | null;
  isCrafting: boolean;
  craftingError: string | null;

  // ===== RECIPE MANAGEMENT =====
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  craftingQueue: Recipe[];
  isInitialized: boolean;
  initializeRecipes: () => Promise<void>;
  initializeCraftingSystem: () => Promise<void>;
  reloadRecipes: () => Promise<void>;
  clearCraftingError: () => void;

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
  unlockStarterRecipes: () => void;

  // ===== INTEGRATION =====
  syncWithGameStore: () => void;

  // ===== DEBUG/TESTING =====
  addManualToInventory: (manualId: string) => boolean;
  addAllManualsForTesting: () => number;
  testManualDiscovery: (manualId: string) => boolean;

  // ===== ERROR RECOVERY =====
  recoverFromCorruptedData: () => boolean;
  validateCraftingData: () => boolean;
  resetCraftingState: () => void;
}

// ===== STORE IMPLEMENTATION =====

const initialCraftingState = {
  selectedRecipeIndex: 0,
  isOpen: false,
  allRecipes: [],
  recipes: [],
  selectedRecipe: null,
  craftingQueue: [],
  isInitialized: false,
  knownRecipeIds: [],
  isLoading: false,
  loadError: null,
  isCrafting: false,
  craftingError: null,
};

export const useCraftingStore = create<ExtendedCraftingState>()(
  subscribeWithSelector((set, get) => ({
    // ===== INITIAL STATE =====
    ...initialCraftingState,

    // ===== BASIC ACTIONS =====

    clearCraftingError: () => set({ craftingError: null }),

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
        const notificationStore = useNotificationStore.getState();
        notificationStore.addLogEntry(MessageType.DISCOVERY, {
          discovery: `Nuova ricetta sbloccata: ${recipeId}`
        });

        logger.info('Recipe unlocked', { recipeId });
      }
    },

    craftItem: async (recipeId: string): Promise<boolean> => {
      return executeWithRetry({
        operation: async () => {
          set({ isCrafting: true, craftingError: null });
          const { allRecipes, knownRecipeIds } = get();
          const gameStore = useGameStore.getState();

          logger.info('Attempting to craft recipe', { recipeId });

          const recipe = getRecipeById(allRecipes, recipeId);
          if (!recipe) {
            throw new Error(CRAFTING_ERRORS.RECIPE_NOT_FOUND);
          }

          const inventory = (gameStore.characterSheet?.inventory || []).filter((item: any): item is IInventorySlot => item !== null);
          const characterSheet = gameStore.characterSheet;

          if (!characterSheet) {
            throw new Error(CRAFTING_ERRORS.NO_CHARACTER);
          }

          const validationError = validateCraftingAttempt(
            recipe,
            inventory,
            characterSheet,
            knownRecipeIds
          );

          if (validationError) {
            throw new Error(validationError);
          }

          // Rimuovi materiali
          recipe.components.forEach(component => {
            gameStore.removeItems(component.itemId, component.quantity);
          });

          // Aggiungi oggetto risultante
          const addSuccess = gameStore.addItem(recipe.resultItemId, recipe.resultQuantity);
          if (!addSuccess) {
            // Tenta di ripristinare i materiali
            recipe.components.forEach(component => {
              gameStore.addItem(component.itemId, component.quantity);
            });
            throw new Error(CRAFTING_ERRORS.INVENTORY_FULL);
          }

          const xpGained = calculateCraftingXP(recipe);
          gameStore.addExperience(xpGained);

          const resultItem = gameStore.items[recipe.resultItemId];
          const itemName = resultItem?.name || 'Oggetto Sconosciuto';

          const notificationStore = useNotificationStore.getState();
          notificationStore.addLogEntry(MessageType.ACTION_SUCCESS, {
            action: `Usando il banco di lavoro, hai creato: ${itemName} (x${recipe.resultQuantity}).`
          });

          logger.info('Crafting successful', { 
            itemName, 
            quantity: recipe.resultQuantity, 
            xpGained 
          });
          
          set({ isCrafting: false });
          return true;
        },
        category: GameErrorCategory.CRAFTING,
        context: { recipeId },
        onSuccess: (result) => {
          set({ craftingError: null });
        },
        onFailure: (error) => {
          handleStoreError(error, GameErrorCategory.CRAFTING, { 
            recipeId, 
            operation: 'craftItem' 
          });
          set({ isCrafting: false, craftingError: error.message });
        },
        onFallback: () => {
          // Fallback sicuro: ripristina stato e restituisci false
          set({ isCrafting: false, craftingError: 'Operazione annullata per sicurezza' });
          return false;
        }
      });
    },

    // ===== SELECTORS =====

    getAvailableRecipes: () => {
      const { allRecipes, knownRecipeIds } = get();
      const available = getAvailableRecipes(allRecipes, knownRecipeIds);
      logger.debug('Available recipes calculated', { 
        totalRecipes: allRecipes.length, 
        knownRecipeIds: knownRecipeIds.length, 
        availableCount: available.length,
        knownIds: knownRecipeIds 
      });
      return available;
    },

    canCraftRecipe: (recipeId: string) => {
      const { allRecipes } = get();
      const gameStore = useGameStore.getState();

      const recipe = getRecipeById(allRecipes, recipeId);
      if (!recipe || !gameStore.characterSheet) return false;

      const inventory = (gameStore.characterSheet.inventory || []).filter((item: any): item is IInventorySlot => item !== null);
      return canCraftRecipe(recipe, inventory, gameStore.characterSheet);
    },

    getMaterialStatus: (recipeId: string) => {
      const { allRecipes } = get();
      const gameStore = useGameStore.getState();

      const recipe = getRecipeById(allRecipes, recipeId);
      if (!recipe || !gameStore.characterSheet) return [];

      const inventory = (gameStore.characterSheet.inventory || []).filter((item: any): item is IInventorySlot => item !== null);
      return getMaterialStatus(recipe, inventory, gameStore.items);
    },

    // ===== EXTENDED ACTIONS =====

    initializeRecipes: async () => {
      const currentState = get();
      
      debugLog(`[INIT DEBUG] Current state - isLoading: ${currentState.isLoading}, allRecipes.length: ${currentState.allRecipes.length}`);
      
      // Prevenzione doppia inizializzazione usando singleton
      if (currentState.isLoading || currentState.allRecipes.length > 0) {
        debugLog('Recipes already loading or loaded, skipping initialization');
        return;
      }
      
      set({ isLoading: true, loadError: null });
      debugLog('Initializing recipes using singleton pattern');

      try {
        const recipeManager = RecipeManager.getInstance();
        debugLog('[INIT DEBUG] RecipeManager instance obtained');
        
        const recipes = await recipeManager.getRecipes();
        logger.debug('RecipeManager returned recipes', { recipeCount: recipes.length });
        
        // Log delle prime 3 ricette per debug
        if (recipes.length > 0) {
          logger.debug('First recipe details', { 
            recipeId: recipes[0].id, 
            unlockedByLevel: recipes[0].unlockedByLevel 
          });
        }

        set({
          allRecipes: recipes,
          isLoading: false,
          loadError: null
        });

        logger.info('Recipes initialized', { recipeCount: recipes.length });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set({
          isLoading: false,
          loadError: errorMessage
        });

        console.error('Recipe initialization error:', error);
        
        // Fallback: carica ricette di emergenza se disponibili
        try {
          const emergencyRecipes = await loadEmergencyRecipes();
          if (emergencyRecipes.length > 0) {
            set({ 
              allRecipes: emergencyRecipes,
              loadError: `${errorMessage} (usando ricette di emergenza)`
            });
            logger.info('Loaded emergency recipes as fallback');
          }
        } catch (fallbackError) {
          console.error('Failed to load emergency recipes:', fallbackError);
        }
      }
    },

    reloadRecipes: async () => {
      logger.info('Reloading recipes');
      await get().initializeRecipes();
    },

    initializeCraftingSystem: async () => {
      debugLog('Initializing crafting system');
      await get().initializeRecipes();
      get().syncWithGameStore();
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

      debugLog(`[UNLOCK DEBUG] Starting unlock for level ${level}`);
      debugLog(`[UNLOCK DEBUG] Total recipes available: ${allRecipes.length}`);
      debugLog(`[UNLOCK DEBUG] Currently known recipes: ${knownRecipeIds.length} - ${knownRecipeIds.join(', ')}`);
      
      // Log delle ricette che hanno unlockedByLevel definito
      const recipesWithLevel = allRecipes.filter(recipe => recipe.unlockedByLevel !== undefined);
      debugLog(`[UNLOCK DEBUG] Recipes with unlockedByLevel: ${recipesWithLevel.length}`);
      
      const recipesToUnlock = allRecipes.filter((recipe: Recipe) =>
        recipe.unlockedByLevel !== undefined &&
        recipe.unlockedByLevel <= level &&
        !knownRecipeIds.includes(recipe.id)
      );
      
      logger.debug('Recipes to unlock by level', { 
        level, 
        recipesToUnlock: recipesToUnlock.length, 
        recipeIds: recipesToUnlock.map(r => r.id) 
      });

      if (recipesToUnlock.length > 0) {
        const newKnownRecipes = [...knownRecipeIds, ...recipesToUnlock.map(r => r.id)];
        set({ knownRecipeIds: newKnownRecipes });

        // Aggiorna game store
        if (gameStore.characterSheet) {
          gameStore.characterSheet.knownRecipes = newKnownRecipes;
        }

        // Notifica per ogni ricetta sbloccata
        const notificationStore = useNotificationStore.getState();
        recipesToUnlock.forEach(recipe => {
          const resultItem = gameStore.items[recipe.resultItemId];
          const itemName = resultItem?.name || 'Oggetto Sconosciuto';

          notificationStore.addLogEntry(MessageType.DISCOVERY, {
            discovery: `Nuova ricetta sbloccata: ${itemName}`
          });
        });

        logger.info('Unlocked recipes by level', { 
          level, 
          unlockedCount: recipesToUnlock.length 
        });
      }
    },

    unlockRecipesByManual: (manualId: string) => {
      const { allRecipes, knownRecipeIds } = get();
      const gameStore = useGameStore.getState();

      const recipesToUnlock = allRecipes.filter((recipe: Recipe) =>
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

        // Notifica riassuntiva per il manuale
        const manualNames: Record<string, string> = {
          'manual_weapons_basic': 'Armi Improvvisate',
          'manual_medical_basic': 'Primo Soccorso',
          'manual_weapons_advanced': 'Armamenti Avanzati',
          'manual_medical_advanced': 'Medicina Avanzata',
          'manual_weapons_expert': 'Armamenti Tattici',
          'manual_survival_expert': 'Sopravvivenza Estrema'
        };

        const manualName = manualNames[manualId] || 'Manuale Sconosciuto';
        
        const notificationStore = useNotificationStore.getState();
        notificationStore.addLogEntry(MessageType.DISCOVERY, {
          discovery: `Dal manuale "${manualName}" hai imparato ${recipesToUnlock.length} nuove ricette!`
        });

        // Log dettagliato per debug
        recipesToUnlock.forEach(recipe => {
          const resultItem = gameStore.items[recipe.resultItemId];
          const itemName = resultItem?.name || 'Oggetto Sconosciuto';
          debugLog(`Unlocked recipe: ${recipe.id} -> ${itemName}`);
        });

        debugLog(`Unlocked ${recipesToUnlock.length} recipes from manual ${manualId}`);
      } else {
        // Nessuna ricetta da sbloccare
        const notificationStore = useNotificationStore.getState();
        notificationStore.addLogEntry(MessageType.ACTION_FAIL, {
          reason: 'Questo manuale non contiene ricette che non conosci già.'
        });
        logger.info('No new recipes to unlock from manual', { manualId });
      }
    },

    // ===== STARTER KIT =====

    unlockStarterRecipes: () => {
      const gameStore = useGameStore.getState();
      
      if (!gameStore.characterSheet) {
        logger.debug('No character sheet available for starter recipes');
        return;
      }

      logger.debug('Unlocking starter recipes');
      logger.debug('Current known recipes', { 
        knownRecipesCount: gameStore.characterSheet.knownRecipes?.length || 0 
      });

      // Assicura che il personaggio abbia lo starter kit
      const updatedCharacter = ensureStarterKit(gameStore.characterSheet);
      logger.debug('After ensureStarterKit', { 
        knownRecipesCount: updatedCharacter.knownRecipes?.length || 0,
        knownRecipeIds: updatedCharacter.knownRecipes 
      });
      
      // SEMPRE sincronizza le ricette, anche se il personaggio non è cambiato
      if (updatedCharacter.knownRecipes && updatedCharacter.knownRecipes.length > 0) {
        // Aggiorna il character sheet se necessario
        if (updatedCharacter !== gameStore.characterSheet) {
          useCharacterStore.getState().updateCharacterSheet(updatedCharacter);
          
          // Notifica nel journal solo se è la prima volta
          const notificationStore = useNotificationStore.getState();
          notificationStore.addLogEntry(MessageType.DISCOVERY, {
            discovery: `Kit di sopravvivenza ricevuto! Hai imparato ${SURVIVOR_STARTER_KIT.knownRecipes.length} ricette di base.`
          });
          
          logger.info('Starter kit applied', { 
            starterRecipeCount: SURVIVOR_STARTER_KIT.knownRecipes.length 
          });
        }
        
        // SEMPRE sincronizza le ricette nel crafting store
        set({ knownRecipeIds: [...updatedCharacter.knownRecipes] });
        logger.debug('Set knownRecipeIds in crafting store', { 
          recipeCount: updatedCharacter.knownRecipes.length 
        });
        logger.debug('Final knownRecipeIds', { 
          knownRecipeIds: get().knownRecipeIds 
        });
      } else {
        logger.debug('No known recipes found after ensureStarterKit');
      }
    },

    // ===== INTEGRATION =====

    syncWithGameStore: () => {
      const gameStore = useGameStore.getState();

      // Registra la callback per sbloccare ricette (evita dipendenze circolari)
      if (!gameStore.unlockRecipesCallback) {
        gameStore.setUnlockRecipesCallback((manualId: string) => {
          get().unlockRecipesByManual(manualId);
        });
      }

      if (gameStore.characterSheet?.knownRecipes) {
        const currentKnownRecipes = get().knownRecipeIds;
        const gameStoreRecipes = gameStore.characterSheet.knownRecipes;

        // Sincronizza solo se diversi
        if (JSON.stringify(currentKnownRecipes) !== JSON.stringify(gameStoreRecipes)) {
          set({ knownRecipeIds: [...gameStoreRecipes] });
          logger.debug('Synced known recipes with game store');
        }
      }
    },

    // ===== DEBUG/TESTING FUNCTIONS =====

    addManualToInventory: (manualId: string) => {
      const gameStore = useGameStore.getState();
      const success = gameStore.addItem(manualId, 1);
      
      if (success) {
        logger.debug('Added manual to inventory for testing', { manualId });
        const notificationStore = useNotificationStore.getState();
        notificationStore.addLogEntry(MessageType.ITEM_FOUND, { 
          item: gameStore.items[manualId]?.name || 'Manuale Sconosciuto',
          quantity: 1 
        });
      } else {
        logger.debug('Failed to add manual - inventory full', { manualId });
      }
      
      return success;
    },

    // Funzioni di test per tutti i manuali
    addAllManualsForTesting: () => {
      const manuals = [
        'MANUAL_WEAPONS_BASIC',
        'MANUAL_MEDICAL_BASIC', 
        'MANUAL_WEAPONS_ADVANCED',
        'MANUAL_MEDICAL_ADVANCED',
        'MANUAL_WEAPONS_EXPERT',
        'MANUAL_SURVIVAL_EXPERT'
      ];
      
      let addedCount = 0;
      manuals.forEach(manualId => {
        if (get().addManualToInventory(manualId)) {
          addedCount++;
        }
      });
      
      logger.debug('Added manuals for testing', { 
        addedCount, 
        totalManuals: manuals.length 
      });
      return addedCount;
    },

    testManualDiscovery: (manualId: string) => {
      logger.debug('Testing manual discovery', { manualId });
      
      // Aggiungi il manuale all'inventario
      const added = get().addManualToInventory(manualId);
      if (!added) {
        logger.debug('Failed to add manual - inventory full');
        return false;
      }
      
      // Simula l'uso del manuale
      const gameStore = useGameStore.getState();
      const inventory = gameStore.characterSheet.inventory;
      
      // Trova il manuale nell'inventario
      const manualSlotIndex = inventory.findIndex((slot: IInventorySlot | null) => 
        slot && slot.itemId === manualId
      );
      
      if (manualSlotIndex !== -1) {
        // Usa il manuale
        gameStore.useItem(manualSlotIndex);
        logger.debug('Manual used successfully', { manualId });
        return true;
      } else {
        logger.debug('Manual not found in inventory', { manualId });
        return false;
      }
    },

    // ===== ERROR RECOVERY =====
    recoverFromCorruptedData: () => {
      const gameStore = useGameStore.getState();
      
      try {
        // Reset crafting store to clean state
        set({
          recipes: [],
          knownRecipeIds: [],
          selectedRecipe: null,
          craftingQueue: [],
          isInitialized: false,
          loadError: null
        });

        // Clear corrupted character data
        if (gameStore.characterSheet) {
          gameStore.characterSheet.knownRecipes = [];
          if ((gameStore.characterSheet as any).usedManuals) {
            (gameStore.characterSheet as any).usedManuals = [];
          }
        }

        // Reinitialize system
        get().initializeCraftingSystem();
        
        const notificationStore = useNotificationStore.getState();
        notificationStore.addLogEntry(MessageType.ACTION_SUCCESS, {
          action: 'Sistema di crafting ripristinato dopo errore dati corrotti'
        });

        debugLog('Successfully recovered from corrupted data');
        return true;
      } catch (error) {
        console.error('Failed to recover from corrupted data:', error);
        return false;
      }
    },

    validateCraftingData: () => {
      const { recipes, knownRecipeIds } = get();
      const issues: string[] = [];

      // Check for invalid recipes
      const invalidRecipes = knownRecipeIds.filter(id => 
        !recipes.find((recipe: Recipe) => recipe.id === id)
      );

      if (invalidRecipes.length > 0) {
        issues.push(`Invalid recipe IDs found: ${invalidRecipes.join(', ')}`);
        
        // Clean up invalid recipes
        set({
          knownRecipeIds: knownRecipeIds.filter(id => 
            recipes.find((recipe: Recipe) => recipe.id === id)
          )
        });
      }

      // Check for duplicate recipes
      const duplicates = knownRecipeIds.filter((id, index) => 
        knownRecipeIds.indexOf(id) !== index
      );

      if (duplicates.length > 0) {
        issues.push(`Duplicate recipe IDs found: ${duplicates.join(', ')}`);
        
        // Remove duplicates
        set({
          knownRecipeIds: [...new Set(knownRecipeIds)]
        });
      }

      if (issues.length > 0) {
        debugLog(`Data validation issues fixed: ${issues.join('; ')}`);
      }

      return issues.length === 0;
    },

    resetCraftingState: () => {
      set(initialCraftingState);
      // Anche il singleton delle ricette va resettato per un test pulito
      RecipeManager.getInstance().reset();
    }
  }))
);

// ===== EMERGENCY FALLBACK =====

/**
 * Carica ricette di emergenza in caso di errore nel caricamento principale
 */
async function loadEmergencyRecipes(): Promise<Recipe[]> {
  return [
    {
      id: 'emergency_bandage',
      resultItemId: 'MED_BANDAGE_BASIC',
      resultQuantity: 1,
      category: 'medical',
      description: 'Benda di emergenza per ferite base',
      components: [
        { itemId: 'CRAFT_CLOTH', quantity: 1 }
      ],
      unlockedByLevel: 1
    }
  ];
}

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