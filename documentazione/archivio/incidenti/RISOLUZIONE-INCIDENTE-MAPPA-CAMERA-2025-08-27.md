# REPORT INCIDENTE: Risoluzione Bug Critico Mappa & Camera

**Data Incidente:** 2025-08-26
**Data Risoluzione:** 2025-08-27
**Stato:** RISOLTO

---

## 1. Descrizione dell'Incidente

A seguito di una serie di modifiche per la stabilizzazione del gioco, è stata introdotta una regressione critica che ha reso la mappa di gioco quasi completamente invisibile e ha bloccato la camera, impedendole di seguire il giocatore. Questo ha reso il gameplay impossibile.

## 2. Analisi della Causa Radice

L'analisi ha rivelato che il problema non era un bug di layout, ma un'anomalia di progettazione fondamentale nella gestione della camera, localizzata nel file `src/stores/gameStore.ts`.

La funzione `updateCameraPosition` utilizzava una logica "placeholder" (segnaposto), residuo della "Grande Refactorizzazione" (passaggio a Zustand). Questa funzione assegnava erroneamente le coordinate del giocatore basate su "tile" (griglia) alla variabile di stato della camera, che invece si aspetta coordinate in "pixel".

Questo singolo errore ha causato tutti i sintomi osservati:
-   La camera sembrava ferma perché i suoi spostamenti erano dell'ordine di 1 pixel invece che di un intero tile.
-   La visuale della mappa era "inchiodata" all'angolo in alto a sinistra.
-   Il giocatore appariva disallineato e non centrato.

## 3. Strategia di Risoluzione

Grazie alla eccellente documentazione di progetto, è stato possibile recuperare la logica di calcolo originale dal file `documentazione/roadmap/archivio/ROADMAP-CAMERA-DINAMICA-SISTEMA-TEMPO-v0.1.4.md`.

La strategia di risoluzione è consistita nel:
1.  Identificare la funzione placeholder `updateCameraPosition` come causa del problema.
2.  Sostituire la logica errata con l'algoritmo corretto recuperato dalla documentazione, che gestisce correttamente la conversione da coordinate "tile" a "pixel" e il "clamping" della camera ai bordi della mappa.

## 4. Esito

**Successo Totale.** L'implementazione della logica corretta ha risolto il bug alla radice. La camera ora segue il giocatore in modo fluido e corretto, e la mappa viene visualizzata come previsto, riempiendo il suo contenitore.

L'incidente è da considerarsi chiuso.