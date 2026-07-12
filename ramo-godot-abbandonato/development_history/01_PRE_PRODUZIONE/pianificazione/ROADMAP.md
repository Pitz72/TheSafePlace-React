# Roadmap Tecnica - The Safe Place

**VERSIONE ATTUALE:** `v0.3.0 "The Chosen One"`
**DATA ULTIMO AGGIORNAMENTO:** 2025-01-28
**STATO GENERALE:** Milestone 0-3 Complete + Nuovo sistema di creazione personaggio. Inizio pianificazione Milestone 4.

---

## **1. Visione e Architettura**

"The Safe Place" è un GDR di sopravvivenza testuale post-apocalittico sviluppato in Godot 4.4.1. Il progetto è un porting di una precedente versione JS/PHP, di cui eredita il design.

L'architettura si basa su **Manager Singleton** che gestiscono i sistemi di gioco principali e comunicano tramite **segnali** per garantire un basso accoppiamento. I dati di gioco sono interamente **esternalizzati in file JSON**.

---

## **2. Milestone Completate (Stato Attuale Verificato)**

Questa sezione documenta le funzionalità consolidate e verificate nel codice sorgente.

---

### **✅ MILESTONE 0: FONDAMENTA TECNICHE**
- **M0.T1: Setup Iniziale e CRT Theme**
  - **Implementazione:** `ThemeManager.gd` (Singleton) carica il tema principale, il font "Perfect DOS VGA" e applica uno shader CRT per l'estetica rétro.
  - **Stato:** COMPLETATO.

- **M0.T2: Database Modulare**
  - **Implementazione:** `DataManager.gd` (Singleton) è responsabile del caricamento di tutti i file di dati `.json` dalla cartella `data/`. Fornisce un'interfaccia unificata per accedere a oggetti, eventi, etc.
  - **Stato:** COMPLETATO.

---

### **✅ MILESTONE 1: MONDO DI GIOCO**
- **M1.T1: Visualizzazione e Movimento**
  - **Implementazione:** La scena `World.tscn` utilizza un `TileMap` per renderizzare il mondo di gioco. Il movimento del giocatore è gestito all'interno di `World.gd` e notificato al resto del gioco tramite il segnale `player_moved(position, terrain_type)`.
  - **Stato:** COMPLETATO.

---

### **✅ MILESTONE 2: PERFECT ENGINE & UI**
- **M2.T1: Gestione Stato Giocatore**
  - **Implementazione:** `PlayerManager.gd` (Singleton) centralizza tutti i dati del giocatore: HP, fame, sete, statistiche e inventario.
  - **Stato:** COMPLETATO.

- **M2.T2: Interfaccia Utente Reattiva**
  - **Implementazione:** La scena `GameUI.tscn` ascolta i segnali emessi dai vari manager (`PlayerManager.stats_changed`, `TimeManager.time_advanced`, etc.) per aggiornare i pannelli informativi in tempo reale senza query dirette.
  - **Stato:** COMPLETATO.

- **M2.T3: Sistema di Inventario**
  - **Implementazione:** `PlayerManager.gd` contiene la logica per aggiungere, rimuovere, usare ed equipaggiare oggetti. Il sistema supporta oggetti stackabili e con porzioni.
  - **Stato:** COMPLETATO.

---

### **✅ MILESTONE 3: THE LIVING WORLD + BUG FIX CRITICO v0.2.6**
- **M3.T1: Generazione Personaggio**
  - **Implementazione:** `PlayerManager.gd` contiene la funzione `_generate_initial_stats()` che usa una logica "4d6 drop lowest" con vincoli tematici per creare personaggi unici a ogni partita. Gli HP massimi sono calcolati dinamicamente dal Vigore.
  - **Stato:** COMPLETATO.

- **M3.T2: Ciclo Temporale e Sopravvivenza**
  - **Implementazione:** `TimeManager.gd` (Singleton) avanza il tempo di 30 minuti per mossa. Gestisce il ciclo giorno/notte e alle 19:00 emette il segnale `survival_penalty_tick`. `PlayerManager.gd` ascolta questo segnale e applica le penalità di fame e sete.
  - **Stato:** COMPLETATO.

- **M3.T3: Stati del Personaggio**
  - **Implementazione:** `PlayerManager.gd` contiene un `enum Status { NORMAL, WOUNDED, SICK, POISONED }` e un array `active_statuses` per tracciare le condizioni del giocatore. Le funzioni `add_status` e `remove_status` gestiscono questi stati.
  - **Stato:** COMPLETATO.

- **M3.T4: Sistema di Eventi Dinamici**
  - **Implementazione:** `EventManager.gd` (Singleton) carica eventi da `data/events/`, li attiva in base alla probabilità del bioma in cui si muove il giocatore. Gestisce le scelte e gli skill check (chiamando `PlayerManager.skill_check`). L'integrazione avviene in `MainGame.gd`.
  - **Stato:** COMPLETATO.

- **M3.BUG-FIX: Doppio Avanzamento Tempo (CRITICO - v0.2.6)**
  - **Problema Risolto:** Due istanze separate di `World.tscn` causavano doppio avanzamento tempo (60 min invece di 30), messaggi duplicati nel log, e penalità duplicate per HP notturna e attraversamento fiumi.
  - **Soluzione Implementata:** 
    - Rimossa istanza duplicata da `MainGame.tscn`
    - Consolidata architettura con World unico nel SubViewport di GameUI
    - Refactoring `MainGame.gd` per connessione dinamica segnali via `GameUI.get_world_scene()`
    - Nuovo test anti-regressione "Double World Prevention"
  - **Stato:** RISOLTO DEFINITIVAMENTE - v0.2.6 "No More Double Steps"

---

## **3. Milestone Future (Pianificazione)**

Questa sezione delinea i prossimi passi dello sviluppo.

---

### **🎯 MILESTONE 4: SISTEMA DI COMBATTIMENTO**
**Obiettivo:** Implementare un sistema di combattimento a turni, testuale e tattico.

- **M4.T1: Combat Engine e Manager**
  - **Descrizione:** Creare il gestore principale del combattimento.
  - **Proposta Tecnica:**
    - Creare un nuovo Singleton `CombatManager.gd`.
    - `CombatManager` gestirà lo stato del combattimento (turno del giocatore, turno del nemico), la logica di attacco (tiro per colpire vs CA), il calcolo del danno e la risoluzione degli effetti.
    - Il combattimento verrà avviato tramite un segnale, probabilmente da `EventManager` (per incontri casuali).

- **M4.T2: UI di Combattimento**
  - **Descrizione:** Creare l'interfaccia utente per il combattimento.
  - **Proposta Tecnica:**
    - Creare una nuova scena `CombatUI.tscn` come popup modale (simile a `EventPopup`).
    - La UI mostrerà le statistiche del giocatore e del nemico, un log di combattimento testuale e le azioni disponibili per il giocatore (Attacca, Usa Oggetto, Fuggi).
    - La UI sarà guidata dai segnali inviati da `CombatManager`.

- **M4.T3: Integrazione Nemici**
  - **Descrizione:** Caricare i dati dei nemici e implementarli nel combattimento.
  - **Proposta Tecnica:**
    - Creare un file `data/enemies/enemies.json` per definire le statistiche e le abilità dei nemici.
    - `DataManager` dovrà essere aggiornato per caricare questi dati.
    - `CombatManager` userà questi dati per istanziare i nemici all'inizio del combattimento.

- **M4.T4: Integrazione con l'Inventario**
  - **Descrizione:** Collegare le armi e le armature equipaggiate al sistema di combattimento.
  - **Proposta Tecnica:**
    - `CombatManager` dovrà leggere l'arma e l'armatura equipaggiate da `PlayerManager` all'inizio di ogni combattimento.
    - I bonus di attacco, il tipo di danno e la classe armatura verranno calcolati dinamicamente in base a questi oggetti.
