import { create } from 'zustand';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { itemDatabase } from '@/data/items/itemDatabase';
import { equipItem } from '@/utils/equipmentManager';
import { MessageType } from '@/data/MessageArchive';
import type { IInventorySlot, IItem } from '@/interfaces/items';
import { CharacterStatus } from '@/rules/types';
import { attemptStatusHealing } from '@/services/healingService';
import { handleStoreError, GameErrorCategory } from '@/services/errorService';

// Helper function to get display name for status
const getStatusDisplayName = (status: CharacterStatus): string => {
  switch (status) {
    case CharacterStatus.NORMAL: return 'Normale';
    case CharacterStatus.WOUNDED: return 'Ferito';
    case CharacterStatus.SICK: return 'Malato';
    case CharacterStatus.POISONED: return 'Avvelenato';
    case CharacterStatus.STARVING: return 'Affamato';
    case CharacterStatus.DEHYDRATED: return 'Disidratato';
    case CharacterStatus.DEAD: return 'Morto';
    default: return 'Sconosciuto';
  }
};

interface InventoryState {
  selectedInventoryIndex: number | null;
  items: Record<string, IItem>;
}

interface InventoryActions {
  getInventory: () => (IInventorySlot | null)[];
  getEquippedWeaponId: () => string | null;
  getEquippedArmorId: () => string | null;
  addItem: (itemId: string, quantity?: number) => { success: boolean; message: string };
  removeItem: (slotIndex: number, quantity?: number) => { success: boolean; message: string };
  removeItems: (itemId: string, quantity: number) => boolean;
  equipItemFromInventory: (slotIndex: number) => void;
  setSelectedInventoryIndex: (index: number | null) => void;
  useItem: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;
}

export type InventoryStore = InventoryState & InventoryActions;

const initialState: InventoryState = {
  selectedInventoryIndex: null,
  items: itemDatabase,
};

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  ...initialState,

  getInventory: () => {
    return useCharacterStore.getState().characterSheet.inventory;
  },
  getEquippedWeaponId: () => {
    return useCharacterStore.getState().characterSheet.equipment.weapon.itemId;
  },
  getEquippedArmorId: () => {
    return useCharacterStore.getState().characterSheet.equipment.armor.itemId;
  },

  addItem: (itemId: string, quantity: number = 1) => {
    try {
      const item = itemDatabase[itemId];
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
        operation: 'addItem',
        itemId,
        quantity
      });
      return { success: false, message: `Errore: ${gameError.message}` };
    }
  },

  removeItem: (slotIndex: number, quantity: number = 1) => {
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

      const item = itemDatabase[slot.itemId];
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
        return { success: false, message: 'Impossibile rimuovere l\'item' };
      }
    } catch (error) {
      const gameError = handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'removeItem',
        slotIndex,
        quantity
      });
      return { success: false, message: `Errore: ${gameError.message}` };
    }
  },

  removeItems: (itemId: string, quantity: number) => {
    try {
      const characterStore = useCharacterStore.getState();
      const inventory = characterStore.characterSheet.inventory;
      
      // Trova tutti gli slot con l'itemId specificato
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
      
      // Rimuovi gli item dagli slot
      for (const update of slotsToUpdate) {
        characterStore.removeItemFromInventory(update.index, update.quantity);
      }
      
      return true;
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'removeItems',
        itemId,
        quantity
      });
      return false;
    }
  },

  equipItemFromInventory: (slotIndex: number) => {
    try {
      const characterStore = useCharacterStore.getState();
      const { characterSheet } = characterStore;
      const notificationStore = useNotificationStore.getState();

      const result = equipItem(characterSheet, itemDatabase, slotIndex);

      if (result.success) {
        characterStore.updateCharacterSheet(result.updatedCharacterSheet);
        notificationStore.addLogEntry(MessageType.ACTION_SUCCESS, { action: result.message });
      } else {
        notificationStore.addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
      }
      return result;
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'equipItemFromInventory',
        slotIndex
      });
      const notificationStore = useNotificationStore.getState();
      notificationStore.addLogEntry(MessageType.ACTION_FAIL, { reason: 'Errore durante l\'equipaggiamento' });
      return { success: false, message: 'Errore durante l\'equipaggiamento' };
    }
  },

  setSelectedInventoryIndex: (index: number | null) => {
    set({ selectedInventoryIndex: index });
  },

  useItem: (slotIndex: number) => {
    try {
      const characterStore = useCharacterStore.getState();
      const notificationStore = useNotificationStore.getState();
      const inventory = characterStore.characterSheet.inventory;
      const slot = inventory[slotIndex];

      if (!slot || !slot.itemId) {
        throw new Error(`Slot ${slotIndex} vuoto o non valido`);
      }

      const item = itemDatabase[slot.itemId];
      if (!item) {
        throw new Error(`Oggetto ${slot.itemId} non trovato nel database`);
      }

      if (item.type === 'consumable') {
        // Handle healing effects for status conditions
        if (item.effect === 'heal' && attemptStatusHealing(item, slotIndex)) {
          return; // Status healing handled, item already consumed
        }

        // Default consumable behavior
        get().removeItem(slotIndex, 1);
        notificationStore.addLogEntry(MessageType.ITEM_USED, { itemName: item.name });
      } else {
        throw new Error(`L'oggetto ${item.name} non è utilizzabile`);
      }
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'useItem',
        slotIndex
      });
      console.log(`Impossibile utilizzare l'oggetto nello slot ${slotIndex}`);
    }
  },

  dropItem: (slotIndex: number) => {
    try {
      const notificationStore = useNotificationStore.getState();
      const characterStore = useCharacterStore.getState();
      const inventory = characterStore.characterSheet.inventory;
      const slot = inventory[slotIndex];
      
      if (!slot || !slot.itemId) {
        throw new Error(`Slot ${slotIndex} vuoto`);
      }

      const item = itemDatabase[slot.itemId];
      get().removeItem(slotIndex, slot.quantity);
      notificationStore.addLogEntry(MessageType.INVENTORY_REMOVE, { itemName: item?.name || 'Sconosciuto' });
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'dropItem',
        slotIndex
      });
      console.log(`Impossibile rilasciare l'oggetto nello slot ${slotIndex}`);
    }
  },
}));
