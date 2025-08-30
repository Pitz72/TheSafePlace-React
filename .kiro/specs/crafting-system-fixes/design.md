# Design Document

## Overview

Questo design risolve i problemi critici del sistema di crafting attraverso un approccio sistematico che include: fix degli errori di loop infinito, creazione di ricette realistiche, integrazione con il sistema di loot, bilanciamento delle risorse iniziali e ottimizzazione delle performance dell'interfaccia.

## Architecture

### Problem Analysis

#### 1. Errori di Loop Infinito
**Causa**: `useEffect` che chiama `initializeRecipes` ad ogni render
**Soluzione**: Memoizzazione e controlli di stato per evitare re-inizializzazioni

#### 2. Ricette Demo
**Problema**: Ricette placeholder non realistiche
**Soluzione**: Database ricette complete per sopravvivenza post-apocalittica

#### 3. Mancanza Risorse Iniziali
**Problema**: Giocatore inizia senza possibilità di crafting
**Soluzione**: Kit di sopravvivenza iniziale con materiali base

#### 4. Sistema Loot Non Integrato
**Problema**: Ricette non trovabili nel mondo
**Soluzione**: Integrazione manuali crafting nel sistema loot esistente

### Component Structure

```
Crafting System (Fixed)
├── Recipe Database
│   ├── Survival Recipes (basic)
│   ├── Advanced Recipes (unlockable)
│   └── Expert Recipes (rare materials)
├── Material System
│   ├── Basic Materials (starter kit)
│   ├── Common Materials (world loot)
│   └── Rare Materials (special locations)
├── Discovery System
│   ├── Level-based Unlocks
│   ├── Manual-based Unlocks
│   └── Loot Integration
└── UI Optimization
    ├── State Management Fix
    ├── Performance Optimization
    └── Error Handling
```

## Components and Interfaces

### 1. Recipe Database Redesign

```typescript
interface SurvivalRecipe extends Recipe {
  rarity: 'basic' | 'common' | 'rare' | 'expert';
  category: 'survival' | 'weapons' | 'tools' | 'medical' | 'shelter';
  discoveryMethod: 'starter' | 'level' | 'manual' | 'exploration';
  requiredLocation?: 'shelter' | 'workbench' | 'forge';
}

// Esempio ricette realistiche
const SURVIVAL_RECIPES = {
  // Ricette Starter (conosciute da subito)
  improvised_knife: {
    id: 'improvised_knife',
    resultItemId: 'WEAP_KNIFE_IMPROVISED',
    components: [
      { itemId: 'CRAFT_METAL_SCRAP', quantity: 1 },
      { itemId: 'CRAFT_CLOTH', quantity: 1 }
    ],
    rarity: 'basic',
    discoveryMethod: 'starter'
  },
  
  basic_bandage: {
    id: 'basic_bandage',
    resultItemId: 'MED_BANDAGE_BASIC',
    components: [
      { itemId: 'CRAFT_CLOTH', quantity: 2 }
    ],
    rarity: 'basic',
    discoveryMethod: 'starter'
  }
};
```

### 2. Starter Kit System

```typescript
interface StarterKit {
  knownRecipes: string[];
  materials: { itemId: string; quantity: number }[];
  description: string;
}

const SURVIVOR_STARTER_KIT: StarterKit = {
  knownRecipes: [
    'improvised_knife',
    'basic_bandage', 
    'makeshift_torch',
    'simple_trap'
  ],
  materials: [
    { itemId: 'CRAFT_METAL_SCRAP', quantity: 3 },
    { itemId: 'CRAFT_CLOTH', quantity: 5 },
    { itemId: 'CRAFT_WOOD', quantity: 4 },
    { itemId: 'CRAFT_ROPE', quantity: 2 }
  ],
  description: 'Kit di sopravvivenza di base per iniziare l\'avventura'
};
```

### 3. Loot Integration System

```typescript
interface CraftingManual {
  id: string;
  name: string;
  description: string;
  unlocksRecipes: string[];
  rarity: number; // 1-100, più basso = più raro
  locations: string[]; // Dove può essere trovato
}

const CRAFTING_MANUALS = {
  weapons_manual_basic: {
    id: 'manual_weapons_basic',
    name: 'Manuale: Armi Improvvisate',
    unlocksRecipes: ['reinforced_knife', 'makeshift_spear', 'sling'],
    rarity: 15,
    locations: ['military_outpost', 'police_station']
  },
  
  medical_manual_advanced: {
    id: 'manual_medical_advanced', 
    name: 'Manuale Medico Avanzato',
    unlocksRecipes: ['antiseptic', 'painkiller', 'suture_kit'],
    rarity: 5,
    locations: ['hospital', 'clinic']
  }
};
```

### 4. UI State Management Fix

```typescript
// Fix per il loop infinito
const CraftingScreenFixed: React.FC<Props> = ({ onExit }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const craftingStore = useCraftingStore();
  
  // Inizializzazione una sola volta
  useEffect(() => {
    if (!isInitialized && craftingStore.allRecipes.length === 0) {
      setIsInitialized(true);
      craftingStore.initializeRecipes()
        .then(() => {
          // Sblocca ricette starter se è un nuovo personaggio
          if (characterSheet && !characterSheet.knownRecipes?.length) {
            craftingStore.unlockStarterRecipes();
          }
        })
        .catch(console.error);
    }
  }, [isInitialized, craftingStore]);
  
  // Memoizzazione per evitare re-render inutili
  const recipesWithStatus = useMemo(() => {
    return craftingStore.getAvailableRecipes().map(recipe => ({
      recipe,
      status: getRecipeStatus(recipe),
      canCraft: canCraftRecipe(recipe, inventory, characterSheet)
    }));
  }, [craftingStore.allRecipes, inventory, characterSheet]);
};
```

## Data Models

### Recipe Categories

```typescript
// Categorie realistiche per mondo post-apocalittico
enum RecipeCategory {
  SURVIVAL = 'survival',     // Oggetti base sopravvivenza
  WEAPONS = 'weapons',       // Armi improvvisate
  TOOLS = 'tools',          // Attrezzi utili
  MEDICAL = 'medical',      // Cure e medicine
  SHELTER = 'shelter',      // Miglioramenti rifugio
  FOOD = 'food',           // Preparazione cibo
  ELECTRONICS = 'electronics' // Riparazioni elettroniche
}

// Materiali realistici
enum CraftingMaterial {
  // Materiali Base (starter kit)
  METAL_SCRAP = 'CRAFT_METAL_SCRAP',
  CLOTH = 'CRAFT_CLOTH', 
  WOOD = 'CRAFT_WOOD',
  ROPE = 'CRAFT_ROPE',
  
  // Materiali Comuni (world loot)
  PLASTIC = 'CRAFT_PLASTIC',
  GLASS = 'CRAFT_GLASS',
  RUBBER = 'CRAFT_RUBBER',
  WIRE = 'CRAFT_WIRE',
  
  // Materiali Rari (special locations)
  STEEL = 'CRAFT_STEEL',
  ELECTRONICS = 'CRAFT_ELECTRONICS',
  CHEMICALS = 'CRAFT_CHEMICALS',
  MEDICAL_SUPPLIES = 'CRAFT_MEDICAL_SUPPLIES'
}
```

### Balanced Recipe Examples

```typescript
const BALANCED_RECIPES = {
  // Livello 1 - Sopravvivenza Base
  improvised_knife: {
    materials: [
      { id: 'CRAFT_METAL_SCRAP', qty: 1 },
      { id: 'CRAFT_CLOTH', qty: 1 }
    ],
    result: { damage: 8, durability: 50 },
    craftTime: 30, // secondi
    xpGain: 10
  },
  
  // Livello 5 - Armi Migliorate  
  reinforced_knife: {
    materials: [
      { id: 'WEAP_KNIFE_IMPROVISED', qty: 1 }, // Upgrade existing
      { id: 'CRAFT_STEEL', qty: 1 },
      { id: 'CRAFT_WIRE', qty: 2 }
    ],
    result: { damage: 15, durability: 120 },
    skillRequirement: { skill: 'crafting', level: 5 },
    craftTime: 120,
    xpGain: 50
  },
  
  // Livello 10 - Equipaggiamento Avanzato
  tactical_knife: {
    materials: [
      { id: 'CRAFT_STEEL', qty: 2 },
      { id: 'CRAFT_ELECTRONICS', qty: 1 }, // Per impugnatura high-tech
      { id: 'CRAFT_CHEMICALS', qty: 1 }    // Per trattamento lama
    ],
    result: { damage: 25, durability: 200, special: 'bleeding' },
    skillRequirement: { skill: 'crafting', level: 10 },
    unlockedByManual: 'manual_weapons_advanced',
    craftTime: 300,
    xpGain: 150
  }
};
```

## Error Handling

### State Management Fixes

```typescript
// Prevenzione loop infiniti
class CraftingStateManager {
  private initializationPromise: Promise<void> | null = null;
  
  async safeInitialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }
  
  private async doInitialize(): Promise<void> {
    try {
      const recipes = await loadRecipes();
      // Inizializzazione sicura
    } catch (error) {
      this.initializationPromise = null; // Reset per retry
      throw error;
    }
  }
}
```

### Graceful Degradation

```typescript
// Fallback per errori di caricamento
const ErrorBoundaryRecipes = {
  basic_survival_kit: {
    // Ricetta di emergenza sempre disponibile
    id: 'emergency_kit',
    resultItemId: 'EMERGENCY_BANDAGE',
    components: [{ itemId: 'CRAFT_CLOTH', quantity: 1 }]
  }
};
```

## Testing Strategy

### Unit Tests
1. **Recipe Loading**: Test caricamento e validazione ricette
2. **State Management**: Test prevenzione loop infiniti
3. **Starter Kit**: Test assegnazione risorse iniziali
4. **Loot Integration**: Test sblocco ricette da manuali

### Integration Tests
1. **Character Creation**: Test integrazione starter kit
2. **Loot System**: Test discovery ricette nel mondo
3. **Progression**: Test sblocco ricette per livello
4. **UI Stability**: Test navigazione senza errori

### Performance Tests
1. **Memory Leaks**: Test gestione memoria durante crafting
2. **Render Performance**: Test ottimizzazione re-render
3. **State Updates**: Test efficienza aggiornamenti stato

## Implementation Plan

### Phase 1: Critical Fixes
- Fix errori loop infinito nell'UI
- Implementare gestione stato sicura
- Correggere navigazione ESC

### Phase 2: Recipe System
- Creare database ricette realistiche
- Implementare sistema starter kit
- Bilanciare materiali e risultati

### Phase 3: Loot Integration
- Creare manuali di crafting
- Integrare nel sistema loot esistente
- Implementare discovery system

### Phase 4: Balancing & Polish
- Testare progressione completa
- Ottimizzare performance
- Aggiungere feedback utente migliorato

## Technical Considerations

### Performance Optimization
- Memoizzazione calcoli ricette
- Lazy loading dettagli ricette
- Debouncing aggiornamenti UI

### Data Consistency
- Validazione ricette al caricamento
- Sincronizzazione con gameStore
- Backup/recovery per dati corrotti

### Extensibility
- Sistema plugin per nuove ricette
- API per mod crafting
- Configurazione bilanciamento esterna