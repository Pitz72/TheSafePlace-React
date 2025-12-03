import { WeatherType } from '../types';

export const WEATHER_DATA: Record<WeatherType, { name: string; color: string; }> = {
    [WeatherType.SERENO]: { name: 'Sereno', color: 'text-yellow-400' },
    [WeatherType.NUVOLOSO]: { name: 'Nuvoloso', color: 'text-gray-400' },
    [WeatherType.PIOGGIA]: { name: 'Pioggia', color: 'text-cyan-400' },
    [WeatherType.TEMPESTA]: { name: 'Tempesta', color: 'text-gray-500 font-bold' },
    [WeatherType.NEBBIA]: { name: 'Nebbia', color: 'text-white/80' },
};

export const WEATHER_DURATIONS: Record<WeatherType, { min: number; max: number }> = {
    [WeatherType.SERENO]: { min: 6 * 60, max: 18 * 60 },
    [WeatherType.NUVOLOSO]: { min: 4 * 60, max: 12 * 60 },
    [WeatherType.PIOGGIA]: { min: 2 * 60, max: 6 * 60 },
    [WeatherType.TEMPESTA]: { min: 1 * 60, max: 4 * 60 },
    [WeatherType.NEBBIA]: { min: 2 * 60, max: 8 * 60 },
};

const WEATHER_TRANSITIONS: Record<WeatherType, { to: WeatherType; probability: number }[]> = {
    [WeatherType.SERENO]: [
        { to: WeatherType.SERENO, probability: 0.80 },
        { to: WeatherType.NUVOLOSO, probability: 0.15 },
        { to: WeatherType.PIOGGIA, probability: 0.05 },
    ],
    [WeatherType.NUVOLOSO]: [
        { to: WeatherType.NUVOLOSO, probability: 0.60 },
        { to: WeatherType.SERENO, probability: 0.20 },
        { to: WeatherType.PIOGGIA, probability: 0.20 },
    ],
    [WeatherType.PIOGGIA]: [
        { to: WeatherType.PIOGGIA, probability: 0.50 },
        { to: WeatherType.NUVOLOSO, probability: 0.30 },
        { to: WeatherType.TEMPESTA, probability: 0.20 },
    ],
    [WeatherType.TEMPESTA]: [
        { to: WeatherType.TEMPESTA, probability: 0.40 },
        { to: WeatherType.PIOGGIA, probability: 0.50 },
        { to: WeatherType.NUVOLOSO, probability: 0.10 },
    ],
    [WeatherType.NEBBIA]: [
        { to: WeatherType.NEBBIA, probability: 0.70 },
        { to: WeatherType.NUVOLOSO, probability: 0.30 },
    ],
};

/**
 * Picks the next weather type based on the current weather.
 * @param {WeatherType} current - The current weather type.
 * @returns {WeatherType} The next weather type.
 */
export const pickNextWeather = (current: WeatherType): WeatherType => {
    const transitions = WEATHER_TRANSITIONS[current];
    const roll = Math.random();
    let cumulativeProbability = 0;
    for (const transition of transitions) {
        cumulativeProbability += transition.probability;
        if (roll < cumulativeProbability) {
            return transition.to;
        }
    }
    return transitions[0].to; // Fallback
};
