import { useNarrativeStore } from '../stores/narrative/narrativeStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useWorldStore } from '../stores/world/worldStore';
import { useTimeStore } from '../stores/time/timeStore';
import { useSurvivalStore } from '../stores/survival/survivalStore';
import { useEventStore } from '../stores/events/eventStore';
import type { MainQuestEvent } from '../stores/narrative/narrativeStore';
import type { GameEvent } from '../interfaces/events';

/**
 * Servizio per gestire i trigger della main quest secondo il GDD canonico
 * Questa funzione deve essere chiamata alla fine di ogni turno di gioco
 */
export class MainQuestTriggerService {
  private static instance: MainQuestTriggerService;
  
  public static getInstance(): MainQuestTriggerService {
    if (!MainQuestTriggerService.instance) {
      MainQuestTriggerService.instance = new MainQuestTriggerService();
    }
    return MainQuestTriggerService.instance;
  }
  
  /**
   * Controlla se è il momento di attivare un evento della main quest
   * Deve essere chiamata alla fine di ogni turno
   */
  public checkMainQuestTrigger(): MainQuestEvent | null {
    const narrativeStore = useNarrativeStore.getState();
    const { characterSheet } = useCharacterStore.getState();
    const worldStore = useWorldStore.getState();
    const timeStore = useTimeStore.getState();
    const survivalStore = useSurvivalStore.getState();
    
    // Trova l'evento corrente basato sullo stage
    const currentEvent = narrativeStore.mainQuestEvents.find(
      event => event.stage === narrativeStore.currentStage
    );
    
    if (!currentEvent) return null;
    
    const trigger = currentEvent.trigger;
    
    // Verifica le condizioni del trigger
    switch (trigger.type) {
      case 'progress':
        if (narrativeStore.progressCounter >= (trigger.value || 0)) {
          return currentEvent;
        }
        break;
      
      case 'survival_stat':
        if (trigger.stat === 'thirst' && survivalStore.survivalState.thirst <= (trigger.value || 0)) {
          return currentEvent;
        }
        if (trigger.stat === 'hunger' && survivalStore.survivalState.hunger <= (trigger.value || 0)) {
          return currentEvent;
        }
        if (trigger.stat === 'health' && characterSheet.currentHP <= (trigger.value || 0)) {
          return currentEvent;
        }
        break;
      
      case 'combat_end':
        if (trigger.result === 'win' && narrativeStore.flags['last_combat_won']) {
          return currentEvent;
        }
        if (trigger.result === 'lose' && narrativeStore.flags['last_combat_lost']) {
          return currentEvent;
        }
        break;
      
      case 'survival_days':
        if (timeStore.day >= (trigger.value || 0)) {
          return currentEvent;
        }
        break;
      
      case 'enter_biome':
        if (worldStore.currentBiome === trigger.biome) {
          return currentEvent;
        }
        break;
      
      case 'level_up':
        if (characterSheet.level >= (trigger.level || 0)) {
          return currentEvent;
        }
        break;
      
      case 'use_item':
        if (narrativeStore.flags[`used_item_${trigger.itemId}`]) {
          return currentEvent;
        }
        break;
      
      case 'event_choice':
        if (narrativeStore.flags[`completed_event_${trigger.eventId}`]) {
          return currentEvent;
        }
        break;
      
      case 'reach_location':
        if (worldStore.playerPosition.x === trigger.x && worldStore.playerPosition.y === trigger.y) {
          return currentEvent;
        }
        break;
      
      case 'reach_end':
        if (narrativeStore.flags['reached_safe_place']) {
          return currentEvent;
        }
        break;
    }
    
    return null;
  }
  
  /**
   * Attiva un evento della main quest
   */
  public triggerMainQuestEvent(event: MainQuestEvent): void {
    const narrativeStore = useNarrativeStore.getState();

    console.log(`🎭 MAIN QUEST EVENT TRIGGERED: ${event.title}`);

    // Per eventi main quest narrativi, mostra direttamente il testo e chiudi automaticamente
    const eventStore = useEventStore.getState();

    // Crea un evento semplice che si chiude automaticamente
    const gameEvent: GameEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      choices: [] // Nessuna scelta - si chiude automaticamente
    };

    // Triggera l'evento attraverso il sistema esistente
    eventStore.triggerEvent(gameEvent);

    // L'evento si chiude automaticamente grazie all'EventScreen
    // Avanza allo stage successivo
    narrativeStore.advanceToNextStage();
  }
  
  /**
   * Controlla periodicamente i trigger basati su tempo e posizione
   */
  public checkPeriodicTriggers(): void {
    const timeStore = useTimeStore.getState();
    const worldStore = useWorldStore.getState();

    // Controlla trigger basati su giorni di sopravvivenza
    const currentDay = timeStore.day || 0;
    if (currentDay >= 2 || currentDay >= 7) { // Per mq_04_darkness e mq_09_name
      const eventToTrigger = this.checkMainQuestTrigger();
      if (eventToTrigger) {
        this.triggerMainQuestEvent(eventToTrigger);
      }
    }

    // Controlla trigger basati su posizione
    const playerPos = worldStore.playerPosition;
    if (playerPos.x === 140 && playerPos.y === 140) { // Per mq_11_confession
      const eventToTrigger = this.checkMainQuestTrigger();
      if (eventToTrigger) {
        this.triggerMainQuestEvent(eventToTrigger);
      }
    }

    // Controlla trigger basati su bioma (fiume)
    if (worldStore.currentBiome === 'R') { // Per mq_05_question
      this.onBiomeEntered('R');
      const eventToTrigger = this.checkMainQuestTrigger();
      if (eventToTrigger) {
        this.triggerMainQuestEvent(eventToTrigger);
      }
    }
  }
  
  /**
   * Funzione da chiamare alla fine di ogni turno
   */
  public onTurnEnd(): void {
    // Incrementa il contatore di progresso
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.incrementProgress();

    // Controlla se triggerare un evento
    const eventToTrigger = this.checkMainQuestTrigger();
    if (eventToTrigger) {
      this.triggerMainQuestEvent(eventToTrigger);
    }
  }

  /**
   * Funzione semplificata per incrementare progresso (chiamata dal movimento)
   */
  public incrementProgress(): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.incrementProgress();

    // Controlla automaticamente se triggerare un evento
    const eventToTrigger = this.checkMainQuestTrigger();
    if (eventToTrigger) {
      this.triggerMainQuestEvent(eventToTrigger);
    }
  }
  
  /**
   * Funzioni di utilità per impostare flag specifici
   */
  public onCombatEnd(won: boolean): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.setFlag('last_combat_won', won);
    narrativeStore.setFlag('last_combat_lost', !won);
  }
  
  public onItemUsed(itemId: string): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.setFlag(`used_item_${itemId}`, true);
  }
  
  public onEventCompleted(eventId: string): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.setFlag(`completed_event_${eventId}`, true);
  }
  
  public onBiomeEntered(biome: string): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.setFlag(`entered_biome_${biome}`, true);
  }
  
  public onLevelUp(level: number): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.setFlag(`reached_level_${level}`, true);
  }
  
  public onLocationReached(x: number, y: number): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.setFlag(`reached_${x}_${y}`, true);
  }
  
  public onSafePlaceReached(): void {
    const narrativeStore = useNarrativeStore.getState();
    narrativeStore.setFlag('reached_safe_place', true);
  }
}

// Esporta l'istanza singleton
export const mainQuestTrigger = MainQuestTriggerService.getInstance();