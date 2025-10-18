import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from './characterStore';

describe('characterStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCharacterStore.getState().initCharacter();
  });

  it('should initialize with default values', () => {
    const state = useCharacterStore.getState();
    expect(state.level).toBe(1);
    expect(state.hp.current).toBe(100);
    expect(state.hp.max).toBe(100);
  });

  it('should take damage', () => {
    useCharacterStore.getState().takeDamage(10);
    expect(useCharacterStore.getState().hp.current).toBe(90);
  });

  it('should not heal above max HP', () => {
    useCharacterStore.getState().takeDamage(10);
    useCharacterStore.getState().heal(20);
    expect(useCharacterStore.getState().hp.current).toBe(100);
  });

  it('should add xp and level up', () => {
    const state = useCharacterStore.getState();
    const xpToNextLevel = state.xp.next - state.xp.current;
    useCharacterStore.getState().addXp(xpToNextLevel);
    expect(useCharacterStore.getState().levelUpPending).toBe(true);
  });
});
