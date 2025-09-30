import { create } from 'zustand';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { useSurvivalStore } from '@/stores/survival/survivalStore';
import { useTimeStore } from '@/stores/time/timeStore';
import { MessageType, JOURNAL_STATE, resetJournalState } from '@/data/MessageArchive';
import { playerMovementService } from '@/services/playerMovementService';
import { narrativeIntegration } from '@/services/narrativeIntegration';
import { loadMapData } from '@/services/mapService';
import { getBiomeKeyFromChar } from '@/utils/mapUtils';
import { calculateCameraPosition } from '@/utils/cameraUtils';
import { createLogger } from '@/services/loggerService';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';

// ===== LOGGER =====
const logger = createLogger('WORLD');

const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00

export interface WorldState {
  mapData: string[];
  isMapLoading: boolean;
  playerPosition: { x: number; y: number };
  cameraPosition: { x: number; y: number };
  currentBiome: string | null;
}

export interface WorldActions {
  loadMap: () => Promise<void>;
  updatePlayerPosition: (newPosition: { x: number; y: number }, newBiomeChar: string, movementContext?: { isEnteringRiver?: boolean }) => void;
  handleFailedMovement: (targetX: number, targetY: number, terrain: string) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  getBiomeKeyFromChar: (char: string) => string;
  formatTime: (timeMinutes: number) => string;
  resetWorld: () => void;
  restoreState: (state: { playerPosition: { x: number; y: number }; currentBiome: string | null }) => void;
}

export type WorldStore = WorldState & WorldActions;

const initialState: WorldState = {
  mapData: [],
  isMapLoading: true,
  playerPosition: { x: -1, y: -1 },
  cameraPosition: { x: 0, y: 0 },
  currentBiome: null,
};

export const useWorldStore = create<WorldStore>((set, get) => ({
  ...initialState,

  loadMap: async () => {
    return executeWithRetry({
      operation: async () => {
        const { mapData, startPos, startBiome } = await loadMapData();
        set({
          mapData,
          isMapLoading: false,
          playerPosition: startPos,
          currentBiome: startBiome,
        });
        return { success: true };
      },
      category: GameErrorCategory.WORLD,
      context: 'loadMap',
      onFailure: (error) => {
        logger.error('Failed to load map data', { error });
        handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante il caricamento della mappa');
      },
      onFallback: () => {
        set({ isMapLoading: false });
        return { success: false };
      }
    });
  },

  updatePlayerPosition: (newPosition, newBiomeChar, movementContext) => {
    return executeWithRetry({
      operation: () => {
        const oldBiome = get().currentBiome;
        const newBiomeKey = getBiomeKeyFromChar(newBiomeChar);
        const oldPos = get().playerPosition;
        const notificationStore = useNotificationStore.getState();

        const hasMoved = oldPos.x !== newPosition.x || oldPos.y !== newPosition.y;
        const hasChangedBiome = newBiomeKey !== oldBiome;

        // 1. Update world state if necessary
        if (hasMoved || hasChangedBiome) {
          set({ playerPosition: newPosition, currentBiome: newBiomeKey });
        }

        // 2. Log biome change
        if (hasChangedBiome) {
          logger.debug('Biome changed', {
            oldBiome,
            newBiome: newBiomeKey,
            position: newPosition,
            char: newBiomeChar
          });
          
          notificationStore.addLogEntry(MessageType.BIOME_ENTER, { biome: newBiomeKey });
          
          // 2.2. Trigger narrative events for biome change
          logger.debug('Calling narrativeIntegration.checkForNarrativeEvents', {
            eventType: 'biome_change',
            oldBiome,
            newBiome: newBiomeKey
          });
          narrativeIntegration.checkForNarrativeEvents('biome_change', {
            oldBiome,
            newBiome: newBiomeKey
          });
          logger.debug('narrativeIntegration.checkForNarrativeEvents completed', {
            eventType: 'biome_change',
            oldBiome,
            newBiome: newBiomeKey
          });
        }

        // 2.1. Show first biome message (plains) only once
        if (!JOURNAL_STATE.hasShownFirstBiome && newBiomeKey === 'plains' && hasMoved) {
          notificationStore.addLogEntry(MessageType.BIOME_ENTER, { biome: 'plains' });
          JOURNAL_STATE.hasShownFirstBiome = true;
        }

        // 3. Log specific movement actions (only for special terrains)
        if (hasMoved && newBiomeChar === '~') {
          // River movement - always log river crossing
          notificationStore.addLogEntry(MessageType.MOVEMENT_ACTION_RIVER);
        }

        // 4. Delegate all side effects to the service
        playerMovementService.handleMovementEffects(newBiomeKey);
        
        return { success: true };
      },
      category: GameErrorCategory.WORLD,
      context: 'updatePlayerPosition',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante l\'aggiornamento della posizione del giocatore'),
      onFallback: () => ({ success: false })
    });
  },

  handleFailedMovement: (targetX, targetY, terrain) => {
    return executeWithRetry({
      operation: () => {
        const notificationStore = useNotificationStore.getState();
        
        // Generate appropriate failure message based on terrain
        if (terrain === 'M') {
          notificationStore.addLogEntry(MessageType.MOVEMENT_FAIL_MOUNTAIN);
        }
        // Add other terrain-specific failure messages as needed
        
        return { success: true };
      },
      category: GameErrorCategory.WORLD,
      context: 'handleFailedMovement',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante la gestione del movimento fallito'),
      onFallback: () => ({ success: false })
    });
  },

  updateCameraPosition: (viewportSize) => {
    return executeWithRetry({
      operation: () => {
        const { playerPosition, mapData, cameraPosition: oldCameraPosition } = get();
        const newCameraPosition = calculateCameraPosition(playerPosition, mapData, viewportSize, oldCameraPosition);

        if (oldCameraPosition.x !== newCameraPosition.x || oldCameraPosition.y !== newCameraPosition.y) {
          set({ cameraPosition: newCameraPosition });
        }
        
        return { success: true };
      },
      category: GameErrorCategory.WORLD,
      context: 'updateCameraPosition',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante l\'aggiornamento della posizione della camera'),
      onFallback: () => ({ success: false })
    });
  },

  getBiomeKeyFromChar: (char) => {
    return executeWithRetry({
      operation: () => getBiomeKeyFromChar(char),
      category: GameErrorCategory.WORLD,
      context: 'getBiomeKeyFromChar',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante il recupero della chiave del bioma'),
      onFallback: () => 'unknown'
    });
  },

  formatTime: (timeMinutes) => {
    return executeWithRetry({
      operation: () => {
        const hours = Math.floor(timeMinutes / 60);
        const minutes = timeMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      },
      category: GameErrorCategory.WORLD,
      context: 'formatTime',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante la formattazione del tempo'),
      onFallback: () => '00:00'
    });
  },

  resetWorld: () => {
    return executeWithRetry({
      operation: () => {
        set({
          mapData: [],
          isMapLoading: true,
          playerPosition: { x: -1, y: -1 },
          cameraPosition: { x: 0, y: 0 },
          currentBiome: null,
        });
        resetJournalState();
        return { success: true };
      },
      category: GameErrorCategory.WORLD,
      context: 'resetWorld',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante il reset del mondo'),
      onFallback: () => ({ success: false })
    });
  },

  restoreState: (state) => {
    return executeWithRetry({
      operation: () => {
        set({
          playerPosition: state.playerPosition,
          currentBiome: state.currentBiome,
        });
        return { success: true };
      },
      category: GameErrorCategory.WORLD,
      context: 'restoreState',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WORLD, 'Errore durante il ripristino dello stato del mondo'),
      onFallback: () => ({ success: false })
    });
  }
}));
