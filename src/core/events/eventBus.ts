/**
 * Event Bus - Sistema di eventi centralizzato per comunicazione tra domini
 * Implementa pattern Observer per decoupling tra componenti
 */

type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Registra un listener per un evento specifico
   */
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Ritorna funzione di cleanup
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Rimuove un listener per un evento specifico
   */
  off<T = any>(event: string, callback: EventCallback<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emette un evento con dati associati
   */
  emit<T = any>(event: string, data?: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }
  }

  /**
   * Rimuove tutti i listener per un evento specifico
   */
  removeAllListeners(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Rimuove tutti i listener
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Ottiene il numero di listener per un evento
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Ottiene tutti gli eventi registrati
   */
  events(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Export types
export type { EventCallback };