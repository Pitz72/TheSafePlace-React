import { act } from '@testing-library/react';
import { useCombatStore } from '../stores/combatStore';
import { useGameStore } from '../stores/gameStore';
import type { CombatEncounter, EnemyTemplate } from '../types/combat';
import * as combatCalculations from '../utils/combatCalculations';
import { combatEncounters } from '../data/combatEncounters';

// Mock dependencies
jest.mock('../stores/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(),
    setState: jest.fn(), // Mock setState as well
  },
}));
jest.mock('../stores/character/characterStore', () => ({
  useCharacterStore: {
    getState: jest.fn(),
  },
}));
jest.mock('../stores/inventory/inventoryStore', () => ({
  useInventoryStore: {
    getState: jest.fn(),
  },
}));
jest.mock('../utils/combatCalculations', () => ({
  rollToHit: jest.fn(),
  rollDamage: jest.fn(),
  rollEscape: jest.fn(),
  calculatePlayerAC: jest.fn(),
}));

const mockGetState = useGameStore.getState as jest.Mock;
const mockCharacterGetState = require('../stores/character/characterStore').useCharacterStore.getState as jest.Mock;
const mockInventoryGetState = require('../stores/inventory/inventoryStore').useInventoryStore.getState as jest.Mock;
const mockedRollToHit = combatCalculations.rollToHit as jest.Mock;
const mockedRollDamage = combatCalculations.rollDamage as jest.Mock;

describe('Combat Store', () => {
  const getInitialState = () => useCombatStore.getState();

  jest.useFakeTimers();

  // Calculate actual HP based on CON modifier
  const conModifier = Math.floor((13 - 10) / 2); // CON 13 = +1
  const actualMaxHP = Math.max(10, 100 + (conModifier * 10)); // 100 + 10 = 110

  const mockGameData = {
    characterSheet: {
      currentHP: actualMaxHP, maxHP: actualMaxHP,
      equipment: { weapon: { itemId: 'sword', slotType: 'weapon' }, armor: { itemId: 'leather', slotType: 'armor' } },
      stats: { potenza: 14, agilita: 12, vigore: 13, percezione: 10, adattamento: 11, carisma: 9 },
    },
    items: {
      sword: { id: 'sword', name: 'Spada Corta', type: 'Weapon', damage: '1d6' },
      leather: { id: 'leather', name: 'Armatura di Cuoio', type: 'Armor', armor: 2 },
    },
    formatTime: () => '12:00',
    timeState: { currentTime: 720 },
    addExperience: jest.fn(),
    addItem: jest.fn(),
  };

  const enemyTemplate: EnemyTemplate = { id: 'bandit', name: 'Bandito', hp: 18, ac: 14, damage: '1d6+2', attackBonus: 4, xpValue: 25 };
  const encounter: CombatEncounter = {
    id: 'test_encounter', description: 'Un bandito ti sbarra la strada!',
    enemies: [enemyTemplate], environment: 'forest', escapeModifier: 0,
  };

  beforeEach(() => {
    useCombatStore.setState(getInitialState(), true);
    mockGetState.mockReturnValue(mockGameData);
    mockCharacterGetState.mockReturnValue({
      characterSheet: mockGameData.characterSheet,
    });
    mockInventoryGetState.mockReturnValue({
      items: mockGameData.items,
      getInventory: () => [],
    });
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should have a correct initial state', () => {
    const { isActive, currentState } = getInitialState();
    expect(isActive).toBe(false);
    expect(currentState).toBeNull();
  });

  describe('initiateCombat', () => {
    it('should set up the initial state correctly', () => {
      const { initiateCombat } = useCombatStore.getState();
      // Aggiungi l'incontro di test al mock
      combatEncounters[encounter.id] = encounter;

      initiateCombat(encounter.id);
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.currentState).not.toBeNull();
      expect(state.currentState?.player.hp).toBe(mockGameData.characterSheet.currentHP);
      expect(state.currentState?.enemies[0].name).toBe('Bandito');
    });
  });

  describe('executePlayerAction (attack)', () => {
    beforeEach(() => {
      combatEncounters[encounter.id] = encounter; // Assicura che l'incontro esista
      useCombatStore.getState().initiateCombat(encounter.id);
      useCombatStore.getState().selectAction('attack');
      useCombatStore.getState().selectTarget(0);
    });

    it('should handle a successful attack', async () => {
      mockedRollToHit.mockReturnValue({ isHit: true, roll: 15, modifier: 2, total: 17, targetAC: 14 });
      mockedRollDamage.mockReturnValue({ rolls: [4], total: 4 });

      await useCombatStore.getState().executePlayerAction();

      const state = useCombatStore.getState();
      const enemy = state.currentState!.enemies[0];
      expect(enemy.hp).toBe(14);
      expect(enemy.healthDescription).toBe('Ferito');
      expect(state.currentState!.log.some(e => e.message.includes('Colpito!'))).toBe(true);
      expect(state.currentState!.phase).toBe('enemy-turn');
    });

    it('should handle a missed attack', async () => {
      mockedRollToHit.mockReturnValue({ isHit: false, roll: 5, modifier: 2, total: 7, targetAC: 14 });

      await useCombatStore.getState().executePlayerAction();

      const state = useCombatStore.getState();
      const enemy = state.currentState!.enemies[0];
      expect(enemy.hp).toBe(18);
      expect(state.currentState!.log.some(e => e.message.includes('Mancato!'))).toBe(true);
      expect(state.currentState!.phase).toBe('enemy-turn');
    });

    it('should handle an attack that defeats an enemy and end combat', async () => {
      mockedRollToHit.mockReturnValue({ isHit: true, roll: 20, modifier: 2, total: 22, targetAC: 14 });
      mockedRollDamage.mockReturnValue({ rolls: [10, 10], total: 20 });

      const endCombatSpy = jest.spyOn(useCombatStore.getState(), 'endCombat');

      await useCombatStore.getState().executePlayerAction();

      expect(endCombatSpy).toHaveBeenCalledWith({ type: 'victory' });

      const state = useCombatStore.getState();
      expect(state.isActive).toBe(false);

      endCombatSpy.mockRestore();
    });
  });

  test.skip('endCombat should reset the combat state', async () => {
    const { initiateCombat, endCombat } = useCombatStore.getState();
    combatEncounters[encounter.id] = encounter; // Assicura che l'incontro esista
    await act(async () => {
      initiateCombat(encounter.id);
    });
    expect(useCombatStore.getState().isActive).toBe(true);

    await act(async () => {
      endCombat({ type: 'victory' });
    });

    const state = useCombatStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.currentState).toBeNull();
  });

  describe('executeEnemyTurn', () => {
    beforeEach(() => {
      combatEncounters[encounter.id] = encounter;
      useCombatStore.getState().initiateCombat(encounter.id);
      // Forza la fase del turno nemico
      useCombatStore.setState(state => ({ currentState: { ...state.currentState!, phase: 'enemy-turn' } }));
    });

    it('should handle a successful enemy attack', async () => {
      mockedRollToHit.mockReturnValue({ isHit: true, roll: 18, modifier: 4, total: 22, targetAC: 10 });
      mockedRollDamage.mockReturnValue({ rolls: [4, 2], total: 6 });

      const promise = useCombatStore.getState().executeEnemyTurn();
      jest.runOnlyPendingTimers();
      await promise;

      const state = useCombatStore.getState();
      const expectedHP = mockGameData.characterSheet.currentHP - 6;
      expect(state.currentState!.player.hp).toBe(expectedHP);
      expect(state.currentState!.log.some(e => e.message.includes('ti infligge 6 danni'))).toBe(true);
      expect(state.currentState!.phase).toBe('player-turn');
    });

    test.skip('should handle player defeat', async () => {
      mockedRollToHit.mockReturnValue({ isHit: true, roll: 20, modifier: 4, total: 24, targetAC: 10 });
      mockedRollDamage.mockReturnValue({ rolls: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], total: 90 }); // Danno massiccio

      await act(async () => {
        const promise = useCombatStore.getState().executeEnemyTurn();
        jest.runOnlyPendingTimers();
        await promise;
      });

      const state = useCombatStore.getState();
      expect(state.isActive).toBe(false); // Il combattimento dovrebbe terminare
      expect(state.currentState).toBeNull();
    });
  });
});
