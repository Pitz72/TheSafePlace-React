import type { LogEntry } from '../data/MessageArchive';
import type { MessageType } from '../data/MessageArchive';
import type { ICharacterSheet } from '../rules/types';
import type { IItem } from './items';
import type { GameEvent, EventChoice } from './events';
import type { UIState } from '../stores/ui/uiStore';

export interface AbilityCheckResult {
  success: boolean;
  roll: number;
  modifier: number;
  total: number;
  difficulty: number;
}

export interface TimeState {
  currentTime: number;
  day: number;
  isDay: boolean;
}

export type Screen = 'menu' | 'game' | 'instructions' | 'story' | 'options' | 'characterCreation' | 'characterSheet' | 'inventory' | 'levelUp' | 'shelter' | 'event' | 'loadGame' | 'crafting';

export interface SurvivalState {
  hunger: number;
  thirst: number;
  lastNightConsumption: { day: number; consumed: boolean };
}

export interface ShelterAccessInfo {
  coordinates: string;
  dayVisited: number;
  timeVisited: number;
  hasBeenInvestigated: boolean;
  isAccessible: boolean;
  investigationResults?: string[];
}

export enum WeatherType {
  CLEAR = 'clear',
  LIGHT_RAIN = 'light_rain',
  HEAVY_RAIN = 'heavy_rain',
  STORM = 'storm',
  FOG = 'fog',
  WIND = 'wind'
}

export interface WeatherEffects {
  movementModifier: number;
  survivalModifier: number;
  skillCheckModifier: number;
  eventProbabilityModifier: number;
}

export interface WeatherState {
  currentWeather: WeatherType;
  intensity: number;
  duration: number;
  nextWeatherChange: number;
  effects: WeatherEffects;
}

export interface GameState extends UIState {
  // Map state
  mapData: string[];
  isMapLoading: boolean;
  
  // Player state
  playerPosition: { x: number; y: number };
  
  // Camera state
  cameraPosition: { x: number; y: number };
  
  // Time state
  timeState: TimeState;
  
  // Character state
  characterSheet: ICharacterSheet;
  lastShortRestTime: { day: number; time: number } | null;
  
  // Survival state
  survivalState: SurvivalState;
  
  // Shelter state
  shelterAccessState: Record<string, ShelterAccessInfo>;
  
  // Weather state
  weatherState: WeatherState;

  // Journal state
  logEntries: LogEntry[];
  currentBiome: string | null;

  // Inventory state
  items: Record<string, IItem>;

  // Event system
  eventDatabase: Record<string, GameEvent[]>;
  currentEvent: GameEvent | null;
  seenEventIds: string[];
  triggerEvent: (biome: string) => void;
  resolveChoice: (choice: EventChoice) => void;

  // Callback system
  unlockRecipesCallback?: (manualId: string) => void;
  
  // Actions
  initializeGame: () => Promise<void>;
  updatePlayerPosition: (newPosition: { x: number; y: number }, newBiome: string) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  advanceTime: (minutes?: number) => void;
  
  // Character actions
  updateHP: (amount: number) => void;
  performAbilityCheck: (ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal?: boolean, successMessageType?: MessageType) => AbilityCheckResult;
  getModifier: (ability: keyof ICharacterSheet['stats']) => number;
  shortRest: () => void;
  
  // Journal actions
  addLogEntry: (type: MessageType, context?: Record<string, any>) => void;
  updateBiome: (newBiome: string) => void;

  // Facade actions for UI
  handleNewGame: () => void;
  handleLoadGame: () => void;
  handleStory: () => void;
  handleInstructions: () => void;
  handleOptions: () => void;
  handleBackToMenu: () => void;
  handleExit: () => void;

  useItem: (slotIndex: number) => boolean;
  consumeItem: (slotIndex: number) => boolean;
  equipItemFromInventory: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;
  updateCharacterSheet: (characterSheet: ICharacterSheet) => void;
  addExperience: (xpGained: number) => void;
  handleNightConsumption: () => void;
  consumeFood: (amount: number) => void;
  consumeDrink: (amount: number) => void;
  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (slotIndex: number, quantity?: number) => boolean;
  
  // Save system actions
  saveCurrentGame: (slot: string) => Promise<boolean>;
  loadSavedGame: (slot: string) => Promise<boolean>;
  handleQuickSave: () => Promise<boolean>;
  handleQuickLoad: () => Promise<boolean>;
  getSaveSlots: () => any[];
  deleteSave: (slot: string) => boolean;
  exportSave: (slot: string) => Promise<string | null>;
  importSave: (slot: string) => Promise<boolean>;
  recoverSave: (slot: string) => Promise<boolean>;
  
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => void;
  
  // Shelter system
  createShelterKey: (x: number, y: number) => string;
  getShelterInfo: (x: number, y: number) => ShelterAccessInfo | null;
  createShelterInfo: (x: number, y: number) => ShelterAccessInfo;
  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => void;
  isShelterAccessible: (x: number, y: number) => boolean;
  canInvestigateShelter: (x: number, y: number) => boolean;
  resetShelterInvestigations: () => void;
  
  // Weather system
  updateWeather: () => void;
  getWeatherEffects: () => WeatherEffects;
  generateWeatherChange: () => WeatherState;
  applyWeatherEffects: (baseValue: number, effectType: keyof WeatherEffects) => number;
  createClearWeather: () => WeatherState;
  getWeatherDescription: (weather: WeatherType) => string;
  getRandomWeatherMessage: (weather: WeatherType) => string;
  getWeatherPatterns: () => any;
  getTimeBasedWeatherModifiers: (timeState: TimeState) => string;
  selectWeatherWithModifiers: (possibleTransitions: WeatherType[], timeModifier: string) => WeatherType;
  getBiomeKeyFromChar: (char: string) => string;
  formatTime: (timeMinutes: number) => string;
  
  // River crossing system
  attemptRiverCrossing: () => boolean;
  calculateRiverDifficulty: () => number;
  getRiverCrossingWeatherDescription: () => string;
  getRiverCrossingSuccessDescription: () => string;
  getRiverCrossingFailureDescription: (totalDamage: number, hasWeatherDamage: boolean) => string;
  getRiverCrossingModifierInfo: (finalDifficulty: number) => string | null;
  calculateEquipmentModifierForRiver: () => number;
  getEquipmentModifierDescription: () => string[];
}