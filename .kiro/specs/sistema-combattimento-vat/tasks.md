# Implementation Plan - Sistema di Combattimento V.A.T.

- [ ] 1. Setup base infrastructure e tipi TypeScript
  - Creare i tipi TypeScript per CombatState, PlayerCombatState, EnemyCombatState e tutte le interfacce
  - Definire tipi per azioni combattimento (CombatAction, ActionResult, DiceRoll)
  - Creare la struttura directory `src/components/combat/`
  - Definire costanti e configurazioni base del sistema combattimento
  - _Requirements: 12.1, 12.2_

- [ ] 2. Implementare utility per calcoli D&D e meccaniche base
  - Creare `combatCalculations.ts` con funzioni per tiro per colpire (d20 + modificatori vs AC)
  - Implementare calcolo danno con parsing dadi (es. "1d6", "2d4+1")
  - Aggiungere funzioni per skill check fuga (Agilità vs Inseguimento)
  - Implementare calcolo AC dinamico (10 + Agilità + Bonus Armatura)
  - Scrivere test unitari per tutti i calcoli D&D
  - _Requirements: 6.2, 6.3, 9.1, 9.2, 12.1_

- [ ] 3. Creare database nemici e sistema caricamento
  - Creare il file `src/data/enemies.json` con nemici di esempio (cane selvatico, bandito, orso)
  - Implementare utility per caricamento e validazione dati nemici
  - Creare funzioni per generazione stato combattimento nemici da template
  - Aggiungere sistema descrizioni qualitative vita (Illeso -> Ferito -> Gravemente Ferito -> Morente)
  - _Requirements: 3.2, 10.1_

- [ ] 4. Implementare Zustand store per gestione stato combattimento
  - Creare `combatStore.ts` con stato base (isActive, currentState, selectedAction, selectedTarget)
  - Implementare azioni per inizializzazione e terminazione combattimento
  - Aggiungere azioni per selezione azioni giocatore e bersagli
  - Implementare selettori per validazione azioni e calcoli derivati
  - Scrivere test unitari per tutte le azioni e selettori dello store
  - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [ ] 5. Creare componente CombatLog per visualizzazione trasparente
  - Implementare `CombatLog.tsx` con rendering cronologico azioni
  - Aggiungere formattazione colorata per diversi tipi messaggio (successo, fallimento, danno)
  - Implementare visualizzazione calcoli trasparenti (tiri, modificatori, risultati)
  - Aggiungere auto-scroll e gestione lunghezza massima log
  - Scrivere test per rendering e formattazione messaggi
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Sviluppare componenti per visualizzazione stato combattimento
  - Creare `PlayerStatus.tsx` con HP, arma, armatura e bonus temporanei
  - Implementare `EnemyStatus.tsx` con stato qualitativo vita e indicatori bersaglio
  - Creare `CombatStatus.tsx` come container per layout a due colonne
  - Aggiungere aggiornamenti dinamici stato su cambiamenti
  - Scrivere test per rendering e aggiornamenti stato
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Implementare ActionMenu per selezione azioni giocatore
  - Creare `ActionMenu.tsx` con le 4 azioni principali (Attacca, Inventario, Difesa, Fuggi)
  - Implementare navigazione con W/S e selezione con Invio
  - Aggiungere indicatori visivi per disponibilità azioni
  - Implementare logica abilitazione/disabilitazione azioni basata su stato
  - Scrivere test per navigazione e gestione selezione
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Creare TargetSelector per selezione bersagli multipli
  - Implementare `TargetSelector.tsx` per selezione nemici quando si attacca
  - Aggiungere navigazione tra nemici con indicatori visivi
  - Implementare visualizzazione informazioni bersaglio selezionato
  - Aggiungere gestione cancellazione selezione (ESC)
  - Scrivere test per selezione e navigazione bersagli
  - _Requirements: 6.1_

- [ ] 9. Implementare SceneDescription per narrativa dinamica
  - Creare `SceneDescription.tsx` con descrizione iniziale combattimento
  - Implementare aggiornamento descrizione basato su azioni significative
  - Aggiungere sistema template per descrizioni dinamiche
  - Implementare mantenimento coerenza narrativa con stato combattimento
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Sviluppare logica azioni giocatore
  - Implementare azione Attacca con selezione bersaglio, calcolo tiro per colpire e danno
  - Creare azione Inventario con filtro oggetti utilizzabili e applicazione effetti
  - Implementare azione Difesa con bonus AC temporaneo (+4 per un turno)
  - Aggiungere azione Fuggi con skill check Agilità vs Inseguimento nemici
  - Scrivere test unitari per tutte le azioni e i loro effetti
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 11. Implementare AI nemici e logica turni
  - Creare `enemyAI.ts` con logica selezione azioni nemici (attacco semplice)
  - Implementare esecuzione turni nemici in sequenza
  - Aggiungere calcoli attacco nemici contro AC giocatore
  - Implementare applicazione danno e aggiornamento HP giocatore
  - Scrivere test per comportamento AI e calcoli attacco
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 12. Creare componente principale CombatScreen
  - Implementare `CombatScreen.tsx` come orchestratore principale
  - Integrare tutti i sotto-componenti (SceneDescription, CombatStatus, CombatLog, ActionMenu)
  - Implementare gestione turni (giocatore -> nemici -> giocatore)
  - Aggiungere gestione input tastiera globali e coordinamento stato
  - Implementare transizioni fluide tra fasi combattimento
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 13. Implementare condizioni terminazione combattimento
  - Aggiungere logica rilevamento vittoria (tutti nemici sconfitti)
  - Implementare assegnazione XP bonus per vittoria
  - Creare logica rilevamento sconfitta (HP giocatore a 0)
  - Implementare transizioni verso GameScreen (vittoria) o GameOverScreen (sconfitta)
  - Scrivere test per tutte le condizioni di terminazione
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 14. Integrare combattimento con sistema eventi dinamici
  - Modificare motore eventi dinamici per trigger combattimenti
  - Implementare creazione CombatEncounter da eventi scontro
  - Aggiungere transizione automatica da GameScreen a CombatScreen
  - Implementare ritorno a GameScreen dopo combattimento con ripristino tempo
  - Scrivere test integrazione per flusso completo evento->combattimento->ritorno
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 15. Implementare integrazione con sistemi esistenti
  - Integrare con characterSheet per statistiche giocatore (HP, stats, equipaggiamento)
  - Aggiungere integrazione con sistema inventario per uso oggetti in combattimento
  - Implementare integrazione con sistema XP per ricompense vittoria
  - Aggiungere integrazione con GameJournal per logging eventi combattimento
  - Scrivere test per tutte le integrazioni con sistemi esistenti
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 16. Testing completo e ottimizzazioni performance
  - Scrivere test integrazione per flusso combattimento completo
  - Implementare test E2E per scenari combattimento (1 nemico, multipli nemici, fuga, sconfitta)
  - Aggiungere ottimizzazioni performance (memoizzazione, batch updates)
  - Implementare cleanup risorse e gestione memoria
  - Eseguire testing accessibilità tastiera per tutti i componenti
  - _Requirements: tutti i requirements_

- [ ] 17. Documentazione e finalizzazione
  - Creare documentazione tecnica per sviluppatori
  - Aggiungere commenti JSDoc per tutte le funzioni pubbliche
  - Creare guida utente per meccaniche combattimento
  - Implementare logging e metriche per monitoraggio utilizzo
  - Preparare nemici aggiuntivi e incontri per espansioni future