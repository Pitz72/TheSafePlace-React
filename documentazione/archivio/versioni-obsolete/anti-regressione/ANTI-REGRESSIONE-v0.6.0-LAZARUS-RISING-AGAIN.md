# ANTI-REGRESSIONE v0.6.0 "Lazarus Rising Again"

**Progetto**: The Safe Place - GDR Retrocomputazionale  
**Versione**: 0.6.0 "Lazarus Rising Again"  
**Data Creazione**: 2025-01-28  
**Stato**: ATTIVO E VINCOLANTE  

---

## 🚨 DICHIARAZIONE ANTI-REGRESSIONE

**QUESTA VERSIONE RAPPRESENTA UNA RESURREZIONE ARCHITETTONICA COMPLETA.**

La versione 0.6.0 ha risolto un bug critico che rendeva il gioco praticamente inutilizzabile: il sistema di eventi dinamici non si attivava a causa di una "schizofrenia dello stato" tra Context API e Zustand. Questo documento protegge le correzioni implementate e VIETA categoricamente qualsiasi modifica che possa reintrodurre i problemi risolti.

---

## ❌ MODIFICHE ASSOLUTAMENTE VIETATE

### **❌ ARCHITETTURA - REGRESSIONI CRITICHE**

#### **Context API - VIETATO IL RIPRISTINO**
```typescript
// ❌ VIETATO: Reintrodurre GameContext o useGameContext
// ❌ VIETATO: Creare nuovi Context per lo stato di gioco
// ❌ VIETATO: Dividere lo stato tra Context API e Zustand

// ✅ OBBLIGATORIO: Zustand come unica fonte di verità
import { useGameStore } from '../stores/gameStore';
const gameState = useGameStore(state => state);
```

#### **Selettori Instabili - VIETATO**
```typescript
// ❌ VIETATO: Selettori che creano nuovi oggetti
const badSelector = useGameStore(state => ({ 
  player: state.player,
  inventory: state.inventory 
})); // CAUSA LOOP INFINITI!

// ✅ OBBLIGATORIO: Selettori stabili
const player = useGameStore(state => state.player);
const inventory = useGameStore(state => state.inventory);
```

### **❌ SISTEMA INPUT - GESTIONE GLOBALE VIETATA**

```typescript
// ❌ VIETATO: Reintrodurre useKeyboardCommands globale
// ❌ VIETATO: Gestori di input centralizzati che causano conflitti
// ❌ VIETATO: Event listener globali per input di gioco

// ✅ OBBLIGATORIO: Input locale per ogni componente
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Logica specifica del componente
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [/* dipendenze stabili */]);
```

### **❌ RENDERING - PROBLEMI DI ALLINEAMENTO**

```typescript
// ❌ VIETATO: Separare rendering giocatore da MapViewport
// ❌ VIETATO: Logica di posizionamento duplicata
// ❌ VIETATO: Componenti Player separati

// ✅ OBBLIGATORIO: Rendering unificato in MapViewport
// Il giocatore deve essere renderizzato direttamente nella griglia
```

---

## ✅ FUNZIONALITÀ PROTETTE

### **🛡️ Architettura Zustand Unificata**

#### **Store Centralizzato**
- **File**: `src/stores/gameStore.ts`
- **Responsabilità**: Unica fonte di verità per tutto lo stato
- **Protezione**: IMMUTABILE - contiene logica di gioco, stato player, mappa, inventario

#### **Selettori Stabili**
- **Pattern**: Un selettore per proprietà specifica
- **Evitare**: Oggetti compositi che causano re-render
- **Esempio**: `useGameStore(state => state.player.position)`

### **🛡️ Sistema Eventi Dinamici Funzionante**

#### **Attivazione Eventi**
- **Stato**: Completamente funzionante dopo refactoring
- **Protezione**: Non modificare la logica di trigger eventi
- **Dipendenze**: Basata su stato Zustand coerente

#### **Prevenzione Stale State**
- **Problema Risolto**: Dati obsoleti che impedivano eventi
- **Soluzione**: Zustand garantisce stato sempre aggiornato
- **Protezione**: Non reintrodurre Context API

### **🛡️ Stabilità Runtime**

#### **Zero Loop Infiniti**
- **Problema Risolto**: "Maximum update depth exceeded"
- **Causa**: Selettori instabili e dipendenze circolari
- **Protezione**: Mantenere selettori atomici e stabili

#### **Input Robusto**
- **Architettura**: Gestione locale per ogni schermata
- **Benefici**: No conflitti, no race conditions
- **Protezione**: Non centralizzare input management

### **🛡️ Allineamento Visivo Corretto**

#### **Giocatore sulla Mappa**
- **Problema Risolto**: Disallineamento carattere @
- **Soluzione**: Rendering unificato in MapViewport
- **Protezione**: Non separare logica di posizionamento

#### **Viewport Centralizzato**
- **Hook**: `useGameScale` per dimensioni
- **Coerenza**: Tutti i componenti usano stessa fonte
- **Protezione**: Non duplicare logica viewport

---

## 🔍 CONTROLLI OBBLIGATORI

### **Pre-Commit Checklist**
- [ ] **Zustand Store**: Nessuna modifica che introduce Context API
- [ ] **Selettori**: Tutti atomici e stabili (no oggetti compositi)
- [ ] **Input Handlers**: Locali a ogni componente, no gestori globali
- [ ] **MapViewport**: Rendering giocatore integrato, no componenti separati
- [ ] **Eventi Dinamici**: Sistema di trigger funzionante

### **Test di Regressione**
- [ ] **Sistema Eventi**: Verificare attivazione eventi dinamici
- [ ] **Stabilità Rendering**: No errori "Maximum update depth"
- [ ] **Input Responsivo**: Comandi da tastiera funzionanti in tutte le schermate
- [ ] **Allineamento Visivo**: Giocatore @ allineato perfettamente sulla griglia
- [ ] **Performance**: No lag o comportamenti anomali

### **Monitoraggio Console**
- [ ] **Zero Errori**: Console pulita da errori React
- [ ] **Zero Warning**: Nessun warning su dipendenze o rendering
- [ ] **HMR Funzionante**: Hot Module Replacement senza problemi

---

## 📋 PROCEDURA DI EMERGENZA

Se vengono rilevate regressioni:

1. **STOP IMMEDIATO**: Interrompere qualsiasi modifica
2. **ROLLBACK**: Tornare all'ultimo commit stabile v0.6.0
3. **ANALISI**: Identificare la modifica che ha causato la regressione
4. **CORREZIONE**: Applicare fix mantenendo architettura Zustand
5. **VERIFICA**: Test completo prima di procedere

---

## 🔐 DICHIARAZIONE FINALE

**La versione 0.6.0 "Lazarus Rising Again" rappresenta una resurrezione completa del progetto.**

Questa versione ha salvato The Safe Place da un fallimento tecnico certo. Le modifiche implementate sono CRITICHE per la sopravvivenza del progetto e DEVONO essere protette con la massima attenzione.

**QUALSIASI REGRESSIONE CHE REINTRODUCA I PROBLEMI RISOLTI È CONSIDERATA UN FALLIMENTO CRITICO.**

---

**Documento creato**: 2025-01-28  
**Autore**: Sistema Anti-Regressione v0.6.0  
**Stato**: ATTIVO E VINCOLANTE  
**Validità**: Permanente fino a v1.0.0