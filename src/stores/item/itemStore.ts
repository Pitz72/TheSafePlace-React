import { create } from 'zustand';
import { itemDatabase } from '@/data/items/itemDatabase';
import type { IItem } from '@/interfaces/items';

/**
 * Interface for the Item Store state.
 * This store is responsible for holding the master item list.
 */
interface ItemStoreState {
  /**
   * A record of all items in the game, keyed by their ID.
   */
  items: Record<string, IItem>;
}

/**
 * Interface for the Item Store actions.
 */
interface ItemStoreActions {
  /**
   * Retrieves an item from the database by its ID.
   * @param id The ID of the item to retrieve.
   * @returns The item object if found, otherwise undefined.
   */
  getItemById: (id: string | null) => IItem | undefined;
  /**
   * Resets the store to its initial state. Used for testing.
   */
  resetStore: () => void;
}

/**
 * The complete type for the Item Store, combining state and actions.
 */
export type ItemStore = ItemStoreState & ItemStoreActions;

/**
 * The initial state of the item store, pre-populated with the game's item database.
 */
export const initialState: ItemStoreState = {
  items: itemDatabase,
};

/**
 * Zustand store for managing the game's master item database.
 *
 * This store is intended to be a simple data repository for all possible items in the game.
 * It has no dependencies on other stores, breaking the circular dependency chain that
 * caused issues with testing.
 *
 * All logic for manipulating character-specific inventories or equipping items
 * is handled in other stores (like `gameStore` or `characterStore`), which can
 * use `getItemById` to retrieve master item data.
 */
export const useItemStore = create<ItemStore>((set, get) => ({
  ...initialState,

  /**
   * Retrieves an item from the database by its ID.
   * This is the primary way other parts of the application should access item data.
   * @param id The ID of the item to retrieve. Can be null.
   * @returns The item object if the ID is valid and exists, otherwise undefined.
   */
  getItemById: (id: string | null) => {
    if (!id) {
      return undefined;
    }
    return get().items[id];
  },

  /**
   * Resets the store to its initial state.
   * Primarily used in test environments to ensure state isolation between tests.
   */
  resetStore: () => {
    set(initialState);
  },
}));