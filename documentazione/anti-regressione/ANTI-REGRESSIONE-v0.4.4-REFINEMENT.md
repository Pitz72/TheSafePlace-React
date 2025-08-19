# ANTI-REGRESSIONE v0.4.4 "REFINEMENT"
## The Safe Place - Protezione Gameplay Loop Completo

**Data Creazione**: 19 Agosto 2025  
**Versione Protetta**: v0.4.4 "Refinement"  
**Tipo**: Gameplay Loop Completo  
**Criticità**: MASSIMA - Core Game Systems

---

## 🛡️ **SISTEMI CRITICI DA PROTEGGERE**

### **🔄 Sistema Manipolazione Inventario - CRITICO**

#### **Funzione `addItem(itemId: string, quantity: number = 1): boolean`**
```typescript
// PROTEZIONE CRITICA - NON MODIFICARE SENZA TESTING COMPLETO
const addItem = useCallback((itemId: string, quantity: number = 1) => {
  const item = items[itemId];
  if (!item) {
    addLogEntry(MessageType.ACTION_FAIL, { reason: 'oggetto non trovato' });
    return false;
  }
  
  setCharacterSheet(prev => {
    const newInventory = [...prev.inventory];
    
    // LOGICA STACKABLE - CRITICA PER GAMEPLAY
    if (item.stackable) {
      for (let i = 0; i < newInventory.length; i++) {
        const slot = newInventory[i];
        if (slot && slot.itemId === itemId) {
          newInventory[i] = {
            ...slot,
            quantity: slot.quantity + quantity
          };
          addLogEntry(MessageType.ITEM_FOUND, { 
            item: item.name, 
            quantity: quantity,
            total: slot.quantity + quantity 
          });
          return { ...prev, inventory: newInventory };
        }
      }
    }
    
    // RICERCA SLOT VUOTO - CRITICA PER FUNZIONALITÀ
    for (let i = 0; i < newInventory.length; i++) {
      if (!newInventory[i]) {
        newInventory[i] = {
          itemId: itemId,
          quantity: quantity
        };
        addLogEntry(MessageType.ITEM_FOUND, { 
          item: item.name, 
          quantity: quantity 
        });
        return { ...prev, inventory: newInventory };
      }
    }
    
    // INVENTARIO PIENO - GESTIONE CRITICA
    addLogEntry(MessageType.INVENTORY_FULL, { item: item.name });
    return prev;
  });
  return true;
}, [items, addLogEntry]);
```

**⚠️ REGOLE ANTI-REGRESSIONE:**
- **MAI** modificare la logica stackable senza test completi
- **MAI** cambiare l'ordine di ricerca slot (stackable prima, poi vuoti)
- **SEMPRE** mantenere il return boolean per feedback
- **SEMPRE** preservare i messaggi journal specifici

#### **Funzione `removeItem(slotIndex: number, quantity: number = 1)`**
```typescript
// PROTEZIONE CRITICA - GESTIONE QUANTITÀ ESSENZIALE
const removeItem = useCallback((slotIndex: number, quantity: number = 1) => {
  setCharacterSheet(prev => {
    const slot = prev.inventory[slotIndex];
    if (!slot) return prev;
    
    const item = items[slot.itemId];
    const newInventory = [...prev.inventory];
    
    // LOGICA QUANTITÀ - CRITICA PER CONSISTENZA
    if (slot.quantity <= quantity) {
      // Rimozione completa
      newInventory[slotIndex] = null;
      addLogEntry(MessageType.ACTION_SUCCESS, { 
        action: `Hai rimosso: ${item?.name || 'oggetto sconosciuto'}` 
      });
    } else {
      // Decremento quantità
      newInventory[slotIndex] = {
        ...slot,
        quantity: slot.quantity - quantity
      };
      addLogEntry(MessageType.ACTION_SUCCESS, { 
        action: `Hai rimosso: ${item?.name || 'oggetto sconosciuto'} x${quantity}` 
      });
    }
    
    return { ...prev, inventory: newInventory };
  });
}, [items, addLogEntry]);
```

**⚠️ REGOLE ANTI-REGRESSIONE:**
- **MAI** modificare la logica di confronto quantità
- **SEMPRE** impostare slot a null quando quantità = 0
- **SEMPRE** preservare i messaggi con nome oggetto
- **MAI** permettere quantità negative

### **⚔️ Sistema Equipaggiamento - CRITICO**

#### **Estensione ICharacterSheet**
```typescript
// PROTEZIONE CRITICA - STRUTTURA DATI FONDAMENTALE
export interface ICharacterSheet {
  name: string;
  level: number;
  stats: ICharacterStats;
  maxHP: number;
  currentHP: number;
  armorClass: number;
  carryCapacity: number;
  inventory: (IInventorySlot | null)[];
  experience: IExperience;
  // CAMPI CRITICI - NON RIMUOVERE MAI
  equippedWeapon: IInventorySlot | null;
  equippedArmor: IInventorySlot | null;
}
```

**⚠️ REGOLE ANTI-REGRESSIONE:**
- **MAI** rimuovere i campi equippedWeapon/equippedArmor
- **SEMPRE** mantenere il tipo IInventorySlot | null
- **MAI** cambiare i nomi dei campi senza migration completa

#### **Funzione equipItemFromInventory() Migliorata**
```typescript
// PROTEZIONE CRITICA - SWAP EQUIPAGGIAMENTO COMPLESSO
const equipItemFromInventory = useCallback((slotIndex: number) => {
  const slot = characterSheet.inventory[slotIndex];
  if (!slot) {
    addLogEntry(MessageType.ACTION_FAIL, { reason: 'slot vuoto' });
    return;
  }
  
  const item = items[slot.itemId];
  if (!item) {
    addLogEntry(MessageType.ACTION_FAIL, { reason: 'oggetto non trovato' });
    return;
  }
  
  // CONTROLLO TIPO - CRITICO PER SICUREZZA
  if (item.type !== 'WEAPON' && item.type !== 'ARMOR') {
    addLogEntry(MessageType.ACTION_FAIL, { reason: 'questo oggetto non può essere equipaggiato' });
    return;
  }
  
  setCharacterSheet(prev => {
    const newInventory = [...prev.inventory];
    let newEquippedWeapon = prev.equippedWeapon;
    let newEquippedArmor = prev.equippedArmor;
    
    // LOGICA SWAP - CRITICA PER FUNZIONALITÀ
    if (item.type === 'WEAPON') {
      if (newEquippedWeapon) {
        // Trova slot vuoto per arma precedente
        for (let i = 0; i < newInventory.length; i++) {
          if (!newInventory[i]) {
            newInventory[i] = newEquippedWeapon;
            break;
          }
        }
      }
      newEquippedWeapon = slot;
    } else if (item.type === 'ARMOR') {
      if (newEquippedArmor) {
        // Trova slot vuoto per armatura precedente
        for (let i = 0; i < newInventory.length; i++) {
          if (!newInventory[i]) {
            newInventory[i] = newEquippedArmor;
            break;
          }
        }
      }
      newEquippedArmor = slot;
    }
    
    // RIMOZIONE DA INVENTARIO - CRITICA
    newInventory[slotIndex] = null;
    
    return {
      ...prev,
      inventory: newInventory,
      equippedWeapon: newEquippedWeapon,
      equippedArmor: newEquippedArmor
    };
  });
}, [characterSheet, items, addLogEntry]);
```

**⚠️ REGOLE ANTI-REGRESSIONE:**
- **MAI** modificare la logica di swap senza test completi
- **SEMPRE** controllare tipo oggetto prima di equipaggiare
- **SEMPRE** trovare slot vuoto per oggetto precedente
- **MAI** perdere oggetti durante lo swap

### **🏠 Sistema Rifugi Visitati - CRITICO**

#### **Sistema visitedShelters**
```typescript
// PROTEZIONE CRITICA - TRACKING RIFUGI UNICI
const [visitedShelters, setVisitedShelters] = useState<Record<string, boolean>>({});

// LOGICA CONTROLLO RIFUGIO - CRITICA PER GAMEPLAY
if (newBiome === 'R') {
  const shelterKey = `${playerPosition.x},${playerPosition.y}`;
  
  // CONTROLLO VISITA - CRITICO PER PREVENIRE EXPLOIT
  if (visitedShelters[shelterKey]) {
    setTimeout(() => {
      addLogEntry(MessageType.ACTION_FAIL, { 
        reason: 'hai già perquisito a fondo questo rifugio. Non c\'è altro da trovare' 
      });
    }, 100);
    return;
  }
  
  // MARCATURA VISITATO - CRITICA PER PERSISTENZA
  setVisitedShelters(prev => ({ ...prev, [shelterKey]: true }));
}
```

**⚠️ REGOLE ANTI-REGRESSIONE:**
- **MAI** modificare il formato della chiave `${x},${y}`
- **SEMPRE** controllare visitedShelters prima dell'accesso
- **SEMPRE** marcare rifugio come visitato PRIMA dell'investigazione
- **MAI** permettere reset del tracking senza intento esplicito

### **🎲 Sistema Loot Bilanciato - CRITICO**

#### **Pool Oggetti e Probabilità**
```typescript
// PROTEZIONE CRITICA - BILANCIAMENTO GAMEPLAY
const itemPools = {
  consumable: ['CONS_001', 'CONS_002', 'CONS_003', 'CONS_004', 'CONS_005'], // 40%
  crafting: ['CRAFT_001', 'CRAFT_002'], // 20%
  weapon: ['WEAP_001', 'WEAP_002'], // 15%
  armor: ['ARMOR_001', 'ARMOR_002'], // 15%
  medical: ['MED_001', 'MED_002'] // 10%
};

// LOGICA PROBABILITÀ - CRITICA PER BILANCIAMENTO
const typeRoll = Math.random();
let selectedPool: string[];
if (typeRoll < 0.4) selectedPool = itemPools.consumable;
else if (typeRoll < 0.6) selectedPool = itemPools.crafting;
else if (typeRoll < 0.75) selectedPool = itemPools.weapon;
else if (typeRoll < 0.9) selectedPool = itemPools.armor;
else selectedPool = itemPools.medical;
```

**⚠️ REGOLE ANTI-REGRESSIONE:**
- **MAI** modificare le probabilità senza testing gameplay
- **SEMPRE** mantenere la somma delle probabilità = 100%
- **MAI** rimuovere pool senza sostituzione equivalente
- **SEMPRE** testare bilanciamento dopo modifiche

---

## 🧪 **SCENARI DI TEST CRITICI**

### **Test Regressione Inventario**
```typescript
// TEST CRITICO 1: addItem con oggetti stackable
// 1. Inventario vuoto
// 2. Aggiungi CONS_001 x2
// 3. Aggiungi CONS_001 x3
// 4. Verifica: slot[0] = {itemId: 'CONS_001', quantity: 5}

// TEST CRITICO 2: addItem con inventario pieno
// 1. Riempi tutti i 10 slot
// 2. Tenta addItem
// 3. Verifica: return false + messaggio INVENTORY_FULL

// TEST CRITICO 3: removeItem con quantità parziale
// 1. Slot con quantity: 5
// 2. removeItem(index, 2)
// 3. Verifica: quantity = 3, slot non null

// TEST CRITICO 4: removeItem con quantità completa
// 1. Slot con quantity: 3
// 2. removeItem(index, 3)
// 3. Verifica: slot = null
```

### **Test Regressione Equipaggiamento**
```typescript
// TEST CRITICO 5: Swap arma
// 1. Equipaggia WEAP_001
// 2. Equipaggia WEAP_002
// 3. Verifica: WEAP_001 torna in inventario, WEAP_002 equipaggiata

// TEST CRITICO 6: Equipaggiamento oggetto non valido
// 1. Tenta equipaggiare CONS_001
// 2. Verifica: messaggio errore, nessun cambiamento stato

// TEST CRITICO 7: Swap con inventario pieno
// 1. Inventario pieno, arma equipaggiata
// 2. Tenta equipaggiare nuova arma
// 3. Verifica: comportamento definito (errore o sovrascrittura)
```

### **Test Regressione Rifugi**
```typescript
// TEST CRITICO 8: Rifugio già visitato
// 1. Visita rifugio (0,0)
// 2. Esci e rientra
// 3. Verifica: messaggio "già perquisito"

// TEST CRITICO 9: Rifugi diversi
// 1. Visita rifugio (0,0)
// 2. Visita rifugio (1,1)
// 3. Verifica: entrambi investigabili indipendentemente

// TEST CRITICO 10: Loot system
// 1. Investiga rifugio con successo
// 2. Verifica: oggetto aggiunto realmente all'inventario
// 3. Verifica: probabilità rispettate su campione grande
```

---

## 🚨 **ALERT REGRESSIONE**

### **Segnali di Pericolo**
- **Oggetti non vengono aggiunti all'inventario dopo investigazione**
- **Equipaggiamento non funziona o perde oggetti**
- **Rifugi investigabili infinite volte**
- **Quantità oggetti stackable non si sommano**
- **Slot inventario non si liberano dopo uso completo**
- **Character sheet non mostra equipaggiamento**

### **Controlli Automatici**
```typescript
// CONTROLLO CRITICO: Consistenza inventario
const validateInventoryConsistency = () => {
  // Verifica: nessun slot con quantity <= 0
  // Verifica: oggetti stackable non duplicati
  // Verifica: equipaggiamento sincronizzato
};

// CONTROLLO CRITICO: Stato rifugi
const validateShelterState = () => {
  // Verifica: visitedShelters contiene solo coordinate valide
  // Verifica: nessun rifugio "dimenticato"
};
```

---

## 📋 **CHECKLIST ANTI-REGRESSIONE**

### **Prima di Ogni Modifica**
- [ ] **Backup**: Copia di sicurezza del codice funzionante
- [ ] **Test**: Esecuzione test critici esistenti
- [ ] **Documentazione**: Lettura completa di questo documento

### **Durante la Modifica**
- [ ] **Isolamento**: Modifiche incrementali e testate
- [ ] **Logging**: Aggiunta log per debugging
- [ ] **Validazione**: Controlli input/output

### **Dopo la Modifica**
- [ ] **Test Completo**: Tutti gli scenari critici
- [ ] **Gameplay**: Test esperienza utente completa
- [ ] **Performance**: Verifica nessun degrado prestazioni
- [ ] **Documentazione**: Aggiornamento anti-regressione

---

## 🛠️ **RECOVERY PROCEDURES**

### **In Caso di Regressione Inventario**
1. **Ripristina** funzioni addItem/removeItem dalla v0.4.4
2. **Verifica** tutti i test inventario
3. **Controlla** integrazione con ShelterScreen
4. **Testa** scenari edge case

### **In Caso di Regressione Equipaggiamento**
1. **Ripristina** equipItemFromInventory dalla v0.4.4
2. **Verifica** ICharacterSheet ha campi corretti
3. **Controlla** CharacterSheetScreen visualizzazione
4. **Testa** swap equipaggiamento

### **In Caso di Regressione Rifugi**
1. **Ripristina** logica visitedShelters
2. **Verifica** integrazione updateBiome
3. **Controlla** sistema loot ShelterScreen
4. **Testa** prevenzione investigazioni multiple

---

## 🏆 **IMPORTANZA CRITICA**

### **Perché Proteggere la v0.4.4**
**La versione 0.4.4 "Refinement" rappresenta il completamento del gameplay loop fondamentale di The Safe Place. È la prima versione che offre un'esperienza di gioco completa e gratificante.**

#### **Sistemi Interconnessi**
- **Ogni sistema dipende dagli altri**
- **Una regressione può rompere l'intera esperienza**
- **Il gameplay loop è delicato e deve rimanere fluido**

#### **Qualità Raggiunta**
- **Bilanciamento perfetto** delle probabilità loot
- **User experience** ottimizzata e testata
- **Architettura robusta** e scalabile

#### **Base per il Futuro**
- **Fondamenta** per sistema combattimento
- **Struttura** per crafting avanzato
- **Framework** per espansioni future

---

**⚠️ ATTENZIONE: La v0.4.4 è una milestone critica. Ogni modifica deve essere attentamente valutata e testata per preservare la qualità raggiunta.**

---

*Documento Anti-Regressione v0.4.4 "Refinement"*  
*Protezione Gameplay Loop Completo*  
*Criticità: MASSIMA*