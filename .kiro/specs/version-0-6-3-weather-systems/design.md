# DESIGN - The Safe Place v0.6.3 "It's raining heavily today"

## Overview

Il design della versione 0.6.3 si concentra sull'integrazione completa del sistema meteo dinamico con il gameplay esistente, la correzione e il bilanciamento del sistema rifugi, e il miglioramento generale dell'esperienza utente attraverso feedback più chiari e immersivi.

## Architecture

### Sistema Rifugi Rivisto

```typescript
interface ShelterAccessInfo {
  coordinates: string;        // "x,y" - identificatore unico
  dayVisited: number;        // giorno della prima visita
  timeVisited: number;       // ora della prima visita
  hasBeenInvestigated: boolean; // investigazione completata in sessione
  isAccessible: boolean;     // false dopo prima visita diurna
  investigationResults?: string[]; // risultati per debugging
}

interface ShelterRules {
  maxDayVisits: 1;          // Una sola visita diurna
  nightAccessAlwaysAllowed: true; // Accesso notturno sempre permesso
  investigationPerSession: 1; // Una investigazione per sessione
  resetOnNewSession: true;   // Reset investigazioni a nuova sessione
}
```

### Integrazione Meteo-Movimento

```typescript
interface MovementCalculation {
  baseTime: number;          // 10 minuti base
  weatherModifier: number;   // da WeatherEffects.movementModifier
  adjustedTime: number;      // Math.ceil(baseTime / weatherModifier)
  extraTime: number;         // adjustedTime - baseTime
}

interface WeatherDamageSystem {
  stormDamage: {
    probability: 0.15;       // 15% durante tempeste
    damageRange: [1, 2];     // 1-2 HP
    message: string;         // Descrizione immersiva
  };
  rainDamage: {
    probability: 0.08;       // 8% durante pioggia intensa
    damageRange: [1, 1];     // 1 HP fisso
    message: string;         // Descrizione scivolamento
  };
}
```

### Sistema Messaggi Atmosferici

```typescript
interface AtmosphericMessageSystem {
  weatherMessages: Record<WeatherType, string[]>; // 4 varianti per tipo
  triggerProbability: 0.10; // 10% durante movimento
  cooldownSystem: boolean;   // Usa cooldown esistente AMBIANCE_RANDOM
  contextSupport: {
    text: string;           // Messaggio personalizzato
    weather: WeatherType;   // Tipo meteo per context
    description: string;    // Descrizione dettagliata
  };
}
```

## Components and Interfaces

### 1. Enhanced Shelter System

#### ShelterScreen.tsx Modifications
```typescript
// Nuovo useEffect per ripristinare risultati investigazione
useEffect(() => {
  const { x, y } = playerPosition;
  const shelterInfo = getShelterInfo(x, y);
  if (shelterInfo?.hasBeenInvestigated && shelterInfo.investigationResults?.length > 0) {
    setSearchResult(shelterInfo.investigationResults[0]);
  }
}, [playerPosition, getShelterInfo]);

// Messaggi migliorati per investigazione bloccata
const blockedMessage = 'Hai già perquisito accuratamente questo rifugio durante questa sessione di gioco. Torna in un\'altra sessione per investigare di nuovo.';
```

#### GameStore Shelter Functions
```typescript
// Nuova funzione per reset investigazioni
resetShelterInvestigations: () => {
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
}

// Integrazione in loadSavedGame
loadSavedGame: async (slot) => {
  // ... caricamento dati ...
  get().resetShelterInvestigations(); // Reset per nuova sessione
  // ... resto della logica ...
}
```

### 2. Weather-Movement Integration

#### Movement Time Calculation
```typescript
updatePlayerPosition: (newPosition, newBiomeChar) => {
  // ... logica esistente ...
  
  const weatherEffects = get().getWeatherEffects();
  const baseMovementTime = 10;
  const adjustedMovementTime = Math.ceil(baseMovementTime / weatherEffects.movementModifier);
  
  // Messaggio informativo se rallentato
  if (weatherEffects.movementModifier < 1.0) {
    const extraTime = adjustedMovementTime - baseMovementTime;
    get().addLogEntry(MessageType.AMBIANCE_RANDOM, {
      text: `Il ${get().getWeatherDescription(weatherState.currentWeather).toLowerCase()} rallenta il tuo movimento (+${extraTime} min).`
    });
  }
  
  get().advanceTime(adjustedMovementTime);
}
```

#### Weather Damage System
```typescript
// Effetti meteo estremi durante movimento
const { weatherState } = get();
if (weatherState.currentWeather === WeatherType.STORM && Math.random() < 0.15) {
  const stormDamage = Math.floor(Math.random() * 2) + 1;
  get().updateHP(-stormDamage);
  get().addLogEntry(MessageType.HP_DAMAGE, { 
    damage: stormDamage, 
    reason: 'tempesta violenta',
    description: 'Venti fortissimi e detriti volanti ti colpiscono mentre ti muovi.'
  });
} else if (weatherState.currentWeather === WeatherType.HEAVY_RAIN && Math.random() < 0.08) {
  const slipDamage = 1;
  get().updateHP(-slipDamage);
  get().addLogEntry(MessageType.HP_DAMAGE, { 
    damage: slipDamage, 
    reason: 'terreno scivoloso',
    description: 'Scivoli sul terreno reso fangoso dalla pioggia intensa.'
  });
}
```

### 3. Enhanced Message System

#### MessageArchive.ts Extensions
```typescript
// Supporto per messaggi personalizzati
if (context?.text) {
  return context.text;
}

// Supporto per messaggi meteo con descrizione
if (context?.weather && context?.description) {
  return context.description;
}
```

#### Weather Message Generation
```typescript
getRandomWeatherMessage: (weather: WeatherType): string => {
  const weatherMessages = {
    [WeatherType.CLEAR]: [
      'I raggi del sole filtrano attraverso l\'aria, riscaldando leggermente il tuo volto.',
      'Il cielo sereno offre una tregua dalla desolazione circostante.',
      'Una brezza leggera porta con sé il profumo di terre lontane.',
      'La luce del sole rivela dettagli nascosti nel paesaggio.'
    ],
    [WeatherType.STORM]: [
      'Un fulmine illumina il paesaggio desolato per un istante accecante.',
      'Il tuono rimbomba tra le rovine come il grido di un gigante ferito.',
      'Il vento della tempesta minaccia di trascinarti via.',
      'La furia degli elementi ti ricorda quanto sei piccolo in questo mondo.'
    ],
    // ... altri tipi meteo ...
  };
  
  const messages = weatherMessages[weather];
  return messages ? messages[Math.floor(Math.random() * messages.length)] : 'Il tempo si comporta in modo strano.';
}
```

## Data Models

### Shelter State Management

```typescript
// Stato globale rifugi nel GameState
interface GameState {
  shelterAccessState: Record<string, ShelterAccessInfo>;
  // visitedShelters mantenuto per compatibilità ma deprecated
  visitedShelters: Record<string, boolean>;
}

// Funzioni di gestione stato
const shelterFunctions = {
  createShelterKey: (x: number, y: number) => `${x},${y}`,
  getShelterInfo: (x: number, y: number) => ShelterAccessInfo | null,
  createShelterInfo: (x: number, y: number) => ShelterAccessInfo,
  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => void,
  isShelterAccessible: (x: number, y: number) => boolean,
  canInvestigateShelter: (x: number, y: number) => boolean,
  resetShelterInvestigations: () => void
};
```

### Weather Integration Data

```typescript
// Estensione WeatherEffects per movimento
interface WeatherEffects {
  movementModifier: number;     // 0.5-1.0 (tempesta-sereno)
  survivalModifier: number;     // 1.0-1.5 (consumo risorse)
  skillCheckModifier: number;   // -5 a 0 (penalità skill)
  eventProbabilityModifier: number; // 0.4-1.2 (modifica eventi)
}

// Pattern meteo con transizioni
interface WeatherPattern {
  transitionsTo: WeatherType[];
  intensityRange: [number, number];
  averageDuration: number;
  effects: WeatherEffects;
}
```

## Error Handling

### Shelter System Error Recovery

```typescript
// Gestione errori stato rifugi corrotto
const shelterErrorRecovery = {
  corruptedShelterState: (coords: string) => {
    console.warn(`Resetting corrupted shelter state for ${coords}`);
    return createDefaultShelterState(coords);
  },
  
  duplicateInvestigation: (coords: string) => {
    console.warn(`Preventing duplicate investigation for ${coords}`);
    return false;
  },
  
  invalidCoordinates: (coords: string) => {
    console.error(`Invalid shelter coordinates: ${coords}`);
    return null;
  }
};
```

### Save System Migration

```typescript
// Migrazione automatica da v0.6.2
const migrateToV063 = (oldSave: any): GameSaveData => {
  return {
    ...oldSave,
    // Migra vecchio sistema rifugi se presente
    shelterAccessState: migrateShelterState(oldSave.visitedShelters || {}),
    // Assicura presenza weatherState
    weatherState: oldSave.weatherState || createDefaultWeatherState(),
    version: '0.6.3'
  };
};

const migrateShelterState = (visitedShelters: Record<string, boolean>): Record<string, ShelterAccessInfo> => {
  const newState: Record<string, ShelterAccessInfo> = {};
  
  Object.keys(visitedShelters).forEach(coords => {
    if (visitedShelters[coords]) {
      newState[coords] = {
        coordinates: coords,
        dayVisited: 1, // Valore di default
        timeVisited: 600, // 10:00 AM default
        hasBeenInvestigated: false, // Reset per nuova sessione
        isAccessible: false, // Assume già visitato
        investigationResults: []
      };
    }
  });
  
  return newState;
};
```

## Testing Strategy

### Automated Testing

```typescript
// shelterSystem.test.ts - Test completi
describe('Sistema Rifugi v0.6.3', () => {
  test('Prima visita diurna sempre permessa', () => {
    expect(isShelterAccessible(10, 20)).toBe(true);
  });
  
  test('Accesso negato dopo visita diurna', () => {
    // Simula visita diurna
    updateShelterAccess(10, 20, { isAccessible: false });
    expect(isShelterAccessible(10, 20)).toBe(false);
  });
  
  test('Accesso notturno sempre permesso', () => {
    // Imposta notte
    store.setState({ timeState: { isDay: false } });
    expect(isShelterAccessible(10, 20)).toBe(true);
  });
  
  test('Investigazione una volta per sessione', () => {
    expect(canInvestigateShelter(10, 20)).toBe(true);
    updateShelterAccess(10, 20, { hasBeenInvestigated: true });
    expect(canInvestigateShelter(10, 20)).toBe(false);
  });
  
  test('Reset investigazioni nuova sessione', () => {
    resetShelterInvestigations();
    expect(canInvestigateShelter(10, 20)).toBe(true);
  });
});
```

### Integration Testing

```typescript
// Test integrazione meteo-movimento
describe('Weather-Movement Integration', () => {
  test('Movimento rallentato durante tempesta', () => {
    setWeather(WeatherType.STORM);
    const startTime = getGameTime();
    movePlayer();
    const endTime = getGameTime();
    expect(endTime - startTime).toBeGreaterThan(10); // Più di 10 minuti base
  });
  
  test('Danni durante condizioni estreme', () => {
    const initialHP = getPlayerHP();
    // Simula movimento durante tempesta (multiple volte per triggerare danni)
    for (let i = 0; i < 20; i++) {
      movePlayerDuringStorm();
    }
    expect(getPlayerHP()).toBeLessThan(initialHP); // Dovrebbe aver subito danni
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Messaggi meteo caricati solo quando necessari
2. **Caching**: Risultati calcoli meteo cachati per movimento corrente
3. **Debouncing**: Messaggi atmosferici con cooldown per evitare spam
4. **Memory Management**: Pulizia periodica stati rifugi non utilizzati

### Monitoring Metrics

```typescript
// Metriche performance da monitorare
const performanceMetrics = {
  movementCalculationTime: '<1ms',
  weatherUpdateTime: '<2ms',
  shelterStateUpdateTime: '<1ms',
  messageGenerationTime: '<0.5ms',
  saveLoadTime: '<2s'
};
```

## Security Considerations

### Input Validation

```typescript
// Validazione coordinate rifugi
const validateShelterCoordinates = (x: number, y: number): boolean => {
  return Number.isInteger(x) && Number.isInteger(y) && 
         x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;
};

// Sanitizzazione messaggi personalizzati
const sanitizeMessage = (message: string): string => {
  return message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .substring(0, 500); // Limite lunghezza
};
```

### Save Data Integrity

```typescript
// Validazione integrità dati salvati
const validateSaveData = (data: any): boolean => {
  if (!data.shelterAccessState) return false;
  
  // Valida ogni stato rifugio
  for (const [coords, info] of Object.entries(data.shelterAccessState)) {
    if (!/^\d+,\d+$/.test(coords)) return false;
    if (typeof info.hasBeenInvestigated !== 'boolean') return false;
    if (typeof info.isAccessible !== 'boolean') return false;
  }
  
  return true;
};
```

## Migration and Deployment

### Deployment Checklist

- [ ] Test automatizzati passano al 100%
- [ ] Build produzione senza errori TypeScript
- [ ] Test manuali critici completati
- [ ] Documentazione aggiornata
- [ ] Changelog e anti-regressione creati
- [ ] Backup salvataggi test effettuato

### Rollback Strategy

```typescript
// Strategia rollback in caso di problemi critici
const rollbackProcedure = {
  1: 'Identificare natura del problema',
  2: 'Valutare se fix rapido è possibile',
  3: 'Se necessario, rollback a v0.6.2',
  4: 'Correggere problema in branch separato',
  5: 'Re-test completo prima di nuovo deploy'
};
```

---

**Stato**: ✅ IMPLEMENTATO  
**Data Completamento**: 26 Gennaio 2025  
**Versione**: 0.6.3 "It's raining heavily today"  
**Prossimi Sviluppi**: Sistema attraversamento fiumi migliorato, Eventi dinamici trasparenti