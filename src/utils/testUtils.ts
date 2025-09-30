/**
 * Test utilities for store isolation and test setup
 * Provides reset mechanisms for all Zustand stores to prevent state pollution
 */

import { useGameStore } from '@/stores/gameStore';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useInventoryStore } from '@/stores/inventory/inventoryStore';
import { useWorldStore } from '@/stores/world/worldStore';
import { useTimeStore } from '@/stores/time/timeStore';
import { useWeatherStore } from '@/stores/weather/weatherStore';
import { useSurvivalStore } from '@/stores/survival/survivalStore';
import { useEventStore } from '@/stores/events/eventStore';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { useNarrativeStore } from '@/stores/narrative/narrativeStore';
import { useCombatStore } from '@/stores/combatStore';
import { useCraftingStore } from '@/stores/craftingStore';
import { useShelterStore } from '@/stores/shelter/shelterStore';
import { useRiverCrossingStore } from '@/stores/river/riverCrossingStore';
import { useSaveStore } from '@/stores/save/saveStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/ui/uiStore';

/**
 * Reset all Zustand stores to their initial state
 * This should be called in beforeEach or afterEach in tests
 */
export const resetAllStores = () => {
  // Reset core stores
  useGameStore.getState().resetStore?.();
  useCharacterStore.getState().resetStore?.();
  useInventoryStore.getState().resetStore?.();
  useWorldStore.getState().resetStore?.();
  useTimeStore.getState().resetStore?.();
  useWeatherStore.getState().resetStore?.();
  useSurvivalStore.getState().resetStore?.();
  
  // Reset feature stores
  useEventStore.getState().resetStore?.();
  useNotificationStore.getState().resetStore?.();
  useNarrativeStore.getState().resetStore?.();
  useCombatStore.getState().resetStore?.();
  useCraftingStore.getState().resetStore?.();
  useShelterStore.getState().resetStore?.();
  useRiverCrossingStore.getState().resetStore?.();
  
  // Reset utility stores
  useSaveStore.getState().resetStore?.();
  useSettingsStore.getState().resetStore?.();
  useUIStore.getState().resetStore?.();
};

/**
 * Create a test-safe environment by resetting all stores and clearing localStorage
 */
export const setupTestEnvironment = () => {
  resetAllStores();
  localStorage.clear();
  
  // Clear any pending timers
  jest.clearAllTimers();
  
  // Reset any global state
  if (typeof window !== 'undefined') {
    // Clear any debug globals
    delete (window as any).debugEvents;
    delete (window as any).debugCombat;
    delete (window as any).debugCrafting;
  }
};

/**
 * Cleanup test environment
 */
export const cleanupTestEnvironment = () => {
  resetAllStores();
  jest.clearAllMocks();
  jest.clearAllTimers();
};

/**
 * Wait for all pending promises and state updates
 */
export const waitForStateUpdates = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
  // Use setTimeout instead of setImmediate for browser compatibility
  await new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Mock console methods to prevent test output pollution
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  const spies = {
    log: jest.spyOn(console, 'log').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    info: jest.spyOn(console, 'info').mockImplementation(() => {})
  };
  
  return {
    restore: () => {
      Object.values(spies).forEach(spy => spy.mockRestore());
    }
  };
};

/**
 * Create a deterministic test environment with fixed random seed
 */
export const createDeterministicEnvironment = () => {
  // Mock Math.random per risultati deterministici
  const originalRandom = Math.random;
  Math.random = jest.fn(() => 0.5);
  
  // Mock Date.now per timestamp consistenti
  const originalDateNow = Date.now;
  Date.now = jest.fn(() => 1000000000000);
  
  return {
    restore: () => {
      Math.random = originalRandom;
      Date.now = originalDateNow;
      jest.clearAllMocks();
    }
  };
};

/**
 * Test helper to verify store isolation
 */
export const verifyStoreIsolation = () => {
  const initialStates: Record<string, any> = {};
  
  // Capture initial states
  initialStates.game = useGameStore.getState();
  initialStates.character = useCharacterStore.getState();
  initialStates.inventory = useInventoryStore.getState();
  initialStates.world = useWorldStore.getState();
  initialStates.time = useTimeStore.getState();
  initialStates.weather = useWeatherStore.getState();
  initialStates.survival = useSurvivalStore.getState();
  initialStates.events = useEventStore.getState();
  initialStates.notifications = useNotificationStore.getState();
  initialStates.narrative = useNarrativeStore.getState();
  initialStates.combat = useCombatStore.getState();
  initialStates.crafting = useCraftingStore.getState();
  initialStates.shelter = useShelterStore.getState();
  initialStates.river = useRiverCrossingStore.getState();
  initialStates.save = useSaveStore.getState();
  initialStates.settings = useSettingsStore.getState();
  initialStates.ui = useUIStore.getState();
  
  return {
    verifyNoStateLeakage: () => {
      resetAllStores();
      
      // Verify all stores are back to initial state
      const currentStates = {
        game: useGameStore.getState(),
        character: useCharacterStore.getState(),
        inventory: useInventoryStore.getState(),
        world: useWorldStore.getState(),
        time: useTimeStore.getState(),
        weather: useWeatherStore.getState(),
        survival: useSurvivalStore.getState(),
        events: useEventStore.getState(),
        notifications: useNotificationStore.getState(),
        narrative: useNarrativeStore.getState(),
        combat: useCombatStore.getState(),
        crafting: useCraftingStore.getState(),
        shelter: useShelterStore.getState(),
        river: useRiverCrossingStore.getState(),
        save: useSaveStore.getState(),
        settings: useSettingsStore.getState(),
        ui: useUIStore.getState(),
      };
      
      // Compare states (excluding functions)
      Object.keys(initialStates).forEach(storeName => {
        const initial = JSON.stringify(initialStates[storeName], (key, value) => 
          typeof value === 'function' ? '[Function]' : value
        );
        const current = JSON.stringify(currentStates[storeName as keyof typeof currentStates], (key, value) => 
          typeof value === 'function' ? '[Function]' : value
        );
        
        if (initial !== current) {
          console.warn(`Store ${storeName} has state leakage`);
        }
      });
    }
  };
};