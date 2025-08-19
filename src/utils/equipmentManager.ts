// Equipment Manager - Gestione equipaggiamento personaggio
// Sistema per equipaggiare e rimuovere oggetti

import type { IItem, IInventorySlot } from '../interfaces/items';
import type { ICharacterSheet, IEquipmentSlot } from '../rules/types';

/**
 * Determina il tipo di slot per un oggetto
 */
export function getEquipmentSlotType(item: IItem): 'weapon' | 'armor' | 'accessory' | null {
  const itemType = typeof item.type === 'string' ? item.type.toLowerCase() : item.type;
  
  if (itemType === 'weapon' || item.damage) {
    return 'weapon';
  }
  
  if (itemType === 'armor' || item.armor) {
    return 'armor';
  }
  
  // Per ora solo weapon e armor, accessory per future espansioni
  return null;
}

/**
 * Verifica se un oggetto può essere equipaggiato
 */
export function canEquipItem(item: IItem): boolean {
  return getEquipmentSlotType(item) !== null;
}

/**
 * Equipaggia un oggetto dal slot inventario specificato
 */
export function equipItem(
  characterSheet: ICharacterSheet,
  items: Record<string, IItem>,
  inventorySlotIndex: number
): {
  success: boolean;
  message: string;
  updatedCharacterSheet: ICharacterSheet;
  unequippedItem?: { item: IItem; slot: IInventorySlot };
} {
  const inventorySlot = characterSheet.inventory[inventorySlotIndex];
  if (!inventorySlot) {
    return {
      success: false,
      message: 'Nessun oggetto in questo slot.',
      updatedCharacterSheet: characterSheet
    };
  }
  
  const item = items[inventorySlot.itemId];
  if (!item) {
    return {
      success: false,
      message: 'Oggetto non trovato.',
      updatedCharacterSheet: characterSheet
    };
  }
  
  const slotType = getEquipmentSlotType(item);
  if (!slotType) {
    return {
      success: false,
      message: `${item.name} non può essere equipaggiato.`,
      updatedCharacterSheet: characterSheet
    };
  }
  
  const newCharacterSheet = { ...characterSheet };
  const currentEquipment = newCharacterSheet.equipment[slotType];
  let unequippedItem: { item: IItem; slot: IInventorySlot } | undefined;
  
  // Se c'è già qualcosa equipaggiato, rimuovilo
  if (currentEquipment.itemId) {
    const currentEquippedItem = items[currentEquipment.itemId];
    if (currentEquippedItem) {
      // Trova uno slot vuoto per l'oggetto rimosso
      const emptySlotIndex = newCharacterSheet.inventory.findIndex(slot => slot === null);
      if (emptySlotIndex === -1) {
        return {
          success: false,
          message: 'Inventario pieno. Non puoi equipaggiare questo oggetto.',
          updatedCharacterSheet: characterSheet
        };
      }
      
      // Metti l'oggetto rimosso nell'inventario
      newCharacterSheet.inventory[emptySlotIndex] = {
        itemId: currentEquipment.itemId,
        quantity: 1
      };
      
      unequippedItem = {
        item: currentEquippedItem,
        slot: newCharacterSheet.inventory[emptySlotIndex]
      };
    }
  }
  
  // Equipaggia il nuovo oggetto
  newCharacterSheet.equipment[slotType] = {
    itemId: item.id,
    slotType
  };
  
  // Rimuovi dall'inventario (o diminuisci quantità)
  if (inventorySlot.quantity > 1) {
    newCharacterSheet.inventory[inventorySlotIndex] = {
      ...inventorySlot,
      quantity: inventorySlot.quantity - 1
    };
  } else {
    newCharacterSheet.inventory[inventorySlotIndex] = null;
  }
  
  const message = unequippedItem 
    ? `Hai equipaggiato ${item.name} e rimosso ${unequippedItem.item.name}.`
    : `Hai equipaggiato ${item.name}.`;
  
  return {
    success: true,
    message,
    updatedCharacterSheet: newCharacterSheet,
    unequippedItem
  };
}

/**
 * Rimuove un oggetto equipaggiato
 */
export function unequipItem(
  characterSheet: ICharacterSheet,
  items: Record<string, IItem>,
  slotType: 'weapon' | 'armor' | 'accessory'
): {
  success: boolean;
  message: string;
  updatedCharacterSheet: ICharacterSheet;
} {
  const equipmentSlot = characterSheet.equipment[slotType];
  if (!equipmentSlot.itemId) {
    return {
      success: false,
      message: `Nessun oggetto equipaggiato in slot ${slotType}.`,
      updatedCharacterSheet: characterSheet
    };
  }
  
  const item = items[equipmentSlot.itemId];
  if (!item) {
    return {
      success: false,
      message: 'Oggetto equipaggiato non trovato.',
      updatedCharacterSheet: characterSheet
    };
  }
  
  // Trova uno slot vuoto nell'inventario
  const emptySlotIndex = characterSheet.inventory.findIndex(slot => slot === null);
  if (emptySlotIndex === -1) {
    return {
      success: false,
      message: 'Inventario pieno. Non puoi rimuovere questo oggetto.',
      updatedCharacterSheet: characterSheet
    };
  }
  
  const newCharacterSheet = { ...characterSheet };
  
  // Metti l'oggetto nell'inventario
  newCharacterSheet.inventory[emptySlotIndex] = {
    itemId: equipmentSlot.itemId,
    quantity: 1
  };
  
  // Rimuovi dall'equipaggiamento
  newCharacterSheet.equipment[slotType] = {
    itemId: null,
    slotType
  };
  
  return {
    success: true,
    message: `Hai rimosso ${item.name}.`,
    updatedCharacterSheet: newCharacterSheet
  };
}

/**
 * Calcola l'AC totale considerando l'equipaggiamento
 */
export function calculateTotalAC(characterSheet: ICharacterSheet, items: Record<string, IItem>): number {
  let totalAC = characterSheet.baseAC;
  
  // Aggiungi bonus armatura
  const armorSlot = characterSheet.equipment.armor;
  if (armorSlot.itemId) {
    const armor = items[armorSlot.itemId];
    if (armor && armor.armor) {
      totalAC += armor.armor;
    }
  }
  
  return totalAC;
}

/**
 * Ottiene l'arma equipaggiata
 */
export function getEquippedWeapon(characterSheet: ICharacterSheet, items: Record<string, IItem>): IItem | null {
  const weaponSlot = characterSheet.equipment.weapon;
  if (!weaponSlot.itemId) return null;
  
  return items[weaponSlot.itemId] || null;
}

/**
 * Ottiene l'armatura equipaggiata
 */
export function getEquippedArmor(characterSheet: ICharacterSheet, items: Record<string, IItem>): IItem | null {
  const armorSlot = characterSheet.equipment.armor;
  if (!armorSlot.itemId) return null;
  
  return items[armorSlot.itemId] || null;
}

/**
 * Ottiene informazioni complete sull'equipaggiamento
 */
export function getEquipmentInfo(characterSheet: ICharacterSheet, items: Record<string, IItem>): {
  weapon: IItem | null;
  armor: IItem | null;
  accessory: IItem | null;
  totalAC: number;
  weaponDamage: string | null;
} {
  const weapon = getEquippedWeapon(characterSheet, items);
  const armor = getEquippedArmor(characterSheet, items);
  const accessorySlot = characterSheet.equipment.accessory;
  const accessory = accessorySlot.itemId ? items[accessorySlot.itemId] || null : null;
  
  return {
    weapon,
    armor,
    accessory,
    totalAC: calculateTotalAC(characterSheet, items),
    weaponDamage: weapon?.damage || null
  };
}