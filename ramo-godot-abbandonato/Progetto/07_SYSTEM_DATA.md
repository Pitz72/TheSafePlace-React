
**(INIZIO TESTO PER IL FILE `07_SYSTEM_DATA.md`)**

# ⚙️ SYSTEM DATA - THE SAFE PLACE v0.4.0

## 🎯 **OVERVIEW DEI DATI DI SISTEMA**

Questo documento descrive i database JSON che contengono le **configurazioni di sistema globali**, utilizzate da vari manager per garantire coerenza e facilitare il bilanciamento. Questi file non contengono contenuti di gioco come oggetti o eventi, ma le **regole e i parametri** che li governano.

### **Filosofia del Design**
- **Centralizzazione:** Le regole comuni (come la rarità) sono definite in un unico posto.
- **Bilanciamento Facilitato:** Modificare un valore in questi file ha un impatto globale su tutto il gioco.
- **Estensibilità:** La struttura permette di aggiungere facilmente nuovi livelli di rarità, temi o altri parametri di sistema.

---

## 🗃️ **STRUTTURA DEI FILE**

La documentazione si trova principalmente nella cartella `data/system/`.

```
data/
└── system/
    ├── rarity_system.json   # Definisce i livelli di rarità, i colori e i moltiplicatori.
    └── (futuro) theme_data.json # Potenziale file per i dati dei temi.
```

---

## 💎 **1. RARITY SYSTEM (`rarity_system.json`)**

Questo è uno dei file di sistema più importanti. Definisce i **5 livelli di rarità** che si applicano a oggetti, ricompense ed equipaggiamento. Viene caricato dal `DataManager` e utilizzato per calcolare il valore, il colore e la probabilità di drop degli oggetti.

### **Schema del File**
```json
{
  "rarity_system": {
    "NOME_RARITA_IN_MAIUSCOLO": {
      "name": "Nome Localizzato",
      "color": "#codice_esadecimale",
      "valueMultiplier": 1.0,
      "dropChance": 0.6
    }
  }
}
```

### **Contenuto Dettagliato (`rarity_system.json`)**
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

### **Integrazione nel Sistema**

#### **Caricamento (`DataManager.gd`)**
Il `DataManager` carica questo file all'avvio e lo memorizza nella variabile `rarity_system`.

#### **Utilizzo nel Calcolo del Colore (`DataManager.gd`)**
Il colore di un oggetto è determinato dalla sua categoria e modificato da un moltiplicatore basato sulla rarità.
```gdscript
const RARITY_MULTIPLIERS: Dictionary = {
    "COMMON": 0.7,
    "UNCOMMON": 0.85,
    "RARE": 1.0,
    "EPIC": 1.2,
    "LEGENDARY": 1.4
}

func get_item_color(item_id: String) -> Color:
    # ...
    var multiplier = RARITY_MULTIPLIERS.get(item_data.rarity, 1.0)
    return base_color * multiplier
```

#### **Utilizzo nella Localizzazione (`ItemInteractionPopup.gd`)**
Il popup usa la chiave `"name"` per mostrare il nome della rarità in italiano.
```gdscript
# Ottiene "COMMON" dall'oggetto
var rarity_key = item_data.rarity 
# Ottiene il dizionario {"name": "Comune", ...}
var rarity_data = DataManager.get_rarity_data(rarity_key) 
# Mostra "Comune"
var localized_name = rarity_data.name 
```

#### **Utilizzo nel Bilanciamento (Futuro)**
*   **`valueMultiplier`**: Verrà usato per calcolare il prezzo di vendita/acquisto degli oggetti.
*   **`dropChance`**: Verrà usato dal sistema di loot per determinare la probabilità di trovare un oggetto di quella rarità.

---

## 🎨 **2. THEME DATA (Potenziale Futuro)**

Attualmente, i dati dei temi (colori, percorsi degli shader) sono hardcoded nel `ThemeManager.gd`. Un'evoluzione futura del progetto potrebbe esternalizzarli in un file `data/system/theme_data.json` per una maggiore flessibilità.

### **Schema Potenziale (`theme_data.json`)**
```json
{
  "themes": {
    "DEFAULT": {
      "name": "Safe Place Green",
      "colors": {
        "primary": "#4EA162",
        "background": "#000503",
        "text": "#B2D8B2"
      }
    },
    "CRT_GREEN": {
      "name": "CRT Phosphor",
      "colors": {
        "primary": "#00FF41",
        "background": "#000000",
        "text": "#00FF41"
      },
      "shader": "res://themes/crt_terminal.gdshader"
    },
    "HIGH_CONTRAST": {
      "name": "High Contrast",
      "colors": {
        "primary": "#FFFFFF",
        "background": "#000000",
        "text": "#FFFFFF"
      }
    }
  }
}
```

### **Benefici di Questa Evoluzione**
*   **Modding:** Permetterebbe agli utenti di creare e aggiungere i propri temi visivi semplicemente aggiungendo un file JSON.
*   **Manutenibilità:** Separerebbe completamente i dati di configurazione visiva dalla logica del `ThemeManager`.
*   **Coerenza:** Allineerebbe il `ThemeManager` alla filosofia data-driven del resto del progetto.

