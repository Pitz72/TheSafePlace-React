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
  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (slotIndex: number, quantity?: number) => boolean;
  equipItemFromInventory: (slotIndex: number) => void;
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
    if (!item) return false;

    const characterStore = useCharacterStore.getState();
    const { characterSheet } = characterStore;
    const newInventory = [...characterSheet.inventory];
    let added = false;

    if (item.stackable) {
      const slot = newInventory.find((s) => s?.itemId === itemId);
      if (slot) {
        slot.quantity += quantity;
        added = true;
      }
    }

    if (!added) {
      const emptyIdx = newInventory.findIndex((s) => !s);
      if (emptyIdx !== -1) {
        newInventory[emptyIdx] = {
          itemId,
          quantity,
          portions: item.portionsPerUnit,
        };
        added = true;
      }
    }

    if (added) {
      characterStore.updateCharacterSheet({
        ...characterSheet,
        inventory: newInventory,
      });
      useNotificationStore
        .getState()
        .addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity });
      return true;
    }

    useNotificationStore
      .getState()
      .addLogEntry(MessageType.INVENTORY_FULL, { item: item.name });
    return false;
  },

  removeItem: (slotIndex, quantity = 1) => {
    const characterStore = useCharacterStore.getState();
    const { characterSheet } = characterStore;
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return false;

    const newInventory = [...characterSheet.inventory];
    const currentSlot = newInventory[slotIndex]!;

    if (currentSlot.quantity <= quantity) {
      newInventory[slotIndex] = null;
    } else {
      currentSlot.quantity -= quantity;
    }

    characterStore.updateCharacterSheet({
      ...characterSheet,
      inventory: newInventory,
    });
    return true;
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
