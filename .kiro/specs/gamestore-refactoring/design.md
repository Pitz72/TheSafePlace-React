# Design Document - GameStore Refactoring

## Overview

Il refactoring del GameStore monolitico (1521 linee) in store specializzati seguendo il pattern di architettura modulare. L'obiettivo è creare 8 store specializzati coordinati da un GameStore facade, mantenendo la compatibilità completa con l'API esistente mentre si migliora drasticamente la manutenibilità e testabilità del codice.

## Architecture

### High-Level Architecture

```
                    useGameStore (Facade)
                           |
    ┌─────────────────────────────────────────────────────────┐
    |                  GameStore                              |
    |                (Coordinator)                            |
    |                  <300 lines                             |
    └─────────────────────────────────────────────────────────┘
                           |
    ┌──────────────────────┼──────────────────────┐
    |                      |                      |
┌───▼───┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌───▼────┐
│Character│  │  Inventory  │  │    World    │  │Weather │
│ Store   │  │   Store     │  │   Store     │  │ Store  │
│<250 lines│  │  <250 lines │  │  <250 lines │  │<200 lines│
└─────────┘  └─────────────┘  └─────────────┘  └────────┘

┌─────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐
│ Event   │  │   Shelter   │  │     UI      │  │  Save  │
│ Store   │  │   Store     │  │   Store     │  │ Store  │
│<200 lines│  │  <200 lines │  │  <150 lines │  │<300 lines│
└─────────┘  └─────────────┘  └─────────────┘  └────────┘
```

### Store Structure

```
src/stores/
├── gameStore.ts              # Main facade/coordinator (250-300 lines)
├── character/
│   └── characterStore.ts     # Character management (200-250 lines)
├── inventory/
│   └── inventoryStore.ts     # Items and inventory (200-250 lines)
├── world/
│   └── worldStore.ts         # Map, position, biomes (200-250 lines)
├── weather/
│   └── weatherStore.ts       # Weather system (150-200 lines)
├── events/
│   └── eventStore.ts         # Dynamic events (150-200 lines)
├── shelter/
│   └── shelterStore.ts       # Shelters and survival (150-200 lines)
├── ui/
│   └── uiStore.ts           # UI state management (100-150 lines)
└── save/
    └── saveStore.ts         # Save/load operations (250-300 lines)
```

## Components and Interfaces

### 1. GameStore (Facade/Coordinator)

**Responsabilità:**
- Coordinamento tra tutti gli store specializzati
- Mantenimento compatibilità API esistente
- Inizializzazione e sincronizzazione globale
- Gestione dipendenze tra store

**Interface:**
```typescript
interface GameStore {
  // Facade methods that delegate to specialized stores
  initializeGame: () => Promise<void>;
  
  // Character delegation
  characterSheet: ICharacterSheet;
  updateHP: (amount: number) => void;
  addExperience: (amount: number) => void;
  performAbilityCheck: (ability: string, difficulty: number, showRoll: boolean) => AbilityCheckResult;
  
  // Inventory delegation
  items: Record<string, IItem>;
  addItem: (itemId: string, quantity: number) => boolean;
  removeItem: (slotIndex: number, quantity: number) => boolean;
  
  // World delegation
  mapData: string[];
  playerPosition: Position;
  currentBiome: string | null;
  updatePlayerPosition: (position: Position, biomeChar: string) => void;
  
  // Weather delegation
  weatherState: WeatherState;
  updateWeather: () => void;
  
  // Events delegation
  currentEvent: GameEvent | null;
  triggerEvent: (biome: string) => void;
  resolveChoice: (choice: EventChoice) => void;
  
  // Shelter delegation
  shelterAccessState: Record<string, ShelterAccessInfo>;
  survivalState: SurvivalState;
  
  // UI delegation
  currentScreen: string;
  notifications: Notification[];
  setCurrentScreen: (screen: string) => void;
  
  // Save delegation
  saveCurrentGame: (slot: string) => Promise<boolean>;
  loadSavedGame: (slot: string) => Promise<boolean>;
}
```

### 2. CharacterStore

**Responsabilità:**
- Gestione characterSheet (HP, stats, livello, XP)
- Sistema equipaggiamento
- Skill checks e abilità
- Progressione personaggio

**State Interface:**
```typescript
interface CharacterState {
  characterSheet: ICharacterSheet;
  
  // Actions
  updateHP: (amount: number) => void;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  performAbilityCheck: (ability: string, difficulty: number, showRoll: boolean) => AbilityCheckResult;
  equipItem: (slotIndex: number) => boolean;
  unequipItem: (slotType: string) => boolean;
  
  // Selectors
  getCurrentHP: () => number;
  getMaxHP: () => number;
  getLevel: () => number;
  getExperience: () => number;
  getEquippedWeapon: () => IItem | null;
  getEquippedArmor: () => IItem | null;
}
```

### 3. InventoryStore

**Responsabilità:**
- Gestione inventario e oggetti
- Database oggetti
- Azioni oggetti (uso, equipaggiamento)
- Validazione oggetti

**State Interface:**
```typescript
interface InventoryState {
  items: Record<string, IItem>;
  
  // Actions
  addItem: (itemId: string, quantity: number) => boolean;
  removeItem: (slotIndex: number, quantity: number) => boolean;
  useItem: (slotIndex: number) => boolean;
  
  // Selectors
  getInventoryItems: () => (IInventorySlot | null)[];
  getItem: (itemId: string) => IItem | null;
  getAvailableActions: (itemId: string) => string[];
  canAddItem: (itemId: string, quantity: number) => boolean;
}
```

### 4. WorldStore

**Responsabilità:**
- Gestione mappa e posizione giocatore
- Sistema biomi
- Camera e viewport
- Movimento e navigazione

**State Interface:**
```typescript
interface WorldState {
  mapData: string[];
  isMapLoading: boolean;
  playerPosition: Position;
  cameraPosition: Position;
  currentBiome: string | null;
  
  // Actions
  updatePlayerPosition: (position: Position, biomeChar: string) => void;
  updateCameraPosition: (viewportSize: { width: number; height: number }) => void;
  
  // Selectors
  getBiomeKeyFromChar: (char: string) => string;
  getMapChar: (x: number, y: number) => string;
  isValidPosition: (x: number, y: number) => boolean;
}
```

### 5. WeatherStore

**Responsabilità:**
- Sistema meteo completo
- Transizioni e pattern meteo
- Effetti meteo su gameplay
- Modificatori temporali

**State Interface:**
```typescript
interface WeatherState {
  weatherState: WeatherState;
  
  // Actions
  updateWeather: () => void;
  generateWeatherChange: () => WeatherState;
  
  // Selectors
  getWeatherEffects: () => WeatherEffects;
  getWeatherDescription: (weather: WeatherType) => string;
  applyWeatherEffects: (baseValue: number, effectType: keyof WeatherEffects) => number;
}
```

### 6. EventStore

**Responsabilità:**
- Sistema eventi dinamici
- Database eventi
- Trigger e risoluzione eventi
- Tracking eventi visti

**State Interface:**
```typescript
interface EventState {
  eventDatabase: Record<string, GameEvent[]>;
  currentEvent: GameEvent | null;
  seenEventIds: string[];
  
  // Actions
  triggerEvent: (biome: string) => void;
  resolveChoice: (choice: EventChoice) => void;
  clearCurrentEvent: () => void;
  
  // Selectors
  getEventsForBiome: (biome: string) => GameEvent[];
  hasSeenEvent: (eventId: string) => boolean;
}
```

### 7. ShelterStore

**Responsabilità:**
- Sistema rifugi e accesso
- Stato sopravvivenza (fame, sete)
- Consumo notturno
- Investigazioni rifugi

**State Interface:**
```typescript
interface ShelterState {
  shelterAccessState: Record<string, ShelterAccessInfo>;
  survivalState: SurvivalState;
  lastShortRestTime: number | null;
  
  // Actions
  updateShelterAccess: (x: number, y: number, updates: Partial<ShelterAccessInfo>) => void;
  handleNightConsumption: () => void;
  
  // Selectors
  canInvestigateShelter: (x: number, y: number) => boolean;
  isShelterAccessible: (x: number, y: number) => boolean;
  getShelterInfo: (x: number, y: number) => ShelterAccessInfo | null;
}
```

### 8. UIStore

**Responsabilità:**
- Stato interfaccia utente
- Navigazione schermate
- Notifiche
- Stato menu e selezioni

**State Interface:**
```typescript
interface UIState {
  currentScreen: string;
  previousScreen: string | null;
  selectedInventoryIndex: number;
  menuSelectedIndex: number;
  notifications: Notification[];
  
  // Actions
  setCurrentScreen: (screen: string) => void;
  goBack: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  
  // Selectors
  getCurrentScreen: () => string;
  getNotifications: () => Notification[];
}
```

### 9. SaveStore

**Responsabilità:**
- Operazioni salvataggio e caricamento
- Export/import salvataggi
- Coordinamento con tutti gli store
- Recovery e validazione

**State Interface:**
```typescript
interface SaveState {
  // Actions
  saveCurrentGame: (slot: string) => Promise<boolean>;
  loadSavedGame: (slot: string) => Promise<boolean>;
  exportSave: (slot: string) => Promise<string | null>;
  importSave: () => Promise<boolean>;
  
  // Selectors
  getSaveSlots: () => SaveSlotInfo[];
  canSave: () => boolean;
  canLoad: (slot: string) => boolean;
}
```

## Integration Strategy

### Store Communication

```typescript
// Esempio di comunicazione tra store
const useGameStore = create<GameStore>((set, get) => ({
  // Facade methods that coordinate multiple stores
  updatePlayerPosition: (position: Position, biomeChar: string) => {
    // Update world state
    get().worldStore.updatePlayerPosition(position, biomeChar);
    
    // Update survival state (movement consumes resources)
    get().shelterStore.consumeMovementResources();
    
    // Trigger weather update
    get().weatherStore.updateWeather();
    
    // Potentially trigger events
    if (Math.random() < 0.2) {
      get().eventStore.triggerEvent(get().worldStore.currentBiome);
    }
  },
  
  // Direct delegation for simple operations
  addItem: (itemId: string, quantity: number) => 
    get().inventoryStore.addItem(itemId, quantity),
    
  updateHP: (amount: number) => 
    get().characterStore.updateHP(amount),
}));
```

### Compatibility Layer

```typescript
// Maintain existing API compatibility
export const useGameStore = () => {
  const characterStore = useCharacterStore();
  const inventoryStore = useInventoryStore();
  const worldStore = useWorldStore();
  // ... other stores
  
  return {
    // Character properties
    characterSheet: characterStore.characterSheet,
    updateHP: characterStore.updateHP,
    
    // Inventory properties
    items: inventoryStore.items,
    addItem: inventoryStore.addItem,
    
    // World properties
    mapData: worldStore.mapData,
    playerPosition: worldStore.playerPosition,
    
    // Coordinated actions
    initializeGame: async () => {
      await worldStore.loadMap();
      await eventStore.loadEvents();
      characterStore.initialize();
      // ... coordinate initialization
    },
    
    // ... all other existing API methods
  };
};
```

## Migration Strategy

### Phase 1: Create New Store Structure
1. Create all specialized store files with basic structure
2. Implement core state and actions for each store
3. Create facade GameStore that delegates to specialized stores
4. Maintain old GameStore as backup

### Phase 2: Migrate Functionality Incrementally
1. Start with simplest store (UIStore)
2. Move UI-related state and actions
3. Update facade to delegate UI operations
4. Test thoroughly before proceeding
5. Repeat for each store in order of complexity

### Phase 3: Update Integration Points
1. Ensure all components still work with facade
2. Update any direct store access to use facade
3. Test all game functionality
4. Performance testing

### Phase 4: Cleanup and Optimization
1. Remove old GameStore code
2. Optimize store communication
3. Add comprehensive tests for each store
4. Documentation update

## Testing Strategy

### Unit Tests for Each Store
```typescript
// Example: CharacterStore tests
describe('CharacterStore', () => {
  it('should update HP correctly', () => {
    const store = createCharacterStore();
    store.updateHP(10);
    expect(store.getCurrentHP()).toBe(110);
  });
  
  it('should handle level up', () => {
    const store = createCharacterStore();
    store.addExperience(1000);
    expect(store.getLevel()).toBe(2);
  });
});
```

### Integration Tests
```typescript
describe('GameStore Integration', () => {
  it('should coordinate movement between stores', () => {
    const gameStore = useGameStore();
    gameStore.updatePlayerPosition({x: 10, y: 10}, 'F');
    
    expect(gameStore.playerPosition).toEqual({x: 10, y: 10});
    expect(gameStore.currentBiome).toBe('FOREST');
    expect(gameStore.survivalState.hunger).toBeLessThan(100);
  });
});
```

## Performance Considerations

### Store Optimization
- Each store uses Zustand's selective subscriptions
- Minimize cross-store dependencies
- Use computed selectors for derived state
- Implement store-level memoization where needed

### Memory Management
- Clear unused event data
- Optimize weather pattern storage
- Implement lazy loading for large datasets

## Benefits of Refactored Architecture

### Maintainability
- Each store <300 lines (vs 1521 monolith)
- Single responsibility per store
- Easy to locate and fix bugs
- Clear separation of concerns

### Testability
- Each store can be tested in isolation
- Mocked dependencies for unit tests
- Clear interfaces for integration tests

### Scalability
- Easy to add new systems (Crafting, Combat)
- Store-specific optimizations
- Parallel development possible
- LLM-friendly file sizes

### Developer Experience
- Clear code organization
- Faster IDE navigation
- Better IntelliSense support
- Easier onboarding for new developers

---

This refactoring will transform the codebase from a monolithic structure to a clean, modular architecture that can easily accommodate the planned Crafting and Combat systems while maintaining full backward compatibility.