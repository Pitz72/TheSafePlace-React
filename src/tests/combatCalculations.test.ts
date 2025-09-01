import {
  getStatModifier,
  rollDice,
  rollDamage,
  calculatePlayerAC,
  rollToHit,
  rollEscape,
} from '../utils/combatCalculations';
import type { ICharacterStats, IEquipment } from '../rules/types';
import type { IItem } from '../interfaces/items';

describe('Combat Calculations', () => {
  describe('getStatModifier', () => {
    it('should return correct modifiers for various ability scores', () => {
      expect(getStatModifier(3)).toBe(-4);
      expect(getStatModifier(10)).toBe(0);
      expect(getStatModifier(11)).toBe(0);
      expect(getStatModifier(14)).toBe(2);
      expect(getStatModifier(18)).toBe(4);
    });
  });

  describe('rollDice', () => {
    it('should return a number within the specified range', () => {
      const sides = 6;
      for (let i = 0; i < 100; i++) {
        const result = rollDice(sides);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(sides);
      }
    });
  });

  describe('rollDamage', () => {
    it('should roll a single die and return a total within range', () => {
      for (let i = 0; i < 50; i++) {
        const result = rollDamage('1d6');
        expect(result.total).toBeGreaterThanOrEqual(1);
        expect(result.total).toBeLessThanOrEqual(6);
        expect(result.rolls.length).toBe(1);
      }
    });

    it('should roll multiple dice and return a total within range', () => {
      for (let i = 0; i < 50; i++) {
        const result = rollDamage('2d4');
        expect(result.total).toBeGreaterThanOrEqual(2);
        expect(result.total).toBeLessThanOrEqual(8);
        expect(result.rolls.length).toBe(2);
      }
    });

    it('should handle a bonus and return a total within range', () => {
      for (let i = 0; i < 50; i++) {
        const result = rollDamage('1d8+2');
        expect(result.total).toBeGreaterThanOrEqual(3); // 1 (roll) + 2 (bonus)
        expect(result.total).toBeLessThanOrEqual(10); // 8 (roll) + 2 (bonus)
        expect(result.rolls.length).toBe(1);
      }
    });
  });

  describe('calculatePlayerAC', () => {
    const mockItems: Record<string, IItem> = {
      leatherArmor: { id: 'leatherArmor', name: 'Leather Armor', type: 'Armor', armor: 2, description: '' },
    };
    const mockEquipment: IEquipment = {
      weapon: { itemId: null, slotType: 'weapon' },
      armor: { itemId: 'leatherArmor', slotType: 'armor' },
      accessory: { itemId: null, slotType: 'accessory' },
    };

    it('should calculate AC with no armor', () => {
      const emptyEquipment: IEquipment = { ...mockEquipment, armor: { itemId: null, slotType: 'armor' } };
      // 10 (base) + 2 (modifier for 14 agility) = 12
      expect(calculatePlayerAC(14, emptyEquipment, mockItems)).toBe(12);
    });

    it('should calculate AC with equipped armor', () => {
      // 10 (base) + 2 (modifier for 14 agility) + 2 (armor bonus) = 14
      expect(calculatePlayerAC(14, mockEquipment, mockItems)).toBe(14);
    });

    it('should handle missing item in DB gracefully', () => {
        const brokenEquipment: IEquipment = { ...mockEquipment, armor: { itemId: 'nonexistent', slotType: 'armor' } };
        expect(calculatePlayerAC(14, brokenEquipment, mockItems)).toBe(12); // 10 + 2 (DEX), no armor bonus
    });
  });

  describe('rollToHit', () => {
    const mockStats: ICharacterStats = { potenza: 16, agilita: 12, vigore: 14, percezione: 10, adattamento: 8, carisma: 13 };
    const mockWeapon: IItem = { id: 'sword', name: 'Sword', type: 'Weapon', damage: '1d8', description: '' };
    const rangedWeapon: IItem = { id: 'bow', name: 'Bow', type: 'Ranged', damage: '1d6', description: '' };

    it('should have its total based on roll and modifier', () => {
      const result = rollToHit(mockStats, 15, mockWeapon);
      const expectedTotal = result.roll + result.modifier;
      expect(result.total).toBe(expectedTotal);
      expect(result.modifier).toBe(getStatModifier(mockStats.potenza));
    });

    it('should use agility modifier for ranged weapons', () => {
        const result = rollToHit(mockStats, 15, rangedWeapon);
        expect(result.modifier).toBe(getStatModifier(mockStats.agilita));
    });
  });

  describe('rollEscape', () => {
    it('should have its playerRoll based on d20 and agility', () => {
      const agility = 14; // +2 mod
      for (let i = 0; i < 50; i++) {
        const result = rollEscape(agility, 5);
        expect(result.playerRoll).toBeGreaterThanOrEqual(1 + 2);
        expect(result.playerRoll).toBeLessThanOrEqual(20 + 2);
      }
    });

    it('should have its enemyRoll based on d6 and pursuit bonus', () => {
        const pursuitBonus = 5;
        for (let i = 0; i < 50; i++) {
          const result = rollEscape(10, pursuitBonus);
          expect(result.enemyRoll).toBeGreaterThanOrEqual(1 + pursuitBonus);
          expect(result.enemyRoll).toBeLessThanOrEqual(6 + pursuitBonus);
        }
    });
  });
});
