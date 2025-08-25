import type { LogEntry } from '../data/MessageArchive';
import type { MessageType } from '../data/MessageArchive';
import type { ICharacterSheet } from '../rules/types';
import type { IItem } from './items';
import type { GameEvent, EventChoice } from './events';

// Aggiungi questa interfaccia all'inizio del file
export interface AbilityCheckResult {
  success: boolean;
  roll: number;
  modifier: number;
  total: number;
  difficulty: number;
}

export interface TimeState {
  currentTime: number; // Minuti dall'inizio del gioco (0-1439, dove 1440 = 24 ore)
  day: number; // Giorno corrente (inizia da 1)
  isDay: boolean; // true se è giorno, false se è notte
}

export type Screen = 'menu' | 'game' | 'instructions' | 'story' | 'options' | 'characterCreation' | 'characterSheet' | 'inventory' | 'levelUp' | 'shelter' | 'event' | 'loadGame';

export interface SurvivalState {
  hunger: number;
  thirst: number;
  lastNightConsumption: { day: number; consumed: boolean };
}

export interface GameState {
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
  visitedShelters: Record<string, boolean>;

  // Journal state
  logEntries: LogEntry[];
  currentBiome: string | null;

  // Inventory state
  items: Record<string, IItem>;
  selectedInventoryIndex: number;

  // Event system
  eventDatabase: Record<string, GameEvent[]>;
  currentEvent: GameEvent | null;
  seenEventIds: string[];
  triggerEvent: (biome: string) => void;
  resolveChoice: (choice: EventChoice) => void;

  // UI state
  currentScreen: Screen;
  
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

  // UI actions
  setCurrentScreen: (screen: Screen) => void;
  goBack: () => void;
  menuSelectedIndex: number;
  setMenuSelectedIndex: (index: number) => void;
  handleNewGame: () => void;
  handleLoadGame: () => void;
  handleStory: () => void;
  handleInstructions: () => void;
  handleOptions: () => void;
  handleBackToMenu: () => void;
  handleExit: () => void;
  setSelectedInventoryIndex: (index: number) => void;
  useItem: (slotIndex: number) => void;
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
  exportSave: (slot: string) => string | null;
  importSave: (content: string, slot: string) => Promise<boolean>;
}