# Design Document - Redesign Interfaccia Crafting Terminale

## Overview

Questo documento definisce il redesign completo dell'interfaccia crafting per renderla autentica al design terminale anni '80 di The Safe Place. L'obiettivo è trasformare l'attuale layout grafico in un'interfaccia testuale pura che rispetti la filosofia keyboard-only del gioco.

## Architecture

### Principi di Design

1. **Text-Only Interface**: Zero elementi grafici, solo testo e caratteri ASCII
2. **Single Column Layout**: Layout verticale semplice per navigazione keyboard
3. **Information Density**: Massimizzare informazioni utili per schermata
4. **Immediate Feedback**: Risposte istantanee a ogni input utente
5. **Terminal Authenticity**: Estetica autentica terminali anni '80

### Struttura Componenti

```
CraftingScreen (Redesigned)
├── Header Section (Titolo + Status)
├── Recipe List Section (Lista verticale)
├── Recipe Details Section (Dettagli ricetta selezionata)
├── Materials Status Section (Stato materiali)
└── Commands Section (Comandi disponibili)
```

## Components and Interfaces

### 1. CraftingScreen (Main Component)

**Layout Terminale Autentico:**
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                            BANCO DI LAVORO                                  ║
║                        Ricette Conosciute: 12                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  [1] Coltello Affilato                                    [DISPONIBILE]     ║
║  [2] Bende Pulite                                         [DISPONIBILE]     ║
║► [3] Trappola Semplice                                    [MANCANTI MAT.]   ║
║  [4] Armatura Rinforzata                                  [ABILITA' INSUF.] ║
║  [5] Pozione Curativa                                     [DISPONIBILE]     ║
║                                                                              ║
║──────────────────────────────────────────────────────────────────────────────║
║                                                                              ║
║  RICETTA SELEZIONATA: Trappola Semplice                                     ║
║  Descrizione: Costruisce una trappola semplice per catturare piccoli animali║
║  Risultato: Trappola Semplice x1                                            ║
║  Abilità Richiesta: Crafting Lv.3 (Hai: Lv.2) [INSUFFICIENTE]             ║
║                                                                              ║
║  MATERIALI RICHIESTI:                                                       ║
║  • Corda                    Richiesta: 1    Posseduta: 0    [MANCANTE]     ║
║  • Rottame Metallico        Richiesta: 2    Posseduta: 3    [OK]           ║
║  • Asse di Legno            Richiesta: 1    Posseduta: 1    [OK]           ║
║                                                                              ║
║──────────────────────────────────────────────────────────────────────────────║
║                                                                              ║
║  [W/S] Naviga Ricette  [ENTER] Crea Oggetto  [ESC] Torna al Rifugio        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Caratteristiche Tecniche:**
- Layout a colonna singola per navigazione semplice
- Caratteri ASCII per bordi e separatori
- Indicatori testuali per stati (DISPONIBILE, MANCANTE, etc.)
- Freccia `►` per indicare selezione corrente
- Numerazione ricette per riferimento rapido

### 2. Recipe List Section

**Formato Lista:**
```typescript
interface RecipeListItem {
  index: number;           // Numero progressivo [1], [2], etc.
  name: string;           // Nome oggetto risultante
  status: RecipeStatus;   // DISPONIBILE | MANCANTI MAT. | ABILITA' INSUF.
  isSelected: boolean;    // Se è la ricetta attualmente selezionata
}

type RecipeStatus = 
  | 'DISPONIBILE'
  | 'MANCANTI MAT.'
  | 'ABILITA\' INSUF.'
  | 'NON DISPONIBILE';
```

**Rendering:**
- Ogni ricetta su una riga con formato fisso
- Allineamento colonne per leggibilità
- Indicatore `►` per selezione corrente
- Colori phosphor per stati diversi

### 3. Recipe Details Section

**Informazioni Visualizzate:**
```typescript
interface RecipeDetails {
  name: string;              // Nome ricetta
  description: string;       // Descrizione testuale
  resultItem: string;        // Oggetto risultante
  resultQuantity: number;    // Quantità prodotta
  skillRequirement?: {       // Requisito abilità (opzionale)
    skill: string;
    required: number;
    current: number;
    sufficient: boolean;
  };
}
```

**Layout Dettagli:**
```
RICETTA SELEZIONATA: [Nome Ricetta]
Descrizione: [Descrizione completa su più righe se necessario]
Risultato: [Nome Oggetto] x[Quantità]
Abilità Richiesta: [Skill] Lv.[Required] (Hai: Lv.[Current]) [STATUS]
```

### 4. Materials Status Section

**Formato Materiali:**
```typescript
interface MaterialStatus {
  name: string;        // Nome materiale
  required: number;    // Quantità richiesta
  owned: number;       // Quantità posseduta
  sufficient: boolean; // Se è sufficiente
}
```

**Layout Materiali:**
```
MATERIALI RICHIESTI:
• [Nome Materiale]    Richiesta: [N]    Posseduta: [N]    [STATUS]
• [Nome Materiale]    Richiesta: [N]    Posseduta: [N]    [STATUS]
```

**Stati Possibili:**
- `[OK]` - Materiale sufficiente (verde)
- `[MANCANTE]` - Materiale insufficiente (rosso)

### 5. Commands Section

**Comandi Sempre Visibili:**
```
[W/S] Naviga Ricette  [ENTER] Crea Oggetto  [ESC] Torna al Rifugio
```

**Comandi Dinamici:**
- Se ricetta non craftabile: `[ENTER] Non Disponibile`
- Durante crafting: `Creazione in corso...`
- Dopo crafting: `Oggetto creato! Premi qualsiasi tasto...`

## Data Models

### CraftingScreenState

```typescript
interface CraftingScreenState {
  // UI State
  selectedRecipeIndex: number;
  isProcessing: boolean;
  lastMessage: string | null;
  
  // Data
  availableRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  materialStatuses: MaterialStatus[];
  
  // Computed
  canCraftSelected: boolean;
  totalRecipes: number;
}
```

### TerminalLayout

```typescript
interface TerminalLayout {
  // Dimensioni fisse per layout consistente
  SCREEN_WIDTH: 78;        // Caratteri per riga (standard terminale)
  HEADER_HEIGHT: 3;        // Righe per header
  RECIPE_LIST_HEIGHT: 8;   // Righe per lista ricette
  DETAILS_HEIGHT: 10;      // Righe per dettagli
  MATERIALS_HEIGHT: 6;     // Righe per materiali
  COMMANDS_HEIGHT: 3;      // Righe per comandi
  
  // Caratteri per bordi
  BORDER_CHARS: {
    TOP_LEFT: '╔';
    TOP_RIGHT: '╗';
    BOTTOM_LEFT: '╚';
    BOTTOM_RIGHT: '╝';
    HORIZONTAL: '═';
    VERTICAL: '║';
    SEPARATOR: '─';
  };
}
```

## Error Handling

### Stati di Errore

1. **Nessuna Ricetta Conosciuta**
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                            BANCO DI LAVORO                                  ║
║                        Ricette Conosciute: 0                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║                    Non conosci ancora nessuna ricetta.                      ║
║                                                                              ║
║              Esplora il mondo per trovare manuali di crafting               ║
║                o raggiungi nuovi livelli per sbloccare ricette.             ║
║                                                                              ║
║──────────────────────────────────────────────────────────────────────────────║
║                                                                              ║
║                        [ESC] Torna al Rifugio                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

2. **Errore Crafting**
```
ERRORE: Materiali insufficienti per creare questo oggetto.
Premi qualsiasi tasto per continuare...
```

3. **Crafting Riuscito**
```
SUCCESSO: Hai creato Coltello Affilato x1!
Guadagnati 15 XP. Premi qualsiasi tasto per continuare...
```

## Testing Strategy

### Unit Tests

1. **Layout Rendering**
   - Verifica formattazione corretta ASCII
   - Test allineamento colonne
   - Controllo lunghezza righe

2. **State Management**
   - Test navigazione ricette
   - Verifica aggiornamento stati
   - Controllo selezione corrente

3. **Keyboard Input**
   - Test tutti i comandi (W/S/ENTER/ESC)
   - Verifica gestione input invalidi
   - Controllo focus management

### Integration Tests

1. **Store Integration**
   - Test sincronizzazione con craftingStore
   - Verifica aggiornamento dati real-time
   - Controllo persistenza stato

2. **Game Integration**
   - Test transizione da/verso ShelterScreen
   - Verifica integrazione inventario
   - Controllo messaggi GameJournal

### Accessibility Tests

1. **Screen Reader**
   - Test lettura sequenziale contenuto
   - Verifica annunci cambi stato
   - Controllo navigazione logica

2. **Keyboard Navigation**
   - Test navigazione completa solo tastiera
   - Verifica focus visibile
   - Controllo scorciatoie

## Performance Considerations

### Ottimizzazioni

1. **Rendering**
   - Pre-calcolo layout fisso
   - Memoizzazione componenti statici
   - Update selettivo solo parti cambiate

2. **Data Processing**
   - Cache stati materiali
   - Debounce input rapidi
   - Lazy loading ricette non visibili

3. **Memory Management**
   - Cleanup listeners su unmount
   - Garbage collection stati temporanei
   - Riuso oggetti layout

### Metriche Target

- **First Render**: < 100ms
- **Input Response**: < 16ms (60fps)
- **State Update**: < 50ms
- **Memory Usage**: < 5MB aggiuntivi

## Implementation Notes

### Priorità Sviluppo

1. **Fase 1**: Layout base e navigazione
2. **Fase 2**: Integrazione dati e stati
3. **Fase 3**: Feedback e animazioni
4. **Fase 4**: Testing e ottimizzazioni

### Compatibilità

- **Browser**: Tutti i browser supportati dal gioco
- **Risoluzione**: Responsive su tutte le risoluzioni
- **Font**: Fallback completo per font monospace
- **Colori**: Supporto tema high-contrast

### Migration Strategy

1. Mantenere componenti esistenti come fallback
2. Feature flag per abilitare nuova interfaccia
3. A/B testing con utenti selezionati
4. Rollout graduale con monitoring

## Conclusion

Questo redesign trasforma completamente l'interfaccia crafting da layout grafico moderno a autentica esperienza terminale anni '80, mantenendo tutta la funzionalità esistente ma con estetica e usabilità coerenti con la filosofia del gioco.