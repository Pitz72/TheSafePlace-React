import { FEATURE_FLAGS } from '../config/featureFlags';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'CRAFTING' | 'NARRATIVE' | 'WORLD' | 'EVENTS' | 'PERFORMANCE' | 'GENERAL';

interface LogContext {
  [key: string]: any;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enabledCategories: Set<LogCategory>;
  isProduction: boolean;
}

class Logger {
  private category: LogCategory;
  private config: LoggerConfig;

  constructor(category: LogCategory, config: LoggerConfig) {
    this.category = category;
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    // Check if logging is enabled for this category
    if (!this.config.enabledCategories.has(this.category)) {
      return false;
    }

    // Check minimum log level
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    
    if (currentLevelIndex < minLevelIndex) {
      return false;
    }

    // In production, only allow warn and error unless explicitly enabled
    if (this.config.isProduction && (level === 'debug' || level === 'info')) {
      return this.isDebugLoggingEnabled();
    }

    return true;
  }

  private isDebugLoggingEnabled(): boolean {
    try {
      // Check master debug flag
      if (!FEATURE_FLAGS.DEBUG_LOGGING_ENABLED) {
        return false;
      }

      // Check category-specific flags
      switch (this.category) {
        case 'CRAFTING':
          return FEATURE_FLAGS.CRAFTING_DEBUG_LOGS || false;
        case 'NARRATIVE':
          return FEATURE_FLAGS.NARRATIVE_DEBUG_LOGS || false;
        case 'WORLD':
          return FEATURE_FLAGS.WORLD_DEBUG_LOGS || false;
        case 'EVENTS':
          return FEATURE_FLAGS.EVENT_DEBUG_LOGS || false;
        case 'PERFORMANCE':
          return FEATURE_FLAGS.PERFORMANCE_DEBUG_LOGS || false;
        default:
          return FEATURE_FLAGS.DEBUG_LOGGING_ENABLED;
      }
    } catch (error) {
      // Fallback if feature flags are not available
      return !this.config.isProduction;
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.category}]`;
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} | Context: ${JSON.stringify(context)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }
}

class LoggerService {
  private config: LoggerConfig;
  private loggers: Map<LogCategory, Logger> = new Map();

  constructor() {
    this.config = {
      minLevel: this.getEnvironmentLogLevel(),
      enabledCategories: new Set(['CRAFTING', 'NARRATIVE', 'WORLD', 'EVENTS', 'PERFORMANCE', 'GENERAL']),
      isProduction: import.meta.env.PROD
    };
  }

  private getEnvironmentLogLevel(): LogLevel {
    const envLevel = import.meta.env.VITE_LOG_LEVEL?.toLowerCase() as LogLevel;
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    
    if (envLevel && validLevels.includes(envLevel)) {
      return envLevel;
    }

    // Default based on environment
    return import.meta.env.PROD ? 'warn' : 'debug';
  }

  createLogger(category: LogCategory): Logger {
    if (!this.loggers.has(category)) {
      this.loggers.set(category, new Logger(category, this.config));
    }
    return this.loggers.get(category)!;
  }

  setLogLevel(level: LogLevel): void {
    this.config.minLevel = level;
    // Update existing loggers
    this.loggers.clear();
  }

  enableCategory(category: LogCategory): void {
    this.config.enabledCategories.add(category);
  }

  disableCategory(category: LogCategory): void {
    this.config.enabledCategories.delete(category);
  }

  isLoggingEnabled(category: LogCategory, level: LogLevel): boolean {
    const logger = this.createLogger(category);
    return (logger as any).shouldLog(level);
  }

  getConfig(): Readonly<LoggerConfig> {
    return { ...this.config };
  }
}

// Singleton instance
const loggerService = new LoggerService();

// Export the main functions
export const createLogger = (category: LogCategory): Logger => {
  return loggerService.createLogger(category);
};

export const setLogLevel = (level: LogLevel): void => {
  loggerService.setLogLevel(level);
};

export const isLoggingEnabled = (category: LogCategory, level: LogLevel): boolean => {
  return loggerService.isLoggingEnabled(category, level);
};

export const enableLoggingCategory = (category: LogCategory): void => {
  loggerService.enableCategory(category);
};

export const disableLoggingCategory = (category: LogCategory): void => {
  loggerService.disableCategory(category);
};

// Export the service instance for advanced usage
export { loggerService };

// Default logger for general use
export const logger = createLogger('GENERAL');