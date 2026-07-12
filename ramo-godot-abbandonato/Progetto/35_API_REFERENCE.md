# 📚 API REFERENCE - THE SAFE PLACE v0.9.7

*Documentazione completa delle API pubbliche di tutti i sistemi*

## 📋 Indice API

- [🎛️ Singleton Managers](#-singleton-managers)
- [📊 DataManager](#-datamanager)
- [👤 PlayerManager](#-playermanager)
- [🎭 EventManager](#-eventmanager)
- [🎮 InputManager](#-inputmanager)
- [🔨 CraftingManager](#-craftingmanager)
- [📖 NarrativeManager](#-narrativemanager)
- [🏆 QuestManager](#-questmanager)
- [⚔️ CombatManager](#-combatmanager)
- [⏰ TimeManager](#-timemanager)
- [💾 SaveLoadManager](#-saveloadmanager)
- [🎨 ThemeManager](#-thememanager)

---

## 🎛️ Singleton Managers

Tutti i manager sono implementati come Singleton (Autoload) e accessibili globalmente:

```gdscript
# Accesso ai manager
var player = PlayerManager
var data = DataManager
var events = EventManager
var input = InputManager
var crafting = CraftingManager
var narrative = NarrativeManager
var quests = QuestManager
var combat = CombatManager
var time = TimeManager
var save_load = SaveLoadManager
var theme = ThemeManager
```

---

## 📊 DataManager

**Scopo**: Gestione centralizzata di tutti i dati di gioco (items, eventi, configurazioni)

### 🔧 Metodi Principali

#### `get_item_data(item_id: String) -> Dictionary`
Restituisce i dati completi di un oggetto dal database unificato.

```gdscript
var sword_data = DataManager.get_item_data("rusty_sword")
print(sword_data.name)  # "Spada Arrugginita"
```

#### `get_rarity_data(rarity_name: String) -> Dictionary`
Ottiene i dati di un livello di rarità.

```gdscript
var epic_data = DataManager.get_rarity_data("EPIC")
print(epic_data.color)  # Colore per UI
```

#### `load_json_file(file_path: String) -> Dictionary`
Carica e valida un file JSON dal filesystem.

```gdscript
var custom_data = DataManager.load_json_file("res://data/custom/my_data.json")
```

### 📊 Proprietà Pubbliche

- `items: Dictionary` - Database unificato oggetti
- `rarity_system: Dictionary` - Sistema rarità completo
- `status_effects: Dictionary` - Effetti di stato disponibili

---

## 👤 PlayerManager

**Scopo**: Gestione completa del personaggio giocatore (stats, inventario, progressione)

### 🔧 Metodi Principali

#### `add_item_to_inventory(item_id: String, quantity: int = 1) -> bool`
Aggiunge oggetti all'inventario del giocatore.

```gdscript
if PlayerManager.add_item_to_inventory("health_potion", 3):
    print("Pozioni aggiunte!")
```

#### `remove_item_from_inventory(item_id: String, quantity: int = 1) -> bool`
Rimuove oggetti dall'inventario.

```gdscript
if PlayerManager.remove_item_from_inventory("bandage", 1):
    print("Benda utilizzata!")
```

#### `has_item(item_id: String, quantity: int = 1) -> bool`
Verifica se il giocatore possiede un oggetto.

```gdscript
if PlayerManager.has_item("key_card"):
    print("Hai la chiave d'accesso!")
```

#### `gain_experience(amount: int, reason: String = "")`
Aggiunge esperienza al personaggio.

```gdscript
PlayerManager.gain_experience(50, "Evento completato")
```

#### `modify_stat(stat_name: String, amount: int)`
Modifica una statistica del personaggio.

```gdscript
PlayerManager.modify_stat("forza", 2)  # +2 Forza
```

### 📊 Proprietà Pubbliche

- `hp: int` - Punti vita attuali
- `max_hp: int` - Punti vita massimi
- `food: int` - Livello cibo (0-100)
- `water: int` - Livello acqua (0-100)
- `stats: Dictionary` - Statistiche personaggio
- `inventory: Array` - Inventario oggetti
- `experience: int` - Esperienza totale
- `available_stat_points: int` - Punti statistica disponibili

---

## 🎭 EventManager

**Scopo**: Sistema eventi narrativi con skill check e conseguenze

### 🔧 Metodi Principali

#### `trigger_random_event(biome: String) -> bool`
Attiva un evento casuale per il bioma specificato.

```gdscript
if EventManager.trigger_random_event("foreste"):
    print("Evento forestale attivato!")
```

#### `process_event_choice(choice_index: int)`
Processa la scelta del giocatore per l'evento corrente.

```gdscript
EventManager.process_event_choice(0)  # Prima scelta
```

#### `get_current_event() -> Dictionary`
Ottiene i dati dell'evento attualmente attivo.

```gdscript
var event = EventManager.get_current_event()
print(event.title)
```

### 🎯 Segnali

- `event_triggered(event_data: Dictionary)` - Evento attivato
- `skill_check_completed(details: Dictionary)` - Skill check completato
- `event_consequences_applied(log: String)` - Conseguenze applicate

---

## 🎮 InputManager

**Scopo**: Gestione centralizzata input con sistema di stati

### 🔧 Metodi Principali

#### `set_input_state(new_state: InputState)`
Cambia lo stato corrente del sistema di input.

```gdscript
InputManager.set_input_state(InputManager.InputState.COMBAT)
```

#### `get_current_state() -> InputState`
Ottiene lo stato corrente del sistema di input.

```gdscript
var state = InputManager.get_current_state()
```

### 📊 Stati Disponibili

```gdscript
enum InputState {
    MAP,        # Movimento mappa
    INVENTORY,  # Navigazione inventario
    DIALOGUE,   # Sistema dialoghi
    COMBAT,     # Combattimento
    POPUP       # Popup interazione
}
```

### 🎯 Segnali

- `map_move(direction: Vector2i)` - Movimento mappa
- `inventory_toggle()` - Toggle inventario
- `combat_action_selected(action_index: int)` - Azione combattimento
- `state_changed(old_state, new_state)` - Cambio stato

---

## 🔨 CraftingManager

**Scopo**: Sistema crafting con ricette, skill e workbench

### 🔧 Metodi Principali

#### `attempt_crafting(recipe_id: String, quantity: int = 1) -> CraftingResult`
Tenta di craftare un oggetto.

```gdscript
var result = CraftingManager.attempt_crafting("bandage", 2)
if result.success:
    print("Crafting riuscito!")
```

#### `get_available_recipes() -> Array[String]`
Ottiene tutte le ricette disponibili per il giocatore.

```gdscript
var recipes = CraftingManager.get_available_recipes()
```

#### `get_craftable_recipes() -> Array[String]`
Ottiene le ricette che il giocatore può craftare ora.

```gdscript
var craftable = CraftingManager.get_craftable_recipes()
```

#### `set_workbench_access(has_access: bool)`
Imposta l'accesso al workbench.

```gdscript
CraftingManager.set_workbench_access(true)
```

### 📊 Proprietà Pubbliche

- `crafting_skill: int` - Livello skill crafting
- `unlocked_recipes: Array[String]` - Ricette sbloccate
- `has_workbench_access: bool` - Accesso workbench

---

## 📖 NarrativeManager

**Scopo**: Sistema narrativo con stati emotivi e progressione storia

### 🔧 Metodi Principali

#### `update_understanding(amount: int)`
Aggiorna il livello di comprensione narrativa.

```gdscript
NarrativeManager.update_understanding(5)
```

#### `update_empathy(character: String, amount: int)`
Modifica l'empatia verso un personaggio.

```gdscript
NarrativeManager.update_empathy("elian", 3)
```

#### `get_emotional_state() -> EmotionalState`
Ottiene lo stato emotivo corrente del personaggio.

```gdscript
var state = NarrativeManager.get_emotional_state()
```

### 📊 Stati Emotivi

```gdscript
enum EmotionalState {
    COLD,        # Freddo
    GUARDED,     # Diffidente
    OPEN,        # Aperto
    CONNECTED,   # Connesso
    TRANSFORMED  # Trasformato
}
```

---

## 🏆 QuestManager

**Scopo**: Gestione quest principali e secondarie con progressione

### 🔧 Metodi Principali

#### `start_quest(quest_id: String) -> bool`
Avvia una nuova quest.

```gdscript
if QuestManager.start_quest("find_water_source"):
    print("Quest avviata!")
```

#### `progress_quest(quest_id: String, stage_id: String) -> bool`
Fa progredire una quest al prossimo stadio.

```gdscript
QuestManager.progress_quest("main_quest", "stage_2")
```

#### `complete_quest(quest_id: String) -> bool`
Completa una quest.

```gdscript
QuestManager.complete_quest("tutorial_quest")
```

### 🎯 Segnali

- `quest_started(quest_id: String)` - Quest avviata
- `quest_progressed(quest_id, stage_id)` - Quest progredita
- `quest_completed(quest_id: String)` - Quest completata

---

## ⚔️ CombatManager

**Scopo**: Sistema combattimento turn-based con abilità e stati

### 🔧 Metodi Principali

#### `start_combat(enemy_data: Dictionary) -> bool`
Inizia un combattimento.

```gdscript
var enemy = {"name": "Bandito", "hp": 50, "attack": 15}
CombatManager.start_combat(enemy)
```

#### `execute_player_action(action_type: String, target: String = "") -> Dictionary`
Esegue un'azione del giocatore.

```gdscript
var result = CombatManager.execute_player_action("attack")
```

#### `is_combat_active() -> bool`
Verifica se un combattimento è in corso.

```gdscript
if CombatManager.is_combat_active():
    print("Combattimento in corso!")
```

---

## ⏰ TimeManager

**Scopo**: Gestione tempo di gioco, cicli giorno/notte, eventi temporali

### 🔧 Metodi Principali

#### `advance_time(hours: int)`
Fa avanzare il tempo di gioco.

```gdscript
TimeManager.advance_time(2)  # +2 ore
```

#### `get_current_time() -> Dictionary`
Ottiene l'ora corrente di gioco.

```gdscript
var time = TimeManager.get_current_time()
print("Ora: %d:%02d" % [time.hour, time.minute])
```

#### `is_day_time() -> bool`
Verifica se è giorno.

```gdscript
if TimeManager.is_day_time():
    print("È giorno!")
```

---

## 💾 SaveLoadManager

**Scopo**: Sistema salvataggio/caricamento con serializzazione completa

### 🔧 Metodi Principali

#### `save_game(slot_name: String = "default") -> bool`
Salva lo stato corrente del gioco.

```gdscript
if SaveLoadManager.save_game("slot_1"):
    print("Gioco salvato!")
```

#### `load_game(slot_name: String = "default") -> bool`
Carica uno stato salvato.

```gdscript
if SaveLoadManager.load_game("slot_1"):
    print("Gioco caricato!")
```

#### `has_save_file(slot_name: String = "default") -> bool`
Verifica se esiste un salvataggio.

```gdscript
if SaveLoadManager.has_save_file("slot_1"):
    print("Salvataggio trovato!")
```

---

## 🎨 ThemeManager

**Scopo**: Gestione temi UI, shader CRT, personalizzazione visiva

### 🔧 Metodi Principali

#### `apply_theme(theme_name: String)`
Applica un tema UI.

```gdscript
ThemeManager.apply_theme("retro_green")
```

#### `toggle_crt_effect(enabled: bool)`
Attiva/disattiva l'effetto CRT.

```gdscript
ThemeManager.toggle_crt_effect(true)
```

#### `set_font_size(size: int)`
Imposta la dimensione del font.

```gdscript
ThemeManager.set_font_size(16)
```

---

## 🔗 Convenzioni API

### 📋 Naming Convention

- **Metodi pubblici**: `snake_case`
- **Proprietà pubbliche**: `snake_case`
- **Segnali**: `snake_case` con suffisso descrittivo
- **Enum**: `PascalCase`
- **Costanti**: `UPPER_SNAKE_CASE`

### 🎯 Pattern di Ritorno

- **Bool**: `true` per successo, `false` per fallimento
- **Dictionary**: Dati strutturati con chiavi descrittive
- **Array**: Collezioni omogenee
- **Null**: Quando nessun dato è disponibile

### 🔄 Gestione Errori

Tutti i metodi gestiscono gracefully gli errori:
- Parametri invalidi → valori di default
- Risorse mancanti → log di warning + fallback
- Stati inconsistenti → auto-correzione quando possibile

---

## 📊 Metriche Performance

- **Chiamate API**: < 1ms per operazioni semplici
- **Database queries**: < 5ms per ricerche complesse
- **Serializzazione**: < 100ms per save completo
- **Memory footprint**: < 50MB per tutti i manager

---

*Documentazione generata automaticamente per The Safe Place v0.9.7*
*Ultimo aggiornamento: Sistema API Reference v1.0*