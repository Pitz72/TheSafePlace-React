// src/types/combat.ts

import type { ICharacterStats } from '../rules/types';
import type { IItem, IInventorySlot } from '../interfaces/items';

// --- DATA MODELS ---

export interface CombatEncounter {
  id: string;
  description: string;
  enemies: EnemyTemplate[];
  environment: string;
  escapeModifier: number;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  hp: number;
  ac: number;
  damage: string; // e.g., "1d6"
  attackBonus: number;
  xpValue: number;
}

// --- COMBAT STATE ---

export interface CombatState {
  phase: 'player-turn' | 'enemy-turn' | 'action-selection' | 'target-selection' | 'action-execution' | 'combat-end';
  currentTurn: number;
  player: PlayerCombatState;
  enemies: EnemyCombatState[];
  log: CombatLogEntry[];
  encounter: CombatEncounter;
}

export interface PlayerCombatState {
  hp: number;
  maxHp: number;
  ac: number;
  baseAc: number;
  weapon: IItem;
  armor?: IItem;
  temporaryBonuses: TemporaryBonus[];
  stats: ICharacterStats;
}

export interface EnemyCombatState {
  id: string; // Unique instance ID for this combat
  templateId: string; // ID from enemies.json
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  damage: string;
  attackBonus: number;
  status: 'alive' | 'dead';
  healthDescription: 'Illeso' | 'Ferito' | 'Gravemente Ferito' | 'Morente';
}

export interface TemporaryBonus {
  type: 'ac';
  value: number;
  duration: number; // in turns
}

// --- COMBAT ACTIONS & LOGGING ---

export type CombatActionType = 'attack' | 'inventory' | 'defend' | 'flee';

export interface CombatAction {
  type: CombatActionType;
  actor: 'player' | string; // player or enemyId
  target?: number; // index in enemies array
  item?: IInventorySlot;
  result: ActionResult;
  rolls: DiceRoll[];
}

export interface ActionResult {
  success: boolean;
  damage?: number;
  effect?: string;
  message: string;
}

export interface DiceRoll {
  type: string; // "d20", "1d6", etc.
  result: number;
  modifier: number;
  total: number;
  target?: number; // e.g., target AC
}

export interface CombatLogEntry {
  id: string;
  type: 'action' | 'info' | 'damage' | 'healing' | 'roll' | 'error';
  message: string;
  timestamp: string; // Formatted time
}

// --- COMBAT RESULTS ---

export type CombatResultType = 'victory' | 'defeat' | 'fled';

export interface CombatResult {
  type: CombatResultType;
  xpGained?: number;
  loot?: IInventorySlot[];
}
