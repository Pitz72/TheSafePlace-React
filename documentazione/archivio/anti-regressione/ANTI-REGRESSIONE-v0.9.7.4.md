# DOCUMENTO ANTI-REGRESSIONE - The Safe Place v0.9.7.4

**Versione**: v0.9.7.4 "The Fix Era Part 1"  
**Data Creazione**: 21 Gennaio 2025  
**Scopo**: Prevenire regressioni sui fix implementati  
**Validità**: Permanente fino a refactoring architetturale  

---

## 🎯 OBIETTIVO DOCUMENTO

Questo documento serve come **guida di prevenzione regressioni** per mantenere le correzioni implementate nella v0.9.7.4 e evitare che problemi già risolti si ripresentino in versioni future.

### ⚠️ ATTENZIONE SVILUPPATORI
**LEGGERE ATTENTAMENTE** prima di modificare i file e le funzionalità elencate in questo documento.

---

## 🔒 CORREZIONI DA PROTEGGERE

### 1. ACCESSO BANCO DI LAVORO - CRITICO

#### 🚨 PROBLEMA RISOLTO
**Descrizione**: Il banco di lavoro non si attivava premendo ENTER sui tile 'R' nei rifugi.

**Causa**: Uso di `gameStore.playerPosition` che restituiva (-1, -1) invece della posizione reale.

#### ✅ SOLUZIONE IMPLEMENTATA
**File**: `src/components/ShelterScreen.tsx`  
**Funzione**: `handleWorkbench()`

```typescript
// ✅ CODICE CORRETTO - NON MODIFICARE
const handleWorkbench = () => {
  const worldState = useWorldStore.getState();
  const playerPos = worldState.playerPosition;
  
  debugLog(`[WORKBENCH DEBUG] Player position from worldStore: ${JSON.stringify(playerPos)}`);
  
  if (!worldState.currentMap || !worldState.currentMap.data) {
    debugLog('[WORKBENCH DEBUG] No map data available');
    return;
  }
  
  const currentTile = worldState.currentMap.data[playerPos.y * worldState.currentMap.width + playerPos.x];
  debugLog(`[WORKBENCH DEBUG] Current tile: ${currentTile}`);
  
  if (currentTile === 'R') {
    debugLog('[WORKBENCH DEBUG] Tile verification passed - opening crafting screen');
    setShowCrafting(true);
  }
};
```

#### 🚫 ANTI-REGRESSIONE RULES

**VIETATO**:
- ❌ Usare `gameStore.playerPosition` per verifiche posizione
- ❌ Rimuovere `useWorldStore.getState()` dalla funzione
- ❌ Eliminare validazione `currentMap` e `currentMap.data`
- ❌ Modificare logica calcolo tile corrente
- ❌ Rimuovere debug logging senza sostituzione equivalente

**OBBLIGATORIO**:
- ✅ Mantenere accesso diretto a `worldState.playerPosition`
- ✅ Conservare validazione integrità mappa
- ✅ Preservare logging per debugging futuro
- ✅ Testare sempre su tile 'R' dopo modifiche

#### 🧪 TEST DI REGRESSIONE
```
1. Posizionarsi su tile 'R' in qualsiasi rifugio
2. Premere ENTER
3. Verificare apertura schermata crafting
4. Controllare log console per posizione corretta
```

**Risultato Atteso**:
```
[WORKBENCH DEBUG] Player position from worldStore: {x: 4, y: 6}
[WORKBENCH DEBUG] Current tile: R
[WORKBENCH DEBUG] Tile verification passed - opening crafting screen
```

---

### 2. IMPORT INVENTORY STORE - CRITICO

#### 🚨 PROBLEMA RISOLTO
**Descrizione**: `ReferenceError: useInventoryStore is not defined` in CraftingScreenRedesigned.tsx

**Causa**: Import mancante per useInventoryStore

#### ✅ SOLUZIONE IMPLEMENTATA
**File**: `src/components/crafting/CraftingScreenRedesigned.tsx`

```typescript
// ✅ IMPORT OBBLIGATORIO - NON RIMUOVERE
import { useInventoryStore } from '../stores/inventory/inventoryStore';
```

#### 🚫 ANTI-REGRESSIONE RULES

**VIETATO**:
- ❌ Rimuovere import `useInventoryStore`
- ❌ Modificare path import senza verifica
- ❌ Commentare o disabilitare import

**OBBLIGATORIO**:
- ✅ Mantenere import attivo e funzionante
- ✅ Verificare compatibilità path dopo refactoring
- ✅ Testare componente dopo modifiche import

#### 🧪 TEST DI REGRESSIONE
```
1. Aprire schermata crafting
2. Verificare assenza errori console
3. Controllare funzionamento inventario
```

**Risultato Atteso**: Nessun errore `useInventoryStore is not defined`

---

### 3. CONFLITTO FILE RICETTE - CRITICO

#### 🚨 PROBLEMA RISOLTO
**Descrizione**: Sistema caricava 3 ricette di test invece di 12 ricette reali

**Causa**: Conflitto tra `src/data/recipes.json` (test) e `public/recipes.json` (reali)

#### ✅ SOLUZIONE IMPLEMENTATA
**Azione**: Rinominato `src/data/recipes.json` → `src/data/recipes-test-backup.json`

#### 🚫 ANTI-REGRESSIONE RULES

**VIETATO**:
- ❌ Ricreare file `src/data/recipes.json`
- ❌ Modificare `public/recipes.json` senza backup
- ❌ Cambiare path caricamento ricette in `recipeLoader.ts`
- ❌ Eliminare `recipes-test-backup.json` (serve per test)

**OBBLIGATORIO**:
- ✅ Mantenere `public/recipes.json` come fonte principale
- ✅ Conservare backup test per sviluppo futuro
- ✅ Verificare caricamento 12 ricette dopo modifiche
- ✅ Testare ricette reali (improvised_knife, basic_bandage, etc.)

#### 🧪 TEST DI REGRESSIONE
```
1. Avviare applicazione
2. Controllare log console per caricamento ricette
3. Verificare presenza 12 ricette (non 3)
4. Controllare nomi ricette reali
```

**Risultato Atteso**:
```
[RECIPE LOADER] Loaded 12 recipes successfully
[RECIPE LOADER] First recipe details: {"id":"improvised_knife",...}
```

#### 📋 LISTA RICETTE REALI (12)
```
1. improvised_knife
2. basic_bandage
3. simple_trap
4. water_purification_tablet
5. makeshift_torch
6. basic_shelter_kit
7. emergency_ration
8. first_aid_kit
9. rope
10. fire_starter
11. water_container
12. basic_tool_kit
```

---

### 4. ERRORE SINTASSI TYPESCRIPT - MEDIO

#### 🚨 PROBLEMA RISOLTO
**Descrizione**: "Expected ',', got 'canCraftRecipe'" in craftingStore.ts

**Causa**: Virgola mancante dopo funzione `getAvailableRecipes`

#### ✅ SOLUZIONE IMPLEMENTATA
**File**: `src/stores/craftingStore.ts`

```typescript
// ✅ SINTASSI CORRETTA - MANTENERE VIRGOLA
getAvailableRecipes: () => {
  // ... codice funzione ...
}, // ← VIRGOLA OBBLIGATORIA
canCraftRecipe: (recipeId: string) => {
  // ... codice funzione ...
}
```

#### 🚫 ANTI-REGRESSIONE RULES

**VIETATO**:
- ❌ Rimuovere virgole tra funzioni store
- ❌ Modificare sintassi senza validazione TypeScript
- ❌ Ignorare errori compilazione

**OBBLIGATORIO**:
- ✅ Mantenere sintassi TypeScript corretta
- ✅ Verificare compilazione dopo modifiche
- ✅ Usare linter/formatter per prevenire errori

#### 🧪 TEST DI REGRESSIONE
```
1. Eseguire `npm run build`
2. Verificare assenza errori TypeScript
3. Controllare funzionamento store
```

**Risultato Atteso**: Compilazione pulita senza errori

---

## 🔍 SISTEMA DEBUG DA PRESERVARE

### Debug Logging Implementato

#### craftingStore.ts
```typescript
// ✅ LOGGING DA MANTENERE (almeno in sviluppo)
debugLog(`[CRAFTING] unlockStarterRecipes called, knownRecipes length before: ${knownRecipes.length}`);
debugLog(`[CRAFTING] knownRecipeIds after ensureStarterKit: ${JSON.stringify(knownRecipeIds)}`);
debugLog(`[CRAFTING] Setting knownRecipeIds in crafting store: ${knownRecipeIds.length} recipes`);
debugLog(`[CRAFTING] getAvailableRecipes called - Total recipes: ${allRecipes.length}, Known recipe IDs: ${knownRecipeIds.length}`);
debugLog(`[CRAFTING] Known recipe IDs: ${JSON.stringify(knownRecipeIds)}`);
debugLog(`[CRAFTING] Available recipes after filtering: ${available.length}`);
```

#### recipeLoader.ts
```typescript
// ✅ LOGGING DA MANTENERE
debugLog(`[RECIPE LOADER] Loading recipes from: ${recipesPath}`);
debugLog(`[RECIPE LOADER] Loaded ${recipes.length} recipes successfully`);
debugLog(`[RECIPE LOADER] First recipe details: ${JSON.stringify(recipes[0])}`);
```

#### 🚫 ANTI-REGRESSIONE RULES

**VIETATO**:
- ❌ Rimuovere debug logging prima di risolvere problema `knownRecipeIds`
- ❌ Modificare format logging senza documentazione
- ❌ Disabilitare logging in sviluppo

**OBBLIGATORIO**:
- ✅ Mantenere logging fino a risoluzione completa crafting
- ✅ Aggiornare logging se si modificano funzioni correlate
- ✅ Documentare modifiche al sistema debug

---

## ⚠️ PROBLEMI NOTI DA MONITORARE

### PROBLEMA CRITICO APERTO: knownRecipeIds Vuoto

#### 🔍 SINTOMI DA MONITORARE
```
[CRAFTING DEBUG] CraftingScreen: Recipes initialized, length: 0
[CRAFTING DEBUG] CraftingScreen: Available recipes after unlock: 0
```

#### 🚨 SEGNALI DI REGRESSIONE
- Ricette disponibili = 0 nonostante 12 ricette caricate
- `knownRecipeIds` array vuoto nei log
- Impossibilità crafting qualsiasi oggetto
- Messaggio "Crafting fallito - controlla i requisiti"

#### 📋 CHECKLIST MONITORAGGIO
- [ ] Verificare `knownRecipeIds.length > 0` dopo `unlockStarterRecipes()`
- [ ] Controllare chiamata `ensureStarterKit()` all'avvio
- [ ] Monitorare log `[CRAFTING]` per anomalie
- [ ] Testare crafting coltello improvvisato periodicamente

---

## 🧪 SUITE TEST ANTI-REGRESSIONE

### Test Automatici Raccomandati

#### 1. Test Banco di Lavoro
```typescript
// Test da implementare
describe('Workbench Access', () => {
  it('should open crafting screen on R tile', () => {
    // Posiziona giocatore su tile R
    // Simula pressione ENTER
    // Verifica apertura schermata crafting
  });
  
  it('should use worldStore for position', () => {
    // Verifica uso worldStore.playerPosition
    // Non gameStore.playerPosition
  });
});
```

#### 2. Test Caricamento Ricette
```typescript
describe('Recipe Loading', () => {
  it('should load 12 real recipes', () => {
    // Verifica caricamento da public/recipes.json
    // Controlla numero ricette = 12
    // Verifica presenza ricette reali
  });
  
  it('should not load test recipes', () => {
    // Verifica assenza test_recipe_1, test_recipe_2, test_recipe_3
  });
});
```

#### 3. Test Import Store
```typescript
describe('Store Imports', () => {
  it('should import useInventoryStore correctly', () => {
    // Verifica import funzionante
    // Test rendering componente crafting
  });
});
```

### Test Manuali Obbligatori

#### Prima di Ogni Release
1. **Test Banco di Lavoro**
   - Posizionarsi su tile 'R'
   - Premere ENTER
   - Verificare apertura crafting

2. **Test Caricamento Ricette**
   - Controllare log console
   - Verificare 12 ricette caricate
   - Controllare nomi ricette reali

3. **Test Compilazione**
   - Eseguire `npm run build`
   - Verificare assenza errori TypeScript
   - Controllare warnings

4. **Test Crafting (quando risolto)**
   - Tentare crafting coltello improvvisato
   - Verificare successo operazione
   - Controllare aggiornamento inventario

---

## 📋 CHECKLIST PRE-COMMIT

### Prima di Modificare File Critici

#### ShelterScreen.tsx
- [ ] Verificare mantenimento `useWorldStore.getState()`
- [ ] Controllare validazione mappa
- [ ] Testare accesso banco di lavoro
- [ ] Verificare debug logging

#### CraftingScreenRedesigned.tsx
- [ ] Verificare import `useInventoryStore`
- [ ] Testare rendering componente
- [ ] Controllare assenza errori console

#### craftingStore.ts
- [ ] Verificare sintassi TypeScript
- [ ] Mantenere debug logging
- [ ] Testare compilazione
- [ ] Controllare virgole tra funzioni

#### File Ricette
- [ ] Non ricreare `src/data/recipes.json`
- [ ] Mantenere `public/recipes.json` intatto
- [ ] Verificare caricamento 12 ricette
- [ ] Testare ricette reali

---

## 🚨 PROCEDURE EMERGENZA

### Se Si Verifica Regressione

#### 1. Identificazione Rapida
```bash
# Controllare log errori
npm run dev
# Aprire console browser
# Cercare errori noti
```

#### 2. Rollback Immediato
```bash
# Ripristinare file da backup
git checkout HEAD~1 -- src/components/ShelterScreen.tsx
git checkout HEAD~1 -- src/components/crafting/CraftingScreenRedesigned.tsx
git checkout HEAD~1 -- src/stores/craftingStore.ts
```

#### 3. Verifica Correzione
- Testare banco di lavoro
- Verificare caricamento ricette
- Controllare compilazione
- Eseguire suite test

#### 4. Analisi Causa
- Identificare commit problematico
- Documentare causa regressione
- Aggiornare questo documento
- Implementare test preventivo

---

## 📊 METRICHE MONITORAGGIO

### KPI Anti-Regressione
- **Accessibilità Banco di Lavoro**: 100% (target)
- **Caricamento Ricette**: 12/12 (target)
- **Errori Compilazione**: 0 (target)
- **Errori Runtime**: 0 per funzionalità corrette (target)

### Alert Automatici Raccomandati
- Errore caricamento ricette
- Errore accesso banco di lavoro
- Errori TypeScript in build
- Regressione performance caricamento

---

## 📝 LOG MODIFICHE DOCUMENTO

### v1.0 - 21 Gennaio 2025
- Creazione documento iniziale
- Documentazione 4 correzioni principali
- Definizione procedure anti-regressione
- Implementazione checklist e test

### Prossimi Aggiornamenti
- Aggiunta test automatici
- Integrazione CI/CD
- Monitoraggio metriche
- Aggiornamento per v0.9.7.5

---

**IMPORTANTE**: Questo documento deve essere aggiornato ad ogni modifica dei file e delle funzionalità elencate. La mancata osservanza delle regole anti-regressione può causare il ritorno di bug critici già risolti.

**Responsabilità**: Tutti gli sviluppatori che modificano il codebase  
**Validità**: Permanente fino a refactoring architetturale completo  
**Prossima Revisione**: Con rilascio v0.9.7.5