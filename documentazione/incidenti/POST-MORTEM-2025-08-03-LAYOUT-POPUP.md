# Post-Mortem Incidente: Visibilità dei Popup
**Data:** 2025-08-03
**Autori:** Operatore, LLM Assistant
**Versione di Riferimento:** v0.3.0 (branch `refactor-popup-layout`)

---

### 1. Riepilogo dell'Incidente

Nel tentativo di risolvere un problema di layout per cui i popup (`CharacterCreationPopup`, `CharacterSheetPopup`) erano vincolati all'interno del contenitore di gioco, è stata intrapresa una serie di modifiche architetturali. Sebbene la prima modifica (spostare i popup al di fuori del contenitore nel DOM virtuale di React) fosse tecnicamente corretta, ha prodotto un bug critico: i popup sono diventati invisibili, pur rimanendo attivi e bloccando l'input dell'utente.

I successivi tentativi di correzione, basati su aggiustamenti dello `z-index` e su un refactoring più drastico che convertiva i popup in schermate intere, non hanno risolto il problema di fondo e hanno introdotto complessità e instabilità.

La sessione si è conclusa con un ripristino dello stato del codice al momento subito dopo la prima modifica architetturale, lasciando il bug dei popup invisibili da risolvere.

### 2. Analisi della Causa Radice (Root Cause Analysis)

L'analisi approfondita, che ha incluso una ricerca sulla documentazione web (MDN), ha identificato la causa esatta del problema.

*   **Causa Principale:** **Creazione di un Contesto di Impilamento (Stacking Context) da parte del contenitore di gioco.**
    *   Il `div` con la classe `.game-container` nel file `index.css` utilizza la proprietà `transform: scale(...)`.
    *   Secondo le specifiche ufficiali del W3C, qualsiasi valore di `transform` diverso da `none` forza un elemento a creare un proprio "stacking context".
    *   Questo significa che nessun figlio di quell'elemento, indipendentemente dal suo `z-index`, può essere renderizzato "sopra" un elemento che si trova al di fuori di quel contesto, se il contesto stesso ha un ordine di impilamento inferiore.

*   **Perché le soluzioni sono fallite:**
    1.  **Spostare i Popup:** La prima modifica ha spostato i popup fuori dal `.game-container`, ma sono rimasti "fratelli" del `.game-container-wrapper`. Quest'ultimo, avendo `position: relative`, crea anch'esso un contesto di impilamento, che in qualche modo veniva renderizzato sopra i popup.
    2.  **Modificare `z-index`:** Aumentare lo `z-index` dei popup non ha funzionato perché il loro `z-index` era relativo al contesto `<body>`, mentre lo `z-index` (o l'ordine di default) del `.game-container-wrapper` era anch'esso relativo al `<body>`. Il browser, per ragioni complesse di rendering, dava comunque priorità al wrapper del gioco.
    3.  **Conversione in Schermate:** Questo approccio avrebbe risolto il problema, ma ha incontrato un blocco tecnico dovuto a un malfunzionamento degli strumenti dell'LLM Assistant, che ha impedito di modificare i file in modo affidabile.

### 3. Cronologia delle Azioni

1.  **Obiettivo Iniziale:** Svincolare i popup dal layout del gioco per centrarli a schermo.
2.  **Azione 1:** Spostamento dei componenti Popup in `App.tsx` per renderizzarli al di fuori del `.game-container`.
3.  **Risultato 1:** **FALLIMENTO.** I popup diventano invisibili ma continuano a bloccare l'input.
4.  **Azione 2:** Tentativo di forzare la visibilità con `z-index` più alti sui popup e `z-index` più basso sul wrapper del gioco.
5.  **Risultato 2:** **FALLIMENTO.** La situazione rimane invariata.
6.  **Azione 3 (Proposta dall'Operatore):** Conversione dei popup in schermate intere.
7.  **Risultato 3:** **FALLIMENTO TECNICO.** L'LLM Assistant non è stato in grado di modificare i file necessari a causa di errori persistenti dei suoi strumenti.
8.  **Azione Finale:** Ripristino del codice allo stato del "Risultato 1" per avere una base di partenza pulita per la prossima sessione.

### 4. Lezioni Apprese (Lessons Learned)

1.  **Lo Stacking Context è la Chiave:** Il problema non era un semplice bug, ma una caratteristica fondamentale e complessa del rendering CSS. La proprietà `transform` ha effetti collaterali potenti che vanno oltre la semplice trasformazione visiva.
2.  **Fermarsi Dopo un Fallimento:** L'insistenza nel provare soluzioni basate su `z-index` senza aver compreso appieno la causa radice è stata inefficiente. La decisione dell'Operatore di fermarsi e richiedere un'analisi più profonda è stata la svolta corretta.
3.  **La Soluzione Corretta Esiste:** La ricerca ha rivelato che esiste una soluzione standard in React per questo esatto problema: i **React Portals**. Questa soluzione, che "teletrasporta" un componente in un altro punto del DOM, è progettata specificamente per evadere dai contesti di impilamento e `overflow` problematici.
4.  **Affidabilità degli Strumenti:** L'LLM Assistant deve monitorare e segnalare immediatamente quando i suoi strumenti interni non funzionano in modo affidabile, come accaduto durante il tentativo di conversione in schermate.

### 5. Prossimi Passi Raccomandati

Per la prossima sessione di sviluppo, si raccomanda di implementare la soluzione basata sui **React Portals** come descritto nella relazione tecnica precedente. È la soluzione con la più alta probabilità di successo e il rischio di regressione più basso.
