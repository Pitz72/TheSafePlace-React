/**
 * GameEngine Context - Fornisce accesso al GameEngine in tutta l'app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { gameEngine } from '../core/game/GameEngine';
import type { GameState } from '../core/game/GameEngine';
import { eventBus } from '../core/events/eventBus';

interface GameEngineContextType {
  gameState: GameState | null;
  isInitialized: boolean;
  isRunning: boolean;
  initialize: () => Promise<void>;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  save: (slot?: string) => Promise<void>;
  load: (slot?: string) => Promise<void>;
  newGame: () => void;
  movePlayer: (direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest') => boolean;
}

const GameEngineContext = createContext<GameEngineContextType | null>(null);

interface GameEngineProviderProps {
  children: ReactNode;
}

export const GameEngineProvider: React.FC<GameEngineProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Ascolta aggiornamenti dello stato di gioco
    const handleStateUpdate = (data: { state: GameState }) => {
      setGameState(data.state);
    };

    const handleEngineStarted = () => {
      setIsRunning(true);
    };

    const handleEngineStopped = () => {
      setIsRunning(false);
    };

    // Registra listeners
    eventBus.on('game:stateUpdated', handleStateUpdate);
    eventBus.on('game:started', handleEngineStarted);
    eventBus.on('game:stopped', handleEngineStopped);

    // Cleanup
    return () => {
      eventBus.off('game:stateUpdated', handleStateUpdate);
      eventBus.off('game:started', handleEngineStarted);
      eventBus.off('game:stopped', handleEngineStopped);
    };
  }, []);

  const initialize = async () => {
    if (isInitialized) return;

    try {
      await gameEngine.initialize();
      setIsInitialized(true);
      setGameState(gameEngine.getGameState());
    } catch (error) {
      console.error('Failed to initialize GameEngine:', error);
      throw error;
    }
  };

  const start = () => {
    gameEngine.start();
  };

  const stop = () => {
    gameEngine.stop();
  };

  const pause = () => {
    gameEngine.setPaused(true);
  };

  const resume = () => {
    gameEngine.setPaused(false);
  };

  const save = async (slot?: string) => {
    await gameEngine.saveGame(slot);
  };

  const load = async (slot?: string) => {
    await gameEngine.loadGame(slot);
    setGameState(gameEngine.getGameState());
  };

  const newGame = () => {
    gameEngine.newGame();
    setGameState(gameEngine.getGameState());
  };

  const movePlayer = (direction: Parameters<GameEngineContextType['movePlayer']>[0]) => {
    return gameEngine.movePlayer(direction);
  };

  const contextValue: GameEngineContextType = {
    gameState,
    isInitialized,
    isRunning,
    initialize,
    start,
    stop,
    pause,
    resume,
    save,
    load,
    newGame,
    movePlayer
  };

  return (
    <GameEngineContext.Provider value={contextValue}>
      {children}
    </GameEngineContext.Provider>
  );
};

export const useGameEngine = (): GameEngineContextType => {
  const context = useContext(GameEngineContext);
  if (!context) {
    throw new Error('useGameEngine must be used within a GameEngineProvider');
  }
  return context;
};