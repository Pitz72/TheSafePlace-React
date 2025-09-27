import type { ICharacterSheet } from '@/rules/types';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { MessageType, JOURNAL_STATE } from '@/data/MessageArchive';

export const gainExperience = (characterSheet: ICharacterSheet, amount: number): ICharacterSheet => {
  const newXP = characterSheet.experience.currentXP + amount;
  const canLevelUp = newXP >= characterSheet.experience.xpForNextLevel && characterSheet.level < 20;

  const notificationStore = useNotificationStore.getState();
  notificationStore.addLogEntry(MessageType.XP_GAIN, {
    xpGained: amount,
    totalXP: newXP,
    canLevelUp,
  });

  return {
    ...characterSheet,
    experience: {
      ...characterSheet.experience,
      currentXP: newXP,
      canLevelUp,
    },
  };
};

export const gainMovementXP = (characterSheet: ICharacterSheet): ICharacterSheet => {
  const xpGained = Math.floor(Math.random() * 2) + 1;
  const newXP = characterSheet.experience.currentXP + xpGained;
  const canLevelUp = newXP >= characterSheet.experience.xpForNextLevel;

  if (!JOURNAL_STATE.hasShownFirstMovementXP) {
    const notificationStore = useNotificationStore.getState();
    notificationStore.addLogEntry(MessageType.XP_GAIN, {
      xpGained,
      totalXP: newXP,
      canLevelUp,
    });
    JOURNAL_STATE.hasShownFirstMovementXP = true;
  }

  return {
    ...characterSheet,
    experience: {
      ...characterSheet.experience,
      currentXP: newXP,
      canLevelUp,
    },
  };
};