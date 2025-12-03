import { Story } from 'inkjs';

export class NarrativeService {
    private story: Story | null = null;

    constructor(storyJson: any) {
        if (storyJson) {
            this.story = new Story(storyJson);
        }
    }

    public continue(): string {
        if (this.story && this.story.canContinue) {
            return this.story.Continue() || "";
        }
        return "";
    }

    public get currentChoices() {
        return this.story ? this.story.currentChoices : [];
    }

    public chooseChoiceIndex(index: number) {
        if (this.story) {
            this.story.ChooseChoiceIndex(index);
        }
    }

    public get canContinue(): boolean {
        return this.story ? this.story.canContinue : false;
    }
}
