/**
 * Test harness: real game data (public/data), the compiled Ink story and the
 * real stores. Helpers drive the game the way a player would.
 */
import fs from 'node:fs';
import path from 'node:path';
import { vi, expect } from 'vitest';
import { loadAllGameData } from '../data/loadAllGameData';
import { inkStoryData } from '../data/inkStoryDatabase';
import { narrativeService } from '../services/NarrativeService';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useEventStore } from '../store/eventStore';
import { useCombatStore } from '../store/combatStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { useTimeStore } from '../store/timeStore';
import { useInteractionStore } from '../store/interactionStore';
import { gameService } from '../services/gameService';
import { startNewGame } from '../services/newGameService';
import { GameState, Position } from '../types';

const PUBLIC = path.resolve(__dirname, '../../public');

/** fetch() that serves public/ from disk, like the dev server does. */
export function installDataFetch() {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const file = path.join(PUBLIC, String(input).replace(/^\.?\//, ''));
        if (!fs.existsSync(file)) return { ok: false, status: 404, json: async () => null } as Response;
        const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
        return { ok: true, status: 200, json: async () => JSON.parse(text) } as Response;
    }) as typeof fetch;
}

let loaded = false;
export async function loadGameData() {
    if (loaded) return;
    installDataFetch();
    await loadAllGameData();
    narrativeService.initialize(inkStoryData);
    loaded = true;
}

/** Lets pending setTimeout(0) callbacks (queued cutscenes) run. */
export async function flush() {
    for (let i = 0; i < 5; i++) await new Promise(resolve => setTimeout(resolve, 0));
}

/** Every d20 rolls 20: skill checks succeed and nothing random happens on the road. */
export function luckyRolls() {
    return vi.spyOn(Math, 'random').mockReturnValue(0.999);
}

/** Starts a new game, skips the opening and lands in free roam. */
export async function newGame() {
    await loadGameData();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    startNewGame();
    narrativeService.skipCutscene();
    expect(useGameStore.getState().gameState).toBe(GameState.CHARACTER_CREATION);
    useCharacterStore.getState().setAttributes({ for: 12, des: 12, cos: 12, int: 12, sag: 12, car: 12 });
    useGameStore.getState().setGameState(GameState.IN_GAME);
    await flush();
}

export const game = () => useGameStore.getState();
export const character = () => useCharacterStore.getState();
export const inventoryCount = (itemId: string) => useCharacterStore.getState().getItemCount(itemId);
export const questStage = (questId: string) => useCharacterStore.getState().activeQuests[questId];
export const isCompleted = (questId: string) => useCharacterStore.getState().completedQuests.includes(questId);

export function give(itemId: string, quantity = 1) {
    useCharacterStore.getState().addItem(itemId, quantity);
}

export function poi(id: string) {
    const found = useGameStore.getState().getPOI(id);
    if (!found) throw new Error(`POI ${id} not registered`);
    return found;
}

/** Puts the player next to `target` and walks onto it (full movement pipeline). */
export function stepOnto(target: Position) {
    const map = useGameStore.getState().map;
    const walkable = (x: number, y: number) => {
        const tile = map[y]?.[x];
        return !!tile && tile !== 'M' && tile !== 'R' && tile !== 'A' && tile !== 'E';
    };
    const from = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        .map(([dx, dy]) => ({ x: target.x + dx, y: target.y + dy }))
        .find(p => walkable(p.x, p.y) && !useGameStore.getState().pois.some(o => o.x === p.x && o.y === p.y));
    if (!from) throw new Error(`No free tile next to (${target.x},${target.y})`);
    useGameStore.setState({
        playerPos: from,
        currentBiome: map[from.y][from.x],
        playerStatus: { isExitingWater: false },
        gameState: GameState.IN_GAME,
    });
    useInteractionStore.setState({ isInRefuge: false, isInventoryOpen: false });
    gameService.movePlayer(target.x - from.x, target.y - from.y);
}

export function openEvent(eventId: string) {
    useGameStore.setState({ gameState: GameState.IN_GAME });
    expect(useEventStore.getState().openEvent(eventId)).toBe(true);
}

/** Picks the visible choice containing `text` in the open event, then closes the resolution. */
export function choose(text: string, { dismiss = true } = {}) {
    const events = useEventStore.getState();
    const event = events.activeEvent;
    if (!event) throw new Error(`No event open (looking for "${text}")`);
    const index = event.choices.findIndex(c => c.text.includes(text) && events.isChoiceVisible(c));
    if (index === -1) {
        const visible = event.choices.filter(c => events.isChoiceVisible(c)).map(c => c.text);
        throw new Error(`Choice "${text}" not available in ${event.id}: ${JSON.stringify(visible)}`);
    }
    events.resolveEventChoice(index);
    // A dialogue or a trade opened by the choice returns to the event screen when it ends.
    if (useNarrativeStore.getState().isStoryActive) return;
    if (dismiss && useEventStore.getState().eventResolutionText) useEventStore.getState().dismissEventResolution();
}

export function visibleChoices(): string[] {
    const events = useEventStore.getState();
    return (events.activeEvent?.choices ?? []).filter(c => events.isChoiceVisible(c)).map(c => c.text);
}

/** Starts (or continues) an Ink conversation and picks the choices containing each text, in order. */
export function talk(knot: string | null, ...choices: string[]) {
    if (knot) narrativeService.startDialogue(knot, GameState.IN_GAME);
    for (const text of choices) {
        const options = useNarrativeStore.getState().currentChoices;
        const option = options.find(c => c.text.includes(text));
        if (!option) throw new Error(`Ink choice "${text}" not offered: ${JSON.stringify(options.map(c => c.text))}`);
        narrativeService.chooseChoiceIndex(option.index);
    }
}

export function endTalk() {
    if (useNarrativeStore.getState().isStoryActive) narrativeService.endDialogue();
}

export function inkChoices(): string[] {
    return useNarrativeStore.getState().currentChoices.map(c => c.text);
}

/** Wins the running fight with one decisive blow. */
export function winCombat() {
    const combat = useCombatStore.getState().activeCombat;
    if (!combat) throw new Error('No combat running');
    useCombatStore.setState({ activeCombat: { ...combat, enemyHp: { ...combat.enemyHp, current: 1 }, playerTurn: true } });
    useCombatStore.getState().playerCombatAction({ type: 'attack' });
    expect(useCombatStore.getState().activeCombat?.victory).toBe(true);
    useCombatStore.getState().cleanupCombat();
}

export function setTime(day: number, hour: number) {
    useTimeStore.setState({ gameTime: { day, hour, minute: 0 } });
}

export function findTile(tile: string): Position {
    const map = useGameStore.getState().map;
    for (let y = 0; y < map.length; y++) {
        const x = map[y].indexOf(tile);
        if (x !== -1) return { x, y };
    }
    throw new Error(`Tile ${tile} not on the map`);
}
