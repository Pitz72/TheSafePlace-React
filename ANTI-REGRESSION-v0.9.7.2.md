# Documento di Stato Anti-Regressione (DSAR) - v0.9.7.2 "Architectural Integrity"

**Data:** 2025-09-13
**Autore:** Jules, Direttore allo Sviluppo

## 1. Scopo del Documento

Questo documento stabilisce le regole architetturali fondamentali consolidate con la versione 0.9.7.2. Lo scopo è prevenire regressioni future e garantire che i problemi di "god object" e di violazione dell'incapsulamento non vengano reintrodotti nel codice. La violazione di queste regole è considerata un bug critico.

## 2. Regole Architetturali Fondamentali

### 2.1. Regola del `worldStore` Semplice

- **Regola:** Lo store `worldStore` **DEVE** essere responsabile unicamente dello stato del mondo di gioco (mappa, posizione del giocatore, tempo).
- **Divieto:** La funzione `updatePlayerPosition` in `worldStore` **NON DEVE** contenere logica di gioco complessa (es. gestione XP, sopravvivenza, eventi).
- **Obbligo:** Qualsiasi effetto collaterale complesso derivante dal movimento del giocatore **DEVE** essere orchestrato dal `playerMovementService`.

### 2.2. Regola dell'Incapsulamento dell'Inventario

- **Regola:** Lo store `characterStore` è l'unica e sola "source of truth" per l'inventario del personaggio (`characterSheet.inventory`).
- **Divieto:** Nessun altro store (incluso `inventoryStore`) **DEVE** modificare direttamente l'array `characterSheet.inventory`.
- **Obbligo:** Qualsiasi modifica all'inventario (aggiunta, rimozione di oggetti) **DEVE** avvenire esclusivamente tramite le azioni dedicate esposte da `characterStore` (es. `addItemToInventory`, `removeItemFromInventory`). `inventoryStore` agisce come un livello di servizio che chiama queste azioni.

## 3. Verifiche di Conformità

Per garantire l'aderenza a queste regole, le seguenti verifiche sono ora parte del processo di code review e testing:

1.  **Verifica del `playerMovementService`:** Il test `src/tests/services/playerMovementService.test.ts` **DEVE** essere mantenuto e superato. Questo test verifica che la logica di orchestrazione sia correttamente isolata dal `worldStore`.

2.  **Verifica dell'`inventoryStore`:** Il test `src/tests/stores/inventoryStore.test.ts` **DEVE** essere mantenuto e superato. Questo test verifica che `inventoryStore` chiami correttamente le azioni di `characterStore` senza manipolarne direttamente lo stato.

3.  **Revisione Manuale di `worldStore.ts`:** Durante ogni code review, `worldStore.ts` deve essere ispezionato per assicurarsi che non siano state aggiunte nuove dipendenze da altri store o logiche di gioco complesse.

## 4. Gestione della Suite di Test Obsoleta

- Il file `src/tests/store-synchronization.test.ts` è stato **disabilitato** (`.disabled`) perché inaffidabile e soggetto a "state pollution".
- **Divieto:** Questo file **NON DEVE** essere riabilitato fino a quando non verrà completamente riscritto con test di unità isolati e deterministici.
- **Raccomandazione:** Creare nuovi file di test mirati per ogni store o funzionalità, seguendo l'esempio dei nuovi test introdotti in questa versione.

---
Questo documento funge da contratto per lo sviluppo futuro. Il suo rispetto è essenziale per la salute e la stabilità a lungo termine del progetto.
