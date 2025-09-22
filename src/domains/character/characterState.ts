/**
 * Character Domain - Stato del personaggio giocatore
 * Gestisce statistiche D&D, equipaggiamento, progressione
 */

export interface AbilityScores {
  str: number; // Strength
  dex: number; // Dexterity
  con: number; // Constitution
  int: number; // Intelligence
  wis: number; // Wisdom
  cha: number; // Charisma
}

export interface CharacterStats {
  level: number;
  experience: number;
  experienceToNext: number;
  hitPoints: {
    current: number;
    max: number;
  };
  armorClass: number;
  proficiencyBonus: number;
  speed: number; // feet per round
}

export interface CharacterBackground {
  name: string;
  age: number;
  background: string;
  alignment: string;
  personality: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

export interface CharacterState {
  /** Nome del personaggio */
  name: string;
  /** Punteggi caratteristica base */
  baseAbilityScores: AbilityScores;
  /** Modificatori di abilità (calcolati) */
  abilityModifiers: AbilityScores;
  /** Statistiche di combattimento */
  stats: CharacterStats;
  /** Background e storia */
  background: CharacterBackground;
  /** Stati emotivi */
  emotionalState: {
    happiness: number; // 0-100
    fear: number; // 0-100
    anger: number; // 0-100
    hope: number; // 0-100
  };
  /** Inventario equipaggiato (riferimenti agli item IDs) */
  equippedItems: {
    weapon?: string;
    armor?: string;
    shield?: string;
    accessory1?: string;
    accessory2?: string;
  };
}

export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateAbilityModifiers(scores: AbilityScores): AbilityScores {
  return {
    str: calculateAbilityModifier(scores.str),
    dex: calculateAbilityModifier(scores.dex),
    con: calculateAbilityModifier(scores.con),
    int: calculateAbilityModifier(scores.int),
    wis: calculateAbilityModifier(scores.wis),
    cha: calculateAbilityModifier(scores.cha)
  };
}

export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function calculateExperienceForLevel(level: number): number {
  // D&D 5e experience table (simplified)
  const experienceTable = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];
  return experienceTable[level - 1] || 355000;
}

export function calculateLevelFromExperience(experience: number): number {
  let level = 1;
  while (calculateExperienceForLevel(level + 1) <= experience && level < 20) {
    level++;
  }
  return level;
}

export function createDefaultCharacter(): CharacterState {
  const baseScores: AbilityScores = {
    str: 14,
    dex: 14,
    con: 14,
    int: 12,
    wis: 12,
    cha: 10
  };

  const modifiers = calculateAbilityModifiers(baseScores);

  return {
    name: 'Sopravvissuto',
    baseAbilityScores: baseScores,
    abilityModifiers: modifiers,
    stats: {
      level: 1,
      experience: 0,
      experienceToNext: calculateExperienceForLevel(2),
      hitPoints: {
        current: 12, // 10 + CON modifier
        max: 12
      },
      armorClass: 10 + modifiers.dex, // base AC + DEX
      proficiencyBonus: calculateProficiencyBonus(1),
      speed: 30 // feet per round
    },
    background: {
      name: 'Sopravvissuto',
      age: 25,
      background: 'Pre-apocalisse',
      alignment: 'Neutrale',
      personality: ['Determinato', 'Cauto'],
      ideals: ['Sopravvivere a ogni costo'],
      bonds: ['Ricordi della famiglia perduta'],
      flaws: ['Diffida degli sconosciuti']
    },
    emotionalState: {
      happiness: 20,
      fear: 60,
      anger: 30,
      hope: 40
    },
    equippedItems: {}
  };
}

export function updateCharacterStats(character: CharacterState): CharacterState {
  const modifiers = calculateAbilityModifiers(character.baseAbilityScores);
  const level = calculateLevelFromExperience(character.stats.experience);
  const proficiencyBonus = calculateProficiencyBonus(level);

  // Calcola HP max (molto semplificato)
  const conModifier = modifiers.con;
  const hpPerLevel = 6 + conModifier; // semplificato per fighter/rogue
  const maxHp = 10 + conModifier + (level - 1) * hpPerLevel;

  return {
    ...character,
    abilityModifiers: modifiers,
    stats: {
      ...character.stats,
      level,
      experienceToNext: calculateExperienceForLevel(level + 1) - character.stats.experience,
      hitPoints: {
        ...character.stats.hitPoints,
        max: maxHp
      },
      armorClass: 10 + modifiers.dex, // semplificato, non considera armor
      proficiencyBonus,
      speed: 30
    }
  };
}

export function gainExperience(character: CharacterState, amount: number): CharacterState {
  const newExperience = character.stats.experience + amount;
  const updatedCharacter = {
    ...character,
    stats: {
      ...character.stats,
      experience: newExperience
    }
  };

  return updateCharacterStats(updatedCharacter);
}

export function takeDamage(character: CharacterState, damage: number): CharacterState {
  const newHp = Math.max(0, character.stats.hitPoints.current - damage);
  return {
    ...character,
    stats: {
      ...character.stats,
      hitPoints: {
        ...character.stats.hitPoints,
        current: newHp
      }
    }
  };
}

export function heal(character: CharacterState, amount: number): CharacterState {
  const newHp = Math.min(
    character.stats.hitPoints.max,
    character.stats.hitPoints.current + amount
  );
  return {
    ...character,
    stats: {
      ...character.stats,
      hitPoints: {
        ...character.stats.hitPoints,
        current: newHp
      }
    }
  };
}