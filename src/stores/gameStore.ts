import { create } from 'zustand';
import { useCharacterStore } from './character/characterStore';
import { useTimeStore } from './time/timeStore';
import { useItemStore } from './item/itemStore';
import { useWorldStore } from './world/worldStore';
import { useShelterStore } from './shelter/shelterStore';
import { useWeatherStore } from './weather/weatherStore';
import { useEventStore } from './events/eventStore';
import { useSurvivalStore } from './survival/survivalStore';
import { useNotificationStore } from './notifications/notificationStore';
import { useNarrativeStore } from './narrative/narrativeStore';
import type { ICharacterSheet } from '../rules/types';
import type { IItem } from '../interfaces/items';
import { handleStoreError, GameErrorCategory, executeWithRetry } from '@/services/errorService';
import { MessageType } from '@/data/MessageArchive';
import { equipItem } from '@/utils/equipmentManager';
import { attemptStatusHealing } from '@/services/healingService';

// --- INTERFACES ---

export type BootPhase = 'black-screen-1' | 'production' | 'black-screen-2' | 'boot-simulation' | 'black-screen-3' | 'menu';

export interface CoreGameState {
  currentScreen: string;
  previousScreen: string | null;
  menuSelectedIndex: number;
  selectedInventoryIndex: number;
  gameInProgress: boolean;
  isPaused: boolean;
  bootPhase: BootPhase;
  isBootSequenceActive: boolean;
  unlockRecipesCallback?: (manualId: string) => void;
  characterSheet: ICharacterSheet;
  items: Record<string, IItem>;

  // Actions
  initializeGame: () => Promise<void>;
  startBootSequence: () => void;
  advanceBootPhase: () => void;
  skipBootSequence: () => void;
  setCurrentScreen: (screen: string) => void;
  goBack: () => void;
  setMenuSelectedIndex: (index: number) => void;
  setSelectedInventoryIndex: (index: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  startNewGame: () => void;
  enterGame: () => void;
  handleNewGame: () => void;
  handleLoadGame: () => void;
  handleStory: () => void;
  handleInstructions: () => void;
  handleOptions: () => void;
  handleBackToMenu: () => void;
  handleExit: () => void;
  addItem: (itemId: string, quantity?: number) => { success: boolean; message: string };
  removeItems: (itemId: string, quantity: number) => boolean;
  equipItem: (slotIndex: number) => void;
  useItem: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;
  removeItemBySlot: (slotIndex: number, quantity?: number) => { success: boolean; message: string };
  addExperience: (xpGained: number) => void;
  takeDamage: (amount: number) => void;
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  resetStore: () => void;
}

// --- STORE IMPLEMENTATION ---

export const useGameStore = create<CoreGameState>((set, get) => ({
  // --- INITIAL STATE ---
  currentScreen: 'boot-black-screen-1',
  previousScreen: null,
  menuSelectedIndex: 0,
  selectedInventoryIndex: 0,
  gameInProgress: false,
  isPaused: false,
  bootPhase: 'black-screen-1',
  isBootSequenceActive: true,
  unlockRecipesCallback: undefined,

  // --- PROXY GETTERS ---
  get characterSheet() { return useCharacterStore.getState().characterSheet; },
  get items() { return useItemStore.getState().items; },

  // --- ACTIONS ---

  // Boot sequence actions
  startBootSequence: () => {
    set({ isBootSequenceActive: true, bootPhase: 'black-screen-1', currentScreen: 'boot-black-screen-1' });
  },
  advanceBootPhase: () => {
    set(state => {
      const phaseOrder: BootPhase[] = ['black-screen-1', 'production', 'black-screen-2', 'boot-simulation', 'black-screen-3'];
      const currentIndex = phaseOrder.indexOf(state.bootPhase);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= phaseOrder.length) {
        return { isBootSequenceActive: false, bootPhase: 'menu', currentScreen: 'menu' };
      }
      const nextPhase = phaseOrder[nextIndex];
      return { bootPhase: nextPhase, currentScreen: `boot-${nextPhase}` };
    });
  },
  skipBootSequence: () => {
    set({ isBootSequenceActive: false, bootPhase: 'menu', currentScreen: 'menu' });
  },

  // Screen Navigation
  setCurrentScreen: (screen: string) => set(state => ({ previousScreen: state.currentScreen, currentScreen: screen })),
  goBack: () => set(state => ({ currentScreen: state.previousScreen || 'menu', previousScreen: null })),
  setMenuSelectedIndex: (index: number) => set({ menuSelectedIndex: index }),
  setSelectedInventoryIndex: (index: number) => set({ selectedInventoryIndex: index }),

  // Game State Management
  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false, currentScreen: 'game' }),
  startNewGame: () => set({ gameInProgress: true, isPaused: false, currentScreen: 'characterCreation' }),
  enterGame: () => set({ currentScreen: 'game' }),

  // Menu Actions
  handleNewGame: () => get().startNewGame(),
  handleLoadGame: () => get().setCurrentScreen('load'),
  handleStory: () => get().setCurrentScreen('story'),
  handleInstructions: () => get().setCurrentScreen('instructions'),
  handleOptions: () => get().setCurrentScreen('options'),
  handleBackToMenu: () => get().setCurrentScreen('menu'),
  handleExit: () => { if (window.confirm('Sei sicuro di voler uscire?')) { window.close(); } },

  // Inventory & Character Actions
  addItem: (itemId, quantity = 1) => {
    try {
      const item = useItemStore.getState().getItemById(itemId);
      if (!item) throw new Error(`Item ${itemId} non trovato`);
      const success = useCharacterStore.getState().addItemToInventory(itemId, quantity);
      if (success) {
        useNotificationStore.getState().addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity });
        return { success: true, message: `${item.name} aggiunto.` };
      }
      return { success: false, message: 'Inventario pieno' };
    } catch (error) {
      const gameError = handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'addItem', itemId, quantity });
      return { success: false, message: `Errore: ${gameError.message}` };
    }
  },
  removeItems: (itemId, quantity) => {
    try {
      const characterStore = useCharacterStore.getState();
      const inventory = characterStore.characterSheet.inventory;
      let remainingToRemove = quantity;
      const slotsToUpdate = [];
      for (let i = 0; i < inventory.length; i++) {
        const slot = inventory[i];
        if (slot && slot.itemId === itemId && remainingToRemove > 0) {
          const toRemove = Math.min(slot.quantity, remainingToRemove);
          slotsToUpdate.push({ index: i, quantity: toRemove });
          remainingToRemove -= toRemove;
        }
      }
      if (remainingToRemove > 0) throw new Error(`Non abbastanza ${itemId} disponibili`);
      for (const update of slotsToUpdate) {
        characterStore.removeItemFromInventory(update.index, update.quantity);
      }
      return true;
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'removeItems', itemId, quantity });
      return false;
    }
  },
  equipItem: (slotIndex) => {
    try {
      const characterStore = useCharacterStore.getState();
      const itemDB = useItemStore.getState().items;
      const result = equipItem(characterStore.characterSheet, itemDB, slotIndex);
      if (result.success) {
        characterStore.updateCharacterSheet(result.updatedCharacterSheet);
        useNotificationStore.getState().addLogEntry(MessageType.ACTION_SUCCESS, { action: result.message });
      } else {
        useNotificationStore.getState().addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
      }
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'equipItem', slotIndex });
    }
  },
  useItem: (slotIndex) => {
    try {
      const characterStore = useCharacterStore.getState();
      const slot = characterStore.characterSheet.inventory[slotIndex];
      if (!slot || !slot.itemId) throw new Error(`Slot ${slotIndex} vuoto`);
      const item = useItemStore.getState().getItemById(slot.itemId);
      if (!item) throw new Error(`Oggetto ${slot.itemId} non trovato`);
      if (item.type === 'consumable') {
        if (item.effect === 'heal' && attemptStatusHealing(item, slotIndex)) return;
        characterStore.removeItemFromInventory(slotIndex, 1);
        useNotificationStore.getState().addLogEntry(MessageType.ITEM_USED, { itemName: item.name });
      } else {
        throw new Error(`L'oggetto ${item.name} non è utilizzabile`);
      }
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'useItem', slotIndex });
    }
  },
  dropItem: (slotIndex) => {
    try {
      const characterStore = useCharacterStore.getState();
      const slot = characterStore.characterSheet.inventory[slotIndex];
      if (!slot || !slot.itemId) throw new Error(`Slot ${slotIndex} vuoto`);
      const item = useItemStore.getState().getItemById(slot.itemId);
      characterStore.removeItemFromInventory(slotIndex, slot.quantity);
      useNotificationStore.getState().addLogEntry(MessageType.INVENTORY_REMOVE, { itemName: item?.name || 'Sconosciuto' });
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'dropItem', slotIndex });
    }
  },
  removeItemBySlot: (slotIndex, quantity = 1) => {
    try {
      const characterStore = useCharacterStore.getState();
      const slot = characterStore.characterSheet.inventory[slotIndex];
      if (!slot || slot.quantity === 0) return { success: false, message: 'Slot vuoto' };
      const item = useItemStore.getState().getItemById(slot.itemId);
      if (!item) throw new Error(`Item ${slot.itemId} non trovato`);
      const actualQuantity = Math.min(quantity, slot.quantity);
      const success = characterStore.removeItemFromInventory(slotIndex, actualQuantity);
      if (success) {
        useNotificationStore.getState().addLogEntry(MessageType.ITEM_LOST, { item: item.name, quantity: actualQuantity });
        return { success: true, message: `${item.name} rimosso.` };
      }
      return { success: false, message: "Impossibile rimuovere l'item" };
    } catch (error) {
      const gameError = handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'removeItemBySlot', slotIndex, quantity });
      return { success: false, message: `Errore: ${gameError.message}` };
    }
  },

  // Delegated Actions
  addExperience: (xpGained) => useCharacterStore.getState().addExperience(xpGained),
  takeDamage: (amount) => useCharacterStore.getState().takeDamage(amount),
  setUnlockRecipesCallback: (callback) => set({ unlockRecipesCallback: callback }),

  // Utility Actions
  updateCameraPosition: (viewportSize) => {
    const { cameraPosition } = useWorldStore.getState();
    useWorldStore.getState().updateCameraPosition(viewportSize);
    set({ cameraPosition });
  },
  resetStore: () => set({
    currentScreen: 'boot-black-screen-1', previousScreen: null, menuSelectedIndex: 0,
    selectedInventoryIndex: 0, gameInProgress: false, isPaused: false,
    bootPhase: 'black-screen-1', isBootSequenceActive: true, unlockRecipesCallback: undefined,
  }),

  initializeGame: async () => {
    return executeWithRetry({
      operation: async () => {
        get().resetStore();
        useCharacterStore.getState().initialize();
        useSurvivalStore.getState().resetSurvivalState();
        useTimeStore.getState().resetTime();
        useWeatherStore.getState().resetWeather();
        await useWorldStore.getState().loadMap();
        useNarrativeStore.getState().initializeNarrative();
        useEventStore.getState().resetEvents();
        useShelterStore.getState().resetShelters();
        get().updateCameraPosition({ width: 1920, height: 1080 });
        useNotificationStore.getState().addLogEntry(MessageType.GAME_START, { message: 'Benvenuto in The Safe Place.' });
      },
      category: GameErrorCategory.GAME_LOGIC,
      context: { operation: 'initializeGame' }
    });
  },
}));