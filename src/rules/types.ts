// Rules System Types - D&D Style Character System
// Parte del progetto "Rules are Rules" v0.2.0

import type { IInventorySlot } from '../interfaces/items';

/**
 * Statistiche primarie del personaggio "Ultimo"
 * Basate su sistema D&D con range 3-18
 */
export interface ICharacterStats {
  potenza: number;      // Forza fisica (STR)
  agilita: number;      // Destrezza e velocità (DEX)
  vigore: number;       // Costituzione e resistenza (CON)
  percezione: number;   // Saggezza e intuizione (WIS)
  adattamento: number;  // Intelligenza e problem solving (INT)
  carisma: number;      // Presenza e leadership (CHA)
}

/**
 * Slot di equipaggiamento
 */
export interface IEquipmentSlot {
  itemId: string | null;
  slotType: 'weapon' | 'armor' | 'accessory';
}

/**
 * Equipaggiamento del personaggio
 */
export interface IEquipment {
  weapon: IEquipmentSlot;
  armor: IEquipmentSlot;
  accessory: IEquipmentSlot;
}

/**
 * Scheda completa del personaggio
 * Esportato esplicitamente per compatibilità Rollup
 */
export interface ICharacterSheet {
  name: string;
  stats: ICharacterStats;
  level: number;
  maxHP: number;
  currentHP: number;
  baseAC: number;
  carryCapacity: number;
  inventory: (IInventorySlot | null)[];
  equipment: IEquipment;
  status: ICharacterStatus;
  experience: {
    currentXP: number;
    xpForNextLevel: number;
    canLevelUp: boolean;
  };
  knownRecipes: string[]; // ID delle ricette conosciute dal giocatore
}

/**
 * Risultato di un skill check
 */
export interface ISkillCheckResult {
  success: boolean;
  roll: number;
  modifier: number;
  total: number;
  difficulty: number;
}

/**
 * Difficoltà standard per skill check
 */
export enum SkillDifficulty {
  FACILE = 10,
  MEDIO = 15,
  DIFFICILE = 20
}

/**
 * Tipi di abilità per skill check
 */
export type AbilityType = keyof ICharacterStats;

/**
 * Risultato del danno (per fiumi, combattimenti futuri, etc.)
 */
export interface IDamageResult {
  damage: number;
  type: string;
  description: string;
}

/**
 * Stati possibili del personaggio
 */
export enum CharacterStatus {
  NORMAL = 'normal',
  SICK = 'sick',
  WOUNDED = 'wounded',
  POISONED = 'poisoned',
  STARVING = 'starving',
  DEHYDRATED = 'dehydrated',
  DEAD = 'dead'
}

/**
 * Sistema di stati del personaggio
 */
export interface ICharacterStatus {
  currentStatus: CharacterStatus;
  statusEffects: CharacterStatus[];
  statusDuration: Record<CharacterStatus, number>; // Durata in minuti
}