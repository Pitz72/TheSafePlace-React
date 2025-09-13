# Requirements Document

## Introduction

Il sistema di crafting presenta diversi problemi critici che impediscono un'esperienza di gioco fluida e realistica. Attualmente utilizza ricette demo, ha errori di loop infinito nell'interfaccia, manca di integrazione con il sistema di loot per la scoperta delle ricette, e non fornisce al giocatore risorse iniziali appropriate. È necessario un refactoring completo per creare un sistema di crafting bilanciato e funzionale.

## Requirements

### Requirement 1

**User Story:** Come giocatore, voglio iniziare con ricette di base e materiali sufficienti per craftare oggetti essenziali, così da poter sopravvivere nelle prime fasi del gioco.

#### Acceptance Criteria

1. WHEN un nuovo personaggio viene creato THEN il sistema SHALL fornire 3-5 ricette di base per la sopravvivenza
2. WHEN un nuovo personaggio viene creato THEN il sistema SHALL fornire materiali sufficienti per craftare almeno 2-3 oggetti di base
3. WHEN le ricette di base sono definite THEN SHALL includere: coltello improvvisato, benda di fortuna, torcia di base
4. WHEN i materiali iniziali sono definiti THEN SHALL includere: stoffa, legno, metallo di scarto in quantità limitate
5. WHEN il giocatore accede al crafting per la prima volta THEN SHALL vedere immediatamente ricette craftabili

### Requirement 2

**User Story:** Come giocatore, voglio scoprire nuove ricette esplorando il mondo e trovando loot, così da avere progressione e motivazione per l'esplorazione.

#### Acceptance Criteria

1. WHEN il giocatore trova un manuale di crafting THEN il sistema SHALL sbloccare ricette specifiche associate
2. WHEN il giocatore raggiunge determinati livelli THEN il sistema SHALL sbloccare ricette appropriate al livello
3. WHEN le ricette sono trovate nel loot THEN SHALL essere integrate nel sistema di loot esistente
4. WHEN una nuova ricetta è scoperta THEN il sistema SHALL mostrare una notifica chiara nel journal
5. WHEN il giocatore trova materiali rari THEN SHALL poter craftare oggetti avanzati se conosce le ricette

### Requirement 3

**User Story:** Come giocatore, voglio un'interfaccia di crafting stabile e senza errori, così da poter utilizzare il sistema senza interruzioni.

#### Acceptance Criteria

1. WHEN apro l'interfaccia di crafting THEN non SHALL verificarsi errori di "Maximum update depth exceeded"
2. WHEN navigo tra le ricette THEN non SHALL verificarsi errori di stato
3. WHEN premo ESC per uscire THEN SHALL tornare correttamente alla schermata rifugio
4. WHEN l'interfaccia si carica THEN SHALL inizializzare le ricette una sola volta
5. WHEN cambio selezione THEN gli aggiornamenti di stato SHALL essere ottimizzati per evitare loop

### Requirement 4

**User Story:** Come giocatore, voglio ricette realistiche e bilanciate per il mondo di sopravvivenza, così da avere un'esperienza immersiva e coerente.

#### Acceptance Criteria

1. WHEN le ricette sono definite THEN SHALL essere appropriate per un mondo post-apocalittico
2. WHEN i materiali sono richiesti THEN SHALL essere logici e reperibili nel mondo di gioco
3. WHEN gli oggetti sono craftati THEN SHALL avere statistiche bilanciate per il gameplay
4. WHEN le ricette avanzate sono sbloccate THEN SHALL richiedere materiali rari e abilità elevate
5. WHEN il sistema è completo THEN SHALL supportare almeno 15-20 ricette diverse per categoria

### Requirement 5

**User Story:** Come sviluppatore, voglio un sistema di ricette modulare e facilmente estendibile, così da poter aggiungere nuove ricette senza modificare il codice core.

#### Acceptance Criteria

1. WHEN nuove ricette sono aggiunte THEN SHALL essere definite solo nel file JSON
2. WHEN il sistema di loot è integrato THEN SHALL utilizzare ID ricette consistenti
3. WHEN le ricette sono caricate THEN il sistema SHALL validare la struttura e mostrare errori chiari
4. WHEN le ricette sono modificate THEN SHALL essere possibile ricaricarle senza riavviare l'applicazione
5. WHEN il sistema è esteso THEN SHALL mantenere retrocompatibilità con ricette esistenti

### Requirement 6

**User Story:** Come giocatore, voglio che il sistema di crafting si integri perfettamente con la progressione del personaggio, così da sentire una crescita costante delle mie capacità.

#### Acceptance Criteria

1. WHEN il mio livello aumenta THEN SHALL sbloccare automaticamente nuove ricette appropriate
2. WHEN completo crafting THEN SHALL ricevere XP appropriato per l'attività
3. WHEN le mie abilità migliorano THEN SHALL poter accedere a ricette più complesse
4. WHEN crafto oggetti avanzati THEN SHALL richiedere livelli di abilità specifici
5. WHEN il sistema è bilanciato THEN la progressione SHALL essere graduale e motivante

### Requirement 7

**User Story:** Come giocatore, voglio che i materiali di crafting siano integrati nel sistema di loot del gioco, così da avere coerenza nell'economia di gioco.

#### Acceptance Criteria

1. WHEN esploro il mondo THEN SHALL trovare materiali di crafting nei container
2. WHEN i materiali sono definiti THEN SHALL essere presenti nel database oggetti principale
3. WHEN raccolgo materiali THEN SHALL essere automaticamente utilizzabili per il crafting
4. WHEN i materiali sono rari THEN SHALL essere trovati solo in location specifiche
5. WHEN il sistema è completo THEN SHALL esserci economia bilanciata tra trovare e craftare oggetti