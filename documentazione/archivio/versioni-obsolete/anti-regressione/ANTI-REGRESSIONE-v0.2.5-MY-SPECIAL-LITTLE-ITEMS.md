# Anti-Regressione v0.2.5 "my special little items"

Questo documento elenca i test di anti-regressione specifici per la versione 0.2.5. L'obiettivo è garantire che le nuove funzionalità introdotte e le modifiche apportate non abbiano rotto le funzionalità esistenti e che le nuove funzionalità funzionino come previsto.

## Contesto della Versione

La versione 0.2.5 si concentra sull'integrazione dei dati degli oggetti nel gioco. Questo include la migrazione dei dati degli oggetti da un formato legacy a un nuovo formato JSON, il caricamento di questi dati nel contesto di gioco e la risoluzione di alcuni problemi tecnici relativi all'Hot Module Replacement (HMR).

## Test di Anti-Regressione

### 1. Caricamento dei Dati degli Oggetti

- **Obiettivo**: Verificare che i dati degli oggetti vengano caricati correttamente all'avvio del gioco.
- **Procedura**:
  1. Avviare il gioco.
  2. Aprire la console di sviluppo del browser.
  3. Verificare che non ci siano errori relativi al caricamento dei file JSON degli oggetti.
  4. Verificare che l'oggetto `items` nel `GameContext` contenga i dati di tutti gli oggetti migrati.
- **Risultato Atteso**: Nessun errore nella console e l'oggetto `items` è popolato correttamente.

### 2. Stabilità dell'HMR

- **Obiettivo**: Verificare che le modifiche ai file del contesto di gioco non causino più ricaricamenti completi della pagina.
- **Procedura**:
  1. Avviare il server di sviluppo.
  2. Apportare una piccola modifica al file `src/contexts/GameContext.tsx` (ad esempio, aggiungere un commento).
  3. Salvare il file.
- **Risultato Atteso**: L'HMR aggiorna il modulo senza ricaricare l'intera pagina. La console del terminale non dovrebbe mostrare avvisi di "hmr invalidate".

### 3. Accesso ai Dati degli Oggetti

- **Obiettivo**: Verificare che i dati degli oggetti siano accessibili da altri componenti tramite il `useGameContext`.
- **Procedura**:
  1. In un componente di test, importare `useGameContext`.
  2. Accedere a `items` dal contesto.
  3. Visualizzare alcuni dati degli oggetti (ad esempio, il nome del primo oggetto).
- **Risultato Atteso**: I dati degli oggetti vengono visualizzati correttamente nel componente di test.

### 4. Integrità dei Dati Migrati

- **Obiettivo**: Verificare che i dati degli oggetti migrati siano corretti e completi.
- **Procedura**:
  1. Esaminare i file JSON in `src/data/items`.
  2. Confrontare i dati con la fonte originale (se disponibile).
  3. Verificare che tutti i campi siano stati mappati correttamente (ad esempio, `armorValue` a `armor`).
- **Risultato Atteso**: I dati nei file JSON sono accurati e riflettono la struttura prevista.