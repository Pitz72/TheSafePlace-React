import { create } from 'zustand';
import { useCharacterStore } from '../character/characterStore';
import { useGameStore } from '../gameStore';
import { itemDatabase } from '../../data/items/itemDatabase';
import { equipItem } from '../../utils/equipmentManager';
import { MessageType } from '../../data/MessageArchive';
import type { IInventorySlot } from '../../interfaces/items';

export interface InventoryState {
  // Selectors
  getInventory: () => (IInventorySlot | null)[];
  getEquippedWeaponId: () => string | null;
  getEquippedArmorId: () => string | null;

  // Actions
  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (slotIndex: number, quantity?: number) => boolean;
  equipItemFromInventory: (slotIndex: number) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
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
      useGameStore
        .getState()
        .addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity });
      return true;
    }

    useGameStore
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
    const game = useGameStore.getState(); // To add log entries

    const result = equipItem(characterSheet, itemDatabase, slotIndex);

    if (result.success) {
      characterStore.updateCharacterSheet(result.updatedCharacterSheet);
      game.addLogEntry(MessageType.ACTION_SUCCESS, { action: result.message });
    } else {
      game.addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
    }
  },
}));
