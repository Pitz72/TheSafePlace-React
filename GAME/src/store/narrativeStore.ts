import { create } from 'zustand';
import { GameState } from '../types';

interface NarrativeState {
    currentText: string;
    currentChoices: { index: number; text: string }[];
    currentTags: string[];
    currentSpeaker: string; // Sticky NPC name: kept across sub-knots until a new tag overrides it
    isStoryActive: boolean;
    activeQuests: string[]; // List of active quest IDs (from Ink variables)
    returnState: GameState | null; // GameState to restore when the dialogue/story ends
    inkStateJson: string | null; // v2.0.14: serialized Ink state, cached by NarrativeService for the save system

    // Actions
    setStoryState: (text: string, choices: { index: number; text: string }[], tags: string[]) => void;
    setStoryActive: (isActive: boolean) => void;
    setCurrentSpeaker: (speaker: string) => void;
    setActiveQuests: (quests: string[]) => void;
    addActiveQuest: (questId: string) => void;
    removeActiveQuest: (questId: string) => void;
    setReturnState: (state: GameState | null) => void;
    reset: () => void;
}

export const useNarrativeStore = create<NarrativeState>((set) => ({
    currentText: "",
    currentChoices: [],
    currentTags: [],
    currentSpeaker: "",
    isStoryActive: false,
    activeQuests: [],
    returnState: null,
    inkStateJson: null,

    setStoryState: (text, choices, tags) => set({
        currentText: text,
        currentChoices: choices,
        currentTags: tags
    }),

    setStoryActive: (isActive) => set({ isStoryActive: isActive }),

    setCurrentSpeaker: (speaker) => set({ currentSpeaker: speaker }),

    setActiveQuests: (quests) => set({ activeQuests: quests }),

    addActiveQuest: (questId: string) => set((state) => ({
        activeQuests: state.activeQuests.includes(questId) ? state.activeQuests : [...state.activeQuests, questId]
    })),

    removeActiveQuest: (questId: string) => set((state) => ({
        activeQuests: state.activeQuests.filter(id => id !== questId)
    })),

    setReturnState: (state) => set({ returnState: state }),

    reset: () => set({
        currentText: "",
        currentChoices: [],
        currentTags: [],
        currentSpeaker: "",
        isStoryActive: false,
        activeQuests: [],
        returnState: null
        // NOTE: inkStateJson is intentionally NOT cleared here — it is managed
        // by NarrativeService (resetNarrative/cacheInkState) which re-caches
        // the fresh state right after calling reset().
    })
}));
