# 07. Interfaccia e UX

## 7.1 Filosofia di Design
Dalla versione 3.0 l'interfaccia è quella di un gioco narrativo moderno: pannelli di vetro fumé su un fondo d'ardesia, un solo colore d'accento (la brace del tramonto, `#e8893f`), il viola per la memoria, tipografia editoriale (Cormorant Garamond per i titoli, Literata per la narrativa, Barlow e Barlow Condensed per l'interfaccia). I colori che arrivano dalla logica di gioco vengono armonizzati sulla palette del tema. Due temi: **Crepuscolo** (predefinito) e **Alto contrasto**. Tutto è progettato a 1920×1080 e scalato sulla finestra; le dimensioni dei testi restano leggibili fino a 1024×640.

## 7.2 HUD di Gioco (Game Screen)
La schermata principale è divisa in tre colonne.

### 7.2.1 Colonna Sinistra (il viaggiatore)
*   **Ultimo:** livello, barra XP, avviso di nuovo livello (`L`).
*   **Sopravvivenza:** Salute, Sazietà, Idratazione, Stanchezza come barre con icona e valore (rosso e pulsante sotto il 25%); condizioni attive come etichette colorate (incluso SOVRACCARICO).
*   **Equipaggiamento:** Arma, Testa, Torso, Gambe con icona e barra di durabilità.
*   **Attributi:** FOR, DES, COS, INT, SAG, CAR con modificatore.
*   **Bussola morale:** l'ago tra Lena (compassione) ed Elian (pragmatismo) e l'orientamento dominante.

### 7.2.2 Area Centrale (il mondo)
*   **Intestazione:** il luogo (bioma o luogo speciale) e le coordinate; meteo e suoi effetti; luce e dissuasore attivi; ora e giorno (luna di notte).
*   **Mappa illustrata:** terreno disegnato proceduralmente su Canvas (pianure con regioni secche e verdi, fiumi continui, foreste, rovine, villaggi, montagne, rifugi come capanne — in rovina dopo l'uso — e i luoghi speciali). La camera segue il giocatore con una transizione morbida; zoom a tre livelli (`+`/`-`).
*   **Luce e meteo:** colore dell'ora moltiplicato sul terreno (alba, giorno, ora dorata, crepuscolo, notte); di notte una pozza di luce attorno al giocatore, più ampia con la torcia. Pioggia, tempesta (con lampi), nebbia e ombre delle nuvole.
*   **Segnalini:** missione principale (stella, pulsante), secondarie (punto esclamativo), luoghi scoperti (rombo), mercante ambulante; ai bordi, frecce verso i segnalini e i luoghi speciali fuori vista, con distanza.
*   **Barra dei comandi:** i tasti dell'esplorazione come tasti disegnati.

### 7.2.3 Colonna Destra (il racconto)
*   **Diario di viaggio:** voci dalla più recente, ora, etichetta del tipo ([MAPPA], [MISSIONE AVVIATA]...) e testo in serif colorato per tipo; le voci più vecchie sfumano.
*   **Zaino:** peso e barra di carico, lista compatta con quantità, durabilità e oggetti equipaggiati.

## 7.3 Schermate Secondarie

### 7.3.1 Inventario (Full Screen)
*   Finestra sopra il gioco sfocato.
*   Lista oggetti a sinistra (navigabile con tastiera).
*   Dettagli oggetto a destra (Descrizione, Statistiche, Effetti).
*   Menu Azioni contestuale (Usa, Equipaggia, Scarta).

### 7.3.2 Combattimento
*   Interfaccia a turni.
*   Log di combattimento dedicato.
*   Menu azioni tattiche (Attacco, Analisi, Oggetti, Fuga).

### 7.3.3 Dialogo
*   Ritratto (o monogramma) e nome di chi parla, testo in serif.
*   Opzioni di risposta numerate in basso.
*   Check su skill/attributi visibili nelle opzioni.

## 7.4 Controlli
*   **Movimento:** WASD / Frecce.
*   **Interazione:** Invio / Spazio.
*   **Menu Rapidi:**
    *   `I`: Inventario.
    *   `J`: Quest Log.
    *   `R`: Riposo Breve.
    *   `F`: Cerca Risorse.
    *   `L`: Level Up.
    *   `ESC`: Menu Pausa / Indietro.
