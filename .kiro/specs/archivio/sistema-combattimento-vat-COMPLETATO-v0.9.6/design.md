# Design Document - Sistema di Combattimento V.A.T.

## Overview

Il sistema di combattimento V.A.T. (Visualized Action Tracker) implementa un sistema di combattimento tattico a turni per "The Safe Place". Il sistema è progettato per essere completamente trasparente nei calcoli, accessibile da tastiera e perfettamente integrato con l'architettura esistente basata su Zustand e React. Ogni combattimento è un puzzle tattico che richiede gestione strategica delle risorse.

## Architecture

### High-Level Architecture

```
GameScreen (Esplorazione)
    ↓ Evento Dinamico (Scontro)
CombatScreen (Combattimento)
    ├── SceneDescription (superiore)
    ├── CombatStatus (centrale)
    │   ├── PlayerStatus (sinistra)
    │   └── EnemyStatus (destra)
    ├── CombatLog (inferiore)
    └── ActionMenu (sostituisce log durante turno giocatore)
    ↓ Vittoria/Sconfitta
GameScreen / GameOverScreen
```

### Component Structure

```
src/
├── components/
│   └── combat/
│       ├── CombatScreen.tsx           # Componente principale
│       ├── SceneDescription.tsx       # Descrizione narrativa
│       ├── CombatStatus.tsx           # Stato combattimento
│       ├── PlayerStatus.tsx           # Statistiche giocatore
│       ├── EnemyStatus.tsx            # Stato nemici
│       ├── CombatLog.tsx              # Log azioni trasparente
│       ├── ActionMenu.tsx             # Menu azioni giocatore
│       └── TargetSelector.tsx         # Selezione bersagli
├── data/
│   └── enemies.json                   # Database nemici
├── stores/
│   └── combatStore.ts                 # Store Zustand per combattimento
├── types/
│   └── combat.ts                      # Tipi TypeScript
└── utils/
    ├── combatCalculations.ts          # Calcoli D&D
    ├── combatActions.ts               # Logica azioni
    └── enemyAI.ts                     # Intelligenza artificiale nemici
```

## Components and Interfaces

### 1. CombatScreen Component

**Responsabilità:**
- Orchestrazione generale del combattimento
- Gestione turni (giocatore -> nemici -> giocatore)
- Coordinamento tra tutti i sotto-componenti
- Gestione input tastiera globali
- Transizioni verso altre schermate

**Props Interface:**
```typescript
interface CombatScreenProps {
  encounter: CombatEncounter;
  onCombatEnd: (result: CombatResult) => void;
}
```

**State Management:**
- Utilizza `combatStore` per stato globale
- Gestisce `currentTurn` (player/enemy)
- Mantiene `combatPhase` (action-selection/action-execution/enemy-turn)

### 2. SceneDescription Component

**Responsabilità:**
- Visualizzazione descrizione narrativa dinamica
- Aggiornamento descrizione basato su eventi
- Mantenimento atmosfera e immersione

**Props Interface:**
```typescript
interface SceneDescriptionProps {
  initialDescription: string;
  currentState: CombatState;
  lastAction?: CombatAction;
}
```

### 3. CombatStatus Component

**Responsabilità:**
- Layout container per PlayerStatus e EnemyStatus
- Coordinamento aggiornamenti stato
- Gestione responsive del layout

### 4. PlayerStatus Component

**Responsabilità:**
- Visualizzazione HP, arma, armatura del giocatore
- Indicatori bonus temporanei (difesa)
- Calcolo e visualizzazione AC dinamica

**Props Interface:**
```typescript
interface PlayerStatusProps {
  player: PlayerCombatState;
  temporaryBonuses: TemporaryBonus[];
}
```

### 5. EnemyStatus Component

**Responsabilità:**
- Visualizzazione stato nemici con descrizioni qualitative
- Gestione visualizzazione multipli nemici
- Indicatori bersaglio selezionato

**Props Interface:**
```typescript
interface EnemyStatusProps {
  enemies: EnemyCombatState[];
  selectedTarget?: number;
}
```

### 6. CombatLog Component

**Responsabilità:**
- Visualizzazione cronologica azioni
- Calcoli trasparenti (tiri, modificatori, risultati)
- Auto-scroll e gestione lunghezza log
- Formattazione colorata per diversi tipi di messaggio

**Props Interface:**
```typescript
interface CombatLogProps {
  logEntries: CombatLogEntry[];
  maxEntries?: number;
}
```

### 7. ActionMenu Component

**Responsabilità:**
- Menu navigabile delle 4 azioni principali
- Gestione selezione con W/S
- Visualizzazione stato disponibilità azioni
- Transizione verso sotto-menu (inventario, selezione bersaglio)

**Props Interface:**
```typescript
interface ActionMenuProps {
  availableActions: CombatAction[];
  selectedAction: number;
  onActionSelect: (action: CombatActionType) => void;
}
```

### 8. TargetSelector Component

**Responsabilità:**
- Selezione bersaglio per attacchi
- Navigazione tra nemici multipli
- Visualizzazione informazioni bersaglio

**Props Interface:**
```typescript
interface TargetSelectorProps {
  enemies: EnemyCombatState[];
  selectedIndex: number;
  onTargetSelect: (index: number) => void;
  onCancel: () => void;
}
```

## Data Models

### Combat State Interfaces

```typescript
interface CombatState {
  phase: 'player-turn' | 'enemy-turn' | 'action-execution' | 'combat-end';
  currentTurn: number;
  player: PlayerCombatState;
  enemies: EnemyCombatState[];
  log: CombatLogEntry[];
  encounter: CombatEncounter;
}

interface PlayerCombatState {
  hp: number;
  maxHp: number;
  ac: number;
  baseAc: number;
  weapon: WeaponItem;
  armor?: ArmorItem;
  temporaryBonuses: TemporaryBonus[];
  stats: CharacterStats;
}

interface EnemyCombatState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  damage: string; // es. "1d6"
  attackBonus: number;
  status: 'alive' | 'dead';
  healthDescription: 'Illeso' | 'Ferito' | 'Gravemente Ferito' | 'Morente';
}

interface CombatEncounter {
  id: string;
  description: string;
  enemies: EnemyTemplate[];
  environment: string;
  escapeModifier: number;
}
```

### Combat Actions

```typescript
type CombatActionType = 'attack' | 'inventory' | 'defend' | 'flee';

interface CombatAction {
  type: CombatActionType;
  actor: 'player' | 'enemy';
  target?: number;
  item?: string;
  result: ActionResult;
  rolls: DiceRoll[];
}

interface ActionResult {
  success: boolean;
  damage?: number;
  effect?: string;
  message: string;
}

interface DiceRoll {
  type: string; // "d20", "1d6", etc.
  result: number;
  modifier: number;
  total: number;
  target?: number;
}
```

### Combat Store State

```typescript
interface CombatStoreState {
  // Stato combattimento
  isActive: boolean;
  currentState: CombatState | null;
  selectedAction: CombatActionType | null;
  selectedTarget: number | null;
  
  // Azioni principali
  initiateCombat: (encounter: CombatEncounter) => void;
  endCombat: (result: CombatResult) => void;
  
  // Azioni giocatore
  selectAction: (action: CombatActionType) => void;
  selectTarget: (index: number) => void;
  executePlayerAction: () => Promise<void>;
  
  // Turno nemici
  executeEnemyTurn: () => Promise<void>;
  
  // Utility
  canPerformAction: (action: CombatActionType) => boolean;
  getUsableItems: () => InventoryItem[];
  calculatePlayerAC: () => number;
  
  // Log
  addLogEntry: (entry: CombatLogEntry) => void;
  clearLog: () => void;
}
```

## Error Handling

### Validation Layers

1. **Action Validation:** Verifica disponibilità azioni prima dell'esecuzione
2. **Target Validation:** Controllo validità bersagli selezionati
3. **State Validation:** Verifica coerenza stato combattimento
4. **Integration Validation:** Controllo integrità dati da sistemi esterni

### Error Recovery

```typescript
const COMBAT_ERRORS = {
  INVALID_ACTION: "Azione non disponibile in questo momento.",
  INVALID_TARGET: "Bersaglio non valido o già sconfitto.",
  INSUFFICIENT_RESOURCES: "Risorse insufficienti per questa azione.",
  STATE_CORRUPTION: "Errore interno del combattimento. Terminazione forzata.",
  INTEGRATION_ERROR: "Errore di comunicazione con altri sistemi."
};
```

## Testing Strategy

### Unit Tests

1. **combatCalculations.ts**
   - Calcoli tiro per colpire con vari modificatori
   - Calcoli danno con diversi tipi di dado
   - Calcolo AC con bonus temporanei
   - Skill check per fuga

2. **combatActions.ts**
   - Esecuzione azioni giocatore
   - Validazione prerequisiti azioni
   - Applicazione effetti oggetti

3. **enemyAI.ts**
   - Logica selezione azioni nemici
   - Calcoli attacco nemici
   - Gestione stati nemici

### Integration Tests

1. **Combat Flow**
   - Inizializzazione combattimento da evento
   - Ciclo completo turni giocatore-nemici
   - Terminazione combattimento (vittoria/sconfitta)

2. **Action System**
   - Tutte e 4 le azioni giocatore
   - Selezione bersagli multipli
   - Uso oggetti inventario

### E2E Tests

1. **Complete Combat Scenarios**
   - Combattimento semplice (1 nemico)
   - Combattimento multiplo (3+ nemici)
   - Fuga riuscita e fallita
   - Uso oggetti curativi
   - Sconfitta e game over

## Performance Considerations

### Optimization Strategies

1. **State Updates:** Batch degli aggiornamenti stato per ridurre re-render
2. **Log Management:** Limite automatico entries log per gestione memoria
3. **Animation Timing:** Debounce azioni rapide per evitare spam
4. **Component Memoization:** React.memo per componenti statici

### Memory Management

- Cleanup completo stato combattimento alla fine
- Garbage collection riferimenti nemici sconfitti
- Ottimizzazione rendering log con virtualizzazione se necessario

## Integration Points

### Existing Systems Integration

1. **Dynamic Events System**
   ```typescript
   // Trigger combattimento da evento
   const handleCombatEvent = (event: DynamicEvent) => {
     const encounter = createEncounterFromEvent(event);
     combatStore.initiateCombat(encounter);
   };
   ```

2. **Character System**
   ```typescript
   // Utilizzo stats esistenti
   import { useGameStore } from '../stores/gameStore';
   
   const getPlayerCombatState = (): PlayerCombatState => {
     const { characterSheet, equippedWeapon, equippedArmor } = useGameStore();
     return {
       hp: characterSheet.hp,
       maxHp: characterSheet.maxHp,
       ac: calculateAC(characterSheet.stats.agility, equippedArmor),
       weapon: equippedWeapon,
       armor: equippedArmor,
       stats: characterSheet.stats
     };
   };
   ```

3. **Inventory System**
   ```typescript
   // Integrazione uso oggetti
   import { removeItem, getInventoryItems } from '../stores/gameStore';
   
   const useItemInCombat = (itemId: string) => {
     const item = getInventoryItems().find(i => i.id === itemId);
     if (item?.usableInCombat) {
       applyItemEffect(item);
       removeItem(itemId, 1);
     }
   };
   ```

4. **Experience System**
   ```typescript
   // Assegnazione XP vittoria
   import { addExperience } from '../stores/gameStore';
   
   const onCombatVictory = (enemies: EnemyCombatState[]) => {
     const xpGained = calculateCombatXP(enemies);
     addExperience(xpGained);
   };
   ```

## Combat Calculations

### Core D&D Mechanics

```typescript
// Tiro per colpire
const rollToHit = (
  attackerStat: number,
  targetAC: number,
  weaponType: 'melee' | 'ranged'
): AttackResult => {
  const d20Roll = rollDice(20);
  const modifier = getStatModifier(attackerStat);
  const total = d20Roll + modifier;
  
  return {
    roll: d20Roll,
    modifier,
    total,
    target: targetAC,
    hit: total >= targetAC
  };
};

// Calcolo danno
const rollDamage = (weaponDamage: string): DamageResult => {
  const [count, sides] = parseDiceString(weaponDamage); // "1d6" -> [1, 6]
  const rolls = Array.from({length: count}, () => rollDice(sides));
  const total = rolls.reduce((sum, roll) => sum + roll, 0);
  
  return {
    rolls,
    total,
    damageType: 'physical'
  };
};

// Skill check fuga
const rollEscape = (
  playerAgility: number,
  enemyPursuit: number
): EscapeResult => {
  const playerRoll = rollDice(20) + getStatModifier(playerAgility);
  const enemyRoll = enemyPursuit + rollDice(6); // Nemici hanno variabilità minore
  
  return {
    playerRoll,
    enemyRoll,
    success: playerRoll > enemyRoll
  };
};
```

## Future Extensibility

### Planned Extensions

1. **Advanced Combat Mechanics:**
   - Condizioni di stato (avvelenato, stordito)
   - Attacchi speciali e abilità
   - Combattimento ambientale (coperture, trappole)

2. **Enemy AI Improvements:**
   - Comportamenti specifici per tipo nemico
   - Tattiche di gruppo
   - Reazioni dinamiche alle azioni giocatore

3. **Loot System:**
   - Drop oggetti da nemici sconfitti
   - Schermata loot post-combattimento
   - Oggetti rari da boss

### Architecture Flexibility

- Plugin system per nuovi tipi di azione
- Modular enemy behavior system
- Extensible damage type system
- Configurable difficulty modifiers

---

## Note di Design Aggiuntive

### Filosofia degli Incontri

Su indicazione del committente, il combattimento in "The Safe Place" deve essere un elemento presente ma non centrale. Il focus del gioco è narrativo. Di conseguenza:
- **Gli scontri devono essere rari.** Non devono essere un'interruzione costante dell'esplorazione.
- **La fuga è una vittoria.** Il sistema deve essere bilanciato in modo che la fuga sia un'opzione strategica valida e spesso la più saggia, in linea con gli insegnamenti del padre del protagonista.
- **Evitabilità:** Laddove possibile, i combattimenti dovrebbero essere evitabili attraverso l'osservazione, l'astuzia o scelte di dialogo, piuttosto che essere incontri casuali e inevitabili.

### Sistema Audio

Su indicazione del committente, l'implementazione di effetti sonori o musica per il sistema di combattimento è **fuori scopo** per la fase di sviluppo attuale. Verrà progettata e implementata in una fase successiva dello sviluppo del gioco.

---

Questo design fornisce una base solida per implementare un sistema di combattimento tattico, trasparente e coinvolgente che si integra perfettamente con l'ecosistema esistente di "The Safe Place".