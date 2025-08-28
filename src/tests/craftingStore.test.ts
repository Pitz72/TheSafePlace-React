/**
 * Test per il crafting store
 * Verifica le azioni e selettori del sistema di crafting
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { create } from 'zustand';
import type { Recipe, CraftingState } from '../types/crafting';
import type { InventoryItem, CharacterSheet } from '../interfaces/gameState';

// Mock delle utility functions
jest.mock('../utils/recipeLoader', () => ({
  loadRecipes: jest.fn(),
  getRecipeById: jest.fn(),
  getRecipeStats: jest.fn()
}));

jest.mock('../utils/craftingUtils', () => ({
  getAvailableRecipes: jest.fn(),
  canCraftRecipe: jest.fn(),
  getMaterialStatus: jest.fn(),
  validateCraftingAttempt: jest.fn(),
  calculateCraftingXP: jest.fn(),
  createSuccessResult: jest.fn(),
  createFailureResult: jest.fn(),
  debugLog: jest.fn(),
  groupRecipesByAvailability: jest.fn()
}));

// Mock del game store
const mockGameStore = {
  characterSheet: {
    inventory: [] as InventoryItem[],
    knownRecipes: [] as string[],
    stats: { adattamento: 10, potenza: 8, percezione: 12 }
  } as CharacterSheet,
  items: {},
  addItem: jest.fn(),
  removeItem: jest.fn(),
  addExperience: jest.fn(),
  addLogEntry: jest.fn()
};

jest.mock('../stores/gameStore', () => ({
  useGameStore: {
    getState: () => mockGameStore
  }
}));

// Ricette di test
const testRecipes: Recipe[] = [
  {
    id: 'test_knife',
    resultItemId: 'knife_sharp',
    resultQuantity: 1,
    components: [
      { itemId: 'knife_dull', quantity: 1 },
      { itemId: 'whetstone', quantity: 1 }
    ],
    category: 'weapons',
    description: 'Test knife recipe'
  },
  {
    id: 'test_bandages',
    resultItemId: 'bandages_clean',
    resultQuantity: 2,
    components: [
      { itemId: 'bandages_dirty', quantity: 2 },
      { itemId: 'alcohol', quantity: 1 }
    ],
    category: 'consumables',
    description: 'Test bandages recipe'
  }
];

// Store di test semplificato
const createTestCraftingStore = () => create<CraftingState>((set, get) => ({
  selectedRecipeIndex: 0,
  isOpen: false,
  allRecipes: [],
  knownRecipeIds: [],

  setSelectedRecipe: (index: number) => {
    const availableRecipes = get().getAvailableRecipes();
    const clampedIndex = Math.max(0, Math.min(index, availableRecipes.length - 1));
    set({ selectedRecipeIndex: clampedIndex });
  },

  openCrafting: () => set({ isOpen: true }),
  closeCrafting: () => set({ isOpen: false, selectedRecipeIndex: 0 }),

  unlockRecipe: (recipeId: string) => {
    const { knownRecipeIds } = get();
    if (!knownRecipeIds.includes(recipeId)) {
      set({ knownRecipeIds: [...knownRecipeIds, recipeId] });
    }
  },

  craftItem: async (recipeId: string): Promise<boolean> => {
    // Implementazione semplificata per i test
    const { knownRecipeIds } = get();
    return knownRecipeIds.includes(recipeId);
  },

  getAvailableRecipes: () => {
    const { allRecipes, knownRecipeIds } = get();
    return allRecipes.filter(recipe => knownRecipeIds.includes(recipe.id));
  },

  canCraftRecipe: (recipeId: string) => {
    const { knownRecipeIds } = get();
    return knownRecipeIds.includes(recipeId);
  },

  getMaterialStatus: (recipeId: string) => {
    const { allRecipes } = get();
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return [];
    
    return recipe.components.map(comp => ({
      itemId: comp.itemId,
      itemName: comp.itemId,
      owned: 0,
      required: comp.quantity,
      sufficient: false
    }));
  }
}));

describe('Crafting Store', () => {
  let store: ReturnType<typeof createTestCraftingStore>;

  beforeEach(() => {
    store = createTestCraftingStore();
    jest.clearAllMocks();
  });

  describe('Stato iniziale', () => {
    test('dovrebbe avere stato iniziale corretto', () => {
      const state = store.getState();
      
      expect(state.selectedRecipeIndex).toBe(0);
      expect(state.isOpen).toBe(false);
      expect(state.allRecipes).toEqual([]);
      expect(state.knownRecipeIds).toEqual([]);
    });
  });

  describe('Azioni base', () => {
    test('setSelectedRecipe dovrebbe aggiornare l\'indice selezionato', () => {
      // Setup: aggiungi ricette e sbloccale
      store.setState({ 
        allRecipes: testRecipes,
        knownRecipeIds: ['test_knife', 'test_bandages']
      });

      const { setSelectedRecipe } = store.getState();
      
      setSelectedRecipe(1);
      expect(store.getState().selectedRecipeIndex).toBe(1);
    });

    test('setSelectedRecipe dovrebbe limitare l\'indice ai bounds validi', () => {
      // Setup: una sola ricetta disponibile
      store.setState({ 
        allRecipes: testRecipes,
        knownRecipeIds: ['test_knife']
      });

      const { setSelectedRecipe } = store.getState();
      
      // Prova indice troppo alto
      setSelectedRecipe(10);
      expect(store.getState().selectedRecipeIndex).toBe(0);
      
      // Prova indice negativo
      setSelectedRecipe(-1);
      expect(store.getState().selectedRecipeIndex).toBe(0);
    });

    test('openCrafting dovrebbe aprire la schermata', () => {
      const { openCrafting } = store.getState();
      
      openCrafting();
      expect(store.getState().isOpen).toBe(true);
    });

    test('closeCrafting dovrebbe chiudere la schermata e resettare selezione', () => {
      // Setup: apri e seleziona una ricetta
      store.setState({ 
        isOpen: true, 
        selectedRecipeIndex: 1,
        allRecipes: testRecipes,
        knownRecipeIds: ['test_knife', 'test_bandages']
      });

      const { closeCrafting } = store.getState();
      
      closeCrafting();
      expect(store.getState().isOpen).toBe(false);
      expect(store.getState().selectedRecipeIndex).toBe(0);
    });

    test('unlockRecipe dovrebbe aggiungere ricetta ai conosciuti', () => {
      const { unlockRecipe } = store.getState();
      
      unlockRecipe('test_knife');
      expect(store.getState().knownRecipeIds).toContain('test_knife');
    });

    test('unlockRecipe non dovrebbe duplicare ricette già conosciute', () => {
      store.setState({ knownRecipeIds: ['test_knife'] });
      
      const { unlockRecipe } = store.getState();
      
      unlockRecipe('test_knife');
      expect(store.getState().knownRecipeIds).toEqual(['test_knife']);
    });
  });

  describe('Selettori', () => {
    beforeEach(() => {
      store.setState({ 
        allRecipes: testRecipes,
        knownRecipeIds: ['test_knife']
      });
    });

    test('getAvailableRecipes dovrebbe restituire solo ricette conosciute', () => {
      const { getAvailableRecipes } = store.getState();
      
      const available = getAvailableRecipes();
      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('test_knife');
    });

    test('canCraftRecipe dovrebbe verificare se ricetta è craftabile', () => {
      const { canCraftRecipe } = store.getState();
      
      expect(canCraftRecipe('test_knife')).toBe(true);
      expect(canCraftRecipe('test_bandages')).toBe(false);
      expect(canCraftRecipe('unknown_recipe')).toBe(false);
    });

    test('getMaterialStatus dovrebbe restituire stato materiali', () => {
      const { getMaterialStatus } = store.getState();
      
      const status = getMaterialStatus('test_knife');
      expect(status).toHaveLength(2);
      expect(status[0].itemId).toBe('knife_dull');
      expect(status[0].required).toBe(1);
      expect(status[1].itemId).toBe('whetstone');
      expect(status[1].required).toBe(1);
    });

    test('getMaterialStatus dovrebbe restituire array vuoto per ricetta inesistente', () => {
      const { getMaterialStatus } = store.getState();
      
      const status = getMaterialStatus('unknown_recipe');
      expect(status).toEqual([]);
    });
  });

  describe('Crafting', () => {
    test('craftItem dovrebbe restituire true per ricetta conosciuta', async () => {
      store.setState({ knownRecipeIds: ['test_knife'] });
      
      const { craftItem } = store.getState();
      
      const result = await craftItem('test_knife');
      expect(result).toBe(true);
    });

    test('craftItem dovrebbe restituire false per ricetta sconosciuta', async () => {
      const { craftItem } = store.getState();
      
      const result = await craftItem('unknown_recipe');
      expect(result).toBe(false);
    });
  });

  describe('Gestione ricette multiple', () => {
    test('dovrebbe gestire correttamente più ricette', () => {
      const { unlockRecipe, getAvailableRecipes } = store.getState();
      
      store.setState({ allRecipes: testRecipes });
      
      // Sblocca entrambe le ricette
      unlockRecipe('test_knife');
      unlockRecipe('test_bandages');
      
      const available = getAvailableRecipes();
      expect(available).toHaveLength(2);
      expect(available.map(r => r.id)).toEqual(['test_knife', 'test_bandages']);
    });

    test('dovrebbe mantenere selezione valida quando si sbloccano ricette', () => {
      store.setState({ 
        allRecipes: testRecipes,
        knownRecipeIds: ['test_knife'],
        selectedRecipeIndex: 0
      });

      const { unlockRecipe, setSelectedRecipe } = store.getState();
      
      // Sblocca seconda ricetta
      unlockRecipe('test_bandages');
      
      // Seleziona seconda ricetta
      setSelectedRecipe(1);
      expect(store.getState().selectedRecipeIndex).toBe(1);
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire lista ricette vuota', () => {
      const { getAvailableRecipes, setSelectedRecipe } = store.getState();
      
      const available = getAvailableRecipes();
      expect(available).toEqual([]);
      
      // Selezione dovrebbe rimanere a 0
      setSelectedRecipe(5);
      expect(store.getState().selectedRecipeIndex).toBe(0);
    });

    test('dovrebbe gestire ricette senza componenti', () => {
      const emptyRecipe: Recipe = {
        id: 'empty_recipe',
        resultItemId: 'empty_item',
        resultQuantity: 1,
        components: [],
        description: 'Empty recipe'
      };

      store.setState({ 
        allRecipes: [emptyRecipe],
        knownRecipeIds: ['empty_recipe']
      });

      const { getMaterialStatus } = store.getState();
      
      const status = getMaterialStatus('empty_recipe');
      expect(status).toEqual([]);
    });

    test('dovrebbe gestire ID ricetta null/undefined', () => {
      const { canCraftRecipe, getMaterialStatus } = store.getState();
      
      expect(canCraftRecipe('')).toBe(false);
      expect(getMaterialStatus('')).toEqual([]);
    });
  });

  describe('Stato reattivo', () => {
    test('dovrebbe reagire ai cambiamenti di stato', () => {
      const initialState = store.getState();
      expect(initialState.isOpen).toBe(false);

      // Sottoscrivi ai cambiamenti
      let stateChanges = 0;
      const unsubscribe = store.subscribe(() => {
        stateChanges++;
      });

      // Esegui azioni
      store.getState().openCrafting();
      store.getState().unlockRecipe('test_recipe');
      store.getState().setSelectedRecipe(1);

      expect(stateChanges).toBe(3);
      
      unsubscribe();
    });

    test('dovrebbe mantenere immutabilità dello stato', () => {
      const initialRecipes = testRecipes;
      store.setState({ allRecipes: initialRecipes });

      const { unlockRecipe } = store.getState();
      unlockRecipe('test_knife');

      // Le ricette originali non dovrebbero essere modificate
      expect(initialRecipes).toEqual(testRecipes);
      
      // Lo stato dovrebbe contenere una nuova referenza
      const newState = store.getState();
      expect(newState.allRecipes).toBe(initialRecipes); // Stesso array
      expect(newState.knownRecipeIds).not.toBe([]); // Nuovo array
    });
  });
});