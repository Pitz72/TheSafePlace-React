import { useContext } from 'react';
import { GameContext } from '../contexts/GameProvider';
import type { GameState } from '../interfaces/gameState';

export const useGameContext = (): GameState => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};