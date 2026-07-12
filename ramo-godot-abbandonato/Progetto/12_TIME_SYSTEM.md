# ⏰ SISTEMA TEMPO - THE SAFE PLACE v0.4.1

## 🎯 **OVERVIEW DEL SISTEMA TEMPO**

Il TimeManager è un singleton che gestisce il ciclo giorno/notte, il tempo di gioco e le penalità temporali. Implementa un sistema real-time con meccaniche di sopravvivenza basate sul passare del tempo.

### **Caratteristiche Principali**
- **Ciclo Giornaliero**: 24 ore di gioco con fasi giorno/notte
- **Penalità Automatiche**: Conseguenze per la sopravvivenza
- **Integrazione Survival**: Collegamento con PlayerManager
- **Event Timing**: Trigger temporali per eventi di gioco

---

## 🕐 **ARCHITETTURA TEMPORALE**

### **Unità di Tempo**
- **Base Time Unit**: 1 secondo reale = 1 minuto di gioco
- **Movement Cost**: Ogni movimento = 30 minuti di gioco
- **Night Cycle**: Penalità ogni 24 ore alle 19:00

### **Ciclo Giornaliero**
```gdscript
enum TimeOfDay {
    DAWN,      # 06:00 - 08:00
    MORNING,   # 08:00 - 12:00
    NOON,      # 12:00 - 14:00
    AFTERNOON, # 14:00 - 18:00
    DUSK,      # 18:00 - 20:00
    NIGHT,     # 20:00 - 06:00
}
```

---

## 📊 **VARIABILI PRINCIPALI**

### **Stato Temporale**
```gdscript
var current_hour: int = 8        # 0-23
var current_minute: int = 0      # 0-59
var current_day: int = 1         # Giorno corrente
var total_minutes: int = 480     # Minuti totali passati (8:00)
```

### **Flag di Stato**
```gdscript
var is_night_time: bool = false  # True se notte (20:00-06:00)
var survival_penalty_applied: bool = false  # Penalità già applicate oggi
```

---

## 🔄 **FLUSSO TEMPORALE**

### **1. Inizializzazione**
```gdscript
func _ready():
    # Imposta ora di partenza (8:00)
    current_hour = 8
    current_minute = 0
    _update_time_of_day()
    _emit_time_signals()
```

### **2. Avanzamento Tempo**
```gdscript
func advance_time_by_moves(moves: int):
    var minutes_to_add = moves * 30  # 30 minuti per movimento
    _add_minutes(minutes_to_add)
```

### **3. Aggiornamento Stato**
```gdscript
func _add_minutes(minutes: int):
    total_minutes += minutes
    _calculate_current_time()
    _check_night_penalty()
    _emit_time_signals()
```

---

## 🌙 **MECCANICHE NOTTURNE**

### **Penalità Sopravvivenza**
```gdscript
func _check_night_penalty():
    if _is_time_for_penalty() and not survival_penalty_applied:
        survival_penalty_applied = true
        survival_penalty_tick.emit()
```

### **Trigger Penalità**
- **Ora**: 19:00 (7 PM)
- **Condizione**: Prima volta al giorno
- **Reset**: Ogni nuovo giorno a mezzanotte

### **Conseguenze (PlayerManager)**
```gdscript
# Collegato via segnale
TimeManager.survival_penalty_tick.connect(_on_survival_penalty_tick)

func _on_survival_penalty_tick():
    apply_survival_penalties()  # -10 food, -15 water, danno critico
```

---

## 📡 **SISTEMA SEGNALI**

### **Segnali Pubblici**
```gdscript
signal time_changed(new_hour: int, new_minute: int)
signal day_changed(new_day: int)
signal time_of_day_changed(new_time_of_day: TimeOfDay)
signal survival_penalty_tick()  # Trigger penalità notturne
```

### **Utilizzo Segnali**
```gdscript
# InfoPanel aggiorna display ora
time_changed.connect(InfoPanel._update_time_display)

# World applica effetti notte
time_of_day_changed.connect(World._on_time_of_day_changed)

# PlayerManager applica penalità
survival_penalty_tick.connect(PlayerManager.apply_survival_penalties)
```

---

## 🛠️ **API PUBBLICA**

### **Query Temporali**
```gdscript
func get_current_time_string() -> String:
    return "%02d:%02d" % [current_hour, current_minute]

func get_time_of_day() -> TimeOfDay:
    if current_hour >= 6 and current_hour < 8: return TimeOfDay.DAWN
    if current_hour >= 8 and current_hour < 12: return TimeOfDay.MORNING
    # ... altre condizioni

func is_night() -> bool:
    return current_hour >= 20 or current_hour < 6
```

### **Manipolazione Tempo**
```gdscript
func advance_time_by_moves(moves: int):
    # Avanza tempo basato su movimenti
    var minutes = moves * 30
    _add_minutes(minutes)

func advance_to_next_hour():
    # Salta all'ora successiva
    var minutes_to_next_hour = 60 - current_minute
    _add_minutes(minutes_to_next_hour)
```

---

## 💾 **PERSISTENZA DATI**

### **Save Data**
```gdscript
func get_save_data() -> Dictionary:
    return {
        "current_hour": current_hour,
        "current_minute": current_minute,
        "current_day": current_day,
        "total_minutes": total_minutes,
        "survival_penalty_applied": survival_penalty_applied
    }
```

### **Load Data**
```gdscript
func load_save_data(data: Dictionary):
    current_hour = data.get("current_hour", 8)
    current_minute = data.get("current_minute", 0)
    current_day = data.get("current_day", 1)
    total_minutes = data.get("total_minutes", 480)
    survival_penalty_applied = data.get("survival_penalty_applied", false)
    _emit_time_signals()
```

---

## 🔧 **INTEGRAZIONE SISTEMI**

### **Con PlayerManager**
- **Segnale**: `survival_penalty_tick` → `apply_survival_penalties()`
- **Effetto**: Perdita risorse automatica ogni notte
- **Critico**: Danno HP se food/water = 0

### **Con World**
- **Movimenti**: Ogni movimento consuma 30 minuti
- **Effetti Notte**: Visibilità ridotta, pericoli aumentati
- **Eventi**: Alcuni eventi triggerati da tempo

### **Con UI**
- **InfoPanel**: Display ora corrente
- **LogPanel**: Messaggi penalità notturne
- **SurvivalPanel**: Aggiornamento barre risorse

---

## 🧪 **TESTING E DEBUG**

### **Debug Features**
```gdscript
func debug_advance_hour():
    # Debug: avanza di un'ora
    _add_minutes(60)

func debug_set_time(hour: int, minute: int):
    # Debug: imposta ora specifica
    current_hour = hour
    current_minute = minute
    _emit_time_signals()
```

### **Test Cases**
- **Ciclo Completo**: 24 ore senza crash
- **Penalità Notturne**: Applicazione corretta alle 19:00
- **Save/Load**: Stato temporale preservato
- **Segnali**: Tutti i listener aggiornati correttamente

---

## 📊 **PERFORMANCE**

### **Ottimizzazioni**
- **Lazy Updates**: Calcoli solo quando necessario
- **Signal Batching**: Aggiornamenti raggruppati
- **Memory Efficient**: Stato leggero, no allocazioni pesanti

### **Metrics**
- **CPU Usage**: <1ms per aggiornamento
- **Memory**: ~1KB per stato
- **Signal Overhead**: Minimo impatto performance

---

## 🔮 **EVOLUZIONE FUTURA**

### **Miglioramenti Pianificati**
- **Stagioni**: Cicli annuali con effetti climatici
- **Eventi Temporali**: Eventi speciali a orari specifici
- **Time Dilation**: Rallentamento tempo in situazioni critiche
- **Weather System**: Integrazione meteo con ciclo temporale

### **Estensioni Possibili**
- **Real-Time Clock**: Sincronizzazione con orologio sistema
- **Time Zones**: Diverse velocità temporali per aree
- **Historical Events**: Eventi passati influenzano presente
- **Time Travel**: Meccaniche narrative avanzate

---

**Versione:** v0.4.1 "Write Only When You're Not Drunk"  
**Data:** 22 Settembre 2025  
**Target:** LLM Technical Analysis