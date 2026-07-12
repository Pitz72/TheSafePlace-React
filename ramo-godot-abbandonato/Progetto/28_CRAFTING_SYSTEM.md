# 🔨 CRAFTING SYSTEM - THE SAFE PLACE v0.9.5

## 🎯 **OVERVIEW SISTEMA CRAFTING**

Il Crafting System di The Safe Place implementa un sistema completo di produzione e creazione oggetti che si integra con l'inventario del giocatore e i rifugi nel mondo di gioco. Il sistema permette ai giocatori di combinare materiali grezzi per creare equipaggiamento, consumabili e strumenti utili per la sopravvivenza.

### **Filosofia Design Crafting**
- **Workbench-Based:** Crafting disponibile solo nei rifugi con workbench
- **Material-Driven:** Utilizzo intelligente delle risorse disponibili
- **Quality-Based:** Risultati influenzati da materiali e abilità
- **Progressive Unlocking:** Nuove ricette sbloccate con progressione
- **Survival-Focused:** Oggetti utili per l'esplorazione e sopravvivenza

---

## 🏗️ **ARCHITETTURA CRAFTING**

### **Componenti del Sistema**
```gdscript
# Stati workbench
var workbench_active: bool = false
var current_workbench_level: int = 1

# Database ricette
var crafting_recipes: Dictionary = {}

# Sistema abilità
var crafting_skill: int = 1
var crafted_items_count: int = 0
var quality_bonus: float = 0.0
```

### **Flusso Crafting**
```
1. Raggiungi Rifugio → 2. Attiva Workbench → 3. Seleziona Ricetta
   ↓
4. Verifica Materiali → 5. Calcola Qualità → 6. Conferma Crafting
   ↓
7. Consuma Materiali → 8. Produci Oggetto → 9. Applica Bonus Qualità
   ↓
10. Aggiorna Statistiche → 11. Sblocca Nuove Ricette
```

---

## ⚙️ **SISTEMA RICETTE**

### **Struttura Ricetta**
```json
{
  "id": "recipe_iron_sword",
  "name": "Spada di Ferro",
  "description": "Una spada robusta forgiata da ferro",
  "category": "weapon",
  "skill_requirement": 3,
  "workbench_level_required": 1,
  "crafting_time": 180,
  "materials_required": [
    {"item_id": "iron_ingot", "quantity": 2},
    {"item_id": "wood_plank", "quantity": 1},
    {"item_id": "leather_strip", "quantity": 1}
  ],
  "result": {
    "item_id": "sword_iron",
    "quantity": 1,
    "quality_range": {"min": 0.7, "max": 1.2}
  },
  "skill_xp_reward": 25,
  "unlocks_recipes": ["recipe_iron_armor"]
}
```

### **Tipi di Ricette**
```
WEAPON:         Armi melee e ranged
ARMOR:          Protezioni e armature
TOOL:           Strumenti e utensili
CONSUMABLE:     Pozioni e consumabili avanzati
STRUCTURE:      Miglioramenti rifugio
AMMO:           Munizioni avanzate
```

---

## 🎨 **SISTEMA QUALITÀ**

### **Fattori Qualità**
```gdscript
func calculate_craft_quality(materials_used: Array, crafter_skill: int) -> float:
    var base_quality = 0.8  # Qualità base

    # Bonus materiali
    for material in materials_used:
        base_quality += get_material_quality_bonus(material)

    # Bonus abilità crafting
    var skill_bonus = crafter_skill * 0.05
    base_quality += skill_bonus

    # Variazione casuale (±15%)
    var random_factor = randf_range(-0.15, 0.15)
    base_quality += random_factor

    return clamp(base_quality, 0.5, 1.5)
```

### **Effetti Qualità**
```
Qualità 0.5-0.7: Scarsa - Durabilità ridotta, stat diminuiti
Qualità 0.8-1.0: Standard - Stat normali
Qualità 1.1-1.3: Buona - Stat aumentati, durabilità bonus
Qualità 1.4-1.5: Eccellente - Stat massimi, effetti speciali
```

### **Material Quality Bonuses**
```gdscript
const MATERIAL_QUALITY_BONUSES = {
    "scrap_metal": 0.0,      # Materiale di scarto
    "iron_ingot": 0.1,       # Ferro lavorato
    "steel_ingot": 0.2,      # Acciaio
    "titanium_alloy": 0.4,   # Lega avanzata
    "pre_war_alloy": 0.6     # Materiale pre-guerra
}
```

---

## 🏭 **SISTEMA WORKBENCH**

### **Livelli Workbench**
```gdscript
enum WorkbenchLevel {
    BASIC = 1,      # Ricette base, materiali comuni
    ADVANCED = 2,   # Ricette avanzate, materiali rari
    MASTER = 3,     # Ricette master, materiali leggendari
    LEGENDARY = 4   # Ricette uniche, materiali speciali
}
```

### **Funzionalità per Livello**
```
BASIC:       Crafting base, riparazione semplice
ADVANCED:    Crafting avanzato, miglioramento qualità
MASTER:      Crafting master, creazione prototipi
LEGENDARY:   Crafting leggendario, reverse engineering
```

### **Upgrade Workbench**
```gdscript
func upgrade_workbench() -> bool:
    var upgrade_cost = get_workbench_upgrade_cost(current_workbench_level)

    if can_afford_upgrade(upgrade_cost):
        consume_materials(upgrade_cost)
        current_workbench_level += 1
        unlock_new_recipes_for_level(current_workbench_level)
        return true

    return false
```

---

## 📈 **SISTEMA PROGRESSIONE**

### **Abilità Crafting**
```gdscript
# Sistema leveling
var crafting_skill_levels = {
    1: {"name": "Principiante", "xp_required": 0, "quality_bonus": 0.0},
    2: {"name": "Apprendista", "xp_required": 100, "quality_bonus": 0.05},
    3: {"name": "Artigiano", "xp_required": 300, "quality_bonus": 0.1},
    4: {"name": "Mastro", "xp_required": 600, "quality_bonus": 0.15},
    5: {"name": "Leggendario", "xp_required": 1000, "quality_bonus": 0.2}
}
```

### **Sblocco Ricette**
```gdscript
func check_recipe_unlock_conditions(recipe_id: String) -> bool:
    var recipe = crafting_recipes[recipe_id]

    # Controlli requisiti
    if crafting_skill < recipe.skill_requirement:
        return false

    if current_workbench_level < recipe.workbench_level_required:
        return false

    # Controlli prerequisiti (altre ricette completate)
    for prereq in recipe.prerequisites:
        if not completed_recipes.has(prereq):
            return false

    return true
```

---

## 🔄 **INTEGRAZIONE INVENTARIO**

### **Material Tracking**
```gdscript
func get_available_materials() -> Dictionary:
    var materials = {}

    for item in PlayerManager.inventory:
        var item_data = DataManager.get_item_data(item.id)
        if item_data.category == "CRAFTING_MATERIAL":
            materials[item.id] = item.quantity

    return materials
```

### **Recipe Validation**
```gdscript
func can_craft_recipe(recipe_id: String) -> Dictionary:
    var recipe = crafting_recipes[recipe_id]
    var available_materials = get_available_materials()
    var missing_materials = []

    for requirement in recipe.materials_required:
        var available = available_materials.get(requirement.item_id, 0)
        if available < requirement.quantity:
            missing_materials.append({
                "item_id": requirement.item_id,
                "required": requirement.quantity,
                "available": available
            })

    return {
        "can_craft": missing_materials.is_empty(),
        "missing_materials": missing_materials
    }
```

### **Material Consumption**
```gdscript
func consume_crafting_materials(recipe: Dictionary) -> void:
    for requirement in recipe.materials_required:
        PlayerManager.remove_item(requirement.item_id, requirement.quantity)
```

---

## 🎮 **USER INTERFACE CRAFTING**

### **Crafting Menu Layout**
```
┌─ WORKBENCH ──────────────────────────────┐
│ Livello: 2 (Advanced)  Abilità: Artigiano │
│                                           │
│ [🗡️] Armi          [🛡️] Armature          │
│ [🔧] Strumenti     [🧪] Consumabili       │
│ [🏠] Strutture     [🔫] Munizioni        │
│                                           │
│ ════════════════ RICETTA ════════════════ │
│ Spada di Ferro                            │
│ Materiali richiesti:                      │
│ • 2x Ferro (✓)    • 1x Legno (✓)         │
│ • 1x Cuoio (✓)                            │
│                                           │
│ Qualità stimata: Buona (1.15)            │
│ Tempo: 3 minuti                           │
│                                           │
│ [CRAFT]                                   │
└───────────────────────────────────────────┘
```

### **Stati Visuali**
```
🟢 Verde: Materiali disponibili
🔴 Rosso: Materiali mancanti
🟡 Giallo: Materiali sufficienti ma di bassa qualità
⚪ Bianco: Ricetta bloccata (requisiti non soddisfatti)
```

---

## 📊 **ECONOMIA MATERIALI**

### **Material Scarcity**
```gdscript
const MATERIAL_SCARCITY = {
    "scrap_metal": 0.8,      # Comune
    "iron_ingot": 0.6,       # Moderatamente raro
    "steel_ingot": 0.4,      # Raro
    "titanium_alloy": 0.2,   # Molto raro
    "pre_war_alloy": 0.05    # Estremamente raro
}
```

### **Crafting Efficiency**
```gdscript
func calculate_crafting_efficiency(recipe: Dictionary) -> float:
    var total_material_value = 0
    var result_item_value = DataManager.get_item_data(recipe.result.item_id).value

    for material in recipe.materials_required:
        var material_data = DataManager.get_item_data(material.item_id)
        total_material_value += material_data.value * material.quantity

    return result_item_value / total_material_value
```

---

## 🔗 **INTEGRAZIONE SISTEMI**

### **Trigger nei Rifugi**
```gdscript
# World.gd - Attivazione workbench
func _on_player_entered_shelter(shelter_type: String) -> void:
    if shelter_type == "workshop":
        CraftingManager.set_workbench_access(true, get_workbench_level())
        GameUI.show_crafting_interface()
```

### **Aggiornamenti UI**
```gdscript
# GameUI.gd - Interfaccia crafting
func show_crafting_interface() -> void:
    var available_recipes = CraftingManager.get_available_recipes()
    populate_recipe_list(available_recipes)

func _on_recipe_selected(recipe_id: String) -> void:
    var recipe_data = CraftingManager.get_recipe_data(recipe_id)
    var can_craft = CraftingManager.can_craft_recipe(recipe_id)

    update_recipe_details(recipe_data, can_craft)
```

### **Progressione Salvataggio**
```gdscript
# SaveLoadManager.gd - Persistenza crafting
func get_crafting_save_data() -> Dictionary:
    return {
        "crafting_skill": CraftingManager.crafting_skill,
        "workbench_levels": CraftingManager.get_workbench_levels(),
        "unlocked_recipes": CraftingManager.get_unlocked_recipes(),
        "completed_recipes": CraftingManager.completed_recipes
    }
```

---

## 🧪 **TESTING E VALIDATION**

### **Crafting Test Cases**
```gdscript
# Test validazione materiali
func test_recipe_validation() -> void:
    # Setup inventario con materiali
    PlayerManager.add_item("iron_ingot", 2)
    PlayerManager.add_item("wood_plank", 1)

    var result = CraftingManager.can_craft_recipe("recipe_iron_sword")
    assert(result.can_craft == true)

# Test calcolo qualità
func test_quality_calculation() -> void:
    var materials = ["iron_ingot", "steel_ingot"]
    var quality = CraftingManager.calculate_craft_quality(materials, 3)

    assert(quality >= 0.8 && quality <= 1.3)
```

### **Performance Metrics**
```
Caricamento ricette: <100ms
Validazione materiali: <20ms
Calcolo qualità: <10ms
Consumo materiali: <15ms
```

---

## 🚀 **ROADMAP ESPANSIONI**

### **Funzionalità Avanzate**
```
Bulk Crafting:     Crafting multipli
Specialization:     Specializzazioni per tipo oggetto
Research System:   Sblocco ricette tramite ricerca
Quality Upgrades:   Miglioramento oggetti esistenti
Automation:        Sistemi automatici nei rifugi avanzati
Trading:           Scambio ricette tra giocatori
```

### **Sistema Economico**
```
Material Markets:   Economia materiali dinamica
Recipe Trading:     Commercio ricette
Crafting Guilds:    Organizzazioni crafting
Master Craftsmen:   NPC specializzati
```

---

## 🔧 **API PUBBLICA CRAFTINGMANAGER**

### **Controllo Workbench**
```gdscript
func set_workbench_access(has_access: bool, level: int = 1) -> void
func get_workbench_level() -> int
func upgrade_workbench() -> bool
```

### **Gestione Ricette**
```gdscript
func get_available_recipes() -> Array
func can_craft_recipe(recipe_id: String) -> Dictionary
func craft_item(recipe_id: String) -> Dictionary
func get_recipe_data(recipe_id: String) -> Dictionary
```

### **Sistema Qualità**
```gdscript
func calculate_craft_quality(materials: Array, skill: int) -> float
func get_quality_modifier(quality: float) -> float
func get_quality_description(quality: float) -> String
```

### **Progressione**
```gdscript
func improve_crafting_skill(xp_amount: int) -> void
func get_crafting_skill_level() -> int
func unlock_recipe(recipe_id: String) -> bool
```

### **Segnali Emessi**
```gdscript
signal workbench_access_changed(has_access: bool, level: int)
signal item_crafted(item_data: Dictionary, quality: float)
signal crafting_skill_improved(new_level: int, new_xp: int)
signal recipe_unlocked(recipe_id: String)
signal crafting_failed(recipe_id: String, reason: String)
```

---

**Versione:** v0.9.6.5 "Computer Boot System"
**Data:** 24 Settembre 2025
**Target:** LLM Technical Analysis - Crafting System