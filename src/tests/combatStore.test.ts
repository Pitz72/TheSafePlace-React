import { act } from '@testing-library/react';
import type { ICharacterSheet } from '../stores/character/characterStore';
import type { CombatEncounter, EnemyTemplate } from '../types/combat';
import { CharacterStatus } from '../rules/types';

// Use string literals directly in jest.mock to avoid hoisting issues.
const combatCalculationsPath = '../utils/combatCalculations';
const gameStorePath = '../stores/gameStore';
const itemStorePath = '../stores/item/itemStore';
const combatStorePath = '../stores/combatStore';
const characterStorePath = '../stores/character/characterStore';
const combatEncountersPath = '../data/combatEncounters';
const itemDatabasePath = '../data/items/itemDatabase';

describe('Combat Store', () => {
  // Define module-scoped variables that will be re-assigned in beforeEach
  let useCombatStore: typeof import('../stores/combatStore').useCombatStore;
  let useCharacterStore: typeof import('../stores/character/characterStore').useCharacterStore;
  let combatEncounters: typeof import('../data/combatEncounters').combatEncounters;
  let mockedCombatCalculations: jest.Mocked<typeof import('../utils/combatCalculations')>;

  // Test Data
  const mockCharacterSheet: ICharacterSheet = {
    name: 'Test Character', level: 1,
    experience: { currentXP: 0, xpForNextLevel: 100, canLevelUp: false },
    stats: { potenza: 14, agilita: 12, vigore: 13, percezione: 10, adattamento: 11, carisma: 9 },
    skills: { sopravvivenza: 1, artigianato: 1, furtivita: 1, medicina: 1 },
    status: { currentStatus: CharacterStatus.NORMAL, statusEffects: [], statusDuration: {} },
    currentHP: 110, maxHP: 110,
    equipment: { weapon: { itemId: 'sword' }, armor: { itemId: 'leather' }, accessory: { itemId: null } },
    inventory: [], movement: { totalDistance: 0, encounters: 0 }, knownRecipes: [],
  };
  const mockSword = { id: 'sword', name: 'Spada Corta', type: 'Weapon', damage: '1d6' };
  const mockLeatherArmor = { id: 'leather', name: 'Armatura di Cuoio', type: 'Armor', armor: 2 };
  const enemyTemplate: EnemyTemplate = { id: 'bandit', name: 'Bandito', hp: 18, ac: 14, damage: '1d6+2', attackBonus: 4, xpValue: 25 };
  const encounter: CombatEncounter = {
    id: 'test_encounter', description: 'Un bandito ti sbarra la strada!',
    enemies: [enemyTemplate], environment: 'forest', escapeModifier: 0,
  };

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    // Mock dependencies BEFORE requiring the modules that use them.
    jest.doMock(gameStorePath, () => ({ useGameStore: { getState: jest.fn() } }));
    jest.doMock(itemStorePath, () => ({ useItemStore: { getState: jest.fn() } }));
    jest.doMock(combatCalculationsPath, () => ({
      __esModule: true,
      ...jest.requireActual(combatCalculationsPath),
      rollToHit: jest.fn(),
      rollDamage: jest.fn(),
    }));

    // Now require the modules to get the fresh, mocked versions.
    useCombatStore = require(combatStorePath).useCombatStore;
    useCharacterStore = require(characterStorePath).useCharacterStore;
    combatEncounters = require(combatEncountersPath).combatEncounters;
    mockedCombatCalculations = require(combatCalculationsPath);
    const itemDatabase = require(itemDatabasePath).itemDatabase;
    const mockedUseItemStore = require(itemStorePath).useItemStore;
    const mockedUseGameStore = require(gameStorePath).useGameStore;

    itemDatabase['sword'] = mockSword;
    itemDatabase['leather'] = mockLeatherArmor;

    mockedUseItemStore.getState.mockReturnValue({
      getItemById: (id: string | null) => id === 'sword' ? mockSword : id === 'leather' ? mockLeatherArmor : undefined,
      items: itemDatabase,
    });
    mockedUseGameStore.getState.mockReturnValue({
      addExperience: jest.fn(), addItem: jest.fn(), takeDamage: jest.fn(),
    });

    combatEncounters[encounter.id] = encounter;

    act(() => {
      const characterStore = useCharacterStore.getState();
      characterStore.initialize();
      characterStore.updateCharacterSheet(mockCharacterSheet);
      useCombatStore.setState(useCombatStore.getInitialState(), true);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should have a correct initial state', () => {
    const { isActive, currentState } = useCombatStore.getState();
    expect(isActive).toBe(false);
    expect(currentState).toBeNull();
  });

  describe('initiateCombat', () => {
    it('should set up the initial state correctly', () => {
      act(() => { useCombatStore.getState().initiateCombat(encounter.id); });
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.currentState?.player.hp).toBe(110);
      expect(state.currentState?.player.ac).toBe(13);
    });
  });

  describe('executePlayerAction (attack)', () => {
    beforeEach(() => {
      act(() => {
        useCombatStore.getState().initiateCombat(encounter.id);
        useCombatStore.getState().selectAction('attack');
        useCombatStore.getState().selectTarget(0);
      });
    });

    it('should handle a successful attack', async () => {
      mockedCombatCalculations.rollToHit.mockReturnValue({ isHit: true, roll: 15, modifier: 2, total: 17, targetAC: 14 });
      mockedCombatCalculations.rollDamage.mockReturnValue({ rolls: [4], total: 4 });

      await act(async () => { await useCombatStore.getState().executePlayerAction(); });

      const enemy = useCombatStore.getState().currentState!.enemies[0];
      expect(enemy.hp).toBe(14);
      expect(useCombatStore.getState().currentState!.phase).toBe('enemy-turn');
    });

    it('should handle an attack that defeats an enemy and ends combat', async () => {
      mockedCombatCalculations.rollToHit.mockReturnValue({ isHit: true, roll: 20, modifier: 2, total: 22, targetAC: 14 });
      mockedCombatCalculations.rollDamage.mockReturnValue({ rolls: [20], total: 20 });
      const endCombatSpy = jest.spyOn(useCombatStore.getState(), 'endCombat');
      jest.spyOn(global.Math, 'random').mockReturnValue(0.4);

      await act(async () => { await useCombatStore.getState().executePlayerAction(); });

      expect(useCombatStore.getState().currentState!.enemies[0].status).toBe('dead');

      await act(async () => { jest.runAllTimers(); });

      expect(endCombatSpy).toHaveBeenCalledWith({ type: 'victory' });
      expect(useCombatStore.getState().isActive).toBe(false);
    });
  });

  describe('executeEnemyTurn', () => {
    beforeEach(() => {
      act(() => {
        useCombatStore.getState().initiateCombat(encounter.id);
        useCombatStore.setState(state => ({ currentState: { ...state.currentState!, phase: 'enemy-turn' } }));
      });
    });

    it('should handle a successful enemy attack', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.9);
      mockedCombatCalculations.rollDamage.mockReturnValue({ rolls: [4, 2], total: 6 });

      // The key fix: Do not await the async action inside the first act().
      // This allows the test to continue and advance timers.
      act(() => {
        useCombatStore.getState().executeEnemyTurn();
      });

      // Now, advance the timers to resolve the setTimeout promises.
      await act(async () => { jest.runAllTimers(); });

      const player = useCombatStore.getState().currentState!.player;
      expect(player.hp).toBe(104);
      expect(useCombatStore.getState().currentState!.phase).toBe('player-turn');
    });
  });
});