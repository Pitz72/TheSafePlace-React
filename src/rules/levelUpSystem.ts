// Level Up System - Logica avanzamento personaggio
// Sistema D&D-style per gestione esperienza e miglioramenti

import type { ICharacterSheet, ICharacterStats } from './types';
import type { ILevelUpOption } from '../interfaces/levelUp';

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
 * Applica una singola opzione di level up scelta dal giocatore e restituisce la nuova scheda personaggio.
 * Questa funzione è il cuore del nuovo sistema basato su GDD.
 * @param characterSheet La scheda personaggio attuale.
 * @param option L'opzione di miglioramento scelta.
 * @returns La scheda personaggio aggiornata.
 */
export function applyLevelUpOption(
  characterSheet: ICharacterSheet,
  option: ILevelUpOption
): ICharacterSheet {
  const newStats = { ...characterSheet.stats };
  let newMaxHP = characterSheet.maxHP;
  const newLevel = characterSheet.level + 1;

  // Applica gli effetti della scelta
  if (option.effects.stats) {
    Object.entries(option.effects.stats).forEach(([stat, value]) => {
      newStats[stat as keyof ICharacterStats] += value;
    });
  }
  if (option.effects.maxHP) {
    newMaxHP += option.effects.maxHP;
  }
  // Nota: La logica per le 'abilities' verrà gestita separatamente.

  // Calcola la nuova esperienza
  const remainingXP = characterSheet.experience.currentXP - characterSheet.experience.xpForNextLevel;
  const xpForNextLevelAfterThis = calculateXPForNextLevel(newLevel);

  const updatedCharacterSheet: ICharacterSheet = {
    ...characterSheet,
    level: newLevel,
    stats: newStats,
    maxHP: newMaxHP,
    // Aumenta gli HP attuali di un importo pari all'aumento degli HP massimi, senza superare il nuovo massimo.
    currentHP: Math.min(newMaxHP, characterSheet.currentHP + (option.effects.maxHP || 0)),
    experience: {
      currentXP: remainingXP,
      xpForNextLevel: xpForNextLevelAfterThis,
      canLevelUp: remainingXP >= xpForNextLevelAfterThis && newLevel < 20,
    },
  };

  return updatedCharacterSheet;
}