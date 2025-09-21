import { create } from 'zustand';
import type { GameEvent, EventChoice } from '../../interfaces/events';
import { MessageType } from '../../data/MessageArchive';
import { useCharacterStore } from '../character/characterStore';
import { useCombatStore } from '../combatStore';
import { useGameStore } from '../gameStore';

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

  // Actions
  loadEventDatabase: () => Promise<void>;
  triggerEvent: (event: GameEvent) => void;
  dismissCurrentEvent: () => void;
  resolveChoice: (choice: EventChoice, addLogEntry: (type: MessageType, context?: any) => void, advanceTime: (minutes: number) => void) => void;
  markEventAsSeen: (eventId: string) => void;
  markEncounterAsCompleted: (encounterId: string) => void;
  isEventSeen: (eventId: string) => boolean;
  isEncounterCompleted: (encounterId: string) => boolean;
  getRandomEventFromBiome: (biome: string) => GameEvent | null;
  getRandomEvent: () => GameEvent | null;
  checkForRandomEvent: (biome: string, weatherEffects: WeatherEffects) => void;
  forceBiomeEvent: (biome: string) => void; // DEBUG: Forza un evento per bioma
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
        'random_events.json'
      ];

      const database: Record<string, GameEvent[]> = {};

      for (const file of eventFiles) {
        const res = await fetch(`/events/${file}`);
        const data = await res.json();
        const key = Object.keys(data)[0];
        database[key] = Object.values(data)[0] as GameEvent[];
      }

      set({ eventDatabase: database });
    } catch (error) {
      console.error('Failed to load event database:', error);
    }
  },

  triggerEvent: (event: GameEvent) => {
    const { currentEvent, eventQueue, markEventAsSeen } = get();

    // Se l'evento ha un ID, segnalo come visto
    if (event.id) {
      markEventAsSeen(event.id);
    }

    // Se c'è già un evento attivo, aggiungilo alla coda con priorità
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

      console.log(`🎭 Evento dalla coda: "${nextEvent.title}" (${remainingQueue.length} in coda)`);

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
      'PLAINS': 0.08, 'FOREST': 0.12, 'RIVER': 0.15, 'CITY': 0.25,
      'VILLAGE': 0.25, 'SETTLEMENT': 0.20, 'REST_STOP': 0.15, 'UNKNOWN': 0.05
    };
    const RANDOM_EVENT_CHANCE = 0.03; // 3% chance for random events anywhere

    const baseEventChance = BIOME_EVENT_CHANCES[biome] || 0.05;
    const adjustedEventChance = baseEventChance * weatherEffects.eventProbabilityModifier;

    if (biome && Math.random() < adjustedEventChance) {
        setTimeout(() => {
          const { getRandomEventFromBiome, getRandomEvent, triggerEvent } = get();

          // 30% chance for random event, 70% for biome event
          let randomEvent;
          if (Math.random() < 0.3) {
            randomEvent = getRandomEvent();
          } else {
            randomEvent = getRandomEventFromBiome(biome);
          }

          if (randomEvent) {
            triggerEvent(randomEvent);
          }
        }, 150);
    } else if (Math.random() < RANDOM_EVENT_CHANCE) {
      // Chance for random event even in low-probability areas
      setTimeout(() => {
        const { getRandomEvent, triggerEvent } = get();
        const randomEvent = getRandomEvent();
        if (randomEvent) {
          triggerEvent(randomEvent);
        }
      }, 150);
    }
  },

  resetEventState: () => {
    set({
      eventDatabase: {},
      currentEvent: null,
      currentEventResult: null,
      eventQueue: [],
      seenEventIds: [],
      completedEncounters: []
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
  }
}));