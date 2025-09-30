# CHANGELOG - The Safe Place

## v0.9.6.1 - "Phoenix" (Gennaio 2025)

**Tipo di Release:** Patch di Sincronizzazione  
**Stato:** ✅ PRODUCTION READY

### 🔧 Sincronizzazione Store
Patch di consolidamento per la risoluzione di riferimenti obsoleti e miglioramento della sincronizzazione tra store Zustand.

### 🚨 Correzioni Implementate
- **Risolti:** Riferimenti obsoleti a `gameStore.addLogEntry` in craftingStore e combatStore
- **Corretti:** Errori di importazione in `craftingStore.ts` (percorso notificationStore)
- **Standardizzato:** Sistema di logging centralizzato tramite `notificationStore.addLogEntry`
- **Verificata:** Sincronizzazione completa tra tutti gli store del sistema

### 📋 File Modificati
- `craftingStore.ts` - Correzione importazioni e standardizzazione logging
- `combatStore.ts` - Migrazione completa sistema notifiche
- `ZUSTAND_REFACTORING_SPEC.md` - Aggiornamento stato completamento

### 📄 Documentazione
- `CHANGELOG-v0.9.6.1.md` - Cronaca dettagliata interventi
- `ANTI-REGRESSIONE-v0.9.6.1-SINCRONIZZAZIONE-STORE.md` - Guida prevenzione regressioni
- Versioni aggiornate in `package.json` e `StartScreen.tsx`

---

## v0.9.6 - "Phoenix" (15 Gennaio 2025)

**Tipo di Release:** Correzione Critica + Refactoring Architetturale  
**Stato:** ✅ PRODUCTION READY

### 🔥 Simbolismo "Phoenix"
Versione denominata "Phoenix" per simboleggiare la rinascita dell'applicazione dopo la risoluzione di errori critici che impedivano il funzionamento normale del gioco.

### 🚨 Correzioni Critiche
- **Risolto:** Errore critico `err_1709404094092_readMgr%` che impediva l'accesso al gioco
- **Causa:** Logica di inizializzazione errata in `App.tsx`
- **Soluzione:** Corretta condizione useEffect da `if (isMapLoading)` a `if (!isMapLoading)`
- **Migliorato:** Sistema di crafting con gestione errori robusta

### 🏗️ Refactoring Architetturale
- **Separazione Store:** Creati store dedicati (EventStore, SurvivalStore, NotificationStore, RiverCrossingStore)
- **Benefici:** Migliore manutenibilità, performance ottimizzate, testabilità migliorata
- **Impatto:** Base solida per sviluppi futuri

### 📋 Componenti Aggiornati
- `CraftingScreenRedesigned.tsx` - Gestione errori migliorata
- `App.tsx` - Logica di inizializzazione corretta
- Tutti i componenti - Integrazione con nuovi store

### 📄 Documentazione
- `documentazione/changelog/CHANGELOG-v0.9.6-Phoenix.md`
- `documentazione/anti-regressione/ANTI-REGRESSION-v0.9.6-Phoenix.md`
- `package.json` aggiornato alla versione 0.9.6
- `StartScreen.tsx` aggiornato con nuova versione

---

## v0.9.5 - "Ammappa" (09 Settembre 2025)

**Tipo di Release:** Hotfix Critico
**Stato:** ✅ PRODUCTION READY

### 🐞 Bug Critico Risolto

- **Fixato: Loop di Rendering Infinito in `MapViewport.tsx`**
  - **Causa:** Instabilità nel selettore dello store Zustand e flusso di dati asimmetrico tra `usePlayerMovement` e `MapViewport`.
  - **Soluzione:**
    1.  Corretto `usePlayerMovement.ts` per usare `useWorldStore`.
    2.  Refattorizzato `MapViewport.tsx` per usare selettori atomici e stabili.
  - **Impatto:** Stabilità del gioco ripristinata. Il crash all'avvio è risolto.

### 📄 Documentazione

- **Nuovi file creati:**
  - `documentazione/changelog/CHANGELOG-v0.9.5-Ammappa.md`
  - `documentazione/anti-regressione/ANTI-REGRESSIONE-v0.9.5.md`
- **File aggiornati:**
  - `package.json` (versione 0.9.5)
  - `README.md` (ristrutturato e pulito)
  - `src/components/StartScreen.tsx`

---

## v0.9.3 - "Modularization and Fix" (01 Settembre 2025)

**Tipo di Release:** Major Refactoring & Architectural Improvement  
**Stato:** ✅ PRODUCTION READY

### 🎯 Obiettivi della Release

Questa release rappresenta la più grande ristrutturazione architettonica nella storia del progetto "The Safe Place". L'obiettivo primario era smantellare il monolitico `gameStore.ts`, che era diventato una fonte significativa di instabilità e debito tecnico, e sostituirlo con un'architettura modulare, robusta e manutenibile basata su store specializzati (multi-store).

### 🚀 Architettura Multi-Store Implementata

Il `gameStore.ts` è stato svuotato delle sue responsabilità principali, che sono state delegate a 8 nuovi store specializzati:

- **`uiStore.ts`**: Gestisce tutto lo stato relativo all'interfaccia utente
- **`characterStore.ts`**: Gestisce la scheda del personaggio (characterSheet)
- **`inventoryStore.ts`**: Gestisce tutte le azioni relative all'inventario
- **`worldStore.ts`**: Gestisce lo stato del mondo di gioco
- **`eventStore.ts`**: Gestisce il database degli eventi
- **`weatherStore.ts`**: Gestisce l'intero sistema meteorologico
- **`shelterStore.ts`**: Gestisce lo stato e la logica di accesso ai rifugi
- **`saveStore.ts`**: Gestisce l'intero processo di salvataggio e caricamento

### 🛠️ Miglioramenti Tecnici Chiave

- **Modularità e Single Responsibility Principle (SRP)**: Ogni store ha ora una singola, chiara responsabilità
- **Manutenibilità Migliorata**: Logica isolata in domini specifici
- **Scalabilità**: Aggiungere nuove funzionalità è ora molto più semplice
- **Stabilità Garantita**: Tutti i **239 test** (234 superati, 5 saltati) continuano a passare
- **Risoluzione del Debito Tecnico**: Eliminata un'enorme quantità di debito tecnico

### 📁 File Modificati/Creati

**Nuovi Store:**
- `src/stores/ui/uiStore.ts`
- `src/stores/character/characterStore.ts`
- `src/stores/inventory/inventoryStore.ts`
- `src/stores/world/worldStore.ts`
- `src/stores/events/eventStore.ts`
- `src/stores/weather/weatherStore.ts`
- `src/stores/shelter/shelterStore.ts`
- `src/stores/save/saveStore.ts`

**Documentazione:**
- `documentazione/changelog/CHANGELOG-v0.9.3.md`
- `documentazione/anti-regressione/ANTI-REGRESSIONE-v0.9.3.md`

**File Aggiornati:**
- `package.json` (versione 0.9.3)
- `README.md`
- `src/components/StartScreen.tsx`
- `src/stores/gameStore.ts`
- `src/interfaces/gameState.ts`

---

## v0.9.0 - "Run away, fight, or die." (31 Agosto 2025)

**Tipo di Release:** Major Feature Update  
**Stato:** ✅ PRODUCTION READY (con note)

### ✨ Sistema di Combattimento V.A.T. (Visualized Action Tracker)

Introdotto sistema di combattimento tattico a turni con interfaccia dedicata, componenti UI specializzati, logica GDR D&D-style, e gestione stato con Zustand.

**Componenti Principali:**
- `CombatScreen`, `PlayerStatus`, `EnemyStatus`
- `ActionMenu`, `TargetSelector`, `CombatLog`
- `PostCombatScreen` per gestione fine combattimento

**Caratteristiche:**
- Combattimenti a turni tattici
- Calcoli D&D-style (d20 + modificatori)
- Incontri legati a coordinate specifiche
- Sistema di ricompense XP e loot

### 🛠️ Stabilizzazione Suite di Test

- Correzione configurazione Jest/TypeScript
- Riparazione test sistema crafting
- Miglioramenti gestione errori

### ⚠️ Note Tecniche

- 2 test in `combatStore.test.ts` temporaneamente saltati
- Funzionalità verificata manualmente
- Ticket debito tecnico creato per risoluzione futura

---

## Versioni Precedenti

Per informazioni dettagliate sulle versioni precedenti, consultare:
- `documentazione/changelog/` - Changelog specifici per versione
- `documentazione/archivio/` - Documentazione archiviata

---

*The Safe Place - © 2025 Runtime Radio - Simone Pizzi*