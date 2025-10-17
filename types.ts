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
  CUTSCENE,
  CHARACTER_CREATION,
  IN_GAME,
  PAUSE_MENU,
  SAVE_GAME,
  LOAD_GAME,
  EVENT_SCREEN,
  LEVEL_UP_SCREEN,
  COMBAT,
  MAIN_QUEST,
  ASH_LULLABY_CHOICE,
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
  COMBAT,
  XP_GAIN,
  EVENT,
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

// --- Main Quest System ---
export type QuestTriggerType =
  | 'stepsTaken'
  | 'daysSurvived'
  | 'levelReached'
  | 'combatWins'
  | 'firstRefugeEntry'
  | 'reachLocation'
  | 'reachEnd';

export type QuestTrigger =
  | { type: 'stepsTaken'; value: number }
  | { type: 'daysSurvived'; value: number }
  | { type: 'levelReached'; value: number }
  | { type: 'combatWins'; value: number }
  | { type: 'firstRefugeEntry' }
  | { type: 'reachLocation'; value: Position }
  | { type: 'reachEnd' };

export interface MainQuestChapter {
  stage: number;
  title: string;
  text: string;
  trigger: QuestTrigger;
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
    type: 'setFlag' | 'addItem' | 'equipItemByIndex' | 'performModifiedRest';
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
    | 'journalEntry' | 'alignmentChange' | 'statusChange' | 'statBoost' | 'revealMapPOI' | 'heal' | 'special';

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
    result: {
        itemId: string;
        quantity: number;
    };
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

export interface Enemy {
  id: string;
  name: string;
  description: string;
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

// FIX: Extracted the combat action payload into a dedicated type to be reused across stores.
export type PlayerCombatActionPayload =
  | { type: 'attack' | 'analyze' | 'flee' }
  | { type: 'tactic', tacticId: string }
  | { type: 'use_item', itemId: string };

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
  lastLoreEventDay: number | null;
  lootedRefuges: Position[];
  visitedRefuges: Position[];
  mainQuestStage: number;
  totalSteps: number;
  totalCombatWins: number;
  activeMainQuestEvent: MainQuestChapter | null;
  activeCutscene: Cutscene | null;
  gameFlags: Set<string>;
  mainQuestsToday: { day: number; count: number };
  
  // Actions
  setGameState: (newState: GameState) => void;
  setVisualTheme: (theme: VisualTheme) => void;
  addJournalEntry: (entry: { text: string; type: JournalEntryType; color?: string }) => void;
  setMap: () => void;
  movePlayer: (dx: number, dy: number) => void;
  getTileInfo: (x: number, y: number) => TileInfo;
  performQuickRest: () => void;
  openLevelUpScreen: () => void;
  checkMainQuestTriggers: () => void;
  resolveMainQuest: () => void;
  startCutscene: (id: string) => void;
  processCutsceneConsequences: (consequences: CutsceneConsequence[]) => void;
  endCutscene: () => void;
  checkCutsceneTriggers: () => void;
  // Save/Load System
  saveGame: (slot: number) => boolean;
  loadGame: (slot: number) => boolean;
  restoreState: (state: any) => void;
}


// --- Character System ---
export type AttributeName = 'for' | 'des' | 'cos' | 'int' | 'sag' | 'car';

export type SkillName = 
  | 'atletica' | 'acrobazia' | 'furtivita' | 'rapiditaDiMano'
  | 'arcanismo' | 'storia' | 'investigare' | 'natura' | 'religione'
  | 'addestrareAnimali' | 'intuizione' | 'medicina' | 'percezione' | 'sopravvivenza'
  | 'inganno' | 'intimidire' | 'persuasione' | 'spettacolo';

export type PlayerStatusCondition = 'FERITO' | 'MALATO' | 'AVVELENATO';

export interface Attributes {
  for: number;
  des: number;
  cos: number;
  int: number;
  sag: number;
  car: number;
}

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
    attributes: Attributes;
    skills: Record<SkillName, Skill>;
    inventory: InventoryItem[];
    equippedWeapon: number | null; // Index in inventory array
    equippedArmor: number | null;  // Index in inventory array
    alignment: Alignment;
    status: Set<PlayerStatusCondition>;
    levelUpPending: boolean;
    knownRecipes: string[];
    unlockedTalents: string[];

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
    unequipItem: (slot: 'weapon' | 'armor') => void;
    damageEquippedItem: (slot: 'weapon' | 'armor', amount: number) => void;
    repairItem: (inventoryIndex: number, amount: number) => void;
    salvageItem: (inventoryIndex: number) => void;
    takeDamage: (amount: number) => void;
    updateSurvivalStats: (minutes: number, weather: WeatherType) => void;
    calculateSurvivalCost: (minutes: number) => { satietyCost: number; hydrationCost: number };
    heal: (amount: number) => void;
    restoreSatiety: (amount: number) => void;
    restoreHydration: (amount: number) => void;
    changeAlignment: (type: 'lena' | 'elian', amount: number) => void;
    addStatus: (newStatus: PlayerStatusCondition) => void;
    removeStatus: (statusToRemove: PlayerStatusCondition) => void;
    boostAttribute: (attribute: AttributeName, amount: number) => void;
    learnRecipe: (recipeId: string) => void;
    getPlayerAC: () => number;
    // Save/Load System
    restoreState: (state: Partial<CharacterState>) => void;
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