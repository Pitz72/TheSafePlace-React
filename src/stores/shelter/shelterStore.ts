import { create } from 'zustand';
import type { ShelterAccessInfo } from '../../interfaces/gameState';
import { useWorldStore } from '../world/worldStore';

export interface ShelterState {
  shelterAccessState: Record<string, ShelterAccessInfo>;

  // Actions
  createShelterKey: (x: number, y: number) => string;
  getShelterInfo: (x: number, y: number) => ShelterAccessInfo | null;
  createShelterInfo: (x: number, y: number) => ShelterAccessInfo;
  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => void;
  isShelterAccessible: (x: number, y: number) => boolean;
  canInvestigateShelter: (x: number, y: number) => boolean;
  isPlayerInShelter: () => boolean;
  resetShelterInvestigations: () => void;
  resetShelters: () => void;
}

export const useShelterStore = create<ShelterState>((set, get) => ({
  // --- INITIAL STATE ---
  shelterAccessState: {},

  // --- ACTIONS ---

  createShelterKey: (x, y) => `${x},${y}`,

  getShelterInfo: (x, y) => {
    const key = get().createShelterKey(x, y);
    return get().shelterAccessState[key] || null;
  },

  createShelterInfo: (x, y) => {
    const { timeState } = useWorldStore.getState();
    return {
      coordinates: get().createShelterKey(x, y),
      dayVisited: timeState.day,
      timeVisited: timeState.currentTime,
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

    const { timeState } = useWorldStore.getState();
    if (!timeState.isDay) return true;

    return shelterInfo.isAccessible;
  },

  canInvestigateShelter: (x, y) => {
    const shelterInfo = get().getShelterInfo(x, y);
    if (!shelterInfo) return true;
    return !shelterInfo.hasBeenInvestigated;
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
  }
}));
