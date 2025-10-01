import { act } from '@testing-library/react';

// Define paths for clarity and to avoid hoisting issues.
const gameStorePath = '../stores/gameStore';
const characterStorePath = '../stores/character/characterStore';
const itemStorePath = '../stores/item/itemStore';
const worldStorePath = '../stores/world/worldStore';
const notificationStorePath = '../stores/notifications/notificationStore';
const timeStorePath = '../stores/time/timeStore';
const playerMovementServicePath = '../services/playerMovementService';
const itemDatabasePath = '../data/items/itemDatabase';

describe('Store Synchronization Tests', () => {
  // Define module-scoped variables that will be re-assigned in beforeEach
  let useGameStore: typeof import('../stores/gameStore').useGameStore;
  let useCharacterStore: typeof import('../stores/character/characterStore').useCharacterStore;
  let useItemStore: typeof import('../stores/item/itemStore').useItemStore;
  let useWorldStore: typeof import('../stores/world/worldStore').useWorldStore;
  let useNotificationStore: typeof import('../stores/notifications/notificationStore').useNotificationStore;
  let useTimeStore: typeof import('../stores/time/timeStore').useTimeStore;
  let playerMovementService: jest.Mocked<typeof import('../services/playerMovementService').playerMovementService>;
  let itemDatabase: typeof import('../data/items/itemDatabase').itemDatabase;


  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    // Mock dependencies BEFORE requiring the modules that use them.
    jest.doMock(playerMovementServicePath, () => ({
      playerMovementService: {
        handleMovementEffects: jest.fn(),
      },
    }));

    // Now require the modules to get the fresh, mocked versions.
    useGameStore = require(gameStorePath).useGameStore;
    useCharacterStore = require(characterStorePath).useCharacterStore;
    useItemStore = require(itemStorePath).useItemStore;
    useWorldStore = require(worldStorePath).useWorldStore;
    useNotificationStore = require(notificationStorePath).useNotificationStore;
    useTimeStore = require(timeStorePath).useTimeStore;
    playerMovementService = require(playerMovementServicePath).playerMovementService;
    itemDatabase = require(itemDatabasePath).itemDatabase;

    // Add necessary items for tests into the database
    itemDatabase['CRAFT_STONE'] = { id: 'CRAFT_STONE', name: 'Pietra da Lavoro', type: 'material', stackable: true };
    itemDatabase['FOOD_RATION'] = { id: 'FOOD_RATION', name: 'Razione di Cibo', type: 'consumable', stackable: true };
    itemDatabase['CRAFT_WOOD'] = { id: 'CRAFT_WOOD', name: 'Legno', type: 'material', stackable: true };

    // Initialize all stores to a clean state for each test
    act(() => {
      // It's important to initialize gameStore first if it resets other stores.
      // Based on the old code, it seems it doesn't, but this is a safe pattern.
      useCharacterStore.getState().initialize();
      useItemStore.getState().resetStore();
      useWorldStore.getState().resetWorld();
      useNotificationStore.getState().resetNotifications();
      useTimeStore.getState().resetTime();

      // Manually set the item database in the item store
      useItemStore.setState({ items: itemDatabase });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Store Synchronization', () => {
    test('should have all stores properly initialized', () => {
      expect(useGameStore.getState()).toBeDefined();
      expect(useCharacterStore.getState()).toBeDefined();
      expect(useItemStore.getState()).toBeDefined();
      expect(useWorldStore.getState()).toBeDefined();
      expect(useNotificationStore.getState()).toBeDefined();
    });

    test('should have proxy getters working in gameStore', () => {
      const gameStore = useGameStore.getState();
      const characterStore = useCharacterStore.getState();
      const itemStore = useItemStore.getState();

      expect(gameStore.characterSheet).toBe(characterStore.characterSheet);
      expect(gameStore.items).toBe(itemStore.items);
    });
  });

  describe('GameStore Proxy Functionality', () => {
    test('should provide access to characterSheet through gameStore', () => {
      act(() => {
        useGameStore.getState().addExperience(100);
      });

      const gameStoreCharacter = useGameStore.getState().characterSheet;
      const directCharacter = useCharacterStore.getState().characterSheet;

      expect(gameStoreCharacter.experience.currentXP).toBe(100);
      expect(gameStoreCharacter).toEqual(directCharacter);
    });

    test('should add items to inventory via gameStore', async () => {
      await act(async () => {
        useGameStore.getState().addItem('CRAFT_STONE', 3);
      });

      const characterInventory = useCharacterStore.getState().characterSheet.inventory;
      expect(characterInventory.some(slot => slot?.itemId === 'CRAFT_STONE' && slot.quantity === 3)).toBe(true);
    });
  });

  describe('World-Character Integration', () => {
    test('should update position and delegate side effects to the service', () => {
      const newPosition = { x: 5, y: 5 };
      const newBiomeChar = 'F'; // Forest
      const newBiomeKey = 'FOREST';

      act(() => {
        useWorldStore.getState().updatePlayerPosition(newPosition, newBiomeChar);
      });

      const updatedWorldStore = useWorldStore.getState();
      expect(updatedWorldStore.playerPosition).toEqual(newPosition);
      expect(updatedWorldStore.currentBiome).toBe(newBiomeKey);
      expect(playerMovementService.handleMovementEffects).toHaveBeenCalledTimes(1);
      expect(playerMovementService.handleMovementEffects).toHaveBeenCalledWith(newBiomeKey);
    });
  });

  describe('Cross-Store Data Consistency', () => {
    test('should maintain data consistency across multiple operations', async () => {
      const initialHP = useCharacterStore.getState().characterSheet.currentHP;

      await act(async () => {
        useGameStore.getState().addItem('FOOD_RATION', 3);
        useGameStore.getState().takeDamage(5);
        useGameStore.getState().addExperience(50);
      });

      const characterSheet = useGameStore.getState().characterSheet;
      const inventory = characterSheet.inventory;
      
      const ration = inventory.find(slot => slot?.itemId === 'FOOD_RATION');
      expect(ration?.quantity).toBe(3);
      
      expect(characterSheet.currentHP).toBe(initialHP - 5);
      expect(characterSheet.experience.currentXP).toBe(50);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should maintain referential integrity after errors', async () => {
       await act(async () => {
         useGameStore.getState().addItem('CRAFT_WOOD', 5);
       });

       await act(async () => {
         // This operation should fail gracefully but not corrupt the state
         useGameStore.getState().removeItems('CRAFT_WOOD', 10);
       });

       const inventory = useCharacterStore.getState().characterSheet.inventory;
       const woodSlot = inventory.find(slot => slot?.itemId === 'CRAFT_WOOD');

       // The item should still be there because the invalid operation was reverted
       expect(woodSlot).toBeDefined();
       expect(woodSlot?.quantity).toBe(5);
    });
  });
});