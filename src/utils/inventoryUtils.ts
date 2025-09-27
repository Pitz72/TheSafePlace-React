import type { ICharacterSheet } from '@/rules/types';
import { itemDatabase } from '@/data/items/itemDatabase';

export type InventorySlot = {
  itemId: string;
  quantity: number;
  portions?: number;
} | null;

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