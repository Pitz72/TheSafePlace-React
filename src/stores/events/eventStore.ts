import { create } from 'zustand';
import type { GameEvent, EventChoice, Sequence, SequencePage } from '@/interfaces/events';
import { MessageType } from '@/data/MessageArchive';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useCombatStore } from '@/stores/combatStore';
import { useGameStore } from '@/stores/gameStore';
import { CharacterStatus } from '@/rules/types';
import {
  resolveChoice as resolveChoiceUtil,
  checkForRandomEvent as checkForRandomEventUtil,
} from '@/utils/eventUtils';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';

// Esponi funzioni di debug globalmente
if (typeof window !== 'undefined') {
  (window as any).debugEvents = {
    forceBiome: (biome: string) => useEventStore.getState().forceBiomeEvent(biome),
    forceRandom: () => useEventStore.getState().forceRandomEvent(),
    status: () => useEventStore.getState().debugEventSystem(),
    check: (biome: string) => useEventStore.getState().checkForRandomEvent(biome, { eventProbabilityModifier: 1.0 })
  };
}

// Minimal interface to avoid direct dependency on weatherStore shape
interface WeatherEffects {
  eventProbabilityModifier: number;
}

// Definizione dello stato e delle azioni
interface EventState {
  eventDatabase: Record<string, GameEvent[]>;
  currentEvent: GameEvent | null;
  currentEventResult: string | null;
  eventQueue: GameEvent[];
  seenEventIds: string[];
  completedEncounters: string[];
  activeSequence: {
    sequenceId: string | null;
    currentPage: number;
    totalPages: number;
    pages: SequencePage[];
  };
}

interface EventActions {
  loadEventDatabase: () => Promise<void>;
  loadSequences: () => Promise<Record<string, Sequence>>;
  triggerEvent: (event: GameEvent) => void;
  dismissCurrentEvent: () => void;
  resolveChoice: (choice: EventChoice, addLogEntry: (type: MessageType, context?: any) => void, advanceTime: (minutes: number) => void) => void;
  checkForRandomEvent: (biome: string, weatherEffects: WeatherEffects) => void;
  forceBiomeEvent: (biome: string) => void;
  forceRandomEvent: () => void;
  debugEventSystem: () => void;
  resetEventState: () => void;
  resetEvents: () => void;
  restoreState: (state: { seenEventIds: string[]; completedEncounters: string[] }) => void;
}

// Unione di stato e azioni in un unico tipo
type EventStore = EventState & EventActions;

export const useEventStore = create<EventStore>((set, get) => ({
  // --- INITIAL STATE ---
  eventDatabase: {},
  currentEvent: null,
  currentEventResult: null,
  eventQueue: [], // Coda eventi in attesa
  seenEventIds: [],
  completedEncounters: [],

  // Sequence initial state
  activeSequence: {
    sequenceId: null,
    currentPage: 0,
    totalPages: 0,
    pages: []
  },

  // --- ACTIONS ---
  
  loadEventDatabase: async () => {
    return executeWithRetry({
      operation: async () => {
        const eventFiles = [
          'city_events.json',
          'forest_events.json',
          'plains_events.json',
          'rest_stop_events.json',
          'river_events.json',
          'unique_events.json',
          'village_events.json',
          'random_events.json',
          'lore_events.json'
        ];

        const database: Record<string, GameEvent[]> = {};
        const failedFiles: string[] = [];

        for (const file of eventFiles) {
          try {
            const res = await fetch(`/events/${file}`);
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            const key = Object.keys(data)[0];
            const events = Object.values(data)[0] as GameEvent[];
            database[key] = events;
          } catch (fileError) {
            failedFiles.push(file);
            handleStoreError(fileError as Error, GameErrorCategory.NARRATIVE, {
              operation: 'loadEventFile',
              fileName: file,
              context: 'Caricamento database eventi'
            });
          }
        }

        if (Object.keys(database).length === 0) {
          throw new Error('Nessun file di eventi caricato con successo');
        }

        set({ eventDatabase: database });
        
        if (failedFiles.length > 0) {
          console.warn(`Eventi caricati parzialmente. File falliti: ${failedFiles.join(', ')}`);
        }
        
        return database;
      },
      category: GameErrorCategory.NARRATIVE,
      context: 'loadEventDatabase',
      onSuccess: () => {
        console.log('Database eventi caricato con successo');
      },
      onFailure: (error) => {
        handleStoreError(error, GameErrorCategory.NARRATIVE, {
          operation: 'loadEventDatabase',
          context: 'Caricamento completo database eventi'
        });
      },
      onFallback: () => {
        // Fallback: carica eventi di base hardcoded
        const fallbackDatabase = {
          RANDOM: [{
            id: 'fallback_event',
            title: 'Momento di Riflessione',
            description: 'Ti fermi un momento a riflettere sulla tua situazione.',
            choices: [{
              id: 'continue',
              text: 'Continua',
              consequences: []
            }]
          }]
        };
        set({ eventDatabase: fallbackDatabase });
        console.log('Utilizzando database eventi di fallback');
        return fallbackDatabase;
      }
    });
  },

  loadSequences: async () => {
    return executeWithRetry({
      operation: async () => {
        const res = await fetch('/events/sequences.json');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        return data.SEQUENCES as Record<string, Sequence>;
      },
      category: GameErrorCategory.NARRATIVE,
      context: 'loadSequences',
      onSuccess: (sequences) => {
        console.log(`Caricate ${Object.keys(sequences).length} sequenze`);
      },
      onFailure: (error) => {
        handleStoreError(error, GameErrorCategory.NARRATIVE, {
          operation: 'loadSequences',
          context: 'Caricamento sequenze narrative'
        });
      },
      onFallback: () => {
        console.log('Utilizzando sequenze vuote come fallback');
        return {};
      }
    });
  },

  startSequence: async (sequenceId: string) => {
    return executeWithRetry({
      operation: async () => {
        const sequences = await get().loadSequences();
        const sequence = sequences[sequenceId];

        if (!sequence) {
          throw new Error(`Sequenza ${sequenceId} non trovata`);
        }

        set({
          activeSequence: {
            sequenceId,
            currentPage: 1, // Start from page 1
            totalPages: sequence.pages.length,
            pages: sequence.pages
          }
        });

        console.log(`🎭 Sequenza "${sequenceId}" avviata - ${sequence.pages.length} pagine`);
        return true;
      },
      category: GameErrorCategory.NARRATIVE,
      context: 'startSequence',
      onSuccess: () => {
        // Già gestito nel try block
      },
      onFailure: (error) => {
        handleStoreError(error, GameErrorCategory.NARRATIVE, {
          operation: 'startSequence',
          sequenceId,
          context: 'Avvio sequenza narrativa'
        });
      },
      onFallback: () => {
        console.log(`Impossibile avviare la sequenza ${sequenceId}`);
        return false;
      }
    });
  },

  advanceSequence: () => {
    const { activeSequence } = get();

    if (!activeSequence.sequenceId) return;

    const nextPage = activeSequence.currentPage + 1;

    if (nextPage > activeSequence.totalPages) {
      // Sequence completed
      get().endSequence();
    } else {
      // Advance to next page
      set({
        activeSequence: {
          ...activeSequence,
          currentPage: nextPage
        }
      });
    }
  },

  endSequence: () => {
    console.log('🎭 Sequence ended');
    set({
      activeSequence: {
        sequenceId: null,
        currentPage: 0,
        totalPages: 0,
        pages: []
      }
    });

    // Return to game after sequence ends
    useGameStore.getState().goBack();
  },

  triggerEvent: (event: GameEvent) => {
    const { currentEvent, eventQueue, markEventAsSeen } = get();

    // Se l'evento ha un ID, segnalo come visto
    if (event.id) {
      markEventAsSeen(event.id);
    }

    // Se c'è già un evento attivo, aggiungilo alla coda
    if (currentEvent) {
      const isMainQuest = event.id?.startsWith('mq_') || event.title?.includes('Ricordo:');
      if (isMainQuest) {
        // Eventi main quest in testa alla coda
        console.log(`🎭 Evento main quest "${event.title}" prioritario in testa coda`);
        set({ eventQueue: [event, ...eventQueue] });
      } else {
        // Eventi normali in fondo alla coda
        console.log(`🎭 Evento "${event.title}" accodato (slot occupato)`);
        set({ eventQueue: [...eventQueue, event] });
      }
      return;
    }

    // Slot libero: mostra l'evento immediatamente
    console.log(`🎭 Evento "${event.title}" mostrato immediatamente`);
    set({ currentEvent: event });
    // Mostra la schermata dell'evento
    useGameStore.getState().setCurrentScreen('event');
  },

  dismissCurrentEvent: () => {
    const { eventQueue } = get();

    // Controlla se ci sono eventi in coda
    if (eventQueue.length > 0) {
      const nextEvent = eventQueue[0];
      const remainingQueue = eventQueue.slice(1);


      set({
        currentEvent: nextEvent,
        currentEventResult: null,
        eventQueue: remainingQueue
      });
      // Rimani sulla schermata eventi
      return;
    }

    // Nessun evento in coda: torna al gioco
    set({ currentEvent: null, currentEventResult: null });
    useGameStore.getState().goBack();
  },

  resolveChoice: (choice: EventChoice, addLogEntry: (type: MessageType, context?: any) => void, advanceTime: (minutes: number) => void) => {
    const { currentEvent } = get();
    if (!currentEvent) return;
    resolveChoiceUtil(choice, currentEvent, addLogEntry, advanceTime);
  },

  markEventAsSeen: (eventId: string) => {
    set(state => ({
      seenEventIds: [...state.seenEventIds, eventId]
    }));
  },
  
  markEncounterAsCompleted: (encounterId: string) => {
    set(state => ({
      completedEncounters: [...state.completedEncounters, encounterId]
    }));
  },
  
  isEventSeen: (eventId: string) => {
    const { seenEventIds } = get();
    return seenEventIds.includes(eventId);
  },
  isEncounterCompleted: (encounterId: string) => {
    const { completedEncounters } = get();
    return completedEncounters.includes(encounterId);
  },

  getRandomEventFromBiome: (biome: string) => {
    const { eventDatabase } = get();
    const events = eventDatabase[biome.toUpperCase()];

    if (!events || events.length === 0) {
      return null;
    }

    // Filtra eventi già completati se sono unici
    const availableEvents = events.filter(event => {
      if (event.isUnique && event.id) {
        return !get().isEncounterCompleted(event.id);
      }
      return true;
    });

    if (availableEvents.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    return availableEvents[randomIndex];
  },

  getRandomEvent: () => {
    const { eventDatabase } = get();
    const events = eventDatabase['RANDOM'];

    if (!events || events.length === 0) {
      return null;
    }

    // Filtra eventi già completati se sono unici
    const availableEvents = events.filter(event => {
      if (event.isUnique && event.id) {
        return !get().isEncounterCompleted(event.id);
      }
      return true;
    });

    if (availableEvents.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    return availableEvents[randomIndex];
  },

  checkForRandomEvent: (biome, weatherEffects) => {
    checkForRandomEventUtil(biome, weatherEffects);
  },

  resetEventState: () => {
    set({
      eventDatabase: {},
      currentEvent: null,
      currentEventResult: null,
      eventQueue: [],
      seenEventIds: [],
      completedEncounters: [],
      activeSequence: {
        sequenceId: null,
        currentPage: 0,
        totalPages: 0,
        pages: []
      }
    });
  },

  /**
   * Alias per resetEventState per coerenza con gli altri store.
   * Resetta tutti gli eventi allo stato iniziale.
   */
  resetEvents: () => {
    get().resetEventState();
  },

  restoreState: (state) => {
    set({
      seenEventIds: state.seenEventIds,
      completedEncounters: state.completedEncounters,
      eventQueue: [] // Reset coda al caricamento
    });
  },

  // DEBUG: Funzione per forzare un evento casuale da un bioma specifico
  forceBiomeEvent: (biome: string) => {
    console.log(`[DEBUG] Forzando evento per bioma: ${biome}`);
    const { getRandomEventFromBiome, triggerEvent, eventDatabase } = get();

    // Log del database eventi per debug
    console.log('[DEBUG] Database eventi disponibili:', Object.keys(eventDatabase));
    console.log(`[DEBUG] Eventi per ${biome.toUpperCase()}:`, eventDatabase[biome.toUpperCase()]?.length || 0);

    const randomEvent = getRandomEventFromBiome(biome);
    if (randomEvent) {
      console.log(`[DEBUG] Evento selezionato:`, randomEvent.id, randomEvent.title);
      triggerEvent(randomEvent);
    } else {
      console.log(`[DEBUG] Nessun evento disponibile per il bioma: ${biome}`);
    }
  },

  // DEBUG: Forza evento random globale
  forceRandomEvent: () => {
    console.log(`[DEBUG] Forzando evento random globale`);
    const { getRandomEvent, triggerEvent, eventDatabase } = get();

    console.log('[DEBUG] Eventi random disponibili:', eventDatabase['RANDOM']?.length || 0);

    const randomEvent = getRandomEvent();
    if (randomEvent) {
      console.log(`[DEBUG] Evento random selezionato:`, randomEvent.id, randomEvent.title);
      triggerEvent(randomEvent);
    } else {
      console.log(`[DEBUG] Nessun evento random disponibile`);
    }
  },

  // DEBUG: Mostra stato completo del sistema eventi
  debugEventSystem: () => {
    const state = get();
    console.log('🔍 EVENT SYSTEM DEBUG STATUS:', {
      currentEvent: state.currentEvent?.title || 'None',
      eventQueueLength: state.eventQueue.length,
      queuedEvents: state.eventQueue.map(e => e.title),
      databaseKeys: Object.keys(state.eventDatabase),
      databaseSizes: Object.fromEntries(
        Object.entries(state.eventDatabase).map(([key, events]) => [key, events.length])
      ),
      seenEvents: state.seenEventIds.length,
      completedEncounters: state.completedEncounters.length,
      activeSequence: state.activeSequence.sequenceId || 'None'
    });
  }
}));