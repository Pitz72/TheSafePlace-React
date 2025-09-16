import { create } from 'zustand';
import type { GameEvent, EventChoice } from '../../interfaces/events';
import { MessageType } from '../../data/MessageArchive';
import { useCharacterStore } from '../character/characterStore';
import { useCombatStore } from '../combatStore';
import { useWorldStore } from '../world/worldStore';
import { useGameStore } from '../gameStore';

// Minimal interface to avoid direct dependency on weatherStore shape
interface WeatherEffects {
  eventProbabilityModifier: number;
}

export interface EventState {
  // State
  eventDatabase: Record<string, GameEvent[]>;
  currentEvent: GameEvent | null;
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
  checkForRandomEvent: (biome: string, weatherEffects: WeatherEffects) => void;
  forceBiomeEvent: (biome: string) => void; // DEBUG: Forza un evento per bioma
  resetEventState: () => void;
  restoreState: (state: { seenEventIds: string[]; completedEncounters: string[] }) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  // --- INITIAL STATE ---
  eventDatabase: {},
  currentEvent: null,
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
        'village_events.json'
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
    const { currentEvent, markEventAsSeen } = get();
    
    // Evita di sovrascrivere eventi attivi
    if (currentEvent) return;

    // Se l'evento ha un ID, segnalo come visto
    if (event.id) {
      markEventAsSeen(event.id);
    }

    set({ currentEvent: event });
    // Mostra la schermata dell'evento
    useGameStore.getState().setCurrentScreen('event');
  },

  dismissCurrentEvent: () => {
    set({ currentEvent: null });
  },

  resolveChoice: (choice: EventChoice, addLogEntry: (type: MessageType, context?: any) => void, advanceTime: (minutes: number) => void) => {
    const { currentEvent, markEncounterAsCompleted } = get();
    if (!currentEvent) return;

    const combatStore = useCombatStore.getState();
    const characterStore = useCharacterStore.getState();

    const handleOutcome = (outcome: EventChoice) => {
      addLogEntry(MessageType.EVENT_CHOICE, { text: outcome.text });

      outcome.actions?.forEach((action: { type: string; payload: any }) => {
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
    };

    if (choice.skillCheck) {
      const result = characterStore.performAbilityCheck(
        choice.skillCheck.stat, 
        choice.skillCheck.difficulty
      );
      
      if (result.success) {
        handleOutcome(choice.successText);
      } else {
        handleOutcome(choice.failureText);
      }
    } else {
      // Azione immediata
      handleOutcome(choice.resultText);
    }

    // Marca l'incontro come completato se è unico
    if (currentEvent.isUnique && currentEvent.id) {
      markEncounterAsCompleted(currentEvent.id);
    }

    set({ currentEvent: null });
    // Ritorna alla schermata di gioco
    useGameStore.getState().goBack();
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

  checkForRandomEvent: (biome, weatherEffects) => {
    const BIOME_EVENT_CHANCES: Record<string, number> = {
      'PLAINS': 0.10, 'FOREST': 0.15, 'RIVER': 0.18, 'CITY': 0.33,
      'VILLAGE': 0.33, 'SETTLEMENT': 0.25, 'REST_STOP': 0.20, 'UNKNOWN': 0.05
    };
    const baseEventChance = BIOME_EVENT_CHANCES[biome] || 0.05;
    const adjustedEventChance = baseEventChance * weatherEffects.eventProbabilityModifier;

    if (biome && Math.random() < adjustedEventChance) {
        setTimeout(() => {
          const { getRandomEventFromBiome, triggerEvent } = get();
          const randomEvent = getRandomEventFromBiome(biome);
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
      seenEventIds: [],
      completedEncounters: []
    });
  },

  restoreState: (state) => {
    set({
      seenEventIds: state.seenEventIds,
      completedEncounters: state.completedEncounters
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