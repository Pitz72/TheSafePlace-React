import { create } from 'zustand';
import { GameState, GameStoreState, TileInfo, JournalEntryType, GameTime, MainQuestChapter, Cutscene, CutsceneConsequence, CharacterState, PlayerStatusCondition, DeathCause } from '../types';
import { MAP_DATA } from '../data/mapData';
import { useCharacterStore } from './characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useMainQuestDatabaseStore } from '../data/mainQuestDatabase';
import { useCutsceneDatabaseStore } from '../data/cutsceneDatabase';
import { MOUNTAIN_MESSAGES, BIOME_MESSAGES, ATMOSPHERIC_MESSAGES, BIOME_COLORS } from '../constants';
import { audioManager } from '../utils/audio';

import { useTimeStore } from './timeStore';
import { useInteractionStore } from './interactionStore';
import { useEventStore } from './eventStore';
import { useCombatStore } from './combatStore';

// --- Save Game System ---
const SAVE_VERSION = "1.0.0";
const LAST_SAVE_SLOT_KEY = 'tspc_last_save_slot';

/**
 * @interface SaveFile
 * @description Represents the structure of a save file.
 * @property {string} saveVersion - The version of the save file.
 * @property {number} timestamp - The timestamp when the game was saved.
 * @property {object} metadata - Additional information about the saved game.
 * @property {number} metadata.level - The character's level.
 * @property {number} metadata.day - The current day in the game.
 * @property {number} metadata.hour - The current hour in the game.
 * @property {number} metadata.minute - The current minute in the game.
 * @property {Omit<any, 'saveGame' | 'loadGame' | 'restoreState'>} gameStoreState - The state of the game store.
 * @property {Omit<CharacterState, 'restoreState'>} characterStoreState - The state of the character store.
 */
interface SaveFile {
    saveVersion: string;
    timestamp: number;
    metadata: {
        level: number;
        day: number;
        hour: number;
        minute: number;
    };
    // This is a representation of the MONOLITHIC state object that gets saved.
    // It's intentionally 'any' because it's a mix of multiple stores for serialization.
    gameStoreState: Omit<any, 'saveGame' | 'loadGame' | 'restoreState'>;
    characterStoreState: Omit<CharacterState, 'restoreState'>;
}

/**
 * @function migrateSaveData
 * @description Migrates save data to the current version.
 * @param {any} saveData - The save data to migrate.
 * @returns {SaveFile} The migrated save data.
 */
const migrateSaveData = (saveData: any): SaveFile => {
    if (!saveData.saveVersion) {
        throw new Error("Invalid save file: missing version.");
    }
    if (saveData.saveVersion !== SAVE_VERSION) {
        console.warn(`Save file version (${saveData.saveVersion}) does not match game version (${SAVE_VERSION}). Trying to load anyway.`);
    }
    if (Array.isArray(saveData.gameStoreState.gameFlags)) {
        saveData.gameStoreState.gameFlags = new Set(saveData.gameStoreState.gameFlags);
    }
     if (Array.isArray(saveData.characterStoreState.status)) {
        saveData.characterStoreState.status = new Set<PlayerStatusCondition>(saveData.characterStoreState.status);
    }
    // For Trophy system
    if (Array.isArray(saveData.characterStoreState.unlockedTrophies)) {
        saveData.characterStoreState.unlockedTrophies = new Set<string>(saveData.characterStoreState.unlockedTrophies);
    }
    if (Array.isArray(saveData.gameStoreState.visitedBiomes)) {
        saveData.gameStoreState.visitedBiomes = new Set<string>(saveData.gameStoreState.visitedBiomes);
    }
    return saveData as SaveFile;
};

// --- Helper Functions ---
/**
 * @function timeToMinutes
 * @description Converts a GameTime object to minutes.
 * @param {GameTime} time - The GameTime object to convert.
 * @returns {number} The time in minutes.
 */
const timeToMinutes = (time: GameTime): number => {
    return (time.day - 1) * 1440 + time.hour * 60 + time.minute;
};

/**
 * @function getRandom
 * @description Gets a random element from an array.
 * @param {T[]} arr - The array to get a random element from.
 * @returns {T} A random element from the array.
 */
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];


const TILE_NAMES: Record<string, string> = {
    '.': 'Pianura', 'F': 'Foresta', '~': 'Acqua', 'M': 'Montagna',
    'R': 'Rifugio', 'C': 'Città', 'V': 'Villaggio',
    'S': 'Punto di Partenza', 'E': 'Destinazione', '@': 'Tu'
};
const IMPASSABLE_TILES = new Set(['M']);
const TRAVERSABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~']);
const BASE_TIME_COST_PER_MOVE = 10;

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
  lastLoreEventDay: null,
  lootedRefuges: [],
  visitedRefuges: [],
  mainQuestStage: 1,
  totalSteps: 0,
  totalCombatWins: 0,
  activeMainQuestEvent: null,
  activeCutscene: null,
  gameFlags: new Set(),
  mainQuestsToday: { day: 0, count: 0 },
  deathCause: null,
  visitedBiomes: new Set(),

  // --- Actions ---
  /**
   * @function setGameState
   * @description Sets the current state of the game.
   * @param {GameState} newState - The new state of the game.
   */
  setGameState: (newState) => set(state => {
    if (state.gameState === newState) return { gameState: newState };
    return { 
        previousGameState: state.gameState, 
        gameState: newState 
    };
  }),

  /**
   * @function setGameOver
   * @description Sets the game state to GAME_OVER.
   * @param {DeathCause} cause - The cause of death.
   */
  setGameOver: (cause: DeathCause) => {
    const { unlockTrophy } = useCharacterStore.getState();
    unlockTrophy('trophy_misc_first_death');
    if(cause === 'STARVATION') unlockTrophy('trophy_misc_death_by_starvation');
    if(cause === 'DEHYDRATION') unlockTrophy('trophy_misc_death_by_dehydration');
    
    audioManager.playSound('defeat');
    get().addJournalEntry({ text: "Sei stato sconfitto...", type: JournalEntryType.SYSTEM_ERROR });
    set({ gameState: GameState.GAME_OVER, deathCause: cause });
  },
  
  /**
   * @function setVisualTheme
   * @description Sets the visual theme of the game.
   * @param {string} theme - The theme to set.
   */
  setVisualTheme: (theme) => {
    set({ visualTheme: theme });
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('tspc_visual_theme', theme);
  },

  /**
   * @function addJournalEntry
   * @description Adds a new entry to the journal.
   * @param {JournalEntry} entry - The journal entry to add.
   */
  addJournalEntry: (entry) => {
    const gameTime = useTimeStore.getState().gameTime;
    set(state => ({
        journal: [{ ...entry, time: gameTime }, ...state.journal].slice(0, 100)
    }));
    switch (entry.type) {
        case JournalEntryType.ITEM_ACQUIRED: audioManager.playSound('item_get'); break;
        case JournalEntryType.XP_GAIN: audioManager.playSound('xp_gain'); break;
        case JournalEntryType.ACTION_FAILURE:
        case JournalEntryType.SYSTEM_ERROR:
             audioManager.playSound('error');
             break;
    }
  },

  /**
   * @function setMap
   * @description Initializes the game map and player position.
   */
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
        playerStatus: { isExitingWater: false },
        journal: [],
        currentBiome: 'S',
        lastRestTime: null,
        lastEncounterTime: null,
        lastLoreEventDay: 0,
        lootedRefuges: [],
        visitedRefuges: [],
        mainQuestStage: 1,
        totalSteps: 0,
        totalCombatWins: 0,
        activeMainQuestEvent: null,
        gameFlags: new Set(),
        activeCutscene: null,
        mainQuestsToday: { day: 1, count: 0 },
        deathCause: null,
        visitedBiomes: new Set(['S']),
    });
    get().addJournalEntry({ text: "Benvenuto in The Safe Place. La tua avventura inizia ora.", type: JournalEntryType.GAME_START });
    get().addJournalEntry({ text: BIOME_MESSAGES['S'], type: JournalEntryType.NARRATIVE, color: BIOME_COLORS['S'] });
  },

  /**
   * @function movePlayer
   * @description Moves the player on the map.
   * @param {number} dx - The change in the x-coordinate.
   * @param {number} dy - The change in the y-coordinate.
   */
  movePlayer: (dx, dy) => {
    const { map, playerPos, playerStatus, addJournalEntry, visitedRefuges, currentBiome: previousBiome, checkMainQuestTriggers, checkCutsceneTriggers } = get();
    const { advanceTime, gameTime } = useTimeStore.getState();
    const { unlockTrophy } = useCharacterStore.getState();

    if (playerStatus.isExitingWater) {
        set({ playerStatus: { ...playerStatus, isExitingWater: false } });
        advanceTime(BASE_TIME_COST_PER_MOVE * 2);
        addJournalEntry({ text: "Con fatica, esci dall'acqua.", type: JournalEntryType.NARRATIVE });
        return;
    }

    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };

    if ( newPos.y < 0 || newPos.y >= map.length || newPos.x < 0 || newPos.x >= map[newPos.y].length ) return;
    
    const destinationTile = map[newPos.y][newPos.x];
    if (IMPASSABLE_TILES.has(destinationTile)) {
        const message = MOUNTAIN_MESSAGES[Math.floor(Math.random() * MOUNTAIN_MESSAGES.length)];
        addJournalEntry({ text: message, type: JournalEntryType.ACTION_FAILURE });
        return;
    }
    
    if (destinationTile === 'R') {
        const isVisited = visitedRefuges.some(pos => pos.x === newPos.x && pos.y === newPos.y);
        if (isVisited) {
            addJournalEntry({ text: "Hai già usato questo rifugio. Non offre più riparo.", type: JournalEntryType.ACTION_FAILURE });
            return;
        }
        set({ playerPos: newPos });
        useInteractionStore.getState().enterRefuge();
        return;
    }

    if (!TRAVERSABLE_TILES.has(destinationTile)) return;
    
    if (destinationTile !== previousBiome) {
        const biomeMessage = BIOME_MESSAGES[destinationTile];
        if (biomeMessage) {
            addJournalEntry({ text: biomeMessage, type: JournalEntryType.NARRATIVE, color: BIOME_COLORS[destinationTile] });
            const newVisitedBiomes = new Set(get().visitedBiomes).add(destinationTile);
            set({ currentBiome: destinationTile, visitedBiomes: newVisitedBiomes });

            if(newVisitedBiomes.has('.') && newVisitedBiomes.has('F') && newVisitedBiomes.has('C') && newVisitedBiomes.has('V') && newVisitedBiomes.has('~')) {
              unlockTrophy('trophy_explore_all_biomes');
            }
        }
    }

    if (destinationTile === '~') {
        const skillCheck = useCharacterStore.getState().performSkillCheck('atletica', 12);
        if(skillCheck.success) {
            addJournalEntry({ text: "Riesci a contrastare la corrente e ad entrare in acqua senza problemi.", type: JournalEntryType.SKILL_CHECK_SUCCESS });
        } else {
            const damage = 2;
            addJournalEntry({ text: "La corrente è più forte del previsto. Scivoli e urti una roccia.", type: JournalEntryType.SKILL_CHECK_FAILURE });
            useCharacterStore.getState().takeDamage(damage, 'ENVIRONMENT');
            addJournalEntry({ text: `Subisci ${damage} danni.`, type: JournalEntryType.COMBAT });
        }
        set({ playerStatus: { ...get().playerStatus, isExitingWater: true } });
    }

    let timeCost = BASE_TIME_COST_PER_MOVE;
    if (destinationTile === 'F') timeCost += 10;
    
    const { weather } = useTimeStore.getState();
    let weatherPenalty = 0;
    if (weather.type === 'Pioggia') weatherPenalty = 5;
    if (weather.type === 'Tempesta') weatherPenalty = 10;
    if (weatherPenalty > 0) {
        timeCost += weatherPenalty;
        addJournalEntry({ text: `${weather.type} rallenta i tuoi movimenti. (+${weatherPenalty} min)`, type: JournalEntryType.SYSTEM_WARNING });
    }

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight && Math.random() < 0.20) {
        useCharacterStore.getState().takeDamage(1, 'ENVIRONMENT');
        addJournalEntry({ text: "L'oscurità ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === 'Tempesta' && Math.random() < 0.15) {
        useCharacterStore.getState().takeDamage(1, 'ENVIRONMENT');
        addJournalEntry({ text: "Il vento violento ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === 'Pioggia' && Math.random() < 0.08) {
        useCharacterStore.getState().takeDamage(1, 'ENVIRONMENT');
        addJournalEntry({ text: "Il terreno scivoloso ti fa cadere. (-1 HP)", type: JournalEntryType.COMBAT });
    }

    const newTotalSteps = get().totalSteps + 1;
    set({ playerPos: newPos, totalSteps: newTotalSteps });
    if (newTotalSteps === 100) unlockTrophy('trophy_explore_100_steps');
    if (newTotalSteps === 500) unlockTrophy('trophy_explore_500_steps');

    advanceTime(timeCost);
    useCharacterStore.getState().gainExplorationXp();
    
    checkMainQuestTriggers();
    if (get().gameState !== GameState.IN_GAME) return;

    checkCutsceneTriggers();
    if (get().gameState !== GameState.IN_GAME) return;

    let eventTriggered = false;
    const guaranteedEventBiomes = ['F', 'C', 'V'];
    if (guaranteedEventBiomes.includes(destinationTile) && destinationTile !== previousBiome) {
      useEventStore.getState().triggerEncounter(true); // Force biome-specific event
      eventTriggered = true;
    }

    if (eventTriggered) return;

    useEventStore.getState().triggerEncounter();
    if (useEventStore.getState().activeEvent || useCombatStore.getState().activeCombat) return;

    if (Math.random() < 0.15) {
        const { currentBiome } = get();
        const biomeMessages = ATMOSPHERIC_MESSAGES[currentBiome];
        if (biomeMessages) {
            let possibleMessages: string[] = [];
            if ((weather.type === 'Pioggia' || weather.type === 'Tempesta') && biomeMessages.rain) {
                possibleMessages.push(...biomeMessages.rain);
            }
            if (isNight) {
                possibleMessages.push(...biomeMessages.night);
            } else {
                possibleMessages.push(...biomeMessages.day);
            }
            if (possibleMessages.length > 0) {
                addJournalEntry({ text: getRandom(possibleMessages), type: JournalEntryType.NARRATIVE });
            }
        }
    }
  },

  /**
   * @function getTileInfo
   * @description Gets information about a tile on the map.
   * @param {number} x - The x-coordinate of the tile.
   * @param {number} y - The y-coordinate of the tile.
   * @returns {TileInfo} Information about the tile.
   */
  getTileInfo: (x, y) => {
    const { map } = get();
    if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
        return { char: ' ', name: 'Sconosciuto' };
    }
    const char = map[y][x];
    return { char, name: TILE_NAMES[char] || 'Terreno Misterioso' };
  },
  
  /**
   * @function performQuickRest
   * @description Performs a quick rest, advancing time and healing the player.
   */
  performQuickRest: () => {
    const { isInventoryOpen, isInRefuge } = useInteractionStore.getState();
    if (isInventoryOpen || isInRefuge) return;
    const { lastRestTime, addJournalEntry, gameFlags, startCutscene } = get();
    const { gameTime, advanceTime } = useTimeStore.getState();
    if (gameTime.day >= 3 && !gameFlags.has('BEING_WATCHED_PLAYED')) {
        set(state => ({ gameFlags: new Set(state.gameFlags).add('BEING_WATCHED_PLAYED') }));
        startCutscene('CS_BEING_WATCHED');
        return;
    }
    if (lastRestTime) {
        if (timeToMinutes(gameTime) - timeToMinutes(lastRestTime) < 1440) {
            addJournalEntry({ text: "Troppo presto per riposare di nuovo. Devi aspettare.", type: JournalEntryType.ACTION_FAILURE });
            return;
        }
    }
    addJournalEntry({ text: "Ti fermi per riposare per un'ora.", type: JournalEntryType.NARRATIVE });
    advanceTime(60, true);
    set({ lastRestTime: useTimeStore.getState().gameTime });
    useCharacterStore.getState().heal(20);
    addJournalEntry({ text: `Un breve riposo ti ridona un po' di energie. Hai recuperato 20 HP.`, type: JournalEntryType.SKILL_CHECK_SUCCESS });
  },

  /**
   * @function openLevelUpScreen
   * @description Opens the level up screen if the player has enough XP.
   */
  openLevelUpScreen: () => {
      if (useCharacterStore.getState().levelUpPending) {
          audioManager.playSound('confirm');
          get().setGameState(GameState.LEVEL_UP_SCREEN);
      } else {
          get().addJournalEntry({ text: "Non hai abbastanza XP per salire di livello.", type: JournalEntryType.SYSTEM_WARNING });
      }
  },

  /**
   * @function checkMainQuestTriggers
   * @description Checks if any main quest triggers have been met.
   */
  checkMainQuestTriggers: () => {
    const { gameTime } = useTimeStore.getState();
    const { unlockTrophy } = useCharacterStore.getState();
    const state = get();

    // Reset daily quest counter if the day has changed
    if (state.mainQuestsToday.day !== gameTime.day) {
        set({ mainQuestsToday: { day: gameTime.day, count: 0 } });
    }
    
    if (gameTime.day >= 7) unlockTrophy('trophy_survive_7_days');
    if (gameTime.day >= 30) unlockTrophy('trophy_survive_30_days');

    const currentState = get();

    // Block if 2 quests already happened today
    if (currentState.mainQuestsToday.count >= 2) {
        return;
    }

    if (currentState.activeMainQuestEvent || currentState.gameState !== GameState.IN_GAME) return;
    const { mainQuestChapters } = useMainQuestDatabaseStore.getState();
    const nextChapter = mainQuestChapters.find(c => c.stage === currentState.mainQuestStage);
    if (!nextChapter) return;

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight && !nextChapter.allowNightTrigger) {
        return; // Non attivare eventi diurni durante la notte
    }

    let conditionMet = false;
    const trigger = nextChapter.trigger;
    const { level } = useCharacterStore.getState();

    switch (trigger.type) {
        case 'stepsTaken': conditionMet = currentState.totalSteps >= trigger.value; break;
        case 'daysSurvived': conditionMet = gameTime.day >= trigger.value; break;
        case 'levelReached': conditionMet = level >= trigger.value; break;
        case 'combatWins': conditionMet = currentState.totalCombatWins >= trigger.value; break;
        case 'reachLocation': conditionMet = currentState.playerPos.x === trigger.value.x && currentState.playerPos.y === trigger.value.y; break;
        case 'reachEnd': conditionMet = currentState.map[currentState.playerPos.y][currentState.playerPos.x] === 'E'; break;
        case 'firstRefugeEntry': break;
    }
    if (conditionMet) {
        set(prevState => ({
            activeMainQuestEvent: nextChapter,
            gameState: GameState.MAIN_QUEST,
            mainQuestsToday: {
                day: prevState.mainQuestsToday.day,
                count: prevState.mainQuestsToday.count + 1
            }
        }));
    }
  },

  /**
   * @function resolveMainQuest
   * @description Resolves the current main quest and advances to the next stage.
   */
  resolveMainQuest: () => {
    const completedStage = get().mainQuestStage;
    useCharacterStore.getState().unlockTrophy(`trophy_mq_${completedStage}`);
    set(state => ({
        mainQuestStage: state.mainQuestStage + 1,
        activeMainQuestEvent: null,
        gameState: GameState.IN_GAME,
    }));
  },
  
  /**
   * @function startCutscene
   * @description Starts a cutscene.
   * @param {string} id - The ID of the cutscene to start.
   */
  startCutscene: (id) => {
    const { cutscenes } = useCutsceneDatabaseStore.getState();
    if (cutscenes[id]) {
        set({ activeCutscene: cutscenes[id], gameState: GameState.CUTSCENE });
    }
  },

  /**
   * @function processCutsceneConsequences
   * @description Processes the consequences of a cutscene.
   * @param {CutsceneConsequence[]} consequences - The consequences to process.
   */
  processCutsceneConsequences: (consequences) => {
    const { addItem, equipItem, unlockTrophy } = useCharacterStore.getState();
    const { addJournalEntry } = get();
    const { advanceTime } = useTimeStore.getState();
    consequences.forEach(consequence => {
        switch (consequence.type) {
            case 'addItem': addItem(consequence.payload.itemId, consequence.payload.quantity); break;
            // FIX: The CutsceneConsequence type is 'equipItemByIndex', not 'equipItem'. This aligns the implementation with the type definition.
            case 'equipItemByIndex': equipItem(consequence.payload); break;
            case 'setFlag': {
              const flag = consequence.payload;
              set(state => ({ gameFlags: new Set(state.gameFlags).add(flag) }));
              if (flag === 'FATHERS_LETTER_DESTROYED') unlockTrophy('trophy_secret_destroy_letter');
              break;
            }
            case 'performModifiedRest': {
                addJournalEntry({ text: "Il sonno è leggero, agitato.", type: JournalEntryType.NARRATIVE });
                advanceTime(60, true);
                set({ lastRestTime: useTimeStore.getState().gameTime });
                useCharacterStore.getState().heal(10);
                addJournalEntry({ text: `Un breve e inquieto riposo ti ha concesso solo 10 HP.`, type: JournalEntryType.SYSTEM_WARNING });
                break;
            }
        }
    });
  },

  /**
   * @function endCutscene
   * @description Ends the current cutscene.
   */
  endCutscene: () => {
    const { unlockTrophy } = useCharacterStore.getState();
    const currentSceneId = get().activeCutscene?.id;
    let nextState = GameState.IN_GAME;
    if (currentSceneId === 'CS_OPENING') {
        nextState = GameState.CHARACTER_CREATION;
    }
    if(currentSceneId === 'CS_ASH_LULLABY') {
      unlockTrophy('trophy_secret_ash_lullaby');
    }
    set({ activeCutscene: null, gameState: nextState });
  },

  /**
   * @function checkCutsceneTriggers
   * @description Checks if any cutscene triggers have been met.
   */
  checkCutsceneTriggers: () => {
    const { playerPos, map, gameFlags, startCutscene } = get();
    if (!gameFlags.has('RIVER_INTRO_PLAYED')) {
        let riverFound = false;
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const checkY = playerPos.y + dy;
                const checkX = playerPos.x + dx;
                if (checkY >= 0 && checkY < map.length && checkX >= 0 && checkX < map[checkY].length && map[checkY][checkX] === '~') {
                    riverFound = true;
                    break;
                }
            }
            if (riverFound) break;
        }
        if (riverFound) {
            startCutscene('CS_RIVER_INTRO');
            set(state => ({ gameFlags: new Set(state.gameFlags).add('RIVER_INTRO_PLAYED') }));
        }
    }
  },

  /**
   * @function saveGame
   * @description Saves the current game state to a specified slot.
   * @param {number} slot - The slot to save the game to.
   * @returns {boolean} Whether the game was saved successfully.
   */
  saveGame: (slot) => {
      try {
          const characterStoreState = { ...useCharacterStore.getState() };
          // Assemble the monolithic gameStoreState for serialization
          const gameStoreStateForSave = {
              ...get(),
              ...useTimeStore.getState(),
              ...useInteractionStore.getState(),
              ...useEventStore.getState(),
              activeCombat: useCombatStore.getState().activeCombat,
          };

          // Remove functions before saving
          delete (gameStoreStateForSave as any).saveGame;
          delete (gameStoreStateForSave as any).loadGame;
          delete (gameStoreStateForSave as any).restoreState;
          delete (characterStoreState as any).restoreState;
          
          const { gameTime } = useTimeStore.getState();
          const saveFile: SaveFile = {
              saveVersion: SAVE_VERSION,
              timestamp: Date.now(),
              metadata: {
                  level: characterStoreState.level,
                  day: gameTime.day,
                  hour: gameTime.hour,
                  minute: gameTime.minute,
              },
              gameStoreState: gameStoreStateForSave,
              characterStoreState,
          };
          
          const serializableSaveFile = {
              ...saveFile,
              gameStoreState: { 
                ...saveFile.gameStoreState, 
                gameFlags: Array.from(saveFile.gameStoreState.gameFlags),
                visitedBiomes: Array.from(saveFile.gameStoreState.visitedBiomes),
              },
              characterStoreState: { 
                ...saveFile.characterStoreState, 
                status: Array.from(saveFile.characterStoreState.status as Set<any>), 
                unlockedTrophies: Array.from(saveFile.characterStoreState.unlockedTrophies as Set<any>),
              }
          };
          localStorage.setItem(`tspc_save_slot_${slot}`, JSON.stringify(serializableSaveFile));
          localStorage.setItem(LAST_SAVE_SLOT_KEY, slot.toString());
          get().addJournalEntry({ text: `Partita salvata nello slot ${slot}.`, type: JournalEntryType.SYSTEM_WARNING, color: '#f59e0b' });
          audioManager.playSound('confirm');
          return true;
      } catch (error) {
          console.error("Failed to save game:", error);
          get().addJournalEntry({ text: "ERRORE: Impossibile salvare la partita.", type: JournalEntryType.SYSTEM_ERROR });
          return false;
      }
  },

  /**
   * @function loadGame
   * @description Loads a game from a specified slot.
   * @param {number} slot - The slot to load the game from.
   * @returns {boolean} Whether the game was loaded successfully.
   */
  loadGame: (slot) => {
      try {
          const savedDataString = localStorage.getItem(`tspc_save_slot_${slot}`);
          if (!savedDataString) {
              get().addJournalEntry({ text: `Slot di salvataggio ${slot} è vuoto.`, type: JournalEntryType.SYSTEM_ERROR });
              return false;
          }
          const parsedData = JSON.parse(savedDataString);
          const migratedData = migrateSaveData(parsedData);
          useCharacterStore.getState().restoreState(migratedData.characterStoreState);
          get().restoreState(migratedData.gameStoreState);
          set({ gameState: GameState.IN_GAME });
          localStorage.setItem(LAST_SAVE_SLOT_KEY, slot.toString());
          get().addJournalEntry({ text: `Partita caricata dallo slot ${slot}.`, type: JournalEntryType.SYSTEM_WARNING, color: '#f59e0b' });
          audioManager.playSound('confirm');
          return true;
      } catch (error) {
          console.error("Failed to load game:", error);
          get().addJournalEntry({ text: `ERRORE: File di salvataggio corrotto o non compatibile.`, type: JournalEntryType.SYSTEM_ERROR });
          return false;
      }
  },

  /**
   * @function restoreState
   * @description Restores the state of the game from a saved state.
   * @param {any} newState - The state to restore.
   */
  restoreState: (newState) => {
      // Hydrate gameStore itself
      const ownState: Partial<GameStoreState> = {};
      const ownKeys: (keyof GameStoreState)[] = ['gameState', 'previousGameState', 'visualTheme', 'map', 'playerPos', 'playerStatus', 'journal', 'currentBiome', 'lastRestTime', 'lastEncounterTime', 'lastLoreEventDay', 'lootedRefuges', 'visitedRefuges', 'mainQuestStage', 'totalSteps', 'totalCombatWins', 'activeMainQuestEvent', 'activeCutscene', 'gameFlags', 'mainQuestsToday', 'deathCause', 'visitedBiomes'];
      ownKeys.forEach(key => {
        if (key in newState) (ownState as any)[key] = (newState as any)[key];
      });
      set(ownState);

      // Hydrate other stores from the monolithic state object
      const { gameTime, weather } = newState;
      if (gameTime && weather) useTimeStore.setState({ gameTime, weather });
      
      const { activeCombat } = newState;
      if(activeCombat !== undefined) useCombatStore.setState({ activeCombat });
      
      const { activeEvent, eventHistory, eventResolutionText } = newState;
      if(activeEvent !== undefined) useEventStore.setState({ activeEvent, eventHistory, eventResolutionText });

      const interactionState: Partial<ReturnType<typeof useInteractionStore.getState>> = {};
      const interactionKeys: (keyof typeof interactionState)[] = ['isInventoryOpen', 'isInRefuge', 'isCraftingOpen', 'inventorySelectedIndex', 'actionMenuState', 'refugeMenuState', 'craftingMenuState', 'refugeActionMessage', 'refugeJustSearched'];
      interactionKeys.forEach(key => {
        if (key in newState) (interactionState as any)[key] = (newState as any)[key];
      });
      if(Object.keys(interactionState).length > 0) useInteractionStore.setState(interactionState);
  },
}));