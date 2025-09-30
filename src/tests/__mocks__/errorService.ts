/**
 * Mock per errorService utilizzato nei test
 */

// Replica della struttura RETRY_CONFIGS dal vero errorService
const RETRY_CONFIGS = {
  'save_load': { maxAttempts: 3, delay: 1000, backoffMultiplier: 2 },
  'crafting': { maxAttempts: 2, delay: 500, backoffMultiplier: 1.5 },
  'combat': { maxAttempts: 1, delay: 0, backoffMultiplier: 1 },
  'inventory': { maxAttempts: 2, delay: 300, backoffMultiplier: 1.2 },
  'survival': { maxAttempts: 2, delay: 500, backoffMultiplier: 1.5 },
  'narrative': { maxAttempts: 1, delay: 0, backoffMultiplier: 1 },
  'time_system': { maxAttempts: 3, delay: 200, backoffMultiplier: 1.1 },
  'world_state': { maxAttempts: 2, delay: 800, backoffMultiplier: 1.8 },
  'world': { maxAttempts: 2, delay: 800, backoffMultiplier: 1.8 },
  'weather': { maxAttempts: 2, delay: 500, backoffMultiplier: 1.5 },
  'time': { maxAttempts: 3, delay: 200, backoffMultiplier: 1.1 }
};

export const executeWithRetry = jest.fn(async (config: any) => {
  try {
    return await Promise.resolve(config.operation());
  } catch (error) {
    if (config.onFallback) {
      return await Promise.resolve(config.onFallback());
    }
    throw error;
  }
});

export const handleStoreError = jest.fn((error: any, category: any, context: any) => ({
  id: 'test-error-id',
  type: 'runtime',
  severity: 'low',
  message: error.message,
  timestamp: Date.now(),
  context: { category, ...context }
}));

export const GameErrorCategory = {
  INVENTORY: 'inventory',
  WORLD: 'world',
  SURVIVAL: 'survival',
  CRAFTING: 'crafting',
  COMBAT: 'combat',
  SAVE_LOAD: 'save_load',
  NARRATIVE: 'narrative',
  TIME_SYSTEM: 'time_system',
  WORLD_STATE: 'world_state',
  WEATHER: 'weather',
  TIME: 'time'
};

export { RETRY_CONFIGS };

// Mock della classe ErrorService
export class ErrorService {
  static async executeWithRetry(config: any) {
    return executeWithRetry(config);
  }

  static handleStoreError(error: any, category: any, context: any) {
    return handleStoreError(error, category, context);
  }
}