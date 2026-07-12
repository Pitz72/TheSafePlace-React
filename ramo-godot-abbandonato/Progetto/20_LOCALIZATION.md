# 🌐 LOCALIZZAZIONE - THE SAFE PLACE v0.4.1

## 🎯 **SISTEMA LOCALIZZAZIONE**

Supporto multilingua per testi di gioco.

### **Lingue Supportate**
- **Italiano**: Lingua primaria (IT)
- **Inglese**: Fallback (EN)

### **Architettura**
```json
{
  "ui": {
    "inventory_title": {
      "it": "Inventario",
      "en": "Inventory"
    }
  },
  "events": {
    "village_encounter": {
      "title": {
        "it": "Il Vecchio del Villaggio",
        "en": "The Village Elder"
      }
    }
  }
}
```

---

## 🔧 **IMPLEMENTAZIONE**

### **LocalizationManager (Futuro)**
```gdscript
class_name LocalizationManager
extends Node

var current_language = "it"
var translations = {}

func get_text(key: String) -> String:
    if translations.has(key) and translations[key].has(current_language):
        return translations[key][current_language]
    return key  # Fallback alla chiave
```

### **Integrazione UI**
```gdscript
# Esempio pannello
func _ready():
    title_label.text = LocalizationManager.get_text("inventory_title")
```

---

## 📝 **COPERTURA LOCALIZZAZIONE**

### **Elementi Localizzati**
- ✅ Titoli UI
- ✅ Descrizioni eventi
- ✅ Testi scelte
- ✅ Messaggi sistema
- ✅ Nomi oggetti

### **Elementi Non Localizzati**
- 🔄 Nomi statistica (universali)
- 🔄 Comandi input (standard)
- 🔄 Log debug (sviluppo)

---

**Versione:** v0.4.1  
**Data:** 22 Settembre 2025