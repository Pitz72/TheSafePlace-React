// FIX: Removed self-import of GameState and JournalEntryType to fix circular dependency and merge declaration errors.

// --- Game State & Core Types ---
export enum GameState {
  INITIAL_BLACK_SCREEN,
  PRESENTS_SCREEN,
  INTERSTITIAL_BLACK_SCREEN,
  BOOTING_SCREEN,
  MAIN_MENU,
  INSTRUCTIONS_SCREEN,
  STORY_SCREEN,
  OPTIONS_SCREEN,
  TROPHY_SCREEN,
  CUTSCENE,
  CHARACTER_CREATION,
  IN_GAME,
  PAUSE_MENU,
  SAVE_GAME,
  LOAD_GAME,
  EVENT_SCREEN,
  LEVEL_UP_SCREEN,
  COMBAT,
  MAIN_STORY,
  ASH_LULLABY_CHOICE,
  QUEST_LOG,
  GAME_OVER,
}

export enum JournalEntryType {
  GAME_START,
  SKILL_CHECK_SUCCESS,
  SKILL_CHECK_FAILURE,
  ACTION_FAILURE,
  NARRATIVE,
  ITEM_ACQUIRED,
  SYSTEM_ERROR,
  SYSTEM_WARNING,
  SYSTEM_MESSAGE,
  COMBAT,
  XP_GAIN,
  EVENT,
  TROPHY_UNLOCKED,
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
}

export interface JournalEntry {
    type: JournalEntryType;
    text: string;
    time: GameTime;
    color?: string;
}

export interface TileInfo {
  char: string;
  name: string;
}

// --- Weather System ---
export enum WeatherType {
    SERENO = 'Sereno',
    NUVOLOSO = 'Nuvoloso',
    PIOGGIA = 'Pioggia',
    TEMPESTA = 'Tempesta',
    NEBBIA = 'Nebbia',
}

export interface WeatherState {
  type: WeatherType;
  duration: number; // in minutes
}

// --- Main Story System ---
export type StoryTriggerType =
  | 'stepsTaken'
  | 'daysSurvived'
  | 'levelReached'
  | 'combatWins'
  | 'firstRefugeEntry'
  | 'reachLocation'
  | 'reachEnd'
  | 'nearEnd';

export type StoryTrigger =
  | { type: 'stepsTaken'; value: number }
  | { type: 'daysSurvived'; value: number }
  | { type: 'levelReached'; value: number }
  | { type: 'combatWins'; value: number }
  | { type: 'firstRefugeEntry' }
  | { type: 'reachLocation'; value: Position }
  | { type: 'reachEnd' }
  | { type: 'nearEnd'; distance: number };

export interface MainStoryChapter {
  stage: number;
  title: string;
  text: string;
  trigger: StoryTrigger;
  allowNightTrigger?: boolean;
}

// --- Quest System ---
/**
 * Type of quest: MAIN (main storyline) or SUB (side quest)
 */
export type QuestType = 'MAIN' | 'SUB';

/**
 * Types of triggers that can advance a quest stage
 */
export type QuestTriggerType = 
  | 'reachLocation'
  | 'getItem'
  | 'useItem'
  | 'enemyDefeated'
  | 'interactWithObject'
  | 'skillCheckSuccess';

/**
 * Defines a condition that must be met to advance a quest stage
 */
export interface QuestTrigger {
  type: QuestTriggerType;
  value: any; // e.g., { x: 10, y: 20 } for reachLocation, 'item_id' for getItem
}

/**
 * Rewards granted upon quest completion
 */
export interface QuestReward {
  xp?: number;
  items?: Array<{ itemId: string; quantity: number }>;
  statBoost?: { stat: keyof CharacterAttributes; amount: number };
}

/**
 * A single stage/objective within a quest
 */
export interface QuestStage {
  stage: number;
  objective: string; // Description shown to player (e.g., "Find the old windmill.")
  trigger: QuestTrigger;
}

/**
 * Complete quest definition
 */
export interface Quest {
  id: string; // Unique ID, e.g., "find_jonas_talisman"
  title: string; // Title shown to player, e.g., "The Lost Talisman"
  type: QuestType;
  startText: string; // Narrative text shown when quest starts
  stages: QuestStage[];
  finalReward: QuestReward;
}

// --- UI & Menu States ---
export type VisualTheme = 'standard' | 'crt' | 'high_contrast';

export interface ActionMenuState {
    isOpen: boolean;
    options: string[];
    selectedIndex: number;
}

export interface RefugeMenuState {
    isOpen: boolean;
    options: string[];
    selectedIndex: number;
}

export interface CraftingMenuState {
    selectedIndex: number;
}

// --- Cutscene System ---
export interface CutsceneConsequence {
    type: 'setFlag' | 'addItem' | 'equipItemByIndex' | 'performModifiedRest' | 'startQuest';
    payload?: any;
}

export interface CutsceneChoice {
    text: string;
    targetPage: number;
}

export interface CutscenePage {
    text: string;
    choices?: CutsceneChoice[];
    consequences?: CutsceneConsequence[];
    nextPage?: number | null;
}

export interface Cutscene {
    id: string;
    title: string;

    pages: CutscenePage[];
}


// --- Event System ---
export type EventResultType = 
    | 'addItem' | 'removeItem' | 'addXp' | 'takeDamage' | 'advanceTime' 
    | 'journalEntry' | 'alignmentChange' | 'statusChange' | 'statBoost' | 'revealMapPOI' | 'heal' | 'special' | 'startQuest';

export interface EventResult {
    type: EventResultType;
    value: any;
    text?: string;
}

export interface EventOutcome {
    type: 'direct' | 'skillCheck';
    skill?: SkillName;
    dc?: number;
    success?: EventResult[];
    failure?: EventResult[];
    results?: EventResult[]; // For direct outcomes
    successText?: string;
    failureText?: string;
}

export interface EventChoice {
    text: string;
    alignment?: 'Lena' | 'Elian';
    itemRequirements?: { itemId: string; quantity: number }[];
    outcomes: EventOutcome[];
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    biomes: string[];
    isUnique: boolean;
    choices: EventChoice[];
}

// --- Crafting System ---
export interface Ingredient {
    itemId: string;
    quantity: number;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    skill: SkillName;
    dc: number;
    timeCost: number; // in minutes
    ingredients: Ingredient[];
    results: {
        itemId: string;
        quantity: number;
    }[];
}

// --- Talent System ---
export interface Talent {
  id: string;
  name: string;
  description: string;
  requiredSkill: SkillName;
  levelRequirement: number;
}

// --- Combat System ---
export interface EnemyTactic {
  id: string;
  name: string;
  description: string;
  skillCheck?: { skill: SkillName; dc: number };
}

export type EnemyType = 'humanoid' | 'beast';

export interface Enemy {
  id: string;
  name: string;
  description: string;
  type: EnemyType;
  hp: number;
  ac: number;
  attack: {
    damage: number;
    bonus: number;
  };
  xp: number;
  biomes: string[];
  tactics: {
    revealDc: number;
    description: string;
    actions: EnemyTactic[];
  };
}

export interface CombatLogEntry {
    text: string;
    color?: string;
}

export interface CombatDebuff {
    type: 'stunned';
    turns: number;
}

export interface CombatState {
    enemy: Enemy;
    enemyHp: Stat;
    playerTurn: boolean;
    log: CombatLogEntry[];
    revealedTactics: boolean;
    availableTacticalActions: EnemyTactic[];
    debuffs?: CombatDebuff[];
    victory?: boolean;
}


// --- Store States ---
export interface PlayerStatus {
    isExitingWater: boolean;
}

export type PlayerCombatActionPayload =
  | { type: 'attack' | 'analyze' | 'flee' }
  | { type: 'tactic', tacticId: string }
  | { type: 'use_item', itemId: string };

export type DeathCause = 'COMBAT' | 'STARVATION' | 'DEHYDRATION' | 'SICKNESS' | 'POISON' | 'ENVIRONMENT' | 'UNKNOWN';

export interface GameStoreState {
  gameState: GameState;
  previousGameState: GameState | null;
  visualTheme: VisualTheme;
  map: string[][];
  playerPos: Position;
  playerStatus: PlayerStatus;
  journal: JournalEntry[];
  currentBiome: string;
  lastRestTime: GameTime | null;
  lastEncounterTime: GameTime | null;
  lastSearchedBiome: string | null;
  lastLoreEventDay: number | null;
  lootedRefuges: Position[];
  visitedRefuges: Position[];
  mainStoryStage: number;
  totalSteps: number;
  totalCombatWins: number;
  activeMainStoryEvent: MainStoryChapter | null;
  activeCutscene: Cutscene | null;
  gameFlags: Set<string>;
  mainStoryEventsToday: { day: number; count: number };
  deathCause: DeathCause | null;
  visitedBiomes: Set<string>;
  damageFlash: boolean;
  
  // Actions
  triggerDamageFlash: () => void;
  setGameState: (newState: GameState) => void;
  setGameOver: (cause: DeathCause) => void;
  setVisualTheme: (theme: VisualTheme) => void;
  addJournalEntry: (entry: { text: string; type: JournalEntryType; color?: string }) => void;
  setMap: () => void;
  movePlayer: (dx: number, dy: number) => void;
  getTileInfo: (x: number, y: number) => TileInfo;
  performQuickRest: () => void;
  performActiveSearch: () => void;
  openLevelUpScreen: () => void;
  checkMainStoryTriggers: () => void;
  resolveMainStory: () => void;
  startCutscene: (id: string) => void;
  processCutsceneConsequences: (consequences: CutsceneConsequence[]) => void;
  endCutscene: () => void;
  checkCutsceneTriggers: () => void;
  // Save/Load System
  saveGame: (slot: number) => boolean;
  loadGame: (slot: number) => boolean;
  restoreState: (state: any) => void;
  toJSON: () => object;
  fromJSON: (json: any) => void;
}


// --- Character System ---
export type AttributeName = 'for' | 'des' | 'cos' | 'int' | 'sag' | 'car';

export type SkillName = 
  | 'atletica' | 'acrobazia' | 'furtivita' | 'rapiditaDiMano'
  | 'arcanismo' | 'storia' | 'investigare' | 'natura' | 'religione'
  | 'addestrareAnimali' | 'intuizione' | 'medicina' | 'percezione' | 'sopravvivenza'
  | 'inganno' | 'intimidire' | 'persuasione' | 'spettacolo';

export type PlayerStatusCondition = 
  | 'FERITO'          // -2 skill fisiche
  | 'MALATO'          // -0.5 HP/ora
  | 'AVVELENATO'      // -2 HP/ora
  | 'IPOTERMIA'       // -1 HP/ora, -3 a tutte le skill
  | 'ESAUSTO'         // -2 a skill fisiche, movimento +5 minuti
  | 'AFFAMATO'        // -1 a tutte le skill
  | 'DISIDRATATO'     // -2 a percezione e intelligenza
  | 'INFEZIONE';      // -1 HP/ora, -2 a tutte le skill

export interface Attributes {
  for: number;
  des: number;
  cos: number;
  int: number;
  sag: number;
  car: number;
}

// Type alias for CharacterAttributes (used in QuestReward)
export type CharacterAttributes = Attributes;

export interface Skill {
    proficient: boolean;
}

export interface SkillDefinition {
  attribute: AttributeName;
}

export interface SkillCheckResult {
  skill: SkillName;
  roll: number;
  bonus: number;
  total: number;
  dc: number;
  success: boolean;
}

export interface Stat {
    current: number;
    max: number;
}

export interface XPState {
    current: number;
    next: number;
}

export interface InventoryItem {
    itemId: string;
    quantity: number;
    durability?: {
      current: number;
      max: number;
    };
}

export interface Alignment {
  lena: number;
  elian: number;
}

export interface CharacterState {
    level: number;
    xp: XPState;
    hp: Stat;
    satiety: Stat;
    hydration: Stat;
    fatigue: Stat;
    attributes: Attributes;
    skills: Record<SkillName, Skill>;
    inventory: InventoryItem[];
    equippedWeapon: number | null; // Index in inventory array
    equippedArmor: number | null;  // Index in inventory array (chest slot)
    equippedHead: number | null;   // Index in inventory array
    equippedLegs: number | null;   // Index in inventory array
    alignment: Alignment;
    status: Set<PlayerStatusCondition>;
    levelUpPending: boolean;
    knownRecipes: string[];
    unlockedTalents: string[];
    unlockedTrophies: Set<string>;
    activeQuests: Record<string, number>; // questId -> currentStage
    completedQuests: string[]; // Array for JSON serialization

    // Actions
    initCharacter: () => void;
    setAttributes: (newAttributes: Attributes) => void;
    getAttributeModifier: (attribute: AttributeName) => number;
    getSkillBonus: (skill: SkillName) => number;
    performSkillCheck: (skill: SkillName, dc: number) => SkillCheckResult;
    addXp: (amount: number) => void;
    gainExplorationXp: () => void;
    applyLevelUp: (choices: { attribute: AttributeName, talentId: string }) => void;
    addItem: (itemId: string, quantity?: number) => void;
    removeItem: (itemId: string, quantity?: number) => void;
    discardItem: (inventoryIndex: number, quantity?: number) => void;
    equipItem: (inventoryIndex: number) => void;
    unequipItem: (slot: 'weapon' | 'armor' | 'head' | 'chest' | 'legs') => void;
    damageEquippedItem: (slot: 'weapon' | 'armor', amount: number) => void;
    repairItem: (inventoryIndex: number, amount: number) => void;
    salvageItem: (inventoryIndex: number) => void;
    takeDamage: (amount: number, cause?: DeathCause) => void;
    updateSurvivalStats: (minutes: number, weather: WeatherType) => void;
    calculateSurvivalCost: (minutes: number) => { satietyCost: number; hydrationCost: number };
    heal: (amount: number) => void;
    updateFatigue: (amount: number) => void;
    rest: (amount: number) => void;
    restoreSatiety: (amount: number) => void;
    restoreHydration: (amount: number) => void;
    changeAlignment: (type: 'lena' | 'elian', amount: number) => void;
    addStatus: (newStatus: PlayerStatusCondition) => void;
    removeStatus: (statusToRemove: PlayerStatusCondition) => void;
    boostAttribute: (attribute: AttributeName, amount: number) => void;
    learnRecipe: (recipeId: string) => void;
    getPlayerAC: () => number;
    getTotalWeight: () => number;
    getMaxCarryWeight: () => number;
    unlockTrophy: (trophyId: string) => void;
    // Save/Load System
    restoreState: (state: Partial<CharacterState>) => void;
    toJSON: () => object;
    fromJSON: (json: any) => void;
}

// --- Item System ---
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'ammo' | 'manual' | 'tool';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'quest';
export type WeaponType = 'melee' | 'ranged' | 'thrown';
export type ArmorSlot = 'head' | 'chest' | 'legs';
export type ItemEffectType = 
    | 'heal' | 'satiety' | 'hydration' | 'light' | 'trap' | 'container' 
    | 'vision' | 'repair' | 'shelter' | 'random' | 'antirad' | 'power' 
    | 'fishing' | 'smoke' | 'communication' | 'fire' | 'cureStatus';

export interface ItemEffect {
    type: ItemEffectType;
    value: number | string;
}

export interface IItem {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: Rarity;
    weight: number;
    value: number;
    stackable: boolean;
    color: string;
    damage?: number;
    durability?: number; // Max durability
    weaponType?: WeaponType;
    defense?: number;
    slot?: ArmorSlot;
    effects?: ItemEffect[];
    unlocksRecipe?: string;
}