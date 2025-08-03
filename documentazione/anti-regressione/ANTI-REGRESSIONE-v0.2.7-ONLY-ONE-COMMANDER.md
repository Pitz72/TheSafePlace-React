# Documento di Protezione Anti-Regressione v0.2.7
## Codename: Only One Commander

**Obiettivo:** Questo documento definisce lo stato stabile e funzionale del sistema di input e di gioco dopo il refactoring "Only One Commander". Le seguenti regole e comportamenti sono ora considerati **immutabili** e devono essere verificati dopo ogni modifica futura per prevenire regressioni.

---

### **Regola 1: Unico Comandante degli Input (Single Source of Truth)**

-   **Descrizione:** Tutta la logica che risponde direttamente alla pressione dei tasti della tastiera (`window.addEventListener('keydown', ...)` ) DEVE risiedere **esclusivamente** nell'hook `useKeyboardCommands.ts`. Nessun altro hook o componente deve registrare listener di tastiera globali per comandi di gioco.
-   **Test di Verifica:**
    1. Eseguire una ricerca globale (`grep`) per `addEventListener('keydown'` nel codebase.
    2. Il risultato DEVE mostrare solo un'istanza relativa alla logica di gioco, all'interno di `useKeyboardCommands.ts`.

### **Regola 2: Stabilità dell'Inizializzazione del Gioco**

-   **Descrizione:** L'inizializzazione del gioco (caricamento mappa, creazione personaggio) DEVE avvenire **una sola volta** al montaggio del `GameProvider`. Non deve mai essere rieseguita a seguito di azioni di gioco come il movimento.
-   **Test di Verifica:**
    1. Avviare il gioco e chiudere il popup di creazione del personaggio.
    2. Premere un tasto di movimento (es. 'W').
    3. **Comportamento Atteso:** Il personaggio si muove sulla mappa. La mappa NON deve ricaricarsi o resettarsi. Il log del diario NON deve mostrare di nuovo il messaggio "GAME_START".
    4. **Verifica Tecnica:** L'hook `useEffect` che chiama `initializeGame()` in `GameProvider.tsx` DEVE avere un array di dipendenze stabile (es. `[initializeGame]`, dove `initializeGame` è una funzione stabile creata con `useCallback` e senza dipendenze instabili).

### **Regola 3: Funzionalità del Sistema di Input Modale**

-   **Descrizione:** Il sistema di input deve rispettare lo stato modale del gioco. I comandi di gioco devono essere disabilitati quando un popup è attivo.
-   **Test di Verifica:**
    1. **Stato di Gioco (Mappa):**
        - `WASD`/Frecce: Muovono il personaggio.
        - `I`: Apre il popup dell'inventario.
        - `TAB`: Apre la scheda personaggio.
    2. **Stato Inventario (Popup Aperto):**
        - `WASD`/Frecce: Navigano la lista dell'inventario (Su/Giù). NON muovono il personaggio.
        - `I`/`ESC`: Chiudono il popup dell'inventario.
    3. **Stato Scheda Personaggio (Popup Aperto):**
        - `TAB`/`ESC`: Chiudono la scheda personaggio.
        - Altri tasti (es. `WASD`, `I`): NON devono avere alcun effetto.

### **Regola 4: Integrità dell'Inventario Iniziale**

-   **Descrizione:** Il personaggio DEVE iniziare la partita con l'inventario correttamente popolato.
-   **Test di Verifica:**
    1. Avviare una nuova partita.
    2. Aprire l'inventario premendo 'I'.
    3. **Comportamento Atteso:** L'inventario deve mostrare i seguenti oggetti (o equivalenti): 2x Acqua, 2x Cibo, 2x Bende, 1x Coltello, 1x Giubbotto di pelle. Gli slot rimanenti devono essere vuoti.

---

La violazione di una qualsiasi di queste regole dopo una modifica al codice indica una regressione critica che deve essere risolta prima di procedere.
