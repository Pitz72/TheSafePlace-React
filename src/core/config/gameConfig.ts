/**
 * Game Configuration - Configurazioni globali del gioco
 * Caricate all'avvio e accessibili da tutti i sistemi
 */

export interface GameConfig {
  // Sistema tempo
  time: {
    realMinutesPerGameMinute: number;
    hoursPerDay: number;
    minutesPerHour: number;
  };

  // Game loop
  gameLoop: {
    targetFPS: number;
    maxFrameSkip: number;
    debug: boolean;
  };

  // Movimento
  movement: {
    baseSpeed: number;
    terrainModifiers: Record<string, number>;
  };

  // Survival
  survival: {
    hungerDecayRate: number;
    thirstDecayRate: number;
    fatigueDecayRate: number;
    baseNeedsThreshold: number;
  };

  // Inventory
  inventory: {
    maxSlots: number;
    maxWeight: number;
    weightPrecision: number;
  };

  // UI
  ui: {
    scale: number;
    fontSize: number;
    theme: 'crt' | 'modern';
  };

  // Debug
  debug: {
    enabled: boolean;
    showFPS: boolean;
    showCoordinates: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

/**
 * Configurazione di default
 */
export const defaultConfig: GameConfig = {
  time: {
    realMinutesPerGameMinute: 1,
    hoursPerDay: 24,
    minutesPerHour: 60
  },

  gameLoop: {
    targetFPS: 60,
    maxFrameSkip: 5,
    debug: false
  },

  movement: {
    baseSpeed: 1,
    terrainModifiers: {
      plains: 1.0,
      forest: 1.5,
      mountain: 2.0,
      river: 3.0,
      city: 1.2,
      village: 1.1
    }
  },

  survival: {
    hungerDecayRate: 0.1, // per minuto
    thirstDecayRate: 0.15, // per minuto
    fatigueDecayRate: 0.05, // per minuto
    baseNeedsThreshold: 20
  },

  inventory: {
    maxSlots: 20,
    maxWeight: 50,
    weightPrecision: 2
  },

  ui: {
    scale: 1,
    fontSize: 14,
    theme: 'crt'
  },

  debug: {
    enabled: false,
    showFPS: false,
    showCoordinates: false,
    logLevel: 'warn'
  }
};

/**
 * Configurazione corrente (modificabile runtime)
 */
let currentConfig: GameConfig = { ...defaultConfig };

/**
 * Carica configurazione da localStorage o usa default
 */
export function loadConfig(): GameConfig {
  try {
    const saved = localStorage.getItem('the-safe-place-config');
    if (saved) {
      const parsed = JSON.parse(saved);
      currentConfig = { ...defaultConfig, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load config from localStorage:', error);
  }

  return currentConfig;
}

/**
 * Salva configurazione su localStorage
 */
export function saveConfig(config?: Partial<GameConfig>): void {
  try {
    if (config) {
      currentConfig = { ...currentConfig, ...config };
    }
    localStorage.setItem('the-safe-place-config', JSON.stringify(currentConfig));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
}

/**
 * Ottiene configurazione corrente
 */
export function getConfig(): GameConfig {
  return { ...currentConfig };
}

/**
 * Resetta configurazione ai valori di default
 */
export function resetConfig(): void {
  currentConfig = { ...defaultConfig };
  saveConfig();
}

/**
 * Aggiorna configurazione parzialmente
 */
export function updateConfig(updates: Partial<GameConfig>): void {
  currentConfig = { ...currentConfig, ...updates };
  saveConfig();
}

// Inizializza configurazione all'import
loadConfig();