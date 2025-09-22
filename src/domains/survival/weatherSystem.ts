/**
 * Weather System - Sistema meteo dinamico
 * Gestisce condizioni atmosferiche e loro impatto sul gameplay
 */

import type { EnvironmentalConditions } from './survivalState';
import { eventBus } from '../../core/events/eventBus';

export interface WeatherPattern {
  id: string;
  name: string;
  description: string;
  baseConditions: EnvironmentalConditions;
  duration: {
    min: number; // minuti
    max: number; // minuti
  };
  transitions: {
    to: string;
    probability: number;
  }[];
  effects: {
    visibility: number; // 0-100% (100 = perfetta visibilità)
    movementPenalty: number; // moltiplicatore velocità
    encounterRate: number; // moltiplicatore incontri
    resourceAvailability: number; // moltiplicatore risorse
  };
}

export interface WeatherState {
  currentPattern: WeatherPattern;
  timeRemaining: number; // minuti rimasti per questo pattern
  intensity: number; // 0-100 (intensità del fenomeno)
  isTransitioning: boolean;
}

export const weatherPatterns: Record<string, WeatherPattern> = {
  clear: {
    id: 'clear',
    name: 'Sereno',
    description: 'Cielo terso, condizioni ideali',
    baseConditions: {
      temperature: 20,
      humidity: 40,
      precipitation: 0,
      windSpeed: 5,
      precipitationType: 'none'
    },
    duration: { min: 120, max: 480 }, // 2-8 ore
    transitions: [
      { to: 'cloudy', probability: 0.3 },
      { to: 'sunny', probability: 0.4 },
      { to: 'windy', probability: 0.2 },
      { to: 'clear', probability: 0.1 }
    ],
    effects: {
      visibility: 100,
      movementPenalty: 1.0,
      encounterRate: 1.0,
      resourceAvailability: 1.0
    }
  },

  sunny: {
    id: 'sunny',
    name: 'Soleggiato',
    description: 'Sole splendente, caldo piacevole',
    baseConditions: {
      temperature: 25,
      humidity: 30,
      precipitation: 0,
      windSpeed: 3,
      precipitationType: 'none'
    },
    duration: { min: 180, max: 360 },
    transitions: [
      { to: 'clear', probability: 0.4 },
      { to: 'hot', probability: 0.3 },
      { to: 'cloudy', probability: 0.3 }
    ],
    effects: {
      visibility: 100,
      movementPenalty: 1.0,
      encounterRate: 0.8,
      resourceAvailability: 1.2
    }
  },

  cloudy: {
    id: 'cloudy',
    name: 'Nuvoloso',
    description: 'Cielo coperto, atmosfera opprimente',
    baseConditions: {
      temperature: 15,
      humidity: 70,
      precipitation: 0,
      windSpeed: 8,
      precipitationType: 'none'
    },
    duration: { min: 60, max: 240 },
    transitions: [
      { to: 'rain', probability: 0.4 },
      { to: 'clear', probability: 0.3 },
      { to: 'overcast', probability: 0.3 }
    ],
    effects: {
      visibility: 80,
      movementPenalty: 1.0,
      encounterRate: 1.1,
      resourceAvailability: 0.9
    }
  },

  overcast: {
    id: 'overcast',
    name: 'Coperto',
    description: 'Cielo completamente coperto, minaccia pioggia',
    baseConditions: {
      temperature: 12,
      humidity: 85,
      precipitation: 0,
      windSpeed: 12,
      precipitationType: 'none'
    },
    duration: { min: 30, max: 120 },
    transitions: [
      { to: 'rain', probability: 0.6 },
      { to: 'storm', probability: 0.2 },
      { to: 'cloudy', probability: 0.2 }
    ],
    effects: {
      visibility: 60,
      movementPenalty: 1.1,
      encounterRate: 1.3,
      resourceAvailability: 0.7
    }
  },

  rain: {
    id: 'rain',
    name: 'Pioggia',
    description: 'Pioggia costante, riduce la visibilità',
    baseConditions: {
      temperature: 10,
      humidity: 95,
      precipitation: 60,
      windSpeed: 15,
      precipitationType: 'rain'
    },
    duration: { min: 30, max: 180 },
    transitions: [
      { to: 'overcast', probability: 0.4 },
      { to: 'storm', probability: 0.3 },
      { to: 'cloudy', probability: 0.3 }
    ],
    effects: {
      visibility: 40,
      movementPenalty: 1.3,
      encounterRate: 0.7,
      resourceAvailability: 1.5
    }
  },

  storm: {
    id: 'storm',
    name: 'Temporale',
    description: 'Temporale violento con tuoni e fulmini',
    baseConditions: {
      temperature: 8,
      humidity: 100,
      precipitation: 100,
      windSpeed: 30,
      precipitationType: 'rain'
    },
    duration: { min: 15, max: 90 },
    transitions: [
      { to: 'rain', probability: 0.5 },
      { to: 'overcast', probability: 0.3 },
      { to: 'windy', probability: 0.2 }
    ],
    effects: {
      visibility: 20,
      movementPenalty: 1.8,
      encounterRate: 0.5,
      resourceAvailability: 2.0
    }
  },

  windy: {
    id: 'windy',
    name: 'Ventoso',
    description: 'Vento forte che rende difficile il movimento',
    baseConditions: {
      temperature: 18,
      humidity: 45,
      precipitation: 0,
      windSpeed: 25,
      precipitationType: 'none'
    },
    duration: { min: 60, max: 180 },
    transitions: [
      { to: 'clear', probability: 0.4 },
      { to: 'storm', probability: 0.2 },
      { to: 'cloudy', probability: 0.4 }
    ],
    effects: {
      visibility: 70,
      movementPenalty: 1.4,
      encounterRate: 1.2,
      resourceAvailability: 0.8
    }
  },

  hot: {
    id: 'hot',
    name: 'Caldo',
    description: 'Calore intenso, rischio disidratazione',
    baseConditions: {
      temperature: 35,
      humidity: 20,
      precipitation: 0,
      windSpeed: 2,
      precipitationType: 'none'
    },
    duration: { min: 120, max: 300 },
    transitions: [
      { to: 'sunny', probability: 0.5 },
      { to: 'clear', probability: 0.3 },
      { to: 'cloudy', probability: 0.2 }
    ],
    effects: {
      visibility: 90,
      movementPenalty: 1.2,
      encounterRate: 0.9,
      resourceAvailability: 0.6
    }
  },

  cold: {
    id: 'cold',
    name: 'Freddo',
    description: 'Temperature gelide, rischio congelamento',
    baseConditions: {
      temperature: -5,
      humidity: 60,
      precipitation: 0,
      windSpeed: 8,
      precipitationType: 'none'
    },
    duration: { min: 180, max: 480 },
    transitions: [
      { to: 'snow', probability: 0.3 },
      { to: 'clear', probability: 0.4 },
      { to: 'cloudy', probability: 0.3 }
    ],
    effects: {
      visibility: 85,
      movementPenalty: 1.3,
      encounterRate: 1.1,
      resourceAvailability: 0.5
    }
  },

  snow: {
    id: 'snow',
    name: 'Neve',
    description: 'Nevicata che copre il terreno',
    baseConditions: {
      temperature: -10,
      humidity: 90,
      precipitation: 80,
      windSpeed: 10,
      precipitationType: 'snow'
    },
    duration: { min: 60, max: 240 },
    transitions: [
      { to: 'cold', probability: 0.5 },
      { to: 'overcast', probability: 0.3 },
      { to: 'blizzard', probability: 0.2 }
    ],
    effects: {
      visibility: 30,
      movementPenalty: 2.0,
      encounterRate: 0.6,
      resourceAvailability: 1.8
    }
  },

  blizzard: {
    id: 'blizzard',
    name: 'Bufera',
    description: 'Bufera di neve intensa e pericolosa',
    baseConditions: {
      temperature: -15,
      humidity: 100,
      precipitation: 100,
      windSpeed: 40,
      precipitationType: 'snow'
    },
    duration: { min: 10, max: 60 },
    transitions: [
      { to: 'snow', probability: 0.6 },
      { to: 'cold', probability: 0.4 }
    ],
    effects: {
      visibility: 10,
      movementPenalty: 3.0,
      encounterRate: 0.3,
      resourceAvailability: 2.5
    }
  }
};

export class WeatherSystem {
  private state: WeatherState;
  private seasonalModifiers: Record<string, Partial<EnvironmentalConditions>>;

  constructor() {
    this.state = {
      currentPattern: weatherPatterns.clear,
      timeRemaining: 240, // 4 ore iniziali
      intensity: 50,
      isTransitioning: false
    };

    // Modificatori stagionali (semplificati)
    this.seasonalModifiers = {
      spring: { temperature: 5, humidity: 10 },
      summer: { temperature: 10, humidity: -10 },
      autumn: { temperature: 0, humidity: 15 },
      winter: { temperature: -10, humidity: 20 }
    };
  }

  /**
   * Aggiorna il sistema meteo
   */
  update(timePassed: number): void {
    this.state.timeRemaining -= timePassed;

    if (this.state.timeRemaining <= 0) {
      this.transitionToNextPattern();
    }

    // Variazioni casuali di intensità
    this.updateIntensity();

    // Emetti evento di cambio condizioni
    eventBus.emit('weather:conditionsChanged', {
      pattern: this.state.currentPattern,
      conditions: this.getCurrentConditions(),
      effects: this.state.currentPattern.effects
    });
  }

  /**
   * Ottiene le condizioni ambientali correnti
   */
  getCurrentConditions(): EnvironmentalConditions {
    const base = { ...this.state.currentPattern.baseConditions };
    const intensity = this.state.intensity / 100;

    // Applica intensità
    return {
      temperature: base.temperature,
      humidity: Math.min(100, base.humidity + (intensity * 20)),
      precipitation: base.precipitation * intensity,
      windSpeed: base.windSpeed + (intensity * 10),
      precipitationType: base.precipitationType
    };
  }

  /**
   * Ottiene lo stato corrente del meteo
   */
  getWeatherState(): WeatherState {
    return { ...this.state };
  }

  /**
   * Forza un cambio di pattern meteo
   */
  forceWeatherChange(patternId: string): boolean {
    if (!weatherPatterns[patternId]) return false;

    this.state.currentPattern = weatherPatterns[patternId];
    this.state.timeRemaining = this.calculateDuration(weatherPatterns[patternId]);
    this.state.intensity = Math.random() * 100;
    this.state.isTransitioning = false;

    eventBus.emit('weather:forcedChange', {
      newPattern: this.state.currentPattern,
      conditions: this.getCurrentConditions()
    });

    return true;
  }

  /**
   * Imposta modificatori stagionali
   */
  setSeason(season: 'spring' | 'summer' | 'autumn' | 'winter'): void {
    // Per ora solo log, implementazione futura
    console.log(`Stagione cambiata a: ${season}`);
  }

  private transitionToNextPattern(): void {
    this.state.isTransitioning = true;

    // Seleziona prossimo pattern basato sulle probabilità
    const transitions = this.state.currentPattern.transitions;
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const transition of transitions) {
      cumulativeProbability += transition.probability;
      if (random <= cumulativeProbability) {
        this.state.currentPattern = weatherPatterns[transition.to];
        break;
      }
    }

    // Calcola nuova durata
    this.state.timeRemaining = this.calculateDuration(this.state.currentPattern);
    this.state.intensity = Math.random() * 100;
    this.state.isTransitioning = false;

    eventBus.emit('weather:patternChanged', {
      oldPattern: this.state.currentPattern,
      newPattern: this.state.currentPattern,
      conditions: this.getCurrentConditions()
    });
  }

  private calculateDuration(pattern: WeatherPattern): number {
    const { min, max } = pattern.duration;
    return min + Math.random() * (max - min);
  }

  private updateIntensity(): void {
    // Variazioni casuali dell'intensità
    const change = (Math.random() - 0.5) * 2; // -1 to +1
    this.state.intensity = Math.max(0, Math.min(100, this.state.intensity + change));
  }

  /**
   * Ottiene previsioni meteo (pattern successivi probabili)
   */
  getWeatherForecast(hours: number = 24): WeatherPattern[] {
    const forecast: WeatherPattern[] = [];
    let currentPattern = this.state.currentPattern;
    let remainingTime = this.state.timeRemaining;

    // Converti ore in minuti
    const totalMinutes = hours * 60;
    let elapsed = 0;

    while (elapsed < totalMinutes) {
      forecast.push(currentPattern);
      elapsed += Math.min(remainingTime, totalMinutes - elapsed);

      if (elapsed < totalMinutes) {
        // Trova prossimo pattern
        const transitions = currentPattern.transitions;
        // Per semplicità, prendiamo il più probabile
        const nextTransition = transitions.reduce((prev, current) =>
          prev.probability > current.probability ? prev : current
        );
        currentPattern = weatherPatterns[nextTransition.to];
        remainingTime = this.calculateDuration(currentPattern);
      }
    }

    return forecast;
  }
}

// Singleton instance
export const weatherSystem = new WeatherSystem();