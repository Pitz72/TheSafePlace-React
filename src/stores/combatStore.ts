import { create } from 'zustand';
import type { CombatState, CombatResult, CombatActionType, CombatLogEntry } from '../types/combat';
import type { IInventorySlot } from '../interfaces/items';
import { useCharacterStore } from './character/characterStore';
import { useItemStore } from './item/itemStore';
import { useTimeStore } from './time/timeStore';
import { useGameStore } from './gameStore';
import { createEnemyCombatant, updateEnemyHealthDescription } from '../utils/enemyUtils';
import { rollToHit, rollDamage, calculatePlayerAC } from '../utils/combatCalculations';
import { combatEncounters } from '../data/combatEncounters';

// --- STORE INTERFACE ---
export interface CombatStoreState {
  isActive: boolean;
  currentState: CombatState | null;
  combatResult: CombatResult | null;
  selectedAction: CombatActionType | null;
  selectedTarget: number | null;
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
    if (!encounter) return;

    const characterStore = useCharacterStore.getState();
    const itemStore = useItemStore.getState();
    const { characterSheet } = characterStore;

    const playerAC = calculatePlayerAC(characterSheet.stats.agilita, characterSheet.equipment, itemStore.items);

    const playerCombatState = {
      hp: characterSheet.currentHP,
      maxHp: characterSheet.maxHP,
      ac: playerAC,
      baseAc: playerAC,
      weapon: itemStore.getItemById(characterSheet.equipment.weapon.itemId) || { id: 'unarmed', name: 'Unarmed', type: 'Weapon', damage: '1d2' },
      armor: itemStore.getItemById(characterSheet.equipment.armor.itemId) || undefined,
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

    set({ isActive: true, currentState: initialState, selectedAction: 'attack', selectedTarget: 0 });
    get().addLogEntry({ type: 'info', message: `Inizia il combattimento! ${encounter.description}` });
  },

  endCombat: (result) => {
    const { currentState } = get();
    if (!currentState) return;

    const gameStore = useGameStore.getState();
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

    const { currentHP } = useCharacterStore.getState().characterSheet;
    if (currentState.player.hp < currentHP) {
      gameStore.takeDamage(currentHP - currentState.player.hp);
    }

    set({ isActive: false, combatResult: finalResult, currentState: null });
  },

  clearCombatResults: () => set({ combatResult: null, selectedAction: null, selectedTarget: null }),

  selectAction: (action) => set({ selectedAction: action }),

  selectTarget: (index) => set(state => ({ selectedTarget: (state.currentState && index >= 0 && index < state.currentState.enemies.length) ? index : state.selectedTarget })),

  addLogEntry: (entry) => {
    set(state => {
      if (!state.currentState) return {};
      const newLogEntry: CombatLogEntry = { ...entry, id: `${Date.now()}-${Math.random()}`, timestamp: useTimeStore.getState().getTimeString() };
      return { currentState: { ...state.currentState, log: [...state.currentState.log, newLogEntry].slice(-20) } };
    });
  },

  executePlayerAction: async () => {
    const { currentState, selectedAction, selectedTarget, addLogEntry, endCombat, executeEnemyTurn } = get();
    if (!currentState || !selectedAction || selectedTarget === null || currentState.phase !== 'player-turn') return;

    const target = currentState.enemies[selectedTarget];
    if (target.status === 'dead') {
      addLogEntry({ type: 'error', message: 'Bersaglio non valido.' });
      return;
    }

    const weapon = currentState.player.weapon;
    if (!weapon) return;

    const attackResult = rollToHit(currentState.player.stats, target.ac, weapon);
    let newEnemies = [...currentState.enemies];
    let newLog = [...currentState.log];
    let newPhase = 'enemy-turn';

    newLog.push({ type: 'roll', message: `Tiro per colpire: ${attackResult.roll} + ${attackResult.modifier} = ${attackResult.total} (vs AC ${target.ac})`, id: `${Date.now()}-roll`, timestamp: useTimeStore.getState().getTimeString() });

    if (attackResult.isHit) {
      const damageResult = rollDamage(weapon.damage || '1d2');
      const newHp = target.hp - damageResult.total;
      let updatedEnemy = { ...target, hp: newHp };
      updatedEnemy = updateEnemyHealthDescription(updatedEnemy);
      if (newHp <= 0) updatedEnemy.status = 'dead';

      newEnemies[selectedTarget] = updatedEnemy;
      newLog.push({ type: 'damage', message: `Colpito! ${weapon.name} infligge ${damageResult.total} danni a ${target.name}.`, id: `${Date.now()}-dmg`, timestamp: useTimeStore.getState().getTimeString() });
      if (updatedEnemy.status === 'dead') {
        newLog.push({ type: 'info', message: `${target.name} è stato sconfitto.`, id: `${Date.now()}-dead`, timestamp: useTimeStore.getState().getTimeString() });
      }
    } else {
      newLog.push({ type: 'info', message: `Mancato! Il tuo attacco non va a segno.`, id: `${Date.now()}-miss`, timestamp: useTimeStore.getState().getTimeString() });
    }

    const allEnemiesDefeated = newEnemies.every(e => e.status === 'dead');
    if (allEnemiesDefeated) {
      newPhase = currentState.phase;
    }

    set({ currentState: { ...currentState, enemies: newEnemies, log: newLog.slice(-20), phase: newPhase } });

    if (allEnemiesDefeated) {
      addLogEntry({ type: 'info', message: 'Vittoria! Tutti i nemici sono stati sconfitti.' });
      setTimeout(() => endCombat({ type: 'victory' }), 500);
    } else {
      setTimeout(() => executeEnemyTurn(), 1000);
    }
  },

  executeEnemyTurn: async () => {
    const { currentState, addLogEntry, endCombat } = get();
    if (!currentState || currentState.phase !== 'enemy-turn') return;

    let playerHp = currentState.player.hp;
    let newLog = [...currentState.log];

    for (const enemy of currentState.enemies) {
      if (enemy.status === 'alive' && playerHp > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + enemy.attackBonus;
        const isHit = total >= currentState.player.ac;

        newLog.push({ type: 'roll', message: `${enemy.name} attacca! Tiro: ${roll} + ${enemy.attackBonus} = ${total} (vs AC ${currentState.player.ac})`, id: `${Date.now()}-eroll`, timestamp: useTimeStore.getState().getTimeString() });

        if (isHit) {
          const damageResult = rollDamage(enemy.damage);
          playerHp -= damageResult.total;
          newLog.push({ type: 'damage', message: `Colpito! ${enemy.name} ti infligge ${damageResult.total} danni.`, id: `${Date.now()}-edmg`, timestamp: useTimeStore.getState().getTimeString() });

          if (playerHp <= 0) {
            newLog.push({ type: 'info', message: 'Sei stato sconfitto.', id: `${Date.now()}-pdead`, timestamp: useTimeStore.getState().getTimeString() });
            set({ currentState: { ...currentState, player: { ...currentState.player, hp: 0 }, log: newLog.slice(-20) }});
            setTimeout(() => endCombat({ type: 'defeat' }), 500);
            return;
          }
        } else {
          newLog.push({ type: 'info', message: `${enemy.name} ti manca!`, id: `${Date.now()}-emiss`, timestamp: useTimeStore.getState().getTimeString() });
        }
      }
    }

    set({ currentState: { ...currentState, player: { ...currentState.player, hp: playerHp }, log: newLog.slice(-20), phase: 'player-turn' } });
    addLogEntry({ type: 'info', message: 'È il tuo turno.' });
  },
}));