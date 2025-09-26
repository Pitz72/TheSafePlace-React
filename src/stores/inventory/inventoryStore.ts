import { create } from 'zustand';
import { useCharacterStore } from '../character/characterStore';
import { useNotificationStore } from '../notifications/notificationStore';
import { itemDatabase } from '../../data/items/itemDatabase';
import { equipItem } from '../../utils/equipmentManager';
import { MessageType } from '../../data/MessageArchive';
import type { IInventorySlot } from '../../interfaces/items';
import { CharacterStatus } from '../../rules/types';

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
  removeItems: (itemId: string, quantity: number) => boolean;
  equipItemFromInventory: (slotIndex: number) => void;
  setSelectedInventoryIndex: (index: number | null) => void;
  useItem: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;

  // Status Healing System
  attemptStatusHealing: (item: any, slotIndex: number) => boolean;
  calculateHealingSuccessRate: (item: any, status: CharacterStatus) => number;
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
        if (item.effect === 'heal' && get().attemptStatusHealing(item, slotIndex)) {
          return; // Status healing handled, item already consumed
        }

        // Default consumable behavior
        get().removeItem(slotIndex, 1);
        notificationStore.addLogEntry(MessageType.ITEM_USED, { itemName: item.name });
      }
    }
  },

  // Status healing system with probability
  attemptStatusHealing: (item: any, slotIndex: number) => {
    const characterStore = useCharacterStore.getState();
    const notificationStore = useNotificationStore.getState();
    const { characterSheet } = characterStore;

    // Check if character has healable status
    const healableStatuses = [CharacterStatus.WOUNDED, CharacterStatus.SICK, CharacterStatus.POISONED];
    const currentStatus = characterSheet.status.currentStatus;

    if (!healableStatuses.includes(currentStatus)) {
      notificationStore.addLogEntry(MessageType.ACTION_FAIL, {
        reason: `Non hai condizioni che possono essere curate con ${item.name}`
      });
      return false;
    }

    // Calculate success probability based on item and status
    const successRate = get().calculateHealingSuccessRate(item, currentStatus);

    if (Math.random() < successRate) {
      // Success - remove status
      characterStore.removeStatus(currentStatus);
      get().removeItem(slotIndex, 1);

      notificationStore.addLogEntry(MessageType.ACTION_SUCCESS, {
        action: `${item.name} ha curato con successo il tuo status "${getStatusDisplayName(currentStatus)}"`
      });

      // Apply healing if item has healing value
      if (item.effectValue > 0) {
        characterStore.updateHP(item.effectValue);
        notificationStore.addLogEntry(MessageType.HP_RECOVERY, {
          healing: item.effectValue,
          reason: item.name.toLowerCase()
        });
      }

      return true;
    } else {
      // Failure - consume item anyway
      get().removeItem(slotIndex, 1);
      notificationStore.addLogEntry(MessageType.ACTION_FAIL, {
        reason: `${item.name} non è riuscito a curare il tuo status "${getStatusDisplayName(currentStatus)}"`
      });
      return true;
    }
  },

  // Calculate healing success rate based on item quality and status severity
  calculateHealingSuccessRate: (item: any, status: CharacterStatus) => {
    let baseRate = 0.5; // 50% base success rate

    // Adjust based on item quality/rarity
    switch (item.rarity) {
      case 'Common': baseRate = 0.4; break;
      case 'Uncommon': baseRate = 0.6; break;
      case 'Rare': baseRate = 0.8; break;
      case 'Epic': baseRate = 0.9; break;
      case 'Legendary': baseRate = 0.95; break;
    }

    // Adjust based on item effectiveness
    if (item.effectValue >= 25) baseRate += 0.1;
    else if (item.effectValue >= 15) baseRate += 0.05;

    // Adjust based on status difficulty
    switch (status) {
      case CharacterStatus.WOUNDED: baseRate += 0.1; break; // Easier to heal
      case CharacterStatus.SICK: baseRate -= 0.1; break; // Harder to heal
      case CharacterStatus.POISONED: baseRate -= 0.15; break; // Hardest to heal
    }

    return Math.max(0.1, Math.min(0.95, baseRate)); // Clamp between 10% and 95%
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
