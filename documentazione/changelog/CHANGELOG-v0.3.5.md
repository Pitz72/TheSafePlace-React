# Changelog - The Safe Place v0.3.5
## The Survival Game

**Data di Rilascio:** 2025-08-12

Questa versione è un aggiornamento critico di stabilità che risolve un bug maggiore che causava l'instabilità del gioco e ne migliora l'architettura di base per prevenire problemi futuri.

---

### Fixed
- **Corretto loop di re-inizializzazione del gioco:** Risolto un bug critico che causava la re-inizializzazione completa dello stato del gioco ad ogni passo del giocatore. Questo eliminava i seguenti problemi:
  - Log di gioco duplicati all'infinito.
  - La mappa che si espandeva verso il basso, spingendo via il diario di gioco.
  - Instabilità generale e potenziale crash dell'applicazione.
- **Causa del Bug:** Il problema era causato da una catena di dipendenze instabili in `GameProvider.tsx`, dove un aggiornamento dello stato del tempo di gioco (`timeState`) causava la ricreazione della funzione `addLogEntry`, che a sua volta causava la ricreazione della funzione `initializeGame`, innescando un loop infinito.

### Technical
- **Stabilizzazione delle Dipendenze in `GameProvider`:** La funzione `addLogEntry` è stata refattorizzata per utilizzare un `useRef` per accedere allo stato del tempo (`timeState`), rompendo la catena di dipendenze e rendendo stabili sia `addLogEntry` che `initializeGame`.
- **Centralizzazione della Logica di Inizializzazione:** È stata rimossa una chiamata `useEffect` ridondante a `initializeGame` dal componente `App.tsx`. La logica di inizializzazione è ora gestita unicamente e in modo pulito dal `GameProvider` al suo montaggio, prevenendo doppie inizializzazioni e migliorando la robustezza dell'architettura.

### Docs
- **Aggiornamento Documentazione:** Aggiornati `README.md`, `CHANGELOG.md` (indice), e `index-release.md` per riflettere la nuova versione v0.3.5.
- **Creato documento di Anti-Regressione:** Creato un nuovo documento `ANTI-REGRESSIONE-v0.3.5-THE-SURVIVAL-GAME.md` per documentare il bug e le procedure di test per evitare che si ripresenti.
