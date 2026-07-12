# ⌨️ SISTEMA INPUT - THE SAFE PLACE v0.4.1

## 🎯 **OVERVIEW DEL SISTEMA INPUT**

L'InputManager è il singleton responsabile della gestione di tutti gli input utente, mappature tasti e stati di input. Implementa un sistema keyboard-only con gestione conflitti e stati multipli.

### **Caratteristiche Principali**
- **Keyboard-Only**: Nessun supporto mouse
- **State-Based**: Stati input contestuali
- **Conflict Resolution**: Gestione conflitti input
- **Hotkey System**: Scorciatoie rapide configurabili

---

## 🏗️ **ARCHITETTURA INPUT**

### **Stati Input**
```gdscript
enum InputState {
    WORLD_NAVIGATION,    # Navigazione mondo (default)
    POPUP_INTERACTION,   # Interazione popup modali
    INVENTORY_MODE,      # Gestione inventario
    DEBUG_MODE          # Modalità debug
}
```

### **Input Mappings (project.godot)**
```ini
[move_up]
events = [W, Up Arrow]

[move_down] 
events = [S, Down Arrow]

[move_left]
events = [A, Left Arrow]

[move_right]
events = [D, Right Arrow]

[ui_accept]
events = [Enter, Space]

[ui_cancel]
events = [Escape]

[ui_inventory]
events = [I]

[debug_f9]
events = [F9]
```

---

## 📊 **VARIABILI PRINCIPALI**

### **Stato Corrente**
```gdscript
var current_input_state: InputState = InputState.WORLD_NAVIGATION
var input_enabled: bool = true
var debug_mode: bool = false
```

### **Buffer Input**
```gdscript
var input_buffer: Array[InputEvent] = []
var max_buffer_size: int = 5
```

---

## 🔄 **PROCESSING INPUT**

### **Main Loop (_process)**
```gdscript
func _process(delta: float):
    if not input_enabled:
        return
    
    # Processa input basato su stato corrente
    match current_input_state:
        InputState.WORLD_NAVIGATION:
            _process_world_navigation()
        InputState.POPUP_INTERACTION:
            _process_popup_interaction()
        InputState.INVENTORY_MODE:
            _process_inventory_mode()
```

### **World Navigation**
```gdscript
func _process_world_navigation():
    # Movimento cardinale
    if Input.is_action_just_pressed("move_up"):
        _emit_move_signal(Vector2.UP)
    elif Input.is_action_just_pressed("move_down"):
        _emit_move_signal(Vector2.DOWN)
    elif Input.is_action_just_pressed("move_left"):
        _emit_move_signal(Vector2.LEFT)
    elif Input.is_action_just_pressed("move_right"):
        _emit_move_signal(Vector2.RIGHT)
    
    # Comandi speciali
    if Input.is_action_just_pressed("ui_inventory"):
        switch_to_inventory_mode()
    elif Input.is_action_just_pressed("debug_f9"):
        toggle_debug_mode()
```

---

## 📡 **SISTEMA SEGNALI**

### **Segnali Pubblici**
```gdscript
signal map_move(direction: Vector2)           # Movimento nel mondo
signal inventory_toggle                       # Toggle inventario
signal popup_accept                           # Accettazione popup
signal popup_cancel                           # Annullamento popup
signal debug_toggle                           # Toggle debug mode
signal input_state_changed(new_state: InputState)  # Cambio stato
```

### **Utilizzo Segnali**
```gdscript
# World riceve movimenti
map_move.connect(World._on_player_move)

# GameUI gestisce inventory
inventory_toggle.connect(GameUI._toggle_inventory)

# Popup ricevono interazioni
popup_accept.connect(EventPopup._on_choice_selected)
```

---

## 🔄 **GESTIONE STATI**

### **Switching States**
```gdscript
func switch_to_world_navigation():
    current_input_state = InputState.WORLD_NAVIGATION
    input_state_changed.emit(current_input_state)
    TSPLogger.info("InputManager", "Switched to WORLD_NAVIGATION")

func switch_to_popup_interaction():
    current_input_state = InputState.POPUP_INTERACTION
    input_state_changed.emit(current_input_state)
    TSPLogger.info("InputManager", "Switched to POPUP_INTERACTION")

func switch_to_inventory_mode():
    current_input_state = InputState.INVENTORY_MODE
    input_state_changed.emit(current_input_state)
    TSPLogger.info("InputManager", "Switched to INVENTORY_MODE")
```

### **State Callbacks**
```gdscript
# Chiamato da GameUI quando apre popup
func on_popup_opened():
    switch_to_popup_interaction()

# Chiamato da GameUI quando chiude popup
func on_popup_closed():
    switch_to_world_navigation()
```

---

## 🎯 **HOTKEY SYSTEM**

### **Inventory Hotkeys**
```gdscript
func _process_inventory_mode():
    # Hotkey 1-9 per uso oggetti
    for i in range(1, 10):
        var action = "inventory_slot_%d" % i
        if Input.is_action_just_pressed(action):
            _use_inventory_slot(i - 1)  # 0-based index
            break
    
    # ESC per uscire inventory
    if Input.is_action_just_pressed("ui_cancel"):
        switch_to_world_navigation()
```

### **Dynamic Hotkey Registration**
```gdscript
func register_inventory_hotkeys():
    for i in range(1, 10):
        var action_name = "inventory_slot_%d" % i
        var key_code = KEY_1 + (i - 1)  # KEY_1 to KEY_9
        
        # Registra input map dinamicamente
        var event = InputEventKey.new()
        event.keycode = key_code
        InputMap.add_action(action_name)
        InputMap.action_add_event(action_name, event)
```

---

## 🛡️ **GESTIONE CONFLITTI**

### **Input Validation**
```gdscript
func _validate_input_event(event: InputEvent) -> bool:
    # Controlla se input è valido per stato corrente
    match current_input_state:
        InputState.WORLD_NAVIGATION:
            return _is_world_navigation_input(event)
        InputState.POPUP_INTERACTION:
            return _is_popup_input(event)
        InputState.INVENTORY_MODE:
            return _is_inventory_input(event)
    
    return false
```

### **Conflict Resolution**
```gdscript
func resolve_input_conflict(event: InputEvent) -> InputEvent:
    # Priorità: Debug > Popup > Inventory > World
    if _is_debug_input(event):
        return event
    
    if current_input_state == InputState.POPUP_INTERACTION:
        if _is_popup_input(event):
            return event
    
    # Fallback a movimento
    return _get_movement_event(event)
```

---

## 🐛 **DEBUG SYSTEM**

### **Debug Toggle**
```gdscript
func toggle_debug_mode():
    debug_mode = !debug_mode
    if debug_mode:
        current_input_state = InputState.DEBUG_MODE
        debug_toggle.emit(true)
        TSPLogger.info("InputManager", "Debug mode ENABLED")
    else:
        switch_to_world_navigation()
        debug_toggle.emit(false)
        TSPLogger.info("InputManager", "Debug mode DISABLED")
```

### **Debug Features**
```gdscript
func _process_debug_mode():
    if Input.is_key_pressed(KEY_F10):
        _debug_spawn_random_event()
    elif Input.is_key_pressed(KEY_F11):
        _debug_teleport_player()
    elif Input.is_key_pressed(KEY_F12):
        _debug_full_heal()
```

---

## 📊 **PERFORMANCE E OTTIMIZZAZIONI**

### **Input Polling Optimization**
```gdscript
# Cache input states per ridurre chiamate
var _cached_input_states: Dictionary = {}

func _update_cached_inputs():
    _cached_input_states["move_up"] = Input.is_action_pressed("move_up")
    _cached_input_states["move_down"] = Input.is_action_pressed("move_down")
    # ... altri input
```

### **Buffer Management**
```gdscript
func _manage_input_buffer():
    # Limita dimensione buffer
    while input_buffer.size() > max_buffer_size:
        input_buffer.pop_front()
    
    # Processa buffer in ordine
    for event in input_buffer:
        _process_input_event(event)
    
    input_buffer.clear()
```

---

## 🧪 **TESTING INPUT**

### **Unit Tests**
```gdscript
func test_input_state_switching():
    switch_to_popup_interaction()
    assert(current_input_state == InputState.POPUP_INTERACTION)
    
    switch_to_world_navigation()
    assert(current_input_state == InputState.WORLD_NAVIGATION)

func test_movement_signals():
    var signal_received = false
    map_move.connect(func(dir): signal_received = true)
    
    # Simula input
    _emit_move_signal(Vector2.UP)
    assert(signal_received)
```

### **Integration Tests**
```gdscript
func test_popup_interaction_flow():
    # Apri popup
    on_popup_opened()
    assert(current_input_state == InputState.POPUP_INTERACTION)
    
    # Simula scelta
    _emit_popup_accept()
    
    # Chiudi popup
    on_popup_closed()
    assert(current_input_state == InputState.WORLD_NAVIGATION)
```

---

## 🔧 **CONFIGURAZIONE AVANZATA**

### **Custom Keybindings**
```gdscript
func load_custom_keybindings(config: Dictionary):
    for action in config.keys():
        var key_code = config[action]
        _remap_action(action, key_code)

func _remap_action(action_name: String, key_code: int):
    # Rimuovi mapping esistenti
    InputMap.action_erase_events(action_name)
    
    # Aggiungi nuovo mapping
    var event = InputEventKey.new()
    event.keycode = key_code
    InputMap.action_add_event(action_name, event)
```

### **Accessibility Options**
```gdscript
var key_repeat_enabled: bool = true
var key_repeat_delay: float = 0.5
var key_repeat_rate: float = 0.1

func configure_accessibility(options: Dictionary):
    key_repeat_enabled = options.get("key_repeat", true)
    key_repeat_delay = options.get("repeat_delay", 0.5)
    # Applica configurazioni input
```

---

## 🔮 **EVOLUZIONE FUTURA**

### **Miglioramenti Pianificati**
- **Controller Support**: Gamepad integration
- **Touch Input**: Mobile/tablet support
- **Voice Commands**: Speech-to-text input
- **Gesture Recognition**: Advanced input methods

### **Estensioni Possibili**
- **Macro System**: Sequenze input registrabili
- **Input Recording**: Playback per testing/demos
- **Network Input**: Multiplayer input sync
- **AI Input Simulation**: Bot testing

---

## 📋 **API PUBBLICA**

### **State Management**
```gdscript
func switch_to_world_navigation() -> void
func switch_to_popup_interaction() -> void
func switch_to_inventory_mode() -> void
func get_current_input_state() -> InputState
```

### **Input Control**
```gdscript
func enable_input() -> void
func disable_input() -> void
func is_input_enabled() -> bool
```

### **Debug & Testing**
```gdscript
func toggle_debug_mode() -> void
func register_inventory_hotkeys() -> void
func load_custom_keybindings(config: Dictionary) -> void
```

---

**Versione:** v0.4.1 "Write Only When You're Not Drunk"  
**Data:** 22 Settembre 2025  
**Target:** LLM Technical Analysis