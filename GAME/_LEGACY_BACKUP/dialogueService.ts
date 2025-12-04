/**
 * @fileoverview Dialogue Service - Dialogue management logic layer
 *
 * @description Service layer that handles all dialogue-related logic including:
 * - Starting dialogues
 * - Processing dialogue choices
 * - Executing consequences (skill checks, item exchange, quest management)
 * - Managing dialogue flow (node navigation)
 *
 * Architecture:
 * - Services contain complex logic and coordinate between multiple stores
 * - Stores focus on state management only
 * - Components call services, not stores directly (for complex operations)
 *
 * @module services/dialogueService
 * @version 1.7.0
 */

import { useDialogueStore, DialogueSkillCheckResult } from '../store/dialogueStore';
import { useDialogueDatabaseStore } from '../data/dialogueDatabase';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { GameState, JournalEntryType, SkillName } from '../types';
import { questService } from './questService';
import { audioManager } from '../utils/audio';

/**
 * Dialogue Service - Dialogue management logic
 *
 * @description Service object containing dialogue management functions.
 * Centralizes all dialogue logic to keep stores clean and focused.
 */
export const dialogueService = {
  /**
   * Starts a new dialogue with an NPC.
   *
   * @description Activates a dialogue tree, sets the starting node,
   * and switches to the dialogue screen.
   *
   * @param {string} dialogueId - The ID of the dialogue tree to start
   *
   * @remarks
   * - Validates that dialogue exists in database
   * - Sets activeDialogueId and currentNodeId in dialogueStore
   * - Switches gameState to DIALOGUE
   * - Plays confirmation sound
   *
   * @example
   * dialogueService.startDialogue('marcus_main');
   * // Dialogue screen opens with Marcus's greeting
   */
  startDialogue: (dialogueId: string, returnState?: GameState) => {
    const { dialogues } = useDialogueDatabaseStore.getState();
    const { setActiveDialogue } = useDialogueStore.getState();
    const { setGameState, addJournalEntry, gameState: currentState } = useGameStore.getState();

    // v1.9.9 - Enhanced logging
    console.log(`[DIALOGUE] ═══ START DIALOGUE: ${dialogueId} ═══`);
    console.log(`[DIALOGUE] Return state: ${returnState || currentState}`);

    const dialogue = dialogues[dialogueId];
    if (!dialogue) {
      console.error(`[DIALOGUE SERVICE] ❌ Dialogue ${dialogueId} not found in database`);
      addJournalEntry({
        text: `Errore: dialogo ${dialogueId} non trovato.`,
        type: JournalEntryType.SYSTEM_ERROR
      });
      return;
    }

    // Set active dialogue and starting node
    // If returnState not specified, use current state (for context preservation)
    const stateToReturn = returnState || (currentState === GameState.OUTPOST ? GameState.OUTPOST : GameState.IN_GAME);
    setActiveDialogue(dialogueId, dialogue.startNodeId, stateToReturn);
    setGameState(GameState.DIALOGUE);

    audioManager.playSound('confirm');
    console.log(`[DIALOGUE SERVICE] ✅ Started dialogue: ${dialogueId} (${dialogue.npcName})`);
  },

  /**
   * Processes a dialogue option selected by the player.
   *
   * @description Executes the consequence of the selected option,
   * which may include skill checks, item exchange, quest management,
   * or navigation to another dialogue node.
   *
   * @param {number} optionIndex - Index of the selected option (0-based)
   *
   * @remarks
   * Consequence Types:
   * - jumpToNode: Navigate to another node
   * - endDialogue: Close dialogue and return to game
   * - skillCheck: Perform skill check, then navigate based on result
   * - startQuest: Start a new quest
   * - advanceQuest: Advance existing quest
   * - giveItem: Add item to player inventory
   * - takeItem: Remove item from player inventory
   * - alignmentChange: Shift moral alignment
   * - addXp: Grant experience points
   *
   * @example
   * // Player selects option 1 (index 0)
   * dialogueService.selectOption(0);
   */
  selectOption: (optionIndex: number) => {
    const { activeDialogueId, currentNodeId, setCurrentNode, setSkillCheckResult } = useDialogueStore.getState();
    const { dialogues } = useDialogueDatabaseStore.getState();
    const { setGameState, addJournalEntry } = useGameStore.getState();
    const { performSkillCheck, addItem, removeItem, changeAlignment, addXp } = useCharacterStore.getState();

    // v1.9.9 - Enhanced logging
    console.log(`[DIALOGUE] ─── Option Selected: ${optionIndex} ───`);
    console.log(`[DIALOGUE] Active: ${activeDialogueId}, Node: ${currentNodeId}`);

    if (!activeDialogueId || !currentNodeId) {
      console.error('[DIALOGUE SERVICE] ❌ No active dialogue');
      return;
    }

    const dialogue = dialogues[activeDialogueId];
    if (!dialogue) {
      console.error(`[DIALOGUE SERVICE] ❌ Dialogue ${activeDialogueId} not found`);
      return;
    }

    const currentNode = dialogue.nodes[currentNodeId];
    if (!currentNode) {
      console.error(`[DIALOGUE SERVICE] ❌ Node ${currentNodeId} not found in dialogue ${activeDialogueId}`);
      return;
    }

    const selectedOption = currentNode.options[optionIndex];
    if (!selectedOption) {
      console.error(`[DIALOGUE SERVICE] ❌ Option ${optionIndex} not found in node ${currentNodeId}`);
      return;
    }

    audioManager.playSound('confirm');
    const consequence = selectedOption.consequence;

    // v1.9.9 - Log consequence type
    console.log(`[DIALOGUE] Consequence type: ${consequence.type}`, consequence.value);

    // Execute consequence
    switch (consequence.type) {
      case 'jumpToNode': {
        const targetNodeId = consequence.value as string;
        console.log(`[DIALOGUE] → Jump to node: ${targetNodeId}`);
        setCurrentNode(targetNodeId);

        // Check quest triggers after dialogue node (v1.8.0)
        questService.checkQuestTriggers(undefined, targetNodeId);
        break;
      }

      case 'endDialogue': {
        dialogueService.endDialogue();
        break;
      }

      case 'skillCheck': {
        const { skill, dc, successNode, failureNode } = consequence.value as {
          skill: SkillName;
          dc: number;
          successNode: string;
          failureNode: string;
        };

        const skillCheck = performSkillCheck(skill, dc);
        const resultText = `[${skillCheck.success ? 'SUCCESSO' : 'FALLIMENTO'}] ${skill.toUpperCase()} (CD ${dc}): ${skillCheck.roll} + ${skillCheck.bonus} = ${skillCheck.total}`;

        // Set skill check result for display
        setSkillCheckResult({
          success: skillCheck.success,
          text: resultText,
          skill: skill,
          roll: skillCheck.roll,
          total: skillCheck.total,
          dc: dc
        });

        // Add journal entry
        addJournalEntry({
          text: resultText,
          type: skillCheck.success ? JournalEntryType.SKILL_CHECK_SUCCESS : JournalEntryType.SKILL_CHECK_FAILURE
        });

        // Navigate to appropriate node after a brief delay
        setTimeout(() => {
          setCurrentNode(skillCheck.success ? successNode : failureNode);
        }, 1500); // 1.5 second delay to show result

        console.log(`[DIALOGUE SERVICE] Skill check: ${skill} DC ${dc} - ${skillCheck.success ? 'SUCCESS' : 'FAILURE'}`);
        break;
      }

      case 'startQuest': {
        const questId = consequence.value as string;
        console.log(`[DIALOGUE] → Start quest: ${questId}`);
        questService.startQuest(questId);
        // Don't end dialogue - let player continue talking
        break;
      }

      case 'advanceQuest': {
        const questId = consequence.value as string;
        questService.advanceQuest(questId);
        break;
      }

      case 'giveItem': {
        const { itemId, quantity } = consequence.value as { itemId: string; quantity: number };
        addItem(itemId, quantity);
        addJournalEntry({
          text: `Marcus ti ha dato un oggetto.`,
          type: JournalEntryType.ITEM_ACQUIRED
        });
        break;
      }

      case 'takeItem': {
        const { itemId, quantity } = consequence.value as { itemId: string; quantity: number };
        removeItem(itemId, quantity);

        // Special handling for Anya's Eurocenter card
        if (itemId === 'eurocenter_business_card') {
          // Mark echo as delivered
          useGameStore.setState(state => ({
            gameFlags: new Set(state.gameFlags).add('ANYA_ECHO_EUROCENTER')
          }));

          addJournalEntry({
            text: `Hai consegnato il biglietto da visita ad Anya.`,
            type: JournalEntryType.NARRATIVE
          });

          // Jump to reward node
          setCurrentNode('anya_after_eurocenter');
        } else if (itemId === 'captains_last_broadcast') {
          // Mark echo as delivered
          useGameStore.setState(state => ({
            gameFlags: new Set(state.gameFlags).add('ANYA_ECHO_CAPTAINS_BROADCAST')
          }));

          addJournalEntry({
            text: `Hai consegnato la registrazione ad Anya.`,
            type: JournalEntryType.NARRATIVE
          });

          // Jump to reward node
          setCurrentNode('anya_after_broadcast');
        } else {
          addJournalEntry({
            text: `Hai dato un oggetto.`,
            type: JournalEntryType.NARRATIVE
          });
        }
        break;
      }

      case 'alignmentChange': {
        const { type, amount } = consequence.value as { type: 'lena' | 'elian'; amount: number };
        changeAlignment(type, amount);
        break;
      }

      case 'addXp': {
        const xpAmount = consequence.value as number;
        addXp(xpAmount);
        // XP gain will trigger its own journal entry
        // End dialogue after XP reward
        setTimeout(() => {
          dialogueService.endDialogue();
        }, 1000);
        break;
      }

      case 'completeQuest': {
        const questId = consequence.value as string;

        // Special handling for crossroads_investigation - give weapon choice
        if (questId === 'crossroads_investigation') {
          // Determine which weapon based on current node
          const weaponId = currentNodeId === 'marcus_investigation_complete'
            ? (optionIndex === 0 ? 'weapon_sharp_dagger' : 'weapon_makeshift_bow')
            : null;

          if (weaponId) {
            addItem(weaponId, 1);
            const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
            const weaponName = itemDatabase[weaponId]?.name || 'arma';
            addJournalEntry({
              text: `Marcus ti ha dato: ${weaponName}.`,
              type: JournalEntryType.ITEM_ACQUIRED
            });
          }
        }

        questService.completeQuest(questId);
        // End dialogue after quest completion
        setTimeout(() => {
          dialogueService.endDialogue();
        }, 1000);
        break;
      }

      case 'failQuest': {
        const questId = consequence.value as string;
        // Remove from active quests without adding to completed
        const { activeQuests } = useCharacterStore.getState();
        const newActiveQuests = { ...activeQuests };
        delete newActiveQuests[questId];
        useCharacterStore.setState({ activeQuests: newActiveQuests });

        addJournalEntry({
          text: `[MISSIONE FALLITA] La quest è stata abbandonata.`,
          type: JournalEntryType.SYSTEM_WARNING,
          color: '#ef4444' // red-500
        });
        break;
      }

      case 'learnRecipe': {
        const recipeId = consequence.value as string;
        const { learnRecipe } = useCharacterStore.getState();
        learnRecipe(recipeId);

        // Mark echo as delivered
        const echoFlag = `ANYA_ECHO_PIXELDEBH`;
        useGameStore.setState(state => ({
          gameFlags: new Set(state.gameFlags).add(echoFlag)
        }));

        // Remove the item from inventory
        removeItem('pixeldebh_plate', 1);

        // End dialogue after reward
        setTimeout(() => {
          dialogueService.endDialogue();
        }, 1500);
        break;
      }

      case 'upgradeArmor': {
        const { slot, defenseBonus, statusResistance } = consequence.value as {
          slot: 'head' | 'chest' | 'legs';
          defenseBonus: number;
          statusResistance?: string;
        };

        const { upgradeEquippedArmor } = useCharacterStore.getState();

        // Determine which echo item to remove
        let echoFlag = '';
        let itemToRemove = '';

        if (slot === 'chest') {
          echoFlag = 'ANYA_ECHO_DRONE_CHIP';
          itemToRemove = 'drone_memory_chip';
        } else if (slot === 'legs') {
          echoFlag = 'ANYA_ECHO_PROJECT_REBIRTH';
          itemToRemove = 'research_notes_rebirth';
        }

        // Upgrade the armor
        upgradeEquippedArmor(slot, defenseBonus);

        // Mark echo as delivered
        useGameStore.setState(state => ({
          gameFlags: new Set(state.gameFlags).add(echoFlag)
        }));

        // Remove the echo item
        removeItem(itemToRemove, 1);

        // End dialogue after upgrade
        setTimeout(() => {
          dialogueService.endDialogue();
        }, 1500);
        break;
      }

      case 'revealMapPOI': {
        const { x, y, name } = consequence.value as { x: number; y: number; name: string };

        // Mark echo as delivered
        const echoFlag = 'ANYA_ECHO_CRYPTIC_RECORDING';
        useGameStore.setState(state => ({
          gameFlags: new Set(state.gameFlags).add(echoFlag)
        }));

        // Remove the item
        removeItem('cryptic_recording', 1);

        addJournalEntry({
          text: `[SCOPERTA] ${name} rivelato alle coordinate (${x}, ${y})!`,
          type: JournalEntryType.XP_GAIN,
          color: '#38bdf8' // cyan-400
        });

        // Add XP for discovery
        addXp(75);

        // End dialogue after reveal
        setTimeout(() => {
          dialogueService.endDialogue();
        }, 1500);
        break;
      }

      default:
        console.warn(`[DIALOGUE SERVICE] Unknown consequence type: ${consequence.type}`);
    }
  },

  /**
   * Ends the current dialogue and returns to the game.
   *
   * @description Resets dialogue store and returns gameState to IN_GAME.
   * Plays cancel sound for audio feedback.
   *
   * @example
   * dialogueService.endDialogue();
   * // Dialogue closes, player returns to game
   */
  endDialogue: () => {
    const { reset, returnState } = useDialogueStore.getState();
    const { setGameState } = useGameStore.getState();

    const targetState = returnState || GameState.IN_GAME;
    reset();
    setGameState(targetState);
    audioManager.playSound('cancel');

    console.log('[DIALOGUE SERVICE] ✅ Dialogue ended');
  },
};