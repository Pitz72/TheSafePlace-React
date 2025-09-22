/**
 * Narrative Domain - Stato del sistema narrativo
 * Gestisce quest, stati emotivi e progressione storia
 */

export interface QuestFragment {
  id: string;
  title: string;
  description: string;
  objectives: {
    id: string;
    description: string;
    completed: boolean;
    type: 'location' | 'item' | 'action' | 'survival' | 'emotional';
    target?: any;
  }[];
  rewards: {
    experience?: number;
    items?: string[];
    emotionalImpact?: Record<string, number>;
  };
  prerequisites: {
    questId?: string;
    emotionalState?: Record<string, { min?: number; max?: number }>;
    survivalState?: Record<string, { min?: number; max?: number }>;
  };
  status: 'locked' | 'available' | 'active' | 'completed' | 'failed';
  discovered: boolean;
  completedAt?: number; // timestamp
}

export interface MainQuest {
  id: string;
  title: string;
  fragments: QuestFragment[];
  currentFragmentIndex: number;
  overallProgress: number; // 0-100
  theme: string;
  emotionalArc: {
    introduction: Record<string, number>;
    development: Record<string, number>;
    climax: Record<string, number>;
    resolution: Record<string, number>;
  };
}

export interface EmotionalState {
  // Emozioni base
  happiness: number; // 0-100
  fear: number; // 0-100
  anger: number; // 0-100
  hope: number; // 0-100

  // Emozioni complesse
  despair: number; // 0-100
  determination: number; // 0-100
  nostalgia: number; // 0-100
  curiosity: number; // 0-100

  // Stati mentali
  sanity: number; // 0-100 (sanità mentale)
  morale: number; // 0-100 (morale generale)

  // Modificatori temporanei
  modifiers: {
    id: string;
    emotion: string;
    value: number;
    duration: number; // minuti rimanenti
    source: string;
  }[];
}

export interface NarrativeState {
  /** Quest principale */
  mainQuest: MainQuest;

  /** Quest secondarie attive */
  activeQuests: QuestFragment[];

  /** Quest completate */
  completedQuests: string[];

  /** Stato emotivo corrente */
  emotionalState: EmotionalState;

  /** Eventi narrativi incontrati */
  encounteredEvents: string[];

  /** Scelte fatte dal giocatore */
  choices: {
    eventId: string;
    choiceId: string;
    timestamp: number;
    consequences?: Record<string, any>;
  }[];

  /** Stato del mondo narrativo */
  worldState: {
    factions: Record<string, { reputation: number; status: string }>;
    locations: Record<string, { discovered: boolean; status: string }>;
    characters: Record<string, { met: boolean; relationship: number; status: string }>;
  };
}

export function createInitialNarrativeState(): NarrativeState {
  return {
    mainQuest: {
      id: 'lullaby-of-ashes',
      title: 'Lullaby of Ashes',
      fragments: [], // Sarà popolato dalla migrazione contenuti
      currentFragmentIndex: 0,
      overallProgress: 0,
      theme: 'redenzione e perdita',
      emotionalArc: {
        introduction: { fear: 20, curiosity: 30, hope: 10 },
        development: { despair: 40, determination: 25, nostalgia: 15 },
        climax: { fear: 60, anger: 30, hope: 20 },
        resolution: { happiness: 50, hope: 40, nostalgia: 30 }
      }
    },

    activeQuests: [],
    completedQuests: [],

    emotionalState: {
      happiness: 20,
      fear: 60,
      anger: 30,
      hope: 40,
      despair: 25,
      determination: 35,
      nostalgia: 15,
      curiosity: 45,
      sanity: 75,
      morale: 45,
      modifiers: []
    },

    encounteredEvents: [],
    choices: [],

    worldState: {
      factions: {},
      locations: {},
      characters: {}
    }
  };
}

export function updateEmotionalState(
  state: EmotionalState,
  changes: Partial<EmotionalState>,
  timePassed: number = 0
): EmotionalState {
  const newState = { ...state };

  // Applica cambiamenti diretti
  Object.assign(newState, changes);

  // Aggiorna modificatori temporanei
  newState.modifiers = newState.modifiers
    .map(modifier => ({
      ...modifier,
      duration: modifier.duration - timePassed
    }))
    .filter(modifier => modifier.duration > 0);

  // Applica effetti dei modificatori
  newState.modifiers.forEach(modifier => {
    const emotion = modifier.emotion as keyof EmotionalState;
    if (typeof newState[emotion] === 'number') {
      (newState[emotion] as number) += modifier.value;
    }
  });

  // Mantieni valori nei limiti 0-100
  Object.keys(newState).forEach(key => {
    if (typeof newState[key as keyof EmotionalState] === 'number' &&
        key !== 'modifiers') {
      const emotionKey = key as keyof EmotionalState;
      (newState[emotionKey] as number) = Math.max(0, Math.min(100,
        newState[emotionKey] as number));
    }
  });

  // Calcola morale basato sulle emozioni
  newState.morale = calculateMorale(newState);

  // Calcola sanità mentale
  newState.sanity = calculateSanity(newState);

  return newState;
}

export function addEmotionalModifier(
  state: EmotionalState,
  modifier: EmotionalState['modifiers'][0]
): EmotionalState {
  const newState = { ...state };
  newState.modifiers.push(modifier);
  return updateEmotionalState(newState, {});
}

export function processQuestObjective(
  quest: QuestFragment,
  objectiveId: string,
  data?: any
): QuestFragment {
  const newQuest = { ...quest };
  const objective = newQuest.objectives.find(obj => obj.id === objectiveId);

  if (objective && !objective.completed) {
    // Logica specifica per tipo di obiettivo
    switch (objective.type) {
      case 'location':
        if (data?.location === objective.target) {
          objective.completed = true;
        }
        break;
      case 'item':
        if (data?.itemId === objective.target) {
          objective.completed = true;
        }
        break;
      case 'action':
        if (data?.action === objective.target) {
          objective.completed = true;
        }
        break;
      case 'survival':
        if (data?.survivalMetric >= objective.target) {
          objective.completed = true;
        }
        break;
      case 'emotional':
        if (data?.emotion === objective.target.emotion &&
            data?.value >= objective.target.threshold) {
          objective.completed = true;
        }
        break;
    }
  }

  return newQuest;
}

export function checkQuestCompletion(quest: QuestFragment): boolean {
  return quest.objectives.every(obj => obj.completed);
}

export function getEmotionalProfile(state: EmotionalState): {
  dominantEmotion: string;
  emotionalState: 'calm' | 'tense' | 'distressed' | 'broken';
  traits: string[];
} {
  const emotions = {
    happiness: state.happiness,
    fear: state.fear,
    anger: state.anger,
    hope: state.hope,
    despair: state.despair,
    determination: state.determination,
    nostalgia: state.nostalgia,
    curiosity: state.curiosity
  };

  // Trova emozione dominante
  const dominant = Object.entries(emotions)
    .reduce((prev, curr) => curr[1] > prev[1] ? curr : prev);

  // Determina stato emotivo generale
  let emotionalState: 'calm' | 'tense' | 'distressed' | 'broken' = 'calm';

  if (state.fear > 70 || state.anger > 70 || state.despair > 70) {
    emotionalState = 'distressed';
  } else if (state.fear > 50 || state.anger > 50 || state.despair > 50) {
    emotionalState = 'tense';
  }

  if (state.sanity < 30 || state.morale < 20) {
    emotionalState = 'broken';
  }

  // Determina tratti caratteriali basati sulle emozioni
  const traits: string[] = [];

  if (state.determination > 70) traits.push('determinato');
  if (state.curiosity > 70) traits.push('curioso');
  if (state.fear > 60) traits.push('cauto');
  if (state.hope > 60) traits.push('ottimista');
  if (state.despair > 60) traits.push('disilluso');
  if (state.nostalgia > 60) traits.push('nostalgico');

  return {
    dominantEmotion: dominant[0],
    emotionalState,
    traits
  };
}

function calculateMorale(emotionalState: EmotionalState): number {
  // Morale basato su emozioni positive vs negative
  const positive = emotionalState.happiness + emotionalState.hope + emotionalState.determination;
  const negative = emotionalState.fear + emotionalState.anger + emotionalState.despair;

  const morale = (positive - negative + 200) / 4; // Scala 0-100
  return Math.max(0, Math.min(100, morale));
}

function calculateSanity(emotionalState: EmotionalState): number {
  // Sanità mentale influenzata da disperazione e paura
  const sanityDrain = emotionalState.despair * 0.5 + emotionalState.fear * 0.3;
  const sanityBoost = emotionalState.hope * 0.4 + emotionalState.determination * 0.3;

  const sanity = 100 - sanityDrain + sanityBoost;
  return Math.max(0, Math.min(100, sanity));
}

export function applyChoiceConsequences(
  narrativeState: NarrativeState,
  choice: NarrativeState['choices'][0]
): NarrativeState {
  const newState = { ...narrativeState };

  // Applica conseguenze emotive
  if (choice.consequences?.emotional) {
    newState.emotionalState = updateEmotionalState(
      newState.emotionalState,
      choice.consequences.emotional
    );
  }

  // Applica conseguenze sul mondo
  if (choice.consequences?.worldState) {
    Object.assign(newState.worldState, choice.consequences.worldState);
  }

  // Registra la scelta
  newState.choices.push(choice);

  return newState;
}