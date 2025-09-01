import { create } from 'zustand';
import type { ICharacterSheet, AbilityType } from '../../rules/types';
import { createTestCharacter } from '../../rules/characterGenerator';
import { equipItem } from '../../utils/equipmentManager';
import { useGameStore } from '../gameStore';
import { itemDatabase } from '../../data/items/itemDatabase';
import { MessageType } from '../../data/MessageArchive';

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
  equipItemFromInventory: (slotIndex: number) => void;
  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (slotIndex: number, quantity?: number) => boolean;

  // Initialization
  resetCharacter: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  // --- INITIAL STATE ---
  characterSheet: createTestCharacter(),
  lastShortRestTime: null,

  // --- ACTIONS ---

  updateHP: (amount) =>
    set((state) => ({
      characterSheet: {
        ...state.characterSheet,
        currentHP: Math.max(
          0,
          Math.min(
            state.characterSheet.maxHP,
            state.characterSheet.currentHP + amount
          )
        ),
      },
    })),

  addExperience: (xpGained) =>
    set((state) => {
      const newXP = state.characterSheet.experience.currentXP + xpGained;
      return {
        characterSheet: {
          ...state.characterSheet,
          experience: {
            ...state.characterSheet.experience,
            currentXP: newXP,
            canLevelUp:
              newXP >= state.characterSheet.experience.xpForNextLevel &&
              state.characterSheet.level < 20,
          },
        },
      };
    }),

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

  equipItemFromInventory: (slotIndex) => {
    const { characterSheet } = get();
    const game = useGameStore.getState(); // To add log entries

    const result = equipItem(characterSheet, itemDatabase, slotIndex);

    if (result.success) {
      get().updateCharacterSheet(result.updatedCharacterSheet);
      game.addLogEntry(MessageType.ACTION_SUCCESS, { action: result.message });
    } else {
      game.addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
    }
  },

  addItem: (itemId, quantity = 1) => {
    const item = itemDatabase[itemId];
    if (!item) return false;

    const { characterSheet } = get();
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
      set({
        characterSheet: { ...characterSheet, inventory: newInventory },
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
    const { characterSheet } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return false;

    const newInventory = [...characterSheet.inventory];
    const currentSlot = newInventory[slotIndex]!;

    if (currentSlot.quantity <= quantity) {
      newInventory[slotIndex] = null;
    } else {
      currentSlot.quantity -= quantity;
    }

    set({ characterSheet: { ...characterSheet, inventory: newInventory } });
    return true;
  },

  resetCharacter: () => {
    set({
      characterSheet: createTestCharacter(),
      lastShortRestTime: null,
    });
  },
}));
