# Specifica per la Risoluzione dei Problemi di Refactoring degli Store Zustand

## Panoramica del Problema

Durante il refactoring del sistema di gestione dello stato da un singolo store monolitico a store modulari Zustand, sono emersi diversi problemi di sincronizzazione e inconsistenza dei dati tra i vari componenti.

## Problemi Identificati

### 1. Inconsistenza nell'Accesso all'Inventario

**Problema**: `InventoryPanel` utilizzava direttamente `characterStore.characterSheet.inventory` invece di utilizzare il sistema centralizzato di `inventoryStore`.

**Impatto**: L'inventario mostrato nella schermata principale non rifletteva lo stato reale dell'inventario del gioco.

**Soluzione Implementata**:
- Modificato `InventoryPanel.tsx` per utilizzare `inventoryStore.getInventory()` invece di accesso diretto
- Rimosso import non necessario di `characterStore`
- Utilizzato `inventoryStore.items` per il database degli oggetti

### 2. Riferimenti Obsoleti a Variabili Non Definite

**Problema**: In `InventoryScreen.tsx`, riferimento alla variabile `items` non definita.

**Impatto**: Errore runtime quando si accedeva ai dettagli degli oggetti nell'inventario.

**Soluzione Implementata**:
- Sostituito `items[itemStack.itemId]` con `itemDatabase[itemStack.itemId]`
- Utilizzato il database degli oggetti importato correttamente

### 3. Architettura degli Store Frammentata

**Problema**: Coesistenza di pattern di accesso diversi tra i componenti.

**Impatto**: Alcuni componenti utilizzano `gameStore` come proxy, altri accedono direttamente agli store specifici.

## Architettura Attuale degli Store

### Store Principali

1. **gameStore** (CoreGameState)
   - Store principale per la navigazione UI
   - Proxy per accedere agli altri store tramite getter
   - Gestisce stato della schermata corrente e navigazione

2. **characterStore** (CharacterState)
   - Gestisce scheda del personaggio
   - Contiene inventario del personaggio (`characterSheet.inventory`)
   - Gestisce HP, esperienza, statistiche

3. **inventoryStore** (InventoryState)
   - Gestisce logica dell'inventario
   - Fornisce `getInventory()` che accede a `characterStore`
   - Contiene database degli oggetti (`items`)
   - Gestisce azioni di inventario (aggiungi, rimuovi, equipaggia)

4. **Altri Store Specializzati**
   - `timeStore`, `worldStore`, `weatherStore`, `survivalStore`, etc.

### Pattern di Accesso Raccomandati

#### Per l'Inventario
```typescript
// ✅ CORRETTO - Usa inventoryStore
const { getInventory, items } = useInventoryStore();
const inventory = getInventory();
const item = items[itemId];

// ❌ EVITARE - Accesso diretto a characterStore
const { characterSheet } = useCharacterStore();
const inventory = characterSheet.inventory;
```

#### Per i Dati del Personaggio
```typescript
// ✅ CORRETTO - Via gameStore per UI principale
const { characterSheet } = useGameStore();

// ✅ CORRETTO - Direttamente per componenti specifici
const { characterSheet } = useCharacterStore();
```

## Raccomandazioni per il Futuro

### 1. Standardizzazione dei Pattern di Accesso

- **Componenti UI Principali**: Utilizzare `gameStore` come punto di accesso unificato
- **Componenti Specializzati**: Accedere direttamente agli store specifici
- **Evitare**: Accesso diretto a store quando esiste un'alternativa tramite store specializzato

### 2. Validazione della Sincronizzazione ✅

- ✅ Implementati test completi per verificare la sincronizzazione tra store
- ✅ Aggiunto logging per tracciare modifiche di stato critiche in tutti gli store:
  - `characterStore`: logging per updateHP e addExperience
  - `worldStore`: logging per movimento giocatore e avanzamento tempo
  - `inventoryStore`: logging esistente per operazioni inventario
- ✅ Sistema di logging centralizzato tramite notificationStore
- ✅ Corretti tutti i riferimenti obsoleti a `gameStore.addLogEntry` sostituendoli con `notificationStore.addLogEntry`

### 3. Documentazione dei Contratti tra Store ✅

- ✅ Documentati tutti i contratti e responsabilità in `STORE_CONTRACTS_AND_DEPENDENCIES.md`
- ✅ Definite chiaramente le "source of truth" per ogni tipo di dato:
  - Inventario: `characterStore.characterSheet.inventory`
  - Oggetti: `inventoryStore.items`
  - HP/XP: `characterStore.characterSheet`
  - Posizione: `worldStore.playerPosition`
- ✅ Creati diagrammi delle dipendenze tra store con Mermaid
- ✅ Definiti pattern di accesso standardizzati

### 4. Refactoring Incrementale

- Identificare altri componenti che potrebbero avere problemi simili
- Migrare gradualmente verso pattern consistenti
- Mantenere backward compatibility durante le transizioni

## Componenti Verificati ✅

Tutti i componenti sono stati verificati e corretti secondo i pattern raccomandati:

1. **CraftingScreenRedesigned.tsx** ✅ - Accesso corretto a inventario e oggetti tramite inventoryStore
2. **ShelterScreen.tsx** ✅ - Sincronizzazione corretta con inventoryStore (corretto accesso a `inventoryStore.items`)
3. **CharacterSheetScreen.tsx** ✅ - Accesso ai dati del personaggio tramite pattern standardizzati (corretto uso di `inventoryStore.items`)
4. **EquipmentManager** ✅ - Sincronizzazione equipaggiamento verificata e funzionante con store appropriati

## Test di Validazione

### Test Manuali Completati
- ✅ Inventario nella schermata principale ora mostra oggetti corretti
- ✅ Apertura inventario con 'I' funziona correttamente
- ✅ Equipaggiamento oggetti funziona
- ✅ Nessun errore TypeScript
- ✅ Nessun errore runtime nel browser

### Test Automatici Implementati ✅
- ✅ Test di integrazione per sincronizzazione store (`store-synchronization.test.ts`)
- ✅ Test unitari per getter e azioni degli store (esistenti per crafting)
- ✅ Test di validazione cross-system per consistenza dati
- ✅ Test di gestione errori e recovery
- ✅ Test di performance per operazioni UI

## 📊 Stato di Completamento

### ✅ Completato
- [x] Creazione store specializzati (EventStore, SurvivalStore, NotificationStore, RiverCrossingStore)
- [x] Migrazione logica da gameStore agli store dedicati
- [x] Implementazione pattern di sincronizzazione tra store
- [x] Aggiornamento componenti per utilizzare nuovi store
- [x] Testing e validazione funzionalità
- [x] Documentazione architettura e contratti
- [x] **v0.9.6.1:** Risoluzione riferimenti obsoleti gameStore.addLogEntry
- [x] **v0.9.6.1:** Correzione errori importazione store
- [x] **v0.9.6.1:** Standardizzazione sistema notifiche centralizzato
- [x] **v0.9.6.1:** Verifica sincronizzazione completa codebase

### 🔄 Prossimi Sviluppi
- [ ] Ottimizzazione performance e memory management
- [ ] Implementazione pattern observer avanzati
- [ ] Estensione sistema di logging e debugging
- [ ] Migrazione completa da gameStore (se necessario)
- [ ] Implementazione store per nuove funzionalità
- [ ] Ottimizzazione bundle size e code splitting

## Conclusioni

Il refactoring degli store Zustand ha introdotto una maggiore modularità ma ha richiesto attenzione particolare alla sincronizzazione dei dati. I problemi identificati sono stati risolti seguendo i pattern architetturali stabiliti. È importante continuare a monitorare la consistenza dei dati e standardizzare i pattern di accesso per evitare problemi futuri.

## Metriche di Successo

- ✅ Eliminazione errori runtime legati a store
- ✅ Sincronizzazione corretta dell'inventario
- ✅ Mantenimento delle funzionalità esistenti
- ✅ Codice TypeScript senza errori
- ✅ Pattern di accesso standardizzati
- ✅ Documentazione completa delle dipendenze
- ✅ Sistema di logging implementato
- ✅ Test di integrazione completi
- ✅ Contratti tra store documentati