# Design Document - Analisi e Correzioni Sistema di Gioco

## Overview

Questo documento presenta il design per l'analisi completa e le correzioni del sistema di gioco "The Safe Place", basato sulla ricerca approfondita del codebase esistente. Il design identifica lo stato attuale di ogni sistema, le discrepanze tra documentazione e implementazione, e propone soluzioni concrete per migliorare l'esperienza utente.

## Architecture

### Sistema Attuale Identificato

Il gioco utilizza un'architettura React moderna con:
- **Context Pattern**: GameProvider centralizza tutto lo stato
- **Hook Pattern**: useKeyboardCommands gestisce input unificato
- **Screen-based Navigation**: Sistema di schermate dedicate (no popup)
- **Rules System**: Sistema D&D completo con skill check e meccaniche
- **Message System**: Sistema narrativo avanzato con 25+ MessageType

### Componenti Chiave Analizzati

1. **Sistema D&D**: Completamente implementato in `src/rules/`
2. **Sistema Messaggi**: Implementato in `src/data/MessageArchive.ts`
3. **Inventario**: Schermata dedicata in `src/components/InventoryScreen.tsx`
4. **Mappa e Biomi**: Gestiti in `src/components/MapViewport.tsx`
5. **Input Management**: Centralizzato in `src/hooks/useKeyboardCommands.ts`

## Components and Interfaces

### 1. Sistema D&D - Stato Attuale

**Implementazione Completa Identificata:**
- ✅ **Character Generator**: Metodo "4d6 drop lowest" implementato
- ✅ **Mechanics**: Modificatori, skill check, danni, guarigione
- ✅ **Types**: Interfacce complete per statistiche e schede
- ✅ **Movement Integration**: Integrazione con movimento e terreni

**Funzionalità Verificate:**
- Generazione personaggio con 6 statistiche D&D
- Calcolo modificatori: `Math.floor((stat - 10) / 2)`
- Skill check: D20 + modificatore vs difficoltà
- Sistema HP, AC, Carry Capacity
- Integrazione con attraversamento fiumi

### 2. Mappatura Biomi - Analisi Dettagliata

**Biomi Identificati nella Mappa:**
- `.` - Pianura (terreno normale)
- `F` - Foreste (aree boscose)
- `M` - Montagne (impassabili)
- `~` - Fiumi (skill check richiesto)
- `V` - Villaggi (centri abitati)
- `C` - Città (aree urbane)
- `S` - Start (punto partenza)
- `E` - End (destinazione finale)
- `R` - **CONFERMATO: Rifugio/Riposo** (non Risorse)

**Stato Messaggi Biomi:**
- ✅ Tutti i biomi hanno messaggi in `MessageArchive.ts`
- ✅ Sistema fallback per biomi non mappati
- ⚠️ Bioma `R` ha messaggi ma logica non implementata

### 3. Sistema Messaggi - Analisi Completa

**Stato Attuale Verificato:**
- ✅ 25 MessageType implementati
- ✅ 150+ messaggi narrativi unici
- ✅ Sistema colori parzialmente implementato
- ⚠️ Mancano colori distintivi per alcuni tipi
- ⚠️ Skill check fiume implementato ma messaggi non ottimizzati

**Colori Attuali Identificati:**
```css
.journal-welcome { color: #FFD700; } /* Giallo */
.journal-standard { color: #22c55e; } /* Verde */
.journal-river { color: #008888; } /* Blu acqua */
.journal-warning { color: #FFA500; } /* Arancione */
.journal-ambiance { color: #15803d; } /* Verde scuro */
```

### 4. Messaggi Montagne - Verifica

**Messaggi Attuali Identificati:**
```typescript
[MessageType.MOVEMENT_FAIL_MOUNTAIN]: [
  "Quella montagna non sembra volersi spostare.",
  "Anche con la rincorsa, non se ne parla.",
  "La montagna ti guarda con aria di sfida. Tu declini educatamente.",
  "Fisica: 1, Ottimismo: 0.",
  "Le leggi della gravità sono ancora in vigore, a quanto pare.",
  "La roccia risulta essere più testarda di te.",
  "Nemmeno i supereroi attraversano le montagne a piedi."
]
```
**Risultato**: 7 messaggi (supera il target di 4-5) ✅

### 5. Sistema Inventario - Analisi UX

**Problemi Identificati:**
- ❌ Nessuna differenziazione colori per oggetti
- ❌ Indicatore selezione poco chiaro (solo background)
- ❌ Nessuna opzione di utilizzo visibile
- ❌ Azione ENTER non specificata

**Layout Attuale:**
- Griglia 2 colonne (lista oggetti + descrizione)
- Navigazione con frecce ↑↓
- Selezione con numeri 1-9
- Uscita con ESC/I

### 6. Sistema Porzioni - Non Implementato

**Stato Attuale:**
- ❌ Consumabili hanno solo `quantity`
- ❌ Nessun sistema `portions` implementato
- ❌ Utilizzo consuma intero oggetto

**Oggetti Consumabili Identificati:**
- CONS_001: Razione di cibo
- CONS_002: Bottiglia d'acqua  
- CONS_003: Bende

### 7. Tasto L (Level Up) - Non Implementato

**Stato Attuale:**
- ❌ Tasto L non gestito in `useKeyboardCommands.ts`
- ❌ Nessuna schermata LevelUpScreen
- ❌ Nessuna logica di avanzamento livello

## Data Models

### Modello Porzioni Proposto

```typescript
interface IInventorySlot {
  itemId: string;
  quantity: number;
  portions?: number; // Nuovo campo per porzioni
}

interface IConsumableItem extends IItem {
  portionsPerUnit?: number; // Porzioni per unità
  portionEffect?: number;   // Effetto per porzione
}
```

### Modello Level Up Proposto

```typescript
interface ILevelUpOptions {
  availablePoints: number;
  statBoosts: Partial<ICharacterStats>;
  newAbilities?: string[];
}
```

## Error Handling

### Problemi Identificati

1. **Colori Mancanti**: Alcuni MessageType non hanno colori CSS
2. **Skill Check Fiume**: Messaggi generici invece di specifici
3. **Inventario UX**: Feedback visivo insufficiente
4. **Porzioni**: Sistema non implementato
5. **Level Up**: Funzionalità completamente mancante

### Strategie di Gestione

1. **Fallback Graceful**: Colori di default per MessageType non mappati
2. **Validazione Input**: Controlli per slot inventario vuoti
3. **Feedback Visivo**: Indicatori chiari per azioni disponibili
4. **Backward Compatibility**: Mantenere compatibilità con sistema esistente

## Testing Strategy

### Test di Verifica Stato Attuale

1. **Test Sistema D&D**
   - Verifica generazione personaggio
   - Test skill check con varie difficoltà
   - Controllo calcolo modificatori

2. **Test Biomi e Messaggi**
   - Attraversamento di tutti i biomi
   - Verifica messaggi casuali
   - Test fallback per biomi non mappati

3. **Test Inventario**
   - Navigazione con tutti i controlli
   - Test utilizzo oggetti
   - Verifica feedback visivo

4. **Test Colori Messaggi**
   - Verifica rendering di tutti i MessageType
   - Controllo colori distintivi
   - Test leggibilità

### Test di Regressione

1. **Funzionalità Esistenti**
   - Movimento giocatore
   - Sistema tempo
   - Navigazione schermate
   - Salvataggio stato

2. **Performance**
   - Rendering mappa
   - Gestione input
   - Memoria utilizzata

### Test di Integrazione

1. **Nuove Funzionalità**
   - Sistema porzioni
   - Schermata Level Up
   - Colori migliorati
   - UX inventario

## Implementation Approach

### Fase 1: Analisi e Documentazione
- Verifica completa stato attuale
- Documentazione discrepanze
- Identificazione priorità

### Fase 2: Correzioni CSS e UX
- Implementazione colori mancanti
- Miglioramento indicatori inventario
- Ottimizzazione messaggi fiume

### Fase 3: Sistema Porzioni
- Estensione interfacce esistenti
- Logica consumo porzioni
- Aggiornamento UI inventario

### Fase 4: Schermata Level Up
- Creazione componente LevelUpScreen
- Integrazione con useKeyboardCommands
- Logica avanzamento personaggio

### Fase 5: Test e Validazione
- Test completi di tutte le modifiche
- Verifica compatibilità
- Ottimizzazione performance

## Compatibility Considerations

### Backward Compatibility
- Mantenere tutte le interfacce esistenti
- Estendere senza modificare strutture base
- Preservare salvataggi esistenti

### Browser Support
- Mantenere supporto CSS esistente
- Test su browser target
- Fallback per funzionalità avanzate

### Performance Impact
- Minimizzare overhead nuove funzionalità
- Ottimizzare rendering colori
- Cache per messaggi frequenti

## Security Considerations

### Input Validation
- Validazione slot inventario
- Controllo limiti porzioni
- Sanitizzazione input utente

### State Management
- Prevenire stati inconsistenti
- Validazione transizioni schermata
- Controllo limiti statistiche

## Conclusion

L'analisi ha rivelato un sistema di gioco robusto e ben implementato, con alcune aree che necessitano miglioramenti UX e funzionalità mancanti. Le correzioni proposte mantengono la compatibilità esistente mentre migliorano significativamente l'esperienza utente attraverso feedback visivo migliorato, sistema porzioni realistico e funzionalità di avanzamento personaggio.