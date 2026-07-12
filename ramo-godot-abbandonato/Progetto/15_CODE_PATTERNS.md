# 🏗️ PATTERN ARCHITETTURALI - THE SAFE PLACE v0.4.1

## 🎯 **OVERVIEW PATTERN CODICE**

Questa documentazione descrive i pattern architetturali e le convenzioni di codifica utilizzati in The Safe Place. L'obiettivo è mantenere consistenza, leggibilità e manutenibilità del codebase.

---

## 🏛️ **PATTERN PRINCIPALI**

### **1. SINGLETON PATTERN**
```gdscript
# Implementazione standard per manager
extends Node

class_name PlayerManager

func _ready():
    # Singleton automaticamente disponibile via autoload
    pass

# Accesso globale
func _on_some_event():
    PlayerManager.add_item("sword", 1)
```

**Utilizzo**: Tutti i manager di sistema (PlayerManager, EventManager, etc.)
**Vantaggi**: Accesso globale, inizializzazione automatica, stato persistente

### **2. OBSERVER PATTERN (Signals)**
```gdscript
# Publisher (Manager)
signal inventory_changed

func add_item(item_id: String, quantity: int):
    # Logica aggiunta oggetto
    inventory_changed.emit()

# Subscriber (UI)
func _ready():
    PlayerManager.inventory_changed.connect(_update_inventory_display)
```

**Utilizzo**: Comunicazione tra manager e UI
**Vantaggi**: Decoupling, event-driven updates, thread-safe

### **3. STRATEGY PATTERN**
```gdscript
# SkillCheckManager con strategie configurabili
func perform_check(stat: String, difficulty: int) -> Dictionary:
    var stat_value = PlayerManager.get_stat(stat)
    var modifier = get_stat_modifier(stat_value)
    
    # Strategia D&D 3.5
    var roll = roll_d20()
    var total = roll + modifier
    var success = total >= difficulty
    
    return {
        "success": success,
        "roll": roll,
        "total": total
    }
```

**Utilizzo**: Sistemi skill check, eventi, calcolo danni
**Vantaggi**: Configurabilità, testabilità, estensibilità

### **4. FACTORY PATTERN**
```gdscript
# DataManager per creazione oggetti
func get_item_data(item_id: String) -> Dictionary:
    if not items_cache.has(item_id):
        var data = _load_item_from_json(item_id)
        items_cache[item_id] = _normalize_item_data(data)
    
    return items_cache[item_id].duplicate()

func _normalize_item_data(raw_data: Dictionary) -> Dictionary:
    # Applico trasformazioni standard
    return {
        "id": raw_data.id,
        "name": raw_data.name,
        "category": raw_data.category.to_upper(),
        # ... normalizzazioni
    }
```

**Utilizzo**: Caricamento dati JSON, creazione eventi
**Vantaggi**: Caching, validazione, normalizzazione

### **5. COMMAND PATTERN**
```gdscript
# InputManager con comandi
class MoveCommand:
    var direction: Vector2
    
    func execute():
        World.move_player(direction)

# Esecuzione comando
func _process_world_navigation():
    if Input.is_action_just_pressed("move_up"):
        MoveCommand.new(Vector2.UP).execute()
```

**Utilizzo**: Sistema input, undo potenziale
**Vantaggi**: Incapsulamento azioni, replay, testing

---

## 📝 **CONVENZIONI CODICE**

### **Naming Conventions**
```gdscript
# Files
player_manager.gd          # snake_case
event_popup.gd            # snake_case

# Classes
class_name PlayerManager   # PascalCase

# Variables
var max_hp: int           # snake_case
var player_stats: Dictionary # snake_case

# Constants
const MAX_INVENTORY_SLOTS = 10  # UPPER_SNAKE_CASE

# Functions
func add_item() -> void    # snake_case
func _private_method()     # snake_case with _

# Signals
signal inventory_changed   # snake_case
signal stats_updated       # snake_case
```

### **Code Structure**
```gdscript
# File structure standard
extends Node

class_name MyManager

# Signals
signal my_signal

# Constants
const MY_CONSTANT = 42

# Exported variables
@export var my_setting: int = 10

# Public variables
var public_var: int = 0

# Private variables
var _private_var: int = 0

# Ready function
func _ready() -> void:
    pass

# Public methods
func public_method() -> void:
    pass

# Private methods
func _private_method() -> void:
    pass
```

---

## 🔧 **PATTERN SPECIFICI PROGETTO**

### **Manager Communication Pattern**
```gdscript
# Pattern comunicazione tra manager
func _connect_manager_signals():
    # PlayerManager comunica con UI
    inventory_changed.connect(GameUI._on_inventory_changed)
    
    # TimeManager coordina eventi temporali
    TimeManager.survival_penalty_tick.connect(_apply_penalties)
    
    # EventManager triggera popup
    EventManager.event_triggered.connect(EventPopup._show_event)
```

### **Data Validation Pattern**
```gdscript
# Pattern validazione dati consistente
func validate_item_data(data: Dictionary) -> bool:
    var required_fields = ["id", "name", "category"]
    
    for field in required_fields:
        if not data.has(field) or data[field].is_empty():
            TSPLogger.error("DataManager", "Missing required field: %s" % field)
            return false
    
    return true
```

### **Error Handling Pattern**
```gdscript
# Pattern gestione errori uniforme
func safe_operation() -> bool:
    if not _validate_prerequisites():
        TSPLogger.error("Manager", "Prerequisites not met")
        return false
    
    var result = _perform_operation()
    
    if result:
        TSPLogger.success("Manager", "Operation completed")
    else:
        TSPLogger.error("Manager", "Operation failed")
    
    return result
```

### **Resource Management Pattern**
```gdscript
# Pattern gestione risorse con cleanup
func _init():
    _load_resources()

func _exit_tree():
    _cleanup_resources()

func _load_resources():
    # Carica risorse necessarie
    pass

func _cleanup_resources():
    # Libera risorse
    pass
```

---

## 🧪 **PATTERN TESTING**

### **Test Pattern**
```gdscript
# TestFramework pattern
extends TestFramework

func test_inventory_operations():
    # Setup
    var initial_count = PlayerManager.get_item_count("sword")
    
    # Execute
    PlayerManager.add_item("sword", 5)
    
    # Assert
    assert_equal(PlayerManager.get_item_count("sword"), initial_count + 5)
    
    # Cleanup
    PlayerManager.remove_item("sword", 5)
```

### **Mock Pattern**
```gdscript
# Pattern per testing con mock
class MockPlayerManager:
    var inventory = []
    
    func add_item(item_id: String, quantity: int):
        inventory.append({"id": item_id, "quantity": quantity})
    
    func get_item_count(item_id: String) -> int:
        for item in inventory:
            if item.id == item_id:
                return item.quantity
        return 0
```

---

## 📊 **METRICHE QUALITÀ CODICE**

### **Code Metrics Target**
- **Cyclomatic Complexity**: < 10 per funzione
- **Function Length**: < 50 linee
- **Class Length**: < 500 linee
- **Test Coverage**: > 80%

### **Static Analysis Rules**
```gdscript
# Regole linting personalizzate
const MAX_FUNCTION_LENGTH = 50
const MAX_CLASS_LENGTH = 500
const REQUIRED_DOC_COMMENTS = true

func validate_code_quality():
    # Controlli automatici qualità
    pass
```

---

## 🔄 **EVOLUZIONE PATTERN**

### **Pattern Evolution**
- **Version 0.1-0.2**: Pattern base, singleton semplice
- **Version 0.3**: Introduzione signal system avanzato
- **Version 0.4**: Pattern testing e logging unificato

### **Future Patterns**
- **Async/Await**: Per operazioni I/O
- **State Machine**: Per stati complessi
- **Dependency Injection**: Per testabilità migliorata
- **Event Sourcing**: Per replay e debugging

---

## 📚 **RISORSE AGGIUNTIVE**

### **Documentazione Pattern**
- [Godot Best Practices](https://docs.godotengine.org/en/stable/development/file_formats/tscn.html)
- [GDScript Style Guide](https://docs.godotengine.org/en/stable/development/scripting/gdscript/gdscript_styleguide.html)
- [Design Patterns in Games](https://gameprogrammingpatterns.com/)

### **Tools**
- **GDScript Linter**: Controllo qualità codice
- **TestFramework**: Testing automatizzato
- **TSPLogger**: Logging consistente

---

**Versione:** v0.4.1 "Write Only When You're Not Drunk"  
**Data:** 22 Settembre 2025  
**Target:** LLM Technical Analysis