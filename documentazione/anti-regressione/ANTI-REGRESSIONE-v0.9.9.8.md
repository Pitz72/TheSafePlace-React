# 🛡️ DOCUMENTO ANTI-REGRESSIONE v0.9.9.8

**Versione**: 0.9.9.8 "Fix Era Part 4"  
**Data**: 30 Settembre 2025  
**Tipo**: Critical Fixes & Stabilization  
**Stato**: ✅ PRODUCTION-READY

---

## 🚨 MODIFICHE CRITICHE DA NON REGREDIRE

### 1. API CharacterStore - IMMUTABILE ✅

**REGOLA ASSOLUTA**: `characterStore` usa SOLO queste API:
- ✅ `takeDamage(amount: number)` - Per infliggere danno
- ✅ `healDamage(amount: number)` - Per guarire
- ✅ `addStatus(status: CharacterStatus, duration: number)` - Per applicare status
- ✅ `gainExperience(amount: number)` - Per dare XP

**❌ NON USARE MAI**:
- ❌ `updateHP` - NON ESISTE PIÙ
- ❌ `applyStatus` - RINOMINATO in `addStatus`
- ❌ `addExperience` - RINOMINATO in `gainExperience`

**File Protetti**:
- [`characterStore.ts`](../../src/stores/character/characterStore.ts)
- [`eventUtils.ts`](../../src/utils/eventUtils.ts)
- [`usePlayerMovement.ts`](../../src/hooks/usePlayerMovement.ts)
- [`narrativeIntegration.ts`](../../src/services/narrativeIntegration.ts)

---

### 2. API TimeStore - IMMUTABILE ✅

**REGOLA ASSOLUTA**: Accesso DIRETTO alle proprietà:
- ✅ `timeStore.day` - Giorno corrente
- ✅ `timeStore.currentTime` - Tempo corrente
- ✅ `timeStore.hour` - Ora
- ✅ `timeStore.minute` - Minuto

**❌ NON USARE MAI**:
- ❌ `timeStore.timeState` - NON ESISTE
- ❌ `timeStore.timeState.day` - NON ESISTE

**File Protetti**:
- [`mainQuestTrigger.ts`](../../src/services/mainQuestTrigger.ts)

---

### 3. API SurvivalStore - IMMUTABILE ✅

**REGOLA ASSOLUTA**: Accesso tramite `survivalState`:
- ✅ `survivalStore.survivalState.hunger`
- ✅ `survivalStore.survivalState.thirst`
- ✅ `survivalStore.survivalState.fatigue`
- ✅ `survivalStore.survivalState.shelter`
- ✅ `survivalStore.survivalState.fire`
- ✅ `survivalStore.survivalState.waterSource`

**File Protetti**:
- [`mainQuestTrigger.ts`](../../src/services/mainQuestTrigger.ts)
- [`survivalUtils.ts`](../../src/utils/survivalUtils.ts)

---

### 4. Export System - IMMUTABILE ✅

**REGOLA ASSOLUTA**: Tutti gli export devono essere espliciti per Rollup:

**gameState.ts**:
```typescript
export interface SurvivalState {
  hunger: number;
  thirst: number;
  fatigue: number;
  shelter: boolean;
  fire: boolean;
  waterSource: boolean;
  lastNightConsumption?: { day: number; consumed: boolean };
}
```

**inventoryUtils.ts**:
```typescript
export type { IInventorySlot };
export type InventorySlot = IInventorySlot | null;
```

**Import Type Usage**:
```typescript
// ✅ CORRETTO
import type { InventorySlot } from '@/utils/inventoryUtils';

// ❌ SBAGLIATO
import { InventorySlot } from '@/utils/inventoryUtils';
```

---

### 5. ExecuteWithRetry Pattern - IMMUTABILE ✅

**REGOLA ASSOLUTA**: `executeWithRetry` accetta UN SOLO oggetto:

```typescript
// ✅ CORRETTO
return executeWithRetry({
  operation: () => { /* ... */ },
  category: GameErrorCategory.INVENTORY,
  context: { /* ... */ },
  onSuccess: () => { /* ... */ },
  onFailure: (error: Error) => { /* ... */ },
  onFallback: () => { /* ... */ }
});

// ❌ SBAGLIATO
return executeWithRetry(
  () => { /* ... */ },
  {
    onSuccess: () => { /* ... */ },
    onFailure: (error) => { /* ... */ }
  }
);
```

**File Protetti**:
- [`characterStore.ts`](../../src/stores/character/characterStore.ts)
- Tutti gli store che usano `executeWithRetry`

---

### 6. Menu Navigation - IMMUTABILE ✅

**REGOLA ASSOLUTA**: Menu è keyboard-only con doppio sistema:

1. **Navigazione**: Frecce o W/S + Enter
2. **Accesso rapido**: Lettere (N, C, I, T, O, E, R)

```typescript
// ✅ IMPLEMENTAZIONE CORRETTA
else {
  const menuItem = menuItems.find(item => item.key.toLowerCase() === key);
  if (menuItem) {
    event.preventDefault();
    menuItem.action();
  }
}
```

**File Protetto**:
- [`StartScreen.tsx`](../../src/components/StartScreen.tsx:77-107)

---

## 🔒 INVARIANTI DI SISTEMA

### Build Invariants
- ✅ Build DEVE essere pulito (0 warning, 0 errori)
- ✅ TypeScript strict mode DEVE essere attivo
- ✅ Tutti gli export DEVONO essere espliciti
- ✅ Import type DEVE essere usato per tipi

### Store Invariants
- ✅ Ogni store DEVE avere API documentate
- ✅ `executeWithRetry` DEVE usare oggetto singolo
- ✅ Tutti i parametri DEVONO essere tipizzati
- ✅ Return types DEVONO essere espliciti

### Gameplay Invariants
- ✅ Menu DEVE essere keyboard-only
- ✅ Eventi DEVONO usare API corrette (takeDamage, healDamage, addStatus, gainExperience)
- ✅ Trigger DEVONO accedere a proprietà dirette degli store

---

## 📋 CHECKLIST ANTI-REGRESSIONE

Prima di ogni commit, verificare:

### Build
- [ ] `npm run build` → 0 warning, 0 errori
- [ ] `npm run test` → Almeno 248 test passanti
- [ ] TypeScript strict mode attivo

### API Usage
- [ ] Nessun uso di `updateHP`
- [ ] Nessun uso di `applyStatus` (solo `addStatus`)
- [ ] Nessun uso di `addExperience` (solo `gainExperience`)
- [ ] Nessun accesso a `timeState` o `survivalState` nested

### Exports
- [ ] Tutti gli export sono espliciti
- [ ] Import type usato per tipi
- [ ] Nessun warning Rollup

### Gameplay
- [ ] Menu navigabile con frecce + lettere
- [ ] Boot sequence completa fino a menu
- [ ] Eventi con danno/guarigione funzionanti

---

## 🚨 SEGNALI DI REGRESSIONE

### Warning Signs
- ⚠️ Warning Rollup su export mancanti
- ⚠️ Errori TypeScript su API inesistenti
- ⚠️ Test suite fallita
- ⚠️ Menu non navigabile
- ⚠️ Boot sequence bloccata

### Azioni Immediate
1. Verificare changelog questa versione
2. Controllare file modificati
3. Ripristinare API corrette
4. Rebuild e test

---

## 📞 RIFERIMENTI

### Documentazione
- [Changelog v0.9.9.8](../changelog/CHANGELOG-v0.9.9.8.md)
- [Piano Salvataggio](../piano-salvataggio-completato/)
- [Fix Manager Gameplay](../fix-manager-gameplay/)

### File Critici
- [characterStore.ts](../../src/stores/character/characterStore.ts)
- [eventUtils.ts](../../src/utils/eventUtils.ts)
- [mainQuestTrigger.ts](../../src/services/mainQuestTrigger.ts)
- [StartScreen.tsx](../../src/components/StartScreen.tsx)

---

## 🎯 VERSIONE BASELINE

**v0.9.9.8 è la BASELINE STABILE per sviluppo futuro.**

Qualsiasi modifica deve:
1. Mantenere build pulito
2. Rispettare API documentate
3. Passare tutti i test
4. Non regredire funzionalità

---

**Creato**: 30 Settembre 2025  
**Versione Protetta**: 0.9.9.8  
**Stato**: ✅ IMMUTABILE  
**Validità**: PERMANENTE