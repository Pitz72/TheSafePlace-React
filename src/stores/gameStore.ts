import { create } from 'zustand';
import type { GameState, ShelterAccessInfo } from '../interfaces/gameState';
import { useCharacterStore } from './character/characterStore';
import { useTimeStore } from './time/timeStore';
import { useInventoryStore } from './inventory/inventoryStore';
import { useCombatStore } from './combatStore';
import { useWorldStore } from './world/worldStore';
import { useShelterStore } from './shelter/shelterStore';
import { useWeatherStore } from './weather/weatherStore';
import { useEventStore } from './events/eventStore';
import { useSurvivalStore } from './survival/survivalStore';
import { useNotificationStore } from './notifications/notificationStore';
import { useRiverCrossingStore } from './river/riverCrossingStore';
import { useNarrativeStore } from './narrative/narrativeStore';
import { narrativeIntegration } from '../services/narrativeIntegration';

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
  
  // Callback per ricette
  unlockRecipesCallback?: (manualId: string) => void;
  
  // Core Actions
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  initializeGame: () => Promise<void>;
  
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
  useItem: (slotIndex: number) => void;
  
  // Facade Properties (delegano ai store specializzati)
  get characterSheet(): any;
  get timeState(): any;
  get playerPosition(): any;
  get mapData(): any;
  get isMapLoading(): boolean;
  get weatherState(): any;
  get currentWeather(): any;
  get survivalState(): any;
  get logEntries(): any[];
  get items(): Record<string, any>;
  get inventory(): (any | null)[];
  get currentEvent(): any;
  get notifications(): any[];
}

export const useGameStore = create<CoreGameState>((set, get) => ({
  // --- INITIAL STATE ---
  currentScreen: 'menu',
  previousScreen: null,
  menuSelectedIndex: 0,
  selectedInventoryIndex: 0,
  cameraPosition: { x: 0, y: 0 },
  gameInProgress: false,
  isPaused: false,
  unlockRecipesCallback: undefined,

  // --- FACADE PROPERTIES (delegano ai store specializzati) ---
  get characterSheet() {
    return useCharacterStore.getState().characterSheet;
  },

  get timeState() {
    return useTimeStore.getState().timeState;
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
    return useWeatherStore.getState().weatherState;
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
    // Reset di tutti gli store per iniziare una nuova partita
    const worldStore = useWorldStore.getState();
    worldStore.resetWorld();
    
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

  useItem: (slotIndex: number) => {
    useInventoryStore.getState().useItem(slotIndex);
  },

  // --- SHELTER SYSTEM DELEGATES ---
  createShelterKey: (x: number, y: number) => {
    return useShelterStore.getState().createShelterKey(x, y);
  },

  getShelterInfo: (x: number, y: number) => {
    return useShelterStore.getState().getShelterInfo(x, y);
  },

  createShelterInfo: (x: number, y: number) => {
    return useShelterStore.getState().createShelterInfo(x, y);
  },

  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => {
    useShelterStore.getState().updateShelterAccess(x, y, updates);
  },

  isShelterAccessible: (x: number, y: number) => {
    return useShelterStore.getState().isShelterAccessible(x, y);
  },

  canInvestigateShelter: (x: number, y: number) => {
    return useShelterStore.getState().canInvestigateShelter(x, y);
  },

  resetShelterInvestigations: () => {
    useShelterStore.getState().resetShelterInvestigations();
  },
}));

// Export del tipo per compatibilità
export type { CoreGameState as GameState };