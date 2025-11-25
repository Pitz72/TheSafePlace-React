export const GameState = {
    INITIAL_BLACK_SCREEN: 0,
    CHARACTER_CREATION: 1,
    IN_GAME: 2,
    GAME_OVER: 3,
} as const;

export type GameState = typeof GameState[keyof typeof GameState];

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
}

export interface JournalEntry {
    text: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: number;
}

export type AttributeName = 'for' | 'des' | 'cos' | 'int' | 'sag' | 'car';

export interface Attributes {
    for: number;
    des: number;
    cos: number;
    int: number;
    sag: number;
    car: number;
}

export interface Stat {
    current: number;
    max: number;
}

export interface CharacterState {
    attributes: Attributes;
    hp: Stat;
    satiety: Stat;
    hydration: Stat;
    fatigue: Stat;
    level: number;
    xp: Stat;
    inventory: InventoryItem[];

    setAttributes: (attributes: Attributes) => void;
    decreaseSatiety: (amount: number) => void;
    decreaseHydration: (amount: number) => void;
    increaseFatigue: (amount: number) => void;
    initCharacter: () => void;
    addItem: (item: InventoryItem) => void;
    removeItem: (itemId: string, quantity: number) => void;
}

export interface GameStoreState {
    gameState: GameState;
    journal: JournalEntry[];
    setGameState: (state: GameState) => void;
    addJournalEntry: (text: string, type?: JournalEntry['type']) => void;
}
