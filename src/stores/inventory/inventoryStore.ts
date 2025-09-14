import { create } from 'zustand';
import { useCharacterStore } from '../character/characterStore';
import { useNotificationStore } from '../notifications/notificationStore';
import { itemDatabase } from '../../data/items/itemDatabase';
import { equipItem } from '../../utils/equipmentManager';
import { MessageType } from '../../data/MessageArchive';
import type { IInventorySlot } from '../../interfaces/items';

export interface InventoryState {
  // UI State
  selectedInventoryIndex: number | null;
  
  // Data
  items: Record<string, any>;
  
  // Selectors
  getInventory: () => (IInventorySlot | null)[];
  getEquippedWeaponId: () => string | null;
  getEquippedArmorId: () => string | null;

  // Actions
  addItem: (itemId: string, quantity?: number) => { success: boolean; message: string };
  removeItem: (slotIndex: number, quantity?: number) => { success: boolean; message: string };
  equipItemFromInventory: (slotIndex: number) => { success: boolean; message: string };
  setSelectedInventoryIndex: (index: number | null) => void;
  useItem: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // --- UI STATE ---
  selectedInventoryIndex: null,
  
  // --- DATA ---
  items: itemDatabase,
  
  // --- SELECTORS ---
  getInventory: () => {
    return useCharacterStore.getState().characterSheet.inventory;
  },
  getEquippedWeaponId: () => {
    return useCharacterStore.getState().characterSheet.equipment.weapon.itemId;
  },
  getEquippedArmorId: () => {
    return useCharacterStore.getState().characterSheet.equipment.armor.itemId;
  },

  // --- ACTIONS ---

  addItem: (itemId, quantity = 1) => {
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

  removeItem: (slotIndex, quantity = 1) => {
    const characterStore = useCharacterStore.getState();
    const inventory = characterStore.characterSheet.inventory;
    const slot = inventory[slotIndex];
    if (!slot) return { success: false, message: "Slot is empty." };

    const itemName = itemDatabase[slot.itemId]?.name || 'Unknown Item';
    const success = characterStore.removeItemFromInventory(slotIndex, quantity);

    if (success) {
      useNotificationStore
        .getState()
        .addLogEntry(MessageType.ITEM_DROPPED, { item: itemName, quantity });
      return { success: true, message: `${quantity} ${itemName} removed.` };
    } else {
      return { success: false, message: `Could not remove ${itemName}.` };
    }
  },

  equipItemFromInventory: (slotIndex) => {
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

  setSelectedInventoryIndex: (index) => {
    set({ selectedInventoryIndex: index });
  },

  useItem: (slotIndex) => {
    const characterStore = useCharacterStore.getState();
    const notificationStore = useNotificationStore.getState();
    const inventory = characterStore.characterSheet.inventory;
    const slot = inventory[slotIndex];
    
    if (slot && slot.itemId) {
      const item = itemDatabase[slot.itemId];
      if (item && item.consumable) {
        // Logic for using consumable items
        get().removeItem(slotIndex, 1);
        notificationStore.addLogEntry('ITEM_USED', { itemName: item.name });
      }
    }
  },

  dropItem: (slotIndex) => {
    const notificationStore = useNotificationStore.getState();
    const characterStore = useCharacterStore.getState();
    const inventory = characterStore.characterSheet.inventory;
    const slot = inventory[slotIndex];
    
    if (slot && slot.itemId) {
      const item = itemDatabase[slot.itemId];
      get().removeItem(slotIndex, slot.quantity);
      notificationStore.addLogEntry('ITEM_DROPPED', { itemName: item?.name || 'Unknown' });
    }
  },
}));
