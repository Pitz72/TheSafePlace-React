import { useNarrativeStore } from '../stores/narrative/narrativeStore';
import { useEventStore } from '../stores/events/eventStore';
import { useCombatStore } from '../stores/combatStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useWorldStore } from '../stores/world/worldStore';
import {
  QuestStage,
  LoreEvent,
  QuestFragment,
  MoralAlignment,
  TextTone,
  EmotionalState
} from '../interfaces/narrative';
import type { GameEvent } from '../interfaces/events';

/**
 * Servizio per integrare il sistema narrativo con gli eventi esistenti
 */
export class NarrativeIntegrationService {
  private static instance: NarrativeIntegrationService;

  public static getInstance(): NarrativeIntegrationService {
    if (!NarrativeIntegrationService.instance) {
      NarrativeIntegrationService.instance = new NarrativeIntegrationService();
    }
    return NarrativeIntegrationService.instance;
  }

  /**
   * Inizializza l'integrazione narrativa
   */
  public initialize(): void {
    this.setupEventListeners();
    this.loadNarrativeData();
  }

  /**
   * Configura i listener per gli eventi del gioco
   */
  private setupEventListeners(): void {
    // Listener per eventi di combattimento
    this.setupCombatListeners();
    
    // Listener per eventi del mondo
    this.setupWorldListeners();
    
    // Listener per eventi del personaggio
    this.setupCharacterListeners();
  }

  /**
   * Configura i listener per il combattimento
   */
  private setupCombatListeners(): void {
    const combatStore = useCombatStore.getState();
    
    // Intercetta la fine del combattimento per trigger narrativi
    const originalEndCombat = combatStore.endCombat;
    combatStore.endCombat = (victory: boolean) => {
      originalEndCombat.call(combatStore, victory);
      this.handleCombatEnd(victory);
    };
  }

  /**
   * Configura i listener per il mondo
   */
  private setupWorldListeners(): void {
    const worldStore = useWorldStore.getState();
    
    // Intercetta i cambi di bioma per trigger narrativi
    const originalUpdateBiome = worldStore.updateBiome;
    worldStore.updateBiome = (newBiome: string) => {
      const oldBiome = worldStore.currentBiome;
      originalUpdateBiome.call(worldStore, newBiome);
      this.handleBiomeChange(oldBiome, newBiome);
    };
  }

  /**
   * Configura i listener per il personaggio
   */
  private setupCharacterListeners(): void {
    const characterStore = useCharacterStore.getState();
    
    // Intercetta i cambi di HP per trigger narrativi
    const originalUpdateHP = characterStore.updateHP;
    characterStore.updateHP = (change: number) => {
      const oldHP = characterStore.character.hp;
      originalUpdateHP.call(characterStore, change);
      const newHP = characterStore.character.hp;
      this.handleHPChange(oldHP, newHP, change);
    };
  }

  /**
   * Carica i dati narrativi
   */
  private async loadNarrativeData(): Promise<void> {
    try {
      const narrativeStore = useNarrativeStore.getState();
      narrativeStore.initializeNarrative();
    } catch (error) {
      console.error('Errore nel caricamento dei dati narrativi:', error);
    }
  }

  /**
   * Gestisce la fine del combattimento
   */
  private handleCombatEnd(victory: boolean): void {
    const narrativeStore = useNarrativeStore.getState();
    const { currentQuestStage, emotionalState } = narrativeStore;

    // Aggiorna lo stato emotivo in base al risultato del combattimento
    if (victory) {
      // Vittoria aumenta pragmatismo (approccio di Elian)
      narrativeStore.updateEmotionalState({
        pragmatismLevel: Math.min(100, emotionalState.pragmatismLevel + 5),
        understandingLevel: Math.min(100, emotionalState.understandingLevel + 2)
      });
    } else {
      // Sconfitta aumenta compassione (riflessione di Lena)
      narrativeStore.updateEmotionalState({
        compassionLevel: Math.min(100, emotionalState.compassionLevel + 5),
        lenaMemoryStrength: Math.min(100, emotionalState.lenaMemoryStrength + 3)
      });
    }

    // Trigger eventi narrativi post-combattimento
    this.checkForNarrativeEvents('combat_end', { victory });
  }

  /**
   * Gestisce i cambi di bioma
   */
  private handleBiomeChange(oldBiome: string, newBiome: string): void {
    const narrativeStore = useNarrativeStore.getState();
    
    // Aggiorna lo stato emotivo in base al bioma
    const biomeEmotionalEffects = {
      'forest': { lenaMemoryStrength: 2, compassionLevel: 1 },
      'city': { pragmatismLevel: 2, understandingLevel: 1 },
      'plains': { understandingLevel: 1 },
      'village': { compassionLevel: 2, lenaMemoryStrength: 1 }
    };

    const effect = biomeEmotionalEffects[newBiome as keyof typeof biomeEmotionalEffects];
    if (effect) {
      const currentState = narrativeStore.emotionalState;
      const updates: Partial<EmotionalState> = {};
      
      Object.entries(effect).forEach(([key, value]) => {
        const currentValue = currentState[key as keyof EmotionalState] as number;
        updates[key as keyof EmotionalState] = Math.min(100, currentValue + value) as any;
      });
      
      narrativeStore.updateEmotionalState(updates);
    }

    // Trigger eventi narrativi per cambio bioma
    this.checkForNarrativeEvents('biome_change', { oldBiome, newBiome });
  }

  /**
   * Gestisce i cambi di HP
   */
  private handleHPChange(oldHP: number, newHP: number, change: number): void {
    const narrativeStore = useNarrativeStore.getState();
    
    // Se il giocatore è gravemente ferito, aumenta la memoria di Lena
    if (newHP < 30 && change < 0) {
      narrativeStore.updateEmotionalState({
        lenaMemoryStrength: Math.min(100, narrativeStore.emotionalState.lenaMemoryStrength + 3),
        compassionLevel: Math.min(100, narrativeStore.emotionalState.compassionLevel + 2)
      });
      
      this.checkForNarrativeEvents('low_health', { hp: newHP });
    }
  }

  /**
   * Controlla e trigger eventi narrativi basati su condizioni
   */
  private checkForNarrativeEvents(eventType: string, context: any): void {
    const narrativeStore = useNarrativeStore.getState();
    const { currentQuestStage, emotionalState, availableLoreEvents } = narrativeStore;

    // Filtra eventi disponibili per il tipo e le condizioni
    const eligibleEvents = availableLoreEvents.filter(event => {
      // Controlla requisiti di stage
      if (event.questStageRequirement && event.questStageRequirement !== currentQuestStage) {
        return false;
      }

      // Controlla prerequisiti emotivi
      if (event.emotionalPrerequisites) {
        const prereq = event.emotionalPrerequisites;
        if (prereq.minCompassion && emotionalState.compassionLevel < prereq.minCompassion) return false;
        if (prereq.minPragmatism && emotionalState.pragmatismLevel < prereq.minPragmatism) return false;
        if (prereq.minUnderstanding && emotionalState.understandingLevel < prereq.minUnderstanding) return false;
        if (prereq.minLenaMemory && emotionalState.lenaMemoryStrength < prereq.minLenaMemory) return false;
      }

      // Controlla categoria evento
      if (eventType === 'combat_end' && event.category !== 'combattimento') return false;
      if (eventType === 'biome_change' && event.category !== 'esplorazione') return false;
      if (eventType === 'low_health' && event.category !== 'sopravvivenza') return false;

      return true;
    });

    // Se ci sono eventi eligibili, trigger il primo
    if (eligibleEvents.length > 0) {
      const selectedEvent = eligibleEvents[0];
      this.triggerNarrativeEvent(selectedEvent);
    }
  }

  /**
   * Trigger un evento narrativo
   */
  public triggerNarrativeEvent(event: LoreEvent): void {
    const eventStore = useEventStore.getState();
    
    // Converte l'evento narrativo in un evento del sistema esistente
    const gameEvent: GameEvent = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      choices: event.choices.map(choice => ({
        text: choice.text,
        resultText: choice.reflectionText,
        actions: [
          {
            type: 'log',
            payload: { message: choice.reflectionText }
          },
          {
            type: 'narrative_choice',
            payload: {
              alignment: choice.alignment,
              emotionalImpact: choice.emotionalImpact
            }
          }
        ]
      }))
    };

    // Trigger l'evento attraverso il sistema esistente
    eventStore.triggerEvent(gameEvent);
  }

  /**
   * Trigger un frammento di quest
   */
  public triggerQuestFragment(fragment: QuestFragment): void {
    const eventStore = useEventStore.getState();
    
    const gameEvent: GameEvent = {
      id: fragment.id,
      title: fragment.title,
      description: '',
      choices: [{
        text: 'Continua...',
        resultText: fragment.narrativeText,
        actions: [{
          type: 'log',
          payload: { message: fragment.narrativeText }
        }]
      }]
    };

    eventStore.triggerEvent(gameEvent);
  }

  /**
   * Controlla se è il momento di avanzare la quest principale
   */
  public checkQuestProgression(): void {
    const narrativeStore = useNarrativeStore.getState();
    const { currentQuestStage, discoveredFragments, emotionalState } = narrativeStore;

    // Logica per avanzamento automatico della quest
    const stageFragments = discoveredFragments.filter(f => f.questStage === currentQuestStage);
    const requiredFragments = this.getRequiredFragmentsForStage(currentQuestStage);

    if (stageFragments.length >= requiredFragments) {
      // Controlla se le condizioni emotive sono soddisfatte
      if (this.checkEmotionalRequirementsForAdvancement(currentQuestStage, emotionalState)) {
        narrativeStore.advanceQuestStage();
      }
    }
  }

  /**
   * Ottiene il numero di frammenti richiesti per uno stage
   */
  private getRequiredFragmentsForStage(stage: QuestStage): number {
    const requirements = {
      [QuestStage.TESTAMENTO]: 3,
      [QuestStage.RICORDI_LENA]: 4,
      [QuestStage.DILEMMA_MORALE]: 3,
      [QuestStage.RIVELAZIONE]: 2,
      [QuestStage.SCELTA_FINALE]: 1
    };
    return requirements[stage] || 3;
  }

  /**
   * Controlla i requisiti emotivi per l'avanzamento
   */
  private checkEmotionalRequirementsForAdvancement(stage: QuestStage, emotional: EmotionalState): boolean {
    switch (stage) {
      case QuestStage.TESTAMENTO:
        return emotional.understandingLevel >= 20;
      case QuestStage.RICORDI_LENA:
        return emotional.lenaMemoryStrength >= 40;
      case QuestStage.DILEMMA_MORALE:
        return emotional.compassionLevel >= 30 || emotional.pragmatismLevel >= 30;
      case QuestStage.RIVELAZIONE:
        return emotional.understandingLevel >= 60;
      default:
        return true;
    }
  }

  /**
   * Ottiene lo stato attuale dell'integrazione narrativa
   */
  public getIntegrationStatus() {
    const narrativeStore = useNarrativeStore.getState();
    return {
      currentStage: narrativeStore.currentQuestStage,
      emotionalState: narrativeStore.emotionalState,
      discoveredFragments: narrativeStore.discoveredFragments.length,
      availableEvents: narrativeStore.availableLoreEvents.length,
      moralChoices: narrativeStore.moralChoices.length
    };
  }
}

// Esporta l'istanza singleton
export const narrativeIntegration = NarrativeIntegrationService.getInstance();