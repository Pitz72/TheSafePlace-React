import { create } from 'zustand';
import type { ICharacterSheet, AbilityType, ICharacterStatus } from '../../rules/types';
import { CharacterStatus } from '../../rules/types';
import { createTestCharacter } from '../../rules/characterGenerator';
import { itemDatabase } from '../../data/items/itemDatabase';
import { MessageType, JOURNAL_STATE } from '../../data/MessageArchive';
import { useNotificationStore } from '../notifications/notificationStore';

export interface CharacterState {
  characterSheet: ICharacterSheet;
  lastShortRestTime: { day: number; time: number } | null;

  // Actions
  updateHP: (amount: number) => void;
  addExperience: (xpGained: number) => void;
  updateCharacterSheet: (newSheet: ICharacterSheet) => void;
  getModifier: (ability: AbilityType) => number;
  performAbilityCheck: (
    ability: AbilityType,
    difficulty: number
  ) => { success: boolean; roll: number; modifier: number; total: number };
  gainMovementXP: () => void;

  // Inventory Management
  addItemToInventory: (itemId: string, quantity: number) => boolean;
  removeItemFromInventory: (slotIndex: number, quantity: number) => boolean;

  // Status Management
  applyStatus: (status: CharacterStatus, duration?: number) => void;
  removeStatus: (status: CharacterStatus) => void;
  hasStatus: (status: CharacterStatus) => boolean;
  getStatusDescription: (status: CharacterStatus) => string;

  // Initialization
  resetCharacter: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  // --- INITIAL STATE ---
  characterSheet: createTestCharacter(),
  lastShortRestTime: null,

  // --- ACTIONS ---

  updateHP: (amount) => {
    const state = get();
    const newHP = Math.max(
      0,
      Math.min(
        state.characterSheet.maxHP,
        state.characterSheet.currentHP + amount
      )
    );
    
    set({
      characterSheet: {
        ...state.characterSheet,
        currentHP: newHP,
      },
    });
    
    // Log HP changes
    const notificationStore = useNotificationStore.getState();
    if (amount > 0) {
      notificationStore.addLogEntry(MessageType.HP_RECOVERY, {
        healing: amount,
        newHP,
        maxHP: state.characterSheet.maxHP
      });
    } else if (amount < 0) {
      notificationStore.addLogEntry(MessageType.HP_DAMAGE, {
        damage: Math.abs(amount),
        newHP,
        maxHP: state.characterSheet.maxHP
      });
    }
  },

  addExperience: (xpGained) => {
    const state = get();
    const newXP = state.characterSheet.experience.currentXP + xpGained;
    const canLevelUp = newXP >= state.characterSheet.experience.xpForNextLevel && state.characterSheet.level < 20;
    
    set({
      characterSheet: {
        ...state.characterSheet,
        experience: {
          ...state.characterSheet.experience,
          currentXP: newXP,
          canLevelUp,
        },
      },
    });
    
    // Log experience gain
    const notificationStore = useNotificationStore.getState();
    notificationStore.addLogEntry(MessageType.XP_GAIN, {
      xpGained,
      totalXP: newXP,
      canLevelUp
    });
  },

  updateCharacterSheet: (newSheet) => set({ characterSheet: newSheet }),

  getModifier: (ability) =>
    Math.floor((get().characterSheet.stats[ability] - 10) / 2),

  performAbilityCheck: (ability, difficulty) => {
    // This is the "pure" version of the check.
    // The gameStore will handle weather effects and logging.
    const modifier = get().getModifier(ability);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    const success = total >= difficulty;

    // Award XP for any check
    get().addExperience(success ? 5 : 1);

    return { success, roll, modifier, total };
  },

  gainMovementXP: () => {
    const xpGained = Math.floor(Math.random() * 2) + 1;
    const { characterSheet } = get();
    const currentXP = characterSheet.experience.currentXP;
    const newXP = currentXP + xpGained;
    const canLevelUp = newXP >= characterSheet.experience.xpForNextLevel;

    // Update XP without notification
    set({
      characterSheet: {
        ...characterSheet,
        experience: {
          ...characterSheet.experience,
          currentXP: newXP,
          canLevelUp,
        },
      },
    });

    // Show XP message only for the first movement
    if (!JOURNAL_STATE.hasShownFirstMovementXP) {
      const notificationStore = useNotificationStore.getState();
      notificationStore.addLogEntry(MessageType.XP_GAIN, {
        xpGained,
        totalXP: newXP,
        canLevelUp
      });
      JOURNAL_STATE.hasShownFirstMovementXP = true;
    }
  },

  // --- INVENTORY MANAGEMENT ---
  addItemToInventory: (itemId, quantity) => {
    const { characterSheet } = get();
    const item = itemDatabase[itemId];
    if (!item) return false;

    const newInventory = [...characterSheet.inventory];
    let added = false;

    // Try to stack first
    if (item.stackable) {
      const existingSlot = newInventory.find(slot => slot?.itemId === itemId);
      if (existingSlot) {
        existingSlot.quantity += quantity;
        added = true;
      }
    }

    // If not stacked, find an empty slot
    if (!added) {
      const emptySlotIndex = newInventory.findIndex(slot => slot === null);
      if (emptySlotIndex !== -1) {
        newInventory[emptySlotIndex] = { itemId, quantity, portions: item.portionsPerUnit };
        added = true;
      }
    }

    if (added) {
      get().updateCharacterSheet({ ...characterSheet, inventory: newInventory });
      return true;
    }

    return false; // Inventory is full
  },

  removeItemFromInventory: (slotIndex, quantity) => {
    const { characterSheet } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot || slot.quantity < quantity) return false;

    const newInventory = [...characterSheet.inventory];
    const currentSlot = newInventory[slotIndex]!;

    if (currentSlot.quantity === quantity) {
      newInventory[slotIndex] = null;
    } else {
      currentSlot.quantity -= quantity;
    }

    get().updateCharacterSheet({ ...characterSheet, inventory: newInventory });
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
