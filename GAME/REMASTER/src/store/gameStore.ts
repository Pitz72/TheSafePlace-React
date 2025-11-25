import { create } from 'zustand';
import { GameState, type GameStoreState } from '../types';

export const useGameStore = create<GameStoreState>((set) => ({
    gameState: GameState.CHARACTER_CREATION,
    journal: [],

    setGameState: (state) => set({ gameState: state }),

    addJournalEntry: (text, type = 'info') => set((state) => ({
        journal: [
            { text, type, timestamp: Date.now() },
            ...state.journal
        ].slice(0, 50) // Keep last 50 entries
    })),
}));
