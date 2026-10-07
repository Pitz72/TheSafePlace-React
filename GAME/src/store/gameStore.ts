import { create } from 'zustand';
import {
  GameState, GameStoreState, JournalEntryType, DeathCause, Position, PointOfInterest,
  CutsceneConsequence, MainStoryChapter,
} from '../types';
import { MAP_DATA } from '../data/mapData';
import { useCharacterStore } from './characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useMainStoryDatabaseStore } from '../data/mainStoryDatabase';
import { useCutsceneDatabaseStore } from '../data/cutsceneDatabase';
import { usePoiDatabaseStore } from '../data/poiDatabase';
import { useLootTableStore, rollLoot } from '../data/lootTableDatabase';
import { BIOME_MESSAGES, BIOME_COLORS, TILE_NAMES } from '../constants';
import { audioManager } from '../utils/audio';
import { toAbsoluteMinutes, isNightHour } from '../utils/time';
import { NUM_SAVE_SLOTS, slotKey, storage, validateSaveData } from '../utils/saveFormat';
import { useTimeStore } from './timeStore';
import { useInteractionStore } from './interactionStore';
import { useEventStore } from './eventStore';
import { useCombatStore } from './combatStore';
import { useNarrativeStore } from './narrativeStore';
import { narrativeService } from '../services/NarrativeService';
import { questService } from '../services/questService';

// ═══════════════════════════════════════════════════════════════════════════
// SAVE GAME SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Save format version. 2.1.0 stores only gameplay state (no map, no UI state)
 * and adds points of interest, trader stock and pending cutscenes. Older saves
 * load through defaults in every fromJSON.
 */
export const SAVE_VERSION = '2.1.0';
const LAST_SAVE_SLOT_KEY = 'tspc_last_save_slot';

/** Cutscenes rewritten in Ink: legacy id -> Ink knot. */
const LEGACY_CUTSCENE_TO_INK_KNOT: Record<string, string> = {
  'CS_OPENING': 'intro',
};

/** Trophies unlocked by story flags. */
const FLAG_TROPHIES: Record<string, string> = {
  FATHERS_LETTER_DESTROYED: 'trophy_secret_destroy_letter',
  FATHERS_LETTER_KEPT: 'trophy_secret_keep_letter',
};

const MAX_STORY_EVENTS_PER_DAY = 2;
const LEGACY_ARMOR_FLAG = /^ARMOR_UPGRADED_(HEAD|CHEST|LEGS)_(\d+)$/;

/**
 * Saves before 2.1 stored Anya's armour upgrades as ARMOR_UPGRADED_<SLOT>_<N>
 * flags applied to whatever sat in that slot: move them onto the equipped piece.
 */
function migrateLegacyArmorUpgrades() {
  const flags = useGameStore.getState().gameFlags;
  const legacy = [...flags].filter(flag => LEGACY_ARMOR_FLAG.test(flag));
  if (legacy.length === 0) return;
  const character = useCharacterStore.getState();
  const inventory = [...character.inventory];
  for (const flag of legacy) {
    const [, slot, bonus] = LEGACY_ARMOR_FLAG.exec(flag)!;
    const index = slot === 'HEAD' ? character.equippedHead : slot === 'LEGS' ? character.equippedLegs : character.equippedArmor;
    if (index !== null && inventory[index]) {
      inventory[index] = { ...inventory[index], upgradeBonus: (inventory[index].upgradeBonus ?? 0) + Number(bonus) };
    }
  }
  useCharacterStore.setState({ inventory });
  useGameStore.setState({ gameFlags: new Set([...flags].filter(flag => !LEGACY_ARMOR_FLAG.test(flag))) });
}

const findTile = (map: string[][], tile: string): Position | null => {
  for (let y = 0; y < map.length; y++) {
    const x = map[y].indexOf(tile);
    if (x !== -1) return { x, y };
  }
  return null;
};

const distance = (a: Position, b: Position) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

/** Static POIs from data merged with the runtime state saved in a game. */
function buildPOIs(saved: PointOfInterest[] | undefined): PointOfInterest[] {
  const statics = usePoiDatabaseStore.getState().pois;
  const savedById = new Map((saved ?? []).map(p => [p.id, p]));
  const merged: PointOfInterest[] = statics.map(def => {
    const s = savedById.get(def.id);
    return { ...def, revealed: s?.revealed ?? def.revealed ?? false, consumed: s?.consumed ?? false };
  });
  const staticIds = new Set(statics.map(p => p.id));
  for (const poi of saved ?? []) {
    if (!staticIds.has(poi.id)) merged.push(poi);
  }
  return merged;
}

const initialWorldState = () => ({
  repairedPumps: [],
  destroyedPumps: [],
  waterPlantActive: false,
  waterPlantLocation: null,
});

export const useGameStore = create<GameStoreState>((set, get) => ({
  // --- State ---
  gameState: GameState.INITIAL_BLACK_SCREEN,
  previousGameState: null,
  visualTheme: 'standard',
  map: MAP_DATA,
  playerPos: { x: 0, y: 0 },
  playerStatus: { isExitingWater: false },
  journal: [],
  currentBiome: '',
  lastRestTime: null,
  lastEncounterTime: null,
  lastSearchedBiome: null,
  lastLoreEventDay: null,
  lastCombatDay: 1,
  visitedRefuges: [],
  mainStoryStage: 1,
  totalSteps: 0,
  totalCombatWins: 0,
  activeMainStoryEvent: null,
  activeCutscene: null,
  pendingCutscenes: [],
  gameFlags: new Set(),
  mainStoryEventsToday: { day: 0, count: 0 },
  deathCause: null,
  visitedBiomes: new Set(),
  damageFlash: false,
  wanderingTrader: null,
  worldState: initialWorldState(),
  pois: [],
  traderStock: {},
  lightUntil: 0,
  repelUntil: 0,
  lastShelterDay: 0,
  lastRadioDay: 0,

  triggerDamageFlash: () => {
    set({ damageFlash: true });
    setTimeout(() => set({ damageFlash: false }), 150);
  },

  setGameState: (newState) => {
    const previous = get().gameState;
    if (previous !== newState) {
      set({ previousGameState: previous, gameState: newState });
    }
    // Back in free roam: play the next cutscene that was waiting for it.
    if (newState === GameState.IN_GAME && get().pendingCutscenes.length > 0) {
      setTimeout(() => {
        const state = get();
        if (state.gameState !== GameState.IN_GAME || state.pendingCutscenes.length === 0) return;
        const [next, ...rest] = state.pendingCutscenes;
        set({ pendingCutscenes: rest });
        state.startCutscene(next);
      }, 0);
    }
  },

  setGameOver: (cause: DeathCause) => {
    if (get().gameState === GameState.GAME_OVER) return;
    const { unlockTrophy } = useCharacterStore.getState();
    unlockTrophy('trophy_misc_first_death');
    if (cause === 'STARVATION') unlockTrophy('trophy_misc_death_by_starvation');
    if (cause === 'DEHYDRATION') unlockTrophy('trophy_misc_death_by_dehydration');

    audioManager.playSound('defeat');
    get().addJournalEntry({ text: "Sei stato sconfitto...", type: JournalEntryType.SYSTEM_ERROR });
    useCombatStore.getState().reset();
    useEventStore.setState({ activeEvent: null, eventResolutionText: null });
    set({ gameState: GameState.GAME_OVER, deathCause: cause, pendingCutscenes: [] });
  },

  setVisualTheme: (theme) => {
    set({ visualTheme: theme });
    document.documentElement.className = `theme-${theme}`;
    try {
      localStorage.setItem('tspc_visual_theme', theme);
    } catch {
      // Storage unavailable: the theme still applies for this session.
    }
  },

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
        if (entry.text.includes('danni')) audioManager.playSound('hit_player');
        break;
    }
  },

  /** Starts a new game: resets every store and puts the player on 'S'. */
  setMap: () => {
    const startPos = findTile(MAP_DATA, 'S') ?? { x: 0, y: 0 };

    useTimeStore.getState().reset();
    useInteractionStore.getState().reset();
    useEventStore.getState().reset();
    useCombatStore.getState().reset();
    narrativeService.resetNarrative();

    set({
      map: MAP_DATA,
      playerPos: startPos,
      playerStatus: { isExitingWater: false },
      journal: [],
      currentBiome: 'S',
      lastRestTime: null,
      lastEncounterTime: null,
      lastSearchedBiome: null,
      lastLoreEventDay: 0,
      lastCombatDay: 1,
      visitedRefuges: [],
      mainStoryStage: 1,
      totalSteps: 0,
      totalCombatWins: 0,
      activeMainStoryEvent: null,
      activeCutscene: null,
      pendingCutscenes: [],
      gameFlags: new Set(),
      mainStoryEventsToday: { day: 1, count: 0 },
      deathCause: null,
      visitedBiomes: new Set(['S']),
      wanderingTrader: null,
      worldState: initialWorldState(),
      pois: buildPOIs(undefined),
      traderStock: {},
      lightUntil: 0,
      repelUntil: 0,
      lastShelterDay: 0,
      lastRadioDay: 0,
    });
    get().addJournalEntry({ text: "Benvenuto in The Safe Place. La tua avventura inizia ora.", type: JournalEntryType.GAME_START });
    get().addJournalEntry({ text: BIOME_MESSAGES['S'], type: JournalEntryType.NARRATIVE, color: BIOME_COLORS['S'] });
  },

  getTileInfo: (x, y) => {
    const { map } = get();
    if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
      return { char: ' ', name: 'Sconosciuto' };
    }
    const char = map[y][x];
    return { char, name: TILE_NAMES[char] || 'Terreno Misterioso' };
  },

  performQuickRest: () => {
    const { isInventoryOpen, isInRefuge } = useInteractionStore.getState();
    if (isInventoryOpen || isInRefuge) return;
    const { lastRestTime, addJournalEntry } = get();
    const { gameTime, advanceTime } = useTimeStore.getState();
    if (lastRestTime) {
      const elapsed = toAbsoluteMinutes(gameTime) - toAbsoluteMinutes(lastRestTime);
      if (elapsed < 1440) {
        const hoursLeft = Math.ceil((1440 - elapsed) / 60);
        addJournalEntry({ text: `Troppo presto per riposare di nuovo. Potrai farlo tra circa ${hoursLeft} ore.`, type: JournalEntryType.ACTION_FAILURE });
        return;
      }
    }
    addJournalEntry({ text: "Ti fermi per riposare per un'ora.", type: JournalEntryType.NARRATIVE });
    advanceTime(60, true);
    set({ lastRestTime: useTimeStore.getState().gameTime });
    const character = useCharacterStore.getState();
    character.heal(20);
    character.rest(15);
    addJournalEntry({ text: `Un breve riposo ti ridona un po' di energie. Ti senti meno stanco.`, type: JournalEntryType.SKILL_CHECK_SUCCESS });
  },

  performActiveSearch: () => {
    const { isInventoryOpen, isInRefuge } = useInteractionStore.getState();
    if (isInventoryOpen || isInRefuge) return;

    const { currentBiome, addJournalEntry, getTileInfo, playerPos, lastSearchedBiome, map, worldState } = get();
    const { advanceTime } = useTimeStore.getState();
    const character = useCharacterStore.getState();
    const tileType = getTileInfo(playerPos.x, playerPos.y).char;

    if (tileType === '~') {
      addJournalEntry({ text: "Non puoi cercare risorse mentre guadi il fiume.", type: JournalEntryType.ACTION_FAILURE });
      return;
    }
    // One search per area: walk into a different biome to search again.
    if (lastSearchedBiome === currentBiome) {
      addJournalEntry({ text: "Hai già perlustrato questa zona. Esplora un nuovo bioma per cercare ancora.", type: JournalEntryType.ACTION_FAILURE });
      return;
    }
    set({ lastSearchedBiome: currentBiome });

    addJournalEntry({ text: `Inizi a perlustrare l'area in cerca di risorse utili...`, type: JournalEntryType.NARRATIVE });
    advanceTime(30, true);

    const dc = 10;
    const check = character.performSkillCheck('sopravvivenza', dc);
    const hasScavenger = character.hasTalent('scavenger');

    if (!check.success) {
      addJournalEntry({ text: `[CHECK: Sopravvivenza] ${check.roll} + ${check.bonus} = ${check.total} vs CD ${dc} - FALLITO`, type: JournalEntryType.SKILL_CHECK_FAILURE });
      addJournalEntry({ text: "Non trovi nulla di utile. Hai sprecato tempo ed energie.", type: JournalEntryType.ACTION_FAILURE });
      return;
    }
    addJournalEntry({ text: `[CHECK: Sopravvivenza] ${check.roll} + ${check.bonus} = ${check.total} vs CD ${dc}`, type: JournalEntryType.SKILL_CHECK_SUCCESS });

    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
    const grant = (itemId: string, quantity: number, note = '') => {
      character.addItem(itemId, quantity);
      const name = itemDatabase[itemId]?.name || itemId;
      addJournalEntry({ text: `Hai trovato: ${name} x${quantity}.${note}`, type: JournalEntryType.ITEM_ACQUIRED, color: '#60BF77' });
    };

    // Near a river you can always refill: dirty water to purify, plus a few sips.
    const nearWater = [-1, 0, 1].some(dy => [-1, 0, 1].some(dx => map[playerPos.y + dy]?.[playerPos.x + dx] === '~'));
    if (nearWater) {
      grant('dirty_water', hasScavenger ? 4 : 3, ' Bevi anche qualche sorso dal fiume.');
      character.restoreHydration(10);
    }
    // The repaired water treatment plant supplies clean water to the area around it.
    if (worldState.waterPlantActive && worldState.waterPlantLocation && distance(playerPos, worldState.waterPlantLocation) <= 8) {
      grant('CONS_002', 2, " L'impianto di depurazione riattivato fa scorrere acqua pulita.");
    }

    const tables = useLootTableStore.getState().tables.activeSearch;
    const loot = rollLoot(tables[currentBiome] ?? tables.default ?? []);
    if (loot) {
      const stackable = itemDatabase[loot.itemId]?.stackable;
      grant(loot.itemId, loot.quantity + (hasScavenger && stackable ? 1 : 0), hasScavenger && stackable ? ' [Scavenger]' : '');
    }
  },

  openLevelUpScreen: () => {
    if (useCharacterStore.getState().levelUpPending) {
      audioManager.playSound('confirm');
      get().setGameState(GameState.LEVEL_UP_SCREEN);
    } else {
      get().addJournalEntry({ text: "Non hai abbastanza XP per salire di livello.", type: JournalEntryType.SYSTEM_WARNING });
    }
  },

  /** One-off cutscenes tied to places and milestones (checked after moves and new days). */
  checkCutsceneTriggers: () => {
    const { gameTime } = useTimeStore.getState();
    const state = get();
    if (state.gameState !== GameState.IN_GAME) return;

    const once = (flag: string, cutsceneId: string) => {
      state.setFlag(flag);
      state.startCutscene(cutsceneId);
    };

    if (state.currentBiome === 'C' && !state.gameFlags.has('CITY_OF_GHOSTS_PLAYED')) {
      once('CITY_OF_GHOSTS_PLAYED', 'CS_CITY_OF_GHOSTS');
      return;
    }
    if (gameTime.day >= 3 && !state.gameFlags.has('BEING_WATCHED_PLAYED')) {
      once('BEING_WATCHED_PLAYED', 'CS_BEING_WATCHED');
      return;
    }
    if (!state.gameFlags.has('RIVER_INTRO_PLAYED')) {
      const { x, y } = state.playerPos;
      let riverFound = false;
      for (let dy = -2; dy <= 2 && !riverFound; dy++) {
        for (let dx = -2; dx <= 2 && !riverFound; dx++) {
          riverFound = state.map[y + dy]?.[x + dx] === '~';
        }
      }
      if (riverFound) {
        once('RIVER_INTRO_PLAYED', 'CS_RIVER_INTRO');
        return;
      }
    }
    if (state.totalSteps >= 100 && gameTime.day >= 3 && !state.gameFlags.has('HALF_JOURNEY_PLAYED')) {
      once('HALF_JOURNEY_PLAYED', 'CS_HALF_JOURNEY');
      return;
    }
    if (!state.gameFlags.has('POINT_OF_NO_RETURN_PLAYED')) {
      const endPos = findTile(state.map, 'E');
      if (endPos && distance(state.playerPos, endPos) <= 20) {
        once('POINT_OF_NO_RETURN_PLAYED', 'CS_POINT_OF_NO_RETURN');
      }
    }
  },

  /** Activates the pending main story chapter when its condition is met. */
  checkMainStoryTriggers: (context) => {
    const { gameTime } = useTimeStore.getState();
    if (get().mainStoryEventsToday.day !== gameTime.day) {
      set({ mainStoryEventsToday: { day: gameTime.day, count: 0 } });
    }
    get().checkTimeTrophies();

    const state = get();
    if (state.mainStoryEventsToday.count >= MAX_STORY_EVENTS_PER_DAY) return;
    if (state.activeMainStoryEvent || state.gameState !== GameState.IN_GAME) return;

    const { mainStoryChapters } = useMainStoryDatabaseStore.getState();
    const nextChapter = mainStoryChapters.find(c => c.stage === state.mainStoryStage);
    if (!nextChapter) return;
    if (isNightHour(gameTime.hour) && !nextChapter.allowNightTrigger) return;

    const trigger = nextChapter.trigger;
    let conditionMet = false;
    switch (trigger.type) {
      case 'stepsTaken': conditionMet = state.totalSteps >= trigger.value; break;
      case 'daysSurvived': conditionMet = gameTime.day >= trigger.value; break;
      case 'levelReached': conditionMet = useCharacterStore.getState().level >= trigger.value; break;
      case 'combatWins': conditionMet = state.totalCombatWins >= trigger.value; break;
      case 'reachLocation': conditionMet = state.playerPos.x === trigger.value.x && state.playerPos.y === trigger.value.y; break;
      case 'reachEnd': conditionMet = state.map[state.playerPos.y]?.[state.playerPos.x] === 'E'; break;
      case 'nearEnd': {
        const endPos = findTile(state.map, 'E');
        conditionMet = !!endPos && distance(state.playerPos, endPos) <= trigger.distance;
        break;
      }
      // Entering any refuge while this chapter is pending (interactionStore.enterRefuge).
      case 'firstRefugeEntry': conditionMet = Boolean(context?.refugeEntry); break;
    }
    if (conditionMet) get().activateMainStoryChapter(nextChapter);
  },

  activateMainStoryChapter: (chapter: MainStoryChapter) => {
    set(prev => ({
      activeMainStoryEvent: chapter,
      gameState: GameState.MAIN_STORY,
      previousGameState: prev.gameState,
      mainStoryEventsToday: { day: prev.mainStoryEventsToday.day, count: prev.mainStoryEventsToday.count + 1 },
    }));
  },

  resolveMainStory: () => {
    const completedStage = get().mainStoryStage;
    useCharacterStore.getState().unlockTrophy(`trophy_mq_${completedStage}`);
    const newStage = completedStage + 1;

    const { mainStoryChapters } = useMainStoryDatabaseStore.getState();
    const isFinalStage = mainStoryChapters.length > 0 && !mainStoryChapters.some(c => c.stage === newStage);
    if (isFinalStage) {
      // The last chapter ("La Verità", reachEnd) leads to the ending.
      if (useCharacterStore.getState().activeQuests['MQ_THE_ECHO_OF_THE_JOURNEY']) {
        questService.completeQuest('MQ_THE_ECHO_OF_THE_JOURNEY');
      }
      audioManager.playSound('victory');
      set({ mainStoryStage: newStage, activeMainStoryEvent: null, gameState: GameState.VICTORY, pendingCutscenes: [] });
      return;
    }

    set({ mainStoryStage: newStage, activeMainStoryEvent: null });
    get().setGameState(GameState.IN_GAME);
    questService.checkQuestTriggers({ source: 'story' });
  },

  startCutscene: (id) => {
    const knot = LEGACY_CUTSCENE_TO_INK_KNOT[id];
    if (knot) {
      // The opening lands on character creation, like the legacy player did.
      narrativeService.startCutscene(knot, id === 'CS_OPENING' ? GameState.CHARACTER_CREATION : undefined);
      return;
    }
    const { cutscenes } = useCutsceneDatabaseStore.getState();
    if (cutscenes[id]) {
      set(state => ({ activeCutscene: cutscenes[id], previousGameState: state.gameState, gameState: GameState.CUTSCENE }));
    }
  },

  /** Plays a cutscene now if the player is in free roam, otherwise as soon as they are back. */
  queueCutscene: (id) => {
    const state = get();
    if (state.gameState === GameState.IN_GAME && !state.activeCutscene) {
      state.startCutscene(id);
    } else if (!state.pendingCutscenes.includes(id)) {
      set({ pendingCutscenes: [...state.pendingCutscenes, id] });
    }
  },

  processCutsceneConsequences: (consequences: CutsceneConsequence[]) => {
    const character = useCharacterStore.getState();
    const { addJournalEntry } = get();
    const { advanceTime } = useTimeStore.getState();
    for (const consequence of consequences) {
      switch (consequence.type) {
        case 'addItem':
          character.addItem(consequence.payload.itemId, consequence.payload.quantity);
          break;
        case 'equipItem':
          character.equipItem(consequence.payload);
          break;
        case 'setFlag':
          get().setFlag(consequence.payload);
          break;
        case 'startQuest':
          questService.startQuest(consequence.payload);
          break;
        case 'alignmentChange': {
          const { type, amount } = consequence.value ?? consequence.payload ?? {};
          if (type === 'lena' || type === 'elian') character.changeAlignment(type, amount);
          break;
        }
        case 'performModifiedRest':
          addJournalEntry({ text: "Il sonno è leggero, agitato.", type: JournalEntryType.NARRATIVE });
          advanceTime(60, true);
          set({ lastRestTime: useTimeStore.getState().gameTime });
          character.heal(10);
          addJournalEntry({ text: `Un breve e inquieto riposo ti ha concesso solo 10 HP.`, type: JournalEntryType.SYSTEM_WARNING });
          break;
      }
    }
  },

  endCutscene: () => {
    const currentSceneId = get().activeCutscene?.id;
    if (currentSceneId === 'CS_ASH_LULLABY') {
      useCharacterStore.getState().unlockTrophy('trophy_secret_ash_lullaby');
    }
    set({ activeCutscene: null });
    get().setGameState(currentSceneId === 'CS_OPENING' ? GameState.CHARACTER_CREATION : GameState.IN_GAME);
  },

  setFlag: (flag) => {
    if (get().gameFlags.has(flag)) return;
    set(state => ({ gameFlags: new Set(state.gameFlags).add(flag) }));
    const trophy = FLAG_TROPHIES[flag];
    if (trophy) useCharacterStore.getState().unlockTrophy(trophy);
  },

  hasFlag: (flag) => get().gameFlags.has(flag),

  /** Trophies tied to elapsed days. Called whenever a day changes. */
  checkTimeTrophies: () => {
    const { day } = useTimeStore.getState().gameTime;
    const { unlockTrophy } = useCharacterStore.getState();
    // "Sopravvivi per N giorni" = N full days behind you.
    if (day > 7) unlockTrophy('trophy_survive_7_days');
    if (day > 30) unlockTrophy('trophy_survive_30_days');
    if (day - get().lastCombatDay >= 3) unlockTrophy('trophy_misc_no_combat_3_days');
  },

  // ═══════════════════════════════════════════════════════════════════════
  // POINTS OF INTEREST
  // ═══════════════════════════════════════════════════════════════════════
  addPOI: (poi) => {
    set(state => {
      const existing = state.pois.find(p => p.id === poi.id);
      if (existing) {
        return { pois: state.pois.map(p => p.id === poi.id ? { ...p, ...poi, revealed: p.revealed || poi.revealed } : p) };
      }
      return { pois: [...state.pois, poi] };
    });
  },

  revealPOI: (poiId) => {
    const poi = get().pois.find(p => p.id === poiId);
    if (!poi) {
      console.warn(`[POI] Unknown point of interest: ${poiId}`);
      return false;
    }
    if (poi.revealed) return true;
    set(state => ({ pois: state.pois.map(p => p.id === poiId ? { ...p, revealed: true } : p) }));
    get().addJournalEntry({ text: `[MAPPA] Nuovo luogo segnato: ${poi.name}.`, type: JournalEntryType.EVENT, color: '#a78bfa' });
    return true;
  },

  getPOI: (poiId) => get().pois.find(p => p.id === poiId),

  // ═══════════════════════════════════════════════════════════════════════
  // SAVE / LOAD
  // ═══════════════════════════════════════════════════════════════════════
  saveGame: (slot) => {
    if (slot < 1 || slot > NUM_SAVE_SLOTS) {
      get().addJournalEntry({ text: "Slot di salvataggio non valido.", type: JournalEntryType.SYSTEM_ERROR });
      return false;
    }
    try {
      const characterState = useCharacterStore.getState();
      const timeState = useTimeStore.getState();
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
        narrative: { inkState: useNarrativeStore.getState().inkStateJson },
      };
      storage.set(slotKey(slot), JSON.stringify(saveData));
      storage.set(LAST_SAVE_SLOT_KEY, slot.toString());
    } catch (error) {
      const quota = error instanceof DOMException && error.name === 'QuotaExceededError';
      console.error('Error saving game:', error);
      get().addJournalEntry({
        text: quota ? "Spazio di archiviazione insufficiente. Elimina altri salvataggi." : "Errore durante il salvataggio.",
        type: JournalEntryType.SYSTEM_ERROR,
      });
      return false;
    }
    audioManager.playSound('confirm');
    get().addJournalEntry({ text: `Partita salvata nello slot ${slot}.`, type: JournalEntryType.SYSTEM_MESSAGE });
    return true;
  },

  loadGame: (slot) => {
    const raw = storage.get(slotKey(slot));
    if (!raw) return false;
    let savedData: any;
    try {
      savedData = JSON.parse(raw);
    } catch (error) {
      console.error('Corrupted save:', error);
      return false;
    }
    const invalid = validateSaveData(savedData);
    if (invalid) {
      console.error(`Invalid save in slot ${slot}: ${invalid}`);
      return false;
    }

    try {
      useCombatStore.getState().reset();
      useCharacterStore.getState().fromJSON(savedData.character);
      get().fromJSON(savedData.game);
      useTimeStore.getState().fromJSON(savedData.time);
      useInteractionStore.getState().fromJSON(savedData.interaction);
      useEventStore.getState().fromJSON(savedData.event);
      migrateLegacyArmorUpgrades();
    } catch (error) {
      console.error('Error restoring game state:', error);
      return false;
    }

    if (!get().wanderingTrader) get().initializeWanderingTrader();
    narrativeService.loadInkStateJson(savedData.narrative?.inkState ?? null);

    try { storage.set(LAST_SAVE_SLOT_KEY, slot.toString()); } catch { /* not critical */ }
    get().addJournalEntry({ text: `Partita caricata dallo slot ${slot}.`, type: JournalEntryType.SYSTEM_MESSAGE });
    set({ previousGameState: null });
    get().setGameState(GameState.IN_GAME);
    // Re-evaluate quests against the loaded state (old saves may be mid-stage).
    questService.checkQuestTriggers({ source: 'load' });
    return true;
  },

  toJSON: () => {
    const s = get();
    return {
      playerPos: s.playerPos,
      playerStatus: s.playerStatus,
      journal: s.journal,
      currentBiome: s.currentBiome,
      lastRestTime: s.lastRestTime,
      lastEncounterTime: s.lastEncounterTime,
      lastSearchedBiome: s.lastSearchedBiome,
      lastLoreEventDay: s.lastLoreEventDay,
      lastCombatDay: s.lastCombatDay,
      visitedRefuges: s.visitedRefuges,
      mainStoryStage: s.mainStoryStage,
      totalSteps: s.totalSteps,
      totalCombatWins: s.totalCombatWins,
      activeMainStoryEvent: s.activeMainStoryEvent,
      pendingCutscenes: s.pendingCutscenes,
      gameFlags: Array.from(s.gameFlags),
      mainStoryEventsToday: s.mainStoryEventsToday,
      visitedBiomes: Array.from(s.visitedBiomes),
      wanderingTrader: s.wanderingTrader,
      worldState: s.worldState,
      pois: s.pois.map(({ id, name, x, y, eventId, revealed, marker, oneShot, consumed }) => ({ id, name, x, y, eventId, revealed, marker, oneShot, consumed })),
      traderStock: s.traderStock,
      lightUntil: s.lightUntil,
      repelUntil: s.repelUntil,
      lastShelterDay: s.lastShelterDay,
      lastRadioDay: s.lastRadioDay,
    };
  },

  fromJSON: (json) => {
    const startPos = findTile(MAP_DATA, 'S') ?? { x: 0, y: 0 };
    const flags = new Set<string>(Array.isArray(json.gameFlags) ? json.gameFlags : []);
    // Saves before 2.1 tracked the debug panel through a game flag.
    flags.delete('SHOW_DEBUG_PANEL');
    set({
      map: MAP_DATA,
      playerPos: json.playerPos ?? startPos,
      playerStatus: json.playerStatus ?? { isExitingWater: false },
      journal: Array.isArray(json.journal) ? json.journal : [],
      currentBiome: json.currentBiome ?? 'S',
      lastRestTime: json.lastRestTime ?? null,
      lastEncounterTime: json.lastEncounterTime ?? null,
      lastSearchedBiome: json.lastSearchedBiome ?? null,
      lastLoreEventDay: json.lastLoreEventDay ?? 0,
      lastCombatDay: json.lastCombatDay ?? 1,
      visitedRefuges: Array.isArray(json.visitedRefuges) ? json.visitedRefuges : [],
      mainStoryStage: json.mainStoryStage ?? 1,
      totalSteps: json.totalSteps ?? 0,
      totalCombatWins: json.totalCombatWins ?? 0,
      activeMainStoryEvent: null,
      activeCutscene: null,
      pendingCutscenes: Array.isArray(json.pendingCutscenes) ? json.pendingCutscenes : [],
      gameFlags: flags,
      mainStoryEventsToday: json.mainStoryEventsToday ?? { day: 1, count: 0 },
      deathCause: null,
      visitedBiomes: new Set<string>(Array.isArray(json.visitedBiomes) ? json.visitedBiomes : []),
      wanderingTrader: json.wanderingTrader ?? null,
      worldState: json.worldState ?? initialWorldState(),
      pois: buildPOIs(json.pois),
      traderStock: json.traderStock ?? {},
      lightUntil: json.lightUntil ?? 0,
      repelUntil: json.repelUntil ?? 0,
      lastShelterDay: json.lastShelterDay ?? 0,
      lastRadioDay: json.lastRadioDay ?? 0,
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WANDERING TRADER
  // ═══════════════════════════════════════════════════════════════════════
  initializeWanderingTrader: () => {
    const { map, playerPos } = get();
    const validTiles: Position[] = [];
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        if ((tile === '.' || tile === 'F' || tile === 'C' || tile === 'V') && (x !== playerPos.x || y !== playerPos.y)) {
          validTiles.push({ x, y });
        }
      }
    }
    if (validTiles.length === 0) return;
    const spawn = validTiles[Math.floor(Math.random() * validTiles.length)];
    set({ wanderingTrader: { position: spawn, turnsUntilMove: 5 } });
  },

  advanceTraderTurn: () => {
    set(state => state.wanderingTrader
      ? { wanderingTrader: { ...state.wanderingTrader, turnsUntilMove: state.wanderingTrader.turnsUntilMove - 1 } }
      : {});
  },

  moveTrader: (newPosition: Position) => {
    set(state => state.wanderingTrader ? { wanderingTrader: { position: newPosition, turnsUntilMove: 5 } } : {});
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WORLD STATE
  // ═══════════════════════════════════════════════════════════════════════
  activateWaterPump: (location: Position) => {
    set(state => ({
      worldState: {
        ...state.worldState,
        repairedPumps: [...state.worldState.repairedPumps.filter(p => p.x !== location.x || p.y !== location.y), location],
        destroyedPumps: state.worldState.destroyedPumps.filter(p => p.x !== location.x || p.y !== location.y),
      }
    }));
    get().setFlag('PUMP_REPAIRED');
    get().addJournalEntry({ text: `[MONDO] La pompa è di nuovo funzionante: potrai tornare a riempire le borracce.`, type: JournalEntryType.XP_GAIN, color: '#38bdf8' });
  },

  destroyWaterPump: (location: Position) => {
    set(state => ({
      worldState: {
        ...state.worldState,
        destroyedPumps: [...state.worldState.destroyedPumps.filter(p => p.x !== location.x || p.y !== location.y), location],
        repairedPumps: state.worldState.repairedPumps.filter(p => p.x !== location.x || p.y !== location.y),
      }
    }));
    get().setFlag('PUMP_DESTROYED');
    get().addJournalEntry({ text: `[MONDO] La pompa è irrimediabilmente distrutta.`, type: JournalEntryType.SYSTEM_WARNING });
  },

  canUseWaterPump: (location: Position): boolean =>
    get().worldState.repairedPumps.some(p => p.x === location.x && p.y === location.y),

  activateWaterPlant: (location: Position) => {
    set(state => ({ worldState: { ...state.worldState, waterPlantActive: true, waterPlantLocation: location } }));
    get().setFlag('WATER_PLANT_ACTIVE');
    get().addJournalEntry({ text: `[MONDO] L'impianto di depurazione è attivo! Cercando risorse nei dintorni troverai acqua pulita.`, type: JournalEntryType.XP_GAIN, color: '#38bdf8' });
  },
}));
