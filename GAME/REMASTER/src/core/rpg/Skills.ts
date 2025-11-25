import type { Attributes } from './Stats';

export const SkillType = {
    SURVIVAL: 'survival',
    COMBAT: 'combat',
    STEALTH: 'stealth',
    DIPLOMACY: 'diplomacy',
    MECHANICS: 'mechanics',
    MEDICINE: 'medicine',
    OCCULT: 'occult'
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

export interface SkillCheckResult {
    success: boolean;
    roll: number;
    total: number;
    isCriticalSuccess: boolean;
    isCriticalFailure: boolean;
}

export class SkillSystem {

    static rollD20(): number {
        return Math.floor(Math.random() * 20) + 1;
    }

    static calculateModifier(attributeValue: number): number {
        return Math.floor((attributeValue - 10) / 2);
    }

    static performCheck(
        skill: SkillType,
        difficultyClass: number,
        attributes: Attributes,
        bonus: number = 0
    ): SkillCheckResult {
        const roll = this.rollD20();

        // Map skill to attribute (simplified logic for now)
        let attributeValue = 10;
        switch (skill) {
            case SkillType.COMBAT:
            case SkillType.SURVIVAL:
                attributeValue = attributes.strength;
                break;
            case SkillType.STEALTH:
            case SkillType.MECHANICS:
                attributeValue = attributes.dexterity;
                break;
            case SkillType.MEDICINE:
            case SkillType.OCCULT:
                attributeValue = attributes.intelligence;
                break;
            case SkillType.DIPLOMACY:
                attributeValue = attributes.charisma;
                break;
        }

        const modifier = this.calculateModifier(attributeValue);
        const total = roll + modifier + bonus;

        const isCriticalSuccess = roll === 20;
        const isCriticalFailure = roll === 1;

        let success = total >= difficultyClass;
        if (isCriticalSuccess) success = true;
        if (isCriticalFailure) success = false;

        return {
            success,
            roll,
            total,
            isCriticalSuccess,
            isCriticalFailure
        };
    }
}
