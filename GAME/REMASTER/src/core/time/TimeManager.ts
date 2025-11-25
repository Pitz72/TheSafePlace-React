import { useGameStore } from '../store';

export const TIME_CONSTANTS = {
    MINUTES_PER_DAY: 1440, // 24 * 60
    START_HOUR: 8,
    START_MINUTE: 0
};

export class TimeManager {

    public static advanceTime(minutes: number) {
        useGameStore.getState().advanceTime(minutes);
    }

    public static getFormattedTime(totalMinutes: number): string {
        const absoluteMinutes = totalMinutes + (TIME_CONSTANTS.START_HOUR * 60) + TIME_CONSTANTS.START_MINUTE;
        const day = Math.floor(absoluteMinutes / TIME_CONSTANTS.MINUTES_PER_DAY) + 1;
        const currentDayMinutes = absoluteMinutes % TIME_CONSTANTS.MINUTES_PER_DAY;

        const hours = Math.floor(currentDayMinutes / 60);
        const mins = currentDayMinutes % 60;

        const hoursStr = hours.toString().padStart(2, '0');
        const minsStr = mins.toString().padStart(2, '0');

        return `Day ${day} - ${hoursStr}:${minsStr}`;
    }
}
