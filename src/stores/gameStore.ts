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
import { handleStoreError, GameErrorCategory } from '@/services/errorService';
import { MessageType } from '@/data/MessageArchive';
import { equipItem } from '@/utils/equipmentManager';
import { attemptStatusHealing } from '@/services/healingService';


// --- INTERFACES ---

export type BootPhase = 'black-screen-1' | 'production' | 'black-screen-2' | 'boot-simulation' | 'black-screen-3' | 'menu';

export interface CoreGameState {
  // Core UI State
  currentScreen: string;
  previousScreen: string | null;
  menuSelectedIndex: number;
  selectedInventoryIndex: number;

  // Game State
  gameInProgress: boolean;
  isPaused: boolean;

  // Boot sequence state
  bootPhase: BootPhase;
  isBootSequenceActive: boolean;

  // Callback per ricette
  unlockRecipesCallback?: (manualId: string) => void;

  // Proxy Getters (READ-ONLY)
  characterSheet: ICharacterSheet;
  items: Record<string, IItem>;

  // Core Actions
  initializeGame: () => Promise<void>;

  // Boot sequence actions
  startBootSequence: () => void;
  advanceBootPhase: () => void;
  skipBootSequence: () => void;

  // Screen Navigation
  setCurrentScreen: (screen: string) => void;
  goBack: () => void;
  setMenuSelectedIndex: (index: number) => void;
  setSelectedInventoryIndex: (index: number) => void;

  // Game State Management
  pauseGame: () => void;
  resumeGame: () => void;
  startNewGame: () => void;
  enterGame: () => void;

  // Menu Actions
  handleNewGame: () => void;
  handleLoadGame: () => void;

  // Character and Item Actions (Logica centralizzata)
  addItem: (itemId: string, quantity?: number) => { success: boolean; message: string };
  removeItems: (itemId: string, quantity: number) => boolean;
  equipItem: (slotIndex: number) => void;
  useItem: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;
  removeItemBySlot: (slotIndex: number, quantity?: number) => { success: boolean; message: string };

  // Delegated Actions
  addExperience: (xpGained: number) => void;
  takeDamage: (amount: number) => void;
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => void;
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
  get characterSheet() {
    return useCharacterStore.getState().characterSheet;
  },
  get items() {
    return useItemStore.getState().items;
  },

  // --- AZIONI CENTRALIZZATE DI GESTIONE INVENTARIO ---

  addItem: (itemId: string, quantity: number = 1) => {
    try {
      const item = useItemStore.getState().getItemById(itemId);
      if (!item) {
        throw new Error(`Item ${itemId} non trovato nel database`);
      }

      const characterStore = useCharacterStore.getState();
      const success = characterStore.addItemToInventory(itemId, quantity);

      if (success) {
        useNotificationStore.getState().addLogEntry(MessageType.ITEM_FOUND, {
          item: item.name,
          quantity
        });
        return { success: true, message: `${item.name} aggiunto all'inventario` };
      } else {
        return { success: false, message: 'Inventario pieno' };
      }
    } catch (error) {
      const gameError = handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'addItem', itemId, quantity
      });
      return { success: false, message: `Errore: ${gameError.message}` };
    }
  },

  removeItems: (itemId: string, quantity: number) => {
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

      if (remainingToRemove > 0) {
        throw new Error(`Non abbastanza ${itemId} disponibili (richiesti: ${quantity}, disponibili: ${quantity - remainingToRemove})`);
      }

      for (const update of slotsToUpdate) {
        characterStore.removeItemFromInventory(update.index, update.quantity);
      }

      return true;
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'removeItems', itemId, quantity
      });
      return false;
    }
  },

  equipItem: (slotIndex: number) => {
    try {
      const characterStore = useCharacterStore.getState();
      const { characterSheet } = characterStore;
      const itemDB = useItemStore.getState().items;

      const result = equipItem(characterSheet, itemDB, slotIndex);

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

  useItem: (slotIndex: number) => {
    try {
      const characterStore = useCharacterStore.getState();
      const inventory = characterStore.characterSheet.inventory;
      const slot = inventory[slotIndex];

      if (!slot || !slot.itemId) throw new Error(`Slot ${slotIndex} vuoto`);

      const item = useItemStore.getState().getItemById(slot.itemId);
      if (!item) throw new Error(`Oggetto ${slot.itemId} non trovato`);

      if (item.type === 'consumable') {
        if (item.effect === 'heal' && attemptStatusHealing(item, slotIndex)) {
          return;
        }
        characterStore.removeItemFromInventory(slotIndex, 1);
        useNotificationStore.getState().addLogEntry(MessageType.ITEM_USED, { itemName: item.name });
      } else {
        throw new Error(`L'oggetto ${item.name} non è utilizzabile`);
      }
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'useItem', slotIndex });
    }
  },

  dropItem: (slotIndex: number) => {
    try {
      const characterStore = useCharacterStore.getState();
      const inventory = characterStore.characterSheet.inventory;
      const slot = inventory[slotIndex];

      if (!slot || !slot.itemId) throw new Error(`Slot ${slotIndex} vuoto`);

      const item = useItemStore.getState().getItemById(slot.itemId);
      characterStore.removeItemFromInventory(slotIndex, slot.quantity);
      useNotificationStore.getState().addLogEntry(MessageType.INVENTORY_REMOVE, { itemName: item?.name || 'Sconosciuto' });
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, { operation: 'dropItem', slotIndex });
    }
  },

  removeItemBySlot: (slotIndex: number, quantity: number = 1) => {
    try {
      const characterStore = useCharacterStore.getState();
      const inventory = characterStore.characterSheet.inventory;

      if (slotIndex < 0 || slotIndex >= inventory.length) {
        throw new Error(`Indice slot non valido: ${slotIndex}`);
      }

      const slot = inventory[slotIndex];
      if (!slot || slot.quantity === 0) {
        return { success: false, message: 'Slot vuoto' };
      }

      const item = useItemStore.getState().getItemById(slot.itemId);
      if (!item) {
        throw new Error(`Item ${slot.itemId} non trovato nel database`);
      }

      const actualQuantity = Math.min(quantity, slot.quantity);
      const success = characterStore.removeItemFromInventory(slotIndex, actualQuantity);

      if (success) {
        useNotificationStore.getState().addLogEntry(MessageType.ITEM_LOST, {
          item: item.name,
          quantity: actualQuantity
        });
        return { success: true, message: `${item.name} rimosso dall'inventario` };
      } else {
        return { success: false, message: "Impossibile rimuovere l'item" };
      }
    } catch (error) {
      const gameError = handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'removeItemBySlot',
        slotIndex,
        quantity
      });
      return { success: false, message: `Errore: ${gameError.message}` };
    }
  },

  // --- AZIONI DELEGATE ---
  addExperience: (xpGained: number) => {
    useCharacterStore.getState().addExperience(xpGained);
  },

  takeDamage: (amount: number) => {
    useCharacterStore.getState().takeDamage(amount);
  },

  setUnlockRecipesCallback: (callback: (manualId: string) => void) => {
    set({ unlockRecipesCallback: callback });
  },

  // Funzioni non implementate per brevità
  startBootSequence: () => {},
  advanceBootPhase: () => {},
  skipBootSequence: () => {},
  setCurrentScreen: (screen: string) => set({ currentScreen: screen }),
  goBack: () => {},
  setMenuSelectedIndex: (index: number) => set({ menuSelectedIndex: index }),
  setSelectedInventoryIndex: (index: number) => set({ selectedInventoryIndex: index }),
  pauseGame: () => {},
  resumeGame: () => {},
  startNewGame: () => {},
  enterGame: () => {},
  handleNewGame: () => {},
  handleLoadGame: () => {},
  initializeGame: async () => {},

}));