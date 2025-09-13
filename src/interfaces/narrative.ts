// Interfacce per il Sistema Narrativo Canonico

export enum QuestStage {
  TESTAMENTO_PADRE = 1,
  FRAMMENTI_VERITA = 2,
  RICORDI_LENA = 3,
  COMPRENSIONE_PASSATO = 4,
  ACCETTAZIONE = 5,
  SAFE_PLACE_TROVATO = 6,
  EPILOGO = 7,
  FRAMMENTO_11 = 11 // Frammento speciale del carillon
}

export enum TextTone {
  MALINCONICO = 'malinconico',
  POETICO = 'poetico',
  INTROSPETTIVO = 'introspettivo',
  NOSTALGICO = 'nostalgico',
  SPERANZOSO = 'speranzoso',
  DOLOROSO = 'doloroso'
}

export enum MoralAlignment {
  ELIAN = 'elian', // Pragmatico, protettivo
  LENA = 'lena',   // Compassionevole, altruista
  NEUTRAL = 'neutral'
}

export interface EmotionalState {
  // Metriche principali di crescita emotiva
  compassionLevel: number; // 0-100, influenzato da scelte tipo Lena
  pragmatismLevel: number; // 0-100, influenzato da scelte tipo Elian
  understandingLevel: number; // 0-100, cresce con scoperte sulla famiglia
  
  // Connessioni specifiche ai genitori
  lenaMemoryStrength: number; // 0-100, quanto Ultimo si connette a Lena
  elianEmpathy: number; // 0-100, quanto comprende le scelte del padre
  
  // Evoluzione del personaggio
  innocenceLost: number; // 0-100, perdita dell'innocenza attraverso le esperienze
  wisdomGained: number; // 0-100, saggezza acquisita dalle riflessioni
  
  // Stato emotivo corrente
  currentMood: 'sereno' | 'malinconico' | 'curioso' | 'turbato' | 'determinato';
  dominantEmotion: 'nostalgia' | 'speranza' | 'dolore' | 'accettazione' | 'amore';
}

export interface MoralChoice {
  id: string;
  eventId: string;
  choiceText: string;
  alignment: MoralAlignment;
  emotionalImpact: {
    compassionLevel?: number;
    pragmatismLevel?: number;
    understandingLevel?: number;
    lenaMemoryStrength?: number;
    elianEmpathy?: number;
    innocenceLost?: number;
    wisdomGained?: number;
  };
  reflectionText: string; // Riflessione di Ultimo post-scelta
  timestamp: number;
}

export interface LoreEvent {
  id: string;
  title: string;
  category: 'thematic' | 'lena_memory' | 'elian_legacy' | 'family_discovery';
  
  // Condizioni di attivazione
  questStageRequirement?: QuestStage[];
  emotionalPrerequisites?: Partial<EmotionalState>;
  locationRequirement?: string[];
  
  // Contenuto narrativo
  description: string;
  narrativeText: string;
  tone: TextTone;
  
  // Scelte morali disponibili
  choices: NarrativeChoice[];
  
  // Metadati
  isRepeatable: boolean;
  priority: number; // Per determinare quale evento mostrare se più sono disponibili
}

export interface NarrativeChoice {
  id: string;
  text: string;
  alignment: MoralAlignment;
  
  // Impatto emotivo della scelta
  emotionalImpact: Partial<EmotionalState>;
  
  // Testo di riflessione post-scelta
  reflectionText: string;
  
  // Conseguenze narrative
  unlockEvents?: string[]; // ID di eventi che questa scelta sblocca
  questProgression?: {
    advanceToStage?: QuestStage;
    unlockFragments?: string[];
  };
}

export interface QuestFragment {
  id: string;
  stage: QuestStage;
  title: string;
  
  // Condizioni di attivazione
  activationConditions: {
    questStage: QuestStage;
    emotionalThreshold?: Partial<EmotionalState>;
    requiredItems?: string[];
    locationContext?: string;
    actionContext?: string;
  };
  
  // Contenuto del frammento
  narrativeText: string;
  tone: TextTone;
  
  // Impatto emotivo della scoperta
  emotionalImpact: Partial<EmotionalState>;
  
  // Progressione
  completionRewards?: {
    questAdvancement?: boolean;
    unlockedReflections?: string[];
    emotionalMilestone?: string;
  };
}

export interface NarrativeEngine {
  // Stato corrente
  currentQuestStage: QuestStage;
  emotionalState: EmotionalState;
  
  // Storia delle scelte
  moralChoicesHistory: MoralChoice[];
  discoveredFragments: string[];
  completedLoreEvents: string[];
  
  // Tracking progressione
  questProgress: {
    [key in QuestStage]?: {
      started: boolean;
      completed: boolean;
      fragmentsFound: string[];
      emotionalMilestones: string[];
    }
  };
  
  // Oggetti narrativi speciali
  questItems: {
    musicBox: {
      discovered: boolean;
      used: boolean;
      triggerConditionsMet: boolean;
    };
  };
}

export interface NarrativeCombatResult {
  standardResult: any; // Risultato del combattimento normale
  narrativeReflection: {
    text: string;
    tone: TextTone;
    emotionalImpact: Partial<EmotionalState>;
    moralWeight: number; // Peso morale della violenza usata
  };
}

export interface ComplexTriggerCondition {
  questStage: QuestStage;
  requiredItems: string[];
  location: string;
  locationDepth?: 'surface' | 'deep_territory';
  actionContext: string;
  emotionalThreshold?: Partial<EmotionalState>;
}

// Tipi di utilità
export type NarrativeEventType = 'quest_fragment' | 'lore_event' | 'moral_choice' | 'reflection' | 'milestone';

export interface NarrativeTextGenerator {
  generateReflection(context: {
    eventType: NarrativeEventType;
    emotionalState: EmotionalState;
    recentChoices: MoralChoice[];
    questStage: QuestStage;
  }): {
    text: string;
    tone: TextTone;
  };
}