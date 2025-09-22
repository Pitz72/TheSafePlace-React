# 🎯 **GAME DESIGN DOCUMENT - THE SAFE PLACE v2.0**
# **"ARCHITECTURE RESET" - Parte 3**

**Versione**: 2.0.0
**Data Creazione**: 22 Settembre 2025
**Autore**: Kilo Code (LLM-Assisted Development)
**Codename**: Architecture Reset

---

## **4. DOMINI BUSINESS (CONCLUSION)**

### **4.5 Dominio Narrative**

**Responsabilità**: Gestione storia principale, quest, eventi narrativi, progressione emotiva del personaggio.

```typescript
// domains/narrative/types.ts
export interface NarrativeState {
  currentStage: number;
  mainQuestEvents: MainQuestEvent[];
  activeQuests: Quest[];
  completedQuests: string[];
  storyFlags: Map<string, any>;
  emotionalState: EmotionalState;
  relationshipStates: Map<string, RelationshipState>;
  discoveredLore: string[];
  narrativeProgress: number; // 0-100
}

export interface MainQuestEvent {
  id: string;
  stage: number;
  title: string;
  description: string;
  trigger: QuestTrigger;
  consequences: NarrativeConsequence[];
  emotionalImpact: EmotionalImpact;
  requiredFlags?: string[];
  blocksFlags?: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number;
  isMainQuest: boolean;
  status: QuestStatus;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: any;
  currentProgress: number;
  requiredProgress: number;
  isCompleted: boolean;
}

export type ObjectiveType =
  | 'kill_enemies'
  | 'collect_items'
  | 'reach_location'
  | 'talk_to_npc'
  | 'survive_days'
  | 'achieve_emotional_state';

export interface EmotionalState {
  trust: number;      // 0-100, fiducia negli altri
  hope: number;       // 0-100, ottimismo per il futuro
  guilt: number;      // 0-100, senso di colpa
  determination: number; // 0-100, forza di volontà
  despair: number;    // 0-100, disperazione
  love: number;       // 0-100, capacità di amare
}

export interface RelationshipState {
  characterId: string;
  affection: number;  // -100 to 100
  trust: number;      // 0-100
  lastInteraction: number; // timestamp
  relationshipLevel: RelationshipLevel;
}

export type RelationshipLevel =
  | 'enemy'
  | 'disliked'
  | 'neutral'
  | 'friendly'
  | 'trusted'
  | 'loved';

export type QuestStatus =
  | 'not_started'
  | 'active'
  | 'completed'
  | 'failed'
  | 'expired';
```

**Implementazione Narrative Domain:**
```typescript
// domains/narrative/narrativeDomain.ts
export class NarrativeDomain {
  constructor(
    private eventBus: EventBus,
    private config: NarrativeConfig
  ) {}

  async initialize(): Promise<void> {
    // Load main quest events
    this.state.mainQuestEvents = await this.loadMainQuestEvents();
    this.state.storyFlags = new Map();
    this.state.relationshipStates = new Map();
    this.state.emotionalState = this.getInitialEmotionalState();

    this.eventBus.emit({
      type: GameEvents.NARRATIVE_INITIALIZED,
      payload: { totalStages: this.state.mainQuestEvents.length },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });
  }

  checkMainQuestTriggers(): MainQuestEvent | null {
    const currentStage = this.state.currentStage;
    const availableEvents = this.state.mainQuestEvents.filter(
      event => event.stage === currentStage
    );

    for (const event of availableEvents) {
      if (this.evaluateTrigger(event.trigger) &&
          this.checkRequiredFlags(event.requiredFlags) &&
          !this.checkBlockingFlags(event.blocksFlags)) {
        return event;
      }
    }

    return null;
  }

  private evaluateTrigger(trigger: QuestTrigger): boolean {
    switch (trigger.type) {
      case 'progress':
        return this.state.narrativeProgress >= (trigger.value || 0);

      case 'survival_stat':
        return this.checkSurvivalStat(trigger);

      case 'combat_end':
        return this.checkCombatResult(trigger);

      case 'survival_days':
        return this.checkSurvivalDays(trigger);

      case 'enter_biome':
        return this.checkBiomeEntered(trigger);

      case 'level_up':
        return this.checkLevelUp(trigger);

      case 'use_item':
        return this.state.storyFlags.get(`used_item_${trigger.itemId}`) === true;

      case 'event_choice':
        return this.state.storyFlags.get(`completed_event_${trigger.eventId}`) === true;

      case 'reach_location':
        return this.checkLocationReached(trigger);

      case 'reach_end':
        return this.state.storyFlags.get('reached_safe_place') === true;

      case 'emotional_state':
        return this.checkEmotionalState(trigger);

      default:
        return false;
    }
  }

  private checkSurvivalStat(trigger: QuestTrigger): boolean {
    // Delegate to survival domain
    this.eventBus.emit({
      type: GameEvents.NARRATIVE_SURVIVAL_CHECK_REQUEST,
      payload: { stat: trigger.stat, value: trigger.value },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });
    return false; // Would be resolved by survival domain
  }

  private checkCombatResult(trigger: QuestTrigger): boolean {
    const lastCombatWon = this.state.storyFlags.get('last_combat_won');
    const lastCombatLost = this.state.storyFlags.get('last_combat_lost');

    if (trigger.result === 'win') return lastCombatWon === true;
    if (trigger.result === 'lose') return lastCombatLost === true;
    return false;
  }

  private checkEmotionalState(trigger: QuestTrigger): boolean {
    const requiredEmotion = trigger.emotion;
    const requiredValue = trigger.value || 50;
    const currentValue = this.state.emotionalState[requiredEmotion];

    return currentValue >= requiredValue;
  }

  triggerMainQuestEvent(event: MainQuestEvent): void {
    console.log(`🎭 MAIN QUEST EVENT: ${event.title}`);

    // Apply emotional impact
    this.applyEmotionalImpact(event.emotionalImpact);

    // Set story flags
    if (event.requiredFlags) {
      event.requiredFlags.forEach(flag => {
        this.state.storyFlags.set(flag, true);
      });
    }

    // Create game event
    const gameEvent: GameEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      choices: [], // Main quest events are narrative-only
      isUnique: true
    };

    this.eventBus.emit({
      type: GameEvents.MAIN_QUEST_EVENT_TRIGGERED,
      payload: { eventId: event.id, gameEvent },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });

    // Advance to next stage
    this.advanceToNextStage();
  }

  private applyEmotionalImpact(impact: EmotionalImpact): void {
    Object.entries(impact).forEach(([emotion, change]) => {
      const current = this.state.emotionalState[emotion];
      const newValue = Math.max(0, Math.min(100, current + change));
      this.state.emotionalState[emotion] = newValue;
    });

    this.eventBus.emit({
      type: GameEvents.EMOTIONAL_STATE_CHANGED,
      payload: { changes: impact, newState: { ...this.state.emotionalState } },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });
  }

  advanceToNextStage(): void {
    this.state.currentStage++;
    this.state.narrativeProgress = (this.state.currentStage / this.state.mainQuestEvents.length) * 100;

    this.eventBus.emit({
      type: GameEvents.NARRATIVE_STAGE_ADVANCED,
      payload: {
        newStage: this.state.currentStage,
        progress: this.state.narrativeProgress
      },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });
  }

  updateEmotionalState(changes: Partial<EmotionalState>): void {
    Object.entries(changes).forEach(([emotion, change]) => {
      if (typeof change === 'number') {
        this.state.emotionalState[emotion] = Math.max(0, Math.min(100, this.state.emotionalState[emotion] + change));
      }
    });

    this.eventBus.emit({
      type: GameEvents.EMOTIONAL_STATE_CHANGED,
      payload: { changes, newState: { ...this.state.emotionalState } },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });
  }

  startQuest(questId: string): boolean {
    const quest = this.getQuestDefinition(questId);
    if (!quest) return false;

    quest.status = 'active';
    this.state.activeQuests.push(quest);

    this.eventBus.emit({
      type: GameEvents.QUEST_STARTED,
      payload: { questId },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });

    return true;
  }

  updateQuestProgress(questId: string, objectiveId: string, progress: number): void {
    const quest = this.state.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    objective.currentProgress = Math.min(objective.requiredProgress, objective.currentProgress + progress);

    if (objective.currentProgress >= objective.requiredProgress && !objective.isCompleted) {
      objective.isCompleted = true;
      this.checkQuestCompletion(quest);
    }

    this.eventBus.emit({
      type: GameEvents.QUEST_OBJECTIVE_UPDATED,
      payload: { questId, objectiveId, progress: objective.currentProgress },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });
  }

  private checkQuestCompletion(quest: Quest): void {
    const allObjectivesCompleted = quest.objectives.every(obj => obj.isCompleted);

    if (allObjectivesCompleted) {
      quest.status = 'completed';
      this.state.completedQuests.push(quest.id);

      // Remove from active quests
      this.state.activeQuests = this.state.activeQuests.filter(q => q.id !== quest.id);

      // Grant rewards
      this.grantQuestRewards(quest);

      this.eventBus.emit({
        type: GameEvents.QUEST_COMPLETED,
        payload: { questId: quest.id, rewards: quest.rewards },
        timestamp: Date.now(),
        source: 'narrativeDomain'
      });
    }
  }

  private grantQuestRewards(quest: Quest): void {
    quest.rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          this.eventBus.emit({
            type: GameEvents.EXPERIENCE_REWARD,
            payload: { amount: reward.amount },
            timestamp: Date.now(),
            source: 'narrativeDomain'
          });
          break;

        case 'item':
          this.eventBus.emit({
            type: GameEvents.ITEM_REWARD,
            payload: { itemId: reward.itemId, quantity: reward.quantity },
            timestamp: Date.now(),
            source: 'narrativeDomain'
          });
          break;

        case 'emotional':
          this.updateEmotionalState(reward.emotionalChanges);
          break;
      }
    });
  }

  setStoryFlag(flag: string, value: any): void {
    this.state.storyFlags.set(flag, value);
  }

  getStoryFlag(flag: string): any {
    return this.state.storyFlags.get(flag);
  }

  updateRelationship(characterId: string, changes: Partial<RelationshipState>): void {
    let relationship = this.state.relationshipStates.get(characterId);

    if (!relationship) {
      relationship = {
        characterId,
        affection: 0,
        trust: 50,
        lastInteraction: Date.now(),
        relationshipLevel: 'neutral'
      };
      this.state.relationshipStates.set(characterId, relationship);
    }

    Object.assign(relationship, changes);
    relationship.lastInteraction = Date.now();

    // Update relationship level based on affection
    relationship.relationshipLevel = this.calculateRelationshipLevel(relationship.affection);

    this.eventBus.emit({
      type: GameEvents.RELATIONSHIP_CHANGED,
      payload: { characterId, changes, newState: { ...relationship } },
      timestamp: Date.now(),
      source: 'narrativeDomain'
    });
  }

  private calculateRelationshipLevel(affection: number): RelationshipLevel {
    if (affection <= -80) return 'enemy';
    if (affection <= -30) return 'disliked';
    if (affection <= 30) return 'neutral';
    if (affection <= 70) return 'friendly';
    if (affection <= 90) return 'trusted';
    return 'loved';
  }

  // Database loading methods
  private async loadMainQuestEvents(): Promise<MainQuestEvent[]> {
    const response = await fetch('/data/narrative/mainQuest.json');
    const data = await response.json();
    return data.events;
  }

  private getQuestDefinition(questId: string): Quest | null {
    // Would load from quest database
    return null;
  }

  // Helper methods for trigger evaluation
  private checkRequiredFlags(flags?: string[]): boolean {
    if (!flags) return true;
    return flags.every(flag => this.state.storyFlags.get(flag) === true);
  }

  private checkBlockingFlags(flags?: string[]): boolean {
    if (!flags) return false;
    return flags.some(flag => this.state.storyFlags.get(flag) === true);
  }

  private checkSurvivalDays(trigger: QuestTrigger): boolean {
    // Would check time system
    return false;
  }

  private checkBiomeEntered(trigger: QuestTrigger): boolean {
    return this.state.storyFlags.get(`entered_biome_${trigger.biome}`) === true;
  }

  private checkLevelUp(trigger: QuestTrigger): boolean {
    return this.state.storyFlags.get(`reached_level_${trigger.level}`) === true;
  }

  private checkLocationReached(trigger: QuestTrigger): boolean {
    return this.state.storyFlags.get(`reached_${trigger.x}_${trigger.y}`) === true;
  }

  private getInitialEmotionalState(): EmotionalState {
    return {
      trust: 30,      // Starting with low trust
      hope: 20,       // Starting with low hope
      guilt: 10,      // Some initial guilt
      determination: 80, // High determination
      despair: 5,     // Low despair
      love: 40        // Moderate capacity for love
    };
  }
}
```

**Database Main Quest (Estratto e Strutturato dal v1.0):**
```json
// data/narrative/mainQuest.json
{
  "events": [
    {
      "id": "mq_01_beginning",
      "stage": 1,
      "title": "Ricordo: La Separazione",
      "description": "Ti svegli in un mondo che non riconosci più. La tua casa è distrutta, tua madre è scomparsa. Frammenti di ricordi ti tormentano: una promessa fatta, un viaggio intrapreso. Perché sei qui? Cosa è successo alla mamma?",
      "trigger": { "type": "progress", "value": 0 },
      "consequences": [{ "type": "sequence", "sequenceId": "mother_separation" }],
      "emotionalImpact": { "guilt": 15, "despair": 10, "determination": 20 },
      "requiredFlags": [],
      "blocksFlags": []
    },
    {
      "id": "mq_02_first_steps",
      "stage": 2,
      "title": "Ricordo: I Primi Passi",
      "description": "Hai lasciato la tua casa distrutta. Il mondo esterno è vasto e pericoloso. Ogni passo ti allontana da ciò che conoscevi, ma ti avvicina alla verità. Dove andare? Chi cercare?",
      "trigger": { "type": "survival_days", "value": 1 },
      "consequences": [{ "type": "sequence", "sequenceId": "first_steps" }],
      "emotionalImpact": { "hope": -5, "determination": 10 },
      "requiredFlags": ["started_journey"],
      "blocksFlags": []
    },
    {
      "id": "mq_03_encounter",
      "stage": 3,
      "title": "Ricordo: Il Primo Incontro",
      "description": "Nel tuo cammino verso la città, incontri altri sopravvissuti. Alcuni amichevoli, altri ostili. Le loro storie si intrecciano con la tua ricerca. Puoi fidarti di loro?",
      "trigger": { "type": "enter_biome", "biome": "city" },
      "consequences": [{ "type": "sequence", "sequenceId": "first_encounter" }],
      "emotionalImpact": { "trust": -10, "hope": 5 },
      "requiredFlags": ["reached_city"],
      "blocksFlags": []
    },
    {
      "id": "mq_04_darkness",
      "stage": 4,
      "title": "Ricordo: L'Oscurità Interiore",
      "description": "Sono passati giorni dalla tua partenza. La fame ti tormenta, il sonno è un lusso raro. Dubbi iniziano a insinuarsi: è valsa la pena lasciare tutto per una ricerca senza fine?",
      "trigger": { "type": "survival_days", "value": 7 },
      "consequences": [{ "type": "sequence", "sequenceId": "inner_darkness" }],
      "emotionalImpact": { "despair": 20, "determination": -15, "hope": -10 },
      "requiredFlags": ["survived_week"],
      "blocksFlags": []
    },
    {
      "id": "mq_05_question",
      "stage": 5,
      "title": "Ricordo: La Domanda",
      "description": "Raggiungi un fiume che segna un confine naturale. L'acqua scorre ancora, indifferente alle sofferenze umane. Ti fermi a riflettere: perché continui? Cosa speri di trovare?",
      "trigger": { "type": "enter_biome", "biome": "river" },
      "consequences": [{ "type": "sequence", "sequenceId": "the_question" }],
      "emotionalImpact": { "guilt": 10, "love": 15, "determination": 25 },
      "requiredFlags": ["reached_river"],
      "blocksFlags": []
    },
    {
      "id": "mq_06_reflection",
      "stage": 6,
      "title": "Ricordo: Riflessioni Notturne",
      "description": "Mentre riposi in un rifugio abbandonato, i ricordi della tua infanzia tornano. Tua madre che ti canta la ninnananna, le sue braccia che ti proteggono. Era tutto reale?",
      "trigger": { "type": "use_item", "itemId": "emergency_info" },
      "consequences": [{ "type": "sequence", "sequenceId": "night_reflections" }],
      "emotionalImpact": { "love": 20, "guilt": 15, "hope": 10 },
      "requiredFlags": ["found_emergency_info"],
      "blocksFlags": []
    },
    {
      "id": "mq_07_desperation",
      "stage": 7,
      "title": "Ricordo: Disperazione",
      "description": "Le tue condizioni peggiorano. La fame è costante, le ferite non guariscono. Incontri altri sopravvissuti che hanno perso ogni speranza. Ti riconosci in loro?",
      "trigger": { "type": "survival_stat", "stat": "health", "value": 25 },
      "consequences": [{ "type": "sequence", "sequenceId": "desperation" }],
      "emotionalImpact": { "despair": 30, "hope": -20, "determination": -10 },
      "requiredFlags": ["became_desperate"],
      "blocksFlags": []
    },
    {
      "id": "mq_08_memory",
      "stage": 8,
      "title": "Ricordo: Il Ricordo Perduto",
      "description": "In un momento di quiete, un frammento di memoria riaffiora. Tua madre che ti sussurra qualcosa all'orecchio, un messaggio urgente. Cosa stava cercando di dirti?",
      "trigger": { "type": "emotional_state", "emotion": "love", "value": 60 },
      "consequences": [{ "type": "sequence", "sequenceId": "lost_memory" }],
      "emotionalImpact": { "love": 25, "hope": 15, "guilt": 10 },
      "requiredFlags": ["emotional_breakthrough"],
      "blocksFlags": []
    },
    {
      "id": "mq_09_name",
      "stage": 9,
      "title": "Ricordo: Il Nome",
      "description": "Dopo una settimana di viaggio, realizzi qualcosa di fondamentale. Il tuo nome, Ultimo, non è casuale. È parte di un messaggio più grande che tua madre ti ha lasciato.",
      "trigger": { "type": "survival_days", "value": 14 },
      "consequences": [{ "type": "sequence", "sequenceId": "the_name" }],
      "emotionalImpact": { "determination": 30, "hope": 20, "trust": 15 },
      "requiredFlags": ["discovered_name_meaning"],
      "blocksFlags": []
    },
    {
      "id": "mq_10_revelation",
      "stage": 10,
      "title": "Ricordo: La Rivelazione",
      "description": "Mentre esplori un villaggio abbandonato, trovi indizi che collegano tutto. Tua madre sapeva cosa sarebbe successo. Ti ha preparato per questo viaggio.",
      "trigger": { "type": "enter_biome", "biome": "village" },
      "consequences": [{ "type": "sequence", "sequenceId": "the_revelation" }],
      "emotionalImpact": { "trust": 25, "love": 30, "guilt": -15 },
      "requiredFlags": ["found_village_clues"],
      "blocksFlags": []
    },
    {
      "id": "mq_11_confession",
      "stage": 11,
      "title": "Ricordo: La Confessione",
      "description": "Raggiungi il luogo che tua madre ti ha indicato. Qui, finalmente, trovi le risposte che cercavi. La verità sulla tua famiglia, sul mondo, su te stesso.",
      "trigger": { "type": "reach_location", "x": 140, "y": 140 },
      "consequences": [{ "type": "sequence", "sequenceId": "the_confession" }],
      "emotionalImpact": { "love": 40, "hope": 35, "despair": -30, "determination": 20 },
      "requiredFlags": ["reached_destination"],
      "blocksFlags": []
    },
    {
      "id": "mq_12_lullaby",
      "stage": 12,
      "title": "La Ninnananna della Cenere",
      "description": "Il momento culminante è arrivato. Tutte le condizioni sono allineate. La verità su tua madre si rivela finalmente, in una sequenza narrativa di 7 pagine che cambierà per sempre la tua comprensione del mondo.",
      "trigger": { "type": "reach_end" },
      "consequences": [{ "type": "sequence", "sequenceId": "lullaby_of_ashes" }],
      "emotionalImpact": { "love": 50, "hope": 50, "guilt": -50, "despair": -50 },
      "requiredFlags": ["ready_for_truth"],
      "blocksFlags": []
    }
  ]
}
```

---

## **5. SISTEMI DI GIOCO**

### **5.1 Meccaniche D&D**

**Sistema di Caratteristiche (Ability Scores):**
```typescript
// D&D 5e standard ability scores
export const ABILITIES = {
  STRENGTH: 'strength',       // Forza - sollevamento, danni corpo a corpo
  DEXTERITY: 'dexterity',     // Destrezza - agilità, precisione
  CONSTITUTION: 'constitution', // Costituzione - salute, resistenza
  INTELLIGENCE: 'intelligence', // Intelligenza - conoscenza, magia
  WISDOM: 'wisdom',           // Saggezza - percezione, intuizione
  CHARISMA: 'charisma'        // Carisma - persuasione, leadership
} as const;

// Modificatore di abilità (D&D standard)
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Proficiency bonus basato sul livello
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}
```

**Sistema di Combattimento:**
```typescript
// Combat mechanics
export interface CombatRound {
  attacker: Character;
  defender: Character;
  attackRoll: number;
  defenseRoll: number;
  damage: number;
  hit: boolean;
  critical: boolean;
}

export class CombatSystem {
  static async resolveAttack(attacker: Character, defender: Character): Promise<CombatRound> {
    // Attack roll (d20 + modifiers)
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const attackModifier = getAbilityModifier(attacker.dexterity);
    const proficiencyBonus = attacker.proficiencies.includes('weapons') ?
      getProficiencyBonus(attacker.level) : 0;

    const totalAttack = attackRoll + attackModifier + proficiencyBonus;

    // Defense (Armor Class)
    const defense = defender.armorClass;

    // Determine hit
    const hit = totalAttack >= defense;
    const critical = attackRoll === 20;

    let damage = 0;
    if (hit) {
      // Damage roll
      const weapon = attacker.equipment.weapon;
      damage = this.rollWeaponDamage(weapon);

      if (critical) {
        damage *= 2; // Critical hit doubles damage
      }

      // Apply damage
      defender.currentHP -= damage;
    }

    return {
      attacker,
      defender,
      attackRoll,
      defenseRoll: defense,
      damage,
      hit,
      critical
    };
  }

  private static rollWeaponDamage(weapon: Weapon): number {
    // Parse damage dice (e.g., "1d8+3")
    const diceMatch = weapon.damage.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!diceMatch) return 0;

    const numDice = parseInt(diceMatch[1]);
    const dieSize = parseInt(diceMatch[2]);
    const bonus = parseInt(diceMatch[3] || '0');

    let total = bonus;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * dieSize) + 1;
    }

    return total;
  }
}
```

### **5.2 Sistema di Movimento**

**Movement System con Time Integration:**
```typescript
export class MovementSystem {
  private static readonly BASE_MOVEMENT_TIME = 10; // minuti per tile
  private static readonly DIAGONAL_MULTIPLIER = 1.414; // √2
  private static readonly TERRAIN_MULTIPLIERS = {
    'plains': 1.0,
    'forest': 1.2,
    'mountain': 3.0,
    'city': 1.5,
    'village': 1.1,
    'river': 2.0
  };

  static calculateMovementTime(
    fromPos: Position,
    toPos: Position,
    biome: Biome,
    weather: WeatherState,
    character: Character
  ): number {
    // Base distance calculation
    const distance = this.getDistance(fromPos, toPos);
    const isDiagonal = this.isDiagonalMove(fromPos, toPos);

    // Base time
    let time = this.BASE_MOVEMENT_TIME * distance;

    // Diagonal movement penalty
    if (isDiagonal) {
      time *= this.DIAGONAL_MULTIPLIER;
    }

    // Terrain modifier
    const terrainMultiplier = this.TERRAIN_MULTIPLIERS[biome.id] || 1.0;
    time *= terrainMultiplier;

    // Weather modifier
    const weatherModifier = weather.movementModifier || 1.0;
    time *= weatherModifier;

    // Character modifiers (fatigue, injuries)
    const characterModifier = this.getCharacterMovementModifier(character);
    time *= characterModifier;

    return Math.round(time);
  }

  private static getDistance(from: Position, to: Position): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    return Math.sqrt(dx * dx + dy * dy);
  }

  private static isDiagonalMove(from: Position, to: Position): boolean {
    return Math.abs(to.x - from.x) > 0 && Math.abs(to.y - from.y) > 0;
  }

  private static getCharacterMovementModifier(character: Character): number {
    let modifier = 1.0;

    // Fatigue penalty
    if (character.fatigue > 50) {
      modifier *= 1.2;
    }
    if (character.fatigue > 80) {
      modifier *= 1.5;
    }

    // Injury penalty
    if (character.healthStatus === 'injured') {
      modifier *= 1.3;
    }
    if (character.healthStatus === 'wounded') {
      modifier *= 1.6;
    }

    // Equipment penalty
    const totalWeight = this.calculateEquipmentWeight(character.equipment);
    const weightRatio = totalWeight / character.maxCarryWeight;
    if (weightRatio > 0.8) {
      modifier *= 1.4;
    }

    return modifier;
  }

  private static calculateEquipmentWeight(equipment: Equipment): number {
    let total = 0;
    // Sum weights of all equipped items
    return total;
  }
}
```

### **5.3 Sistema di Eventi Dinamici**

**Event System con Conditional Logic:**
```typescript
export class EventSystem {
  private events: Map<string, GameEvent[]> = new Map();
  private eventHistory: string[] = [];

  async loadEvents(): Promise<void> {
    // Load all event databases
    const eventTypes = ['biome', 'random', 'quest', 'special'];

    for (const type of eventTypes) {
      const events = await this.loadEventDatabase(type);
      this.events.set(type, events);
    }
  }

  getRandomEvent(biome?: string, context?: EventContext): GameEvent | null {
    let availableEvents: GameEvent[] = [];

    if (biome) {
      // Get biome-specific events
      const biomeEvents = this.events.get('biome') || [];
      availableEvents = biomeEvents.filter(event =>
        event.biome === biome && this.canTriggerEvent(event, context)
      );
    }

    // Add random events
    const randomEvents = this.events.get('random') || [];
    availableEvents.push(...randomEvents.filter(event =>
      this.canTriggerEvent(event, context)
    ));

    if (availableEvents.length === 0) return null;

    // Weight selection by rarity
    const weightedEvents = this.applyEventWeights(availableEvents);
    return this.selectWeightedEvent(weightedEvents);
  }

  private canTriggerEvent(event: GameEvent, context?: EventContext): boolean {
    // Check if event was already seen (if unique)
    if (event.isUnique && this.eventHistory.includes(event.id)) {
      return false;
    }

    // Check time of day restrictions
    if (event.timeRestriction) {
      const currentTime = context?.timeOfDay;
      if (!event.timeRestriction.includes(currentTime)) {
        return false;
      }
    }

    // Check weather restrictions
    if (event.weatherRestriction) {
      const currentWeather = context?.weather;
      if (!event.weatherRestriction.includes(currentWeather)) {
        return false;
      }
    }

    // Check character level requirements
    if (event.minLevel && context?.characterLevel) {
      if (context.characterLevel < event.minLevel) {
        return false;
      }
    }

    // Check narrative flags
    if (event.requiredFlags) {
      for (const flag of event.requiredFlags) {
        if (!this.checkNarrativeFlag(flag)) {
          return false;
        }
      }
    }

    return true;
  }

  private applyEventWeights(events: GameEvent[]): WeightedEvent[] {
    return events.map(event => ({
      event,
      weight: this.calculateEventWeight(event)
    }));
  }

  private calculateEventWeight(event: GameEvent): number {
    let weight = event.baseWeight || 1;

    // Adjust based on event history (reduce repetition)
    const timesSeen = this.eventHistory.filter(id => id === event.id).length;
    weight *= Math.pow(0.5, timesSeen); // Exponential decay

    // Adjust based on rarity
    switch (event.rarity) {
      case 'common': weight *= 1.0; break;
      case 'uncommon': weight *= 0.7; break;
      case 'rare': weight *= 0.3; break;
      case 'epic': weight *= 0.1; break;
      case 'legendary': weight *= 0.05; break;
    }

    return weight;
  }

  private selectWeightedEvent(weightedEvents: WeightedEvent[]): GameEvent {
    const totalWeight = weightedEvents.reduce((sum, we) => sum + we.weight, 0);
    let random = Math.random() * totalWeight;

    for (const weightedEvent of weightedEvents) {
      random -= weightedEvent.weight;
      if (random <= 0) {
        return weightedEvent.event;
      }
    }

    // Fallback to first event
    return weightedEvents[0].event;
  }

  triggerEvent(event: GameEvent): void {
    // Mark as seen
    if (event.id) {
      this.eventHistory.push(event.id);
    }

    // Emit event trigger
    this.eventBus.emit({
      type: GameEvents.EVENT_TRIGGERED,
      payload: { eventId: event.id, event },
      timestamp: Date.now(),
      source: 'eventSystem'
    });
  }

  private checkNarrativeFlag(flag: string): boolean {
    // Delegate to narrative domain
    return false; // Placeholder
  }

  private async loadEventDatabase(type: string): Promise<GameEvent[]> {
    const response = await fetch(`/data/events/${type}_events.json`);
    const data = await response.json();
    return data.events || [];
  }
}
```

---

*Continua con UI/UX Design, Database e Testing in GDD4.md...*