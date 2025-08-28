# Requirements Document - Sistema di Crafting

## Introduction

Il sistema di crafting per "The Safe Place" rappresenta una meccanica fondamentale di sopravvivenza che permette al giocatore di trasformare materiali trovati nel mondo in oggetti utili per la sopravvivenza. Il sistema deve essere realistico, strategico e completamente accessibile da tastiera, integrandosi perfettamente con i sistemi esistenti del gioco.

## Requirements

### Requirement 1

**User Story:** Come giocatore, voglio accedere al sistema di crafting solo nei rifugi sicuri, così che il crafting sia un'attività strategica legata alla sicurezza.

#### Acceptance Criteria

1. WHEN il giocatore si trova in un rifugio (`R`) THEN il sistema SHALL mostrare l'opzione `[B]anco di Lavoro` nella ShelterScreen
2. WHEN il giocatore preme `B` nella ShelterScreen THEN il sistema SHALL aprire la CraftingScreen
3. WHEN il giocatore si trova fuori da un rifugio THEN il sistema SHALL NOT permettere l'accesso al crafting
4. WHEN il giocatore preme `ESC` nella CraftingScreen THEN il sistema SHALL tornare alla ShelterScreen

### Requirement 2

**User Story:** Come giocatore, voglio vedere tutte le ricette che conosco con il loro stato di disponibilità, così da poter pianificare le mie attività di crafting.

#### Acceptance Criteria

1. WHEN la CraftingScreen è aperta THEN il sistema SHALL mostrare una lista di tutte le ricette conosciute dal giocatore
2. WHEN una ricetta ha tutti i materiali disponibili THEN il sistema SHALL mostrarla in colore verde brillante con stato "Disponibile"
3. WHEN una ricetta non ha tutti i materiali THEN il sistema SHALL mostrarla in colore grigio con stato "Non Disponibile"
4. WHEN il giocatore naviga con `W/S` THEN il sistema SHALL permettere la selezione delle ricette nella lista
5. WHEN una ricetta è selezionata THEN il sistema SHALL aggiornare i dettagli nella sezione centrale

### Requirement 3

**User Story:** Come giocatore, voglio vedere i dettagli completi di una ricetta selezionata, così da capire cosa serve e cosa otterrò.

#### Acceptance Criteria

1. WHEN una ricetta è selezionata THEN il sistema SHALL mostrare il nome dell'oggetto risultante
2. WHEN una ricetta è selezionata THEN il sistema SHALL mostrare la descrizione dell'oggetto
3. WHEN una ricetta è selezionata THEN il sistema SHALL mostrare l'elenco dei materiali richiesti con formato "Posseduti / Richiesti"
4. WHEN un materiale è sufficiente THEN il sistema SHALL mostrarlo in colore verde
5. WHEN un materiale è insufficiente THEN il sistema SHALL mostrarlo in colore rosso
6. IF una ricetta richiede abilità specifiche THEN il sistema SHALL mostrare il requisito di abilità

### Requirement 4

**User Story:** Come giocatore, voglio vedere un'anteprima dell'oggetto che creerò, così da valutare se vale la pena spendere le risorse.

#### Acceptance Criteria

1. WHEN una ricetta è selezionata THEN il sistema SHALL mostrare le statistiche dell'oggetto risultante
2. WHEN l'oggetto risultante è un'arma THEN il sistema SHALL mostrare danno, peso, valore e proprietà speciali
3. WHEN l'oggetto risultante è un consumabile THEN il sistema SHALL mostrare effetti, peso e valore
4. WHEN l'oggetto risultante è equipaggiamento THEN il sistema SHALL mostrare protezione, peso, valore e proprietà

### Requirement 5

**User Story:** Come giocatore, voglio creare oggetti usando le ricette disponibili, così da migliorare il mio equipaggiamento e le mie possibilità di sopravvivenza.

#### Acceptance Criteria

1. WHEN una ricetta è disponibile e il giocatore preme `Invio` THEN il sistema SHALL verificare i requisiti di abilità se presenti
2. IF i requisiti di abilità non sono soddisfatti THEN il sistema SHALL mostrare un messaggio di errore nel diario e interrompere l'azione
3. WHEN tutti i requisiti sono soddisfatti THEN il sistema SHALL rimuovere i materiali richiesti dall'inventario
4. WHEN i materiali sono rimossi THEN il sistema SHALL aggiungere l'oggetto risultante all'inventario
5. WHEN l'oggetto è creato THEN il sistema SHALL mostrare un messaggio di successo nel GameJournal con formato "[HH:MM] Usando il banco di lavoro, hai creato: [Nome Oggetto] (x[Quantità])."
6. WHEN l'oggetto è creato THEN il sistema SHALL assegnare XP al giocatore per l'attività di crafting

### Requirement 6

**User Story:** Come giocatore, voglio sbloccare nuove ricette attraverso la progressione, così da avere sempre nuovi obiettivi e possibilità.

#### Acceptance Criteria

1. WHEN il giocatore raggiunge un nuovo livello THEN il sistema SHALL sbloccare ricette di base appropriate al livello
2. WHEN il giocatore trova un manuale nel mondo THEN il sistema SHALL sbloccare le ricette associate a quel manuale
3. WHEN una nuova ricetta è sbloccata THEN il sistema SHALL aggiornare l'array `knownRecipes` nel characterSheet
4. WHEN una nuova ricetta è sbloccata THEN il sistema SHALL mostrare una notifica nel GameJournal

### Requirement 7

**User Story:** Come giocatore, voglio che il sistema di crafting supporti diverse tipologie di creazione, così da avere varietà nelle attività di crafting.

#### Acceptance Criteria

1. WHEN creo un oggetto migliorato THEN il sistema SHALL permettere di combinare un oggetto esistente con materiali per ottenere una versione potenziata
2. WHEN creo un nuovo oggetto THEN il sistema SHALL permettere di combinare materiali base per ottenere un oggetto completamente nuovo
3. WHEN le ricette sono definite THEN il sistema SHALL supportare sia la creazione che il miglioramento attraverso la stessa interfaccia
4. WHEN un oggetto è creato o migliorato THEN il sistema SHALL mantenere la coerenza con il database degli oggetti esistente

### Requirement 8

**User Story:** Come giocatore, voglio che il sistema di crafting si integri perfettamente con tutti i sistemi esistenti del gioco, così da avere un'esperienza coesa.

#### Acceptance Criteria

1. WHEN il sistema di crafting accede all'inventario THEN il sistema SHALL utilizzare le funzioni `addItem` e `removeItem` esistenti
2. WHEN il sistema verifica i materiali THEN il sistema SHALL leggere direttamente dall'inventario del giocatore in tempo reale
3. WHEN il sistema assegna XP THEN il sistema SHALL utilizzare il sistema di progressione esistente
4. WHEN il sistema mostra messaggi THEN il sistema SHALL utilizzare il GameJournal esistente
5. WHEN il sistema salva le ricette conosciute THEN il sistema SHALL utilizzare il characterSheet esistente