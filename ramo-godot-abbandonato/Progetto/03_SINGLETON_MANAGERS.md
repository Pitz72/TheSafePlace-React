# 🎛️ SINGLETON MANAGERS SYSTEM - THE SAFE PLACE v0.9.8.1

## 🎯 **OVERVIEW SISTEMA MANAGERS**

Il progetto utilizza **7 Singleton Manager consolidati** + CrashLogger, implementati tramite il sistema Autoload di Godot 4.x. Ogni manager ha responsabilità ben definite e comunica con gli altri via sistema di segnali.

### **Autoload in `project.godot`**
```
CoreDataManager        → scripts/managers/CoreDataManager.gd
PlayerSystemManager    → scripts/managers/PlayerSystemManager.gd
WorldSystemManager     → scripts/managers/WorldSystemManager.gd
NarrativeSystemManager → scripts/managers/NarrativeSystemManager.gd
CombatSystemManager    → scripts/managers/CombatSystemManager.gd
InterfaceSystemManager → scripts/managers/InterfaceSystemManager.gd
PersistenceSystemManager → scripts/managers/PersistenceSystemManager.gd
CrashLogger            → scripts/tools/CrashLogger.gd
```

### **Dependency Graph**
```
CoreDataManager ← (fondazione dati, nessuna dipendenza)
    ↑
PlayerSystemManager ← (dipende da CoreDataManager, WorldSystemManager)
    ↑
WorldSystemManager ← (dipende da PlayerSystemManager per crafting)
    ↑
NarrativeSystemManager ← (dipende da CoreDataManager, PlayerSystemManager, WorldSystemManager)
    ↑
CombatSystemManager ← (dipende da PlayerSystemManager, CoreDataManager)
    ↑
InterfaceSystemManager ← (nessuna dipendenza da altri manager)
    ↑
PersistenceSystemManager ← (dipende da tutti i manager per cattura/ripristino stato)
```

---

## 🗄️ **1. COREDATAMANAGER** (297 righe)

### **Responsabilità**
- Caricamento e caching di tutti i database JSON
- Validazione integrità dati oggetti
- Unificazione database categorizzati in un dizionario unico
- Sistema colori oggetti basato su categoria/rarità

### **File:** `scripts/managers/CoreDataManager.gd`

### **Variabili Stato**
```gdscript
var weapons: Dictionary = {}
var armor: Dictionary = {}
var consumables: Dictionary = {}
var crafting_materials: Dictionary = {}
var ammo: Dictionary = {}
var quest_items: Dictionary = {}
var unique_items: Dictionary = {}
var items: Dictionary = {}           # Database unificato
var rarity_system: Dictionary = {}
```

### **API Pubbliche**
```gdscript
func get_item_data(item_id: String) -> Dictionary
func has_item(item_id: String) -> bool
func validate_item_data(item_data: Dictionary) -> bool
func get_item_color(item_id: String) -> Color
func get_rarity_data(rarity: String) -> Dictionary
func load_json_file(file_path: String) -> Dictionary
func get_items_by_category(category: String) -> Array
func clear_caches() -> void
```

### **Segnali**
```gdscript
signal databases_loaded
```

### **Database JSON Caricati**
```
data/items/weapons.json
data/items/armor.json
data/items/consumables.json
data/items/crafting_materials.json
data/items/ammo.json
data/items/quest_items.json
data/items/unique_items.json
```

---

## 👤 **2. PLAYERSYSTEMMANAGER** (509 righe)

### **Responsabilità**
- Gestione stato completo del giocatore (HP, food, water)
- Statistiche D&D (4d6 drop lowest) e modificatori
- Sistema inventario con limite 10 slot
- Skill check integrato (d20 + modifier vs DC)
- Progressione personaggio (EXP, stat point)
- Equipaggiamento armi e armature
- Stati fisici (NORMAL, WOUNDED, SICK, POISONED)

### **File:** `scripts/managers/PlayerSystemManager.gd`

### **Variabili Stato**
```gdscript
# Risorse vitali
var hp: int = 100
var max_hp: int = 100
var food: int = 100 / max_food: int = 100
var water: int = 100 / max_water: int = 100

# Statistiche personaggio
var stats: Dictionary = {
    "forza": 12,        # STR
    "agilita": 14,      # DEX
    "intelligenza": 13, # INT
    "carisma": 11,      # CHA
    "fortuna": 16,      # LUC
    "vigore": 15        # CON → calcolo HP
}

# Progressione
var experience: int = 0
var experience_for_next_point: int = 100
var available_stat_points: int = 0

# Inventario e equipaggiamento
const MAX_INVENTORY_SLOTS: int = 10
var inventory: Array[Dictionary] = []
var equipped_weapon: Dictionary = {}
var equipped_armor: Dictionary = {}

# Stati
enum Status { NORMAL, WOUNDED, SICK, POISONED }
var active_statuses: Array[Status] = []
```

### **API Pubbliche**
```gdscript
# Creazione personaggio
func prepare_new_character_data() -> Dictionary
func finalize_character_creation() -> void

# Risorse
func modify_hp(amount: int) -> void
func modify_food(amount: int) -> void
func modify_water(amount: int) -> void

# Inventario
func add_item(item_id: String, quantity: int = 1) -> bool
func remove_item(item_id: String, quantity: int = 1) -> bool
func get_item_count(item_id: String) -> int

# Progressione
func add_experience(amount: int, source: String = "") -> void
func spend_stat_point(stat_name: String) -> bool

# Skill Check (integrato, ex SkillCheckManager)
func get_stat_modifier(stat_name: String) -> int    # (stat - 10) / 2
func skill_check(stat: String, difficulty: int, modifier: int = 0) -> Dictionary
func perform_check(stat: String, difficulty: int) -> Dictionary  # alias

# Equipaggiamento e stati
func add_status(status: Status) -> void
func remove_status(status: Status) -> void
func equip_weapon(item_id: String) -> bool
func equip_armor(item_id: String) -> bool
func apply_item_transaction(transaction: Dictionary) -> void
```

### **Segnali**
```gdscript
signal inventory_changed
signal stats_changed
signal resources_changed
signal narrative_log_generated(message: String)
signal level_up_available
signal status_effect_applied(status: String)
```

---

## 🌍 **3. WORLDSYSTEMMANAGER** (433 righe)

### **Responsabilità**
- **Tempo:** Ciclo giorno/notte, avanzamento basato su movimenti
- **Crafting:** Database ricette, logica crafting, workbench, skill crafting

### **File:** `scripts/managers/WorldSystemManager.gd`

### **Variabili Stato**
```gdscript
# Tempo
var total_moves: int = 0
var current_hour: int = 8    # Inizio alle 08:00
var current_minute: int = 0
var current_day: int = 1
var is_night_time: bool = false

# Crafting
var recipes_database: Dictionary = {}
var unlocked_recipes: Array[String] = []
var has_workbench_access: bool = false
var crafting_skill: int = 0

enum CraftingResult { SUCCESS, INSUFFICIENT_MATERIALS, RECIPE_LOCKED, WORKBENCH_REQUIRED, SKILL_TOO_LOW }
```

### **API Pubbliche**
```gdscript
# Tempo
func advance_time_by_moves(moves: int = 1) -> void
func advance_time_until_hour(target_hour: int) -> void
func is_night() -> bool
func get_formatted_time() -> String     # "HH:MM"
func get_formatted_day() -> String      # "Giorno N"
func get_time_data() -> Dictionary      # per salvataggio
func restore_time_data(data: Dictionary) -> void

# Crafting
func attempt_crafting(recipe_id: String, quantity: int = 1) -> CraftingResult
func unlock_recipe(recipe_id: String) -> bool
func is_recipe_unlocked(recipe_id: String) -> bool
func get_recipe_data(recipe_id: String) -> Dictionary
func get_unlocked_recipes() -> Array[String]
func set_workbench_access(has_access: bool) -> void
func update_crafting_skill(intelligence_stat: int) -> void
func get_crafting_skill() -> int
```

### **Segnali**
```gdscript
# Tempo
signal time_advanced(new_hour: int, new_minute: int)
signal day_changed(new_day: int)
signal night_started()
signal day_started()
signal survival_penalty_tick()

# Crafting
signal crafting_completed(item_id: String, quantity: int)
signal crafting_failed(recipe_id: String, reason: CraftingResult)
signal recipe_unlocked(recipe_id: String)
signal workbench_access_changed(has_access: bool)
```

---

## 📖 **4. NARRATIVESYSTEMMANAGER** (916 righe)

### **Responsabilità**
- **Eventi:** Trigger eventi per bioma, gestione scelte, conseguenze
- **Quest:** Quest principale e secondarie, trigger condizioni, progressione stage
- **Narrativa:** Stato emotivo, empatia personaggi, ricordi, saggezza

### **File:** `scripts/managers/NarrativeSystemManager.gd`

### **Variabili Stato**
```gdscript
# Stato emotivo
enum EmotionalState { COLD, CURIOUS, EMPATHETIC, CONNECTED, TRANSFORMED }
var current_emotional_state: EmotionalState = EmotionalState.COLD
var understanding_level: int = 0
var total_wisdom: int = 0

# Empatia e ricordi
var character_empathy: Dictionary = { "elian": 0, "lena": 0, "ultimo": 0 }
var memory_strength: Dictionary = { "silence": 0, "water_lesson": 0, ... }

# Quest
var active_quests: Dictionary = {}
var completed_quests: Array = []
var main_quest_stages: Array = []

# Eventi
var current_event: Dictionary = {}
var current_event_id: String = ""
var biome_event_chances: Dictionary = { "pianure": 0.38, "foreste": 0.48, ... }
var biome_event_pools: Dictionary = {}
var cached_events: Dictionary = {}
```

### **API Pubbliche**
```gdscript
# Eventi
func try_trigger_event(biome: String) -> bool
func handle_event_choice(choice_index: int) -> Dictionary
func initialize_events() -> void
func get_biome_events(biome: String) -> Array

# Quest
func start_quest(quest_id: String) -> bool
func is_quest_active(quest_id: String) -> bool
func is_quest_completed(quest_id: String) -> bool
func get_active_quests() -> Dictionary
func get_completed_quests() -> Array
func check_all_triggers() -> void

# Narrativa
func increase_understanding(amount: int, reason: String = "") -> void
func increase_empathy(character: String, amount: int, reason: String = "") -> void
func strengthen_memory(memory: String, amount: int, reason: String = "") -> void
func gain_wisdom(amount: int, reason: String = "") -> void
func get_emotional_state() -> EmotionalState
func get_emotional_state_name() -> String
func get_understanding_level() -> int
func get_memory_strength_value(memory: String) -> int
func get_total_wisdom() -> int
func update_player_biome(biome: String) -> void
```

### **Segnali**
```gdscript
# Narrativa
signal emotional_state_changed(new_state: EmotionalState)
signal understanding_level_changed(new_level: int, old_level: int)
signal memory_strength_changed(memory: String, new_value: int, old_value: int)
signal wisdom_gained(amount: int, reason: String)

# Quest
signal quest_started(quest_id: String)
signal quest_progressed(quest_id: String, stage_id: String)
signal quest_completed(quest_id: String)
signal quest_phase_triggered(phase_id: String, title: String, description: String)

# Eventi
signal event_triggered(event_data: Dictionary)
signal event_consequences_applied(narrative_text: String)
signal resource_change_requested(resource_type: String, amount: int)
signal item_transaction_requested(transaction: Dictionary)
```

---

## ⚔️ **5. COMBATSYSTEMMANAGER** (524 righe)

### **Responsabilità**
- Sistema combattimento turn-based completo
- Attacco, difesa, uso oggetti, fuga
- AI nemico e calcolo danni con varianza e critici
- Risoluzione combattimento e ricompense

### **File:** `scripts/managers/CombatSystemManager.gd`

### **Variabili Stato**
```gdscript
enum CombatState { IDLE, PLAYER_TURN, ENEMY_TURN, RESOLVING, COMPLETED }
enum CombatAction { ATTACK, DEFEND, USE_ITEM, FLEE }
enum CombatResult { PLAYER_VICTORY, ENEMY_VICTORY, PLAYER_FLED }

var current_combat_state: CombatState = CombatState.IDLE
var current_enemy: Dictionary = {}
var is_player_turn: bool = true
var combat_log: Array = []
var combat_stats: Dictionary = {}
var player_defense_bonus: int = 0
var enemy_defense_bonus: int = 0
```

### **API Pubbliche**
```gdscript
func start_combat(enemy_id: String) -> bool
func perform_player_action(action: CombatAction, target_data: Dictionary = {}) -> bool
func get_combat_log() -> Array
func is_combat_active() -> bool
func get_combat_stats() -> Dictionary
func get_player_defense_info() -> Dictionary
```

### **Segnali**
```gdscript
signal combat_started(enemy_data: Dictionary)
signal combat_ended(result: CombatResult, rewards: Dictionary)
signal turn_changed(new_state: CombatState)
signal damage_dealt(target: String, amount: int, is_critical: bool)
signal player_defeated()
signal combat_log_updated(message: String)
```

---

## ⌨️🎨 **6. INTERFACESYSTEMMANAGER** (412 righe)

### **Responsabilità**
- **Input:** Gestione centralizzata input con sistema stati (MAP, INVENTORY, DIALOGUE, COMBAT, POPUP)
- **Temi:** 3 temi (DEFAULT, CRT_GREEN, HIGH_CONTRAST), palette colori, toggle CRT
- **Coordinamento:** Segnali per movimento, inventario, azioni combat

### **File:** `scripts/managers/InterfaceSystemManager.gd`

### **Variabili Stato**
```gdscript
enum InputState { MAP, INVENTORY, DIALOGUE, COMBAT, POPUP }
enum ThemeType { DEFAULT, CRT_GREEN, HIGH_CONTRAST }

var current_input_state: InputState = InputState.MAP
var current_theme_type: ThemeType = ThemeType.DEFAULT
var current_colors: Dictionary = DEFAULT_THEME.duplicate()
var crt_enabled: bool = false
```

### **API Pubbliche**
```gdscript
# Input
func set_input_state(new_state: InputState) -> void
func get_current_input_state() -> InputState
func is_input_blocked() -> bool

# Tema
func set_theme(theme_type: ThemeType) -> void
func get_current_theme() -> ThemeType
func toggle_crt_theme() -> void
func get_theme_colors() -> Dictionary
func get_color(color_name: String) -> Color
func get_theme_name(theme_type: ThemeType) -> String

# Alias compatibilità
func set_state(new_state: InputState) -> void
func get_current_state() -> InputState
func apply_theme(theme_name: String) -> void
```

### **Segnali**
```gdscript
# Input
signal map_move(direction: Vector2i)
signal inventory_toggle
signal inventory_use_item(slot_number: int)
signal action_confirm
signal action_cancel
signal level_up_request
signal combat_action_selected(action: int)
signal debug_info_requested

# Tema
signal theme_changed(theme_type: ThemeType)
signal colors_updated(colors: Dictionary)
signal crt_shader_toggled(enabled: bool)
```

---

## 💾 **7. PERSISTENCESYSTEMMANAGER** (739 righe)

### **Responsabilità**
- Salvataggio/caricamento completo stato gioco
- Sistema backup automatico con timer
- Compressione dati opzionale
- Migrazione tra versioni salvataggio
- Gestione liste salvataggi e backup

### **File:** `scripts/managers/PersistenceSystemManager.gd`

### **Variabili Stato**
```gdscript
enum SaveResult { SUCCESS, ERROR_WRITE_FAILED, ERROR_SERIALIZE, ERROR_VALIDATION }
enum LoadResult { SUCCESS, ERROR_FILE_NOT_FOUND, ERROR_CORRUPTED_DATA, ERROR_INVALID_FORMAT }

var available_saves: Array[Dictionary] = []
var available_backups: Array[Dictionary] = []
var auto_save_timer: Timer
var last_auto_save_time: float = 0.0
var persistence_config: Dictionary = {}

const MAX_SAVES: int = 10
const SAVE_PREFIX: String = "tsp_save_"
const BACKUP_PREFIX: String = "tsp_backup_"
```

### **API Pubbliche**
```gdscript
# Salvataggio
func save_game(save_name: String = "") -> String   # ritorna save_id
func auto_save() -> String
func delete_save(save_id: String) -> bool

# Caricamento
func load_game(save_id: String) -> bool
func restore_from_backup(backup_id: String) -> bool

# Query
func get_available_saves() -> Array[Dictionary]
func get_available_backups() -> Array[Dictionary]
func has_save_file(save_id: String) -> bool
func get_save_metadata(save_id: String) -> Dictionary
```

### **Segnali**
```gdscript
signal game_saved(save_id: String)
signal game_loaded(save_id: String)
signal save_failed(save_id: String, error: String)
signal load_failed(save_id: String, error: String)
signal backup_created(backup_id: String)
signal auto_save_triggered()
signal migration_completed(old_version: String, new_version: String)
```

---

## 🔄 **SIGNAL CHAIN — Flusso di Gioco Reale**

### **Movimento**
```
1. Tasto (WASD/Frecce)
2. InterfaceSystemManager._input() → map_move signal
3. World._on_map_move() → muove giocatore
4. WorldSystemManager.advance_time_by_moves()
5. PlayerSystemManager._on_time_advanced() → consumo risorse
6. NarrativeSystemManager.try_trigger_event() → evento casuale
7. UI panels si aggiornano via segnali
```

### **Evento**
```
1. NarrativeSystemManager.try_trigger_event(biome)
2. event_triggered signal → UI mostra popup
3. Giocatore sceglie → handle_event_choice(index)
4. Skill check (se richiesto) via PlayerSystemManager.skill_check()
5. _apply_consequences() → resource_change_requested signal
6. PlayerSystemManager applica modifiche HP/food/water/items
7. UI si aggiorna
```

### **Combattimento**
```
1. CombatSystemManager.start_combat(enemy_id) → combat_started signal
2. InterfaceSystemManager passa a InputState.COMBAT
3. Giocatore → perform_player_action(CombatAction.ATTACK)
4. Usa PlayerSystemManager.skill_check() e equipped_weapon
5. Turno nemico → _perform_enemy_turn()
6. Loop fino a combattimento finito → combat_ended signal
7. Ricompense applicate via PlayerSystemManager
```

---

## 📝 **METADATI**

- **Versione:** v0.9.8.1
- **Data aggiornamento:** 6 Marzo 2026
- **Autoload totali:** 8 (7 manager + CrashLogger)
- **LOC manager totali:** ~3.830 righe
