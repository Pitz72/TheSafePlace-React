/**
 * Test per il sistema rifugi v0.6.1
 * Verifica che le regole dei rifugi funzionino correttamente
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { create } from 'zustand';
import type { GameState } from '../interfaces/gameState';
import { WeatherType } from '../interfaces/gameState';

// Mock del gameStore per i test
const createTestStore = () => create<Partial<GameState>>((set, get) => ({
  playerPosition: { x: 10, y: 20 },
  timeState: { currentTime: 600, day: 1, isDay: true }, // 10:00 AM
  shelterAccessState: {},
  
  createShelterKey: (x: number, y: number): string => `${x},${y}`,
  
  getShelterInfo: (x: number, y: number) => {
    const key = get().createShelterKey!(x, y);
    return get().shelterAccessState![key] || null;
  },
  
  createShelterInfo: (x: number, y: number) => {
    const timeState = get().timeState!;
    return {
      coordinates: get().createShelterKey!(x, y),
      dayVisited: timeState.day,
      timeVisited: timeState.currentTime,
      hasBeenInvestigated: false,
      isAccessible: true,
      investigationResults: []
    };
  },
  
  updateShelterAccess: (x: number, y: number, updates) => {
    const key = get().createShelterKey!(x, y);
    set(state => ({
      shelterAccessState: {
        ...state.shelterAccessState,
        [key]: {
          ...state.shelterAccessState![key],
          ...updates
        }
      }
    }));
  },
  
  isShelterAccessible: (x: number, y: number): boolean => {
    const shelterInfo = get().getShelterInfo!(x, y);
    if (!shelterInfo) return true; // Prima visita sempre permessa
    
    const timeState = get().timeState!;
    
    // Accesso notturno sempre permesso
    if (!timeState.isDay) return true;
    
    // Se è già stato visitato di giorno, non è più accessibile
    return shelterInfo.isAccessible;
  },
  
  canInvestigateShelter: (x: number, y: number): boolean => {
    const shelterInfo = get().getShelterInfo!(x, y);
    if (!shelterInfo) return true; // Prima investigazione sempre permessa
    
    // Una sola investigazione per sessione
    return !shelterInfo.hasBeenInvestigated;
  },
  
  resetShelterInvestigations: () => {
    set(state => {
      const newShelterAccessState = { ...state.shelterAccessState };
      Object.keys(newShelterAccessState).forEach(key => {
        newShelterAccessState[key] = {
          ...newShelterAccessState[key],
          hasBeenInvestigated: false,
          investigationResults: []
        };
      });
      return { shelterAccessState: newShelterAccessState };
    });
  }
}));

describe('Sistema Rifugi v0.6.1', () => {
  let store: ReturnType<typeof createTestStore>;
  
  beforeEach(() => {
    store = createTestStore();
  });

  test('Prima visita diurna dovrebbe essere sempre permessa', () => {
    const { isShelterAccessible } = store.getState();
    
    // Prima visita a un rifugio
    const accessible = isShelterAccessible!(10, 20);
    expect(accessible).toBe(true);
  });

  test('Dopo visita diurna, rifugio dovrebbe essere inaccessibile per future visite diurne', () => {
    const { createShelterInfo, updateShelterAccess, isShelterAccessible } = store.getState();
    
    // Simula prima visita diurna
    const shelterInfo = createShelterInfo!(10, 20);
    store.setState({ 
      shelterAccessState: { 
        [shelterInfo.coordinates]: shelterInfo 
      } 
    });
    
    // Marca come visitato durante il giorno
    updateShelterAccess!(10, 20, { 
      isAccessible: false,
      dayVisited: 1,
      timeVisited: 600
    });
    
    // Verifica che non sia più accessibile di giorno
    const accessible = isShelterAccessible!(10, 20);
    expect(accessible).toBe(false);
  });

  test('Accesso notturno dovrebbe essere sempre permesso', () => {
    const { createShelterInfo, updateShelterAccess, isShelterAccessible } = store.getState();
    
    // Simula rifugio già visitato di giorno
    const shelterInfo = createShelterInfo!(10, 20);
    store.setState({ 
      shelterAccessState: { 
        [shelterInfo.coordinates]: { 
          ...shelterInfo, 
          isAccessible: false 
        } 
      },
      timeState: { currentTime: 1320, day: 1, isDay: false } // 22:00 - notte
    });
    
    // Verifica che sia accessibile di notte
    const accessible = isShelterAccessible!(10, 20);
    expect(accessible).toBe(true);
  });

  test('Prima investigazione dovrebbe essere sempre permessa', () => {
    const { canInvestigateShelter } = store.getState();
    
    // Prima investigazione
    const canInvestigate = canInvestigateShelter!(10, 20);
    expect(canInvestigate).toBe(true);
  });

  test('Investigazione dovrebbe essere non ripetibile nella stessa sessione', () => {
    const { createShelterInfo, updateShelterAccess, canInvestigateShelter } = store.getState();
    
    // Simula prima investigazione
    const shelterInfo = createShelterInfo!(10, 20);
    store.setState({ 
      shelterAccessState: { 
        [shelterInfo.coordinates]: shelterInfo 
      } 
    });
    
    // Prima investigazione dovrebbe essere permessa
    expect(canInvestigateShelter!(10, 20)).toBe(true);
    
    // Marca investigazione come completata
    updateShelterAccess!(10, 20, { 
      hasBeenInvestigated: true,
      investigationResults: ['Test investigation result']
    });
    
    // Seconda investigazione nella stessa sessione dovrebbe essere bloccata
    expect(canInvestigateShelter!(10, 20)).toBe(false);
  });

  test('Reset investigazioni dovrebbe permettere nuove investigazioni', () => {
    const { createShelterInfo, updateShelterAccess, canInvestigateShelter, resetShelterInvestigations } = store.getState();
    
    // Simula investigazione completata
    const shelterInfo = createShelterInfo!(10, 20);
    store.setState({ 
      shelterAccessState: { 
        [shelterInfo.coordinates]: { 
          ...shelterInfo, 
          hasBeenInvestigated: true,
          investigationResults: ['Previous investigation']
        } 
      } 
    });
    
    // Verifica che l'investigazione sia bloccata
    expect(canInvestigateShelter!(10, 20)).toBe(false);
    
    // Reset investigazioni (nuova sessione)
    resetShelterInvestigations!();
    
    // Ora dovrebbe essere di nuovo possibile investigare
    expect(canInvestigateShelter!(10, 20)).toBe(true);
    
    // Verifica che i risultati precedenti siano stati cancellati
    const updatedShelterInfo = store.getState().getShelterInfo!(10, 20);
    expect(updatedShelterInfo?.investigationResults).toEqual([]);
  });

  test('Stato rifugio dovrebbe persistere tra visite', () => {
    const { createShelterInfo, updateShelterAccess, getShelterInfo } = store.getState();
    
    // Crea e modifica stato rifugio
    const shelterInfo = createShelterInfo!(10, 20);
    store.setState({ 
      shelterAccessState: { 
        [shelterInfo.coordinates]: shelterInfo 
      } 
    });
    
    updateShelterAccess!(10, 20, { 
      isAccessible: false,
      hasBeenInvestigated: true,
      investigationResults: ['Found some items']
    });
    
    // Verifica persistenza
    const persistedInfo = getShelterInfo!(10, 20);
    expect(persistedInfo?.isAccessible).toBe(false);
    expect(persistedInfo?.hasBeenInvestigated).toBe(true);
    expect(persistedInfo?.investigationResults).toEqual(['Found some items']);
  });

  test('Rifugi diversi dovrebbero avere stati indipendenti', () => {
    const { createShelterInfo, updateShelterAccess, isShelterAccessible, canInvestigateShelter } = store.getState();
    
    // Crea due rifugi diversi
    const shelter1 = createShelterInfo!(10, 20);
    const shelter2 = createShelterInfo!(15, 25);
    
    store.setState({ 
      shelterAccessState: { 
        [shelter1.coordinates]: shelter1,
        [shelter2.coordinates]: shelter2
      } 
    });
    
    // Modifica solo il primo rifugio
    updateShelterAccess!(10, 20, { 
      isAccessible: false,
      hasBeenInvestigated: true
    });
    
    // Verifica che solo il primo rifugio sia stato modificato
    expect(isShelterAccessible!(10, 20)).toBe(false);
    expect(canInvestigateShelter!(10, 20)).toBe(false);
    
    // Il secondo rifugio dovrebbe rimanere inalterato
    expect(isShelterAccessible!(15, 25)).toBe(true);
    expect(canInvestigateShelter!(15, 25)).toBe(true);
  });
});