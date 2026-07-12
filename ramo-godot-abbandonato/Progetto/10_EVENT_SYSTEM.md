# 🎭 EVENT SYSTEM - THE SAFE PLACE v0.4.0

## 🎯 **OVERVIEW DEL SISTEMA DI EVENTI**

L'Event System è il motore narrativo dinamico di The Safe Place. È responsabile di popolare il mondo di gioco con incontri imprevedibili, sfide e opportunità, trasformando l'esplorazione da un semplice atto meccanico a un'esperienza ricca di tensione e scoperta. Il sistema è gestito da due Singleton principali (`EventManager`, `SkillCheckManager`) e alimentato da un ricco database di eventi modulari in formato JSON.

### **Filosofia del Design**
- **Imprevedibilità:** Il giocatore non sa mai cosa potrebbe accadere al prossimo passo.
- **Contesto:** Gli eventi sono legati al bioma, all'ora del giorno e allo stato del giocatore, garantendo coerenza narrativa.
- **Scelta e Conseguenza:** Ogni evento presenta scelte significative, le cui conseguenze (positive o negative) sono determinate dalle abilità del personaggio tramite skill check.
- **Modularità:** I contenuti degli eventi sono interamente definiti in file JSON, permettendo una facile espansione.

---

## 📄 **1. DATABASE DEGLI EVENTI (I Contenuti)**

I contenuti degli eventi sono archiviati in modo modulare per facilitare la gestione e l'espansione.

### **Struttura dei File**
*   `data/events/biomes/`: Una cartella contenente un file JSON per ogni bioma (es. `forest_events.json`). Ogni file contiene un array di oggetti-evento.
*   `data/events/unique_events.json`: Un file contenente un array di eventi unici che possono essere attivati in condizioni speciali e una sola volta per partita.

### **Schema di un Oggetto-Evento**
```json
{
  "id": "identificativo_unico_evento",
  "title": "Titolo che appare nel popup",
  "description": "Testo descrittivo della situazione.",
  "choices": [
    {
      "text": "Testo della scelta 1",
      "skillCheck": { "stat": "forza", "difficulty": 13 },
      "successText": "Testo narrativo in caso di successo.",
      "failureText": "Testo narrativo in caso di fallimento.",
      "reward": {
        "items_gained": [{ "id": "item_id", "quantity": 1 }]
      },
      "penalty": {
        "items_lost": [{ "id": "tool_pickaxe", "quantity": 1 }]
      }
    },
    {
      "text": "Testo della scelta 2 (senza skill check)",
      "resultText": "Testo narrativo per questa scelta.",
      "reward": { "type": "experience", "amount": 25 }
    }
  ]
}
```
*(Nota: Il sistema supporta anche il formato `consequences` più strutturato, ma la logica di normalizzazione lo rende retrocompatibile con il formato `reward`/`penalty`).*

### **Distribuzione e Tematiche (Come da `06_EVENTS_DATABASE.md`)**
*   **FORESTE (25+ eventi):** Focus su natura, trappole e sopravvivenza. Skill check di `Agilità` e `Intelligenza`.
*   **PIANURE (20+ eventi):** Focus su desolazione, resti e incontri con fauna. Skill check di `Forza` e `Vigore`.
*   **CITTÀ (15+ eventi):** Focus su tecnologia, rovine e pericoli urbani. Skill check di `Intelligenza` e `Agilità`.
*   **VILLAGGI (15+ eventi):** Focus su tracce di vita passata e interazioni sociali. Skill check di `Carisma` e `Intelligenza`.
*   **FIUMI (10+ eventi):** Focus su attraversamenti e risorse acquatiche. Skill check di `Agilità` e `Forza`.
*   **RISTORO (8+ eventi):** Eventi legati a sicurezza e interazione, non a pericoli.
*   **UNICI (5+ eventi):** Eventi di trama o easter egg con ricompense significative.

---

## 🎲 **2. IL MOTORE DEGLI SKILL CHECK (`SkillCheckManager`)**

Al cuore di quasi ogni interazione non banale c'è lo `SkillCheckManager`, il "maestro dei dadi" del gioco.

### **Responsabilità**
*   Centralizzare la logica di risoluzione di qualsiasi test di abilità.
*   Simulare un "tiro di dado" virtuale basato sulle regole D&D.
*   Fornire un risultato dettagliato per un feedback trasparente al giocatore.

### **Logica di `perform_check`**
La sua unica funzione pubblica, `perform_check(stat_name: String, difficulty: int)`, esegue i seguenti passi:
1.  **Recupera Statistica:** Ottiene il valore della statistica richiesta (es. `Agilità: 14`) dal `PlayerManager`.
2.  **Calcola Modificatore:** Applica la formula D&D `floor((stat_value - 10) / 2.0)` per ottenere un modificatore (es. `+2`).
3.  **Lancia d20:** Genera un numero casuale tra 1 e 20.
4.  **Calcola Totale:** Somma `tiro_d20 + modificatore`.
5.  **Confronta con Difficoltà (DC):** Verifica se `totale >= difficulty`.
6.  **Restituisce Risultato:** Invia un dizionario completo con tutti i dettagli (`{ "success": true/false, "roll": ..., "modifier": ..., "total": ..., "difficulty": ... }`), che verrà usato per il log nel diario di gioco.

---

## 🌍 **3. IL GESTORE DEGLI EVENTI (`EventManager`)**

L'`EventManager` è il direttore d'orchestra che decide quando e quale evento presentare al giocatore.

### **Flusso di Attivazione**
1.  **Innesco:** `MainGame.gd`, dopo ogni movimento del giocatore, chiama `EventManager.check_for_event(current_biome)`.
2.  **Probabilità:** L'`EventManager` consulta una tabella di probabilità per determinare se un evento deve attivarsi in quel bioma (es. 35% di probabilità nelle Pianure, 65% in Città).
3.  **Selezione:** Se il tiro di probabilità ha successo, seleziona casualmente un evento dal file JSON del bioma corrispondente (es. da `plains_events.json`).
4.  **Emissione Segnale:** Emette il segnale `event_triggered(event_data)`, passando l'intero dizionario dell'evento selezionato.

### **Flusso di Risoluzione**
1.  **Input Giocatore:** La `GameUI` mostra il popup dell'evento. Quando il giocatore fa una scelta, viene emesso un segnale con l'indice della scelta (es. `0` per la prima opzione).
2.  **Processo Scelta:** L'`EventManager` riceve l'indice e recupera il dizionario della scelta corrispondente.
3.  **Esecuzione Skill Check:** Se la scelta contiene una chiave `skillCheck`, l'`EventManager` chiama `SkillCheckManager.perform_check()` con i parametri specificati.
4.  **Determinazione Conseguenze:** In base al successo o fallimento dello skill check (o se la scelta non ne aveva), l'`EventManager` identifica il blocco di conseguenze corretto (`consequences_success`, `consequences_failure`, o `consequences`).
5.  **Applicazione Conseguenze:**
    *   **Delega a `PlayerManager`:** Chiama `PlayerManager.apply_item_transaction()` per gestire l'aggiunta/perdita di oggetti, `PlayerManager.modify_hp()` per il danno/cura, `PlayerManager.add_status()` per gli stati, ecc.
    *   **Delega a `TimeManager`:** Chiama `TimeManager.advance_time_by_minutes()` per le penalità di tempo.
6.  **Feedback Finale:** Emette il segnale `event_choice_resolved` con il testo narrativo del risultato e i dettagli dello skill check, che verranno mostrati nel diario di gioco.

---

### **API Pubbliche Principali (`EventManager.gd`)**
```gdscript
# Chiamata da MainGame per tentare di innescare un evento.
func check_for_event(biome: String) -> void

# Chiamata dalla UI quando il giocatore fa una scelta.
func process_event_choice(event_id: String, choice_index: int) -> void
```

### **Segnali Emessi**
*   `event_triggered(event_data: Dictionary)`: Inviato quando un nuovo evento deve essere mostrato. Ascoltato da `GameUI` per aprire il popup.
*   `event_choice_resolved(result_text, narrative_log, skill_check_details)`: Inviato dopo che una scelta è stata processata. Ascoltato da `GameUI` per aggiornare il diario.
