import { create } from 'zustand';
import { GameTime, WeatherState, WeatherType, JournalEntryType } from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { WEATHER_DATA, WEATHER_DURATIONS, pickNextWeather } from '../utils/weather';
import { useInteractionStore } from './interactionStore';

/**
 * @interface TimeStoreState
 * @description Represents the state of the time store.
 * @property {GameTime} gameTime - The current in-game time.
 * @property {WeatherState} weather - The current weather state.
 * @property {(minutes: number, bypassPause?: boolean) => void} advanceTime - Function to advance the in-game time.
 * @property {() => void} reset - Function to reset the time store to its initial state.
 */
interface TimeStoreState {
    gameTime: GameTime;
    weather: WeatherState;
    advanceTime: (minutes: number, bypassPause?: boolean) => void;
    reset: () => void;
    toJSON: () => object;
    fromJSON: (json: any) => void;
}

const initialState = {
    gameTime: { day: 1, hour: 8, minute: 0 },
    weather: { type: WeatherType.SERENO, duration: Math.floor(Math.random() * (WEATHER_DURATIONS[WeatherType.SERENO].max - WEATHER_DURATIONS[WeatherType.SERENO].min + 1)) + WEATHER_DURATIONS[WeatherType.SERENO].min },
};

export const useTimeStore = create<TimeStoreState>((set, get) => ({
    ...initialState,
    
    /**
     * @function advanceTime
     * @description Advances the in-game time by a specified number of minutes.
     * @param {number} minutes - The number of minutes to advance the time by.
     * @param {boolean} [bypassPause=false] - Whether to advance time even if the game is paused (e.g., in a menu).
     */
    advanceTime: (minutes: number, bypassPause: boolean = false) => {
        // FIX: Destructure state from the correct stores (interactionStore and gameStore).
        const { addJournalEntry, checkMainQuestTriggers } = useGameStore.getState();
        const { isInventoryOpen, isInRefuge } = useInteractionStore.getState();

        if ((isInventoryOpen || isInRefuge) && !bypassPause) return;
        
        const oldDay = get().gameTime.day;

        let newMinute = get().gameTime.minute + minutes;
        let newHour = get().gameTime.hour;
        let newDay = get().gameTime.day;
        while (newMinute >= 60) { newMinute -= 60; newHour += 1; }
        while (newHour >= 24) { newHour -= 24; newDay += 1; }
        set({ gameTime: { day: newDay, hour: newHour, minute: newMinute } });

        if(newDay > oldDay) {
            checkMainQuestTriggers();
            checkCutsceneTriggers();
        }

        let newWeather = { ...get().weather };
        newWeather.duration -= minutes;
        if (newWeather.duration <= 0) {
            const nextWeatherType = pickNextWeather(newWeather.type);
            const { min, max } = WEATHER_DURATIONS[nextWeatherType];
            const newDuration = Math.floor(Math.random() * (max - min + 1)) + min;
            newWeather = { type: nextWeatherType, duration: newDuration };
            addJournalEntry({ text: `Il tempo sta cambiando... Ora è ${WEATHER_DATA[nextWeatherType].name.toLowerCase()}.`, type: JournalEntryType.NARRATIVE });
        }
        set({ weather: newWeather });
        
        // FIX: Check isInRefuge from useInteractionStore, not useGameStore.
        const currentActivityWeather = useInteractionStore.getState().isInRefuge ? WeatherType.SERENO : get().weather.type;
        useCharacterStore.getState().updateSurvivalStats(minutes, currentActivityWeather);
    },

    /**
     * @function reset
     * @description Resets the time store to its initial state.
     */
    reset: () => {
        set(initialState);
    },

    toJSON: () => {
        return get();
    },

    fromJSON: (json) => {
        set(json);
    }
}));