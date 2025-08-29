# Implementation Plan - Redesign Interfaccia Crafting Terminale

## Task List

- [x] 1. Creare componente base TerminalCraftingScreen con layout ASCII


  - Implementare struttura base del componente con layout fisso terminale
  - Creare sistema di rendering ASCII con caratteri box-drawing
  - Implementare header section con titolo e contatore ricette
  - Aggiungere bordi e separatori usando caratteri ASCII standard
  - _Requirements: 1.1, 1.2, 4.1, 4.4_

- [x] 2. Implementare sistema di navigazione keyboard-only


  - Creare hook per gestione input W/S per navigazione verticale
  - Implementare selezione ricetta con indicatore freccia ASCII
  - Aggiungere gestione ENTER per crafting e ESC per uscita
  - Implementare focus management e highlight selezione corrente
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Creare sezione lista ricette con formattazione terminale


  - Implementare rendering lista ricette in formato colonne allineate
  - Aggiungere numerazione progressiva [1], [2], etc. per ogni ricetta
  - Creare sistema di stati testuali (DISPONIBILE, MANCANTI MAT., etc.)
  - Implementare scrolling verticale per liste lunghe
  - _Requirements: 1.1, 1.3, 2.2, 2.3, 5.4_

- [x] 4. Sviluppare sezione dettagli ricetta con informazioni dense


  - Creare layout fisso per dettagli ricetta selezionata
  - Implementare visualizzazione nome, descrizione e risultato
  - Aggiungere sezione requisiti abilità con stato corrente vs richiesto
  - Formattare tutte le informazioni in stile terminale leggibile
  - _Requirements: 2.1, 2.2, 5.1, 5.2_

- [x] 5. Implementare sezione stato materiali con indicatori ASCII

  - Creare tabella materiali con colonne allineate (Nome, Richiesta, Posseduta, Status)
  - Implementare indicatori testuali [OK] e [MANCANTE] per ogni materiale
  - Aggiungere colori phosphor per differenziare stati (verde/rosso)
  - Calcolare e mostrare stato complessivo craftabilità ricetta
  - _Requirements: 1.1, 2.4, 5.1, 5.4_

- [x] 6. Creare sezione comandi con istruzioni sempre visibili


  - Implementare barra comandi fissa in fondo schermo
  - Aggiungere istruzioni tastiera sempre visibili ([W/S] Naviga, etc.)
  - Creare sistema di comandi dinamici basato su stato corrente
  - Implementare feedback testuale per azioni (crafting, errori, successi)
  - _Requirements: 3.5, 6.2, 7.2_

- [x] 7. Integrare con craftingStore esistente mantenendo logica backend

  - Connettere nuovo componente al craftingStore senza modifiche
  - Implementare sincronizzazione bidirezionale con stato esistente
  - Mantenere tutte le funzionalità di crafting, validazione e XP
  - Preservare integrazione con inventario e character sheet
  - _Requirements: 6.1, 6.3_

- [x] 8. Implementare gestione stati di errore in stile terminale


  - Creare schermata "Nessuna ricetta conosciuta" con layout ASCII
  - Implementare messaggi di errore testuali per crafting fallito
  - Aggiungere feedback di successo per crafting completato
  - Creare sistema di messaggi temporanei con dismissal automatico
  - _Requirements: 1.1, 6.2, 7.2_

- [x] 9. Ottimizzare performance per rendering testuale rapido


  - Implementare memoizzazione per layout fisso e calcoli costosi
  - Aggiungere debouncing per input rapidi di navigazione
  - Ottimizzare re-rendering solo per parti di interfaccia cambiate
  - Implementare pre-calcolo stati materiali e craftabilità
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 10. Sostituire componente esistente con feature flag

  - Creare feature flag per abilitare nuova interfaccia terminale
  - Aggiornare ShelterScreen per utilizzare nuovo componente
  - Mantenere componente vecchio come fallback durante transizione
  - Implementare switch seamless tra vecchia e nuova interfaccia
  - _Requirements: 6.1, 6.3_

- [x] 11. Testing completo interfaccia terminale




  - Creare unit test per rendering ASCII e formattazione layout
  - Implementare integration test per navigazione keyboard e stati
  - Aggiungere test per tutti i casi edge (liste vuote, errori, etc.)
  - Testare compatibilità con tutti i browser e risoluzioni supportate
  - _Requirements: 2.4, 3.1, 3.2, 3.3, 7.1_

- [x] 12. Documentazione e finalizzazione



  - Aggiornare documentazione utente con nuova interfaccia terminale
  - Creare guida per sviluppatori su architettura componente
  - Aggiornare test anti-regressione per nuova interfaccia
  - Preparare note di rilascio per redesign completo
  - _Requirements: 6.1, 6.2, 6.3_