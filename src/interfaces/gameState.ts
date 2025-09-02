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
  // Time state
  timeState: TimeState;
  
  // Survival state
  survivalState: SurvivalState;
  
  // Journal state
  logEntries: LogEntry[];
  
  // Completed encounters tracking
  completedEncounters: string[];

  // Inventory state
  items: Record<string, IItem>;

  // Event system
  eventDatabase: Record<string, GameEvent[]>;
  currentEvent: GameEvent | null;
  seenEventIds: string[];
  triggerEvent: (event: GameEvent) => void;
  resolveChoice: (choice: EventChoice) => void;

  // Callback system
  unlockRecipesCallback?: (manualId: string) => void;
  
  // Actions
  initializeGame: () => Promise<void>;
  advanceTime: (hours: number) => void;
  
  // Character-related actions (now composite)
  performAbilityCheck: (ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal?: boolean, successMessageType?: MessageType) => AbilityCheckResult;
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

  // Item actions that depend on multiple stores
  useItem: (slotIndex: number) => boolean;
  consumeItem: (slotIndex: number) => boolean;
  dropItem: (slotIndex: number) => void;
  handleNightConsumption: () => void;
  consumeFood: (amount: number) => void;
  consumeDrink: (amount: number) => void;
  
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => void;
  
  // Shelter system
  createShelterKey: (x: number, y: number) => string;
  getShelterInfo: (x: number, y: number) => ShelterAccessInfo | null;
  createShelterInfo: (x: number, y: number) => ShelterAccessInfo;
  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => void;
  isShelterAccessible: (x: number, y: number) => boolean;
  canInvestigateShelter: (x: number, y: number) => boolean;
  resetShelterInvestigations: () => void;
  
  // Weather system facade methods
  getWeatherDescription: (weather: WeatherType) => string;
  getRandomWeatherMessage: (weather: WeatherType) => string;
  getWeatherPatterns: () => any;
  getTimeBasedWeatherModifiers: (timeState: TimeState) => string;
  selectWeatherWithModifiers: (possibleTransitions: WeatherType[], timeModifier: string) => WeatherType;
  
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