# GUIDA ANTI-REGRESSIONE v0.9.0 - Run away, fight, or die.

## 1. Scopo del Documento

Questo documento definisce i **controlli manuali obbligatori** per verificare l'integrità del sistema di combattimento V.A.T. introdotto nella versione 0.9.0. L'esecuzione di questi test è fondamentale prima di ogni merge o release per prevenire regressioni nelle funzionalità di combattimento.

**Versione Target:** v0.9.0+

## 2. Setup del Test

Per eseguire questi test, è necessario avviare il gioco e prepararsi a un combattimento.

1.  Avviare l'applicazione (`npm run dev`).
2.  Iniziare una nuova partita o caricare un salvataggio.
3.  L'obiettivo è raggiungere una coordinata sulla mappa dove è noto che si trovi un incontro. Un esempio facile da raggiungere è l'imboscata dei banditi nella foresta.

## 3. Suite di Test Manuali

Eseguire i seguenti test in sequenza.

---

### ✅ Test Case 1: Innesco e Avvio del Combattimento

**Obiettivo:** Verificare che gli incontri basati sulla posizione si attivino correttamente e che il combattimento inizi su scelta del giocatore.

**Passaggi:**
1.  Navigare con il giocatore fino a una coordinata che innesca un incontro (es. l'imboscata nella foresta).
2.  Attendere la comparsa della `EventScreen`.
3.  Selezionare l'opzione per combattere (es. "Affronta i banditi").

**Risultato Atteso:**
-   La `EventScreen` deve apparire con la descrizione dell'incontro.
-   Dopo aver scelto di combattere, la `EventScreen` deve scomparire.
-   La `CombatScreen` deve essere renderizzata, mostrando l'interfaccia di combattimento (stato giocatore/nemici, log, menu azioni).
-   Il log di combattimento deve mostrare un messaggio di inizio combattimento.

---

### ✅ Test Case 2: Azione del Giocatore - Attacco

**Obiettivo:** Verificare che il giocatore possa eseguire un'azione di attacco con successo.

**Passaggi:**
1.  Assicurarsi che l'azione "Attacco" sia selezionata di default nel menu.
2.  Assicurarsi che un nemico sia selezionato come bersaglio di default.
3.  Cliccare sul pulsante "CONFERMA AZIONE".

**Risultato Atteso:**
-   Il log di combattimento deve mostrare un nuovo messaggio che descrive l'attacco del giocatore.
-   Il log deve includere il risultato del tiro per colpire (es. `Tiro per colpire: 15 + 2 = 17 (vs AC 14)`).
-   Se l'attacco va a segno, deve apparire un messaggio di danno (es. `Colpito! Spada Corta infligge 4 danni a Bandito.`).
-   La barra della salute (HP) del nemico bersagliato deve diminuire visibilmente.
-   Lo stato del nemico deve aggiornarsi (es. da "Illeso" a "Ferito").
-   Il turno deve passare ai nemici (`phase: 'enemy-turn'`).

---

### ✅ Test Case 3: Turno dei Nemici

**Obiettivo:** Verificare che i nemici eseguano il loro turno e attacchino il giocatore.

**Passaggi:**
1.  Dopo il turno del giocatore, attendere.

**Risultato Atteso:**
-   Dopo una breve pausa, il log di combattimento deve mostrare i messaggi relativi all'attacco di ogni nemico attivo.
-   Per ogni attacco nemico, deve essere registrato un tiro per colpire e, se va a segno, un messaggio di danno.
-   La barra della salute (HP) del giocatore deve diminuire visibilmente.
-   Al termine del turno di tutti i nemici, il controllo deve tornare al giocatore (`phase: 'player-turn'`).

---

### ✅ Test Case 4: Vittoria in Combattimento

**Obiettivo:** Verificare la corretta gestione della vittoria.

**Passaggi:**
1.  Continuare ad attaccare i nemici fino a quando tutti non sono stati sconfitti (HP <= 0).

**Risultato Atteso:**
-   Quando l'ultimo nemico viene sconfitto, il log deve mostrare un messaggio di vittoria.
-   La `CombatScreen` deve scomparire.
-   La `PostCombatScreen` deve apparire, mostrando il titolo "VITTORIA".
-   La schermata di vittoria deve mostrare correttamente l'esperienza (XP) guadagnata e gli eventuali oggetti (loot) recuperati.
-   Cliccando su "Continua", la schermata di post-combattimento deve chiudersi e il gioco deve tornare alla schermata principale (mappa/rifugio).

---

### ✅ Test Case 5: Sconfitta in Combattimento (Verifica Concettuale)

**Obiettivo:** Verificare la corretta gestione della sconfitta.

**Passaggi:**
1.  (Difficile da testare senza strumenti di debug) Lasciare che i nemici attacchino il giocatore fino a quando i suoi HP non raggiungono 0.

**Risultato Atteso:**
-   Quando gli HP del giocatore arrivano a 0, il log deve mostrare un messaggio di sconfitta.
-   La `CombatScreen` deve scomparire.
-   La `PostCombatScreen` deve apparire, mostrando il titolo "SCONFITTA".
-   La schermata di sconfitta deve presentare le opzioni "Carica Ultimo Salvataggio" e "Torna al Menu Principale".

---

Se tutti i test da 1 a 4 passano senza errori visivi o funzionali, il sistema di combattimento è considerato stabile e non regredito.
