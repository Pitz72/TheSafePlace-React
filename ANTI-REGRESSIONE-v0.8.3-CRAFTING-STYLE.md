# DOCUMENTO ANTI-REGRESSIONE
## The Safe Place v0.8.3 - Crafting Style Omologation

**Data**: 30 Gennaio 2025  
**Versione**: 0.8.3  
**Scopo**: Prevenire regressioni nel sistema di crafting redesigned

---

## 🎯 FUNZIONALITÀ CRITICHE DA PRESERVARE

### 1. **INTERFACCIA UTENTE**

#### ✅ Layout e Stile
```typescript
// DEVE RIMANERE: Layout a 2 colonne
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div className="border border-phosphor-500"> {/* Lista ricette */}
  <div className="border border-phosphor-500"> {/* Dettagli */}
</div>

// DEVE RIMANERE: Header centralizzato
<h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright">
  BANCO DI LAVORO
</h2>

// DEVE RIMANERE: Colori phosphor-green consistenti
const RECIPE_COLORS = {
  [RecipeStatus.CRAFTABLE]: 'text-green-400',
  [RecipeStatus.MISSING_MATERIALS]: 'text-red-400', 
  [RecipeStatus.INSUFFICIENT_LEVEL]: 'text-gray-500'
};
```

#### ✅ Navigazione Tastiera
```typescript
// DEVE FUNZIONARE: Tutti questi controlli
switch (event.key) {
  case 'w': case 'W': case 'ArrowUp':    // Navigazione su
  case 's': case 'S': case 'ArrowDown':  // Navigazione giù  
  case 'Enter':                          // Crafting
  case 'Escape':                         // Uscita
}

// DEVE RIMANERE: Prevenzione conflitti input
if (event.target instanceof HTMLInputElement || 
    event.target instanceof HTMLTextAreaElement) {
  return; // Non intercettare se l'utente sta scrivendo
}
```

### 2. **SISTEMA STATUS RICETTE**

#### ✅ Enum RecipeStatus
```typescript
// NON MODIFICARE: Questi valori sono critici
enum RecipeStatus {
  CRAFTABLE = 'craftable',
  MISSING_MATERIALS = 'missing_materials', 
  INSUFFICIENT_LEVEL = 'insufficient_level'
}
```

#### ✅ Logica Calcolo Status
```typescript
// DEVE RIMANERE: Ordine di controllo priorità
const getRecipeStatus = (recipe: Recipe): RecipeStatus => {
  // 1. Prima controlla livello/skill
  if (!meetsSkillRequirement(recipe, characterSheet)) {
    return RecipeStatus.INSUFFICIENT_LEVEL;
  }
  // 2. Poi controlla materiali
  if (!canCraftRecipe(recipe, inventory, characterSheet)) {
    return RecipeStatus.MISSING_MATERIALS;
  }
  // 3. Infine craftable
  return RecipeStatus.CRAFTABLE;
};
```

### 3. **FEEDBACK VISIVO**

#### ✅ Sistema Notifiche
```typescript
// DEVE RIMANERE: State per feedback temporaneo
const [craftingFeedback, setCraftingFeedback] = useState<{
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}>({
  message: '',
  type: 'info', 
  visible: false
});

// DEVE RIMANERE: Auto-dismiss temporizzato
setTimeout(() => {
  setCraftingFeedback(prev => ({ ...prev, visible: false }));
}, 3000); // 3s per successo, 2s per errori
```

#### ✅ Messaggi Feedback
```typescript
// NON MODIFICARE: Questi messaggi sono testati
const FEEDBACK_MESSAGES = {
  SUCCESS: (itemName: string) => `✅ ${itemName} creato con successo!`,
  CRAFTING: 'Crafting in corso...',
  NO_MATERIALS: '❌ Materiali insufficienti',
  NO_LEVEL: '❌ Livello insufficiente', 
  NO_SELECTION: '❌ Nessuna ricetta selezionata',
  GENERIC_ERROR: '❌ Crafting fallito - controlla i requisiti'
};
```

### 4. **INTEGRAZIONE STORES**

#### ✅ CraftingStore Integration
```typescript
// DEVE RIMANERE: Filtro inventory per null
const inventory = (gameStore.characterSheet?.inventory || [])
  .filter((item): item is IInventorySlot => item !== null);

// DEVE RIMANERE: Sblocco automatico ricette
useEffect(() => {
  if (characterSheet) {
    const currentLevel = Math.floor(characterSheet.experience.currentXP / 100) + 1;
    craftingStore.unlockRecipesByLevel(currentLevel);
  }
}, [craftingStore, characterSheet]);
```

---

## 🚨 SCENARI DI REGRESSIONE DA EVITARE

### **Regressione 1: Perdita Navigazione Tastiera**
```typescript
// ❌ NON FARE MAI: Rimuovere event listeners
// ❌ NON FARE MAI: Cambiare key codes senza test
// ❌ NON FARE MAI: Rimuovere preventDefault()

// ✅ SEMPRE: Testare tutti i controlli dopo modifiche
const testKeyboardNavigation = () => {
  // Test W/S navigation
  // Test Arrow keys  
  // Test Enter crafting
  // Test Escape exit
};
```

### **Regressione 2: Colori Status Ricette**
```typescript
// ❌ NON FARE MAI: Cambiare colori senza aggiornare costanti
// ❌ NON FARE MAI: Hardcodare colori nei componenti

// ✅ SEMPRE: Usare costanti centralizzate
const RECIPE_COLORS = {
  [RecipeStatus.CRAFTABLE]: 'text-green-400',        // VERDE
  [RecipeStatus.MISSING_MATERIALS]: 'text-red-400',  // ROSSO  
  [RecipeStatus.INSUFFICIENT_LEVEL]: 'text-gray-500' // GRIGIO
};
```

### **Regressione 3: Feedback Crafting Mancante**
```typescript
// ❌ NON FARE MAI: Rimuovere setCraftingFeedback calls
// ❌ NON FARE MAI: Cambiare timeout senza test UX

// ✅ SEMPRE: Mantenere feedback per ogni azione
craftingStore.craftItem(selectedRecipe.id).then(success => {
  // DEVE esserci sempre feedback success/error
  setCraftingFeedback({ /* ... */ });
});
```

### **Regressione 4: Layout Rotto**
```typescript
// ❌ NON FARE MAI: Cambiare grid layout senza test responsive
// ❌ NON FARE MAI: Rimuovere border phosphor-500
// ❌ NON FARE MAI: Modificare z-index feedback senza verificare

// ✅ SEMPRE: Testare su diverse risoluzioni
// ✅ SEMPRE: Mantenere coerenza con altre schermate
```

---

## 🧪 TEST DI REGRESSIONE OBBLIGATORI

### **Test Suite 1: Navigazione**
```bash
# Test manuali da eseguire SEMPRE dopo modifiche
1. Aprire crafting screen
2. Premere W/S - verificare movimento selezione
3. Premere frecce su/giù - verificare movimento selezione  
4. Premere ESC - verificare uscita
5. Selezionare ricetta craftable e premere ENTER
6. Verificare feedback visivo appare e scompare
```

### **Test Suite 2: Status Ricette**
```bash
# Verificare colori corretti per ogni status
1. Ricetta craftable → VERDE con [OK]
2. Materiali insufficienti → ROSSO con [MAT]
3. Livello insufficiente → GRIGIO con [LV]
4. Dettagli materiali → Verde/Rosso per disponibilità
```

### **Test Suite 3: Feedback Visivo**
```bash
# Testare tutti i messaggi feedback
1. Crafting riuscito → "✅ [Oggetto] creato con successo!" (verde, 3s)
2. Materiali mancanti → "❌ Materiali insufficienti" (rosso, 2s)
3. Livello basso → "❌ Livello insufficiente" (rosso, 2s)
4. Nessuna selezione → "❌ Nessuna ricetta selezionata" (rosso, 2s)
```

### **Test Suite 4: Integrazione**
```bash
# Verificare integrazione con resto del gioco
1. Crafting consuma materiali dall'inventario
2. Crafting aggiunge oggetto all'inventario
3. Crafting assegna XP correttamente
4. GameJournal riceve notifiche crafting
5. Ricette si sbloccano automaticamente per livello
```

---

## 📋 CHECKLIST PRE-DEPLOY

### **Controlli Obbligatori**
- [ ] Tutti i test di regressione passano
- [ ] Navigazione tastiera funziona al 100%
- [ ] Colori status ricette corretti
- [ ] Feedback visivo per tutte le azioni
- [ ] Layout responsive su tutte le risoluzioni
- [ ] Nessun errore TypeScript
- [ ] Performance accettabili (< 100ms per azione)
- [ ] Coerenza stilistica con altre schermate

### **Controlli Opzionali**
- [ ] Test con molte ricette (50+)
- [ ] Test con inventario pieno
- [ ] Test con personaggio livello alto
- [ ] Test accessibilità (contrasto, navigazione)

---

## 🔧 PROCEDURE DI ROLLBACK

### **Se Regressione Critica Rilevata**
1. **Identificare** quale funzionalità è rotta
2. **Consultare** questo documento per requisiti
3. **Ripristinare** codice dalla versione funzionante
4. **Testare** con suite di regressione completa
5. **Documentare** la causa della regressione

### **File Critici da Backup**
- `src/components/CraftingScreenRedesigned.tsx`
- `src/stores/craftingStore.ts` 
- `src/index.css` (sezioni crafting)
- `public/recipes.json`

---

## 📞 CONTATTI EMERGENZA

**In caso di regressioni critiche**:
- Consultare documentazione in `.kiro/specs/crafting-ui-redesign/`
- Verificare CHANGELOG-v0.8.3 per dettagli implementazione
- Eseguire test suite completa prima di qualsiasi fix

---

**⚠️ IMPORTANTE: Questo documento DEVE essere aggiornato ad ogni modifica significativa del sistema crafting!**