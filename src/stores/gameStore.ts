import { create } from 'zustand';
import type { GameState } from '../interfaces/gameState';
import { MessageType } from '../data/MessageArchive';
import { createTestCharacter } from '../rules/characterGenerator';

interface GameStore extends GameState {}

export const useGameStore = create<GameStore>((set) => ({
  // STATI MIGLIORATI
  mapData: [],
  isMapLoading: true,
  playerPosition: { x: -1, y: -1 },
  cameraPosition: { x: 0, y: 0 },
  timeState: { currentTime: 360, day: 1, isDay: true },
  characterSheet: createTestCharacter(),
  lastShortRestTime: null,
  survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } },
  logEntries: [],
  currentBiome: null,
  items: {},
  selectedInventoryIndex: 0,
  currentScreen: 'menu',
  menuSelectedIndex: 0,
  eventDatabase: {},
  currentEvent: null,

  // FUNZIONI MIGRATE
  updatePlayerPosition: (newPosition, newBiome) => set(state => {
    // La logica di cambio bioma e trigger evento ora è qui
    if (newBiome !== state.currentBiome) {
      state.addLogEntry(MessageType.BIOME_ENTER, { biome: newBiome });
      
      // const biomeKey = getBiomeKeyFromChar(newBiome); // Funzione helper da aggiungere
      // if (biomeKey && Math.random() < 0.15) {
      //   setTimeout(() => state.triggerEvent(biomeKey), 150);
      // }
    }
    
    // Aggiorna stato
    return { playerPosition: newPosition, currentBiome: newBiome };
  }),

  // FUNZIONI PLACEHOLDER
  initializeGame: async () => {},
  updateCameraPosition: () => {},
  advanceTime: () => {},
  updateHP: () => {},
  performAbilityCheck: () => ({ success: false, roll: 0, modifier: 0, total: 0, difficulty: 0 }),
  getModifier: () => 0,
  shortRest: () => {},
  addLogEntry: (type, context) => {
    // Implementazione di base per ora
    console.log(`LOG: ${type}`, context);
  },
  updateBiome: () => {},
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  goBack: () => {},
  setMenuSelectedIndex: () => {},
  handleNewGame: () => {},
  handleLoadGame: () => {},
  handleStory: () => {},
  handleInstructions: () => {},
  handleOptions: () => {},
  handleBackToMenu: () => {},
  handleExit: () => {},
  setSelectedInventoryIndex: () => {},
  useItem: () => {},
  equipItemFromInventory: () => {},
  dropItem: () => {},
  updateCharacterSheet: () => {},
  addExperience: () => {},
  handleNightConsumption: () => {},
  consumeFood: () => {},
  consumeDrink: () => {},
  addItem: () => false,
  removeItem: () => false,
  saveCurrentGame: async () => false,
  loadSavedGame: async () => false,
  handleQuickSave: async () => false,
  handleQuickLoad: async () => false,
  getSaveSlots: () => [],
  deleteSave: () => false,
  exportSave: () => null,
  importSave: async () => false,
  triggerEvent: () => {},
  resolveChoice: () => {},
}));