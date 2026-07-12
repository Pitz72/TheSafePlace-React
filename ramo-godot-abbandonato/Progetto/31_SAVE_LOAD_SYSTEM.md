# 💾 SAVE/LOAD SYSTEM - THE SAFE PLACE v0.9.5

## 🎯 **OVERVIEW SISTEMA SALVATAGGIO**

Il Save/Load System di The Safe Place gestisce la persistenza completa dello stato di gioco attraverso un sistema robusto di salvataggio basato su file JSON. Il sistema supporta salvataggi multipli, backup automatici, validazione integrità e recovery da corruzioni, garantendo che il progresso del giocatore sia sempre sicuro.

### **Filosofia Design Salvataggio**
- **Complete State Persistence:** Salvataggio di tutto lo stato di gioco
- **Multiple Save Slots:** Supporto per più salvataggi simultanei
- **Automatic Backups:** Backup automatici per prevenzione perdita dati
- **Integrity Validation:** Validazione e recovery da file corrotti
- **Performance Optimized:** Salvataggio efficiente senza bloccare gameplay

---

## 🏗️ **ARCHITETTURA SALVATAGGIO**

### **Struttura File Salvataggio**
```gdscript
# Directory salvataggi
var save_directory = "user://saves/"
var backup_directory = "user://backups/"

# File naming convention
# save_slot_[number].json
# auto_save.json
# backup_save_slot_[number]_[timestamp].json
```

### **Struttura Dati Salvataggio**
```gdscript
var save_data_structure = {
    "metadata": {
        "version": "0.9.5",
        "timestamp": 0,
        "playtime_minutes": 0,
        "save_slot": 0,
        "character_name": "",
        "difficulty": "normal"
    },
    "player": {},
    "world": {},
    "inventory": {},
    "quests": {},
    "narrative": {},
    "combat": {},
    "crafting": {},
    "checksum": ""
}
```

### **Sistema Slot Salvataggio**
```gdscript
const MAX_SAVE_SLOTS = 10
var available_saves: Array = []
var current_save_slot: int = -1
var auto_save_enabled: bool = true
var auto_save_interval: float = 300.0  # 5 minuti
```

---

## 💾 **OPERAZIONI SALVATAGGIO**

### **Quick Save/Load**
```gdscript
func quick_save() -> bool:
    if current_save_slot == -1:
        # Prima volta, usa slot 0
        current_save_slot = 0

    return save_game(current_save_slot)

func quick_load() -> bool:
    if current_save_slot == -1:
        return false

    return load_game(current_save_slot)
```

### **Auto Save System**
```gdscript
func _process(delta: float) -> void:
    if not auto_save_enabled:
        return

    auto_save_timer += delta
    if auto_save_timer >= auto_save_interval:
        perform_auto_save()
        auto_save_timer = 0.0

func perform_auto_save() -> void:
    var success = save_game(-1, "auto_save")
    if success:
        auto_save_completed.emit(true)
    else:
        auto_save_completed.emit(false)
        push_warning("Auto save failed")
```

### **Salvataggio con Backup**
```gdscript
func save_game(slot: int, filename: String = "") -> bool:
    # 1. Raccogli tutti i dati
    var save_data = collect_all_save_data()

    # 2. Aggiungi metadata
    save_data.metadata = generate_save_metadata(slot)

    # 3. Calcola checksum
    save_data.checksum = calculate_checksum(save_data)

    # 4. Crea backup del salvataggio esistente
    if slot_exists(slot):
        create_backup(slot)

    # 5. Scrivi file
    var file_path = get_save_file_path(slot, filename)
    var success = write_save_file(file_path, save_data)

    if success:
        update_available_saves_list()
        game_saved.emit(slot, true)
        return true
    else:
        game_saved.emit(slot, false)
        return false
```

---

## 📂 **GESTIONE FILE**

### **Path Resolution**
```gdscript
func get_save_file_path(slot: int, custom_name: String = "") -> String:
    var filename = custom_name
    if filename.is_empty():
        filename = "save_slot_%d.json" % slot

    return save_directory + filename

func get_backup_file_path(slot: int, timestamp: int) -> String:
    var filename = "backup_save_slot_%d_%d.json" % [slot, timestamp]
    return backup_directory + filename
```

### **Directory Management**
```gdscript
func ensure_save_directories_exist() -> void:
    var save_dir = DirAccess.open(save_directory)
    if not save_dir:
        DirAccess.make_dir_recursive_absolute(save_directory)

    var backup_dir = DirAccess.open(backup_directory)
    if not backup_dir:
        DirAccess.make_dir_recursive_absolute(backup_directory)
```

### **File I/O Operations**
```gdscript
func write_save_file(file_path: String, data: Dictionary) -> bool:
    var file = FileAccess.open(file_path, FileAccess.WRITE)
    if not file:
        push_error("Cannot open save file for writing: " + file_path)
        return false

    var json_string = JSON.stringify(data, "\t", false)
    file.store_string(json_string)
    file.close()

    return true

func read_save_file(file_path: String) -> Dictionary:
    var file = FileAccess.open(file_path, FileAccess.READ)
    if not file:
        push_error("Cannot open save file for reading: " + file_path)
        return {}

    var json_string = file.get_as_text()
    file.close()

    var json = JSON.new()
    if json.parse(json_string) != OK:
        push_error("JSON parse error in save file: " + file_path)
        return {}

    return json.data
```

---

## 🔍 **VALIDAZIONE INTEGRITÀ**

### **Checksum System**
```gdscript
func calculate_checksum(save_data: Dictionary) -> String:
    # Rimuovi checksum esistente per calcolo
    var data_copy = save_data.duplicate(true)
    data_copy.erase("checksum")

    # Serializza e calcola hash
    var json_string = JSON.stringify(data_copy, "", false)
    return json_string.md5_text()

func validate_save_integrity(save_data: Dictionary) -> bool:
    if not save_data.has("checksum"):
        return false

    var expected_checksum = save_data.checksum
    var calculated_checksum = calculate_checksum(save_data)

    return expected_checksum == calculated_checksum
```

### **Recovery System**
```gdscript
func load_game_with_recovery(slot: int) -> bool:
    var primary_path = get_save_file_path(slot)

    # 1. Prova caricamento file primario
    var save_data = read_save_file(primary_path)
    if save_data.is_empty():
        push_warning("Primary save file not found, trying backup")
        save_data = try_load_from_backup(slot)
        if save_data.is_empty():
            push_error("No valid save file found")
            return false
    }

    # 2. Valida integrità
    if not validate_save_integrity(save_data):
        push_warning("Save file corrupted, trying recovery")
        save_data = attempt_save_recovery(slot)
        if save_data.is_empty():
            push_error("Save recovery failed")
            return false
    }

    # 3. Carica dati
    return distribute_save_data_to_managers(save_data)
```

### **Backup Recovery**
```gdscript
func try_load_from_backup(slot: int) -> Dictionary:
    var backup_files = get_backup_files_for_slot(slot)

    # Prova backup più recenti prima
    backup_files.sort_custom(func(a, b): return a.timestamp > b.timestamp)

    for backup_info in backup_files:
        var backup_data = read_save_file(backup_info.path)
        if not backup_data.is_empty() and validate_save_integrity(backup_data):
            push_warning("Loaded from backup: " + backup_info.filename)
            return backup_data

    return {}
```

---

## 📊 **RACCOLTA DATI SALVATAGGIO**

### **Player Data Collection**
```gdscript
func collect_player_save_data() -> Dictionary:
    return {
        "stats": PlayerManager.get_all_stats(),
        "inventory": PlayerManager.get_full_inventory(),
        "equipment": PlayerManager.get_equipment(),
        "experience": PlayerManager.get_experience(),
        "level": PlayerManager.get_level(),
        "health": PlayerManager.get_health(),
        "status_effects": PlayerManager.get_active_status_effects(),
        "position": PlayerManager.get_position(),
        "current_location": PlayerManager.get_current_location()
    }
```

### **World Data Collection**
```gdscript
func collect_world_save_data() -> Dictionary:
    return {
        "current_day": TimeManager.get_current_day(),
        "current_hour": TimeManager.get_current_hour(),
        "game_minutes": TimeManager.get_total_game_minutes(),
        "weather_state": TimeManager.get_weather_state(),
        "discovered_locations": World.get_discovered_locations(),
        "world_state": World.get_world_state()
    }
```

### **Manager Data Collection**
```gdscript
func collect_all_save_data() -> Dictionary:
    return {
        "player": collect_player_save_data(),
        "world": collect_world_save_data(),
        "quests": QuestManager.get_save_data(),
        "narrative": NarrativeManager.get_narrative_save_data(),
        "crafting": CraftingManager.get_crafting_save_data(),
        "combat": CombatManager.get_combat_save_data()
    }
```

---

## 🔄 **DISTRIBUZIONE DATI CARICAMENTO**

### **Load Data Distribution**
```gdscript
func distribute_save_data_to_managers(save_data: Dictionary) -> bool:
    var success = true

    # Carica in ordine di dipendenza
    success = success and PlayerManager.load_save_data(save_data.player)
    success = success and TimeManager.load_save_data(save_data.world)
    success = success and QuestManager.load_save_data(save_data.quests)
    success = success and NarrativeManager.load_save_data(save_data.narrative)
    success = success and CraftingManager.load_save_data(save_data.crafting)
    success = success and CombatManager.load_save_data(save_data.combat)

    # Aggiorna stato globale
    current_save_slot = save_data.metadata.save_slot
    update_available_saves_list()

    if success:
        game_loaded.emit(current_save_slot, true)
        return true
    else:
        game_loaded.emit(current_save_slot, false)
        return false
```

### **Partial Load Recovery**
```gdscript
func attempt_partial_recovery(save_data: Dictionary) -> Dictionary:
    var recovered_data = save_data.duplicate(true)
    var recovery_log = []

    # Prova caricare sezioni individualmente
    for section in ["player", "world", "quests", "narrative"]:
        if save_data.has(section):
            var section_valid = validate_section_integrity(save_data[section], section)
            if not section_valid:
                recovered_data[section] = get_default_section_data(section)
                recovery_log.append("Recovered section: " + section)

    if recovery_log.size() > 0:
        push_warning("Partial recovery performed: " + str(recovery_log))

    return recovered_data
```

---

## 🎮 **USER INTERFACE SALVATAGGIO**

### **Save Menu Layout**
```
┌─ SALVATAGGI ──────────────────────────────┐
│ Slot 1: [23/09/2025 14:30]               │
│        Ultimo: Città Abbandonata         │
│        Giorni: 15   Livello: 8           │
│        [SOVRASCRIVI] [CARICA] [ELIMINA]  │
│                                           │
│ Slot 2: [Vuoto]                          │
│        [NUOVO SALVATAGGIO]               │
│                                           │
│ Auto Save: Attivo                        │
│ [CONFIGURA AUTO SAVE]                    │
└───────────────────────────────────────────┘
```

### **Save Confirmation Dialog**
```
┌─ CONFERMA SALVATAGGIO ────────────────────┐
│ Sovrascrivere il salvataggio esistente?   │
│                                           │
│ Salvataggio attuale:                      │
│ • Giorni sopravvissuti: 15                │
│ • Livello personaggio: 8                  │
│ • Location: Città Abbandonata             │
│                                           │
│ [SÌ, SOVRASCRIVI] [NO, ANNULLA]          │
└───────────────────────────────────────────┘
```

---

## 🔧 **GESTIONE SLOT SALVATAGGIO**

### **Slot Operations**
```gdscript
func get_available_save_slots() -> Array:
    var slots = []
    for i in range(MAX_SAVE_SLOTS):
        if slot_exists(i):
            var metadata = get_save_metadata(i)
            slots.append({
                "slot": i,
                "exists": true,
                "metadata": metadata
            })
        else:
            slots.append({
                "slot": i,
                "exists": false,
                "metadata": {}
            })
    return slots

func delete_save_slot(slot: int) -> bool:
    var file_path = get_save_file_path(slot)
    var dir = DirAccess.open(save_directory)

    if dir.file_exists(file_path):
        dir.remove(file_path)
        update_available_saves_list()
        save_slot_deleted.emit(slot)
        return true

    return false
```

### **Metadata Management**
```gdscript
func generate_save_metadata(slot: int) -> Dictionary:
    return {
        "version": ProjectSettings.get_setting("application/config/version"),
        "timestamp": Time.get_unix_time_from_system(),
        "playtime_minutes": TimeManager.get_total_game_minutes(),
        "save_slot": slot,
        "character_name": PlayerManager.get_character_name(),
        "current_location": PlayerManager.get_current_location(),
        "player_level": PlayerManager.get_level(),
        "days_survived": TimeManager.get_current_day()
    }
```

---

## 🛡️ **SISTEMA BACKUP**

### **Automatic Backups**
```gdscript
func create_backup(slot: int) -> void:
    var source_path = get_save_file_path(slot)
    var timestamp = Time.get_unix_time_from_system()
    var backup_path = get_backup_file_path(slot, timestamp)

    var dir = DirAccess.open(save_directory)
    if dir.file_exists(source_path):
        dir.copy(source_path, backup_path)
        cleanup_old_backups(slot)
```

### **Backup Rotation**
```gdscript
func cleanup_old_backups(slot: int) -> void:
    var backup_files = get_backup_files_for_slot(slot)

    # Mantieni solo gli ultimi 5 backup
    const MAX_BACKUPS = 5
    if backup_files.size() > MAX_BACKUPS:
        backup_files.sort_custom(func(a, b): return a.timestamp > b.timestamp)

        for i in range(MAX_BACKUPS, backup_files.size()):
            var dir = DirAccess.open(backup_directory)
            dir.remove(backup_files[i].path)
```

---

## 📊 **ANALYTICS E MONITORING**

### **Save Statistics**
```gdscript
func get_save_statistics() -> Dictionary:
    return {
        "total_saves": count_total_saves(),
        "total_loads": count_total_loads(),
        "average_save_size_kb": calculate_average_save_size(),
        "corruption_incidents": count_corruption_incidents(),
        "backup_usage": calculate_backup_usage_percentage(),
        "auto_save_success_rate": calculate_auto_save_success_rate()
    }
```

### **Performance Monitoring**
```gdscript
var save_performance_metrics = {
    "average_save_time_ms": 0,
    "average_load_time_ms": 0,
    "last_save_timestamp": 0,
    "total_save_operations": 0,
    "failed_save_operations": 0
}
```

---

## 🔧 **API PUBBLICA SAVELOADMANAGER**

### **Operazioni Base**
```gdscript
func save_game(slot: int = -1) -> bool
func load_game(slot: int) -> bool
func quick_save() -> bool
func quick_load() -> bool
func delete_save_slot(slot: int) -> bool
```

### **Auto Save**
```gdscript
func set_auto_save_enabled(enabled: bool) -> void
func set_auto_save_interval(minutes: float) -> void
func perform_auto_save() -> void
```

### **Query**
```gdscript
func get_available_save_slots() -> Array
func get_save_metadata(slot: int) -> Dictionary
func slot_exists(slot: int) -> bool
func get_save_statistics() -> Dictionary
```

### **Utility**
```gdscript
func validate_save_data(data: Dictionary) -> bool
func create_backup(slot: int) -> void
func get_backup_files_for_slot(slot: int) -> Array
```

### **Segnali Emessi**
```gdscript
signal game_saved(slot: int, success: bool)
signal game_loaded(slot: int, success: bool)
signal save_slot_created(slot: int)
signal save_slot_deleted(slot: int)
signal auto_save_completed(success: bool)
signal save_corruption_detected(slot: int)
signal save_recovery_attempted(slot: int, success: bool)
```

---

## 🧪 **TESTING E VALIDATION**

### **Save/Load Test Suite**
```gdscript
# Test salvataggio completo
func test_full_save_load_cycle() -> void:
    # Setup stato di test
    PlayerManager.set_player_level(5)
    PlayerManager.add_item("test_item", 3)

    # Salva
    var save_success = SaveLoadManager.save_game(0)
    assert(save_success)

    # Modifica stato
    PlayerManager.set_player_level(10)
    PlayerManager.remove_item("test_item", 3)

    # Carica
    var load_success = SaveLoadManager.load_game(0)
    assert(load_success)

    # Verifica ripristino
    assert(PlayerManager.get_level() == 5)
    assert(PlayerManager.get_item_count("test_item") == 3)

# Test integrità
func test_save_integrity_validation() -> void:
    var save_data = SaveLoadManager.collect_all_save_data()
    save_data.metadata = SaveLoadManager.generate_save_metadata(0)

    # Test checksum valido
    save_data.checksum = SaveLoadManager.calculate_checksum(save_data)
    assert(SaveLoadManager.validate_save_integrity(save_data))

    # Test checksum invalido
    save_data.player.level = 999
    assert(not SaveLoadManager.validate_save_integrity(save_data))
```

### **Performance Benchmarks**
```
Salvataggio completo: <200ms
Caricamento completo: <150ms
Validazione checksum: <10ms
Backup creation: <50ms
Directory scan: <30ms
```

---

## 🚀 **ROADMAP ESPANSIONI**

### **Funzionalità Avanzate**
```
Cloud Saves:         Salvataggi cloud sincronizzati
Save Sharing:        Condivisione salvataggi
Save Editor:         Tool modifica salvataggi
Compressed Saves:    Compressione dati salvataggio
Version Migration:   Migrazione tra versioni gioco
Save Analytics:      Analisi comportamento giocatori
```

### **Sistema Backup Avanzato**
```
Incremental Backups: Backup solo modifiche
Remote Backups:      Backup su server remoti
Backup Encryption:   Salvataggi crittografati
Backup Scheduling:   Programmazione backup automatici
Backup Verification: Verifica integrità backup
```

---

**Versione:** v0.9.6.5 "Computer Boot System"
**Data:** 24 Settembre 2025
**Target:** LLM Technical Analysis - Save/Load System