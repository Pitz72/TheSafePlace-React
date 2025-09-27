import type { ICharacterSheet } from '@/rules/types';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { MessageType } from '@/data/MessageArchive';

export const takeDamage = (characterSheet: ICharacterSheet, amount: number): ICharacterSheet => {
  const newHP = Math.max(0, characterSheet.currentHP - amount);
  const notificationStore = useNotificationStore.getState();
  notificationStore.addLogEntry(MessageType.HP_DAMAGE, {
    damage: amount,
    newHP,
    maxHP: characterSheet.maxHP,
  });
  return { ...characterSheet, currentHP: newHP };
};

export const healDamage = (characterSheet: ICharacterSheet, amount: number): ICharacterSheet => {
  const newHP = Math.min(characterSheet.maxHP, characterSheet.currentHP + amount);
  const notificationStore = useNotificationStore.getState();
  notificationStore.addLogEntry(MessageType.HP_RECOVERY, {
    healing: amount,
    newHP,
    maxHP: characterSheet.maxHP,
  });
  return { ...characterSheet, currentHP: newHP };
};