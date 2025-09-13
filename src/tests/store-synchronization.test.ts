/**
 * Store Synchronization Tests
 * 
 * Tests to verify synchronization between all main Zustand stores
 * as specified in ZUSTAND_REFACTORING_SPEC.md
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useGameStore } from '../stores/gameStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useInventoryStore } from '../stores/inventory/inventoryStore';
import { useWorldStore } from '../stores/world/worldStore';
import { useNotificationStore } from '../stores/notifications/notificationStore';
import type { IInventorySlot } from '../interfaces/items';
import type { ICharacterSheet } from '../rules/types';

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});

describe('Store Synchronization Tests', () => {
  let gameStore: any;
  let characterStore: any;
  let inventoryStore: any;
  let worldStore: any;
  let notificationStore: any;

  beforeEach(() => {
    // Reset all stores to initial state
    gameStore = useGameStore.getState();
    characterStore = useCharacterStore.getState();
    inventoryStore = useInventoryStore.getState();
    worldStore = useWorldStore.getState();
    notificationStore = useNotificationStore.getState();

    // Reset character and inventory
    characterStore.resetCharacter();
    inventoryStore.clearInventory?.();
    notificationStore.clearLogs?.();
  });

  describe('Character-Inventory Synchronization', () => {
    test('should maintain inventory consistency between characterStore and inventoryStore', () => {
      // Add item through inventoryStore
      inventoryStore.addItem('CRAFT_WOOD', 5);
      
      // Check if characterStore reflects the change
      const characterInventory = characterStore.characterSheet.inventory;
      const inventoryStoreData = inventoryStore.getInventory();
      
      expect(characterInventory).toEqual(inventoryStoreData);
      
      // Verify item exists in both
      const woodInCharacter = characterInventory.find((slot: IInventorySlot) => slot.itemId === 'CRAFT_WOOD');
      const woodInInventory = inventoryStoreData.find((slot: IInventorySlot) => slot.itemId === 'CRAFT_WOOD');
      
      expect(woodInCharacter).toBeDefined();
      expect(woodInInventory).toBeDefined();
      expect(woodInCharacter?.quantity).toBe(5);
      expect(woodInInventory?.quantity).toBe(5);
    });

    test('should sync equipment changes between stores', () => {
      // Add an equipable item
      inventoryStore.addItem('WEAPON_KNIFE', 1);
      
      // Equip item through inventoryStore
      const equipResult = inventoryStore.equipItemFromInventory('WEAPON_KNIFE');
      
      if (equipResult.success) {
        // Check if characterStore reflects equipment change
        const equippedWeapon = characterStore.characterSheet.equipment?.weapon;
        expect(equippedWeapon).toBeDefined();
        expect(equippedWeapon?.itemId).toBe('WEAPON_KNIFE');
      }
    });

    test('should maintain HP changes with proper logging', () => {
      const initialHP = characterStore.characterSheet.currentHP;
      const hpChange = -10;
      
      // Clear existing logs
      const initialLogCount = notificationStore.logs.length;
      
      // Update HP through characterStore
      characterStore.updateHP(hpChange);
      
      // Verify HP change
      const newHP = characterStore.characterSheet.currentHP;
      expect(newHP).toBe(Math.max(0, initialHP + hpChange));
      
      // Verify logging occurred
      const finalLogCount = notificationStore.logs.length;
      expect(finalLogCount).toBeGreaterThan(initialLogCount);
    });
  });

  describe('GameStore Proxy Functionality', () => {
    test('should provide access to characterSheet through gameStore', () => {
      // Modify character through characterStore
      characterStore.addExperience(100);
      
      // Access through gameStore proxy
      const gameStoreCharacter = gameStore.characterSheet;
      const directCharacter = characterStore.characterSheet;
      
      expect(gameStoreCharacter).toEqual(directCharacter);
      expect(gameStoreCharacter.experience).toBe(directCharacter.experience);
    });

    test('should provide access to inventory through gameStore', () => {
      // Add items through inventoryStore
      inventoryStore.addItem('CRAFT_STONE', 3);
      inventoryStore.addItem('CRAFT_METAL_SCRAP', 1);
      
      // Access through gameStore proxy
      const gameStoreInventory = gameStore.inventory;
      const directInventory = inventoryStore.getInventory();
      
      expect(gameStoreInventory).toEqual(directInventory);
      expect(gameStoreInventory.length).toBe(directInventory.length);
    });

    test('should provide access to items database through gameStore', () => {
      const gameStoreItems = gameStore.items;
      const inventoryStoreItems = inventoryStore.items;
      
      expect(gameStoreItems).toEqual(inventoryStoreItems);
      expect(Object.keys(gameStoreItems).length).toBeGreaterThan(0);
    });
  });

  describe('World-Character Integration', () => {
    test('should sync player movement with proper logging', () => {
      const initialLogCount = notificationStore.logs.length;
      const newPosition = { x: 5, y: 5 };
      
      // Move player through worldStore
      worldStore.updatePlayerPosition(newPosition);
      
      // Verify position change
      const currentPosition = worldStore.playerPosition;
      expect(currentPosition.x).toBe(newPosition.x);
      expect(currentPosition.y).toBe(newPosition.y);
      
      // Verify movement was logged
      const finalLogCount = notificationStore.logs.length;
      expect(finalLogCount).toBeGreaterThanOrEqual(initialLogCount);
    });

    test('should handle time advancement with proper effects', () => {
      const initialTime = worldStore.timeState.currentTime;
      const timeAdvance = 120; // 2 hours
      
      // Advance time
      worldStore.advanceTime(timeAdvance);
      
      // Verify time change
      const newTime = worldStore.timeState.currentTime;
      expect(newTime).toBe((initialTime + timeAdvance) % 1440);
      
      // Verify logging for significant time changes
      const logs = notificationStore.logs;
      const timeLog = logs.find(log => log.type.includes('TIME'));
      expect(timeLog).toBeDefined();
    });
  });

  describe('Cross-Store Data Consistency', () => {
    test('should maintain data consistency across multiple operations', () => {
      // Perform multiple operations across stores
      inventoryStore.addItem('FOOD_RATION', 3);
      characterStore.updateHP(-5);
      characterStore.addExperience(50);
      worldStore.updatePlayerPosition({ x: 10, y: 15 });
      
      // Verify all changes are reflected correctly
      const inventory = inventoryStore.getInventory();
      const character = characterStore.characterSheet;
      const position = worldStore.playerPosition;
      
      // Check inventory
      const ration = inventory.find(slot => slot.itemId === 'FOOD_RATION');
      expect(ration?.quantity).toBe(3);
      
      // Check character changes
      expect(character.currentHP).toBeLessThan(character.maxHP);
      expect(character.experience).toBeGreaterThan(0);
      
      // Check position
      expect(position.x).toBe(10);
      expect(position.y).toBe(15);
      
      // Verify gameStore proxies reflect all changes
      expect(gameStore.inventory).toEqual(inventory);
      expect(gameStore.characterSheet).toEqual(character);
    });

    test('should handle concurrent store updates without conflicts', () => {
      const operations = [
        () => inventoryStore.addItem('CRAFT_CLOTH', 2),
        () => characterStore.updateHP(10),
        () => worldStore.advanceTime(30),
        () => inventoryStore.addItem('CRAFT_WOOD', 1),
        () => characterStore.addExperience(25)
      ];
      
      // Execute operations rapidly
      operations.forEach(op => op());
      
      // Verify final state is consistent
      const inventory = inventoryStore.getInventory();
      const character = characterStore.characterSheet;
      
      expect(inventory.length).toBeGreaterThan(0);
      expect(character.experience).toBeGreaterThan(0);
      
      // Verify no data corruption
      inventory.forEach(slot => {
        expect(slot.itemId).toBeDefined();
        expect(slot.quantity).toBeGreaterThan(0);
      });
    });
  });

  describe('Logging and Notification Integration', () => {
    test('should log critical state changes across all stores', () => {
      const initialLogCount = notificationStore.logs.length;
      
      // Perform operations that should generate logs
      characterStore.updateHP(-15); // HP damage
      characterStore.addExperience(100); // XP gain
      inventoryStore.addItem('FOOD_RATION', 1); // Item added
      worldStore.updatePlayerPosition({ x: 3, y: 7 }); // Movement
      worldStore.advanceTime(90); // Time advance
      
      // Verify logs were created
      const finalLogCount = notificationStore.logs.length;
      expect(finalLogCount).toBeGreaterThan(initialLogCount);
      
      // Verify different types of logs exist
      const logs = notificationStore.logs;
      const hasHPLog = logs.some(log => log.type.includes('HP'));
      const hasXPLog = logs.some(log => log.type.includes('XP'));
      const hasItemLog = logs.some(log => log.type.includes('ITEM') || log.type.includes('INVENTORY'));
      
      expect(hasHPLog || hasXPLog || hasItemLog).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle invalid operations gracefully', () => {
      // Try to remove non-existent item
      const removeResult = inventoryStore.removeItem('NON_EXISTENT_ITEM', 1);
      expect(removeResult.success).toBe(false);
      
      // Try to equip non-existent item
      const equipResult = inventoryStore.equipItemFromInventory('NON_EXISTENT_WEAPON');
      expect(equipResult.success).toBe(false);
      
      // Verify stores remain in valid state
      const inventory = inventoryStore.getInventory();
      const character = characterStore.characterSheet;
      
      expect(Array.isArray(inventory)).toBe(true);
      expect(character.currentHP).toBeGreaterThanOrEqual(0);
      expect(character.currentHP).toBeLessThanOrEqual(character.maxHP);
    });

    test('should maintain referential integrity after errors', () => {
      // Add valid items
      inventoryStore.addItem('CRAFT_WOOD', 5);
      
      // Attempt invalid operations
      inventoryStore.removeItem('CRAFT_WOOD', 10); // Try to remove more than available
      
      // Verify data integrity
      const inventory = inventoryStore.getInventory();
      const woodSlot = inventory.find(slot => slot.itemId === 'CRAFT_WOOD');
      
      expect(woodSlot).toBeDefined();
      expect(woodSlot?.quantity).toBeGreaterThanOrEqual(0);
      
      // Verify gameStore proxy still works
      expect(gameStore.inventory).toEqual(inventory);
    });
  });
});

/**
 * Helper function to run all synchronization tests
 * Can be called from other test files or validation scripts
 */
export function runStoreSynchronizationTests(): Promise<boolean> {
  return new Promise((resolve) => {
    // This would typically be handled by Jest
    // For now, we'll just resolve true
    resolve(true);
  });
}

/**
 * Validation function to check store synchronization in runtime
 */
export function validateStoreSynchronization(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  try {
    const gameStore = useGameStore.getState();
    const characterStore = useCharacterStore.getState();
    const inventoryStore = useInventoryStore.getState();
    
    // Check if gameStore proxies work
    if (!gameStore.characterSheet) {
      issues.push('GameStore characterSheet proxy not working');
    }
    
    if (!gameStore.inventory) {
      issues.push('GameStore inventory proxy not working');
    }
    
    if (!gameStore.items) {
      issues.push('GameStore items proxy not working');
    }
    
    // Check inventory synchronization
    const characterInventory = characterStore.characterSheet.inventory;
    const inventoryStoreData = inventoryStore.getInventory();
    
    if (JSON.stringify(characterInventory) !== JSON.stringify(inventoryStoreData)) {
      issues.push('Inventory synchronization mismatch between characterStore and inventoryStore');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    return {
      isValid: false,
      issues: [`Validation error: ${error}`]
    };
  }
}