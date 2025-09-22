import { useNarrativeStore } from '../stores/narrative/narrativeStore';
import { useEventStore } from '../stores/events/eventStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useWorldStore } from '../stores/world/worldStore';
import { QuestStage } from '../interfaces/narrative';
import type { LoreEvent, QuestFragment, EmotionalState } from '../interfaces/narrative';
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
    // Nota: Il sistema di combattimento è cambiato e ora usa un approccio diverso
    // per gestire gli eventi post-combattimento. Rimuoviamo l'intercettazione diretta.
    console.log('🔧 NARRATIVE DEBUG - Combat listeners setup skipped (API changed)');
  }

  /**
   * Configura i listener per il mondo
   * NOTA: Il worldStore già chiama checkForNarrativeEvents in updatePlayerPosition
   * quando cambia bioma, quindi non serve intercettare updateBiome
   */
  private setupWorldListeners(): void {
    console.log('🔧 NARRATIVE DEBUG - setupWorldListeners: worldStore già gestisce i cambi bioma');
    // Non serve intercettare updateBiome perché updatePlayerPosition già chiama
    // narrativeIntegration.checkForNarrativeEvents quando hasChangedBiome è true
  }

  /**
   * Configura i listener per il personaggio
   */
  private setupCharacterListeners(): void {
    const characterStore = useCharacterStore.getState();
    
    // Intercetta i cambi di HP per trigger narrativi
    const originalUpdateHP = characterStore.updateHP;
    characterStore.updateHP = (change: number) => {
      originalUpdateHP.call(characterStore, change);
      const newHP = characterStore.characterSheet.currentHP;
      this.handleHPChange(newHP, change);
    };
  }

  /**
   * Carica i dati narrativi
   */
  private async loadNarrativeData(): Promise<void> {
    try {
      console.log('📚 NARRATIVE DEBUG - Loading narrative data...');
      const narrativeStore = useNarrativeStore.getState();
      
      console.log('📚 NARRATIVE DEBUG - Before initialization:', {
        availableEvents: narrativeStore.availableLoreEvents.length,
        currentStage: narrativeStore.currentStage,
        emotionalState: narrativeStore.emotionalState
      });
      
      narrativeStore.initializeNarrative();
      
      // Aspetta un momento per permettere l'inizializzazione asincrona
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updatedStore = useNarrativeStore.getState();
      console.log('📚 NARRATIVE DEBUG - After initialization:', {
        availableEvents: updatedStore.availableLoreEvents.length,
        currentStage: updatedStore.currentStage,
        emotionalState: updatedStore.emotionalState,
        eventDetails: updatedStore.availableLoreEvents.map(e => ({
          id: e.id,
          title: e.title,
          locationReq: e.locationRequirement,
          stageReq: e.questStageRequirement
        }))
      });
      
    } catch (error) {
      console.error('❌ NARRATIVE DEBUG - Errore nel caricamento dei dati narrativi:', error);
    }
  }



  /**
   * Gestisce i cambi di HP
   */
  private handleHPChange(newHP: number, change: number): void {
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
  public checkForNarrativeEvents(eventType: string, context: any): void {
    const narrativeStore = useNarrativeStore.getState();
    const { currentStage, emotionalState, availableLoreEvents } = narrativeStore;
    const worldStore = useWorldStore.getState();
    const currentBiome = worldStore.currentBiome;

    console.log('🎭 NARRATIVE DEBUG - checkForNarrativeEvents called:', {
      eventType,
      context,
      currentStage,
      availableEvents: availableLoreEvents.length,
      currentBiome,
      emotionalState,
      availableLoreEventsDetails: availableLoreEvents.map(e => ({ id: e.id, biome: e.locationRequirement }))
    });

    // Filtra eventi disponibili per il tipo e le condizioni
    const eligibleEvents = availableLoreEvents.filter(event => {
      console.log(`🔍 Checking event ${event.id}:`, {
        questStageReq: event.questStageRequirement,
        currentStage,
        locationReq: event.locationRequirement,
        currentBiome,
        emotionalPrereq: event.emotionalPrerequisites,
        isRepeatable: event.isRepeatable,
        completed: event.id ? useEventStore.getState().isEncounterCompleted(event.id) : false
      });


      // Controlla requisiti di stage (deve essere un array che include lo stage corrente)
      if (event.questStageRequirement && !event.questStageRequirement.includes(currentStage)) {
        console.log(`❌ Event ${event.id} rejected: stage requirement not met`);
        return false;
      }

      // Controlla prerequisiti emotivi (usa le proprietà corrette dell'interfaccia)
      // TEMPORANEAMENTE SEMPLIFICATO PER DEBUG
      if (event.emotionalPrerequisites) {
        const prereq = event.emotionalPrerequisites;
        console.log(`🔍 Checking emotional prerequisites for ${event.id}:`, {
          required: prereq,
          current: emotionalState
        });
        
        // Per ora, accetta tutti gli eventi per il debug
        if (event.id === 'thematic_river_reflection') {
          console.log(`✅ Event ${event.id} - DEBUG MODE: accepting river event regardless of emotional state`);
        } else {
          if (prereq.compassionLevel && emotionalState.compassionLevel < prereq.compassionLevel) {
            console.log(`❌ Event ${event.id} rejected: compassion level too low (${emotionalState.compassionLevel} < ${prereq.compassionLevel})`);
            return false;
          }
          if (prereq.pragmatismLevel && emotionalState.pragmatismLevel < prereq.pragmatismLevel) {
            console.log(`❌ Event ${event.id} rejected: pragmatism level too low`);
            return false;
          }
          if (prereq.understandingLevel && emotionalState.understandingLevel < prereq.understandingLevel) {
            console.log(`❌ Event ${event.id} rejected: understanding level too low`);
            return false;
          }
          if (prereq.lenaMemoryStrength && emotionalState.lenaMemoryStrength < prereq.lenaMemoryStrength) {
            console.log(`❌ Event ${event.id} rejected: lena memory strength too low`);
            return false;
          }
          if (prereq.elianEmpathy && emotionalState.elianEmpathy < prereq.elianEmpathy) {
            console.log(`❌ Event ${event.id} rejected: elian empathy too low`);
            return false;
          }
        }
      }

      // Controlla requisiti di location
      if (event.locationRequirement && event.locationRequirement.length > 0 && currentBiome) {
        if (!event.locationRequirement.includes(currentBiome)) {
          console.log(`❌ Event ${event.id} rejected: location requirement not met (needs ${event.locationRequirement}, current: ${currentBiome})`);
          return false;
        }
      }

      // Controlla se l'evento è appropriato per il tipo di trigger
      if (eventType === 'biome_change') {
        // Per cambio bioma, accetta eventi che hanno requisiti di location
        const isValid = event.locationRequirement && currentBiome && event.locationRequirement.includes(currentBiome);
        if (isValid) {
          console.log(`✅ Event ${event.id} passed all checks for biome_change`);
        } else {
          console.log(`❌ Event ${event.id} rejected: not valid for biome_change trigger`);
        }
        return isValid;
      }

      console.log(`✅ Event ${event.id} passed all checks`);
      return true;
    });

    console.log('🎯 NARRATIVE DEBUG - Eligible events found:', {
      count: eligibleEvents.length,
      events: eligibleEvents.map(e => ({ id: e.id, priority: e.priority }))
    });

    // Se ci sono eventi eligibili, trigger il primo (ordinato per priorità)
    if (eligibleEvents.length > 0) {
      const selectedEvent = eligibleEvents.sort((a, b) => b.priority - a.priority)[0];
      console.log('🚀 NARRATIVE DEBUG - Triggering narrative event:', {
        eventId: selectedEvent.id,
        title: selectedEvent.title,
        priority: selectedEvent.priority
      });
      this.triggerNarrativeEvent(selectedEvent);
    } else {
      console.log('⚠️ NARRATIVE DEBUG - No eligible events found for trigger');
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
    const { currentStage, discoveredFragments, emotionalState } = narrativeStore;

    // Logica per avanzamento automatico della quest
    const stageFragments = discoveredFragments.filter(f => f.stage === currentStage);
    const requiredFragments = this.getRequiredFragmentsForStage(currentStage);

    if (stageFragments.length >= requiredFragments) {
      // Controlla se le condizioni emotive sono soddisfatte
      if (this.checkEmotionalRequirementsForAdvancement(currentStage, emotionalState)) {
        narrativeStore.advanceToNextStage();
      }
    }
  }

  /**
   * Ottiene il numero di frammenti richiesti per uno stage
   */
  private getRequiredFragmentsForStage(stage: QuestStage): number {
    switch (stage) {
      case QuestStage.TESTAMENTO_PADRE:
        return 3;
      case QuestStage.RICORDI_LENA:
        return 4;
      case QuestStage.COMPRENSIONE_PASSATO:
        return 3;
      case QuestStage.ACCETTAZIONE:
        return 2;
      case QuestStage.SAFE_PLACE_TROVATO:
        return 1;
      default:
        return 3;
    }
  }

  /**
   * Controlla i requisiti emotivi per l'avanzamento
   */
  private checkEmotionalRequirementsForAdvancement(stage: QuestStage, emotional: EmotionalState): boolean {
    switch (stage) {
      case QuestStage.TESTAMENTO_PADRE:
        return emotional.understandingLevel >= 20;
      case QuestStage.RICORDI_LENA:
        return emotional.lenaMemoryStrength >= 40;
      case QuestStage.COMPRENSIONE_PASSATO:
        return emotional.compassionLevel >= 30 || emotional.pragmatismLevel >= 30;
      case QuestStage.ACCETTAZIONE:
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
      currentStage: narrativeStore.currentStage,
      emotionalState: narrativeStore.emotionalState,
      discoveredFragments: narrativeStore.discoveredFragments.length,
      availableEvents: narrativeStore.availableLoreEvents.length,
      moralChoices: narrativeStore.moralChoices.length
    };
  }

  /**
   * Metodo di debug per testare manualmente gli eventi narrativi
   */
  public debugTriggerRiverEvent(): void {
    console.log('🧪 DEBUG - Forcing river event trigger...');
    const worldStore = useWorldStore.getState();
    console.log('🧪 DEBUG - Current biome:', worldStore.currentBiome);
    
    // Forza il bioma a river se non lo è già
    if (worldStore.currentBiome !== 'river') {
      console.log('🧪 DEBUG - Cannot force biome change - worldStore.setBiome not available');
    }
    
    // Trigger manuale dell'evento
    this.checkForNarrativeEvents('biome_change', { oldBiome: 'forest', newBiome: 'river' });
  }

  /**
   * Metodo di debug per verificare lo stato del sistema narrativo
   */
  public debugNarrativeStatus(): void {
    const narrativeStore = useNarrativeStore.getState();
    const worldStore = useWorldStore.getState();
    
    console.log('🧪 NARRATIVE DEBUG STATUS:', {
      currentBiome: worldStore.currentBiome,
      currentStage: narrativeStore.currentStage,
      availableEvents: narrativeStore.availableLoreEvents.length,
      emotionalState: narrativeStore.emotionalState,
      riverEvent: narrativeStore.availableLoreEvents.find(e => e.id === 'thematic_river_reflection')
    });
  }
}

// Esporta l'istanza singleton
export const narrativeIntegration = NarrativeIntegrationService.getInstance();

// Esponi i metodi di debug globalmente per test dalla console
if (typeof window !== 'undefined') {
  (window as any).debugNarrative = {
    triggerRiver: () => narrativeIntegration.debugTriggerRiverEvent(),
    status: () => narrativeIntegration.debugNarrativeStatus(),
    checkEvents: (type: string, context: any) => narrativeIntegration.checkForNarrativeEvents(type, context)
  };
}