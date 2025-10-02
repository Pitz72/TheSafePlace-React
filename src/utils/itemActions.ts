// Item Actions - Sistema opzioni utilizzo oggetti
// Determina le azioni disponibili per ogni tipo di oggetto

import type { IItem } from '../interfaces/items';
import { ItemType } from '../interfaces/items';

export interface ItemAction {
  key: string;
  label: string;
  description: string;
  color: string;
  available: boolean;
}

/**
 * Determina le azioni disponibili per un oggetto
 */
export function getAvailableActions(item: IItem): ItemAction[] {
  const actions: ItemAction[] = [];
  const itemType = typeof item.type === 'string' ? item.type.toLowerCase() : item.type;
  
  // Azione USO - Disponibile per consumabili e pozioni
  const canUse = itemType === 'consumable' || 
                 itemType === ItemType.CONSUMABLE ||
                 itemType === 'potion' ||
                 itemType === ItemType.POTION ||
                 Boolean(item.effect);
  
  actions.push({
    key: 'U',
    label: 'USA',
    description: canUse ? 'Utilizza questo oggetto' : 'Non può essere utilizzato',
    color: canUse ? 'text-green-400' : 'text-gray-600',
    available: canUse
  });
  
  // Azione EQUIPAGGIA - Disponibile solo per armi e armature reali
  const canEquip = (itemType === 'weapon' || itemType === ItemType.WEAPON || Boolean(item.damage)) ||
                   (itemType === 'armor' || itemType === ItemType.ARMOR || Boolean(item.armor));
  
  actions.push({
    key: 'E',
    label: 'EQUIPAGGIA',
    description: canEquip ? 'Equipaggia questo oggetto' : 'Non può essere equipaggiato',
    color: canEquip ? 'text-blue-400' : 'text-gray-600',
    available: canEquip
  });
  
  // Azione ESAMINA - Sempre disponibile
  actions.push({
    key: 'X',
    label: 'ESAMINA',
    description: 'Esamina più attentamente questo oggetto',
    color: 'text-yellow-400',
    available: true
  });
  
  // Azione GETTA - Sempre disponibile (tranne oggetti quest)
  const canDrop = itemType !== 'quest' && itemType !== ItemType.QUEST;
  
  actions.push({
    key: 'G',
    label: 'GETTA',
    description: canDrop ? 'Getta questo oggetto' : 'Oggetto troppo importante per essere gettato',
    color: canDrop ? 'text-red-400' : 'text-gray-600',
    available: canDrop
  });
  
  return actions;
}

/**
 * Ottiene l'azione di default per un oggetto (quella eseguita con ENTER)
 */
export function getDefaultAction(item: IItem): ItemAction | null {
  const actions = getAvailableActions(item);
  
  // Priorità: USO > EQUIPAGGIA > ESAMINA
  const priorityOrder = ['U', 'E', 'X'];
  
  for (const key of priorityOrder) {
    const action = actions.find(a => a.key === key && a.available);
    if (action) return action;
  }
  
  return null;
}

/**
 * Esegue un'azione su un oggetto
 */
export function executeItemAction(
  action: ItemAction,
  item: IItem,
  slotIndex: number,
  onUse?: (slotIndex: number) => void,
  onEquip?: (item: IItem, slotIndex: number) => void,
  onExamine?: (item: IItem) => void,
  onDrop?: (slotIndex: number) => void
): boolean {
  if (!action.available) {
    return false;
  }

  switch (action.key) {
    case 'U':
      if (onUse) onUse(slotIndex);
      return true; // Close actions menu
    case 'E':
      if (onEquip) onEquip(item, slotIndex);
      return true; // Close actions menu
    case 'X':
      if (onExamine) onExamine(item);
      return false; // Do not close, examine shows new text
    case 'G':
      if (onDrop) onDrop(slotIndex);
      return true; // Close actions menu
    default:
      return false;
  }
}

/**
 * Ottiene una descrizione dettagliata per l'esame di un oggetto
 */
export function getDetailedExamination(item: IItem): string[] {
  const details: string[] = [];
  
  details.push(`${item.name} - ${item.description}`);
  details.push('');
  
  // Informazioni tecniche
  if (item.damage) {
    details.push(`Danno: ${item.damage}`);
  }
  
  if (item.armor) {
    details.push(`Protezione: +${item.armor} AC`);
  }
  
  if (item.effect) {
    details.push(`Effetto: ${item.effect}`);
    if (item.effectValue) {
      details.push(`Potenza: ${item.effectValue}`);
    }
  }
  
  if (item.weight) {
    details.push(`Peso: ${item.weight} kg`);
  }
  
  if (item.value) {
    details.push(`Valore stimato: ${item.value} crediti`);
  }
  
  if (item.durability) {
    details.push(`Durabilità: ${item.durability}%`);
  }
  
  // Informazioni sulla rarità
  if (item.rarity) {
    details.push('');
    details.push(`Rarità: ${item.rarity}`);
    
    switch (item.rarity) {
      case 'Common':
        details.push('Un oggetto comune, facilmente reperibile.');
        break;
      case 'Uncommon':
        details.push('Un oggetto poco comune, di discreta qualità.');
        break;
      case 'Rare':
        details.push('Un oggetto raro, di alta qualità.');
        break;
      case 'Epic':
        details.push('Un oggetto epico, estremamente prezioso.');
        break;
      case 'Legendary':
        details.push('Un oggetto leggendario, unico nel suo genere.');
        break;
    }
  }
  
  return details;
}