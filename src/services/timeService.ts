import type { TimeState } from '../interfaces/gameState';

const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00

export enum TimeEventType {
  DAWN,
  DUSK,
  MIDNIGHT,
  NEW_DAY,
  LONG_PASSAGE,
}

export interface TimeEvent {
  type: TimeEventType;
  context?: any;
}

export interface AdvanceTimeResult {
  newTimeState: TimeState;
  events: TimeEvent[];
}

class TimeService {
  public calculateNewTime(
    currentTimeState: TimeState,
    minutes: number
  ): AdvanceTimeResult {
    const events: TimeEvent[] = [];
    const newTotalMinutes = currentTimeState.currentTime + minutes;
    const newDay = currentTimeState.day + Math.floor(newTotalMinutes / 1440);
    const normalizedTime = newTotalMinutes % 1440;
    const newIsDay = normalizedTime >= DAWN_TIME && normalizedTime <= DUSK_TIME;

    if (currentTimeState.currentTime < DAWN_TIME && normalizedTime >= DAWN_TIME) {
      events.push({ type: TimeEventType.DAWN });
    }
    if (currentTimeState.currentTime < DUSK_TIME && normalizedTime >= DUSK_TIME) {
      events.push({ type: TimeEventType.DUSK });
    }
    if (currentTimeState.currentTime > 0 && newTotalMinutes > 1440 && normalizedTime < DAWN_TIME) { // A more robust midnight check
        events.push({ type: TimeEventType.MIDNIGHT });
    }
    if (newDay > currentTimeState.day) {
      // The DAWN event already covers the notification for the new day starting
      // but we might need a specific hook for other mechanics.
      events.push({ type: TimeEventType.NEW_DAY, context: { day: newDay } });
    }
    if (minutes >= 60) {
      events.push({ type: TimeEventType.LONG_PASSAGE, context: { isDay: newIsDay } });
    }

    const newTimeState: TimeState = {
      currentTime: normalizedTime,
      day: newDay,
      isDay: newIsDay,
    };

    return { newTimeState, events };
  }
}

export const timeService = new TimeService();
