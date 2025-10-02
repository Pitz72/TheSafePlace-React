import { create } from 'zustand';
import { useWorldStore } from '../world/worldStore';
import { useNotificationStore } from '../notifications/notificationStore';
import { MessageType } from '../../data/MessageArchive';
import type { TimeState } from '../../interfaces/gameState';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';

export enum WeatherType {
  CLEAR = 'clear',
  LIGHT_RAIN = 'light_rain',
  HEAVY_RAIN = 'heavy_rain',
  STORM = 'storm',
  FOG = 'fog',
  WIND = 'wind',
}

export interface WeatherEffects {
  movementModifier: number;
  survivalModifier: number;
  skillCheckModifier: number;
  eventProbabilityModifier: number;
}

export interface WeatherState {
  currentWeather: WeatherType;
  intensity: number;
  duration: number;
  nextWeatherChange: number;
  effects: WeatherEffects;

  // Actions
  updateWeather: () => void;
  getWeatherEffects: () => WeatherEffects;
  generateWeatherChange: () => Promise<Omit<WeatherState, 'actions'>>;
  applyWeatherEffects: (baseValue: number, effectType: keyof WeatherEffects) => number;
  createClearWeather: () => Omit<WeatherState, 'actions'>;
  getWeatherDescription: (weather: WeatherType) => string;
  getRandomWeatherMessage: (weather: WeatherType) => string;
  getWeatherPatterns: () => any;
  getTimeBasedWeatherModifiers: (timeState: TimeState) => string;
  selectWeatherWithModifiers: (possibleTransitions: WeatherType[], timeModifier: string) => WeatherType;
  resetWeather: () => void;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  // --- INITIAL STATE ---
  currentWeather: WeatherType.CLEAR,
  intensity: 50,
  duration: 240,
  nextWeatherChange: Date.now() + 240 * 60 * 1000,
  effects: {
    movementModifier: 1.0,
    survivalModifier: 1.0,
    skillCheckModifier: 0,
    eventProbabilityModifier: 1.0,
  },

  // --- ACTIONS ---

  updateWeather: () => {
    return executeWithRetry({
      operation: async () => {
        const currentTime = Date.now();
        if (currentTime >= get().nextWeatherChange) {
          const newWeather = await get().generateWeatherChange();
          set(newWeather);

          useNotificationStore.getState().addLogEntry(MessageType.AMBIANCE_RANDOM, {
            weather: newWeather.currentWeather,
            text: get().getRandomWeatherMessage(newWeather.currentWeather),
          });
        }
        return { success: true };
      },
      category: GameErrorCategory.WEATHER,
      context: 'updateWeather',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante l\'aggiornamento del tempo atmosferico'),
      onFallback: () => ({ success: false })
    });
  },

  getWeatherEffects: (): WeatherEffects => {
    return executeWithRetry({
      operation: () => get().effects,
      category: GameErrorCategory.WEATHER,
      context: 'getWeatherEffects',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante il recupero degli effetti meteorologici'),
      onFallback: () => ({
        movementModifier: 1.0,
        survivalModifier: 1.0,
        skillCheckModifier: 0,
        eventProbabilityModifier: 1.0,
      })
    });
  },

  generateWeatherChange: (): Promise<Omit<WeatherState, 'actions'>> => {
    return executeWithRetry({
      operation: async () => {
        const worldStore = useWorldStore.getState();
        const timeState = worldStore?.timeState;
        
        // If timeState is not available, return clear weather
        if (!timeState || typeof timeState.currentTime === 'undefined') {
          return get().createClearWeather();
        }
        
        const weatherPatterns = get().getWeatherPatterns();
        const currentWeather = get().currentWeather;
        const possibleTransitions = weatherPatterns[currentWeather]?.transitionsTo || ['clear'];
        const timeModifiers = get().getTimeBasedWeatherModifiers(timeState);
        const newWeatherType = get().selectWeatherWithModifiers(possibleTransitions, timeModifiers);
        const newPattern = weatherPatterns[newWeatherType];

        if (!newPattern) {
          return get().createClearWeather();
        }

        const [minIntensity, maxIntensity] = newPattern.intensityRange;
        const intensity = Math.floor(Math.random() * (maxIntensity - minIntensity + 1)) + minIntensity;
        const baseDuration = newPattern.averageDuration;
        const variation = baseDuration * 0.3;
        const duration = Math.floor(baseDuration + Math.random() * variation * 2 - variation);

        return {
          currentWeather: newWeatherType,
          intensity,
          duration,
          nextWeatherChange: Date.now() + duration * 60 * 1000,
          effects: { ...newPattern.effects },
        };
      },
      category: GameErrorCategory.WEATHER,
      context: 'generateWeatherChange',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante la generazione del cambiamento meteorologico'),
      onFallback: () => get().createClearWeather()
    });
  },

  applyWeatherEffects: (baseValue, effectType) => {
    return executeWithRetry({
      operation: () => {
        const modifier = get().effects[effectType];
        if (effectType === 'skillCheckModifier') {
          return baseValue + (modifier as number);
        } else {
          return baseValue * (modifier as number);
        }
      },
      category: GameErrorCategory.WEATHER,
      context: 'applyWeatherEffects',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante l\'applicazione degli effetti meteorologici'),
      onFallback: () => baseValue
    });
  },

  getWeatherPatterns: () => ({
    [WeatherType.CLEAR]: {
      transitionsTo: [WeatherType.LIGHT_RAIN, WeatherType.FOG, WeatherType.WIND],
      intensityRange: [20, 60],
      averageDuration: 240,
      effects: { movementModifier: 1.0, survivalModifier: 1.0, skillCheckModifier: 0, eventProbabilityModifier: 1.0 },
    },
    [WeatherType.LIGHT_RAIN]: {
      transitionsTo: [WeatherType.CLEAR, WeatherType.HEAVY_RAIN, WeatherType.FOG],
      intensityRange: [30, 70],
      averageDuration: 120,
      effects: { movementModifier: 0.9, survivalModifier: 1.1, skillCheckModifier: -1, eventProbabilityModifier: 0.8 },
    },
    [WeatherType.HEAVY_RAIN]: {
      transitionsTo: [WeatherType.LIGHT_RAIN, WeatherType.STORM, WeatherType.CLEAR],
      intensityRange: [60, 90],
      averageDuration: 90,
      effects: { movementModifier: 0.7, survivalModifier: 1.3, skillCheckModifier: -3, eventProbabilityModifier: 0.6 },
    },
    [WeatherType.STORM]: {
      transitionsTo: [WeatherType.HEAVY_RAIN, WeatherType.WIND, WeatherType.CLEAR],
      intensityRange: [70, 100],
      averageDuration: 60,
      effects: { movementModifier: 0.5, survivalModifier: 1.5, skillCheckModifier: -5, eventProbabilityModifier: 0.4 },
    },
    [WeatherType.FOG]: {
      transitionsTo: [WeatherType.CLEAR, WeatherType.LIGHT_RAIN],
      intensityRange: [40, 80],
      averageDuration: 180,
      effects: { movementModifier: 0.8, survivalModifier: 1.0, skillCheckModifier: -2, eventProbabilityModifier: 1.2 },
    },
    [WeatherType.WIND]: {
      transitionsTo: [WeatherType.CLEAR, WeatherType.STORM],
      intensityRange: [50, 85],
      averageDuration: 300,
      effects: { movementModifier: 0.9, survivalModifier: 1.2, skillCheckModifier: -1, eventProbabilityModifier: 1.1 },
    },
  }),

  getTimeBasedWeatherModifiers: (timeState) => {
    return executeWithRetry({
      operation: () => {
        // Add null safety check for timeState
        if (!timeState || typeof timeState.currentTime === 'undefined') {
          return 'day'; // Default to day if timeState is not available
        }
        
        const hour = Math.floor(timeState.currentTime / 60);
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 18) return 'day';
        if (hour >= 18 && hour < 21) return 'dusk';
        return 'night';
      },
      category: GameErrorCategory.WEATHER,
      context: 'getTimeBasedWeatherModifiers',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante il calcolo dei modificatori temporali'),
      onFallback: () => 'day'
    });
  },

  selectWeatherWithModifiers: (possibleTransitions, timeModifier) => {
    return executeWithRetry({
      operation: () => {
        const timeWeights: Record<string, Record<WeatherType, number>> = {
          dawn: { [WeatherType.FOG]: 2.0 },
          day: { [WeatherType.CLEAR]: 1.5, [WeatherType.FOG]: 0.3 },
          dusk: { [WeatherType.FOG]: 1.8 },
          night: { [WeatherType.STORM]: 2.0, [WeatherType.HEAVY_RAIN]: 1.6 },
        };
        const weights = timeWeights[timeModifier] || {};
        const weightedOptions: WeatherType[] = [];
        possibleTransitions.forEach(weather => {
          const weight = (weights[weather] || 1.0) * 10;
          for (let i = 0; i < weight; i++) {
            weightedOptions.push(weather);
          }
        });
        return weightedOptions[Math.floor(Math.random() * weightedOptions.length)] || WeatherType.CLEAR;
      },
      category: GameErrorCategory.WEATHER,
      context: 'selectWeatherWithModifiers',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante la selezione del tempo con modificatori'),
      onFallback: () => WeatherType.CLEAR
    });
  },

  createClearWeather: () => ({
    currentWeather: WeatherType.CLEAR,
    intensity: 50,
    duration: 240,
    nextWeatherChange: Date.now() + (240 * 60 * 1000),
    effects: {
      movementModifier: 1.0,
      survivalModifier: 1.0,
      skillCheckModifier: 0,
      eventProbabilityModifier: 1.0
    }
  }),

  getWeatherDescription: (weather) => {
    return executeWithRetry(
      () => {
        const descriptions = {
          [WeatherType.CLEAR]: 'Il cielo si schiarisce...',
          [WeatherType.LIGHT_RAIN]: 'Gocce sottili iniziano a cadere...',
          [WeatherType.HEAVY_RAIN]: 'La pioggia battente trasforma il paesaggio...',
          [WeatherType.STORM]: 'Una tempesta furiosa scuote la terra...',
          [WeatherType.FOG]: 'Una nebbia spettrale avvolge tutto...',
          [WeatherType.WIND]: 'Raffiche violente sollevano nuvole di polvere...'
        };
        return descriptions[weather] || 'Il tempo cambia...';
      },
      (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante il recupero della descrizione meteorologica'),
      () => 'Il tempo si comporta in modo strano...'
    );
  },

  getRandomWeatherMessage: (weather) => {
    return executeWithRetry(
      () => {
        const messages = {
          [WeatherType.CLEAR]: ['I raggi del sole filtrano...'],
          [WeatherType.LIGHT_RAIN]: ['Le gocce di pioggia tamburellano...'],
          [WeatherType.HEAVY_RAIN]: ['La pioggia torrenziale rende il terreno...'],
          [WeatherType.STORM]: ['Un fulmine illumina il paesaggio...'],
          [WeatherType.FOG]: ['Forme indistinte emergono...'],
          [WeatherType.WIND]: ['Il vento porta con sé frammenti...']
        };
        const weatherMessages = messages[weather] || ['Il tempo si comporta in modo strano.'];
        return weatherMessages[Math.floor(Math.random() * weatherMessages.length)];
      },
      (error) => handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante il recupero del messaggio meteorologico'),
      () => 'Il tempo si comporta in modo strano.'
    );
  },

  /**
   * Resetta il meteo allo stato iniziale per una nuova partita.
   * Imposta condizioni serene con modificatori neutrali.
   */
  resetWeather: () => {
    return executeWithRetry({
      operation: () => {
        const clearWeatherState = get().createClearWeather();
        set({
          currentWeather: WeatherType.CLEAR,
          intensity: 50,
          duration: 240,
          nextWeatherChange: Date.now() + 240 * 60 * 1000,
          effects: {
            movementModifier: 1.0,
            survivalModifier: 1.0,
            skillCheckModifier: 0,
            eventProbabilityModifier: 1.0
          }
        });
        return { success: true };
      },
      category: GameErrorCategory.WEATHER,
      context: 'resetWeather',
      onFailure: (error) => {
        handleStoreError(error, GameErrorCategory.WEATHER, 'Errore durante il reset del meteo');
        // Fallback: usa createClearWeather come stato di sicurezza
        const clearWeatherState = get().createClearWeather();
        set(clearWeatherState);
      },
      onFallback: () => ({ success: false })
    });
  },
}));
