# Vision 2025: The Safe Place - Next Gen

**Stato:** Bozza Teorica
**Data:** 2025-12-04
**Focus:** Espansione, Design, Criticità

## 1. Analisi dello Stato Attuale
Il gioco ha superato la fase critica di "trapianto". Ora abbiamo un motore ibrido potente:
*   **React 19:** Gestisce l'interfaccia (inventario, diario) con reattività eccellente.
*   **Phaser:** Gestisce il mondo di gioco, liberandoci dalla griglia statica HTML.
*   **Ink:** Gestisce la narrativa con una logica a nodi complessa.

Il "Brain Fix" (v2.0.4) ha garantito che questi tre sistemi si parlino. Ora possiamo smettere di "riparare" e iniziare a "costruire".

## 2. Potenzialità Inespresse (Cosa possiamo fare ORA)

### A. Atmosfera e Immersione (Phaser)
La vecchia griglia era funzionale ma fredda. Phaser permette di creare un mondo che "respira":
*   **Illuminazione Dinamica:** Implementare un ciclo giorno/notte reale dove la visibilità cambia. Di notte, il "Rifugio" dovrebbe emettere una luce calda che contrasta con il buio esterno (Fog of War reale).
*   **Particellari:** Cenere che cade dal cielo (tema centrale del gioco), pioggia acida, fumo dai fuochi. Questi dettagli narrativi ora possono essere visivi.
*   **Audio Spaziale:** Legare i suoni alla posizione nella mappa Phaser (es. il rumore del generatore si sente solo quando sei vicino).

### B. Narrativa Sistemica (Ink + React)
Ink non deve essere solo per i dialoghi scriptati.
*   **Barks Contestuali:** I compagni possono commentare *mentre* esplori. Se la "Sazietà" è bassa, Ink può triggerare una frase "Ho fame..." senza aprire una finestra di dialogo modale, ma come "fumetto" sopra il personaggio in Phaser.
*   **Quest Ramificate Reali:** Ora che i trigger funzionano, possiamo fare quest dove *come* ottieni un oggetto cambia la storia. (Es. Rubarlo vs Comprarlo vs Negoziarlo attiva flag diversi in Ink che cambiano il finale).

### C. Gameplay Emergente
*   **Stealth Reale:** Invece di un check di dadi su "Furtività", possiamo usare i coni di visione dei nemici in Phaser. Il giocatore deve muoversi fisicamente fuori dalla vista.
*   **Crafting Contestuale:** Invece di un menu astratto, interagire con il "Banco da Lavoro" in Phaser potrebbe mostrare visivamente gli oggetti sul tavolo.

## 3. Criticità Tecniche (Il Debito Tecnico Rimasto)

Nonostante il fix, ci sono aree che frenano l'espansione:

1.  **Dati Legacy (JSON Bloat):**
    *   Il gioco carica enormi file JSON (`items.json`, `enemies.json`) in memoria all'avvio.
    *   *Soluzione:* Migrare a un database leggero o caricare i dati on-demand (lazy loading) per area.

2.  **Duplicazione dello Stato (World State):**
    *   Abbiamo ancora dati duplicati tra `CharacterStore` (logica) e `NarrativeStore` (storia).
    *   *Soluzione:* Centralizzare tutto in un `WorldState` unico che Ink e Phaser leggono/scrivono. Ink dovrebbe diventare l'unica "memoria" per le decisioni narrative.

3.  **Input Friction:**
    *   Gestire tastiera/mouse sia per React (UI) che per Phaser (Gioco) crea conflitti (es. premere 'E' apre l'inventario o interagisce con la mappa?).
    *   *Soluzione:* Un `InputManager` centralizzato che decide chi riceve l'input in base al contesto (es. se UI aperta, Phaser è in pausa).

## 4. Roadmap Strategica Consigliata

1.  **Polishing Visivo (Quick Win):** Aggiungere luci e particellari in Phaser per mostrare subito il salto di qualità.
2.  **Refactoring Input:** Creare il gestore input centralizzato per fluidificare l'esperienza.
3.  **Espansione Narrativa:** Scrivere il Capitolo 2 sfruttando le nuove meccaniche (quest ramificate).
