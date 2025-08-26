# 🔧 RIFERIMENTO TECNICO v0.5.0 "Phoenix"
## The Safe Place - Technical Implementation Guide

**Versione**: v0.5.0 "Phoenix"  
**Codename**: Phoenix (Rinascita completa con sistema moderno)  
**Target**: Sviluppatori e Manutentori  
**Ultimo Aggiornamento**: 2025-08-23

---

## 🏗️ **IMPLEMENTAZIONE CORE**

### **Game Rules Implementation**
```typescript
// D&D Stat Generation
export const generateStats = (): CharacterStats => ({
  strength: rollDice(3, 6),
  dexterity: rollDice(3, 6),
  constitution: rollDice(3, 6),
  intelligence: rollDice(3, 6),
  wisdom: rollDice(3, 6),
  charisma: rollDice(3, 6)
});

// Skill Check System
export const performSkillCheck = (
  stat: number, 
  difficulty: number
): SkillCheckResult => {
  const roll = rollDice(1, 20);
  const modifier = Math.floor((stat - 10) / 2);
  const total = roll + modifier;
  
  return {
    roll,
    modifier,
    total,
    success: total >= difficulty,
    critical: roll === 20,
    fumble: roll === 1
  };
};
```

### **Experience System**
```typescript
// Experience Calculation
export const calculateRequiredExp = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Level Up Check
export const checkLevelUp = (currentExp: number, currentLevel: number): boolean => {
  const required = calculateRequiredExp(currentLevel + 1);
  return currentExp >= required;
};
```

---

## 🎮 **SURVIVAL MECHANICS**

### **Hunger/Thirst System**
```typescript
// Night Consumption
export const applyNightConsumption = (player: PlayerState): PlayerState => {
  return {
    ...player,
    hunger: Math.max(0, player.hunger - HUNGER_NIGHT_CONSUMPTION),
    thirst: Math.max(0, player.thirst - THIRST_NIGHT_CONSUMPTION),
    hp: calculateHealthAfterRest(player)
  };
};

// Health Recovery
export const calculateHealthAfterRest = (player: PlayerState): number => {
  if (player.hunger < 20 || player.thirst < 20) {
    return Math.max(1, player.hp - 5); // Malnutrition damage
  }
  
  const maxHp = 10 + Math.floor((player.stats.constitution - 10) / 2);
  return Math.min(maxHp, player.hp + 3); // Rest recovery
};
```

### **Time System**
```typescript
// Time Progression
export const advanceTime = (currentTime: GameTime): GameTime => ({
  ...currentTime,
  hour: (currentTime.hour + 1) % 24,
  day: currentTime.hour === 23 ? currentTime.day + 1 : currentTime.day
});

// Time-based Events
export const getTimeBasedEvents = (time: GameTime): EventType[] => {
  const events: EventType[] = [];
  
  if (time.hour === 6) events.push('DAWN');
  if (time.hour === 18) events.push('DUSK');
  if (time.hour === 22) events.push('NIGHT_CONSUMPTION');
  
  return events;
};
```

---

## 📦 **INVENTORY SYSTEM**

### **Carry Weight Calculation**
```typescript
export const calculateCarryCapacity = (strength: number): number => {
  return Math.floor(strength * 10); // 10 units per STR point
};

export const calculateCurrentWeight = (inventory: InventoryItem[]): number => {
  return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
};
```

### **Loot Generation**
```typescript
// Balanced Loot Tables
export const LOOT_TABLES = {
  common: [
    { item: 'bread', weight: 0.4, rarity: 'common' },
    { item: 'water', weight: 0.3, rarity: 'common' },
    { item: 'coins', weight: 0.3, rarity: 'common' }
  ],
  rare: [
    { item: 'health_potion', weight: 0.1, rarity: 'uncommon' },
    { item: 'magic_scroll', weight: 0.05, rarity: 'rare' },
    { item: 'enchanted_weapon', weight: 0.01, rarity: 'epic' }
  ]
};

export const generateLoot = (lootType: 'common' | 'rare'): InventoryItem[] => {
  const table = LOOT_TABLES[lootType];
  const roll = Math.random();
  
  return table.filter(entry => roll <= entry.weight)
              .map(entry => createItem(entry.item));
};
```

---

## 🧪 **TESTING ARCHITECTURE**

### **Jest Configuration**
```javascript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/rules/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### **Test Examples**
```typescript
// Character Creation Tests
describe('Character Creation', () => {
  test('should generate valid stats in 3-18 range', () => {
    const stats = generateStats();
    
    Object.values(stats).forEach(stat => {
      expect(stat).toBeGreaterThanOrEqual(3);
      expect(stat).toBeLessThanOrEqual(18);
    });
  });
  
  test('should calculate correct skill modifiers', () => {
    expect(getSkillModifier(18)).toBe(4);
    expect(getSkillModifier(10)).toBe(0);
    expect(getSkillModifier(3)).toBe(-4);
  });
});

// Save System Tests
describe('Save System', () => {
  test('should save and load game state correctly', () => {
    const gameState = createTestGameState();
    saveGame(gameState, 'slot1');
    
    const loadedState = loadGame('slot1');
    expect(loadedState).toEqual(gameState);
  });
});
```

---

## 💾 **SAVE SYSTEM IMPLEMENTATION**

### **Save Data Structure**
```typescript
interface SaveData {
  version: string;
  timestamp: number;
  player: {
    name: string;
    level: number;
    experience: number;
    stats: CharacterStats;
    hp: number;
    hunger: number;
    thirst: number;
    inventory: InventoryItem[];
    equipment: Equipment;
  };
  game: {
    currentScreen: string;
    time: GameTime;
    completedQuests: string[];
    flags: Record<string, boolean>;
  };
  metadata: {
    playtime: number;
    saveCount: number;
    lastModified: number;
  };
}
```

### **Save/Load Implementation**
```typescript
export const saveGame = (gameState: GameState, slot: string): boolean => {
  try {
    const saveData: SaveData = {
      version: '0.5.0',
      timestamp: Date.now(),
      player: gameState.player,
      game: gameState.game,
      metadata: {
        playtime: gameState.metadata.playtime,
        saveCount: gameState.metadata.saveCount + 1,
        lastModified: Date.now()
      }
    };
    
    localStorage.setItem(`save_${slot}`, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
};

export const loadGame = (slot: string): SaveData | null => {
  try {
    const saveString = localStorage.getItem(`save_${slot}`);
    if (!saveString) return null;
    
    const saveData = JSON.parse(saveString) as SaveData;
    
    // Data migration if needed
    return migrateSaveData(saveData);
  } catch (error) {
    console.error('Load failed:', error);
    return null;
  }
};
```

---

## 🛡️ **ERROR HANDLING SYSTEM**

### **React Error Boundary**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class GameErrorBoundary extends Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      logErrorToService({
        error,
        errorInfo,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error}
        errorId={this.state.errorId}
        onRetry={() => this.setState({ hasError: false })}
      />;
    }
    
    return this.props.children;
  }
}
```

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **Bundle Optimization**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          state: ['zustand'],
          ui: ['@headlessui/react'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### **Component Optimization**
```typescript
// Memoized Components
export const GameJournal = memo(({ messages }: GameJournalProps) => {
  const displayMessages = useMemo(() => 
    messages.slice(-MAX_DISPLAYED_MESSAGES),
    [messages]
  );
  
  return (
    <div className="journal-container">
      {displayMessages.map(message => (
        <JournalMessage key={message.id} message={message} />
      ))}
    </div>
  );
});

// Optimized State Updates
const useOptimizedGameState = () => {
  const updatePlayer = useCallback((updates: Partial<PlayerState>) => {
    setPlayer(current => ({ ...current, ...updates }));
  }, []);
  
  return { updatePlayer };
};
```

---

## 🔧 **DEVELOPMENT TOOLS**

### **Custom Hooks**
```typescript
// Game State Hook
export const useGameState = () => {
  const player = usePlayerStore(state => state.player);
  const game = useGameStore(state => state.game);
  const updatePlayer = usePlayerStore(state => state.updatePlayer);
  
  return { player, game, updatePlayer };
};

// Save System Hook
export const useSaveSystem = () => {
  const saveGame = useCallback((slot: string) => {
    const gameState = getCurrentGameState();
    return saveToLocalStorage(gameState, slot);
  }, []);
  
  const loadGame = useCallback((slot: string) => {
    const saveData = loadFromLocalStorage(slot);
    if (saveData) {
      restoreGameState(saveData);
    }
  }, []);
  
  return { saveGame, loadGame };
};
```

---

## 📋 **MAINTENANCE GUIDELINES**

### **Code Review Checklist**
- [ ] TypeScript strict mode compliance
- [ ] Error handling implementation
- [ ] Test coverage > 80%
- [ ] Performance considerations
- [ ] Accessibility requirements
- [ ] Mobile responsiveness

### **Release Process**
1. **Update version** in package.json
2. **Run full test suite** (`npm test`)
3. **Generate coverage report** (`npm run test:coverage`)
4. **Build production bundle** (`npm run build`)
5. **Performance audit** (Lighthouse)
6. **Update documentation**
7. **Create release notes**

---

*Documento tecnico v0.5.0 - Per implementatori e manutentori del sistema*