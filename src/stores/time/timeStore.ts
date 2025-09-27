import { create } from 'zustand';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { useSurvivalStore } from '@/stores/survival/survivalStore';
import { MessageType } from '@/data/MessageArchive';
import { calculateNewTime, getTimeOfDay } from '@/utils/timeUtils';

const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00

interface TimeState {
  currentTime: number;
  day: number;
  hour: number;
  minute: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface TimeActions {
  advanceTime: (minutes: number) => void;
  setTime: (hour: number, minute: number) => void;
  getTimeString: () => string;
}

export type TimeStore = TimeState & TimeActions;

const initialState: TimeState = {
  currentTime: 480, // 8:00 AM in minutes
  day: 1,
  hour: 8,
  minute: 0,
  timeOfDay: 'morning',
};

export const useTimeStore = create<TimeStore>((set, get) => ({
  ...initialState,

  advanceTime: (minutes: number) => {
    const oldTime = get().currentTime;
    set((state) => {
      const { newCurrentTime, newDay, newHour, newMinute } = calculateNewTime(state.currentTime, state.day, minutes);
      const timeOfDay = getTimeOfDay(newHour);

      return {
        currentTime: newCurrentTime,
        day: newDay,
        hour: newHour,
        minute: newMinute,
        timeOfDay,
      };
    });

    const newTime = get().currentTime;
    const notificationStore = useNotificationStore.getState();
    const survivalStore = useSurvivalStore.getState();

    // Check for dawn transition
    if (oldTime < DAWN_TIME && newTime >= DAWN_TIME) {
      notificationStore.addLogEntry(MessageType.TIME_DAWN);
    }

    // Check for dusk transition
    if (oldTime < DUSK_TIME && newTime >= DUSK_TIME) {
      notificationStore.addLogEntry(MessageType.TIME_DUSK);
      survivalStore.handleNightConsumption((type, context) => notificationStore.addLogEntry(type, context));
    }

    // Check for midnight transition
    if (newTime < oldTime) { // Day has changed
      notificationStore.addLogEntry(MessageType.TIME_MIDNIGHT);
    }

    if (minutes >= 60) {
      const isDay = newTime >= DAWN_TIME && newTime <= DUSK_TIME;
      notificationStore.addLogEntry(MessageType.AMBIANCE_RANDOM, {
        text: `Il tempo scorre... ${isDay ? 'È giorno' : 'È notte'}.`,
      });
    }
  },

  setTime: (hour: number, minute: number) => {
    set(() => {
      const newTime = hour * 60 + minute;
      const timeOfDay = getTimeOfDay(hour);

      return {
        currentTime: newTime,
        hour,
        minute,
        timeOfDay,
      };
    });
  },

  getTimeString: () => {
    const { hour, minute } = get();
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  },
}));