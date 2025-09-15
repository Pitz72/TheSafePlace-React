# Changelog - The Safe Place v0.3.0
## A Letter by Me, My Son

**Data di Rilascio:** 2025-08-03
**Autore:** LLM Assistant (su direzione dell'Operatore)
**Tipo:** Release di Correzione e Refactoring

---

### 🌟 Miglioramenti Principali

Questa versione si concentra sulla correzione di bug critici nelle pagine informative e su un importante refactoring del componente sottostante, migliorando la robustezza e la manutenibilità del codice.

- **Refactoring del Componente `PaginatedInfoPage`:**
  - Il componente `PaginatedInfoPage`, utilizzato per le schermate di Istruzioni e Storia, è stato completamente rilavorato.
  - La precedente logica di paginazione, che si è rivelata difettosa e complessa, è stata **rimossa** in favore di un sistema di **scrolling verticale personalizzato**.
  - Questo nuovo sistema è più semplice, più robusto e più in linea con l'estetica del gioco.

### 🐛 Correzioni di Bug

- **Corretto Bug di Visualizzazione nelle Pagine Informative:**
  - **Problema:** Le pagine Istruzioni e Storia apparivano vuote a causa di un errore nel passaggio delle `props` tra i componenti (`pages` vs `content`).
  - **Soluzione:** Il problema è stato risolto standardizzando l'uso della prop `content` e assicurando che i dati vengano passati correttamente, rendendo il testo nuovamente visibile.

- **Corretta la Legenda della Mappa:**
  - **Problema:** La legenda della mappa mostrata nella pagina delle Istruzioni non era coerente con la documentazione interna né con i simboli di gioco reali.
  - **Soluzione:** La legenda è stata aggiornata con i simboli e le descrizioni corrette fornite dall'Operatore, garantendo che il giocatore riceva informazioni accurate.

### 🎨 Modifiche Estetiche Minori

- **Occultamento della Scrollbar:**
  - È stata aggiunta una nuova classe di utility (`.no-scrollbar`) per nascondere la scrollbar nativa del browser all'interno delle pagine informative, mantenendo l'immersività e l'estetica retro del terminale.
- **Aggiornamento Testo Comandi:**
  - Le istruzioni a schermo nelle pagine informative sono state aggiornate per riflettere i nuovi comandi di scrolling (`[↑]` e `[↓]`) invece dei precedenti comandi di paginazione.

### 🔧 Modifiche Tecniche

- **Aggiornamento Versione:**
  - Il numero di versione del progetto è stato aggiornato a `0.3.0` in `package.json` e nella schermata del titolo.
- **Consolidamento Documentazione:**
  - La documentazione di release (changelog, anti-regressione) è stata creata e aggiornata per riflettere lo stato attuale del progetto.
---
**Stato della Release:** STABILE E CONSOLIDATA.
