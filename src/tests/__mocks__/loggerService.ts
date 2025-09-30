/**
 * Mock del logger service per Jest
 * Evita problemi con import.meta.env
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'CRAFTING' | 'NARRATIVE' | 'WORLD' | 'EVENTS' | 'PERFORMANCE' | 'GENERAL';

interface LogContext {
  [key: string]: any;
}

class MockLogger {
  private category: LogCategory;

  constructor(category: LogCategory) {
    this.category = category;
  }

  debug(message: string, context?: LogContext): void {
    // Silent in tests
  }

  info(message: string, context?: LogContext): void {
    // Silent in tests
  }

  warn(message: string, context?: LogContext): void {
    console.warn(`[${this.category}] ${message}`, context);
  }

  error(message: string, context?: LogContext): void {
    console.error(`[${this.category}] ${message}`, context);
  }
}

export const createLogger = (category: LogCategory): MockLogger => {
  return new MockLogger(category);
};

export const setLogLevel = (level: LogLevel): void => {
  // No-op in tests
};

export const isLoggingEnabled = (category: LogCategory, level: LogLevel): boolean => {
  return level === 'warn' || level === 'error';
};

export const enableLoggingCategory = (category: LogCategory): void => {
  // No-op in tests
};

export const disableLoggingCategory = (category: LogCategory): void => {
  // No-op in tests
};

export const loggerService = {
  createLogger,
  setLogLevel,
  isLoggingEnabled
};

export const logger = createLogger('GENERAL');