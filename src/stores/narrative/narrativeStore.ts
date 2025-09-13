import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Interfaccia semplificata per la Main Quest secondo il GDD canonico
export interface MainQuestState {
  currentStage: number; // Da 1 a 12, indica il prossimo evento da attivare
  progressCounter: number; // Aumenta a ogni passo del giocatore
  flags: Record<string, boolean>; // Per tracciare scoperte chiave
}

// Interfaccia per i trigger degli eventi
export interface MainQuestTrigger {
  type: 'progress' | 'survival_stat' | 'combat_end' | 'survival_days' | 'enter_biome' | 'level_up' | 'use_item' | 'event_choice' | 'reach_location' | 'reach_end';
  value?: number;
  stat?: string;
  result?: string;
  biome?: string;
  level?: number;
  itemId?: string;
  eventId?: string;
  x?: number;
  y?: number;
}

// Interfaccia per gli eventi della main quest
export interface MainQuestEvent {
  stage: number;
  id: string;
  trigger: MainQuestTrigger;
  title: string;
  description: string;
}

interface NarrativeState extends MainQuestState {
  // Azioni per la gestione della main quest
  advanceToNextStage: () => void;
  incrementProgress: () => void;
  setFlag: (key: string, value: boolean) => void;
  
  // Controllo dei trigger
  checkMainQuestTrigger: () => MainQuestEvent | null;
  
  // Caricamento degli eventi
  loadMainQuestEvents: () => Promise<MainQuestEvent[]>;
  
  // Reset e inizializzazione
  initializeNarrative: () => void;
  resetNarrative: () => void;
  
  // Eventi caricati
  mainQuestEvents: MainQuestEvent[];
}

export const useNarrativeStore = create<NarrativeState>()(subscribeWithSelector((set, get) => ({
  // Stato iniziale della Main Quest
  currentStage: 1,
  progressCounter: 0,
  flags: {},
  mainQuestEvents: [],
  
  // Azioni principali
  advanceToNextStage: () => {
    set((state) => {
      const nextStage = Math.min(state.currentStage + 1, 12);
      return {
        currentStage: nextStage
      };
    });
  },
  
  incrementProgress: () => {
    set((state) => ({
      progressCounter: state.progressCounter + 1
    }));
  },
  
  setFlag: (key: string, value: boolean) => {
    set((state) => ({
      flags: {
        ...state.flags,
        [key]: value
      }
    }));
  },
  
  // Controllo dei trigger per la main quest
  checkMainQuestTrigger: () => {
    const state = get();
    const currentEvent = state.mainQuestEvents.find(event => event.stage === state.currentStage);
    
    if (!currentEvent) return null;
    
    const trigger = currentEvent.trigger;
    
    // Verifica le condizioni del trigger
    switch (trigger.type) {
      case 'progress':
        return state.progressCounter >= (trigger.value || 0) ? currentEvent : null;
      
      case 'survival_stat':
        // Qui dovresti accedere al characterStore per verificare le statistiche
        // Per ora ritorna null, sarà implementato quando integrato
        return null;
      
      case 'combat_end':
        // Verificato tramite flag impostato dal sistema di combattimento
        return state.flags[`combat_${trigger.result}`] ? currentEvent : null;
      
      case 'survival_days':
        // Verificato tramite timeStore
        return null;
      
      case 'enter_biome':
        // Verificato tramite worldStore
        return state.flags[`entered_biome_${trigger.biome}`] ? currentEvent : null;
      
      case 'level_up':
        // Verificato tramite characterStore
        return state.flags[`reached_level_${trigger.level}`] ? currentEvent : null;
      
      case 'use_item':
        // Verificato tramite inventoryStore
        return state.flags[`used_item_${trigger.itemId}`] ? currentEvent : null;
      
      case 'event_choice':
        // Verificato quando il giocatore completa un evento specifico
        return state.flags[`completed_event_${trigger.eventId}`] ? currentEvent : null;
      
      case 'reach_location':
        // Verificato tramite worldStore
        return state.flags[`reached_${trigger.x}_${trigger.y}`] ? currentEvent : null;
      
      case 'reach_end':
        // Verificato quando il giocatore raggiunge la fine del gioco
        return state.flags['reached_safe_place'] ? currentEvent : null;
      
      default:
        return null;
    }
  },
  
  // Caricamento degli eventi della main quest
  loadMainQuestEvents: async () => {
    try {
      const response = await fetch('/src/data/events/main_quest_events.json');
      const data = await response.json();
      const events = data.MAIN_QUEST as MainQuestEvent[];
      
      set({ mainQuestEvents: events });
      return events;
    } catch (error) {
      console.error('Errore nel caricamento degli eventi della main quest:', error);
      return [];
    }
  },
  // Inizializzazione del sistema narrativo
  initializeNarrative: () => {
    set({
      currentStage: 1,
      progressCounter: 0,
      flags: {},
      mainQuestEvents: []
    });
    
    // Carica gli eventi della main quest
    get().loadMainQuestEvents();
  },
  
  resetNarrative: () => {
    get().initializeNarrative();
  }
})));

// Selettori semplificati per componenti React
export const selectCurrentStage = (state: NarrativeState) => state.currentStage;
export const selectProgressCounter = (state: NarrativeState) => state.progressCounter;
export const selectFlags = (state: NarrativeState) => state.flags;
export const selectMainQuestEvents = (state: NarrativeState) => state.mainQuestEvents;