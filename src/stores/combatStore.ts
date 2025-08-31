import { create } from 'zustand';
import type { CombatState, CombatResult, CombatActionType, CombatLogEntry } from '../types/combat';
import { useGameStore } from './gameStore'; // To get player data
import { createEnemyCombatant, updateEnemyHealthDescription } from '../utils/enemyUtils';
import { rollToHit, rollDamage } from '../utils/combatCalculations';
import { combatEncounters } from '../data/combatEncounters';

// --- STORE INTERFACE ---

export interface CombatStoreState {
  isActive: boolean;
  currentState: CombatState | null;
  combatResult: CombatResult | null;
  selectedAction: CombatActionType | null;
  selectedTarget: number | null; // index of the enemy in the enemies array

  // --- ACTIONS ---

  initiateCombat: (encounterId: string) => void;
  endCombat: (result: Omit<CombatResult, 'xpGained' | 'loot'>) => void;
  clearCombatResults: () => void;

  selectAction: (action: CombatActionType) => void;
  selectTarget: (index: number) => void;

  addLogEntry: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void;

  executePlayerAction: () => Promise<void>;
  executeEnemyTurn: () => Promise<void>;
}

// --- STORE IMPLEMENTATION ---

export const useCombatStore = create<CombatStoreState>((set, get) => ({
  // --- INITIAL STATE ---
  isActive: false,
  currentState: null,
  combatResult: null,
  selectedAction: null,
  selectedTarget: null,

  // --- ACTIONS ---

  initiateCombat: (encounterId) => {
    const encounter = combatEncounters[encounterId];
    if (!encounter) {
      console.error(`Incontro con ID '${encounterId}' non trovato.`);
      return;
    }

    const { characterSheet, items } = useGameStore.getState();

    const playerCombatState = {
      hp: characterSheet.currentHP,
      maxHp: characterSheet.maxHP,
      ac: 10, // Placeholder
      baseAc: 10,
      weapon: items[characterSheet.equipment.weapon.itemId!] || { id: 'unarmed', name: 'Unarmed', type: 'Weapon', damage: '1d2', description: 'A punch' },
      armor: items[characterSheet.equipment.armor.itemId!] || undefined,
      temporaryBonuses: [],
      stats: characterSheet.stats,
    };

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
      selectedAction: 'attack',
      selectedTarget: 0,
    });

    get().addLogEntry({
        type: 'info',
        message: `Inizia il combattimento! ${encounter.description}`,
    });
  },

  endCombat: (result) => {
    const { currentState } = get();
    const gameStore = useGameStore.getState();
    if (!currentState) return;

    let finalResult: CombatResult = { type: result.type };

    if (result.type === 'victory') {
      let xpGained = 0;
      const loot: IInventorySlot[] = [];

      currentState.enemies.forEach(enemy => {
        xpGained += enemy.xpValue || 10;
        if (Math.random() < 0.5) {
          loot.push({ itemId: 'scrap_metal', quantity: 1 });
        }
      });

      gameStore.addExperience(xpGained);
      loot.forEach(item => gameStore.addItem(item.itemId, item.quantity));

      finalResult = { ...result, xpGained, loot };
    }

    console.log('Combattimento terminato:', finalResult);

    set({
      isActive: false,
      combatResult: finalResult,
    });
  },

  clearCombatResults: () => {
    set({
      currentState: null,
      combatResult: null,
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

    // After action, transition to enemy turn
    const newState = get().currentState;
    if (newState && newState.enemies.some(e => e.status === 'alive')) {
      set({ currentState: { ...newState, phase: 'enemy-turn' } });
      // Lancia il turno del nemico senza bloccare
      setTimeout(() => get().executeEnemyTurn(), 100);
    } else if (newState) {
      // Tutti i nemici sconfitti
      get().addLogEntry({ type: 'info', message: 'Vittoria! Tutti i nemici sono stati sconfitti.' });
      get().endCombat({ type: 'victory' });
    }
  },

  executeEnemyTurn: async () => {
    const { currentState, addLogEntry } = get();
    if (!currentState || currentState.phase !== 'enemy-turn') return;

    const { enemies, player } = currentState;
    let playerHp = player.hp;

    for (const enemy of enemies) {
      if (enemy.status === 'alive' && playerHp > 0) {
        // Pausa simulata per dare al giocatore il tempo di leggere
        await new Promise(resolve => setTimeout(resolve, 500));

        const attackResult = rollToHit(enemy, player.ac, 'melee'); // Assumiamo melee per ora
        addLogEntry({
          type: 'roll',
          message: `${enemy.name} attacca! Tiro per colpire: ${attackResult.roll} + ${attackResult.attackBonus} = ${attackResult.total} (vs AC ${player.ac})`
        });

        if (attackResult.isHit) {
          const damageResult = rollDamage(enemy.damage);
          playerHp -= damageResult.total;

          addLogEntry({
            type: 'damage',
            message: `Colpito! ${enemy.name} ti infligge ${damageResult.total} danni.`
          });

          // Controlla se il giocatore è stato sconfitto
          if (playerHp <= 0) {
            addLogEntry({ type: 'info', message: 'Sei stato sconfitto.' });
            get().endCombat({ type: 'defeat' });
            return; // Termina il turno dei nemici
          }
        } else {
          addLogEntry({ type: 'info', message: `${enemy.name} ti manca!` });
        }
      }
    }

    // Alla fine del turno di tutti i nemici, aggiorna lo stato del giocatore e torna al suo turno
    set(state => {
      if (!state.currentState) return {};
      return {
        currentState: {
          ...state.currentState,
          player: { ...state.currentState.player, hp: playerHp },
          phase: 'player-turn'
        }
      };
    });

    addLogEntry({ type: 'info', message: 'È il tuo turno.' });
  },
}));
