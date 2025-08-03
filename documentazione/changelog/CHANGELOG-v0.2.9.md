# Changelog v0.2.9 - "True Commander"

**Data di Rilascio:** 2025-07-31

Questa versione rappresenta il culmine del lavoro di refactoring architetturale, risolvendo bug di input persistenti e standardizzando ulteriormente l'interfaccia utente. Il nome "True Commander" riflette il successo nella centralizzazione di **tutti** gli input da tastiera in un unico, autorevole gestore.

## Correzioni Critiche (Bug Fixing)

-   **Risolto il Conflitto di Input tra Schermate:** È stato eliminato un bug critico per cui gli ascoltatori di eventi da tastiera di diverse schermate (es. Menu e Pagine Info) rimanevano attivi contemporaneamente, causando la necessità di premere i tasti più volte (es. `ESC` per tornare al menu) e bloccando gli input al ritorno alla schermata del menu.
-   **Paginazione Robusta:** La logica di calcolo delle pagine nelle schermate informative è stata resa più robusta per tenere conto correttamente di contenuti di altezza variabile (come la legenda), assicurando che il testo non vada mai fuori dal box.

## Miglioramenti Architetturali (Refactoring)

-   **Centralizzazione Totale degli Input ("True Commander"):** L'hook `useKeyboardCommands` è stato promosso a unico gestore di eventi da tastiera per l'intera applicazione. Ora gestisce gli input per il menu principale, le pagine informative e la schermata di gioco principale, utilizzando lo stato `currentScreen` per dirigere i comandi alla logica appropriata.
-   **Componenti UI "Puri":** I componenti come `StartScreen` e `PaginatedInfoPage` sono stati epurati da tutta la logica di gestione della tastiera, diventando componenti puramente presentazionali che ricevono il loro stato e le loro azioni dal `GameContext` centrale.

## Miglioramenti Stilistici

-   **Testo Pagine Info Ingrandito:** La dimensione del testo nelle pagine informative (`Storia`, `Istruzioni`) è stata ulteriormente aumentata a `text-5xl` per un maggiore impatto visivo e una migliore leggibilità.

## Risultato Finale

Il progetto ha ora un'architettura di gestione degli input estremamente solida, coerente e centralizzata, che previene conflitti e semplifica lo sviluppo futuro. L'esperienza utente nel navigare tra le varie schermate è ora fluida e priva di bug.
