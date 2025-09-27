import { create } from 'zustand';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { itemDatabase } from '@/data/items/itemDatabase';
import { equipItem } from '@/utils/equipmentManager';
import { MessageType } from '@/data/MessageArchive';
import type { IInventorySlot, IItem } from '@/interfaces/items';
import { CharacterStatus } from '@/rules/types';
import { attemptStatusHealing } from '@/services/healingService';

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
    const item = itemDatabase[itemId];
    if (!item) return { success: false, message: "Item not found in database." };

    const characterStore = useCharacterStore.getState();
    const success = characterStore.addItemToInventory(itemId, quantity);

    if (success) {
      useNotificationStore
        .getState()
        .addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity });
      return { success: true, message: `Added ${quantity} ${item.name}.`};
    } else {
      useNotificationStore
        .getState()
        .addLogEntry(MessageType.INVENTORY_FULL, { item: item.name });
      return { success: false, message: "Inventory is full."};
    }
  },

  removeItem: (slotIndex: number, quantity: number = 1) => {
    const characterStore = useCharacterStore.getState();
    const inventory = characterStore.characterSheet.inventory;
    const slot = inventory[slotIndex];
    if (!slot) return { success: false, message: "Slot is empty." };

    const itemName = itemDatabase[slot.itemId]?.name || 'Unknown Item';
    const success = characterStore.removeItemFromInventory(slotIndex, quantity);

    if (success) {
      useNotificationStore
        .getState()
        .addLogEntry(MessageType.INVENTORY_REMOVE, { item: itemName, quantity });
      return { success: true, message: `${quantity} ${itemName} removed.` };
    } else {
      return { success: false, message: `Could not remove ${itemName}.` };
    }
  },

  removeItems: (itemId: string, quantity: number) => {
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
      return false; // Non abbastanza item disponibili
    }
    
    // Rimuovi gli item dagli slot
    for (const update of slotsToUpdate) {
      characterStore.removeItemFromInventory(update.index, update.quantity);
    }
    
    return true;
  },

  equipItemFromInventory: (slotIndex: number) => {
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
  },

  setSelectedInventoryIndex: (index: number | null) => {
    set({ selectedInventoryIndex: index });
  },

  useItem: (slotIndex: number) => {
    const characterStore = useCharacterStore.getState();
    const notificationStore = useNotificationStore.getState();
    const inventory = characterStore.characterSheet.inventory;
    const slot = inventory[slotIndex];

    if (slot && slot.itemId) {
      const item = itemDatabase[slot.itemId];
      if (item && item.type === 'consumable') {
        // Handle healing effects for status conditions
        if (item.effect === 'heal' && attemptStatusHealing(item, slotIndex)) {
          return; // Status healing handled, item already consumed
        }

        // Default consumable behavior
        get().removeItem(slotIndex, 1);
        notificationStore.addLogEntry(MessageType.ITEM_USED, { itemName: item.name });
      }
    }
  },

  dropItem: (slotIndex: number) => {
    const notificationStore = useNotificationStore.getState();
    const characterStore = useCharacterStore.getState();
    const inventory = characterStore.characterSheet.inventory;
    const slot = inventory[slotIndex];
    
    if (slot && slot.itemId) {
      const item = itemDatabase[slot.itemId];
      get().removeItem(slotIndex, slot.quantity);
      notificationStore.addLogEntry(MessageType.INVENTORY_REMOVE, { itemName: item?.name || 'Unknown' });
    }
  },
}));
