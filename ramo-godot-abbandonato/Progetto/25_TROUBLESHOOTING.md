# 🔧 TROUBLESHOOTING - THE SAFE PLACE v0.4.1

## 🎯 **GUIDA RISOLUZIONE PROBLEMI**

Soluzioni per problemi comuni di sviluppo e runtime.

---

## 🚫 **ERRORI COMUNI**

### **"Class 'Logger' hides a global script class"**
**Sintomo**: Errore compilazione GDScript
**Causa**: Conflitto con classe globale Godot
**Soluzione**: Rinominare classe in `TSPLogger`

### **Eventi non si attivano**
**Sintomo**: Nessun evento durante movimento
**Causa**: Probabilità troppo basse
**Soluzione**: Verificare `biome_event_chances` in EventManager

### **UI non si aggiorna**
**Sintomo**: Cambiamenti non riflessi in interfaccia
**Causa**: Segnali non connessi
**Soluzione**: Verificare connessioni signal in `_ready()`

---

## 🐛 **DEBUGGING STEPS**

### **1. Controllo Base**
```gdscript
# Verifica manager caricati
func _ready():
    print("PlayerManager: ", PlayerManager != null)
    print("EventManager: ", EventManager != null)
    print("DataManager: ", DataManager != null)
```

### **2. Signal Debugging**
```gdscript
# Monitora emissioni segnale
PlayerManager.inventory_changed.connect(
    func(): print("Inventory changed signal received")
)
```

### **3. State Inspection**
```gdscript
# Debug F9 per stato sistema
func _input(event):
    if event.is_action_pressed("debug_f9"):
        print_player_state()
        print_event_stats()
```

---

## ⚡ **PROBLEMI PERFORMANCE**

### **FPS Bassi**
**Possibili Cause**:
- Troppi aggiornamenti UI simultanei
- Cache non funzionante
- Shader CRT pesanti

**Soluzioni**:
- Implementare signal batching
- Verificare cache DataManager
- Ridurre qualità shader

### **Memory Leak**
**Sintomi**: RAM crescente durante gameplay
**Cause**: Riferimenti circolari, scene non liberate
**Fix**: Implementare `_exit_tree()` cleanup

---

## 🔧 **FIXES COMUNI**

### **Fix Sintassi Empty If**
```gdscript
# BEFORE (errore)
if debug_mode:
    print("debug")

# AFTER (corretto)
if debug_mode:
    print("debug")
    pass  # o rimuovi blocco vuoto
```

### **Fix Signal Connections**
```gdscript
# BEFORE (connessione debole)
some_signal.connect(callable)

# AFTER (connessione robusta)
if not some_signal.is_connected(callable):
    some_signal.connect(callable)
```

---

## 📊 **STRUMENTI DIAGNOSTICI**

### **Performance Monitor**
```gdscript
func get_performance_stats():
    return {
        "fps": Performance.get_monitor(Performance.TIME_FPS),
        "memory": Performance.get_monitor(Performance.MEMORY_STATIC),
        "objects": Performance.get_monitor(Performance.OBJECT_COUNT)
    }
```

### **System Info**
```gdscript
func print_system_info():
    print("Godot Version: ", Engine.get_version_info())
    print("OS: ", OS.get_name())
    print("Video Driver: ", OS.get_video_driver_name())
```

---

## 🚨 **CRASH REPORTING**

### **Informazioni da Includere**
- Versione Godot e OS
- Log completo errore
- Steps to reproduce
- File modificati recentemente

### **Emergency Fixes**
- **Rollback**: `git checkout` versione stabile
- **Safe Mode**: Disabilitare features problematiche
- **Fallback**: Implementare comportamenti safe

---

**Versione:** v0.4.1  
**Data:** 22 Settembre 2025