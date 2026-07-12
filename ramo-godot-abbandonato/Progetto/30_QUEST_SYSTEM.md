# 🎯 QUEST SYSTEM - THE SAFE PLACE v0.9.5

## 🎯 **OVERVIEW SISTEMA QUEST**

Il Quest System di The Safe Place gestisce missioni strutturate e progressione narrativa attraverso una serie di obiettivi collegati. Il sistema supporta quest principali che guidano la storia e quest secondarie che arricchiscono l'esperienza di gioco, creando un senso di scopo e direzione nel mondo post-apocalittico.

### **Filosofia Design Quest**
- **Narrative-Driven:** Quest che avanzano la storia principale
- **Branching Objectives:** Obiettivi multipli e percorsi alternativi
- **Dynamic Rewards:** Ricompense scalate basate su performance
- **World Integration:** Quest integrate nel mondo di gioco
- **Progression Tracking:** Sistema chiaro di avanzamento

---

## 🏗️ **ARCHITETTURA QUEST**

### **Tipi di Quest**
```gdscript
enum QuestType {
    MAIN,           # Quest storia principale
    SIDE,           # Quest secondarie
    EVENT,          # Quest da eventi
    DAILY,          # Quest giornaliere
    ACHIEVEMENT     # Achievement/obiettivi
}
```

### **Stati Quest**
```gdscript
enum QuestStatus {
    LOCKED,         # Non disponibile
    AVAILABLE,      # Disponibile ma non iniziata
    ACTIVE,         # In corso
    COMPLETED,      # Completata con successo
    FAILED,         # Fallita
    ABANDONED       # Abbandonata
}
```

### **Struttura Quest Base**
```json
{
  "id": "quest_main_journey_begins",
  "type": "MAIN",
  "title": "Il Viaggio Inizia",
  "description": "Il tuo viaggio verso il Safe Place è appena cominciato. Trova indizi sulla sua posizione.",
  "status": "ACTIVE",
  "priority": 10,
  "required_level": 1,
  "prerequisites": [],
  "objectives": [
    {
      "id": "explore_first_town",
      "description": "Esplora la prima città che incontri",
      "type": "location",
      "target": "any_city",
      "current_progress": 0,
      "required_progress": 1,
      "completed": false
    }
  ],
  "rewards": {
    "experience": 100,
    "items": [{"id": "ration_pack", "quantity": 2}],
    "unlock_quests": ["quest_side_survivor_encounter"]
  },
  "time_limit": 0,
  "failure_conditions": []
}
```

---

## 🎯 **SISTEMA OBIETTIVI**

### **Tipi di Obiettivo**
```gdscript
enum ObjectiveType {
    LOCATION,       # Raggiungi posizione specifica
    ITEM,           # Ottieni oggetto specifico
    KILL,           # Sconfiggi nemico specifico
    TALK,           # Parla con NPC specifico
    EXPLORE,        # Esplora area specifica
    SURVIVE,        # Sopravvivi per X giorni
    CRAFT,          # Crea oggetto specifico
    DELIVER         # Consegna oggetto a destinazione
}
```

### **Sistema Progressione Obiettivi**
```gdscript
func update_quest_objective(quest_id: String, objective_id: String, progress: int) -> void:
    if not quest_progress.has(quest_id):
        quest_progress[quest_id] = {}

    if not quest_progress[quest_id].has(objective_id):
        quest_progress[quest_id][objective_id] = 0

    quest_progress[quest_id][objective_id] += progress

    # Controlla completamento obiettivo
    check_objective_completion(quest_id, objective_id)

    # Controlla completamento quest
    check_quest_completion(quest_id)

    objective_progress_updated.emit(quest_id, objective_id)
```

### **Obiettivo Dinamico**
```json
{
  "id": "collect_medical_supplies",
  "type": "ITEM",
  "target": "medical_item",
  "target_quantity": 5,
  "current_quantity": 0,
  "accepted_items": [
    "bandages",
    "painkillers",
    "antiseptic",
    "first_aid_kit"
  ],
  "description": "Raccogli 5 oggetti medici per aiutare i sopravvissuti"
}
```

---

## 🔄 **GESTIONE QUEST ATTIVE**

### **Database Quest**
```gdscript
var main_quest: Dictionary = {}
var side_quests: Dictionary = {}
var active_quests: Dictionary = {}
var completed_quests: Array = []
var failed_quests: Array = []
```

### **Inizializzazione Quest**
```gdscript
func initialize_quests() -> void:
    # Carica quest principali
    main_quest = load_quest_data("quest_main_journey_begins")

    # Carica quest secondarie disponibili
    load_available_side_quests()

    # Imposta quest iniziali come disponibili
    mark_quest_available("quest_main_journey_begins")

    quests_initialized.emit()
```

### **Gestione Stato Quest**
```gdscript
func start_quest(quest_id: String) -> bool:
    if not can_start_quest(quest_id):
        return false

    var quest_data = get_quest_data(quest_id)
    quest_data.status = QuestStatus.ACTIVE
    active_quests[quest_id] = quest_data

    # Inizializza progressione
    quest_progress[quest_id] = {}
    for objective in quest_data.objectives:
        quest_progress[quest_id][objective.id] = 0

    quest_started.emit(quest_id)
    return true

func complete_quest(quest_id: String) -> bool:
    if not can_complete_quest(quest_id):
        return false

    var quest_data = active_quests[quest_id]

    # Applica ricompense
    apply_quest_rewards(quest_data.rewards)

    # Aggiorna stato
    quest_data.status = QuestStatus.COMPLETED
    completed_quests.append(quest_id)
    active_quests.erase(quest_id)

    # Sblocca nuove quest
    unlock_followup_quests(quest_data.rewards.unlock_quests)

    quest_completed.emit(quest_id, quest_data.rewards)
    return true
```

---

## 🎁 **SISTEMA RICOMPENSE**

### **Struttura Ricompense**
```json
{
  "experience": 250,
  "items": [
    {"id": "weapon_knife_combat", "quantity": 1},
    {"id": "ration_pack", "quantity": 3}
  ],
  "stat_boosts": {
    "forza": 1,
    "carisma": 1
  },
  "unlock_quests": [
    "quest_side_weapon_training",
    "quest_side_community_help"
  ],
  "unlock_locations": [
    "hidden_bunker",
    "abandoned_military_base"
  ],
  "narrative_unlocks": [
    "memory_fathers_past",
    "lore_military_secrets"
  ]
}
```

### **Applicazione Ricompense**
```gdscript
func apply_quest_rewards(rewards: Dictionary) -> void:
    # Experience
    if rewards.has("experience"):
        PlayerManager.add_experience(rewards.experience, "quest")

    # Items
    if rewards.has("items"):
        for item_reward in rewards.items:
            PlayerManager.add_item(item_reward.id, item_reward.quantity)

    # Stat boosts
    if rewards.has("stat_boosts"):
        for stat in rewards.stat_boosts:
            PlayerManager.modify_stat(stat, rewards.stat_boosts[stat])

    # Quest unlocks
    if rewards.has("unlock_quests"):
        for quest_id in rewards.unlock_quests:
            mark_quest_available(quest_id)

    # Narrative unlocks
    if rewards.has("narrative_unlocks"):
        for narrative_id in rewards.narrative_unlocks:
            NarrativeManager.unlock_narrative_content(narrative_id)
```

---

## ⏰ **SISTEMA TEMPI E SCADENZE**

### **Quest con Time Limit**
```gdscript
var quest_time_limits: Dictionary = {}
var quest_start_times: Dictionary = {}

func start_timed_quest(quest_id: String, time_limit_minutes: int) -> void:
    start_quest(quest_id)
    quest_time_limits[quest_id] = time_limit_minutes
    quest_start_times[quest_id] = TimeManager.get_current_game_time()

    # Connetti timer
    TimeManager.time_advanced.connect(_on_time_advanced.bind(quest_id))
```

### **Controllo Scadenze**
```gdscript
func _on_time_advanced(minutes: int, quest_id: String) -> void:
    if not quest_time_limits.has(quest_id):
        return

    var elapsed_time = TimeManager.get_current_game_time() - quest_start_times[quest_id]
    var time_limit = quest_time_limits[quest_id]

    if elapsed_time >= time_limit:
        fail_quest(quest_id, "time_expired")
```

---

## 🌳 **SISTEMA DIPENDENZE QUEST**

### **Prerequisites System**
```gdscript
func check_quest_prerequisites(quest_id: String) -> bool:
    var quest_data = get_quest_data(quest_id)

    # Controlla quest prerequisite completate
    for prereq_quest in quest_data.prerequisites:
        if not completed_quests.has(prereq_quest):
            return false

    # Controlla livello giocatore
    if PlayerManager.get_player_level() < quest_data.required_level:
        return false

    # Controlla oggetti richiesti
    if quest_data.has("required_items"):
        for required_item in quest_data.required_items:
            if PlayerManager.get_item_count(required_item.id) < required_item.quantity:
                return false

    return true
```

### **Quest Tree Structure**
```gdscript
var quest_tree = {
    "quest_main_journey_begins": {
        "unlocks": ["quest_side_first_aid", "quest_side_scavenging"],
        "branches": {
            "path_merciful": ["quest_side_help_survivors"],
            "path_pragmatic": ["quest_side_self_preservation"]
        }
    },
    "quest_main_find_safe_place": {
        "requires": ["quest_main_journey_begins"],
        "unlocks": ["quest_main_confront_reality"]
    }
}
```

---

## 🔗 **INTEGRAZIONE EVENTI**

### **Eventi che Avanzano Quest**
```gdscript
# EventManager.gd - Integrazione quest
func process_event_choice(event_id: String, choice_index: int) -> Dictionary:
    var result = super.process_event_choice(event_id, choice_index)

    # Controlla se evento avanza quest
    if result.has("quest_progress"):
        for progress_update in result.quest_progress:
            QuestManager.update_quest_objective(
                progress_update.quest_id,
                progress_update.objective_id,
                progress_update.progress
            )

    return result
```

### **Quest che Triggerano Eventi**
```gdscript
func check_quest_event_triggers() -> void:
    for quest_id in active_quests:
        var quest_data = active_quests[quest_id]

        for objective in quest_data.objectives:
            if objective.type == "location" and objective.current_progress == 0:
                # Trigger evento arrivo in location
                if PlayerManager.get_current_location() == objective.target:
                    EventManager.trigger_location_event(objective.target)
                    objective.current_progress = 1
```

---

## 🎮 **USER INTERFACE QUEST**

### **Quest Journal Layout**
```
┌─ MISSIONI ATTIVE ────────────────────────┐
│ 🎯 Il Viaggio Inizia                     │
│    Stato: In Corso                       │
│    Priorità: Alta                        │
│                                           │
│    Obiettivi:                             │
│    ✅ Esplora prima città                 │
│    🔄 Trova 3 sopravvissuti (2/3)        │
│    ❌ Raccogli 5 razioni (3/5)           │
│                                           │
│ 🎯 Aiuto ai Sopravvissuti               │
│    Stato: Disponibile                    │
│    Ricompense: EXP +150, Bende x3       │
└───────────────────────────────────────────┘
```

### **Quest Details Popup**
```
┌─ DETTAGLI MISSIONE ──────────────────────┐
│ Il Viaggio Inizia                        │
│ Tipo: Principale                         │
│                                           │
│ Il tuo viaggio verso il Safe Place è     │
│ appena cominciato. Trova indizi sulla    │
│ sua posizione.                            │
│                                           │
│ Ricompense:                               │
│ • 100 Punti Esperienza                   │
│ • Razioni x2                             │
│                                           │
│ [INIZIA MISSIONE]   [CHIUDI]             │
└───────────────────────────────────────────┘
```

---

## 💾 **SISTEMA SALVATAGGIO QUEST**

### **Dati Salvataggio**
```gdscript
func get_save_data() -> Dictionary:
    return {
        "main_quest": main_quest,
        "side_quests": side_quests,
        "active_quests": active_quests,
        "completed_quests": completed_quests,
        "failed_quests": failed_quests,
        "quest_progress": quest_progress,
        "quest_time_limits": quest_time_limits,
        "quest_start_times": quest_start_times
    }
```

### **Ripristino Stato**
```gdscript
func load_save_data(save_data: Dictionary) -> void:
    main_quest = save_data.get("main_quest", {})
    side_quests = save_data.get("side_quests", {})
    active_quests = save_data.get("active_quests", {})
    completed_quests = save_data.get("completed_quests", [])
    failed_quests = save_data.get("failed_quests", [])
    quest_progress = save_data.get("quest_progress", {})

    # Ripristina timer se necessario
    quest_time_limits = save_data.get("quest_time_limits", {})
    quest_start_times = save_data.get("quest_start_times", {})

    reconstruct_quest_state()
```

---

## 📊 **TRACKING E ANALYTICS**

### **Quest Statistics**
```gdscript
func get_quest_statistics() -> Dictionary:
    return {
        "total_quests_started": active_quests.size() + completed_quests.size() + failed_quests.size(),
        "completion_rate": calculate_completion_rate(),
        "average_completion_time": calculate_average_completion_time(),
        "most_failed_objective_type": find_most_failed_objective_type(),
        "quest_difficulty_distribution": analyze_quest_difficulty()
    }
```

### **Player Quest History**
```gdscript
var quest_history = {
    "started_quests": [],
    "completed_timestamps": {},
    "failed_quests": [],
    "abandoned_quests": [],
    "quest_choices": {}  # Scelte fatte in quest
}
```

---

## 🔧 **API PUBBLICA QUESTMANAGER**

### **Gestione Quest**
```gdscript
func initialize_quests() -> void
func start_quest(quest_id: String) -> bool
func complete_quest(quest_id: String) -> bool
func fail_quest(quest_id: String, reason: String) -> bool
func abandon_quest(quest_id: String) -> bool
```

### **Query Quest**
```gdscript
func get_active_quests() -> Array
func get_available_quests() -> Array
func get_completed_quests() -> Array
func get_quest_data(quest_id: String) -> Dictionary
func get_quest_progress(quest_id: String) -> Dictionary
```

### **Obiettivi**
```gdscript
func update_quest_objective(quest_id: String, objective_id: String, progress: int) -> void
func check_quest_completion(quest_id: String) -> bool
func get_objective_status(quest_id: String, objective_id: String) -> Dictionary
```

### **Utilità**
```gdscript
func can_start_quest(quest_id: String) -> bool
func get_quest_statistics() -> Dictionary
func get_save_data() -> Dictionary
func load_save_data(data: Dictionary) -> void
```

### **Segnali Emessi**
```gdscript
signal quests_initialized
signal quest_started(quest_id: String)
signal quest_completed(quest_id: String, rewards: Dictionary)
signal quest_failed(quest_id: String, reason: String)
signal quest_abandoned(quest_id: String)
signal objective_progress_updated(quest_id: String, objective_id: String)
signal quest_available(quest_id: String)
```

---

## 🧪 **TESTING E VALIDATION**

### **Quest Test Scenarios**
```gdscript
# Test completamento obiettivo
func test_objective_completion() -> void:
    QuestManager.start_quest("test_quest")

    # Simula progresso obiettivo
    QuestManager.update_quest_objective("test_quest", "collect_items", 5)

    var progress = QuestManager.get_quest_progress("test_quest")
    assert(progress.collect_items == 5)

    # Verifica completamento automatico
    assert(QuestManager.get_quest_data("test_quest").status == QuestStatus.COMPLETED)

# Test dipendenze quest
func test_quest_prerequisites() -> void:
    # Quest richiede livello 5
    var can_start = QuestManager.can_start_quest("high_level_quest")
    assert(not can_start)

    # Simula level up
    PlayerManager.set_player_level(5)
    can_start = QuestManager.can_start_quest("high_level_quest")
    assert(can_start)
```

### **Performance Benchmarks**
```
Inizializzazione quest: <50ms
Aggiornamento obiettivo: <10ms
Controllo completamento: <15ms
Salvataggio dati quest: <25ms
```

---

## 🚀 **ROADMAP ESPANSIONI**

### **Funzionalità Avanzate**
```
Dynamic Quests:       Quest generate proceduralmente
Multiplayer Quests:   Missioni cooperative
Quest Sharing:        Condivisione quest tra giocatori
Quest Editor:         Tool creazione quest custom
Time-Sensitive Quests: Missioni con scadenza reale
Branching Narratives: Quest con scelte multiple
```

### **Sistema Achievement**
```
Milestone System:     Obiettivi di progresso
Achievement Unlocks:  Sblocco contenuti speciali
Leaderboards:         Confronto progressi
Reward Tiers:         Ricompense scalate
Social Features:      Condivisione achievement
```

---

**Versione:** v0.9.6.5 "Computer Boot System"
**Data:** 24 Settembre 2025
**Target:** LLM Technical Analysis - Quest System