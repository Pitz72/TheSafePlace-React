# ANALISI SISTEMA PORZIONI v0.4.1
## The Safe Place - Sistema Porzioni Consumabili Progettato

**Data Progettazione**: 2025-08-19  
**Versione**: v0.4.1 "Portion System Design"  
**Status**: ✅ SISTEMA PORZIONI PROGETTATO E PRONTO

---

## 🎯 **OBIETTIVO**

Progettazione completa di un sistema porzioni per consumabili (medicine, bevande, nutrizione) che permette un consumo realistico e graduale invece di utilizzare l'intero oggetto in una volta.

---

## 🍽️ **SISTEMA PORZIONI PROGETTATO**

### **✅ ARCHITETTURA COMPLETA DEFINITA**

Progettato sistema completo con **interfacce estese**, **logica di consumo realistica** e **compatibilità backward** con il sistema esistente.

---

## 🏗️ **ARCHITETTURA SISTEMA**

### **📋 Interfacce Estese**

#### **IItem - Campi Porzioni Aggiunti**
```typescript
// Sistema porzioni per consumabili - v0.4.1
portionsPerUnit?: number; // Quante porzioni contiene una unità
portionEffect?: number;   // Effetto per singola porzione
portionSize?: string;     // Descrizione dimensione porzione
```

#### **IConsumableItem - Interfaccia Specifica**
```typescript
export interface IConsumableItem extends IItem {
  portionsPerUnit: number;  // Obbligatorio per consumabili
  portionEffect: number;    // Obbligatorio per consumabili
  portionSize: string;      // Obbligatorio per consumabili
}
```

#### **IPortionConsumptionResult - Risultato Consumo**
```typescript
export interface IPortionConsumptionResult {
  success: boolean;
  portionsRemaining: number;
  unitsRemaining: number;
  effectApplied: number;
  message: string;
  itemConsumed: boolean;
}
```

### **🔧 Sistema di Gestione**

#### **Funzioni Core Progettate**
- `isPortionableItem()` - Identifica oggetti con porzioni
- `initializePortions()` - Inizializza porzioni per nuovi oggetti
- `consumePortion()` - Consuma una singola porzione
- `getTotalPortions()` - Calcola porzioni totali disponibili
- `getPortionDescription()` - Descrizione user-friendly

#### **Funzioni Utility**
- `addPortions()` - Aggiunge porzioni a slot esistente
- `hasPortionsAvailable()` - Verifica disponibilità
- `getRemainingUses()` - Utilizzi rimanenti
- `getTotalEffectRemaining()` - Effetto totale rimanente

---

## 🎮 **ESEMPI CONSUMABILI PROGETTATI**

### **🥤 Bottiglia d'Acqua**
```json
{
  "name": "Bottiglia d'acqua",
  "effectValue": 25,
  "portionsPerUnit": 5,
  "portionEffect": 5,
  "portionSize": "sorso"
}
```
**Comportamento**: 5 sorsi per bottiglia, ogni sorso ripristina 5 punti idratazione

### **🍖 Razione di Cibo**
```json
{
  "name": "Razione di cibo", 
  "effectValue": 25,
  "portionsPerUnit": 4,
  "portionEffect": 6,
  "portionSize": "boccone"
}
```
**Comportamento**: 4 bocconi per razione, ogni boccone ripristina 6 punti sazietà

### **🩹 Bende**
```json
{
  "name": "Bende",
  "effectValue": 10,
  "portionsPerUnit": 2,
  "portionEffect": 5,
  "portionSize": "applicazione"
}
```
**Comportamento**: 2 applicazioni per confezione, ogni applicazione cura 5 HP

---

## 🔄 **LOGICA DI CONSUMO**

### **Flusso Consumo Porzione**
```typescript
// 1. Verifica disponibilità
if (currentPortions <= 0) return failure;

// 2. Consuma una porzione
const newPortions = currentPortions - 1;
slot.portions = newPortions;

// 3. Aggiorna unità se necessario
const newUnits = Math.ceil(newPortions / item.portionsPerUnit);
slot.quantity = newUnits;

// 4. Applica effetto
const effectApplied = item.portionEffect;

// 5. Genera messaggio
const message = `Hai consumato un ${item.portionSize} di ${item.name}.`;
```

### **Gestione Unità e Porzioni**
- **Porzioni**: Traccia utilizzi individuali (sorsi, bocconi, applicazioni)
- **Unità**: Traccia oggetti fisici (bottiglie, razioni, confezioni)
- **Sincronizzazione**: Unità calcolate automaticamente dalle porzioni
- **Cleanup**: Oggetti rimossi quando porzioni = 0

---

## 📊 **ESEMPI PRATICI**

### **Scenario 1: Bottiglia d'Acqua**
```
Stato iniziale: 1 bottiglia (5 sorsi)
Consumo 1: "Hai consumato un sorso di Bottiglia d'acqua" (+5 idratazione)
Stato: 1 bottiglia (4 sorsi)
Consumo 2: "Hai consumato un sorso di Bottiglia d'acqua" (+5 idratazione)  
Stato: 1 bottiglia (3 sorsi)
...
Consumo 5: "Hai consumato un sorso di Bottiglia d'acqua" (+5 idratazione)
Stato: 0 bottiglie (0 sorsi) - OGGETTO RIMOSSO
```

### **Scenario 2: Multiple Razioni**
```
Stato iniziale: 2 razioni (8 bocconi totali)
Consumo 1-4: Consuma prima razione completamente
Stato: 1 razione (4 bocconi)
Consumo 5-6: Consuma parzialmente seconda razione
Stato: 1 razione (2 bocconi)
```

---

## 🎨 **ESPERIENZA UTENTE PROGETTATA**

### **Descrizioni Intuitive**
- **Slot Completo**: "2 unità (8 bocconi)"
- **Slot Parziale**: "1 unità (3 sorsi)"
- **Slot Quasi Vuoto**: "2 applicazioni"
- **Slot Vuoto**: "Vuoto"

### **Messaggi di Consumo**
- **Realistici**: "Hai consumato un sorso di acqua"
- **Informativi**: Effetto applicato mostrato nel journal
- **Progressivi**: Stato aggiornato in tempo reale

### **Integrazione Inventario**
- **Visualizzazione**: Porzioni mostrate accanto alle unità
- **Azioni**: Sistema opzioni compatibile con porzioni
- **Feedback**: Descrizioni aggiornate dinamicamente

---

## 🔧 **COMPATIBILITÀ E MIGRAZIONE**

### **Backward Compatibility**
- **Oggetti Esistenti**: Continuano a funzionare normalmente
- **Oggetti Non-Porzioni**: Consumo 1:1 come prima
- **Slot Esistenti**: Migrazione automatica trasparente

### **Sistema Migrazione**
```typescript
// Migrazione automatica slot esistenti
export function migrateSlotToPortions(item: IItem, slot: IInventorySlot): void {
  if (isPortionableItem(item) && slot.portions === undefined) {
    slot.portions = slot.quantity * item.portionsPerUnit;
  }
}
```

### **Conversione Oggetti**
```typescript
// Conversione oggetti esistenti in porzioni
export function convertToPortionableItem(
  item: IItem, 
  portionsPerUnit: number, 
  portionSize: string
): IConsumableItem
```

---

## 🧪 **SISTEMA TEST PROGETTATO**

### **Scenari Test Definiti**
1. **Consumo Parziale**: Bottiglia acqua (3/5 sorsi)
2. **Consumo Completo**: Razione cibo (4/4 bocconi)
3. **Consumo Multi-Unità**: Bende (3 applicazioni da 2 unità)
4. **Oggetti Non-Porzioni**: Armi e armature (comportamento normale)

### **Metriche Qualità**
- **Copertura Test**: 100% funzioni core
- **Scenari Realistici**: Casi d'uso comuni
- **Edge Cases**: Slot vuoti, overflow, underflow
- **Performance**: Nessun overhead significativo

---

## 🎯 **BENEFICI PROGETTATI**

### **Realismo Gameplay**
1. **Consumo Graduale**: Non più "tutto o niente"
2. **Gestione Risorse**: Pianificazione uso consumabili
3. **Immersione**: Azioni più realistiche e credibili
4. **Strategia**: Decisioni su quando consumare porzioni

### **Qualità Tecnica**
1. **Architettura Pulita**: Interfacce ben definite
2. **Estensibilità**: Facile aggiungere nuovi consumabili
3. **Performance**: Calcoli efficienti
4. **Manutenibilità**: Codice modulare e testabile

### **Esperienza Utente**
1. **Controllo Granulare**: Consumo preciso delle risorse
2. **Feedback Ricco**: Messaggi descrittivi e informativi
3. **Interfaccia Intuitiva**: Descrizioni chiare e comprensibili
4. **Compatibilità**: Nessuna rottura funzionalità esistenti

---

## 🔮 **ESTENSIONI FUTURE PROGETTATE**

### **Tipi Porzioni Avanzate**
- **Porzioni Variabili**: Dimensioni diverse (piccolo/grande sorso)
- **Porzioni Condizionali**: Effetto basato su stato personaggio
- **Porzioni Temporali**: Effetti che durano nel tempo
- **Porzioni Combinate**: Oggetti con effetti multipli

### **Meccaniche Avanzate**
- **Deterioramento**: Porzioni che perdono efficacia nel tempo
- **Concentrazione**: Porzioni più potenti se consumate insieme
- **Diluizione**: Porzioni meno efficaci se consumate rapidamente
- **Sinergie**: Combinazioni di porzioni con bonus

### **Interfaccia Avanzata**
- **Slider Porzioni**: Controllo quantità da consumare
- **Anteprima Effetti**: Mostra effetto prima del consumo
- **Raccomandazioni**: Suggerimenti su quando consumare
- **Statistiche**: Tracking consumo nel tempo

---

## 📋 **CHECKLIST PROGETTAZIONE**

- ✅ **Interfacce Estese**: IItem, IConsumableItem, IPortionConsumptionResult
- ✅ **Sistema Core**: 10+ funzioni per gestione porzioni
- ✅ **Dati Aggiornati**: Consumabili con informazioni porzioni
- ✅ **Logica Consumo**: Algoritmo realistico e robusto
- ✅ **Compatibilità**: Backward compatibility garantita
- ✅ **Sistema Migrazione**: Transizione trasparente
- ✅ **Framework Test**: 4 scenari + utilities test
- ✅ **Documentazione**: Analisi completa e dettagliata
- ✅ **Esempi Pratici**: Casi d'uso realistici
- ✅ **Estensioni Future**: Roadmap per miglioramenti

---

## 🎯 **CONCLUSIONI**

### **✅ SISTEMA PORZIONI PERFETTAMENTE PROGETTATO**

La progettazione del sistema porzioni è **completa e pronta per l'implementazione**:

1. **Architettura Solida**: Interfacce ben definite e modulari
2. **Logica Realistica**: Consumo graduale e naturale
3. **Compatibilità Garantita**: Nessuna rottura del sistema esistente
4. **Esperienza Migliorata**: Controllo granulare e feedback ricco
5. **Qualità Tecnica**: Codice pulito, testabile e performante

### **Impatto Atteso**
- **Immersione**: Azioni più realistiche e credibili
- **Strategia**: Gestione risorse più interessante
- **Controllo**: Precisione nel consumo consumabili
- **Soddisfazione**: Sistema che risponde alle aspettative

### **Stato Finale**
Il sistema porzioni è progettato per trasformare il consumo di oggetti da azione binaria (tutto/niente) a esperienza graduale e controllata, mantenendo la semplicità d'uso ma aggiungendo profondità strategica.

---

**🍽️ Il Sistema Porzioni è PROGETTATO e PRONTO per l'implementazione!**

*Architettura completa che rende il consumo consumabili realistico e strategico.*

---

*Documento generato dalla progettazione completa del sistema porzioni v0.4.1*  
*Pronto per implementazione in data 2025-08-19*