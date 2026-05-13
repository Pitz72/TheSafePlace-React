import { Story } from 'inkjs';
import { useCharacterStore } from '../store/characterStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { questService } from './questService';

export class NarrativeService {
    private story: Story | null = null;

    constructor(storyJson: any) {
        if (storyJson) {
            this.initialize(storyJson);
        }
    }

    public initialize(storyJson: any) {
        try {
            this.story = new Story(storyJson);
            // Belt-and-braces: if a future EXTERNAL is added to .ink without a JS binding,
            // Ink will fall back to the in-source `=== function ===` stub rather than throw.
            this.story.allowExternalFunctionFallbacks = true;
            this.bindExternalFunctions();
            console.log("NarrativeService initialized with Ink story.");
            this.commitToStore(); // Initial sync
        } catch (error) {
            console.error("Failed to initialize NarrativeService:", error);
        }
    }

    private bindExternalFunctions() {
        if (!this.story) return;

        this.story.BindExternalFunction("startQuest", (questId: string) => {
            console.log(`[Ink] Starting quest: ${questId}`);
            useNarrativeStore.getState().addActiveQuest(questId);
            // Sync with game logic via questService
            questService.startQuest(questId);
        });

        this.story.BindExternalFunction("completeQuest", (questId: string) => {
            console.log(`[Ink] Completing quest: ${questId}`);
            useNarrativeStore.getState().removeActiveQuest(questId);
            // Sync with game logic via questService
            questService.completeQuest(questId);
        });

        this.story.BindExternalFunction("giveItem", (itemId: string, quantity: number) => {
            console.log(`[Ink] Giving item: ${itemId} x${quantity}`);
            useCharacterStore.getState().addItem(itemId, quantity);
        });

        this.story.BindExternalFunction("takeItem", (itemId: string, quantity: number) => {
            console.log(`[Ink] Taking item: ${itemId} x${quantity}`);
            useCharacterStore.getState().removeItem(itemId, quantity);
        });

        this.story.BindExternalFunction("checkSkill", (skillName: string, dc: number) => {
            console.log(`[Ink] Checking skill: ${skillName} DC ${dc}`);
            const result = useCharacterStore.getState().performSkillCheck(skillName as any, dc);
            return result.success;
        });

        this.story.BindExternalFunction("has_item", (itemId: string) => {
            // Mock check or implement inventory check
            return useCharacterStore.getState().inventory.some(i => i.itemId === itemId);
        });

        this.story.BindExternalFunction("addXp", (amount: number) => {
            useCharacterStore.getState().addXp(amount);
        });

        this.story.BindExternalFunction("learnRecipe", (recipeId: string) => {
            useCharacterStore.getState().learnRecipe(recipeId);
        });

        // TODO: implement real armor upgrade and POI reveal once the corresponding
        // character/game actions exist. For now we log so dialogues that reference
        // these effects don't break.
        this.story.BindExternalFunction("upgradeArmor", (slot: string, bonus: number) => {
            console.warn(`[Ink] upgradeArmor stub: slot=${slot} bonus=${bonus} (action not yet implemented)`);
        });

        this.story.BindExternalFunction("revealMapPOI", (x: number, y: number, name: string) => {
            console.warn(`[Ink] revealMapPOI stub: (${x},${y}) "${name}" (action not yet implemented)`);
        });
    }

    public continue(): string {
        if (!this.story) return "";
        // Ink emits one paragraph per Continue(). A knot like `=== marcus_main === ... -> hub`
        // requires two consecutive Continue() calls to surface the choices in `hub`. We drain
        // the queue until either the story stops or it offers choices, then push the joined
        // text into the store as a single block. This is the conventional pattern for an Ink
        // runner that doesn't expose a "press space to continue" affordance per paragraph.
        let accumulatedText = "";
        const accumulatedTags: string[] = [];
        while (this.story.canContinue) {
            const line = this.story.Continue() || "";
            accumulatedText += line;
            const lineTags = this.story.currentTags;
            if (lineTags && lineTags.length > 0) {
                accumulatedTags.push(...lineTags);
            }
        }
        this.commitToStore(accumulatedText, accumulatedTags);
        return accumulatedText;
    }

    public get currentChoices() {
        return this.story ? this.story.currentChoices : [];
    }

    public chooseChoiceIndex(index: number) {
        if (this.story) {
            this.story.ChooseChoiceIndex(index);
            this.continue(); // Auto-continue after choice to get next text
        }
    }

    public get canContinue(): boolean {
        return this.story ? this.story.canContinue : false;
    }

    public jumpTo(knotName: string) {
        if (this.story) {
            try {
                this.story.ChoosePathString(knotName);
                this.continue(); // Start the knot
                useNarrativeStore.getState().setStoryActive(true);
            } catch (e) {
                console.error(`Failed to jump to knot: ${knotName}`, e);
            }
        }
    }

    public setVariable(varName: string, value: any) {
        if (this.story) {
            this.story.variablesState[varName] = value;
            this.commitToStore();
        }
    }

    public startDialogue(knot: string, returnState?: GameState) {
        const currentState = useGameStore.getState().gameState;
        const stateToReturnTo = returnState ?? currentState ?? GameState.IN_GAME;
        const narrative = useNarrativeStore.getState();
        narrative.setReturnState(stateToReturnTo);
        narrative.setCurrentSpeaker(""); // clear any sticky speaker from a previous conversation
        useGameStore.getState().setGameState(GameState.DIALOGUE);
        this.jumpTo(knot);
    }

    public endDialogue() {
        const { returnState, setStoryActive, setReturnState } = useNarrativeStore.getState();
        setStoryActive(false);
        useGameStore.getState().setGameState(returnState ?? GameState.IN_GAME);
        setReturnState(null);
    }

    // Push state into the store. If text/tags are passed in, they win (typical case after a
    // multi-paragraph drain in continue()). Otherwise fall back to whatever Ink has on the
    // current line (used after initialize() and setVariable()).
    private commitToStore(text?: string, tags?: string[]) {
        if (!this.story) return;

        const currentText = text ?? this.story.currentText ?? "";
        const currentChoices = this.story.currentChoices.map(c => ({
            index: c.index,
            text: c.text
        }));
        const currentTags = tags ?? this.story.currentTags ?? [];

        const store = useNarrativeStore.getState();
        store.setStoryState(currentText, currentChoices, currentTags);

        // Sticky speaker: if any tag in this batch is #speaker:<name>, latch it.
        // Otherwise keep whatever the previous paragraph set.
        const speakerTag = currentTags.find(t => t.trim().toLowerCase().startsWith("speaker:"));
        if (speakerTag) {
            const name = speakerTag.split(":")[1]?.trim() ?? "";
            if (name) store.setCurrentSpeaker(name);
        }
    }
}

export const narrativeService = new NarrativeService(null);
