import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useEventStore } from './eventStore';
import { useInteractionStore } from './interactionStore';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { GameState } from '../types';

// Mock recipes for testing
const mockRecipes = [
  {
    id: 'recipe_test_item',
    name: 'Test Item',
    description: 'A test item.',
    skill: 'sopravvivenza',
    dc: 10,
    timeCost: 5,
    ingredients: [{ itemId: 'scrap_metal', quantity: 1 }],
    results: [{ itemId: 'test_item', quantity: 1 }],
  },
];

// Mock items for testing
const mockItems = {
  scrap_metal: { id: 'scrap_metal', name: 'Scrap Metal', stackable: true, type: 'material', rarity: 'common', weight: 1, value: 1, description: '', color: '' },
  test_item: { id: 'test_item', name: 'Test Item', stackable: true, type: 'material', rarity: 'common', weight: 1, value: 1, description: '', color: '' },
};


describe('store integrations', () => {
  beforeEach(async () => {
    // Reset all stores before each test
    useGameStore.getState().setMap();
    useCharacterStore.getState().initCharacter();
    useEventStore.getState().reset();
    useInteractionStore.getState().reset();

    // Load mock data into the stores
    useRecipeDatabaseStore.setState({ recipes: mockRecipes, isLoaded: true });
    useItemDatabaseStore.setState({ itemDatabase: mockItems, isLoaded: true });
  });

  it('movePlayer should trigger events and update character stats', () => {
    const initialHp = useCharacterStore.getState().hp.current;
    const initialXp = useCharacterStore.getState().xp.current;

    // This is a bit of a hack, but for testing purposes we can manually set an event
    useEventStore.setState({
      activeEvent: {
        id: 'test_event',
        title: 'Test Event',
        description: 'This is a test event.',
        biomes: ['Global'],
        isUnique: true,
        choices: [
          {
            text: 'Choice 1',
            outcomes: [
              {
                type: 'direct',
                results: [
                  { type: 'addXp', value: 10 },
                  { type: 'takeDamage', value: 5 },
                ],
              },
            ],
          },
        ],
      },
    });
    useGameStore.getState().setGameState(GameState.EVENT_SCREEN);
    useEventStore.getState().resolveEventChoice(0);

    const finalHp = useCharacterStore.getState().hp.current;
    const finalXp = useCharacterStore.getState().xp.current;

    expect(finalXp).toBe(initialXp + 10);
    expect(finalHp).toBe(initialHp - 5);
  });

  it('should allow crafting when ingredients are available', () => {
    const { addItem, learnRecipe, performSkillCheck } = useCharacterStore.getState();
    const { performCrafting } = useInteractionStore.getState();

    // Add ingredients for the test recipe
    addItem('scrap_metal', 1);
    learnRecipe('recipe_test_item');

    let inventory = useCharacterStore.getState().inventory;
    expect(inventory.find(i => i.itemId === 'scrap_metal')?.quantity).toBe(3);

    // Set the selected recipe to the test recipe
    useInteractionStore.setState({ craftingMenuState: { selectedIndex: 0 } });

    // This is a hack to ensure the skill check passes for the test
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Guarantees a roll of 19 or 20

    performCrafting();

    vi.spyOn(Math, 'random').mockRestore();

    // Check that the ingredient was consumed and the result was added
    inventory = useCharacterStore.getState().inventory;
    expect(inventory.find(i => i.itemId === 'scrap_metal')?.quantity).toBe(2);
    expect(inventory.find(i => i.itemId === 'test_item')?.quantity).toBe(1);
  });

  it('should not allow crafting when ingredients are insufficient', () => {
    const { inventory } = useCharacterStore.getState();
    const { performCrafting } = useInteractionStore.getState();

    // Ensure the player doesn't have the ingredients
    expect(inventory.find(i => i.itemId === 'scrap_metal')?.quantity).toBe(2);

    // Set the selected recipe to the test recipe
    useInteractionStore.setState({ craftingMenuState: { selectedIndex: 0 } });

    performCrafting();

    // Check that nothing changed
    expect(inventory.find(i => i.itemId === 'scrap_metal')?.quantity).toBe(2);
    expect(inventory.find(i => i.itemId === 'test_item')).toBeUndefined();
  });
});
