# ⚙️ GODOT ENGINE SPECIFICS - THE SAFE PLACE v0.9.6.5

## 🎯 **OVERVIEW TECNICO GODOT**

The Safe Place è sviluppato specificatamente per **Godot Engine 4.x** sfruttando le sue caratteristiche native e API moderne. Questo documento fornisce dettagli tecnici specifici per l'implementazione Godot.

---

## 🚀 **VERSIONE GODOT E CONFIGURAZIONE**

### **Engine Version Requirements**
```
Godot Engine: 4.4.1+ (Current: 4.4.1)
Renderer: Forward+ (Vulkan/OpenGL 3.3+)
Platform: Desktop (Windows/Linux/macOS)
Architecture: 64-bit
```

### **Project Configuration (project.godot)**
```ini
[application]
config/name="The Safe Place v0.9.5 - All the Story you don't know"
config/description="Narrative Revolution - Sistema eventi espanso con quest principale completa e easter eggs segreti"
run/main_scene="res://scenes/MainMenu.tscn"
config/features=PackedStringArray("4.4", "Forward Plus")

[gui]
theme/custom="res://themes/main_theme.tres"
theme/custom_font="res://themes/Perfect DOS VGA 437 Win.ttf"

[rendering]
textures/canvas_textures/default_texture_filter=0  # Pixel-perfect rendering
```

---

## 🧩 **SISTEMA AUTOLOAD (SINGLETON)**

### **Autoload Configuration**
```ini
[autoload]
ThemeManager="*res://scripts/ThemeManager.gd"
DataManager="*res://scripts/managers/DataManager.gd"
PlayerManager="*res://scripts/managers/PlayerManager.gd"
InputManager="*res://scripts/managers/InputManager.gd"
TimeManager="*res://scripts/managers/TimeManager.gd"
EventManager="*res://scripts/managers/EventManager.gd"
SkillCheckManager="*res://scripts/managers/SkillCheckManager.gd"
QuestManager="*res://scripts/managers/QuestManager.gd"
NarrativeManager="*res://scripts/managers/NarrativeManager.gd"
CraftingManager="*res://scripts/managers/CraftingManager.gd"
CombatManager="*res://scripts/managers/CombatManager.gd"
SaveLoadManager="*res://scripts/managers/SaveLoadManager.gd"
```

### **Autoload Order di Inizializzazione**
```
1. ThemeManager      (Tema e font)
2. DataManager       (Database JSON)
3. PlayerManager     (Stato giocatore)
4. InputManager      (Sistema input)
5. TimeManager       (Sistema temporale)
6. EventManager      (Eventi e skill check)
7. SkillCheckManager (Logic skill check)
8. QuestManager      (Sistema missioni)
9. NarrativeManager  (Sistema narrativo)
10. CraftingManager  (Sistema crafting)
11. CombatManager    (Sistema combattimento)
12. SaveLoadManager  (Sistema salvataggio)
```

### **Dipendenze tra Autoload**
```
DataManager (indipendente)
    ↓
PlayerManager (usa DataManager per validazione)
    ↓
EventManager (usa DataManager + PlayerManager)
    ↓
QuestManager (dipende da PlayerManager + DataManager)
    ↓
NarrativeManager (dipende da PlayerManager)
    ↓
CraftingManager (dipende da PlayerManager + DataManager)
    ↓
CombatManager (dipende da PlayerManager + EventManager)
    ↓
SaveLoadManager (dipende da tutti i manager per salvataggio)
```

---

## 🎨 **SISTEMA SCENE E NODES**

### **Scene Tree Architecture**
```
MainGame (Node - Root Scene)
├── GameUI (Control - UI Layer)
│   ├── MainLayout (VBoxContainer)
│   │   └── ThreeColumnLayout (HBoxContainer)
│   │       ├── LeftPanel (VBoxContainer)
│   │       │   ├── SurvivalPanel (PanelContainer)
│   │       │   └── InventoryPanel (PanelContainer)
│   │       ├── CenterPanel (VBoxContainer)
│   │       │   ├── LogPanel (PanelContainer)
│   │       │   └── MapPanel (PanelContainer)
│   │       │       └── WorldViewport (SubViewport)
│   │       └── RightPanel (VBoxContainer)
│   │           ├── InfoPanel (PanelContainer)
│   │           ├── StatsPanel (PanelContainer)
│   │           ├── EquipmentPanel (PanelContainer)
│   │           └── CommandsPanel (PanelContainer)
│   └── PopupLayer (CanvasLayer)
│       ├── EventPopup (instance dynamic)
│       ├── ItemInteractionPopup (instance dynamic)
│       ├── LevelUpPopup (instance dynamic)
│       └── CharacterCreationPopup (instance dynamic)
└── [altri nodi se necessari]
```

### **World Scene Structure**
```
World (Node2D - Istanziato in SubViewport)
├── AsciiTileMap (TileMap)
│   ├── TileSet: ascii_tileset.tres
│   ├── Tile size: 16x16 pixels
│   └── Map size: 250x250 tiles
├── SpecialPoints (Node2D - Markers)
├── PlayerCharacter (Sprite2D)
│   ├── Texture: player_sprite.png
│   └── AnimationPlayer (pulse effect)
└── Camera2D
    ├── Zoom: Vector2(1.065, 1.065)
    ├── Limits: Auto-calcolati da mappa
    └── Smooth follow: Player position
```

---

## 🔧 **SISTEMA SEGNALI GODOT**

### **Signal Architecture Patterns**

#### **1. Manager-to-Manager Communication**
```gdscript
# TimeManager → PlayerManager (penalità sopravvivenza)
TimeManager.time_advanced.connect(PlayerManager._on_time_advanced)

# EventManager → PlayerManager (applicazione conseguenze)
EventManager.event_choice_resolved.connect(PlayerManager._on_event_resolved)
```

#### **2. Manager-to-UI Communication**
```gdscript
# PlayerManager → UI Panels (aggiornamenti stato)
PlayerManager.resources_changed.connect(SurvivalPanel.update_panel)
PlayerManager.stats_changed.connect(StatsPanel.update_panel)
PlayerManager.inventory_changed.connect(InventoryPanel.update_panel)

# TimeManager → UI (aggiornamenti tempo)
TimeManager.time_advanced.connect(InfoPanel.update_time_display)
```

#### **3. Input-to-System Communication**
```gdscript
# InputManager → World (movimento)
InputManager.map_move.connect(World._on_map_move)

# InputManager → UI (azioni inventario)
InputManager.inventory_use_item.connect(GameUI._on_inventory_use_item)
```

### **Signal Naming Conventions**
```
- State changes: [subject]_changed
- Action requests: [action]_requested  
- Events triggered: [event]_triggered
- Results delivered: [result]_generated
- User actions: [action]_[object]
```

---

## 📋 **GODOT-SPECIFIC IMPLEMENTATIONS**

### **1. FileAccess API (Godot 4.x)**
```gdscript
# DataManager utilizzo FileAccess moderno
func _load_json_file(file_path: String) -> Dictionary:
    var file = FileAccess.open(file_path, FileAccess.READ)
    if file == null:
        # Gestione errore file non trovato
        return {}
    
    var file_content = file.get_as_text()
    file.close()
    
    var json = JSON.new()
    var parse_result = json.parse(file_content)
    if parse_result != OK:
        # Gestione errore parsing JSON
        return {}
    
    return json.data
```

### **2. TileMap System (Godot 4.x)**
```gdscript
# World.gd - Setup TileMap moderno
func _setup_tilemap():
    var tileset = load("res://tilesets/ascii_tileset.tres")
    ascii_tilemap.tile_set = tileset
    
    # Mapping char ASCII → tile_id
    var char_to_tile_id = {
        ".": 0,  # Pianura
        "F": 1,  # Foresta  
        "M": 2,  # Montagna (collisione)
        "~": 3,  # Fiume (penalità)
        "V": 4,  # Villaggio
        "C": 5,  # Città
        "R": 6,  # Ristoro
        "S": 8,  # Start Point
        "E": 7   # End Point
    }
```

### **3. SubViewport per World Embedding**
```gdscript
# GameUI.gd - World istanziato in SubViewport
func instantiate_world_scene():
    var world_scene = preload("res://scenes/World.tscn")
    world_scene_instance = world_scene.instantiate()
    world_viewport.add_child(world_scene_instance)
    world_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
```

### **4. Dynamic Popup Instantiation**
```gdscript
# GameUI.gd - Creazione dinamica popup
func _open_item_interaction_popup(item: Dictionary):
    var popup = ItemInteractionPopup.instantiate()
    add_child(popup)
    popup.popup_closed.connect(_on_item_popup_closed.bind(popup))
    popup.show_item_details(item)
```

---

## 🎨 **SISTEMA RENDERING E GRAFICA**

### **Texture Filtering**
```
textures/canvas_textures/default_texture_filter=0
```
- **Valore 0:** Nearest neighbor (pixel-perfect)
- **Scopo:** Mantenere estetica pixelart/retro
- **Applicazione:** Tutti i sprite e texture UI

### **Shader System**
```
CRT Shader Files:
├── crt_terminal.gdshader (Shader principale)
├── crt_simple.gdshader (Versione semplificata)
├── crt_material.tres (Material CRT)
└── crt_simple_material.tres (Material semplice)

Features CRT Shader:
├── Scanlines (250Hz frequency)
├── Screen curvature (0.1 distortion)
├── Phosphor glow effect
├── Color separation
└── Noise simulation
```

### **Font System**
```
Primary Font: Perfect DOS VGA 437 Win.ttf
├── Size: 14pt base
├── Style: Monospace bitmap
├── Encoding: Code Page 437
└── Usage: Tutti i testi UI
```

---

## 🗃️ **RESOURCE MANAGEMENT**

### **File Organization Standard**
```
res://
├── scenes/ (File .tscn)
├── scripts/ (File .gd)
├── data/ (File .json)
├── textures/ (File .png)
├── themes/ (File .tres + .gdshader)
├── tilesets/ (File .tres)
└── maps/ (File .txt per ASCII maps)
```

### **Resource Loading Patterns**
```gdscript
# Preload per risorse note al compile-time
const ItemInteractionPopup = preload("res://scenes/ui/popups/ItemInteractionPopup.tscn")

# Load per risorse runtime
var tileset = load("res://tilesets/ascii_tileset.tres")

# FileAccess per dati esterni (JSON)
var file = FileAccess.open("res://data/items/weapons.json", FileAccess.READ)
```

---

## ⌨️ **INPUT SYSTEM GODOT**

### **Input Map Configuration**
```ini
[input]
ui_accept={
    "events": [KEY_ENTER, KEY_SPACE, JOY_BUTTON_0]
}
ui_cancel={
    "events": [KEY_ESCAPE, JOY_BUTTON_1]  
}
move_up={
    "events": [KEY_W, KEY_UP]
}
move_down={
    "events": [KEY_S, KEY_DOWN]
}
move_left={
    "events": [KEY_A, KEY_LEFT]
}
move_right={
    "events": [KEY_D, KEY_RIGHT]
}
ui_inventory={
    "events": [KEY_I]
}
debug_f9={
    "events": [KEY_F9]
}
```

### **Input Processing Pattern**
```gdscript
# InputManager.gd - Pattern standard per input
func _input(event):
    if event.is_action_pressed("move_up"):
        map_move.emit(Vector2i.UP)
    elif event.is_action_pressed("ui_inventory"):
        inventory_toggle.emit()
    elif event.is_action_pressed("ui_accept"):
        action_confirm.emit()
```

---

## 🔄 **LIFECYCLE GODOT**

### **Manager Initialization Order**
```
1. Autoload _ready() chiamati in ordine autoload (12 manager)
2. MainGame._ready()
   ├── EventManager.initialize_events()
   ├── QuestManager.initialize_quests()
   ├── PlayerManager.prepare_new_character_data()
   └── Connessione segnali globali
3. GameUI._ready()
   ├── Setup pannelli UI
   ├── Istanziazione World scene
   └── Connessione segnali UI
4. World._ready()
   ├── Setup TileMap
   ├── Caricamento mappa ASCII
   └── Configurazione camera
```

### **Scene Change Lifecycle**
```
Nessun scene change nel gioco attuale.
Tutto avviene in MainGame.tscn con popup overlay.
```

### **Cleanup Pattern**
```gdscript
# Popup cleanup automatico
func _on_popup_closed(popup_instance):
    if popup_instance and is_instance_valid(popup_instance):
        popup_instance.queue_free()
```

---

## 📊 **PERFORMANCE OPTIMIZATIONS**

### **TileMap Optimizations**
```gdscript
# Rendering ottimizzato per mappa grande
ascii_tilemap.tile_set = preloaded_tileset
# No tile modifiche runtime - solo lettura
# Collision solo per montagne (tile_id 2)
```

### **Signal Optimizations**
```gdscript
# Connessioni una sola volta con controlli
if not signal_name.is_connected(callback_function):
    signal_name.connect(callback_function)

# Disconnect esplicito quando necessario
signal_name.disconnect(callback_function)
```

### **Memory Management**
```gdscript
# Cleanup popup dinamici
popup_instance.queue_free()

# Cache database per evitare ricaricamenti
var cached_events: Dictionary = {}
var items: Dictionary = {}  # Unified item database
```

---

## 🎮 **GODOT-SPECIFIC FEATURES USED**

### **1. Autoload System**
- **Purpose:** Singleton managers per stato globale
- **Benefit:** Accesso da qualsiasi script senza referenze
- **Pattern:** `PlayerManager.add_item()` chiamabile ovunque

### **2. Signal System**
- **Purpose:** Event-driven communication
- **Benefit:** Disaccoppiamento componenti
- **Pattern:** `signal_name.emit(data)` → `callback_function(data)`

### **3. Groups System**
```gdscript
# GameUI aggiunto a gruppo per facile referenza
add_to_group("gameui")

# Recupero via gruppo
var ui = get_tree().get_first_node_in_group("gameui")
```

### **4. Scene Instantiation**
```gdscript
# Pattern per popup dinamici
const PopupScene = preload("res://scenes/ui/popups/EventPopup.tscn")
var popup_instance = PopupScene.instantiate()
add_child(popup_instance)
```

### **5. Resource System**
```gdscript
# TileSet come risorsa Godot
var tileset = load("res://tilesets/ascii_tileset.tres")

# Theme come risorsa Godot
var theme = load("res://themes/main_theme.tres")
```

---

## 🎯 **INPUT HANDLING SPECIFICS**

### **Godot Input Events**
```gdscript
# InputManager._input() gestisce tutti gli eventi
func _input(event):
    if event is InputEventKey and event.pressed:
        match event.keycode:
            KEY_W, KEY_UP:
                map_move.emit(Vector2i.UP)
            KEY_S, KEY_DOWN:
                map_move.emit(Vector2i.DOWN)
            KEY_1, KEY_2, KEY_3, KEY_4, KEY_5:
                var slot = event.keycode - KEY_0
                inventory_use_item.emit(slot)
```

### **Action System Integration**
```gdscript
# Uso di azioni definite in project.godot
if Input.is_action_just_pressed("ui_accept"):
    action_confirm.emit()
    
if Input.is_action_just_pressed("ui_cancel"):
    action_cancel.emit()
```

---

## 🖼️ **RENDERING PIPELINE**

### **Viewport Configuration**
```gdscript
# SubViewport per World scene
world_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
world_viewport.size = Vector2i(400, 300)  # Dimensioni fisse ottimizzate
```

### **Camera2D Setup**
```gdscript
# Camera2D nel World
camera.zoom = Vector2(1.065, 1.065)  # Zoom ottimizzato 
camera.limit_left = 0
camera.limit_top = 0  
camera.limit_right = map_width * TILE_SIZE
camera.limit_bottom = map_height * TILE_SIZE
```

### **Shader Material Application**
```gdscript
# Applicazione shader CRT
var crt_material = load("res://themes/crt_terminal_material.tres")
ui_panel.material = crt_material
```

---

## 📱 **UI SYSTEM GODOT**

### **Control Node Hierarchy**
```
GameUI (Control - CanvasLayer 0)
├── Responsive layout con size_flags_horizontal/vertical
├── Theme applicato a livello root
├── Font override per consistenza
└── Custom stylebox per panels

PopupLayer (CanvasLayer 10)
├── Z-index più alto per popup
├── Transparent background
└── Modal behavior per eventi
```

### **Theme System Integration**
```gdscript
# ThemeManager fornisce theme Godot
func get_main_theme() -> Theme:
    return load("res://themes/main_theme.tres")

# Font override globale
func get_main_font() -> Font:
    return load("res://themes/Perfect DOS VGA 437 Win.ttf")
```

### **RichTextLabel for Formatted Text**
```gdscript
# Log panel usa RichTextLabel per colori
log_text.append_text("[color=green]Messaggio successo[/color]")
log_text.append_text("[color=red]Messaggio errore[/color]")
log_text.append_text("[color=#ffdd00]Messaggio speciale[/color]")
```

---

## 🧮 **JSON INTEGRATION**

### **JSON Loading with Error Handling**
```gdscript
# Pattern standard per caricamento JSON in Godot 4.x
func _load_json_file(file_path: String) -> Dictionary:
    var file = FileAccess.open(file_path, FileAccess.READ)
    if file == null:
        return {}
        
    var content = file.get_as_text()
    file.close()
    
    var json = JSON.new()
    if json.parse(content) != OK:
        print("JSON Error: ", json.get_error_message())
        return {}
        
    return json.data
```

### **JSON Data Structures**
```gdscript
# Tutti i database seguono pattern Dictionary
var items: Dictionary = {}  # {"item_id": item_data}
var events: Dictionary = {} # {"event_id": event_data}

# Validazione type-safe
if not item_data is Dictionary:
    return false
if not item_data.has("id"):
    return false
```

---

## 🔧 **DEBUGGING E DEVELOPMENT**

### **Console Output System**
```gdscript
# Pattern logging standardizzato
print("🗄️ DataManager: Caricamento database...")
print("✅ PlayerManager: Operazione completata")
print("⚠️ EventManager: Warning condizione")
print("❌ InputManager: Errore critico")
```

### **F9 Debug System**
```gdscript
# Debug key per diagnostics
func _input(event):
    if event.is_action_pressed("debug_f9"):
        _show_debug_info()

func _show_debug_info():
    print("=== DEBUG INFO ===")
    print("FPS: ", Engine.get_frames_per_second())
    print("Player position: ", player_pos)
    print("Inventory slots: ", inventory.size())
```

### **Error Handling Pattern**
```gdscript
# Pattern standard per error handling
func safe_operation() -> bool:
    if not _validate_preconditions():
        push_error("Precondizioni fallite")
        return false
        
    # Esegui operazione
    
    if not _validate_postconditions():
        push_error("Postcondizioni fallite")
        return false
        
    return true
```

---

## 📝 **GODOT PROJECT STRUCTURE**

### **File Extensions Utilizzate**
```
.gd     - GDScript files (logica)
.tscn   - Scene files (UI e world)
.tres   - Resource files (theme, tileset)
.json   - Data files (database)
.png    - Texture files (sprite, UI)
.gdshader - Shader files (CRT effects)
.txt    - Text files (mappa ASCII)
```

### **Import Settings**
```
Textures (.png):
├── Filter: Off (pixel-perfect)
├── Mipmaps: Off  
└── Fix Alpha Border: Off

Fonts (.ttf):
├── Fallbacks: None
├── Language Support: Latin
└── Rendering: Bitmap preferred
```

---

## ⚡ **PERFORMANCE CONSIDERATIONS**

### **Godot-Specific Optimizations**
- **TileMap:** No modification runtime (read-only)
- **Signals:** Minimal connessioni duplicate
- **Autoload:** Caricamento lazy dove possibile
- **SubViewport:** Fixed size per World rendering
- **Popup caching:** Destroy dopo uso

### **Memory Usage Patterns**
- **JSON caching:** Tutti i database in RAM
- **Texture streaming:** Godot gestisce automaticamente
- **Scene instancing:** Cleanup esplicito popup
- **Signal connections:** Disconnect quando necessario

---

**Versione:** v0.9.6.5 "Computer Boot System"
**Data:** 24 Settembre 2025
**Target:** LLM Technical Analysis - Godot Implementation
