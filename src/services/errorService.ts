import { ErrorType, ErrorSeverity, type GameError, generateErrorId } from '@/utils/errorHandler';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { MessageType } from '@/data/MessageArchive';

// Tipi di errore specifici per il gioco
export enum GameErrorCategory {
  SAVE_LOAD = 'save_load',
  CRAFTING = 'crafting',
  COMBAT = 'combat',
  INVENTORY = 'inventory',
  SURVIVAL = 'survival',
  NARRATIVE = 'narrative',
  TIME_SYSTEM = 'time_system',
  WORLD_STATE = 'world_state',
  INITIALIZATION = 'initialization',
  GAME_LOGIC = 'game_logic',
  // Legacy enum members for backward compatibility
  WORLD = 'world',
  WEATHER = 'weather',
  TIME = 'time'
}

// Configurazione retry per diversi tipi di errore
interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
}

const RETRY_CONFIGS: Record<GameErrorCategory, RetryConfig> = {
  [GameErrorCategory.SAVE_LOAD]: { maxAttempts: 3, delay: 1000, backoffMultiplier: 2 },
  [GameErrorCategory.CRAFTING]: { maxAttempts: 2, delay: 500, backoffMultiplier: 1.5 },
  [GameErrorCategory.COMBAT]: { maxAttempts: 1, delay: 0, backoffMultiplier: 1 },
  [GameErrorCategory.INVENTORY]: { maxAttempts: 2, delay: 300, backoffMultiplier: 1.2 },
  [GameErrorCategory.SURVIVAL]: { maxAttempts: 2, delay: 500, backoffMultiplier: 1.5 },
  [GameErrorCategory.NARRATIVE]: { maxAttempts: 1, delay: 0, backoffMultiplier: 1 },
  [GameErrorCategory.TIME_SYSTEM]: { maxAttempts: 3, delay: 200, backoffMultiplier: 1.1 },
  [GameErrorCategory.WORLD_STATE]: { maxAttempts: 2, delay: 800, backoffMultiplier: 1.8 },
  [GameErrorCategory.INITIALIZATION]: { maxAttempts: 3, delay: 500, backoffMultiplier: 1.5 },
  [GameErrorCategory.GAME_LOGIC]: { maxAttempts: 2, delay: 300, backoffMultiplier: 1.3 },
  // Legacy enum members
  [GameErrorCategory.WORLD]: { maxAttempts: 2, delay: 800, backoffMultiplier: 1.8 },
  [GameErrorCategory.WEATHER]: { maxAttempts: 2, delay: 500, backoffMultiplier: 1.5 },
  [GameErrorCategory.TIME]: { maxAttempts: 3, delay: 200, backoffMultiplier: 1.1 }
};

// Messaggi user-friendly per categoria di errore
const ERROR_MESSAGES: Record<GameErrorCategory, { title: string; message: string; fallback: string }> = {
  [GameErrorCategory.SAVE_LOAD]: {
    title: 'Errore Salvataggio',
    message: 'Problema durante il salvataggio/caricamento. Riprovo automaticamente...',
    fallback: 'Usa il backup automatico dal menu opzioni.'
  },
  [GameErrorCategory.CRAFTING]: {
    title: 'Errore Crafting',
    message: 'Problema durante la creazione dell\'oggetto. Controlla i materiali...',
    fallback: 'Verifica di avere tutti i materiali necessari.'
  },
  [GameErrorCategory.COMBAT]: {
    title: 'Errore Combattimento',
    message: 'Problema durante il combattimento. Il sistema si sta ripristinando...',
    fallback: 'Il combattimento è stato annullato per sicurezza.'
  },
  [GameErrorCategory.INVENTORY]: {
    title: 'Errore Inventario',
    message: 'Problema con l\'inventario. Sincronizzazione in corso...',
    fallback: 'L\'inventario è stato ripristinato all\'ultimo stato valido.'
  },
  [GameErrorCategory.SURVIVAL]: {
    title: 'Errore Sistema Sopravvivenza',
    message: 'Problema con fame/sete/salute. Ripristino automatico...',
    fallback: 'I valori di sopravvivenza sono stati stabilizzati.'
  },
  [GameErrorCategory.NARRATIVE]: {
    title: 'Errore Storia',
    message: 'Problema con l\'evento narrativo. Caricamento alternativo...',
    fallback: 'L\'evento è stato saltato per continuare la storia.'
  },
  [GameErrorCategory.TIME_SYSTEM]: {
    title: 'Errore Tempo',
    message: 'Problema con il sistema temporale. Sincronizzazione...',
    fallback: 'Il tempo è stato sincronizzato con l\'ultimo valore valido.'
  },
  [GameErrorCategory.WORLD_STATE]: {
    title: 'Errore Mondo',
    message: 'Problema con lo stato del mondo. Ripristino in corso...',
    fallback: 'Il mondo è stato ripristinato all\'ultimo stato stabile.'
  },
  [GameErrorCategory.INITIALIZATION]: {
    title: 'Errore Inizializzazione',
    message: 'Problema durante l\'inizializzazione del gioco. Ripristino in corso...',
    fallback: 'Il gioco è stato inizializzato con valori predefiniti.'
  },
  [GameErrorCategory.GAME_LOGIC]: {
    title: 'Errore Logica di Gioco',
    message: 'Problema con la logica di gioco. Ripristino automatico...',
    fallback: 'La logica di gioco è stata ripristinata allo stato precedente.'
  },
  // Legacy enum members
  [GameErrorCategory.WORLD]: {
    title: 'Errore Mondo',
    message: 'Problema con lo stato del mondo. Ripristino in corso...',
    fallback: 'Il mondo è stato ripristinato all\'ultimo stato stabile.'
  },
  [GameErrorCategory.WEATHER]: {
    title: 'Errore Meteo',
    message: 'Problema con il sistema meteorologico. Ripristino in corso...',
    fallback: 'Il meteo è stato ripristinato a condizioni normali.'
  },
  [GameErrorCategory.TIME]: {
    title: 'Errore Tempo',
    message: 'Problema con il sistema temporale. Sincronizzazione...',
    fallback: 'Il tempo è stato sincronizzato con l\'ultimo valore valido.'
  }
};

// Interfaccia per operazioni con retry
interface RetryableOperation<T> {
  operation: () => T | Promise<T>;
  category: GameErrorCategory;
  context?: Record<string, any>;
  onSuccess?: (result: T) => void;
  onFailure?: (error: Error) => void;
  onFallback?: () => T | Promise<T>;
}

class ErrorService {
  private retryAttempts: Map<string, number> = new Map();
  private errorHistory: GameError[] = [];
  private maxHistorySize = 100;

  /**
   * Gestisce un errore con categorizzazione automatica e notifiche user-friendly
   */
  handleError(error: Error, category: GameErrorCategory, context?: Record<string, any>): GameError {
    const gameError: GameError = {
      id: generateErrorId(),
      type: this.mapCategoryToType(category),
      severity: this.determineSeverity(error, category),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context: {
        category,
        ...context
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Aggiungi alla cronologia
    this.addToHistory(gameError);

    // Log strutturato
    this.logError(gameError);

    // Notifica user-friendly
    this.createUserNotification(gameError, category);

    // Log nel sistema di messaggi del gioco
    this.addGameLogEntry(gameError, category);

    return gameError;
  }

  /**
   * Esegue un'operazione con retry automatico e fallback
   */
  async executeWithRetry<T>(config: RetryableOperation<T>): Promise<T> {
    const { operation, category, context, onSuccess, onFailure, onFallback } = config;
    const retryConfig = RETRY_CONFIGS[category];
    const operationId = `${category}_${Date.now()}`;
    
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        // Handle both sync and async operations
        const result = await Promise.resolve(operation());
        
        // Reset retry counter on success
        this.retryAttempts.delete(operationId);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        this.retryAttempts.set(operationId, attempt);

        // Log attempt
        console.warn(`Tentativo ${attempt}/${retryConfig.maxAttempts} fallito per ${category}:`, error);

        // Se non è l'ultimo tentativo, aspetta prima di riprovare
        if (attempt < retryConfig.maxAttempts) {
          const delay = retryConfig.delay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    // Tutti i tentativi falliti
    const gameError = this.handleError(lastError!, category, {
      ...context,
      retryAttempts: retryConfig.maxAttempts,
      operationId
    });

    if (onFailure) {
      onFailure(lastError!);
    }

    // Prova il fallback se disponibile
    if (onFallback) {
      try {
        const fallbackResult = await Promise.resolve(onFallback());
        
        // Notifica che è stato usato il fallback
        const notificationStore = useNotificationStore.getState();
        const errorMsg = ERROR_MESSAGES[category];
        notificationStore.addNotification({ 
        type: 'warning', 
        message: `${errorMsg.title}: ${errorMsg.fallback}`, 
        duration: 4000 
      });
        
        return fallbackResult;
      } catch (fallbackError) {
        this.handleError(fallbackError as Error, category, {
          ...context,
          isFallback: true,
          originalError: lastError!.message
        });
      }
    }

    // Se anche il fallback fallisce, rilancia l'errore originale
    throw lastError;
  }

  /**
   * Crea valori di default sicuri per diversi tipi di dati
   */
  createSafeDefaults(category: GameErrorCategory): any {
    switch (category) {
      case GameErrorCategory.SAVE_LOAD:
        return { success: false, data: null };
      
      case GameErrorCategory.CRAFTING:
        return { success: false, item: null, materialsConsumed: false };
      
      case GameErrorCategory.COMBAT:
        return { damage: 0, success: false, combatEnded: true };
      
      case GameErrorCategory.INVENTORY:
        return { items: [], capacity: 20 };
      
      case GameErrorCategory.SURVIVAL:
        return { hunger: 50, thirst: 50, health: 50 };
      
      case GameErrorCategory.NARRATIVE:
        return { eventId: 'safe_default', choices: [] };
      
      case GameErrorCategory.TIME_SYSTEM:
      case GameErrorCategory.TIME:
        return { currentTime: 480, day: 1, isNight: false };
      
      case GameErrorCategory.WORLD_STATE:
      case GameErrorCategory.WORLD:
        return { playerPosition: { x: 0, y: 0 }, currentBiome: 'plains' };
      
      case GameErrorCategory.WEATHER:
        return { currentWeather: 'clear', intensity: 50, effects: {} };
      
      case GameErrorCategory.INITIALIZATION:
        return { initialized: false, stores: [], errors: [] };
      
      default:
        return null;
    }
  }

  /**
   * Ottiene statistiche sugli errori
   */
  getErrorStats(): { total: number; byCategory: Record<string, number>; bySeverity: Record<string, number> } {
    const stats = {
      total: this.errorHistory.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    };

    this.errorHistory.forEach(error => {
      const category = error.context?.category || 'unknown';
      const severity = error.severity;

      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Pulisce la cronologia degli errori
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.retryAttempts.clear();
  }

  // Metodi privati

  private mapCategoryToType(category: GameErrorCategory): ErrorType {
    switch (category) {
      case GameErrorCategory.SAVE_LOAD:
        return ErrorType.SAVE_SYSTEM;
      case GameErrorCategory.CRAFTING:
      case GameErrorCategory.COMBAT:
      case GameErrorCategory.INVENTORY:
      case GameErrorCategory.SURVIVAL:
      case GameErrorCategory.NARRATIVE:
      case GameErrorCategory.TIME_SYSTEM:
      case GameErrorCategory.TIME:
      case GameErrorCategory.WORLD_STATE:
      case GameErrorCategory.WORLD:
      case GameErrorCategory.WEATHER:
        return ErrorType.GAME_LOGIC;
      default:
        return ErrorType.RUNTIME;
    }
  }

  private determineSeverity(error: Error, category: GameErrorCategory): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    // Errori critici per categoria
    if (category === GameErrorCategory.SAVE_LOAD && message.includes('corrupt')) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (category === GameErrorCategory.COMBAT && message.includes('infinite')) {
      return ErrorSeverity.HIGH;
    }

    // Severità basata su parole chiave
    if (message.includes('critical') || message.includes('fatal') || message.includes('corrupt')) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (message.includes('data') || message.includes('save') || message.includes('state')) {
      return ErrorSeverity.HIGH;
    }
    
    if (message.includes('ui') || message.includes('display') || message.includes('render')) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private addToHistory(gameError: GameError): void {
    this.errorHistory.push(gameError);
    
    // Mantieni solo gli ultimi errori
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  private logError(gameError: GameError): void {
    const emoji = this.getSeverityEmoji(gameError.severity);
    
    console.group(`${emoji} Game Error [${gameError.severity}] - ${gameError.context?.category}`);
    console.error('ID:', gameError.id);
    console.error('Tipo:', gameError.type);
    console.error('Messaggio:', gameError.message);
    console.error('Stack:', gameError.stack);
    console.error('Contesto:', gameError.context);
    console.error('Timestamp:', new Date(gameError.timestamp).toISOString());
    console.groupEnd();
  }

  private createUserNotification(gameError: GameError, category: GameErrorCategory): void {
    const notificationStore = useNotificationStore.getState();
    const errorMsg = ERROR_MESSAGES[category];
    
    const notificationType = this.mapSeverityToNotificationType(gameError.severity);
    const duration = this.getNotificationDuration(gameError.severity);
    
    notificationStore.addNotification({ 
      type: notificationType, 
      message: errorMsg.message, 
      duration: duration 
    });
  }

  private addGameLogEntry(gameError: GameError, category: GameErrorCategory): void {
    const notificationStore = useNotificationStore.getState();
    const errorMsg = ERROR_MESSAGES[category];
    
    notificationStore.addLogEntry(MessageType.SYSTEM_ERROR, {
      errorId: gameError.id,
      category,
      message: errorMsg.title,
      severity: gameError.severity
    });
  }

  private getSeverityEmoji(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return '🔥';
      case ErrorSeverity.HIGH: return '🚨';
      case ErrorSeverity.MEDIUM: return '⚠️';
      case ErrorSeverity.LOW: return '⚡';
      default: return '❓';
    }
  }

  private mapSeverityToNotificationType(severity: ErrorSeverity): 'info' | 'warning' | 'error' | 'success' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'warning';
    }
  }

  private getNotificationDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return 8000;
      case ErrorSeverity.HIGH: return 6000;
      case ErrorSeverity.MEDIUM: return 4000;
      case ErrorSeverity.LOW: return 3000;
      default: return 4000;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const errorService = new ErrorService();

// Utility functions per uso facile negli store
export const handleStoreError = (error: Error, category: GameErrorCategory, context?: Record<string, any>) => {
  return errorService.handleError(error, category, context);
};

export const executeWithRetry = <T>(config: RetryableOperation<T>) => {
  return errorService.executeWithRetry(config);
};

export const createSafeDefaults = (category: GameErrorCategory) => {
  return errorService.createSafeDefaults(category);
};

// Export types
export type { RetryableOperation };