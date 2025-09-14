import { useWeatherStore } from '../stores/weather/weatherStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useSurvivalStore } from '../stores/survival/survivalStore';
import { useEventStore } from '../stores/events/eventStore';
import { useWorldStore } from '../stores/world/worldStore';
import { useNotificationStore } from '../stores/notifications/notificationStore';
import { timeService, TimeEventType, TimeEvent } from './timeService';
import { MessageType } from '../data/MessageArchive';

class PlayerMovementService {
  public handleMovementEffects(newBiomeKey: string): void {
    const weatherStore = useWeatherStore.getState();
    const characterStore = useCharacterStore.getState();
    const survivalStore = useSurvivalStore.getState();
    const eventStore = useEventStore.getState();
    const worldStore = useWorldStore.getState();
    const notificationStore = useNotificationStore.getState();

    // 1. Update weather and get its effects
    weatherStore.updateWeather();
    const weatherEffects = weatherStore.getWeatherEffects();

    // 2. Grant movement XP
    characterStore.gainMovementXP();

    // 3. Apply survival cost for moving - THIS HAPPENS BEFORE TIME PASSES
    survivalStore.applyMovementSurvivalCost(weatherEffects);

    // 4. Check for random events
    eventStore.checkForRandomEvent(newBiomeKey, weatherEffects);

    // 5. Calculate how much time passed
    const baseMovementTime = 10;
    const adjustedMovementTime = Math.ceil(baseMovementTime / weatherEffects.movementModifier);

    if (weatherEffects.movementModifier < 1.0) {
        const extraTime = adjustedMovementTime - baseMovementTime;
        notificationStore.addLogEntry(MessageType.AMBIANCE_RANDOM, {
            text: `Il ${weatherStore.getWeatherDescription(weatherStore.currentWeather).toLowerCase()} rallenta il tuo movimento (+${extraTime} min).`
        });
    }

    // 6. Calculate the new time state and resulting events
    const { newTimeState, events } = timeService.calculateNewTime(
      worldStore.timeState,
      adjustedMovementTime
    );

    // 7. Set the new time in the world store
    worldStore.setTimeState(newTimeState);

    // 8. Handle all side effects from the time change
    this._handleTimeEvents(events);
  }

  private _handleTimeEvents(events: TimeEvent[]): void {
    const notificationStore = useNotificationStore.getState();
    const survivalStore = useSurvivalStore.getState();

    for (const event of events) {
      switch (event.type) {
        case TimeEventType.DAWN:
          notificationStore.addLogEntry(MessageType.TIME_DAWN);
          break;
        case TimeEventType.DUSK:
          notificationStore.addLogEntry(MessageType.TIME_DUSK);
          // Nightly survival cost is now handled here, AFTER movement cost.
          survivalStore.handleNightConsumption((type, context) =>
            notificationStore.addLogEntry(type, context)
          );
          break;
        case TimeEventType.MIDNIGHT:
            notificationStore.addLogEntry(MessageType.TIME_MIDNIGHT);
            break;
        case TimeEventType.NEW_DAY:
          // The DAWN log is usually sufficient, but we could add more specific logs if needed.
          // For example, a special "Day X has begun" message.
          break;
        case TimeEventType.LONG_PASSAGE:
            notificationStore.addLogEntry(MessageType.AMBIANCE_RANDOM, {
                text: `Il tempo scorre... ${event.context.isDay ? 'È giorno' : 'È notte'}.`
              });
            break;
      }
    }
  }
}

export const playerMovementService = new PlayerMovementService();
