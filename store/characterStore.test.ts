// store/characterStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCharacterStore } from './characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { IItem } from '../types';

// Mock the constants module
vi.mock('../constants', () => import('../test/mockConstants'));

// Mock the item database
const mockItemDatabase: { [key: string]: IItem } = {
  test_item: { id: 'test_item', name: 'Test Item', stackable: true, type: 'material', rarity: 'common', weight: 1, value: 1, description: '', color: '' },
};
vi.mock('../data/itemDatabase', () => ({
  useItemDatabaseStore: {
    getState: () => ({
      itemDatabase: mockItemDatabase,
      getItem: (id: string) => mockItemDatabase[id],
    }),
  },
}));

describe('characterStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCharacterStore.getState().initCharacter();
  });

  it('should initialize with default values', () => {
    const { level, xp, hp } = useCharacterStore.getState();
    expect(level).toBe(1);
    expect(xp.current).toBe(0);
    expect(hp.current).toBe(100);
  });

  it('should add XP and level up', () => {
    const { addXp } = useCharacterStore.getState();
    expect(useCharacterStore.getState().levelUpPending).toBe(false);

    addXp(150);

    const { xp, level, levelUpPending } = useCharacterStore.getState();
    expect(xp.current).toBe(150);
    expect(level).toBe(1);
    expect(levelUpPending).toBe(true);
  });

  it('should apply level up correctly', () => {
    useCharacterStore.getState().addXp(150); // Trigger level up

    // Mock talent selection
    useCharacterStore.getState().applyLevelUp({ attribute: 'for', talentId: 'test_talent' });

    const { level, attributes, unlockedTalents, levelUpPending } = useCharacterStore.getState();
    expect(level).toBe(2);
    expect(attributes.for).toBe(11);
    expect(unlockedTalents).toContain('test_talent');
    expect(levelUpPending).toBe(false);
  });

  it('should handle item management', () => {
    const { addItem, removeItem } = useCharacterStore.getState();

    // Add an item
    addItem('test_item', 2);
    let inventory = useCharacterStore.getState().inventory;
    expect(inventory.find(i => i.itemId === 'test_item')?.quantity).toBe(2);

    // Remove an item
    removeItem('test_item', 1);
    inventory = useCharacterStore.getState().inventory;
    expect(inventory.find(i => i.itemId === 'test_item')?.quantity).toBe(1);

    // Remove all
    removeItem('test_item', 1);
    inventory = useCharacterStore.getState().inventory;
    expect(inventory.find(i => i.itemId === 'test_item')).toBeUndefined();
  });
});
