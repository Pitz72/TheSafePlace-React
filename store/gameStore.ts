import { create } from 'zustand';
import { GameState, GameStoreState, TileInfo, JournalEntryType, GameTime, MainStoryChapter, Cutscene, CutsceneConsequence, CharacterState, PlayerStatusCondition, DeathCause } from '../types';
import { MAP_DATA } from '../data/mapData';
import { useCharacterStore } from './characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useMainStoryDatabaseStore } from '../data/mainStoryDatabase';
import { useCutsceneDatabaseStore } from '../data/cutsceneDatabase';
import { MOUNTAIN_MESSAGES, BIOME_MESSAGES, ATMOSPHERIC_MESSAGES, BIOME_COLORS } from '../constants';
import { audioManager } from '../utils/audio';

import { useTimeStore } from './timeStore';
import { useInteractionStore } from './interactionStore';
import { useEventStore } from './eventStore';
import { useCombatStore } from './combatStore';

// --- Save Game System ---
const SAVE_VERSION = "2.0.0"; // Version for the modular save system
const LAST_SAVE_SLOT_KEY = 'tspc_last_save_slot';

const migrateSaveData = (saveData: any): any => {
  const version = saveData.saveVersion || "1.0.0";
  if (version === "1.0.0") {
    // Migration logic...
  }
  return saveData;
};

// --- Helper Functions ---
const timeToMinutes = (time: GameTime): number => (time.day - 1) * 1440 + time.hour * 60 + time.minute;
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];


const TILE_NAMES: Record<string, string> = {
    '.': 'Pianura', 'F': 'Foresta', '~': 'Acqua', 'M': 'Montagna',
    'R': 'Rifugio', 'C': 'Città', 'V': 'Villaggio',
    'S': 'Punto di Partenza', 'E': 'Destinazione', '@': 'Tu'
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  // --- State ---
  gameState: GameState.INITIAL_BLACK_SCREEN,
  previousGameState: null,
  visualTheme: 'standard',
  map: [],
  playerPos: { x: 0, y: 0 },
  playerStatus: { isExitingWater: false },
  journal: [],
  currentBiome: '',
  lastRestTime: null,
  lastEncounterTime: null,
  lastSearchedBiome: null,
  lastLoreEventDay: null,
  lootedRefuges: [],
  visitedRefuges: [],
  mainStoryStage: 1,
  totalSteps: 0,
  totalCombatWins: 0,
  activeMainStoryEvent: null,
  activeCutscene: null,
  gameFlags: new Set(),
  mainStoryEventsToday: { day: 0, count: 0 },
  deathCause: null,
  visitedBiomes: new Set(),
  damageFlash: false,

  triggerDamageFlash: () => {
    set({ damageFlash: true });
    setTimeout(() => set({ damageFlash: false }), 150);
  },

  // --- Actions ---
  setGameState: (newState) => set(state => ({
    previousGameState: state.gameState !== newState ? state.gameState : state.previousGameState,
    gameState: newState,
  })),

  setGameOver: (cause: DeathCause) => {
    // ... (implementation unchanged)
  },
  
  setVisualTheme: (theme) => {
    // ... (implementation unchanged)
  },

  addJournalEntry: (entry) => {
    // ... (implementation unchanged)
  },

  setMap: () => {
    const newMap = MAP_DATA;
    let startPos = { x: 0, y: 0 };
    for (let y = 0; y < newMap.length; y++) {
      const x = newMap[y].indexOf('S');
      if (x !== -1) {
        startPos = { x, y };
        break;
      }
    }
    
    useTimeStore.getState().reset();
    useInteractionStore.getState().reset();
    useEventStore.getState().reset();
    useCombatStore.getState().reset();
    
    set({ 
        map: newMap, 
        playerPos: startPos,
        mainStoryStage: 1,
        activeMainStoryEvent: null,
        mainStoryEventsToday: { day: 1, count: 0 },
        // ... (other reset properties)
    });
    get().addJournalEntry({ text: "Benvenuto in The Safe Place...", type: JournalEntryType.GAME_START });
  },

  movePlayer: (dx, dy) => {
    // Placeholder
  },

  getTileInfo: (x, y) => {
    // ... (implementation unchanged)
  },
  
  performQuickRest: () => {
    // ... (implementation unchanged)
  },

  performActiveSearch: () => {
    // Placeholder
  },

  openLevelUpScreen: () => {
    // ... (implementation unchanged)
  },

  checkCutsceneTriggers: () => {
    // ... (implementation unchanged)
  },

  checkMainStoryTriggers: () => {
    const { gameTime } = useTimeStore.getState();
    const currentState = get();

    if (currentState.mainStoryEventsToday.day !== gameTime.day) {
        set({ mainStoryEventsToday: { day: gameTime.day, count: 0 } });
    }

    if (currentState.mainStoryEventsToday.count >= 2) return;
    if (currentState.activeMainStoryEvent || currentState.gameState !== GameState.IN_GAME) return;

    const { mainStoryChapters } = useMainStoryDatabaseStore.getState();
    const nextChapter = mainStoryChapters.find(c => c.stage === currentState.mainStoryStage);
    if (!nextChapter) return;

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight && !nextChapter.allowNightTrigger) return;

    let conditionMet = false;
    const trigger = nextChapter.trigger;
    const { level } = useCharacterStore.getState();

    switch (trigger.type) {
        case 'stepsTaken': conditionMet = currentState.totalSteps >= trigger.value; break;
        case 'daysSurvived': conditionMet = gameTime.day >= trigger.value; break;
        case 'levelReached': conditionMet = level >= trigger.value; break;
        case 'combatWins': conditionMet = currentState.totalCombatWins >= trigger.value; break;
        case 'reachLocation': conditionMet = currentState.playerPos.x === trigger.value.x && currentState.playerPos.y === trigger.value.y; break;
        case 'reachEnd':
            if (currentState.map[currentState.playerPos.y][currentState.playerPos.x] === 'E') {
                get().startCutscene('CS_FINAL_CONFRONTATION');
                return; // Avvia la cutscene finale e interrompe l'esecuzione.
            }
            break;
        case 'nearEnd': {
            let endPos: { x: number; y: number } | null = null;
            // ... (logic to find 'E')
            if (endPos) {
                const distance = Math.sqrt(Math.pow(currentState.playerPos.x - endPos.x, 2) + Math.pow(currentState.playerPos.y - endPos.y, 2));
                conditionMet = distance <= trigger.distance;
            }
            break;
        }
        case 'firstRefugeEntry': break;
    }
    if (conditionMet) {
        set(prevState => ({
            activeMainStoryEvent: nextChapter,
            gameState: GameState.MAIN_STORY,
            mainStoryEventsToday: {
                day: prevState.mainStoryEventsToday.day,
                count: prevState.mainStoryEventsToday.count + 1
            }
        }));
    }
  },

  resolveMainStory: () => {
    const completedStage = get().mainStoryStage;
    useCharacterStore.getState().unlockTrophy(`trophy_mq_${completedStage}`);
    set(state => ({
        mainStoryStage: state.mainStoryStage + 1,
        activeMainStoryEvent: null,
        gameState: GameState.IN_GAME,
    }));
  },
  
  startCutscene: (id) => {
    const { cutscenes } = useCutsceneDatabaseStore.getState();
    const cutsceneData = (cutscenes as unknown as Record<string, Cutscene>)[id];
    if (cutsceneData) {
        set({ activeCutscene: cutsceneData, gameState: GameState.CUTSCENE });
    }
  },

  processCutsceneConsequences: (consequences) => {
    // ... (implementation unchanged)
  },

  endCutscene: () => {
    // ... (implementation unchanged)
  },

  saveGame: (slot) => { /* ... */ return true; },
  loadGame: (slot) => { /* ... */ return true; },

  toJSON: () => {
    const state = get();
    return {
      ...state,
      gameFlags: Array.from(state.gameFlags),
      visitedBiomes: Array.from(state.visitedBiomes),
    };
  },
  fromJSON: (json) => {
    set({
      ...json,
      gameFlags: new Set(json.gameFlags),
      visitedBiomes: new Set(json.visitedBiomes),
    });
  },
  restoreState: (json) => {
    get().fromJSON(json);
  }
}));
