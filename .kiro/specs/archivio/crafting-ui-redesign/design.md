# Design Document

## Overview

Il redesign dell'interfaccia di crafting mira a creare un'esperienza coerente con le altre schermate del gioco, mantenendo la semplicità e l'usabilità. L'interfaccia seguirà il pattern consolidato di CharacterSheetScreen, InventoryScreen e LevelUpScreen con layout a colonne, navigazione da tastiera e sistema di colori phosphor-green.

## Architecture

### Component Structure

```
CraftingScreen (Redesigned)
├── Header Section
│   ├── Title: "BANCO DI LAVORO"
│   └── Status Info: Ricette disponibili
├── Main Layout (2 columns)
│   ├── Left Column (50%)
│   │   ├── Recipe List Panel
│   │   └── Navigation indicators
│   └── Right Column (50%)
│       ├── Recipe Details Panel
│       ├── Materials Status
│       └── Crafting Requirements
└── Footer Section
    └── Command Instructions
```

### State Management

Il componente utilizzerà:
- `useCraftingStore` per le ricette e lo stato di crafting
- `useGameStore` per inventario e character sheet
- State locale per navigazione UI (selectedIndex)

## Components and Interfaces

### 1. Main CraftingScreen Component

```typescript
interface CraftingScreenProps {
  onExit: () => void;
}

const CraftingScreen: React.FC<CraftingScreenProps> = ({ onExit }) => {
  // State management
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Store hooks
  const craftingStore = useCraftingStore();
  const gameStore = useGameStore();
  
  // Computed values
  const availableRecipes = craftingStore.getAvailableRecipes();
  const selectedRecipe = availableRecipes[selectedIndex] || null;
  
  // Keyboard navigation
  // Render logic
}
```

### 2. Recipe Status System

```typescript
enum RecipeStatus {
  CRAFTABLE = 'craftable',           // Verde - Tutti i requisiti soddisfatti
  MISSING_MATERIALS = 'missing_materials', // Rosso - Mancano materiali
  INSUFFICIENT_LEVEL = 'insufficient_level' // Grigio - Livello insufficiente
}

function getRecipeStatus(recipe: Recipe, inventory: IInventorySlot[], character: ICharacterSheet): RecipeStatus {
  if (!meetsSkillRequirement(recipe, character)) {
    return RecipeStatus.INSUFFICIENT_LEVEL;
  }
  if (!hasRequiredMaterials(recipe, inventory)) {
    return RecipeStatus.MISSING_MATERIALS;
  }
  return RecipeStatus.CRAFTABLE;
}
```

### 3. Color System

```typescript
const RECIPE_COLORS = {
  [RecipeStatus.CRAFTABLE]: 'text-green-400 bg-green-900/20',
  [RecipeStatus.MISSING_MATERIALS]: 'text-red-400 bg-red-900/20',
  [RecipeStatus.INSUFFICIENT_LEVEL]: 'text-gray-500 bg-gray-800/20'
};

const MATERIAL_COLORS = {
  sufficient: 'text-green-400',
  insufficient: 'text-red-400'
};
```

## Data Models

### Recipe Display Model

```typescript
interface RecipeDisplayInfo {
  recipe: Recipe;
  status: RecipeStatus;
  displayName: string;
  statusText: string;
  colorClass: string;
  canCraft: boolean;
}
```

### Material Display Model

```typescript
interface MaterialDisplayInfo {
  itemId: string;
  name: string;
  owned: number;
  required: number;
  sufficient: boolean;
  colorClass: string;
  displayText: string;
}
```

## Error Handling

### Input Validation
- Verifica che le ricette siano caricate correttamente
- Gestione graceful di ricette corrotte o mancanti
- Fallback per oggetti non trovati nel database

### State Recovery
- Ripristino automatico dell'indice di selezione se fuori range
- Inizializzazione sicura delle ricette al mount del componente
- Gestione errori di crafting con feedback utente

## Testing Strategy

### Unit Tests
1. **Recipe Status Calculation**
   - Test per ogni combinazione di materiali/livello
   - Verifica colori corretti per ogni status
   - Edge cases con ricette vuote o corrotte

2. **Keyboard Navigation**
   - Test movimento su/giù con W/S e frecce
   - Test ESC per uscita
   - Test ENTER per crafting

3. **Material Status Display**
   - Verifica calcolo quantità possedute vs richieste
   - Test colori per materiali sufficienti/insufficienti
   - Test con inventario vuoto

### Integration Tests
1. **Store Integration**
   - Test sincronizzazione con craftingStore
   - Test aggiornamento dopo crafting riuscito
   - Test persistenza stato navigazione

2. **Game Integration**
   - Test integrazione con sistema inventario
   - Test requisiti livello character sheet
   - Test feedback messaggi di gioco

### Visual Tests
1. **Layout Consistency**
   - Confronto visivo con altre schermate
   - Test responsive su diverse risoluzioni
   - Verifica allineamento elementi

2. **Color System**
   - Test contrasto e leggibilità
   - Verifica coerenza con tema phosphor-green
   - Test accessibilità colori

## Implementation Plan

### Phase 1: Core Layout
- Creare struttura base a 2 colonne
- Implementare header e footer
- Aggiungere stili base phosphor-green

### Phase 2: Recipe List
- Implementare lista ricette con navigazione
- Aggiungere sistema colori per status
- Implementare selezione con evidenziazione

### Phase 3: Recipe Details
- Creare pannello dettagli ricetta
- Implementare visualizzazione materiali
- Aggiungere indicatori requisiti livello

### Phase 4: Keyboard Navigation
- Implementare tutti i controlli da tastiera
- Aggiungere gestione ESC per uscita
- Implementare ENTER per crafting

### Phase 5: Polish & Testing
- Ottimizzare performance rendering
- Aggiungere animazioni transizioni
- Test completi e bug fixing

## Technical Considerations

### Performance
- Memoizzazione calcoli status ricette
- Lazy loading dettagli ricette non selezionate
- Ottimizzazione re-render con React.memo

### Accessibility
- Supporto navigazione da tastiera completa
- Indicatori visivi chiari per stato ricette
- Contrasto colori adeguato per leggibilità

### Maintainability
- Separazione logica business da presentazione
- Componenti riutilizzabili per elementi comuni
- Configurazione centralizzata colori e stili

### Compatibility
- Mantenimento API esistenti craftingStore
- Retrocompatibilità con sistema ricette attuale
- Integrazione seamless con altre schermate