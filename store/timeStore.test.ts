import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimeStore } from './timeStore';
import { useGameStore } from './gameStore';

// Mock dependencies
vi.mock('../constants', () => import('../test/mockConstants'));
vi.mock('./gameStore', () => ({
  useGameStore: {
    getState: () => ({
      addJournalEntry: vi.fn(),
      checkMainStoryTriggers: vi.fn(),
      checkCutsceneTriggers: vi.fn(),
    }),
  },
}));

describe('timeStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useTimeStore.getState().reset();
  });

  it('should initialize with default time', () => {
    const { day, hour, minute } = useTimeStore.getState().gameTime;
    expect(day).toBe(1);
    expect(hour).toBe(8);
    expect(minute).toBe(0);
  });

  it('should advance time correctly', () => {
    const { advanceTime } = useTimeStore.getState();

    advanceTime(75); // 1 hour, 15 minutes

    const { day, hour, minute } = useTimeStore.getState().gameTime;
    expect(day).toBe(1);
    expect(hour).toBe(9);
    expect(minute).toBe(15);
  });

  it('should handle day rollover', () => {
    const { advanceTime } = useTimeStore.getState();

    advanceTime(20 * 60); // 20 hours

    const { day, hour, minute } = useTimeStore.getState().gameTime;
    expect(day).toBe(2);
    expect(hour).toBe(4);
    expect(minute).toBe(0);
  });
});
