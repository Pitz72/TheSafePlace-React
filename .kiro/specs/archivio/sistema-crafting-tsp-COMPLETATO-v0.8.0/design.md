# Design Document - Sistema di Crafting

## Overview

Il sistema di crafting per "The Safe Place" implementa una meccanica di sopravvivenza realistica e strategica che permette ai giocatori di trasformare materiali trovati nel mondo in oggetti utili. Il sistema è progettato per essere completamente accessibile da tastiera e integrarsi perfettamente con l'architettura esistente del gioco basata su Zustand e React.

## Architecture

### High-Level Architecture

```
ShelterScreen
    ↓ [B]anco di Lavoro
CraftingScreen
    ├── RecipeList (sinistra)
    ├── RecipeDetails (centro)  
    ├── ItemPreview (destra)
    └── ActionBar (basso)
```

### Component Structure

```
src/
├── components/
│   └── crafting/
│       ├── CraftingScreen.tsx          # Componente principale
│       ├── RecipeList.tsx              # Lista ricette navigabile
│       ├── RecipeDetails.tsx           # Dettagli ricetta selezionata
│       ├── ItemPreview.tsx             # Anteprima oggetto risultante
│       └── CraftingActionBar.tsx       # Barra azioni e comandi
├── data/
│   └── recipes.json                    # Database ricette
├── stores/
│   └── craftingStore.ts                # Store Zustand per crafting
├── types/
│   └── crafting.ts                     # Tipi TypeScript
└── utils/
    └── craftingUtils.ts                # Utility functions
```

## Components and Interfaces

### 1. CraftingScreen Component

**Responsabilità:**
- Gestione dello stato principale della schermata
- Coordinamento tra i sotto-componenti
- Gestione input tastiera globali (ESC per uscire)
- Layout responsive a 4 sezioni

**Props Interface:**
```typescript
interface CraftingScreenProps {
  onExit: () => void; // Callback per tornare a ShelterScreen
}
```

**State Management:**
- Utilizza `craftingStore` per stato globale
- Gestisce `selectedRecipeIndex` per navigazione
- Mantiene `availableRecipes` filtrate per giocatore

### 2. RecipeList Component

**Responsabilità:**
- Visualizzazione lista ricette conosciute
- Navigazione con W/S (o frecce)
- Indicazione stato disponibilità (colori)
- Selezione ricetta attiva

**Props Interface:**
```typescript
interface RecipeListProps {
  recipes: Recipe[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
}
```

**Rendering Logic:**
```typescript
// Pseudo-codice per rendering lista
recipes.map((recipe, index) => (
  <div 
    className={`recipe-item ${isAvailable(recipe) ? 'available' : 'unavailable'} ${index === selectedIndex ? 'selected' : ''}`}
    key={recipe.id}
  >
    {recipe.resultItem.name} ({isAvailable(recipe) ? 'Disponibile' : 'Non Disponibile'})
  </div>
))
```

### 3. RecipeDetails Component

**Responsabilità:**
- Visualizzazione dettagli ricetta selezionata
- Lista materiali con stato possesso
- Requisiti abilità (se presenti)
- Aggiornamento dinamico su cambio selezione

**Props Interface:**
```typescript
interface RecipeDetailsProps {
  recipe: Recipe | null;
  playerInventory: InventoryItem[];
  playerSkills: PlayerSkills;
}
```

### 4. ItemPreview Component

**Responsabilità:**
- Anteprima statistiche oggetto risultante
- Visualizzazione proprietà specifiche per tipo
- Confronto con oggetti simili posseduti

**Props Interface:**
```typescript
interface ItemPreviewProps {
  resultItem: Item;
  showComparison?: boolean;
}
```

### 5. CraftingActionBar Component

**Responsabilità:**
- Visualizzazione comandi disponibili
- Gestione azione crafting
- Feedback stato azioni

**Props Interface:**
```typescript
interface CraftingActionBarProps {
  canCraft: boolean;
  onCraft: () => void;
  onExit: () => void;
}
```

## Data Models

### Recipe Interface

```typescript
interface Recipe {
  id: string;                    // Identificatore unico
  resultItemId: string;          // ID oggetto risultante
  resultQuantity: number;        // Quantità prodotta
  components: RecipeComponent[]; // Materiali richiesti
  skillRequirement?: {           // Requisito abilità opzionale
    skill: string;
    level: number;
  };
  unlockedByLevel?: number;      // Livello sblocco automatico
  unlockedByManual?: string;     // ID manuale che sblocca
}

interface RecipeComponent {
  itemId: string;    // ID materiale richiesto
  quantity: number;  // Quantità necessaria
}
```

### Crafting Store State

```typescript
interface CraftingState {
  // Stato UI
  selectedRecipeIndex: number;
  isOpen: boolean;
  
  // Dati ricette
  allRecipes: Recipe[];
  knownRecipeIds: string[];
  
  // Azioni
  setSelectedRecipe: (index: number) => void;
  openCrafting: () => void;
  closeCrafting: () => void;
  unlockRecipe: (recipeId: string) => void;
  craftItem: (recipeId: string) => Promise<boolean>;
  
  // Utility
  getAvailableRecipes: () => Recipe[];
  canCraftRecipe: (recipeId: string) => boolean;
  getMaterialStatus: (recipeId: string) => MaterialStatus[];
}
```

## Error Handling

### Validation Layers

1. **UI Level:** Disabilita pulsanti per ricette non disponibili
2. **Store Level:** Verifica materiali e abilità prima del crafting
3. **Utility Level:** Validazione integrità dati ricette

### Error Messages

```typescript
const CRAFTING_ERRORS = {
  INSUFFICIENT_MATERIALS: "Non hai abbastanza materiali per questa ricetta.",
  INSUFFICIENT_SKILL: "Le tue abilità non sono ancora sufficienti per questo progetto.",
  INVENTORY_FULL: "Il tuo inventario è pieno. Libera spazio prima di creare oggetti.",
  RECIPE_NOT_FOUND: "Ricetta non trovata o corrotta.",
  UNKNOWN_ERROR: "Errore sconosciuto durante il crafting."
};
```

## Testing Strategy

### Unit Tests

1. **craftingUtils.ts**
   - `canCraftRecipe()` con vari scenari materiali
   - `getMaterialStatus()` per calcolo stato possesso
   - `calculateCraftingXP()` per assegnazione esperienza

2. **craftingStore.ts**
   - Azioni store (unlock, craft, navigation)
   - Selettori derivati (available recipes, material status)
   - Persistenza stato ricette conosciute

### Integration Tests

1. **CraftingScreen Flow**
   - Apertura da ShelterScreen
   - Navigazione completa interfaccia
   - Processo crafting end-to-end
   - Integrazione con inventario e XP

2. **Recipe System**
   - Caricamento ricette da JSON
   - Sblocco automatico per livello
   - Sblocco tramite manuali trovati

### E2E Tests

1. **Complete Crafting Journey**
   - Raccolta materiali nel mondo
   - Accesso rifugio e crafting
   - Creazione oggetto e verifica inventario
   - Utilizzo oggetto creato

## Performance Considerations

### Optimization Strategies

1. **Recipe Filtering:** Cache delle ricette disponibili aggiornata solo su cambio inventario
2. **Material Calculation:** Memoizzazione calcoli stato materiali
3. **Component Rendering:** React.memo per componenti che non cambiano frequentemente
4. **Data Loading:** Lazy loading ricette complesse o future espansioni

### Memory Management

- Cleanup listeners tastiera su unmount
- Debounce navigazione rapida lista ricette
- Limite rendering ricette visibili (virtualizzazione se necessario)

## Integration Points

### Existing Systems Integration

1. **Inventory System**
   ```typescript
   // Utilizzo funzioni esistenti
   import { addItem, removeItem, getInventoryItems } from '../stores/gameStore';
   
   const craftItem = async (recipe: Recipe) => {
     // Rimuovi materiali
     recipe.components.forEach(comp => {
       removeItem(comp.itemId, comp.quantity);
     });
     
     // Aggiungi risultato
     addItem(recipe.resultItemId, recipe.resultQuantity);
   };
   ```

2. **Character Progression**
   ```typescript
   // Integrazione con sistema XP esistente
   import { addExperience } from '../stores/gameStore';
   
   const onCraftingSuccess = (recipe: Recipe) => {
     const xpGained = calculateCraftingXP(recipe);
     addExperience(xpGained);
   };
   ```

3. **Game Journal**
   ```typescript
   // Utilizzo sistema messaggi esistente
   import { addJournalEntry } from '../stores/gameStore';
   
   const logCraftingSuccess = (itemName: string, quantity: number) => {
     addJournalEntry(`Usando il banco di lavoro, hai creato: ${itemName} (x${quantity}).`);
   };
   ```

4. **Save System**
   ```typescript
   // Estensione characterSheet esistente
   interface CharacterSheet {
     // ... campi esistenti
     knownRecipes: string[]; // Nuovo campo per ricette conosciute
   }
   ```

## Future Extensibility

### Planned Extensions

1. **Repair System:** Estensione per riparazione oggetti danneggiati
2. **Disassembly:** Sistema smontaggio oggetti per recuperare materiali
3. **Advanced Recipes:** Ricette multi-step o con probabilità successo
4. **Crafting Stations:** Diversi tipi di banco lavoro con specializzazioni

### Architecture Flexibility

- Plugin system per nuovi tipi ricette
- Modular recipe loaders per espansioni
- Extensible skill requirements system
- Configurable crafting rules per difficoltà

---

Questo design fornisce una base solida e scalabile per implementare il sistema di crafting, mantenendo coerenza con l'architettura esistente e preparando il terreno per future espansioni del gameplay.