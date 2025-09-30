import { useNarrativeStore } from '../stores/narrative/narrativeStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useWorldStore } from '../stores/world/worldStore';
import { useCombatStore } from '../stores/combatStore';
import { useTimeStore } from '../stores/time/timeStore';
import { QuestStage, EmotionalState, LoreEvent } from '../interfaces/narrative';
import { createLogger } from './loggerService';

const logger = createLogger('STORY_PROGRESSION');

export class StoryProgressionService {
  private static instance: StoryProgressionService;
  private progressionTimer: NodeJS.Timeout | null = null;
  private lastProgressionCheck = 0;
  private readonly PROGRESSION_INTERVAL = 30000; // 30 secondi

  static getInstance(): StoryProgressionService {
    if (!StoryProgressionService.instance) {
      StoryProgressionService.instance = new StoryProgressionService();
    }
    return StoryProgressionService.instance;
  }

  startProgressionSystem(): void {
    if (this.progressionTimer) {
      clearInterval(this.progressionTimer);
    }

    this.progressionTimer = setInterval(() => {
      this.checkStoryProgression();
    }, this.PROGRESSION_INTERVAL);

    logger.info('Sistema di progressione narrativa avviato');
  }

  stopProgressionSystem(): void {
    if (this.progressionTimer) {
      clearInterval(this.progressionTimer);
      this.progressionTimer = null;
    }
  }

  private checkStoryProgression(): void {
    const now = Date.now();
    if (now - this.lastProgressionCheck < this.PROGRESSION_INTERVAL) {
      return;
    }

    this.lastProgressionCheck = now;
    
    // Accesso diretto agli store senza hooks
    const narrativeState = useNarrativeStore.getState();
    const characterState = useCharacterStore.getState();
    const worldState = useWorldStore.getState();
    const timeState = useTimeStore.getState();

    // Controlla se è il momento di avanzare la quest principale
    this.checkMainQuestProgression(narrativeState, characterState, worldState, timeState);
    
    // Controlla se triggerare eventi lore
    this.checkLoreEventTriggers(narrativeState, characterState, worldState, timeState);
    
    // Aggiorna lo stato emotivo basato sulle azioni del giocatore
    this.updateEmotionalProgression(narrativeState, characterState);
  }

  private checkMainQuestProgression(
    narrativeState: any,
    characterState: any,
    worldState: any,
    timeState: any
  ): void {
    const currentQuest = narrativeState.currentMainQuest;
    if (!currentQuest) return;

    const currentStage = currentQuest.stages.find(
      (stage: QuestStage) => stage.id === currentQuest.currentStageId
    );

    if (!currentStage) return;

    // Controlla le condizioni di completamento dello stage
    const stageCompleted = this.checkStageCompletion(
      currentStage,
      narrativeState,
      characterState,
      worldState,
      timeState
    );

    if (stageCompleted) {
      this.advanceToNextStage(currentQuest, currentStage);
    }
  }

  private checkStageCompletion(
    stage: QuestStage,
    narrativeState: any,
    characterState: any,
    worldState: any,
    timeState: any
  ): boolean {
    // Controlla se tutti i frammenti richiesti sono stati scoperti
    const requiredFragments = stage.fragments.filter(f => f.required);
    const discoveredFragments = narrativeState.discoveredFragments;
    
    const allRequiredFragmentsFound = requiredFragments.every(
      fragment => discoveredFragments.some(
        (discovered: any) => discovered.id === fragment.id
      )
    );

    if (!allRequiredFragmentsFound) return false;

    // Controlla condizioni specifiche dello stage
    if (stage.completionConditions) {
      // Condizioni temporali
      if (stage.completionConditions.minDays && timeState.day < stage.completionConditions.minDays) {
        return false;
      }

      // Condizioni di livello
      if (stage.completionConditions.minLevel && characterState.characterSheet.level < stage.completionConditions.minLevel) {
        return false;
      }

      // Condizioni di posizione
      if (stage.completionConditions.requiredLocation) {
        const currentTile = worldState.mapData?.[worldState.playerPosition.y]?.[worldState.playerPosition.x];
        if (currentTile !== stage.completionConditions.requiredLocation) {
          return false;
        }
      }

      // Condizioni emotive
      if (stage.completionConditions.emotionalState) {
        const currentEmotion = narrativeState.emotionalState;
        const required = stage.completionConditions.emotionalState;
        
        if (currentEmotion.hope < required.hope || 
            currentEmotion.despair < required.despair ||
            currentEmotion.determination < required.determination ||
            currentEmotion.fear < required.fear) {
          return false;
        }
      }
    }

    return true;
  }

  private advanceToNextStage(quest: any, currentStage: QuestStage): void {
    const { advanceMainQuest, addLogEntry } = useNarrativeStore.getState();
    
    const currentIndex = quest.stages.findIndex(
      (stage: QuestStage) => stage.id === currentStage.id
    );
    
    if (currentIndex < quest.stages.length - 1) {
      const nextStage = quest.stages[currentIndex + 1];
      advanceMainQuest(nextStage.id);
      
      addLogEntry({
        id: `stage_${nextStage.id}_started`,
        timestamp: Date.now(),
        type: 'quest',
        message: `Nuovo capitolo: ${nextStage.title}`,
        details: nextStage.description
      });

      logger.info('Quest avanzata al stage', { stageTitle: nextStage.title });
    } else {
      // Quest completata
      addLogEntry({
        id: `quest_${quest.id}_completed`,
        timestamp: Date.now(),
        type: 'quest',
        message: `Quest completata: ${quest.title}`,
        details: 'La storia principale è giunta al termine.'
      });

      logger.info('Quest principale completata!');
    }
  }

  private checkLoreEventTriggers(
    narrativeState: any,
    characterState: any,
    worldState: any,
    timeState: any
  ): void {
    const availableEvents = narrativeState.availableLoreEvents || [];
    const triggeredEvents = narrativeState.triggeredLoreEvents || [];

    for (const event of availableEvents) {
      // Salta eventi già triggerati
      if (triggeredEvents.some((triggered: any) => triggered.id === event.id)) {
        continue;
      }

      // Controlla le condizioni di trigger
      if (this.checkEventTriggerConditions(event, narrativeState, characterState, worldState, timeState)) {
        this.triggerLoreEvent(event);
      }
    }
  }

  private checkEventTriggerConditions(
    event: LoreEvent,
    narrativeState: any,
    characterState: any,
    worldState: any,
    timeState: any
  ): boolean {
    // Controlla stage della quest
    if (event.questStageRequirement) {
      const currentQuest = narrativeState.currentMainQuest;
      if (!currentQuest || currentQuest.currentStageId !== event.questStageRequirement) {
        return false;
      }
    }

    // Controlla prerequisiti emotivi
    if (event.emotionalPrerequisites) {
      const currentEmotion = narrativeState.emotionalState;
      const required = event.emotionalPrerequisites;
      
      if (currentEmotion.hope < required.hope || 
          currentEmotion.despair < required.despair ||
          currentEmotion.determination < required.determination ||
          currentEmotion.fear < required.fear) {
        return false;
      }
    }

    // Controlla condizioni temporali casuali (per eventi spontanei)
    if (event.randomTriggerChance) {
      return Math.random() < event.randomTriggerChance;
    }

    return true;
  }

  private triggerLoreEvent(event: LoreEvent): void {
    const { triggerLoreEvent, addLogEntry } = useNarrativeStore.getState();
    
    triggerLoreEvent(event);
    
    addLogEntry({
      id: `lore_event_${event.id}`,
      timestamp: Date.now(),
      type: 'lore',
      message: 'Nuovo evento narrativo disponibile',
      details: event.title
    });

    logger.info('Evento lore triggerato', { eventTitle: event.title });
  }

  private updateEmotionalProgression(
    narrativeState: any,
    characterState: any
  ): void {
    const { updateEmotionalState } = useNarrativeStore.getState();
    const currentEmotion = narrativeState.emotionalState;
    
    // Decadimento naturale delle emozioni intense nel tempo
    const decayRate = 0.02; // 2% ogni check
    
    const newEmotionalState: EmotionalState = {
      hope: Math.max(0, currentEmotion.hope - (currentEmotion.hope > 50 ? decayRate * 10 : 0)),
      despair: Math.max(0, currentEmotion.despair - (currentEmotion.despair > 50 ? decayRate * 10 : 0)),
      determination: Math.max(0, currentEmotion.determination - (currentEmotion.determination > 70 ? decayRate * 5 : 0)),
      fear: Math.max(0, currentEmotion.fear - (currentEmotion.fear > 60 ? decayRate * 15 : 0))
    };

    // Aggiustamenti basati sullo stato del personaggio
    const hpPercentage = characterState.characterSheet.currentHP / characterState.characterSheet.maxHP;
    
    if (hpPercentage < 0.3) {
      newEmotionalState.fear = Math.min(100, newEmotionalState.fear + 5);
      newEmotionalState.despair = Math.min(100, newEmotionalState.despair + 3);
    } else if (hpPercentage > 0.8) {
      newEmotionalState.hope = Math.min(100, newEmotionalState.hope + 2);
      newEmotionalState.determination = Math.min(100, newEmotionalState.determination + 1);
    }

    updateEmotionalState(newEmotionalState);
  }

  // Metodi pubblici per eventi specifici
  onCombatVictory(): void {
    const { updateEmotionalState } = useNarrativeStore.getState();
    const currentEmotion = useNarrativeStore.getState().emotionalState;
    
    updateEmotionalState({
      ...currentEmotion,
      determination: Math.min(100, currentEmotion.determination + 10),
      hope: Math.min(100, currentEmotion.hope + 5),
      fear: Math.max(0, currentEmotion.fear - 5)
    });
  }

  onCombatDefeat(): void {
    const { updateEmotionalState } = useNarrativeStore.getState();
    const currentEmotion = useNarrativeStore.getState().emotionalState;
    
    updateEmotionalState({
      ...currentEmotion,
      fear: Math.min(100, currentEmotion.fear + 15),
      despair: Math.min(100, currentEmotion.despair + 10),
      determination: Math.max(0, currentEmotion.determination - 5)
    });
  }

  onMoralChoice(choiceImpact: { hope?: number; despair?: number; determination?: number; fear?: number }): void {
    const { updateEmotionalState } = useNarrativeStore.getState();
    const currentEmotion = useNarrativeStore.getState().emotionalState;
    
    const newState = { ...currentEmotion };
    
    if (choiceImpact.hope) newState.hope = Math.min(100, Math.max(0, newState.hope + choiceImpact.hope));
    if (choiceImpact.despair) newState.despair = Math.min(100, Math.max(0, newState.despair + choiceImpact.despair));
    if (choiceImpact.determination) newState.determination = Math.min(100, Math.max(0, newState.determination + choiceImpact.determination));
    if (choiceImpact.fear) newState.fear = Math.min(100, Math.max(0, newState.fear + choiceImpact.fear));
    
    updateEmotionalState(newState);
  }
}

export const storyProgression = StoryProgressionService.getInstance();