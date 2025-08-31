/**
 * Test di integrazione per il sistema di trigger degli incontri.
 * Verifica che il movimento del giocatore attivi correttamente gli eventi
 * e che le scelte portino agli esiti corretti.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { useGameStore } from '../stores/gameStore';
import { useCombatStore } from '../stores/combatStore';
import { checkForEncounter } from '../utils/encounterUtils';
import { encounterDefinitions } from '../data/encounters';

// Mock degli store
jest.mock('../stores/gameStore');
jest.mock('../stores/combatStore');

const useGameStoreMock = useGameStore as jest.Mock;
const useCombatStoreMock = useCombatStore as jest.Mock;

describe('Encounter Trigger System', () => {
  let mockGameState: any;
  let mockCombatState: any;

  beforeEach(() => {
    // Stato di base per il game store mock
    mockGameState = {
      completedEncounters: [],
      triggerEvent: jest.fn(),
    };

    // Stato di base per il combat store mock
    mockCombatState = {
      initiateCombat: jest.fn(),
    };

    // Configura i mock per restituire gli stati di base
    useGameStoreMock.mockReturnValue(mockGameState);
    useCombatStoreMock.mockReturnValue(mockCombatState);

    // Simula la funzione getState() richiesta dalla logica interna
    (useGameStore as any).getState = () => mockGameState;
    (useCombatStore as any).getState = () => mockCombatState;
  });

  test('dovrebbe chiamare triggerEvent quando il giocatore entra in una coordinata di incontro', () => {
    const encounter = encounterDefinitions[0];
    const encounterCoord = encounter.coordinates[0];

    // Simula il movimento del giocatore sulla coordinata dell'incontro
    checkForEncounter(encounterCoord.x, encounterCoord.y);

    // Verifica che triggerEvent sia stato chiamato con la definizione dell'incontro corretta
    expect(mockGameState.triggerEvent).toHaveBeenCalledTimes(1);
    expect(mockGameState.triggerEvent).toHaveBeenCalledWith(encounter);
  });

  test('non dovrebbe chiamare triggerEvent se le coordinate non corrispondono', () => {
    // Usa coordinate che non sono in nessuna definizione di incontro
    checkForEncounter(999, 999);

    expect(mockGameState.triggerEvent).not.toHaveBeenCalled();
  });

  test('non dovrebbe chiamare triggerEvent per un incontro unico già completato', () => {
    const uniqueEncounter = encounterDefinitions.find(e => e.isUnique)!;
    const encounterCoord = uniqueEncounter.coordinates[0];

    // Simula che l'incontro sia già stato completato
    mockGameState.completedEncounters = [uniqueEncounter.id];

    checkForEncounter(encounterCoord.x, encounterCoord.y);

    expect(mockGameState.triggerEvent).not.toHaveBeenCalled();
  });

  test('dovrebbe chiamare triggerEvent per un incontro non unico anche se già completato', () => {
    const repeatableEncounter = encounterDefinitions.find(e => !e.isUnique)!;
    const encounterCoord = repeatableEncounter.coordinates[0];

    // Simula che l'incontro sia già stato completato
    mockGameState.completedEncounters = [repeatableEncounter.id];

    checkForEncounter(encounterCoord.x, encounterCoord.y);

    expect(mockGameState.triggerEvent).toHaveBeenCalledTimes(1);
  });
});
