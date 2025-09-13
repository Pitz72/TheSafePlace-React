import { create } from 'zustand';
import type { ICharacterSheet, AbilityType } from '../../rules/types';
import { createTestCharacter } from '../../rules/characterGenerator';
import { equipItem } from '../../utils/equipmentManager';
import { itemDatabase } from '../../data/items/itemDatabase';
import { MessageType } from '../../data/MessageArchive';
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
    get().addExperience(Math.floor(Math.random() * 2) + 1);
  },

  resetCharacter: () => {
    set({
      characterSheet: createTestCharacter(),
      lastShortRestTime: null,
    });
  },
}));
