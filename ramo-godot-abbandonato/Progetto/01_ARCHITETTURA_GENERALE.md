# 🏗️ ARCHITETTURA GENERALE - THE SAFE PLACE v0.9.8.0

## 🎯 **OVERVIEW DEL SISTEMA**

The Safe Place è un **GDR testuale post-apocalittico** sviluppato in **Godot 4.x** che emula l'esperienza dei terminali computer degli anni '80. Il progetto implementa un'architettura modulare basata su **Singleton Managers** che gestiscono aspetti specifici del gioco attraverso il **sistema di segnali di Godot**.

### **Paradigma Architetturale**
- **Event-Driven Architecture:** Comunicazione asincrona via segnali
- **Singleton Pattern:** Manager centralizzati per stati globali
- **Data-Driven Design:** Separazione completa logica/contenuti  
- **Component-Based UI:** Pannelli modulari e intercambiabili

---

## 🎮 **TIPOLOGIA E SCOPE DEL PROGETTO**

### **Genre:** 
- Text-based RPG survival
- Post-apocalyptic narrative adventure
- CRT terminal emulation experience

### **Target Platform:**
- Desktop (Windows, Linux, macOS)
- Godot 4.x runtime
- Keyboard-only input system

### **Scope Tecnico:**
- Single-player experience
- Local data persistence (JSON)
- No networking/multiplayer
- CRT aesthetic with custom shaders

---

## 🧩 **COMPONENTI PRINCIPALI DEL SISTEMA**

### **1. SINGLETON MANAGERS (7 Manager Consolidati)**

```
CoreDataManager           → Database JSON, validazione, items, enemies
PlayerSystemManager       → Stato giocatore, inventario, statistiche, skill check
WorldSystemManager        → Tempo, ciclo giorno/notte, crafting, biomi
NarrativeSystemManager    → Eventi narrativi, quest, ricordi, skill check
CombatSystemManager       → Sistema combattimento turn-based, nemici
InterfaceSystemManager    → UI/UX, temi, input, hotkey, popups
PersistenceSystemManager  → Sistema salvataggio/caricamento, serializzazione
```

### **1.1. DEVELOPMENT TOOLS (v0.4.1)**

```
TSPLogger         → Sistema logging unificato (non-singleton)
TestFramework     → Framework unit testing automatico
PlayerManagerTests→ Test suite per PlayerManager validation
```

**Note Architetturali:**
- TSPLogger usa `class_name TSPLogger` (evita conflitti globali)
- TestFramework ereditabile per nuovi test suites
- Pattern anti-regressione per stable releases

### **2. SISTEMA SCENE GODOT**

```
MainGame.tscn (Root Scene)
├── GameUI/ (UI Container)
│   └── GameUI.gd (UI Controller)
│       ├── SurvivalPanel (HP/Food/Water)
│       ├── InventoryPanel (Gestione oggetti)
│       ├── LogPanel (Narrazione)
│       ├── StatsPanel (Statistiche personaggio)
│       ├── EquipmentPanel (Equipaggiamento)
│       ├── InfoPanel (Posizione, tempo)
│       ├── CommandsPanel (Comandi disponibili)
│       └── World.tscn (Istanziato dinamicamente)
│           ├── AsciiTileMap (Mappa 250x250)
│           ├── PlayerCharacter (Sprite2D player)
│           └── Camera2D (Vista gioco)
└── PopupLayer (Popup Container)
    ├── EventPopup (Eventi interattivi)
    ├── ItemInteractionPopup (Gestione oggetti)
    ├── LevelUpPopup (Progressione)
    └── CharacterCreationPopup (Creazione PG)
```

### **3. DATABASE SYSTEM (JSON)**

```
data/
├── system/
│   └── rarity_system.json (5 livelli rarità)
├── items/ (8 categorie oggetti)
│   ├── weapons.json (15+ armi)
│   ├── armor.json (12+ armature)
│   ├── consumables.json (20+ consumabili)
│   ├── ammo.json (8+ munizioni)
│   ├── crafting_materials.json (15+ materiali)
│   ├── quest_items.json (5+ oggetti quest)
│   ├── unique_items.json (8+ oggetti unici)
│   └── misc_items.json (10+ oggetti vari)
└── events/ (7 biomi)
    ├── unique_events.json (Eventi speciali)
    └── biomes/
        ├── forest_events.json (25+ eventi)
        ├── plains_events.json (20+ eventi)
        ├── city_events.json (15+ eventi)
        ├── village_events.json (15+ eventi)
        ├── river_events.json (10+ eventi)
        └── rest_stop_events.json (8+ eventi)
```

---

## 🔄 **FLUSSO DI ESECUZIONE PRINCIPALE**

### **1. FASE DI AVVIO**
```
1. MainGame._ready()
   ├── Inizializza EventManager
   ├── Prepara dati personaggio (PlayerManager)
   ├── Mostra popup creazione personaggio
   └── Connette segnali globali

2. CharacterCreationPopup
   ├── Genera statistiche casuali (4d6 drop lowest)
   ├── Calcola HP basato su Vigore
   ├── Permette rigenerazione stats
   └── Finalizza personaggio

3. GameUI._ready()
   ├── Verifica manager disponibili
   ├── Istanzia World scene
   ├── Connette segnali UI
   └── Aggiorna pannelli iniziali
```

### **2. GAME LOOP PRINCIPALE**
```
1. Input utente (WASD/Frecce)
   ↓
2. InputManager processa comando
   ↓
3. InputManager.map_move signal
   ↓
4. World._on_map_move()
   ├── Verifica collisioni (montagne)
   ├── Applica penalità movimento (fiumi)
   ├── Aggiorna posizione player
   └── Emette player_moved signal
   ↓
5. MainGame._on_player_moved()
   ├── Incrementa contatori
   ├── Applica penalità sopravvivenza (TimeManager)
   ├── Verifica cooldown eventi
   ├── Tenta trigger evento
   └── Aggiorna UI
   ↓
6. EventManager.trigger_random_event()
   ├── Seleziona evento casuale per bioma
   ├── Mostra EventPopup
   ├── Gestisce skill check
   ├── Applica conseguenze
   └── Aggiorna log narrativo
```

### **3. SISTEMA EVENTI INTERATTIVI**
```
1. Evento triggerato
   ↓
2. EventPopup mostra dettagli evento
   ├── Titolo e descrizione
   ├── Lista scelte disponibili
   └── Navigazione keyboard (↑/↓, Enter)
   ↓
3. Scelta selezionata
   ├── Se ha skill_check → SkillCheckManager
   ├── Calcola risultati (dadi + modificatori)
   ├── Applica conseguenze (successo/fallimento)
   └── Aggiorna risorse/inventario
   ↓
4. Chiusura popup
   ├── Reset cooldown eventi
   ├── Aggiorna UI
   └── Ritorno al game loop
```

---

## 🔧 **PATTERN ARCHITETTURALI UTILIZZATI**

### **1. SINGLETON PATTERN**
- **Implementazione:** Autoload di Godot per manager globali
- **Scope:** Stato giocatore, dati globali, sistemi di gioco
- **Vantaggi:** Accesso globale, inizializzazione automatica
- **Files coinvolti:** Tutti i manager in `scripts/managers/`

### **2. OBSERVER PATTERN**
- **Implementazione:** Sistema segnali di Godot
- **Scope:** Comunicazione asincrona tra componenti
- **Pattern:** Manager emettono segnali → UI ascolta e aggiorna
- **Esempi:** 
  ```gdscript
  PlayerManager.resources_changed.connect(SurvivalPanel.update_panel)
  TimeManager.day_changed.connect(GameUI._on_day_changed)
  ```

### **3. STRATEGY PATTERN**
- **Implementazione:** Sistema skill check configurabile
- **Scope:** Test abilità con diverse difficoltà e statistiche
- **Files:** `SkillCheckManager.gd`, eventi JSON
- **Configurazione:** JSON definisce stat, DC, modificatori

### **4. FACTORY PATTERN**
- **Implementazione:** Generazione dinamica eventi e oggetti
- **Scope:** Istanziazione popup, creazione oggetti inventario
- **Files:** `EventManager.gd`, `DataManager.gd`
- **Caratteristiche:** Caching, validazione, fallback

### **5. COMMAND PATTERN**
- **Implementazione:** Sistema input con azioni mappate
- **Scope:** Comandi giocatore (movimento, inventario, interazioni)
- **Files:** `InputManager.gd`, project.godot (input map)
- **Vantaggi:** Remapping, stati input, undo potenziale

### **6. UNIFIED LOGGING PATTERN (v0.4.1)**
- **Implementazione:** TSPLogger sistema centralizzato
- **Scope:** Standardizzazione output debug/monitoring
- **Files:** `scripts/tools/TSPLogger.gd`
- **Caratteristiche:**
  ```gdscript
  # Formato standardizzato: [LEVEL] Icon ManagerPrefix: Message
  TSPLogger.info("PlayerManager", "Character created successfully")
  # Output: [INFO] 📊 👤: Character created successfully
  
  # Metodi convenience per livelli
  TSPLogger.success("EventManager", "Event triggered")
  TSPLogger.error("DataManager", "JSON file not found")
  TSPLogger.debug("TimeManager", "Day cycle completed")
  
  # Metodi speciali per operazioni
  TSPLogger.operation_result("DataManager", "Load items", true, "52 items loaded")
  ```
- **Vantaggi:** 
  - Formato consistente con emoji indicators
  - Manager prefixes per easy filtering
  - Anti-conflicts con global class management
  - Centralized logging per future monitoring

---

## 📊 **LAYERED ARCHITECTURE**

### **LAYER 1: ENGINE FOUNDATION**
```
Godot Engine 4.x
├── Scene System (.tscn files)
├── Script System (.gd files)  
├── Autoload System (Singleton managers)
├── Signal System (Event communication)
└── Resource System (.tres, .json files)
```

### **LAYER 2: GAME MANAGERS**
```
Singleton Managers (12 systems)
├── Data Layer (DataManager)
├── Player State (PlayerManager)
├── World State (TimeManager)
├── Event Logic (EventManager + SkillCheckManager)
├── Input Handling (InputManager)
├── Presentation (ThemeManager)
├── Combat System (CombatManager)
├── Crafting System (CraftingManager)
├── Narrative System (NarrativeManager)
├── Quest System (QuestManager)
└── Persistence (SaveLoadManager)
```

### **LAYER 3: GAME SYSTEMS**
```
Core Game Systems
├── World System (World.gd, TileMap)
├── UI System (GameUI.gd, 8 panels)
├── Event System (Popup management)
└── Progression System (Experience, stats)
```

### **LAYER 4: GAME CONTENT**
```
Game Content (JSON Data)
├── Items Database (8 categories, 50+ objects)
├── Events Database (7 biomes, 100+ events)
├── System Configuration (Rarity, colors)
└── Map Data (ASCII 250x250 world)
```

---

## 🔗 **DIPENDENZE E RELAZIONI**

### **DIPENDENZE CRITICHE**
```
MainGame.gd
├── Dipende da: EventManager, PlayerManager, World, GameUI
├── Coordina: Sequenza avvio, eventi globali
└── Gestisce: Game loop principale

DataManager.gd
├── Dipende da: FileAccess (Godot), JSON parser
├── Fornisce a: Tutti i manager (validazione oggetti)
└── Carica: Tutti i database JSON

PlayerManager.gd  
├── Dipende da: DataManager (validazione)
├── Fornisce a: UI panels (stato player)
└── Gestisce: Stato persistente giocatore
```

### **FLUSSO DATI PRINCIPALE**
```
JSON Files (data/) 
    ↓
DataManager (caricamento e cache)
    ↓
PlayerManager (stato giocatore)
    ↓
EventManager (eventi per bioma)
    ↓
GameUI Panels (visualizzazione)
    ↓
User Input (InteractionPopup)
    ↓
State Changes (back to PlayerManager)
```

---

## ⚙️ **CONFIGURAZIONI CHIAVE**

### **PROJECT.GODOT (AUTOLOAD)**
```
[autoload]
ThemeManager="*res://scripts/ThemeManager.gd"
DataManager="*res://scripts/managers/DataManager.gd"
PlayerManager="*res://scripts/managers/PlayerManager.gd"
InputManager="*res://scripts/managers/InputManager.gd"
TimeManager="*res://scripts/managers/TimeManager.gd"
EventManager="*res://scripts/managers/EventManager.gd"
SkillCheckManager="*res://scripts/managers/SkillCheckManager.gd"
QuestManager="*res://scripts/managers/QuestManager.gd"
NarrativeManager="*res://scripts/managers/NarrativeManager.gd"
CraftingManager="*res://scripts/managers/CraftingManager.gd"
CombatManager="*res://scripts/managers/CombatManager.gd"
SaveLoadManager="*res://scripts/managers/SaveLoadManager.gd"
```

### **INPUT MAPPING**
```
move_up/down/left/right → WASD + Arrow Keys
ui_accept → Enter + Space
ui_cancel → Escape
ui_inventory → I key
debug_f9 → F9 key
```

### **TEMA CRT**
```
Font: Perfect DOS VGA 437 Win.ttf
Shader: crt_terminal.gdshader (scanlines, curvatura)
Colori: Terminale verde fosforescente
Resolution: Target retro 640x480 scaled
```

---

## 🔍 **ENTRY POINTS PER ANALISI**

### **Per comprendere il game flow:**
- `MainGame.gd` - Coordinatore principale
- `World.gd` - Sistema movimento e mondo
- `EventManager.gd` - Logic eventi

### **Per comprendere i dati:**
- `DataManager.gd` - Caricamento e validazione
- `data/items/` - Struttura oggetti
- `data/events/` - Struttura eventi

### **Per comprendere l'UI:**
- `GameUI.gd` - Coordinatore UI
- `scripts/ui/panels/` - Singoli pannelli
- `scenes/ui/popups/` - Popup interattivi

### **Per comprendere la progressione:**
- `PlayerManager.gd` - Stato e statistiche
- `SkillCheckManager.gd` - Sistema test abilità
- `TimeManager.gd` - Meccaniche temporali

---

## 📋 **CONVENZIONI E STANDARD**

### **NAMING CONVENTIONS**
```
- Files: snake_case (player_manager.gd)
- Classes: PascalCase (PlayerManager)
- Variables: snake_case (max_hp)
- Constants: UPPER_SNAKE_CASE (MAX_INVENTORY_SLOTS)
- Signals: snake_case (inventory_changed)
```

### **SIGNAL NAMING**
```
- State change: [system]_changed (stats_changed)
- Action request: [action]_requested (level_up_requested)
- Event occurred: [event]_triggered (event_triggered)
- Result delivered: [result]_generated (narrative_log_generated)
```

### **JSON STRUCTURE STANDARD**
```
{
  "id": "unique_identifier",
  "name": "Human readable name",
  "nameShort": "Short version",
  "description": "Detailed description",
  "category": "CATEGORY_ENUM",
  "subcategory": "sub_type",
  "rarity": "RARITY_ENUM", 
  "weight": float,
  "value": integer,
  "stackable": boolean,
  "max_stack": integer,
  "properties": {
    // Type-specific properties
  }
}
```

---

## 🎯 **POINTS OF EXTENSION**

### **Facilmente Estendibili:**
- **Nuovi oggetti:** Aggiunta file JSON in `data/items/`
- **Nuovi eventi:** Aggiunta eventi in `data/events/biomes/`
- **Nuovi biomi:** Estensione mappa + eventi associati
- **Nuovi popup:** Template popup esistenti

### **Moderatamente Complessi:**
- **Nuove statistiche:** Modifica PlayerManager + UI panels
- **Nuovo sistema combattimento:** Estensione managers esistenti
- **Nuovi manager:** Aggiunta autoload + signal integration

### **Architetturalmente Complessi:**
- **Networking/Multiplayer:** Richiede refactoring sostanziale
- **Save/Load system:** Nuova serializzazione stato
- **Modding support:** API pubbliche per contenuti esterni

---

## 📈 **PERFORMANCE CHARACTERISTICS**

### **Target Performance:**
- **FPS:** 60+ stabili
- **Memory usage:** <100MB normale gameplay
- **Load time:** <3 secondi avvio
- **Input lag:** <16ms per azioni

### **Ottimizzazioni Implementate:**
- **TileMap caching:** Mappa pre-renderizzata
- **Event pooling:** Cache eventi per bioma
- **JSON lazy loading:** Caricamento on-demand
- **UI batching:** Aggiornamenti raggruppati

### **Bottleneck Identificati:**
- **World rendering:** Mappa 250x250 tile
- **JSON parsing:** Database grandi all'avvio
- **Signal overhead:** Molti segnali per frame
- **Popup instantiation:** Creazione UI dinamica

---

## 🚧 **STATO ATTUALE SVILUPPO**

### **✅ SISTEMI COMPLETI (v0.9.7.1)**
- Core engine e manager system (12 manager)
- Player progression e character creation
- Event system con skill check avanzato
- Inventory system con hotkey e transazioni
- Time management con ciclo giorno/notte
- World exploration con mappa 250x250
- UI completa a 8 pannelli + popup avanzati
- CRT theming con shader customizzati
- Sistema combattimento turn-based
- Sistema crafting con workbench
- Sistema narrativo con ricordi e empatia
- Sistema quest strutturato
- Sistema salvataggio/caricamento completo

### **🔄 IN OTTIMIZZAZIONE**
- Performance optimization per contenuti espansi
- Balancing avanzato dei sistemi di gioco
- Espansione contenuti narrativi
- Testing end-to-end completo

### **📋 ROADMAP PROSSIME VERSIONI**
- v1.0.0: Release finale con contenuti completi
- v1.1.0: Modding support e API pubbliche
- v1.2.0: Multiplayer foundation
- v2.0.0: Expanded world e nuove meccaniche

---

## 🔍 **DIAGNOSTICS E MONITORING**

### **Debug Systems Integrati:**
- Console output dettagliato per ogni manager
- Performance metrics via F9 debug
- Anti-regression test suite
- State validation automatica

### **Logging Levels:**
```
🎮 MainGame: Game flow principale
🗄️ DataManager: Caricamento database  
👤 PlayerManager: Stato giocatore
⌨️ InputManager: Input processing
⏰ TimeManager: Sistema temporale
🎭 EventManager: Eventi e skill check
🖥️ GameUI: Aggiornamenti UI
```

### **Error Handling:**
- Fallback graceful per file mancanti
- Validazione dati JSON estensiva
- Error logging con stack trace
- Recovery automatico per stati corrotti

---

**Versione:** v0.9.7.1 "Is it a Game or a Library?"
**Data:** 24 Settembre 2025
**Target:** LLM Technical Analysis
