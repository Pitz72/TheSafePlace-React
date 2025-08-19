// Level Up System - Logica avanzamento personaggio
// Sistema D&D-style per gestione esperienza e miglioramenti

import type { ICharacterSheet, ICharacterStats } from './types';
import type { ILevelUpOption, ILevelUpState, ILevelUpResult, IExperience } from '../interfaces/levelUp';

/**
 * Configurazione esperienza
 */
export const EXPERIENCE_CONFIG = {
  baseXPForNextLevel: 100,
  xpMultiplier: 1.5,
  maxLevel: 20,
  pointsPerLevel: 2
};

/**
 * Calcola XP necessari per il prossimo livello
 */
export function calculateXPForNextLevel(currentLevel: number): number {
  return Math.floor(EXPERIENCE_CONFIG.baseXPForNextLevel * Math.pow(EXPERIENCE_CONFIG.xpMultiplier, currentLevel - 1));
}

/**
 * Calcola XP totali necessari per raggiungere un livello
 */
export function calculateTotalXPForLevel(targetLevel: number): number {
  let totalXP = 0;
  for (let level = 1; level < targetLevel; level++) {
    totalXP += calculateXPForNextLevel(level);
  }
  return totalXP;
}

/**
 * Verifica se il personaggio può salire di livello
 */
export function canLevelUp(characterSheet: ICharacterSheet): boolean {
  return characterSheet.experience.currentXP >= characterSheet.experience.xpForNextLevel &&
         characterSheet.level < EXPERIENCE_CONFIG.maxLevel;
}

/**
 * Aggiunge esperienza al personaggio
 */
export function addExperience(characterSheet: ICharacterSheet, xpGained: number): ICharacterSheet {
  const newXP = characterSheet.experience.currentXP + xpGained;
  const xpForNext = characterSheet.experience.xpForNextLevel;
  
  return {
    ...characterSheet,
    experience: {
      currentXP: newXP,
      xpForNextLevel: xpForNext,
      canLevelUp: newXP >= xpForNext && characterSheet.level < EXPERIENCE_CONFIG.maxLevel
    }
  };
}

/**
 * Opzioni di miglioramento disponibili
 */
export const LEVEL_UP_OPTIONS: ILevelUpOption[] = [
  // Miglioramenti statistiche
  {
    id: 'stat_potenza',
    type: 'stat',
    name: 'Potenziare Forza',
    description: 'Aumenta la Potenza di 1 punto. Migliora danni corpo a corpo e capacità di carico.',
    cost: 1,
    effects: {
      stats: { potenza: 1 }
    }
  },
  {
    id: 'stat_agilita',
    type: 'stat',
    name: 'Potenziare Agilità',
    description: 'Aumenta l\'Agilità di 1 punto. Migliora AC e abilità di movimento.',
    cost: 1,
    effects: {
      stats: { agilita: 1 }
    }
  },
  {
    id: 'stat_vigore',
    type: 'stat',
    name: 'Potenziare Vigore',
    description: 'Aumenta il Vigore di 1 punto. Migliora HP massimi e resistenza.',
    cost: 1,
    effects: {
      stats: { vigore: 1 },
      maxHP: 3
    }
  },
  {
    id: 'stat_percezione',
    type: 'stat',
    name: 'Potenziare Percezione',
    description: 'Aumenta la Percezione di 1 punto. Migliora awareness e skill check.',
    cost: 1,
    effects: {
      stats: { percezione: 1 }
    }
  },
  {
    id: 'stat_adattamento',
    type: 'stat',
    name: 'Potenziare Adattamento',
    description: 'Aumenta l\'Adattamento di 1 punto. Migliora problem solving e crafting.',
    cost: 1,
    effects: {
      stats: { adattamento: 1 }
    }
  },
  {
    id: 'stat_carisma',
    type: 'stat',
    name: 'Potenziare Carisma',
    description: 'Aumenta il Carisma di 1 punto. Migliora interazioni sociali.',
    cost: 1,
    effects: {
      stats: { carisma: 1 }
    }
  },
  
  // Miglioramenti HP
  {
    id: 'hp_boost',
    type: 'hp',
    name: 'Resistenza Migliorata',
    description: 'Aumenta gli HP massimi di 5 punti senza modificare le statistiche.',
    cost: 1,
    effects: {
      maxHP: 5
    }
  },
  
  // Miglioramenti combinati (costano di più)
  {
    id: 'warrior_training',
    type: 'ability',
    name: 'Addestramento Guerriero',
    description: 'Aumenta Potenza e Vigore di 1 punto ciascuno. Bonus combattimento.',
    cost: 2,
    requirements: {
      level: 3
    },
    effects: {
      stats: { potenza: 1, vigore: 1 },
      maxHP: 2,
      abilities: ['Combattimento Migliorato']
    }
  },
  {
    id: 'scout_training',
    type: 'ability',
    name: 'Addestramento Esploratore',
    description: 'Aumenta Agilità e Percezione di 1 punto ciascuno. Bonus esplorazione.',
    cost: 2,
    requirements: {
      level: 3
    },
    effects: {
      stats: { agilita: 1, percezione: 1 },
      abilities: ['Esplorazione Migliorata']
    }
  },
  {
    id: 'survivor_training',
    type: 'ability',
    name: 'Addestramento Sopravvivenza',
    description: 'Aumenta Vigore e Adattamento di 1 punto ciascuno. Bonus sopravvivenza.',
    cost: 2,
    requirements: {
      level: 5
    },
    effects: {
      stats: { vigore: 1, adattamento: 1 },
      maxHP: 3,
      abilities: ['Sopravvivenza Migliorata']
    }
  }
];

/**
 * Ottiene le opzioni di level up disponibili per un personaggio
 */
export function getAvailableLevelUpOptions(characterSheet: ICharacterSheet): ILevelUpOption[] {
  return LEVEL_UP_OPTIONS.filter(option => {
    // Verifica requisiti di livello
    if (option.requirements?.level && characterSheet.level < option.requirements.level) {
      return false;
    }
    
    // Verifica requisiti di statistiche
    if (option.requirements?.stats) {
      for (const [stat, minValue] of Object.entries(option.requirements.stats)) {
        if (characterSheet.stats[stat as keyof ICharacterStats] < minValue) {
          return false;
        }
      }
    }
    
    return true;
  });
}

/**
 * Calcola i punti disponibili per il level up
 */
export function getAvailablePoints(characterSheet: ICharacterSheet): number {
  return EXPERIENCE_CONFIG.pointsPerLevel;
}

/**
 * Crea lo stato di preview per il level up
 */
export function createLevelUpPreview(
  characterSheet: ICharacterSheet, 
  selectedOptions: ILevelUpOption[]
): ILevelUpState {
  const availablePoints = getAvailablePoints(characterSheet);
  const usedPoints = selectedOptions.reduce((total, option) => total + option.cost, 0);
  
  // Calcola statistiche preview
  const previewStats = { ...characterSheet.stats };
  let previewMaxHP = characterSheet.maxHP;
  
  selectedOptions.forEach(option => {
    if (option.effects.stats) {
      Object.entries(option.effects.stats).forEach(([stat, value]) => {
        previewStats[stat as keyof ICharacterStats] += value;
      });
    }
    if (option.effects.maxHP) {
      previewMaxHP += option.effects.maxHP;
    }
  });
  
  return {
    availablePoints: availablePoints - usedPoints,
    selectedOptions,
    previewStats,
    previewMaxHP,
    canLevelUp: usedPoints > 0 && usedPoints <= availablePoints
  };
}

/**
 * Applica il level up al personaggio
 */
export function applyLevelUp(
  characterSheet: ICharacterSheet, 
  selectedOptions: ILevelUpOption[]
): ILevelUpResult {
  const availablePoints = getAvailablePoints(characterSheet);
  const usedPoints = selectedOptions.reduce((total, option) => total + option.cost, 0);
  
  if (usedPoints > availablePoints) {
    return {
      success: false,
      message: 'Punti insufficienti per questi miglioramenti.',
      newLevel: characterSheet.level,
      statsGained: {},
      hpGained: 0,
      abilitiesGained: []
    };
  }
  
  if (usedPoints === 0) {
    return {
      success: false,
      message: 'Seleziona almeno un miglioramento.',
      newLevel: characterSheet.level,
      statsGained: {},
      hpGained: 0,
      abilitiesGained: []
    };
  }
  
  // Applica i miglioramenti
  const newStats = { ...characterSheet.stats };
  let hpGained = 0;
  const abilitiesGained: string[] = [];
  const statsGained: Partial<ICharacterStats> = {};
  
  selectedOptions.forEach(option => {
    if (option.effects.stats) {
      Object.entries(option.effects.stats).forEach(([stat, value]) => {
        newStats[stat as keyof ICharacterStats] += value;
        statsGained[stat as keyof ICharacterStats] = (statsGained[stat as keyof ICharacterStats] || 0) + value;
      });
    }
    if (option.effects.maxHP) {
      hpGained += option.effects.maxHP;
    }
    if (option.effects.abilities) {
      abilitiesGained.push(...option.effects.abilities);
    }
  });
  
  const newLevel = characterSheet.level + 1;
  const newMaxHP = characterSheet.maxHP + hpGained;
  const newCurrentHP = Math.min(characterSheet.currentHP + hpGained, newMaxHP);
  
  // Aggiorna esperienza per il prossimo livello
  const newXPForNext = calculateXPForNextLevel(newLevel);
  
  return {
    success: true,
    message: `Congratulazioni! Sei salito al livello ${newLevel}!`,
    newLevel,
    statsGained,
    hpGained,
    abilitiesGained
  };
}

/**
 * Aggiorna il character sheet dopo il level up
 */
export function updateCharacterSheetAfterLevelUp(
  characterSheet: ICharacterSheet,
  result: ILevelUpResult
): ICharacterSheet {
  if (!result.success) return characterSheet;
  
  const newStats = { ...characterSheet.stats };
  Object.entries(result.statsGained).forEach(([stat, value]) => {
    newStats[stat as keyof ICharacterStats] += value;
  });
  
  const newMaxHP = characterSheet.maxHP + result.hpGained;
  const newCurrentHP = Math.min(characterSheet.currentHP + result.hpGained, newMaxHP);
  
  return {
    ...characterSheet,
    level: result.newLevel,
    stats: newStats,
    maxHP: newMaxHP,
    currentHP: newCurrentHP,
    experience: {
      currentXP: 0, // Reset XP dopo level up
      xpForNextLevel: calculateXPForNextLevel(result.newLevel),
      canLevelUp: false
    }
  };
}