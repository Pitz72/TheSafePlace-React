# 🔌 LINEE GUIDA ESTENSIONI - THE SAFE PLACE v0.4.1

## 🎯 **GUIDA ESTENSIONI**

Linee guida per estendere il sistema mantenendo compatibilità.

---

## 🏗️ **ARCHITETTURA ESTENSIBILE**

### **Punti Estensione**
- **Nuovi Manager**: Seguire pattern singleton
- **Eventi Personalizzati**: Estendere EventManager
- **Oggetti Custom**: Aggiungere a database JSON
- **UI Components**: Integrare con GameUI

### **Principi**
- **Non Rompere**: Backward compatibility
- **Pattern Consistenti**: Seguire convenzioni esistenti
- **Documentazione**: Aggiornare docs per nuove features

---

## ➕ **AGGIUNGERE NUOVI OGGETTI**

### **1. Definire Schema**
```json
{
  "id": "custom_weapon_sword",
  "name": "Spada Custom",
  "category": "WEAPON",
  "rarity": "RARE",
  "properties": {
    "damage": 8,
    "weapon_type": "melee"
  }
}
```

### **2. Aggiungere Database**
- File: `data/items/weapons.json`
- Validazione: DataManager.validate_item_data()

### **3. Integrazione Codice**
```gdscript
# PlayerManager.equip_item() già supporta
func equip_custom_weapon(item_id: String) -> bool:
    return equip_item(item_id)  # Utilizza logica esistente
```

---

## 🎭 **NUOVI EVENTI**

### **1. Struttura Evento**
```json
{
  "id": "custom_biome_event",
  "biome": "custom_biome",
  "title": "Evento Custom",
  "description": "Descrizione evento",
  "choices": [
    {
      "text": "Scelta 1",
      "skill_check": {"stat": "forza", "difficulty": 15},
      "consequences_success": {"items_gained": [{"id": "reward_item"}]},
      "consequences_failure": {"hp_change": -10}
    }
  ]
}
```

### **2. Aggiungere Bioma**
```gdscript
# EventManager.gd
var biome_event_chances: Dictionary = {
    "custom_biome": 0.5  # 50% probabilità
}
```

---

## 👤 **NUOVE STATISTICHE**

### **1. Aggiungere Stat**
```gdscript
# PlayerManager.gd
var stats: Dictionary = {
    "custom_stat": 10  # Nuova statistica
}
```

### **2. Modificatori**
```gdscript
# SkillCheckManager.gd
func get_custom_modifier(stat_value: int) -> int:
    return int((stat_value - 10) / 2.0)  # Formula D&D
```

### **3. UI Integration**
```gdscript
# StatsPanel.gd
func _update_custom_stat():
    custom_stat_label.text = str(PlayerManager.get_stat("custom_stat"))
```

---

## 🎨 **NUOVI TEMI**

### **1. Definire Tema**
```gdscript
# ThemeManager.gd
const CUSTOM_THEME = {
    "background": Color(0.1, 0.1, 0.1),
    "text_primary": Color(0.8, 0.8, 0.8),
    "accent": Color(0.5, 0.5, 1.0)
}
```

### **2. Applicare Tema**
```gdscript
func apply_custom_theme():
    for color_name in CUSTOM_THEME:
        set_color(color_name, CUSTOM_THEME[color_name])
    apply_global_theme()
```

---

## 🧪 **TESTING ESTENSIONI**

### **Unit Tests**
```gdscript
func test_custom_item():
    var success = PlayerManager.add_item("custom_weapon_sword", 1)
    assert_true(success)
    assert_equal(PlayerManager.get_item_count("custom_weapon_sword"), 1)
```

### **Integration Tests**
```gdscript
func test_custom_event_flow():
    var event = EventManager.trigger_random_event("custom_biome")
    assert_true(event.triggered)
    assert_equal(event.biome, "custom_biome")
```

---

## 📚 **DOCUMENTAZIONE**

### **Aggiornare Docs**
- **API Reference**: Aggiungere nuove funzioni
- **Architettura**: Documentare cambiamenti
- **Testing**: Aggiungere test cases

### **Esempi**
```gdscript
## Utilizzo Custom Item
var sword = PlayerManager.add_item("custom_weapon_sword", 1)
PlayerManager.equip_item("custom_weapon_sword")
```

---

## ⚠️ **BEST PRACTICES**

### **Compatibility**
- **Version Check**: Verificare versione minima
- **Fallback**: Comportamenti safe se feature mancante
- **Optional**: Non rompere senza nuove features

### **Performance**
- **Lazy Loading**: Caricare solo quando necessario
- **Caching**: Riutilizzare dati caricati
- **Memory**: Gestire risorse correttamente

### **Maintainability**
- **Clear Naming**: Convenzioni consistenti
- **Documentation**: Commenti dettagliati
- **Modular**: Separare responsabilità

---

**Versione:** v0.4.1  
**Data:** 22 Settembre 2025