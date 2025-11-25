# 07. Interfaccia e UX

## 7.1 Filosofia di Design
L'interfaccia utente (UI) è progettata per evocare un terminale retrò o un sistema di sopravvivenza minimalista. L'uso di colori ad alto contrasto su sfondo scuro, font monospaziati e layout a griglia rafforza l'atmosfera post-apocalittica.

## 7.2 HUD di Gioco (Game Screen)
La schermata principale è divisa in quattro sezioni logiche:

### 7.2.1 Colonna Sinistra (Sopravvivenza)
*   **Pannello Sopravvivenza:**
    *   HP, Sazietà, Idratazione (Valori numerici e avvisi critici <25%).
    *   Stanchezza (Avviso >75%).
    *   Status Attivi (Ferito, Malato, ecc. con color coding).
*   **Pannello Inventario (Compact):**
    *   Lista rapida degli oggetti con durabilità e quantità.
    *   Indicatore Peso Totale / Max (Avviso Sovraccarico).
*   **Pannello Comandi:**
    *   Lista shortcut tastiera (WASD, I, J, R, F, L, ESC).

### 7.2.2 Area Centrale (Mappa)
*   **Mappa del Mondo:**
    *   Visualizzazione a griglia (Canvas) centrata sul giocatore.
    *   Fog of War (implied/planned).
    *   Compass Rose per orientamento.

### 7.2.3 Colonna Destra (Info & Stats)
*   **Pannello Informazioni:**
    *   Coordinate (X, Y).
    *   Bioma corrente.
    *   Orario e Giorno (Indicatore Notte 20:00-06:00).
    *   Meteo e Effetti attivi (es. Pioggia -> Movimento lento).
*   **Pannello Equipaggiamento:**
    *   Slot: Arma, Testa, Torso, Gambe.
    *   Stato durabilità per ogni pezzo.
*   **Pannello Statistiche:**
    *   Livello e XP (Indicatore Level Up disponibile).
    *   Attributi (FOR, DES, COS, INT, SAG, CAR) con modificatori.
*   **Pannello Allineamento:**
    *   Barra o indicatore dell'orientamento morale (Elian vs Lena).

### 7.2.4 Pannello Inferiore (Log)
*   **Diario di Viaggio:**
    *   Log testuale scorrevole degli eventi.
    *   Color coding per tipo evento (Combattimento=Rosso, Loot=Ciano, Narrativa=Grigio).

## 7.3 Schermate Secondarie

### 7.3.1 Inventario (Full Screen)
*   Overlay a tutto schermo.
*   Lista oggetti a sinistra (navigabile con tastiera).
*   Dettagli oggetto a destra (Descrizione, Statistiche, Effetti).
*   Menu Azioni contestuale (Usa, Equipaggia, Scarta).

### 7.3.2 Combattimento
*   Interfaccia a turni.
*   Log di combattimento dedicato.
*   Menu azioni tattiche (Attacco, Analisi, Oggetti, Fuga).

### 7.3.3 Dialogo
*   Visualizzazione stile visual novel o RPG classico.
*   Testo NPC in alto.
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
