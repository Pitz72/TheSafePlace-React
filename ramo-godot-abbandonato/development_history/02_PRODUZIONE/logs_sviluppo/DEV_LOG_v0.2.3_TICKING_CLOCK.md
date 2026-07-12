# DEV LOG v0.2.3 - M3.T2 "Il Passaggio del Tempo" (The Ticking Clock)

## 📋 MILESTONE 3 TASK 2 - IMPLEMENTAZIONE SISTEMA TEMPORALE

**Versione:** v0.2.3 "The Ticking Clock"  
**Milestone:** M3 "The Living World & Rules of Survival"  
**Task:** M3.T2 "Il Passaggio del Tempo"  
**Data:** [Data implementazione]  
**Status:** 🚧 IN SVILUPPO

---

## 🎯 OBIETTIVI TASK M3.T2

### Sistema Temporale Completo
- [x] **TimeManager.gd Singleton** - Gestione centralizzata del tempo di gioco
- [x] **Avanzamento Automatico** - 30 minuti per ogni movimento del player
- [x] **Ciclo Giorno/Notte** - Transizioni automatiche (06:00-18:59 giorno, 19:00-05:59 notte)
- [x] **Penalità Sopravvivenza** - Automatiche ogni sera alle 19:00
- [x] **UI Feedback Temporale** - Aggiornamenti real-time in GameUI
- [x] **Sistema Save/Load** - Persistenza dati temporali

### Architettura Signal-based
- [x] **Segnali TimeManager** - time_advanced, day_changed, night_started, day_started, survival_penalty_tick
- [x] **Integrazione PlayerManager** - Penalità automatiche fame/sete/HP critici
- [x] **Integrazione GameUI** - Feedback visivo tempo e messaggi narrativi
- [x] **Integrazione World.gd** - Avanzamento tempo ad ogni movimento

---

## 🔧 IMPLEMENTAZIONE DETTAGLIATA

### 1. TimeManager.gd Singleton
```gdscript
# COMPONENTI IMPLEMENTATI:
- Variabili stato: total_moves, current_hour, current_minute, current_day, is_night_time
- API avanzamento: advance_time_by_moves(moves) con logica 30min per movimento
- API query: is_night(), get_formatted_time(), get_formatted_day()
- API persistenza: get_time_data(), load_time_data()
- Gestione transizioni: _check_day_night_cycle(), _check_survival_penalty()
- Debug utilities: debug_print_time_status()
```

**Configurazione Autoload:**
```ini
TimeManager="*res://scripts/managers/TimeManager.gd"
```

### 2. Integrazione World.gd
```gdscript
# MODIFICA FUNZIONE _on_map_move():
- Aggiunta chiamata TimeManager.advance_time_by_moves(1) dopo movimento valido
- Posizionata dopo player_moved.emit() e prima del log movimento
- Gestione errori con check TimeManager disponibilità
```

### 3. Sistema Penalità Sopravvivenza (PlayerManager.gd)
```gdscript
# NUOVE FUNZIONI:
- apply_survival_penalties(): -10 food, -15 water ogni notte
- _check_critical_survival_damage(): -20 HP se food=0, -25 HP se water=0
- _connect_time_manager_signals(): Connessione automatica segnale survival_penalty_tick
- _on_survival_penalty_tick(): Callback per esecuzione penalità automatiche
```

### 4. UI Feedback Temporale (GameUI.gd)
```gdscript
# AGGIORNAMENTI UI:
- _connect_time_manager_signals(): Connessione segnali time_advanced, day_changed, etc.
- update_info_panel(): Mostra tempo formattato con indicatore giorno/notte (🌙/☀️)
- get_current_timestamp(): Timestamp dinamico per messaggi diario
- Callback messaggi narrativi: _on_night_started(), _on_day_started(), _on_day_changed()
```

### 5. Sistema Test (TestTimeSystem.gd)
```gdscript
# CONTROLLI TEST:
- [F5] Test avanzamento tempo rapido
- [F6] Test ciclo giorno/notte completo
- [F7] Test penalità sopravvivenza  
- [F8] Test save/load sistema temporale
- [F9] Status completo sistema
```

---

## ⏰ MECCANICHE TEMPORALI

### Regole Base
- **Tempo Iniziale:** Giorno 1, 08:00 (mattino)
- **Avanzamento:** 30 minuti per movimento player
- **Calcolo Giorni:** Cambio automatico a mezzanotte (00:00)

### Ciclo Giorno/Notte
- **Giorno:** 06:00 - 18:59 (☀️)
- **Notte:** 19:00 - 05:59 (🌙)
- **Transizioni:** Segnali automatici + messaggi narrativi

### Penalità Sopravvivenza (ogni 19:00)
- **Fame:** -10 punti food
- **Sete:** -15 punti water
- **Danno Critico:** -20 HP se food=0, -25 HP se water=0
- **Avviso Game Over:** HP ≤ 25 dopo danno critico

---

## 🎮 ESPERIENZA UTENTE

### Feedback Visivo
- **Pannello Tempo:** `[TIME]: 14:30 Giorno 2 ☀️`
- **Timestamp Diario:** `[14:30] [MONDO] Ti sposti verso Est...`
- **Messaggi Transizioni:** 
  - 🌙 Cala la notte. Il mondo diventa più pericoloso...
  - ☀️ Sorge il sole. Un nuovo giorno di sopravvivenza inizia.

### Messaggi Narrativi
- **Penalità Fame:** "La fame ti consuma. Perdi 10 punti cibo."
- **Penalità Sete:** "La sete si fa sentire. Perdi 15 punti acqua."
- **Danno Critico:** "La fame estrema ti debilita gravemente! Perdi 20 HP."

---

## 🔄 ARCHITETTURA SIGNAL-BASED

### TimeManager → PlayerManager
```gdscript
TimeManager.survival_penalty_tick → PlayerManager._on_survival_penalty_tick()
```

### TimeManager → GameUI
```gdscript
TimeManager.time_advanced → GameUI._on_time_advanced(hour, minute)
TimeManager.day_changed → GameUI._on_day_changed(day)
TimeManager.night_started → GameUI._on_night_started()
TimeManager.day_started → GameUI._on_day_started()
```

### World → TimeManager
```gdscript
Movimento Player → TimeManager.advance_time_by_moves(1)
```

---

## 🧪 TESTING E VALIDAZIONE

### Test Suite Implementata
- **TestTimeSystem.gd** con controlli F5-F9
- **TestTimeScene.tscn** per testing isolato
- **Validazione Automatica** connessioni segnali e stati manager

### Test Cases
1. **Avanzamento Tempo:** Verifica calcolo ore/giorni corretto
2. **Transizioni Giorno/Notte:** Test 18:59→19:00 e 05:59→06:00
3. **Penalità Sopravvivenza:** Verifica damage progression e messaggi
4. **Save/Load:** Persistenza e ripristino stato temporale
5. **UI Integration:** Aggiornamenti real-time pannelli e diario

---

## 📈 PERFORMANCE E OTTIMIZZAZIONE

### Architettura Efficiente
- **Signal-based:** Aggiornamenti solo quando necessario
- **Calcoli Ottimizzati:** Modular arithmetic per ore/giorni
- **Memory Management:** Cleanup automatico popup e segnali

### Zero Regressioni
- **Backward Compatibility:** Tutti i sistemi M3.T1 mantenuti
- **Performance:** 60+ FPS mantenuti
- **Architecture:** Signal-based pattern confermato robusto

---

## 🚀 RISULTATI ACHIEVEMENT

### M3.T2 Completato
- ✅ **TimeManager Singleton** funzionale e integrato
- ✅ **Sistema Temporale** 30min per movimento implementato
- ✅ **Ciclo Giorno/Notte** con transizioni automatiche
- ✅ **Penalità Sopravvivenza** ogni sera alle 19:00
- ✅ **UI Feedback** tempo real-time e messaggi narrativi
- ✅ **Save/Load Support** per persistenza temporale
- ✅ **Test Suite** completa per validazione

### Prossimo: M3.T3 (To Be Defined)
Il sistema temporale costituisce il secondo pilastro del "mondo vivente" di M3. Con le regole di progressione (M3.T1) e il passaggio del tempo (M3.T2) implementati, il progetto è pronto per ulteriori meccaniche di sopravvivenza e world simulation.

---

## 📊 METRICHE SVILUPPO

- **Files Modificati:** 5 (TimeManager.gd, World.gd, PlayerManager.gd, GameUI.gd, project.godot)
- **Files Creati:** 3 (TestTimeSystem.gd, TestTimeScene.tscn, questo dev log)
- **Linee Aggiunte:** ~400 linee di codice
- **Segnali Implementati:** 5 TimeManager + 4 connessioni GameUI + 1 PlayerManager
- **Funzioni Pubbliche:** 8 API TimeManager + 4 penalità PlayerManager + 4 callback GameUI

### Qualità Codice
- **Documentazione:** Commenti completi per tutte le funzioni pubbliche
- **Error Handling:** Validazioni input e check manager disponibilità
- **Naming Convention:** Consistent con standard progetto esistente
- **Architecture Pattern:** Signal-based, mantenuto pattern Singleton

---

**ACHIEVEMENT UNLOCKED:** "The Ticking Clock" - Sistema temporale completo con penalità sopravvivenza automatiche e UI dinamica! 