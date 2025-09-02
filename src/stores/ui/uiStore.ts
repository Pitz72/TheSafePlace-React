import { create } from 'zustand';

// Types migrated from gameState.ts
export type Screen = 'menu' | 'game' | 'instructions' | 'story' | 'options' | 'characterCreation' | 'characterSheet' | 'inventory' | 'levelUp' | 'shelter' | 'event' | 'loadGame' | 'crafting';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// As per design document
export interface UIState {
  currentScreen: Screen;
  previousScreen: Screen | null;
  menuSelectedIndex: number;
  selectedInventoryIndex: number; // This was missing from the monolith but is in the design
  notifications: Notification[];

  // Actions
  setCurrentScreen: (screen: Screen) => void;
  goBack: () => void;
  setMenuSelectedIndex: (index: number) => void;
  setSelectedInventoryIndex: (index: number) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial State
  currentScreen: 'menu',
  previousScreen: null,
  menuSelectedIndex: 0,
  selectedInventoryIndex: 0,
  notifications: [],

  // Actions
  setCurrentScreen: (screen) => set(state => ({
    currentScreen: screen,
    previousScreen: state.currentScreen
  })),

  goBack: () => set(state => {
    if (state.previousScreen) {
      return { currentScreen: state.previousScreen, previousScreen: null };
    }
    return { currentScreen: 'menu' }; // Fallback
  }),

  setMenuSelectedIndex: (index) => set({ menuSelectedIndex: index }),
  setSelectedInventoryIndex: (index) => set({ selectedInventoryIndex: index }),

  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set(state => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
