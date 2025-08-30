# Requirements Document

## Introduction

Il sistema di crafting attuale presenta un'interfaccia troppo complessa per l'esperienza retrocomputazionale che il gioco vuole offrire. L'interfaccia terminale è troppo spartana mentre quella grafica è eccessivamente articolata. È necessario ridisegnare l'interfaccia del banco di lavoro per allinearla allo stile delle altre schermate del gioco (CharacterSheet, Inventory, LevelUp) mantenendo la semplicità e l'usabilità.

## Requirements

### Requirement 1

**User Story:** Come giocatore, voglio un'interfaccia di crafting coerente con lo stile del gioco, così da avere un'esperienza visiva uniforme.

#### Acceptance Criteria

1. WHEN il giocatore accede al banco di lavoro THEN l'interfaccia SHALL utilizzare lo stesso layout a colonne delle altre schermate
2. WHEN il giocatore naviga nell'interfaccia THEN i colori e i font SHALL essere consistenti con CharacterSheet, Inventory e LevelUp
3. WHEN il giocatore vede l'interfaccia THEN SHALL essere presente il titolo centrato in stile phosphor-green
4. WHEN il giocatore interagisce con l'interfaccia THEN i bordi e i pannelli SHALL utilizzare lo stesso stile delle altre schermate

### Requirement 2

**User Story:** Come giocatore, voglio navigare facilmente tra le ricette, così da trovare rapidamente quello che posso craftare.

#### Acceptance Criteria

1. WHEN il giocatore preme W o freccia su THEN la selezione SHALL spostarsi alla ricetta precedente
2. WHEN il giocatore preme S o freccia giù THEN la selezione SHALL spostarsi alla ricetta successiva
3. WHEN il giocatore preme ESC THEN SHALL tornare alla schermata rifugio
4. WHEN il giocatore preme ENTER THEN SHALL craftare l'oggetto selezionato se possibile
5. WHEN il giocatore naviga THEN la ricetta selezionata SHALL essere evidenziata con sfondo phosphor-400

### Requirement 3

**User Story:** Come giocatore, voglio capire immediatamente quali ricette posso craftare, così da non perdere tempo su quelle non disponibili.

#### Acceptance Criteria

1. WHEN una ricetta è craftabile THEN SHALL essere mostrata in verde
2. WHEN una ricetta non è craftabile per mancanza materiali THEN SHALL essere mostrata in rosso
3. WHEN una ricetta non è craftabile per livello insufficiente THEN SHALL essere mostrata in grigio
4. WHEN il giocatore seleziona una ricetta THEN SHALL vedere i dettagli dei materiali richiesti con colori appropriati
5. WHEN i materiali sono sufficienti THEN SHALL essere mostrati in verde
6. WHEN i materiali sono insufficienti THEN SHALL essere mostrati in rosso

### Requirement 4

**User Story:** Come giocatore, voglio vedere chiaramente i dettagli della ricetta selezionata, così da capire cosa sto per craftare.

#### Acceptance Criteria

1. WHEN il giocatore seleziona una ricetta THEN SHALL vedere il nome dell'oggetto risultante
2. WHEN il giocatore seleziona una ricetta THEN SHALL vedere la descrizione dell'oggetto
3. WHEN il giocatore seleziona una ricetta THEN SHALL vedere tutti i materiali richiesti con quantità
4. WHEN il giocatore seleziona una ricetta THEN SHALL vedere i requisiti di livello se presenti
5. WHEN il giocatore seleziona una ricetta THEN SHALL vedere la quantità che verrà prodotta

### Requirement 5

**User Story:** Come giocatore, voglio un'interfaccia semplice e intuitiva, così da non essere sopraffatto dalla complessità.

#### Acceptance Criteria

1. WHEN il giocatore accede al crafting THEN l'interfaccia SHALL utilizzare un layout a 2 colonne massimo
2. WHEN il giocatore vede l'interfaccia THEN SHALL essere presente una sezione comandi chiara in basso
3. WHEN il giocatore interagisce THEN tutti i tasti SHALL funzionare correttamente
4. WHEN il giocatore usa l'interfaccia THEN non SHALL esserci elementi grafici complessi o distraenti
5. WHEN il giocatore naviga THEN la transizione tra ricette SHALL essere fluida e immediata