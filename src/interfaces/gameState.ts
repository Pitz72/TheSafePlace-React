import type { LogEntry } from '../data/MessageArchive';
import type { MessageType } from '../data/MessageArchive';
import type { ICharacterSheet } from '../rules/types';
import type { IItem } from './items';

export interface TimeState {
  currentTime: number; // Minuti dall'inizio del gioco (0-1439, dove 1440 = 24 ore)
  day: number; // Giorno corrente (inizia da 1)
  isDay: boolean; // true se è giorno, false se è notte
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
  
  // Character state - v0.2.0 Rules are Rules
  characterSheet: ICharacterSheet;
  isCharacterSheetOpen: boolean;
  lastShortRestTime: { day: number; time: number } | null;
  showCharacterCreation: boolean;
  
  // Journal state - v0.1.5
  logEntries: LogEntry[];
  currentBiome: string | null;

  // Item state
  items: Record<string, IItem>;
  selectedInventoryIndex: number;

  
  // Actions
  initializeGame: () => Promise<void>;
  updatePlayerPosition: (newPosition: { x: number; y: number }) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  advanceTime: (minutes?: number) => void;
  
  // Character actions - v0.2.0 Rules are Rules
  updateHP: (amount: number) => void;
  performAbilityCheck: (ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal?: boolean, successMessageType?: MessageType) => boolean;
  getModifier: (ability: keyof ICharacterSheet['stats']) => number;
  toggleCharacterSheet: () => void;
  shortRest: () => void;
  skipCharacterCreation: () => void;
  
  // Journal actions - v0.1.5
  addLogEntry: (type: MessageType, context?: Record<string, any>) => void;
  updateBiome: (newBiome: string) => void;

  // UI state
  currentScreen: 'menu' | 'game' | 'instructions' | 'story' | 'options';
  isInventoryOpen: boolean;

  // UI actions
  setCurrentScreen: React.Dispatch<React.SetStateAction<'menu' | 'game' | 'instructions' | 'story' | 'options'>>;
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
  setIsInventoryOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
}