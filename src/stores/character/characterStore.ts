import { create } from 'zustand';
import type { ICharacterSheet, AbilityType, ICharacterStatus } from '@/rules/types';
import { CharacterStatus } from '@/rules/types';
import { createTestCharacter } from '@/rules/characterGenerator';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import {
  findEmptySlot,
  findStackableSlot,
  addItemToStack,
  addNewItem,
  removeItemFromSlot,
  InventorySlot,
} from '@/utils/inventoryUtils';
import { performAbilityCheck } from '@/utils/abilityUtils';
import { takeDamage, healDamage } from '@/utils/healthUtils';
import { gainExperience, gainMovementXP } from '@/utils/experienceUtils';
import { itemDatabase } from '@/data/items/itemDatabase';
import { MessageType, JOURNAL_STATE } from '@/data/MessageArchive';

export interface CharacterState {
  characterSheet: ICharacterSheet;
  isDead: boolean;
  isComatose: boolean;
  status: ICharacterStatus;
}

export interface CharacterActions {
  initialize: () => void;
  updateCharacterSheet: (sheet: ICharacterSheet) => void;
  // --- ABILITY & SKILL CHECKS ---
  performAbilityCheck: (ability: AbilityType, difficulty: number) => { roll: number; success: boolean };
  getModifier: (ability: AbilityType) => number;
  // --- INVENTORY MANAGEMENT ---
  addItemToInventory: (itemId: string, quantity: number) => boolean;
  removeItemFromInventory: (slotIndex: number, quantity: number) => boolean;
  // --- STATUS MANAGEMENT ---
  addStatus: (status: CharacterStatus, duration: number) => void;
  removeStatus: (status: CharacterStatus) => void;
  hasStatus: (status: CharacterStatus) => boolean;
  // --- HEALTH & DAMAGE ---
  takeDamage: (amount: number) => void;
  healDamage: (amount: number) => void;
  // --- EXPERIENCE & PROGRESSION ---
  gainExperience: (amount: number) => void;
  gainMovementXP: () => void;
  // --- UTILITY ---
  handleConsequence: (consequence: any) => void; // TODO: Define consequence type
}

export type CharacterStore = CharacterState & CharacterActions;

const initialState: CharacterState = {
  characterSheet: createTestCharacter(),
  isDead: false,
  isComatose: false,
  status: { effects: [] }, // Initialize with an empty effects array
};

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  ...initialState,

  initialize: () => set(initialState),

  updateCharacterSheet: (sheet) => {
    set({ characterSheet: sheet });
  },

  // --- ABILITY & SKILL CHECKS ---
  performAbilityCheck: (ability, difficulty) => {
    const { characterSheet, updateCharacterSheet } = get();
    const { success, roll } = performAbilityCheck(characterSheet.stats, ability, difficulty);
    updateCharacterSheet(gainExperience(characterSheet, success ? 5 : 1));
    return { success, roll };
  },

  getModifier: (ability) => {
    const { characterSheet } = get();
    return Math.floor((characterSheet.stats[ability] - 10) / 2);
  },

  // --- EXPERIENCE & PROGRESSION ---
  gainExperience: (amount) => {
    const { characterSheet, updateCharacterSheet } = get();
    const updatedSheet = gainExperience(characterSheet, amount);
    updateCharacterSheet(updatedSheet);
  },

  gainMovementXP: () => {
    const { characterSheet, updateCharacterSheet } = get();
    const updatedSheet = gainMovementXP(characterSheet);
    updateCharacterSheet(updatedSheet);
  },

  // --- INVENTORY MANAGEMENT ---
  addItemToInventory: (itemId, quantity) => {
    const { characterSheet, updateCharacterSheet } = get();
    const item = itemDatabase[itemId];
    if (!item) return false;

    let newInventory: InventorySlot[] = [...characterSheet.inventory];
    let added = false;

    if (item.stackable) {
      const stackableSlotIndex = findStackableSlot(newInventory, itemId);
      if (stackableSlotIndex !== -1) {
        newInventory = addItemToStack(newInventory, stackableSlotIndex, quantity);
        added = true;
      }
    }

    if (!added) {
      const emptySlotIndex = findEmptySlot(newInventory);
      if (emptySlotIndex !== -1) {
        newInventory = addNewItem(newInventory, emptySlotIndex, itemId, quantity);
        added = true;
      }
    }

    if (added) {
      updateCharacterSheet({ ...characterSheet, inventory: newInventory as (typeof characterSheet.inventory) });
      return true;
    }

    return false; // Inventory is full
  },

  removeItemFromInventory: (slotIndex, quantity) => {
    const { characterSheet, updateCharacterSheet } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot || slot.quantity < quantity) return false;

    const newInventory = removeItemFromSlot(characterSheet.inventory, slotIndex, quantity);
    updateCharacterSheet({ ...characterSheet, inventory: newInventory as (typeof characterSheet.inventory) });
    return true;
  },

  // --- STATUS MANAGEMENT ---
  applyStatus: (status, duration = 0) => {
    const { characterSheet } = get();
    const newStatusEffects = [...characterSheet.status.statusEffects];

    if (!newStatusEffects.includes(status)) {
      newStatusEffects.push(status);
    }

    const newStatusDuration = { ...characterSheet.status.statusDuration };
    if (duration > 0) {
      newStatusDuration[status] = duration;
    }

    const updatedStatus: ICharacterStatus = {
      ...characterSheet.status,
      currentStatus: status,
      statusEffects: newStatusEffects,
      statusDuration: newStatusDuration
    };

    get().updateCharacterSheet({
      ...characterSheet,
      status: updatedStatus
    });

    // Log status application
    const notificationStore = useNotificationStore.getState();
    notificationStore.addLogEntry(MessageType.STATUS_CHANGE, {
      status: status,
      action: 'applicato'
    });
  },

  removeStatus: (status) => {
    const { characterSheet } = get();
    const newStatusEffects = characterSheet.status.statusEffects.filter(s => s !== status);
    const newStatusDuration = { ...characterSheet.status.statusDuration };
    delete newStatusDuration[status];

    const currentStatus = newStatusEffects.length > 0 ? newStatusEffects[0] : CharacterStatus.NORMAL;

    const updatedStatus: ICharacterStatus = {
      ...characterSheet.status,
      currentStatus,
      statusEffects: newStatusEffects,
      statusDuration: newStatusDuration
    };

    get().updateCharacterSheet({
      ...characterSheet,
      status: updatedStatus
    });

    // Log status removal
    const notificationStore = useNotificationStore.getState();
    notificationStore.addLogEntry(MessageType.STATUS_CHANGE, {
      status: status,
      action: 'rimosso'
    });
  },

  hasStatus: (status) => {
    return get().characterSheet.status.statusEffects.includes(status);
  },

  getStatusDescription: (status) => {
    const descriptions = {
      [CharacterStatus.NORMAL]: 'Normale',
      [CharacterStatus.SICK]: 'Malato - Debole e vulnerabile',
      [CharacterStatus.WOUNDED]: 'Ferito - Ridotta efficienza',
      [CharacterStatus.POISONED]: 'Avvelenato - Danni nel tempo',
      [CharacterStatus.STARVING]: 'Affamato - Forza ridotta',
      [CharacterStatus.DEHYDRATED]: 'Disidratato - Stanchezza aumentata',
      [CharacterStatus.DEAD]: 'Morto'
    };
    return descriptions[status] || 'Sconosciuto';
  },

  resetCharacter: () => {
    set({
      characterSheet: createTestCharacter(),
      lastShortRestTime: null,
    });
  },
}));
