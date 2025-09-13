# Design Document - Sistema Narrativo Canonico

## Overview

Il Sistema Narrativo Canonico trasforma "The Safe Place" da survival game a esperienza narrativa profonda basata sul romanzo "Echi Prima del Silenzio". Il sistema implementa una main quest emotiva in 4 stage, eventi lore tematici che riflettono i dilemmi morali di Elian, e un sistema di progressione narrativa che guida Ultimo dalla sopravvivenza istintiva alla comprensione emotiva del sacrificio paterno.

## Architecture

### Narrative System Architecture

```
                    Narrative Engine
                          |
    ┌─────────────────────┼─────────────────────┐
    |                     |                     |
Main Quest System    Event Lore System    Character Arc System
    |                     |                     |
┌───▼───┐         ┌──────▼──────┐         ┌────▼────┐
│Stage 1│         │Trama Events │         │Emotional│
│Testam.│         │(isUnique)   │         │Progress │
└───────┘         └─────────────┘         └─────────┘
┌───────┐         ┌─────────────┐         ┌─────────┐
│Stage 2│         │Thematic     │         │Moral    │
│Framm. │         │Events       │         │Choices  │
└───────┘         └─────────────┘         └─────────┘
┌───────┐         ┌─────────────┐         ┌─────────┐
│Stage 3│         │Combat       │         │Lena     │
│Rivelaz│         │Events       │         │Presence │
└───────┘         └─────────────┘         └─────────┘
┌───────┐
│Stage 4│
│Perdono│
└───────┘
```

### Data Structure

```
src/data/narrative/
├── lore-events.json                # Database completo eventi narrativi canonici
├── mainQuest/
│   ├── stage1-testamento.json      # Lettera di Elian e setup iniziale
│   ├── stage2-frammenti.json       # Eventi lore e indizi
│   ├── stage3-rivelazione.json     # Scoperta della verità su Lena
│   └── stage4-perdono.json         # Incontro finale con Elian
├── characterArc/
│   ├── ultimoEvolution.json        # Progressione emotiva di Ultimo
│   └── moralChoicesTracking.json   # Sistema tracking scelte morali
└── narrativeText/
    ├── introspectiveTexts.json     # Testi riflessivi e poetici
    ├── combatReflections.json      # Riflessioni post-combattimento
    └── lenaSymbols.json            # Simboli e richiami a Lena
```

**Database Eventi Canonici (`lore-events.json`):**
- **7 eventi narrativi** completi dal romanzo "Echi Prima del Silenzio"
- **4 categorie**: Tematici, Main Quest, Memorie Lena, Trauma Elian
- **Scelte morali** Elian/Lena con impatto emotivo dettagliato
- **Sistema tracking** progressione emotiva e connessioni parentali

## Components and Interfaces

### 1. Main Quest Trigger System

**Responsabilità:**
- Gestione sequenza garantita dei 12 frammenti
- Monitoraggio condizioni di attivazione multiple
- Trigger automatici basati su progresso di gioco
- Integrazione con sistema eventi esistente

**Trigger Architecture:**
```typescript
interface MainQuestTriggerSystem {
  // State tracking
  currentStage: number;           // 1-12, prossimo frammento da attivare
  progressCounter: number;        // Contatore progresso generale
  triggerFlags: TriggerFlags;     // Condizioni specifiche raggiunte
  
  // Core function
  checkMainQuestTrigger: () => void;  // Chiamata fine ogni turno
  
  // Condition checkers
  checkMovementProgress: () => boolean;
  checkSurvivalState: () => boolean;
  checkCombatExperience: () => boolean;
  checkLocationTriggers: () => boolean;
  checkMoralChoices: () => boolean;
  checkCharacterProgress: () => boolean;
  checkProximityTriggers: () => boolean;
}

interface TriggerFlags {
  movementSteps: number;
  daysAlive: number;
  combatExperience: boolean;
  shelterVisited: boolean;
  moralChoiceMade: boolean;
  levelReached: number;
  loreItemUsed: boolean;
  nearDestination: boolean;
  atDestination: boolean;
}
```

**Trigger Logic Flow:**
```typescript
// Chiamata automatica fine ogni turno
const checkMainQuestTrigger = () => {
  const currentFragment = fragments[mainQuest.currentStage - 1];
  
  if (evaluateActivationCondition(currentFragment.activationCondition)) {
    triggerMainQuestFragment(currentFragment);
    advanceToNextStage();
  }
  
  updateProgressTracking();
};
```

### 2. Narrative Engine (Core System)

**Responsabilità:**
- Coordinamento tra main quest, eventi lore e arco caratteriale
- Gestione progressione narrativa e unlock contenuti
- Tracking scelte morali e impatto emotivo
- Integrazione con sistemi esistenti (eventi, save/load)

**Interface:**
```typescript
interface NarrativeEngine {
  // Main Quest Management
  currentQuestStage: QuestStage;
  questProgress: QuestProgress;
  
  // Character Arc
  ultimoEmotionalState: EmotionalState;
  moralChoicesHistory: MoralChoice[];
  lenaConnectionLevel: number;
  elianUnderstandingLevel: number;
  
  // Actions
  advanceQuestStage: (trigger: QuestTrigger) => void;
  recordMoralChoice: (choice: MoralChoice) => void;
  updateEmotionalState: (event: EmotionalEvent) => void;
  
  // Selectors
  getAvailableLoreEvents: (biome: string, stage: QuestStage) => LoreEvent[];
  shouldTriggerQuestEvent: () => boolean;
  getUltimoReflection: (context: ReflectionContext) => string;
}
```

### 2. Main Quest System

**Responsabilità:**
- Gestione dei 4 stage principali della quest "L'Eco di una Promessa"
- Unlock progressivo di contenuti narrativi
- Tracking obiettivi e milestone narrative
- Integrazione con sistema eventi per trigger automatici

**Quest Stages:**
```typescript
enum QuestStage {
  TESTAMENTO = 'testamento',      // Stage 1: Lettera del padre
  FRAMMENTI = 'frammenti',        // Stage 2: Eventi lore e indizi
  RIVELAZIONE = 'rivelazione',    // Stage 3: Scoperta verità su Lena
  PERDONO = 'perdono'             // Stage 4: Incontro finale con Elian
}

interface QuestProgress {
  currentStage: QuestStage;
  stageProgress: number;          // 0-100% completamento stage corrente
  indizziScoperti: string[];      // Lista indizi trovati su Lena/Elian
  eventiLoreCompletati: string[]; // Eventi lore già vissuti
  obiettivoPrincipale: string;    // "Trova The Safe Place" -> "Trova Elian"
}
```

### 3. Event Lore System

**Responsabilità:**
- Generazione eventi tematici che riflettono dilemmi di Elian
- Presentazione scelte morali "Azione Elian" vs "Azione Lena"
- Tracking impatto emotivo delle scelte del giocatore
- Integrazione con sistema eventi dinamici esistente

**Event Categories:**
```typescript
interface LoreEvent extends GameEvent {
  category: 'trama' | 'tematico' | 'combattimento';
  emotionalWeight: number;        // Impatto emotivo 1-10
  elianParallel: string;         // Descrizione parallelo con trauma Elian
  lenaConnection?: string;       // Connessione opzionale con Lena
  
  choices: LoreChoice[];
}

interface LoreChoice extends EventChoice {
  moralAlignment: 'elian' | 'lena' | 'neutral';
  emotionalImpact: EmotionalImpact;
  reflectionText: string;        // Riflessione di Ultimo post-scelta
}

interface EmotionalImpact {
  compassion: number;            // +/- verso filosofia di Lena
  pragmatism: number;            // +/- verso filosofia di Elian
  understanding: number;         // +/- comprensione del sacrificio
  guilt: number;                 // +/- senso di colpa del sopravvissuto
}
```

### 4. Character Arc System

**Responsabilità:**
- Tracking evoluzione emotiva di Ultimo
- Gestione presenza simbolica di Lena
- Progressione comprensione verso Elian
- Integrazione con sistema progressione esistente

**Emotional State:**
```typescript
interface EmotionalState {
  // Core emotional metrics
  compassionLevel: number;       // 0-100, eredità di Lena
  pragmatismLevel: number;       // 0-100, eredità di Elian
  understandingLevel: number;    // 0-100, comprensione del sacrificio
  
  // Character development
  innocenceLost: number;         // 0-100, perdita innocenza
  wisdomGained: number;          // 0-100, saggezza acquisita
  
  // Parental connections
  lenaMemoryStrength: number;    // 0-100, connessione con ricordi madre
  elianEmpathy: number;          // 0-100, empatia verso il padre
  
  // Current emotional state
  currentMood: 'hopeful' | 'melancholic' | 'determined' | 'conflicted';
  dominantEmotion: 'grief' | 'anger' | 'understanding' | 'love';
}
```

### 5. Narrative Text System

**Responsabilità:**
- Generazione testi introspettivi e poetici
- Adattamento tono basato su stato emotivo di Ultimo
- Riflessioni post-azione contestuali
- Mantenimento coerenza stilistica con romanzo

**Text Generation:**
```typescript
interface NarrativeTextGenerator {
  // Context-aware text generation
  generateReflection: (context: ActionContext, emotionalState: EmotionalState) => string;
  generateCombatReflection: (outcome: CombatOutcome, moralWeight: number) => string;
  generateLenaSymbol: (trigger: SymbolTrigger, connectionLevel: number) => string;
  
  // Adaptive tone based on character arc
  getTextTone: (emotionalState: EmotionalState) => TextTone;
  adaptTextToProgress: (baseText: string, questStage: QuestStage) => string;
}

interface ActionContext {
  actionType: 'combat' | 'choice' | 'discovery' | 'interaction';
  outcome: 'success' | 'failure' | 'mixed';
  moralWeight: 'elian' | 'lena' | 'neutral';
  emotionalIntensity: number;
}

enum TextTone {
  INNOCENT = 'innocent',         // Inizio gioco, Ultimo giovane
  QUESTIONING = 'questioning',   // Inizia a dubitare e riflettere
  UNDERSTANDING = 'understanding', // Comprende i dilemmi del padre
  WISE = 'wise'                  // Finale, saggezza acquisita
}
```

## Integration with Existing Systems

### 1. Dynamic Events Integration

```typescript
// Estensione del sistema eventi esistente
interface ExtendedGameEvent extends GameEvent {
  // Existing properties...
  
  // New narrative properties
  narrativeCategory?: 'lore' | 'main-quest' | 'character-development';
  questStageRequirement?: QuestStage;
  emotionalPrerequisites?: EmotionalState;
  lenaConnectionTrigger?: number;
  elianUnderstandingTrigger?: number;
  
  // Enhanced choices with narrative impact
  choices: NarrativeChoice[];
}

interface NarrativeChoice extends EventChoice {
  // Existing properties...
  
  // New narrative properties
  moralAlignment: 'elian' | 'lena' | 'neutral';
  emotionalImpact: EmotionalImpact;
  reflectionText: string;
  questProgressImpact?: QuestProgressDelta;
}
```

### 2. Save System Integration

```typescript
// Estensione del save system per dati narrativi
interface NarrativeSaveData {
  questProgress: QuestProgress;
  emotionalState: EmotionalState;
  moralChoicesHistory: MoralChoice[];
  discoveredClues: string[];
  lenaMemoriesUnlocked: string[];
  elianUnderstandingMilestones: string[];
  narrativeFlags: Record<string, boolean>;
}

// Integrazione con characterSheet esistente
interface ExtendedCharacterSheet extends ICharacterSheet {
  // Existing properties...
  
  // New narrative properties
  narrativeProgress: NarrativeSaveData;
  emotionalGrowth: EmotionalGrowthMetrics;
}
```

### 3. Combat System Integration

```typescript
// Estensione sistema combattimento per riflessioni narrative
interface NarrativeCombatResult extends CombatResult {
  // Existing properties...
  
  // New narrative properties
  moralWeight: number;           // Peso morale della violenza usata
  elianParallel: string;         // Parallelo con filosofia di Elian
  ultimoReflection: string;      // Riflessione post-combattimento
  emotionalImpact: EmotionalImpact;
}
```

## Canonical Narrative Database

### Main Quest: I 12 Frammenti della Memoria

Il database `main-quest-fragments.json` contiene la **spina dorsale narrativa** del gioco: 12 frammenti di memoria che guidano Ultimo dalla scoperta iniziale alla rivelazione finale. Ogni frammento è un "evento di soglia" che si attiva automaticamente al raggiungimento di condizioni specifiche.

#### **Struttura Progressiva Garantita:**

**Sistema di Trigger Intelligente:**
- **Trigger Ibridi**: Combinano progresso passivo (tempo/movimento) e azioni specifiche
- **Trigger Complessi**: Il Frammento 11 richiede condizioni multiple specifiche
- **Sequenza Garantita**: Tutti i 12 frammenti vengono vissuti prima del finale
- **Pacing Controllato**: Eventi distribuiti lungo l'intero arco del gioco
- **Contenuto Canonico**: Testi direttamente dal romanzo "Echi Prima del Silenzio"

**I 12 Frammenti Canonici:**

1. **"Il Primo Silenzio"** - La Guerra Inespressa e la fine del mondo
2. **"La Lezione dell'Acqua"** - Elian insegna la sopravvivenza brutale
3. **"Il Sapore del Sangue"** - L'attacco alla stazione e la prima violenza
4. **"Imparare il Buio"** - Le lezioni di combattimento del padre
5. **"La Domanda Senza Risposta"** - I primi dubbi su Lena
6. **"Gli Angeli della Cenere"** - Gli orrori del mondo post-apocalittico
7. **"La Verità è un Fardello"** - Elian nasconde il dolore
8. **"La Mappa"** - La partenza del padre e l'inizio del viaggio
9. **"Il Significato di un Nome"** - Ultimo riflette sulla sua identità
10. **"L'Eco di una Scelta"** - La comprensione dei dilemmi del padre
11. **"La Ninnananna della Cenere"** - L'incontro con Lena trasformata in Angelo della Cenere
12. **"La Verità Completa"** - La rivelazione finale: Elian sapeva del destino di Lena

#### **Progressione Emotiva Garantita:**

**4 Fasi di Crescita:**
- **Bambino Innocente** (Frammenti 1-3): Scoperta del mondo ostile
- **Figlio Dubbioso** (Frammenti 4-7): Primi interrogativi su Elian
- **Cercatore di Verità** (Frammenti 8-10): Investigazione attiva del passato
- **Testimone dell'Orrore** (Frammento 11): Scoperta della trasformazione di Lena
- **Perdonatore Empatico** (Frammento 12): Comprensione completa e catarsi finale

#### **Il Carillon Annerito - Oggetto Chiave Narrativo:**

**Implementazione Tecnica:**
```typescript
interface QuestMusicBox extends GameItem {
  id: 'quest_music_box';
  name: 'Carillon Annerito';
  description: 'Un piccolo carillon di metallo annerito. Elian ti ha sempre detto di non aprirlo mai.';
  category: 'quest_item';
  weight: 0.2;
  canDrop: false;
  canUse: true;
  
  // Proprietà narrative speciali
  narrativeProperties: {
    isQuestCritical: true;
    elianWarning: "Non aprirlo mai. Il suo suono... attira i ricordi sbagliati.";
    lenaConnection: true;
    ashAngelTrigger: true;
  };
  
  // Condizioni di utilizzo
  useConditions: {
    location: 'shelter';
    questStage: 11;
    actionContext: 'rest_attempt';
  };
}
```

**Sistema di Trigger Complesso per Frammento 11:**
```typescript
interface ComplexTriggerCondition {
  type: 'complex_trigger';
  requirements: {
    mainQuestStage: number;        // Deve essere stage 11
    hasItem: string;               // Deve possedere 'quest_music_box'
    location: string;              // Deve essere in 'safe_house'
    locationDepth: string;         // Deve essere in 'deep_territory'
    action: string;                // Deve tentare 'rest_attempt'
  };
  
  // Logica di valutazione
  evaluate: () => boolean;
  
  // Comportamento di deferimento
  deferBehavior: {
    allowRetry: true;
    preserveEvent: true;
    feedbackMessage: string;
  };
}
```

**Meccanica di Scelta Critica:**
- **Scelta 1**: "Apri il carillon" → Trigger dell'evento completo
- **Scelte 2-3**: "Non aprire" → Evento differito, riprova disponibile
- **Feedback Narrativo**: Messaggio nel diario per scelte di deferimento
- **Persistenza**: L'evento rimane disponibile fino alla scelta fatidica

### Eventi Lore Tematici

Il database `lore-events.json` contiene **7 eventi canonici** complementari che approfondiscono i temi morali:

#### **Eventi Tematici Principali:**

1. **"L'Eco di una Tosse"** - Il viandante malato (Capitolo 7 del romanzo)
   - **Scelta Lena**: Offrire provviste (compassione rischiosa)
   - **Scelta Elian**: Ignorare (pragmatismo brutale)
   - **Riflessione**: "È questo che avrebbe fatto mamma?"

2. **"Voci nel Silenzio"** - La radio rotta
   - **Scelta Lena**: Riparare per cercare contatti (speranza)
   - **Scelta Elian**: Smontare per componenti (sopravvivenza)
   - **Simbolo Lena**: Ninna nanna che richiama la madre

3. **"Il Ponte Crollato"** - L'uomo che annega
   - **Scelta Lena**: Tentare il salvataggio (rischio per altri)
   - **Scelta Elian**: Attraversare ignorando (autopreservazione)
   - **Parallelo**: Il dilemma che ha definito la vita del padre

4. **"Tomba Senza Nome"** - Rispetto per i morti
   - **Scelta Lena**: Onorare la tomba (umanità)
   - **Scelta Elian**: Prendere le provviste (pragmatismo)
   - **Crescita**: Boost permanente al carisma per scelta compassionevole

#### **Sistema Emotivo Integrato:**

Ogni evento traccia **5 metriche emotive**:
- **Compassion** (eredità di Lena)
- **Pragmatism** (eredità di Elian)
- **Understanding** (comprensione del sacrificio)
- **Guilt** (senso di colpa del sopravvissuto)
- **Lena/Elian Connection** (legame con i genitori)

#### **Progressione Narrativa:**

Gli eventi si attivano basati su:
- **Quest Stage** (testamento → frammenti → rivelazione → perdono)
- **Emotional Prerequisites** (livelli di comprensione/connessione)
- **Biome Appropriato** (coerenza ambientale)
- **Probability Weighted** (frequenza bilanciata)

## Narrative Content Examples

### 1. Stage 1 - Testamento del Padre

```json
{
  "id": "testamento_elian",
  "title": "La Lettera del Padre",
  "description": "Trovi una lettera lasciata da tuo padre prima della sua partenza...",
  "letterText": "Ultimo, se stai leggendo questo, significa che sono partito. Non odiarmi per questo. Ho passato anni a insegnarti tutto quello che so sulla sopravvivenza, ma c'è una cosa che non ti ho mai insegnato: come vivere con le scelte che fai. Vai a nord, oltre le colline rosse. Cerca 'The Safe Place'. Sii migliore di me. Sopravvivi. E forse, un giorno, capirai. O forse mi perdonerai. - Elian",
  "questObjective": "Trova 'The Safe Place' come indicato nella lettera di tuo padre",
  "emotionalImpact": {
    "confusion": 5,
    "determination": 3,
    "abandonment": 4
  }
}
```

### 2. Evento Lore Tematico

```json
{
  "id": "stranieri_feriti",
  "title": "Due Stranieri",
  "description": "Incontri un uomo debole e una ragazza malata che ti chiedono aiuto. Le tue risorse sono limitate...",
  "elianParallel": "Questo è esattamente il tipo di scelta che ha dovuto affrontare tuo padre",
  "choices": [
    {
      "text": "Offri loro cibo e medicine",
      "moralAlignment": "lena",
      "reflectionText": "Mentre condividi le tue risorse, senti un calore nel petto. È questo che avrebbe fatto mamma?",
      "emotionalImpact": {
        "compassion": 3,
        "understanding": 1,
        "pragmatism": -1
      }
    },
    {
      "text": "Allontanali per conservare le risorse",
      "moralAlignment": "elian",
      "reflectionText": "Li guardi allontanarsi e senti un peso nel petto. Papà... è così che ti sei sentito?",
      "emotionalImpact": {
        "pragmatism": 3,
        "understanding": 2,
        "guilt": 2
      }
    }
  ]
}
```

### 3. Frammento 11 - La Ninnananna della Cenere

```json
{
  "id": "fragment_11_ash_lullaby",
  "title": "La Ninnananna della Cenere",
  "description": "L'evento più traumatico della Main Quest - l'incontro con Lena trasformata",
  "triggerConditions": {
    "hasItem": "quest_music_box",
    "location": "shelter_in_deep_territory",
    "action": "attempt_rest",
    "questStage": 11
  },
  "phases": [
    {
      "phase": "temptation",
      "description": "Il giocatore deve scegliere se aprire il carillon nonostante l'avvertimento di Elian"
    },
    {
      "phase": "lullaby",
      "description": "La melodia spezzata del carillon induce un sonno innaturale"
    },
    {
      "phase": "presence",
      "description": "Risveglio con la presenza dell'Angelo della Cenere"
    },
    {
      "phase": "recognition",
      "description": "La creatura tenta di cantare la ninnananna di Ultimo"
    },
    {
      "phase": "revelation",
      "description": "Ultimo realizza che l'Angelo è sua madre trasformata"
    }
  ],
  "emotionalImpact": {
    "shock": 5,
    "horror": 5,
    "grief": 5,
    "lenaConnection": 4,
    "existentialDread": 4
  },
  "consequences": {
    "disableRestInShelters": true,
    "statusEffect": "TRAUMATIZED",
    "questObjective": "find_elian_for_answers"
  }
}
```

### 4. Riflessione Post-Combattimento

```json
{
  "combatReflections": {
    "victory_brutal": "Con una violenza che non sapevi di possedere, scacci il branco. Il sapore della vittoria è amaro, simile a quello del sangue. Papà... è così che ti sei sentito ogni volta?",
    "victory_defensive": "Riesci a difenderti senza ferire gravemente nessuno. Nel silenzio che segue, senti quasi la voce di mamma che sussurra: 'Bene, figlio mio.'",
    "escape_successful": "Corri via, il cuore che batte forte. Non c'è vergogna nella fuga, ti ripeti. Sopravvivere è tutto ciò che conta. Vero, papà?",
    "post_lena_encounter": "Ogni movimento violento ora ti ricorda le mani pallide dell'Angelo. Era davvero mamma? E se sì... cosa significa combattere in un mondo dove i mostri erano una volta persone che amavi?"
  }
}
```

## Implementation Strategy

### Phase 1: Core Narrative Infrastructure
1. Implementare NarrativeEngine base
2. Estendere sistema eventi per supportare proprietà narrative
3. Creare sistema tracking emotionale
4. Implementare generatore testi introspettivi

### Phase 2: Main Quest Implementation
1. Creare i 4 stage della main quest
2. Implementare sistema progressione narrativa
3. Integrare con sistema save/load
4. Testare flusso narrativo completo

### Phase 3: Lore Events System
1. Creare database eventi lore tematici
2. Implementare sistema scelte morali
3. Integrare con sistema eventi dinamici esistente
4. Testare impatto emotivo e progressione

### Phase 4: Character Arc Integration
1. Implementare tracking evoluzione Ultimo
2. Creare sistema presenza simbolica Lena
3. Integrare con sistema progressione esistente
4. Testare coerenza arco narrativo

### Phase 5: Polish and Integration
1. Riscrivere tutti i testi esistenti con tono narrativo
2. Integrare riflessioni con tutti i sistemi
3. Testing completo esperienza narrativa
4. Bilanciamento impatto emotivo

## Success Metrics

### Narrative Engagement
- **Quest Completion Rate**: >90% giocatori completano main quest
- **Emotional Investment**: Tracking scelte morali mostra engagement
- **Text Quality**: Feedback positivo su tono e atmosfera

### Character Development
- **Arc Progression**: Smooth progression attraverso stati emotivi
- **Choice Impact**: Scelte morali influenzano meaningfully l'esperienza
- **Catharsis Achievement**: Finale emotivamente soddisfacente

### Technical Integration
- **Performance**: Nessun impatto negativo su performance esistenti
- **Compatibility**: Piena compatibilità con sistemi esistenti
- **Save Integrity**: Progressione narrativa preservata correttamente

---

Questo design trasforma "The Safe Place" in un'esperienza narrativa profonda che onora la complessità emotiva del romanzo originale, mantenendo la giocabilità del survival game ma elevandola a veicolo per una storia di perdono, comprensione e crescita emotiva.