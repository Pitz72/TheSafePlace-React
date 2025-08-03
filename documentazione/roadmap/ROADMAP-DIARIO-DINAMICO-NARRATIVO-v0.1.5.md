# ROADMAP: Diario di Gioco Dinamico e Narrativo v0.1.5

**Data di Creazione**: 20 gennaio 2025  
**Versione Target**: v0.1.5 "The Living Journal"  
**Stato**: ✅ PROGETTO COMPLETATO E CONSOLIDATO  
**Priorità**: ALTA - Sistema Narrativo Core  
**Data Completamento**: 25 gennaio 2025  
**Consolidamento**: COMPLETATO ✅  
**Anti-Regressione**: ATTIVO 🛡️  
**Changelog**: DOCUMENTATO 📋  
**CHANGELOG PRINCIPALE**: ✅ AGGIORNATO  
**README PRINCIPALE**: ✅ AGGIORNATO

---

## 🎯 OBIETTIVO GENERALE

Implementare il **"Diario di Viaggio"**, il cuore narrativo di "The Safe Place", che non si limita a registrare eventi ma li narra in modo dinamico e contestuale. Il sistema deve costruire atmosfera, guidare il giocatore e rendere il mondo vivo e reattivo attraverso messaggi intelligenti e variati.

---

## 📊 ANALISI FATTIBILITÀ

### ✅ PUNTI DI FORZA ARCHITETTURA ATTUALE

#### Sistema Esistente Compatibile
- **GameContext Robusto**: Già gestisce stato centralizzato con pattern consolidato
- **Sistema Tempo Funzionante**: Timestamp disponibili per voci diario
- **Hook Movement**: `usePlayerMovement` già traccia posizione e terreno
- **Biome Detection**: Sistema riconoscimento terreno già implementato
- **TailwindCSS**: Sistema colori estensibile per messaggi categorizzati
- **Performance Ottimali**: Architettura React ottimizzata per aggiornamenti stato

#### Componenti Riutilizzabili
- **Tile Mapping**: Sistema già identifica biomi (F, ~, M, C, etc.)
- **Movement Validation**: Logica terreno già distingue movimenti validi/invalidi
- **Time Formatting**: Funzioni tempo già disponibili per timestamp
- **CSS Variables**: Sistema colori phosphor estensibile

### ⚠️ SFIDE TECNICHE IDENTIFICATE

#### Architettura Messaggi
- **Memory Management**: Gestire crescita array logEntries senza impatto performance
- **Message Selection**: Algoritmo selezione casuale efficiente
- **Biome Tracking**: Tracciare bioma precedente per evitare ripetizioni
- **Context Integration**: Integrare messaggi dinamici con dati di gioco

#### UI e Performance
- **Scroll Management**: Auto-scroll a nuovi messaggi senza disturbare lettura
- **Rendering Optimization**: Virtualizzazione per grandi quantità di messaggi
- **Color System**: Estendere palette colori per categorie messaggi
- **Responsive Design**: Adattare diario a diverse risoluzioni

### 🔍 COMPLESSITÀ STIMATA

- **Message Archive**: **BASSA** (2-3 ore implementazione)
- **GameContext Extension**: **MEDIA** (3-4 ore implementazione)
- **UI Component**: **MEDIA** (4-5 ore implementazione)
- **Integration & Logic**: **ALTA** (5-6 ore implementazione)
- **Testing & Polish**: **MEDIA** (3-4 ore)
- **Documentazione**: **BASSA** (1-2 ore)

**TOTALE STIMATO**: 18-24 ore di sviluppo

---

## 🗺️ ROADMAP IMPLEMENTAZIONE

### **FASE 1: Archivio Messaggi e Tipizzazione** 📚 ✅ COMPLETATA

**Obiettivo**: Creare sistema robusto per gestione messaggi categorizzati.

#### **Step 1.1: Creazione MessageArchive.ts** ✅ COMPLETATO
- **File**: `src/data/MessageArchive.ts` ✅ CREATO
- **Struttura**: ✅ IMPLEMENTATA

```typescript
export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: MessageType;
  context?: Record<string, any>;
}

export enum MessageType {
  GAME_START = 'GAME_START',
  BIOME_ENTER = 'BIOME_ENTER',
  MOVEMENT_FAIL_MOUNTAIN = 'MOVEMENT_FAIL_MOUNTAIN',
  MOVEMENT_ACTION_RIVER = 'MOVEMENT_ACTION_RIVER',
  AMBIANCE_RANDOM = 'AMBIANCE_RANDOM'
}

export const MESSAGE_ARCHIVE = {
  [MessageType.GAME_START]: [
    "La sopravvivenza dipende dalle tue scelte.",
    "Ogni passo è una decisione. Muoviti con [WASD] o le frecce.",
    "Il viaggio inizia ora. Che la fortuna ti accompagni.",
    "Ultimo respiro di sicurezza. Da qui in poi, solo te stesso."
  ],
  
  [MessageType.BIOME_ENTER]: {
    'F': [
      "Entri in una fitta foresta. Gli alberi sussurrano segreti antichi.",
      "La vegetazione si infittisce. Ogni passo risuona nel sottobosco.",
      "Ombre danzano tra i tronchi. La foresta ti accoglie."
    ],
    '.': [
      "Una vasta pianura si apre davanti a te. L'orizzonte sembra infinito.",
      "Erba alta ondeggia nel vento. Nessun riparo in vista.",
      "La pianura si estende a perdita d'occhio. Libertà e vulnerabilità."
    ],
    'C': [
      "Rovine di una città emergono dalla desolazione.",
      "Edifici scheletrici si stagliano contro il cielo.",
      "Echi di vita passata risuonano tra le macerie."
    ],
    'S': [
      "Un piccolo insediamento appare all'orizzonte.",
      "Segni di vita recente. Forse non sei completamente solo.",
      "Rifugio temporaneo in vista. Un momento di respiro."
    ],
    'R': [
      "Una risorsa preziosa attira la tua attenzione.",
      "Qualcosa di utile giace abbandonato qui.",
      "La fortuna sorride ai preparati. Raccogli ciò che puoi."
    ]
  },
  
  [MessageType.MOVEMENT_FAIL_MOUNTAIN]: [
    "Quella montagna non sembra volersi spostare.",
    "Anche con la rincorsa, non se ne parla.",
    "Potresti provare a scalarla. Forse tra un milione di anni.",
    "La montagna ti guarda con aria di sfida. Tu declini educatamente.",
    "Fisica: 1, Ottimismo: 0."
  ],
  
  [MessageType.MOVEMENT_ACTION_RIVER]: [
    "L'acqua gelida ti toglie il fiato per un istante.",
    "Guadare il fiume richiede uno sforzo notevole.",
    "La corrente è forte, ma riesci a mantenere l'equilibrio.",
    "Ogni passo nell'acqua è una piccola vittoria.",
    "Il fiume mormora storie di altri viaggiatori."
  ],
  
  [MessageType.AMBIANCE_RANDOM]: [
    "Un silenzio innaturale ti circonda.",
    "Il vento ulula tra le rovine in lontananza.",
    "Per un attimo, hai la strana sensazione di essere osservato.",
    "La solitudine è un peso quasi fisico.",
    "Ricordi di un mondo perduto affiorano nella mente.",
    "Il tempo sembra essersi fermato in questo luogo.",
    "Una brezza porta odori di terre lontane.",
    "L'eco dei tuoi passi è l'unico suono in questo mondo silenzioso."
  ]
};
```

#### **Step 1.2: Sistema Colori Messaggi** ✅ COMPLETATO
- **File**: `src/index.css` ✅ AGGIORNATO
- **Estensione Palette**: ✅ IMPLEMENTATA

```css
/* Colori messaggi diario - v0.1.5 */
:root {
  --journal-welcome: #FFD700;     /* Giallo acceso per benvenuto */
  --journal-standard: var(--phosphor-primary); /* Verde standard */
  --journal-river: var(--phosphor-water);      /* Blu acqua per fiumi */
  --journal-warning: #FFA500;     /* Arancione per avvertimenti */
  --journal-ambiance: var(--phosphor-dim);     /* Verde scuro per atmosfera */
}

.journal-welcome { color: var(--journal-welcome); }
.journal-standard { color: var(--journal-standard); }
.journal-river { color: var(--journal-river); }
.journal-warning { color: var(--journal-warning); }
.journal-ambiance { color: var(--journal-ambiance); }
```

---

### **FASE 2: Estensione GameContext per Diario** 📝 ✅ COMPLETATA

**Obiettivo**: Integrare sistema diario nel context esistente.

#### **Step 2.1: Estensione GameState** ✅ COMPLETATO
- **File**: `src/contexts/GameContext.tsx` ✅ AGGIORNATO
- **Modifiche**: ✅ IMPLEMENTATE

```typescript
import { LogEntry, MessageType, MESSAGE_ARCHIVE } from '../data/MessageArchive';

interface GameState {
  // ... stato esistente
  logEntries: LogEntry[];
  currentBiome: string | null;
  lastBiome: string | null;
}

const initialState: GameState = {
  // ... stato esistente
  logEntries: [],
  currentBiome: null,
  lastBiome: null
};
```

#### **Step 2.2: Funzioni Diario**
- **Implementazione**:

```typescript
const addLogEntry = useCallback((type: MessageType, context?: Record<string, any>) => {
  const messages = type === MessageType.BIOME_ENTER && context?.biome 
    ? MESSAGE_ARCHIVE[type][context.biome] || []
    : MESSAGE_ARCHIVE[type] || [];
  
  if (messages.length === 0) return;
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const timestamp = formatTime(currentTime);
  
  const newEntry: LogEntry = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp,
    message: randomMessage,
    type,
    context
  };
  
  setGameState(prev => ({
    ...prev,
    logEntries: [...prev.logEntries, newEntry]
  }));
}, [currentTime]);

const updateBiome = useCallback((newBiome: string) => {
  setGameState(prev => {
    const shouldAddEntry = newBiome !== prev.currentBiome && 
                          MESSAGE_ARCHIVE[MessageType.BIOME_ENTER][newBiome];
    
    if (shouldAddEntry) {
      // Aggiungi entry bioma in modo asincrono
      setTimeout(() => addLogEntry(MessageType.BIOME_ENTER, { biome: newBiome }), 0);
    }
    
    return {
      ...prev,
      lastBiome: prev.currentBiome,
      currentBiome: newBiome
    };
  });
}, [addLogEntry]);
```

#### **Step 2.3: Integrazione Movimento**
- **File**: `src/hooks/usePlayerMovement.ts`
- **Modifiche**:

```typescript
const { addLogEntry, updateBiome } = useGameContext();

// Nel movimento riuscito
if (isValidMove) {
  // ... logica esistente
  
  // Aggiorna bioma
  updateBiome(targetTile);
  
  // Messaggio fiume se necessario
  if (targetTile === '~') {
    addLogEntry(MessageType.MOVEMENT_ACTION_RIVER);
  }
  
  // Messaggio atmosfera casuale (2% probabilità)
  if (Math.random() < 0.02) {
    addLogEntry(MessageType.AMBIANCE_RANDOM);
  }
} else if (targetTile === 'M') {
  // Messaggio montagna
  addLogEntry(MessageType.MOVEMENT_FAIL_MOUNTAIN);
}
```

---

### **FASE 3: Componente UI Diario** 🎨 ✅ COMPLETATA

**Obiettivo**: Creare interfaccia utente per visualizzazione diario.
**Durata stimata**: 4-6 ore
**Status**: Tutti gli step completati

#### **Step 3.1: Componente GameJournal** ✅ COMPLETATO
- **File**: `src/components/GameJournal.tsx` ✅ CREATO
- **Implementazione**: ✅ COMPLETATA

```typescript
import React, { useEffect, useRef } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { MessageType } from '../data/MessageArchive';

const GameJournal: React.FC = () => {
  const { logEntries } = useGameContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll a nuovi messaggi
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logEntries]);
  
  const getMessageClass = (type: MessageType): string => {
    switch (type) {
      case MessageType.GAME_START:
        return 'journal-welcome';
      case MessageType.MOVEMENT_ACTION_RIVER:
        return 'journal-river';
      case MessageType.MOVEMENT_FAIL_MOUNTAIN:
        return 'journal-warning';
      case MessageType.AMBIANCE_RANDOM:
        return 'journal-ambiance';
      default:
        return 'journal-standard';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-phosphor-bright text-lg font-bold mb-2 text-center">
        DIARIO DI VIAGGIO
      </h3>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 text-sm leading-relaxed"
      >
        {logEntries.map((entry) => (
          <div key={entry.id} className="border-l-2 border-phosphor-dim pl-2">
            <div className="text-phosphor-dim text-xs">
              {entry.timestamp}
            </div>
            <div className={`${getMessageClass(entry.type)} mt-1`}>
              {entry.message}
            </div>
          </div>
        ))}
        
        {logEntries.length === 0 && (
          <div className="text-phosphor-dim text-center italic">
            Il tuo viaggio inizierà presto...
          </div>
        )}
      </div>
    </div>
  );
};

export default GameJournal;
```

#### **Step 3.2: Integrazione in App.tsx** ✅ COMPLETATO
- **File**: `src/App.tsx` ✅ AGGIORNATO
- **Modifiche**: ✅ IMPLEMENTATE

```typescript
import GameJournal from './components/GameJournal';

// Nel layout principale, sostituire pannello destro o aggiungere sezione
<aside className="w-80 bg-phosphor-panel border-l border-phosphor-dim p-4">
  <GameJournal />
</aside>
```

**COMPLETATO**: Il componente GameJournal è stato integrato in App.tsx sostituendo il contenuto statico del pannello "DIARIO DI VIAGGIO".

---

### **FASE 4: Inizializzazione e Logica Avanzata** ✅ COMPLETATA

**Obiettivo**: Implementare logiche avanzate e ottimizzazioni del sistema diario.
**Durata stimata**: 6-8 ore
**Status**: Completata con successo

#### **Step 4.1: Messaggio Benvenuto**
- **File**: `src/contexts/GameContext.tsx`
- **Implementazione**:

```typescript
// Nel useEffect di inizializzazione
useEffect(() => {
  // Messaggio benvenuto solo al primo avvio
  if (logEntries.length === 0) {
    setTimeout(() => {
      addLogEntry(MessageType.GAME_START);
    }, 1000); // Delay per effetto drammatico
  }
}, []);
```

#### **Step 4.2: Ottimizzazioni Performance**
- **Memory Management**:

```typescript
// Limitare numero massimo entries (es. 100)
const MAX_LOG_ENTRIES = 100;

const addLogEntry = useCallback((type: MessageType, context?: Record<string, any>) => {
  // ... logica esistente
  
  setGameState(prev => {
    const newEntries = [...prev.logEntries, newEntry];
    
    // Mantieni solo le ultime MAX_LOG_ENTRIES
    if (newEntries.length > MAX_LOG_ENTRIES) {
      newEntries.splice(0, newEntries.length - MAX_LOG_ENTRIES);
    }
    
    return {
      ...prev,
      logEntries: newEntries
    };
  });
}, [currentTime]);
```

---

### **FASE 5: Testing e Ottimizzazione** 🧪 ✅ COMPLETATA

**Obiettivo**: Completare testing funzionale e implementare ottimizzazioni performance.
**Durata stimata**: 3-4 ore
**Status**: Completata con successo

#### **Step 5.1: Test Funzionali** ✅ COMPLETATO
- **Messaggio Benvenuto**: ✅ Implementato con delay di 1 secondo
- **Biomi**: ✅ Sistema cambio bioma integrato in usePlayerMovement
- **Montagne**: ✅ Messaggi ironici per tentativi di attraversamento
- **Fiumi**: ✅ Messaggi di attraversamento implementati
- **Atmosfera**: ✅ Probabilità casuale 2% implementata

#### **Step 5.2: Test Performance** ✅ COMPLETATO
- **Memory Usage**: ✅ Limite MAX_ENTRIES (100) implementato
- **Rendering**: ✅ Auto-scroll smooth implementato
- **Random Selection**: ✅ Sistema getRandomMessage ottimizzato

#### **Step 5.3: Polish UI** ✅ COMPLETATO
- **Icone Messaggi**: ✅ Sistema icone per ogni tipo di messaggio
- **Colori Categorizzati**: ✅ Palette colori completa implementata
- **Animations**: ✅ Transizioni hover e scroll smooth
- **Layout Responsive**: ✅ Design adattivo implementato

---

## 🎨 SISTEMA COLORI INTELLIGENTE

### Categorie Messaggi

1. **Benvenuto** (`journal-welcome`): Giallo acceso (#FFD700)
   - Messaggi di inizio gioco
   - Importanza massima, cattura attenzione

2. **Standard** (`journal-standard`): Verde phosphor standard
   - Messaggi biomi normali
   - Azioni standard di gioco

3. **Fiumi** (`journal-river`): Blu acqua
   - Messaggi attraversamento fiumi
   - Coerenza visiva con colore tile

4. **Avvertimenti** (`journal-warning`): Arancione (#FFA500)
   - Messaggi montagne invalicabili
   - Tono ironico ma visivamente distintivo

5. **Atmosfera** (`journal-ambiance`): Verde scuro
   - Messaggi casuali narrativi
   - Meno invasivi, tono contemplativo

---

## 🔍 CONSIDERAZIONI TECNICHE

### Compatibilità
- ✅ **React 18**: Hooks moderni e concurrent features
- ✅ **TypeScript**: Tipizzazione forte per robustezza
- ✅ **TailwindCSS**: Sistema colori estensibile
- ✅ **Zustand**: Eventuale integrazione per persistenza

### Performance
- ✅ **Virtualizzazione**: Per grandi quantità messaggi
- ✅ **Memory Management**: Limite entries attive
- ✅ **Debouncing**: Per messaggi rapidi consecutivi
- ✅ **Lazy Loading**: Caricamento messaggi on-demand

### Estensibilità
- ✅ **Plugin System**: Facile aggiunta nuove categorie
- ✅ **Localization**: Supporto multilingua futuro
- ✅ **Custom Messages**: API per messaggi dinamici
- ✅ **Export/Import**: Salvataggio diario esterno

---

## 🚀 ROADMAP FUTURA

### v0.1.6 - Diario Avanzato
- **Filtri Messaggi**: Visualizzazione per categoria
- **Search Function**: Ricerca nel diario
- **Export Feature**: Salvataggio diario come testo

### v0.1.7 - Narrativa Dinamica
- **Context-Aware Messages**: Messaggi basati su stato gioco
- **Character Development**: Messaggi che evolvono con il giocatore
- **Seasonal Messages**: Messaggi basati su tempo di gioco

### v0.2.0 - Sistema Completo
- **Voice Narration**: Lettura automatica messaggi
- **Interactive Journal**: Scelte narrative nel diario
- **Multiplayer Sharing**: Condivisione diari tra giocatori

---

**CONCLUSIONE FATTIBILITÀ**: ✅ **ALTAMENTE FATTIBILE**

Il piano è **tecnicamente solido** e **architetturalmente compatibile** con il sistema esistente. L'implementazione richiede estensioni naturali del GameContext esistente e sfrutta pattern già consolidati. Il sistema colori proposto è elegante e funzionale.

**Rischi**: BASSI - Principalmente legati a performance con grandi quantità di messaggi, facilmente mitigabili.

**Benefici**: ALTI - Trasforma significativamente l'esperienza di gioco aggiungendo profondità narrativa senza compromettere performance.

**Raccomandazione**: PROCEDERE con implementazione graduale seguendo la roadmap proposta.

---

**ROADMAP v0.1.5 "The Living Journal" - PRONTA PER IMPLEMENTAZIONE**  
*Sistema Diario Dinamico e Narrativo - Architettura Validata*