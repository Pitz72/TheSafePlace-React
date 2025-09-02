import '@testing-library/jest-dom';

// Type declarations for global test utilities
declare global {
  var createMockPlayer: () => any;
  var createMockGameState: () => any;
  var createMockInventoryItem: (overrides?: any) => any;
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16);
  }
});

// Mock cancelAnimationFrame
Object.defineProperty(window, 'cancelAnimationFrame', {
  value: (id: number) => {
    clearTimeout(id);
  }
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});

// Custom matchers for game-specific testing
expect.extend({
  toBeValidStat(received) {
    const pass = received >= 3 && received <= 18 && Number.isInteger(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid D&D stat (3-18)`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid D&D stat (3-18)`,
        pass: false,
      };
    }
  },
  
  toBeValidLevel(received) {
    const pass = received >= 1 && received <= 20 && Number.isInteger(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid character level (1-20)`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid character level (1-20)`,
        pass: false,
      };
    }
  },
  
  toBeValidHP(received) {
    const pass = received >= 0 && Number.isInteger(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be valid HP (>= 0)`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be valid HP (>= 0)`,
        pass: false,
      };
    }
  }
});

// Global test utilities
global.createMockPlayer = () => ({
  name: 'Test Hero',
  level: 1,
  experience: 0,
  stats: {
    potenza: 12,
    agilita: 14,
    vigore: 13,
    percezione: 15,
    adattamento: 11,
    carisma: 10
  },
  hp: 15,
  hunger: 100,
  thirst: 100,
  inventory: [],
  equipment: {
    weapon: null,
    armor: null,
    shield: null
  }
});

global.createMockGameState = () => ({
  currentScreen: 'main-menu',
  time: {
    day: 1,
    hour: 8
  },
  completedQuests: [],
  flags: {}
});

global.createMockInventoryItem = (overrides = {}) => ({
  id: 'test-item',
  name: 'Test Item',
  type: 'consumable',
  weight: 1,
  quantity: 1,
  description: 'A test item',
  ...overrides
});

// Console error suppression for expected errors in tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Setup cleanup
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear.mockClear();
});