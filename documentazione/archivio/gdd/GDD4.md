# 🎯 **GAME DESIGN DOCUMENT - THE SAFE PLACE v2.0**
# **"ARCHITECTURE RESET" - Parte 4 (FINALE)**

**Versione**: 2.0.0
**Data Creazione**: 22 Settembre 2025
**Autore**: Kilo Code (LLM-Assisted Development)
**Codename**: Architecture Reset

---

## **6. UI/UX DESIGN**

### **6.1 Design System CRT**

**Palette Colori CRT Autentica:**
```typescript
// ui/theme/crtColors.ts
export const CRT_COLORS = {
  // Fosfori verdi classici
  phosphor: {
    900: '#001100',  // Quasi nero con verde
    800: '#002200',
    700: '#004400',
    600: '#006600',
    500: '#00AA00',  // Verde fosforo principale
    400: '#00CC00',
    300: '#00FF00',  // Verde acceso
    200: '#66FF66',
    100: '#CCFFCC'
  },

  // Accenti per stati
  accent: {
    danger: '#FF4444',    // Rosso per danni/critico
    warning: '#FFAA44',   // Arancio per avvisi
    success: '#44FF44',   // Verde per successi
    info: '#44AAFF',      // Blu per informazioni
    special: '#AA44FF'    // Viola per eventi speciali
  },

  // Sfumature per contrasti
  gray: {
    900: '#0A0A0A',
    800: '#1A1A1A',
    700: '#2A2A2A',
    600: '#3A3A3A',
    500: '#4A4A4A',
    400: '#5A5A5A',
    300: '#6A6A6A',
    200: '#8A8A8A',
    100: '#AAAAAA'
  }
} as const;
```

**Typography Scale CRT:**
```typescript
// ui/theme/crtTypography.ts
export const CRT_TYPOGRAPHY = {
  fontFamily: {
    mono: ['Courier New', 'Monaco', 'Menlo', 'monospace'],
    display: ['Courier New', 'monospace']
  },

  fontSize: {
    xs: '0.75rem',    // 12px - labels piccoli
    sm: '0.875rem',   // 14px - testo secondario
    base: '1rem',     // 16px - testo corpo
    lg: '1.125rem',   // 18px - titoli piccoli
    xl: '1.25rem',    // 20px - titoli medi
    '2xl': '1.5rem',  // 24px - titoli grandi
    '3xl': '1.875rem', // 30px - titoli hero
    '4xl': '2.25rem'  // 36px - titoli principali
  },

  fontWeight: {
    normal: 400,
    bold: 700
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
} as const;
```

**Componenti Base CRT:**
```typescript
// ui/components/Panel.tsx
interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className = '',
  glow = false
}) => (
  <div className={`
    bg-gray-900 border border-phosphor-600
    ${glow ? 'shadow-lg shadow-phosphor-500/20' : ''}
    ${className}
  `}>
    {title && (
      <div className="border-b border-phosphor-600 px-4 py-2">
        <h3 className="text-phosphor-300 font-bold text-sm uppercase tracking-wider">
          {title}
        </h3>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);

// ui/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'font-mono transition-all duration-200 uppercase tracking-wider';

  const variantClasses = {
    primary: 'bg-phosphor-600 hover:bg-phosphor-500 text-black border border-phosphor-400',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-phosphor-400 border border-phosphor-600',
    danger: 'bg-red-900 hover:bg-red-800 text-red-300 border border-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
```

### **6.2 Layout e Navigazione**

**Layout Principale del Gioco:**
```typescript
// ui/layouts/GameLayout.tsx
export const GameLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="game-container-wrapper">
    {/* Overlay CRT per effetto retrò */}
    <div className="crt-premium-overlay"></div>

    {/* Container principale */}
    <div className="game-container">
      {/* Header con informazioni tempo/status */}
      <header className="h-16 border-b border-phosphor-600 bg-gray-900">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-4">
            <span className="text-phosphor-400 font-mono">
              THE SAFE PLACE v2.0
            </span>
            <span className="text-phosphor-600">|</span>
            <TimeDisplay />
          </div>
          <div className="flex items-center space-x-4">
            <StatusIndicators />
            <KeyboardHints />
          </div>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="flex-1 flex">
        {children}
      </main>

      {/* Footer con controlli */}
      <footer className="h-12 border-t border-phosphor-600 bg-gray-900">
        <div className="flex items-center justify-center h-full px-4">
          <span className="text-phosphor-600 text-xs font-mono">
            [WASD] Muovi • [I] Inventario • [TAB] Personaggio • [ESC] Menu • [F5] Salva • [F9] Carica
          </span>
        </div>
      </footer>
    </div>
  </div>
);
```

**Schermata di Gioco Principale:**
```typescript
// ui/screens/GameScreen.tsx
export const GameScreen: React.FC = () => {
  return (
    <GameLayout>
      <div className="flex h-full">
        {/* Sidebar sinistra - Status personaggio */}
        <aside className="w-80 border-r border-phosphor-600">
          <Panel title="SOPRAVVIVENZA" className="mb-4">
            <SurvivalStats />
          </Panel>

          <Panel title="INVENTARIO">
            <InventoryPanel />
          </Panel>
        </aside>

        {/* Area centrale - Mappa */}
        <main className="flex-1 flex flex-col">
          <Panel title="MAPPA DEL MONDO" className="flex-1">
            <MapViewport />
          </Panel>

          {/* Journal nella parte inferiore */}
          <div className="h-48 border-t border-phosphor-600 mt-4">
            <GameJournal />
          </div>
        </main>

        {/* Sidebar destra - Informazioni mondo */}
        <aside className="w-80 border-l border-phosphor-600">
          <Panel title="INFORMAZIONI" className="mb-4">
            <WorldInfo />
          </Panel>

          <Panel title="METEO">
            <WeatherDisplay />
          </Panel>

          <Panel title="STATISTICHE PERSONAGGIO" className="mt-4">
            <CharacterStats />
          </Panel>
        </aside>
      </div>
    </GameLayout>
  );
};
```

### **6.3 Canvas Rendering System**

**Map Renderer con Tile System:**
```typescript
// ui/canvas/MapRenderer.ts
export class MapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize = 32;
  private viewportWidth: number;
  private viewportHeight: number;

  constructor(canvas: HTMLCanvasElement, viewportSize: { width: number; height: number }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.viewportWidth = viewportSize.width;
    this.viewportHeight = viewportSize.height;

    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Imposta dimensioni canvas
    this.canvas.width = this.viewportWidth * this.tileSize;
    this.canvas.height = this.viewportHeight * this.tileSize;

    // Applica filtro CRT
    this.ctx.imageSmoothingEnabled = false; // Pixel perfect

    // Font per simboli tile
    this.ctx.font = `${this.tileSize}px Courier New`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }

  render(viewport: Viewport, map: GameMap, playerPos: Position): void {
    this.clear();

    const startX = Math.max(0, viewport.x);
    const startY = Math.max(0, viewport.y);
    const endX = Math.min(map.width, viewport.x + this.viewportWidth);
    const endY = Math.min(map.height, viewport.y + this.viewportHeight);

    // Render tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map.tiles[y][x];
        const screenX = (x - viewport.x) * this.tileSize;
        const screenY = (y - viewport.y) * this.tileSize;

        this.renderTile(tile, screenX, screenY, map.biomes);
      }
    }

    // Render player
    this.renderPlayer(playerPos, viewport);
  }

  private renderTile(tile: string, x: number, y: number, biomes: Map<string, Biome>): void {
    // Determina colore basato su bioma
    const biome = this.getBiomeForTile(tile, biomes);
    const color = biome?.color || CRT_COLORS.gray[600];

    // Sfondo tile
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Bordo tile
    this.ctx.strokeStyle = CRT_COLORS.phosphor[700];
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);

    // Simbolo tile
    this.ctx.fillStyle = CRT_COLORS.phosphor[300];
    const symbol = this.getTileSymbol(tile);
    this.ctx.fillText(symbol, x + this.tileSize / 2, y + this.tileSize / 2);
  }

  private renderPlayer(playerPos: Position, viewport: Viewport): void {
    const screenX = (playerPos.x - viewport.x) * this.tileSize;
    const screenY = (playerPos.y - viewport.y) * this.tileSize;

    // Cerchio giocatore
    this.ctx.fillStyle = CRT_COLORS.accent.info;
    this.ctx.beginPath();
    this.ctx.arc(
      screenX + this.tileSize / 2,
      screenY + this.tileSize / 2,
      this.tileSize / 3,
      0,
      2 * Math.PI
    );
    this.ctx.fill();

    // Bordo glow
    this.ctx.strokeStyle = CRT_COLORS.phosphor[300];
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private getBiomeForTile(tile: string, biomes: Map<string, Biome>): Biome | null {
    const biomeMapping: Record<string, string> = {
      '.': 'plains',
      'F': 'forest',
      'C': 'city',
      'V': 'village',
      '~': 'river',
      'M': 'mountain',
      'R': 'rest_stop'
    };

    const biomeId = biomeMapping[tile];
    return biomes.get(biomeId) || null;
  }

  private getTileSymbol(tile: string): string {
    const symbolMapping: Record<string, string> = {
      '.': '░',  // Plains
      'F': '♣',  // Forest
      'C': '▬',  // City
      'V': '⌂',  // Village
      '~': '≈',  // River
      'M': '▲',  // Mountain
      'R': '⌂'   // Rest stop
    };

    return symbolMapping[tile] || '?';
  }

  private clear(): void {
    this.ctx.fillStyle = CRT_COLORS.gray[900];
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
```

---

## **7. DATABASE E CONTENUTI**

### **7.1 Struttura Database JSON**

**Organizzazione File Database:**
```
data/
├── config/
│   ├── gameConfig.json      # Configurazione globale
│   ├── biomes.json          # Definizioni biomi
│   ├── weather.json         # Pattern meteo
│   └── gameRules.json       # Regole di gioco
├── items/
│   ├── weapons.json         # Armi
│   ├── armor.json           # Armature
│   ├── consumables.json     # Consumabili
│   ├── crafting.json        # Materiali crafting
│   ├── quest.json           # Oggetti quest
│   └── unique.json          # Oggetti unici
├── events/
│   ├── biome_events.json    # Eventi per bioma
│   ├── random_events.json   # Eventi casuali
│   ├── quest_events.json    # Eventi quest
│   ├── special_events.json  # Eventi speciali
│   └── sequences.json       # Sequenze narrative
├── narrative/
│   ├── mainQuest.json       # Quest principale
│   ├── loreEvents.json      # Eventi lore
│   ├── dialogues.json       # Dialoghi
│   └── storyFlags.json      # Flag narrativi
└── characters/
    ├── playerTemplates.json # Template personaggio
    ├── npcTemplates.json    # Template NPC
    └── relationships.json   # Relazioni personaggio
```

### **7.2 Sistema Events Database**

**Eventi Bioma (Esempi):**
```json
// data/events/biome_events.json
{
  "plains_events": [
    {
      "id": "plains_encounter_trader",
      "title": "Incontro con un Mercante",
      "description": "Mentre cammini nelle pianure, noti un mercante solitario con un carro trainato da cavalli. Sembra amichevole ma cauto.",
      "biome": "plains",
      "rarity": "uncommon",
      "timeRestriction": ["day"],
      "baseWeight": 1.0,
      "choices": [
        {
          "id": "trade",
          "text": "Proponi uno scambio",
          "skillCheck": {
            "stat": "charisma",
            "difficulty": 12
          },
          "successText": "Il mercante sorride e accetta di fare affari con te.",
          "failureText": "Il mercante ti guarda con sospetto e rifiuta l'offerta.",
          "items_gained": [
            { "id": "canned_food", "quantity": 2 }
          ]
        },
        {
          "id": "ignore",
          "text": "Ignora e continua il cammino",
          "resultText": "Decidi di non rischiare e prosegui il tuo viaggio.",
          "actionKey": "ignore"
        }
      ]
    },
    {
      "id": "plains_wolf_attack",
      "title": "Attacco di Lupi",
      "description": "Un branco di lupi affamati emerge dall'erba alta. I loro occhi rossi brillano di fame mentre ti circondano.",
      "biome": "plains",
      "rarity": "common",
      "timeRestriction": ["dusk", "night"],
      "baseWeight": 1.5,
      "choices": [
        {
          "id": "fight",
          "text": "Combatti i lupi",
          "actions": [
            { "type": "start_combat", "payload": { "encounterId": "wolf_pack" } }
          ]
        },
        {
          "id": "flee",
          "text": "Cerca di fuggire",
          "skillCheck": {
            "stat": "dexterity",
            "difficulty": 14
          },
          "successText": "Riesci a seminare i lupi e ti allontani di corsa.",
          "failureText": "I lupi ti raggiungono e ti attaccano.",
          "actions": [
            { "type": "start_combat", "payload": { "encounterId": "wolf_pack" } }
          ]
        }
      ]
    }
  ],
  "forest_events": [
    {
      "id": "forest_mushroom_gathering",
      "title": "Raccolta Funghi",
      "description": "Noti diversi tipi di funghi che crescono alla base degli alberi. Alcuni sembrano commestibili, altri potenzialmente pericolosi.",
      "biome": "forest",
      "rarity": "common",
      "timeRestriction": ["day", "dusk"],
      "baseWeight": 1.2,
      "choices": [
        {
          "id": "gather_safe",
          "text": "Raccogli solo i funghi che riconosci come sicuri",
          "skillCheck": {
            "stat": "wisdom",
            "difficulty": 10
          },
          "successText": "Raccogli diversi funghi commestibili che potrebbero aiutarti a sopravvivere.",
          "failureText": "Alcuni funghi che raccogli si rivelano velenosi.",
          "items_gained": [
            { "id": "edible_mushrooms", "quantity": 3 }
          ],
          "penalty": {
            "type": "damage",
            "amount": 5
          }
        }
      ]
    }
  ]
}
```

**Eventi Random Globali:**
```json
// data/events/random_events.json
{
  "random_events": [
    {
      "id": "random_weather_change",
      "title": "Cambio Improvviso del Tempo",
      "description": "Il cielo si oscura improvvisamente. Nuvole pesanti si addensano e inizia a piovere forte.",
      "rarity": "common",
      "baseWeight": 0.8,
      "choices": [
        {
          "id": "take_shelter",
          "text": "Cerca riparo immediato",
          "resultText": "Trovi un albero adatto e ti ripari dalla pioggia. Perdi meno tempo del previsto.",
          "actions": [
            { "type": "advance_time", "payload": { "minutes": 30 } }
          ]
        },
        {
          "id": "continue",
          "text": "Continua nonostante la pioggia",
          "resultText": "Prosegui il cammino sotto la pioggia battente. Il viaggio è più faticoso.",
          "actions": [
            { "type": "advance_time", "payload": { "minutes": 60 } }
          ],
          "penalty": {
            "type": "stat_reduction",
            "stat": "fatigue",
            "amount": 20,
            "duration": "temporary"
          }
        }
      ]
    },
    {
      "id": "random_memory",
      "title": "Ricordo Improvviso",
      "description": "Un odore familiare, un suono distante... un ricordo della tua infanzia affiora improvvisamente.",
      "rarity": "rare",
      "baseWeight": 0.3,
      "choices": [
        {
          "id": "reflect",
          "text": "Fermati a riflettere sul ricordo",
          "resultText": "Il ricordo ti dà nuova determinazione nel tuo viaggio.",
          "reward": {
            "type": "emotional",
            "emotionalChanges": {
              "determination": 10,
              "hope": 5
            }
          },
          "actions": [
            { "type": "advance_time", "payload": { "minutes": 15 } }
          ]
        }
      ]
    }
  ]
}
```

### **7.3 Sistema Crafting**

**Ricette Crafting:**
```json
// data/items/recipes.json
{
  "recipes": [
    {
      "id": "craft_hunting_knife",
      "name": "Coltello da Caccia",
      "description": "Un coltello robusto fatto con metallo di recupero e stoffa per l'impugnatura.",
      "result": {
        "itemId": "hunting_knife",
        "quantity": 1
      },
      "ingredients": [
        { "itemId": "scrap_metal", "quantity": 2, "consumed": true },
        { "itemId": "cloth", "quantity": 1, "consumed": true }
      ],
      "craftingTime": 45,
      "skillRequired": "dexterity",
      "skillDifficulty": 12,
      "workstation": "workbench"
    },
    {
      "id": "craft_first_aid_kit",
      "name": "Kit di Primo Soccorso",
      "description": "Un kit medico di base assemblato con materiali trovati.",
      "result": {
        "itemId": "first_aid_kit",
        "quantity": 1
      },
      "ingredients": [
        { "itemId": "cloth", "quantity": 3, "consumed": true },
        { "itemId": "medical_supplies", "quantity": 1, "consumed": true }
      ],
      "craftingTime": 30,
      "skillRequired": "intelligence",
      "skillDifficulty": 10,
      "workstation": "table"
    },
    {
      "id": "cook_meat",
      "name": "Cucina Carne",
      "description": "Prepara della carne cruda per renderla commestibile e nutriente.",
      "result": {
        "itemId": "cooked_meat",
        "quantity": 1
      },
      "ingredients": [
        { "itemId": "raw_meat", "quantity": 1, "consumed": true }
      ],
      "craftingTime": 20,
      "skillRequired": "wisdom",
      "skillDifficulty": 8,
      "workstation": "campfire"
    }
  ]
}
```

---

## **8. TESTING E QUALITÀ**

### **8.1 Testing Strategy**

**Piramide Testing per v2.0:**
```
🎯 E2E Tests (5%) - Flussi utente completi
🔧 Integration Tests (15%) - Interazioni tra domini
⚙️ Unit Tests (80%) - Singole funzioni/componenti
```

**Unit Testing per Domini:**
```typescript
// tests/domains/timeDomain.test.ts
describe('TimeDomain', () => {
  let timeDomain: TimeDomain;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockEventBus = new MockEventBus();
    timeDomain = new TimeDomain(mockEventBus);
  });

  describe('advanceTime', () => {
    it('should advance time correctly', () => {
      timeDomain.setTime(0, 1); // Midnight day 1
      timeDomain.advanceTime(60); // 1 hour

      expect(timeDomain.getCurrentTime()).toBe(60);
      expect(timeDomain.getTimeOfDay()).toBe('dawn');
    });

    it('should trigger day change at midnight', () => {
      timeDomain.setTime(1380, 1); // 11:00 PM
      timeDomain.advanceTime(60); // Advance to midnight

      expect(timeDomain.getDay()).toBe(2);
      expect(timeDomain.getCurrentTime()).toBe(0);
      expect(mockEventBus.getEmittedEvents()).toContainEqual(
        expect.objectContaining({
          type: GameEvents.DAY_PASSED,
          payload: { newDay: 2 }
        })
      );
    });
  });
});
```

**Integration Testing:**
```typescript
// tests/integration/movementIntegration.test.ts
describe('Movement Integration', () => {
  let worldDomain: WorldDomain;
  let timeDomain: TimeDomain;
  let survivalDomain: SurvivalDomain;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockEventBus = new MockEventBus();
    worldDomain = new WorldDomain(mockEventBus);
    timeDomain = new TimeDomain(mockEventBus);
    survivalDomain = new SurvivalDomain(mockEventBus);
  });

  it('should consume time and hunger when moving', async () => {
    // Setup
    await worldDomain.initialize();
    timeDomain.initialize();
    survivalDomain.initialize();

    // Initial state
    expect(timeDomain.getCurrentTime()).toBe(360); // 6:00 AM
    expect(survivalDomain.getHunger()).toBe(100);

    // Move player
    const result = worldDomain.movePlayer('north');

    // Assertions
    expect(result.success).toBe(true);
    expect(timeDomain.getCurrentTime()).toBeGreaterThan(360);
    expect(survivalDomain.getHunger()).toBeLessThan(100);

    // Check events emitted
    const events = mockEventBus.getEmittedEvents();
    expect(events).toContainEqual(
      expect.objectContaining({ type: GameEvents.PLAYER_MOVED })
    );
    expect(events).toContainEqual(
      expect.objectContaining({ type: GameEvents.TIME_ADVANCE })
    );
  });
});
```

### **8.2 Performance Requirements**

**Target Performance v2.0:**
- **FPS Target**: 60 FPS costante
- **Memory Usage**: < 100MB RAM
- **Load Time**: < 3 secondi initial load
- **Bundle Size**: < 5MB gzipped
- **Time to Interactive**: < 2 secondi

**Performance Monitoring:**
```typescript
// utils/performanceMonitor.ts
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    updateTime: 0,
    loadTime: 0
  };

  startFrame(): void {
    this.frameStartTime = performance.now();
  }

  endFrame(): void {
    const frameTime = performance.now() - this.frameStartTime;
    this.updateFPS(frameTime);
    this.metrics.renderTime = frameTime;
  }

  private updateFPS(frameTime: number): void {
    this.frameCount++;
    this.frameTimeAccumulator += frameTime;

    if (this.frameCount >= 60) { // Update every second
      this.metrics.fps = 1000 / (this.frameTimeAccumulator / this.frameCount);
      this.frameCount = 0;
      this.frameTimeAccumulator = 0;
    }
  }

  getMetrics(): PerformanceMetrics {
    // Update memory usage
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }

    return { ...this.metrics };
  }

  logPerformanceIssue(issue: string, data: any): void {
    console.warn(`[PERFORMANCE] ${issue}:`, data);

    // Could send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('performance_issue', { issue, data });
    }
  }
}
```

### **8.3 Anti-Regression Measures**

**Automated Regression Testing:**
```typescript
// tests/regression/systemRegression.test.ts
describe('System Regression Tests', () => {
  it('should not break time system after refactoring', async () => {
    // This test ensures time system works after any changes
    const timeSystem = new TimeSystem(mockEventBus);

    timeSystem.setTime(360, 1); // 6:00 AM Day 1
    timeSystem.advanceTime(60); // Advance 1 hour

    expect(timeSystem.getCurrentTime()).toBe(420); // 7:00 AM
    expect(timeSystem.getTimeOfDay()).toBe('day');
  });

  it('should maintain event triggering after changes', async () => {
    // Ensure events still trigger correctly
    const eventSystem = new EventSystem(mockEventBus);
    await eventSystem.loadEvents();

    const event = eventSystem.getRandomEvent('plains');
    expect(event).toBeDefined();
    expect(event!.biome).toBe('plains');
  });

  it('should preserve save/load compatibility', async () => {
    // Test save files remain compatible
    const saveData = createMockSaveData();
    const saveLoadService = new SaveLoadService();

    await saveLoadService.importSave(JSON.stringify(saveData));
    const loadedData = await saveLoadService.loadGame(saveData.id);

    expect(loadedData.character.name).toBe(saveData.gameState.character.name);
  });
});
```

---

## **9. ROADMAP DI SVILUPPO**

### **9.1 Fasi di Sviluppo (12 settimane)**

**Settimana 1-2: Core Architecture**
- ✅ Implementare struttura cartelle pianificata
- ✅ Creare sistemi core (time, events, config)
- ✅ Setup build system e testing
- **Deliverable**: Architettura funzionante senza features

**Settimana 3-4: Domain Implementation**
- ✅ Implementare dominio World
- ✅ Implementare dominio Character
- ✅ Implementare dominio Inventory
- **Deliverable**: Sistemi base funzionanti

**Settimana 5-6: Survival & Narrative**
- ✅ Sistema sopravvivenza completo
- ✅ Sistema narrativa con quest
- ✅ Integrazione emotiva personaggio
- **Deliverable**: Esperienza base giocabile

**Settimana 7-8: UI/UX Implementation**
- ✅ Design system CRT completo
- ✅ Componenti UI responsive
- ✅ Canvas rendering ottimizzato
- **Deliverable**: Interfaccia utente completa

**Settimana 9-10: Events & Content**
- ✅ Sistema eventi dinamici
- ✅ Database contenuti popolato
- ✅ Bilanciamento difficoltà
- **Deliverable**: Contenuti di gioco completi

**Settimana 11-12: Polish & Testing**
- ✅ Performance optimization
- ✅ Testing completo e bug fixing
- ✅ Balancing finale
- **Deliverable**: Versione 2.0 completa

### **9.2 Milestones Principali**

**Milestone 1: Architecture Complete (Week 2)**
- ✅ Tutti i sistemi core implementati
- ✅ Testing infrastructure attivo
- ✅ Performance baseline stabilita

**Milestone 2: Core Gameplay (Week 4)**
- ✅ Movimento,