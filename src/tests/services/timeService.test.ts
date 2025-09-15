import { timeService, TimeEventType } from '../../services/timeService';
import type { TimeState } from '../../interfaces/gameState';

describe('TimeService', () => {
  describe('calculateNewTime', () => {
    it('should advance time correctly within the same day', () => {
      const initialTime: TimeState = { currentTime: 480, day: 1, isDay: true }; // 08:00
      const { newTimeState, events } = timeService.calculateNewTime(initialTime, 30);

      expect(newTimeState.currentTime).toBe(510);
      expect(newTimeState.day).toBe(1);
      expect(newTimeState.isDay).toBe(true);
      expect(events).toEqual([]);
    });

    it('should trigger a DUSK event when crossing the threshold', () => {
      const initialTime: TimeState = { currentTime: 1190, day: 1, isDay: true }; // 19:50
      const { newTimeState, events } = timeService.calculateNewTime(initialTime, 20);

      expect(newTimeState.currentTime).toBe(1210);
      expect(newTimeState.isDay).toBe(false);
      expect(events).toContainEqual({ type: TimeEventType.DUSK });
    });

    it('should trigger a DAWN event when crossing the threshold', () => {
      const initialTime: TimeState = { currentTime: 350, day: 1, isDay: false }; // 05:50
      const { newTimeState, events } = timeService.calculateNewTime(initialTime, 20);

      expect(newTimeState.currentTime).toBe(370);
      expect(newTimeState.isDay).toBe(true);
      expect(events).toContainEqual({ type: TimeEventType.DAWN });
    });

    it('should handle rolling over to a new day', () => {
      const initialTime: TimeState = { currentTime: 1430, day: 1, isDay: false }; // 23:50
      const { newTimeState, events } = timeService.calculateNewTime(initialTime, 20);

      expect(newTimeState.currentTime).toBe(10); // 00:10
      expect(newTimeState.day).toBe(2);
      expect(events).toContainEqual({ type: TimeEventType.NEW_DAY, context: { day: 2 } });
      expect(events).toContainEqual({ type: TimeEventType.MIDNIGHT });
    });

    it('should trigger a LONG_PASSAGE event for long durations', () => {
        const initialTime: TimeState = { currentTime: 600, day: 1, isDay: true }; // 10:00
        const { events } = timeService.calculateNewTime(initialTime, 60);

        expect(events).toContainEqual({ type: TimeEventType.LONG_PASSAGE, context: { isDay: true } });
    });
  });
});
