# 🎒 ITEMS DATABASE - THE SAFE PLACE v0.4.0

## 🎯 **OVERVIEW SISTEMA OGGETTI**

Il sistema oggetti di The Safe Place è costruito su un **database JSON modulare** con **8 categorie principali** e oltre **100 oggetti** diversi. Utilizza il **"Linguaggio Comune Unificato"** (v0.4.0) per garantire consistenza e estendibilità.

### **Filosofia Design Oggetti**
- **Unified Language:** Schema standardizzato per tutte le categorie
- **Properties-Based:** Dati specifici incapsulati in sottostruttura `properties`
- **Color-Coded:** Sistema colori dinamico basato su categoria + rarità
- **Modulare:** Ogni categoria in file JSON separato
- **Type-Safe:** Validazione runtime con fallback graceful

---

## 📊 **CATEGORIE OGGETTI (8 Principali)**

### **Database Files Structure**
```
data/items/
├── weapons.json           # WEAPON - Armi melee e ranged
├── armor.json             # ARMOR - Armature e protezioni
├── consumables.json       # CONSUMABLE - Cibo, medicina, bevande  
├── ammo.json              # AMMO - Munizioni per armi
├── crafting_materials.json # CRAFTING_MATERIAL - Materiali grezzi
├── quest_items.json       # QUEST - Oggetti di missione
├── unique_items.json      # UNIQUE - Oggetti speciali narrativi
└── misc_items.json        # MISC - Oggetti vari e tools
```

### **Conteggi per Categoria (v0.4.0)**
```
WEAPON: 15+ oggetti
├── Melee: 8+ (coltelli, spade, bastoni)
└── Ranged: 7+ (pistole, fucili, archi)

ARMOR: 12+ oggetti  
├── Body: 6+ (giacche, giubbotti, corazze)
├── Head: 2+ (elmetti, cappelli)
├── Hands: 2+ (guanti)
├── Feet: 2+ (stivali)

CONSUMABLE: 25+ oggetti
├── Food: 12+ (razioni, carne, frutta)
├── Drink: 6+ (acqua, bevande)
├── Medical: 7+ (bende, medicine, kit medici)

AMMO: 8+ oggetti
├── Pistol: 3+ (9mm, .45, .357)
├── Rifle: 3+ (5.56, 7.62, .308)  
├── Shotgun: 2+ (calibro 12, slug)

CRAFTING_MATERIAL: 15+ oggetti
├── Metals: 5+ (ferro, acciaio, titanio)
├── Organics: 5+ (cuoio, tessuto, legno)
├── Electronics: 5+ (circuiti, batterie)

QUEST: 5+ oggetti narrativi
UNIQUE: 8+ oggetti leggendari
MISC: 10+ strumenti e tools
```

---

## 🗡️ **WEAPONS DATABASE ANALYSIS**

### **Weapon Types e Subcategories**
```
Subcategories:
├── melee (Corpo a corpo)
│   ├── knife (Coltelli)
│   ├── sword (Spade)  
│   ├── blunt (Armi contundenti)
│   └── exotic (Armi esotiche)
└── ranged (Distanza)
    ├── pistol (Pistole)
    ├── rifle (Fucili)
    ├── shotgun (Fucili a pompa)
    └── bow (Archi)
```

### **Weapon Properties Schema**
```json
"properties": {
  "slot": "main_hand",           // Slot equipaggiamento
  "durability": 50,             // Durabilità corrente
  "maxDurability": 50,          // Durabilità massima
  "damage": {                   // Sistema danno variabile
    "min": 5,                   // Danno minimo
    "max": 12,                  // Danno massimo
    "bonus": 2                  // Bonus fisso
  },
  "ammo_type": "ammo_9mm",      // Tipo munizione (solo ranged)
  "effects": [                  // Effetti speciali opzionali
    {
      "effect_type": "bleeding",
      "chance": 0.2,
      "duration": 3
    }
  ]
}
```

### **Esempi Weapon Data**

#### **Melee Weapon Example**
```json
"katana_mono_molecular": {
  "id": "katana_mono_molecular",
  "name": "Katana Monomolecolare",
  "nameShort": "Katana Hi-Tech",
  "description": "Una katana forgiata con una lega pre-guerra e affilata a livello molecolare.",
  "category": "WEAPON",
  "subcategory": "melee",
  "rarity": "LEGENDARY",
  "weight": 1.5,
  "value": 2000,
  "stackable": false,
  "max_stack": 1,
  "properties": {
"slot": "main_hand",
"durability": 70,
"maxDurability": 70,
"damage": {"min": 18, "max": 25, "bonus": 8},
"effects": [
      {"effect_type": "bleeding_edge", "chance": 0.7},
      {"effect_type": "armor_piercing", "amount": 0.8}
    ]
  }
}
```

#### **Ranged Weapon Example**
```json
"sniper_rifle_scout": {
  "id": "sniper_rifle_scout",
  "name": "Fucile di Precisione da Esploratore",
  "nameShort": "Fucile Precisione",
  "description": "Un fucile bolt-action leggero e preciso, dotato di un'ottica a lungo raggio.",
  "category": "WEAPON", 
  "subcategory": "ranged",
  "rarity": "EPIC",
  "weight": 5.5,
  "value": 900,
  "stackable": false,
  "max_stack": 1,
  "properties": {
"slot": "main_hand",
"durability": 50,
"maxDurability": 50,
"damage": {"min": 25, "max": 40, "bonus": 10},
"ammo_type": "ammo_rifle",
"effects": [
      {"effect_type": "high_critical", "chance": 0.2, "multiplier": 3},
      {"effect_type": "armor_piercing", "amount": 0.3}
    ]
  }
}
```

---

## 🛡️ **ARMOR DATABASE ANALYSIS**

### **Armor Types e Slots**
```
Equipment Slots:
├── body (Corpo principale)
├── head (Testa/Elmetto)
├── hands (Guanti)
├── feet (Stivali/Scarpe)
└── accessory (Accessori vari)
```

### **Armor Properties Schema**
```json
"properties": {
  "slot": "body",               // Slot equipaggiamento
  "durability": 80,            // Durabilità corrente
  "maxDurability": 80,         // Durabilità massima
  "armorValue": 5,             // Valore protezione base
  "setId": "wastelander_set",  // ID set per bonus equipaggiamento
  "effects": [                 // Effetti passivi
    {
      "effect_type": "elemental_resistance",
      "amount": 0.15
    }
  ]
}
```

### **Equipment Sets System**
```
Wastelander Set (Epic Set):
├── wastelander_coat (Body armor)
├── wastelander_boots (Feet armor)  
├── wastelander_gloves (Hand armor)
└── Set Bonus: +10% movimento, +5% resistenza elementi

Military Set (Rare Set):
├── kevlar_vest (Body armor)
├── combat_boots (Feet armor)
├── tactical_gloves (Hand armor)
└── Set Bonus: +15% protezione proiettili

Survivor Set (Common Set):
├── leather_jacket (Body armor)
├── worn_boots (Feet armor)
└── Set Bonus: +20% durabilità equipaggiamento
```

### **Esempio Armor Data**
```json
"wastelander_coat": {
  "id": "wastelander_coat",
  "name": "Cappotto del Vagabondo",
  "nameShort": "Cappotto Vagab.",
  "description": "Un lungo cappotto di cuoio rinforzato con placche metalliche.",
  "category": "ARMOR",
  "subcategory": "body",
  "rarity": "EPIC",
  "weight": 2.5,
  "value": 400,
  "stackable": false,
  "max_stack": 1,
  "properties": {
"slot": "body",
"armorValue": 6,
"durability": 80,
"maxDurability": 80,
"setId": "wastelander_set",
"effects": [
      {"effect_type": "elemental_resistance", "amount": 0.15},
      {"effect_type": "weather_protection", "allWeather": true}
    ]
  }
}
```

---

## 🍎 **CONSUMABLES DATABASE ANALYSIS**

### **Consumable Types**
```
Subcategories:
├── food (Cibo)
│   ├── Canned goods (Razioni, cibo in scatola)
│   ├── Fresh food (Carne, frutta, verdura)
│   ├── Cooked food (Cibo preparato)
│   └── Survival food (Razioni militari, MRE)
├── drink (Bevande)
│   ├── Water (Acqua pura/sporca)
│   ├── Beverages (Bevande)
│   └── Alcohol (Alcolici)
└── medical (Medicine)
    ├── Basic (Bende, medicine base)
    ├── Advanced (Kit medici, chirurgia)
    └── Stimulants (Stimolanti, droghe)
```

### **Consumable Properties Schema**
```json
"properties": {
  "max_portions": 3,            // Porzioni utilizzabili (opzionale)
  "effects": [                  // Effetti al consumo
    {
      "effect_type": "heal",     // Tipo effetto
      "amount": 25              // Quantità effetto
    },
    {
      "effect_type": "hydrate",
      "amount": 40
    },
    {
      "effect_type": "nourish", 
      "amount": 30
    },
    {
      "effect_type": "infection_chance",  // Effetti negativi
      "chance": 0.15
    }
  ]
}
```

### **Effect Types per Consumables**
```
Healing Effects:
├── heal (Ripristino HP immediato)
├── regeneration (HP nel tempo)
└── cure_status (Rimozione stati negativi)

Survival Effects:
├── nourish (Ripristino fame)
├── hydrate (Ripristino sete)
└── energy_boost (Bonus temporaneo energia)

Negative Effects:
├── infection_chance (Rischio infezione)
├── poison_chance (Rischio avvelenamento)
└── addiction_risk (Rischio dipendenza)

Bonus Effects:
├── stat_boost (Bonus temporaneo statistiche)
├── skill_bonus (Bonus skill check)
└── experience_boost (Moltiplicatore EXP)
```

### **Esempio Consumable Data**
```json
"MRE_pack_military": {
  "id": "MRE_pack_military",
  "name": "Pacco Razione MRE Militare",
  "nameShort": "Razione MRE",
  "description": "Meal, Ready-to-Eat. Una razione da combattimento completa.",
  "category": "CONSUMABLE",
  "subcategory": "food",
  "rarity": "RARE",
  "weight": 1.0,
  "value": 100,
  "stackable": true,
  "max_stack": 5,
  "properties": {
    "effects": [
      {"effect_type": "nourish", "amount": 100},
      {"effect_type": "well_fed_bonus", "duration": 180}
    ]
  }
}
```

---

## 🔫 **AMMO DATABASE ANALYSIS**

### **Ammo Types**
```
Calibers:
├── ammo_9mm (Pistole standard)
├── ammo_45acp (Pistole heavy)  
├── ammo_357 (Revolver)
├── ammo_rifle (Fucili generici)
├── ammo_556 (Fucili d'assalto)
├── ammo_762 (Fucili precision)
├── ammo_shotgun (Fucili a pompa)
└── ammo_energy_cell (Armi energia)
```

### **Ammo Properties Schema**
```json
"properties": {
  "caliber": "9mm",             // Calibro munizione
  "damage_modifier": 1.0,       // Moltiplicatore danno (1.0 = normale)
  "armor_penetration": 0.1,     // Capacità penetrazione armatura
  "effects": [                  // Effetti speciali opzionali
    {
      "effect_type": "armor_piercing",
      "penetration": 0.3
    }
  ]
}
```

### **Esempio Ammo Data**
```json
"ammo_556_armor_piercing": {
  "id": "ammo_556_armor_piercing",
  "name": "5.56mm Penetratori",
  "nameShort": "5.56 AP",
  "description": "Munizioni 5.56mm con punta perforante in tungsteno.",
  "category": "AMMO",
  "subcategory": "rifle",
  "rarity": "UNCOMMON",
  "weight": 0.02,
  "value": 5,
  "stackable": true,
  "max_stack": 100,
  "properties": {
    "caliber": "556",
    "damage_modifier": 1.1,
    "armor_penetration": 0.4,
    "effects": [
      {"effect_type": "armor_piercing", "penetration": 0.4}
    ]
  }
}
```

---

## ⚒️ **CRAFTING MATERIALS DATABASE**

### **Material Categories**
```
Material Types:
├── metals (Metalli)
│   ├── scrap_metal (Rottami base)
│   ├── steel_plate (Acciaio lavorato)
│   ├── titanium_alloy (Leghe avanzate)
│   └── rare_earth_metals (Metalli rari)
├── organics (Materiali organici)
│   ├── animal_hide (Pelli animali)
│   ├── fabric (Tessuti)
│   ├── wood (Legno)
│   └── rope (Corde)
├── electronics (Elettronica)
│   ├── circuit_board (Circuiti)
│   ├── wire_copper (Fili)
│   ├── battery_cell (Batterie)
│   └── microprocessor (Processori)
└── chemicals (Chimici)
    ├── gunpowder (Polvere da sparo)
    ├── adhesive (Adesivi)
    ├── fuel (Carburanti)
    └── acid (Acidi)
```

### **Crafting Properties Schema**
```json
"properties": {
  "crafting_value": 10,         // Valore per crafting
  "rarity_bonus": 1.2,          // Moltiplicatore qualità risultato
  "durability_bonus": 5,        // Bonus durabilità crafted items
  "special_properties": [       // Proprietà speciali trasferite
    "fire_resistance",
    "lightweight"
  ]
}
```

---

## 🏺 **QUEST ITEMS DATABASE**

### **Quest Item Types**
```
Document Types:
├── old_military_map (Mappe e documenti)
├── classified_documents (Documenti segreti)
└── research_notes (Note ricerca)

Personal Items:
├── carillon_of_lena (Oggetti personali)
├── fathers_compass (Ricordi famiglia)
└── mothers_locket (Cimeli)

Key Items:
├── lab_keycard (Chiavi accesso)
├── radio_frequency (Informazioni)
└── safe_place_coordinates (Coordinate rifugio)
```

### **Quest Properties Schema**
```json
"properties": {
  "quest_flags": ["main_story", "optional"],  // Flag quest associate
  "lore_unlock": ["backstory_lab", "family_history"],  // Lore sbloccato
  "unique": true,                   // Non duplicabile
  "plot_critical": true            // Essenziale per storia principale
}
```

### **Esempio Quest Item**
```json
"carillon_of_lena": {
  "id": "carillon_of_lena", 
  "name": "Carillon di Lena",
  "nameShort": "Carillon Lena",
  "description": "Un piccolo carillon di legno intagliato. Suona una melodia malinconica ma familiare.",
  "category": "QUEST",
  "subcategory": "personal",
  "rarity": "EPIC",
  "weight": 0.3,
  "value": 200,
  "stackable": false,
  "max_stack": 1,
  "properties": {
"quest_flags": ["family_memories", "emotional_support"],
"lore_unlock": ["lena_backstory", "pre_war_life"],
"unique": true,
"plot_critical": false
  }
}
```

---

## 💎 **UNIQUE ITEMS DATABASE**

### **Unique Item Categories**
```
Legendary Weapons:
├── prototype_energy_weapons (Armi energia sperimentali)
├── pre_war_artifacts (Artefatti pre-guerra)
└── custom_modifications (Modifiche uniche)

Special Tools:
├── advanced_detectors (Rilevatori avanzati)
├── navigation_equipment (Equipaggiamento navigazione)
└── survival_gear (Attrezzatura sopravvivenza)

Story Artifacts:
├── family_heirlooms (Cimeli famiglia)
├── military_decorations (Decorazioni militari)
└── research_prototypes (Prototipi ricerca)
```

### **Unique Properties Schema**
```json
"properties": {
  "legendary_effects": [        // Effetti unici non riproducibili
    {
      "effect_type": "unique_ability",
      "name": "mothers_protection",
      "description": "Protezione materna",
      "power": "high"
    }
  ],
  "story_significance": "high", // Importanza narrativa
  "acquisition_method": "quest_reward",  // Come ottenerlo
  "indestructible": true        // Non può essere distrutto
}
```

---

## 🧪 **SYSTEM INTEGRATIONS**

### **Color System Integration**
```gdscript
# DataManager calcolo colore dinamico
func get_item_color(item_id: String) -> Color:
    var item_data = get_item_data(item_id)
    if item_data.is_empty():
        return Color.WHITE
    
    var base_color = CATEGORY_COLORS.get(item_data.category, Color.WHITE)
    var multiplier = RARITY_MULTIPLIERS.get(item_data.rarity, 1.0)
    
    return base_color * multiplier

# Risultati colori per categoria:
# WEAPON + COMMON = Rosso attenuato (0.8*0.6 = 0.48 intensità)
# ARMOR + LEGENDARY = Blu molto intenso (0.8*1.6 = 1.28 intensità)
# CONSUMABLE + RARE = Verde normale (0.8*1.0 = 0.8 intensità)
```

### **Inventory Integration**
```gdscript
# PlayerManager - Gestione inventario con validazione
func add_item(item_id: String, quantity: int = 1) -> bool:
    # 1. Validazione esistenza oggetto
    if not DataManager.has_item(item_id):
        return false
    
    # 2. Controllo spazio inventario
    if inventory.size() >= MAX_INVENTORY_SLOTS and not _can_stack_item(item_id):
        return false
    
    # 3. Gestione stackable items
    var item_data = DataManager.get_item_data(item_id)
    if item_data.stackable:
        return _add_to_existing_stack(item_id, quantity)
    else:
        return _add_new_inventory_slot(item_id, quantity)
```

### **UI Integration**
```gdscript
# GameUI - Visualizzazione inventario con colori
func update_inventory_panel():
    var inventory_text = ""
    
    for i in range(PlayerManager.inventory.size()):
        var item = PlayerManager.inventory[i]
        var item_data = DataManager.get_item_data(item.id)
        var item_color = DataManager.get_item_color(item.id)
        var color_hex = item_color.to_html()
        
        inventory_text += "[color=" + color_hex + "]"
        inventory_text += str(i + 1) + ". " + item_data.nameShort
        if item.quantity > 1:
            inventory_text += " x" + str(item.quantity)
        inventory_text += "[/color]\n"
    
    inventory_label.text = inventory_text
```

---

## 🔍 **QUERY PATTERNS E API**

### **Accesso Base Oggetti**
```gdscript
# Ottieni dati completi oggetto
var weapon_data = DataManager.get_item_data("weapon_knife_rusty")

# Check esistenza nel database
if DataManager.has_item("mysterious_artifact"):
    print("Oggetto esistente")

# Validazione schema oggetto
if DataManager.validate_item_data(suspicious_item_data):
    print("Schema valido")
```

### **Query per Categoria**
```gdscript
# Tutti gli oggetti di una categoria
var all_weapons = DataManager.get_items_by_category("WEAPON")
var all_armor = DataManager.get_items_by_category("ARMOR") 
var all_food = DataManager.get_items_by_subcategory("CONSUMABLE", "food")

# Filter per rarità
var legendary_items = []
for item_id in DataManager.items.keys():
    var item = DataManager.get_item_data(item_id)
    if item.rarity == "LEGENDARY":
        legendary_items.append(item)
```

### **Query Avanzate**
```gdscript
# Oggetti equipaggiabili per slot
func get_items_for_slot(slot_name: String) -> Array:
    var items_for_slot = []
    for item_id in DataManager.items.keys():
        var item = DataManager.get_item_data(item_id)
        if item.properties.has("slot") and item.properties.slot == slot_name:
            items_for_slot.append(item)
    return items_for_slot

# Oggetti con effetti specifici
func get_items_with_effect(effect_type: String) -> Array:
    var items_with_effect = []
    for item_id in DataManager.items.keys():
        var item = DataManager.get_item_data(item_id)
        if item.properties.has("effects"):
            for effect in item.properties.effects:
                if effect.effect_type == effect_type:
                    items_with_effect.append(item)
                    break
    return items_with_effect
```

---

## 🎯 **ITEM EFFECTS SYSTEM**

### **Combat Effects**
```
Weapon Effects:
├── bleeding (Sanguinamento nel tempo)
├── armor_piercing (Riduzione armatura target)
├── knockback (Spinta indietro nemico)
├── critical_boost (Bonus chance critico)
├── elemental_damage (Danno fuoco/ghiaccio/elettrico)
└── area_of_effect (Danno ad area)

Armor Effects:
├── damage_reduction (Riduzione danno percentuale)
├── elemental_resistance (Resistenza elementi)
├── movement_speed (Bonus velocità)
├── stealth_bonus (Bonus furtività)
├── carry_capacity (Bonus capacità inventario)
└── weather_protection (Protezione ambientale)
```

### **Survival Effects**
```
Consumable Effects:
├── heal (Ripristino HP immediato)
├── regeneration (Rigenerazione HP nel tempo)
├── nourish (Ripristino fame)
├── hydrate (Ripristino sete)
├── cure_poison (Cura avvelenamento)
├── cure_disease (Cura malattia)
├── stat_boost (Bonus temporaneo stats)
└── experience_boost (Bonus EXP temporaneo)

Negative Effects:
├── infection_chance (Rischio infezione)
├── poison_chance (Rischio veleno)
├── addiction_risk (Rischio dipendenza)
├── nausea (Malus temporaneo)
└── weakness (Riduzione stats temporanea)
```

---

## 📊 **BALANCING E GAME DESIGN**

### **Weight System**
```
Weight Categories:
├── Very Light: 0.1-0.5kg (munizioni, pillole)
├── Light: 0.5-1.5kg (coltelli, cibo, acqua)
├── Medium: 1.5-3.0kg (pistole, armature leggere)
├── Heavy: 3.0-5.0kg (fucili, armature pesanti)
└── Very Heavy: 5.0+kg (armi pesanti, equipaggiamento ingombrante)

Carrying Capacity:
├── Base capacity: 10 inventory slots
├── Weight not limiting factor attualmente
├── Future: Weight-based limitations possibili
```

### **Value Economy**
```
Value Ranges per Rarity:
├── COMMON: 1-50 coins
├── UNCOMMON: 50-150 coins
├── RARE: 150-500 coins
├── EPIC: 500-1500 coins
└── LEGENDARY: 1500+ coins

Value Multipliers:
├── Rarity multiplier da rarity_system.json
├── Condition multiplier (durabilità)
├── Supply/demand modifier (futuro)
```

### **Durability System**
```
Durability Ranges:
├── Fragile items: 10-30 durability
├── Standard items: 30-60 durability
├── Robust items: 60-100 durability
├── Military grade: 100+ durability

Degradation Rules:
├── Weapons: -1 per combat use
├── Armor: -1 per damage taken
├── Tools: -1 per usage
├── Consumables: N/A (consumed entirely)
```

---

## 🔧 **MAINTENANCE E EXTENSION**

### **Aggiunta Nuova Categoria**
```
1. Crea nuovo file JSON in data/items/
2. Definisci schema properties specifico
3. Aggiungi caricamento in DataManager._load_all_data()
4. Aggiungi categoria a CATEGORY_COLORS
5. Implementa validazione specifica
6. Test integrazione con PlayerManager
```

### **Modifica Schema Esistente**
```
1. Implementa migrazione dati in DataManager
2. Aggiorna validazione per nuovi campi
3. Mantieni backward compatibility
4. Test con tutti gli oggetti esistenti
5. Aggiorna documentazione schema
```

### **Bilanciamento Oggetti**
```gdscript
# Script utility per analisi bilanciamento
func analyze_item_balance():
    print("=== ITEM BALANCE ANALYSIS ===")
    
    # Value per weight ratio
    for item_id in DataManager.items.keys():
        var item = DataManager.get_item_data(item_id)
        var ratio = item.value / item.weight
        print(item.name, " - Value/Weight: ", ratio)
    
    # Durability vs rarity correlation
    # Damage output analysis
    # Effect frequency analysis
```

---

## 📈 **STATISTICS E METRICS**

### **Database Size Metrics**
```
File Sizes:
├── weapons.json: ~25KB (15+ weapons)
├── armor.json: ~18KB (12+ armors)
├── consumables.json: ~35KB (25+ consumables)
├── ammo.json: ~12KB (8+ ammo types)
├── crafting_materials.json: ~20KB (15+ materials)
├── quest_items.json: ~8KB (5+ quest items)
├── unique_items.json: ~15KB (8+ unique items)
└── misc_items.json: ~12KB (10+ misc items)
TOTAL: ~145KB item databases
```

### **Complexity Metrics**
```
Average Fields per Item:
├── Base fields: 9 (id, name, description, etc.)
├── Properties fields: 3-8 (dipende da categoria)
├── Effects per item: 0-4 effetti
└── Total complexity: ~15 campi medi per oggetto

Schema Validation:
├── Required fields: 9 campi obbligatori
├── Type checking: string/int/float/bool/array/dict
├── Enum validation: category, rarity, subcategory
└── Cross-reference: ammo_type, setId validation
```

---

## 🔍 **TROUBLESHOOTING COMMON ISSUES**

### **Item Not Found Errors**
```gdscript
# Problema: get_item_data() returns empty
# Causa 1: ID typo nel codice
# Causa 2: Oggetto non presente in database
# Causa 3: Database non caricato correttamente

# Debug approach:
print("Available items: ", DataManager.items.keys())
print("Looking for: ", item_id)
print("Has item: ", DataManager.has_item(item_id))
```

### **Properties Access Errors**
```gdscript
# Problema: "Invalid access to property 'effects'"
# Causa: Accesso diretto invece che tramite properties

# WRONG:
var effects = item_data.effects

# CORRECT (v0.4.0):
var effects = item_data.properties.effects
```

### **JSON Loading Errors**
```gdscript
# Problema: Database vuoto all'avvio
# Causa 1: Syntax error nel JSON
# Causa 2: File path incorretto
# Causa 3: Permessi file

# Debug approach:
print("JSON loading errors: ", DataManager._loading_errors)
```

---

**Versione:** v0.4.0 "A unifying language for all things"  
**Data:** 21 Agosto 2025  
**Target:** LLM Technical Analysis - Items Database
