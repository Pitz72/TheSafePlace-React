import { create } from 'zustand';
import type { GameState, AbilityCheckResult, TimeState, ShelterAccessInfo, WeatherState, WeatherEffects } from '../interfaces/gameState';
import { WeatherType } from '../interfaces/gameState';

import { createTestCharacter } from '../rules/characterGenerator';
import { MessageType, getRandomMessage, JOURNAL_CONFIG, resetJournalState } from '../data/MessageArchive';
import { itemDatabase } from '../data/items/itemDatabase';
import { equipItem } from '../utils/equipmentManager';
import { isDead } from '../rules/mechanics';
import { saveSystem } from '../utils/saveSystem';
import { downloadFile, readFileAsText, validateSaveFile, generateSaveFilename, createFileInput } from '../utils/fileUtils';
import type { GameEvent, EventChoice, Penalty } from '../interfaces/events';

const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00

export const useGameStore = create<GameState>((set, get) => ({
  // --- STATO INIZIALE ---
  mapData: [],
  isMapLoading: true,
  playerPosition: { x: -1, y: -1 },
  cameraPosition: { x: 0, y: 0 },
  timeState: { currentTime: DAWN_TIME, day: 1, isDay: true },
  characterSheet: createTestCharacter(),
  lastShortRestTime: null,
  survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } },
  logEntries: [],
  currentBiome: null,
  items: itemDatabase,
  selectedInventoryIndex: 0,
  currentScreen: 'menu',
  previousScreen: null,
  menuSelectedIndex: 0,
  shelterAccessState: {}, // Sistema rifugi v0.6.1
  weatherState: {
    currentWeather: WeatherType.CLEAR,
    intensity: 50,
    duration: 240, // 4 ore iniziali
    nextWeatherChange: Date.now() + (240 * 60 * 1000), // 4 ore da ora
    effects: {
      movementModifier: 1.0,
      survivalModifier: 1.0,
      skillCheckModifier: 0,
      eventProbabilityModifier: 1.0
    }
  },
  eventDatabase: {},
  currentEvent: null,
  seenEventIds: [],
  notifications: [],
  unlockRecipesCallback: undefined,

  // --- AZIONI ---

  initializeGame: async () => {
    if (get().isMapLoading === false) return; // Evita reinizializzazione

    resetJournalState();
    set({ logEntries: [] });

    try {
      const response = await fetch('/map.txt');
      const mapText = await response.text();
      const lines = mapText.split('\n').filter(line => line);

      let startPos = { x: 75, y: 75 };
      lines.forEach((line, y) => {
        const x = line.indexOf('S');
        if (x !== -1) startPos = { x, y };
      });

      const eventFiles = ['city_events.json', 'forest_events.json', 'plains_events.json', 'rest_stop_events.json', 'river_events.json', 'unique_events.json', 'village_events.json'];
      const database: Record<string, GameEvent[]> = {};
      for (const file of eventFiles) {
        const res = await fetch(`/events/${file}`);
        const data = await res.json();
        const key = Object.keys(data)[0];
        database[key] = Object.values(data)[0] as GameEvent[];
      }

      set({
        mapData: lines,
        playerPosition: startPos,
        isMapLoading: false,
        eventDatabase: database,
        characterSheet: createTestCharacter(), // Resetta il personaggio
        survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } }, // Resetta sopravvivenza
        timeState: { currentTime: DAWN_TIME, day: 1, isDay: true }, // Resetta tempo
        shelterAccessState: {}, // Resetta sistema rifugi v0.6.1
        weatherState: get().createClearWeather(), // Resetta meteo a sereno
        currentScreen: 'menu',
        currentBiome: get().getBiomeKeyFromChar(lines[startPos.y][startPos.x]),
      });
      get().addLogEntry(MessageType.GAME_START);

    } catch (error) {
      console.error("Initialization failed in store:", error);
      set({ isMapLoading: false });
    }
  },

  setCurrentScreen: (screen) => set(state => ({ currentScreen: screen, previousScreen: state.currentScreen })),

  goBack: () => set(state => {
    if (state.previousScreen) {
      return { currentScreen: state.previousScreen, previousScreen: null };
    }
    return { currentScreen: 'menu' }; // Fallback
  }),

  setMenuSelectedIndex: (index) => set({ menuSelectedIndex: index }),
  setSelectedInventoryIndex: (index) => set({ selectedInventoryIndex: index }),

  // --- UI Navigation Actions ---
  handleNewGame: () => get().setCurrentScreen('characterCreation'),
  handleLoadGame: () => get().setCurrentScreen('loadGame'),
  handleStory: () => get().setCurrentScreen('story'),
  handleInstructions: () => get().setCurrentScreen('instructions'),
  handleOptions: () => get().setCurrentScreen('options'),
  handleBackToMenu: () => get().setCurrentScreen('menu'),
  handleExit: () => {
    // In a real browser environment, you might want to show a confirmation
    // For now, we can just log it or go back to the menu.
    console.log("Exit action triggered");
    get().setCurrentScreen('menu');
  },

  formatTime: (timeMinutes: number): string => {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  addLogEntry: (type, context) => {
    const message = getRandomMessage(type, context);
    if (!message) return;
    const newEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: get().formatTime(get().timeState.currentTime),
      message,
      type,
      context,
    };
    set(state => ({ logEntries: [...state.logEntries, newEntry].slice(-JOURNAL_CONFIG.MAX_ENTRIES) }));
  },

  advanceTime: (minutes = 30) => {
    const oldTimeState = get().timeState;
    const newTotalMinutes = oldTimeState.currentTime + minutes;
    const newDay = oldTimeState.day + Math.floor(newTotalMinutes / 1440);
    const normalizedTime = newTotalMinutes % 1440;
    const newIsDay = normalizedTime >= DAWN_TIME && normalizedTime <= DUSK_TIME;

    if (oldTimeState.currentTime < DAWN_TIME && normalizedTime >= DAWN_TIME) get().addLogEntry(MessageType.TIME_DAWN);
    if (oldTimeState.currentTime < DUSK_TIME && normalizedTime >= DUSK_TIME) {
      get().addLogEntry(MessageType.TIME_DUSK);
      get().handleNightConsumption();
    }
    if (oldTimeState.currentTime > 0 && normalizedTime === 0) get().addLogEntry(MessageType.TIME_MIDNIGHT);

    set({ timeState: { currentTime: normalizedTime, day: newDay, isDay: newIsDay } });
  },

  updatePlayerPosition: (newPosition, newBiomeChar) => {
    const oldBiome = get().currentBiome;
    const newBiomeKey = get().getBiomeKeyFromChar(newBiomeChar);

    if (newBiomeKey !== oldBiome) {
      get().addLogEntry(MessageType.BIOME_ENTER, { biome: newBiomeKey });
      get().updateBiome(newBiomeChar); // Gestisce logica rifugi etc.
    }

    set({ playerPosition: newPosition, currentBiome: newBiomeKey });

    // Aggiorna meteo prima del movimento
    get().updateWeather();

    // Consumo e XP con effetti meteo
    get().addExperience(Math.floor(Math.random() * 2) + 1);

    const weatherEffects = get().getWeatherEffects();
    const baseHungerLoss = 0.2;
    const baseThirstLoss = 0.3;

    set(state => ({
      survivalState: {
        ...state.survivalState,
        hunger: Math.max(0, state.survivalState.hunger - (baseHungerLoss * weatherEffects.survivalModifier)),
        thirst: Math.max(0, state.survivalState.thirst - (baseThirstLoss * weatherEffects.survivalModifier)),
      }
    }));

    // Controllo fame e sete critiche
    if (get().survivalState.hunger <= 0 || get().survivalState.thirst <= 0) {
      get().updateHP(-1);
      get().addLogEntry(MessageType.HP_DAMAGE, { damage: 1, reason: 'fame e sete' });
    }

    // Effetti meteo estremi durante il movimento
    const { weatherState } = get();
    if (weatherState.currentWeather === WeatherType.STORM && Math.random() < 0.15) {
      // 15% di possibilità di subire danni durante una tempesta
      const stormDamage = Math.floor(Math.random() * 2) + 1; // 1-2 danni
      get().updateHP(-stormDamage);
      get().addLogEntry(MessageType.HP_DAMAGE, {
        damage: stormDamage,
        reason: 'tempesta violenta',
        description: 'Venti fortissimi e detriti volanti ti colpiscono mentre ti muovi.'
      });
    } else if (weatherState.currentWeather === WeatherType.HEAVY_RAIN && Math.random() < 0.08) {
      // 8% di possibilità di scivolare durante pioggia intensa
      const slipDamage = 1;
      get().updateHP(-slipDamage);
      get().addLogEntry(MessageType.HP_DAMAGE, {
        damage: slipDamage,
        reason: 'terreno scivoloso',
        description: 'Scivoli sul terreno reso fangoso dalla pioggia intensa.'
      });
    }

    // Messaggi atmosferici casuali basati sul meteo (10% di possibilità)
    if (Math.random() < 0.10) {
      const { weatherState } = get();
      get().addLogEntry(MessageType.AMBIANCE_RANDOM, {
        text: get().getRandomWeatherMessage(weatherState.currentWeather)
      });
    }

    // Trigger Evento - v0.8.1: Probabilità differenziate per bioma
    const BIOME_EVENT_CHANCES: Record<string, number> = {
      'PLAINS': 0.10,      // 10% = ~1 evento ogni 10 passi (pianura comune)
      'FOREST': 0.15,      // 15% = maggiore probabilità (bioma più raro)
      'RIVER': 0.18,       // 18% = eventi fluviali più frequenti
      'CITY': 0.33,        // 33% = ~1 evento ogni 3 passi (alta densità urbana)
      'VILLAGE': 0.33,     // 33% = ~1 evento ogni 3 passi (alta densità urbana)
      'SETTLEMENT': 0.25,  // 25% = insediamenti meno densi delle città
      'REST_STOP': 0.20,   // 20% = rifugi con eventi moderati
      'UNKNOWN': 0.05      // 5% = biomi sconosciuti molto rari
    };

    const baseEventChance = BIOME_EVENT_CHANCES[newBiomeKey] || 0.05;
    const adjustedEventChance = baseEventChance * weatherEffects.eventProbabilityModifier;

    if (newBiomeKey && Math.random() < adjustedEventChance) {
      setTimeout(() => get().triggerEvent(newBiomeKey), 150);
    }

    // Calcola tempo movimento con effetti meteo
    const baseMovementTime = 10; // minuti base per movimento
    const adjustedMovementTime = Math.ceil(baseMovementTime / weatherEffects.movementModifier);

    // Messaggio informativo se il meteo rallenta il movimento
    if (weatherEffects.movementModifier < 1.0) {
      const { weatherState } = get();
      const extraTime = adjustedMovementTime - baseMovementTime;
      get().addLogEntry(MessageType.AMBIANCE_RANDOM, {
        text: `Il ${get().getWeatherDescription(weatherState.currentWeather).toLowerCase()} rallenta il tuo movimento (+${extraTime} min).`
      });
    }

    get().advanceTime(adjustedMovementTime);
  },

  updateCameraPosition: (viewportSize: { width: number; height: number }) => {
    const { playerPosition, mapData } = get();
    
    if (!mapData || mapData.length === 0 || !viewportSize || viewportSize.width === 0 || viewportSize.height === 0) {
      return; // Non fare nulla se i dati non sono pronti
    }

    // Costanti di rendering (derivate da MapViewport.tsx)
    const CHAR_WIDTH = 25.6;
    const CHAR_HEIGHT = 38.4;

    // Dimensioni della mappa in tile
    const MAP_WIDTH_IN_TILES = mapData[0].length;
    const MAP_HEIGHT_IN_TILES = mapData.length;

    // Calcola la posizione ideale della camera (in pixel) per centrare il giocatore
    const idealCameraX = (playerPosition.x * CHAR_WIDTH) - (viewportSize.width / 2) + (CHAR_WIDTH / 2);
    const idealCameraY = (playerPosition.y * CHAR_HEIGHT) - (viewportSize.height / 2) + (CHAR_HEIGHT / 2);

    // Calcola i limiti massimi di scroll per non mostrare aree vuote
    const maxScrollX = (MAP_WIDTH_IN_TILES * CHAR_WIDTH) - viewportSize.width;
    const maxScrollY = (MAP_HEIGHT_IN_TILES * CHAR_HEIGHT) - viewportSize.height;

    // Applica il "clamping" per mantenere la camera entro i bordi della mappa
    const newCameraX = Math.max(0, Math.min(idealCameraX, maxScrollX));
    const newCameraY = Math.max(0, Math.min(idealCameraY, maxScrollY));
    
    set({ cameraPosition: { x: newCameraX, y: newCameraY } });
  },

  getBiomeKeyFromChar: (char: string) => {
    const map: Record<string, string> = {
      'C': 'CITY', 'F': 'FOREST', '.': 'PLAINS', '~': 'RIVER',
      'V': 'VILLAGE', 'S': 'SETTLEMENT', 'R': 'REST_STOP',
    };
    return map[char] || 'UNKNOWN';
  },

  // --- SISTEMA RIFUGI v0.6.1 ---

  createShelterKey: (x: number, y: number): string => `${x},${y}`,

  getShelterInfo: (x: number, y: number): ShelterAccessInfo | null => {
    const key = get().createShelterKey(x, y);
    return get().shelterAccessState[key] || null;
  },

  createShelterInfo: (x: number, y: number): ShelterAccessInfo => {
    const { timeState } = get();
    return {
      coordinates: get().createShelterKey(x, y),
      dayVisited: timeState.day,
      timeVisited: timeState.currentTime,
      hasBeenInvestigated: false,
      isAccessible: true, // Inizialmente accessibile
      investigationResults: []
    };
  },

  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => {
    const key = get().createShelterKey(x, y);
    set(state => ({
      shelterAccessState: {
        ...state.shelterAccessState,
        [key]: {
          ...state.shelterAccessState[key],
          ...updates
        }
      }
    }));
  },

  isShelterAccessible: (x: number, y: number): boolean => {
    const shelterInfo = get().getShelterInfo(x, y);
    if (!shelterInfo) return true; // Prima visita sempre permessa

    const { timeState } = get();

    // Accesso notturno sempre permesso
    if (!timeState.isDay) return true;

    // Se è già stato visitato di giorno, non è più accessibile
    return shelterInfo.isAccessible;
  },

  canInvestigateShelter: (x: number, y: number): boolean => {
    const shelterInfo = get().getShelterInfo(x, y);
    if (!shelterInfo) return true; // Prima investigazione sempre permessa

    // Una sola investigazione per sessione
    return !shelterInfo.hasBeenInvestigated;
  },

  isPlayerInShelter: (): boolean => {
    const { playerPosition, mapData } = get();
    if (mapData.length === 0 || playerPosition.x === -1 || playerPosition.y === -1) {
      return false;
    }
    
    const currentTile = mapData[playerPosition.y]?.[playerPosition.x];
    return currentTile === 'R';
  },

  resetShelterInvestigations: () => {
    // Resetta tutte le investigazioni per una nuova sessione
    set(state => {
      const newShelterAccessState = { ...state.shelterAccessState };
      Object.keys(newShelterAccessState).forEach(key => {
        newShelterAccessState[key] = {
          ...newShelterAccessState[key],
          hasBeenInvestigated: false,
          investigationResults: []
        };
      });
      return { shelterAccessState: newShelterAccessState };
    });
  },

  // --- SISTEMA METEO v0.6.1 ---

  updateWeather: () => {
    const currentTime = Date.now();
    const { weatherState } = get();

    // Controlla se è ora di cambiare il meteo
    if (currentTime >= weatherState.nextWeatherChange) {
      const newWeather = get().generateWeatherChange();
      set({ weatherState: newWeather });

      // Aggiungi messaggio al journal con descrizione casuale
      get().addLogEntry(MessageType.AMBIANCE_RANDOM, {
        weather: newWeather.currentWeather,
        text: get().getRandomWeatherMessage(newWeather.currentWeather)
      });
    }
  },

  getWeatherEffects: (): WeatherEffects => {
    return get().weatherState.effects;
  },

  generateWeatherChange: (): WeatherState => {
    const { timeState } = get();

    // Carica i pattern meteo
    const weatherPatterns = get().getWeatherPatterns();
    const currentWeather = get().weatherState.currentWeather;

    // Determina possibili transizioni
    const possibleTransitions = weatherPatterns[currentWeather]?.transitionsTo || ['clear'];

    // Applica modificatori temporali
    const timeModifiers = get().getTimeBasedWeatherModifiers(timeState);

    // Seleziona nuovo meteo
    const newWeatherType = get().selectWeatherWithModifiers(possibleTransitions, timeModifiers);
    const newPattern = weatherPatterns[newWeatherType];

    if (!newPattern) {
      // Fallback a tempo sereno
      return get().createClearWeather();
    }

    // Genera intensità casuale nel range
    const [minIntensity, maxIntensity] = newPattern.intensityRange;
    const intensity = Math.floor(Math.random() * (maxIntensity - minIntensity + 1)) + minIntensity;

    // Genera durata con variazione ±30%
    const baseDuration = newPattern.averageDuration;
    const variation = baseDuration * 0.3;
    const duration = Math.floor(baseDuration + (Math.random() * variation * 2 - variation));

    return {
      currentWeather: newWeatherType,
      intensity,
      duration,
      nextWeatherChange: Date.now() + (duration * 60 * 1000),
      effects: { ...newPattern.effects }
    };
  },

  applyWeatherEffects: (baseValue: number, effectType: keyof WeatherEffects): number => {
    const effects = get().getWeatherEffects();
    const modifier = effects[effectType];

    if (effectType === 'skillCheckModifier') {
      // Per skill check, è un bonus/penalità additiva
      return baseValue + modifier;
    } else {
      // Per altri effetti, è un moltiplicatore
      return baseValue * modifier;
    }
  },

  // Helper functions per il sistema meteo
  getWeatherPatterns: () => {
    // In una implementazione reale, questo caricherà da weatherPatterns.json
    // Per ora, ritorna pattern hardcoded
    return {
      [WeatherType.CLEAR]: {
        transitionsTo: [WeatherType.LIGHT_RAIN, WeatherType.FOG, WeatherType.WIND],
        intensityRange: [20, 60],
        averageDuration: 240,
        effects: { movementModifier: 1.0, survivalModifier: 1.0, skillCheckModifier: 0, eventProbabilityModifier: 1.0 }
      },
      [WeatherType.LIGHT_RAIN]: {
        transitionsTo: [WeatherType.CLEAR, WeatherType.HEAVY_RAIN, WeatherType.FOG],
        intensityRange: [30, 70],
        averageDuration: 120,
        effects: { movementModifier: 0.9, survivalModifier: 1.1, skillCheckModifier: -1, eventProbabilityModifier: 0.8 }
      },
      [WeatherType.HEAVY_RAIN]: {
        transitionsTo: [WeatherType.LIGHT_RAIN, WeatherType.STORM, WeatherType.CLEAR],
        intensityRange: [60, 90],
        averageDuration: 90,
        effects: { movementModifier: 0.7, survivalModifier: 1.3, skillCheckModifier: -3, eventProbabilityModifier: 0.6 }
      },
      [WeatherType.STORM]: {
        transitionsTo: [WeatherType.HEAVY_RAIN, WeatherType.WIND, WeatherType.CLEAR],
        intensityRange: [70, 100],
        averageDuration: 60,
        effects: { movementModifier: 0.5, survivalModifier: 1.5, skillCheckModifier: -5, eventProbabilityModifier: 0.4 }
      },
      [WeatherType.FOG]: {
        transitionsTo: [WeatherType.CLEAR, WeatherType.LIGHT_RAIN],
        intensityRange: [40, 80],
        averageDuration: 180,
        effects: { movementModifier: 0.8, survivalModifier: 1.0, skillCheckModifier: -2, eventProbabilityModifier: 1.2 }
      },
      [WeatherType.WIND]: {
        transitionsTo: [WeatherType.CLEAR, WeatherType.STORM],
        intensityRange: [50, 85],
        averageDuration: 300,
        effects: { movementModifier: 0.9, survivalModifier: 1.2, skillCheckModifier: -1, eventProbabilityModifier: 1.1 }
      }
    };
  },

  getTimeBasedWeatherModifiers: (timeState: TimeState) => {
    const hour = Math.floor(timeState.currentTime / 60);

    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 18) return 'day';
    if (hour >= 18 && hour < 21) return 'dusk';
    return 'night';
  },

  selectWeatherWithModifiers: (possibleTransitions: WeatherType[], timeModifier: string): WeatherType => {
    // Applica modificatori temporali per maggiore realismo
    const timeWeights: Record<string, Record<WeatherType, number>> = {
      dawn: {
        [WeatherType.CLEAR]: 1.2,
        [WeatherType.FOG]: 2.0,
        [WeatherType.LIGHT_RAIN]: 0.8,
        [WeatherType.HEAVY_RAIN]: 0.5,
        [WeatherType.STORM]: 0.3,
        [WeatherType.WIND]: 1.0
      },
      day: {
        [WeatherType.CLEAR]: 1.5,
        [WeatherType.FOG]: 0.3,
        [WeatherType.LIGHT_RAIN]: 1.0,
        [WeatherType.HEAVY_RAIN]: 0.8,
        [WeatherType.STORM]: 0.6,
        [WeatherType.WIND]: 1.3
      },
      dusk: {
        [WeatherType.CLEAR]: 1.0,
        [WeatherType.FOG]: 1.8,
        [WeatherType.LIGHT_RAIN]: 1.4,
        [WeatherType.HEAVY_RAIN]: 1.2,
        [WeatherType.STORM]: 0.8,
        [WeatherType.WIND]: 0.9
      },
      night: {
        [WeatherType.CLEAR]: 0.8,
        [WeatherType.FOG]: 1.1,
        [WeatherType.LIGHT_RAIN]: 1.3,
        [WeatherType.HEAVY_RAIN]: 1.6,
        [WeatherType.STORM]: 2.0,
        [WeatherType.WIND]: 1.2
      }
    };

    const weights = timeWeights[timeModifier] || {};
    const weightedOptions: WeatherType[] = [];
    
    possibleTransitions.forEach(weather => {
      const weight = weights[weather] || 1.0;
      const count = Math.max(1, Math.round(weight * 10));
      for (let i = 0; i < count; i++) {
        weightedOptions.push(weather);
      }
    });

    return weightedOptions[Math.floor(Math.random() * weightedOptions.length)];
  },

  // --- FUNZIONI HELPER PER ATTRAVERSAMENTO FIUMI ---

  getRiverCrossingWeatherDescription: (): string => {
    const { weatherState, timeState } = get();
    const timePrefix = timeState.isDay ? '' : 'Nell\'oscurità della notte, ';
    
    switch (weatherState.currentWeather) {
      case WeatherType.CLEAR:
        return `${timePrefix}La corrente sembra gestibile e la visibilità è buona.`;
      case WeatherType.LIGHT_RAIN:
        return `${timePrefix}La pioggia leggera rende le rocce scivolose. La corrente appare più forte del normale.`;
      case WeatherType.HEAVY_RAIN:
        return `${timePrefix}La pioggia battente gonfia il fiume e riduce drasticamente la visibilità. L'acqua è torbida e minacciosa.`;
      case WeatherType.STORM:
        return `${timePrefix}La tempesta rende l'attraversamento estremamente pericoloso. Il fiume è in piena e i detriti vengono trascinati dalla corrente.`;
      case WeatherType.FOG:
        return `${timePrefix}La nebbia densa impedisce di valutare correttamente la profondità e la forza della corrente.`;
      case WeatherType.WIND:
        return `${timePrefix}Il vento forte crea onde sulla superficie e minaccia di destabilizzarti durante l'attraversamento.`;
      default:
        return `${timePrefix}La corrente sembra forte...`;
    }
  },

  getRiverCrossingSuccessDescription: (): string => {
    const { weatherState } = get();
    
    switch (weatherState.currentWeather) {
      case WeatherType.CLEAR:
        return 'Con movimenti sicuri e calcolati, attraversi il fiume senza difficoltà. La buona visibilità ti ha permesso di scegliere il percorso migliore.';
      case WeatherType.LIGHT_RAIN:
        return 'Nonostante le rocce scivolose, mantieni l\'equilibrio e raggiungi l\'altra sponda. La pioggia leggera non è riuscita a fermarti.';
      case WeatherType.HEAVY_RAIN:
        return 'Lottando contro la pioggia battente e la corrente gonfia, riesci comunque ad attraversare con determinazione e abilità.';
      case WeatherType.STORM:
        return 'In una dimostrazione di coraggio e agilità straordinari, superi la furia della tempesta e raggiungi l\'altra sponda sano e salvo.';
      case WeatherType.FOG:
        return 'Procedendo con estrema cautela nella nebbia, riesci a trovare il percorso sicuro e completi l\'attraversamento.';
      case WeatherType.WIND:
        return 'Resistendo alle raffiche di vento che minacciano di farti perdere l\'equilibrio, completi l\'attraversamento con successo.';
      default:
        return 'Con agilità e determinazione, riesci ad attraversare il fiume senza problemi.';
    }
  },

  getRiverCrossingFailureDescription: (totalDamage: number, hasWeatherDamage: boolean): string => {
    const { weatherState } = get();
    
    let baseDescription = '';
    let weatherExtra = '';

    // Descrizione base del fallimento
    if (totalDamage <= 2) {
      baseDescription = 'Scivoli e cadi nell\'acqua, ma riesci a raggiungere l\'altra sponda con solo qualche graffio.';
    } else if (totalDamage <= 4) {
      baseDescription = 'La corrente ti trascina e ti sbatte contro le rocce. Raggiungi l\'altra sponda dolorante e bagnato.';
    } else {
      baseDescription = 'L\'attraversamento si trasforma in una lotta per la sopravvivenza. Vieni trascinato dalla corrente e subisci gravi contusioni.';
    }

    // Descrizione extra per danni meteo
    if (hasWeatherDamage) {
      switch (weatherState.currentWeather) {
        case WeatherType.STORM:
          weatherExtra = ' La tempesta rende tutto più pericoloso: detriti ti colpiscono e il vento ti destabilizza ulteriormente.';
          break;
        case WeatherType.HEAVY_RAIN:
          weatherExtra = ' La pioggia torrenziale ti acceca e rende impossibile valutare i pericoli nascosti.';
          break;
        case WeatherType.FOG:
          weatherExtra = ' La nebbia ti fa perdere l\'orientamento, finendo in una zona più pericolosa del fiume.';
          break;
      }
    }

    return baseDescription + weatherExtra;
  },

  getRiverCrossingModifierInfo: (finalDifficulty: number): string | null => {
    const { weatherState, timeState, characterSheet, survivalState } = get();
    const baseDifficulty = 12;
    const totalModifier = finalDifficulty - baseDifficulty;
    
    if (totalModifier === 0) return null;
    
    const modifiers: string[] = [];
    
    // Analizza i modificatori principali
    if (weatherState.currentWeather !== WeatherType.CLEAR) {
      const weatherName = get().getWeatherDescription(weatherState.currentWeather).split('.')[0];
      modifiers.push(`condizioni meteo (${weatherName.toLowerCase()})`);
    }
    
    if (!timeState.isDay) {
      modifiers.push('oscurità notturna');
    }
    
    const healthPercentage = characterSheet.currentHP / characterSheet.maxHP;
    if (healthPercentage < 0.5) {
      modifiers.push('ferite');
    }
    
    if (survivalState.hunger < 50 || survivalState.thirst < 50) {
      modifiers.push('fame/sete');
    }
    
    // Modificatori equipaggiamento
    const equipmentDescriptions = get().getEquipmentModifierDescription();
    if (equipmentDescriptions.length > 0) {
      modifiers.push(`equipaggiamento (${equipmentDescriptions.join(', ')})`);
    }
    
    if (modifiers.length === 0) return null;
    
    const difficultyText = totalModifier > 0 ? 'più difficile' : 'più facile';
    const modifierText = modifiers.join(', ');
    
    return `L'attraversamento sarà ${difficultyText} del normale a causa di: ${modifierText}.`;
  },

  calculateEquipmentModifierForRiver: (): number => {
    const { characterSheet, items } = get();
    let modifier = 0;
    
    // Analizza equipaggiamento indossato
    const equipment = characterSheet.equipment;
    
    // Armatura - più pesante = più difficile attraversare
    if (equipment.armor.itemId) {
      const armor = items[equipment.armor.itemId];
      if (armor) {
        // Armature pesanti rendono l'attraversamento più difficile
        if (armor.name.toLowerCase().includes('pesante') || 
            armor.name.toLowerCase().includes('piastre') ||
            armor.name.toLowerCase().includes('maglia')) {
          modifier += 2; // Penalità per armature pesanti
        } else if (armor.name.toLowerCase().includes('leggera') ||
                   armor.name.toLowerCase().includes('cuoio')) {
          modifier += 0; // Armature leggere neutrali
        }
      }
    }
    
    // Armi - armi pesanti a due mani rendono più difficile l'equilibrio
    if (equipment.weapon.itemId) {
      const weapon = items[equipment.weapon.itemId];
      if (weapon) {
        if (weapon.name.toLowerCase().includes('due mani') ||
            weapon.name.toLowerCase().includes('martello') ||
            weapon.name.toLowerCase().includes('ascia grande')) {
          modifier += 1; // Penalità per armi pesanti
        }
      }
    }
    
    // Oggetti utili nell'inventario
    const inventory = characterSheet.inventory;
    for (const slot of inventory) {
      if (slot) {
        const item = items[slot.itemId];
        if (item) {
          // Corda - aiuta nell'attraversamento
          if (item.name.toLowerCase().includes('corda')) {
            modifier -= 2; // Bonus significativo
          }
          // Stivali impermeabili o simili
          else if (item.name.toLowerCase().includes('stivali') && 
                   (item.name.toLowerCase().includes('impermeabili') ||
                    item.name.toLowerCase().includes('gomma'))) {
            modifier -= 1; // Bonus per stivali adatti
          }
          // Zaino pesante
          else if (item.name.toLowerCase().includes('zaino') && 
                   item.name.toLowerCase().includes('grande')) {
            modifier += 1; // Penalità per peso extra
          }
        }
      }
    }
    
    return modifier;
  },

  getEquipmentModifierDescription: (): string[] => {
    const { characterSheet, items } = get();
    const descriptions: string[] = [];
    
    // Analizza equipaggiamento per descrizioni
    const equipment = characterSheet.equipment;
    
    if (equipment.armor.itemId) {
      const armor = items[equipment.armor.itemId];
      if (armor && (armor.name.toLowerCase().includes('pesante') || 
                    armor.name.toLowerCase().includes('piastre'))) {
        descriptions.push('armatura pesante');
      }
    }
    
    if (equipment.weapon.itemId) {
      const weapon = items[equipment.weapon.itemId];
      if (weapon && (weapon.name.toLowerCase().includes('due mani') ||
                     weapon.name.toLowerCase().includes('martello'))) {
        descriptions.push('arma ingombrante');
      }
    }
    
    // Oggetti utili
    const inventory = characterSheet.inventory;
    for (const slot of inventory) {
      if (slot) {
        const item = items[slot.itemId];
        if (item) {
          if (item.name.toLowerCase().includes('corda')) {
            descriptions.push('corda (aiuto)');
          } else if (item.name.toLowerCase().includes('stivali') && 
                     item.name.toLowerCase().includes('impermeabili')) {
            descriptions.push('stivali impermeabili (aiuto)');
          }
        }
      }
    }
    
    return descriptions;
  },

  createClearWeather: (): WeatherState => ({
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

  getWeatherDescription: (weather: WeatherType): string => {
    const descriptions = {
      [WeatherType.CLEAR]: 'Il cielo si schiarisce, rivelando un sole pallido che filtra attraverso l\'aria polverosa. La visibilità migliora notevolmente.',
      [WeatherType.LIGHT_RAIN]: 'Gocce sottili iniziano a cadere dal cielo grigio, creando piccole pozze sul terreno arido. L\'aria si fa più umida.',
      [WeatherType.HEAVY_RAIN]: 'La pioggia battente trasforma il paesaggio in un mare di fango. Ogni passo diventa una lotta contro gli elementi.',
      [WeatherType.STORM]: 'Una tempesta furiosa scuote la terra desolata. Lampi illuminano brevemente l\'orizzonte mentre il vento ulula tra le rovine.',
      [WeatherType.FOG]: 'Una nebbia spettrale avvolge tutto in un manto grigio. Il mondo oltre pochi metri scompare in un\'inquietante foschia.',
      [WeatherType.WIND]: 'Raffiche violente sollevano nuvole di polvere e detriti, rendendo difficile tenere gli occhi aperti. Il vento porta con sé echi del passato.'
    };
    return descriptions[weather] || 'Il tempo cambia in modi che sfidano ogni comprensione, come se la natura stessa fosse stata corrotta.';
  },

  getRandomWeatherMessage: (weather: WeatherType): string => {
    const weatherMessages = {
      [WeatherType.CLEAR]: [
        'I raggi del sole filtrano attraverso l\'aria, riscaldando leggermente il tuo volto.',
        'Il cielo sereno offre una tregua dalla desolazione circostante.',
        'Una brezza leggera porta con sé il profumo di terre lontane.',
        'La luce del sole rivela dettagli nascosti nel paesaggio.'
      ],
      [WeatherType.LIGHT_RAIN]: [
        'Le gocce di pioggia tamburellano dolcemente sulle superfici metalliche abbandonate.',
        'L\'umidità nell\'aria porta un senso di rinnovamento in questo mondo arido.',
        'La pioggia leggera crea riflessi argentei sulle pozzanghere.',
        'Il suono della pioggia maschera i tuoi passi.'
      ],
      [WeatherType.HEAVY_RAIN]: [
        'La pioggia torrenziale rende il terreno scivoloso e traditore.',
        'L\'acqua scorre in rivoli lungo i detriti, creando nuovi percorsi.',
        'Il martellare della pioggia è assordante, coprendo ogni altro suono.',
        'Ti rifugi momentaneamente sotto una lamiera arrugginita.'
      ],
      [WeatherType.STORM]: [
        'Un fulmine illumina il paesaggio desolato per un istante accecante.',
        'Il tuono rimbomba tra le rovine come il grido di un gigante ferito.',
        'Il vento della tempesta minaccia di trascinarti via.',
        'La furia degli elementi ti ricorda quanto sei piccolo in questo mondo.'
      ],
      [WeatherType.FOG]: [
        'Forme indistinte emergono e scompaiono nella nebbia come fantasmi.',
        'Il mondo si riduce a pochi metri di visibilità inquietante.',
        'La nebbia sembra sussurrare segreti che non riesci a comprendere.',
        'Ogni passo nella foschia è un salto nel vuoto.'
      ],
      [WeatherType.WIND]: [
        'Il vento porta con sé frammenti di carta e foglie secche del passato.',
        'Le raffiche fanno gemere le strutture metalliche abbandonate.',
        'Il vento ulula una melodia malinconica tra i rottami.',
        'Devi lottare contro le raffiche per mantenere l\'equilibrio.'
      ]
    };

    const messages = weatherMessages[weather];
    return messages ? messages[Math.floor(Math.random() * messages.length)] : 'Il tempo si comporta in modo strano.';
  },

  // --- SISTEMA ATTRAVERSAMENTO FIUMI v0.6.1 ---

  attemptRiverCrossing: (): boolean => {
    const { addLogEntry, performAbilityCheck, updateHP, calculateRiverDifficulty, weatherState } = get();

    // Calcola difficoltà basata su meteo e condizioni
    const difficulty = calculateRiverDifficulty();

    // Messaggio iniziale con descrizione delle condizioni
    const weatherDescription = get().getRiverCrossingWeatherDescription();
    addLogEntry(MessageType.AMBIANCE_RANDOM, {
      text: `Ti avvicini alla riva del fiume. ${weatherDescription}`
    });

    // Messaggio informativo sui modificatori applicati
    const modifierInfo = get().getRiverCrossingModifierInfo(difficulty);
    if (modifierInfo) {
      addLogEntry(MessageType.AMBIANCE_RANDOM, {
        text: modifierInfo
      });
    }

    // Esegui skill check Agilità
    const result = performAbilityCheck('agilita', difficulty, false);

    if (result.success) {
      // Successo - attraversamento riuscito
      const successDescription = get().getRiverCrossingSuccessDescription();
      addLogEntry(MessageType.SKILL_CHECK_SUCCESS, {
        action: 'attraversamento fiume',
        roll: result.roll,
        modifier: result.modifier,
        total: result.total,
        difficulty: difficulty,
        description: successDescription
      });
      return true;
    } else {
      // Fallimento - subisci danni variabili basati su meteo
      let baseDamage = Math.floor(Math.random() * 3) + 1; // 1-3 danni base
      
      // Danni extra per condizioni meteo severe
      let weatherDamage = 0;
      switch (weatherState.currentWeather) {
        case WeatherType.STORM:
          weatherDamage = Math.floor(Math.random() * 2) + 1; // +1-2 danni extra
          break;
        case WeatherType.HEAVY_RAIN:
          weatherDamage = Math.floor(Math.random() * 2); // +0-1 danni extra
          break;
        case WeatherType.FOG:
          // Nebbia può causare danni da disorientamento
          if (Math.random() < 0.3) weatherDamage = 1;
          break;
      }

      const totalDamage = baseDamage + weatherDamage;
      updateHP(-totalDamage);

      addLogEntry(MessageType.SKILL_CHECK_FAILURE, {
        action: 'attraversamento fiume',
        roll: result.roll,
        modifier: result.modifier,
        total: result.total,
        difficulty: difficulty
      });

      const failureDescription = get().getRiverCrossingFailureDescription(totalDamage, weatherDamage > 0);
      addLogEntry(MessageType.HP_DAMAGE, {
        damage: totalDamage,
        reason: 'attraversamento fiume fallito',
        description: failureDescription
      });

      return true; // Attraversamento riuscito ma con danni
    }
  },

  calculateRiverDifficulty: (): number => {
    const { weatherState, characterSheet, timeState } = get();
    let baseDifficulty = 12; // Difficoltà base moderata

    // Modificatori meteo avanzati - v0.6.1
    switch (weatherState.currentWeather) {
      case WeatherType.CLEAR:
        // Tempo sereno - nessuna penalità, possibile bonus leggero
        baseDifficulty -= 1;
        break;
      case WeatherType.LIGHT_RAIN:
        // Pioggia leggera - terreno scivoloso
        baseDifficulty += 2;
        break;
      case WeatherType.HEAVY_RAIN:
        // Pioggia intensa - corrente più forte, visibilità ridotta
        baseDifficulty += 4;
        break;
      case WeatherType.STORM:
        // Tempesta - condizioni estremamente pericolose
        baseDifficulty += 7;
        break;
      case WeatherType.FOG:
        // Nebbia - visibilità molto ridotta, difficile valutare la corrente
        baseDifficulty += 3;
        break;
      case WeatherType.WIND:
        // Vento forte - può destabilizzare durante l'attraversamento
        baseDifficulty += 2;
        break;
    }

    // Modificatori intensità meteo
    const intensityModifier = Math.floor((weatherState.intensity - 50) / 20); // -2 a +2
    baseDifficulty += intensityModifier;

    // Modificatori temporali - l'attraversamento notturno è più pericoloso
    if (!timeState.isDay) {
      baseDifficulty += 3; // Penalità notturna significativa
    }

    // Modificatori salute
    const healthPercentage = characterSheet.currentHP / characterSheet.maxHP;
    if (healthPercentage < 0.25) {
      baseDifficulty += 4; // Molto ferito - penalità aumentata
    } else if (healthPercentage < 0.5) {
      baseDifficulty += 2; // Ferito - penalità moderata
    } else if (healthPercentage < 0.75) {
      baseDifficulty += 1; // Leggermente ferito
    }

    // Modificatori sopravvivenza - fame e sete influenzano l'agilità
    const { survivalState } = get();
    if (survivalState.hunger < 25 || survivalState.thirst < 25) {
      baseDifficulty += 3; // Fame/sete critica
    } else if (survivalState.hunger < 50 || survivalState.thirst < 50) {
      baseDifficulty += 1; // Fame/sete moderata
    }

    // Modificatori equipaggiamento - v0.6.1
    const equipmentModifier = get().calculateEquipmentModifierForRiver();
    baseDifficulty += equipmentModifier;

    return Math.min(25, Math.max(6, baseDifficulty)); // Clamp tra 6 e 25
  },

  triggerEvent: (biomeKey) => {
    if (get().currentEvent) return; // Evita di sovrascrivere eventi
    const { eventDatabase, seenEventIds } = get();
    
    // Prima prova eventi non ancora visti
    let availableEvents = (eventDatabase[biomeKey] || []).filter(event => 
      !event.isUnique && !seenEventIds.includes(event.id)
    );
    
    // Se non ci sono eventi non visti, riconsidera tutti gli eventi ripetibili
    if (availableEvents.length === 0) {
      availableEvents = (eventDatabase[biomeKey] || []).filter(event => !event.isUnique);
    }
    
    // Se ancora nessun evento disponibile, esci
    if (availableEvents.length === 0) return;

    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    // Aggiungi agli eventi visti solo se non è già presente (per eventi ripetibili)
    set(state => ({ 
      currentEvent: event, 
      seenEventIds: state.seenEventIds.includes(event.id) 
        ? state.seenEventIds 
        : [...state.seenEventIds, event.id] 
    }));
    
    get().setCurrentScreen('event');
  },

  resolveChoice: (choice) => {
    if (!get().currentEvent) return;
    const { addLogEntry, performAbilityCheck, addItem, updateHP, addExperience } = get();

    // Funzione helper per applicare un risultato specifico
    const applyOutcome = (outcome: EventChoice) => {
      if (outcome.items_gained) {
        outcome.items_gained.forEach(reward => addItem(reward.id, reward.quantity));
      }
      
      // Gestione conseguenze rest stop
      if (outcome.consequences) {
        if (outcome.consequences.hp) {
          updateHP(outcome.consequences.hp);
          addLogEntry(MessageType.HP_RECOVERY, { healing: outcome.consequences.hp });
        }
        if (outcome.consequences.narrative_text) {
          addLogEntry(MessageType.EVENT_CHOICE, { text: outcome.consequences.narrative_text });
        }
      }
      
      if (outcome.reward) {
        switch (outcome.reward.type) {
          case 'xp_gain':
            if (outcome.reward.amount) {
              addExperience(outcome.reward.amount);
              addLogEntry(MessageType.ACTION_SUCCESS, { action: `Guadagni ${outcome.reward.amount} XP.` });
            }
            break;
          case 'hp_gain':
              if (outcome.reward.amount) {
              updateHP(outcome.reward.amount);
              addLogEntry(MessageType.HP_RECOVERY, { healing: outcome.reward.amount });
            }
            break;
          // Aggiungere qui altri tipi di ricompense speciali
        }
      }
    };

    // Funzione helper per applicare una penalità
    const applyPenalty = (penalty: Penalty | undefined) => {
      if (!penalty) return;
      switch (penalty.type) {
        case 'damage':
          if (penalty.amount) {
            updateHP(-penalty.amount);
            addLogEntry(MessageType.HP_DAMAGE, { damage: penalty.amount, reason: 'le conseguenze di un evento' });
          }
          break;
        // Aggiungere qui altri tipi di penalità
      }
    };

    if (choice.skillCheck) {
      const checkResult = performAbilityCheck(choice.skillCheck.stat, choice.skillCheck.difficulty, true); // addToJournal = true
      const resultText = checkResult.success ? choice.successText : choice.failureText;

      // Aggiungi un log più specifico per l'evento, non usando quello di performAbilityCheck
      addLogEntry(MessageType.EVENT_CHOICE, { text: resultText });

      if (checkResult.success) {
        applyOutcome(choice);
      } else {
        applyPenalty(choice.penalty);
      }
    } else {
      // Nessun skill check, applica direttamente il risultato
      if (choice.resultText) {
        addLogEntry(MessageType.EVENT_CHOICE, { text: choice.resultText });
      }
      applyOutcome(choice);
    }

    // Se è un evento rest stop e la scelta è "riposare", esegui anche il riposo normale
    const currentEvent = get().currentEvent;
    if (currentEvent?.biome === 'rest_stop' && choice.id === 'rest_choice') {
      // Esegui riposo aggiuntivo (tempo)
      const restTime = Math.floor(Math.random() * 120) + 120; // 120-240 minuti
      get().advanceTime(restTime);
    }

    set({ currentEvent: null });
    get().goBack();
  },

  updateHP: (amount) => set(state => ({
    characterSheet: {
      ...state.characterSheet,
      currentHP: Math.max(0, Math.min(state.characterSheet.maxHP, state.characterSheet.currentHP + amount)),
    }
  })),

  addExperience: (xpGained) => set(state => {
    const newXP = state.characterSheet.experience.currentXP + xpGained;
    return {
      characterSheet: {
        ...state.characterSheet,
        experience: {
          ...state.characterSheet.experience,
          currentXP: newXP,
          canLevelUp: newXP >= state.characterSheet.experience.xpForNextLevel && state.characterSheet.level < 20,
        }
      }
    }
  }),

  updateCharacterSheet: (newSheet) => set({ characterSheet: newSheet }),

  getModifier: (ability) => Math.floor((get().characterSheet.stats[ability] - 10) / 2),

  performAbilityCheck: (ability, difficulty, addToJournal = true, successMessageType) => {
    const { getModifier, addLogEntry, addExperience, getWeatherEffects } = get();
    const baseModifier = getModifier(ability);
    const weatherEffects = getWeatherEffects();
    const weatherModifier = weatherEffects.skillCheckModifier;
    const totalModifier = baseModifier + weatherModifier;

    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + totalModifier;
    const success = total >= difficulty;

    addExperience(success ? 5 : 1);

    const result: AbilityCheckResult = { success, roll, modifier: totalModifier, total, difficulty };

    if (addToJournal) {
      const context = {
        ability,
        roll,
        modifier: totalModifier,
        baseModifier,
        weatherModifier,
        total,
        difficulty
      };
      addLogEntry(success ? (successMessageType || MessageType.SKILL_CHECK_SUCCESS) : MessageType.SKILL_CHECK_FAILURE, context);
    }
    return result;
  },

  shortRest: () => {
    const { characterSheet, addLogEntry, updateHP, advanceTime, eventDatabase } = get();
    if (isDead(characterSheet.currentHP)) {
      addLogEntry(MessageType.REST_BLOCKED, { reason: 'sei morto' });
      return;
    }

    // 30% possibilità di evento rest stop durante il riposo
    const restStopEvents = eventDatabase['REST_STOP'] || [];
    if (restStopEvents.length > 0 && Math.random() < 0.30) {
      // Attiva evento rest stop casuale
      const event = restStopEvents[Math.floor(Math.random() * restStopEvents.length)];
      set({ currentEvent: event });
      get().setCurrentScreen('event');
      return; // L'evento gestirà il riposo
    }

    // Riposo normale senza eventi
    const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
    const recoveryPercentage = 0.8 + (Math.random() * 0.15); // 80-95%
    const healingAmount = Math.floor(maxRecovery * recoveryPercentage);

    updateHP(healingAmount);
    addLogEntry(MessageType.REST_SUCCESS, { healingAmount });

    const restTime = Math.floor(Math.random() * 120) + 120; // 120-240 minuti
    advanceTime(restTime);
  },

  handleNightConsumption: () => {
    const { timeState, characterSheet, items, addLogEntry, updateHP } = get();
    const currentDay = timeState.day;

    let foodConsumed = false;
    let drinkConsumed = false;
    const newInventory = [...characterSheet.inventory];

    const foodIndex = newInventory.findIndex(slot => slot && items[slot.itemId]?.effect === 'satiety' && slot.quantity > 0);
    if (foodIndex !== -1) {
      const slot = newInventory[foodIndex]!;
      slot.quantity -= 1;
      if (slot.quantity === 0) newInventory[foodIndex] = null;
      foodConsumed = true;
    }

    const drinkIndex = newInventory.findIndex(slot => slot && items[slot.itemId]?.effect === 'hydration' && slot.quantity > 0);
    if (drinkIndex !== -1) {
      const slot = newInventory[drinkIndex]!;
      slot.quantity -= 1;
      if (slot.quantity === 0) newInventory[drinkIndex] = null;
      drinkConsumed = true;
    }

    addLogEntry(MessageType.SURVIVAL_NIGHT_CONSUME);
    if (!foodConsumed || !drinkConsumed) {
      const penalty = (!foodConsumed && !drinkConsumed) ? 3 : 1;
      updateHP(-penalty);
      addLogEntry(MessageType.SURVIVAL_PENALTY);
    }

    set(state => ({
      characterSheet: { ...state.characterSheet, inventory: newInventory },
      survivalState: { ...state.survivalState, lastNightConsumption: { day: currentDay, consumed: true } }
    }));
  },

  consumeFood: () => { /* Placeholder */ },
  consumeDrink: () => { /* Placeholder */ },

  updateBiome: (newBiomeChar) => {
    // Sistema attraversamento fiumi
    if (newBiomeChar === '~') {
      get().attemptRiverCrossing();
      // Il movimento continua indipendentemente dal successo
      // I danni sono già stati applicati nella funzione attemptRiverCrossing
      return;
    }

    if (newBiomeChar === 'R') {
      const {
        playerPosition,
        timeState,
        addLogEntry,
        setCurrentScreen,
        handleNightConsumption,
        advanceTime,
        characterSheet,
        updateHP,
        getShelterInfo,
        createShelterInfo,
        updateShelterAccess,
        isShelterAccessible
      } = get();

      const { x, y } = playerPosition;
      let shelterInfo = getShelterInfo(x, y);

      // Se è la prima volta che visitiamo questo rifugio, crealo
      if (!shelterInfo) {
        shelterInfo = createShelterInfo(x, y);
        set(state => ({
          shelterAccessState: {
            ...state.shelterAccessState,
            [shelterInfo!.coordinates]: shelterInfo!
          }
        }));
      }

      // Controlla accessibilità
      if (!isShelterAccessible(x, y)) {
        addLogEntry(MessageType.DISCOVERY, {
          discovery: 'rifugio già visitato durante il giorno - ora è sigillato. Torna di notte per riposare.'
        });
        return;
      }

      if (timeState.isDay) {
        // Visita diurna - marca come non più accessibile per future visite diurne
        updateShelterAccess(x, y, {
          isAccessible: false,
          dayVisited: timeState.day,
          timeVisited: timeState.currentTime
        });

        setCurrentScreen('shelter');
        addLogEntry(MessageType.DISCOVERY, { discovery: 'rifugio sicuro trovato - puoi riposare e investigare. Ricorda: ogni rifugio può essere visitato solo una volta di giorno!' });
      } else {
        // Visita notturna - riposo automatico (sempre permesso)
        handleNightConsumption();
        const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
        const nightHealing = Math.floor(maxRecovery * 0.6);
        updateHP(nightHealing);
        addLogEntry(MessageType.REST_SUCCESS, {
          healingAmount: nightHealing,
          location: 'rifugio notturno'
        });

        // Avanza al mattino
        const minutesToDawn = (1440 - timeState.currentTime + DAWN_TIME) % 1440;
        advanceTime(minutesToDawn);
      }
    }
  },

  useItem: (slotIndex) => {
    const { characterSheet, items, addLogEntry, updateHP } = get();
    const itemStack = characterSheet.inventory[slotIndex];
    if (!itemStack) return false;
    const item = items[itemStack.itemId];
    if (!item || !item.effect) return false;

    let effectApplied = 0;
    let messageContext: Record<string, any> = { item: item.name };
    const newInventory = [...characterSheet.inventory];
    const currentStack = newInventory[slotIndex];
    if (!currentStack) return false;

    if (item.portionsPerUnit && item.portionEffect) {
      let currentPortions = currentStack.portions ?? item.portionsPerUnit;
      currentPortions -= 1;
      effectApplied = item.portionEffect;
      if (currentPortions > 0) {
        currentStack.portions = currentPortions;
      } else {
        currentStack.quantity -= 1;
        if (currentStack.quantity > 0) currentStack.portions = item.portionsPerUnit;
        else newInventory[slotIndex] = null;
      }
    } else {
      effectApplied = Number(item.effectValue) || 0;
      currentStack.quantity -= 1;
      if (currentStack.quantity === 0) newInventory[slotIndex] = null;
    }

    // Gestione effetti speciali per manuali di crafting
    if (item.effect === 'unlock_recipes') {
      const manualId = item.effectValue as string;
      
      // Chiama la funzione di callback per sbloccare ricette
      if (get().unlockRecipesCallback) {
        get().unlockRecipesCallback(manualId);
      }
      
      addLogEntry(MessageType.DISCOVERY, { 
        discovery: `Hai studiato il ${item.name} e imparato nuove ricette!` 
      });
      
      // Rimuovi il manuale dall'inventario (non stackable, quindi rimuovi 1)
      currentStack.quantity -= 1;
      if (currentStack.quantity === 0) newInventory[slotIndex] = null;
      
      set(state => ({ characterSheet: { ...state.characterSheet, inventory: newInventory } }));
      return true;
      
    } else if (effectApplied > 0) {
      switch (item.effect) {
        case 'heal': updateHP(effectApplied); addLogEntry(MessageType.HP_RECOVERY, { healing: effectApplied }); break;
        case 'satiety': set(s => ({ survivalState: { ...s.survivalState, hunger: Math.min(100, s.survivalState.hunger + effectApplied) } })); break;
        case 'hydration': set(s => ({ survivalState: { ...s.survivalState, thirst: Math.min(100, s.survivalState.thirst + effectApplied) } })); break;
      }
      addLogEntry(MessageType.ITEM_USED, messageContext);
      set(state => ({ characterSheet: { ...state.characterSheet, inventory: newInventory } }));
      return true;
    }
    
    return false;
  },

  addItem: (itemId, quantity = 1) => {
    const { items, characterSheet, addLogEntry } = get();
    const item = items[itemId];
    if (!item) return false;
    const newInventory = [...characterSheet.inventory];
    let added = false;
    if (item.stackable) {
      const slot = newInventory.find(s => s?.itemId === itemId);
      if (slot) { slot.quantity += quantity; added = true; }
    }
    if (!added) {
      const emptyIdx = newInventory.findIndex(s => !s);
      if (emptyIdx !== -1) {
        newInventory[emptyIdx] = { itemId, quantity, portions: item.portionsPerUnit };
        added = true;
      }
    }
    if (added) {
      set({ characterSheet: { ...characterSheet, inventory: newInventory } });
      addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity });
      return true;
    }
    addLogEntry(MessageType.INVENTORY_FULL, { item: item.name });
    return false;
  },

  removeItem: (slotIndex, quantity = 1) => {
    const { characterSheet } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return false;
    const newInventory = [...characterSheet.inventory];
    const currentSlot = newInventory[slotIndex]!;
    if (currentSlot.quantity <= quantity) {
      newInventory[slotIndex] = null;
    } else {
      currentSlot.quantity -= quantity;
    }
    set({ characterSheet: { ...characterSheet, inventory: newInventory } });
    return true;
  },

  equipItemFromInventory: (slotIndex) => {
    const { characterSheet, items, addLogEntry } = get();
    const result = equipItem(characterSheet, items, slotIndex);
    if (result.success) {
      set({ characterSheet: result.updatedCharacterSheet });
      addLogEntry(MessageType.ACTION_SUCCESS, { action: result.message });
    } else {
      addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
    }
  },

  dropItem: (slotIndex) => {
    const { characterSheet, items, addLogEntry } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return;
    const item = items[slot.itemId];
    if (item?.type === 'quest') {
      addLogEntry(MessageType.ACTION_FAIL, { reason: `${item.name} è troppo importante.` });
      return;
    }
    get().removeItem(slotIndex, slot.quantity);
    addLogEntry(MessageType.INVENTORY_CHANGE, { action: `Hai gettato ${item.name}.` });
  },

  consumeItem: (slotIndex) => {
    const { characterSheet, items, addLogEntry, survivalState } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return false;

    const item = items[slot.itemId];
    if (!item || (item.type !== 'consumable' && item.type !== 'Consumable')) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'Questo oggetto non è consumabile.' });
      return false;
    }

    // Applica effetto dell'oggetto
    let effectApplied = false;
    const effectValue = typeof item.effectValue === 'number' ? item.effectValue : parseInt(item.effectValue as string) || 0;

    switch (item.effect) {
      case 'heal':
        const healAmount = effectValue;
        const oldHP = characterSheet.currentHP;
        const newHP = Math.min(characterSheet.maxHP, oldHP + healAmount);
        const actualHeal = newHP - oldHP;
        
        if (actualHeal > 0) {
          get().updateHP(actualHeal);
          addLogEntry(MessageType.HP_RECOVERY, { 
            healing: actualHeal, 
            item: item.name 
          });
          effectApplied = true;
        } else {
          addLogEntry(MessageType.ACTION_FAIL, { 
            reason: 'Sei già in piena salute.' 
          });
          return false;
        }
        break;

      case 'satiety':
        const hungerRestore = effectValue;
        const newHunger = Math.min(100, survivalState.hunger + hungerRestore);
        const actualHungerRestore = newHunger - survivalState.hunger;
        
        if (actualHungerRestore > 0) {
          set(state => ({
            survivalState: {
              ...state.survivalState,
              hunger: newHunger
            }
          }));
          addLogEntry(MessageType.ACTION_SUCCESS, { 
            action: `Hai consumato ${item.name}. Sazietà ripristinata: +${actualHungerRestore}` 
          });
          effectApplied = true;
        } else {
          addLogEntry(MessageType.ACTION_FAIL, { 
            reason: 'Non hai fame al momento.' 
          });
          return false;
        }
        break;

      case 'hydration':
        const thirstRestore = effectValue;
        const newThirst = Math.min(100, survivalState.thirst + thirstRestore);
        const actualThirstRestore = newThirst - survivalState.thirst;
        
        if (actualThirstRestore > 0) {
          set(state => ({
            survivalState: {
              ...state.survivalState,
              thirst: newThirst
            }
          }));
          addLogEntry(MessageType.ACTION_SUCCESS, { 
            action: `Hai bevuto ${item.name}. Sete ripristinata: +${actualThirstRestore}` 
          });
          effectApplied = true;
        } else {
          addLogEntry(MessageType.ACTION_FAIL, { 
            reason: 'Non hai sete al momento.' 
          });
          return false;
        }
        break;

      default:
        addLogEntry(MessageType.ACTION_FAIL, { 
          reason: `Effetto sconosciuto: ${item.effect}` 
        });
        return false;
    }

    // Se l'effetto è stato applicato, rimuovi l'oggetto
    if (effectApplied) {
      get().removeItem(slotIndex, 1);
      return true;
    }

    return false;
  },

  // --- SAVE/LOAD SYSTEM ---
  saveCurrentGame: async (slot) => {
    const state = get();

    try {
      // Mostra notifica di salvataggio in corso
      get().addNotification({
        type: 'info',
        title: 'Salvataggio',
        message: 'Salvataggio in corso...',
        duration: 1000
      });

      const gameData = {
        timeState: state.timeState,
        playerPosition: state.playerPosition,
        currentScreen: state.currentScreen,
        currentBiome: state.currentBiome,
        shelterAccessState: state.shelterAccessState, // v0.6.1
        weatherState: state.weatherState, // v0.6.1
        seenEventIds: state.seenEventIds,
        gameFlags: {} // per future espansioni
      };

      const success = await saveSystem.saveGame(
        state.characterSheet,
        state.survivalState,
        gameData,
        slot
      );

      if (success) {
        get().addNotification({
          type: 'success',
          title: 'Salvataggio Completato',
          message: `Partita salvata nello slot ${slot === 'quicksave' ? 'Salvataggio Rapido' : slot.replace('slot', '')}`,
          duration: 2000
        });

        // Aggiungi al journal
        get().addLogEntry(MessageType.AMBIANCE_RANDOM, {
          text: `Partita salvata: ${state.characterSheet.name} - Livello ${state.characterSheet.level}`
        });
      } else {
        get().addNotification({
          type: 'error',
          title: 'Errore Salvataggio',
          message: 'Impossibile salvare la partita. Riprova.',
          duration: 4000
        });
      }

      return success;
    } catch (error) {
      console.error('Save error:', error);
      get().addNotification({
        type: 'error',
        title: 'Errore Salvataggio',
        message: 'Errore durante il salvataggio. Controlla lo spazio disponibile.',
        duration: 4000
      });
      return false;
    }
  },

  loadSavedGame: async (slot) => {
    try {
      // Mostra notifica di caricamento in corso
      get().addNotification({
        type: 'info',
        title: 'Caricamento',
        message: 'Caricamento partita in corso...',
        duration: 1000
      });

      const saveData = await saveSystem.loadGame(slot);

      if (saveData) {
        // Validazione dati salvati
        if (!saveData.characterSheet || !saveData.gameData) {
          throw new Error('Dati di salvataggio corrotti o incompleti');
        }

        // **NUOVA LOGICA: Assicura che la mappa sia caricata**
        let mapData = get().mapData;
        if (mapData.length === 0) {
          try {
            const response = await fetch('/map.txt');
            const mapText = await response.text();
            mapData = mapText.split('\n').filter(line => line);
          } catch (error) {
            console.error("Failed to load map data during game load:", error);
            // Lancia un errore per bloccare il caricamento se la mappa non è disponibile
            throw new Error('Impossibile caricare i dati della mappa. Caricamento annullato.');
          }
        }

        // Ricostruisci lo stato del gioco dai dati salvati
        set({
          mapData,
          isMapLoading: false, // <-- AGGIUNGI QUESTA RIGA
          playerPosition: saveData.gameData.playerPosition,
          timeState: saveData.gameData.timeState,
          characterSheet: saveData.characterSheet,
          survivalState: saveData.survivalState,
          currentBiome: saveData.gameData.currentBiome,
          shelterAccessState: (saveData.gameData as any).shelterAccessState || {},
          weatherState: (saveData.gameData as any).weatherState || get().weatherState,
          currentScreen: 'game', // Torna alla schermata di gioco dopo il caricamento
          logEntries: [], // Reset del journal per evitare confusione
          seenEventIds: (saveData.gameData as any).seenEventIds || [],
          notifications: [], // Reset notifiche per nuovo caricamento
        });

        // Resetta le investigazioni per la nuova sessione
        get().resetShelterInvestigations();

        get().addNotification({
          type: 'success',
          title: 'Caricamento Completato',
          message: `Benvenuto/a, ${saveData.characterSheet.name}! Partita caricata con successo.`,
          duration: 3000
        });

        // Aggiungi messaggio di benvenuto al journal
        get().addLogEntry(MessageType.AMBIANCE_RANDOM, {
          text: `Partita caricata: ${saveData.characterSheet.name} - Livello ${saveData.characterSheet.level} - Giorno ${saveData.gameData.timeState.day}`
        });

        return true;
      } else {
        get().addNotification({
          type: 'error',
          title: 'Errore Caricamento',
          message: 'Salvataggio non trovato o corrotto',
          duration: 4000
        });
        return false;
      }
    } catch (error) {
      console.error('Load error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';

      get().addNotification({
        type: 'error',
        title: 'Errore Caricamento',
        message: `Impossibile caricare la partita: ${errorMessage}`,
        duration: 5000
      });
      return false;
    }
  },

  handleQuickSave: async () => {
    return await get().saveCurrentGame('quicksave');
  },

  handleQuickLoad: async () => {
    const success = await get().loadSavedGame('quicksave');
    if (success) {
      get().setCurrentScreen('game');
    }
    return success;
  },

  getSaveSlots: () => saveSystem.getSaveSlotInfo(),
  deleteSave: (slot) => saveSystem.deleteSave(slot),
  exportSave: async (slot) => {
    try {
      get().addNotification({
        type: 'info',
        title: 'Export Salvataggio',
        message: 'Preparazione export in corso...',
        duration: 1000
      });

      const saveContent = saveSystem.exportSave(slot);

      if (!saveContent) {
        get().addNotification({
          type: 'error',
          title: 'Export Fallito',
          message: 'Salvataggio non trovato o corrotto',
          duration: 3000
        });
        return null;
      }

      // Parse per ottenere informazioni del personaggio
      const saveData = JSON.parse(saveContent);
      const characterName = saveData.characterSheet?.name || 'Sconosciuto';
      const level = saveData.characterSheet?.level || 1;

      const filename = generateSaveFilename(characterName, level, slot);

      downloadFile({
        filename,
        content: saveContent,
        mimeType: 'application/json'
      });

      get().addNotification({
        type: 'success',
        title: 'Export Completato',
        message: `Salvataggio esportato come ${filename}`,
        duration: 4000
      });

      return saveContent;
    } catch (error) {
      console.error('Export error:', error);
      get().addNotification({
        type: 'error',
        title: 'Errore Export',
        message: 'Errore durante l\'esportazione del salvataggio',
        duration: 4000
      });
      return null;
    }
  },

  importSave: async (slot) => {
    return new Promise<boolean>((resolve) => {
      try {
        get().addNotification({
          type: 'info',
          title: 'Import Salvataggio',
          message: 'Seleziona il file da importare...',
          duration: 2000
        });

        const input = createFileInput(async (file) => {
          try {
            // Validate file
            const validation = validateSaveFile(file);
            if (!validation.valid) {
              get().addNotification({
                type: 'error',
                title: 'File Non Valido',
                message: validation.error || 'File non supportato',
                duration: 4000
              });
              resolve(false);
              return;
            }

            get().addNotification({
              type: 'info',
              title: 'Import in Corso',
              message: 'Lettura e validazione file...',
              duration: 2000
            });

            // Read file content
            const content = await readFileAsText(file);

            // Import the save
            const success = await saveSystem.importSave(content, slot);

            if (success) {
              // Parse per ottenere informazioni del personaggio
              const saveData = JSON.parse(content);
              const characterName = saveData.characterSheet?.name || 'Sconosciuto';
              const level = saveData.characterSheet?.level || 1;

              get().addNotification({
                type: 'success',
                title: 'Import Completato',
                message: `Salvataggio di ${characterName} (Lv.${level}) importato con successo`,
                duration: 4000
              });
            } else {
              get().addNotification({
                type: 'error',
                title: 'Import Fallito',
                message: 'Salvataggio non valido o corrotto',
                duration: 4000
              });
            }

            resolve(success);
          } catch (error) {
            console.error('Import error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';

            get().addNotification({
              type: 'error',
              title: 'Errore Import',
              message: `Errore durante l'importazione: ${errorMessage}`,
              duration: 5000
            });
            resolve(false);
          }
        });

        // Trigger file selection
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      } catch (error) {
        console.error('Import setup error:', error);
        get().addNotification({
          type: 'error',
          title: 'Errore Import',
          message: 'Impossibile avviare l\'importazione',
          duration: 4000
        });
        resolve(false);
      }
    });
  },

  // Recovery function for corrupted saves
  recoverSave: async (slot) => {
    try {
      get().addNotification({
        type: 'info',
        title: 'Recupero Salvataggio',
        message: 'Tentativo di recupero in corso...',
        duration: 2000
      });

      const recoveredData = await saveSystem.recoverSave(slot);

      if (recoveredData) {
        get().addNotification({
          type: 'success',
          title: 'Recupero Riuscito',
          message: 'Salvataggio recuperato con successo! Alcuni dati potrebbero essere stati ripristinati ai valori predefiniti.',
          duration: 5000
        });
        return true;
      } else {
        get().addNotification({
          type: 'error',
          title: 'Recupero Fallito',
          message: 'Impossibile recuperare il salvataggio. I dati sono troppo corrotti.',
          duration: 4000
        });
        return false;
      }
    } catch (error) {
      get().addNotification({
        type: 'error',
        title: 'Errore Recupero',
        message: 'Errore durante il tentativo di recupero',
        duration: 4000
      });
      return false;
    }
  },

  // --- NOTIFICATION SYSTEM ---
  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set(state => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Callback system for avoiding circular dependencies
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => {
    set({ unlockRecipesCallback: callback });
  },
}));