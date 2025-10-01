import type { PlayerMovementService as PlayerMovementServiceType } from '../../services/playerMovementService';
import { WeatherEffects } from '../../stores/weather/weatherStore';
import { MessageType } from '../../data/MessageArchive';

describe('PlayerMovementService', () => {
  let playerMovementService: PlayerMovementServiceType;

  // --- Mocks for store methods and external functions ---
  let mockUpdateWeather: jest.Mock;
  let mockGetWeatherEffects: jest.Mock<() => WeatherEffects>;
  let mockGainMovementXP: jest.Mock;
  let mockApplyMovementSurvivalCost: jest.Mock;
  let mockCheckForRandomEvent: jest.Mock;
  let mockAdvanceTime: jest.Mock;
  let mockAddLogEntry: jest.Mock;
  let mockGetWeatherDescription: jest.Mock;
  let mockIncrementProgress: jest.Mock;
  let mockCheckPeriodicTriggers: jest.Mock;
  let mockOnSafePlaceReached: jest.Mock;

  // --- Mocks for Zustand getState functions ---
  let mockWorldGetState: jest.Mock;

  beforeEach(() => {
    // Reset modules to ensure we get a fresh instance of the service singleton
    // and can apply new mocks for each test.
    jest.resetModules();

    // --- Initialize all mock functions ---
    mockUpdateWeather = jest.fn();
    mockGetWeatherEffects = jest.fn().mockReturnValue({
      survivalModifier: 1.0,
      movementModifier: 1.0,
      eventProbabilityModifier: 1.0,
    });
    mockGainMovementXP = jest.fn();
    mockApplyMovementSurvivalCost = jest.fn();
    mockCheckForRandomEvent = jest.fn();
    mockAdvanceTime = jest.fn();
    mockAddLogEntry = jest.fn();
    mockGetWeatherDescription = jest.fn().mockReturnValue('sereno');
    mockIncrementProgress = jest.fn();
    mockCheckPeriodicTriggers = jest.fn();
    mockOnSafePlaceReached = jest.fn();

    // --- Initialize getState mocks ---
    // We only need to mock the ones whose state we want to change between tests.
    mockWorldGetState = jest.fn().mockReturnValue({
      mapData: [['P']],
      playerPosition: { x: 0, y: 0 },
    });

    // Use jest.doMock to set up mocks BEFORE the service is required.
    // This is the correct way to handle module-level singletons.
    jest.doMock('../../stores/weather/weatherStore', () => ({
      useWeatherStore: {
        getState: () => ({
          updateWeather: mockUpdateWeather,
          getWeatherEffects: mockGetWeatherEffects,
          getWeatherDescription: mockGetWeatherDescription,
          currentWeather: 'SUNNY',
        }),
      },
    }));

    jest.doMock('../../stores/character/characterStore', () => ({
      useCharacterStore: {
        getState: () => ({
          gainMovementXP: mockGainMovementXP,
        }),
      },
    }));

    jest.doMock('../../stores/survival/survivalStore', () => ({
      useSurvivalStore: {
        getState: () => ({
          applyMovementSurvivalCost: mockApplyMovementSurvivalCost,
        }),
      },
    }));

    jest.doMock('../../stores/events/eventStore', () => ({
      useEventStore: {
        getState: () => ({
          checkForRandomEvent: mockCheckForRandomEvent,
        }),
      },
    }));

    jest.doMock('../../stores/world/worldStore', () => ({
      useWorldStore: {
        getState: mockWorldGetState, // Use the mock function here
      },
    }));

    jest.doMock('../../stores/time/timeStore', () => ({
      useTimeStore: {
        getState: () => ({
          advanceTime: mockAdvanceTime,
        }),
      },
    }));

    jest.doMock('../../stores/notifications/notificationStore', () => ({
      useNotificationStore: {
        getState: () => ({
          addLogEntry: mockAddLogEntry,
        }),
      },
    }));

    jest.doMock('../../services/mainQuestTrigger', () => ({
      mainQuestTrigger: {
        incrementProgress: mockIncrementProgress,
        checkPeriodicTriggers: mockCheckPeriodicTriggers,
        onSafePlaceReached: mockOnSafePlaceReached,
      },
    }));

    // Dynamically require the service to get a fresh instance with all mocks applied.
    playerMovementService = require('../../services/playerMovementService').playerMovementService;
  });

  it('should call all relevant store actions when handling movement effects', () => {
    const biomeKey = 'FOREST';
    const weatherEffects = { survivalModifier: 1.0, movementModifier: 1.0, eventProbabilityModifier: 1.0 };
    mockGetWeatherEffects.mockReturnValue(weatherEffects);

    // Action
    playerMovementService.handleMovementEffects(biomeKey);

    // Assertions
    expect(mockUpdateWeather).toHaveBeenCalledTimes(1);
    expect(mockGetWeatherEffects).toHaveBeenCalledTimes(1);
    expect(mockGainMovementXP).toHaveBeenCalledTimes(1);
    expect(mockApplyMovementSurvivalCost).toHaveBeenCalledTimes(1);
    expect(mockApplyMovementSurvivalCost).toHaveBeenCalledWith(weatherEffects);
    expect(mockCheckForRandomEvent).toHaveBeenCalledTimes(1);
    expect(mockCheckForRandomEvent).toHaveBeenCalledWith(biomeKey, weatherEffects);
    expect(mockAdvanceTime).toHaveBeenCalledTimes(1);
    expect(mockAdvanceTime).toHaveBeenCalledWith(10); // Base movement time
    expect(mockIncrementProgress).toHaveBeenCalledTimes(1);
    expect(mockCheckPeriodicTriggers).toHaveBeenCalledTimes(1);
    expect(mockOnSafePlaceReached).not.toHaveBeenCalled();
    expect(mockAddLogEntry).not.toHaveBeenCalled();
  });

  it('should adjust movement time based on weather effects', () => {
    const biomeKey = 'RIVER';
    const weatherEffects = { survivalModifier: 1.0, movementModifier: 0.5, eventProbabilityModifier: 1.0 }; // Slower movement
    mockGetWeatherEffects.mockReturnValue(weatherEffects);

    // Action
    playerMovementService.handleMovementEffects(biomeKey);

    // Assertions
    expect(mockAdvanceTime).toHaveBeenCalledTimes(1);
    expect(mockAdvanceTime).toHaveBeenCalledWith(20); // 10 / 0.5 = 20
    expect(mockAddLogEntry).toHaveBeenCalledTimes(1);
    expect(mockAddLogEntry).toHaveBeenCalledWith(MessageType.AMBIANCE_RANDOM, expect.objectContaining({
      text: 'Il sereno rallenta il tuo movimento (+10 min).',
    }));
  });

  it('should trigger onSafePlaceReached when player is at the safe place tile', () => {
    const biomeKey = 'PLAINS';

    // Override the world store's state just for this test
    mockWorldGetState.mockReturnValue({
      mapData: [[ 'P', 'P' ], [ 'P', 'S' ]], // Map with a Safe Place tile
      playerPosition: { x: 1, y: 1 }, // Player is on the Safe Place tile
    });

    // Action
    playerMovementService.handleMovementEffects(biomeKey);

    // Assertions
    expect(mockOnSafePlaceReached).toHaveBeenCalledTimes(1);
  });
});