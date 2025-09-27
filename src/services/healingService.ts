import { useCharacterStore } from '@/stores/character/characterStore';
import { useInventoryStore } from '@/stores/inventory/inventoryStore';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { getStatusDisplayName } from '@/utils/formatUtils';
import { MessageType } from '@/data/MessageArchive';
import type { IItem } from '@/interfaces/items';
import { CharacterStatus } from '@/rules/types';

const calculateHealingSuccessRate = (item: IItem, status: CharacterStatus): number => {
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
  if (item.effectValue && item.effectValue >= 25) baseRate += 0.1;
  else if (item.effectValue && item.effectValue >= 15) baseRate += 0.05;

  // Adjust based on status difficulty
  switch (status) {
    case CharacterStatus.WOUNDED: baseRate += 0.1; break; // Easier to heal
    case CharacterStatus.SICK: baseRate -= 0.1; break; // Harder to heal
    case CharacterStatus.POISONED: baseRate -= 0.15; break; // Hardest to heal
  }

  return Math.max(0.1, Math.min(0.95, baseRate)); // Clamp between 10% and 95%
};

export const attemptStatusHealing = (item: IItem, slotIndex: number): boolean => {
  const characterStore = useCharacterStore.getState();
  const inventoryStore = useInventoryStore.getState();
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
  const successRate = calculateHealingSuccessRate(item, currentStatus);

  if (Math.random() < successRate) {
    // Success - remove status
    characterStore.removeStatus(currentStatus);
    inventoryStore.removeItem(slotIndex, 1);

    notificationStore.addLogEntry(MessageType.ACTION_SUCCESS, {
      action: `${item.name} ha curato con successo il tuo status "${getStatusDisplayName(currentStatus)}"`
    });

    // Apply healing if item has healing value
    if (item.effectValue && item.effectValue > 0) {
      characterStore.updateHP(item.effectValue);
      notificationStore.addLogEntry(MessageType.HP_RECOVERY, {
        healing: item.effectValue,
        reason: item.name.toLowerCase()
      });
    }

    return true;
  } else {
    // Failure - consume item anyway
    inventoryStore.removeItem(slotIndex, 1);
    notificationStore.addLogEntry(MessageType.ACTION_FAIL, {
      reason: `${item.name} non è riuscito a curare il tuo status "${getStatusDisplayName(currentStatus)}"`
    });
    return true;
  }
};