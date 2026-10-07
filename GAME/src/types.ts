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
  OUTPOST,
  DIALOGUE,
  TRADING,
  GAME_OVER,
  VICTORY,
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
export type StoryTrigger =
  | { type: 'stepsTaken'; value: number }
  | { type: 'daysSurvived'; value: number }
  | { type: 'levelReached'; value: number }
  | { type: 'combatWins'; value: number }
  // Fires when the player enters any refuge while this chapter is the pending one.
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

// --- Points of Interest ---
/**
 * A place on the map the player knows about. Static POIs come from
 * data/pois.json, dynamic ones are registered by events (e.g. the theatre the
 * player stumbled into) so quests can send the player back there.
 */
export interface PointOfInterest {
  id: string;
  name: string;
  x: number;
  y: number;
  /** Event opened when the player steps on the POI. */
  eventId?: string;
  /** Shown on the map with a marker. */
  revealed: boolean;
  /** false for places that already have their own map tile (outpost, herbalist...). */
  marker?: boolean;
  /** The POI event can only fire once. */
  oneShot?: boolean;
  /** The one-shot event already fired. */
  consumed?: boolean;
}

// --- Quest System ---
export type QuestType = 'MAIN' | 'SUB';

export type QuestTriggerType =
  | 'reachLocation'
  | 'getItem'
  | 'hasItems'
  | 'hasFlags'
  | 'enemyDefeated'
  | 'interactWithObject'
  | 'talkToNPC'
  | 'completeEvent'
  | 'mainStoryComplete'
  | 'craftItem'
  | 'successfulFlee'
  | 'tacticRevealed';

/** reachLocation target: fixed coordinates or a POI id resolved at runtime. */
export type QuestLocation = Position | { poi: string };

export interface QuestTrigger {
  type: QuestTriggerType;
  value: any;
}

export interface QuestReward {
  xp?: number;
  items?: Array<{ itemId: string; quantity: number }>;
  statBoost?: { stat: keyof CharacterAttributes; amount: number };
  /** Lore archive entry unlocked on completion. */
  lore?: string;
  /** Game flags set on completion (e.g. MARCUS_FRIENDSHIP). */
  flags?: string[];
}

export interface QuestStage {
  stage: number;
  objective: string;
  trigger: QuestTrigger;
  /** Where the stage takes place: drawn as a quest marker on the map. */
  location?: QuestLocation;
}

export interface Quest {
  id: string;
  title: string;
  type: QuestType;
  startText: string;
  stages: QuestStage[];
  finalReward: QuestReward;
  /** POIs put on the map when the quest starts. */
  revealPOIs?: string[];
  /** Extra journal line shown on completion. */
  completionText?: string;
}

/** Context passed to the quest engine to tell it what just happened. */
export interface QuestCheckContext {
  source: 'move' | 'item' | 'craft' | 'event' | 'dialogue' | 'combat' | 'story' | 'flag' | 'load';
  itemId?: string;
  /** talkToNPC / interactWithObject id emitted by dialogues and events. */
  nodeId?: string;
  eventId?: string;
}

// --- Trading System ---
export interface TradeItem {
  inventoryIndex: number; // Index in player's inventory or trader's inventory
  itemId: string;
  quantity: number;
  value: number; // Total value (item.value × quantity)
}

export interface Trader {
  id: string;
  name: string;
  description: string;
  inventory: Array<{ itemId: string; quantity: number }>;
  baseMarkup: number; // e.g. 1.5 = 150%
  /** Hours after which sold-out stock is replenished. */
  restockHours?: number;
}

// --- UI & Menu States ---
export type VisualTheme = 'standard' | 'crt' | 'high_contrast';

export interface ActionMenuState {
  isOpen: boolean;
  options: string[];
  selectedIndex: number;
  /** 'repair': options are repair targets, targetIndices maps them to inventory slots. */
  mode?: 'actions' | 'repair';
  targetIndices?: number[];
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
  type: 'setFlag' | 'addItem' | 'equipItem' | 'performModifiedRest' | 'startQuest' | 'alignmentChange';
  payload?: any;
  value?: any;
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
  | 'journalEntry' | 'alignmentChange' | 'statusChange' | 'removeStatus' | 'statBoost'
  | 'revealMapPOI' | 'heal' | 'special' | 'startQuest' | 'setFlag' | 'unlockTrophy'
  | 'learnRecipe' | 'addLore' | 'questTrigger' | 'hydration' | 'satiety';

export type SpecialEffectName =
  | 'startDialogue' | 'startTrading' | 'startCombat' | 'startCutscene' | 'setFlag'
  | 'completeQuest' | 'failQuest' | 'advanceQuest'
  | 'activateWaterPump' | 'destroyWaterPump' | 'activateWaterPlant'
  | 'revealPOI' | 'registerPOI';

export interface EventResult {
  type: EventResultType;
  value: any;
  text?: string;
  quantity?: number;
}

export interface EventOutcome {
  type: 'direct' | 'skillCheck' | 'special';
  skill?: SkillName;
  dc?: number;
  success?: EventResult[];
  failure?: EventResult[];
  results?: EventResult[]; // For direct outcomes
  successText?: string;
  failureText?: string;
  /** 'special' outcomes carry the effect directly. */
  value?: any;
  text?: string;
}

export interface EventChoice {
  text: string;
  alignment?: 'Lena' | 'Elian';
  itemRequirements?: { itemId: string; quantity: number }[];
  /** Choice only shown while this quest is active. */
  requiresQuest?: string;
  /** Choice hidden once this quest has been started (active, completed or failed). */
  hideIfQuestKnown?: string;
  /** Choice only shown when these game flags are all set. */
  requiresFlag?: string | string[];
  /** Choice hidden as soon as any of these game flags is set. */
  hideIfFlag?: string | string[];
  outcomes: EventOutcome[];
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  biomes: string[];
  isUnique: boolean;
  choices: EventChoice[];
  /** Random encounters only: offered while this quest is active. */
  requiresQuest?: string;
  /** Random encounters only: no longer offered once this quest has been started. */
  excludesQuest?: string;
  /** Random encounters only: offered when this flag is set / not set. */
  requiresFlag?: string;
  excludesFlag?: string;
  /** Never picked by random encounters: opened by points of interest or code. */
  questOnly?: boolean;
  /** Alternative descriptions; the last one whose flag is set replaces the description. */
  variants?: Array<{ requiresFlag: string; description: string }>;
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
  isElite?: boolean;
  /** false: never picked by random encounters (story/quest enemies). */
  randomEncounter?: boolean;
  /** Items always dropped on defeat. */
  guaranteedLoot?: Array<{ itemId: string; quantity: number }>;
  /** Quest trigger id emitted when this enemy is defeated. */
  defeatTrigger?: string;
  /** Game flag set when this enemy is defeated (story enemies that stay dead). */
  defeatFlag?: string;
  specialAbility?: {
    id: string;
    name: string;
    description: string;
    trigger: 'turn_2' | 'player_miss' | 'low_hp';
    probability?: number;
  };
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

export type SpecialAmmoType = 'piercing' | 'incendiary' | 'hollow_point';

export interface CombatState {
  enemy: Enemy;
  enemyHp: Stat;
  playerTurn: boolean;
  log: CombatLogEntry[];
  revealedTactics: boolean;
  availableTacticalActions: EnemyTactic[];
  victory?: boolean;
  biome?: string;
  environmentalBonusActive?: boolean;
  environmentalBonusTurns?: number;
  specialAmmoActive?: SpecialAmmoType | null;
  specialAmmoRounds?: number;
  enemyBurning?: boolean;
  enemyBurningTurns?: number;
  /** Enemy loses its next N turns (traps, stun). */
  enemyStunnedTurns?: number;
  turnCount?: number;
  abilityUsedThisCombat?: boolean;
  /** Damage the player took in this fight (Intoccabile trophy). */
  damageTaken?: number;
  /** The player already made an attack (Ombra del Crepuscolo talent). */
  playerHasAttacked?: boolean;
  /** A tactical action was attempted (Stratega trophy). */
  usedTactic?: boolean;
  /** The player's last attack missed (elite counterattacks). */
  lastPlayerAttackMissed?: boolean;
  /** Log index where the victory summary (kill, XP, loot) starts. */
  victoryLogStart?: number;
}

export type PlayerCombatActionPayload =
  | { type: 'attack' | 'analyze' | 'flee' }
  | { type: 'tactic', tacticId: string }
  | { type: 'use_item', itemId: string }
  | { type: 'environmental', actionId: 'hide_in_trees' | 'seek_cover' }
  | { type: 'load_special_ammo', ammoType: SpecialAmmoType };

export type DeathCause = 'COMBAT' | 'STARVATION' | 'DEHYDRATION' | 'SICKNESS' | 'POISON' | 'ENVIRONMENT' | 'UNKNOWN';

export interface WanderingTraderState {
  position: Position;
  turnsUntilMove: number;
}

/** Permanent changes to the game world. */
export interface WorldState {
  repairedPumps: Position[];
  destroyedPumps: Position[];
  waterPlantActive: boolean;
  waterPlantLocation: Position | null;
}

export interface LoreEntry {
  id: string;
  title: string;
  text: string;
  category: 'project' | 'history' | 'character' | 'world';
}

export interface GameStoreState {
  gameState: GameState;
  previousGameState: GameState | null;
  visualTheme: VisualTheme;
  map: string[][];
  playerPos: Position;
  playerStatus: { isExitingWater: boolean };
  journal: JournalEntry[];
  currentBiome: string;
  lastRestTime: GameTime | null;
  lastEncounterTime: GameTime | null;
  lastSearchedBiome: string | null;
  lastLoreEventDay: number | null;
  /** Day of the last fight (Fantasma trophy). */
  lastCombatDay: number;
  visitedRefuges: Position[];
  mainStoryStage: number;
  totalSteps: number;
  totalCombatWins: number;
  activeMainStoryEvent: MainStoryChapter | null;
  activeCutscene: Cutscene | null;
  /** Cutscenes waiting for the player to be back in free roam. */
  pendingCutscenes: string[];
  gameFlags: Set<string>;
  mainStoryEventsToday: { day: number; count: number };
  deathCause: DeathCause | null;
  visitedBiomes: Set<string>;
  damageFlash: boolean;
  wanderingTrader: WanderingTraderState | null;
  worldState: WorldState;
  pois: PointOfInterest[];
  /** Remaining stock per trader (itemId -> qty) and when it was last restocked. */
  traderStock: Record<string, { items: Record<string, number>; restockedAt: number }>;
  /** Timed effects, as absolute game minutes (see timeToMinutes). */
  lightUntil: number;
  repelUntil: number;
  lastShelterDay: number;
  lastRadioDay: number;

  // Actions
  triggerDamageFlash: () => void;
  setGameState: (newState: GameState) => void;
  setGameOver: (cause: DeathCause) => void;
  setVisualTheme: (theme: VisualTheme) => void;
  addJournalEntry: (entry: { text: string; type: JournalEntryType; color?: string }) => void;
  setMap: () => void;
  getTileInfo: (x: number, y: number) => TileInfo;
  performQuickRest: () => void;
  performActiveSearch: () => void;
  openLevelUpScreen: () => void;
  /** refugeEntry: the player just walked into a refuge (firstRefugeEntry chapters). */
  checkMainStoryTriggers: (context?: { refugeEntry?: boolean }) => void;
  activateMainStoryChapter: (chapter: MainStoryChapter) => void;
  checkTimeTrophies: () => void;
  resolveMainStory: () => void;
  startCutscene: (id: string) => void;
  queueCutscene: (id: string) => void;
  processCutsceneConsequences: (consequences: CutsceneConsequence[]) => void;
  endCutscene: () => void;
  checkCutsceneTriggers: () => void;
  setFlag: (flag: string) => void;
  hasFlag: (flag: string) => boolean;
  // Points of interest
  addPOI: (poi: PointOfInterest) => void;
  revealPOI: (poiId: string) => boolean;
  getPOI: (poiId: string) => PointOfInterest | undefined;
  // Save/Load System
  saveGame: (slot: number) => boolean;
  loadGame: (slot: number) => boolean;
  toJSON: () => object;
  fromJSON: (json: any) => void;
  // Wandering Trader
  initializeWanderingTrader: () => void;
  advanceTraderTurn: () => void;
  moveTrader: (newPosition: Position) => void;
  // World State
  activateWaterPump: (location: Position) => void;
  destroyWaterPump: (location: Position) => void;
  canUseWaterPump: (location: Position) => boolean;
  activateWaterPlant: (location: Position) => void;
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
  /** Extra defense from Anya's upgrades, tied to this exact piece. */
  upgradeBonus?: number;
}

export interface Alignment {
  lena: number;
  elian: number;
}

export interface LevelUpChoices {
  attribute: AttributeName;
  /** Talent to unlock (when one is available). */
  talentId?: string;
  /** New skill proficiency (when no talent is available). */
  proficiency?: SkillName;
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
  craftedRecipes: string[];
  unlockedTalents: string[];
  unlockedTrophies: Set<string>;
  activeQuests: Record<string, number>; // questId -> currentStage
  completedQuests: string[];
  failedQuests: string[];
  loreArchive: string[];
  questKillCounts: Record<string, Record<string, number>>; // questId -> { enemyId -> count }
  questFlags: Record<string, boolean>;
  wasOverEncumbered: boolean;

  // Actions
  initCharacter: () => void;
  setAttributes: (newAttributes: Attributes) => void;
  getAttributeModifier: (attribute: AttributeName) => number;
  getSkillBonus: (skill: SkillName) => number;
  performSkillCheck: (skill: SkillName, dc: number) => SkillCheckResult;
  hasTalent: (talentId: string) => boolean;
  getHealingMultiplier: () => number;
  addXp: (amount: number) => void;
  gainExplorationXp: () => void;
  applyLevelUp: (choices: LevelUpChoices) => void;
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  discardItem: (inventoryIndex: number, quantity?: number) => void;
  getItemCount: (itemId: string) => number;
  equipItem: (inventoryIndexOrId: number | string) => void;
  unequipItem: (slot: 'weapon' | 'armor' | 'head' | 'chest' | 'legs') => void;
  getEquippedSlot: (inventoryIndex: number) => 'weapon' | 'chest' | 'head' | 'legs' | null;
  damageEquippedItem: (slot: 'weapon' | 'armor' | 'chest' | 'head' | 'legs', amount: number) => void;
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
  addLoreEntry: (entryId: string) => void;
  upgradeEquippedArmor: (slot: 'head' | 'chest' | 'legs', defenseBonus: number) => boolean;
  setQuestFlag: (flagName: string, value: boolean) => void;
  getQuestFlag: (flagName: string) => boolean;
  checkCharacterTrophies: () => void;
  // Save/Load System
  toJSON: () => object;
  fromJSON: (json: any) => void;
}

// --- Item System ---
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'ammo' | 'manual' | 'tool' | 'valuable';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'quest';
export type WeaponType = 'melee' | 'ranged' | 'thrown';
export type ArmorSlot = 'head' | 'chest' | 'legs';
export type ItemEffectType =
  | 'heal' | 'satiety' | 'hydration' | 'fatigue' | 'cureStatus'
  | 'light' | 'trap' | 'container' | 'vision' | 'repair' | 'shelter' | 'random'
  | 'power' | 'fishing' | 'smoke' | 'communication' | 'fire' | 'repel'
  /** Spoiled food: value = % chance of falling sick. */
  | 'spoiled';

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
  /** Ranged weapons: ammo item consumed by each shot. */
  ammoType?: string;
  defense?: number;
  slot?: ArmorSlot;
  effects?: ItemEffect[];
  /** Recipes learned by studying this item (manuals are consumed, other items are not). */
  unlocksRecipe?: string | string[];
  /** Another item burned by every use (batteries for a flashlight, firewood for a lighter). */
  consumes?: { itemId: string; quantity: number };
}
