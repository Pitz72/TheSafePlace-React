/**
 * @fileoverview Quest Service - Quest management logic layer
 *
 * @description Service layer that handles all quest-related logic including:
 * - Starting quests
 * - Advancing quest stages
 * - Completing quests and granting rewards
 * - Checking quest triggers after player actions
 *
 * Architecture:
 * - Services contain complex logic and coordinate between multiple stores
 * - Stores focus on state management only
 * - Components call services, not stores directly (for complex operations)
 *
 * @module services/questService
 */

import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useQuestDatabaseStore } from '../data/questDatabase';
import { useEventStore } from '../store/eventStore';
import { useEventDatabaseStore } from '../data/eventDatabase';
import { JournalEntryType, GameState, Position, QuestType, InventoryItem } from '../types';

/**
 * Gets all active quest marker locations with their types.
 *
 * @description Returns coordinates and quest types for all active quests
 * with reachLocation triggers. Used by CanvasMap to render quest markers.
 *
 * @returns {Array<{pos: Position, type: QuestType}>} Array of markers with coordinates and quest type
 *
 * @remarks
 * - Only returns markers for reachLocation triggers
 * - Filters by current stage of each quest
 * - Returns empty array if no location-based quests active
 *
 * @example
 * const markers = questService.getActiveQuestMarkers();
 * // [{pos: {x: 78, y: 9}, type: 'SUB'}]
 */
export const getActiveQuestMarkers = (): Array<{pos: Position, type: QuestType}> => {
  const { quests } = useQuestDatabaseStore.getState();
  const { activeQuests } = useCharacterStore.getState();
  const markers: Array<{pos: Position, type: QuestType}> = [];

  Object.keys(activeQuests).forEach(questId => {
    const quest = quests[questId];
    if (!quest) return;

    const currentStage = activeQuests[questId];
    const stageData = quest.stages.find(s => s.stage === currentStage);
    
    if (stageData && stageData.trigger.type === 'reachLocation') {
      const pos = stageData.trigger.value as { x: number; y: number };
      markers.push({ pos, type: quest.type });
    }
  });

  return markers;
};

/**
 * Quest Service - Quest management logic
 *
 * @description Service object containing quest management functions.
 * Centralizes all quest logic to keep stores clean and focused.
 */
export const questService = {
  /**
   * Starts a new quest for the player.
   *
   * @description Activates a quest, adds it to activeQuests, and shows the start text.
   * Validates that the quest exists and isn't already active or completed.
   *
   * @param {string} questId - The ID of the quest to start
   *
   * @remarks
   * - Checks if quest is already active or completed
   * - Adds quest to activeQuests at stage 1
   * - Adds journal entry with [MISSIONE AVVIATA] prefix
   * - Shows quest startText as narrative
   * - Safe to call multiple times (idempotent)
   *
   * @example
   * questService.startQuest('find_jonas_talisman');
   * // Journal: "[MISSIONE AVVIATA] Il Talismano Perduto"
   * // Journal: "Il messaggio nella bottiglia parla di..."
   */
  startQuest: (questId: string) => {
    const { quests } = useQuestDatabaseStore.getState();
    const { activeQuests, completedQuests } = useCharacterStore.getState();
    const { addJournalEntry } = useGameStore.getState();

    const quest = quests[questId];
    if (!quest) {
      console.error(`[QUEST SERVICE] Quest ${questId} not found in database`);
      return;
    }

    // Check if already active or completed
    if (activeQuests[questId]) {
      console.log(`[QUEST SERVICE] Quest ${questId} already active`);
      return;
    }

    if (completedQuests.includes(questId)) {
      console.log(`[QUEST SERVICE] Quest ${questId} already completed`);
      return;
    }

    // Start quest at stage 1
    const newActiveQuests = { ...activeQuests, [questId]: 1 };
    useCharacterStore.setState({ activeQuests: newActiveQuests });

    // Add journal entries
    addJournalEntry({
      text: `[MISSIONE AVVIATA] ${quest.title}`,
      type: JournalEntryType.XP_GAIN,
      color: '#facc15' // yellow-400 (quest color)
    });

    addJournalEntry({
      text: quest.startText,
      type: JournalEntryType.NARRATIVE
    });

    console.log(`[QUEST SERVICE] ✅ Started quest: ${questId} (${quest.title})`);
  },

  /**
   * Advances a quest to the next stage.
   *
   * @description Increments the quest stage and adds a journal entry.
   * Called when a quest trigger is satisfied.
   *
   * @param {string} questId - The ID of the quest to advance
   *
   * @remarks
   * - Increments stage number in activeQuests
   * - Adds journal entry with [MISSIONE AGGIORNATA] prefix
   * - Does not check if quest is at final stage (use completeQuest for that)
   * - Safe to call even if quest is not active (no-op)
   *
   * @example
   * questService.advanceQuest('find_jonas_talisman');
   * // Journal: "[MISSIONE AGGIORNATA] Il Talismano Perduto"
   */
  advanceQuest: (questId: string) => {
    const { quests } = useQuestDatabaseStore.getState();
    const { activeQuests } = useCharacterStore.getState();
    const { addJournalEntry } = useGameStore.getState();

    const quest = quests[questId];
    if (!quest) {
      console.error(`[QUEST SERVICE] Quest ${questId} not found in database`);
      return;
    }

    if (!activeQuests[questId]) {
      console.log(`[QUEST SERVICE] Quest ${questId} not active, cannot advance`);
      return;
    }

    // Increment stage
    const newStage = activeQuests[questId] + 1;
    const newActiveQuests = { ...activeQuests, [questId]: newStage };
    useCharacterStore.setState({ activeQuests: newActiveQuests });

    // Add journal entry
    addJournalEntry({
      text: `[MISSIONE AGGIORNATA] ${quest.title}`,
      type: JournalEntryType.XP_GAIN,
      color: '#facc15' // yellow-400
    });

    console.log(`[QUEST SERVICE] ✅ Advanced quest: ${questId} to stage ${newStage}`);
  },

  /**
   * Completes a quest and grants rewards.
   *
   * @description Removes quest from activeQuests, adds to completedQuests,
   * and grants all rewards (XP, items, stat boosts).
   *
   * @param {string} questId - The ID of the quest to complete
   *
   * @remarks
   * Rewards Granted:
   * - XP: Added to character XP (may trigger level up)
   * - Items: Added to inventory
   * - Stat Boosts: Permanent attribute increases
   *
   * Journal Entries:
   * - [MISSIONE COMPLETATA] with quest title
   * - Individual entries for each reward type
   *
   * @example
   * questService.completeQuest('find_jonas_talisman');
   * // Journal: "[MISSIONE COMPLETATA] Il Talismano Perduto"
   * // Journal: "Hai guadagnato 150 XP!"
   * // Journal: "Hai ricevuto: Miele x2"
   */
  completeQuest: (questId: string) => {
    const { quests } = useQuestDatabaseStore.getState();
    const { activeQuests, completedQuests, addXp, addItem, boostAttribute } = useCharacterStore.getState();
    const { addJournalEntry } = useGameStore.getState();

    const quest = quests[questId];
    if (!quest) {
      console.error(`[QUEST SERVICE] Quest ${questId} not found in database`);
      return;
    }

    if (!activeQuests[questId]) {
      console.log(`[QUEST SERVICE] Quest ${questId} not active, cannot complete`);
      return;
    }

    // Remove from active, add to completed
    const newActiveQuests = { ...activeQuests };
    delete newActiveQuests[questId];
    const newCompletedQuests = [...completedQuests, questId];

    useCharacterStore.setState({
      activeQuests: newActiveQuests,
      completedQuests: newCompletedQuests
    });

    // Add completion journal entry
    addJournalEntry({
      text: `[MISSIONE COMPLETATA] ${quest.title}`,
      type: JournalEntryType.XP_GAIN,
      color: '#22c55e' // green-500 (success)
    });

    // Grant rewards
    const reward = quest.finalReward;

    if (reward.xp) {
      addXp(reward.xp);
      addJournalEntry({
        text: `Hai guadagnato ${reward.xp} XP!`,
        type: JournalEntryType.XP_GAIN
      });
    }

    if (reward.items) {
      reward.items.forEach(item => {
        addItem(item.itemId, item.quantity);
        // Item acquisition will trigger its own journal entry via addItem
      });
    }

    if (reward.statBoost) {
      boostAttribute(reward.statBoost.stat, reward.statBoost.amount);
      addJournalEntry({
        text: `Il tuo ${reward.statBoost.stat.toUpperCase()} è aumentato di ${reward.statBoost.amount}!`,
        type: JournalEntryType.XP_GAIN
      });
    }
    
    // Special quest completion effects (v1.8.0)
    if (questId === 'crossroads_investigation') {
      // Grant Marcus friendship flag for permanent discount
      useGameStore.setState(state => ({
        gameFlags: new Set(state.gameFlags).add('MARCUS_FRIENDSHIP')
      }));
      addJournalEntry({
        text: `[REPUTAZIONE] Marcus ti considera ora un amico. Avrai uno sconto permanente nei suoi scambi.`,
        type: JournalEntryType.XP_GAIN,
        color: '#22c55e' // green-500
      });
    }
    
    if (questId === 'find_jonas_talisman') {
      // Add Clan of the Raven lore entry
      useCharacterStore.getState().addLoreEntry('lore_clan_of_the_raven');
    }

    console.log(`[QUEST SERVICE] ✅ Completed quest: ${questId} (${quest.title})`);
  },

  /**
   * Checks all active quest triggers and advances/completes quests as needed.
   *
   * @description The "orchestrator" function that evaluates all active quests
   * and checks if their current stage triggers are satisfied.
   *
   * @param {string} [lastAddedItemId] - Optional: ID of item just added to inventory
   * @param {string} [lastDialogueNodeId] - Optional: ID of dialogue node just visited
   * @param {string} [lastCompletedEventId] - Optional: ID of event just completed
   *
   * @remarks
   * Trigger Types Implemented (v1.8.0):
   * - reachLocation: Player position matches trigger coordinates
   * - getItem: Item with matching ID was just added to inventory
   * - hasItems: Player has all required items in inventory
   * - talkToNPC: Player talked to specific NPC (dialogue node)
   * - completeEvent: Player completed specific unique event
   *
   * Trigger Types Planned (Future):
   * - useItem: Item consumed/used
   * - enemyDefeated: Specific enemy killed
   * - interactWithObject: Object interaction
   * - skillCheckSuccess: Skill check passed
   *
   * Call Points:
   * - After movePlayer() - checks reachLocation triggers
   * - After addItem() - checks getItem, hasItems triggers
   * - After dialogue node - checks talkToNPC triggers
   * - After event completion - checks completeEvent triggers
   *
   * @example
   * // After player movement
   * questService.checkQuestTriggers();
   *
   * // After item acquisition
   * questService.checkQuestTriggers('jonas_talisman');
   *
   * // After dialogue
   * questService.checkQuestTriggers(undefined, 'marcus_investigation_start');
   *
   * // After event
   * questService.checkQuestTriggers(undefined, undefined, 'unique_ancient_library');
   */
  checkQuestTriggers: (lastAddedItemId?: string, lastDialogueNodeId?: string, lastCompletedEventId?: string) => {
    const { quests } = useQuestDatabaseStore.getState();
    const { activeQuests, inventory } = useCharacterStore.getState();
    const { playerPos } = useGameStore.getState();

    // Iterate through all active quests
    Object.keys(activeQuests).forEach(questId => {
      const quest = quests[questId];
      if (!quest) return;

      const currentStage = activeQuests[questId];
      const stageData = quest.stages.find(s => s.stage === currentStage);

      if (!stageData) {
        console.warn(`[QUEST SERVICE] Stage ${currentStage} not found for quest ${questId}`);
        return;
      }

      const trigger = stageData.trigger;
      let triggerMet = false;

      // Check trigger type
      switch (trigger.type) {
        case 'reachLocation': {
          const targetPos = trigger.value as { x: number; y: number };
          if (playerPos.x === targetPos.x && playerPos.y === targetPos.y) {
            triggerMet = true;
            console.log(`[QUEST SERVICE] reachLocation trigger met for ${questId}`);
            
            // SPECIAL ACTION: Trigger unique event instead of advancing quest
            // This allows location-based quests to show contextual events
            if (questId === 'find_jonas_talisman' && currentStage === 1) {
              // Trigger the windmill search event
              const { biomeEvents } = useEventDatabaseStore.getState();
              const windmillEvent = biomeEvents.find(e => e.id === 'unique_lost_talisman_location');
              if (windmillEvent) {
                useEventStore.setState({
                  activeEvent: windmillEvent,
                  eventResolutionText: null
                });
                useGameStore.setState({ gameState: GameState.EVENT_SCREEN });
                // Don't advance quest yet - will advance when item is found
                triggerMet = false; // Override to prevent auto-advance
              }
            }
            
            // v1.8.0: Water pump repair quest
            if (questId === 'repair_water_pump' && currentStage === 2) {
              // Trigger the pump repair event
              const { biomeEvents } = useEventDatabaseStore.getState();
              const pumpEvent = biomeEvents.find(e => e.id === 'complete_pump_repair');
              if (pumpEvent) {
                useEventStore.setState({
                  activeEvent: pumpEvent,
                  eventResolutionText: null
                });
                useGameStore.setState({ gameState: GameState.EVENT_SCREEN });
                // Don't advance quest yet - will complete after repair attempt
                triggerMet = false; // Override to prevent auto-advance
              }
            }
            
            // v1.8.0: Crossroads investigation quest
            if (questId === 'crossroads_investigation' && currentStage === 2) {
              // Trigger the thief camp event
              const { biomeEvents } = useEventDatabaseStore.getState();
              const thiefEvent = biomeEvents.find(e => e.id === 'unique_thief_camp');
              if (thiefEvent) {
                useEventStore.setState({
                  activeEvent: thiefEvent,
                  eventResolutionText: null
                });
                useGameStore.setState({ gameState: GameState.EVENT_SCREEN });
                // Don't advance quest yet - will advance when item is obtained
                triggerMet = false; // Override to prevent auto-advance
              }
            }
            
            // v1.8.0: Find Elara quest
            if (questId === 'find_elara' && currentStage === 1) {
              // Trigger the find Elara event
              const { biomeEvents } = useEventDatabaseStore.getState();
              const elaraEvent = biomeEvents.find(e => e.id === 'unique_find_elara');
              if (elaraEvent) {
                useEventStore.setState({
                  activeEvent: elaraEvent,
                  eventResolutionText: null
                });
                useGameStore.setState({ gameState: GameState.EVENT_SCREEN });
                // Don't advance quest yet - will advance after event
                triggerMet = false; // Override to prevent auto-advance
              }
            }
          }
          break;
        }

        case 'getItem': {
          const targetItemId = trigger.value as string;
          if (lastAddedItemId === targetItemId) {
            triggerMet = true;
            console.log(`[QUEST SERVICE] getItem trigger met for ${questId} (${targetItemId})`);
          }
          break;
        }

        case 'hasItems': {
          const requiredItems = trigger.value as Array<{itemId: string, quantity: number}>;
          const hasAll = requiredItems.every(req => {
            const playerItem = inventory.find((i: InventoryItem) => i.itemId === req.itemId);
            return playerItem && playerItem.quantity >= req.quantity;
          });
          if (hasAll) {
            triggerMet = true;
            console.log(`[QUEST SERVICE] hasItems trigger met for ${questId}`);
          }
          break;
        }

        case 'talkToNPC': {
          const targetNodeId = trigger.value as string;
          if (lastDialogueNodeId === targetNodeId) {
            triggerMet = true;
            console.log(`[QUEST SERVICE] talkToNPC trigger met for ${questId} (${targetNodeId})`);
          }
          break;
        }

        case 'completeEvent': {
          const targetEventId = trigger.value as string;
          if (lastCompletedEventId === targetEventId) {
            triggerMet = true;
            console.log(`[QUEST SERVICE] completeEvent trigger met for ${questId} (${targetEventId})`);
          }
          break;
        }

        case 'interactWithObject': {
          // This trigger works like talkToNPC - checked when player interacts with objects
          // The interaction ID is passed as lastDialogueNodeId parameter
          // Used for: terminal interactions, object-based quest completion
          const targetInteractionId = trigger.value as string;
          if (lastDialogueNodeId === targetInteractionId) {
            triggerMet = true;
            console.log(`[QUEST SERVICE] interactWithObject trigger met for ${questId} (${targetInteractionId})`);
          }
          break;
        }

        // Future trigger types
        case 'useItem':
        case 'enemyDefeated':
        case 'skillCheckSuccess':
          // Not yet implemented
          break;

        default:
          console.warn(`[QUEST SERVICE] Unknown trigger type: ${trigger.type}`);
      }

      // If trigger met, advance or complete quest
      if (triggerMet) {
        const isLastStage = currentStage === quest.stages.length;
        if (isLastStage) {
          questService.completeQuest(questId);
        } else {
          questService.advanceQuest(questId);
        }
      }
    });
  }
};