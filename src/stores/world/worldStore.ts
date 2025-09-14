import { create } from 'zustand';
import type { TimeState } from '../../interfaces/gameState';
import { useNotificationStore } from '../notifications/notificationStore';
import { MessageType } from '../../data/MessageArchive';
import { playerMovementService } from '../../services/playerMovementService';

const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00

export interface WorldState {
  mapData: string[];
  isMapLoading: boolean;
  playerPosition: { x: number; y: number };
  cameraPosition: { x: number; y: number };
  timeState: TimeState;
  currentBiome: string | null;

  // Actions
  loadMap: () => Promise<void>;
  updatePlayerPosition: (newPosition: { x: number; y: number }, newBiomeChar: string) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  setTimeState: (newTimeState: TimeState) => void;
  getBiomeKeyFromChar: (char: string) => string;
  formatTime: (timeMinutes: number) => string;
  resetWorld: () => void;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  // --- INITIAL STATE ---
  mapData: [],
  isMapLoading: true,
  playerPosition: { x: -1, y: -1 },
  cameraPosition: { x: 0, y: 0 },
  timeState: { currentTime: DAWN_TIME, day: 1, isDay: true },
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

  updatePlayerPosition: (newPosition, newBiomeChar) => {
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
      notificationStore.addLogEntry(MessageType.BIOME_ENTER, { biome: newBiomeKey });
    }

    // 3. Log movement
    if (hasMoved) {
      notificationStore.addLogEntry(MessageType.MOVEMENT, {
        from: oldPos,
        to: newPosition,
        biome: newBiomeKey
      });
    }

    // 4. Delegate all side effects to the service
    playerMovementService.handleMovementEffects(newBiomeKey);
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

    const newCameraX = Math.max(0, Math.min(idealCameraX, maxScrollX));
    const newCameraY = Math.max(0, Math.min(idealCameraY, maxScrollY));

    if (oldCameraPosition.x !== newCameraX || oldCameraPosition.y !== newCameraY) {
      set({ cameraPosition: { x: newCameraX, y: newCameraY } });
    }
  },

  setTimeState: (newTimeState: TimeState) => {
    set({ timeState: newTimeState });
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
      timeState: { currentTime: DAWN_TIME, day: 1, isDay: true },
      currentBiome: null,
    })
  }
}));
