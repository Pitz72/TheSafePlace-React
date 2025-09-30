import type { ICharacterSheet } from '@/rules/types';
import { itemDatabase } from '@/data/items/itemDatabase';
import type { IInventorySlot } from '@/interfaces/items';

// Re-export esplicito per compatibilità Rollup
export type { IInventorySlot };
export type InventorySlot = IInventorySlot | null;

export const findEmptySlot = (inventory: InventorySlot[]): number => {
  return inventory.findIndex(slot => slot === null);
};

export const findStackableSlot = (inventory: InventorySlot[], itemId: string): number => {
  return inventory.findIndex(slot => slot?.itemId === itemId);
};

export const addItemToStack = (inventory: InventorySlot[], slotIndex: number, quantity: number): InventorySlot[] => {
  const newInventory = [...inventory];
  const slot = newInventory[slotIndex];
  if (slot) {
    slot.quantity += quantity;
  }
  return newInventory;
};

export const addNewItem = (inventory: InventorySlot[], slotIndex: number, itemId: string, quantity: number): InventorySlot[] => {
  const newInventory = [...inventory];
  const item = itemDatabase[itemId];
  if (item) {
    newInventory[slotIndex] = { itemId, quantity, portions: item.portionsPerUnit };
  }
  return newInventory;
};

export const removeItemFromSlot = (inventory: InventorySlot[], slotIndex: number, quantity: number): InventorySlot[] => {
  const newInventory = [...inventory];
  const slot = newInventory[slotIndex];
  if (slot) {
    if (slot.quantity <= quantity) {
      newInventory[slotIndex] = null;
    } else {
      slot.quantity -= quantity;
    }
  }
  return newInventory;
};