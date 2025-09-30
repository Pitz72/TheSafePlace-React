# 🎯 **GAME DESIGN DOCUMENT - THE SAFE PLACE v2.0**
# **"ARCHITECTURE RESET"**

**Versione**: 2.0.0
**Data Creazione**: 22 Settembre 2025
**Autore**: Kilo Code (LLM-Assisted Development)
**Codename**: Architecture Reset

---

## **📋 INDICE**

### **1. VISIONE E OBIETTIVI GENERALI**
- 1.1 Concept Fondamentale
- 1.2 Lezioni dal v1.0 e Obiettivi di Design
- 1.3 Stack Tecnologico Pianificato
- 1.4 Principi Architetturali (Anti-v1.0)

### **2. ARCHITETTURA DEL SISTEMA**
- 2.1 Struttura di Cartelle Pianificata
- 2.2 Architettura State Management
- 2.3 Sistema di Eventi Unificato
- 2.4 Error Handling e Logging

### **3. SISTEMA CORE**
- 3.1 Game Loop Unificato
- 3.2 Sistema Tempo Unificato
- 3.3 Configuration Management
- 3.4 Save/Load System

### **4. DOMINI BUSINESS**
- 4.1 Dominio World
- 4.2 Dominio Character
- 4.3 Dominio Inventory
- 4.4 Dominio Survival
- 4.5 Dominio Narrative

### **5. SISTEMI DI GIOCO**
- 5.1 Meccaniche D&D
- 5.2 Sistema di Movimento
- 5.3 Sistema di Combattimento
- 5.4 Sistema di Crafting
- 5.5 Sistema di Eventi Dinamici

### **6. UI/UX DESIGN**
- 6.1 Design System CRT
- 6.2 Componenti UI
- 6.3 Canvas Rendering
- 6.4 Responsive Design

### **7. DATABASE E CONTENUTI**
- 7.1 Struttura Database
- 7.2 Sistema Items
- 7.3 Sistema Eventi
- 7.4 Contenuti Narrativi

### **8. TESTING E QUALITÀ**
- 8.1 Testing Strategy
- 8.2 Performance Requirements
- 8.3 Anti-Regression Measures
- 8.4 Deployment Pipeline

### **9. ROADMAP DI SVILUPPO**
- 9.1 Fasi di Sviluppo
- 9.2 Milestones
- 9.3 Risk Assessment
- 9.4 Success Metrics

---

## **1. VISIONE E OBIETTIVI GENERALI**

### **1.1 Concept Fondamentale**

**The Safe Place v2.0** è un GDR retrocomputazionale a fosfori verdi che fonde meccaniche D&D classiche con narrativa immersiva e sopravvivenza strategica. Il giocatore controlla Ultimo, un sopravvissuto in un mondo post-apocalittico, in un viaggio di scoperta emotiva attraverso frammenti di storia personale.

**Pillars di Design:**
- **Narrativa Emotiva**: Scoperta progressiva della storia di Ultimo
- **Sopravvivenza Strategica**: Gestione risorse in tempo reale
- **Esplorazione Procedurale**: Mondo generato con biomi unici
- **Immersività Retro**: Estetica CRT autentica anni '80

### **1.2 Lezioni dal v1.0 e Obiettivi di Design**

**Problemi Strutturali Identificati nel v1.0:**
- **Refactoring Costanti**: "Aggiusti una cosa, ne rompi un'altra"
- **Over-Engineering**: Sistema stores troppo granulare
- **Dipendenze Circolari**: Architettura fragile e instabile
- **Mancanza Pianificazione**: Design emergente caotico

**Obiettivi di Design per v2.0:**
- **Architettura Solida**: Design system pianificato dall'inizio
- **Manutenibilità**: Codice modulare senza dipendenze circolari
- **Scalabilità**: Framework estensibile per contenuti futuri
- **Stabilità**: Testing integrato, prevenzione regressioni
- **Performance**: Ottimizzazioni native, non aggiunte dopo

### **1.3 Stack Tecnologico Pianificato**

```
Frontend: React 18.3.1 + TypeScript 5.8.3
State Management: Zustand 5.0.1 (architettura unificata)
Rendering: Canvas API per mappa + React per UI
Styling: Tailwind CSS 3.4.17 con tema CRT personalizzato
Build System: Vite 6.0.3 con ottimizzazioni avanzate
Testing: Jest 29.7.0 + Cypress 13.17.0 integrati
Database: JSON strutturati con validazione runtime
Deployment: Static hosting con CDN per assets
```

**Scelte Tecnologiche Giustificate:**
- **React + TypeScript**: Type safety e component composition
- **Zustand**: State management semplice ma potente (non Redux complexity)
- **Canvas**: Performance per rendering mappa tile-based
- **Tailwind**: Utility-first per design system consistente
- **Vite**: Build veloce con HMR ottimizzato

### **1.4 Principi Architetturali (Anti-v1.0)**

**Principio #1: Single Source of Truth**
- Un store per dominio business, non frammentazione
- Stato centralizzato ma modulare
- Evita duplicazioni e inconsistenze

**Principio #2: Unidirectional Data Flow**
- Flusso dati prevedibile: Action → Store → UI
- No dipendenze circolari o aggiornamenti bidirezionali
- Debug facile e comportamento prevedibile

**Principio #3: Interface Segregation**
- Interfacce piccole e focalizzate sul dominio
- No interfacce "god" che fanno tutto
- Composition invece di ereditarietà

**Principio #4: Fail-Fast Design**
- Errori catturati al più presto possibile
- Validazione runtime per dati critici
- Logging completo per debugging

**Principio #5: Testability First**
- Codice progettato per essere testabile
- Testing integrato nel workflow di sviluppo
- Coverage automatica e manuale

---

## **2. ARCHITETTURA DEL SISTEMA**

### **2.1 Struttura di Cartelle Pianificata**

```
src/
├── core/                    # 🌟 Sistema core unificato
│   ├── game/               # Game loop e stato principale
│   │   ├── gameLoop.ts     # Game loop principale
│   │   ├── gameState.ts    # Stato globale del gioco
│   │   └── gameActions.ts  # Azioni globali
│   ├── time/               # Sistema tempo unificato
│   │   ├── timeSystem.ts   # Logica tempo centrale
│   │   ├── timeState.ts    # Stato tempo
│   │   └── timeUtils.ts    # Utility tempo
│   ├── events/             # Event bus centralizzato
│   │   ├── eventBus.ts     # Bus eventi principale
│   │   ├── eventTypes.ts   # Tipi eventi
│   │   └── eventHandlers.ts # Handlers eventi
│   └── config/             # Configurazioni globali
│       ├── gameConfig.ts   # Config gioco
│       ├── uiConfig.ts     # Config UI
│       └── constants.ts    # Costanti globali
│
├── domains/                 # 🎯 Domini business isolati
│   ├── world/              # Dominio mondo
│   │   ├── worldState.ts   # Stato mondo
│   │   ├── worldActions.ts # Azioni mondo
│   │   ├── mapGenerator.ts # Generazione mappa
│   │   └── biomeSystem.ts  # Sistema biomi
│   ├── character/          # Dominio personaggio
│   │   ├── characterState.ts # Stato personaggio
│   │   ├── characterActions.ts # Azioni personaggio
│   │   ├── abilitySystem.ts # Sistema abilità D&D
│   │   └── equipmentSystem.ts # Sistema equipaggiamento
│   ├── inventory/          # Dominio inventario
│   │   ├── inventoryState.ts # Stato inventario
│   │   ├── inventoryActions.ts # Azioni inventario
│   │   ├── itemSystem.ts   # Sistema oggetti
│   │   └── craftingSystem.ts # Sistema crafting
│   ├── survival/           # Dominio sopravvivenza
│   │   ├── survivalState.ts # Stato sopravvivenza
│   │   ├── survivalActions.ts # Azioni sopravvivenza
│   │   ├── hungerSystem.ts # Sistema fame
│   │   └── weatherSystem.ts # Sistema meteo
│   └── narrative/          # Dominio narrativa
│       ├── narrativeState.ts # Stato narrativa
│       ├── narrativeActions.ts # Azioni narrativa
│       ├── questSystem.ts  # Sistema quest
│       └── storyEngine.ts  # Motore storia
│
├── ui/                     # 🎨 Componenti UI
│   ├── screens/            # Schermate principali
│   │   ├── GameScreen.tsx  # Schermata gioco
│   │   ├── MenuScreen.tsx  # Schermata menu
│   │   ├── CharacterScreen.tsx # Schermata personaggio
│   │   └── InventoryScreen.tsx # Schermata inventario
│   ├── components/         # Componenti riutilizzabili
│   │   ├── Button.tsx      # Pulsante base
│   │   ├── Panel.tsx       # Pannello CRT
│   │   ├── StatusBar.tsx   # Barra stato
│   │   └── Notification.tsx # Notifica
│   ├── canvas/             # Rendering canvas
│   │   ├── MapCanvas.tsx   # Canvas mappa
│   │   ├── TileRenderer.ts # Renderer tile
│   │   └── SpriteSystem.ts # Sistema sprite
│   └── theme/              # Tema CRT
│       ├── crtTheme.ts     # Definizioni tema
│       ├── animations.ts   # Animazioni CRT
│       └── colors.ts       # Palette colori
│
├── data/                   # 📊 Database strutturati
│   ├── events/             # Eventi di gioco
│   │   ├── biomeEvents.json # Eventi per bioma
│   │   ├── randomEvents.json # Eventi casuali
│   │   ├── questEvents.json # Eventi quest
│   │   └── eventSchema.ts  # Schema validazione
│   ├── items/              # Database oggetti
│   │   ├── weapons.json    # Armi
│   │   ├── armor.json      # Armature
│   │   ├── consumables.json # Consumabili
│   │   ├── crafting.json   # Materiali crafting
│   │   └── itemSchema.ts   # Schema validazione
│   ├── narrative/          # Contenuti narrativi
│   │   ├── mainQuest.json  # Quest principale
│   │   ├── loreEvents.json # Eventi lore
│   │   ├── dialogues.json  # Dialoghi
│   │   └── storySchema.ts  # Schema validazione
│   └── config/             # Configurazioni dati
│       ├── biomes.json     # Definizioni biomi
│       ├── weather.json    # Pattern meteo
│       └── gameRules.json  # Regole di gioco
│
├── services/               # 🔧 Servizi business
│   ├── saveLoadService.ts  # Servizio save/load
│   ├── audioService.ts     # Servizio audio (futuro)
│   ├── networkService.ts   # Servizio rete (futuro)
│   └── analyticsService.ts # Servizio analytics
│
├── utils/                  # 🛠️ Utility functions
│   ├── mathUtils.ts        # Utility matematiche
│   ├── stringUtils.ts      # Utility stringhe
│   ├── arrayUtils.ts       # Utility array
│   ├── validationUtils.ts  # Utility validazione
│   └── performanceUtils.ts # Utility performance
│
├── types/                  # 📝 Definizioni TypeScript
│   ├── game.ts             # Tipi gioco principali
│   ├── character.ts        # Tipi personaggio
│   ├── world.ts            # Tipi mondo
│   ├── items.ts            # Tipi oggetti
│   ├── events.ts           # Tipi eventi
│   └── ui.ts               # Tipi UI
│
└── tests/                  # 🧪 Testing suite
    ├── unit/               # Test unitari
    ├── integration/        # Test integrazione
    ├── e2e/                # Test end-to-end
    └── utils/              # Utility testing
```

### **2.2 Architettura State Management**

**Design Pattern: Facade + Domain Stores**

**Store Principale (Facade):**
```typescript
// core/game/gameStore.ts
interface GameStore {
  // Stato globale
  gamePhase: GamePhase;
  currentScreen: Screen;
  isLoading: boolean;

  // Facade properties (lettura)
  get world(): WorldState;
  get character(): CharacterState;
  get inventory(): InventoryState;
  get survival(): SurvivalState;
  get narrative(): NarrativeState;

  // Azioni globali
  initializeGame(): Promise<void>;
  startNewGame(): void;
  saveGame(): Promise<void>;
  loadGame(saveId: string): Promise<void>;
  pauseGame(): void;
  resumeGame(): void;
}
```

**Domain Stores (Isolati):**
```typescript
// domains/world/worldStore.ts
interface WorldStore {
  // Stato isolato del dominio
  map: GameMap;
  playerPosition: Position;
  currentBiome: Biome;
  discoveredAreas: Set<string>;

  // Azioni dominio-specifiche
  movePlayer(direction: Direction): MoveResult;
  updateBiome(newBiome: Biome): void;
  discoverArea(areaId: string): void;
  resetWorld(): void;
}
```

**Vantaggi dell'Architettura:**
- **Separazione Chiara**: Ogni dominio ha responsabilità isolate
- **Testabilità**: Stores indipendenti facilmente testabili
- **Manutenibilità**: Modifiche localizzate al dominio
- **Performance**: Aggiornamenti granulari, non globali
- **Type Safety**: Interfacce chiare per ogni dominio

### **2.3 Sistema di Eventi Unificato**

**Design Pattern: Event Bus Centralizzato**

**Event Bus Core:**
```typescript
// core/events/eventBus.ts
type EventHandler<T = any> = (event: GameEvent<T>) => void;

interface GameEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source: string;
}

class EventBus {
  private handlers = new Map<string, EventHandler[]>();
  private middlewares: EventMiddleware[] = [];

  emit<T>(event: GameEvent<T>): void {
    // Applica middlewares
    let processedEvent = event;
    for (const middleware of this.middlewares) {
      processedEvent = middleware(processedEvent);
      if (!processedEvent) return; // Middleware can cancel event
    }

    // Emetti ai listeners
    const eventHandlers = this.handlers.get(event.type) || [];
    eventHandlers.forEach(handler => {
      try {
        handler(processedEvent);
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
      }
    });
  }

  on<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }
}
```

**Event Types Strutturati:**
```typescript
// core/events/eventTypes.ts
export const GameEvents = {
  // Game lifecycle
  GAME_STARTED: 'game:started',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  GAME_SAVED: 'game:saved',
  GAME_LOADED: 'game:loaded',

  // World events
  PLAYER_MOVED: 'world:player_moved',
  BIOME_CHANGED: 'world:biome_changed',
  AREA_DISCOVERED: 'world:area_discovered',

  // Character events
  CHARACTER_DAMAGED: 'character:damaged',
  CHARACTER_HEALED: 'character:healed',
  CHARACTER_LEVELED_UP: 'character:leveled_up',
  ABILITY_CHECK_PASSED: 'character:ability_check_passed',
  ABILITY_CHECK_FAILED: 'character:ability_check_failed',

  // Survival events
  HUNGER_INCREASED: 'survival:hunger_increased',
  THIRST_INCREASED: 'survival:thirst_increased',
  NIGHT_CONSUMPTION: 'survival:night_consumption',
  WEATHER_CHANGED: 'survival:weather_changed',

  // Narrative events
  QUEST_STARTED: 'narrative:quest_started',
  QUEST_COMPLETED: 'narrative:quest_completed',
  STORY_EVENT_TRIGGERED: 'narrative:story_event_triggered',
  DIALOGUE_STARTED: 'narrative:dialogue_started',

  // UI events
  SCREEN_CHANGED: 'ui:screen_changed',
  NOTIFICATION_SHOWN: 'ui:notification_shown',
  MENU_OPENED: 'ui:menu_opened'
} as const;
```

**Vantaggi del Sistema Eventi:**
- **Decoupling**: Componenti non conoscono l'un l'altro
- **Extensibility**: Nuovi eventi senza modificare codice esistente
- **Debugging**: Tracciamento completo del flusso eventi
- **Testing**: Eventi facilmente mockabili
- **Performance**: Esecuzione asincrona e non bloccante

### **2.4 Error Handling e Logging**

**Error Boundary Architecture:**
```typescript
// core/error/errorBoundary.tsx
interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorId: string;
  timestamp: number;
  userAgent: string;
  gameState: Partial<GameState>;
}

class ErrorHandler {
  private errorLog: ErrorInfo[] = [];

  handleError(error: Error, errorInfo?: any): void {
    const errorEntry: ErrorInfo = {
      componentStack: errorInfo?.componentStack || '',
      errorBoundary: errorInfo?.errorBoundary || 'global',
      errorId: this.generateErrorId(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      gameState: this.captureGameState()
    };

    this.errorLog.push(errorEntry);
    console.error('Game Error:', error, errorInfo);

    // In development, show error overlay
    if (process.env.NODE_ENV === 'development') {
      this.showErrorOverlay(error, errorEntry);
    }

    // In production, send to analytics
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorEntry);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private captureGameState(): Partial<GameState> {
    try {
      return {
        gamePhase: useGameStore.getState().gamePhase,
        currentScreen: useGameStore.getState().currentScreen,
        playerPosition: useGameStore.getState().world.playerPosition,
        characterLevel: useGameStore.getState().character.sheet.level
      };
    } catch {
      return { error: 'Could not capture game state' };
    }
  }
}
```

**Logging System Strutturato:**
```typescript
// core/logging/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  source: string;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: any): void {
    this.log(LogLevel.ERROR, message, context);
  }

  private log(level: LogLevel, message: string, context?: any): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      source: this.getCallerInfo()
    };

    this.logs.push(entry);

    // Mantieni solo gli ultimi N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output console in development
    if (process.env.NODE_ENV === 'development') {
      const levelStr = LogLevel[level];
      console[levelStr.toLowerCase()](`[${levelStr}] ${message}`, context || '');
    }
  }

  private getCallerInfo(): string {
    const error = new Error();
    const stack = error.stack?.split('\n')[3];
    return stack ? stack.trim() : 'unknown';
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) return [...this.logs];
    return this.logs.filter(log => log.level >= level);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}
```

---

## **3. SISTEMA CORE**

### **3.1 Game Loop Unificato**

**Design Pattern: Game Loop basato su RequestAnimationFrame**

```typescript
// core/game/gameLoop.ts
interface GameLoopConfig {
  targetFPS: number;
  maxFrameSkip: number;
  enableFixedTimestep: boolean;
}

class GameLoop {
  private isRunning = false;
  private lastFrameTime = 0;
  private accumulatedTime = 0;
  private frameCount = 0;
  private fpsUpdateTime = 0;
  private currentFPS = 0;

  private config: GameLoopConfig = {
    targetFPS: 60,
    maxFrameSkip: 5,
    enableFixedTimestep: true
  };

  constructor(
    private updateCallback: (deltaTime: number) => void,
    private renderCallback: () => void,
    config?: Partial<GameLoopConfig>
  ) {
    this.config = { ...this.config, ...config };
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
  }

  private loop = (currentTime: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Fixed timestep per fisica deterministica
    if (this.config.enableFixedTimestep) {
      const fixedDeltaTime = 1000 / this.config.targetFPS;
      this.accumulatedTime += deltaTime;

      let framesToUpdate = 0;
      while (this.accumulatedTime >= fixedDeltaTime && framesToUpdate < this.config.maxFrameSkip) {
        this.updateCallback(fixedDeltaTime);
        this.accumulatedTime -= fixedDeltaTime;
        framesToUpdate++;
      }
    } else {
      // Variable timestep
      this.updateCallback(deltaTime);
    }

    // Render sempre
    this.renderCallback();

    // Calcolo FPS
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.currentFPS = (this.frameCount * 1000) / (currentTime - this.fpsUpdateTime);
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }

    requestAnimationFrame(this.loop);
  };

  getFPS(): number {
    return Math.round(this.currentFPS);
  }

  getFrameTime(): number {
    return this.currentFPS > 0 ? 1000 / this.currentFPS : 0;
  }
}
```

**Integrazione con Game Store:**
```typescript
// core/game/gameIntegration.ts
export class GameIntegration {
  private gameLoop: GameLoop;

  constructor() {
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this),
      { targetFPS: 60 }
    );
  }

  initialize(): void {
    // Inizializza tutti i sistemi
    useTimeStore.getState().initialize();
    useWorldStore.getState().initialize();
    useCharacterStore.getState().initialize();
    useSurvivalStore.getState().initialize();
    useNarrativeStore.getState().initialize();

    // Avvia game loop
    this.gameLoop.start();
  }

  private update(deltaTime: number): void {
    // Update systems in order of dependency
    const timeStore = useTimeStore.getState();
    const worldStore = useWorldStore.getState();
    const characterStore = useCharacterStore.getState();
    const survivalStore = useSurvivalStore.getState();
    const narrativeStore = useNarrativeStore.getState();

    // 1. Update time (base for all other systems)
    timeStore.update(deltaTime);

    // 2. Update world (depends on time)
    worldStore.update(deltaTime);

    // 3. Update character (depends on world/time)
    characterStore.update(deltaTime);

    // 4. Update survival (depends on character/world/time)
    survivalStore.update(deltaTime);

    // 5. Update narrative (depends on all above)
    narrativeStore.update(deltaTime);
  }

  private render(): void {
    // Render is handled by React components
    // Game loop just ensures consistent update timing
  }
}
```

### **3.2 Sistema Tempo Unificato**

**Lezione dal v1.0**: Un solo sistema tempo affidabile senza duplicazioni.

```typescript
// core/time/timeSystem.ts
interface TimeState {
  currentTime: number;        // minuti dal inizio giorno (0-1440)
  day: number;               // giorno corrente
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  isPaused: boolean;
  timeMultiplier: number;     // per fast-forward (1.0 = normale)
}

interface TimeConfig {
  dayLength: number;         // minuti per giorno (default: 1440)
  dawnStart: number;         // minuti inizio alba (default: 360 = 6:00)
  dayStart: number;          // minuti inizio giorno (default: 420 = 7:00)
  duskStart: number;         // minuti inizio tramonto (default: 1140 = 19:00)
  nightStart: number;        // minuti inizio notte (default: 1200 = 20:00)
}

class TimeSystem {
  private config: TimeConfig = {
    dayLength: 1440,
    dawnStart: 360,
    dayStart: 420,
    duskStart: 1140,
    nightStart: 1200
  };

  constructor(private eventBus: EventBus) {}

  initialize(): void {
    // Set initial time to dawn of day 1
    this.setTime(this.config.dawnStart, 1);
  }

  update(deltaTime: number): void {
    if (this.state.isPaused) return;

    const timeToAdd = deltaTime * this.state.timeMultiplier;
    this.advanceTime(timeToAdd);
  }

  advanceTime(minutes: number): void {
    const newTime = this.state.currentTime + minutes;
    const daysToAdd = Math.floor(newTime / this.config.dayLength);
    const finalTime = newTime % this.config.dayLength;

    if (daysToAdd > 0) {
      this.state.day += daysToAdd;
      this.eventBus.emit({
        type: GameEvents.DAY_PASSED,
        payload: { newDay: this.state.day },
        timestamp: Date.now(),
        source: 'timeSystem'
      });
    }

    this.setTime(finalTime, this.state.day);

    // Check for time-of-day transitions
    const oldTimeOfDay = this.state.timeOfDay;
    const newTimeOfDay = this.calculateTimeOfDay(finalTime);

    if (oldTimeOfDay !== newTimeOfDay) {
      this.state.timeOfDay = newTimeOfDay;
      this.eventBus.emit({
        type: GameEvents.TIME_OF_DAY_CHANGED,
        payload: {
          oldTimeOfDay,
          newTimeOfDay,
          currentTime: finalTime
        },
        timestamp: Date.now(),
        source: 'timeSystem'
      });

      // Special handling for night time
      if (newTimeOfDay === 'night') {
        this.eventBus.emit({
          type: GameEvents.NIGHT_STARTED,
          payload: { day: this.state.day },
          timestamp: Date.now(),
          source: 'timeSystem'
        });
      }
    }
  }

  private calculateTimeOfDay(currentTime: number): TimeOfDay {
    if (currentTime < this.config.dawnStart) return 'night';
    if (currentTime < this.config.dayStart) return 'dawn';
    if (currentTime < this.config.duskStart) return 'day';
    if (currentTime < this.config.nightStart) return 'dusk';
    return 'night';
  }

  setTime(minutes: number, day?: number): void {
    this.state.currentTime = Math.max(0, Math.min(minutes, this.config.dayLength));
    if (day !== undefined) {
      this.state.day = Math.max(1, day);
    }
    this.state.timeOfDay = this.calculateTimeOfDay(this.state.currentTime);
  }

  getTimeString(): string {
    const hours = Math.floor(this.state.currentTime / 60);
    const minutes = Math.floor(this.state.currentTime % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getTimeUntilNextPhase(): number {
    const currentTime = this.state.currentTime;
    let nextPhaseTime: number;

    switch (this.state.timeOfDay) {
      case 'dawn':
        nextPhaseTime = this.config.dayStart;
        break;
      case 'day':
        nextPhaseTime = this.config.duskStart;
        break;
      case 'dusk':
        nextPhaseTime = this.config.nightStart;
        break;
      case 'night':
        nextPhaseTime = this.config.dayLength + this.config.dawnStart;
        break;
    }

    return nextPhaseTime - currentTime;
  }

  pause(): void {
    this.state.isPaused = true;
  }

  resume(): void {
    this.state.isPaused = false;
  }

  setTimeMultiplier(multiplier: number): void {
    this.state.timeMultiplier = Math.max(0.1, Math.min(multiplier, 10.0));
  }
}
```

**Store Zustand per Time System:**
```typescript
// core/time/timeStore.ts
interface TimeStore extends TimeState {
  // Actions
  initialize(): void;
  update(deltaTime: number): void;
  advanceTime(minutes: number): void;
  setTime(minutes: number, day?: number): void;
  getTimeString(): string;
  getTimeUntilNextPhase(): number;
  pause(): void;
  resume(): void;
  setTimeMultiplier(multiplier: number): void;
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  // Initial state
  currentTime: 360, // Start at dawn (6:00)
  day: 1,
  timeOfDay: 'dawn',
  season: 'spring',
  isPaused: false,
  timeMultiplier: 1.0,

  initialize: () => {
    // Initialize time system
    get().setTime(360, 1); // 6:00 AM, Day 1
  },

  update: (deltaTime: number) => {
    // Update logic handled by TimeSystem class
  },

  // ... other actions
}));
```

### **3.3 Configuration Management**

**Design Pattern: Configuration as Code**

```typescript
// core/config/gameConfig.ts
interface GameConfig {
  version: string;
  codename: string;

  // Game rules
  maxInventorySlots: number;
  baseMovementTime: number;
  hungerDecayRate: number;
  thirstDecayRate: number;

  // Time settings
  dayLengthMinutes: number;
  dawnHour: number;
  duskHour: number;

  // Difficulty settings
  survivalDifficulty: 'easy' | 'normal' | 'hard';
  combatDifficulty: 'easy' | 'normal' | 'hard';

  // UI settings
  enableCRT: boolean;
  enableSound: boolean;
  enableParticles: boolean;
}

const DEFAULT_CONFIG: GameConfig = {
  version: '2.0.0',
  codename: 'Architecture Reset',

  maxInventorySlots: 24,
  baseMovementTime: 10, // minutes per move
  hungerDecayRate: 0.2, // per minute
  thirstDecayRate: 0.3, // per minute

  dayLengthMinutes: 1440,
  dawnHour: 6,
  duskHour: 19,

  survivalDifficulty: 'normal',
  combatDifficulty: 'normal',

  enableCRT: true,
  enableSound: false, // Not implemented yet
  enableParticles: true
};

class ConfigManager {
  private config: GameConfig = { ...DEFAULT_CONFIG };
  private configOverrides: Partial<GameConfig> = {};

  loadConfig(): Promise<void> {
    // Load from localStorage or default
    const savedConfig = localStorage.getItem('gameConfig');
    if (savedConfig) {
      try {
        this.configOverrides = JSON.parse(savedConfig);
        this.mergeConfig();
      } catch (error) {
        console.warn('Failed to load config from localStorage:', error);
      }
    }
    return Promise.resolve();
  }

  saveConfig(): void {
    localStorage.setItem('gameConfig', JSON.stringify(this.configOverrides));
  }

  get<K extends keyof GameConfig>(key: K): GameConfig[K] {
    return this.config[key];
  }

  set<K extends keyof GameConfig>(key: K, value: GameConfig[K]): void {
    this.configOverrides[key] = value;
    this.mergeConfig();
    this.saveConfig();
  }

  reset(): void {
    this.configOverrides = {};
    this.config = { ...DEFAULT_CONFIG };
    localStorage.removeItem('gameConfig');
  }

  private mergeConfig(): void {
    this.config = { ...DEFAULT_CONFIG, ...this.configOverrides };
  }

  exportConfig(): GameConfig {
    return { ...this.config };
  }

  importConfig(config: Partial<GameConfig>): void {
    this.configOverrides = { ...this.configOverrides, ...config };
    this.mergeConfig();
    this.saveConfig();
  }
}

export const configManager = new ConfigManager();
```

### **3.4 Save/Load System**

**Design Pattern: Repository + Memento**

```typescript
// services/saveLoadService.ts
interface SaveData {
  id: string;
  name: string;
  timestamp: number;
  version: string;
  gameState: GameState;
  metadata: {
    playTime: number;
    playerLevel: number;
    currentBiome: string;
    day: number;
  };
}

interface SaveMetadata {
  id: string;
  name: string;
  timestamp: number;
  preview: {
    playerLevel: number;
    currentBiome: string;
    day: number;
    playTime: number;
  };
}

class SaveLoadService {
  private readonly SAVE_KEY_PREFIX = 'savegame_';
  private readonly MAX_SAVES = 10;

  async saveGame(name?: string): Promise<string> {
    const gameState = this.captureGameState();
    const saveId = this.generateSaveId();

    const saveData: SaveData = {
      id: saveId,
      name: name || `Save ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      version: configManager.get('version'),
      gameState,
      metadata: {
        playTime: this.calculatePlayTime(),
        playerLevel: gameState.character.sheet.level,
        currentBiome: gameState.world.currentBiome,
        day: gameState.time.day
      }
    };

    try {
      // Save to localStorage (could be extended to cloud saves)
      localStorage.setItem(`${this.SAVE_KEY_PREFIX}${saveId}`, JSON.stringify(saveData));

      // Clean up old saves if we exceed the limit
      await this.cleanupOldSaves();

      return saveId;
    } catch (error) {
      throw new Error(`Failed to save game: ${error.message}`);
    }
  }

  async loadGame(saveId: string): Promise<void> {
    try {
      const saveDataStr = localStorage.getItem(`${this.SAVE_KEY_PREFIX}${saveId}`);
      if (!saveDataStr) {
        throw new Error(`Save game ${saveId} not found`);
      }

      const saveData: SaveData = JSON.parse(saveDataStr);

      // Version compatibility check
      if (saveData.version !== configManager.get('version')) {
        console.warn(`Loading save from different version: ${saveData.version} vs ${configManager.get('version')}`);
        // Could implement migration logic here
      }

      // Restore game state
      await this.restoreGameState(saveData.gameState);

    } catch (error) {
      throw new Error(`Failed to load game: ${error.message}`);
    }
  }

  getSaveList(): SaveMetadata[] {
    const saves: SaveMetadata[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.SAVE_KEY_PREFIX)) {
        try {
          const saveDataStr = localStorage.getItem(key);
          if (saveDataStr) {
            const saveData: SaveData = JSON.parse(saveDataStr);
            saves.push({
              id: saveData.id,
              name: saveData.name,
              timestamp: saveData.timestamp,
              preview: saveData.metadata
            });
          }
        } catch (error) {
          console.warn(`Failed to parse save data for key ${key}:`, error);
        }
      }
    }

    // Sort by timestamp (most recent first)
    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }

  deleteSave(saveId: string): void {
    localStorage.removeItem(`${this.SAVE_KEY_PREFIX}${saveId}`);
  }

  exportSave(saveId: string): string {
    const saveDataStr = localStorage.getItem(`${this.SAVE_KEY_PREFIX}${saveId}`);
    if (!saveDataStr) {
      throw new Error(`Save game ${saveId} not found`);
    }
    return saveDataStr;
  }

  importSave(saveDataStr: string): string {
    try {
      const saveData: SaveData = JSON.parse(saveDataStr);

      // Validate save data
      if (!saveData.id || !saveData.gameState) {
        throw new Error('Invalid save data format');
      }

      // Generate new ID to avoid conflicts
      const newSaveId = this.generateSaveId();
      saveData.id = newSaveId;

      localStorage.setItem(`${this.SAVE_KEY_PREFIX}${newSaveId}`, JSON.stringify(saveData));

      return newSaveId;
    } catch (error) {
      throw new Error(`Failed to import save: ${error.message}`);
    }
  }

  private captureGameState(): GameState {
    return {
      gamePhase: useGameStore.getState().gamePhase,
      world: useWorldStore.getState(),
      character: useCharacterStore.getState(),
      inventory: useInventoryStore.getState(),
      survival: useSurvivalStore.getState(),
      narrative: useNarrativeStore.getState(),
      time: useTimeStore.getState()
    };
  }

  private async restoreGameState(gameState: GameState): Promise<void> {
    // Restore in correct order to maintain dependencies
    useTimeStore.setState(gameState.time);
    useWorldStore.setState(gameState.world);
    useCharacterStore.setState(gameState.character);
    useInventoryStore.setState(gameState.inventory);
    useSurvivalStore.setState(gameState.survival);
    useNarrativeStore.setState(gameState.narrative);

    // Update game store last
    useGameStore.setState({
      gamePhase: gameState.gamePhase,
      currentScreen: 'game'
    });
  }

  private generateSaveId(): string {
    return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePlayTime(): number {
    // This would track actual play time vs game time
    // For now, return a placeholder
    return 0;
  }

  private async cleanupOldSaves(): Promise<void> {
    const saves = this.getSaveList();

    if (saves.length > this.MAX_SAVES) {
      // Delete oldest saves
      const savesToDelete = saves.slice(this.MAX_SAVES);
      savesToDelete.forEach(save => {
        this.deleteSave(save.id);
      });
    }
  }
}

export const saveLoadService = new SaveLoadService();
```

---

*Continua nella prossima sezione con i Domini Business (World, Character, Inventory, Survival, Narrative)...*