import type { LogEntry } from '../data/MessageArchive';
import type { MessageType } from '../data/MessageArchive';
import type { ICharacterSheet } from '../rules/types';
import type { IItem } from './items';

export interface TimeState {
  currentTime: number; // Minuti dall'inizio del gioco (0-1439, dove 1440 = 24 ore)
  day: number; // Giorno corrente (inizia da 1)
  isDay: boolean; // true se è giorno, false se è notte
}

export type Screen = 'menu' | 'game' | 'instructions' | 'story' | 'options' | 'characterCreation' | 'characterSheet' | 'inventory' | 'levelUp';

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
  
  // Journal state
  logEntries: LogEntry[];
  currentBiome: string | null;

  // Item state
  items: Record<string, IItem>;
  selectedInventoryIndex: number;

  // UI state
  currentScreen: Screen;
  
  // Actions
  initializeGame: () => Promise<void>;
  updatePlayerPosition: (newPosition: { x: number; y: number }) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  advanceTime: (minutes?: number) => void;
  
  // Character actions
  updateHP: (amount: number) => void;
  performAbilityCheck: (ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal?: boolean, successMessageType?: MessageType) => boolean;
  getModifier: (ability: keyof ICharacterSheet['stats']) => number;
  shortRest: () => void;
  
  // Journal actions
  addLogEntry: (type: MessageType, context?: Record<string, any>) => void;
  updateBiome: (newBiome: string) => void;

  // UI actions
  setCurrentScreen: (screen: Screen) => void;
  goBack: () => void;
  menuSelectedIndex: number;
  setMenuSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  handleNewGame: () => void;
  handleLoadGame: () => void;
  handleStory: () => void;
  handleInstructions: () => void;
  handleOptions: () => void;
  handleBackToMenu: () => void;
  handleExit: () => void;
  setSelectedInventoryIndex: React.Dispatch<React.SetStateAction<number>>;
  useItem: (slotIndex: number) => void;
  equipItemFromInventory: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;
  updateCharacterSheet: (characterSheet: ICharacterSheet) => void;
  addExperience: (xpGained: number) => void;
}