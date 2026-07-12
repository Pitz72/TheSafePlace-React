# 📖 NARRATIVE SYSTEM - THE SAFE PLACE v0.9.5

## 🎯 **OVERVIEW SISTEMA NARRATIVO**

Il Narrative System di The Safe Place gestisce l'aspetto narrativo e psicologico del gioco, tracciando lo stato emotivo del giocatore, i ricordi familiari e l'impatto delle scelte sulla personalità del personaggio. Il sistema crea un'esperienza narrativa immersiva che evolve dinamicamente basata sulle azioni del giocatore.

### **Filosofia Design Narrativo**
- **Emotional Journey:** Evoluzione psicologica del personaggio
- **Memory-Driven:** Ricordi che influenzano scelte e percezioni
- **Moral Complexity:** Decisioni che plasmano la personalità
- **Atmospheric Immersion:** Descrizioni contestuali ricche
- **Character Development:** Crescita narrativa organica

---

## 🧠 **ARCHITETTURA STATO EMOTIVO**

### **Stati Emotivi Principali**
```gdscript
enum EmotionalState {
    COLD_PRAGMATIC,     # Freddo e calcolatore
    HOPEFUL_OPTIMIST,   # Speranzoso e fiducioso
    CYNICAL_SURVIVOR,   # Cinico e diffidente
    BROKEN_SPIRIT,      # Spezzato psicologicamente
    UNWAVERING_RESOLVE, # Determinazione incrollabile
    MORAL_COMPASS       # Buscola morale intatta
}
```

### **Struttura Stato Emotivo**
```gdscript
var emotional_state: Dictionary = {
    "current_state": "cold_pragmatic",
    "connection_level": 1,              # Livello connessione umana (1-5)
    "morality_alignment": 0,            # Allineamento morale (-10 a +10)
    "trust_level": 0,                   # Livello fiducia (-5 a +5)
    "resilience": 0.5,                  # Resilienza psicologica (0-1)
    "hope_level": 0.3                   # Livello speranza (0-1)
}
```

### **Transizioni Stato Emotivo**
```gdscript
const EMOTIONAL_TRANSITIONS = {
    "positive_event": {
        "cold_pragmatic": "hopeful_optimist",
        "cynical_survivor": "unwavering_resolve"
    },
    "negative_event": {
        "hopeful_optimist": "cold_pragmatic",
        "unwavering_resolve": "cynical_survivor"
    },
    "moral_choice_good": {
        "morality_alignment": +1,
        "trust_level": +0.5
    },
    "moral_choice_evil": {
        "morality_alignment": -1,
        "connection_level": -0.2
    }
}
```

---

## 🧵 **SISTEMA RICORDI**

### **Tipi di Ricordi**
```gdscript
enum MemoryType {
    FAMILY,         # Ricordi familiari
    LOST_LOVED_ONES,# Persone care perdute
    PRE_WAR_LIFE,   # Vita prima dell'apocalisse
    FIRST_DAYS,     # Giorni iniziali apocalisse
    MORAL_CHOICES,  # Decisioni etiche passate
    SURVIVAL_MOMENTS# Momenti chiave sopravvivenza
}
```

### **Struttura Ricordo**
```json
{
  "id": "memory_fathers_watch",
  "type": "FAMILY",
  "title": "L'Orologio del Padre",
  "description": "Ricordo dell'orologio che tuo padre ti diede prima di partire per l'ultimo viaggio.",
  "emotional_impact": {
    "hope_level": +0.1,
    "resilience": +0.05,
    "connection_level": +0.3
  },
  "narrative_triggers": [
    "time_events",
    "family_mentions",
    "mechanical_objects"
  ],
  "unlock_conditions": {
    "days_survived": 10,
    "emotional_state": "hopeful_optimist"
  }
}
```

### **Sistema Memoria Attiva**
```gdscript
var unlocked_memories: Array = []
var memory_strength: Dictionary = {}  # Forza ricordi (0-1)
var memory_triggers: Dictionary = {}  # Trigger attivazione

func unlock_memory(memory_id: String) -> bool:
    if not can_unlock_memory(memory_id):
        return false

    unlocked_memories.append(memory_id)
    memory_strength[memory_id] = 0.1  # Forza iniziale

    # Applica impatto emotivo immediato
    apply_memory_emotional_impact(memory_id)

    memory_unlocked.emit(memory_id)
    return true
```

---

## 👥 **SISTEMA EMPATIA PERSONAGGI**

### **Tracking Empatia**
```gdscript
var character_empathy: Dictionary = {
    "generic_survivor": 0,      # Sconosciuto
    "trusted_ally": 25,         # Alleato fidato
    "close_friend": 50,         # Amico stretto
    "family_member": 75,        # Familiare
    "lost_loved_one": 100       # Persona cara perduta
}
```

### **Livelli Relazione**
```
0-10:   Sconosciuto/Hostile
11-30:  Neutrale/Diffidente
31-60:  Conosciuto/Alleato
61-80:  Amico/Fidato
81-100: Legame Forte/Familiare
```

### **Aggiornamento Empatia**
```gdscript
func update_character_empathy(character: String, change: int) -> void:
    if not character_empathy.has(character):
        character_empathy[character] = 0

    character_empathy[character] = clamp(
        character_empathy[character] + change,
        -50, 100  # Range esteso per nemici
    )

    # Aggiorna stato relazione
    update_relationship_status(character)

    empathy_changed.emit(character, character_empathy[character])
```

---

## 🎭 **SISTEMA SCELTE MORALI**

### **Framework Decisioni Etiche**
```gdscript
struct MoralChoice {
    var description: String
    var options: Array[MoralOption]
    var consequence_type: String  # "immediate", "delayed", "permanent"
    var affected_characters: Array[String]
}

struct MoralOption {
    var text: String
    var morality_impact: int      # -10 a +10
    var trust_impact: int         # -5 a +5
    var consequence_text: String
    var unlocks_memory: String    # Ricordo sbloccato
}
```

### **Esempio Scelta Morale**
```gdscript
var mercy_choice = MoralChoice.new()
mercy_choice.description = "Un sopravvissuto ferito ti chiede aiuto. Le tue razioni sono limitate."
mercy_choice.options = [
    MoralOption.new("Aiutalo", +3, +2, "Condividi le tue razioni", "memory_compassion"),
    MoralOption.new("Ignoralo", -2, -1, "Prosegui senza aiutare", ""),
    MoralOption.new("Finiscilo", -5, -3, "Elimini la minaccia", "memory_darkness")
]
```

### **Impatto a Lungo Termine**
```gdscript
func apply_long_term_moral_impact(choice: MoralChoice, selected_option: int) -> void:
    var option = choice.options[selected_option]

    # Aggiorna allineamento morale
    emotional_state.morality_alignment += option.morality_impact

    # Aggiorna fiducia
    emotional_state.trust_level += option.trust_impact

    # Sblocca ricordi se applicabile
    if option.unlocks_memory:
        unlock_memory(option.unlocks_memory)

    # Aggiorna empatia personaggi coinvolti
    for character in choice.affected_characters:
        var empathy_change = calculate_empathy_change(option, character)
        update_character_empathy(character, empathy_change)
```

---

## 🌅 **SISTEMA ATMOSFERA NARRATIVA**

### **Descrizioni Contestuali**
```gdscript
var atmospheric_descriptions = {
    "cold_pragmatic": {
        "forest_entry": "Gli alberi si ergono come sentinelle silenziose. Valuti ogni ombra per minacce potenziali.",
        "combat_start": "Il combattimento è inevitabile. Calcoli le probabilità di sopravvivenza.",
        "rest_moment": "Un breve riposo calcolato. Ogni minuto conta per la sopravvivenza."
    },
    "hopeful_optimist": {
        "forest_entry": "La foresta, nonostante tutto, mantiene una certa bellezza selvaggia. Forse c'è ancora speranza.",
        "combat_start": "Devi difenderti, ma credi che ci sia un modo per risolvere questo senza violenza inutile.",
        "rest_moment": "Un momento di pace. Ti permetti di sperare che le cose possano migliorare."
    }
}
```

### **Trigger Narrativi Dinamici**
```gdscript
func get_contextual_description(context: String) -> String:
    var base_description = atmospheric_descriptions[emotional_state.current_state][context]

    # Modificatori basati su ricordi attivi
    for memory in get_active_memories():
        if memory_triggers[memory].has(context):
            base_description += get_memory_context_modifier(memory, context)

    # Modificatori basati su empatia
    if context.contains("person"):
        base_description += get_empathy_context_modifier(context)

    return base_description
```

---

## 📊 **SISTEMA PROGRESSIONE NARRATIVA**

### **Lore Progression Tree**
```gdscript
var lore_progression = {
    "apocalypse_cause": {
        "unlocked": false,
        "required_memories": ["memory_first_days", "memory_government"],
        "unlock_condition": "days_survived > 30",
        "narrative_impact": "Rivelazione causa apocalisse"
    },
    "safe_place_location": {
        "unlocked": false,
        "required_memories": ["memory_fathers_map", "memory_radio_signals"],
        "unlock_condition": "quest_main_completed",
        "narrative_impact": "Coordinate rifugio sicuro"
    }
}
```

### **Narrative Milestones**
```gdscript
var narrative_milestones = {
    10: "first_week_survivor",     # Prima settimana sopravvivenza
    30: "month_survivor",          # Primo mese
    100: "veteran_survivor",       # Veterano
    365: "year_survivor"           # Anno di sopravvivenza
}
```

---

## 🔗 **INTEGRAZIONE EVENTI**

### **Eventi Influenzati dallo Stato Emotivo**
```gdscript
# EventManager.gd - Modifica eventi basata su stato emotivo
func modify_event_based_on_emotional_state(event_data: Dictionary) -> Dictionary:
    var modified_event = event_data.duplicate(true)

    match NarrativeManager.emotional_state.current_state:
        "cold_pragmatic":
            # Opzioni più aggressive/utilitarie
            modified_event.choices = filter_pragmatic_choices(event_data.choices)
        "hopeful_optimist":
            # Opzioni più compassionevoli/ottimistiche
            modified_event.choices = filter_optimistic_choices(event_data.choices)
        "cynical_survivor":
            # Opzioni diffidenti/sospettose
            modified_event.choices = filter_cynical_choices(event_data.choices)

    return modified_event
```

### **Conseguenze Narrative**
```gdscript
# Applicazione conseguenze con impatto narrativo
func apply_event_consequences_with_narrative(consequences: Dictionary) -> void:
    # Applica conseguenze normali
    PlayerManager.apply_event_consequences(consequences)

    # Applica impatto narrativo
    if consequences.has("emotional_impact"):
        update_emotional_state_from_event(consequences.emotional_impact)

    if consequences.has("memory_trigger"):
        attempt_memory_unlock(consequences.memory_trigger)

    if consequences.has("relationship_change"):
        apply_relationship_changes(consequences.relationship_change)
```

---

## 🎮 **USER INTERFACE NARRATIVO**

### **Emotional State Display**
```
┌─ STATO EMOTIVO ──────────────────────────┐
│ Stato Attuale: Speranzoso Ottimista     │
│ Connessione Umana: ●●●○○ (3/5)         │
│ Allineamento Morale: Neutrale           │
│ Livello Fiducia: +2                     │
│ Resilienza: 65%                         │
│ Speranza: 70%                           │
│                                         │
│ Ricordi Attivi:                         │
│ • Orologio del Padre                    │
│ • Prima Settimana                       │
│ • Scelta di Misericordia                │
└─────────────────────────────────────────┘
```

### **Memory Flashbacks**
```
🎭 RICORDO: L'Orologio del Padre

"Il tempo è prezioso, Ultimo. Non sprecarlo mai."
- Tuo padre, prima di partire per l'ultimo viaggio

Questo ricordo ti dà forza. (+5% resilienza temporanea)
```

---

## 💾 **SISTEMA SALVATAGGIO NARRATIVO**

### **Dati Salvataggio**
```gdscript
func get_narrative_save_data() -> Dictionary:
    return {
        "emotional_state": emotional_state,
        "unlocked_memories": unlocked_memories,
        "memory_strength": memory_strength,
        "character_empathy": character_empathy,
        "lore_progression": lore_progression,
        "narrative_milestones": completed_milestones
    }
```

### **Ripristino Stato**
```gdscript
func load_narrative_save_data(save_data: Dictionary) -> void:
    emotional_state = save_data.get("emotional_state", get_default_emotional_state())
    unlocked_memories = save_data.get("unlocked_memories", [])
    memory_strength = save_data.get("memory_strength", {})
    character_empathy = save_data.get("character_empathy", {})

    # Ricostruisci stato da dati salvati
    reconstruct_narrative_state()
}
```

---

## 📈 **ANALYTICS E MONITORING**

### **Narrative Metrics**
```gdscript
func get_narrative_analytics() -> Dictionary:
    return {
        "total_memories_unlocked": unlocked_memories.size(),
        "average_empathy_level": calculate_average_empathy(),
        "moral_alignment_trend": get_moral_alignment_trend(),
        "emotional_state_changes": emotional_state_change_count,
        "narrative_milestones_reached": completed_milestones.size(),
        "relationship_complexity": character_empathy.size()
    }
```

### **Player Journey Tracking**
```gdscript
var player_journey = {
    "start_emotional_state": "cold_pragmatic",
    "current_emotional_state": "hopeful_optimist",
    "major_decisions": [],
    "turning_points": [],
    "character_arc": "redemption"  # redemption, descent, steadfast
}
```

---

## 🔧 **API PUBBLICA NARRATIVEMANAGER**

### **Stato Emotivo**
```gdscript
func get_emotional_state() -> Dictionary
func update_emotional_state(trigger: String, intensity: int) -> void
func get_emotional_state_description() -> String
func get_emotional_state_color() -> Color
```

### **Sistema Ricordi**
```gdscript
func unlock_memory(memory_id: String) -> bool
func get_unlocked_memories() -> Array
func get_memory_strength(memory_id: String) -> float
func strengthen_memory(memory_id: String, amount: float) -> void
```

### **Empatia Personaggi**
```gdscript
func update_character_empathy(character: String, change: int) -> void
func get_character_empathy(character: String) -> int
func get_character_relationship_status(character: String) -> String
func get_all_character_relationships() -> Dictionary
```

### **Progressione Narrativa**
```gdscript
func advance_lore_progression(lore_id: String) -> void
func get_lore_completion_percentage() -> float
func check_narrative_milestone(days: int) -> bool
func get_narrative_analytics() -> Dictionary
```

### **Segnali Emessi**
```gdscript
signal emotional_state_changed(new_state: Dictionary)
signal memory_unlocked(memory_id: String)
signal empathy_changed(character: String, new_level: int)
signal lore_progressed(lore_id: String, progress: float)
signal narrative_milestone_reached(milestone_id: String)
signal relationship_status_changed(character: String, new_status: String)
```

---

## 🧪 **TESTING E VALIDATION**

### **Narrative Test Scenarios**
```gdscript
# Test transizioni stato emotivo
func test_emotional_transitions() -> void:
    var initial_state = NarrativeManager.get_emotional_state()

    # Simula evento positivo
    NarrativeManager.update_emotional_state("positive_event", 1)

    var new_state = NarrativeManager.get_emotional_state()
    assert(new_state.hope_level > initial_state.hope_level)

# Test sblocco ricordi
func test_memory_unlock() -> void:
    var memory_count_before = NarrativeManager.get_unlocked_memories().size()

    var success = NarrativeManager.unlock_memory("test_memory")
    assert(success)

    var memory_count_after = NarrativeManager.get_unlocked_memories().size()
    assert(memory_count_after == memory_count_before + 1)
```

### **Performance Benchmarks**
```
Aggiornamento stato emotivo: <5ms
Calcolo empatia: <10ms
Sblocco ricordo: <15ms
Salvataggio dati narrativi: <20ms
```

---

## 🚀 **ROADMAP ESPANSIONI**

### **Funzionalità Avanzate**
```
Dynamic Storylines:    Trame che si adattano alle scelte
Multiple Endings:      Finale basato su stato narrativo
Character Relationships: Sistemi relazione complessi
Psychological Effects: Impatti psicologici delle esperienze
Memory Fragments:      Sistema frammenti ricordo
Narrative Branches:    Scelte che creano rami narrativi
```

### **Sistema Sociale**
```
NPC Relationships:     Relazioni profonde con NPC
Faction Systems:       Allineamenti con fazioni
Reputation Networks:   Reti sociali di sopravvivenza
Story Sharing:         Condivisione esperienze tra giocatori
```

---

**Versione:** v0.9.6.5 "Computer Boot System"
**Data:** 24 Settembre 2025
**Target:** LLM Technical Analysis - Narrative System