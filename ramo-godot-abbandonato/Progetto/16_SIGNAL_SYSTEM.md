# 📡 SISTEMA SEGNALI - THE SAFE PLACE v0.4.1

## 🎯 **OVERVIEW SISTEMA SEGNALI**

Il sistema di segnali Godot è il backbone della comunicazione tra componenti in The Safe Place. Implementa un'architettura event-driven che garantisce decoupling e reattività.

---

## 🔄 **ARCHITETTURA SEGNALI**

### **Tipi di Segnali**
```gdscript
# Segnali di stato
signal inventory_changed                    # PlayerManager → UI
signal stats_changed                       # PlayerManager → UI
signal resources_changed                   # PlayerManager → UI

# Segnali di azione
signal event_triggered(event_data)         # EventManager → EventPopup
signal map_move(direction)                 # InputManager → World

# Segnali temporali
signal time_changed(hour, minute)          # TimeManager → UI
signal day_changed(day)                    # TimeManager → UI
signal survival_penalty_tick               # TimeManager → PlayerManager
```

### **Connessioni Standard**
```gdscript
func _ready():
    # Connessioni one-to-many
    PlayerManager.inventory_changed.connect(_update_inventory_panel)
    PlayerManager.stats_changed.connect(_update_stats_panel)
    
    # Connessioni con parametri
    TimeManager.time_changed.connect(_update_time_display)
    
    # Connessioni condizionali
    if EventManager:
        EventManager.event_triggered.connect(_show_event_popup)
```

---

## 📊 **GESTIONE SEGNALI**

### **Signal Lifecycle**
```gdscript
# Creazione segnale
signal my_custom_signal(param1, param2)

# Emissione segnale
func _trigger_event():
    my_custom_signal.emit("value1", 42)

# Connessione segnale
func _setup_connections():
    my_custom_signal.connect(_handle_event)

# Disconnessione
func _cleanup():
    my_custom_signal.disconnect(_handle_event)
```

### **Signal Parameters**
```gdscript
# Parametri tipizzati
signal item_used(item_id: String, quantity: int, success: bool)

# Parametri complessi
signal event_resolved(result: Dictionary, narrative: String)

# Parametri opzionali
signal debug_info(message: String, data: Dictionary = {})
```

---

## 🔧 **PATTERN SEGNALI**

### **Observer Pattern via Segnali**
```gdscript
# Subject (Observable)
class PlayerManager:
    signal health_changed(new_hp: int, max_hp: int)
    
    func modify_hp(amount: int):
        hp = clamp(hp + amount, 0, max_hp)
        health_changed.emit(hp, max_hp)

# Observer
class HealthBar:
    func _ready():
        PlayerManager.health_changed.connect(_update_bar)
    
    func _update_bar(current: int, maximum: int):
        value = (current * 100) / maximum
```

### **Mediator Pattern**
```gdscript
# GameUI come mediatore
class GameUI:
    func _ready():
        # Coordina segnali tra sistemi
        PlayerManager.inventory_changed.connect(InventoryPanel._refresh)
        EventManager.event_triggered.connect(EventPopup._show)
        TimeManager.time_changed.connect(InfoPanel._update)
```

---

## ⚡ **OTTIMIZZAZIONI PERFORMANCE**

### **Signal Batching**
```gdscript
# Evita emissioni multiple ravvicinate
var pending_updates = []
var update_timer: Timer

func _queue_ui_update(update_type: String):
    if not update_type in pending_updates:
        pending_updates.append(update_type)
    
    if not update_timer.is_connected("timeout", _process_updates):
        update_timer.timeout.connect(_process_updates)
        update_timer.start(0.1)  # Batch ogni 100ms

func _process_updates():
    for update in pending_updates:
        match update:
            "inventory": inventory_changed.emit()
            "stats": stats_changed.emit()
    pending_updates.clear()
```

### **Lazy Connections**
```gdscript
# Connetti solo quando necessario
func _on_popup_opened():
    if not EventManager.event_triggered.is_connected(_handle_event):
        EventManager.event_triggered.connect(_handle_event)

func _on_popup_closed():
    if EventManager.event_triggered.is_connected(_handle_event):
        EventManager.event_triggered.disconnect(_handle_event)
```

---

## 🧪 **TESTING SEGNALI**

### **Signal Testing**
```gdscript
func test_inventory_signal():
    var signal_received = false
    var received_item = ""
    
    PlayerManager.inventory_changed.connect(
        func(): signal_received = true
    )
    
    PlayerManager.add_item("sword", 1)
    
    assert(signal_received, "Signal inventory_changed not emitted")
```

### **Mock Signals**
```gdscript
class MockEventManager:
    signal event_triggered(data)
    
    func trigger_mock_event():
        event_triggered.emit({"id": "test_event"})
```

---

## 📋 **CONVENZIONI SEGNALI**

### **Naming Conventions**
```gdscript
# Stato cambiato
signal [system]_changed
# inventory_changed, stats_changed, time_changed

# Azione richiesta
signal [action]_requested
# level_up_requested, save_requested

# Evento accaduto
signal [event]_triggered
# event_triggered, damage_taken

# Risultato fornito
signal [result]_generated
# narrative_generated, roll_result_generated
```

### **Parameter Order**
```gdscript
# Consistente: valore corrente, valore massimo, modificatore
signal health_changed(current: int, maximum: int, change: int)

# Logico: soggetto, oggetto, contesto
signal item_used(item_id: String, quantity: int, context: String)
```

---

## 🔍 **DEBUGGING SEGNALI**

### **Signal Monitoring**
```gdscript
func _debug_signal_connection():
    var connections = inventory_changed.get_connections()
    TSPLogger.debug("Signal connections: %d" % connections.size())
    
    for conn in connections:
        TSPLogger.debug("Connected to: %s" % conn.callable.get_method())
```

### **Signal Tracing**
```gdscript
# Wrapper per tracing
func emit_with_trace(signal_name: String, args = []):
    TSPLogger.debug("Signal", "Emitting %s with args: %s" % [signal_name, args])
    call(signal_name, args)
```

---

## 📊 **METRICHE SEGNALI**

### **Performance Metrics**
- **Emission Frequency**: < 100 emissions/second
- **Connection Count**: < 50 connections per signal
- **Parameter Size**: < 1KB per emission

### **Reliability Metrics**
- **Delivery Rate**: 100% (segnali Godot garantiti)
- **Order Preservation**: Mantenuto
- **Thread Safety**: Thread-safe per design

---

**Versione:** v0.4.1 "Write Only When You're Not Drunk"  
**Data:** 22 Settembre 2025  
**Target:** LLM Technical Analysis