# CHANGELOG v0.9.8.1 - Sessione di Debug e Stabilizzazione

**Data:** 27 Ottobre 2025
**Autore:** Gemini AI Assistant
**Obiettivo:** Stabilizzare il gioco, risolvere crash critici e ripristinare la funzionalità di base del crafting.

---

## 🐛 Bug Fixes

### **Risoluzione Crash Critici del Rifugio e Crafting**

Questa sessione ha affrontato una catena di crash e bug che impedivano l'utilizzo del rifugio e del sistema di crafting.

1.  **Crash all'ingresso del Rifugio (Risolto):**
    - **Problema:** Il gioco andava in crash a causa di una chiamata a una funzione inesistente (`get_available_recipes`) in `CraftingPopup.gd`.
    - **Soluzione:** Corretta la chiamata alla funzione esistente `get_unlocked_recipes` in `WorldSystemManager.gd`.

2.  **Crash all'apertura del Popup del Rifugio (Risolto):**
    - **Problema:** Lo script `ShelterPopup.gd` non era valido a causa della mancanza delle funzioni per la gestione dei segnali di crafting (`_on_crafting_completed`, `_on_crafting_failed`).
    - **Soluzione:** Aggiunte le definizioni delle funzioni mancanti.

3.  **Crash all'esecuzione di un'Azione dal Rifugio (Risolto):**
    - **Problema:** Il gioco andava in crash a causa di una chiamata a una funzione inesistente (`start_crafting`).
    - **Soluzione:** Corretta la chiamata alla funzione corretta `attempt_crafting` in `WorldSystemManager.gd`.

### **Correzioni all'Interfaccia Utente (UI)**

1.  **Doppio Popup all'Ingresso del Rifugio (Risolto):**
    - **Problema:** Entrando in un rifugio venivano aperti contemporaneamente sia il popup del rifugio che quello del crafting.
    - **Soluzione:** Disabilitata l'apertura automatica del popup di crafting in `GameUI.gd`. Ora si apre solo quando richiesto dal giocatore.

2.  **Feedback per Azioni di Crafting (Implementato):**
    - **Problema:** Le azioni di crafting fallivano silenziosamente senza dare alcun feedback al giocatore.
    - **Soluzione:** Implementato un sistema in `GameUI.gd` che ascolta i fallimenti del crafting e stampa un messaggio chiaro nel diario di gioco, specificando il motivo (es. "Ricetta non sbloccata", "Materiali insufficienti").

### **Correzione Dati di Gioco**

1.  **Azioni del Rifugio non Funzionanti (Risolto):**
    - **Problema:** I pulsanti nel menu del rifugio erano collegati a ricette inesistenti (`repair_shelter`, `build_trap`).
    - **Soluzione:** Corretto l'ID della ricetta per la trappola (`craft_trap`) e disabilitati i pulsanti per le azioni non implementate.

2.  **Inventario Iniziale Errato (Risolto):**
    - **Problema:** Il gioco non riusciva ad aggiungere gli oggetti iniziali a causa di ID errati (`purified_water`, `bandage`, etc.).
    - **Soluzione:** Aggiornati gli ID degli oggetti in `PlayerSystemManager.gd` con quelli corretti presenti nel database.

## 📝 Aggiornamenti alla Documentazione

- **`03_SINGLETON_MANAGERS.md`:** Aggiornato per riflettere il consolidamento dei manager. Le sezioni per `CraftingManager`, `EventManager`, e `TimeManager` sono state contrassegnate come obsolete e sono state aggiunte note che indicano che le loro funzionalità sono ora parte di `WorldSystemManager` e `NarrativeSystemManager`. Aggiunte le sezioni corrette per i nuovi manager consolidati.

---
**Stato del Progetto:** Il ciclo di gioco principale relativo al rifugio e al crafting è ora stabile e funzionale. Rimangono da risolvere errori minori nei file di test e ripulire ulteriormente la documentazione.
