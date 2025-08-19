# Requirements Document - Version 0.4.3 "Shelter"

## Introduction

Implementazione della versione 0.4.3 "Shelter" di The Safe Place, focalizzata su correzioni critiche, sistema di sopravvivenza completo e implementazione dei rifugi.

## Requirements

### Requirement 1 - Correzioni Critiche e Sincronizzazione

**User Story:** Come sviluppatore, voglio che la documentazione sia perfettamente sincronizzata con il codice, così da avere una base solida per lo sviluppo futuro.

#### Acceptance Criteria

1. WHEN la documentazione viene aggiornata THEN deve riflettere la versione 0.4.3
2. WHEN vengono identificate discrepanze THEN devono essere corrette immediatamente
3. WHEN il sistema di analisi viene eseguito THEN deve mostrare 100% di compatibilità

### Requirement 2 - Sistema XP Migliorato

**User Story:** Come giocatore, voglio guadagnare esperienza attraverso l'esplorazione e le azioni, così da sentire una progressione costante.

#### Acceptance Criteria

1. WHEN il giocatore si muove sulla mappa THEN deve guadagnare 1-2 XP per passo
2. WHEN il giocatore supera uno skill check THEN deve guadagnare 5-10 XP bonus
3. WHEN il giocatore fallisce uno skill check THEN deve guadagnare 1-3 XP di consolazione

### Requirement 3 - Schermata Level Up Accessibile

**User Story:** Come giocatore, voglio accedere alla schermata Level Up in qualsiasi momento, così da vedere i miei progressi anche senza poter salire di livello.

#### Acceptance Criteria

1. WHEN premo il tasto L THEN la schermata Level Up deve aprirsi sempre
2. WHEN non ho abbastanza XP THEN devo vedere i progressi verso il prossimo livello
3. WHEN ho abbastanza XP THEN devo poter effettuare il level up

### Requirement 4 - Correzione Messaggi Duplicati

**User Story:** Come giocatore, voglio che ogni evento generi un solo messaggio nel diario, così da avere un log pulito e leggibile.

#### Acceptance Criteria

1. WHEN avviene una transizione temporale THEN deve apparire un solo messaggio
2. WHEN supero uno skill check THEN deve apparire un solo messaggio di risultato
3. WHEN fallisco uno skill check THEN deve apparire un solo messaggio di fallimento

### Requirement 5 - Sistema Riposo Migliorato

**User Story:** Come giocatore, voglio che il riposo sia efficace e consumi tempo, così da avere una meccanica di recupero bilanciata.

#### Acceptance Criteria

1. WHEN premo R THEN devo recuperare quasi tutti gli HP
2. WHEN riposo THEN deve passare del tempo (2-4 ore)
3. WHEN riposo THEN deve apparire un messaggio appropriato nel diario

### Requirement 6 - Colori Status Corretti

**User Story:** Come giocatore, voglio che i colori degli status riflettano la mia condizione, così da capire immediatamente il mio stato di salute.

#### Acceptance Criteria

1. WHEN sono in salute THEN lo status deve essere verde
2. WHEN sono ferito THEN lo status deve essere giallo
3. WHEN sono in condizioni critiche THEN lo status deve essere rosso
4. WHEN sono morto THEN lo status deve essere rosso lampeggiante

### Requirement 7 - Sistema Sopravvivenza

**User Story:** Come giocatore, voglio gestire fame e sete, così da avere una sfida di sopravvivenza realistica.

#### Acceptance Criteria

1. WHEN mi muovo THEN fame e sete devono diminuire gradualmente
2. WHEN consumo cibo/bevande THEN fame e sete devono aumentare
3. WHEN fame/sete sono a 0 THEN devo perdere HP gradualmente
4. WHEN fame/sete sono critiche THEN devono lampeggiare in rosso

### Requirement 8 - Sistema Rifugi

**User Story:** Come giocatore, voglio utilizzare i rifugi per riposare e cercare risorse, così da avere punti strategici sulla mappa.

#### Acceptance Criteria

1. WHEN entro in una tile R di giorno THEN si apre un menu rifugio
2. WHEN entro in una tile R di notte THEN passo automaticamente al giorno successivo
3. WHEN uso un rifugio THEN posso riposare, cercare oggetti o usare il banco di lavoro
4. WHEN passo la notte THEN consumo automaticamente cibo e bevande
5. WHEN non ho cibo/bevande per la notte THEN subisco penalità temporanee

### Requirement 9 - Verifica Messaggi Narrativi

**User Story:** Come giocatore, voglio che tutti i 150 messaggi narrativi siano implementati, così da avere varietà nell'esperienza di gioco.

#### Acceptance Criteria

1. WHEN il sistema genera messaggi THEN tutti i 25 tipi devono avere contenuti
2. WHEN accade un evento THEN deve esserci varietà nei messaggi mostrati
3. WHEN non c'è un messaggio specifico THEN deve esserci un fallback appropriato