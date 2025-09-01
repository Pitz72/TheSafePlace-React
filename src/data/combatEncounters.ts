/**
 * combatEncounters.ts
 *
 * Definisce i gruppi specifici di nemici per ogni incontro di combattimento.
 * Questo permette di riutilizzare gli stessi incontri in diverse situazioni.
 */

import type { CombatEncounter } from '../types/combat';

export const combatEncounters: Record<string, CombatEncounter> = {
  'bandit_duo': {
    id: 'bandit_duo',
    description: 'Due banditi ti sbarrano la strada, con intenzioni tutt\'altro che amichevoli.',
    enemies: [
      { templateId: 'bandit', level: 1 },
      { templateId: 'bandit', level: 1 }
    ],
    environment: 'forest',
    escapeModifier: 0,
  },
  'river_monster_1': {
    id: 'river_monster_1',
    description: 'Una creatura anfibia emerge dalle acque torbide, sibilando minacciosamente.',
    enemies: [
      { templateId: 'mutant_toad', level: 2 } // Assumendo che esista un template 'mutant_toad'
    ],
    environment: 'river',
    escapeModifier: -2, // Più difficile fuggire in acqua
  },
};
