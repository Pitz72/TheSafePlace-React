import { gameEngine } from '../game/GameEngine';
import { eventBus } from '../events/eventBus';

describe('GameEngine', () => {
  beforeEach(() => {
    // Reset game engine state
    gameEngine.stop();
    eventBus.clear();
  });

  it('should initialize successfully', async () => {
    await expect(gameEngine.initialize()).resolves.toBeUndefined();

    const state = gameEngine.getGameState();
    expect(state.isInitialized).toBe(true);
    expect(state.world).toBeDefined();
    expect(state.character).toBeDefined();
    expect(state.inventory).toBeDefined();
    expect(state.survival).toBeDefined();
    expect(state.narrative).toBeDefined();
  });

  it('should start and stop game correctly', async () => {
    await gameEngine.initialize();

    gameEngine.start();
    expect(gameEngine.getGameState().isPaused).toBe(false);

    gameEngine.stop();
    expect(gameEngine.getGameState().isPaused).toBe(true);
  });

  it('should handle save/load operations', async () => {
    await gameEngine.initialize();

    // Modify state
    gameEngine.updateGameState({
      gameTime: 100
    });

    // Save
    await expect(gameEngine.saveGame('test')).resolves.toBeUndefined();

    // Modify again
    gameEngine.updateGameState({
      gameTime: 200
    });

    // Load
    await expect(gameEngine.loadGame('test')).resolves.toBeUndefined();

    // Check if state was restored
    const state = gameEngine.getGameState();
    expect(state.gameTime).toBe(100);
  });

  it('should handle new game correctly', async () => {
    await gameEngine.initialize();

    // Modify state
    gameEngine.updateGameState({
      gameTime: 500
    });

    // New game
    gameEngine.newGame();

    // Check if state was reset
    const state = gameEngine.getGameState();
    expect(state.gameTime).toBe(0);
    expect(state.isInitialized).toBe(true);
  });

  it('should emit events correctly', async () => {
    const mockCallback = jest.fn();
    eventBus.on('game:stateUpdated', mockCallback);

    await gameEngine.initialize();

    gameEngine.updateGameState({ gameTime: 50 });

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        state: expect.any(Object)
      })
    );

    eventBus.off('game:stateUpdated', mockCallback);
  });

  it('should handle movement correctly', async () => {
    await gameEngine.initialize();

    const initialPos = gameEngine.getGameState().world.playerPosition;

    const result = gameEngine.movePlayer('north');

    if (result) {
      const newPos = gameEngine.getGameState().world.playerPosition;
      expect(newPos.y).toBe(initialPos.y - 1);
      expect(newPos.x).toBe(initialPos.x);
    }
  });

  it('should prevent operations when not initialized', () => {
    expect(() => gameEngine.start()).toThrow();
    expect(() => gameEngine.movePlayer('north')).toBe(false);
  });
});