import { create } from 'zustand';
import type { TimeState } from '../../interfaces/gameState';
import { useGameStore } from '../gameStore';
import { useCharacterStore } from '../character/characterStore';
import { useWeatherStore } from '../weather/weatherStore';
import { MessageType } from '../../data/MessageArchive';

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
  advanceTime: (minutes?: number) => void;
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
    const characterStore = useCharacterStore.getState();
    const gameStore = useGameStore.getState();

    if (newBiomeKey !== oldBiome) {
      gameStore.addLogEntry(MessageType.BIOME_ENTER, { biome: newBiomeKey });
      gameStore.updateBiome(newBiomeChar); // This still has complex logic, leave in gameStore for now
    }

    set({ playerPosition: newPosition, currentBiome: newBiomeKey });

    // Weather, survival, and events are still in gameStore, so we call it.
    // This shows the dependencies we still need to refactor.
    const weatherStore = useWeatherStore.getState();
    weatherStore.updateWeather();

    characterStore.addExperience(Math.floor(Math.random() * 2) + 1);

    const weatherEffects = weatherStore.getWeatherEffects();
    gameStore.survivalState.hunger = Math.max(0, gameStore.survivalState.hunger - (0.2 * weatherEffects.survivalModifier));
    gameStore.survivalState.thirst = Math.max(0, gameStore.survivalState.thirst - (0.3 * weatherEffects.survivalModifier));

    if (gameStore.survivalState.hunger <= 0 || gameStore.survivalState.thirst <= 0) {
      characterStore.updateHP(-1);
      gameStore.addLogEntry(MessageType.HP_DAMAGE, { damage: 1, reason: 'fame e sete' });
    }

    // Event triggering logic will also be extracted later
    const BIOME_EVENT_CHANCES: Record<string, number> = {
        'PLAINS': 0.10, 'FOREST': 0.15, 'RIVER': 0.18, 'CITY': 0.33,
        'VILLAGE': 0.33, 'SETTLEMENT': 0.25, 'REST_STOP': 0.20, 'UNKNOWN': 0.05
    };
    const baseEventChance = BIOME_EVENT_CHANCES[newBiomeKey] || 0.05;
    const adjustedEventChance = baseEventChance * weatherEffects.eventProbabilityModifier;

    if (newBiomeKey && Math.random() < adjustedEventChance) {
        setTimeout(() => gameStore.triggerEvent(newBiomeKey), 150);
    }

    const baseMovementTime = 10;
    const adjustedMovementTime = Math.ceil(baseMovementTime / weatherEffects.movementModifier);

    if (weatherEffects.movementModifier < 1.0) {
        const extraTime = adjustedMovementTime - baseMovementTime;
        gameStore.addLogEntry(MessageType.AMBIANCE_RANDOM, {
            text: `Il ${weatherStore.getWeatherDescription(weatherStore.currentWeather).toLowerCase()} rallenta il tuo movimento (+${extraTime} min).`
        });
    }

    get().advanceTime(adjustedMovementTime);
  },

  updateCameraPosition: (viewportSize) => {
    const { playerPosition, mapData } = get();

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

    set({ cameraPosition: { x: newCameraX, y: newCameraY } });
  },

  advanceTime: (minutes = 30) => {
    const oldTimeState = get().timeState;
    const newTotalMinutes = oldTimeState.currentTime + minutes;
    const newDay = oldTimeState.day + Math.floor(newTotalMinutes / 1440);
    const normalizedTime = newTotalMinutes % 1440;
    const newIsDay = normalizedTime >= DAWN_TIME && normalizedTime <= DUSK_TIME;

    const gameStore = useGameStore.getState();
    if (oldTimeState.currentTime < DAWN_TIME && normalizedTime >= DAWN_TIME) gameStore.addLogEntry(MessageType.TIME_DAWN);
    if (oldTimeState.currentTime < DUSK_TIME && normalizedTime >= DUSK_TIME) {
      gameStore.addLogEntry(MessageType.TIME_DUSK);
      gameStore.handleNightConsumption();
    }
    if (oldTimeState.currentTime > 0 && normalizedTime === 0) gameStore.addLogEntry(MessageType.TIME_MIDNIGHT);

    set({ timeState: { currentTime: normalizedTime, day: newDay, isDay: newIsDay } });
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
