/**
 * Inventory Domain - Stato dell'inventario del giocatore
 * Gestisce items, equipaggiamento, crafting
 */

export interface InventoryItem {
  id: string;
  quantity: number;
  durability?: number;
  maxDurability?: number;
  quality?: 'poor' | 'common' | 'good' | 'excellent' | 'masterwork';
  customProperties?: Record<string, any>;
}

export interface InventoryState {
  /** Items nell'inventario */
  items: InventoryItem[];
  /** Capacità massima dell'inventario */
  maxSlots: number;
  /** Peso totale corrente */
  currentWeight: number;
  /** Peso massimo trasportabile */
  maxWeight: number;
  /** Items equipaggiati (riferimenti agli slot nell'inventario) */
  equippedItems: {
    weapon?: number; // index nell'array items
    armor?: number;
    shield?: number;
    accessory1?: number;
    accessory2?: number;
  };
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'tool' | 'quest';
  subtype?: string;
  weight: number;
  value: number;
  stackable: boolean;
  maxStack: number;
  durability?: number;
  properties: Record<string, any>;
}

export function createEmptyInventory(maxSlots: number = 20, maxWeight: number = 50): InventoryState {
  return {
    items: [],
    maxSlots,
    currentWeight: 0,
    maxWeight,
    equippedItems: {}
  };
}

export function addItem(
  inventory: InventoryState,
  itemDef: ItemDefinition,
  quantity: number = 1,
  quality?: InventoryItem['quality']
): { success: boolean; reason?: string } {
  // Controlla spazio disponibile
  if (inventory.items.length >= inventory.maxSlots) {
    return { success: false, reason: 'Inventario pieno' };
  }

  // Controlla peso
  const totalWeight = quantity * itemDef.weight;
  if (inventory.currentWeight + totalWeight > inventory.maxWeight) {
    return { success: false, reason: 'Troppo pesante' };
  }

  // Cerca stack esistente per items stackable
  if (itemDef.stackable) {
    const existingStack = inventory.items.find(item =>
      item.id === itemDef.id &&
      item.quantity < itemDef.maxStack &&
      item.quality === quality
    );

    if (existingStack) {
      const canAdd = Math.min(
        quantity,
        itemDef.maxStack - existingStack.quantity
      );

      existingStack.quantity += canAdd;
      inventory.currentWeight += canAdd * itemDef.weight;

      const remaining = quantity - canAdd;
      if (remaining > 0) {
        // Crea nuovo stack per il resto
        return addItem(inventory, itemDef, remaining, quality);
      }

      return { success: true };
    }
  }

  // Crea nuovo item
  const newItem: InventoryItem = {
    id: itemDef.id,
    quantity,
    durability: itemDef.durability,
    maxDurability: itemDef.durability,
    quality
  };

  inventory.items.push(newItem);
  inventory.currentWeight += totalWeight;

  return { success: true };
}

export function removeItem(
  inventory: InventoryState,
  itemIndex: number,
  quantity: number = 1
): { success: boolean; removedQuantity: number; reason?: string } {
  if (itemIndex < 0 || itemIndex >= inventory.items.length) {
    return { success: false, removedQuantity: 0, reason: 'Item non trovato' };
  }

  const item = inventory.items[itemIndex];
  const toRemove = Math.min(quantity, item.quantity);

  item.quantity -= toRemove;
  inventory.currentWeight -= toRemove * getItemWeight(item.id);

  if (item.quantity <= 0) {
    // Rimuovi item completamente
    inventory.items.splice(itemIndex, 1);

    // Aggiorna riferimenti equipaggiati
    updateEquippedReferences(inventory, itemIndex);
  }

  return { success: true, removedQuantity: toRemove };
}

export function equipItem(
  inventory: InventoryState,
  itemIndex: number,
  slot: keyof InventoryState['equippedItems']
): { success: boolean; reason?: string } {
  if (itemIndex < 0 || itemIndex >= inventory.items.length) {
    return { success: false, reason: 'Item non trovato' };
  }

  const item = inventory.items[itemIndex];
  const itemDef = getItemDefinition(item.id);

  if (!itemDef) {
    return { success: false, reason: 'Definizione item non trovata' };
  }

  // Verifica se l'item può essere equipaggiato in questo slot
  if (!canEquipInSlot(itemDef, slot)) {
    return { success: false, reason: 'Item non equipaggiabile in questo slot' };
  }

  // Rimuovi equipaggiamento precedente se presente
  if (inventory.equippedItems[slot] !== undefined) {
    unequipItem(inventory, slot);
  }

  inventory.equippedItems[slot] = itemIndex;

  return { success: true };
}

export function unequipItem(
  inventory: InventoryState,
  slot: keyof InventoryState['equippedItems']
): { success: boolean; itemIndex?: number } {
  const itemIndex = inventory.equippedItems[slot];
  if (itemIndex === undefined) {
    return { success: false };
  }

  delete inventory.equippedItems[slot];
  return { success: true, itemIndex };
}

export function getEquippedItem(
  inventory: InventoryState,
  slot: keyof InventoryState['equippedItems']
): InventoryItem | null {
  const itemIndex = inventory.equippedItems[slot];
  if (itemIndex === undefined) return null;

  return inventory.items[itemIndex] || null;
}

export function getTotalWeight(inventory: InventoryState): number {
  return inventory.items.reduce((total, item) => {
    return total + (item.quantity * getItemWeight(item.id));
  }, 0);
}

export function hasItem(inventory: InventoryState, itemId: string, quantity: number = 1): boolean {
  const totalQuantity = inventory.items
    .filter(item => item.id === itemId)
    .reduce((total, item) => total + item.quantity, 0);

  return totalQuantity >= quantity;
}

export function getItemCount(inventory: InventoryState, itemId: string): number {
  return inventory.items
    .filter(item => item.id === itemId)
    .reduce((total, item) => total + item.quantity, 0);
}

// Utility functions
function getItemWeight(itemId: string): number {
  // In una implementazione reale, questo verrebbe dal database items
  // Per ora restituiamo un valore di default
  return 1;
}

function getItemDefinition(itemId: string): ItemDefinition | null {
  // Placeholder - in una implementazione reale, questo verrebbe dal database
  return null;
}

function canEquipInSlot(itemDef: ItemDefinition, slot: keyof InventoryState['equippedItems']): boolean {
  // Logica semplificata per determinare se un item può essere equipaggiato
  switch (slot) {
    case 'weapon':
      return itemDef.type === 'weapon';
    case 'armor':
      return itemDef.type === 'armor' && itemDef.subtype === 'body';
    case 'shield':
      return itemDef.type === 'armor' && itemDef.subtype === 'shield';
    case 'accessory1':
    case 'accessory2':
      return itemDef.type === 'armor' && itemDef.subtype === 'accessory';
    default:
      return false;
  }
}

function updateEquippedReferences(inventory: InventoryState, removedIndex: number): void {
  // Aggiorna tutti i riferimenti equipaggiati che puntano a indici successivi
  Object.keys(inventory.equippedItems).forEach(slot => {
    const slotKey = slot as keyof InventoryState['equippedItems'];
    const equippedIndex = inventory.equippedItems[slotKey];

    if (equippedIndex !== undefined) {
      if (equippedIndex === removedIndex) {
        // L'item rimosso era equipaggiato, rimuovi riferimento
        delete inventory.equippedItems[slotKey];
      } else if (equippedIndex > removedIndex) {
        // L'indice deve essere decrementato
        inventory.equippedItems[slotKey] = equippedIndex - 1;
      }
    }
  });
}