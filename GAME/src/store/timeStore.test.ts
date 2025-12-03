import { describe, it, expect, beforeEach } from 'vitest';
import { useTimeStore } from './timeStore';
import { useCharacterStore } from './characterStore';

describe('timeStore', () => {
  beforeEach(() => {
    // Reset the stores before each test
    useTimeStore.getState().reset();
    useCharacterStore.getState().initCharacter();
  });

  it('should initialize with default values', () => {
    const state = useTimeStore.getState();
    expect(state.gameTime.day).toBe(1);
    expect(state.gameTime.hour).toBe(8);
    expect(state.gameTime.minute).toBe(0);
  });

  it('should advance time correctly within the same day', () => {
    useTimeStore.getState().advanceTime(30);
    const state = useTimeStore.getState();
    expect(state.gameTime.day).toBe(1);
    expect(state.gameTime.hour).toBe(8);
    expect(state.gameTime.minute).toBe(30);
  });

  it('should advance time to the next day', () => {
    useTimeStore.getState().advanceTime(24 * 60);
    const state = useTimeStore.getState();
    expect(state.gameTime.day).toBe(2);
    expect(state.gameTime.hour).toBe(8);
    expect(state.gameTime.minute).toBe(0);
  });
});
