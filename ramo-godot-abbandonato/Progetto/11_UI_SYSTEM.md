# 🎨 SISTEMA UI - THE SAFE PLACE v0.4.1

## 🎯 **OVERVIEW DEL SISTEMA UI**

Il sistema UI di The Safe Place è progettato per un'esperienza **keyboard-only** con interfaccia a pannelli modulari. L'architettura si basa su un sistema di scene Godot con componenti riutilizzabili e comunicazione basata su segnali.

### **Paradigma UI**
- **Keyboard-Only Navigation**: Nessun mouse richiesto
- **Panel-Based Layout**: 8 pannelli principali in layout 3-colonna
- **Modal Popups**: Sistema popup sovrapposti per interazioni
- **Signal-Driven Updates**: Aggiornamenti automatici tramite segnali manager

---

## 🖥️ **STRUTTURA SCENE UI**

### **1. GameUI.gd (Scene Root)**
```gdscript
GameUI (Control)
├── SurvivalPanel (VBoxContainer) - HP/Food/Water
├── InventoryPanel (VBoxContainer) - Oggetti giocatore
├── LogPanel (VBoxContainer) - Diario narrativo
├── StatsPanel (VBoxContainer) - Statistiche personaggio
├── EquipmentPanel (VBoxContainer) - Equipaggiamento
├── InfoPanel (VBoxContainer) - Posizione/Tempo
├── CommandsPanel (VBoxContainer) - Comandi disponibili
└── World.tscn (SubViewport) - Mondo di gioco
```

### **2. PopupLayer (CanvasLayer)**
```gdscript
PopupLayer
├── EventPopup.gd - Eventi interattivi
├── ItemInteractionPopup.gd - Gestione oggetti
├── LevelUpPopup.gd - Progressione personaggio
├── CharacterCreationPopup.gd - Creazione PG
└── RestNightPopup.gd - Riposo notturno
```

---

## 📊 **PANNELLI PRINCIPALI**

### **SurvivalPanel**
- **Posizione**: Colonna sinistra, alto
- **Contenuto**: Barre HP/Food/Water con valori numerici
- **Aggiornamento**: Segnali `PlayerManager.resources_changed`
- **Stile**: CRT verde con effetto scanline

### **InventoryPanel**
- **Posizione**: Colonna centrale, centro
- **Contenuto**: Lista oggetti (max 10 slot) con hotkey 1-9
- **Interazione**: Tasti numerici per uso rapido
- **Aggiornamento**: Segnali `PlayerManager.inventory_changed`

### **LogPanel**
- **Posizione**: Colonna destra, basso
- **Contenuto**: Diario narrativo con scroll
- **Aggiornamento**: Segnali `PlayerManager.narrative_log_generated`
- **Capacità**: Storico messaggi mantenuto

### **StatsPanel**
- **Posizione**: Colonna sinistra, centro
- **Contenuto**: 6 statistiche con valori e modificatori D&D
- **Aggiornamento**: Segnali `PlayerManager.stats_changed`
- **Layout**: Nome stat : valore (modificatore)

### **EquipmentPanel**
- **Posizione**: Colonna destra, centro
- **Contenuto**: Slot equipaggiamento (arma, armatura)
- **Aggiornamento**: Segnali `PlayerManager.inventory_changed`
- **Stato**: "Equipaggiato" o "Vuoto"

### **InfoPanel**
- **Posizione**: Colonna sinistra, basso
- **Contenuto**: Posizione corrente, ora del giorno
- **Aggiornamento**: Segnali `TimeManager.time_changed`
- **Formato**: "Posizione: [bioma] | Ora: [HH:MM]"

### **CommandsPanel**
- **Posizione**: Colonna destra, alto
- **Contenuto**: Lista comandi disponibili
- **Dinamico**: Cambia basato su contesto
- **Navigazione**: Scorciatoie visualizzate

---

## 🎭 **SISTEMA POPUP**

### **EventPopup**
- **Trigger**: `EventManager.event_triggered`
- **Contenuto**: Titolo evento, descrizione, scelte
- **Navigazione**: ↑/↓ per scelte, Enter per confermare
- **Chiusura**: Automatica dopo scelta o ESC

### **ItemInteractionPopup**
- **Trigger**: Interazione oggetto inventario
- **Modalità**: Usa, Equipaggia, Esamina, Getta
- **Conferma**: Richiesta per azioni distruttive

### **LevelUpPopup**
- **Trigger**: Guadagno livello personaggio
- **Contenuto**: Punti statistica disponibili
- **Interazione**: Selezione stat da migliorare

### **CharacterCreationPopup**
- **Trigger**: Avvio nuovo gioco
- **Sequenza**: Generazione statistiche, conferma personaggio
- **Validazione**: Controlli integrità dati

---

## ⌨️ **SISTEMA INPUT UI**

### **Input Mappings (project.godot)**
```ini
ui_accept = Enter, Space
ui_cancel = Escape
ui_inventory = I
move_up/down/left/right = WASD, Arrow Keys
debug_f9 = F9
```

### **Navigation States**
- **GAME_ACTIVE**: Navigazione mondo normale
- **POPUP_ACTIVE**: Focus su popup modale
- **INVENTORY_ACTIVE**: Modalità gestione inventario

### **InputManager Integration**
```gdscript
# InputManager gestisce stati input
enum InputState {
    WORLD_NAVIGATION,
    POPUP_INTERACTION,
    INVENTORY_MODE
}
```

---

## 🎨 **STILE E TEMI**

### **ThemeManager Integration**
- **Font**: Perfect DOS VGA 437 (retro CRT)
- **Colors**: Palette verde fosforescente
- **Shaders**: CRT effects (scanlines, curvature)
- **Spacing**: Layout fisso per risoluzione target

### **Responsive Design**
- **Target Resolution**: 640x480 (scaled)
- **Aspect Ratio**: Mantenuto con black bars
- **Font Scaling**: Automatico basato risoluzione

---

## 🔄 **COMUNICAZIONE E AGGIORNAMENTI**

### **Signal System**
```gdscript
# PlayerManager signals
resources_changed.connect(SurvivalPanel._update_bars)
inventory_changed.connect(InventoryPanel._refresh_items)
stats_changed.connect(StatsPanel._update_stats)
narrative_log_generated.connect(LogPanel._add_entry)

# TimeManager signals
time_changed.connect(InfoPanel._update_time)

# EventManager signals
event_triggered.connect(EventPopup._show_event)
```

### **Update Patterns**
- **Pull Model**: Pannelli richiedono dati ai manager
- **Push Model**: Manager notificano cambiamenti via segnali
- **Batch Updates**: Aggiornamenti raggruppati per performance

---

## 📏 **VINCOLI E LIMITAZIONI**

### **Technical Constraints**
- **No Mouse**: Tutto keyboard-driven
- **Fixed Layout**: 3 colonne non ridimensionabili
- **Memory**: UI leggera, no textures pesanti
- **Performance**: 60+ FPS mantenuti

### **Design Constraints**
- **Accessibility**: Navigazione logica e prevedibile
- **Information Density**: Solo info essenziali visibili
- **Modal Clarity**: Un popup alla volta
- **State Consistency**: UI sempre sincronizzata con game state

---

## 🔧 **IMPLEMENTAZIONE DETTAGLI**

### **Scene Instantiation**
```gdscript
# GameUI._ready()
func _ready():
    # Istanza pannelli
    survival_panel = SurvivalPanel.instantiate()
    add_child(survival_panel)
    
    # Connessione segnali
    PlayerManager.resources_changed.connect(survival_panel._update_display)
```

### **Popup Management**
```gdscript
# GameUI.show_popup()
func show_popup(popup_type: String, data: Dictionary):
    var popup = popup_scenes[popup_type].instantiate()
    popup_layer.add_child(popup)
    popup.show_with_data(data)
```

---

## 🧪 **TESTING UI**

### **UI Integration Tests**
- **Popup Lifecycle**: Apertura/chiusura corretta
- **Signal Propagation**: Aggiornamenti ricevuti
- **Input Handling**: Navigazione funzionante
- **State Synchronization**: UI riflette game state

### **Performance Benchmarks**
- **Load Time**: <500ms per scene UI
- **Memory Usage**: <50MB UI attiva
- **Frame Rate**: 60+ FPS con UI completa

---

## 📈 **EVOLUZIONE FUTURA**

### **Miglioramenti Pianificati**
- **Dynamic Layout**: Supporto risoluzioni multiple
- **Animation System**: Transizioni smooth
- **Accessibility**: Screen reader support
- **Localization**: Testi multilingua

### **Estensioni Possibili**
- **Custom Themes**: Tema selection
- **UI Scaling**: Font size options
- **Advanced Popups**: Rich text, images
- **Sound Integration**: UI audio feedback

---

**Versione:** v0.4.1 "Write Only When You're Not Drunk"  
**Data:** 22 Settembre 2025  
**Target:** LLM Technical Analysis