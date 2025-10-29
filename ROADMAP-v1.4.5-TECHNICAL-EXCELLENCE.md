# 🗺️ ROADMAP v1.4.5 - Technical Excellence

**Obiettivo:** Solidificare le fondamenta tecniche del progetto per preparare espansioni future  
**Data Inizio:** 29 Ottobre 2025  
**Stato Generale:** 🟡 IN CORSO (FASE 1 COMPLETATA)

---

## 📊 PROGRESSO GENERALE

| Fase | Descrizione | Effort | Stato | Completamento |
|------|-------------|--------|-------|---------------|
| **FASE 1** | JSDoc Store e Services | 4h | ✅ COMPLETATA | 100% |
| **FASE 2** | JSDoc Components e Utils | 6-8h | ⏸️ TODO | 0% |
| **FASE 3** | Test Coverage gameStore | 4-6h | ⏸️ TODO | 0% |
| **FASE 4** | Test Coverage combatStore | 3-4h | ⏸️ TODO | 0% |
| **FASE 5** | Test Coverage eventStore | 3-4h | ⏸️ TODO | 0% |
| **FASE 6** | Validazione Runtime Zod | 6-8h | ⏸️ TODO | 0% |
| **FASE 7** | Custom Hook useGameData | 3-4h | ⏸️ TODO | 0% |
| **FASE 8** | Documentazione v1.4.5 | 2-3h | ⏸️ TODO | 0% |

**Progresso Totale:** 12% (4/35 ore)

---

## ✅ FASE 1 - JSDoc Store e Services [COMPLETATA]

**Obiettivo:** Documentare completamente tutti gli Store e Services con standard enterprise

**Data Completamento:** 29 Ottobre 2025  
**Tempo Effettivo:** 4 ore  
**Qualità:** ⭐⭐⭐⭐⭐ Premium Enterprise

### File Documentati (3/3)

#### 1. store/gameStore.ts ✅
- **Righe:** 863
- **Funzioni:** 26/26 (100%)
- **Documentazione:**
  - Header store con architettura completa
  - Costanti e helper functions
  - Sistema save/load (migrazione, validazione, serializzazione)
  - Main story triggers (12 capitoli, 8 tipi di trigger)
  - Cutscene system (5 cutscene, trigger condizionali)
  - Active search (4 loot tables per bioma)
  - Quick rest (cooldown 24h)
  - Journal system (12 tipi di entry)

#### 2. store/characterStore.ts ✅
- **Righe:** 1611
- **Funzioni:** 33/33 (100%)
- **Documentazione:**
  - Header store con architettura D&D 5e
  - Costanti iniziali (attributes, skills, alignment)
  - Character initialization (starter kit, proficiencies)
  - Skill system (18 skills, bonus calculation complessa)
  - XP/Level system (20 livelli, talent progression)
  - Inventory management (stackable/non-stackable, index shifting)
  - Equipment system (4 slots con durability)
  - Combat mechanics (damage, AC, special triggers)
  - Survival system (satiety, hydration, fatigue, 8 status)
  - Alignment system (Lena/Elian, threshold bonuses)
  - Trophy system (50 trofei, global persistence)
  - Serialization (save/load con trophy merge)

#### 3. services/gameService.ts ✅
- **Righe:** 156
- **Funzioni:** 1/1 (100%)
- **Documentazione:**
  - File header con architettura Service Layer
  - Costanti (tile names, traversability)
  - movePlayer (13-step process flow)
  - Time cost calculation (terrain + weather)
  - Environmental hazards (night, weather, water)
  - Biome transitions e atmospheric messages
  - Event/combat triggering
  - Trophy unlocks

### Standard JSDoc Applicato

**Sezioni Utilizzate:**
- `@description` - Descrizione dettagliata
- `@param` - Parametri con tipo e spiegazione
- `@returns` - Valore ritornato
- `@remarks` - Note implementative, edge cases, formule
- `@example` - Esempi d'uso pratici
- `@see` - Riferimenti incrociati
- `@throws` - Errori possibili
- `@warning` - Avvertimenti critici
- `@internal` - Funzioni private
- `@constant` - Costanti
- `@template` - Generics TypeScript
- `@fileoverview` - Descrizione file/modulo

**Qualità:**
- ✅ Descrizioni chiare e concise
- ✅ Formule matematiche esplicite (es. AC = 10 + DEX + armor)
- ✅ Tabelle di riferimento (es. DC difficulty, modifier table)
- ✅ Flow diagrams testuali (es. 13-step movement process)
- ✅ Edge cases documentati
- ✅ Esempi pratici con valori reali
- ✅ Riferimenti incrociati tra funzioni

### Benefici Ottenuti

**IntelliSense:**
- ✅ Hover su funzione → Documentazione completa
- ✅ Autocomplete con descrizioni parametri
- ✅ Suggerimenti funzioni correlate

**Manutenibilità:**
- ✅ Codice auto-esplicativo
- ✅ Onboarding facilitato (nuovo dev capisce subito)
- ✅ Modifiche più sicure (sai cosa tocchi)
- ✅ Debug più rapido (capisci il flusso)

**Professionalità:**
- ✅ Standard enterprise raggiunto
- ✅ Pronto per collaboratori
- ✅ Pronto per open source
- ✅ Documentazione inline sempre aggiornata

---

## ⏸️ FASE 2 - JSDoc Components e Utils [TODO]

**Obiettivo:** Documentare componenti React e utility functions

**Effort Stimato:** 6-8 ore

### File da Documentare

**Componenti Prioritari (10):**
1. components/GameScreen.tsx (~500 righe)
2. components/InventoryScreen.tsx (~300 righe)
3. components/CombatScreen.tsx (~400 righe)
4. components/EventScreen.tsx (~200 righe)
5. components/RefugeScreen.tsx (~200 righe)
6. components/CraftingScreen.tsx (~200 righe)
7. components/LevelUpScreen.tsx (~150 righe)
8. components/MainStoryScreen.tsx (~100 righe)
9. components/CutsceneScreen.tsx (~120 righe)
10. components/SaveLoadScreen.tsx (~300 righe)

**Utility Files (3):**
1. utils/audio.ts
2. hooks/useKeyboardInput.ts
3. hooks/useGameScale.ts

**Totale Funzioni Stimate:** ~40

### Standard da Applicare

**Per Componenti React:**
```typescript
/**
 * Component description.
 * 
 * @component
 * @description Detailed behavior explanation.
 * 
 * Props:
 * - prop1: Description
 * - prop2: Description
 * 
 * State:
 * - state1: Description
 * 
 * Keyboard Controls:
 * - [Key]: Action
 * 
 * @example
 * <ComponentName prop1="value" />
 * 
 * @see RelatedComponent
 */
```

**Per Hooks:**
```typescript
/**
 * Hook description.
 * 
 * @hook
 * @description What the hook does.
 * 
 * @param {Type} param - Description
 * @returns {Type} Return value
 * 
 * @example
 * const value = useHookName(param);
 */
```

---

## ⏸️ FASE 3 - Test Coverage gameStore [TODO]

**Obiettivo:** Espandere test coverage di gameStore da 0% a 60%+

**Effort Stimato:** 4-6 ore

### Test da Creare

**Funzioni Critiche da Testare:**
1. ✅ setGameState (già testato indirettamente)
2. ⏸️ setMap (initialization)
3. ⏸️ getTileInfo (boundary checks)
4. ⏸️ performQuickRest (cooldown, healing)
5. ⏸️ performActiveSearch (loot tables, biome-specific)
6. ⏸️ checkMainStoryTriggers (tutti i trigger types)
7. ⏸️ checkCutsceneTriggers (priority order)
8. ⏸️ saveGame (validation, quota exceeded)
9. ⏸️ loadGame (migration, validation)
10. ⏸️ toJSON/fromJSON (Set conversion)

**Totale Test Stimati:** ~15-20 test

### Framework

**Già Configurato:**
- ✅ Vitest setup in vite.config.ts
- ✅ Test setup file: src/test/setup.ts
- ✅ Script: `npm run test`

**Esempio Test:**
```typescript
describe('gameStore - performQuickRest', () => {
  it('should heal 20 HP and reduce fatigue by 15', () => {
    // Setup
    useCharacterStore.getState().takeDamage(30);
    useCharacterStore.getState().updateFatigue(50);
    
    // Action
    useGameStore.getState().performQuickRest();
    
    // Assert
    expect(useCharacterStore.getState().hp.current).toBe(90);
    expect(useCharacterStore.getState().fatigue.current).toBe(35);
  });
  
  it('should respect 24h cooldown', () => {
    useGameStore.getState().performQuickRest();
    useGameStore.getState().performQuickRest(); // Try again immediately
    
    // Should show error in journal
    const lastEntry = useGameStore.getState().journal[0];
    expect(lastEntry.text).toContain('Troppo presto');
  });
});
```

---

## ⏸️ FASE 4 - Test Coverage combatStore [TODO]

**Obiettivo:** Testare sistema di combattimento

**Effort Stimato:** 3-4 ore

### Test da Creare

1. ⏸️ startCombat (enemy initialization)
2. ⏸️ playerCombatAction - attack (damage calculation)
3. ⏸️ playerCombatAction - analyze (reveal tactics)
4. ⏸️ playerCombatAction - flee (success/failure)
5. ⏸️ playerCombatAction - tactic (special actions)
6. ⏸️ playerCombatAction - use_item (consumables in combat)
7. ⏸️ enemyTurn (AI behavior)
8. ⏸️ Enemy loot system (tier-based drops)
9. ⏸️ Durability damage (weapon/armor)
10. ⏸️ Victory conditions

**Totale Test Stimati:** ~12-15 test

---

## ⏸️ FASE 5 - Test Coverage eventStore [TODO]

**Obiettivo:** Testare sistema eventi

**Effort Stimato:** 3-4 ore

### Test da Creare

1. ⏸️ triggerEncounter (probability, cooldown)
2. ⏸️ Event priority system (main story > cutscene > easter egg > lore > combat > narrative)
3. ⏸️ Guaranteed biome events (first entry)
4. ⏸️ Lore event cooldown (1 per day)
5. ⏸️ resolveEventChoice (outcomes processing)
6. ⏸️ Skill check outcomes (success/failure)
7. ⏸️ Direct outcomes (addItem, addXp, etc.)
8. ⏸️ Alignment changes
9. ⏸️ Status changes
10. ⏸️ Event history tracking

**Totale Test Stimati:** ~10-12 test

---

## ⏸️ FASE 6 - Validazione Runtime Zod [TODO]

**Obiettivo:** Validare tutti i JSON al caricamento runtime

**Effort Stimato:** 6-8 ore

### Stato Attuale

**Già Implementato:**
- ✅ Zod installato (package.json)
- ✅ Script validate-data.ts (items, recipes)
- ✅ Schemas per items e recipes

**Da Implementare:**

#### 1. Espandere Schemas (2 ore)
```typescript
// scripts/validate-data.ts

const enemySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['humanoid', 'beast']),
  hp: z.number().positive(),
  ac: z.number().min(5).max(25),
  attack: z.object({
    damage: z.number().positive(),
    bonus: z.number()
  }),
  xp: z.number().positive(),
  biomes: z.array(z.string()),
  tactics: z.object({
    revealDc: z.number(),
    description: z.string(),
    actions: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      skillCheck: z.object({
        skill: z.string(),
        dc: z.number()
      }).optional()
    }))
  })
});

const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  biomes: z.array(z.string()),
  isUnique: z.boolean(),
  choices: z.array(z.object({
    text: z.string(),
    alignment: z.enum(['Lena', 'Elian']).optional(),
    itemRequirements: z.array(z.object({
      itemId: z.string(),
      quantity: z.number()
    })).optional(),
    outcomes: z.array(z.any()) // Complex, needs detailed schema
  }))
});

// ... altri schemas
```

#### 2. Validazione Runtime (3 ore)
```typescript
// data/itemDatabase.ts

export const loadItemDatabase = async () => {
  try {
    const responses = await Promise.all([
      fetch('/data/items/weapons.json'),
      // ... altri file
    ]);
    
    const jsonData = await Promise.all(responses.map(r => r.json()));
    const allItems = jsonData.flat();
    
    // VALIDAZIONE RUNTIME
    const validatedItems = z.array(itemSchema).parse(allItems);
    
    // Se arriva qui, i dati sono validi
    const database = validatedItems.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    
    return database;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Errore di validazione - mostra dettagli
      console.error('❌ Validation Error:', error.errors);
      throw new Error(`Database validation failed: ${error.errors[0].message}`);
    }
    throw error;
  }
};
```

#### 3. Error Handling UI (1 ora)
```typescript
// App.tsx

const [loadingError, setLoadingError] = useState<string | null>(null);

try {
  await loadItemDatabase();
} catch (error) {
  setLoadingError(error.message);
}

if (loadingError) {
  return <ErrorScreen message={loadingError} onRetry={() => window.location.reload()} />;
}
```

### File da Validare

- [x] items/*.json (già fatto)
- [x] recipes.json (già fatto)
- [ ] enemies.json
- [ ] events/*.json (8 file)
- [ ] cutscenes.json
- [ ] mainStory.json
- [ ] talents.json
- [ ] trophies.json

**Totale:** 15 file JSON

---

## ⏸️ FASE 7 - Custom Hook useGameData [TODO]

**Obiettivo:** Centralizzare logica caricamento database

**Effort Stimato:** 3-4 ore

### Implementazione

```typescript
// hooks/useGameData.ts

import { useState, useEffect } from 'react';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useEventDatabaseStore } from '../data/eventDatabase';
// ... altri database

/**
 * Custom hook for loading all game databases.
 * 
 * @description Centralizes database loading logic with unified loading/error states.
 * 
 * @returns {{loading: boolean, error: string | null, retry: () => void}}
 * 
 * @example
 * const { loading, error, retry } = useGameData();
 * if (loading) return <LoadingScreen />;
 * if (error) return <ErrorScreen message={error} onRetry={retry} />;
 */
export const useGameData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadAllDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all databases in parallel
      await Promise.all([
        useItemDatabaseStore.getState().loadDatabase(),
        useEventDatabaseStore.getState().loadDatabase(),
        useRecipeDatabaseStore.getState().loadDatabase(),
        useEnemyDatabaseStore.getState().loadDatabase(),
        useMainStoryDatabaseStore.getState().loadDatabase(),
        useCutsceneDatabaseStore.getState().loadDatabase(),
        useTalentDatabaseStore.getState().loadDatabase(),
        useTrophyDatabaseStore.getState().loadDatabase(),
      ]);
      
      // Validate all databases loaded
      const itemDb = useItemDatabaseStore.getState().itemDatabase;
      if (Object.keys(itemDb).length === 0) {
        throw new Error('Item database is empty');
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAllDatabases();
  }, []);
  
  return {
    loading,
    error,
    retry: loadAllDatabases
  };
};
```

### Utilizzo in App.tsx

**Prima (ripetitivo):**
```typescript
const { loadDatabase: loadItems } = useItemDatabase();
const { loadDatabase: loadEvents } = useEventDatabase();
// ... ripetuto 8 volte

useEffect(() => {
  loadItems();
  loadEvents();
  // ... ripetuto 8 volte
}, []);
```

**Dopo (pulito):**
```typescript
const { loading, error, retry } = useGameData();

if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen message={error} onRetry={retry} />;
```

**Benefici:**
- ✅ Codice più pulito (-50 righe in App.tsx)
- ✅ Riutilizzabile in altri componenti
- ✅ Error handling centralizzato
- ✅ Loading state unificato

---

## ⏸️ FASE 8 - Documentazione v1.4.5 [TODO]

**Obiettivo:** Creare changelog e aggiornare README

**Effort Stimato:** 2-3 ore

### Deliverables

1. **log/v1.4.5.md** - Changelog completo
   - Seguire template ufficiale
   - Documentare tutte le 8 fasi
   - Metriche di qualità (coverage, JSDoc)
   - File modificati
   - Testing checklist

2. **README.md** - Aggiornare sezione v1.4.5
   - Highlights principali
   - Benefici per sviluppatori
   - Miglioramenti tecnici

3. **package.json** - Version bump
   - 1.4.4 → 1.4.5

4. **constants.ts** - GAME_VERSION
   - "1.4.4" → "1.4.5"

5. **Testing Finale**
   - npm run build
   - npm run preview
   - npm run test
   - Verificare zero errori

---

## 📈 METRICHE DI SUCCESSO

### Coverage Obiettivi

| Metrica | Attuale | Obiettivo v1.4.5 | Delta |
|---------|---------|------------------|-------|
| **JSDoc Coverage** | ~15% | 80%+ | +65% |
| **Test Coverage** | ~15% | 50%+ | +35% |
| **Validated JSON** | 2/15 | 15/15 | +13 |
| **Custom Hooks** | 2 | 3 | +1 |

### Qualità Codice

| Aspetto | Pre v1.4.5 | Post v1.4.5 | Miglioramento |
|---------|------------|-------------|---------------|
| Documentazione | ⭐⭐ | ⭐⭐⭐⭐⭐ | +150% |
| Testing | ⭐⭐⭐ | ⭐⭐⭐⭐ | +33% |
| Validazione | ⭐⭐ | ⭐⭐⭐⭐⭐ | +150% |
| Manutenibilità | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | +25% |

---

## 🎯 MILESTONE TRACKING

### Checkpoint 1: FASE 1 ✅ COMPLETATA
- **Data:** 29 Ottobre 2025
- **Tempo:** 4 ore
- **Deliverable:** 3 file completamente documentati
- **Qualità:** Premium Enterprise

### Checkpoint 2: FASE 2-3 ⏸️ TODO
- **Stima:** 10-14 ore
- **Deliverable:** Components documentati + gameStore testato

### Checkpoint 3: FASE 4-5 ⏸️ TODO
- **Stima:** 6-8 ore
- **Deliverable:** combatStore e eventStore testati

### Checkpoint 4: FASE 6-7 ⏸️ TODO
- **Stima:** 9-12 ore
- **Deliverable:** Validazione runtime + custom hook

### Checkpoint 5: FASE 8 ⏸️ TODO
- **Stima:** 2-3 ore
- **Deliverable:** Release v1.4.5

**Totale Tempo Stimato:** 31-41 ore  
**Tempo Completato:** 4 ore (12%)  
**Tempo Rimanente:** 27-37 ore

---

## 📝 NOTE PER PROSSIME SESSIONI

### Priorità

1. **ALTA:** FASE 2 (Components JSDoc)
   - Migliora developer experience
   - Facilita onboarding
   - Preparazione per collaboratori

2. **ALTA:** FASE 3-5 (Test Coverage)
   - Previene regressioni
   - Facilita refactoring
   - Aumenta confidenza nelle modifiche

3. **MEDIA:** FASE 6 (Validazione Runtime)
   - Migliora robustezza
   - Previene crash da dati corrotti
   - Migliore UX su errori

4. **BASSA:** FASE 7 (Custom Hook)
   - Code cleanup
   - Nice to have, non critico

### Approccio Raccomandato

**Sessione 1 (oggi):** ✅ FASE 1 completata  
**Sessione 2:** FASE 2 (Components JSDoc)  
**Sessione 3:** FASE 3 (gameStore tests)  
**Sessione 4:** FASE 4-5 (combat/event tests)  
**Sessione 5:** FASE 6-7 (validazione + hook)  
**Sessione 6:** FASE 8 (documentazione finale)

**Totale Sessioni:** 6 (4-6 ore ciascuna)

---

## 🔄 AGGIORNAMENTI

### 29 Ottobre 2025 - FASE 1 COMPLETATA ✅

**Completato:**
- ✅ store/gameStore.ts (26 funzioni, 863 righe)
- ✅ store/characterStore.ts (33 funzioni, 1611 righe)
- ✅ services/gameService.ts (1 funzione, 156 righe)

**Tempo Effettivo:** 4 ore  
**Qualità:** ⭐⭐⭐⭐⭐ Premium Enterprise  
**Progresso:** 12% (4/35 ore)

**Prossimo:** FASE 2 - Components JSDoc

---

**Fine Roadmap v1.4.5**

📅 **Creata:** 29 Ottobre 2025  
📊 **Progresso:** 12% completato  
🎯 **Obiettivo:** Technical Excellence per espansioni future  
✍️ **Autore:** The Safe Place Chronicles Dev Team