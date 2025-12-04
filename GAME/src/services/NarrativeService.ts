import { Story } from 'inkjs';
import { useCharacterStore } from '../store/characterStore';
import { useNarrativeStore } from '../store/narrativeStore';
// import { questService } from './questService'; // Uncomment if questService exists

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
            this.bindExternalFunctions();
            console.log("NarrativeService initialized with Ink story.");
            this.updateStore(); // Initial sync
        } catch (error) {
            console.error("Failed to initialize NarrativeService:", error);
        }
    }

    private bindExternalFunctions() {
        if (!this.story) return;

        this.story.BindExternalFunction("startQuest", (questId: string) => {
            console.log(`[Ink] Starting quest: ${questId}`);
            useNarrativeStore.getState().addActiveQuest(questId);
            // Also sync with legacy character store if needed for persistence/compatibility
            // useCharacterStore.getState().startQuest(questId); 
        });

        this.story.BindExternalFunction("completeQuest", (questId: string) => {
            console.log(`[Ink] Completing quest: ${questId}`);
            useNarrativeStore.getState().removeActiveQuest(questId);
            // useCharacterStore.getState().completeQuest(questId);
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
    }

    public continue(): string {
        if (this.story && this.story.canContinue) {
            const text = this.story.Continue() || "";
            this.updateStore();
            return text;
        }
        return "";
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
            this.updateStore();
        }
    }

    public endDialogue() {
        useNarrativeStore.getState().setStoryActive(false);
    }

    private updateStore() {
        if (!this.story) return;

        const currentText = this.story.currentText || "";
        const currentChoices = this.story.currentChoices.map(c => ({
            index: c.index,
            text: c.text
        }));
        const currentTags = this.story.currentTags || [];

        useNarrativeStore.getState().setStoryState(currentText, currentChoices, currentTags);
    }
}

export const narrativeService = new NarrativeService(null);
