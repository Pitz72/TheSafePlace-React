# ⚔️ COMBAT SYSTEM - THE SAFE PLACE v0.9.5

## 🎯 **OVERVIEW SISTEMA COMBATTIMENTO**

Il Combat System di The Safe Place implementa un sistema di combattimento turn-based completo che si integra perfettamente con il sistema eventi esistente. Il sistema gestisce combattimenti dinamici con nemici procedurali, calcolo danni basato su statistiche e risoluzione automatica dei turni.

### **Filosofia Design Combattimento**
- **Turn-Based Strategy:** Combattimento a turni con decisioni tattiche
- **Stat-Driven:** Utilizzo completo delle statistiche giocatore (forza, agilità, fortuna)
- **Event-Integrated:** Triggerato da eventi casuali durante l'esplorazione
- **Procedural Enemies:** Nemici generati dinamicamente con scaling difficoltà
- **Risk vs Reward:** Combattimenti pericolosi ma ricchi di ricompense

---

## 🏗️ **ARCHITETTURA COMBATTIMENTO**

### **Stati del Sistema Combattimento**
```gdscript
enum CombatState {
    IDLE,           # Sistema inattivo
    INITIALIZING,   # Preparazione combattimento
    PLAYER_TURN,    # Turno del giocatore
    ENEMY_TURN,     # Turno del nemico
    RESOLVING,      # Risoluzione azioni
    ENDED           # Combattimento terminato
}
```

### **Flusso Combattimento**
```
1. Trigger Event → 2. CombatManager.start_combat() → 3. Inizializzazione
   ↓
4. Player Turn → 5. Player Action Selection → 6. Action Resolution
   ↓
7. Enemy Turn → 8. Enemy AI Action → 9. Enemy Action Resolution
   ↓
10. Check Victory/Defeat → 11. Combat End → 12. Rewards/Consequences
```

---

## 🎲 **SISTEMA AZIONI COMBATTIMENTO**

### **Azioni Disponibili**
```gdscript
enum CombatAction {
    ATTACK,         # Attacco base con arma equipaggiata
    DEFEND,         # Difesa che riduce danno nemico
    USE_ITEM,       # Utilizzo oggetto in combattimento
    FLEE,           # Tentativo fuga (skill check agilità)
    SPECIAL         # Azioni speciali basate su equipaggiamento
}
```

### **Risoluzione Attacchi**
```gdscript
# Formula danno base
func calculate_damage(attacker_stats: Dictionary, weapon_data: Dictionary) -> int:
    var base_damage = weapon_data.damage.min + randi_range(0, weapon_data.damage.max - weapon_data.damage.min)
    var stat_modifier = get_stat_modifier(attacker_stats.forza)
    var weapon_bonus = weapon_data.damage.bonus

    return base_damage + stat_modifier + weapon_bonus
```

### **Difesa e Riduzione Danno**
```gdscript
# Riduzione danno basata su armatura
func calculate_damage_reduction(armor_value: int, damage_type: String) -> float:
    var base_reduction = armor_value * 0.1  # 10% per punto armatura
    var type_modifier = get_damage_type_modifier(damage_type)
    return min(base_reduction * type_modifier, 0.8)  # Max 80% riduzione
```

---

## 👹 **SISTEMA NEMICI**

### **Struttura Nemico**
```json
{
  "id": "enemy_mutated_dog",
  "name": "Cane Mutato",
  "description": "Un cane selvatico mutato dalle radiazioni",
  "stats": {
    "health": 25,
    "attack": 8,
    "defense": 2,
    "speed": 12
  },
  "loot_table": [
    {"item_id": "meat_raw", "chance": 0.6, "quantity": {"min": 1, "max": 2}},
    {"item_id": "fur_animal", "chance": 0.3, "quantity": {"min": 1, "max": 1}}
  ],
  "behavior": "aggressive",
  "difficulty_modifier": 1.0
}
```

### **Scaling Difficoltà**
```gdscript
# Sistema scaling basato su livello giocatore
func scale_enemy_for_player_level(enemy_data: Dictionary, player_level: int) -> Dictionary:
    var scaled_enemy = enemy_data.duplicate(true)

    # Aumento salute e attacco basato su livello
    var level_multiplier = 1.0 + (player_level - 1) * 0.15
    scaled_enemy.stats.health = int(scaled_enemy.stats.health * level_multiplier)
    scaled_enemy.stats.attack = int(scaled_enemy.stats.attack * level_multiplier)

    return scaled_enemy
```

### **Tipi Comportamento Nemici**
```
AGGRESSIVE:    Attacca sempre quando possibile
DEFENSIVE:     Priorità difesa, attacca solo se necessario
UNPREDICTABLE: Comportamento casuale
BERSERK:       Aumento danno quando ferito
COWARD:        Alta probabilità fuga quando debole
```

---

## 🎯 **SISTEMA TURNI**

### **Turno Giocatore**
```gdscript
func process_player_turn() -> void:
    current_combat_state = CombatState.PLAYER_TURN
    turn_changed.emit(CombatState.PLAYER_TURN)

    # Mostra azioni disponibili
    var available_actions = get_available_actions()
    # Attendi input giocatore...

func execute_player_action(action: CombatAction, target: String = "") -> Dictionary:
    match action:
        CombatAction.ATTACK:
            return execute_attack()
        CombatAction.DEFEND:
            return execute_defend()
        CombatAction.USE_ITEM:
            return execute_use_item(target)
        CombatAction.FLEE:
            return execute_flee()
```

### **Turno Nemico (AI Semplice)**
```gdscript
func process_enemy_turn() -> void:
    current_combat_state = CombatState.ENEMY_TURN
    turn_changed.emit(CombatState.ENEMY_TURN)

    # AI decision based on enemy behavior
    var action = decide_enemy_action()
    var result = execute_enemy_action(action)

    # Auto-advance to next turn
    if current_combat_state == CombatState.ENEMY_TURN:
        start_player_turn()
```

---

## 🏆 **SISTEMA RICOMPENSE**

### **Loot Generation**
```gdscript
func generate_combat_loot(enemy_data: Dictionary) -> Array:
    var loot_items = []

    for loot_entry in enemy_data.loot_table:
        if randf() < loot_entry.chance:
            var quantity = randi_range(loot_entry.quantity.min, loot_entry.quantity.max)
            loot_items.append({
                "item_id": loot_entry.item_id,
                "quantity": quantity
            })

    return loot_items
```

### **Experience Rewards**
```gdscript
func calculate_experience_reward(enemy_data: Dictionary) -> int:
    var base_exp = enemy_data.stats.health + enemy_data.stats.attack
    var difficulty_multiplier = enemy_data.difficulty_modifier
    var random_bonus = randi_range(0, base_exp / 4)

    return int((base_exp * difficulty_multiplier) + random_bonus)
```

---

## 🔗 **INTEGRAZIONE SISTEMI**

### **Trigger da Eventi**
```gdscript
# EventManager.gd - Trigger combattimento
func trigger_enemy_encounter(biome: String) -> void:
    var enemy_id = select_random_enemy_for_biome(biome)

    if CombatManager.start_combat(enemy_id):
        event_triggered.emit({
            "type": "combat",
            "enemy_id": enemy_id,
            "description": "Sei stato attaccato!"
        })
```

### **Aggiornamenti UI**
```gdscript
# GameUI.gd - Display combattimento
func _on_combat_started(enemy_data: Dictionary) -> void:
    show_combat_popup(enemy_data)
    update_combat_ui()

func _on_turn_changed(new_state: CombatState) -> void:
    update_turn_indicator(new_state)
    refresh_action_buttons()
```

### **Salvataggio Stato Combattimento**
```gdscript
# SaveLoadManager.gd - Persistenza combattimento
func get_combat_state() -> Dictionary:
    if CombatManager.current_combat_state == CombatManager.CombatState.IDLE:
        return {}

    return {
        "enemy_id": CombatManager.current_enemy.id,
        "enemy_health": CombatManager.current_enemy.current_health,
        "combat_state": CombatManager.current_combat_state,
        "turn_count": CombatManager.turn_count
    }
```

---

## 📊 **BALANCING E STATISTICHE**

### **Difficoltà Combattimento**
```
Facile:   Nemici con stat < 15, loot comune
Medio:    Nemici con stat 15-25, loot uncommon
Difficile: Nemici con stat 25-35, loot rare
Epico:    Nemici con stat 35+, loot legendary
```

### **Probabilità Successo**
```
Attacco base: 75% + (stat_bonus)
Fuga: 50% + (agilità_modifier * 10%)
Uso item: 90% (se item valido)
Difesa: Sempre riuscita, riduce danno 50%
```

### **Scaling per Livello**
```
Ogni 5 livelli giocatore:
- +15% salute nemici
- +10% attacco nemici
- +20% esperienza reward
- +5% probabilità loot raro
```

---

## 🎮 **USER INTERFACE COMBATTIMENTO**

### **Combat Popup Layout**
```
┌─ COMBATTIMENTO ──────────────────────────┐
│ Cane Mutato (HP: 18/25)                 │
│                                         │
│ [🗡️] Attacca     [🛡️] Difendi          │
│ [🎒] Usa Oggetto [🏃] Fuga             │
│                                         │
│ Log Combattimento:                      │
│ > Hai attaccato per 12 danni!          │
│ > Cane mutato attacca per 6 danni!     │
└─────────────────────────────────────────┘
```

### **Stati Visivi**
```
🟢 Verde: Turno giocatore attivo
🔴 Rosso: Turno nemico attivo
🟡 Giallo: Risoluzione azione
⚫ Grigio: Combattimento terminato
```

---

## 🔧 **API PUBBLICA COMBATMANAGER**

### **Controllo Combattimento**
```gdscript
# Inizio combattimento
func start_combat(enemy_id: String) -> bool

# Azioni giocatore
func process_player_action(action: String, target: String = "") -> Dictionary

# Query stato
func get_available_actions() -> Array
func get_combat_state() -> Dictionary
func is_combat_active() -> bool

# Utilità
func calculate_damage(attacker_stats: Dictionary, weapon_data: Dictionary) -> int
func get_enemy_data(enemy_id: String) -> Dictionary
```

### **Segnali Emessi**
```gdscript
signal combat_started(enemy_data: Dictionary)
signal combat_ended(result: String, rewards: Dictionary)
signal turn_changed(new_state: CombatState)
signal damage_dealt(amount: int, is_player_damage: bool)
signal combat_action_performed(action: String, success: bool)
signal enemy_defeated(enemy_id: String)
```

---

## 🧪 **TESTING E VALIDATION**

### **Combat Test Scenarios**
```gdscript
# Test attacco base
func test_basic_attack() -> void:
    var player_stats = {"forza": 14, "agilita": 12}
    var weapon = {"damage": {"min": 5, "max": 10, "bonus": 2}}
    var damage = CombatManager.calculate_damage(player_stats, weapon)

    assert(damage >= 7 && damage <= 16)  # 5-10 + 2 ± modifier

# Test risoluzione combattimento
func test_combat_resolution() -> void:
    CombatManager.start_combat("enemy_test")
    var result = CombatManager.process_player_action("attack")

    assert(result.has("damage"))
    assert(result.has("success"))
```

### **Performance Benchmarks**
```
Inizializzazione combattimento: <50ms
Risoluzione turno: <20ms
Calcolo danno: <5ms
Generazione loot: <10ms
```

---

## 🚀 **ROADMAP ESPANSIONI**

### **Funzionalità Pianificate**
```
Advanced AI:     Comportamenti nemici più complessi
Multiple Enemies: Combattimenti con più nemici
Allies:          Compagni controllabili
Special Abilities: Abilità uniche per classi
Equipment Effects: Effetti speciali equipaggiamento
Status Effects:   Veleno, sanguinamento, stun
```

### **Sistema Progressione**
```
Skill Trees:     Alberi abilità combattimento
Weapon Mastery:  Specializzazioni armi
Combat Styles:   Stili di combattimento diversi
Achievements:    Trofei combattimento
```

---

**Versione:** v0.9.6.5 "Computer Boot System"
**Data:** 24 Settembre 2025
**Target:** LLM Technical Analysis - Combat System