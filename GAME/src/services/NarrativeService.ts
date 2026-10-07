import { Story } from 'inkjs';
import { useCharacterStore } from '../store/characterStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';
import { GameState, JournalEntryType, PlayerStatusCondition, SkillName } from '../types';
import { questService } from './questService';
import { debugLog } from '../utils/logger';
import { SKILL_LABELS } from '../constants';

const ARMOR_SLOTS = ['head', 'chest', 'legs'] as const;
type ArmorSlotName = typeof ARMOR_SLOTS[number];

/**
 * Runs the Ink story (dialogues and the opening cutscene) and bridges Ink
 * EXTERNAL functions to the game stores. Every EXTERNAL declared in
 * modules/common.ink must be bound here.
 */
export class NarrativeService {
    private story: Story | null = null;

    public get isInitialized(): boolean {
        return this.story !== null;
    }

    public initialize(storyJson: unknown) {
        try {
            this.story = new Story(storyJson as any);
            this.story.allowExternalFunctionFallbacks = true;
            this.bindExternalFunctions();
            this.commitToStore();
            this.cacheInkState();
        } catch (error) {
            console.error('Failed to initialize NarrativeService:', error);
            this.story = null;
        }
    }

    private bindExternalFunctions() {
        const story = this.story;
        if (!story) return;
        const character = () => useCharacterStore.getState();

        // --- Quests ---
        story.BindExternalFunction('startQuest', (questId: string) => {
            useNarrativeStore.getState().addActiveQuest(questId);
            questService.startQuest(questId);
        });
        story.BindExternalFunction('completeQuest', (questId: string) => {
            useNarrativeStore.getState().removeActiveQuest(questId);
            questService.completeQuest(questId);
        });
        story.BindExternalFunction('advanceQuest', (questId: string) => {
            questService.advanceQuest(questId);
        });
        story.BindExternalFunction('questTrigger', (triggerId: string) => {
            questService.checkQuestTriggers({ source: 'dialogue', nodeId: triggerId });
        });
        story.BindExternalFunction('quest_active', (questId: string) => Boolean(character().activeQuests[questId]), true);
        story.BindExternalFunction('quest_done', (questId: string) => character().completedQuests.includes(questId), true);

        // --- Inventory and character ---
        story.BindExternalFunction('giveItem', (itemId: string, quantity: number) => {
            character().addItem(itemId, quantity);
        });
        story.BindExternalFunction('takeItem', (itemId: string, quantity: number) => {
            character().removeItem(itemId, quantity);
        });
        story.BindExternalFunction('has_item', (itemId: string) => character().getItemCount(itemId) > 0, true);
        story.BindExternalFunction('item_count', (itemId: string) => character().getItemCount(itemId), true);
        story.BindExternalFunction('equipItem', (itemId: string) => {
            character().equipItem(itemId);
        });
        story.BindExternalFunction('has_equipped', (slot: string) => {
            const state = character();
            const index = slot === 'head' ? state.equippedHead : slot === 'legs' ? state.equippedLegs : state.equippedArmor;
            return index !== null && Boolean(state.inventory[index]);
        }, true);
        story.BindExternalFunction('checkSkill', (skillName: string, dc: number) => {
            const result = character().performSkillCheck(skillName as SkillName, dc);
            useGameStore.getState().addJournalEntry({
                text: `[Prova di ${SKILL_LABELS[skillName as SkillName] ?? skillName}] ${result.roll} + ${result.bonus} = ${result.total} vs CD ${dc}: ${result.success ? 'SUCCESSO' : 'FALLIMENTO'}`,
                type: result.success ? JournalEntryType.SKILL_CHECK_SUCCESS : JournalEntryType.SKILL_CHECK_FAILURE,
            });
            return result.success;
        });
        story.BindExternalFunction('addXp', (amount: number) => {
            character().addXp(amount);
            useGameStore.getState().addJournalEntry({ text: `Hai guadagnato ${amount} XP.`, type: JournalEntryType.XP_GAIN });
        });
        story.BindExternalFunction('learnRecipe', (recipeId: string) => {
            character().learnRecipe(recipeId);
        });
        story.BindExternalFunction('upgradeArmor', (slot: string, bonus: number) => {
            if ((ARMOR_SLOTS as readonly string[]).includes(slot)) {
                character().upgradeEquippedArmor(slot as ArmorSlotName, bonus);
            }
        });
        story.BindExternalFunction('heal', (amount: number) => {
            character().heal(amount);
        });
        story.BindExternalFunction('cureStatus', (status: string) => {
            if (character().status.has(status as PlayerStatusCondition)) {
                character().removeStatus(status as PlayerStatusCondition);
                useGameStore.getState().addJournalEntry({ text: `Lo stato ${status} è svanito.`, type: JournalEntryType.SYSTEM_MESSAGE });
            }
        });
        story.BindExternalFunction('current_day', () => useTimeStore.getState().gameTime.day, true);

        // --- World ---
        story.BindExternalFunction('setGameFlag', (flag: string) => {
            useGameStore.getState().setFlag(flag);
        });
        story.BindExternalFunction('has_flag', (flag: string) => useGameStore.getState().hasFlag(flag), true);
        story.BindExternalFunction('revealPOI', (poiId: string) => {
            useGameStore.getState().revealPOI(poiId);
        });
    }

    /**
     * Drains Ink until it offers choices or stops. Ink emits one paragraph per
     * Continue(); the whole block is pushed to the store at once.
     */
    public continue(): string {
        if (!this.story) return '';
        let accumulatedText = '';
        const accumulatedTags: string[] = [];
        while (this.story.canContinue) {
            accumulatedText += this.story.Continue() || '';
            const lineTags = this.story.currentTags;
            if (lineTags && lineTags.length > 0) accumulatedTags.push(...lineTags);
        }
        this.commitToStore(accumulatedText, accumulatedTags);

        // Story reached -> END / -> DONE: close the dialogue automatically.
        if (useNarrativeStore.getState().isStoryActive && !this.story.canContinue && this.story.currentChoices.length === 0) {
            this.endDialogue();
        }
        return accumulatedText;
    }

    public get currentChoices() {
        return this.story ? this.story.currentChoices : [];
    }

    public chooseChoiceIndex(index: number) {
        if (!this.story) return;
        this.story.ChooseChoiceIndex(index);
        this.continue();
    }

    public get canContinue(): boolean {
        return this.story ? this.story.canContinue : false;
    }

    private jumpTo(knotName: string) {
        if (!this.story) {
            this.endDialogue();
            return;
        }
        try {
            useNarrativeStore.getState().setStoryActive(true);
            this.story.ChoosePathString(knotName);
            this.continue();
        } catch (error) {
            console.error(`Failed to jump to knot: ${knotName}`, error);
            // Never leave the player on a dead narrative screen.
            this.endDialogue();
        }
    }

    public startDialogue(knot: string, returnState?: GameState) {
        const currentState = useGameStore.getState().gameState;
        const narrative = useNarrativeStore.getState();
        narrative.setReturnState(returnState ?? currentState ?? GameState.IN_GAME);
        narrative.setCurrentSpeaker('');
        useGameStore.getState().setGameState(GameState.DIALOGUE);
        this.jumpTo(knot);
    }

    /** Cutscenes default to free roam on exit, not to the caller's state. */
    public startCutscene(knot: string, returnState?: GameState) {
        const narrative = useNarrativeStore.getState();
        narrative.setReturnState(returnState ?? GameState.IN_GAME);
        narrative.setCurrentSpeaker('');
        useGameStore.getState().setGameState(GameState.CUTSCENE);
        this.jumpTo(knot);
    }

    /**
     * Fast-forwards an Ink cutscene to its end, picking the first choice at
     * every branch, so that items and flags granted along the way are never
     * skipped. The safe/neutral option is always authored first.
     */
    public skipCutscene() {
        if (!this.story) {
            this.endDialogue();
            return;
        }
        let guard = 0;
        while (useNarrativeStore.getState().isStoryActive && guard++ < 500) {
            if (this.story.canContinue) {
                this.continue();
            } else if (this.story.currentChoices.length > 0) {
                this.chooseChoiceIndex(0);
            } else {
                this.endDialogue();
            }
        }
        if (useNarrativeStore.getState().isStoryActive) this.endDialogue();
    }

    public endDialogue() {
        const { returnState, setStoryActive, setReturnState } = useNarrativeStore.getState();
        setStoryActive(false);
        setReturnState(null);
        useGameStore.getState().setGameState(returnState ?? GameState.IN_GAME);
        this.cacheInkState();
    }

    /** Full narrative reset for a new game: Ink globals back to their defaults. */
    public resetNarrative() {
        if (this.story) {
            try {
                this.story.ResetState();
            } catch (error) {
                console.error('[NarrativeService] Failed to reset Ink state:', error);
            }
        }
        useNarrativeStore.getState().reset();
        this.cacheInkState();
    }

    /** Restores the Ink state from a save file (or resets it for old saves). */
    public loadInkStateJson(json: string | null | undefined) {
        if (!this.story) return;
        if (!json) {
            this.resetNarrative();
            return;
        }
        try {
            this.story.state.LoadJson(json);
            this.cacheInkState();
        } catch (error) {
            console.error('[NarrativeService] Failed to load Ink state from save:', error);
            this.resetNarrative();
        }
    }

    private cacheInkState() {
        try {
            const json = this.story ? this.story.state.toJson() : null;
            useNarrativeStore.setState({ inkStateJson: json });
        } catch (error) {
            console.warn('[NarrativeService] Could not serialize Ink state:', error);
        }
    }

    // Push state into the store. Explicit text/tags win; otherwise use Ink's current line.
    private commitToStore(text?: string, tags?: string[]) {
        if (!this.story) return;
        const currentText = text ?? this.story.currentText ?? '';
        const currentChoices = this.story.currentChoices.map(c => ({ index: c.index, text: c.text }));
        const currentTags = tags ?? this.story.currentTags ?? [];

        const store = useNarrativeStore.getState();
        store.setStoryState(currentText, currentChoices, currentTags);

        // Sticky speaker: a #speaker:<name> tag latches until another one overrides it.
        const speakerTag = currentTags.find(t => t.trim().toLowerCase().startsWith('speaker:'));
        if (speakerTag) {
            const name = speakerTag.split(':')[1]?.trim() ?? '';
            if (name) store.setCurrentSpeaker(name);
        }
        debugLog('[Ink] commit', { choices: currentChoices.length });
    }
}

export const narrativeService = new NarrativeService();
