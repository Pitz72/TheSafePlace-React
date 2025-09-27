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
    try {
      const { mapData, startPos, startBiome } = await loadMapData();
      set({
        mapData,
        isMapLoading: false,
        playerPosition: startPos,
        currentBiome: startBiome,
      });
    } catch (error) {
      console.error("Failed to load map data:", error);
      set({ isMapLoading: false });
    }
  },

  updatePlayerPosition: (newPosition, newBiomeChar, movementContext) => {
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
      console.log('🌍 WORLDSTORE DEBUG - Biome changed:', {
        oldBiome,
        newBiome: newBiomeKey,
        position: newPosition,
        char: newBiomeChar
      });
      
      notificationStore.addLogEntry(MessageType.BIOME_ENTER, { biome: newBiomeKey });
      
      // 2.2. Trigger narrative events for biome change
      console.log('🌍 WORLDSTORE DEBUG - Calling narrativeIntegration.checkForNarrativeEvents...');
      narrativeIntegration.checkForNarrativeEvents('biome_change', {
        oldBiome,
        newBiome: newBiomeKey
      });
      console.log('🌍 WORLDSTORE DEBUG - narrativeIntegration.checkForNarrativeEvents called');
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
  },

  handleFailedMovement: (targetX, targetY, terrain) => {
    const notificationStore = useNotificationStore.getState();
    
    // Generate appropriate failure message based on terrain
    if (terrain === 'M') {
      notificationStore.addLogEntry(MessageType.MOVEMENT_FAIL_MOUNTAIN);
    }
    // Add other terrain-specific failure messages as needed
  },

  updateCameraPosition: (viewportSize) => {
    const { playerPosition, mapData, cameraPosition: oldCameraPosition } = get();
    const newCameraPosition = calculateCameraPosition(playerPosition, mapData, viewportSize, oldCameraPosition);

    if (oldCameraPosition.x !== newCameraPosition.x || oldCameraPosition.y !== newCameraPosition.y) {
      set({ cameraPosition: newCameraPosition });
    }
  },

  getBiomeKeyFromChar: (char) => {
    return getBiomeKeyFromChar(char);
  },

  formatTime: (timeMinutes) => {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  resetWorld: () => {
    set({
      mapData: [],
      isMapLoading: true,
      playerPosition: { x: -1, y: -1 },
      cameraPosition: { x: 0, y: 0 },
      currentBiome: null,
    });
    resetJournalState();
  },

  restoreState: (state) => {
    set({
      playerPosition: state.playerPosition,
      currentBiome: state.currentBiome,
    });
  }
}));
