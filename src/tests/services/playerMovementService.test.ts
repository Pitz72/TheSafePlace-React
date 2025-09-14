import { jest } from '@jest/globals';
import { playerMovementService } from '../../services/playerMovementService';
import { useWeatherStore } from '../../stores/weather/weatherStore';
import { useCharacterStore } from '../../stores/character/characterStore';
import { useSurvivalStore } from '../../stores/survival/survivalStore';
import { useEventStore } from '../../stores/events/eventStore';
import { useWorldStore } from '../../stores/world/worldStore';
import { useNotificationStore } from '../../stores/notifications/notificationStore';
import { timeService, TimeEventType } from '../../services/timeService';

// Mock all the stores and services
jest.mock('../../stores/weather/weatherStore');
jest.mock('../../stores/character/characterStore');
jest.mock('../../stores/survival/survivalStore');
jest.mock('../../stores/events/eventStore');
jest.mock('../../stores/world/worldStore');
jest.mock('../../stores/notifications/notificationStore');
jest.mock('../../services/timeService');

describe('PlayerMovementService Refactored', () => {
  // Mock store actions
  const mockUpdateWeather = jest.fn();
  const mockGetWeatherEffects = jest.fn().mockReturnValue({ survivalModifier: 1.0, movementModifier: 1.0, eventProbabilityModifier: 1.0 });
  const mockGetWeatherDescription = jest.fn().mockReturnValue('sereno');
  const mockGainMovementXP = jest.fn();
  const mockApplyMovementSurvivalCost = jest.fn();
  const mockHandleNightConsumption = jest.fn();
  const mockCheckForRandomEvent = jest.fn();
  const mockSetTimeState = jest.fn();
  const mockAddLogEntry = jest.fn();

  // Mock timeService
  const mockCalculateNewTime = jest.fn();

  const initialTimeState = { currentTime: 600, day: 1, isDay: true };

  beforeEach(() => {
    jest.clearAllMocks();

    (useWeatherStore.getState as jest.Mock).mockReturnValue({
      updateWeather: mockUpdateWeather,
      getWeatherEffects: mockGetWeatherEffects,
      getWeatherDescription: mockGetWeatherDescription,
      currentWeather: 'SUNNY',
    });
    (useCharacterStore.getState as jest.Mock).mockReturnValue({
      gainMovementXP: mockGainMovementXP,
    });
    (useSurvivalStore.getState as jest.Mock).mockReturnValue({
      applyMovementSurvivalCost: mockApplyMovementSurvivalCost,
      handleNightConsumption: mockHandleNightConsumption,
    });
    (useEventStore.getState as jest.Mock).mockReturnValue({
      checkForRandomEvent: mockCheckForRandomEvent,
    });
    (useWorldStore.getState as jest.Mock).mockReturnValue({
      setTimeState: mockSetTimeState,
      timeState: initialTimeState,
    });
    (useNotificationStore.getState as jest.Mock).mockReturnValue({
      addLogEntry: mockAddLogEntry,
    });

    // Mock the timeService implementation
    (timeService.calculateNewTime as jest.Mock).mockImplementation((state, minutes) => ({
      newTimeState: { ...state, currentTime: state.currentTime + minutes },
      events: [], // Default to no events
    }));
  });

  test('should orchestrate all effects correctly in order', () => {
    const biomeKey = 'FOREST';

    playerMovementService.handleMovementEffects(biomeKey);

    // Assertions
    expect(mockApplyMovementSurvivalCost).toHaveBeenCalledTimes(1);
    expect(timeService.calculateNewTime).toHaveBeenCalledTimes(1);
    expect(timeService.calculateNewTime).toHaveBeenCalledWith(initialTimeState, 10);
    expect(mockSetTimeState).toHaveBeenCalledTimes(1);
    expect(mockSetTimeState).toHaveBeenCalledWith({ ...initialTimeState, currentTime: 610 });
  });

  test('should fix the double-consumption bug by handling DUSK event correctly', () => {
    const biomeKey = 'PLAINS';
    const duskEvent = { type: TimeEventType.DUSK };

    // Arrange: Make timeService return a DUSK event
    (timeService.calculateNewTime as jest.Mock).mockReturnValue({
      newTimeState: { currentTime: 1210, day: 1, isDay: false },
      events: [duskEvent],
    });

    // Action
    playerMovementService.handleMovementEffects(biomeKey);

    // Assert
    // Both survival costs should be called exactly once.
    expect(mockApplyMovementSurvivalCost).toHaveBeenCalledTimes(1);
    expect(mockHandleNightConsumption).toHaveBeenCalledTimes(1);

    // Verify logging
    expect(mockAddLogEntry).toHaveBeenCalledWith("TIME_DUSK");
  });
});
