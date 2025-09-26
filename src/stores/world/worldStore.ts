import { create } from 'zustand';
import { useNotificationStore } from '../notifications/notificationStore';
import { useSurvivalStore } from '../survival/survivalStore';
import { useTimeStore } from '../time/timeStore';
import { MessageType, JOURNAL_STATE, resetJournalState } from '../../data/MessageArchive';
import { playerMovementService } from '../../services/playerMovementService';
import { narrativeIntegration } from '../../services/narrativeIntegration';

const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00

export interface WorldState {
  mapData: string[];
  isMapLoading: boolean;
  playerPosition: { x: number; y: number };
  cameraPosition: { x: number; y: number };
  currentBiome: string | null;

  // Actions
  loadMap: () => Promise<void>;
  updatePlayerPosition: (newPosition: { x: number; y: number }, newBiomeChar: string, movementContext?: { isEnteringRiver?: boolean }) => void;
  handleFailedMovement: (targetX: number, targetY: number, terrain: string) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  getBiomeKeyFromChar: (char: string) => string;
  formatTime: (timeMinutes: number) => string;
  resetWorld: () => void;
  restoreState: (state: { playerPosition: { x: number; y: number }; currentBiome: string | null }) => void;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  // --- INITIAL STATE ---
  mapData: [],
  isMapLoading: true,
  playerPosition: { x: -1, y: -1 },
  cameraPosition: { x: 0, y: 0 },
  currentBiome: null,

  // --- ACTIONS ---

  loadMap: async () => {
    try {
      const response = await fetch('/map.txt');
      const mapText = await response.text();
      const lines = mapText.split('\n').filter((line) => line);

      let startPos = { x: 75, y: 75 };
      lines.forEach((line, y) => {
        const x = line.indexOf('S');
        if (x !== -1) startPos = { x, y };
      });

      const startBiome = get().getBiomeKeyFromChar(lines[startPos.y][startPos.x]);

      set({
        mapData: lines,
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
    const newBiomeKey = get().getBiomeKeyFromChar(newBiomeChar);
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

    if (!mapData || mapData.length === 0 || !viewportSize || viewportSize.width === 0 || viewportSize.height === 0) {
      return;
    }

    const CHAR_WIDTH = 25.6;
    const CHAR_HEIGHT = 38.4;
    const MAP_WIDTH_IN_TILES = mapData[0].length;
    const MAP_HEIGHT_IN_TILES = mapData.length;

    const idealCameraX = (playerPosition.x * CHAR_WIDTH) - (viewportSize.width / 2) + (CHAR_WIDTH / 2);
    const idealCameraY = (playerPosition.y * CHAR_HEIGHT) - (viewportSize.height / 2) + (CHAR_HEIGHT / 2);

    const maxScrollX = (MAP_WIDTH_IN_TILES * CHAR_WIDTH) - viewportSize.width;
    const maxScrollY = (MAP_HEIGHT_IN_TILES * CHAR_HEIGHT) - viewportSize.height;

    let newCameraX = Math.max(0, Math.min(idealCameraX, maxScrollX));
    let newCameraY = Math.max(0, Math.min(idealCameraY, maxScrollY));

    // Garantisci che il player sia sempre visibile dopo il clamping
    const playerLeft = (playerPosition.x * CHAR_WIDTH) - newCameraX;
    const playerTop = (playerPosition.y * CHAR_HEIGHT) - newCameraY;

    // Se il player sarebbe fuori vista a sinistra, sposta la camera a sinistra
    if (playerLeft < 0) {
      newCameraX = playerPosition.x * CHAR_WIDTH;
    }
    // Se il player sarebbe fuori vista a destra, sposta la camera a destra
    else if (playerLeft > viewportSize.width - CHAR_WIDTH) {
      newCameraX = (playerPosition.x * CHAR_WIDTH) - (viewportSize.width - CHAR_WIDTH);
    }

    // Se il player sarebbe fuori vista in alto, sposta la camera in alto
    if (playerTop < 0) {
      newCameraY = playerPosition.y * CHAR_HEIGHT;
    }
    // Se il player sarebbe fuori vista in basso, sposta la camera in basso
    else if (playerTop > viewportSize.height - CHAR_HEIGHT) {
      newCameraY = (playerPosition.y * CHAR_HEIGHT) - (viewportSize.height - CHAR_HEIGHT);
    }

    // Ri-clampa per sicurezza
    newCameraX = Math.max(0, Math.min(newCameraX, maxScrollX));
    newCameraY = Math.max(0, Math.min(newCameraY, maxScrollY));

    if (oldCameraPosition.x !== newCameraX || oldCameraPosition.y !== newCameraY) {
      set({ cameraPosition: { x: newCameraX, y: newCameraY } });
    }
  },

  advanceTime: (minutes = 30) => {
    // Delegate to timeStore
    const timeStore = useTimeStore.getState();
    timeStore.advanceTime(minutes);

    // Handle notifications and survival effects
    const notificationStore = useNotificationStore.getState();
    const survivalStore = useSurvivalStore.getState();
    const currentTime = timeStore.timeState.currentTime;

    // Check for dawn transition
    if (currentTime >= DAWN_TIME && currentTime < DAWN_TIME + minutes) {
      notificationStore.addLogEntry(MessageType.TIME_DAWN);
    }

    // Check for dusk transition
    if (currentTime >= DUSK_TIME && currentTime < DUSK_TIME + minutes) {
      notificationStore.addLogEntry(MessageType.TIME_DUSK);
      survivalStore.handleNightConsumption((type, context) => notificationStore.addLogEntry(type, context));
    }

    // Check for midnight transition
    if (currentTime >= 1440 - minutes && currentTime < 1440) {
      notificationStore.addLogEntry(MessageType.TIME_MIDNIGHT);
    }

    if (minutes >= 60) {
      const isDay = currentTime >= DAWN_TIME && currentTime <= DUSK_TIME;
      notificationStore.addLogEntry(MessageType.AMBIANCE_RANDOM, {
        text: `Il tempo scorre... ${isDay ? 'È giorno' : 'È notte'}.`
      });
    }
  },

  getBiomeKeyFromChar: (char) => {
    const map: Record<string, string> = {
      'C': 'CITY', 'F': 'FOREST', '.': 'PLAINS', '~': 'RIVER',
      'V': 'VILLAGE', 'S': 'SETTLEMENT', 'R': 'REST_STOP',
    };
    return map[char] || 'UNKNOWN';
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
