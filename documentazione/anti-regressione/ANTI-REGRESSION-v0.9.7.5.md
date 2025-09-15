# DOCUMENTO ANTI-REGRESSIONE - Versione 0.9.7.5

**Progetto**: The Safe Place - React  
**Versione**: 0.9.7.5 "The True Story"  
**Data**: 2025-01-13  
**Scopo**: Prevenire regressioni nel sistema narrativo

---

## 🎯 OBIETTIVO DEL DOCUMENTO

Questo documento serve a prevenire la reintroduzione di problemi già risolti e a mantenere la stabilità del sistema narrativo semplificato implementato nella versione 0.9.7.5.

---

## ⚠️ PROBLEMI RISOLTI - NON REINTRODURRE

### 🚫 **ERRORI TYPESCRIPT CRITICI**

#### **Import Type-Only (verbatimModuleSyntax)**
```typescript
// ❌ SBAGLIATO - Causa errore TS1484
import { MainQuestEvent } from '../types/narrative';

// ✅ CORRETTO - Usa import type
import type { MainQuestEvent } from '../types/narrative';
```
**Regola**: Sempre usare `import type` per tipi che non vengono utilizzati a runtime.

#### **Proprietà Store Inesistenti**
```typescript
// ❌ SBAGLIATO - Proprietà non esistono
characterStore.thirst
characterStore.hunger
characterStore.health
timeStore.daysPassed

// ✅ CORRETTO - Proprietà corrette
survivalState.thirst
survivalState.hunger
characterSheet.currentHP
timeState.day
```
**Regola**: Verificare sempre l'esistenza delle proprietà negli store prima dell'uso.

#### **Import React Hooks Mancanti**
```typescript
// ❌ SBAGLIATO - Hook non importati
import React from 'react';
// Usa useState, useEffect senza import

// ✅ CORRETTO - Import espliciti
import React, { useState, useEffect } from 'react';
```
**Regola**: Importare esplicitamente tutti gli hook React utilizzati.

#### **Variabili Non Utilizzate**
```typescript
// ❌ SBAGLIATO - Variabili dichiarate ma non usate
const { mainQuestEvents, incrementProgress, setFlag } = useNarrativeStore();
// Solo currentStage viene utilizzato

// ✅ CORRETTO - Solo variabili necessarie
const { currentStage } = useNarrativeStore();
```
**Regola**: Rimuovere sempre le variabili non utilizzate per evitare warning TypeScript.

---

## 🏗️ ARCHITETTURA - PRINCIPI DA MANTENERE

### **Sistema Narrativo Semplificato**

#### **✅ MANTIENI QUESTA STRUTTURA**
```typescript
interface NarrativeState {
  currentStage: number;           // Stage corrente main quest
  progressCounter: number;        // Contatore progresso
  flags: Record<string, boolean>; // Flag booleani semplici
  mainQuestEvents: MainQuestEvent[]; // Eventi canonici
}
```

#### **🚫 NON REINTRODURRE MAI**
```typescript
// ❌ Sistema complesso rimosso
interface ComplexNarrativeState {
  moralChoices: MoralChoice[];
  emotionalStates: EmotionalState[];
  loreFragments: LoreFragment[];
  characterReflections: Reflection[];
  // ... altra complessità
}
```
**Motivo**: La complessità eccessiva rendeva il sistema ingestibile e difficile da debuggare.

### **Store Integration Pattern**

#### **✅ PATTERN CORRETTO**
```typescript
// Accesso specializzato agli store
const survivalState = useSurvivalStore(state => state.survivalState);
const timeState = useTimeStore(state => state.timeState);
const characterSheet = useCharacterStore(state => state.characterSheet);

// Uso delle proprietà corrette
if (survivalState.thirst < 30 && timeState.day > 5) {
  // Logica trigger
}
```

#### **🚫 PATTERN SBAGLIATO**
```typescript
// ❌ Accesso diretto a proprietà inesistenti
if (characterStore.thirst < 30 && timeStore.daysPassed > 5) {
  // Questo causerà errori runtime
}
```

---

## 🔍 CHECKLIST ANTI-REGRESSIONE

### **Prima di ogni commit, verificare:**

#### **TypeScript Compilation**
```bash
npx tsc --noEmit
```
- [ ] Nessun errore TypeScript
- [ ] Tutti gli import sono corretti
- [ ] Nessuna variabile non utilizzata

#### **Import Statements**
- [ ] `import type` per tutti i tipi
- [ ] Import espliciti per React hooks
- [ ] Nessun import di store non utilizzati

#### **Store Access**
- [ ] Uso corretto di `survivalState` per fame/sete/salute
- [ ] Uso corretto di `timeState` per dati temporali
- [ ] Uso corretto di `characterSheet` per dati personaggio

#### **Component Props**
- [ ] Interfacce props aggiornate
- [ ] Nessuna prop non utilizzata
- [ ] Type safety mantenuto

---

## 🧪 TEST DI REGRESSIONE

### **Test Automatici da Eseguire**

#### **1. Compilation Test**
```bash
# Deve passare senza errori
npx tsc --noEmit
```

#### **2. Import Resolution Test**
```bash
# Verificare che tutti i moduli si importino
node -e "require('./src/stores/narrativeStore');"
```

#### **3. Store Integration Test**
```typescript
// Test manuale - verificare in console browser
const narrative = useNarrativeStore.getState();
console.log('Current stage:', narrative.currentStage);
console.log('Progress:', narrative.progressCounter);
```

---

## 📋 PROCEDURE DI SVILUPPO

### **Quando Modifichi il Sistema Narrativo**

1. **Prima della modifica**:
   - Esegui `npx tsc --noEmit`
   - Documenta lo stato attuale

2. **Durante la modifica**:
   - Mantieni la semplicità del design
   - Non aggiungere complessità non necessaria
   - Usa sempre TypeScript strict mode

3. **Dopo la modifica**:
   - Esegui nuovamente `npx tsc --noEmit`
   - Testa l'integrazione con altri store
   - Verifica che l'UI funzioni correttamente

### **Quando Aggiungi Nuovi Eventi**

1. **Struttura Evento**:
   ```typescript
   {
     "id": "unique_id",
     "stage": number,
     "title": "Titolo Evento",
     "description": "Descrizione semplice",
     "triggerConditions": {
       // Condizioni semplici e verificabili
     }
   }
   ```

2. **Validazione**:
   - ID univoco
   - Stage sequenziale
   - Trigger conditions verificabili
   - Nessuna logica complessa

---

## 🚨 SEGNALI DI ALLARME

### **Indicatori di Possibile Regressione**

- ❌ Errori TypeScript durante la compilazione
- ❌ Import che falliscono
- ❌ Proprietà undefined negli store
- ❌ Componenti che non renderizzano
- ❌ Console errors nel browser
- ❌ Performance degradation

### **Azioni Immediate**

1. **Stop Development**: Ferma immediatamente lo sviluppo
2. **Rollback**: Torna all'ultimo commit funzionante
3. **Analisi**: Identifica la causa del problema
4. **Fix**: Applica la correzione seguendo questo documento
5. **Test**: Verifica che il problema sia risolto
6. **Document**: Aggiorna questo documento se necessario

---

## 📚 RIFERIMENTI

### **File Critici da Monitorare**
- `src/stores/narrativeStore.ts` - Store principale
- `src/components/narrative/NarrativeManager.tsx` - Manager eventi
- `src/components/narrative/NarrativeScreen.tsx` - UI principale
- `src/services/mainQuestTrigger.ts` - Logica trigger
- `src/data/main_quest_events.json` - Database eventi

### **Documentazione Correlata**
- `CHANGELOG-v0.9.7.5.md` - Modifiche di questa versione
- `GDD-Narrative.md` - Specifiche del sistema narrativo
- `package.json` - Dipendenze e versione

---

## 🔄 AGGIORNAMENTO DOCUMENTO

**Ultima modifica**: 2025-01-13  
**Prossima revisione**: Ad ogni major release  
**Responsabile**: Team Development

**Nota**: Questo documento deve essere aggiornato ogni volta che si risolve un nuovo tipo di problema per prevenire regressioni future.