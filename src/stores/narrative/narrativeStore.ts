import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  NarrativeEngine,
  EmotionalState,
  QuestStage,
  MoralChoice,
  MoralAlignment,
  LoreEvent,
  QuestFragment,
  NarrativeChoice,
  TextTone,
  ComplexTriggerCondition
} from '../../interfaces/narrative';

// Stato emotivo iniziale di Ultimo
const initialEmotionalState: EmotionalState = {
  compassionLevel: 30, // Ultimo inizia con una base di compassione
  pragmatismLevel: 20, // Meno pragmatico all'inizio
  understandingLevel: 10, // Comprensione limitata del passato
  lenaMemoryStrength: 15, // Ricordi vaghi della madre
  elianEmpathy: 25, // Comprende parzialmente il padre
  innocenceLost: 5, // Ancora relativamente innocente
  wisdomGained: 10, // Poca saggezza acquisita
  currentMood: 'curioso',
  dominantEmotion: 'nostalgia'
};

interface NarrativeState extends NarrativeEngine {
  // Azioni per la gestione della quest
  advanceQuestStage: (newStage: QuestStage) => void;
  recordMoralChoice: (choice: MoralChoice) => void;
  updateEmotionalState: (changes: Partial<EmotionalState>) => void;
  
  // Azioni per frammenti e eventi
  discoverFragment: (fragmentId: string) => void;
  completeLoreEvent: (eventId: string) => void;
  
  // Selettori
  getAvailableLoreEvents: () => LoreEvent[];
  shouldTriggerQuestEvent: (conditions: ComplexTriggerCondition) => boolean;
  getLastReflection: () => string | null;
  
  // Gestione oggetti narrativi
  discoverMusicBox: () => void;
  useMusicBox: () => boolean;
  
  // Sistema di riflessioni
  generateReflection: (context: {
    eventType: string;
    choiceAlignment?: MoralAlignment;
    combatResult?: any;
  }) => { text: string; tone: TextTone };
  
  // Reset e inizializzazione
  initializeNarrative: () => void;
  resetNarrative: () => void;
}

export const useNarrativeStore = create<NarrativeState>()(subscribeWithSelector((set, get) => ({
  // Stato iniziale
  currentQuestStage: QuestStage.TESTAMENTO_PADRE,
  emotionalState: initialEmotionalState,
  moralChoicesHistory: [],
  discoveredFragments: [],
  completedLoreEvents: [],
  
  questProgress: {
    [QuestStage.TESTAMENTO_PADRE]: {
      started: true,
      completed: false,
      fragmentsFound: [],
      emotionalMilestones: []
    }
  },
  
  questItems: {
    musicBox: {
      discovered: false,
      used: false,
      triggerConditionsMet: false
    }
  },
  
  // Azioni principali
  advanceQuestStage: (newStage: QuestStage) => {
    set((state) => {
      const newProgress = { ...state.questProgress };
      
      // Completa lo stage corrente
      if (newProgress[state.currentQuestStage]) {
        newProgress[state.currentQuestStage].completed = true;
      }
      
      // Inizia il nuovo stage
      if (!newProgress[newStage]) {
        newProgress[newStage] = {
          started: true,
          completed: false,
          fragmentsFound: [],
          emotionalMilestones: []
        };
      } else {
        newProgress[newStage].started = true;
      }
      
      return {
        currentQuestStage: newStage,
        questProgress: newProgress
      };
    });
  },
  
  recordMoralChoice: (choice: MoralChoice) => {
    set((state) => {
      // Applica l'impatto emotivo
      const newEmotionalState = { ...state.emotionalState };
      Object.entries(choice.emotionalImpact).forEach(([key, value]) => {
        if (value !== undefined && key in newEmotionalState) {
          (newEmotionalState as any)[key] = Math.max(0, Math.min(100, 
            (newEmotionalState as any)[key] + value
          ));
        }
      });
      
      // Aggiorna l'umore basato sui cambiamenti
      newEmotionalState.currentMood = get().calculateMoodFromState(newEmotionalState);
      newEmotionalState.dominantEmotion = get().calculateDominantEmotion(newEmotionalState);
      
      return {
        moralChoicesHistory: [...state.moralChoicesHistory, choice],
        emotionalState: newEmotionalState
      };
    });
  },
  
  updateEmotionalState: (changes: Partial<EmotionalState>) => {
    set((state) => {
      const newEmotionalState = { ...state.emotionalState, ...changes };
      
      // Assicura che i valori rimangano nel range 0-100
      Object.keys(changes).forEach(key => {
        if (typeof (newEmotionalState as any)[key] === 'number' && 
            key !== 'currentMood' && key !== 'dominantEmotion') {
          (newEmotionalState as any)[key] = Math.max(0, Math.min(100, (newEmotionalState as any)[key]));
        }
      });
      
      return { emotionalState: newEmotionalState };
    });
  },
  
  discoverFragment: (fragmentId: string) => {
    set((state) => {
      if (!state.discoveredFragments.includes(fragmentId)) {
        const newProgress = { ...state.questProgress };
        const currentStageProgress = newProgress[state.currentQuestStage];
        
        if (currentStageProgress) {
          currentStageProgress.fragmentsFound.push(fragmentId);
        }
        
        return {
          discoveredFragments: [...state.discoveredFragments, fragmentId],
          questProgress: newProgress
        };
      }
      return state;
    });
  },
  
  completeLoreEvent: (eventId: string) => {
    set((state) => {
      if (!state.completedLoreEvents.includes(eventId)) {
        return {
          completedLoreEvents: [...state.completedLoreEvents, eventId]
        };
      }
      return state;
    });
  },
  
  // Selettori
  getAvailableLoreEvents: () => {
    const state = get();
    // Qui implementeremo la logica per filtrare gli eventi disponibili
    // basata su questStage, stato emotivo, e eventi già completati
    return [];
  },
  
  shouldTriggerQuestEvent: (conditions: ComplexTriggerCondition) => {
    const state = get();
    
    // Verifica stage della quest
    if (state.currentQuestStage !== conditions.questStage) {
      return false;
    }
    
    // Verifica oggetti richiesti (implementazione semplificata)
    // In una implementazione completa, questo dovrebbe controllare l'inventario
    
    // Verifica soglie emotive se specificate
    if (conditions.emotionalThreshold) {
      for (const [key, threshold] of Object.entries(conditions.emotionalThreshold)) {
        if ((state.emotionalState as any)[key] < threshold) {
          return false;
        }
      }
    }
    
    return true;
  },
  
  getLastReflection: () => {
    const state = get();
    if (state.moralChoicesHistory.length === 0) return null;
    return state.moralChoicesHistory[state.moralChoicesHistory.length - 1].reflectionText;
  },
  
  // Gestione oggetti narrativi
  discoverMusicBox: () => {
    set((state) => ({
      questItems: {
        ...state.questItems,
        musicBox: {
          ...state.questItems.musicBox,
          discovered: true
        }
      }
    }));
  },
  
  useMusicBox: () => {
    const state = get();
    
    // Verifica condizioni per l'uso del carillon
    const canUse = state.questItems.musicBox.discovered && 
                   state.currentQuestStage === QuestStage.FRAMMENTO_11;
    
    if (canUse) {
      set((state) => ({
        questItems: {
          ...state.questItems,
          musicBox: {
            ...state.questItems.musicBox,
            used: true
          }
        }
      }));
      return true;
    }
    
    return false;
  },
  
  // Sistema di riflessioni
  generateReflection: (context) => {
    const state = get();
    
    // Logica semplificata per generare riflessioni
    // In una implementazione completa, questo userebbe i file JSON dei testi
    let text = "Ultimo riflette sulle sue azioni...";
    let tone = TextTone.INTROSPETTIVO;
    
    if (context.choiceAlignment === MoralAlignment.LENA) {
      text = "Le parole di mamma risuonano nel mio cuore. Forse la compassione è davvero la strada giusta.";
      tone = TextTone.NOSTALGICO;
    } else if (context.choiceAlignment === MoralAlignment.ELIAN) {
      text = "Papà aveva ragione. A volte bisogna essere pragmatici per sopravvivere.";
      tone = TextTone.MALINCONICO;
    }
    
    return { text, tone };
  },
  
  // Funzioni di utilità (non esposte nell'interfaccia)
  calculateMoodFromState: (emotionalState: EmotionalState) => {
    if (emotionalState.compassionLevel > 70) return 'sereno';
    if (emotionalState.understandingLevel > 60) return 'determinato';
    if (emotionalState.innocenceLost > 50) return 'turbato';
    if (emotionalState.lenaMemoryStrength > 40) return 'malinconico';
    return 'curioso';
  },
  
  calculateDominantEmotion: (emotionalState: EmotionalState) => {
    if (emotionalState.lenaMemoryStrength > 60) return 'nostalgia';
    if (emotionalState.wisdomGained > 50) return 'accettazione';
    if (emotionalState.compassionLevel > 70) return 'amore';
    if (emotionalState.innocenceLost > 60) return 'dolore';
    return 'speranza';
  },
  
  // Inizializzazione e reset
  initializeNarrative: () => {
    set(() => ({
      currentQuestStage: QuestStage.TESTAMENTO_PADRE,
      emotionalState: initialEmotionalState,
      moralChoicesHistory: [],
      discoveredFragments: [],
      completedLoreEvents: [],
      questProgress: {
        [QuestStage.TESTAMENTO_PADRE]: {
          started: true,
          completed: false,
          fragmentsFound: [],
          emotionalMilestones: []
        }
      },
      questItems: {
        musicBox: {
          discovered: false,
          used: false,
          triggerConditionsMet: false
        }
      }
    }));
  },
  
  resetNarrative: () => {
    get().initializeNarrative();
  }
})));

// Selettori per componenti React
export const selectCurrentQuestStage = (state: NarrativeState) => state.currentQuestStage;
export const selectEmotionalState = (state: NarrativeState) => state.emotionalState;
export const selectMoralChoicesHistory = (state: NarrativeState) => state.moralChoicesHistory;
export const selectQuestProgress = (state: NarrativeState) => state.questProgress;