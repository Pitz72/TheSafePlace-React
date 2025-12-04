import { create } from 'zustand';

export type InputContext = 'GAME' | 'UI' | 'DIALOGUE' | 'MENU' | 'CUTSCENE';

interface InputState {
    contextStack: InputContext[];
    currentContext: InputContext;

    // Actions
    pushContext: (context: InputContext) => void;
    popContext: () => void;
    setContext: (context: InputContext) => void;
    resetContext: () => void;
}

export const useInputStore = create<InputState>((set) => ({
    contextStack: ['GAME'], // Default context
    currentContext: 'GAME',

    pushContext: (context) => set((state) => {
        const newStack = [...state.contextStack, context];
        console.log(`[Input] Pushed context: ${context}. Stack:`, newStack);
        return {
            contextStack: newStack,
            currentContext: context
        };
    }),

    popContext: () => set((state) => {
        if (state.contextStack.length <= 1) return state; // Don't pop the base 'GAME' context
        const newStack = state.contextStack.slice(0, -1);
        const newContext = newStack[newStack.length - 1];
        console.log(`[Input] Popped context. New context: ${newContext}. Stack:`, newStack);
        return {
            contextStack: newStack,
            currentContext: newContext
        };
    }),

    setContext: (context) => set(() => {
        console.log(`[Input] Set context: ${context}`);
        return {
            contextStack: [context],
            currentContext: context
        };
    }),

    resetContext: () => set(() => ({
        contextStack: ['GAME'],
        currentContext: 'GAME'
    }))
}));
