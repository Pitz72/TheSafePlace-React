import type { EnemyTemplate, EnemyCombatState } from '../types/combat';

/**
 * Loads and validates the enemy templates from the JSON file.
 * @returns A promise that resolves to a record of enemy templates keyed by their ID.
 */
export const loadEnemyTemplates = async (): Promise<Record<string, EnemyTemplate>> => {
  try {
    const response = await fetch('/data/enemies.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch enemies.json: ${response.statusText}`);
    }
    const data = await response.json();

    // Basic validation
    if (!data || !Array.isArray(data.enemies)) {
      throw new Error('Invalid enemies.json format: "enemies" array not found.');
    }

    const templates: Record<string, EnemyTemplate> = {};
    for (const enemy of data.enemies) {
      if (enemy.id && enemy.name && enemy.hp && enemy.ac && enemy.damage) {
        templates[enemy.id] = enemy;
      } else {
        console.warn('Skipping invalid enemy template:', enemy);
      }
    }
    return templates;
  } catch (error) {
    console.error('Error loading enemy templates:', error);
    return {};
  }
};

/**
 * Creates a live combatant state from an enemy template.
 * @param template The enemy template from the database.
 * @param uniqueId A unique identifier for this specific combat instance.
 * @returns An EnemyCombatState object.
 */
export const createEnemyCombatant = (template: EnemyTemplate, uniqueId: string): EnemyCombatState => {
  return {
    id: uniqueId,
    templateId: template.id,
    name: template.name,
    hp: template.hp,
    maxHp: template.hp,
    ac: template.ac,
    damage: template.damage,
    attackBonus: template.attackBonus,
    status: 'alive',
    healthDescription: 'Illeso',
  };
};

/**
 * Updates the health description of an enemy based on their current HP percentage.
 * @param enemy The enemy combatant to update.
 * @returns The updated enemy combatant.
 */
export const updateEnemyHealthDescription = (enemy: EnemyCombatState): EnemyCombatState => {
    const hpPercentage = (enemy.hp / enemy.maxHp) * 100;
    let newDescription: EnemyCombatState['healthDescription'] = 'Illeso';

    if (hpPercentage <= 0) {
        // This case is handled by death logic, but as a fallback
        newDescription = 'Morente';
    } else if (hpPercentage < 30) {
        newDescription = 'Morente';
    } else if (hpPercentage < 60) {
        newDescription = 'Gravemente Ferito';
    } else if (hpPercentage < 90) {
        newDescription = 'Ferito';
    }

    return {
        ...enemy,
        healthDescription: newDescription,
    };
};
