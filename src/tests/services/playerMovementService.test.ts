import { jest } from '@jest/globals';
import { playerMovementService } from '../../services/playerMovementService';
import { useWeatherStore } from '../../stores/weather/weatherStore';
import { useCharacterStore } from '../../stores/character/characterStore';
import { useSurvivalStore } from '../../stores/survival/survivalStore';
import { useEventStore } from '../../stores/events/eventStore';
import { useWorldStore } from '../../stores/world/worldStore';
import { useNotificationStore } from '../../stores/notifications/notificationStore';

// Mock all the stores
jest.mock('../../stores/weather/weatherStore');
jest.mock('../../stores/character/characterStore');
jest.mock('../../stores/survival/survivalStore');
jest.mock('../../stores/events/eventStore');
jest.mock('../../stores/world/worldStore');
jest.mock('../../stores/notifications/notificationStore');

describe('PlayerMovementService', () => {
  // Create mock instances of the stores' actions
  const mockUpdateWeather = jest.fn();
  const mockGetWeatherEffects = jest.fn().mockReturnValue({ survivalModifier: 1.0, movementModifier: 1.0, eventProbabilityModifier: 1.0 });
  const mockGetWeatherDescription = jest.fn().mockReturnValue('sereno');
  const mockGainMovementXP = jest.fn();
  const mockApplyMovementSurvivalCost = jest.fn();
  const mockCheckForRandomEvent = jest.fn();
  const mockAdvanceTime = jest.fn();
  const mockAddLogEntry = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up the mock implementations for getState()
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
    });
    (useEventStore.getState as jest.Mock).mockReturnValue({
      checkForRandomEvent: mockCheckForRandomEvent,
    });
    (useWorldStore.getState as jest.Mock).mockReturnValue({
      advanceTime: mockAdvanceTime,
    });
    (useNotificationStore.getState as jest.Mock).mockReturnValue({
      addLogEntry: mockAddLogEntry,
    });
  });

  test('should call all relevant store actions when handling movement effects', () => {
    const biomeKey = 'FOREST';

    // Action
    playerMovementService.handleMovementEffects(biomeKey);

    // Assertions
    expect(mockUpdateWeather).toHaveBeenCalledTimes(1);
    expect(mockGainMovementXP).toHaveBeenCalledTimes(1);
    expect(mockApplyMovementSurvivalCost).toHaveBeenCalledTimes(1);
    expect(mockApplyMovementSurvivalCost).toHaveBeenCalledWith(expect.any(Object)); // We can be more specific if needed
    expect(mockCheckForRandomEvent).toHaveBeenCalledTimes(1);
    expect(mockCheckForRandomEvent).toHaveBeenCalledWith(biomeKey, expect.any(Object));
    expect(mockAdvanceTime).toHaveBeenCalledTimes(1);
    expect(mockAdvanceTime).toHaveBeenCalledWith(10); // 10 is the base time with a modifier of 1.0
  });
});
