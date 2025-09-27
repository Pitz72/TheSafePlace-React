import { create } from 'zustand';
import type { ShelterAccessInfo } from '@/interfaces/gameState';
import { useWorldStore } from '@/stores/world/worldStore';
import { useTimeStore } from '@/stores/time/timeStore';

export interface ShelterState {
  shelterAccessState: Record<string, ShelterAccessInfo>;
}

export interface ShelterActions {
  createShelterKey: (x: number, y: number) => string;
  getShelterInfo: (x: number, y: number) => ShelterAccessInfo | null;
  createShelterInfo: (x: number, y: number) => ShelterAccessInfo;
  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => void;
  isShelterAccessible: (x: number, y: number) => boolean;
  canInvestigateShelter: (x: number, y: number) => boolean;
  isPlayerInShelter: () => boolean;
  resetShelterInvestigations: () => void;
  resetShelters: () => void;
  restoreState: (state: { shelterAccessState: Record<string, ShelterAccessInfo> }) => void;
}

export type ShelterStore = ShelterState & ShelterActions;

export const useShelterStore = create<ShelterStore>((set, get) => ({
  // --- INITIAL STATE ---
  shelterAccessState: {},

  // --- ACTIONS ---

  createShelterKey: (x, y) => `${x},${y}`,

  getShelterInfo: (x, y) => {
    const key = get().createShelterKey(x, y);
    return get().shelterAccessState[key] || null;
  },

  createShelterInfo: (x, y) => {
    const timeStore = useTimeStore.getState();
    const timeState = timeStore?.timeState;
    
    return {
      coordinates: get().createShelterKey(x, y),
      dayVisited: timeState?.day || 1,
      timeVisited: timeState?.currentTime || 0,
      hasBeenInvestigated: false,
      isAccessible: true,
      investigationResults: [],
    };
  },

  updateShelterAccess: (x, y, updates) => {
    const key = get().createShelterKey(x, y);
    set((state) => ({
      shelterAccessState: {
        ...state.shelterAccessState,
        [key]: {
          ...state.shelterAccessState[key],
          ...updates,
        },
      },
    }));
  },

  isShelterAccessible: (x, y) => {
    const shelterInfo = get().getShelterInfo(x, y);
    if (!shelterInfo) return true;

    const timeStore = useTimeStore.getState();
    const timeState = timeStore?.timeState;
    
    // If timeState is not available, allow access (fallback)
    if (!timeState || typeof timeState.currentTime === 'undefined') {
      return true;
    }
    
    const isDay = timeState.currentTime >= 360 && timeState.currentTime <= 1200; // 06:00 - 20:00
    if (!isDay) return true;

    return shelterInfo.isAccessible;
  },

  canInvestigateShelter: (x, y) => {
    // Un rifugio può essere investigato ogni volta che il giocatore ci entra
    // Non c'è limite al numero di investigazioni per rifugio
    return true;
  },

  isPlayerInShelter: () => {
    const { playerPosition, mapData } = useWorldStore.getState();
    if (!mapData || mapData.length === 0 || playerPosition.x === -1) {
      return false;
    }
    const currentTile = mapData[playerPosition.y]?.[playerPosition.x];
    return currentTile === 'R';
  },

  resetShelterInvestigations: () => {
    set((state) => {
      const newShelterAccessState = { ...state.shelterAccessState };
      Object.keys(newShelterAccessState).forEach((key) => {
        newShelterAccessState[key] = {
          ...newShelterAccessState[key],
          hasBeenInvestigated: false,
          investigationResults: [],
        };
      });
      return { shelterAccessState: newShelterAccessState };
    });
  },

  resetShelters: () => {
    set({ shelterAccessState: {} });
  },

  restoreState: (state) => {
    set({ shelterAccessState: state.shelterAccessState });
  }
}));
