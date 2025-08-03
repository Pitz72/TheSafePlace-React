# Documento di Protezione Anti-Regressione v0.2.9
## Codename: True Commander

**Obiettivo:** Questo documento cristallizza l'architettura di input centralizzata, che è la soluzione definitiva ai conflitti di stato e agli input bloccati. Questa architettura è ora una regola fondamentale del progetto.

---

### **Regola 1: Esclusività del "True Commander"**

-   **Descrizione:** L'hook `useKeyboardCommands.ts` è e DEVE rimanere l'**UNICO** file nell'intera applicazione che implementa `window.addEventListener('keydown', ...)` per la logica dell'interfaccia. Qualsiasi altro componente o hook che tenti di registrare un proprio listener di tastiera globale è una violazione diretta di questa architettura.
-   **Test di Verifica:**
    1. Eseguire una ricerca globale (`grep`) per `addEventListener('keydown'` nel codebase.
    2. Il risultato DEVE restituire **una sola istanza** all'interno di `useKeyboardCommands.ts`. Qualsiasi altro risultato è una regressione critica.

### **Regola 2: Gestione degli Input basata sullo Stato dello Schermo**

-   **Descrizione:** La funzione `handleKeyDown` all'interno di `useKeyboardCommands.ts` DEVE utilizzare una struttura a `switch` (o equivalente) basata sullo stato `currentScreen` (proveniente dal `GameContext`) come suo primo livello di diramazione logica. Questo assicura che solo i comandi pertinenti alla schermata visualizzata siano attivi.
-   **Test di Verifica:**
    1. Aprire `useKeyboardCommands.ts`.
    2. La funzione `handleKeyDown` deve avere una struttura del tipo: `switch (currentScreen) { case 'menu': ...; case 'game': ...; case 'story': ...; }`.
    3. **Test Funzionale:**
        - Nel menu principale, i tasti di movimento (`WASD`) NON devono avere effetto.
        - Nella schermata di gioco, i tasti di selezione del menu (`Enter`) NON devono avere effetto.
        - In una pagina info, i comandi di gioco (`I` per inventario) NON devono avere effetto.

### **Regola 3: Transizione di Input Fluida e Senza Conflitti**

-   **Descrizione:** Il passaggio da una schermata all'altra (es. da "Storia" a "Menu") deve comportare una transizione pulita del controllo degli input. Non ci devono essere input "fantasma" o la necessità di pressioni multiple dei tasti.
-   **Test di Verifica:**
    1. Dal menu principale, premere `T` per andare alla schermata "Storia".
    2. Premere `ESC` **una sola volta**.
    3. **Comportamento Atteso:** Si deve tornare immediatamente al menu principale.
    4. Immediatamente dopo essere tornati al menu, premere Freccia Giù.
    5. **Comportamento Atteso:** La selezione nel menu deve spostarsi alla voce successiva alla prima pressione. Non devono esserci ritardi o input ignorati.

### **Regola 4: Paginazione Robusta e Dinamica**

-   **Descrizione:** Il componente `PaginatedInfoPage` deve calcolare correttamente il numero di pagine necessarie anche in presenza di contenuti complessi (es. la legenda delle istruzioni).
-   **Test di Verifica:**
    1. Accedere alla schermata "Istruzioni".
    2. **Comportamento Atteso:** Il testo, inclusa la legenda, deve essere correttamente suddiviso in pagine senza che nessun contenuto fuoriesca dal box visibile. L'indicatore "Pagina X di Y" deve mostrare un numero di pagine `Y` > 1.

---

Queste regole definiscono la stabilità architetturale raggiunta. Qualsiasi modifica futura deve rispettarle per garantire che i bug di input e di stato non si ripresentino.
