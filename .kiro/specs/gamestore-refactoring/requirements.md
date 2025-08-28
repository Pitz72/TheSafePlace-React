# Requirements Document - GameStore Refactoring

## Introduction

Il GameStore attuale è diventato un monolite di 1521 linee che viola il Single Responsibility Principle e sarà impossibile da gestire con l'aggiunta di nuovi sistemi (Crafting, Combattimento, Accessibilità). È necessario un refactoring completo per suddividerlo in store specializzati mantenendo la compatibilità con i componenti esistenti.

## Requirements

### Requirement 1

**User Story:** Come sviluppatore, voglio suddividere il GameStore monolitico in store specializzati, così da avere codice più manutenibile e testabile.

#### Acceptance Criteria

1. WHEN il refactoring è completato THEN il GameStore principale SHALL essere ridotto a <300 linee
2. WHEN creo store specializzati THEN ogni store SHALL avere una singola responsabilità ben definita
3. WHEN suddivido le responsabilità THEN ogni store SHALL gestire al massimo 200-300 linee di codice
4. WHEN refactoring è completo THEN tutti i test esistenti SHALL continuare a passare
5. WHEN creo nuovi store THEN ognuno SHALL essere facilmente testabile in isolamento

### Requirement 2

**User Story:** Come sviluppatore, voglio mantenere la compatibilità con i componenti esistenti, così da non dover modificare tutti i componenti che usano useGameStore.

#### Acceptance Criteria

1. WHEN refactoring è completato THEN l'API pubblica di useGameStore SHALL rimanere identica
2. WHEN i componenti chiamano useGameStore THEN SHALL continuare a funzionare senza modifiche
3. WHEN uso selettori esistenti THEN SHALL continuare a restituire gli stessi dati
4. WHEN chiamo azioni esistenti THEN SHALL continuare a funzionare correttamente
5. WHEN accedo allo stato THEN la struttura dati SHALL rimanere compatibile

### Requirement 3

**User Story:** Come sviluppatore, voglio un CharacterStore dedicato per gestire tutto lo stato del personaggio, così da avere una responsabilità ben definita.

#### Acceptance Criteria

1. WHEN creo CharacterStore THEN SHALL gestire characterSheet, stats, livello, XP
2. WHEN gestisco equipaggiamento THEN SHALL essere nel CharacterStore
3. WHEN gestisco HP e stato vitale THEN SHALL essere nel CharacterStore
4. WHEN gestisco abilità e skill check THEN SHALL essere nel CharacterStore
5. WHEN CharacterStore è creato THEN SHALL essere <250 linee

### Requirement 4

**User Story:** Come sviluppatore, voglio un InventoryStore dedicato per gestire inventario e oggetti, così da separare la logica degli oggetti.

#### Acceptance Criteria

1. WHEN creo InventoryStore THEN SHALL gestire inventory, addItem, removeItem
2. WHEN gestisco database oggetti THEN SHALL essere nell'InventoryStore
3. WHEN gestisco equipaggiamento THEN SHALL coordinare con CharacterStore
4. WHEN gestisco azioni oggetti THEN SHALL essere nell'InventoryStore
5. WHEN InventoryStore è creato THEN SHALL essere <250 linee

### Requirement 5

**User Story:** Come sviluppatore, voglio un WorldStore dedicato per gestire mondo ed esplorazione, così da separare la logica del mondo di gioco.

#### Acceptance Criteria

1. WHEN creo WorldStore THEN SHALL gestire mapData, playerPosition, currentBiome
2. WHEN gestisco movimento giocatore THEN SHALL essere nel WorldStore
3. WHEN gestisco camera e viewport THEN SHALL essere nel WorldStore
4. WHEN gestisco biomi e terreno THEN SHALL essere nel WorldStore
5. WHEN WorldStore è creato THEN SHALL essere <250 linee

### Requirement 6

**User Story:** Come sviluppatore, voglio un WeatherStore dedicato per gestire il sistema meteo, così da avere una responsabilità specifica ben definita.

#### Acceptance Criteria

1. WHEN creo WeatherStore THEN SHALL gestire weatherState, transizioni meteo
2. WHEN gestisco effetti meteo THEN SHALL essere nel WeatherStore
3. WHEN calcolo modificatori meteo THEN SHALL essere nel WeatherStore
4. WHEN gestisco pattern temporali THEN SHALL essere nel WeatherStore
5. WHEN WeatherStore è creato THEN SHALL essere <200 linee

### Requirement 7

**User Story:** Come sviluppatore, voglio un EventStore dedicato per gestire eventi dinamici, così da separare la logica degli eventi.

#### Acceptance Criteria

1. WHEN creo EventStore THEN SHALL gestire currentEvent, eventDatabase
2. WHEN gestisco trigger eventi THEN SHALL essere nell'EventStore
3. WHEN risolvo scelte eventi THEN SHALL essere nell'EventStore
4. WHEN gestisco seenEventIds THEN SHALL essere nell'EventStore
5. WHEN EventStore è creato THEN SHALL essere <200 linee

### Requirement 8

**User Story:** Come sviluppatore, voglio un ShelterStore dedicato per gestire rifugi e sopravvivenza, così da separare questa logica specifica.

#### Acceptance Criteria

1. WHEN creo ShelterStore THEN SHALL gestire shelterAccessState, survivalState
2. WHEN gestisco investigazioni rifugi THEN SHALL essere nel ShelterStore
3. WHEN gestisco consumo notturno THEN SHALL essere nel ShelterStore
4. WHEN gestisco fame e sete THEN SHALL essere nel ShelterStore
5. WHEN ShelterStore è creato THEN SHALL essere <200 linee

### Requirement 9

**User Story:** Come sviluppatore, voglio un UIStore dedicato per gestire stato interfaccia, così da separare logica UI da logica di gioco.

#### Acceptance Criteria

1. WHEN creo UIStore THEN SHALL gestire currentScreen, selectedInventoryIndex
2. WHEN gestisco navigazione schermate THEN SHALL essere nell'UIStore
3. WHEN gestisco notifiche THEN SHALL essere nell'UIStore
4. WHEN gestisco stato menu THEN SHALL essere nell'UIStore
5. WHEN UIStore è creato THEN SHALL essere <150 linee

### Requirement 10

**User Story:** Come sviluppatore, voglio un SaveStore dedicato per gestire salvataggio e caricamento, così da separare questa logica complessa.

#### Acceptance Criteria

1. WHEN creo SaveStore THEN SHALL gestire tutte le operazioni di save/load
2. WHEN salvo il gioco THEN SHALL coordinare con tutti gli store
3. WHEN carico il gioco THEN SHALL distribuire dati a tutti gli store
4. WHEN gestisco export/import THEN SHALL essere nel SaveStore
5. WHEN SaveStore è creato THEN SHALL essere <300 linee

### Requirement 11

**User Story:** Come sviluppatore, voglio un GameStore principale che coordini tutti gli store, così da mantenere un punto di accesso unificato.

#### Acceptance Criteria

1. WHEN refactoring è completo THEN GameStore SHALL essere un facade/coordinator
2. WHEN componenti chiamano useGameStore THEN SHALL accedere a tutti gli store tramite il facade
3. WHEN GameStore coordina THEN SHALL gestire inizializzazione e sincronizzazione
4. WHEN GameStore è refactored THEN SHALL essere <300 linee
5. WHEN aggiungo nuovi sistemi THEN GameStore non SHALL crescere significativamente

### Requirement 12

**User Story:** Come sviluppatore, voglio che il refactoring sia incrementale e sicuro, così da non rompere il gioco durante lo sviluppo.

#### Acceptance Criteria

1. WHEN inizio il refactoring THEN SHALL creare i nuovi store mantenendo quello vecchio
2. WHEN migro funzionalità THEN SHALL testare ogni migrazione singolarmente
3. WHEN completo una migrazione THEN tutti i test SHALL passare
4. WHEN il refactoring è completo THEN SHALL rimuovere il codice vecchio
5. WHEN refactoring è finito THEN le performance SHALL essere uguali o migliori