/**
 * encounterUtils.ts
 *
 * Funzioni per la gestione e l'attivazione degli incontri sulla mappa.
 */

import { useGameStore } from '../stores/gameStore';
import { encounterDefinitions } from '../data/encounters';
import type { EncounterDefinition } from '../data/encounters';

/**
 * Controlla se la posizione corrente del giocatore attiva un incontro.
 * @param x La coordinata X del giocatore.
 * @param y La coordinata Y del giocatore.
 */
export const checkForEncounter = (x: number, y: number): void => {
  const { completedEncounters, triggerEvent } = useGameStore.getState();

  // Cerca un incontro definito per le coordinate correnti
  const encounter = encounterDefinitions.find(enc =>
    enc.coordinates.some(coord => coord.x === x && coord.y === y)
  );

  if (encounter) {
    // Controlla se l'incontro è unico e se è già stato completato
    if (encounter.isUnique && completedEncounters.includes(encounter.id)) {
      console.log(`Incontro unico '${encounter.id}' già completato. Salto.`);
      return;
    }

    console.log(`Incontro attivato: ${encounter.id}`);
    // Attiva l'evento passando la definizione dell'incontro
    triggerEvent(encounter);
  }
};
