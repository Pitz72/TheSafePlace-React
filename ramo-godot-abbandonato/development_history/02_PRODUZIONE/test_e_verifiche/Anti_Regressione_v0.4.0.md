# 🛡️ Anti Regressione v0.4.0 "A unifying language for all things"

**Versione**: v0.4.0  
**Data Creazione**: 2024-12-19  
**Scopo**: Prevenire regressioni nelle funzionalità del Linguaggio Comune Unificato  

## 📋 Checklist Anti Regressione

### 1. **Sistema Accesso Proprietà Oggetti**

#### Test 1.1: Accesso Properties Consumabili
- [ ] Verificare che `ItemInteractionPopup.gd` acceda a `item_data.properties.effects`
- [ ] Controllare che gli effetti siano visualizzati correttamente
- [ ] Testare con oggetti che hanno `max_portions` in properties

**Comando Test**:
```gdscript
# In ItemInteractionPopup.gd, verificare:
var properties = _current_item_data.get("properties", {})
var effects = properties.get("effects", [])
```

#### Test 1.2: Accesso Properties Armi
- [ ] Verificare accesso a `item_data.properties.damage.min/max`
- [ ] Controllare accesso a `item_data.properties.maxDurability`
- [ ] Testare visualizzazione statistiche armi

**Comando Test**:
```gdscript
# Verificare struttura:
var damage_data = properties.get("damage", {})
var damage_min = damage_data.get("min", 0)
var max_durability = properties.get("maxDurability", 0)
```

#### Test 1.3: Accesso Properties Armature
- [ ] Verificare accesso a `item_data.properties.armor`
- [ ] Controllare accesso a `item_data.properties.maxDurability`
- [ ] Testare visualizzazione protezione

### 2. **Sistema Nomenclatura Standardizzata**

#### Test 2.1: Variabile `category` (NON `item_category`)
- [ ] Verificare che `PlayerManager.gd` usi solo `category`
- [ ] Controllare che `ItemInteractionPopup.gd` usi solo `category`
- [ ] Cercare eventuali occorrenze residue di `item_category`

**Comando Verifica**:
```bash
# Cercare occorrenze non volute:
grep -r "item_category" scripts/
# Risultato atteso: NESSUNA occorrenza
```

#### Test 2.2: Costante `CATEGORY_LOC`
- [ ] Verificare che `ItemInteractionPopup.gd` usi `CATEGORY_LOC`
- [ ] Controllare che non ci siano riferimenti a `ITEM_CATEGORY_LOC`

### 3. **Sistema Colori Dinamico**

#### Test 3.1: Costanti DataManager
- [ ] Verificare presenza di `CATEGORY_COLORS` in `DataManager.gd`
- [ ] Controllare presenza di `RARITY_MULTIPLIERS` in `DataManager.gd`
- [ ] Testare che tutte le categorie abbiano un colore definito

**Valori Attesi**:
```gdscript
CATEGORY_COLORS = {
    "WEAPON": Color(0.8, 0.2, 0.2),      # Rosso
    "ARMOR": Color(0.2, 0.6, 0.8),       # Blu
    "CONSUMABLE": Color(0.2, 0.8, 0.2),  # Verde
    # ... altri colori
}
```

#### Test 3.2: Funzione `get_item_color()`
- [ ] Verificare che `DataManager.get_item_color()` esista
- [ ] Testare che restituisca Color valido per oggetti esistenti
- [ ] Verificare che restituisca Color.WHITE per oggetti inesistenti
- [ ] Controllare che applichi moltiplicatori rarità

**Test Funzionale**:
```gdscript
# Test in console Godot:
var color = DataManager.get_item_color("water_dirty")
print(color) # Dovrebbe essere verde con moltiplicatore COMMON
```

#### Test 3.3: Integrazione UI
- [ ] Verificare che `GameUI.gd` usi `DataManager.get_item_color()`
- [ ] Controllare che l'inventario mostri colori corretti
- [ ] Testare che i colori cambino in base a categoria e rarità

### 4. **Sistema Transazioni Oggetti**

#### Test 4.1: Funzione `apply_item_transaction()`
- [ ] Verificare che `PlayerManager.apply_item_transaction()` esista
- [ ] Testare transazione con solo aggiunta oggetti
- [ ] Testare transazione con solo rimozione oggetti
- [ ] Testare transazione mista (aggiunta + rimozione)

**Test Funzionale**:
```gdscript
# Test transazione semplice:
var transaction = {
    "add": [{"id": "water_dirty", "quantity": 2}],
    "remove": [{"id": "bread_stale", "quantity": 1}]
}
var success = PlayerManager.apply_item_transaction(transaction)
print("Transazione riuscita: ", success)
```

#### Test 4.2: Gestione Errori Transazioni
- [ ] Testare transazione con oggetto inesistente
- [ ] Testare rimozione di quantità maggiore del posseduto
- [ ] Verificare che fallimenti non modifichino inventario
- [ ] Controllare logging errori

### 5. **Compatibilità File JSON**

#### Test 5.1: Struttura Properties
- [ ] Verificare che tutti i JSON abbiano sub-oggetto `properties`
- [ ] Controllare che `effects` sia dentro `properties`
- [ ] Testare che `damage`, `armor`, `durability` siano in `properties`

#### Test 5.2: Effect Types
- [ ] Verificare che tutti gli effetti usino `effect_type`
- [ ] Controllare che non ci siano `type` negli effetti
- [ ] Testare caricamento e applicazione effetti

**Comando Verifica**:
```bash
# Cercare vecchi "type" negli effetti:
grep -r '"type":' data/items/
# Verificare che siano solo in consequence_type o simili
```

### 6. **Funzionalità Core Invariate**

#### Test 6.1: Caricamento Oggetti
- [ ] Verificare che `DataManager` carichi tutti gli oggetti
- [ ] Controllare che `get_item_data()` funzioni correttamente
- [ ] Testare accesso a proprietà base (name, description, etc.)

#### Test 6.2: Inventario Player
- [ ] Testare aggiunta oggetti all'inventario
- [ ] Verificare rimozione oggetti dall'inventario
- [ ] Controllare visualizzazione inventario in UI

#### Test 6.3: Sistema Eventi
- [ ] Verificare che gli eventi si carichino correttamente
- [ ] Testare che le conseguenze usino `consequence_type`
- [ ] Controllare applicazione conseguenze eventi

## 🚨 Criteri di Fallimento

La regressione è considerata **CRITICA** se:
- [ ] Oggetti non vengono caricati correttamente
- [ ] Accesso alle proprietà genera errori
- [ ] Sistema colori non funziona
- [ ] Transazioni corrompono l'inventario
- [ ] Nomenclatura non standardizzata causa errori

## 📊 Report Template

```markdown
## Report Anti Regressione v0.4.0
**Data Test**: [DATA]
**Tester**: [NOME]
**Versione Testata**: [VERSIONE]

### Risultati:
- [ ] ✅ Sistema Accesso Proprietà: PASS/FAIL
- [ ] ✅ Nomenclatura Standardizzata: PASS/FAIL
- [ ] ✅ Sistema Colori Dinamico: PASS/FAIL
- [ ] ✅ Sistema Transazioni: PASS/FAIL
- [ ] ✅ Compatibilità JSON: PASS/FAIL
- [ ] ✅ Funzionalità Core: PASS/FAIL

### Note:
[Eventuali problemi riscontrati]

### Raccomandazioni:
[Azioni correttive se necessarie]
```

## 🔄 Frequenza Testing

- **Pre-Commit**: Test rapidi (5-10 minuti)
- **Pre-Release**: Test completi (30-45 minuti)
- **Post-Deploy**: Verifica funzionalità critiche (15 minuti)

---

**Creato da**: AI Assistant  
**Approvato da**: [Da completare]  
**Ultima Revisione**: 2024-12-19  
**Prossima Revisione**: v0.5.0