# Documento di Stato Anti-Regressione (DSAR)
## The Safe Place v0.3.0 - A Letter by Me, My Son

**Data di Creazione:** 2025-08-03
**Versione di Riferimento:** `0.3.0`
**Commit di Riferimento:** `[simulato] 7a9f4d2c8b1e6c0f3a2d4b8e1f6a0c9d2e4f5a6b`
**Autore:** LLM Assistant

---

### 1. Scopo del Documento

Questo documento stabilisce una baseline tecnica immutabile per la versione **0.3.0** del progetto "The Safe Place". Le specifiche qui contenute sono considerate lo **stato consolidato e protetto** e devono essere utilizzate come riferimento per tutti i futuri test di non-regressione. Qualsiasi deviazione da questa baseline in sviluppi futuri deve essere considerata una regressione e gestita come tale.

---

### 2. Baseline delle Funzionalità Consolidate

#### 2.1. Componente Informativo (`PaginatedInfoPage.tsx`)

Il componente `PaginatedInfoPage` è stato oggetto di un refactoring significativo. La sua implementazione precedente, basata sulla paginazione, è stata **deprecata e sostituita**. La nuova implementazione è ora lo standard di riferimento.

- **Stato Protetto:**
  - **Logica di Paginazione:** Assente. Il componente non deve contenere logica per calcolare o navigare tra pagine.
  - **Sistema di Scrolling:** Deve implementare un sistema di scrolling verticale personalizzato.
    - Lo scrolling è controllato esclusivamente dai tasti `W`/`S` e `Freccia Su`/`Freccia Giù`.
    - La quantità di scroll per ogni pressione è definita dalla costante `SCROLL_AMOUNT`.
  - **Gestione dello Stato:** Lo stato dello scroll (`scrollTop`) è gestito internamente al componente tramite `useState`.
  - **Applicazione dello Scroll:** La posizione di scroll deve essere applicata programmaticamente tramite un `useEffect` che agisce sulla proprietà `scrollTop` di un `ref` del DOM.
  - **Props:** Il componente deve accettare una prop `content: React.ReactNode[]` per il suo contenuto. La prop `pages` è deprecata.

- **Interfaccia Utente (UI) Protetta:**
  - **Scrollbar Nativa:** Deve essere sempre nascosta tramite la classe CSS `.no-scrollbar`.
  - **Indicazioni a Schermo:** Devono essere presenti le indicazioni per lo scrolling verticale (`[↑] Su`, `[↓] Giù`) e per tornare indietro (`[ESC] Indietro`). Non devono essere presenti indicazioni per la paginazione.

#### 2.2. Legenda della Mappa (`InstructionsScreen.tsx`)

La fonte di verità per la legenda della mappa è stata corretta e consolidata.

- **Stato Protetto:**
  - La costante `legendItems` nel file `src/components/InstructionsScreen.tsx` è la fonte autoritativa per la legenda della mappa.
  - I simboli e le descrizioni devono corrispondere esattamente a quanto segue:
    - `@`: Giocatore
    - `C`: Città
    - `F`: Foresta
    - `~`: Acqua
    - `M`: Montagna
    - `R`: Rifugio
    - `S`: Start
    - `E`: End

---

### 3. Baseline di Configurazione

- **`package.json`:**
  - La versione del progetto è fissata a `"version": "0.3.0"`.

- **`src/components/StartScreen.tsx`:**
  - La versione visualizzata a schermo deve essere `"v0.3.0 - A Letter by Me, My Son"`.

- **`src/index.css`:**
  - Deve essere presente la classe di utility `.no-scrollbar` con le relative proprietà per i diversi browser (`-webkit-scrollbar`, `-ms-overflow-style`, `scrollbar-width`).

---

### 4. Procedura di Test Anti-Regressione

Per le versioni successive, i seguenti test manuali devono essere eseguiti per validare la non-regressione di queste funzionalità:

1.  **Avviare il gioco** e verificare che la versione `0.3.0` sia correttamente visualizzata nel menu principale.
2.  **Accedere alla pagina Istruzioni:**
    - Verificare che il testo sia completamente visibile e scrollabile.
    - Testare lo scrolling con i tasti `W`, `S`, `Freccia Su`, `Freccia Giù`.
    - Verificare l'assenza della scrollbar del browser.
    - Verificare che la legenda della mappa corrisponda esattamente alla baseline definita nella sezione 2.2.
    - Verificare che il tasto `ESC` riporti al menu principale.
3.  **Accedere alla pagina Storia:**
    - Eseguire gli stessi test di scrolling, assenza di scrollbar e funzionalità del tasto `ESC` come per la pagina Istruzioni.

Qualsiasi fallimento in uno di questi test indica una regressione critica che deve essere risolta prima del rilascio della nuova versione.
