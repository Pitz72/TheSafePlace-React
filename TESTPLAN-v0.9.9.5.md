# Piano di Test Anti-Regressione per v0.9.9.5

Questo documento descrive i passaggi per verificare che le correzioni introdotte nella versione 0.9.9.5 non abbiano creato nuove regressioni e che i bug risolti rimangano tali.

## Area di Test 1: Sistema di Eventi Casuali

### Test 1.1: Attivazione e Flusso Completo dell'Evento

**Obiettivo:** Verificare che un evento si attivi, possa essere completato e che il gioco ritorni a uno stato normale.

**Passaggi:**
1.  Avviare il gioco.
2.  Caricare una partita o iniziarne una nuova.
3.  Muoversi sulla mappa fino a entrare in un bioma `REST_STOP` (R) o `VILLAGE` (V).
4.  **Verifica Attesa:** Un evento casuale dovrebbe attivarsi (potrebbe richiedere alcuni tentativi a causa della probabilità).
5.  Nella schermata dell'evento, usare i tasti `W/S` o `Su/Giù` per navigare tra le scelte.
6.  Premere `ENTER` per selezionare una scelta.
7.  **Verifica Attesa:** La schermata dell'evento deve chiudersi e il gioco deve tornare alla schermata principale della mappa, senza crash o schermate grigie/vuote.

### Test 1.2: Feedback dell'Esito nel Diario

**Obiettivo:** Verificare che il risultato specifico della scelta venga registrato nel diario di gioco.

**Passaggi:**
1.  Completare i passaggi dal punto 1 al punto 6 del **Test 1.1**.
2.  Dopo essere tornati alla schermata di gioco, ispezionare il pannello del diario (`GameJournal`).
3.  **Verifica Attesa:** Nel diario deve essere presente una nuova voce che descrive l'esito della scelta fatta (es. "Hai trovato una scorta di cibo!", "La tua abilità non è stata sufficiente.", ecc.). Il messaggio non deve essere generico.

## Area di Test 2: Stabilità Generale delle Schermate

### Test 2.1: Accesso alle Schermate Principali

**Obiettivo:** Verificare che le schermate che in passato hanno dato problemi siano ancora accessibili.

**Passaggi:**
1.  Avviare il gioco e caricare una partita.
2.  Dalla schermata di gioco principale, premere i seguenti tasti per accedere alle rispettive schermate:
    *   `I` per l'Inventario (`InventoryScreen`).
    *   `C` (o il tasto corrispondente) per il Banco di Lavoro (`CraftingScreen`).
    *   Accedere a un rifugio (`ShelterScreen`) tramite le azioni di gioco.
3.  **Verifica Attesa:** Ogni schermata deve aprirsi correttamente senza errori a console o crash.

---
**Esito del Test:** Se tutti i passaggi vengono completati e le verifiche attese sono soddisfatte, il test di anti-regressione è da considerarsi superato.
