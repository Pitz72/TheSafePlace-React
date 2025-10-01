# 🐛 PROBLEMI GAMEPLAY IDENTIFICATI - 30 Settembre 2025

## 🎯 PROBLEMI CRITICI DA RISOLVERE

### 🔴 PROBLEMA #1: Eventi Random/Bioma Non Si Attivano
**Gravità**: ALTA  
**Sintomo**: Solo i 12 frammenti main quest si attivano, eventi random e bioma non triggerano  
**File Coinvolti**: 
- Sistema eventi
- Event triggers
- Biome event system

**Log Evidenza**: Eventi main quest funzionano ("Ricordo: Il Silenzio", "Ricordo: La Lezione dell'Acqua")  
**Stato**: ⏳ DA INVESTIGARE

---

### ✅ PROBLEMA #2: Esplorazione Rifugio Non Funziona - **RISOLTO!**
**Gravità**: ALTA
**Sintomo**: Comando esplorazione rifugio non restituisce output
**Errore**: `TypeError: Cannot destructure property 'x' of 'playerPosition' as it is undefined`
**File**: `ShelterScreen.tsx:232`
**Causa**: `playerPosition` preso da `useGameStore` invece di `useWorldStore`
**Soluzione**:
- Corretto import `playerPosition` da `useWorldStore`
- Corretto `timeState` da `useTimeStore`
- Corretto `updateHP` → `healDamage`
- Corretto `isEncounterCompleted` → `seenEventIds`
**Stato**: ✅ RISOLTO

---

### ✅ PROBLEMA #3: Crafting - debugLog Not Defined - **RISOLTO!**
**Gravità**: ALTA
**Sintomo**: Errore caricamento ricette nel crafting
**Errore**: `debugLog is not defined`
**Messaggio**: "Errore Caricamento Ricette - Impossibile caricare il database delle ricette"
**File Coinvolti**:
- `craftingStore.ts`
- `craftingUtils.ts`
**Causa**: `debugLog` usato ma non importato in `craftingStore.ts`
**Soluzione**: Aggiunto import `debugLog` da `craftingUtils`
**Stato**: ✅ RISOLTO

---

### 🔴 PROBLEMA #4: Attraversamento Fiume Non Funziona
**Gravità**: MEDIA  
**Sintomo**: Personaggio non attraversa mai il fiume  
**Regola Attesa**: 1 turno perso + skillcheck  
**Comportamento**: Nessuna azione quando si raggiunge il fiume  
**File Coinvolti**:
- River crossing system
- Movement system
**Stato**: ⏳ DA INVESTIGARE

---

## 📊 PRIORITÀ FIX

1. **PRIORITÀ MASSIMA**: Problema #2 (ShelterScreen crash)
2. **PRIORITÀ ALTA**: Problema #3 (Crafting debugLog)
3. **PRIORITÀ ALTA**: Problema #1 (Eventi non triggerano)
4. **PRIORITÀ MEDIA**: Problema #4 (Fiume)

---

## 🎯 PIANO DI RISOLUZIONE

### Problema #2: ShelterScreen playerPosition
**Azione**: Fix destructuring in `handleSearch`  
**Stima**: 15 minuti

### Problema #3: Crafting debugLog
**Azione**: Rimuovere/sostituire `debugLog` con logger  
**Stima**: 15 minuti

### Problema #1: Eventi Random/Bioma
**Azione**: Investigare trigger system  
**Stima**: 30-45 minuti

### Problema #4: Fiume
**Azione**: Verificare river crossing logic  
**Stima**: 30 minuti

**Tempo Totale Stimato**: 1.5-2 ore

---

*Documento creato durante test gameplay manuale*  
*Aggiornato in tempo reale durante fix*