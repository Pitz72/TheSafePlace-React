import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';
import { useInteractionStore } from '../store/interactionStore';
import { GameState, Position, WeatherType } from '../types';
import { audioManager, AmbienceScene } from '../utils/audio';

/** The menus sit on the key art: a clear dusk on the plain, the first crickets. */
const MENU_SCENE: AmbienceScene = { biome: '.', hour: 20.2, weather: WeatherType.SERENO, level: 0.8 };
/** Game over is a cloudy night; the epilogue is a sunrise. */
const GAME_OVER_SCENE: AmbienceScene = { biome: '.', hour: 23, weather: WeatherType.NUVOLOSO, level: 0.6 };
const VICTORY_SCENE: AmbienceScene = { biome: '.', hour: 6.2, weather: WeatherType.SERENO, level: 0.8 };

const SILENT = new Set([
    GameState.INITIAL_BLACK_SCREEN, GameState.PRESENTS_SCREEN,
    GameState.INTERSTITIAL_BLACK_SCREEN, GameState.BOOTING_SCREEN,
]);
const MENUS = new Set([
    GameState.MAIN_MENU, GameState.INSTRUCTIONS_SCREEN, GameState.STORY_SCREEN,
    GameState.TROPHY_SCREEN, GameState.CHARACTER_CREATION,
]);
/** Screens reachable from both menus: they follow where they were opened from. */
const SHARED = new Set([GameState.OPTIONS_SCREEN, GameState.SAVE_GAME, GameState.LOAD_GAME]);

/** How loud the world stays while something else holds the player's attention. */
const WORLD_LEVEL: Partial<Record<GameState, number>> = {
    [GameState.IN_GAME]: 1,
    [GameState.EVENT_SCREEN]: 0.7,
    [GameState.OUTPOST]: 0.7,
    [GameState.DIALOGUE]: 0.6,
    [GameState.TRADING]: 0.6,
    [GameState.QUEST_LOG]: 0.6,
    [GameState.LEVEL_UP_SCREEN]: 0.6,
    [GameState.ASH_LULLABY_CHOICE]: 0.6,
    [GameState.PAUSE_MENU]: 0.5,
    [GameState.COMBAT]: 0.45,
    [GameState.MAIN_STORY]: 0.4,
    [GameState.CUTSCENE]: 0.35,
};

/** 1 on water, less on the banks, 0 two tiles away. */
const waterNearby = (map: string[][], { x, y }: Position): number => {
    let nearest = Infinity;
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            if (map[y + dy]?.[x + dx] === '~') nearest = Math.min(nearest, Math.max(Math.abs(dx), Math.abs(dy)));
        }
    }
    return nearest === 0 ? 1 : nearest === 1 ? 0.55 : nearest === 2 ? 0.25 : 0;
};

const currentScene = (): AmbienceScene | null => {
    const { gameState, previousGameState, map, playerPos } = useGameStore.getState();
    if (SILENT.has(gameState)) return null;
    const fromPause = previousGameState === GameState.PAUSE_MENU;
    if (MENUS.has(gameState) || (SHARED.has(gameState) && !fromPause)) return MENU_SCENE;
    if (gameState === GameState.GAME_OVER) return GAME_OVER_SCENE;
    if (gameState === GameState.VICTORY) return VICTORY_SCENE;

    const { gameTime, weather } = useTimeStore.getState();
    return {
        biome: map[playerPos.y]?.[playerPos.x] ?? '.',
        hour: gameTime.hour + gameTime.minute / 60,
        weather: weather.type,
        water: waterNearby(map, playerPos),
        sheltered: useInteractionStore.getState().isInRefuge,
        level: WORLD_LEVEL[gameState] ?? 0.5,
    };
};

/**
 * Keeps the soundscape in step with the game: where the player is, the hour,
 * the weather, and which screen is open. It listens to the stores directly,
 * so moving around never re-renders the app.
 */
export const useAmbience = () => {
    useEffect(() => {
        const update = () => audioManager.setAmbience(currentScene());
        update();
        const unsubscribe = [
            useGameStore.subscribe(update),
            useTimeStore.subscribe(update),
            useInteractionStore.subscribe(update),
        ];
        return () => {
            unsubscribe.forEach(stop => stop());
            audioManager.setAmbience(null);
        };
    }, []);
};
