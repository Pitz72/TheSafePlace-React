// Level Up System - Interfacce per avanzamento personaggio
// Sistema D&D-style per miglioramento statistiche e abilità

import type { ICharacterStats } from '../rules/types';

/**
 * Opzione di miglioramento disponibile al level up
 */
export interface ILevelUpOption {
  id: string;
  type: 'stat' | 'ability' | 'hp';
  name: string;
  description: string;
  cost: number;
  requirements?: {
    level?: number;
    stats?: Partial<ICharacterStats>;
  };
  effects: {
    stats?: Partial<ICharacterStats>;
    maxHP?: number;
    abilities?: string[];
  };
}

/**
 * Stato del level up del personaggio
 */
export interface ILevelUpState {
  availablePoints: number;
  selectedOptions: ILevelUpOption[];
  previewStats: ICharacterStats;
  previewMaxHP: number;
  canLevelUp: boolean;
}

/**
 * Risultato dell'applicazione del level up
 */
export interface ILevelUpResult {
  success: boolean;
  message: string;
  newLevel: number;
  statsGained: Partial<ICharacterStats>;
  hpGained: number;
  abilitiesGained: string[];
}

/**
 * Configurazione esperienza e level up
 */
export interface IExperienceConfig {
  baseXPForNextLevel: number;
  xpMultiplier: number;
  maxLevel: number;
  pointsPerLevel: number;
}

/**
 * Sistema esperienza del personaggio
 */
export interface IExperience {
  currentXP: number;
  xpForNextLevel: number;
  totalXPEarned: number;
  canLevelUp: boolean;
}