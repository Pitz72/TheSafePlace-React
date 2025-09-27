import type { EventChoice, GameEvent } from '@/interfaces/events';
import { MessageType } from '@/data/MessageArchive';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useCombatStore } from '@/stores/combatStore';
import { useEventStore } from '@/stores/events/eventStore';
import { CharacterStatus } from '@/rules/types';

export const resolveChoice = (
  choice: EventChoice,
  currentEvent: GameEvent,
  addLogEntry: (type: MessageType, context?: any) => void,
  advanceTime: (minutes: number) => void
) => {
  const combatStore = useCombatStore.getState();
  const characterStore = useCharacterStore.getState();
  const eventStore = useEventStore.getState();

  const handleOutcome = (outcome: string | EventChoice, choice: EventChoice) => {
    let resultText: string;
    if (typeof outcome === 'string') {
      resultText = outcome;
    } else {
      resultText = outcome.text || 'Risultato sconosciuto';
    }

    addLogEntry(MessageType.EVENT_CHOICE, { text: choice.text });

    // The event store is a dependency injected via zustand's getState
    useEventStore.setState({ currentEventResult: resultText });

    if (typeof outcome === 'object' && outcome.actions) {
      outcome.actions.forEach((action: { type: string; payload: any }) => {
        switch (action.type) {
          case 'start_combat':
            combatStore.initiateCombat(action.payload.encounterId);
            break;
          case 'advance_time':
            advanceTime(action.payload.minutes);
            break;
          case 'log':
            addLogEntry(MessageType.AMBIANCE_RANDOM, { text: action.payload.message });
            break;
          case 'damage_player':
            characterStore.updateHP(-action.payload.damage);
            addLogEntry(MessageType.HP_DAMAGE, {
              damage: action.payload.damage,
              reason: action.payload.reason || 'evento',
            });
            break;
          case 'heal_player':
            characterStore.updateHP(action.payload.healing);
            addLogEntry(MessageType.HP_RECOVERY, {
              healing: action.payload.healing,
              reason: action.payload.reason || 'evento',
            });
            break;
        }
      });
    }

    if (choice.items_gained) {
      choice.items_gained.forEach(item => {
        const success = characterStore.addItemToInventory(item.id, item.quantity);
        if (!success) {
          addLogEntry(MessageType.INVENTORY_FULL, { item: `${item.quantity}x ${item.id}` });
        } else {
          addLogEntry(MessageType.INVENTORY_ADD, { action: `Hai ottenuto ${item.quantity}x ${item.id}` });
        }
      });
    }

    if (choice.penalty) {
      switch (choice.penalty.type) {
        case 'damage':
          if (choice.penalty.amount) {
            characterStore.updateHP(-choice.penalty.amount);
            addLogEntry(MessageType.HP_DAMAGE, {
              damage: choice.penalty.amount,
              reason: 'evento',
            });
          }
          break;
        case 'time':
          if (choice.penalty.amount) {
            advanceTime(choice.penalty.amount);
          }
          break;
        case 'status':
          if (choice.penalty.status === 'SICK') {
            characterStore.applyStatus(CharacterStatus.SICK);
          } else if (choice.penalty.status === 'WOUNDED') {
            characterStore.applyStatus(CharacterStatus.WOUNDED);
          } else if (choice.penalty.status === 'POISONED') {
            characterStore.applyStatus(CharacterStatus.POISONED);
          }
          break;
        case 'stat_reduction':
          addLogEntry(MessageType.AMBIANCE_RANDOM, { text: `Riduzione temporanea: ${choice.penalty.stat} -${choice.penalty.amount}` });
          break;
        case 'special':
          addLogEntry(MessageType.AMBIANCE_RANDOM, { text: `Effetto speciale: ${choice.penalty.effect}` });
          break;
        default:
          console.warn('Unknown penalty type:', choice.penalty.type);
      }
    }

    if (choice.reward) {
      const reward = choice.reward;
      switch (reward.type) {
        case 'stat_boost':
          addLogEntry(MessageType.STAT_INCREASE, { text: `Bonus stat: ${reward.stat} +${reward.amount}` });
          break;
        case 'reveal_map_poi':
          addLogEntry(MessageType.DISCOVERY, { discovery: 'Nuovo punto di interesse rivelato sulla mappa' });
          break;
        case 'special':
          addLogEntry(MessageType.AMBIANCE_RANDOM, { text: `Ricompensa speciale: ${reward.effect}` });
          break;
        case 'xp_gain':
          if ('amount' in reward && reward.amount) {
            characterStore.addExperience(reward.amount);
          }
          break;
        case 'hp_gain':
          if ('amount' in reward && reward.amount) {
            characterStore.updateHP(reward.amount);
          }
          break;
        default:
          console.warn('Unknown reward type:', (reward as any).type);
      }
    }

    if (choice.consequences) {
      const consequence = choice.consequences;
      if (typeof consequence === 'object' && 'type' in consequence) {
        switch (consequence.type) {
          case 'sequence':
            console.log(`🎭 Starting sequence: ${(consequence as any).sequenceId}`);
            eventStore.startSequence((consequence as any).sequenceId);
            return;
          case 'end_event':
            break;
          default:
            console.warn('Unknown consequence type:', (consequence as any).type);
        }
      }
    }
  };

  if (choice.skillCheck) {
    const result = characterStore.performAbilityCheck(
      choice.skillCheck.stat,
      choice.skillCheck.difficulty
    );

    if (result.success) {
      handleOutcome(choice.successText || 'Azione completata con successo.', choice);
    } else {
      handleOutcome(choice.failureText || 'Azione fallita.', choice);
    }
  } else {
    handleOutcome(choice.resultText || 'Azione completata.', choice);
  }

  if (currentEvent.isUnique && currentEvent.id) {
    eventStore.markEncounterAsCompleted(currentEvent.id);
  }
};

interface WeatherEffects {
  eventProbabilityModifier: number;
}

export const checkForRandomEvent = (biome: string, weatherEffects: WeatherEffects) => {
  const BIOME_EVENT_CHANCES: Record<string, number> = {
    'PLAINS': 0.08, 'FOREST': 0.12, 'RIVER': 0.15, 'CITY': 0.18,
    'VILLAGE': 0.18, 'SETTLEMENT': 0.16, 'REST_STOP': 0.14, 'UNKNOWN': 0.06
  };
  const RANDOM_EVENT_CHANCE = 0.03;

  const baseEventChance = BIOME_EVENT_CHANCES[biome] || 0.20;
  const adjustedEventChance = baseEventChance * weatherEffects.eventProbabilityModifier;

  console.log(`🎲 [EVENT DEBUG] Checking for random event in ${biome}`);
  console.log(`🎲 [EVENT DEBUG] Base chance: ${baseEventChance}, Weather modifier: ${weatherEffects.eventProbabilityModifier}, Adjusted: ${adjustedEventChance}`);

  if (biome && Math.random() < adjustedEventChance) {
      console.log(`🎲 [EVENT DEBUG] Biome event triggered!`);
      setTimeout(() => {
        const { getRandomEventFromBiome, getRandomEvent, triggerEvent } = useEventStore.getState();

        let randomEvent;
        if (Math.random() < 0.3) {
          randomEvent = getRandomEvent();
          console.log(`🎲 [EVENT DEBUG] Chose random global event`);
        } else {
          randomEvent = getRandomEventFromBiome(biome);
          console.log(`🎲 [EVENT DEBUG] Chose biome event for ${biome}`);
        }

        if (randomEvent) {
          console.log(`🎲 [EVENT DEBUG] Triggering event: ${randomEvent.title}`);
          triggerEvent(randomEvent);
        } else {
          console.log(`🎲 [EVENT DEBUG] No event found for ${biome}`);
        }
      }, 150);
  } else if (Math.random() < RANDOM_EVENT_CHANCE) {
    console.log(`🎲 [EVENT DEBUG] Random global event triggered!`);
    setTimeout(() => {
      const { getRandomEvent, triggerEvent } = useEventStore.getState();
      const randomEvent = getRandomEvent();
      if (randomEvent) {
        console.log(`🎲 [EVENT DEBUG] Triggering random event: ${randomEvent.title}`);
        triggerEvent(randomEvent);
      } else {
        console.log(`🎲 [EVENT DEBUG] No random event found`);
      }
    }, 150);
  } else {
    console.log(`🎲 [EVENT DEBUG] No event triggered this time`);
  }
};