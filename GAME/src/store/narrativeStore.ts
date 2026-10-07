import { create } from 'zustand';
import { GameState } from '../types';

interface NarrativeState {
    currentText: string;
    currentChoices: { index: number; text: string }[];
    currentTags: string[];
    currentSpeaker: string; // Sticky NPC name: kept across sub-knots until a new tag overrides it
    /** Increases on every new block of text (the same text twice still re-renders). */
    revision: number;
    isStoryActive: boolean;
    /** Quests started from Ink in this session (informational). */
    activeQuests: string[];
    returnState: GameState | null; // GameState to restore when the dialogue/story ends
    inkStateJson: string | null; // Serialized Ink state, cached by NarrativeService for the save system

    setStoryState: (text: string, choices: { index: number; text: string }[], tags: string[]) => void;
    setStoryActive: (isActive: boolean) => void;
    setCurrentSpeaker: (speaker: string) => void;
    addActiveQuest: (questId: string) => void;
    removeActiveQuest: (questId: string) => void;
    setReturnState: (state: GameState | null) => void;
    reset: () => void;
}

export const useNarrativeStore = create<NarrativeState>((set) => ({
    currentText: '',
    currentChoices: [],
    currentTags: [],
    currentSpeaker: '',
    revision: 0,
    isStoryActive: false,
    activeQuests: [],
    returnState: null,
    inkStateJson: null,

    setStoryState: (text, choices, tags) => set(state => ({ currentText: text, currentChoices: choices, currentTags: tags, revision: state.revision + 1 })),
    setStoryActive: (isActive) => set({ isStoryActive: isActive }),
    setCurrentSpeaker: (speaker) => set({ currentSpeaker: speaker }),
    addActiveQuest: (questId) => set(state => ({
        activeQuests: state.activeQuests.includes(questId) ? state.activeQuests : [...state.activeQuests, questId],
    })),
    removeActiveQuest: (questId) => set(state => ({ activeQuests: state.activeQuests.filter(id => id !== questId) })),
    setReturnState: (state) => set({ returnState: state }),
    // inkStateJson is managed by NarrativeService (it re-caches right after a reset).
    reset: () => set({
        currentText: '',
        currentChoices: [],
        currentTags: [],
        currentSpeaker: '',
        isStoryActive: false,
        activeQuests: [],
        returnState: null,
    }),
}));
