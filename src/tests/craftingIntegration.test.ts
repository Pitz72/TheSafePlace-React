/**
 * Test per l'integrazione del sistema di crafting
 * Verifica le funzioni di integrazione con il game store
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { 
  executeCrafting, 
  hasInventorySpace, 
  simulateCrafting 
} from '../utils/craftingUtils';
import type { Recipe, InventoryItem, CharacterSheet } from '../types/crafting';
import { CRAFTING_ERRORS } from '../types/crafting';

// Mock del game store
const createMockGameStore = () => ({
  characterSheet: {
    inventory: [] as InventoryItem[],
    stats: { adattamento: 10, potenza: 8, percezione: 12 },
    knownRecipes: ['test_knife']
  } as CharacterSheet,
  items: {
    'knife_sharp': { name: 'Coltello Affilato' },
    'knife_dull': { name: 'Coltello Smussato' },
    'whetstone': { name: 'Pietra per Affilare' }
  },
  addItem: jest.fn(),
  removeItem: jest.fn(),
  addExperience: jest.fn()
});

// Ricetta di test
const testRecipe: Recipe = {
  id: 'test_knife',
  resultItemId: 'knife_sharp',
  resultQuantity: 1,
  components: [
    { itemId: 'knife_dull', quantity: 1 },
    { itemId: 'whetstone', quantity: 1 }
  ],
  description: 'Test knife recipe'
};

// Inventario di test
const testInventory: InventoryItem[] = [
  { itemId: 'knife_dull', quantity: 1 },
  { itemId: 'whetstone', quantity: 1 }
];

describe('Crafting Integration', () => {
  let mockGameStore: ReturnType<typeof createMockGameStore>;

  beforeEach(() => {
    mockGameStore = createMockGameStore();
    jest.clearAllMocks();
  });

  describe('executeCrafting', () => {
    test('dovrebbe eseguire crafting con successo', async () => {
      mockGameStore.characterSheet.inventory = [...testInventory];
      mockGameStore.addItem.mockReturnValue(true);

      const result = await executeCrafting(
        testRecipe, 
        mockGameStore, 
        ['test_knife']
      );

      expect(result.success).toBe(true);
      expect(result.itemCreated).toBe('Coltello Affilato');
      expect(result.quantityCreated).toBe(1);
      expect(result.xpGained).toBeGreaterThan(0);
      
      // Verifica chiamate al game store
      expect(mockGameStore.removeItem).toHaveBeenCalledTimes(2);
      expect(mockGameStore.addItem).toHaveBeenCalledWith('knife_sharp', 1);
      expect(mockGameStore.addExperience).toHaveBeenCalled();
    });

    test('dovrebbe fallire se ricetta non conosciuta', async () => {
      mockGameStore.characterSheet.inventory = [...testInventory];

      const result = await executeCrafting(
        testRecipe, 
        mockGameStore, 
        [] // Nessuna ricetta conosciuta
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(CRAFTING_ERRORS.RECIPE_NOT_KNOWN);
      
      // Non dovrebbe modificare inventario
      expect(mockGameStore.removeItem).not.toHaveBeenCalled();
      expect(mockGameStore.addItem).not.toHaveBeenCalled();
    });

    test('dovrebbe fallire se materiali insufficienti', async () => {
      mockGameStore.characterSheet.inventory = [
        { itemId: 'knife_dull', quantity: 1 }
        // Manca whetstone
      ];

      const result = await executeCrafting(
        testRecipe, 
        mockGameStore, 
        ['test_knife']
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(CRAFTING_ERRORS.INSUFFICIENT_MATERIALS);
    });

    test('dovrebbe fallire se non può aggiungere oggetto risultante', async () => {
      mockGameStore.characterSheet.inventory = [...testInventory];
      mockGameStore.addItem.mockReturnValue(false); // Inventario pieno

      const result = await executeCrafting(
        testRecipe, 
        mockGameStore, 
        ['test_knife']
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(CRAFTING_ERRORS.UNKNOWN_ERROR);
    });

    test('dovrebbe gestire errori durante rimozione materiali', async () => {
      mockGameStore.characterSheet.inventory = [
        { itemId: 'knife_dull', quantity: 1 },
        { itemId: 'whetstone', quantity: 0 } // Quantità insufficiente
      ];

      const result = await executeCrafting(
        testRecipe, 
        mockGameStore, 
        ['test_knife']
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(CRAFTING_ERRORS.UNKNOWN_ERROR);
    });

    test('dovrebbe fallire se nessun character sheet', async () => {
      mockGameStore.characterSheet = null as any;

      const result = await executeCrafting(
        testRecipe, 
        mockGameStore, 
        ['test_knife']
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(CRAFTING_ERRORS.UNKNOWN_ERROR);
    });

    test('dovrebbe rimuovere materiali da slot multipli', async () => {
      // Materiali distribuiti su più slot
      mockGameStore.characterSheet.inventory = [
        { itemId: 'knife_dull', quantity: 1 },
        { itemId: 'whetstone', quantity: 1 },
        { itemId: 'other_item', quantity: 5 }
      ];
      mockGameStore.addItem.mockReturnValue(true);

      const result = await executeCrafting(
        testRecipe, 
        mockGameStore, 
        ['test_knife']
      );

      expect(result.success).toBe(true);
      expect(mockGameStore.removeItem).toHaveBeenCalledWith(0, 1); // knife_dull
      expect(mockGameStore.removeItem).toHaveBeenCalledWith(1, 1); // whetstone
    });
  });

  describe('hasInventorySpace', () => {
    test('dovrebbe rilevare spazio disponibile in slot vuoti', () => {
      const inventory: InventoryItem[] = [
        { itemId: 'item1', quantity: 1 },
        null as any, // Slot vuoto
        { itemId: 'item2', quantity: 1 }
      ];

      const hasSpace = hasInventorySpace(inventory, 'new_item', 1, 20);
      expect(hasSpace).toBe(true);
    });

    test('dovrebbe rilevare spazio in slot esistenti impilabili', () => {
      const inventory: InventoryItem[] = [
        { itemId: 'stackable_item', quantity: 50 }, // Può contenere altri 49
        { itemId: 'other_item', quantity: 1 }
      ];

      const hasSpace = hasInventorySpace(inventory, 'stackable_item', 10, 20);
      expect(hasSpace).toBe(true);
    });

    test('dovrebbe rilevare mancanza di spazio', () => {
      const fullInventory: InventoryItem[] = Array(20).fill(null).map((_, i) => ({
        itemId: `item_${i}`,
        quantity: 99
      }));

      const hasSpace = hasInventorySpace(fullInventory, 'new_item', 1, 20);
      expect(hasSpace).toBe(false);
    });

    test('dovrebbe gestire inventario vuoto', () => {
      const emptyInventory: InventoryItem[] = [];

      const hasSpace = hasInventorySpace(emptyInventory, 'new_item', 1, 20);
      expect(hasSpace).toBe(true);
    });

    test('dovrebbe considerare limite stack per oggetti esistenti', () => {
      const inventory: InventoryItem[] = [
        { itemId: 'full_stack', quantity: 99 } // Stack pieno
      ];

      const hasSpace = hasInventorySpace(inventory, 'full_stack', 1, 20);
      expect(hasSpace).toBe(true); // Dovrebbe usare nuovo slot
    });
  });

  describe('simulateCrafting', () => {
    test('dovrebbe simulare crafting riuscito', () => {
      const simulation = simulateCrafting(
        testRecipe,
        testInventory,
        mockGameStore.characterSheet,
        ['test_knife']
      );

      expect(simulation.canCraft).toBe(true);
      expect(simulation.errors).toHaveLength(0);
      expect(simulation.xpGain).toBeGreaterThan(0);
    });

    test('dovrebbe rilevare ricetta sconosciuta', () => {
      const simulation = simulateCrafting(
        testRecipe,
        testInventory,
        mockGameStore.characterSheet,
        [] // Nessuna ricetta conosciuta
      );

      expect(simulation.canCraft).toBe(false);
      expect(simulation.errors).toContain(CRAFTING_ERRORS.RECIPE_NOT_KNOWN);
    });

    test('dovrebbe rilevare materiali insufficienti', () => {
      const insufficientInventory: InventoryItem[] = [
        { itemId: 'knife_dull', quantity: 1 }
        // Manca whetstone
      ];

      const simulation = simulateCrafting(
        testRecipe,
        insufficientInventory,
        mockGameStore.characterSheet,
        ['test_knife']
      );

      expect(simulation.canCraft).toBe(false);
      expect(simulation.errors).toContain(CRAFTING_ERRORS.INSUFFICIENT_MATERIALS);
    });

    test('dovrebbe rilevare abilità insufficienti', () => {
      const recipeWithSkill: Recipe = {
        ...testRecipe,
        skillRequirement: {
          skill: 'crafting',
          level: 20 // Livello troppo alto
        }
      };

      const simulation = simulateCrafting(
        recipeWithSkill,
        testInventory,
        mockGameStore.characterSheet,
        ['test_knife']
      );

      expect(simulation.canCraft).toBe(false);
      expect(simulation.errors).toContain(CRAFTING_ERRORS.INSUFFICIENT_SKILL);
    });

    test('dovrebbe generare avvisi per materiali scarsi', () => {
      const scarceInventory: InventoryItem[] = [
        { itemId: 'knife_dull', quantity: 1 }, // Esattamente quello che serve
        { itemId: 'whetstone', quantity: 2 }   // Più di quello che serve
      ];

      const simulation = simulateCrafting(
        testRecipe,
        scarceInventory,
        mockGameStore.characterSheet,
        ['test_knife']
      );

      expect(simulation.canCraft).toBe(true);
      expect(simulation.warnings).toContain('Ultimo knife_dull disponibile');
      expect(simulation.warnings).not.toContain('Ultimo whetstone disponibile');
    });

    test('dovrebbe calcolare XP correttamente', () => {
      const simulation = simulateCrafting(
        testRecipe,
        testInventory,
        mockGameStore.characterSheet,
        ['test_knife']
      );

      expect(simulation.xpGain).toBeGreaterThan(0);
      expect(typeof simulation.xpGain).toBe('number');
    });

    test('dovrebbe gestire errori multipli', () => {
      const recipeWithSkill: Recipe = {
        ...testRecipe,
        skillRequirement: {
          skill: 'crafting',
          level: 20
        }
      };

      const simulation = simulateCrafting(
        recipeWithSkill,
        [], // Nessun materiale
        mockGameStore.characterSheet,
        [] // Ricetta sconosciuta
      );

      expect(simulation.canCraft).toBe(false);
      expect(simulation.errors.length).toBeGreaterThan(1);
      expect(simulation.errors).toContain(CRAFTING_ERRORS.RECIPE_NOT_KNOWN);
      expect(simulation.errors).toContain(CRAFTING_ERRORS.INSUFFICIENT_MATERIALS);
      expect(simulation.errors).toContain(CRAFTING_ERRORS.INSUFFICIENT_SKILL);
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire inventario con slot null', () => {
      const inventoryWithNulls: InventoryItem[] = [
        { itemId: 'knife_dull', quantity: 1 },
        null as any,
        { itemId: 'whetstone', quantity: 1 },
        null as any
      ];

      const simulation = simulateCrafting(
        testRecipe,
        inventoryWithNulls,
        mockGameStore.characterSheet,
        ['test_knife']
      );

      expect(simulation.canCraft).toBe(true);
    });

    test('dovrebbe gestire ricetta senza componenti', () => {
      const emptyRecipe: Recipe = {
        id: 'empty_recipe',
        resultItemId: 'free_item',
        resultQuantity: 1,
        components: [],
        description: 'Free item'
      };

      const simulation = simulateCrafting(
        emptyRecipe,
        [],
        mockGameStore.characterSheet,
        ['empty_recipe']
      );

      expect(simulation.canCraft).toBe(true);
      expect(simulation.errors).toHaveLength(0);
    });

    test('dovrebbe gestire quantità zero nei componenti', () => {
      const zeroQuantityRecipe: Recipe = {
        ...testRecipe,
        components: [
          { itemId: 'knife_dull', quantity: 0 },
          { itemId: 'whetstone', quantity: 1 }
        ]
      };

      const simulation = simulateCrafting(
        zeroQuantityRecipe,
        testInventory,
        mockGameStore.characterSheet,
        ['test_knife']
      );

      expect(simulation.canCraft).toBe(true);
    });
  });
});