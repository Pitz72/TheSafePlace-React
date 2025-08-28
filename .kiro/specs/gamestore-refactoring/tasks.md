# Implementation Plan - GameStore Refactoring

- [ ] 1. Setup base infrastructure e struttura store
  - Creare la struttura directory `src/stores/` con sottocartelle per ogni store specializzato
  - Definire interfacce TypeScript base per tutti gli store (CharacterState, InventoryState, etc.)
  - Creare file template vuoti per tutti gli 8 store specializzati
  - Configurare sistema di import/export per mantenere compatibilità
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Implementare UIStore (più semplice per iniziare)
  - Creare `src/stores/ui/uiStore.ts` con gestione currentScreen, notifications, menu state
  - Migrare logica navigazione schermate dal GameStore monolitico
  - Implementare azioni setCurrentScreen, goBack, addNotification, removeNotification
  - Aggiungere selettori per getCurrentScreen, getNotifications
  - Scrivere test unitari per UIStore
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 3. Creare facade GameStore iniziale
  - Implementare `src/stores/gameStore.ts` come facade che delega a UIStore
  - Mantenere API esistente per currentScreen, notifications, setCurrentScreen
  - Implementare pattern delegation per azioni UI
  - Testare che componenti esistenti continuino a funzionare
  - Verificare che non ci siano breaking changes
  - _Requirements: 11.1, 11.2, 2.1, 2.2_

- [ ] 4. Implementare CharacterStore
  - Creare `src/stores/character/characterStore.ts` con gestione characterSheet completa
  - Migrare logica HP, XP, livello, stats dal GameStore
  - Implementare azioni updateHP, addExperience, levelUp, performAbilityCheck
  - Aggiungere gestione equipaggiamento (equipItem, unequipItem)
  - Scrivere test unitari per tutte le funzionalità character
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Aggiornare facade per CharacterStore
  - Integrare CharacterStore nel facade GameStore
  - Implementare delegation per tutte le azioni character (updateHP, addExperience, etc.)
  - Mantenere compatibilità API per characterSheet, getCurrentHP, getLevel
  - Testare skill checks e sistema equipaggiamento
  - Verificare che level up e progressione funzionino correttamente
  - _Requirements: 11.1, 11.2, 2.1, 2.2, 2.3_

- [ ] 6. Implementare InventoryStore
  - Creare `src/stores/inventory/inventoryStore.ts` con gestione items e inventory
  - Migrare database oggetti e logica addItem/removeItem dal GameStore
  - Implementare azioni useItem, getAvailableActions, canAddItem
  - Aggiungere validazione oggetti e gestione stackable items
  - Scrivere test unitari per tutte le operazioni inventario
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Aggiornare facade per InventoryStore
  - Integrare InventoryStore nel facade GameStore
  - Implementare delegation per items, addItem, removeItem, useItem
  - Coordinare con CharacterStore per equipaggiamento
  - Testare che tutte le operazioni inventario funzionino
  - Verificare compatibilità con componenti InventoryScreen
  - _Requirements: 11.1, 11.2, 2.1, 2.2, 4.3_

- [ ] 8. Implementare WorldStore
  - Creare `src/stores/world/worldStore.ts` con gestione mappa e posizione
  - Migrare mapData, playerPosition, currentBiome, cameraPosition dal GameStore
  - Implementare azioni updatePlayerPosition, updateCameraPosition
  - Aggiungere selettori getBiomeKeyFromChar, isValidPosition
  - Scrivere test unitari per movimento e navigazione
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Aggiornare facade per WorldStore
  - Integrare WorldStore nel facade GameStore
  - Implementare delegation per mapData, playerPosition, updatePlayerPosition
  - Coordinare movimento con altri store (consumo risorse, trigger eventi)
  - Testare che MapViewport e movimento funzionino correttamente
  - Verificare che camera tracking funzioni
  - _Requirements: 11.1, 11.2, 2.1, 2.2, 5.1_

- [ ] 10. Implementare WeatherStore
  - Creare `src/stores/weather/weatherStore.ts` con sistema meteo completo
  - Migrare weatherState, pattern meteo, modificatori temporali dal GameStore
  - Implementare azioni updateWeather, generateWeatherChange
  - Aggiungere selettori getWeatherEffects, applyWeatherEffects
  - Scrivere test unitari per transizioni meteo e effetti
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Aggiornare facade per WeatherStore
  - Integrare WeatherStore nel facade GameStore
  - Implementare delegation per weatherState, updateWeather
  - Coordinare effetti meteo con movimento e sopravvivenza
  - Testare che sistema meteo funzioni con modificatori temporali
  - Verificare che effetti meteo si applichino correttamente
  - _Requirements: 11.1, 11.2, 2.1, 2.2, 6.1_

- [ ] 12. Implementare EventStore
  - Creare `src/stores/events/eventStore.ts` con sistema eventi dinamici
  - Migrare eventDatabase, currentEvent, seenEventIds dal GameStore
  - Implementare azioni triggerEvent, resolveChoice, clearCurrentEvent
  - Aggiungere selettori getEventsForBiome, hasSeenEvent
  - Scrivere test unitari per trigger e risoluzione eventi
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13. Aggiornare facade per EventStore
  - Integrare EventStore nel facade GameStore
  - Implementare delegation per currentEvent, triggerEvent, resolveChoice
  - Coordinare trigger eventi con movimento e biomi
  - Testare che EventScreen e sistema eventi funzionino
  - Verificare che ricompense eventi si applichino correttamente
  - _Requirements: 11.1, 11.2, 2.1, 2.2, 7.1_

- [ ] 14. Implementare ShelterStore
  - Creare `src/stores/shelter/shelterStore.ts` con sistema rifugi e sopravvivenza
  - Migrare shelterAccessState, survivalState, consumo notturno dal GameStore
  - Implementare azioni updateShelterAccess, handleNightConsumption
  - Aggiungere selettori canInvestigateShelter, getShelterInfo
  - Scrivere test unitari per investigazioni rifugi e sopravvivenza
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 15. Aggiornare facade per ShelterStore
  - Integrare ShelterStore nel facade GameStore
  - Implementare delegation per shelterAccessState, survivalState
  - Coordinare consumo risorse con movimento e tempo
  - Testare che ShelterScreen e investigazioni funzionino
  - Verificare che consumo notturno si applichi correttamente
  - _Requirements: 11.1, 11.2, 2.1, 2.2, 8.1_

- [ ] 16. Implementare SaveStore
  - Creare `src/stores/save/saveStore.ts` con sistema salvataggio completo
  - Migrare tutte le operazioni save/load dal GameStore
  - Implementare coordinamento con tutti gli store per raccogliere/distribuire dati
  - Aggiungere azioni saveCurrentGame, loadSavedGame, exportSave, importSave
  - Scrivere test unitari per tutte le operazioni salvataggio
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 17. Aggiornare facade per SaveStore
  - Integrare SaveStore nel facade GameStore
  - Implementare delegation per saveCurrentGame, loadSavedGame
  - Coordinare salvataggio/caricamento con tutti gli store
  - Testare che LoadScreen e operazioni save/load funzionino
  - Verificare che export/import mantengano compatibilità
  - _Requirements: 11.1, 11.2, 2.1, 2.2, 10.1_

- [ ] 18. Implementare inizializzazione coordinata
  - Aggiornare initializeGame nel facade per coordinare tutti gli store
  - Implementare sequenza inizializzazione (mappa -> eventi -> character -> etc.)
  - Aggiungere gestione errori e recovery per inizializzazione
  - Coordinare reset stato tra tutti gli store
  - Testare che nuovo gioco si inizializzi correttamente
  - _Requirements: 11.3, 12.1, 12.2, 12.3_

- [ ] 19. Testing completo e validazione compatibilità
  - Eseguire tutti i test esistenti per verificare compatibilità
  - Scrivere test integrazione per coordinamento tra store
  - Testare tutti i flussi di gioco principali (movimento, eventi, rifugi, save/load)
  - Verificare che performance siano uguali o migliori
  - Eseguire test regressione completo
  - _Requirements: 1.4, 2.1, 2.2, 2.3, 12.3, 12.5_

- [ ] 20. Cleanup e ottimizzazione finale
  - Rimuovere codice GameStore monolitico originale
  - Ottimizzare comunicazione tra store per performance
  - Aggiungere documentazione JSDoc per tutti gli store
  - Implementare logging e debugging per store coordination
  - Verificare che tutti i file siano <300 linee come richiesto
  - _Requirements: 1.1, 1.2, 11.4, 11.5, 12.4_

- [ ] 21. Preparazione per nuovi sistemi
  - Verificare che architettura sia pronta per Crafting e Combat store
  - Documentare pattern per aggiungere nuovi store
  - Creare template per store futuri
  - Testare che aggiunta nuovi store non impatti GameStore facade
  - Validare che architettura sia scalabile per crescita futura
  - _Requirements: 11.5, 1.3, 1.5_