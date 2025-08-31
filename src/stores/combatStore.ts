import { create } from 'zustand';
import type { CombatState, CombatEncounter, CombatResult, CombatActionType, CombatLogEntry } from '../types/combat';
import { useGameStore } from './gameStore'; // To get player data
import { createEnemyCombatant, updateEnemyHealthDescription } from '../utils/enemyUtils';
import { rollToHit, rollDamage } from '../utils/combatCalculations';

// --- STORE INTERFACE ---

export interface CombatStoreState {
  isActive: boolean;
  currentState: CombatState | null;
  selectedAction: CombatActionType | null;
  selectedTarget: number | null; // index of the enemy in the enemies array

  // --- ACTIONS ---

  initiateCombat: (encounter: CombatEncounter) => void;
  endCombat: (result: CombatResult) => void;

  selectAction: (action: CombatActionType) => void;
  selectTarget: (index: number) => void;

  addLogEntry: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void;

  executePlayerAction: () => Promise<void>;
}

// --- STORE IMPLEMENTATION ---

export const useCombatStore = create<CombatStoreState>((set, get) => ({
  // --- INITIAL STATE ---
  isActive: false,
  currentState: null,
  selectedAction: null,
  selectedTarget: null,

  // --- ACTIONS ---

  initiateCombat: (encounter) => {
    const { characterSheet, items } = useGameStore.getState();

    // Create player state for combat
    const playerCombatState = {
      hp: characterSheet.currentHP,
      maxHp: characterSheet.maxHP,
      // AC will be calculated dynamically later
      ac: 10, // Placeholder
      baseAc: 10, // Placeholder
      weapon: items[characterSheet.equipment.weapon.itemId!] || { id: 'unarmed', name: 'Unarmed', type: 'Weapon', damage: '1d2', description: 'A punch' },
      armor: items[characterSheet.equipment.armor.itemId!] || undefined,
      temporaryBonuses: [],
      stats: characterSheet.stats,
    };

    // Create enemy combatant states
    const enemyCombatants = encounter.enemies.map((template, index) =>
      createEnemyCombatant(template, `enemy-${index}-${Date.now()}`)
    );

    const initialState: CombatState = {
      phase: 'player-turn',
      currentTurn: 0,
      player: playerCombatState,
      enemies: enemyCombatants,
      log: [],
      encounter,
    };

    set({
      isActive: true,
      currentState: initialState,
      selectedAction: 'attack', // Default action
      selectedTarget: 0,
    });

    get().addLogEntry({
        type: 'info',
        message: `Inizia il combattimento! ${encounter.description}`,
    });
  },

  endCombat: (result) => {
    // Here we would handle XP, loot, etc. by calling gameStore actions
    // For now, just reset the state.
    console.log('Combattimento terminato:', result);

    set({
      isActive: false,
      currentState: null,
      selectedAction: null,
      selectedTarget: null,
    });
  },

  selectAction: (action) => {
    set({ selectedAction: action });
  },

  selectTarget: (index) => {
    set(state => {
        if (state.currentState && index >= 0 && index < state.currentState.enemies.length) {
            return { selectedTarget: index };
        }
        return {};
    });
  },

  addLogEntry: (entry) => {
    set(state => {
      if (!state.currentState) return {};

      const newLogEntry: CombatLogEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: useGameStore.getState().formatTime(useGameStore.getState().timeState.currentTime),
      };

      return {
        currentState: {
          ...state.currentState,
          log: [...state.currentState.log, newLogEntry].slice(-20), // Keep last 20 entries
        }
      };
    });
  },

  executePlayerAction: async () => {
    const { currentState, selectedAction, selectedTarget } = get();
    if (!currentState || !selectedAction) return;

    const { player, enemies } = currentState;

    switch (selectedAction) {
      case 'attack':
        if (selectedTarget === null || enemies[selectedTarget].status === 'dead') {
          get().addLogEntry({ type: 'error', message: 'Bersaglio non valido.' });
          return;
        }

        const target = enemies[selectedTarget];

        const attackResult = rollToHit(player.stats, target.ac, player.weapon);

        get().addLogEntry({
            type: 'roll',
            message: `Tiro per colpire: ${attackResult.roll} + ${attackResult.modifier} = ${attackResult.total} (vs AC ${target.ac})`
        });

        set(state => {
          if (!state.currentState) return {};

          const currentLog = state.currentState.log;
          const newLogEntries: CombatLogEntry[] = [];

          const createLogEntry = (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>): CombatLogEntry => ({
            ...entry,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: useGameStore.getState().formatTime(useGameStore.getState().timeState.currentTime),
          });

          newLogEntries.push(createLogEntry({
            type: 'roll',
            message: `Tiro per colpire: ${attackResult.roll} + ${attackResult.modifier} = ${attackResult.total} (vs AC ${target.ac})`
          }));

          if (attackResult.isHit) {
            const damageResult = rollDamage(player.weapon.damage || '1d2');
            const newHp = target.hp - damageResult.total;

            let updatedEnemy = { ...target, hp: newHp };
            updatedEnemy = updateEnemyHealthDescription(updatedEnemy);
            if (newHp <= 0) {
              updatedEnemy.status = 'dead';
            }

            const newEnemies = [...state.currentState.enemies];
            newEnemies[selectedTarget] = updatedEnemy;

            newLogEntries.push(createLogEntry({
              type: 'damage',
              message: `Colpito! ${player.weapon.name} infligge ${damageResult.total} danni a ${target.name}.`
            }));

            if (updatedEnemy.status === 'dead') {
              newLogEntries.push(createLogEntry({ type: 'info', message: `${target.name} è stato sconfitto.` }));
            }

            return {
              currentState: {
                ...state.currentState,
                enemies: newEnemies,
                log: [...currentLog, ...newLogEntries].slice(-20),
                phase: 'enemy-turn'
              }
            };
          } else {
            newLogEntries.push(createLogEntry({ type: 'info', message: `Mancato! Il tuo attacco non va a segno.` }));
            return {
              currentState: {
                ...state.currentState,
                log: [...currentLog, ...newLogEntries].slice(-20),
                phase: 'enemy-turn'
              }
            };
          }
        });
        break;

      case 'defend':
        get().addLogEntry({ type: 'info', message: 'Ti metti in posizione difensiva.' });
        // Logic to be implemented in a future task
        break;
      case 'flee':
        get().addLogEntry({ type: 'info', message: 'Tenti la fuga...' });
        // Logic to be implemented in a future task
        break;
      case 'inventory':
        get().addLogEntry({ type: 'info', message: 'Apri lo zaino...' });
        // Logic to be implemented in a future task
        break;
    }

    // After action, transition to enemy turn (simplified for now)
    set(state => ({
        currentState: state.currentState ? { ...state.currentState, phase: 'enemy-turn' } : null
    }));
  },
}));
