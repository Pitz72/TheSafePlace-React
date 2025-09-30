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
} from '@/utils/inventoryUtils';
import type { InventorySlot } from '@/utils/inventoryUtils';
import { performAbilityCheck } from '@/utils/abilityUtils';
import { gainExperience, gainMovementXP } from '@/utils/experienceUtils';
import { itemDatabase } from '@/data/items/itemDatabase';
import { MessageType } from '@/data/MessageArchive';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';
import type { Consequence } from '@/interfaces/events';

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
  addItemToInventory: (itemId: string, quantity: number) => Promise<boolean>;
  removeItemFromInventory: (slotIndex: number, quantity: number) => Promise<boolean>;
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
  handleConsequence: (consequence: Consequence) => void;
}

export type CharacterStore = CharacterState & CharacterActions;

const initialState: CharacterState = {
  characterSheet: createTestCharacter(),
  isDead: false,
  isComatose: false,
  status: {
    currentStatus: CharacterStatus.NORMAL,
    statusEffects: [],
    statusDuration: {
      [CharacterStatus.NORMAL]: 0,
      [CharacterStatus.SICK]: 0,
      [CharacterStatus.WOUNDED]: 0,
      [CharacterStatus.POISONED]: 0,
      [CharacterStatus.STARVING]: 0,
      [CharacterStatus.DEHYDRATED]: 0,
      [CharacterStatus.DEAD]: 0
    }
  }
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
    return executeWithRetry({
      operation: () => {
        const { characterSheet, updateCharacterSheet } = get();
        const item = itemDatabase[itemId];
        
        if (!item) {
          throw new Error(`Oggetto ${itemId} non trovato nel database`);
        }

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

        return false; // Inventario pieno
      },
      category: GameErrorCategory.INVENTORY,
      context: {
        operation: 'addItemToInventory',
        itemId,
        quantity
      },
      onSuccess: () => {
        // Successo già gestito nel return
      },
      onFailure: (error: Error) => {
          handleStoreError(error, GameErrorCategory.INVENTORY, {
            operation: 'addItemToInventory',
            itemId,
            quantity,
            context: 'Aggiunta oggetto all\'inventario del personaggio'
          });
        },
      onFallback: () => {
        return false;
      }
    });
  },

  removeItemFromInventory: (slotIndex, quantity) => {
    return executeWithRetry({
      operation: () => {
        const { characterSheet, updateCharacterSheet } = get();
        const slot = characterSheet.inventory[slotIndex];
        
        if (!slot) {
          throw new Error(`Slot ${slotIndex} vuoto`);
        }
        
        if (slot.quantity < quantity) {
          throw new Error(`Quantità insufficiente nello slot ${slotIndex} (richiesta: ${quantity}, disponibile: ${slot.quantity})`);
        }

        const newInventory = removeItemFromSlot(characterSheet.inventory, slotIndex, quantity);
        updateCharacterSheet({ ...characterSheet, inventory: newInventory as (typeof characterSheet.inventory) });
        return true;
      },
      category: GameErrorCategory.INVENTORY,
      context: {
        operation: 'removeItemFromInventory',
        slotIndex,
        quantity
      },
      onSuccess: () => {
        // Successo già gestito nel return
      },
      onFailure: (error: Error) => {
          handleStoreError(error, GameErrorCategory.INVENTORY, {
            operation: 'removeItemFromInventory',
            slotIndex,
            quantity,
            context: 'Rimozione oggetto dall\'inventario del personaggio'
          });
        },
      onFallback: () => {
        return false;
      }
    });
  },

  // --- STATUS MANAGEMENT ---
  addStatus: (status: CharacterStatus, duration = 0) => {
    return executeWithRetry({
      operation: () => {
        const { characterSheet } = get();
        
        if (!Object.values(CharacterStatus).includes(status)) {
          throw new Error(`Status ${status} non valido`);
        }

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
      category: GameErrorCategory.SURVIVAL,
      context: {
        operation: 'applyStatus',
        status,
        duration
      },
      onSuccess: () => {
        // Successo già gestito nel return
      },
      onFailure: (error: Error) => {
          handleStoreError(error, GameErrorCategory.SURVIVAL, {
            operation: 'applyStatus',
            status,
            duration,
            context: 'Applicazione status al personaggio'
          });
        },
      onFallback: () => {
        console.log(`Impossibile applicare lo status ${status}`);
      }
    });
  },

  removeStatus: (status: CharacterStatus) => {
    return executeWithRetry({
      operation: () => {
        const { characterSheet } = get();
        
        if (!characterSheet.status.statusEffects.includes(status)) {
          throw new Error(`Status ${status} non presente sul personaggio`);
        }

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
      category: GameErrorCategory.SURVIVAL,
      context: {
        operation: 'removeStatus',
        status
      },
      onSuccess: () => {
        // Successo già gestito nel return
      },
      onFailure: (error: Error) => {
          handleStoreError(error, GameErrorCategory.SURVIVAL, {
            operation: 'removeStatus',
            status,
            context: 'Rimozione status dal personaggio'
          });
        },
      onFallback: () => {
        console.log(`Impossibile rimuovere lo status ${status}`);
      }
    });
  },

  hasStatus: (status) => {
    return get().characterSheet.status.statusEffects.includes(status);
  },

  // --- HEALTH & DAMAGE ---
  takeDamage: (amount: number) => {
    const { characterSheet, updateCharacterSheet } = get();
    const newHP = Math.max(0, characterSheet.currentHP - amount);
    updateCharacterSheet({ ...characterSheet, currentHP: newHP });
    
    if (newHP === 0) {
      set({ isDead: true });
    }
  },

  healDamage: (amount: number) => {
    const { characterSheet, updateCharacterSheet } = get();
    const newHP = Math.min(characterSheet.maxHP, characterSheet.currentHP + amount);
    updateCharacterSheet({ ...characterSheet, currentHP: newHP });
  },

  getStatusDescription: (status: CharacterStatus) => {
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
      isDead: false,
      isComatose: false,
      status: initialState.status
    });
  },

  // Test utility method for store isolation
  resetStore: () => {
    set(initialState);
  },

  /**
   * Handles event consequences that affect the character.
   * Currently supports sequence consequences and end_event consequences.
   * @param consequence - The consequence to handle
   */
  handleConsequence: (consequence: Consequence) => {
    switch (consequence.type) {
      case 'sequence':
        // Sequence consequences are typically handled by the event store
        console.log(`Character store received sequence consequence: ${consequence.sequenceId}`);
        break;
      case 'end_event':
        // End event consequences don't require character-specific handling
        console.log('Character store received end_event consequence');
        break;
      default:
        console.warn('Unknown consequence type received by character store:', consequence);
    }
  },
}));
