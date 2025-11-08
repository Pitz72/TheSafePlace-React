import { create } from 'zustand';
import { GameState } from '../types';

/**
 * Result of a skill check performed during dialogue (v1.7.0)
 */
export interface DialogueSkillCheckResult {
  success: boolean;
  text: string;
  skill: string;
  roll: number;
  total: number;
  dc: number;
}

/**
 * @interface DialogueStoreState
 * @description Manages the state of an active dialogue session.
 * 
 * @remarks
 * This store is ephemeral - it only exists while a dialogue is active.
 * When dialogue ends, state is reset to null values.
 * 
 * @property {string | null} activeDialogueId - ID of the active dialogue tree
 * @property {string | null} currentNodeId - ID of the current dialogue node
 * @property {DialogueSkillCheckResult | null} skillCheckResult - Result of last skill check (if any)
 */
interface DialogueStoreState {
  activeDialogueId: string | null;
  currentNodeId: string | null;
  skillCheckResult: DialogueSkillCheckResult | null;
  returnState: GameState | null; // State to return to after dialogue ends
  
  // Actions
  setActiveDialogue: (dialogueId: string, startNodeId: string, returnState?: GameState) => void;
  setCurrentNode: (nodeId: string) => void;
  setSkillCheckResult: (result: DialogueSkillCheckResult | null) => void;
  reset: () => void;
}

const initialState = {
  activeDialogueId: null,
  currentNodeId: null,
  skillCheckResult: null,
  returnState: null,
};

/**
 * Dialogue Store (v1.7.0)
 * 
 * @description Zustand store for managing active dialogue state.
 * Tracks which dialogue tree is active, which node is being displayed,
 * and any skill check results that need to be shown.
 * 
 * @remarks
 * - Ephemeral state (reset when dialogue ends)
 * - No persistence (not saved/loaded)
 * - Simple state management for UI layer
 * 
 * @example
 * const { activeDialogueId, currentNodeId } = useDialogueStore();
 * 
 * // Start dialogue
 * setActiveDialogue('marcus_main', 'start');
 * 
 * // Navigate to node
 * setCurrentNode('who_are_you');
 * 
 * // End dialogue
 * reset();
 */
export const useDialogueStore = create<DialogueStoreState>((set) => ({
  ...initialState,
  
  /**
   * Sets the active dialogue tree and starting node.
   *
   * @param {string} dialogueId - ID of the dialogue tree to activate
   * @param {string} startNodeId - ID of the starting node
   * @param {GameState} returnState - Optional state to return to after dialogue ends
   */
  setActiveDialogue: (dialogueId: string, startNodeId: string, returnState?: GameState) => {
    set({
      activeDialogueId: dialogueId,
      currentNodeId: startNodeId,
      skillCheckResult: null,
      returnState: returnState || null,
    });
  },
  
  /**
   * Navigates to a different node in the current dialogue tree.
   * 
   * @param {string} nodeId - ID of the node to navigate to
   */
  setCurrentNode: (nodeId: string) => {
    set({ currentNodeId: nodeId, skillCheckResult: null });
  },
  
  /**
   * Sets the result of a skill check to be displayed.
   * 
   * @param {DialogueSkillCheckResult | null} result - Skill check result or null to clear
   */
  setSkillCheckResult: (result: DialogueSkillCheckResult | null) => {
    set({ skillCheckResult: result });
  },
  
  /**
   * Resets the dialogue store to initial state.
   * Called when dialogue ends.
   */
  reset: () => {
    set(initialState);
  },
}));