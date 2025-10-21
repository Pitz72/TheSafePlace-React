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

/**
 * @function migrateSaveData
 * @description Migrates save data from older versions to the current version.
 * @param {any} saveData - The save data to migrate.
 * @returns {any} The migrated save data.
 */
const migrateSaveData = (saveData: any): any => {
  const version = saveData.saveVersion || "1.0.0";
  
  // Migration from 1.0.0 to 2.0.0
  if (version === "1.0.0") {
    console.log("Migrating save from 1.0.0 to 2.0.0...");
    
    // Add any missing store data with defaults
    if (!saveData.interaction) {
      saveData.interaction = {
        isInventoryOpen: false,
        isInRefuge: false,
        isCraftingOpen: false,
      };
    }
    
    if (!saveData.event) {
      saveData.event = {
        availableEvents: [],
        eventHistory: [],
      };
    }
    
    if (!saveData.combat) {
      saveData.combat = {
        currentEnemy: null,
        combatLog: [],
      };
    }
    
    // Ensure gameFlags and visitedBiomes are arrays (not Sets)
    if (saveData.game) {
      if (!Array.isArray(saveData.game.gameFlags)) {
        saveData.game.gameFlags = [];
      }
      if (!Array.isArray(saveData.game.visitedBiomes)) {
        saveData.game.visitedBiomes = [];
      }
    }
    
    // Ensure character status and trophies are arrays
    if (saveData.character) {
      if (!Array.isArray(saveData.character.status)) {
        saveData.character.status = [];
      }
      if (!Array.isArray(saveData.character.unlockedTrophies)) {
        saveData.character.unlockedTrophies = [];
      }
    }
    
    saveData.saveVersion = "2.0.0";
  }
  
  // Future migrations can be added here
  // if (version === "2.0.0") { ... migrate to 3.0.0 ... }
  
  return saveData;
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
        case JournalEntryType.COMBAT:
            if (entry.text.includes('danni')) {
                audioManager.playSound('hit_player');
            }
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
        mainStoryStage: 1,
        totalSteps: 0,
        totalCombatWins: 0,
        activeMainStoryEvent: null,
        gameFlags: new Set(),
        activeCutscene: null,
        mainStoryEventsToday: { day: 1, count: 0 },
        deathCause: null,
        visitedBiomes: new Set(['S']),
    });
    get().addJournalEntry({ text: "Benvenuto in The Safe Place. La tua avventura inizia ora.", type: JournalEntryType.GAME_START });
    get().addJournalEntry({ text: BIOME_MESSAGES['S'], type: JournalEntryType.NARRATIVE, color: BIOME_COLORS['S'] });
  },

  movePlayer: (dx, dy) => {
    // This is a placeholder for the refactored movePlayer logic.
    // The actual implementation is now in services/gameService.ts.
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
    if (gameTime.day >= 2 && !gameFlags.has('BEING_WATCHED_PLAYED')) {
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
    useCharacterStore.getState().rest(15);
    addJournalEntry({ text: `Un breve riposo ti ridona un po' di energie. Hai recuperato 20 HP e ti senti meno stanco.`, type: JournalEntryType.SKILL_CHECK_SUCCESS });
  },

  /**
   * @function performActiveSearch
   * @description Searches the current area for resources. Consumes time and uses Survival skill.
   */
  performActiveSearch: () => {
    const { isInventoryOpen, isInRefuge } = useInteractionStore.getState();
    if (isInventoryOpen || isInRefuge) return;
    
    const { currentBiome, addJournalEntry, getTileInfo, playerPos, lastSearchedBiome } = get();
    const { advanceTime } = useTimeStore.getState();
    const { performSkillCheck, addItem, unlockedTalents, restoreHydration } = useCharacterStore.getState();
    
    const tileType = getTileInfo(playerPos.x, playerPos.y).char;
    
    // Can't search in water
    if (tileType === '≈' || tileType === '~') {
      addJournalEntry({ text: "Non puoi cercare risorse nell'acqua.", type: JournalEntryType.ACTION_FAILURE });
      audioManager.playSound('error');
      return;
    }
    
    // Cooldown per bioma: puoi cercare solo una volta per bioma nuovo
    if (lastSearchedBiome === currentBiome) {
      addJournalEntry({ text: "Hai già perlustra questa zona. Esplora un nuovo bioma per cercare ancora.", type: JournalEntryType.ACTION_FAILURE });
      audioManager.playSound('error');
      return;
    }
    
    // Update last searched biome
    set({ lastSearchedBiome: currentBiome });
    
    addJournalEntry({ text: `Inizi a perlustrare l'area in cerca di risorse utili...`, type: JournalEntryType.NARRATIVE });
    advanceTime(30, true);
    
    // Survival skill check
    const dc = 10;
    const skillCheck = performSkillCheck('sopravvivenza', dc);
    
    const hasScavenger = unlockedTalents.includes('scavenger');
    const hasForager = unlockedTalents.includes('forager'); // If this talent exists
    
    if (skillCheck.success) {
      audioManager.playSound('item_pickup');
      addJournalEntry({ 
        text: `[CHECK: Sopravvivenza] ${skillCheck.roll} + ${skillCheck.bonus} = ${skillCheck.total} vs CD ${dc}`, 
        type: JournalEntryType.SKILL_CHECK_SUCCESS 
      });
      
      // Biome-specific loot tables
      let lootPool: Array<{ id: string; weight: number; quantity: number }> = [];
      
      switch (currentBiome) {
        case 'Pianura':
          lootPool = [
            { id: 'dirty_water', weight: 30, quantity: hasScavenger ? 3 : 2 },
            { id: 'wild_berries', weight: 25, quantity: hasScavenger ? 3 : 2 },
            { id: 'bottle_empty', weight: 15, quantity: 1 },
            { id: 'clean_cloth', weight: 10, quantity: 1 },
            { id: 'firewood', weight: 10, quantity: hasScavenger ? 3 : 2 },
            { id: 'animal_hide', weight: 10, quantity: 1 },
          ];
          break;
          
        case 'Foresta':
          lootPool = [
            { id: 'firewood', weight: 35, quantity: hasScavenger ? 4 : 3 },
            { id: 'edible_mushrooms', weight: 20, quantity: hasScavenger ? 3 : 2 },
            { id: 'wild_berries', weight: 15, quantity: hasScavenger ? 3 : 2 },
            { id: 'animal_hide', weight: 15, quantity: 1 },
            { id: 'dirty_water', weight: 10, quantity: 2 },
            { id: 'clean_cloth', weight: 5, quantity: 1 },
          ];
          break;
          
        case 'Città':
          lootPool = [
            { id: 'scrap_metal', weight: 30, quantity: hasScavenger ? 4 : 2 },
            { id: 'bottle_empty', weight: 25, quantity: hasScavenger ? 3 : 2 },
            { id: 'clean_cloth', weight: 15, quantity: hasScavenger ? 2 : 1 },
            { id: 'adhesive_tape', weight: 10, quantity: 1 },
            { id: 'metal_piece', weight: 10, quantity: hasScavenger ? 4 : 2 },
            { id: 'nylon_wire', weight: 5, quantity: 1 },
            { id: 'tech_components', weight: 5, quantity: 1 },
          ];
          break;
          
        case 'Villaggio':
          lootPool = [
            { id: 'clean_cloth', weight: 25, quantity: hasScavenger ? 3 : 2 },
            { id: 'bottle_empty', weight: 20, quantity: hasScavenger ? 2 : 1 },
            { id: 'carrot', weight: 15, quantity: hasScavenger ? 3 : 2 },
            { id: 'potato', weight: 15, quantity: hasScavenger ? 3 : 2 },
            { id: 'dirty_water', weight: 10, quantity: 2 },
            { id: 'garden_tools', weight: 10, quantity: 1 },
            { id: 'nails_box', weight: 5, quantity: 1 },
          ];
          break;
          
        default:
          // Fallback generic loot
          lootPool = [
            { id: 'dirty_water', weight: 30, quantity: 2 },
            { id: 'bottle_empty', weight: 25, quantity: 1 },
            { id: 'clean_cloth', weight: 20, quantity: 1 },
            { id: 'scrap_metal', weight: 15, quantity: 1 },
            { id: 'firewood', weight: 10, quantity: 2 },
          ];
      }
      
      // Water sources give bonus clean water
      if (tileType === 'R') { // River tile
        addItem('dirty_water', hasScavenger ? 4 : 3);
        restoreHydration(10); // Drink some directly
        addJournalEntry({ 
          text: `Trovi una fonte d'acqua! Raccogli acqua e ne bevi un po'. [+${hasScavenger ? 4 : 3} Acqua Contaminata, +10 Idratazione]`, 
          type: JournalEntryType.ITEM_ACQUIRED,
          color: '#60BF77'
        });
        return;
      }
      
      // Roll for loot
      const totalWeight = lootPool.reduce((sum, item) => sum + item.weight, 0);
      const roll = Math.random() * totalWeight;
      let cumulativeWeight = 0;
      let foundItem = lootPool[0];
      
      for (const item of lootPool) {
        cumulativeWeight += item.weight;
        if (roll < cumulativeWeight) {
          foundItem = item;
          break;
        }
      }
      
      // Always add the item - addItem() will handle validation
      addItem(foundItem.id, foundItem.quantity);
      
      // Try to get item name for journal, fallback to ID
      const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
      const itemDetails = itemDatabase[foundItem.id];
      const itemName = itemDetails?.name || foundItem.id;
      
      addJournalEntry({ 
        text: `Hai trovato: ${itemName} x${foundItem.quantity}.`, 
        type: JournalEntryType.ITEM_ACQUIRED,
        color: '#60BF77'
      });
      
    } else {
      audioManager.playSound('error');
      addJournalEntry({ 
        text: `[CHECK: Sopravvivenza] ${skillCheck.roll} + ${skillCheck.bonus} = ${skillCheck.total} vs CD ${dc} - FALLITO`, 
        type: JournalEntryType.SKILL_CHECK_FAILURE 
      });
      addJournalEntry({ 
        text: "Non trovi nulla di utile. Hai sprecato tempo ed energie.", 
        type: JournalEntryType.ACTION_FAILURE 
      });
    }
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
   * @function checkMainStoryTriggers
   * @description Checks if any main story triggers have been met.
   */
  /**
   * @function checkCutsceneTriggers
   * @description Checks if any cutscene triggers have been met.
   */
  checkCutsceneTriggers: () => {
    const { gameTime } = useTimeStore.getState();
    const state = get();
    
    if (state.gameState !== GameState.IN_GAME) return;
    
    // CS_RIVER_INTRO: Near water tiles
    if (!state.gameFlags.has('RIVER_INTRO_PLAYED')) {
        let riverFound = false;
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const checkY = state.playerPos.y + dy;
                const checkX = state.playerPos.x + dx;
                if (checkY >= 0 && checkY < state.map.length && checkX >= 0 && checkX < state.map[checkY].length && state.map[checkY][checkX] === '~') {
                    riverFound = true;
                    break;
                }
            }
            if (riverFound) break;
        }
        if (riverFound) {
            set(s => ({ gameFlags: new Set(s.gameFlags).add('RIVER_INTRO_PLAYED') }));
            state.startCutscene('CS_RIVER_INTRO');
            return;
        }
    }
    
    // CS_HALF_JOURNEY: stepsTaken >= 100 AND daysSurvived >= 3
    if (state.totalSteps >= 100 && gameTime.day >= 3 && !state.gameFlags.has('HALF_JOURNEY_PLAYED')) {
        set(s => ({ gameFlags: new Set(s.gameFlags).add('HALF_JOURNEY_PLAYED') }));
        state.startCutscene('CS_HALF_JOURNEY');
        return;
    }
    
    // CS_POINT_OF_NO_RETURN: distance < 20 tiles from 'E'
    if (!state.gameFlags.has('POINT_OF_NO_RETURN_PLAYED')) {
        let endPos: { x: number; y: number } | null = null;
        for (let y = 0; y < state.map.length; y++) {
            for (let x = 0; x < state.map[y].length; x++) {
                if (state.map[y][x] === 'E') {
                    endPos = { x, y };
                    break;
                }
            }
            if (endPos) break;
        }
        if (endPos) {
            const distance = Math.sqrt(
                Math.pow(state.playerPos.x - endPos.x, 2) +
                Math.pow(state.playerPos.y - endPos.y, 2)
            );
            if (distance <= 20) {
                set(s => ({ gameFlags: new Set(s.gameFlags).add('POINT_OF_NO_RETURN_PLAYED') }));
                state.startCutscene('CS_POINT_OF_NO_RETURN');
                return;
            }
        }
    }
  },

  checkMainStoryTriggers: () => {
    const { gameTime } = useTimeStore.getState();
    const { unlockTrophy } = useCharacterStore.getState();
    const state = get();

    // Reset daily story event counter if the day has changed
    if (state.mainStoryEventsToday.day !== gameTime.day) {
        set({ mainStoryEventsToday: { day: gameTime.day, count: 0 } });
    }
    
    if (gameTime.day >= 5) unlockTrophy('trophy_survive_7_days');
    if (gameTime.day >= 30) unlockTrophy('trophy_survive_30_days');

    const currentState = get();

    // Block if 2 story events already happened today
    if (currentState.mainStoryEventsToday.count >= 2) {
        return;
    }

    if (currentState.activeMainStoryEvent || currentState.gameState !== GameState.IN_GAME) return;
    const { mainStoryChapters } = useMainStoryDatabaseStore.getState();
    const nextChapter = mainStoryChapters.find(c => c.stage === currentState.mainStoryStage);
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
        case 'nearEnd': {
            // Find position of 'E' in the map
            let endPos: { x: number; y: number } | null = null;
            for (let y = 0; y < currentState.map.length; y++) {
                for (let x = 0; x < currentState.map[y].length; x++) {
                    if (currentState.map[y][x] === 'E') {
                        endPos = { x, y };
                        break;
                    }
                }
                if (endPos) break;
            }
            if (endPos) {
                const distance = Math.sqrt(
                    Math.pow(currentState.playerPos.x - endPos.x, 2) +
                    Math.pow(currentState.playerPos.y - endPos.y, 2)
                );
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

  /**
   * @function resolveMainStory
   * @description Resolves the current main story event and advances to the next stage.
   */
  resolveMainStory: () => {
    const completedStage = get().mainStoryStage;
    useCharacterStore.getState().unlockTrophy(`trophy_mq_${completedStage}`);
    set(state => ({
        mainStoryStage: state.mainStoryStage + 1,
        activeMainStoryEvent: null,
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


  saveGame: (slot) => {
    try {
      const characterState = useCharacterStore.getState();
      const timeState = useTimeStore.getState();

      // Validate slot number
      if (slot < 1 || slot > 5) {
        console.error("Invalid slot number:", slot);
        get().addJournalEntry({ text: "Slot di salvataggio non valido.", type: JournalEntryType.SYSTEM_ERROR });
        return false;
      }

      // Collect all save data
      const saveData = {
        saveVersion: SAVE_VERSION,
        timestamp: Date.now(),
        metadata: {
          level: characterState.level,
          day: timeState.gameTime.day,
          hour: timeState.gameTime.hour,
          minute: timeState.gameTime.minute,
        },
        character: characterState.toJSON(),
        game: get().toJSON(),
        time: timeState.toJSON(),
        interaction: useInteractionStore.getState().toJSON(),
        event: useEventStore.getState().toJSON(),
        combat: useCombatStore.getState().toJSON(),
      };

      // Validate save data before saving
      if (!saveData.character || !saveData.game || !saveData.time) {
        console.error("Invalid save data structure");
        get().addJournalEntry({ text: "Errore: dati di salvataggio incompleti.", type: JournalEntryType.SYSTEM_ERROR });
        return false;
      }

      // Try to stringify to catch any serialization errors
      let saveDataJSON: string;
      try {
        saveDataJSON = JSON.stringify(saveData);
      } catch (stringifyError) {
        console.error("Error stringifying save data:", stringifyError);
        get().addJournalEntry({ text: "Errore durante la serializzazione dei dati.", type: JournalEntryType.SYSTEM_ERROR });
        return false;
      }

      // Check localStorage space
      try {
        localStorage.setItem(`tspc_save_${slot}`, saveDataJSON);
        localStorage.setItem(LAST_SAVE_SLOT_KEY, slot.toString());
      } catch (storageError) {
        if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
          console.error("localStorage quota exceeded");
          get().addJournalEntry({ text: "Spazio di archiviazione insufficiente. Elimina altri salvataggi.", type: JournalEntryType.SYSTEM_ERROR });
        } else {
          console.error("localStorage error:", storageError);
          get().addJournalEntry({ text: "Errore durante l'accesso allo storage.", type: JournalEntryType.SYSTEM_ERROR });
        }
        return false;
      }

      audioManager.playSound('confirm');
      get().addJournalEntry({ text: `Partita salvata nello slot ${slot}.`, type: JournalEntryType.SYSTEM_MESSAGE });
      return true;
    } catch (error) {
      console.error("Unexpected error saving game:", error);
      get().addJournalEntry({ text: "Errore imprevisto durante il salvataggio.", type: JournalEntryType.SYSTEM_ERROR });
      return false;
    }
  },

  loadGame: (slot) => {
    try {
      const savedDataJSON = localStorage.getItem(`tspc_save_${slot}`);
      if (!savedDataJSON) {
        get().addJournalEntry({ text: `Nessun dato di salvataggio trovato nello slot ${slot}.`, type: JournalEntryType.SYSTEM_ERROR });
        return false;
      }

      let savedData;
      try {
        savedData = JSON.parse(savedDataJSON);
      } catch (parseError) {
        console.error("Error parsing save data:", parseError);
        get().addJournalEntry({ text: "File di salvataggio corrotto. Impossibile caricare.", type: JournalEntryType.SYSTEM_ERROR });
        return false;
      }

      // Validate save data structure
      if (!savedData.metadata || !savedData.character || !savedData.game || !savedData.time) {
        console.error("Invalid save data structure");
        get().addJournalEntry({ text: "File di salvataggio incompleto o non valido.", type: JournalEntryType.SYSTEM_ERROR });
        return false;
      }

      // Migrate save data if needed
      if (savedData.saveVersion !== SAVE_VERSION) {
        console.warn(`Save file version (${savedData.saveVersion || '1.0.0'}) does not match game version (${SAVE_VERSION}). Attempting migration...`);
        try {
          savedData = migrateSaveData(savedData);
          console.log("Migration successful!");
        } catch (migrationError) {
          console.error("Migration failed:", migrationError);
          get().addJournalEntry({ text: "Impossibile migrare il salvataggio alla versione corrente.", type: JournalEntryType.SYSTEM_ERROR });
          return false;
        }
      }
      
      // Restore all stores
      try {
        useCharacterStore.getState().fromJSON(savedData.character);
        get().fromJSON(savedData.game);
        useTimeStore.getState().fromJSON(savedData.time);
        useInteractionStore.getState().fromJSON(savedData.interaction);
        useEventStore.getState().fromJSON(savedData.event);
        useCombatStore.getState().fromJSON(savedData.combat);
      } catch (restoreError) {
        console.error("Error restoring game state:", restoreError);
        get().addJournalEntry({ text: "Errore durante il ripristino dello stato di gioco.", type: JournalEntryType.SYSTEM_ERROR });
        return false;
      }

      localStorage.setItem(LAST_SAVE_SLOT_KEY, slot.toString());
      get().addJournalEntry({ text: `Partita caricata dallo slot ${slot}.`, type: JournalEntryType.SYSTEM_MESSAGE });
      
      // Ensure the game is in a playable state after loading
      get().setGameState(GameState.IN_GAME);
      return true;
    } catch (error) {
      console.error("Unexpected error loading game:", error);
      get().addJournalEntry({ text: "Errore imprevisto durante il caricamento. Riprova.", type: JournalEntryType.SYSTEM_ERROR });
      return false;
    }
  },
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
  }
}));