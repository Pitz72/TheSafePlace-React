import { create } from 'zustand';

export interface TimeState {
  timeState: {
    currentTime: number;
    day: number;
    hour: number;
    minute: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  
  // Actions
  advanceTime: (minutes: number) => void;
  setTime: (hour: number, minute: number) => void;
  getTimeString: () => string;
}

export const useTimeStore = create<TimeState>((set, get) => ({
  timeState: {
    currentTime: 480, // 8:00 AM in minutes
    day: 1,
    hour: 8,
    minute: 0,
    timeOfDay: 'morning'
  },

  advanceTime: (minutes: number) => {
    set((state) => {
      const newTime = state.timeState.currentTime + minutes;
      const newHour = Math.floor(newTime / 60) % 24;
      const newMinute = newTime % 60;
      const newDay = state.timeState.day + Math.floor((state.timeState.currentTime + minutes) / (24 * 60));
      
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (newHour >= 6 && newHour < 12) timeOfDay = 'morning';
      else if (newHour >= 12 && newHour < 18) timeOfDay = 'afternoon';
      else if (newHour >= 18 && newHour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';
      
      return {
        timeState: {
          currentTime: newTime % (24 * 60),
          day: newDay,
          hour: newHour,
          minute: newMinute,
          timeOfDay
        }
      };
    });
  },

  setTime: (hour: number, minute: number) => {
    set((state) => {
      const newTime = hour * 60 + minute;
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (hour >= 6 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
      else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';
      
      return {
        timeState: {
          ...state.timeState,
          currentTime: newTime,
          hour,
          minute,
          timeOfDay
        }
      };
    });
  },

  getTimeString: () => {
    const { hour, minute } = get().timeState;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
}));