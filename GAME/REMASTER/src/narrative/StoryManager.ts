import { Story } from 'inkjs';
import { events, GameEvents } from '../core/events';
import { useGameStore } from '../core/store';

export class StoryManager {
    private story: Story | null = null;

    constructor() {
        events.on(GameEvents.START_DIALOGUE, this.startStory, this);
        events.on(GameEvents.CHOOSE_OPTION, this.chooseOption, this);
    }

    public loadStory(jsonContent: any) {
        this.story = new Story(jsonContent);
    }

    private startStory(storyJson: any) {
        if (storyJson) {
            this.loadStory(storyJson);
        }

        // Sync initial state
        this.syncVariables();

        // Bind observers
        if (this.story) {
            this.story.ObserveVariable('hp', (variableName: string, newValue: any) => {
                console.log(`[INK] Variable changed: ${variableName} = ${newValue}`);
                useGameStore.getState().setHp(newValue);
            });
        }

        this.continueStory();
    }

    private syncVariables() {
        if (!this.story) return;

        // Push GameState to Ink (e.g. if player took damage outside dialogue)
        const currentHp = useGameStore.getState().vitals.hp;
        this.story.variablesState["hp"] = currentHp;
    }

    private continueStory() {
        if (!this.story) return;

        if (this.story.canContinue) {
            const text = this.story.Continue();
            const choices = this.story.currentChoices.map((choice, index) => ({
                text: choice.text,
                index: index
            }));

            // Update UI Store
            useGameStore.getState().setDialogueState(true, text || '', choices);

            // Emit events (optional, if other systems need to know)
            events.emit(GameEvents.SHOW_TEXT, text);
        } else {
            // End of story
            useGameStore.getState().setDialogueState(false, '', []);
            events.emit(GameEvents.END_DIALOGUE);
        }
    }

    private chooseOption(index: number) {
        if (!this.story) return;

        this.story.ChooseChoiceIndex(index);
        this.continueStory();
    }
}

export const storyManager = new StoryManager();
