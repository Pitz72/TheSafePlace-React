import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useGameStore } from '../stores/gameStore';
import { saveSystem } from '../utils/saveSystem';
import type { GameState } from '../interfaces/gameState';

const GameContext = createContext<GameState | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useGameStore();

  // Save functions setup with corrected dependency array
  useEffect(() => {
    const saveCurrentGame = async (slot: string): Promise<boolean> => {
      const state = useGameStore.getState();
      const gameData = {
        characterSheet: state.characterSheet,
        playerPosition: state.playerPosition,
        timeState: state.timeState,
        survivalState: state.survivalState,
        logEntries: state.logEntries,
        currentBiome: state.currentBiome,
        visitedShelters: state.visitedShelters,
        items: state.items,
        seenEventIds: state.seenEventIds,
        lastShortRestTime: state.lastShortRestTime
      };
      return await saveSystem.saveGame(slot, gameData);
    };

    const loadSavedGame = async (slot: string): Promise<boolean> => {
      const gameData = await saveSystem.loadGame(slot);
      if (gameData) {
        useGameStore.setState({
          characterSheet: gameData.characterSheet,
          playerPosition: gameData.playerPosition,
          timeState: gameData.timeState,
          survivalState: gameData.survivalState,
          logEntries: gameData.logEntries,
          currentBiome: gameData.currentBiome,
          visitedShelters: gameData.visitedShelters,
          items: gameData.items,
          seenEventIds: gameData.seenEventIds,
          lastShortRestTime: gameData.lastShortRestTime
        });
        return true;
      }
      return false;
    };

    const handleQuickSave = async (): Promise<boolean> => {
      return await saveCurrentGame('quicksave');
    };

    const handleQuickLoad = async (): Promise<boolean> => {
      const success = await loadSavedGame('quicksave');
      if (success) {
        useGameStore.setState({ currentScreen: 'game' });
      }
      return success;
    };

    const getSaveSlots = () => saveSystem.getSaveSlots();
    const deleteSave = (slot: string) => saveSystem.deleteSave(slot);
    const exportSave = (slot: string) => saveSystem.exportSave(slot);
    const importSave = (data: string) => saveSystem.importSave(data);

    store.setSaveFunctions({
      saveCurrentGame,
      loadSavedGame,
      handleQuickSave,
      handleQuickLoad,
      getSaveSlots,
      deleteSave,
      exportSave,
      importSave
    });
  }, [saveSystem, store.setSaveFunctions]); // Corrected dependency array

  // Context value is now a set of states and actions taken directly from the Zustand store
  const contextValue: GameState = {
    ...store,
    // All game state and actions are now provided by useGameStore
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContext };