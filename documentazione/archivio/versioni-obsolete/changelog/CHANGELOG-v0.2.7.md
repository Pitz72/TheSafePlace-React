# Changelog v0.2.7 - "Only One Commander"

**Data di Rilascio:** 2025-07-31

Questa versione rappresenta un importante passo di consolidamento e stabilizzazione. Introduce il concetto di "Only One Commander", un refactoring architetturale che centralizza tutta la gestione degli input da tastiera in un unico "comandante" logico, eliminando conflitti e bug di stato.

## Correzioni Critiche (Bug Fixing)

-   **Risolto il Loop di Ricaricamento della Mappa:** Corretto un bug critico che causava la reinizializzazione completa del gioco a ogni movimento del giocatore. Il problema era dovuto a una catena di dipendenze instabili negli hooks di React, che è stata interrotta stabilizzando le funzioni nel `GameProvider`.
-   **Risolto il Blocco degli Input:** Corretto un bug successivo per cui tutti gli input di gioco venivano bloccati dopo la chiusura del popup di creazione del personaggio. La logica di gestione degli input è stata riscritta per gestire correttamente gli stati modali (es. inventario, scheda personaggio).
-   **Corretta l'Integrazione dell'Inventario:** Risolto il problema per cui il popup dell'inventario non appariva. Il componente è stato correttamente integrato nell'albero di rendering e la logica di stato nel `GameContext` è stata riparata.
-   **Corretto il Posizionamento del Popup Inventario:** Il popup dell'inventario ora appare correttamente al centro dello schermo invece che in alto a sinistra.
-   **Popolato l'Inventario Iniziale:** Il personaggio ora inizia il gioco con un set di oggetti di base (cibo, acqua, bende, arma, armatura), come previsto. Sono stati aggiunti gli item mancanti al database e la funzione di creazione del personaggio è stata aggiornata.

## Miglioramenti Architetturali (Refactoring)

-   **Centralizzazione degli Input ("Only One Commander"):** Tutta la logica di gestione della tastiera è stata unificata nell'hook `useKeyboardCommands`. L'hook `usePlayerMovement` è stato eliminato, e la sua logica più dettagliata è stata fusa nel comandante centrale. Questo rende il sistema di input più robusto, manutenibile e meno soggetto a conflitti.
-   **Semplificazione della Gestione dello Stato:** Lo stato globale è stato ripulito rimuovendo stati ridondanti (es. `lastBiome`) e la gestione della "pausa" di gioco è stata resa più esplicita e meno soggetta a errori.
-   **Consolidamento delle Regole di Gioco:** La logica delle meccaniche di gioco è stata resa più coerente spostando funzioni di calcolo (come `calculateMaxHP`, `calculateBaseAC`) nel file `mechanics.ts`, che ora agisce come una libreria di regole più completa.

## Miglioramenti all'Esperienza Utente

-   **Fluidità del Menu Principale:** Come effetto collaterale positivo del refactoring degli input, la navigazione nel menu di avvio è ora più fluida e reattiva.
