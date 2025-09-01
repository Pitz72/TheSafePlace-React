/**
 * encounters.ts
 *
 * Definisce i potenziali incontri basati sulla posizione sulla mappa.
 * Questo sistema permette di creare eventi scriptati e combattimenti evitabili.
 */

import type { GameEvent } from '../stores/gameStore';

// Definiamo un tipo più specifico per gli incontri, che estende GameEvent
export interface EncounterDefinition extends GameEvent {
  coordinates: { x: number; y: number }[]; // Coordinate che attivano l'incontro
  isUnique: boolean; // Se true, l'incontro può avvenire solo una volta
  id: string; // ID unico per tracciare gli incontri completati
}

export const encounterDefinitions: EncounterDefinition[] = [
  {
    id: 'forest_bandit_ambush',
    coordinates: [{ x: 10, y: 15 }], // Esempio di coordinata
    isUnique: true,
    title: 'Imboscata!',
    description: 'Mentre attraversi un fitto bosco, noti delle figure nascoste tra gli alberi. Sembrano banditi pronti a tendere un\'imboscata.',
    options: [
      {
        text: 'Tenta di aggirarli furtivamente (Adattamento)',
        action: 'skill_check',
        skill: 'adattamento',
        difficulty: 14,
        success: {
          text: 'Riesci a muoverti senza essere visto, superando il pericolo.',
          actions: [{ type: 'log', payload: { message: 'Hai evitato un\'imboscata con astuzia.' } }]
        },
        failure: {
          text: 'Un ramo si spezza sotto i tuoi piedi. I banditi ti hanno scoperto! Preparati a combattere.',
          actions: [{ type: 'start_combat', payload: { encounterId: 'bandit_duo' } }]
        }
      },
      {
        text: 'Attacca per primo!',
        action: 'immediate',
        success: {
          text: 'Decidi di prendere l\'iniziativa e carichi contro i banditi!',
          actions: [{ type: 'start_combat', payload: { encounterId: 'bandit_duo' } }]
        },
        failure: { text: '', actions: [] } // Non può fallire
      },
      {
        text: 'Torna indietro e cerca un\'altra strada.',
        action: 'immediate',
        success: {
          text: 'Decidi che il rischio è troppo grande e torni sui tuoi passi, perdendo tempo prezioso.',
          actions: [{ type: 'advance_time', payload: { minutes: 60 } }]
        },
        failure: { text: '', actions: [] }
      }
    ]
  },
  {
    id: 'river_creature',
    coordinates: [{ x: 25, y: 12 }], // Esempio vicino a un fiume
    isUnique: false, // Può ripetersi
    title: 'Strane Increspature',
    description: 'Vicino alla riva del fiume, vedi delle strane increspature sull\'acqua. Potrebbe esserci qualcosa sotto la superficie.',
    options: [
      {
        text: 'Indaga con cautela (Percezione)',
        action: 'skill_check',
        skill: 'percezione',
        difficulty: 12,
        success: {
          text: 'Noti una creatura acquatica poco ostile. Decidi di non disturbarla e prosegui.',
          actions: [{ type: 'log', payload: { message: 'Hai notato una creatura e hai deciso di evitarla.' } }]
        },
        failure: {
          text: 'Ti avvicini troppo e una creatura anfibia emerge dall\'acqua, attaccandoti!',
          actions: [{ type: 'start_combat', payload: { encounterId: 'river_monster_1' } }]
        }
      },
      {
        text: 'Ignora e guada il fiume rapidamente.',
        action: 'immediate',
        success: {
          text: 'Decidi di non perdere tempo e attraversi il fiume senza problemi.',
          actions: []
        },
        failure: { text: '', actions: [] }
      }
    ]
  }
];
