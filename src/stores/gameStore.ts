import { create } from 'zustand';
import { useCharacterStore } from './character/characterStore';
import { useTimeStore } from './time/timeStore';
import { useInventoryStore } from './inventory/inventoryStore';
import { useWorldStore } from './world/worldStore';
import { useShelterStore } from './shelter/shelterStore';
import { useWeatherStore } from './weather/weatherStore';
import { useEventStore } from './events/eventStore';
import { useSurvivalStore } from './survival/survivalStore';
import { useNotificationStore } from './notifications/notificationStore';
import { useNarrativeStore } from './narrative/narrativeStore';
import { narrativeIntegration } from '../services/narrativeIntegration';
import type { TimeState, WeatherType } from '../interfaces/gameState';
import type { LogEntry } from '../data/MessageArchive';
import type { ICharacterSheet } from '../rules/types';
import type { GameEvent } from '../interfaces/events';
import type { IItem } from '../interfaces/items';

// Boot sequence states
export type BootPhase = 'black-screen-1' | 'production' | 'black-screen-2' | 'boot-simulation' | 'black-screen-3' | 'menu';

// Interfaccia semplificata per il GameStore principale
export interface CoreGameState {
  // Core UI State
  currentScreen: string;
  previousScreen: string | null;
  menuSelectedIndex: number;
  selectedInventoryIndex: number;
  cameraPosition: { x: number; y: number };

  // Game State
  gameInProgress: boolean;
  isPaused: boolean;

  // Boot sequence state
  bootPhase: BootPhase;
  isBootSequenceActive: boolean;

  // Callback per ricette
  unlockRecipesCallback?: (manualId: string) => void;

  // Core Actions
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  initializeGame: () => Promise<void>;

  // Boot sequence actions
  startBootSequence: () => void;
  advanceBootPhase: () => void;
  skipBootSequence: () => void;

  // Screen Navigation
  setCurrentScreen: (screen: string) => void;
  goBack: () => void;
  setMenuSelectedIndex: (index: number) => void;
  setSelectedInventoryIndex: (index: number) => void;

  // Game State Management
  pauseGame: () => void;
  resumeGame: () => void;
  startNewGame: () => void;
  enterGame: () => void;

  // Menu Actions
  handleNewGame: () => void;
  handleLoadGame: () => void;
  handleStory: () => void;
  handleInstructions: () => void;
  handleOptions: () => void;
  handleBackToMenu: () => void;
  handleExit: () => void;

  // Utility
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => void;

  // Time Actions
  advanceTime: (hours: number) => void;

  // Inventory and Character Management
  removeItems: (itemId: string, quantity: number) => boolean;
  addItem: (itemId: string, quantity: number) => boolean;
  addExperience: (xpGained: number) => void;
  useItem: (slotIndex: number) => boolean;

  // Facade Properties (delegano ai store specializzati) con tipi corretti
  get characterSheet(): ICharacterSheet;
  get timeState(): TimeState;
  get playerPosition(): { x: number; y: number };
  get mapData(): any;
  get isMapLoading(): boolean;
  get weatherState(): any;
  get currentWeather(): WeatherType;
  get survivalState(): any;
  get logEntries(): LogEntry[];
  get items(): Record<string, IItem>;
  get inventory(): any[];
  get currentEvent(): GameEvent | null;
  get notifications(): any[];
}

export const useGameStore = create<CoreGameState>((set, get) => ({
  // --- INITIAL STATE ---
  currentScreen: 'boot-black-screen-1',
  previousScreen: null,
  menuSelectedIndex: 0,
  selectedInventoryIndex: 0,
  cameraPosition: { x: 0, y: 0 },
  gameInProgress: false,
  isPaused: false,
  bootPhase: 'black-screen-1',
  isBootSequenceActive: true,
  unlockRecipesCallback: undefined,

  // --- FACADE PROPERTIES (delegano ai store specializzati) ---
  get characterSheet() {
    return useCharacterStore.getState().characterSheet;
  },

  get timeState(): TimeState {
    const timeData = useTimeStore.getState().timeState;
    return {
      currentTime: timeData.currentTime,
      day: timeData.day,
      isDay: timeData.timeOfDay === 'morning' || timeData.timeOfDay === 'afternoon'
    };
  },

  get playerPosition() {
    return useWorldStore.getState().playerPosition;
  },

  get mapData() {
    return useWorldStore.getState().mapData;
  },

  get isMapLoading() {
    return useWorldStore.getState().isMapLoading;
  },

  get weatherState() {
    return useWeatherStore.getState();
  },

  get currentWeather() {
    return useWeatherStore.getState().currentWeather;
  },

  get survivalState() {
    return useSurvivalStore.getState().survivalState;
  },

  get logEntries() {
    return useNotificationStore.getState().logEntries;
  },

  get items(): Record<string, any> {
    return useInventoryStore.getState().items;
  },

  get inventory() {
    return useInventoryStore.getState().getInventory();
  },

  get currentEvent() {
    return useEventStore.getState().currentEvent;
  },

  get notifications() {
    return useNotificationStore.getState().notifications;
  },

  // --- CORE ACTIONS ---
  
  updateCameraPosition: (viewportSize: { width: number; height: number }) => {
    // Logica per aggiornare la posizione della camera
    const worldStore = useWorldStore.getState();
    const newPosition = {
      x: worldStore.playerPosition.x - viewportSize.width / 2,
      y: worldStore.playerPosition.y - viewportSize.height / 2
    };
    set({ cameraPosition: newPosition });
  },

  initializeGame: async () => {
    try {
      // Inizializza tutti i store specializzati
      await useEventStore.getState().loadEventDatabase();
      
      // Carica la mappa del mondo
      await useWorldStore.getState().loadMap();
      
      // Inizializza il sistema narrativo
      const narrativeStore = useNarrativeStore.getState();
      narrativeStore.initializeNarrative();
      
      // Inizializza l'integrazione narrativa
      narrativeIntegration.initialize();

      // Non cambiare currentScreen qui - lascia che sia gestito dal chiamante
      // set({ currentScreen: 'menu' }); // RIMOSSO: causava il redirect al menu
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  },

  // --- SCREEN NAVIGATION ---
  
  setCurrentScreen: (screen: string) => {
    set(state => ({ 
      currentScreen: screen, 
      previousScreen: state.currentScreen 
    }));
  },
  
  // --- GAME STATE MANAGEMENT ---
  
  pauseGame: () => {
    set({ 
      isPaused: true, 
      currentScreen: 'menu',
      previousScreen: 'game'
    });
  },
  
  resumeGame: () => {
    set({ 
      isPaused: false, 
      currentScreen: 'game',
      previousScreen: 'menu'
    });
  },
  
  startNewGame: () => {
    // Reset completo di tutti gli store per iniziare una nuova partita
    const worldStore = useWorldStore.getState();
    const characterStore = useCharacterStore.getState();
    const eventStore = useEventStore.getState();
    const shelterStore = useShelterStore.getState();

    // Reset degli store che hanno metodi di reset
    worldStore.resetWorld();
    characterStore.resetCharacter();
    eventStore.resetEventState();
    shelterStore.resetShelterInvestigations();

    set({
      gameInProgress: true,
      isPaused: false,
      currentScreen: 'characterCreation',
      previousScreen: 'menu'
    });
  },

  goBack: () => {
    set(state => {
      const newScreen = state.previousScreen || 'menu';
      return {
        currentScreen: newScreen,
        previousScreen: null
      };
    });
  },

  setMenuSelectedIndex: (index: number) => {
    set({ menuSelectedIndex: index });
  },

  setSelectedInventoryIndex: (index: number) => {
    set({ selectedInventoryIndex: index });
  },

  // --- MENU ACTIONS ---
  
  handleNewGame: () => {
    get().startNewGame();
  },

  handleLoadGame: () => {
    get().setCurrentScreen('loadGame');
  },
  
  // Chiamata quando si entra effettivamente nel gioco
  enterGame: () => {
    set({ 
      gameInProgress: true,
      isPaused: false,
      currentScreen: 'game'
    });
  },

  handleStory: () => {
    get().setCurrentScreen('story');
  },

  handleInstructions: () => {
    get().setCurrentScreen('instructions');
  },

  handleOptions: () => {
    get().setCurrentScreen('options');
  },

  handleBackToMenu: () => {
    get().setCurrentScreen('menu');
  },

  handleExit: () => {
    if (typeof window !== 'undefined' && window.close) {
      window.close();
    } else {
      console.log('Exit game requested');
    }
  },

  // --- UTILITY ---
  
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => {
    set({ unlockRecipesCallback: callback });
  },
  
  // Time Actions
  advanceTime: (hours: number) => {
    useTimeStore.getState().advanceTime(hours);
  },

  // --- INVENTORY AND CHARACTER DELEGATES ---
  removeItems: (itemId: string, quantity: number) => {
    return useInventoryStore.getState().removeItems(itemId, quantity);
  },

  addItem: (itemId: string, quantity: number) => {
    return useInventoryStore.getState().addItem(itemId, quantity);
  },

  addExperience: (xpGained: number) => {
    useCharacterStore.getState().addExperience(xpGained);
  },

  useItem: (slotIndex: number): boolean => {
    try {
      useInventoryStore.getState().useItem(slotIndex);
      return true;
    } catch (error) {
      console.error('Failed to use item:', error);
      return false;
    }
  },

  // --- BOOT SEQUENCE ACTIONS ---
  startBootSequence: () => {
    set({
      isBootSequenceActive: true,
      bootPhase: 'black-screen-1',
      currentScreen: 'boot-black-screen-1'
    });
  },

  advanceBootPhase: () => {
    set(state => {
      const phaseOrder: BootPhase[] = ['black-screen-1', 'production', 'black-screen-2', 'boot-simulation', 'black-screen-3'];
      const currentIndex = phaseOrder.indexOf(state.bootPhase);
      const nextIndex = currentIndex + 1;

      if (nextIndex >= phaseOrder.length) {
        // Boot sequence complete - FINE SEQUENZA
        return {
          isBootSequenceActive: false,
          bootPhase: 'menu',
          currentScreen: 'menu'  // ← Menu principale del gioco
        };
      }

      const nextPhase = phaseOrder[nextIndex];
      return {
        bootPhase: nextPhase,
        currentScreen: `boot-${nextPhase}`
      };
    });
  },

  skipBootSequence: () => {
    set({
      isBootSequenceActive: false,
      bootPhase: 'menu',
      currentScreen: 'menu'
    });
  },

}));

// Export del tipo per compatibilità
// export type { CoreGameState as GameState }; // Rimosso - non utilizzato