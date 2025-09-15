# Test di Anti-Regressione v0.2.6 - My backpack has numbers on it

## Obiettivo

Questo test di anti-regressione è progettato per verificare che le correzioni apportate alla modalità inventario non abbiano introdotto nuove regressioni e che le funzionalità principali del gioco rimangano stabili. La verifica si concentra sulla corretta interazione con l'inventario, la gestione dello stato e la stabilità generale del sistema.

## Aree Critiche da Testare

- **Attivazione/Disattivazione Inventario:** Verificare che la pressione del tasto 'I' apra e chiuda correttamente la modalità inventario.
- **Interazione con gli Oggetti:** Assicurarsi che la pressione dei tasti numerici (in particolare '1' e '2') attivi l'uso degli oggetti negli slot corrispondenti e che l'azione venga registrata nel diario di gioco.
- **Visualizzazione Slot:** Controllare che tutti gli slot dell'inventario, sia pieni che vuoti, mostrino correttamente il loro numero di riferimento.
- **Stabilità Generale:** Eseguire un test di gioco generale per assicurarsi che non si verifichino crash o errori imprevisti durante le normali operazioni (movimento, interazione con menu, ecc.).

## Procedura di Test

1.  **Avvio del Gioco:**
    *   Avviare l'applicazione.
    *   Verificare che la schermata del titolo mostri correttamente la versione `v0.2.6`.

2.  **Test Modalità Inventario:**
    *   Iniziare una nuova partita.
    *   Premere il tasto 'I'. L'inventario dovrebbe apparire.
    *   Premere di nuovo il tasto 'I'. L'inventario dovrebbe scomparire.
    *   Riaprire l'inventario.

3.  **Test Interazione Oggetti:**
    *   Con l'inventario aperto, verificare che i primi due slot contengano la pozione curativa e la benda.
    *   Verificare che gli slot 1 e 2 mostrino i numeri '1' e '2'.
    *   Premere il tasto '1'. Verificare che nel diario compaia un messaggio che conferma l'uso della pozione.
    *   Premere il tasto '2'. Verificare che nel diario compaia un messaggio che conferma l'uso della benda.
    *   Premere un tasto numerico corrispondente a uno slot vuoto (es. '3'). Verificare che nel diario compaia un messaggio di errore che indica che lo slot è vuoto.

4.  **Test di Stabilità:**
    *   Chiudere l'inventario.
    *   Muoversi sulla mappa per almeno 30 secondi.
    *   Aprire e chiudere i menu delle opzioni e della scheda personaggio.
    *   Verificare che non si siano verificati errori nella console del browser o nel terminale.

## Risultati Attesi

- **Successo:** Tutte le verifiche passano senza errori. L'inventario funziona come previsto e non ci sono segni di regressione in altre parti del gioco.
- **Fallimento:** Una o più verifiche falliscono. In questo caso, documentare l'errore specifico, il passo in cui si è verificato e le condizioni per riprodurlo.