# Guida Troubleshooting - Sistema di Crafting

**Versione**: 0.8.5 - Crafting Full and Real Integration  
**Ultima Modifica**: 30 Agosto 2025

---

## 🚨 Problemi Critici

### **Sistema Non Inizializza**

#### **Sintomi**
- Schermata crafting vuota
- Nessuna ricetta disponibile
- Errore "Recipes not loaded"

#### **Diagnosi**
```javascript
// In console browser
console.log(useCraftingStore.getState())
```

#### **Soluzioni**
1. **Reload Ricette**
   ```javascript
   craftingStore.reloadRecipes()
   ```

2. **Reset Completo**
   ```javascript
   craftingStore.recoverFromCorruptedData()
   ```

3. **Verifica Network**
   - Controllare che `public/recipes.json` sia accessibile
   - Verificare console per errori 404

### **Crash Durante Crafting**

#### **Sintomi**
- Errore "Maximum update depth exceeded"
- Freeze dell'interfaccia
- Loop infiniti

#### **Diagnosi**
```javascript
// Abilita debug logging
localStorage.setItem('debug-crafting', 'true')
// Ricarica pagina e riprova
```

#### **Soluzioni**
1. **Immediate Fix**
   ```javascript
   // Reset stato UI
   craftingStore.closeCrafting()
   craftingStore.openCrafting()
   ```

2. **Deep Fix**
   ```javascript
   craftingStore.validateCraftingData()
   ```

---

## ⚠️ Problemi Comuni

### **Ricette Non Si Sbloccano**

#### **Sintomi**
- Manuali usati ma ricette non disponibili
- Level up senza nuove ricette
- Ricette starter mancanti

#### **Diagnosi**
```javascript
const state = useCraftingStore.getState()
console.log('Known Recipes:', state.knownRecipeIds)
console.log('Character Level:', useGameStore.getState().characterSheet.level)
```

#### **Soluzioni**
1. **Sync Manuale**
   ```javascript
   craftingStore.syncWithGameStore()
   ```

2. **Re-apply Starter Kit**
   ```javascript
   craftingStore.unlockStarterRecipes()
   ```

3. **Force Unlock per Level**
   ```javascript
   const level = useGameStore.getState().characterSheet.level
   craftingStore.unlockRecipesByLevel(level)
   ```

### **Materiali Non Riconosciuti**

#### **Sintomi**
- "Material not found" errors
- Crafting impossibile nonostante materiali presenti
- Inventory desync

#### **Diagnosi**
```javascript
const inventory = useGameStore.getState().characterSheet.inventory
console.log('Inventory:', inventory.filter(slot => slot !== null))
```

#### **Soluzioni**
1. **Sync Inventory**
   ```javascript
   craftingStore.syncWithGameStore()
   ```

2. **Validate Materials**
   ```javascript
   // Controlla materiali validi
   const materials = Object.keys(useGameStore.getState().items)
     .filter(id => id.startsWith('CRAFT_'))
   console.log('Valid Materials:', materials)
   ```

### **Performance Lente**

#### **Sintomi**
- UI lag durante crafting
- Tempi di caricamento lunghi
- Browser freeze

#### **Diagnosi**
```javascript
// Test performance
testPerformance()
```

#### **Soluzioni**
1. **Clear Cache**
   ```javascript
   localStorage.removeItem('crafting-cache')
   location.reload()
   ```

2. **Optimize State**
   ```javascript
   craftingStore.validateCraftingData()
   ```

---

## 🔍 Strumenti di Debug

### **Console Commands**

#### **Test Suite Completa**
```javascript
testAll()  // Esegue tutti i test e genera report
```

#### **Test Specifici**
```javascript
testCrafting()      // Test funzionalità base
testPerformance()   // Test performance
testIntegration()   // Test integrazione sistemi
```

#### **Validazione Dati**
```javascript
craftingStore.validateCraftingData()  // Verifica consistenza
craftingStore.recoverFromCorruptedData()  // Recovery automatico
```

### **Debug Logging**

#### **Abilitazione**
```javascript
localStorage.setItem('debug-crafting', 'true')
// Ricarica pagina per attivare
```

#### **Disabilitazione**
```javascript
localStorage.removeItem('debug-crafting')
```

#### **Log Levels**
- **INFO**: Operazioni normali
- **WARN**: Situazioni anomale ma gestibili
- **ERROR**: Errori che richiedono attenzione

### **State Inspection**

#### **Crafting Store State**
```javascript
const craftingState = useCraftingStore.getState()
console.log({
  recipes: craftingState.recipes.length,
  knownRecipes: craftingState.knownRecipeIds.length,
  isLoading: craftingState.isLoading,
  error: craftingState.loadError
})
```

#### **Game Store State**
```javascript
const gameState = useGameStore.getState()
console.log({
  character: gameState.characterSheet?.name,
  level: gameState.characterSheet?.level,
  inventory: gameState.characterSheet?.inventory.filter(s => s !== null).length,
  knownRecipes: gameState.characterSheet?.knownRecipes?.length
})
```

---

## 🛠️ Procedure di Recovery

### **Recovery Automatico**

Il sistema include meccanismi automatici per:

#### **Dati Corrotti**
```javascript
// Automatico al caricamento
if (dataCorrupted) {
  craftingStore.recoverFromCorruptedData()
}
```

#### **Ricette Duplicate**
```javascript
// Automatico durante validazione
craftingStore.validateCraftingData()
```

#### **Sync Issues**
```javascript
// Automatico ogni 1000ms
setInterval(() => {
  craftingStore.syncWithGameStore()
}, 1000)
```

### **Recovery Manuale**

#### **Reset Completo Sistema**
```javascript
// ⚠️ ATTENZIONE: Cancella tutti i dati crafting
craftingStore.recoverFromCorruptedData()
```

#### **Reset Parziale**
```javascript
// Reset solo ricette conosciute
const gameStore = useGameStore.getState()
gameStore.characterSheet.knownRecipes = []
craftingStore.unlockStarterRecipes()
```

#### **Reinizializzazione**
```javascript
// Ricarica ricette da file
craftingStore.reloadRecipes()
```

---

## 📊 Diagnostica Avanzata

### **Performance Profiling**

#### **Memory Usage**
```javascript
// Controlla utilizzo memoria
if (performance.memory) {
  console.log({
    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
  })
}
```

#### **Timing Analysis**
```javascript
// Misura tempi operazioni
console.time('crafting-operation')
craftingStore.craftRecipe('improvised_knife')
console.timeEnd('crafting-operation')
```

### **Data Integrity Checks**

#### **Recipe Validation**
```javascript
const recipes = useCraftingStore.getState().recipes
const issues = recipes.filter(recipe => {
  return !recipe.id || !recipe.components || recipe.components.length === 0
})
console.log('Invalid Recipes:', issues)
```

#### **Material Validation**
```javascript
const materials = Object.keys(useGameStore.getState().items)
  .filter(id => id.startsWith('CRAFT_'))
const usedMaterials = new Set()

useCraftingStore.getState().recipes.forEach(recipe => {
  recipe.components.forEach(comp => {
    usedMaterials.add(comp.itemId)
  })
})

const missingMaterials = Array.from(usedMaterials)
  .filter(id => !materials.includes(id))
console.log('Missing Materials:', missingMaterials)
```

---

## 🚑 Soluzioni Rapide

### **Quick Fixes**

#### **Ricette Starter Mancanti**
```javascript
craftingStore.unlockStarterRecipes()
```

#### **UI Freeze**
```javascript
craftingStore.closeCrafting()
setTimeout(() => craftingStore.openCrafting(), 100)
```

#### **Inventory Desync**
```javascript
craftingStore.syncWithGameStore()
```

#### **Performance Issues**
```javascript
craftingStore.validateCraftingData()
```

### **Emergency Commands**

#### **Nuclear Reset** (Ultimo Resort)
```javascript
// ⚠️ CANCELLA TUTTO IL PROGRESSO CRAFTING
localStorage.removeItem('gameState')
localStorage.removeItem('crafting-cache')
location.reload()
```

#### **Safe Reset** (Preserva Character)
```javascript
const gameStore = useGameStore.getState()
const character = { ...gameStore.characterSheet }
character.knownRecipes = []
gameStore.characterSheet = character
craftingStore.recoverFromCorruptedData()
```

---

## 📋 Checklist Troubleshooting

### **Prima di Segnalare Bug**

- [ ] Testato in modalità incognito/privata
- [ ] Verificato con `testAll()` in console
- [ ] Controllato console per errori JavaScript
- [ ] Tentato recovery con `recoverFromCorruptedData()`
- [ ] Verificato versione browser supportata
- [ ] Raccolto log debug con `localStorage.setItem('debug-crafting', 'true')`

### **Informazioni da Includere nel Report**

- [ ] Versione gioco (v0.8.5)
- [ ] Browser e versione
- [ ] Steps per riprodurre il problema
- [ ] Console logs (F12 → Console)
- [ ] Screenshot se problema UI
- [ ] Save file se problema persistente

### **Dati Diagnostici**

```javascript
// Copia e incolla questo output nel bug report
console.log('=== DIAGNOSTIC INFO ===')
console.log('Game Version: 0.8.5')
console.log('Browser:', navigator.userAgent)
console.log('Crafting State:', useCraftingStore.getState())
console.log('Game State:', {
  character: useGameStore.getState().characterSheet?.name,
  level: useGameStore.getState().characterSheet?.level,
  inventory: useGameStore.getState().characterSheet?.inventory?.length
})
console.log('=== END DIAGNOSTIC ===')
```

---

## 🔗 Risorse Aggiuntive

### **Documentazione**
- [Guida Sistema Crafting](./CRAFTING-SYSTEM-GUIDE.md)
- [Test Suite Documentation](../../src/tests/README.md)
- [API Reference](./API-REFERENCE.md)

### **Supporto**
- **GitHub Issues**: [TheSafePlace-React/issues](https://github.com/TheSafePlace-React/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TheSafePlace-React/discussions)

### **Community**
- **Discord**: [The Safe Place Community](#)
- **Reddit**: [r/TheSafePlace](#)

---

**Documento aggiornato automaticamente**  
**The Safe Place v0.8.5 - Crafting Full and Real Integration**  
**© 2025 Runtime Radio - Simone Pizzi**