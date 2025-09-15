# Documento di Anti-Regressione v0.3.5
## The Survival Game

**Obiettivo:** Prevenire la reintroduzione del bug critico di re-inizializzazione del gioco e garantire la stabilità dell'architettura di gestione dello stato.

---

### Descrizione del Bug Originale (v0.3.4-dev)

- **Sintomi:**
  1.  Dopo la creazione del personaggio, il gioco si riavviava ad ogni mossa del giocatore.
  2.  I log di gioco (es. "GAME_START") venivano duplicati all'infinito nel diario.
  3.  Il layout della mappa si rompeva, espandendosi verso il basso e spingendo via gli altri elementi dell'interfaccia.
- **Causa Radice:**
  - Una catena di dipendenze instabili all'interno del `GameProvider`.
  - La funzione `addLogEntry` dipendeva da `timeState.currentTime`.
  - La funzione `initializeGame` dipendeva da `addLogEntry`.
  - Ogni mossa del giocatore aggiornava `timeState`, causando la ricreazione di `addLogEntry`, che a sua volta ricreava `initializeGame`.
  - Un `useEffect` in `App.tsx` (e un altro in `GameProvider.tsx`), dipendendo da `initializeGame`, veniva eseguito di nuovo, creando un loop infinito.
  - La presenza di due chiamate a `initializeGame` (una in `GameProvider` e una in `App`) aggravava il problema.

---

### Soluzione Implementata (v0.3.5)

1.  **Stabilizzazione delle Dipendenze:**
    - In `GameProvider.tsx`, la dipendenza di `addLogEntry` da `timeState.currentTime` è stata rimossa. Ora, la funzione accede al valore corrente del tempo tramite un `useRef` (`timeStateRef`), che non causa la ricreazione del `useCallback`.
    - Questo ha reso stabile la funzione `addLogEntry` e, di conseguenza, anche `initializeGame`.
2.  **Centralizzazione dell'Inizializzazione:**
    - La chiamata `useEffect` a `initializeGame` all'interno di `App.tsx` è stata rimossa.
    - L'unica chiamata a `initializeGame` ora risiede in un `useEffect` all'interno di `GameProvider.tsx`, garantendo che venga eseguita una sola volta al montaggio del provider.

---

### Checklist di Prevenzione per Sviluppatori Futuri

Prima di modificare `GameProvider.tsx` o la logica di inizializzazione, verificare i seguenti punti:

- **[ ] `useCallback` e Dipendenze:**
  - **Non aggiungere dipendenze volatili** (che cambiano ad ogni render) ai `useCallback` di funzioni critiche come `addLogEntry`, `initializeGame`, `updatePlayerPosition`.
  - Se una funzione necessita di un valore di stato che cambia spesso (es. `timeState`), **usare un `useRef`** per accedervi senza creare una dipendenza di rendering.
  - **Analizzare sempre la catena di dipendenze.** Se `A` dipende da `B` e `B` dipende da `C`, un'instabilità in `C` si propaga fino ad `A`.

- **[ ] Logica di Inizializzazione:**
  - **NON aggiungere nuove chiamate** a `initializeGame` in altri componenti. L'inizializzazione deve rimanere centralizzata in `GameProvider.tsx`.
  - Se nuovi dati devono essere caricati all'avvio, aggiungerli all'interno della funzione `initializeGame` esistente.

- **[ ] Test Manuale Obbligatorio:**
  - Dopo qualsiasi modifica a `GameProvider.tsx` o ai file correlati (`App.tsx`, `usePlayerMovement.ts`):
    1.  Avviare una nuova partita.
    2.  Completare la creazione del personaggio.
    3.  **Muoversi sulla mappa per almeno 10 passi.**
    4.  **Verificare che il log non mostri messaggi duplicati di "GAME_START".**
    5.  **Verificare che il layout della mappa e del diario rimanga stabile.**
    6.  Aprire la console del browser e assicurarsi che non ci siano errori o warning relativi a loop infiniti o aggiornamenti di stato eccessivi.

---

**Esito:** Il rispetto di queste regole è fondamentale per mantenere la stabilità del gioco. Qualsiasi deviazione deve essere giustificata e testata approfonditamente. Versione 0.3.5 considerata stabile e punto di riferimento per la gestione dello stato.
