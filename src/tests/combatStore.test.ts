import { useCombatStore } from '../stores/combatStore';
import { useGameStore } from '../stores/gameStore';
import type { CombatEncounter, EnemyTemplate } from '../types/combat';
import * as combatCalculations from '../utils/combatCalculations';

// Mock dependencies
jest.mock('../stores/gameStore', () => ({
  useGameStore: {
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
const mockedRollToHit = combatCalculations.rollToHit as jest.Mock;
const mockedRollDamage = combatCalculations.rollDamage as jest.Mock;

describe('Combat Store', () => {
  const getInitialState = () => useCombatStore.getState();

  const mockGameData = {
    characterSheet: {
      currentHP: 80, maxHP: 100,
      equipment: { weapon: { itemId: 'sword', slotType: 'weapon' }, armor: { itemId: 'leather', slotType: 'armor' } },
      stats: { potenza: 14, agilita: 12, vigore: 13, percezione: 10, adattamento: 11, carisma: 9 },
    },
    items: {
      sword: { id: 'sword', name: 'Spada Corta', type: 'Weapon', damage: '1d6' },
      leather: { id: 'leather', name: 'Armatura di Cuoio', type: 'Armor', armor: 2 },
    },
    formatTime: () => '12:00',
    timeState: { currentTime: 720 },
  };

  const enemyTemplate: EnemyTemplate = { id: 'bandit', name: 'Bandito', hp: 18, ac: 14, damage: '1d6+2', attackBonus: 4, xpValue: 25 };
  const encounter: CombatEncounter = {
    id: 'test_encounter', description: 'Un bandito ti sbarra la strada!',
    enemies: [enemyTemplate], environment: 'forest', escapeModifier: 0,
  };

  beforeEach(() => {
    useCombatStore.setState(getInitialState(), true);
    mockGetState.mockReturnValue(mockGameData);
    jest.clearAllMocks();
  });

  it('should have a correct initial state', () => {
    const { isActive, currentState } = getInitialState();
    expect(isActive).toBe(false);
    expect(currentState).toBeNull();
  });

  describe('initiateCombat', () => {
    it('should set up the initial state correctly', () => {
      const { initiateCombat } = useCombatStore.getState();
      initiateCombat(encounter);
      const state = useCombatStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.currentState).not.toBeNull();
      expect(state.currentState?.player.hp).toBe(80);
      expect(state.currentState?.enemies[0].name).toBe('Bandito');
    });
  });

  describe('executePlayerAction (attack)', () => {
    beforeEach(() => {
      useCombatStore.getState().initiateCombat(encounter);
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

    it('should handle an attack that defeats an enemy', async () => {
      mockedRollToHit.mockReturnValue({ isHit: true, roll: 20, modifier: 2, total: 22, targetAC: 14 });
      mockedRollDamage.mockReturnValue({ rolls: [10, 10], total: 20 });

      await useCombatStore.getState().executePlayerAction();

      const state = useCombatStore.getState();
      const enemy = state.currentState!.enemies[0];
      expect(enemy.hp).toBe(-2);
      expect(enemy.status).toBe('dead');
      expect(state.currentState!.log.some(e => e.message.includes('sconfitto'))).toBe(true);
      expect(state.currentState!.phase).toBe('enemy-turn');
    });
  });

  it('endCombat should reset the combat state', () => {
    const { initiateCombat, endCombat } = useCombatStore.getState();
    initiateCombat(encounter);
    expect(useCombatStore.getState().isActive).toBe(true);

    endCombat({ type: 'victory' });

    const state = useCombatStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.currentState).toBeNull();
  });
});
