# Guida Anti-Regressione v0.9.5 - "Ammappa"

**Obiettivo:** Verificare che la correzione al bug critico del loop di rendering sia stabile e non abbia introdotto effetti collaterali nel movimento del giocatore o nella visualizzazione della mappa.

---

## 🧪 Suite di Test Manuali

### 1. Stabilità all'Avvio e al Movimento

-   **ID Test:** AR-095-STABILITY
-   **Descrizione:** Assicurarsi che il gioco si avvii correttamente e che il movimento non causi crash.
-   **Passi:**
    1.  Avviare una "Nuova Partita".
    2.  Completare la creazione del personaggio.
    3.  **Verifica Attesa:** Il gioco deve caricare la schermata della mappa senza alcun errore in console relativo a "Maximum update depth exceeded".
    4.  Usare i tasti di movimento (WASD, Frecce Direzionali) per muovere il personaggio sulla mappa per almeno 30 secondi.
    5.  **Verifica Attesa:** Il movimento deve essere fluido, la mappa deve aggiornarsi correttamente e non devono verificarsi crash o errori in console.

### 2. Correttezza del Flusso di Dati del Movimento

-   **ID Test:** AR-095-DATAFLOW
-   **Descrizione:** Verificare che le interazioni base legate al movimento funzionino come previsto.
-   **Passi:**
    1.  Muoversi su un terreno di tipo montagna ('M').
    2.  **Verifica Attesa:** Il movimento deve essere impedito e un messaggio di log appropriato deve apparire nel diario.
    3.  Muoversi su un terreno di tipo fiume ('~').
    4.  **Verifica Attesa:** Il gioco deve richiedere un secondo input per attraversare e la logica di attraversamento (skill check, etc.) deve attivarsi correttamente.

---

## ✅ Esito Atteso

Tutti i test devono passare senza errori critici in console. Il gioco deve risultare stabile e le meccaniche di movimento base devono essere funzionanti. Se tutti i test passano, la correzione è da considerarsi un successo e la regressione è stata prevenuta.
