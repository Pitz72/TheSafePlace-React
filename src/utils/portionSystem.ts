// Portion System - Sistema gestione porzioni per consumabili
// Gestisce il consumo realistico di cibo, bevande e medicine

import type { IItem, IInventorySlot, IConsumableItem, IPortionConsumptionResult } from '../interfaces/items';

/**
 * Verifica se un oggetto supporta il sistema porzioni
 */
export function isPortionableItem(item: IItem): item is IConsumableItem {
  return !!(
    item.portionsPerUnit && 
    item.portionEffect !== undefined && 
    item.portionSize &&
    (item.type === 'consumable' || item.type === 'potion' || item.effect)
  );
}

/**
 * Inizializza le porzioni per un nuovo oggetto consumabile
 */
export function initializePortions(item: IItem, quantity: number): IInventorySlot {
  const slot: IInventorySlot = {
    itemId: item.id,
    quantity: quantity
  };
  
  if (isPortionableItem(item)) {
    slot.portions = quantity * item.portionsPerUnit;
  }
  
  return slot;
}

/**
 * Calcola le porzioni totali disponibili per uno slot
 */
export function getTotalPortions(item: IItem, slot: IInventorySlot): number {
  if (!isPortionableItem(item)) {
    return slot.quantity; // Oggetti non-porzioni: 1 porzione = 1 unità
  }
  
  // Se le porzioni sono già tracciate, usale
  if (slot.portions !== undefined) {
    return slot.portions;
  }
  
  // Altrimenti calcola dalle unità
  return slot.quantity * item.portionsPerUnit;
}

/**
 * Consuma una porzione da uno slot inventario
 */
export function consumePortion(item: IItem, slot: IInventorySlot): IPortionConsumptionResult {
  if (!isPortionableItem(item)) {
    // Oggetti non-porzioni: consuma l'intera unità
    if (slot.quantity <= 0) {
      return {
        success: false,
        portionsRemaining: 0,
        unitsRemaining: 0,
        effectApplied: 0,
        message: `Non hai più ${item.name}.`,
        itemConsumed: true
      };
    }
    
    slot.quantity -= 1;
    const effectApplied = typeof item.effectValue === 'number' ? item.effectValue : 0;
    
    return {
      success: true,
      portionsRemaining: slot.quantity,
      unitsRemaining: slot.quantity,
      effectApplied,
      message: `Hai utilizzato ${item.name}.`,
      itemConsumed: slot.quantity === 0
    };
  }
  
  // Oggetti con porzioni
  const currentPortions = slot.portions || (slot.quantity * item.portionsPerUnit);
  
  if (currentPortions <= 0) {
    return {
      success: false,
      portionsRemaining: 0,
      unitsRemaining: 0,
      effectApplied: 0,
      message: `Non hai più ${item.name}.`,
      itemConsumed: true
    };
  }
  
  // Consuma una porzione
  const newPortions = currentPortions - 1;
  slot.portions = newPortions;
  
  // Aggiorna le unità se necessario
  const newUnits = Math.ceil(newPortions / item.portionsPerUnit);
  slot.quantity = newUnits;
  
  const effectApplied = item.portionEffect;
  const itemConsumed = newPortions === 0;
  
  return {
    success: true,
    portionsRemaining: newPortions,
    unitsRemaining: newUnits,
    effectApplied,
    message: `Hai consumato un ${item.portionSize} di ${item.name}.`,
    itemConsumed
  };
}

/**
 * Ottiene una descrizione dettagliata delle porzioni per un oggetto
 */
export function getPortionDescription(item: IItem, slot: IInventorySlot): string {
  if (!isPortionableItem(item)) {
    return `${slot.quantity} unità`;
  }
  
  const totalPortions = getTotalPortions(item, slot);
  const units = slot.quantity;
  
  if (totalPortions === 0) {
    return 'Vuoto';
  }
  
  if (units === 1) {
    return `${totalPortions} ${item.portionSize}${totalPortions > 1 ? 'i' : ''}`;
  }
  
  return `${units} unità (${totalPortions} ${item.portionSize}${totalPortions > 1 ? 'i' : ''})`;
}

/**
 * Aggiunge porzioni a uno slot esistente
 */
export function addPortions(item: IItem, slot: IInventorySlot, quantityToAdd: number): void {
  slot.quantity += quantityToAdd;
  
  if (isPortionableItem(item)) {
    const currentPortions = slot.portions || 0;
    slot.portions = currentPortions + (quantityToAdd * item.portionsPerUnit);
  }
}

/**
 * Verifica se uno slot ha porzioni disponibili
 */
export function hasPortionsAvailable(item: IItem, slot: IInventorySlot): boolean {
  if (!isPortionableItem(item)) {
    return slot.quantity > 0;
  }
  
  const totalPortions = getTotalPortions(item, slot);
  return totalPortions > 0;
}

/**
 * Ottiene il numero di utilizzi rimanenti per un oggetto
 */
export function getRemainingUses(item: IItem, slot: IInventorySlot): number {
  if (!isPortionableItem(item)) {
    return slot.quantity;
  }
  
  return getTotalPortions(item, slot);
}

/**
 * Calcola l'effetto totale rimanente in uno slot
 */
export function getTotalEffectRemaining(item: IItem, slot: IInventorySlot): number {
  if (!isPortionableItem(item)) {
    const effectValue = typeof item.effectValue === 'number' ? item.effectValue : 0;
    return slot.quantity * effectValue;
  }
  
  const totalPortions = getTotalPortions(item, slot);
  return totalPortions * item.portionEffect;
}

/**
 * Converte un oggetto normale in oggetto con porzioni (per migrazione)
 */
export function convertToPortionableItem(
  item: IItem, 
  portionsPerUnit: number, 
  portionSize: string
): IConsumableItem {
  const effectValue = typeof item.effectValue === 'number' ? item.effectValue : 0;
  const portionEffect = Math.ceil(effectValue / portionsPerUnit);
  
  return {
    ...item,
    portionsPerUnit,
    portionEffect,
    portionSize
  } as IConsumableItem;
}

/**
 * Migra uno slot inventario esistente al sistema porzioni
 */
export function migrateSlotToPortions(item: IItem, slot: IInventorySlot): void {
  if (isPortionableItem(item) && slot.portions === undefined) {
    slot.portions = slot.quantity * item.portionsPerUnit;
  }
}