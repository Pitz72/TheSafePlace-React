# DESIGN - Game Improvements v0.6.1

## Overview

Questo design implementa le correzioni e miglioramenti critici identificati nella riunione di progettazione per The Safe Place v0.6.0. L'architettura Zustand esistente verrà estesa per supportare le nuove funzionalità mantenendo la performance e la stabilità.

## Architecture

### Zustand Store Extensions

L'architettura attuale basata su Zustand (`gameStore.ts`) verrà estesa con:

```typescript
// Nuovi stati nel gameStore
interface GameState {
  // Esistenti...
  
  // Nuovi per v0.6.1
  weatherState: WeatherState;
  shelterAccessState: Record<string, ShelterAccessInfo>;
  audioSettings: AudioSettings;
  saveUIState: SaveUIState;
}
```

### Component Architecture

```
src/
├── components/
│   ├── LoadScreen.tsx          # Nuovo - Gestione caricamento partite
│   ├── WeatherDisplay.tsx      # Nuovo - Visualizzazione meteo
│   └── AudioManager.tsx        # Nuovo - Gestione audio retrò
├── systems/
│   ├── weatherSystem.ts        # Nuovo - Logica meteo
│   ├── audioSystem.ts          # Nuovo - Sistema beep retrò
│   └── shelterSystem.ts        # Modificato - Regole rifugi corrette
├── data/
│   ├── events/
│   │   ├── expanded_city_events.json      # Nuovo - 15 eventi città
│   │   ├── expanded_forest_events.json    # Nuovo - 15 eventi foresta
│   │   ├── expanded_plains_events.json    # Nuovo - 15 eventi pianura
│   │   ├── expanded_river_events.json     # Nuovo - 15 eventi fiume
│   │   └── expanded_village_events.json   # Nuovo - 15 eventi villaggio
│   └── weather/
│       └── weatherPatterns.json           # Nuovo - Pattern meteo
└── utils/
    ├── saveSystem.ts           # Modificato - UI migliorata
    └── riverCrossing.ts        # Nuovo - Logica attraversamento
```

## Components and Interfaces

### 1. Weather System

```typescript
interface WeatherState {
  currentWeather: WeatherType;
  intensity: number; // 0-100
  duration: number; // minuti rimanenti
  nextWeatherChange: number; // timestamp
}

enum WeatherType {
  CLEAR = 'clear',
  LIGHT_RAIN = 'light_rain',
  HEAVY_RAIN = 'heavy_rain',
  STORM = 'storm',
  FOG = 'fog',
  WIND = 'wind'
}

interface WeatherEffects {
  movementModifier: number; // moltiplicatore velocità
  survivalModifier: number; // consumo risorse extra
  skillCheckModifier: number; // penalità skill check
  eventProbabilityModifier: number; // modifica probabilità eventi
}
```

### 2. Shelter System Improvements

```typescript
interface ShelterAccessInfo {
  coordinates: string; // "x,y"
  dayVisited: number; // giorno della prima visita
  timeVisited: number; // ora della prima visita
  hasBeenInvestigated: boolean;
  isAccessible: boolean; // false dopo prima visita diurna
  investigationResults?: string[]; // per debugging
}

interface ShelterRules {
  maxDayVisits: 1; // Solo una visita diurna
  maxInvestigationsPerSession: 1; // Una investigazione per sessione
  nightAccessAlwaysAllowed: boolean; // Accesso notturno sempre permesso
}
```

### 3. Enhanced Event System

```typescript
interface EnhancedEventChoice extends EventChoice {
  skillCheck?: {
    stat: keyof ICharacterStats;
    difficulty: number;
    equipmentModifiers?: {
      weaponBonus?: number;
      armorBonus?: number;
    };
  };
  detailedResults?: {
    successMessage: string;
    failureMessage: string;
    damageRange?: [number, number];
    itemRewards?: ItemReward[];
  };
}

interface EventResolutionResult {
  success: boolean;
  rollDetails: {
    baseStat: number;
    roll: number;
    equipmentBonus: number;
    weatherPenalty: number;
    total: number;
    difficulty: number;
  };
  consequences: {
    hpChange?: number;
    itemsGained?: ItemReward[];
    itemsLost?: string[];
    statusEffects?: StatusEffect[];
  };
}
```

### 4. Audio System

```typescript
interface AudioSettings {
  enabled: boolean;
  volume: number; // 0-100
  beepStyle: 'classic' | 'modern' | 'custom';
}

interface BeepPattern {
  frequencies: number[]; // Hz
  durations: number[]; // ms
  intervals: number[]; // ms pause between beeps
}

enum AudioEvent {
  MENU_NAVIGATE = 'menu_navigate',
  MENU_SELECT = 'menu_select',
  ITEM_PICKUP = 'item_pickup',
  LEVEL_UP = 'level_up',
  DAMAGE_TAKEN = 'damage_taken',
  SKILL_SUCCESS = 'skill_success',
  SKILL_FAILURE = 'skill_failure',
  WEATHER_CHANGE = 'weather_change',
  EVENT_TRIGGER = 'event_trigger'
}
```

### 5. Enhanced Save System UI

```typescript
interface SaveUIState {
  currentView: 'list' | 'details' | 'import' | 'export';
  selectedSlot: string | null;
  isLoading: boolean;
  error: string | null;
  confirmAction: 'save' | 'load' | 'delete' | null;
}

interface SaveSlotDisplay {
  slot: string;
  exists: boolean;
  preview?: {
    playerName: string;
    level: number;
    location: string;
    playtime: string;
    lastSaved: string;
    screenshot?: string; // base64 encoded mini-screenshot
  };
  corrupted: boolean;
  size: string; // "2.3 KB"
}
```

## Data Models

### Weather Patterns

```json
{
  "weatherPatterns": {
    "clear": {
      "probability": 0.4,
      "averageDuration": 240,
      "effects": {
        "movementModifier": 1.0,
        "survivalModifier": 1.0,
        "skillCheckModifier": 0,
        "eventProbabilityModifier": 1.0
      }
    },
    "light_rain": {
      "probability": 0.25,
      "averageDuration": 120,
      "effects": {
        "movementModifier": 0.9,
        "survivalModifier": 1.1,
        "skillCheckModifier": -1,
        "eventProbabilityModifier": 0.8
      }
    },
    "heavy_rain": {
      "probability": 0.15,
      "averageDuration": 90,
      "effects": {
        "movementModifier": 0.7,
        "survivalModifier": 1.3,
        "skillCheckModifier": -3,
        "eventProbabilityModifier": 0.6
      }
    },
    "storm": {
      "probability": 0.1,
      "averageDuration": 60,
      "effects": {
        "movementModifier": 0.5,
        "survivalModifier": 1.5,
        "skillCheckModifier": -5,
        "eventProbabilityModifier": 0.4
      }
    },
    "fog": {
      "probability": 0.08,
      "averageDuration": 180,
      "effects": {
        "movementModifier": 0.8,
        "survivalModifier": 1.0,
        "skillCheckModifier": -2,
        "eventProbabilityModifier": 1.2
      }
    },
    "wind": {
      "probability": 0.02,
      "averageDuration": 300,
      "effects": {
        "movementModifier": 0.9,
        "survivalModifier": 1.2,
        "skillCheckModifier": -1,
        "eventProbabilityModifier": 1.1
      }
    }
  }
}
```

### Enhanced Events Structure

```json
{
  "city_events": [
    {
      "id": "CITY_MYSTERIOUS_001",
      "title": "Echi nel Silenzio",
      "description": "Mentre attraversi le rovine di quello che un tempo era un centro commerciale, senti un suono metallico provenire dalle profondità. Non è il vento... è troppo ritmico, troppo... intenzionale.",
      "choices": [
        {
          "text": "Investigare la fonte del suono",
          "skillCheck": {
            "stat": "percezione",
            "difficulty": 15,
            "equipmentModifiers": {
              "weaponBonus": 2
            }
          },
          "detailedResults": {
            "successMessage": "Seguendo il suono, scopri un vecchio generatore ancora funzionante. Accanto ad esso, una borsa con provviste.",
            "failureMessage": "Il suono si interrompe improvvisamente. Quando raggiungi la fonte, trovi solo macerie e un senso di inquietudine.",
            "itemRewards": [
              {"id": "CONS_001", "quantity": 2},
              {"id": "CRAFT_001", "quantity": 1}
            ]
          }
        },
        {
          "text": "Allontanarsi rapidamente",
          "detailedResults": {
            "successMessage": "La prudenza è la migliore compagna in questo mondo. Ti allontani senza incidenti.",
            "failureMessage": ""
          }
        }
      ]
    }
  ]
}
```

## Error Handling

### Shelter System Error Recovery

```typescript
class ShelterSystemError extends Error {
  constructor(message: string, public readonly shelterCoords: string) {
    super(message);
    this.name = 'ShelterSystemError';
  }
}

// Strategie di recovery
const shelterErrorRecovery = {
  corruptedShelterState: (coords: string) => {
    // Reset dello stato del rifugio specifico
    console.warn(`Resetting corrupted shelter state for ${coords}`);
    return createDefaultShelterState(coords);
  },
  
  duplicateInvestigation: (coords: string) => {
    // Prevenzione investigazioni duplicate
    console.warn(`Preventing duplicate investigation for ${coords}`);
    return false;
  }
};
```

### Save System Error Handling

```typescript
interface SaveErrorRecovery {
  corruptedSave: (slot: string) => SaveRecoveryOptions;
  incompatibleVersion: (saveData: any) => MigrationResult;
  storageQuotaExceeded: () => CleanupStrategy;
}

interface SaveRecoveryOptions {
  canRecover: boolean;
  backupAvailable: boolean;
  suggestedActions: string[];
}
```

## Testing Strategy

### Unit Tests

```typescript
// shelterSystem.test.ts
describe('Shelter System', () => {
  test('should mark shelter as inaccessible after day visit', () => {
    const shelter = createShelter('10,20');
    visitShelterDuringDay(shelter);
    expect(shelter.isAccessible).toBe(false);
  });
  
  test('should allow only one investigation per session', () => {
    const shelter = createShelter('10,20');
    const firstResult = investigateShelter(shelter);
    const secondResult = investigateShelter(shelter);
    expect(firstResult.success).toBe(true);
    expect(secondResult.success).toBe(false);
  });
});

// weatherSystem.test.ts
describe('Weather System', () => {
  test('should apply correct movement modifiers', () => {
    const heavyRain = createWeather(WeatherType.HEAVY_RAIN);
    const modifier = getMovementModifier(heavyRain);
    expect(modifier).toBe(0.7);
  });
});

// eventSystem.test.ts
describe('Enhanced Event System', () => {
  test('should show detailed skill check results', () => {
    const event = createTestEvent();
    const result = resolveEventChoice(event.choices[0], mockCharacter);
    expect(result.rollDetails).toBeDefined();
    expect(result.rollDetails.total).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// gameFlow.test.ts
describe('Game Flow Integration', () => {
  test('weather should affect river crossing', () => {
    setWeather(WeatherType.STORM);
    const crossingResult = attemptRiverCrossing(mockCharacter);
    expect(crossingResult.difficulty).toBeGreaterThan(15);
  });
  
  test('equipment should affect event skill checks', () => {
    const weaponEquipped = equipWeapon(mockCharacter, 'WEAP_001');
    const eventResult = resolveEventWithCombat(weaponEquipped);
    expect(eventResult.rollDetails.equipmentBonus).toBeGreaterThan(0);
  });
});
```

### Performance Tests

```typescript
// performance.test.ts
describe('Performance', () => {
  test('weather updates should not cause frame drops', () => {
    const startTime = performance.now();
    updateWeather();
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(16); // 60fps = 16ms per frame
  });
  
  test('save system should handle large save files', () => {
    const largeSaveData = createLargeSaveData();
    const saveTime = measureSaveTime(largeSaveData);
    expect(saveTime).toBeLessThan(1000); // Max 1 second
  });
});
```

## Implementation Priority

### Phase 1: Critical Bug Fixes (Week 1)
1. **Shelter System Bug Fix** - Highest priority
   - Implement `ShelterAccessInfo` tracking
   - Add one-visit-per-day rule
   - Fix investigation duplication
   
2. **Event Probability Fix** - High priority
   - Change `EVENT_CHANCE` from 0.25 to 0.20
   - Test event frequency

### Phase 2: Core Systems (Week 2-3)
3. **Weather System** - High priority
   - Implement `WeatherState` in Zustand store
   - Create weather patterns and effects
   - Integrate with movement and survival

4. **Enhanced Events** - High priority
   - Improve skill check transparency
   - Add equipment modifiers to events
   - Create detailed result messages

### Phase 3: User Experience (Week 4)
5. **Save/Load UI** - Medium priority
   - Create `LoadScreen` component
   - Implement save slot previews
   - Add import/export functionality

6. **Audio System** - Medium priority
   - Implement retro beep system
   - Create audio event mapping
   - Add volume controls

### Phase 4: Content Expansion (Week 5-6)
7. **New Events** - Medium priority
   - Create 15 events per biome
   - Focus on mysterious/supernatural themes
   - Include emotional/touching moments

8. **Movement Enhancements** - Low priority
   - Add terrain-based modifiers
   - Implement night movement penalties
   - Add equipment weight effects

## Migration Strategy

### Existing Save Compatibility

```typescript
// Migration from v0.6.0 to v0.6.1
const migrateToV061 = (oldSave: any): GameSaveData => {
  return {
    ...oldSave,
    weatherState: createDefaultWeatherState(),
    shelterAccessState: migrateShelterState(oldSave.visitedShelters),
    audioSettings: createDefaultAudioSettings(),
    version: '0.6.1'
  };
};
```

### Backward Compatibility

- Tutti i salvataggi v0.6.0 saranno automaticamente migrati
- Le funzionalità esistenti rimarranno invariate
- I nuovi sistemi avranno valori di default sensati

## Security Considerations

### Save Data Validation

```typescript
const validateSaveData = (data: any): boolean => {
  // Validazione struttura dati
  if (!data.characterSheet || !data.gameData) return false;
  
  // Validazione range valori
  if (data.characterSheet.level < 1 || data.characterSheet.level > 20) return false;
  
  // Validazione coordinate rifugi
  Object.keys(data.shelterAccessState || {}).forEach(coords => {
    if (!/^\d+,\d+$/.test(coords)) return false;
  });
  
  return true;
};
```

### Input Sanitization

```typescript
const sanitizeEventInput = (eventData: any): EnhancedEvent => {
  return {
    ...eventData,
    title: sanitizeString(eventData.title, 100),
    description: sanitizeString(eventData.description, 1000),
    choices: eventData.choices.map(sanitizeChoice)
  };
};
```

Questo design fornisce una base solida per implementare tutte le migliorie richieste mantenendo la stabilità e le performance dell'architettura Zustand esistente.