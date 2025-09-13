# Requirements Document - Sistema di Combattimento V.A.T.

## Introduction

Il sistema di combattimento V.A.T. (Visualized Action Tracker) per "The Safe Place" implementa un sistema di combattimento tattico a turni che enfatizza la strategia e la gestione delle risorse. Il sistema deve essere completamente trasparente nei calcoli, accessibile da tastiera e integrato con il motore di eventi dinamici esistente.

## Requirements

### Requirement 1

**User Story:** Come giocatore, voglio che il combattimento inizi automaticamente quando incontro nemici attraverso eventi dinamici, così da avere transizioni fluide dal gameplay di esplorazione.

#### Acceptance Criteria

1. WHEN il motore di eventi dinamici attiva un evento di scontro THEN il sistema SHALL passare immediatamente dalla GameScreen alla CombatScreen
2. WHEN inizia un combattimento THEN il sistema SHALL fermare il tempo di gioco
3. WHEN inizia un combattimento THEN il sistema SHALL inizializzare lo stato del combattimento con giocatore e nemici
4. WHEN il combattimento termina THEN il sistema SHALL tornare alla GameScreen e riprendere il tempo di gioco

### Requirement 2

**User Story:** Come giocatore, voglio vedere una descrizione narrativa chiara della scena di combattimento, così da comprendere il contesto e l'atmosfera dello scontro.

#### Acceptance Criteria

1. WHEN la CombatScreen si apre THEN il sistema SHALL mostrare una descrizione narrativa dell'ambiente e dei nemici
2. WHEN si verifica un'azione significativa THEN il sistema SHALL aggiornare la descrizione della scena
3. WHEN la descrizione cambia THEN il sistema SHALL mantenere coerenza narrativa con lo stato del combattimento
4. WHEN vengono inflitti danni significativi THEN il sistema SHALL riflettere i cambiamenti nella descrizione

### Requirement 3

**User Story:** Come giocatore, voglio vedere lo stato completo del combattimento con informazioni su me stesso e sui nemici, così da prendere decisioni tattiche informate.

#### Acceptance Criteria

1. WHEN la CombatScreen è attiva THEN il sistema SHALL mostrare le statistiche del giocatore (HP, arma, armatura)
2. WHEN ci sono nemici THEN il sistema SHALL mostrare il loro stato con descrizioni qualitative della vita (Illeso, Ferito, Gravemente Ferito, Morente)
3. WHEN lo stato di un partecipante cambia THEN il sistema SHALL aggiornare immediatamente la visualizzazione
4. WHEN il giocatore ha bonus temporanei (es. difesa) THEN il sistema SHALL mostrarli chiaramente

### Requirement 4

**User Story:** Come giocatore, voglio vedere un log dettagliato di tutte le azioni di combattimento con calcoli trasparenti, così da capire perché le azioni hanno successo o falliscono.

#### Acceptance Criteria

1. WHEN viene eseguita un'azione di combattimento THEN il sistema SHALL registrare l'azione nel log con dettagli completi
2. WHEN viene fatto un tiro per colpire THEN il sistema SHALL mostrare la formula completa (d20 + modificatori vs AC)
3. WHEN viene inflitto danno THEN il sistema SHALL mostrare il calcolo del danno (dado + modificatori)
4. WHEN un'azione fallisce THEN il sistema SHALL spiegare chiaramente il motivo del fallimento
5. WHEN il log diventa troppo lungo THEN il sistema SHALL mantenere visibili almeno le ultime 10 azioni

### Requirement 5

**User Story:** Come giocatore, voglio avere accesso a quattro azioni principali durante il mio turno (Attacca, Inventario, Difesa, Fuggi), così da avere opzioni tattiche diverse.

#### Acceptance Criteria

1. WHEN è il turno del giocatore THEN il sistema SHALL mostrare le quattro opzioni di azione navigabili con W/S
2. WHEN seleziono un'azione THEN il sistema SHALL evidenziare chiaramente l'opzione selezionata
3. WHEN premo Invio su un'azione THEN il sistema SHALL eseguire l'azione corrispondente
4. WHEN un'azione non è disponibile THEN il sistema SHALL disabilitarla visivamente e impedirne la selezione

### Requirement 6

**User Story:** Come giocatore, voglio attaccare i nemici con calcoli basati sulle regole D&D esistenti, così da avere un sistema di combattimento coerente e bilanciato.

#### Acceptance Criteria

1. WHEN scelgo di attaccare e ci sono più nemici THEN il sistema SHALL permettermi di selezionare il bersaglio
2. WHEN attacco THEN il sistema SHALL calcolare il tiro per colpire usando d20 + modificatore appropriato (Potenza per mischia, Agilità per distanza)
3. WHEN il tiro per colpire supera l'AC del nemico THEN il sistema SHALL considerare l'attacco riuscito
4. WHEN l'attacco riesce THEN il sistema SHALL calcolare il danno usando il dado dell'arma equipaggiata
5. WHEN viene inflitto danno THEN il sistema SHALL ridurre gli HP del nemico e aggiornare il suo stato descrittivo
6. WHEN l'attacco fallisce THEN il sistema SHALL registrare il fallimento senza infliggere danno

### Requirement 7

**User Story:** Come giocatore, voglio usare oggetti dall'inventario durante il combattimento, così da poter curare ferite o usare strumenti tattici.

#### Acceptance Criteria

1. WHEN scelgo l'azione Inventario THEN il sistema SHALL mostrare solo gli oggetti utilizzabili in combattimento
2. WHEN seleziono un oggetto THEN il sistema SHALL permettermi di usarlo premendo Invio
3. WHEN uso un oggetto THEN il sistema SHALL applicare i suoi effetti (es. cura HP per le bende)
4. WHEN uso un oggetto THEN il sistema SHALL rimuoverlo dall'inventario se è consumabile
5. WHEN uso un oggetto THEN il sistema SHALL consumare l'intero turno del giocatore
6. WHEN l'inventario non ha oggetti utilizzabili THEN il sistema SHALL mostrare un messaggio appropriato

### Requirement 8

**User Story:** Come giocatore, voglio potermi difendere per ottenere bonus alla Classe Armatura, così da avere un'opzione tattica per ridurre i danni subiti.

#### Acceptance Criteria

1. WHEN scelgo l'azione Difesa THEN il sistema SHALL applicare un bonus di +4 alla mia AC per il turno successivo
2. WHEN sono in posizione difensiva THEN il sistema SHALL mostrare chiaramente questo stato
3. WHEN i nemici attaccano mentre sono in difesa THEN il sistema SHALL applicare il bonus AC ai calcoli
4. WHEN il turno difensivo termina THEN il sistema SHALL rimuovere automaticamente il bonus
5. WHEN scelgo la difesa THEN il sistema SHALL consumare l'intero turno senza permettere altre azioni

### Requirement 9

**User Story:** Come giocatore, voglio tentare di fuggire dal combattimento con uno skill check, così da poter evitare scontri troppo pericolosi.

#### Acceptance Criteria

1. WHEN scelgo l'azione Fuggi THEN il sistema SHALL eseguire uno skill check di Agilità per il giocatore
2. WHEN tento la fuga THEN il sistema SHALL eseguire un tiro di inseguimento per i nemici
3. WHEN il mio tiro supera quello dei nemici THEN il sistema SHALL far terminare il combattimento con successo
4. WHEN la fuga riesce THEN il sistema SHALL spostare il giocatore in una casella adiacente casuale
5. WHEN la fuga fallisce THEN il sistema SHALL far perdere il turno al giocatore e continuare il combattimento
6. WHEN tento la fuga THEN il sistema SHALL mostrare entrambi i tiri e il risultato nel log

### Requirement 10

**User Story:** Come giocatore, voglio che i nemici agiscano in modo intelligente e prevedibile durante i loro turni, così da poter pianificare le mie strategie.

#### Acceptance Criteria

1. WHEN è il turno dei nemici THEN il sistema SHALL far agire ogni nemico in sequenza
2. WHEN un nemico attacca THEN il sistema SHALL calcolare il tiro per colpire contro la mia AC
3. WHEN un nemico colpisce THEN il sistema SHALL calcolare e applicare il danno
4. WHEN un nemico manca THEN il sistema SHALL registrare il fallimento nel log
5. WHEN tutti i nemici hanno agito THEN il sistema SHALL passare il turno al giocatore

### Requirement 11

**User Story:** Come giocatore, voglio che il combattimento termini chiaramente con vittoria o sconfitta, così da avere conseguenze definite per ogni scontro.

#### Acceptance Criteria

1. WHEN tutti i nemici sono sconfitti THEN il sistema SHALL dichiarare la vittoria e assegnare XP bonus
2. WHEN vinco un combattimento THEN il sistema SHALL tornare alla GameScreen e registrare la vittoria nel diario
3. WHEN i miei HP scendono a 0 THEN il sistema SHALL dichiarare la sconfitta
4. WHEN perdo un combattimento THEN il sistema SHALL passare alla GameOverScreen
5. WHEN il combattimento termina THEN il sistema SHALL pulire lo stato del combattimento

### Requirement 12

**User Story:** Come giocatore, voglio che il sistema di combattimento si integri perfettamente con tutti i sistemi esistenti del gioco, così da avere un'esperienza coesa.

#### Acceptance Criteria

1. WHEN il sistema calcola l'AC del giocatore THEN il sistema SHALL usare la formula 10 + Modificatore Agilità + Bonus Armatura
2. WHEN il sistema accede alle statistiche del giocatore THEN il sistema SHALL utilizzare il characterSheet esistente
3. WHEN il sistema assegna XP THEN il sistema SHALL utilizzare il sistema di progressione esistente
4. WHEN il sistema registra eventi THEN il sistema SHALL utilizzare il GameJournal esistente
5. WHEN il sistema gestisce oggetti THEN il sistema SHALL utilizzare le funzioni inventario esistenti (addItem/removeItem)