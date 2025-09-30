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
import type { LogEntry, MessageType } from '../data/MessageArchive';
import type { ICharacterSheet } from '../rules/types';
import type { GameEvent } from '../interfaces/events';
import type { IItem } from '../interfaces/items';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';

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

  // Proxy Getters (READ-ONLY)
  characterSheet: ICharacterSheet;
  inventory: ReturnType<typeof useInventoryStore.getState>['getInventory'];
  items: Record<string, IItem>;

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

  // --- PROXY GETTERS ---
  get characterSheet() {
    return useCharacterStore.getState().characterSheet;
  },

  get inventory() {
    return useInventoryStore.getState().getInventory();
  },

  get items() {
    return useInventoryStore.getState().items;
  },

  // --- ACTIONS ---

  // Boot sequence actions
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

  // Screen Navigation Actions
  setCurrentScreen: (screen: string) => {
    set(state => ({
      previousScreen: state.currentScreen,
      currentScreen: screen
    }));
  },

  goBack: () => {
    set(state => ({
      currentScreen: state.previousScreen || 'menu',
      previousScreen: null
    }));
  },

  setMenuSelectedIndex: (index: number) => {
    set({ menuSelectedIndex: index });
  },

  setSelectedInventoryIndex: (index: number) => {
    set({ selectedInventoryIndex: index });
  },

  // Game State Management
  pauseGame: () => {
    set({ isPaused: true });
  },

  resumeGame: () => {
    set({ isPaused: false, currentScreen: 'game' });
  },

  startNewGame: () => {
    set({ 
      gameInProgress: true, 
      isPaused: false, 
      currentScreen: 'characterCreation' 
    });
  },

  enterGame: () => {
    set({ currentScreen: 'game' });
  },

  // Menu Actions
  handleNewGame: () => {
    get().startNewGame();
  },

  handleLoadGame: () => {
    get().setCurrentScreen('load');
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
    // In un'applicazione web, potremmo chiudere la finestra o mostrare un messaggio
    if (window.confirm('Sei sicuro di voler uscire dal gioco?')) {
      window.close();
    }
  },

  // Utility
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => {
    set({ unlockRecipesCallback: callback });
  },

  // Time Actions
  advanceTime: (hours: number) => {
    useTimeStore.getState().advanceTime(hours);
  },

  // Inventory and Character Management
  removeItems: (itemId: string, quantity: number) => {
    return useInventoryStore.getState().removeItems(itemId, quantity);
  },

  addItem: (itemId: string, quantity: number) => {
    return useInventoryStore.getState().addItem(itemId, quantity);
  },

  addExperience: (xpGained: number) => {
    useCharacterStore.getState().addExperience(xpGained);
  },

  // Implementazione del metodo useItem
  useItem: (slotIndex: number) => {
    try {
      useInventoryStore.getState().useItem(slotIndex);
      return true;
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.INVENTORY, {
        operation: 'useItem',
        slotIndex,
        context: 'Utilizzo oggetto dall\'inventario'
      });
      console.log(`Impossibile utilizzare l'oggetto nello slot ${slotIndex}`);
      return false;
    }
  },

  // Test utility method for store isolation
  resetStore: () => {
    set({
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
    });
  },

  // --- CORE GAME INITIALIZATION ---
  
  /**
   * Orchestratore principale per l'inizializzazione del gioco.
   * Resetta e inizializza tutti gli store in sequenza corretta per una nuova partita.
   * Deve essere chiamato dopo la creazione del personaggio.
   */
  initializeGame: async () => {
    return executeWithRetry({
      operation: async () => {
        // Ottieni riferimenti a tutti gli store necessari
        const notificationStore = useNotificationStore.getState();
        const characterStore = useCharacterStore.getState();
        const survivalStore = useSurvivalStore.getState();
        const worldStore = useWorldStore.getState();
        const narrativeStore = useNarrativeStore.getState();
        const timeStore = useTimeStore.getState();
        const weatherStore = useWeatherStore.getState();
        const eventStore = useEventStore.getState();
        const shelterStore = useShelterStore.getState();

        // Fase 1 - Reset Notification Store per log pulito
        if (notificationStore.resetNotifications) {
          notificationStore.resetNotifications();
        }

        // Fase 2 - Inizializza Character Store
        characterStore.initialize();

        // Fase 3 - Reset Survival State
        survivalStore.resetSurvivalState();

        // Fase 4 - Reset Time Store
        if (timeStore.resetTime) {
          timeStore.resetTime();
        }

        // Fase 5 - Reset Weather Store
        if (weatherStore.resetWeather) {
          weatherStore.resetWeather();
        }

        // Fase 6 - Carica Mappa (operazione asincrona)
        try {
          await worldStore.loadMap();
        } catch (error) {
          console.warn('Errore nel caricamento della mappa, continuando con mappa vuota:', error);
          notificationStore.addLogEntry(MessageType.SYSTEM_ERROR, { 
            message: 'Errore nel caricamento della mappa. Utilizzando mappa di fallback.' 
          });
        }

        // Fase 7 - Inizializza Narrative Store (operazione asincrona)
        try {
          narrativeStore.initializeNarrative();
        } catch (error) {
          console.warn('Errore nell\'inizializzazione del sistema narrativo:', error);
          notificationStore.addLogEntry(MessageType.SYSTEM_WARNING, { 
            message: 'Sistema narrativo non disponibile.' 
          });
        }

        // Fase 8 - Reset Altri Store
        if (eventStore.resetEvents) {
          eventStore.resetEvents();
        }
        if (shelterStore.resetShelters) {
          shelterStore.resetShelters();
        }

        // Fase 9 - Aggiorna Camera Position con dimensioni default
        get().updateCameraPosition({ width: 1920, height: 1080 });

        // Fase 10 - Messaggio di Benvenuto
        notificationStore.addLogEntry(MessageType.GAME_START, { 
          message: 'Benvenuto in The Safe Place. La tua avventura inizia ora.' 
        });

        console.log('Inizializzazione del gioco completata con successo');
      },
      category: GameErrorCategory.GAME_LOGIC,
      context: 'initializeGame',
      onFailure: (error) => {
        console.error('Errore critico durante l\'inizializzazione del gioco:', error);
        useNotificationStore.getState().addLogEntry(MessageType.SYSTEM_ERROR, { 
          message: 'Errore durante l\'inizializzazione del gioco. Riprova.' 
        });
      }
    });
  },

  /**
   * Delegatore per l'aggiornamento della posizione della camera.
   * Delega al worldStore per mantenere la separazione delle responsabilità.
   */
  updateCameraPosition: (viewportSize: { width: number; height: number }) => {
    try {
      const worldStore = useWorldStore.getState();
      worldStore.updateCameraPosition(viewportSize);
      
      // Sincronizza la posizione della camera nel gameStore se necessario
      const { cameraPosition } = worldStore;
      set({ cameraPosition });
    } catch (error) {
      handleStoreError(error as Error, GameErrorCategory.WORLD, {
        operation: 'updateCameraPosition',
        viewportSize,
        context: 'Aggiornamento posizione camera'
      });
    }
  },

}));

// Export del tipo per compatibilità
// export type { CoreGameState as GameState }; // Rimosso - non utilizzato