import type { AbilityType, ICharacterSheet } from '@/rules/types';

export const getModifier = (stats: ICharacterSheet['stats'], ability: AbilityType): number => {
  return Math.floor((stats[ability] - 10) / 2);
};

export const performAbilityCheck = (stats: ICharacterSheet['stats'], ability: AbilityType, difficulty: number): { success: boolean; roll: number; modifier: number; total: number } => {
  const modifier = getModifier(stats, ability);
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + modifier;
  const success = total >= difficulty;

  return { success, roll, modifier, total };
};