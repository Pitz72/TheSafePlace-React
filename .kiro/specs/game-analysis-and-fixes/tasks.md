# Implementation Plan - Analisi e Correzioni Sistema di Gioco

- [x] 1. Analisi e Documentazione Sistema D&D


  - Verificare il funzionamento completo del sistema D&D esistente
  - Documentare tutte le meccaniche implementate (generazione personaggio, skill check, modificatori)
  - Testare l'integrazione tra rules system e gameplay
  - Creare report dettagliato dello stato attuale
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Verifica e Correzione Mappatura Biomi


  - Analizzare tutti i simboli presenti nella mappa `/public/map.txt`
  - Confermare che il simbolo R rappresenta "Riposo/Rifugio" e non "Risorse"
  - Verificare che tutti i biomi abbiano messaggi appropriati in `MessageArchive.ts`
  - Documentare i biomi non ancora implementati (come la logica per R)
  - Testare il sistema di fallback per biomi non mappati
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Implementazione Colori Distintivi per Messaggi


  - Aggiungere classi CSS mancanti per tutti i MessageType in `src/index.css`
  - Implementare colori distintivi per skill check, HP, azioni, inventario, tempo ed eventi
  - Aggiornare `GameJournal.tsx` per utilizzare i nuovi colori
  - Testare la leggibilità e l'accessibilità dei colori scelti
  - _Requirements: 3.1, 3.4_

- [x] 4. Miglioramento Skill Check Fiume


  - Verificare l'implementazione attuale dello skill check per l'attraversamento dei fiumi
  - Aggiungere messaggi specifici per successo e fallimento nell'attraversamento
  - Testare che i messaggi vengano mostrati correttamente nel GameJournal
  - Ottimizzare la logica in `useKeyboardCommands.ts` se necessario
  - _Requirements: 3.2, 3.3_

- [x] 5. Verifica e Integrazione Messaggi Ironici Montagne


  - Controllare il numero attuale di messaggi per `MOVEMENT_FAIL_MOUNTAIN`
  - Aggiungere messaggi aggiuntivi se necessario per raggiungere 4-5 varianti
  - Verificare che il tono ironico sia mantenuto e coerente
  - Testare la selezione casuale dei messaggi
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Implementazione Colori Differenziati Inventario


  - Creare sistema di colori per oggetti basato su tipo/rarità in `src/index.css`
  - Aggiornare `InventoryScreen.tsx` per applicare colori agli oggetti
  - Implementare colori per: armi (rosso), armature (blu), consumabili (verde), quest items (giallo), etc.
  - Testare la differenziazione visiva su tutti i tipi di oggetti
  - _Requirements: 5.1, 5.4_

- [x] 7. Miglioramento Indicatori Selezione Inventario



  - Implementare indicatore hover più evidente per l'oggetto selezionato
  - Aggiungere bordi, ombre o effetti glow per evidenziare la selezione
  - Migliorare il feedback visivo oltre alla semplice descrizione testuale
  - Testare l'usabilità con diversi temi (standard, no-effects, high-contrast)
  - _Requirements: 5.2, 5.4_








- [ ] 8. Implementazione Opzioni Utilizzo Oggetti
  - Creare sistema di opzioni per oggetti (USO, EQUIPAGGIAMENTO, GETTARE)
  - Aggiornare `InventoryScreen.tsx` per mostrare le opzioni disponibili
  - Implementare logica per determinare quali opzioni sono disponibili per ogni oggetto


  - Aggiungere controlli tastiera per selezionare le opzioni (es. U, E, G)

  - Chiarire l'azione del tasto ENTER (mostra opzioni o usa direttamente)
  - _Requirements: 5.3, 5.4_

- [x] 9. Progettazione Sistema Porzioni Consumabili









  - Estendere l'interfaccia `IInventorySlot` per supportare il campo `portions`
  - Creare interfaccia `IConsumableItem` con `portionsPerUnit` e `portionEffect`
  - Progettare la logica per consumare porzioni invece di oggetti interi

  - Aggiornare la visualizzazione per mostrare sia quantità che porzioni
  - _Requirements: 6.1, 6.2, 6.3, 6.4_



- [x] 10. Implementazione Sistema Porzioni

  - Implementare la logica di consumo porzioni in `src/rules/mechanics.ts`
  - Aggiornare `GameProvider.tsx` per gestire il nuovo sistema
  - Modificare `useItem` per consumare porzioni invece di oggetti completi
  - Aggiornare i file JSON dei consumabili per includere informazioni sulle porzioni


  - Testare il sistema con medicine, bevande e cibo

  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 11. Test Completo Funzionamento Inventario
  - Testare tutti i controlli di navigazione (frecce, numeri)
  - Verificare il corretto utilizzo degli oggetti
  - Testare la persistenza dello stato dell'inventario
  - Controllare la gestione degli slot vuoti e pieni


  - Verificare l'integrazione con il sistema porzioni
  - Identificare e correggere eventuali bug
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 12. Progettazione Schermata Level Up
  - Creare il componente `LevelUpScreen.tsx` seguendo il pattern delle altre schermate
  - Progettare l'interfaccia per mostrare opzioni di avanzamento
  - Definire la logica per determinare quando il level up è disponibile
  - Progettare il sistema di punti attributo e nuove abilità
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13. Implementazione Tasto L e Schermata Level Up
  - Aggiungere la gestione del tasto L in `useKeyboardCommands.ts`
  - Implementare la navigazione verso la schermata level up
  - Creare la logica di avanzamento personaggio in `src/rules/`
  - Implementare l'interfaccia utente per la selezione degli upgrade
  - Aggiungere la navigazione di ritorno al gioco (ESC/L)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 14. Test di Integrazione e Validazione Finale
  - Eseguire test completi di tutte le nuove funzionalità
  - Verificare che non ci siano regressioni nelle funzionalità esistenti
  - Testare l'integrazione tra tutti i sistemi modificati
  - Validare l'esperienza utente complessiva
  - Ottimizzare le performance se necessario
  - _Requirements: 1.1, 2.5, 3.3, 5.4, 6.4, 7.4, 8.5_

- [ ] 15. Documentazione e Cleanup Finale
  - Aggiornare la documentazione con le nuove funzionalità implementate
  - Creare guide per l'utilizzo delle nuove features
  - Pulire il codice da commenti di debug e codice non utilizzato
  - Aggiornare i file README con le nuove funzionalità
  - Creare changelog dettagliato delle modifiche
  - _Requirements: Tutti i requirements_