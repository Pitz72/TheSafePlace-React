import EventEmitter from 'eventemitter3';

export const events = new EventEmitter();

export const GameEvents = {
    // Narrative Events
    START_DIALOGUE: 'START_DIALOGUE',
    SHOW_TEXT: 'SHOW_TEXT',
    SHOW_CHOICES: 'SHOW_CHOICES',
    CHOOSE_OPTION: 'CHOOSE_OPTION',
    END_DIALOGUE: 'END_DIALOGUE',

    // Game State Events
    PLAYER_MOVED: 'PLAYER_MOVED',
    ITEM_ADDED: 'ITEM_ADDED',
    QUEST_UPDATED: 'QUEST_UPDATED',
    LOG_MESSAGE: 'LOG_MESSAGE', // New event for travel log

    // Engine Events
    SCENE_READY: 'SCENE_READY',
} as const;

export type GameEvents = typeof GameEvents[keyof typeof GameEvents];
