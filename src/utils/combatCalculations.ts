import type { ICharacterStats, IEquipment } from '../rules/types';
import type { IItem } from '../interfaces/items';

/**
 * Calculates the modifier for a given ability score (e.g., 14 -> +2).
 * @param abilityScore The ability score (3-18).
 * @returns The modifier.
 */
export const getStatModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Rolls a single die of a given size.
 * @param sides The number of sides on the die.
 * @returns A random number between 1 and sides.
 */
export const rollDice = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Parses a dice string (e.g., "1d6", "2d4+1") and rolls the dice.
 * @param diceString The string representing the dice to roll.
 * @returns The total result of the roll.
 */
export const rollDamage = (diceString: string): { rolls: number[], total: number } => {
    const rolls: number[] = [];
    let total = 0;

    const mainPart = diceString.split('+');
    const dicePart = mainPart[0];
    const bonus = mainPart.length > 1 ? parseInt(mainPart[1], 10) : 0;

    const [count, sides] = dicePart.split('d').map(d => parseInt(d, 10));

    for (let i = 0; i < count; i++) {
        const roll = rollDice(sides);
        rolls.push(roll);
        total += roll;
    }

    total += bonus;

    return { rolls, total };
};


/**
 * Determines if a weapon is ranged based on its characteristics.
 * @param weapon The weapon to check.
 * @returns True if the weapon is ranged, false if melee.
 */
export const isWeaponRanged = (weapon: IItem): boolean => {
  // Check weapon name for ranged indicators
  const rangedKeywords = ['pistola', 'fucile', 'balestra', 'fionda', 'arco', 'rifle', 'crossbow', 'sling', 'bow', 'gun'];
  const weaponName = weapon.name?.toLowerCase() || '';
  const weaponId = weapon.id?.toLowerCase() || '';
  
  // Check if weapon name or ID contains ranged keywords
  const hasRangedKeyword = rangedKeywords.some(keyword => 
    weaponName.includes(keyword) || weaponId.includes(keyword)
  );
  
  // Additional check for weapon description if available
  const weaponDescription = weapon.description?.toLowerCase() || '';
  const hasRangedDescription = rangedKeywords.some(keyword => 
    weaponDescription.includes(keyword)
  );
  
  return hasRangedKeyword || hasRangedDescription;
};

// --- Combat Calculation Interfaces ---

export interface AttackResult {
  roll: number;
  modifier: number;
  total: number;
  targetAC: number;
  isHit: boolean;
}

export interface EscapeResult {
  playerRoll: number;
  enemyRoll: number;
  success: boolean;
}


// --- Core Combat Functions ---

/**
 * Calculates the result of an attack roll.
 * @param attackerStats The stats of the attacker.
 * @param targetAC The Armor Class of the target.
 * @param weapon The weapon used for the attack.
 * @returns An object with the details of the attack roll.
 */
export const rollToHit = (
  attackerStats: ICharacterStats,
  targetAC: number,
  weapon: IItem,
): AttackResult => {
  const roll = rollDice(20);

  // Differentiate between melee (potenza) and ranged (agilita) attacks
  // Determine weapon type based on weapon characteristics and name patterns
  const isRangedWeapon = isWeaponRanged(weapon);
  let modifier = isRangedWeapon 
    ? getStatModifier(attackerStats.agilita)
    : getStatModifier(attackerStats.potenza);

  const total = roll + modifier;

  return {
    roll,
    modifier,
    total,
    targetAC,
    isHit: total >= targetAC,
  };
};

/**
 * Calculates the player's Armor Class.
 * @param agility The player's agility score.
 * @param equipment The player's equipped items.
 * @param itemsDb A reference to the item database to look up item details.
 * @returns The player's total Armor Class.
 */
export const calculatePlayerAC = (
  agility: number,
  equipment: IEquipment,
  itemsDb: Record<string, IItem>
): number => {
  const agilityModifier = getStatModifier(agility);
  let armorBonus = 0;

  if (equipment.armor && equipment.armor.itemId) {
    const armorItem = itemsDb[equipment.armor.itemId];
    if (armorItem && armorItem.armor) {
      armorBonus = armorItem.armor;
    }
  }

  return 10 + agilityModifier + armorBonus;
};

/**
 * Simulates an escape attempt.
 * @param playerAgility The player's agility score.
 * @param enemyPursuitBonus A bonus representing the enemies' ability to pursue.
 * @returns An object with the details of the escape roll.
 */
export const rollEscape = (
  playerAgility: number,
  enemyPursuitBonus: number,
): EscapeResult => {
  const playerRoll = rollDice(20) + getStatModifier(playerAgility);
  const enemyRoll = enemyPursuitBonus + rollDice(6);

  return {
    playerRoll,
    enemyRoll,
    success: playerRoll > enemyRoll,
  };
};
