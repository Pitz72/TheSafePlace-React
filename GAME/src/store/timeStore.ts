import { create } from 'zustand';
import { GameTime, WeatherState, WeatherType, JournalEntryType } from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { WEATHER_DATA, pickNextWeather, rollWeatherDuration } from '../utils/weather';
import { useInteractionStore } from './interactionStore';

interface TimeStoreState {
    gameTime: GameTime;
    weather: WeatherState;
    /** Advances the clock. Without bypassPause nothing happens while a menu or a refuge is open. */
    advanceTime: (minutes: number, bypassPause?: boolean) => void;
    reset: () => void;
    toJSON: () => object;
    fromJSON: (json: any) => void;
}

const initialTime = (): GameTime => ({ day: 1, hour: 8, minute: 0 });
const initialWeather = (): WeatherState => ({ type: WeatherType.SERENO, duration: rollWeatherDuration(WeatherType.SERENO) });

const isWeatherType = (value: unknown): value is WeatherType =>
    Object.values(WeatherType).includes(value as WeatherType);

export const useTimeStore = create<TimeStoreState>((set, get) => ({
    gameTime: initialTime(),
    weather: initialWeather(),

    advanceTime: (minutes, bypassPause = false) => {
        const elapsed = Math.round(minutes);
        if (elapsed <= 0) return;
        const { isInventoryOpen, isInRefuge } = useInteractionStore.getState();
        if ((isInventoryOpen || isInRefuge) && !bypassPause) return;

        const { gameTime, weather } = get();
        const totalMinutes = gameTime.hour * 60 + gameTime.minute + elapsed;
        const newTime: GameTime = {
            day: gameTime.day + Math.floor(totalMinutes / 1440),
            hour: Math.floor((totalMinutes % 1440) / 60),
            minute: totalMinutes % 60,
        };

        // A long rest can go through several weather spells: keep the leftover time.
        let next: WeatherState = { type: weather.type, duration: weather.duration - elapsed };
        while (next.duration <= 0) {
            const type = pickNextWeather(next.type);
            next = { type, duration: next.duration + rollWeatherDuration(type) };
        }
        set({ gameTime: newTime, weather: next });
        if (next.type !== weather.type) {
            useGameStore.getState().addJournalEntry({
                text: `Il tempo sta cambiando... Ora è ${WEATHER_DATA[next.type].name.toLowerCase()}.`,
                type: JournalEntryType.NARRATIVE,
            });
        }

        // A refuge shelters from the weather.
        const exposure = useInteractionStore.getState().isInRefuge ? WeatherType.SERENO : next.type;
        useCharacterStore.getState().updateSurvivalStats(elapsed, exposure);

        if (newTime.day > gameTime.day) {
            const game = useGameStore.getState();
            game.checkMainStoryTriggers();
            game.checkCutsceneTriggers();
        }
    },

    reset: () => set({ gameTime: initialTime(), weather: initialWeather() }),

    toJSON: () => ({ gameTime: get().gameTime, weather: get().weather }),

    fromJSON: (json) => {
        const time = json?.gameTime;
        const weather = json?.weather;
        set({
            gameTime: time && typeof time.day === 'number' ? { day: time.day, hour: time.hour ?? 8, minute: time.minute ?? 0 } : initialTime(),
            weather: weather && isWeatherType(weather.type) ? { type: weather.type, duration: Math.max(1, weather.duration ?? 60) } : initialWeather(),
        });
    },
}));
