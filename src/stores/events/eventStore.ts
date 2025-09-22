import { create } from 'zustand';
import type { GameEvent, EventChoice, Sequence, SequencePage } from '../../interfaces/events';
import { MessageType } from '../../data/MessageArchive';
import { useCharacterStore } from '../character/characterStore';
import { useCombatStore } from '../combatStore';
import { useGameStore } from '../gameStore';

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

export interface EventState {
  // State
  eventDatabase: Record<string, GameEvent[]>;
  currentEvent: GameEvent | null;
  currentEventResult: string | null;
  eventQueue: GameEvent[]; // Coda eventi in attesa
  seenEventIds: string[];
  completedEncounters: string[];

  // Sequence state
  activeSequence: {
    sequenceId: string | null;
    currentPage: number;
    totalPages: number;
    pages: SequencePage[];
  };

  // Actions
  loadEventDatabase: () => Promise<void>;
  loadSequences: () => Promise<Record<string, Sequence>>;
  triggerEvent: (event: GameEvent) => void;
  dismissCurrentEvent: () => void;
  resolveChoice: (choice: EventChoice, addLogEntry: (type: MessageType, context?: any) => void, advanceTime: (minutes: number) => void) => void;
  startSequence: (sequenceId: string) => Promise<void>;
  advanceSequence: () => void;
  endSequence: () => void;
  markEventAsSeen: (eventId: string) => void;
  markEncounterAsCompleted: (encounterId: string) => void;
  isEventSeen: (eventId: string) => boolean;
  isEncounterCompleted: (encounterId: string) => boolean;
  getRandomEventFromBiome: (biome: string) => GameEvent | null;
  getRandomEvent: () => GameEvent | null;
  checkForRandomEvent: (biome: string, weatherEffects: WeatherEffects) => void;
  forceBiomeEvent: (biome: string) => void; // DEBUG: Forza un evento per bioma
  forceRandomEvent: () => void; // DEBUG: Forza evento random
  debugEventSystem: () => void; // DEBUG: Mostra stato sistema
  resetEventState: () => void;
  restoreState: (state: { seenEventIds: string[]; completedEncounters: string[] }) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
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
    try {
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

      for (const file of eventFiles) {
        try {
          const res = await fetch(`/events/${file}`);
          if (!res.ok) {
            console.error(`Failed to fetch ${file}: ${res.status} ${res.statusText}`);
            continue;
          }
          const data = await res.json();
          const key = Object.keys(data)[0];
          const events = Object.values(data)[0] as GameEvent[];
          database[key] = events;
        } catch (fileError) {
          console.error(`Error loading ${file}:`, fileError);
        }
      }

      set({ eventDatabase: database });
    } catch (error) {
      console.error('Failed to load event database:', error);
    }
  },

  loadSequences: async () => {
    try {
      const res = await fetch('/events/sequences.json');
      const data = await res.json();
      return data.SEQUENCES as Record<string, Sequence>;
    } catch (error) {
      console.error('Failed to load sequences:', error);
      return {};
    }
  },

  startSequence: async (sequenceId: string) => {
    try {
      const sequences = await get().loadSequences();
      const sequence = sequences[sequenceId];

      if (!sequence) {
        console.error(`Sequence ${sequenceId} not found`);
        return;
      }

      set({
        activeSequence: {
          sequenceId,
          currentPage: 1, // Start from page 1
          totalPages: sequence.pages.length,
          pages: sequence.pages
        }
      });

      console.log(`🎭 Sequence "${sequenceId}" started - ${sequence.pages.length} pages`);
    } catch (error) {
      console.error('Failed to start sequence:', error);
    }
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
    const { currentEvent, markEncounterAsCompleted } = get();
    if (!currentEvent) return;

    const combatStore = useCombatStore.getState();
    const characterStore = useCharacterStore.getState();

    const handleOutcome = (outcome: string | EventChoice, choice: EventChoice) => {
      // Determine the result text
      let resultText: string;
      if (typeof outcome === 'string') {
        resultText = outcome;
      } else {
        resultText = outcome.text || 'Risultato sconosciuto';
      }

      addLogEntry(MessageType.EVENT_CHOICE, { text: choice.text });

      // Imposta il testo del risultato da mostrare
      set({ currentEventResult: resultText });

      // Process actions (legacy support)
      if (typeof outcome === 'object' && outcome.actions) {
        outcome.actions.forEach((action: { type: string; payload: any }) => {
          switch (action.type) {
            case 'start_combat':
              combatStore.initiateCombat(action.payload.encounterId);
              break;
            case 'advance_time':
              advanceTime(action.payload.minutes);
              break;
            case 'log':
              addLogEntry(MessageType.AMBIANCE_RANDOM, { text: action.payload.message });
              break;
            case 'damage_player':
              characterStore.updateHP(-action.payload.damage);
              addLogEntry(MessageType.HP_DAMAGE, {
                damage: action.payload.damage,
                reason: action.payload.reason || 'evento'
              });
              break;
            case 'heal_player':
              characterStore.updateHP(action.payload.healing);
              addLogEntry(MessageType.HP_RECOVERY, {
                healing: action.payload.healing,
                reason: action.payload.reason || 'evento'
              });
              break;
          }
        });
      }

      // Process items_gained from choice
      if (choice.items_gained) {
        choice.items_gained.forEach(item => {
          const success = characterStore.addItemToInventory(item.id, item.quantity);
          if (!success) {
            addLogEntry(MessageType.INVENTORY_FULL, { item: `${item.quantity}x ${item.id}` });
          } else {
            addLogEntry(MessageType.INVENTORY_ADD, { action: `Hai ottenuto ${item.quantity}x ${item.id}` });
          }
        });
      }

      // Process penalty from choice
      if (choice.penalty) {
        switch (choice.penalty.type) {
          case 'damage':
            if (choice.penalty.amount) {
              characterStore.updateHP(-choice.penalty.amount);
              addLogEntry(MessageType.HP_DAMAGE, {
                damage: choice.penalty.amount,
                reason: 'evento'
              });
            }
            break;
          case 'time':
            if (choice.penalty.amount) {
              advanceTime(choice.penalty.amount);
            }
            break;
          case 'status':
            // TODO: Implement status effects in character store
            addLogEntry(MessageType.STATUS_CHANGE, { text: `Status applicato: ${choice.penalty.status}` });
            break;
          case 'stat_reduction':
            // TODO: Implement temporary stat reduction
            addLogEntry(MessageType.AMBIANCE_RANDOM, { text: `Riduzione temporanea: ${choice.penalty.stat} -${choice.penalty.amount}` });
            break;
          case 'special':
            // TODO: Implement special effects
            addLogEntry(MessageType.AMBIANCE_RANDOM, { text: `Effetto speciale: ${choice.penalty.effect}` });
            break;
          default:
            console.warn('Unknown penalty type:', choice.penalty.type);
        }
      }

      // Process reward from choice
      if (choice.reward) {
        const reward = choice.reward;
        switch (reward.type) {
          case 'stat_boost':
            // TODO: Implement stat boost
            addLogEntry(MessageType.STAT_INCREASE, { text: `Bonus stat: ${reward.stat} +${reward.amount}` });
            break;
          case 'reveal_map_poi':
            // TODO: Implement map POI reveal
            addLogEntry(MessageType.DISCOVERY, { discovery: 'Nuovo punto di interesse rivelato sulla mappa' });
            break;
          case 'special':
            addLogEntry(MessageType.AMBIANCE_RANDOM, { text: `Ricompensa speciale: ${reward.effect}` });
            break;
          case 'xp_gain':
            if ('amount' in reward && reward.amount) {
              characterStore.addExperience(reward.amount);
            }
            break;
          case 'hp_gain':
            if ('amount' in reward && reward.amount) {
              characterStore.updateHP(reward.amount);
            }
            break;
          default:
            console.warn('Unknown reward type:', (reward as any).type);
        }
      }

      // Process consequences (sequences, etc.)
      if (choice.consequences) {
        const consequence = choice.consequences;
        if (typeof consequence === 'object' && 'type' in consequence) {
          switch (consequence.type) {
            case 'sequence':
              // Start sequence instead of ending event
              console.log(`🎭 Starting sequence: ${(consequence as any).sequenceId}`);
              get().startSequence((consequence as any).sequenceId);
              return; // Don't end the event, sequence takes over
            case 'end_event':
              // Continue with normal event ending
              break;
            default:
              console.warn('Unknown consequence type:', (consequence as any).type);
          }
        }
      }
    };

    if (choice.skillCheck) {
      const result = characterStore.performAbilityCheck(
        choice.skillCheck.stat,
        choice.skillCheck.difficulty
      );

      if (result.success) {
        handleOutcome(choice.successText || 'Azione completata con successo.', choice);
      } else {
        handleOutcome(choice.failureText || 'Azione fallita.', choice);
      }
    } else {
      // Azione immediata
      handleOutcome(choice.resultText || 'Azione completata.', choice);
    }

    // Marca l'incontro come completato se è unico
    if (currentEvent.isUnique && currentEvent.id) {
      markEncounterAsCompleted(currentEvent.id);
    }

    // Invece di chiudere immediatamente, mostra il risultato
    // L'evento verrà chiuso quando l'utente preme ENTER sulla schermata risultato
  },

  markEventAsSeen: (eventId: string) => {
    set(state => ({
      seenEventIds: state.seenEventIds.includes(eventId)
        ? state.seenEventIds
        : [...state.seenEventIds, eventId]
    }));
  },

  markEncounterAsCompleted: (encounterId: string) => {
    set(state => ({
      completedEncounters: state.completedEncounters.includes(encounterId)
        ? state.completedEncounters
        : [...state.completedEncounters, encounterId]
    }));
  },

  isEventSeen: (eventId: string) => {
    return get().seenEventIds.includes(eventId);
  },

  isEncounterCompleted: (encounterId: string) => {
    return get().completedEncounters.includes(encounterId);
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
    const BIOME_EVENT_CHANCES: Record<string, number> = {
      'PLAINS': 0.25, 'FOREST': 0.35, 'RIVER': 0.40, 'CITY': 0.50,
      'VILLAGE': 0.50, 'SETTLEMENT': 0.45, 'REST_STOP': 0.40, 'UNKNOWN': 0.20
    };
    const RANDOM_EVENT_CHANCE = 0.10;

    const baseEventChance = BIOME_EVENT_CHANCES[biome] || 0.20;
    const adjustedEventChance = baseEventChance * weatherEffects.eventProbabilityModifier;

    console.log(`🎲 [EVENT DEBUG] Checking for random event in ${biome}`);
    console.log(`🎲 [EVENT DEBUG] Base chance: ${baseEventChance}, Weather modifier: ${weatherEffects.eventProbabilityModifier}, Adjusted: ${adjustedEventChance}`);

    if (biome && Math.random() < adjustedEventChance) {
        console.log(`🎲 [EVENT DEBUG] Biome event triggered!`);
        setTimeout(() => {
          const { getRandomEventFromBiome, getRandomEvent, triggerEvent } = get();

          let randomEvent;
          if (Math.random() < 0.3) {
            randomEvent = getRandomEvent();
            console.log(`🎲 [EVENT DEBUG] Chose random global event`);
          } else {
            randomEvent = getRandomEventFromBiome(biome);
            console.log(`🎲 [EVENT DEBUG] Chose biome event for ${biome}`);
          }

          if (randomEvent) {
            console.log(`🎲 [EVENT DEBUG] Triggering event: ${randomEvent.title}`);
            triggerEvent(randomEvent);
          } else {
            console.log(`🎲 [EVENT DEBUG] No event found for ${biome}`);
          }
        }, 150);
    } else if (Math.random() < RANDOM_EVENT_CHANCE) {
      console.log(`🎲 [EVENT DEBUG] Random global event triggered!`);
      setTimeout(() => {
        const { getRandomEvent, triggerEvent } = get();
        const randomEvent = getRandomEvent();
        if (randomEvent) {
          console.log(`🎲 [EVENT DEBUG] Triggering random event: ${randomEvent.title}`);
          triggerEvent(randomEvent);
        } else {
          console.log(`🎲 [EVENT DEBUG] No random event found`);
        }
      }, 150);
    } else {
      console.log(`🎲 [EVENT DEBUG] No event triggered this time`);
    }
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