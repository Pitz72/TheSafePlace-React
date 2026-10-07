/**
 * Long simulated playthroughs: a random but reproducible player walks the
 * world for thousands of actions (events, fights, refuges, the outpost,
 * dialogues, level ups, items) while every invariant of the game state is
 * checked after each action. Any exception or console error fails the test.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { newGame, character, game } from './harness';
import { useEventStore } from '../store/eventStore';
import { useCombatStore, ENEMY_TURN_DELAY } from '../store/combatStore';
import { useInteractionStore, REFUGE_ACTION } from '../store/interactionStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { useTimeStore } from '../store/timeStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useTalentDatabaseStore } from '../data/talentDatabase';
import { narrativeService } from '../services/NarrativeService';
import { gameService } from '../services/gameService';
import { tradingService } from '../services/tradingService';
import { applyItemUse } from '../services/itemUseService';
import { startNewGame } from '../services/newGameService';
import { toAbsoluteMinutes } from '../utils/time';
import { ATTRIBUTES, SKILLS } from '../constants';
import { GameState, SkillName } from '../types';

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

/** Small seeded generator (mulberry32): the same seed plays the same game. */
function seeded(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function checkInvariants(label: string, lastTime: { value: number }) {
    const c = character();
    const g = game();
    const where = `${label} (stato ${GameState[g.gameState]})`;
    expect(c.hp.current, where).toBeGreaterThanOrEqual(0);
    expect(c.hp.current, where).toBeLessThanOrEqual(c.hp.max);
    for (const stat of [c.satiety, c.hydration, c.fatigue]) {
        expect(stat.current, where).toBeGreaterThanOrEqual(0);
        expect(stat.current, where).toBeLessThanOrEqual(stat.max);
    }
    const items = useItemDatabaseStore.getState().itemDatabase;
    c.inventory.forEach((entry, index) => {
        expect(items[entry.itemId], `${where}: oggetto ${entry.itemId}`).toBeDefined();
        expect(Number.isInteger(entry.quantity) && entry.quantity >= 1, `${where}: quantità di ${entry.itemId}`).toBe(true);
        if (entry.durability) {
            expect(entry.durability.current, `${where}: durabilità di ${entry.itemId}#${index}`).toBeGreaterThanOrEqual(0);
            expect(entry.durability.current, `${where}: durabilità di ${entry.itemId}#${index}`).toBeLessThanOrEqual(entry.durability.max);
        }
    });
    const slots: Array<[number | null, (id: string) => boolean]> = [
        [c.equippedWeapon, id => items[id]?.type === 'weapon'],
        [c.equippedArmor, id => items[id]?.type === 'armor' && items[id]?.slot === 'chest'],
        [c.equippedHead, id => items[id]?.type === 'armor' && items[id]?.slot === 'head'],
        [c.equippedLegs, id => items[id]?.type === 'armor' && items[id]?.slot === 'legs'],
    ];
    for (const [index, fits] of slots) {
        if (index === null) continue;
        const entry = c.inventory[index];
        expect(entry, `${where}: equipaggiamento su indice ${index} inesistente`).toBeDefined();
        expect(fits(entry.itemId), `${where}: ${entry.itemId} nello slot sbagliato`).toBe(true);
    }
    const { x, y } = g.playerPos;
    const tile = g.map[y]?.[x];
    expect(tile, `${where}: posizione (${x},${y}) fuori mappa`).toBeDefined();
    expect(tile, `${where}: dentro una montagna`).not.toBe('M');
    const now = toAbsoluteMinutes(useTimeStore.getState().gameTime);
    expect(now, `${where}: il tempo è tornato indietro`).toBeGreaterThanOrEqual(lastTime.value);
    lastTime.value = now;
}

/** Spends one decision of a player who mostly heads for the Safe Place. */
function act(random: () => number, stats: Record<string, number>) {
    const pick = <T,>(list: T[]): T => list[Math.floor(random() * list.length)];
    const g = game();
    const bump = (key: string) => { stats[key] = (stats[key] ?? 0) + 1; };

    // Level ups are applied whenever they are pending.
    const c = character();
    if (c.levelUpPending && g.gameState === GameState.IN_GAME) {
        const talents = useTalentDatabaseStore.getState().talents.filter(t =>
            c.level + 1 >= t.levelRequirement && c.skills[t.requiredSkill]?.proficient && !c.unlockedTalents.includes(t.id));
        const learnable = (Object.keys(SKILLS) as SkillName[]).filter(s => !c.skills[s]?.proficient);
        c.applyLevelUp({
            attribute: pick(ATTRIBUTES),
            talentId: talents.length > 0 ? pick(talents).id : undefined,
            proficiency: talents.length === 0 && learnable.length > 0 ? pick(learnable) : undefined,
        });
        bump('levelUp');
        return;
    }

    switch (g.gameState) {
        case GameState.IN_GAME: {
            const interaction = useInteractionStore.getState();
            if (interaction.isInRefuge) {
                const { options } = interaction.refugeMenuState;
                const wanted = [REFUGE_ACTION.SLEEP, REFUGE_ACTION.WAIT, REFUGE_ACTION.SEARCH, REFUGE_ACTION.LEAVE, REFUGE_ACTION.LEAVE];
                const choice = pick(wanted.filter(o => options.includes(o)));
                useInteractionStore.setState(s => ({ refugeMenuState: { ...s.refugeMenuState, selectedIndex: options.indexOf(choice) } }));
                useInteractionStore.getState().confirmRefugeMenuSelection();
                bump('refuge');
                return;
            }
            // Eat, drink and heal before it is too late.
            const items = useItemDatabaseStore.getState().itemDatabase;
            const needs: Array<[boolean, string]> = [
                [c.hydration.current < 40, 'hydration'],
                [c.satiety.current < 40, 'satiety'],
                [c.hp.current < c.hp.max * 0.5, 'heal'],
            ];
            for (const [needed, effect] of needs) {
                if (!needed) continue;
                const index = c.inventory.findIndex(e => items[e.itemId]?.type === 'consumable' && items[e.itemId]?.effects?.some(f => f.type === effect));
                if (index !== -1 && applyItemUse(index)) { bump(`use:${effect}`); return; }
            }
            const roll = random();
            if (roll < 0.03) { g.performActiveSearch(); bump('search'); return; }
            if (roll < 0.05) { g.performQuickRest(); bump('rest'); return; }
            // Mostly towards the Safe Place (south-east), sometimes anywhere.
            const directions: Array<[number, number]> = random() < 0.6 ? [[1, 0], [0, 1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
            const [dx, dy] = pick(directions);
            gameService.movePlayer(dx, dy);
            bump('step');
            return;
        }
        case GameState.EVENT_SCREEN: {
            const events = useEventStore.getState();
            if (events.eventResolutionText || !events.activeEvent) { events.dismissEventResolution(); return; }
            const owned = (id: string) => character().getItemCount(id);
            const usable = events.activeEvent.choices
                .map((choice, index) => ({ choice, index }))
                .filter(({ choice }) => events.isChoiceVisible(choice) && (choice.itemRequirements ?? []).every(r => owned(r.itemId) >= r.quantity));
            if (usable.length === 0) { events.dismissEventResolution(); bump('eventSkipped'); return; }
            events.resolveEventChoice(pick(usable).index);
            bump('event');
            return;
        }
        case GameState.COMBAT: {
            const combat = useCombatStore.getState().activeCombat;
            if (!combat) return;
            if (combat.victory) { useCombatStore.getState().cleanupCombat(); bump('victory'); return; }
            if (combat.playerTurn) {
                useCombatStore.getState().playerCombatAction(random() < 0.85 ? { type: 'attack' } : random() < 0.5 ? { type: 'analyze' } : { type: 'flee' });
            }
            vi.advanceTimersByTime(ENEMY_TURN_DELAY + 10);
            return;
        }
        case GameState.DIALOGUE:
        case GameState.CUTSCENE: {
            const narrative = useNarrativeStore.getState();
            if (narrative.isStoryActive) {
                if (narrative.currentChoices.length > 0) narrativeService.chooseChoiceIndex(pick(narrative.currentChoices).index);
                else if (g.gameState === GameState.CUTSCENE) narrativeService.skipCutscene();
                else narrativeService.endDialogue();
            } else if (g.activeCutscene) {
                g.endCutscene();
            } else {
                g.setGameState(GameState.IN_GAME);
            }
            bump(GameState[g.gameState].toLowerCase());
            return;
        }
        case GameState.MAIN_STORY:
            g.resolveMainStory();
            bump('mainStory');
            return;
        case GameState.ASH_LULLABY_CHOICE:
            g.setGameState(GameState.IN_GAME);
            useInteractionStore.getState().confirmRefugeMenuSelection();
            return;
        case GameState.OUTPOST: {
            const roll = random();
            if (roll < 0.15) narrativeService.startDialogue(pick(['marcus_main', 'anya_main', 'silas_main']), GameState.OUTPOST);
            else g.setGameState(GameState.IN_GAME);
            bump('outpost');
            return;
        }
        case GameState.TRADING:
            tradingService.cancelTrade();
            return;
        case GameState.LEVEL_UP_SCREEN:
        case GameState.QUEST_LOG:
        case GameState.PAUSE_MENU:
            g.setGameState(GameState.IN_GAME);
            return;
        default:
            throw new Error(`Stato inatteso durante la simulazione: ${GameState[g.gameState]}`);
    }
}

describe('simulated playthroughs', () => {
    it.each([1, 2, 3, 4])('seed %i: thousands of actions keep the game state consistent', async seed => {
        await newGame();
        const random = seeded(seed);
        vi.spyOn(Math, 'random').mockImplementation(random);
        vi.useFakeTimers();
        const stats: Record<string, number> = {};
        const lastTime = { value: toAbsoluteMinutes(useTimeStore.getState().gameTime) };

        for (let action = 0; action < 4000; action++) {
            const state = game().gameState;
            if (state === GameState.GAME_OVER || state === GameState.VICTORY) {
                stats[state === GameState.VICTORY ? 'victoryEnding' : `death:${game().deathCause}`] =
                    (stats[state === GameState.VICTORY ? 'victoryEnding' : `death:${game().deathCause}`] ?? 0) + 1;
                startNewGame();
                narrativeService.skipCutscene();
                character().setAttributes({ for: 12, des: 12, cos: 12, int: 12, sag: 12, car: 12 });
                game().setGameState(GameState.IN_GAME);
                lastTime.value = toAbsoluteMinutes(useTimeStore.getState().gameTime);
                continue;
            }
            act(random, stats);
            vi.advanceTimersByTime(1);
            checkInvariants(`seed ${seed}, azione ${action}`, lastTime);
        }
        if (process.env.SIM_STATS) process.stdout.write(`seed ${seed}: ${JSON.stringify(stats)}\n`);
        // The walk really exercised the game.
        expect(stats.step ?? 0).toBeGreaterThan(500);
        expect((stats.event ?? 0) + (stats.victory ?? 0)).toBeGreaterThan(5);
    }, 120_000);
});
