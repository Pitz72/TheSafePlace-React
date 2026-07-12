# 🎭 EVENTS DATABASE - THE SAFE PLACE v0.4.0

## 🎯 **OVERVIEW SISTEMA EVENTI**

Il sistema eventi di The Safe Place è il **cuore dell'esperienza narrativa interattiva**. Gestisce oltre **100 eventi** organizzati per **7 biomi diversi**, ognuno con skill check, scelte multiple e conseguenze dinamiche che influenzano la progressione del giocatore.

### **Filosofia Design Eventi**
- **Biome-Driven:** Eventi contestuali per ogni ambiente
- **Choice & Consequence:** Ogni decisione ha impatto duraturo
- **Skill-Based:** Test abilità realistici e bilanciati  
- **Narrative Rich:** Immersione profonda nel mondo post-apocalittico
- **Replayability:** Risultati randomici incentivano rigiocabilità

---

## 🗺️ **BIOMI E DISTRIBUZIONE EVENTI**

### **7 Biomi Principali**
```
data/events/biomes/
├── forest_events.json     # FORESTE: 25+ eventi
├── plains_events.json     # PIANURE: 20+ eventi  
├── city_events.json       # CITTÀ: 15+ eventi
├── village_events.json    # VILLAGGI: 15+ eventi
├── river_events.json      # FIUMI: 10+ eventi
├── rest_stop_events.json  # RISTORO: 8+ eventi
└── unique_events.json     # UNICI: 5+ eventi cross-biome
```

### **Caratteristiche per Bioma**
```
FORESTE (25+ eventi):
├── Natura selvaggia: animali, piante, rifugi naturali
├── Pericoli: trappole, predatori, terreno accidentato
├── Risorse: cibo naturale, acqua, materiali organici
├── Atmosfera: mistica, nascosta, pericolosa
└── Skill focus: Agilità, Intelligenza, Sopravvivenza

PIANURE (20+ eventi):
├── Terre aperte: orizzonti ampi, visibilità lunga
├── Pericoli: esposizione, fenomeni meteorologici, branchi
├── Risorse: acqua (pozzi), carcasse, strutture abbandonate
├── Atmosfera: desolata, esposta, vulnerabile
└── Skill focus: Forza, Vigore, Resistenza

CITTÀ (15+ eventi):
├── Rovine urbane: edifici, metro, infrastrutture
├── Pericoli: crolli, trappole, umani ostili
├── Risorse: tecnologia, medicine, equipaggiamento
├── Atmosfera: inquietante, tech-focused, militare
└── Skill focus: Intelligenza, Agilità, Technical skills

VILLAGGI (15+ eventi):
├── Insediamenti: case, fattorie, comunità
├── Pericoli: sopravvissuti ostili, animali domestici ferali
├── Risorse: cibo, attrezzi, informazioni
├── Atmosfera: domestica rovinata, nostalgica, umana
└── Skill focus: Carisma, Intelligenza, Social skills

FIUMI (10+ eventi):
├── Attraversamenti: ponti, guadi, acque pericolose
├── Pericoli: correnti, creature acquatiche, ipotermia
├── Risorse: acqua pulita, pesce, materiali fluviali
├── Atmosfera: naturale, fluida, ostacolo-opportunità
└── Skill focus: Agilità, Vigore, Swimming

RISTORO (8+ eventi):
├── Rifugi sicuri: bunker, safe house, stazioni
├── Pericoli: falsa sicurezza, trappole, guardie
├── Risorse: riposo, commercio, informazioni
├── Atmosfera: sicura, sociale, commerciale
└── Skill focus: Carisma, Intelligenza, Social

UNICI (5+ eventi):
├── Eventi cross-biome: meteore, laboratori, bunker governativi
├── Pericoli: radiazioni, esperimenti, military-grade
├── Risorse: tecnologia avanzata, informazioni critiche
├── Atmosfera: epica, story-critical, game-changing
└── Skill focus: Tutti i tipi, challenge massimo
```

---

## 📋 **SCHEMA EVENTO STANDARDIZZATO**

### **Struttura Base Evento JSON**
```json
{
  "id": "unique_event_identifier",
  "title": "Titolo Evento (max 40 char)",
  "description": "Descrizione dettagliata situazione (200-500 char)",
  "biome": "biome_name",
  "rarity": "common/uncommon/rare/epic",
  "weight": 1.0,
  "cooldown": 0,
  "requirements": {
    "min_day": 1,
    "max_day": 999,
    "required_items": [],
    "required_stats": {},
    "weather_conditions": []
  },
  "choices": [
    {
      "text": "Descrizione scelta giocatore",
      "requirements": {},
      "skill_check": {
        "stat": "statistica_name",
        "difficulty": 15,
        "modifier": 0
      },
      "consequences_success": {},
      "consequences_failure": {},
      "consequences": {}  // Per scelte senza skill check
    }
  ]
}
```

### **Choice Requirements (Opzionale)**
```json
"requirements": {
  "required_items": [{"id": "rope", "quantity": 1}],
  "required_stats": {"forza": 15},
  "required_statuses": ["healthy"],
  "forbidden_statuses": ["wounded"]
}
```

---

## 🎲 **SKILL CHECK SYSTEM**

### **Skill Check Configuration**
```json
"skill_check": {
  "stat": "agilita",           // Statistica utilizzata
  "difficulty": 12,            // DC target (5-25)
  "modifier": 0,               // Modificatore situazionale
  "critical_fail_threshold": 1, // Fallimento critico (optional)
  "critical_success_threshold": 20, // Successo critico (optional)
  "retry_allowed": false       // Permettere retry (optional)
}
```

### **Statistiche Utilizzabili**
```
forza        - Azioni fisiche, combattimento, sollevamento
agilita      - Equilibrio, schivare, acrobazia, riflessi
intelligenza - Analisi, technical skills, problem solving
carisma      - Persuasione, intimidazione, leadership
fortuna      - Eventi casuali, probabilità, destino
vigore       - Resistenza, sopravvivenza, immunità
```

### **Difficulty Classes (DC)**
```
DC 5:  Banale (95% successo con stat 10)
DC 8:  Molto Facile (80% successo con stat 10)
DC 10: Facile (60% successo con stat 10)
DC 12: Medio-Facile (45% successo con stat 10)
DC 15: Medio (30% successo con stat 10)
DC 18: Difficile (15% successo con stat 10)
DC 20: Molto Difficile (10% successo con stat 10)
DC 25: Leggendario (1% successo con stat 10)
```

### **Calcolo Skill Check (SkillCheckManager)**
```gdscript
func perform_check(stat_name: String, difficulty: int) -> Dictionary:
    # 1. Ottieni valore stat dal PlayerManager
    var stat_value: int = PlayerManager.get_stat(stat_name)
    
    # 2. Calcola modificatore (D&D style: (stat-10)/2)
    var modifier: int = int(floor((stat_value - 10) / 2.0))
    
    # 3. Lancia d20
    var roll: int = randi_range(1, 20)
    
    # 4. Calcola totale
    var total: int = roll + modifier
    
    # 5. Determina successo
    var success: bool = total >= difficulty
    
    return {
        "stat_used": stat_name,
        "stat_value": stat_value,
        "modifier": modifier,
        "roll": roll,
        "total": total,
        "difficulty": difficulty,
        "success": success
    }
```

---

## 🎯 **CONSEQUENCES SYSTEM**

### **Consequence Types**
```json
{
  "narrative_text": "Testo descrittivo risultato",
  
  // Resource Changes
  "hp_change": 10,              // ±HP (heal/damage)
  "food_change": 20,            // ±Fame
  "water_change": 15,           // ±Sete
  
  // Item Transactions  
  "items_gained": [
    {"id": "item_id", "quantity": 1, "condition": "perfect"}
  ],
  "items_lost": [
    {"id": "item_id", "quantity": 1}
  ],
  
  // Character Progression
  "experience_gained": 50,      // EXP reward
  "stat_changes": {             // Permanent stat changes
    "forza": 1,
    "agilita": -1
  },
  
  // Status Effects
  "status_effects": ["wounded", "poisoned", "blessed"],
  "status_duration": 180,       // Durata in minuti
  
  // World Effects
  "time_change": 60,            // Minuti avanzamento tempo
  "weather_change": "storm",    // Cambio meteo
  "reveal_location": "hidden_bunker",  // Scoperta nuove aree
  
  // Special Triggers
  "trigger_event": "special_event_id",  // Catena eventi
  "unlock_content": ["new_biome", "new_quest"]
}
```

### **Legacy Format Support**
```json
// Formato legacy ancora supportato per backward compatibility
{
  "reward": {"type": "item", "item": {"id": "bandages", "quantity": 2}},
  "penalty": {"type": "damage", "amount": 10},
  "successText": "Messaggio successo",
  "failureText": "Messaggio fallimento"
}
```

---

## 🌲 **FOREST EVENTS ANALYSIS**

### **Forest Event Categories**
```
Nature Encounters:
├── Wildlife: cervi, lupi, orsi, uccelli
├── Flora: alberi secolari, funghi, piante medicinali
├── Natural hazards: frane, paludi, spine

Human Traces:
├── Abandoned shelters: capanne, rifugi, accampamenti
├── Traps: tagliole, trappole per animali
├── Lost items: zaini, equipaggiamento dimenticato

Environmental:
├── Weather: tempeste, nebbia fitta
├── Terrain: fiumi nascosti, grotte, sentieri
├── Atmospheric: suoni misteriosi, presenze
```

### **Esempio Forest Event**
```json
{
  "id": "forest_hermit_shelter",
  "title": "Rifugio dell'Eremita",
  "description": "Scopri una piccola capanna abbandonata, nascosta tra gli alberi. La porta è aperta e sembra che nessuno ci sia da tempo.",
  "choices": [
    {
      "text": "Esplora l'interno",
      "skill_check": {"stat": "intelligenza", "difficulty": 10},
      "consequences_success": {
        "narrative_text": "All'interno trovi un piccolo magazzino di sopravvivenza: cibo in scatola, acqua pulita e medicine scadute ma ancora utilizzabili.",
        "items_gained": [
          {"id": "canned_food", "quantity": 2},
          {"id": "water_purified", "quantity": 2}, 
          {"id": "expired_medicine", "quantity": 1}
        ]
      },
      "consequences_failure": {
        "narrative_text": "La capanna è stata già saccheggiata tempo fa. Non c'è rimasto nulla di utile, solo polvere e ragnatele."
      }
    },
    {
      "text": "Riposati qui per un po'",
      "consequences": {
        "narrative_text": "Ti concedi una pausa rigenerante al riparo. Ti senti più riposato e meno stressato.",
        "hp_change": 10,
        "food_change": 5
      }
    }
  ]
}
```

---

## 🏙️ **PLAINS EVENTS ANALYSIS**

### **Plains Event Categories**
```
Desolation Encounters:
├── Abandoned vehicles: auto, camion, moto
├── Memorial sites: monumenti, lapidi, rovine
├── Weather phenomena: dust devils, miraggi

Wildlife Encounters:
├── Pack animals: cani selvatici, branchi
├── Scavengers: avvoltoi, creature mutate
├── Mysterious creatures: bestie sconosciute

Survival Challenges:
├── Water sources: pozzi, sorgenti
├── Shelter seeking: ripari improvvisati
├── Navigation: orientamento, sentieri perduti
```

### **Esempio Plains Event**
```json
{
  "id": "plains_memorial_forgotten",
  "title": "Monumento Dimenticato", 
  "description": "Trovi una piccola lapide di pietra grezza, incisa rozzamente. Dice: 'Hanno combattuto per un domani che non hanno mai visto'. Alla base, qualcuno ha lasciato un piccolo oggetto avvolto in un panno.",
  "choices": [
    {
      "text": "Prendi l'oggetto",
      "consequences": {
        "narrative_text": "Con rispetto, prendi l'offerta. È una bussola funzionante. Chiunque l'abbia lasciata voleva che aiutasse un altro viaggiatore.",
        "items_gained": [{"id": "fathers_compass", "quantity": 1}]
      }
    },
    {
      "text": "Lascia una tua razione in segno di rispetto",
      "skill_check": {"stat": "carisma", "difficulty": 8},
      "consequences_success": {
        "narrative_text": "Decidi di onorare il loro sacrificio. Lasci una delle tue razioni. Questo semplice gesto ti riempie di una strana determinazione.",
        "items_lost": [{"id": "ration_pack", "quantity": 1}],
        "stat_changes": {"carisma": 1}
      },
      "consequences_failure": {
        "narrative_text": "Vorresti onorarli, ma la tua fame è più forte. Tieni le tue scorte per te, sentendoti un po' in colpa."
      }
    }
  ]
}
```

---

## 🏘️ **CITY E VILLAGE EVENTS**

### **City Events Characteristics**
```
Urban Exploration:
├── Buildings: uffici, appartamenti, negozi
├── Infrastructure: metro, fognature, ospedali
├── Technology: computer, laboratori, fabbriche
├── Military: basi, depositi, checkpoints

Danger Types:
├── Structural: crolli, gas tossici, radiazioni
├── Human: banditi, militari, sopravvissuti ostili
├── Environmental: incendi, allagamenti
├── Technological: robot, sistemi automatici
```

### **Village Events Characteristics**
```
Rural Life Remnants:
├── Domestic: case, fienili, giardini
├── Agricultural: campi, attrezzi, animali da fattoria
├── Community: chiese, scuole, negozi locali
├── Personal: oggetti familiari, ricordi

Social Encounters:
├── Friendly survivors: commercio, informazioni
├── Hostile groups: banditismo, territorialità
├── Neutral NPCs: scambi, favori
├── Community decisions: aiutare o sfruttare
```

---

## 🌊 **RIVER EVENTS ANALYSIS**

### **River Crossing Mechanics**
```gdscript
# World.gd - Sistema attraversamento fiumi
func _handle_river_crossing() -> void:
    if PlayerManager:
        # 1. Messaggio base (sempre mostrato)
        var base_msg = river_crossing_messages[randi() % river_crossing_messages.size()]
        PlayerManager.narrative_log_generated.emit(base_msg)
        
        # 2. Skill check leggero
        var is_night = TimeManager and TimeManager.is_night()
        var dc = 7 if is_night else 5  # DC molto bassa
        var result = PlayerManager.skill_check("agilita", dc, 0)
        
        if result.get("success", false):
            # Successo: messaggio positivo
            var ok_msg = river_success_messages[randi() % river_success_messages.size()]
            PlayerManager.narrative_log_generated.emit(ok_msg)
        else:
            # Fallimento: piccola chance di damage
            var chance = 0.12 if is_night else 0.05
            if randf() < chance:
                var damage = 1 if randf() < 0.7 else 2
                PlayerManager.modify_hp(-damage)
```

### **River Event Types**
```
Crossing Challenges:
├── Bridge crossings: ponti crollati, instabili
├── Ford crossings: acque basse, scivolose
├── Swimming: acque profonde, correnti forti
├── Alternative routes: detours, underground

Water Resources:
├── Fishing opportunities: pesce, crostacei
├── Water collection: sorgenti, filtrazione
├── Cleanup: lavarsi, equipaggiamento
├── Rest stops: rive sicure, campeggi

Dangers:
├── Water creatures: pesci mutati, parassiti
├── Environmental: correnti, ipotermia
├── Human: banditi ai guadi, pedaggi
├── Contamination: acqua inquinata, radiazioni
```

---

## 🎪 **EVENT PROBABILITY SYSTEM**

### **Trigger Probabilities per Bioma**
```gdscript
# MainGame.gd - Probabilità eventi per bioma
var biome_probabilities = {
    "pianure": 0.35,      # 35% chance per movimento
    "foreste": 0.45,      # 45% chance (più eventi)
    "villaggi": 0.55,     # 55% chance (ambiente sociale)
    "città": 0.65,        # 65% chance (ambiente ricco)
    "fiumi": 0.40,        # 40% chance (attraversamenti)
    "montagne": 0.30,     # 30% chance (terreno difficile)
    "ristoro": 0.25       # 25% chance (zona sicura)
}
```

### **Cooldown System**
```gdscript
# MainGame.gd - Sistema cooldown eventi
var event_cooldown_time: float = 30.0    # 30 secondi tra eventi
var steps_since_last_event: int = 0      # Passi dall'ultimo evento
var steps_threshold: int = 10            # Minimo 10 passi

func _can_trigger_event(biome: String) -> bool:
    return steps_since_last_event >= steps_threshold

func _reset_cooldowns():
    steps_since_last_event = 0
    time_since_last_event = 0.0
```

### **Event Weight System (Planned)**
```json
// Future implementation per bilanciamento eventi
{
  "weight": 1.0,              // Peso base evento
  "rarity": "common",         // Rarità influenza weight
  "player_level_scaling": {   // Scaling basato su livello player
    "min_level": 1,
    "max_level": 20,
    "weight_modifier": 1.2
  }
}
```

---

## 🔄 **EVENT PROCESSING FLOW**

### **Event Trigger Sequence**
```
1. Player movement in bioma
   ↓
2. MainGame._on_player_moved()
   ├── Incrementa steps_since_last_event
   ├── Controlla _can_trigger_event()
   └── Calcola probabilità bioma
   ↓
3. EventManager.trigger_random_event(biome)
   ├── Seleziona evento casuale dal pool
   ├── Emette event_triggered signal
   └── Ritorna risultato trigger
   ↓
4. GameUI mostra EventPopup
   ├── Visualizza titolo e descrizione
   ├── Mostra scelte disponibili
   └── Attende input giocatore
   ↓
5. Player seleziona scelta
   ├── EventPopup chiama EventManager.process_event_choice()
   ├── Se skill_check: SkillCheckManager.perform_check()
   └── Determina conseguenze (success/failure/neutral)
   ↓
6. Applicazione conseguenze
   ├── PlayerManager.apply_consequences()
   ├── Aggiornamento risorse/inventario/stats
   └── Log narrativo generato
   ↓
7. Cleanup e reset
   ├── Chiusura EventPopup
   ├── Reset cooldown eventi
   └── Ritorno al game loop
```

### **EventManager Processing Logic**
```gdscript
func process_event_choice(event_id: String, choice_index: int) -> Dictionary:
    var event = cached_events.get(event_id, {})
    if event.is_empty():
        return {"error": "Event not found"}
    
    var choice = event.choices[choice_index]
    var result = {}
    
    # 1. Skill check se necessario
    if choice.has("skill_check"):
        var skill_data = choice.skill_check
        var check_result = SkillCheckManager.perform_check(
            skill_data.stat, 
            skill_data.difficulty
        )
        
        result["skill_check_result"] = check_result
        
        # 2. Determina conseguenze basate su successo/fallimento
        if check_result.success:
            result["consequences"] = choice.get("consequences_success", {})
        else:
            result["consequences"] = choice.get("consequences_failure", {})
    else:
        # 3. Scelta senza skill check
        result["consequences"] = choice.get("consequences", {})
    
    return result
```

---

## 📊 **EVENT ANALYTICS E BALANCING**

### **Event Frequency Analysis**
```
Eventi per Bioma (distribuzione attuale):
├── Foreste: 25+ eventi (25% del totale)
├── Pianure: 20+ eventi (20% del totale)
├── Città: 15+ eventi (15% del totale)  
├── Villaggi: 15+ eventi (15% del totale)
├── Fiumi: 10+ eventi (10% del totale)
├── Ristoro: 8+ eventi (8% del totale)
└── Unici: 5+ eventi (5% del totale)

Distribuzione Skill Check:
├── Con skill check: ~70% eventi
├── Senza skill check: ~30% eventi
└── Multiple skill check: ~5% eventi
```

### **Skill Usage Distribution**
```
Statistiche più utilizzate:
├── Agilità: 25% (movimento, schivare)
├── Intelligenza: 22% (analisi, problem solving)
├── Forza: 20% (azioni fisiche) 
├── Carisma: 15% (interazioni sociali)
├── Vigore: 10% (resistenza, sopravvivenza)
└── Fortuna: 8% (eventi casuali puri)
```

### **Difficulty Distribution**
```
DC utilizzati negli eventi:
├── DC 8-10: 35% (Facile - successo probabile)
├── DC 11-13: 40% (Medio - sfida equilibrata)
├── DC 14-16: 20% (Difficile - richiede stats buone)
└── DC 17+: 5% (Molto difficile - eventi epici)
```

---

## 🔧 **EVENT SYSTEM INTEGRATION**

### **EventManager Integration**
```gdscript
# Caricamento eventi da file bioma
func _load_events_from_biomes_dir(seen_ids: Dictionary) -> void:
    var biome_files = [
        "forest_events.json",
        "plains_events.json", 
        "city_events.json",
        "village_events.json",
        "river_events.json",
        "rest_stop_events.json"
    ]
    
    for file_name in biome_files:
        var file_path = "res://data/events/biomes/" + file_name
        var data = _load_json_file(file_path)
        
        if not data.is_empty():
            _process_biome_events(data, seen_ids)
```

### **PlayerManager Consequences Application**
```gdscript
func apply_event_consequences(consequences: Dictionary) -> void:
    # Resource changes
    if consequences.has("hp_change"):
        modify_hp(consequences.hp_change)
    if consequences.has("food_change"):
        modify_food(consequences.food_change)
    if consequences.has("water_change"):
        modify_water(consequences.water_change)
    
    # Item transactions
    if consequences.has("items_gained"):
        for item in consequences.items_gained:
            add_item(item.id, item.quantity)
    if consequences.has("items_lost"):
        for item in consequences.items_lost:
            remove_item(item.id, item.quantity)
    
    # Experience gain
    if consequences.has("experience_gained"):
        add_experience(consequences.experience_gained, "event")
    
    # Status effects
    if consequences.has("status_effects"):
        for status_name in consequences.status_effects:
            apply_status_effect(status_name)
```

---

## 🎮 **DYNAMIC EVENT FEATURES**

### **Atmospheric Messaging**
```gdscript
# MainGame.gd - Messaggi atmosferici per biomi
var biome_entry_messages = {
    "foreste": {
        "text": "Entri in una fitta foresta. Gli alberi sussurrano segreti antichi.", 
        "color": "#34672a"
    },
    "pianure": {
        "text": "Una vasta pianura si apre davanti a te. L'orizzonte sembra infinito.", 
        "color": "#a5c9a5"
    },
    "città": {
        "text": "Rovine di una città emergono dalla desolazione.", 
        "color": "#c9c9c9"
    }
}

# Messaggi atmosferici casuali
var atmosphere_messages = [
    "Un silenzio innaturale ti circonda.",
    "Il vento ulula tra le rovine in lontananza.", 
    "Per un attimo, hai la strana sensazione di essere osservato."
]
```

### **Event Narrative Hooks**
```
Recurring Themes:
├── Survival vs Morality: aiutare altri a costo personale
├── Risk vs Reward: pericoli per ricompense migliori
├── Knowledge vs Instinct: intelligence vs luck choices
├── Past vs Future: preservare memories vs progress
├── Human vs Animal: mantenere umanità vs sopravvivenza

Story Progression Hooks:
├── Family memories: richiami al passato di Ultimo
├── Safe Place clues: indizi sulla destinazione
├── World lore: storia dell'apocalisse
├── Character growth: sviluppo personalità
└── Moral choices: definizione valori personaggio
```

---

## 🔍 **EVENT CREATION GUIDELINES**

### **Writing Guidelines per Eventi**
```
Lunghezza Testi:
├── Title: 20-40 caratteri (conciso ma evocativo)
├── Description: 200-400 caratteri (immersivo ma leggibile)
├── Choice text: 20-60 caratteri (azione chiara)
├── Narrative consequences: 100-200 caratteri (impatto emotivo)

Tone Guidelines:
├── Atmosfera: Desolazione con speranza 
├── Pericolo: Reale ma non overwhelming
├── Scelte: Moralmente interessanti, non ovvie
├── Conseguenze: Significative ma non punitive

Balance Guidelines:
├── Positive/Negative outcomes: 60/40 ratio
├── Skill check difficulty: Majority DC 10-13
├── Reward scaling: Proporzionale al rischio
└── Narrative impact: Sempre presente anche in failure
```

### **Technical Guidelines**
```json
{
  // ID naming: [biome]_[descriptor]_[specific]
  "id": "forest_ancient_tree_discovery",
  
  // Skill check best practices
  "skill_check": {
    "stat": "most_thematically_appropriate",
    "difficulty": 10-13,  // Sweet spot per challenge
    "modifier": 0         // Solo per circostanze speciali
  },
  
  // Consequences scaling
  "consequences_success": {
    "narrative_text": "Always present",
    "items_gained": [{"id": "valid_item_id", "quantity": 1-3}],
    "hp_change": 5-15,    // Healing reward
    "experience_gained": 10-25  // Skill XP
  },
  
  "consequences_failure": {
    "narrative_text": "Always present - not punitive tone", 
    "hp_change": -5 to -15,  // Manageable damage
    "items_lost": [{"id": "common_item", "quantity": 1}]  // Minor loss
  }
}
```

---

## 🎯 **EVENT TESTING E VALIDATION**

### **Event Testing Patterns**
```gdscript
# EventManager debug per test eventi
func test_event_by_id(event_id: String) -> void:
    print("=== TESTING EVENT: ", event_id, " ===")
    
    if not cached_events.has(event_id):
        print("❌ Event not found in cache")
        return
    
    var event = cached_events[event_id]
    print("✅ Event found: ", event.title)
    print("Choices: ", event.choices.size())
    
    for i in range(event.choices.size()):
        var choice = event.choices[i]
        print("Choice ", i, ": ", choice.text)
        if choice.has("skill_check"):
            print("  Skill check: ", choice.skill_check.stat, " DC", choice.skill_check.difficulty)

# Test tutti gli eventi di un bioma
func test_all_events_for_biome(biome: String) -> void:
    if biome_event_pools.has(biome):
        for event in biome_event_pools[biome]:
            test_event_by_id(event.id)
```

### **Validation Checklist**
```
Event Content Validation:
├── ✅ ID unico nel database
├── ✅ Testi entro limiti lunghezza
├── ✅ Skill check usa stat valide
├── ✅ Items_gained/lost esistono in ItemDatabase
├── ✅ Consequences ben formate
├── ✅ Nessun typo in campi critici
└── ✅ JSON sintatticamente valido

Gameplay Balance:
├── ✅ DC appropriate per target audience
├── ✅ Rewards proporzionali a rischio
├── ✅ Failure consequences not punitive
├── ✅ Event frequency per bioma bilanciata
└── ✅ Narrative engagement mantenuto
```

---

## 📈 **EXPANSION ROADMAP**

### **Planned Event Features (v0.5.0+)**
```
Advanced Event Types:
├── Multi-stage events: eventi a più fasi
├── Conditional events: basati su stato player  
├── Chain events: eventi collegati narrativamente
├── Timed events: con timer di scelta
└── Repeatable events: con variazioni

Weather Integration:
├── Weather-specific events: tempeste, neve
├── Season events: eventi stagionali
├── Climate effects: impatto su skill check
└── Weather consequences: penalità/bonus ambientali

NPC Integration:
├── Named characters: NPCs ricorrenti
├── Reputation system: relazioni persistenti  
├── Trading events: commercio con NPCs
└── Social consequences: impatto su community
```

### **Content Expansion Areas**
```
New Biomes:
├── Mountains: eventi montagna/altitudine
├── Swamps: eventi palude/acquitrino
├── Bunkers: eventi sotterranei/militari
├── Labs: eventi scientifici/tecnologici
└── Ruins: eventi archeologici/storici

Event Complexity:
├── Resource management events: multi-choice resource allocation
├── Puzzle events: logic challenges, riddles
├── Survival challenges: complex multi-step survival scenarios
└── Story-critical events: main plot advancement
```

---

**Versione:** v0.4.0 "A unifying language for all things"  
**Data:** 21 Agosto 2025  
**Target:** LLM Technical Analysis - Events Database
