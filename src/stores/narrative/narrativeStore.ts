import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { EmotionalState, LoreEvent, QuestFragment, MoralChoice } from '../../interfaces/narrative';
import { createLogger } from '../../services/loggerService';

const logger = createLogger('NARRATIVE');

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
  // Stato emotivo del personaggio
  emotionalState: EmotionalState;
  
  // Eventi narrativi disponibili
  availableLoreEvents: LoreEvent[];
  discoveredFragments: QuestFragment[];
  moralChoices: MoralChoice[];
  
  // Azioni per la gestione della main quest
  advanceToNextStage: () => void;
  incrementProgress: () => void;
  setFlag: (key: string, value: boolean) => void;
  
  // Controllo dei trigger
  checkMainQuestTrigger: () => MainQuestEvent | null;
  
  // Caricamento degli eventi
  loadMainQuestEvents: () => Promise<MainQuestEvent[]>;
  loadLoreEvents: () => Promise<void>;
  
  // Reset e inizializzazione
  initializeNarrative: () => void;
  resetNarrative: () => void;
  
  // Gestione dello stato emotivo
  updateEmotionalState: (updates: Partial<EmotionalState>) => void;
  
  // Gestione eventi narrativi
  triggerLoreEvent: (event: LoreEvent) => void;
  addMoralChoice: (choice: MoralChoice) => void;
  
  // Eventi caricati
  mainQuestEvents: MainQuestEvent[];
}

export const useNarrativeStore = create<NarrativeState>()(subscribeWithSelector((set, get) => ({
  // Stato iniziale della Main Quest
  currentStage: 1,
  progressCounter: 0,
  flags: {},
  mainQuestEvents: [],
  
  // Eventi narrativi iniziali
  availableLoreEvents: [],
  discoveredFragments: [],
  moralChoices: [],
  
  // Stato emotivo iniziale
  emotionalState: {
    compassionLevel: 50,
    pragmatismLevel: 50,
    understandingLevel: 0,
    lenaMemoryStrength: 30,
    elianEmpathy: 20,
    innocenceLost: 10,
    wisdomGained: 0,
    currentMood: 'curioso',
    dominantEmotion: 'nostalgia'
  },
  
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
      const response = await fetch('/events/main_quest_events.json');
      const data = await response.json();
      const events = data.MAIN_QUEST as MainQuestEvent[];

      set({ mainQuestEvents: events });
      return events;
    } catch (error) {
      logger.error('Failed to load main quest events', { error });
      return [];
    }
  },

  // Caricamento degli eventi lore
  loadLoreEvents: async () => {
    logger.debug('Loading lore events');
    try {
      const response = await fetch('/events/lore_events.json');
      logger.debug('Fetch response received', { status: response.status, ok: response.ok });

      const data = await response.json();
      logger.debug('Raw data received', { data });

      const events = data.LORE_EVENTS as LoreEvent[];
      logger.debug('Parsed events', {
        count: events?.length || 0,
        events: events?.map(e => ({ id: e.id, biome: e.locationRequirement })) || []
      });

      set({ availableLoreEvents: events || [] });
      logger.info('Lore events loaded successfully', { eventCount: events?.length || 0 });
    } catch (error) {
      logger.error('Failed to load lore events', { error });
      set({ availableLoreEvents: [] });
    }
  },

  // Gestione eventi narrativi
  triggerLoreEvent: (event: LoreEvent) => {
    set((state) => ({
      discoveredFragments: [...state.discoveredFragments, ...event.choices.map(choice => ({
        id: `${event.id}_${choice.id}`,
        stage: state.currentStage,
        title: event.title,
        activationConditions: {
          questStage: state.currentStage,
          emotionalThreshold: event.emotionalPrerequisites,
          locationContext: event.locationRequirement?.[0]
        },
        narrativeText: event.narrativeText,
        tone: event.tone,
        emotionalImpact: choice.emotionalImpact
      }))]
    }));
  },

  addMoralChoice: (choice: MoralChoice) => {
    set((state) => ({
      moralChoices: [...state.moralChoices, choice]
    }));
  },
  // Inizializzazione del sistema narrativo
  initializeNarrative: () => {
    set({
      currentStage: 1,
      progressCounter: 0,
      flags: {},
      mainQuestEvents: [],
      availableLoreEvents: [],
      discoveredFragments: [],
      moralChoices: [],
      emotionalState: {
        compassionLevel: 50,
        pragmatismLevel: 50,
        understandingLevel: 0,
        lenaMemoryStrength: 30,
        elianEmpathy: 20,
        innocenceLost: 10,
        wisdomGained: 0,
        currentMood: 'curioso',
        dominantEmotion: 'nostalgia'
      }
    });
    
    // Carica gli eventi della main quest e lore
    get().loadMainQuestEvents();
    get().loadLoreEvents();
  },
  
  resetNarrative: () => {
    get().initializeNarrative();
  },
  
  updateEmotionalState: (updates: Partial<EmotionalState>) => {
    set((state) => ({
      emotionalState: {
        ...state.emotionalState,
        ...updates
      }
    }));
  }
})));

// Selettori semplificati per componenti React
export const selectCurrentStage = (state: NarrativeState) => state.currentStage;
export const selectProgressCounter = (state: NarrativeState) => state.progressCounter;
export const selectFlags = (state: NarrativeState) => state.flags;
export const selectMainQuestEvents = (state: NarrativeState) => state.mainQuestEvents;