import { create } from 'zustand';

interface NarrativeState {
    currentText: string;
    currentChoices: { index: number; text: string }[];
    currentTags: string[];
    isStoryActive: boolean;
    activeQuests: string[]; // List of active quest IDs (from Ink variables)

    // Actions
    setStoryState: (text: string, choices: { index: number; text: string }[], tags: string[]) => void;
    setStoryActive: (isActive: boolean) => void;
    setActiveQuests: (quests: string[]) => void;
    addActiveQuest: (questId: string) => void;
    removeActiveQuest: (questId: string) => void;
    reset: () => void;
}

export const useNarrativeStore = create<NarrativeState>((set) => ({
    currentText: "",
    currentChoices: [],
    currentTags: [],
    isStoryActive: false,
    activeQuests: [],

    setStoryState: (text, choices, tags) => set({
        currentText: text,
        currentChoices: choices,
        currentTags: tags
    }),

    setStoryActive: (isActive) => set({ isStoryActive: isActive }),

    setActiveQuests: (quests) => set({ activeQuests: quests }),

    addActiveQuest: (questId: string) => set((state) => ({
        activeQuests: state.activeQuests.includes(questId) ? state.activeQuests : [...state.activeQuests, questId]
    })),

    removeActiveQuest: (questId: string) => set((state) => ({
        activeQuests: state.activeQuests.filter(id => id !== questId)
    })),

    reset: () => set({
        currentText: "",
        currentChoices: [],
        currentTags: [],
        isStoryActive: false,
        activeQuests: []
    })
}));
