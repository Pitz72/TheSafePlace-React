# 🗃️ DATABASE OVERVIEW - THE SAFE PLACE v0.4.0

## 🎯 **OVERVIEW SISTEMA DATABASE**

The Safe Place utilizza un sistema di **database JSON modulari** per separare completamente i dati di gioco dalla logica. Tutti i contenuti (oggetti, eventi, configurazioni) sono esternalizzati in file JSON organizzati per categoria e responsabilità.

### **Filosofia Database Design**
- **Data-Driven:** Logica separata dai contenuti
- **Modulare:** Database categorizzati per tipo
- **Validazione:** Schemi standardizzati e controlli integrità
- **Estendibile:** Facile aggiunta nuovi contenuti
- **Type-Safe:** Validazione runtime con fallback

---

## 📊 **STRUTTURA GENERALE DATABASE**

### **Organizzazione Cartelle**
```
data/
├── system/                 # Configurazioni di sistema
│   └── rarity_system.json
├── items/                  # Database oggetti (8 categorie)
│   ├── weapons.json        # 15+ armi
│   ├── armor.json          # 12+ armature e accessori
│   ├── consumables.json    # 25+ consumabili
│   ├── ammo.json           # 8+ munizioni
│   ├── crafting_materials.json # 15+ materiali
│   ├── quest_items.json    # 5+ oggetti quest
│   ├── unique_items.json   # 8+ oggetti unici
│   └── misc_items.json     # 10+ oggetti vari
└── events/                 # Database eventi
    ├── unique_events.json  # Eventi speciali unici
    └── biomes/             # Eventi per bioma (7 biomi)
        ├── forest_events.json    # 25+ eventi foresta
        ├── plains_events.json    # 20+ eventi pianure
        ├── city_events.json      # 15+ eventi città
        ├── village_events.json   # 15+ eventi villaggi
        ├── river_events.json     # 10+ eventi fiumi
        └── rest_stop_events.json # 8+ eventi ristoro
```

### **Caricamento Database (DataManager)**
```gdscript
func _load_all_data() -> void:
    # 1. Sistema condiviso
    rarity_system = _load_json_file("res://data/system/rarity_system.json")
    
    # 2. Database oggetti categorizzati
    weapons = _load_json_file("res://data/items/weapons.json")
    armor = _load_json_file("res://data/items/armor.json")
    consumables = _load_json_file("res://data/items/consumables.json")
    crafting_materials = _load_json_file("res://data/items/crafting_materials.json")
    ammo = _load_json_file("res://data/items/ammo.json")
    quest_items = _load_json_file("res://data/items/quest_items.json")
    unique_items = _load_json_file("res://data/items/unique_items.json")
    
    # 3. Unificazione in database globale
    _merge_item_databases()
```

---

## 🎯 **SCHEMA STANDARDIZZATO OGGETTI**

### **Struttura Base Oggetto (v0.4.0 Unified Language)**
```json
{
  "id": "unique_item_identifier",
  "name": "Nome Oggetto Completo",
  "nameShort": "Nome Breve",
  "description": "Descrizione dettagliata dell'oggetto",
  "category": "CATEGORY_ENUM",
  "subcategory": "sub_category",
  "rarity": "RARITY_ENUM",
  "weight": 1.5,
  "value": 100,
  "stackable": true,
  "max_stack": 10,
  "properties": {
    // Proprietà specifiche per categoria
  }
}
```

### **CATEGORY_ENUM Valori**
```
WEAPON           - Armi (melee/ranged)
ARMOR            - Armature e protezioni
CONSUMABLE       - Consumabili (cibo/medicina/drink)
TOOL             - Strumenti e utensili
AMMO             - Munizioni
CRAFTING_MATERIAL - Materiali per crafting
QUEST            - Oggetti di quest
UNIQUE           - Oggetti unici/speciali
ACCESSORY        - Accessori equipaggiabili
```

### **RARITY_ENUM Valori**
```
COMMON      - Comune (60% drop chance)
UNCOMMON    - Non comune (25% drop chance)
RARE        - Raro (10% drop chance)
EPIC        - Epico (4% drop chance)
LEGENDARY   - Leggendario (1% drop chance)
```

### **Properties per Categoria**

#### **WEAPON Properties**
```json
"properties": {
  "slot": "main_hand",
  "durability": 50,
  "maxDurability": 50,
  "damage": {"min": 5, "max": 12, "bonus": 2},
  "ammo_type": "ammo_9mm",  // Solo per armi ranged
  "effects": [              // Effetti speciali opzionali
    {"effect_type": "bleeding", "chance": 0.2}
  ]
}
```

#### **ARMOR Properties**
```json
"properties": {
  "slot": "body",           // body, head, hands, feet, accessory
  "durability": 80,
  "maxDurability": 80,
  "armorValue": 5,
  "setId": "wastelander_set", // Per set equipaggiamento
  "effects": [
    {"effect_type": "elemental_resistance", "amount": 0.15}
  ]
}
```

#### **CONSUMABLE Properties**
```json
"properties": {
  "max_portions": 3,        // Per oggetti multi-uso
  "effects": [
    {"effect_type": "heal", "amount": 25},
    {"effect_type": "hydrate", "amount": 40},
    {"effect_type": "nourish", "amount": 30}
  ]
}
```

---

## 🏞️ **SCHEMA EVENTI**

### **Struttura Base Evento**
```json
{
  "id": "event_unique_id",
  "title": "Titolo Evento",
  "description": "Descrizione situazione dettagliata",
  "biome": "foreste",
  "rarity": "common",
  "cooldown": 0,
  "choices": [
    {
      "text": "Descrizione scelta giocatore",
      "skill_check": {
        "stat": "agilita",
        "difficulty": 12,
        "modifier": 0
      },
      "consequences_success": {
        "narrative_text": "Testo mostrato in caso di successo",
        "items_gained": [{"id": "item_id", "quantity": 1}],
        "items_lost": [{"id": "item_id", "quantity": 1}],
        "hp_change": 5,
        "food_change": 10,
        "water_change": 15,
        "experience_gained": 25,
        "status_effects": ["healing_boost"]
      },
      "consequences_failure": {
        "narrative_text": "Testo mostrato in caso di fallimento",
        "hp_change": -10,
        "status_effects": ["wounded"]
      }
    }
  ]
}
```

### **Skill Check Configuration**
```json
"skill_check": {
  "stat": "statistica_name",    // forza, agilita, intelligenza, carisma, fortuna, vigore
  "difficulty": 15,             // DC target (5-25 range)
  "modifier": 2                 // Modificatore situazionale
}
```

### **Consequences Types**
```json
{
  "narrative_text": "Testo narrativo",
  "items_gained": [{"id": "item_id", "quantity": 1}],
  "items_lost": [{"id": "item_id", "quantity": 1}],
  "hp_change": 10,              // Positivo = heal, negativo = damage
  "food_change": 20,            // Modifica fame
  "water_change": 15,           // Modifica sete
  "experience_gained": 50,      // EXP guadagnati
  "status_effects": ["poisoned", "healing_boost"],
  "stat_changes": {             // Modifiche statistiche permanenti
    "forza": 1,
    "agilita": -1
  }
}
```

---

## 📈 **STATISTICHE DATABASE**

### **Conteggi per Categoria (v0.4.0)**
```
ITEMS DATABASE:
├── Weapons: 15+ oggetti
├── Armor: 12+ oggetti  
├── Consumables: 25+ oggetti
├── Ammo: 8+ oggetti
├── Crafting Materials: 15+ oggetti
├── Quest Items: 5+ oggetti
├── Unique Items: 8+ oggetti
└── Misc Items: 10+ oggetti
TOTALE: 100+ oggetti

EVENTS DATABASE:
├── Forest Events: 25+ eventi
├── Plains Events: 20+ eventi
├── City Events: 15+ eventi
├── Village Events: 15+ eventi
├── River Events: 10+ eventi
├── Rest Stop Events: 8+ eventi
└── Unique Events: 5+ eventi
TOTALE: 100+ eventi
```

### **Distribuzione Rarità Oggetti**
```
COMMON: ~40% (40+ oggetti)
UNCOMMON: ~30% (30+ oggetti)
RARE: ~20% (20+ oggetti)
EPIC: ~8% (8+ oggetti)
LEGENDARY: ~2% (2+ oggetti)
```

### **Distribuzione Eventi per Bioma**
```
Foreste: 25% (ambiente più ricco)
Pianure: 20% (eventi base)
Città: 15% (eventi urbani)
Villaggi: 15% (eventi sociali)
Fiumi: 10% (eventi attraversamento)
Ristoro: 8% (eventi riposo)
Unici: 5% (eventi speciali)
```

---

## 🔍 **SISTEMA VALIDAZIONE**

### **Validazione Oggetti (DataManager)**
```gdscript
func validate_item_data(item_data: Dictionary) -> bool:
    # 1. Campi obbligatori base
    var required_base = ["id", "name", "category", "rarity", "weight", "value"]
    for field in required_base:
        if not item_data.has(field):
            _loading_errors.append("Campo mancante: " + field)
            return false
    
    # 2. Validazione enums
    if not item_data.category in VALID_CATEGORIES:
        return false
        
    if not item_data.rarity in VALID_RARITIES:
        return false
    
    # 3. Validazione properties per categoria
    return _validate_category_properties(item_data)
```

### **Validazione Eventi (EventManager)**
```gdscript
func _validate_event_data(event_data: Dictionary) -> bool:
    # Campi obbligatori eventi
    var required = ["id", "title", "description", "choices"]
    for field in required:
        if not event_data.has(field):
            return false
    
    # Validazione choices
    if not event_data.choices is Array:
        return false
        
    for choice in event_data.choices:
        if not _validate_choice_data(choice):
            return false
            
    return true
```

### **Error Recovery Patterns**
```gdscript
# Fallback per dati corrotti
func get_item_data(item_id: String) -> Dictionary:
    if items.has(item_id):
        return items[item_id]
    
    # Fallback: oggetto generico
    return _create_fallback_item(item_id)

func _create_fallback_item(item_id: String) -> Dictionary:
    return {
        "id": item_id,
        "name": "Oggetto Sconosciuto",
        "category": "MISC",
        "rarity": "COMMON",
        "weight": 1.0,
        "value": 1,
        "description": "Oggetto non trovato nel database",
        "properties": {}
    }
```

---

## 🔄 **LOADING E CACHING STRATEGY**

### **Load Sequence**
```
1. _ready() di DataManager
   ↓
2. _load_all_data()
   ├── Load system/rarity_system.json
   ├── Load items/*.json (8 file)
   └── _merge_item_databases()
   ↓
3. _validate_data_integrity()
   ├── Controllo duplicati ID
   ├── Validazione schemi
   └── Report errori
   ↓
4. Cache ready per altri manager
```

### **Merge Strategy per Items**
```gdscript
func _merge_item_databases() -> void:
    items.clear()
    var databases = [weapons, armor, consumables, etc...]
    
    for database in databases:
        var main_key = _detect_main_key(database)  // "weapons", "armor", etc.
        if main_key != "":
            var data_collection = database[main_key]
            _merge_collection_into_items(data_collection)
```

### **Caching Patterns**
```gdscript
# DataManager - Full memory cache
var items: Dictionary = {}  # Tutti gli oggetti in RAM
var rarity_system: Dictionary = {}  # Sistema rarità in RAM

# EventManager - Biome-organized cache  
var biome_event_pools: Dictionary = {
    "foreste": [],  # Array di eventi per accesso rapido
    "pianure": [],
    // ... altri biomi
}

# No disk I/O dopo caricamento iniziale
# Tutti i dati rimangono in memoria per performance
```

---

## 🎨 **SISTEMA COLORI E CATEGORIE**

### **Category Color System (v0.4.0)**
```gdscript
# DataManager - Costanti colori categoria
const CATEGORY_COLORS: Dictionary = {
    "WEAPON": Color(0.8, 0.2, 0.2),         # Rosso intenso
    "ARMOR": Color(0.2, 0.6, 0.8),          # Blu acciaio
    "CONSUMABLE": Color(0.2, 0.8, 0.2),     # Verde natura
    "TOOL": Color(0.8, 0.6, 0.2),           # Arancione utensile
    "AMMO": Color(0.6, 0.4, 0.2),           # Marrone bronzo
    "CRAFTING_MATERIAL": Color(0.6, 0.2, 0.8), # Viola mystico
    "QUEST": Color(0.8, 0.8, 0.2),          # Giallo oro
    "UNIQUE": Color(0.8, 0.4, 0.6),         # Rosa unico
    "ACCESSORY": Color(0.4, 0.8, 0.8)       # Ciano brillante
}
```

### **Rarity Multiplier System**
```gdscript
const RARITY_MULTIPLIERS: Dictionary = {
    "COMMON": 0.6,      # Colori attenuati
    "UNCOMMON": 0.8,    # Colori normali
    "RARE": 1.0,        # Colori piena intensità
    "EPIC": 1.3,        # Colori intensificati
    "LEGENDARY": 1.6    # Colori molto intensi
}

# Calcolo colore finale
func get_item_color(item_id: String) -> Color:
    var item_data = get_item_data(item_id)
    var base_color = CATEGORY_COLORS.get(item_data.category, Color.WHITE)
    var multiplier = RARITY_MULTIPLIERS.get(item_data.rarity, 1.0)
    return base_color * multiplier
```

---

## 📋 **DATABASE DETTAGLI SPECIFICI**

### **1. RARITY_SYSTEM.JSON**
```json
{
  "rarity_system": {
    "COMMON": {
      "name": "Comune",
      "color": "#9ca3af",
      "valueMultiplier": 1.0,
      "dropChance": 0.6
    },
    "UNCOMMON": {
      "name": "Non Comune", 
      "color": "#22c55e",
      "valueMultiplier": 1.5,
      "dropChance": 0.25
    },
    "RARE": {
      "name": "Raro",
      "color": "#3b82f6", 
      "valueMultiplier": 2.5,
      "dropChance": 0.1
    },
    "EPIC": {
      "name": "Epico",
      "color": "#8b5cf6",
      "valueMultiplier": 4.0,
      "dropChance": 0.04
    },
    "LEGENDARY": {
      "name": "Leggendario",
      "color": "#f59e0b",
      "valueMultiplier": 6.0, 
      "dropChance": 0.01
    }
  }
}
```

### **2. WEAPONS.JSON Structure**
```json
{
  "weapons": {
    "weapon_knife_rusty": {
      "id": "weapon_knife_rusty",
      "name": "Coltello Arrugginito",
      "nameShort": "Coltello",
      "description": "Un vecchio coltello da cucina...",
      "category": "WEAPON",
      "subcategory": "melee",
      "rarity": "COMMON",
      "weight": 0.4,
      "value": 5,
      "stackable": false,
      "max_stack": 1,
      "properties": {
        "slot": "main_hand",
        "durability": 30,
        "maxDurability": 30,
        "damage": {"min": 2, "max": 5, "bonus": 0}
      }
    }
  }
}
```

### **3. EVENTS Structure (Forest Example)**
```json
{
  "FOREST": [
    {
      "id": "forest_hidden_trap",
      "title": "Trappola Nascosta",
      "description": "Mentre cammini tra gli alberi...",
      "choices": [
        {
          "text": "Disinnescala con cautela",
          "skillCheck": {"stat": "agilita", "difficulty": 12},
          "successText": "Con movimenti precisi...",
          "failureText": "Il meccanismo scatta...",
          "items_gained": [{"id": "bear_trap", "quantity": 1}],
          "penalty": {"type": "damage", "amount": 20}
        }
      ]
    }
  ]
}
```

---

## 🧮 **QUERY E ACCESSO DATI**

### **DataManager Query API**
```gdscript
# Accesso singolo oggetto
var item_data = DataManager.get_item_data("weapon_knife_rusty")

# Check esistenza
if DataManager.has_item("mysterious_item"):
    # Oggetto esiste nel database

# Query per categoria
var all_weapons = DataManager.get_items_by_category("WEAPON")
var all_consumables = DataManager.get_items_by_category("CONSUMABLE")

# Query per rarità
var legendary_items = DataManager.get_items_by_rarity("LEGENDARY")

# Calcolo colore per UI
var item_color = DataManager.get_item_color("epic_sword")
```

### **EventManager Query API**
```gdscript
# Eventi per bioma
var forest_events = EventManager.get_events_for_biome("foreste")

# Evento casuale
var random_event = EventManager.get_random_event("pianure")

# Check disponibilità eventi
if EventManager.has_events_for_biome("citta"):
    # Bioma ha eventi disponibili
    
# Conteggio eventi
var event_count = EventManager.get_events_count_for_biome("villaggi")
```

---

## 🔧 **UTILITIES E HELPER FUNCTIONS**

### **DataManager Utilities**
```gdscript
# Conteggio oggetti per categoria
func _count_items(database: Dictionary) -> int:
    if database.has("items"):
        return database.items.size()
    # Gestione altre strutture...

# Validazione integrità database
func _validate_data_integrity() -> void:
    var all_ids = []
    var duplicates = []
    
    for item_id in items.keys():
        if item_id in all_ids:
            duplicates.append(item_id)
        else:
            all_ids.append(item_id)
    
    if duplicates.size() > 0:
        push_error("ID duplicati trovati: " + str(duplicates))
```

### **EventManager Utilities**
```gdscript
# Normalizzazione schemi eventi legacy
func _normalize_event_schema(event: Dictionary) -> Dictionary:
    var normalized = event.duplicate(true)
    
    # Converte "skillCheck" -> "skill_check"
    if normalized.has("choices"):
        for choice in normalized.choices:
            _normalize_choice_schema(choice)
    
    return normalized

# Conversione conseguenze legacy
func _convert_legacy_consequence(legacy: Dictionary) -> Dictionary:
    match legacy.get("type", ""):
        "damage":
            return {"hp_change": -legacy.get("amount", 0)}
        "heal":
            return {"hp_change": legacy.get("amount", 0)}
        "item":
            return {"items_gained": [legacy.get("item", {})]}
```

---

## 📊 **PERFORMANCE E MEMORY**

### **Memory Usage Patterns**
```
DataManager:
├── JSON files loaded once at startup
├── ~500KB total per tutti i database
├── Persistent in-memory cache
└── No runtime file I/O

EventManager:
├── Eventi organizzati per bioma
├── ~200KB cache eventi
├── O(1) access per bioma
└── No ricaricamento runtime
```

### **Loading Performance**
```
Startup Loading Times:
├── rarity_system.json: ~1ms
├── items/*.json (8 files): ~50ms total
├── events/*.json (7 files): ~30ms total
├── Validation: ~20ms
└── Total: ~100ms caricamento database
```

### **Query Performance**
```
DataManager queries:
├── get_item_data(): O(1) hash lookup
├── has_item(): O(1) hash check
├── get_items_by_category(): O(n) linear scan
└── validate_item_data(): O(1) field check

EventManager queries:
├── get_random_event(): O(1) array access
├── get_events_for_biome(): O(1) hash lookup
└── trigger_random_event(): O(1) selection
```

---

## 🛡️ **DATA INTEGRITY E BACKUP**

### **Integrity Checks**
```gdscript
# Controlli automatici all'avvio
func _validate_data_integrity() -> void:
    var validation_results = {
        "total_items": items.size(),
        "duplicates": _find_duplicate_ids(),
        "invalid_schemas": _find_invalid_schemas(),
        "missing_references": _find_missing_references()
    }
    
    if validation_results.duplicates.size() > 0:
        push_error("Database ha ID duplicati")
        
    if validation_results.invalid_schemas.size() > 0:
        push_error("Database ha schemi non validi")
```

### **Fallback Systems**
```gdscript
# Fallback per file JSON corrotti
func _load_json_file(file_path: String) -> Dictionary:
    var data = _attempt_json_load(file_path)
    
    if data.is_empty():
        # Tentativo fallback da backup
        var backup_path = file_path.replace(".json", "_backup.json")
        data = _attempt_json_load(backup_path)
        
        if data.is_empty():
            # Fallback finale: database vuoto
            return _create_empty_database_structure()
    
    return data
```

---

## 📁 **FILE SYSTEM ORGANIZATION**

### **JSON File Naming Convention**
```
Singular per categoria: weapon.json (non weapons.json)
Lowercase: consumables.json
Snake_case: crafting_materials.json
Descriptive: rarity_system.json
Biome prefix: forest_events.json
```

### **Directory Structure Logic**
```
data/
├── system/     # Configurazioni condivise tra sistemi
├── items/      # Database oggetti categorizzati  
│   └── [category].json per ogni categoria oggetti
└── events/     # Database eventi  
    ├── unique_events.json (eventi cross-biome)
    └── biomes/[biome]_events.json per ogni bioma
```

---

## 🔧 **MAINTENANCE E EXTENSION**

### **Aggiunta Nuovi Oggetti**
```
1. Identifica categoria appropriata
2. Apri file JSON corrispondente in data/items/
3. Aggiungi oggetto seguendo schema standard
4. Assicurati ID unico
5. Valida properties per categoria
6. Test con DataManager.get_item_data()
```

### **Aggiunta Nuovi Eventi**
```
1. Identifica bioma appropriato
2. Apri file eventi bioma in data/events/biomes/
3. Aggiungi evento seguendo schema standard
4. Configura skill check se necessario
5. Definisci conseguenze success/failure
6. Test con EventManager.get_random_event()
```

### **Database Migration**
```gdscript
# Pattern per aggiornamenti schema
func _migrate_database_v1_to_v2(old_data: Dictionary) -> Dictionary:
    var migrated = old_data.duplicate(true)
    
    # Migrazione specifica per cambio schema
    for item_id in migrated.keys():
        var item = migrated[item_id]
        # Sposta campi specifici in "properties"
        # Rinomina campi obsoleti
        # Aggiungi campi mancanti con default
        
    return migrated
```

---

**Versione:** v0.4.0 "A unifying language for all things"  
**Data:** 21 Agosto 2025  
**Target:** LLM Technical Analysis - Database Architecture
