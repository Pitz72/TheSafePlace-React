# LINGUAGGIO COMUNE - SISTEMA OGGETTI

## PROBLEMA IDENTIFICATO

Attualmente il nostro motore di gioco presenta **inconsistenze terminologiche** tra i diversi sistemi:

- **DataManager**: Usa `type` per categorizzare oggetti ("weapon", "armor", "consumable")
- **EventManager**: Usa formati diversi per ricompense (`"type": "item"`, `"type": "items"`)
- **PlayerManager**: Si aspetta `items_gained` con array di oggetti
- **GameUI**: Cerca categorie per colori ma non trova corrispondenze

Questo causa:
- Errori di accesso alle proprietà (`Invalid access to property 'id'`)
- Colori degli oggetti "incasinati"
- Mancanza di feedback nelle ricompense eventi
- Difficoltà di manutenzione e sviluppo futuro

## LINGUAGGIO COMUNE PROPOSTO

### 1. STRUTTURA OGGETTO STANDARD

Ogni oggetto nel sistema DEVE seguire questa struttura:

```json
{
  "id": "unique_identifier",
  "name": "Nome Visualizzato",
  "description": "Descrizione dettagliata",
  "category": "CATEGORIA_PRINCIPALE",
  "subcategory": "sottocategoria_specifica",
  "rarity": "COMMON|UNCOMMON|RARE|EPIC|LEGENDARY",
  "weight": 1.0,
  "value": 100,
  "stackable": true,
  "max_stack": 10,
  "properties": {
    // Proprietà specifiche per categoria
  }
}
```

### 2. CATEGORIE STANDARDIZZATE

#### Categorie Principali (category)
- `WEAPON` - Armi
- `ARMOR` - Armature e protezioni
- `CONSUMABLE` - Oggetti consumabili
- `MATERIAL` - Materiali per crafting
- `AMMO` - Munizioni
- `QUEST` - Oggetti di quest
- `TOOL` - Strumenti e utilità
- `MISC` - Oggetti vari

#### Sottocategorie (subcategory)
- **WEAPON**: `melee`, `ranged`, `thrown`
- **ARMOR**: `head`, `body`, `legs`, `feet`, `hands`, `accessory`
- **CONSUMABLE**: `food`, `drink`, `medicine`, `potion`
- **MATERIAL**: `metal`, `wood`, `fabric`, `electronic`, `chemical`
- **AMMO**: `bullet`, `arrow`, `energy`
- **QUEST**: `key`, `document`, `artifact`
- **TOOL**: `repair`, `crafting`, `navigation`

### 3. FORMATO TRANSAZIONI OGGETTI

#### Per Eventi (EventManager → PlayerManager)
```json
{
  "items_gained": [
    {
      "id": "fathers_compass",
      "quantity": 1
    }
  ],
  "items_lost": [
    {
      "id": "ration_pack",
      "quantity": 2
    }
  ]
}
```

#### Per Inventario (PlayerManager)
```json
{
  "id": "fathers_compass",
  "quantity": 1,
  "instance_data": {
    "durability": 100,
    "modifications": []
  }
}
```

### 4. SISTEMA COLORI STANDARDIZZATO

#### Mapping Categoria → Colore
```gdscript
var CATEGORY_COLORS = {
  "WEAPON": Color.RED,
  "ARMOR": Color.BLUE,
  "CONSUMABLE": Color.GREEN,
  "MATERIAL": Color.YELLOW,
  "AMMO": Color.ORANGE,
  "QUEST": Color.PURPLE,
  "TOOL": Color.CYAN,
  "MISC": Color.GRAY
}
```

#### Mapping Rarità → Intensità
```gdscript
var RARITY_MULTIPLIERS = {
  "COMMON": 0.7,
  "UNCOMMON": 0.8,
  "RARE": 1.0,
  "EPIC": 1.2,
  "LEGENDARY": 1.5
}
```

### 5. API STANDARDIZZATE

#### DataManager
```gdscript
# Accesso oggetti
func get_item_data(item_id: String) -> Dictionary
func get_items_by_category(category: String) -> Array[Dictionary]
func get_items_by_subcategory(subcategory: String) -> Array[Dictionary]
func get_items_by_rarity(rarity: String) -> Array[Dictionary]

# Validazione
func validate_item_structure(item_data: Dictionary) -> bool
func get_item_color(item_id: String) -> Color
```

#### EventManager
```gdscript
# Conversione ricompense
func convert_reward_to_transaction(reward: Dictionary) -> Dictionary
func convert_penalty_to_transaction(penalty: Dictionary) -> Dictionary

# Validazione eventi
func validate_event_structure(event_data: Dictionary) -> bool
```

#### PlayerManager
```gdscript
# Transazioni oggetti
func apply_item_transaction(transaction: Dictionary) -> bool
func add_items(items: Array[Dictionary]) -> bool
func remove_items(items: Array[Dictionary]) -> bool

# Query inventario
func get_items_by_category(category: String) -> Array[Dictionary]
func get_item_count(item_id: String) -> int
```

### 6. MIGRAZIONE NECESSARIA

#### File da Aggiornare
1. **DataManager.gd**: Standardizzare API accesso oggetti
2. **EventManager.gd**: Implementare conversione ricompense
3. **PlayerManager.gd**: Unificare gestione transazioni
4. **GameUI.gd**: Usare sistema colori standardizzato
5. **Database JSON**: Convertire `type` → `category`

#### Fasi di Implementazione
1. **Fase 1**: Aggiornare strutture dati JSON
2. **Fase 2**: Implementare API standardizzate
3. **Fase 3**: Aggiornare sistemi esistenti
4. **Fase 4**: Testing e validazione
5. **Fase 5**: Cleanup codice legacy

### 7. BENEFICI ATTESI

- ✅ **Consistenza**: Linguaggio uniforme tra tutti i sistemi
- ✅ **Manutenibilità**: Codice più facile da mantenere
- ✅ **Estensibilità**: Facile aggiungere nuove funzionalità
- ✅ **Debug**: Errori più facili da identificare
- ✅ **Performance**: Meno conversioni e controlli
- ✅ **Qualità**: Meno bug e inconsistenze

### 8. REGOLE DI SVILUPPO

1. **SEMPRE** usare le categorie standardizzate
2. **MAI** creare nuovi formati senza documentazione
3. **SEMPRE** validare strutture dati in input
4. **SEMPRE** usare le API standardizzate
5. **MAI** accedere direttamente ai dati senza controlli

---

**Questo documento deve essere considerato la BIBBIA per lo sviluppo futuro del sistema oggetti.**