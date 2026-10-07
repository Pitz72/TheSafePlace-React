import { GameTime } from '../types';

/** Absolute game minutes since day 1, 00:00. */
export const toAbsoluteMinutes = (time: GameTime): number =>
    (time.day - 1) * 1440 + time.hour * 60 + time.minute;

/** Night runs from 20:00 to 05:59. */
export const isNightHour = (hour: number): boolean => hour >= 20 || hour < 6;

/** Minutes from `time` to the next 06:00. */
export const minutesUntilDawn = (time: GameTime): number => {
    const hoursToDawn = time.hour < 6 ? 6 - time.hour : 24 - time.hour + 6;
    return hoursToDawn * 60 - time.minute;
};
