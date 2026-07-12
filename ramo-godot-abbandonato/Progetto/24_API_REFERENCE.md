# 📚 API REFERENCE - THE SAFE PLACE v0.4.1

## 🎯 **RIFERIMENTI API**

Documentazione API pubblica per estensioni.

---

## 👤 **PLAYERMANAGER API**

### **Gestione Personaggio**
```gdscript
# Creazione
func prepare_new_character_data() -> Dictionary
func finalize_character_creation() -> void

# Statistiche
func get_stat(stat_name: String) -> int
func modify_stat(stat_name: String, amount: int) -> void

# Risorse
func modify_hp(amount: int, allow_overheal: bool = false) -> void
func modify_food(amount: int) -> void
func modify_water(amount: int) -> void
```

### **Inventario**
```gdscript
func add_item(item_id: String, quantity: int) -> bool
func remove_item(item_id: String, quantity: int) -> bool
func has_item(item_id: String) -> bool
func get_item_count(item_id: String) -> int
func use_item(item_id: String, quantity: int = 1) -> bool
```

### **Progressione**
```gdscript
func add_experience(amount: int, reason: String = "") -> void
func improve_stat(stat_name: String) -> bool
func has_available_stat_points() -> bool
func get_progression_data() -> Dictionary
```

---

## 🎭 **EVENTMANAGER API**

### **Trigger Eventi**
```gdscript
func trigger_random_event(biome: String) -> Dictionary
func get_random_event(biome: String) -> Dictionary
func process_event_choice(event_id: String, choice_index: int) -> void
```

### **Database Eventi**
```gdscript
func get_events_for_biome(biome: String) -> Array
func get_event_by_id(event_id: String) -> Dictionary
func get_event_stats() -> Dictionary
```

---

## ⏰ **TIMEMANAGER API**

### **Query Temporali**
```gdscript
func get_current_time_string() -> String
func get_time_of_day() -> TimeOfDay
func is_night() -> bool
```

### **Manipolazione**
```gdscript
func advance_time_by_moves(moves: int) -> void
func advance_to_next_hour() -> void
```

---

## ⌨️ **INPUTMANAGER API**

### **Stati Input**
```gdscript
func switch_to_world_navigation() -> void
func switch_to_popup_interaction() -> void
func switch_to_inventory_mode() -> void
func get_current_input_state() -> InputState
```

### **Controllo**
```gdscript
func enable_input() -> void
func disable_input() -> void
func is_input_enabled() -> bool
```

---

## 🗄️ **DATAMANAGER API**

### **Caricamento Dati**
```gdscript
func get_item_data(item_id: String) -> Dictionary
func has_item(item_id: String) -> bool
func get_all_items() -> Dictionary
```

### **Validazione**
```gdscript
func validate_item_data(data: Dictionary) -> bool
func normalize_item_data(data: Dictionary) -> Dictionary
```

---

## 🎲 **SKILLCHECKMANAGER API**

### **Test Abilità**
```gdscript
func perform_check(stat: String, difficulty: int, modifier: int = 0) -> Dictionary
func get_stat_modifier(stat_value: int) -> int
func roll_d20() -> int
```

---

**Versione:** v0.4.1  
**Data:** 22 Settembre 2025