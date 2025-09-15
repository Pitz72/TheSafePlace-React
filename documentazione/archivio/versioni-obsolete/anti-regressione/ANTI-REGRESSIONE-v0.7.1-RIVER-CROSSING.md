# 🛡️ ANTI-REGRESSIONE v0.7.1 - "River Crossing Master"

**Versione:** 0.7.1  
**Data:** 28 Agosto 2025  
**Focus:** Meccanica Doppio Movimento Fiumi  
**Criticità:** ALTA - Meccanica Core Gameplay  

---

## 🎯 **OBIETTIVO DOCUMENTO**

Questo documento serve come **guardia permanente** contro la regressione della meccanica del doppio movimento sui fiumi, ripristinata nella v0.7.1 dopo essere stata accidentalmente rimossa durante refactoring precedenti.

---

## ⚠️ **REGRESSIONE STORICA DOCUMENTATA**

### **Cosa È Successo:**
- **Versione Originale**: Meccanica doppio movimento funzionante
- **Regressione**: Persa durante migrazione da App.tsx a usePlayerMovement hook
- **Periodo**: Versioni intermedie (dettagli in analisi precedente)
- **Causa**: Semplificazione accidentale durante refactoring architetturale
- **Ripristino**: v0.7.1 - Implementazione sicura e robusta

---

## 🔒 **MECCANICA PROTETTA - DOPPIO MOVIMENTO FIUMI**

### **Comportamento Corretto (DA PRESERVARE):**

```typescript
// ✅ IMPLEMENTAZIONE CORRETTA - NON MODIFICARE
if (nextTerrain === '~') {
  if (!movementState.isInRiver) {
    // PRIMO TURNO: Entra nel fiume (stato intermedio)
    setMovementState({ 
      isExitingRiver: false, 
      isInRiver: true, 
      riverPosition: { x: nextX, y: nextY } 
    });
    addLogEntry(MessageType.MOVEMENT_ACTION_RIVER);
    advanceTime(10); // ⚠️ CRITICO: Primo turno perso
    return; // ⚠️ CRITICO: Blocca movimento
  } else {
    // SECONDO TURNO: Completa attraversamento
    setMovementState({ isExitingRiver: true, isInRiver: false, riverPosition: null });
    const success = performAbilityCheck('agilita', 15, true, MessageType.SKILL_CHECK_RIVER_SUCCESS);
    if (!success.success) {
      const damage = Math.floor(Math.random() * 4) + 1;
      updateHP(-damage);
    }
  }
}
```

### **Interfaccia Critica (DA PRESERVARE):**

```typescript
// ✅ INTERFACCIA CORRETTA - NON SEMPLIFICARE
interface MovementState {
  isExitingRiver: boolean;
  isInRiver: boolean;           // ⚠️ CRITICO per stato intermedio
  riverPosition: { x: number; y: number } | null; // ⚠️ CRITICO per tracking
}
```

---

## 🚨 **SEGNALI DI ALLARME REGRESSIONE**

### **Indicatori di Rischio ALTO:**

1. **Modifiche a `usePlayerMovement.ts`**
   - ⚠️ Qualsiasi modifica alla logica `if (nextTerrain === '~')`
   - ⚠️ Rimozione di `movementState.isInRiver`
   - ⚠️ Eliminazione del `return` nel primo turno

2. **Refactoring Sistema Movimento**
   - ⚠️ Migrazione logica movimento a altri file
   - ⚠️ Centralizzazione eccessiva nel gameStore
   - ⚠️ Semplificazione "per pulizia del codice"

3. **Modifiche Interface MovementState**
   - ⚠️ Rimozione proprietà `isInRiver` o `riverPosition`
   - ⚠️ Semplificazione a boolean singolo
   - ⚠️ "Ottimizzazioni" della struttura dati

### **Frasi Pericolose nei Commit:**
- ❌ "Semplifica logica movimento fiumi"
- ❌ "Rimuove stato intermedio non necessario"
- ❌ "Ottimizza attraversamento fiume"
- ❌ "Centralizza logica nel gameStore"
- ❌ "Pulisce codice duplicato movimento"

---

## 🧪 **TEST DI VERIFICA OBBLIGATORI**

### **Test Funzionale Manuale:**

```bash
# Test Case 1: Doppio Movimento Base
1. Avvia nuova partita
2. Naviga verso un fiume (~)
3. Premi direzione verso fiume
   ✅ ATTESO: Messaggio "Ti prepari ad attraversare il fiume"
   ✅ ATTESO: Tempo avanza di 10 minuti
   ✅ ATTESO: Posizione NON cambia (stato intermedio)
4. Premi di nuovo stessa direzione
   ✅ ATTESO: Skill check eseguito
   ✅ ATTESO: Posizione cambia (attraversamento completato)
   ✅ ATTESO: Tempo avanza ulteriormente

# Test Case 2: Interruzione Movimento
1. Entra in stato intermedio fiume (primo click)
2. Premi direzione diversa (non verso fiume)
   ✅ ATTESO: Stato intermedio resettato
   ✅ ATTESO: Movimento normale su terreno diverso

# Test Case 3: Persistenza Stato
1. Entra in stato intermedio fiume
2. Apri inventario (I)
3. Chiudi inventario
4. Premi direzione fiume
   ✅ ATTESO: Completa attraversamento (stato preservato)
```

### **Test Automatizzato (Futuro):**

```typescript
// Test unitario da implementare
describe('River Crossing Double Movement', () => {
  test('should require two key presses to cross river', () => {
    // Setup: player at river edge
    // Action 1: first key press
    // Assert: player in intermediate state, time advanced, position unchanged
    // Action 2: second key press  
    // Assert: player crossed, skill check executed, position changed
  });
});
```

---

## 📋 **CHECKLIST PRE-COMMIT**

### **Prima di Ogni Modifica a usePlayerMovement.ts:**

- [ ] **Verifica Doppio Movimento**: Test manuale attraversamento fiume
- [ ] **Controllo Stato Intermedio**: Verifica `isInRiver` funzionante
- [ ] **Test Interruzione**: Verifica reset stato su movimento diverso
- [ ] **Verifica Tempo**: Controllo avanzamento tempo corretto (2 turni)
- [ ] **Test Skill Check**: Verifica esecuzione solo al secondo turno

### **Prima di Refactoring Sistema Movimento:**

- [ ] **Documentazione Impatto**: Analisi impatto su meccanica fiume
- [ ] **Test Regressione**: Esecuzione test completi pre-modifica
- [ ] **Backup Funzionalità**: Salvataggio implementazione corrente
- [ ] **Review Obbligatorio**: Approvazione team per modifiche critiche

---

## 🔧 **PROCEDURE DI EMERGENZA**

### **Se Regressione Rilevata:**

1. **STOP Immediato**: Interrompere deploy/merge
2. **Rollback**: Ripristinare versione funzionante
3. **Analisi Root Cause**: Identificare causa specifica
4. **Fix Targeted**: Correzione mirata senza impatti collaterali
5. **Test Completo**: Verifica funzionalità prima di re-deploy

### **Contatti Emergenza:**
- **Lead Developer**: Responsabile meccaniche core
- **QA Team**: Verifica test regressione
- **Product Owner**: Decisioni priorità fix

---

## 📊 **METRICHE DI MONITORAGGIO**

### **KPI da Monitorare:**

1. **Tempo Attraversamento Medio**: Deve essere ~20 minuti (2 turni)
2. **Tasso Successo Skill Check**: Baseline da stabilire
3. **Feedback Utenti**: Segnalazioni "attraversamento troppo facile"
4. **Telemetria Movimento**: Conteggio click per attraversamento

### **Alert Automatici (Futuro):**
- Tempo attraversamento < 15 minuti (possibile regressione)
- Tasso successo skill check > 95% (possibile bypass)
- Segnalazioni utenti keyword "fiume facile"

---

## 📚 **RIFERIMENTI STORICI**

### **Documentazione Correlata:**
- `eventi-GDD.md` - Specifica originale meccanica fiume
- `CHANGELOG-v0.7.1.md` - Dettagli implementazione ripristino
- `src/hooks/usePlayerMovement.ts` - Implementazione corrente

### **Versioni di Riferimento:**
- **v0.7.1**: Implementazione corretta (GOLDEN MASTER)
- **Versioni precedenti**: Contenevano regressione (NON usare come riferimento)

---

## 🎯 **CONCLUSIONI**

La meccanica del doppio movimento sui fiumi è **CRITICA** per l'esperienza di gioco e la strategia temporale. Questa documentazione serve come **guardia permanente** contro future regressioni accidentali.

### **Regola d'Oro:**
> **"Se tocchi il movimento sui fiumi, testa il doppio click"**

### **Principio Fondamentale:**
> **"Due pressioni = Due turni = Strategia preservata"**

---

**⚠️ QUESTO DOCUMENTO È PARTE INTEGRANTE DEL PROCESSO DI SVILUPPO**  
**📋 CONSULTAZIONE OBBLIGATORIA PRIMA DI MODIFICHE AL SISTEMA MOVIMENTO**

---

*Documento di Protezione Anti-Regressione*  
*The Safe Place Development Team - Runtime Radio*  
*Versione: 1.0 - Status: ATTIVO*