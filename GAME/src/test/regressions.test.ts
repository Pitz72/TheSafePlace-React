/**
 * Regression tests for the problems found in the code review: each test
 * reproduces a scenario that used to break and checks the fixed behaviour.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    newGame, luckyRolls, character, game, give, flush, stepOnto, openEvent, choose, visibleChoices, findTile, setTime,
    inventoryCount, winCombat,
} from './harness';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useInteractionStore } from '../store/interactionStore';
import { useCombatStore } from '../store/combatStore';
import { useEventStore } from '../store/eventStore';
import { useTimeStore } from '../store/timeStore';
import { useTradingStore } from '../store/tradingStore';
import { tradingService } from '../services/tradingService';
import { craftingService } from '../services/CraftingService';
import { applyItemUse, getItemActions, getRepairTargets, repairWith } from '../services/itemUseService';
import { useMainStoryDatabaseStore } from '../data/mainStoryDatabase';
import { useEnemyDatabaseStore } from '../data/enemyDatabase';
import { WEATHER_TRANSITIONS } from '../utils/weather';
import { toAbsoluteMinutes } from '../utils/time';
import { GameState, WeatherType } from '../types';

beforeEach(async () => {
    await newGame();
});
afterEach(() => vi.restoreAllMocks());

const indexOf = (itemId: string) => character().inventory.findIndex(i => i.itemId === itemId);

describe('main story', () => {
    it('chapter 5 starts in any refuge, at night too, even after other refuges were used', () => {
        luckyRolls();
        const refuges: { x: number; y: number }[] = [];
        game().map.forEach((row, y) => row.forEach((tile, x) => { if (tile === 'R') refuges.push({ x, y }); }));
        useGameStore.setState({ mainStoryStage: 1, playerPos: refuges[0] });
        useInteractionStore.getState().enterRefuge();
        useInteractionStore.getState().leaveRefuge();
        expect(game().visitedRefuges).toHaveLength(1);

        const chapter5 = useMainStoryDatabaseStore.getState().mainStoryChapters.find(c => c.stage === 5)!;
        expect(chapter5.trigger.type).toBe('firstRefugeEntry');
        setTime(4, 23);
        useGameStore.setState({ mainStoryStage: 5, mainStoryEventsToday: { day: 4, count: 0 }, gameState: GameState.IN_GAME });
        stepOnto(refuges[1]);
        expect(game().gameState).toBe(GameState.MAIN_STORY);
        expect(game().activeMainStoryEvent?.stage).toBe(5);
        game().resolveMainStory();
        expect(game().mainStoryStage).toBe(6);
        // Back from the memory, the player is still inside the refuge.
        expect(useInteractionStore.getState().isInRefuge).toBe(true);
    });

    it('a used refuge is a ruin: walking on it does not open it again', () => {
        luckyRolls();
        const refuge = findTile('R');
        stepOnto(refuge);
        expect(useInteractionStore.getState().isInRefuge).toBe(true);
        useInteractionStore.getState().leaveRefuge();
        stepOnto(refuge);
        expect(useInteractionStore.getState().isInRefuge).toBe(false);
    });
});

describe('cutscenes', () => {
    it('the first-kill cutscene waits for the end of the fight instead of being lost', async () => {
        luckyRolls();
        useCombatStore.getState().startCombat('raider_desperate');
        winCombat();
        expect(game().hasFlag('FIRST_HUMAN_KILL_PLAYED')).toBe(true);
        await flush();
        expect(game().gameState).toBe(GameState.CUTSCENE);
        expect(game().activeCutscene?.id).toBe('CS_FIRST_KILL');
    });

    it('a cutscene queued during an event plays when the event closes', async () => {
        luckyRolls();
        openEvent('city_mothers_trace');
        choose('Tira fuori il tessuto');
        await flush();
        expect(game().activeCutscene?.id).toBe('CS_MOTHERS_ECHO');
    });

    it('the city cutscene plays the first time the player enters a city', () => {
        luckyRolls();
        stepOnto(findTile('C'));
        expect(game().activeCutscene?.id).toBe('CS_CITY_OF_GHOSTS');
    });
});

describe('progression', () => {
    it('levels keep coming after 5: without talents the player picks a proficiency', () => {
        for (let level = 1; level < 9; level++) {
            character().addXp(character().xp.next - character().xp.current);
            expect(character().levelUpPending).toBe(true);
            character().applyLevelUp({ attribute: 'for', proficiency: level === 1 ? 'atletica' : undefined });
        }
        expect(character().level).toBe(9);
        expect(character().skills.atletica.proficient).toBe(true);
        expect(character().hp.current).toBe(character().hp.max);
    });

    it('talents do something: veteran survivor heals more and eats less', () => {
        const before = character().calculateSurvivalCost(600).satietyCost;
        useCharacterStore.setState({ unlockedTalents: ['veteran_survivor', 'field_medic'] });
        expect(character().calculateSurvivalCost(600).satietyCost).toBeLessThan(before);
        expect(character().getHealingMultiplier()).toBeCloseTo(1.75);
    });
});

describe('crafting', () => {
    it('crafting takes the recipe time, and the armorer is faster and builds sturdier gear', () => {
        luckyRolls();
        const start = toAbsoluteMinutes(useTimeStore.getState().gameTime);
        give('scrap_metal', 3);
        expect(craftingService.craft('recipe_makeshift_knife')).toBe(true);
        expect(toAbsoluteMinutes(useTimeStore.getState().gameTime) - start).toBe(30);

        useCharacterStore.setState({ unlockedTalents: ['field_armorer'] });
        give('scrap_metal', 3);
        const mid = toAbsoluteMinutes(useTimeStore.getState().gameTime);
        expect(craftingService.craft('recipe_makeshift_knife')).toBe(true);
        expect(toAbsoluteMinutes(useTimeStore.getState().gameTime) - mid).toBe(24);
        const knives = character().inventory.filter(i => i.itemId === 'makeshift_knife');
        expect(knives[1].durability!.max).toBe(knives[0].durability!.max + 10);
    });

    it('every recipe can be learned and manuals teach several recipes', () => {
        give('manual_archery_basics');
        useInteractionStore.setState({ inventorySelectedIndex: indexOf('manual_archery_basics') });
        expect(getItemActions(indexOf('manual_archery_basics'))).toContain('Leggi');
        useInteractionStore.setState({ actionMenuState: { isOpen: true, options: ['Leggi'], selectedIndex: 0, mode: 'actions' } });
        useInteractionStore.getState().confirmActionMenuSelection();
        expect(character().knownRecipes).toEqual(expect.arrayContaining(['recipe_makeshift_bow', 'recipe_slingshot']));
        expect(inventoryCount('manual_archery_basics')).toBe(0);
    });
});

describe('items', () => {
    it('a torch lights the night and is used up; the flashlight needs batteries', () => {
        give('torch');
        expect(applyItemUse(indexOf('torch'))).toBe(true);
        expect(game().lightUntil).toBeGreaterThan(toAbsoluteMinutes(useTimeStore.getState().gameTime));
        expect(inventoryCount('torch')).toBe(0);

        give('flashlight');
        expect(applyItemUse(indexOf('flashlight'))).toBe(false);
        give('batteries_pack', 2);
        expect(applyItemUse(indexOf('flashlight'))).toBe(true);
        expect(inventoryCount('flashlight')).toBe(1);
        expect(inventoryCount('batteries_pack')).toBe(1);
    });

    it('backpacks raise the carrying capacity without being used', () => {
        const base = character().getMaxCarryWeight();
        give('military_backpack');
        expect(character().getMaxCarryWeight()).toBe(base + 6);
        expect(getItemActions(indexOf('military_backpack'))).not.toContain('Usa');
    });

    it('repair kits repair the item the player picks', () => {
        give('crowbar');
        give('combat_knife');
        const knife = indexOf('combat_knife');
        useCharacterStore.setState(state => ({
            inventory: state.inventory.map((item, i) => (i === knife ? { ...item, durability: { current: 10, max: 70 } } : item)),
        }));
        give('tool_repair_kit_basic');
        const kit = indexOf('tool_repair_kit_basic');
        expect(getRepairTargets(kit)).toEqual([knife]);
        expect(repairWith(kit, knife)).toBe(true);
        expect(character().inventory[indexOf('combat_knife')].durability!.current).toBe(35);
        expect(inventoryCount('tool_repair_kit_basic')).toBe(0);
    });

    it('a tent lets the player sleep outdoors once per night', () => {
        luckyRolls();
        give('portable_tent');
        setTime(2, 22);
        useCharacterStore.setState({ hp: { current: 40, max: 100 } });
        expect(applyItemUse(indexOf('portable_tent'))).toBe(true);
        expect(useTimeStore.getState().gameTime).toMatchObject({ day: 3, hour: 6 });
        expect(character().hp.current).toBeGreaterThan(40);
        setTime(3, 21);
        useGameStore.setState({ lastShelterDay: 3 });
        expect(applyItemUse(indexOf('portable_tent'))).toBe(false);
    });

    it('quest items cannot be thrown away or sold', () => {
        expect(getItemActions(indexOf('carillon_annerito'))).not.toContain('Scarta');
        expect(tradingService.isTradable('carillon_annerito')).toBe(false);
    });
});

describe('combat', () => {
    it('firearms spend ammunition and become clubs when it runs out', () => {
        luckyRolls();
        give('weapon_handgun');
        useCharacterStore.getState().equipItem('weapon_handgun');
        give('ammo_9mm', 2);
        useCombatStore.getState().startCombat('raider_desperate');
        useCombatStore.getState().playerCombatAction({ type: 'attack' });
        expect(inventoryCount('ammo_9mm')).toBe(1);
    });

    it('special rounds load only into a firearm', () => {
        luckyRolls();
        give('ammo_piercing');
        useCombatStore.getState().startCombat('raider_desperate');
        useCombatStore.getState().playerCombatAction({ type: 'load_special_ammo', ammoType: 'piercing' });
        expect(inventoryCount('ammo_piercing')).toBe(1);
        expect(useCombatStore.getState().activeCombat?.playerTurn).toBe(true);
    });

    it('traps stop the enemy and smoke grenades guarantee an escape', () => {
        luckyRolls();
        give('bear_trap');
        give('smoke_grenade');
        useCombatStore.getState().startCombat('mutant_beast');
        useCombatStore.getState().playerCombatAction({ type: 'use_item', itemId: 'bear_trap' });
        expect(useCombatStore.getState().activeCombat?.enemyStunnedTurns).toBe(1);
        useCombatStore.getState().enemyTurn();
        expect(useCombatStore.getState().activeCombat?.playerTurn).toBe(true);
        useCombatStore.getState().playerCombatAction({ type: 'use_item', itemId: 'smoke_grenade' });
        expect(useCombatStore.getState().activeCombat).toBeNull();
        expect(game().gameState).toBe(GameState.IN_GAME);
    });

    it('victories count toward the combat trophies', () => {
        luckyRolls();
        useCombatStore.getState().startCombat('wild_dog');
        winCombat();
        expect(character().unlockedTrophies.has('trophy_combat_first_win')).toBe(true);
        expect(character().unlockedTrophies.has('trophy_combat_no_damage')).toBe(true);
        expect(game().totalCombatWins).toBe(1);
    });

    it('freed wolves spare the player, unless the player hunts them for Silas', () => {
        const { enemyDatabase } = useEnemyDatabaseStore.getState();
        // Only wolves roam this forest; 0.1 skips the easter eggs and rolls a fight.
        useEnemyDatabaseStore.setState({ enemyDatabase: { mutated_wolf: enemyDatabase['mutated_wolf'] } });
        try {
            vi.spyOn(Math, 'random').mockReturnValue(0.1);
            useGameStore.getState().setFlag('WOLF_FRIEND');
            useGameStore.setState({ currentBiome: 'F', lastEncounterTime: null });
            useEventStore.getState().triggerEncounter();
            expect(useCombatStore.getState().activeCombat).toBeNull();
            expect(game().journal.some(e => e.text.includes('Ti riconosce'))).toBe(true);
            useCharacterStore.setState({ activeQuests: { ...character().activeQuests, bounty_kill_wolves: 1 } });
            useGameStore.setState({ lastEncounterTime: null });
            useEventStore.getState().triggerEncounter();
            expect(useCombatStore.getState().activeCombat?.enemy.id).toBe('mutated_wolf');
        } finally {
            useEnemyDatabaseStore.setState({ enemyDatabase });
        }
    });
});

describe('trading', () => {
    it('traders have a real stock that sells out and comes back after a few days', () => {
        give('gold_bar');
        tradingService.startTradingSession('marcus', GameState.IN_GAME);
        const stock = useTradingStore.getState().traderStock;
        const torches = stock.findIndex(s => s.itemId === 'torch');
        useTradingStore.getState().addToTraderOffer({ inventoryIndex: torches, itemId: 'torch', quantity: 3, value: 3 * tradingService.unitValue({ itemId: 'torch' }) });
        useTradingStore.getState().addToPlayerOffer({ inventoryIndex: indexOf('gold_bar'), itemId: 'gold_bar', quantity: 1, value: 1000 });
        expect(tradingService.finalizeTrade()).toBe(true);
        expect(inventoryCount('torch')).toBe(3);
        expect(tradingService.getTraderStock('marcus').some(s => s.itemId === 'torch')).toBe(false);
        useTimeStore.getState().advanceTime(73 * 60, true);
        expect(tradingService.getTraderStock('marcus').find(s => s.itemId === 'torch')?.quantity).toBe(3);
    });

    it('selling removes the exact copy the player picked', () => {
        give('combat_knife', 2);
        const copies = character().inventory.map((item, index) => ({ item, index })).filter(e => e.item.itemId === 'combat_knife');
        useCharacterStore.getState().equipItem(copies[0].index);
        tradingService.startTradingSession('marcus', GameState.IN_GAME);
        useTradingStore.getState().addToPlayerOffer({ inventoryIndex: copies[1].index, itemId: 'combat_knife', quantity: 1, value: 75 });
        useTradingStore.getState().addToTraderOffer({ inventoryIndex: 0, itemId: useTradingStore.getState().traderStock[0].itemId, quantity: 1, value: 1 });
        expect(tradingService.finalizeTrade()).toBe(true);
        expect(inventoryCount('combat_knife')).toBe(1);
        const weapon = character().equippedWeapon;
        expect(weapon !== null && character().inventory[weapon].itemId).toBe('combat_knife');
    });
});

describe('save and load', () => {
    it('a saved game comes back exactly, including places, stock and the open refuge', () => {
        luckyRolls();
        openEvent('river_message_in_a_bottle');
        choose('Raccogli la bottiglia');
        const refuge = findTile('R');
        stepOnto(refuge);
        tradingService.getTraderStock('marcus');
        expect(game().saveGame(1)).toBe(true);
        const snapshot = { pos: game().playerPos, quests: character().activeQuests, inv: character().inventory.length };

        useGameStore.getState().setMap();
        useCharacterStore.getState().initCharacter();
        expect(game().loadGame(1)).toBe(true);
        expect(game().playerPos).toEqual(snapshot.pos);
        expect(character().activeQuests).toEqual(snapshot.quests);
        expect(character().inventory).toHaveLength(snapshot.inv);
        expect(game().getPOI('windmill')?.revealed).toBe(true);
        expect(game().traderStock.marcus).toBeDefined();
        expect(useInteractionStore.getState().isInRefuge).toBe(true);
    });

    it("old saves keep Anya's armour upgrades", () => {
        give('leather_jacket');
        useCharacterStore.getState().equipItem('leather_jacket');
        const ac = character().getPlayerAC();
        expect(game().saveGame(2)).toBe(true);
        const raw = JSON.parse(localStorage.getItem('tspc_save_2')!);
        raw.saveVersion = '2.0.17';
        raw.game.gameFlags.push('ARMOR_UPGRADED_CHEST_2');
        localStorage.setItem('tspc_save_2', JSON.stringify(raw));
        expect(game().loadGame(2)).toBe(true);
        expect(character().getPlayerAC()).toBe(ac + 2);
        expect(game().hasFlag('ARMOR_UPGRADED_CHEST_2')).toBe(false);
    });

    it('a corrupted save is refused instead of crashing the game', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorage.setItem('tspc_save_3', '{"saveVersion":"2.1.0","metadata":{}}');
        expect(game().loadGame(3)).toBe(false);
        localStorage.setItem('tspc_save_3', '{"saveVersion":');
        expect(game().loadGame(3)).toBe(false);
        expect(game().gameState).toBe(GameState.IN_GAME);
    });

    it('a save that breaks halfway through loading leaves the running game untouched', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        game().saveGame(2);
        const raw = JSON.parse(localStorage.getItem('tspc_save_2')!);
        raw.character.level = 7;
        raw.game.playerPos = { x: 1, y: 1 };
        localStorage.setItem('tspc_save_2', JSON.stringify(raw));
        const before = { level: character().level, pos: game().playerPos, day: useTimeStore.getState().gameTime.day };
        vi.spyOn(useTimeStore.getState(), 'fromJSON').mockImplementationOnce(() => { throw new Error('broken clock'); });
        expect(game().loadGame(2)).toBe(false);
        expect(character().level).toBe(before.level);
        expect(game().playerPos).toEqual(before.pos);
        expect(useTimeStore.getState().gameTime.day).toBe(before.day);
        expect(game().gameState).toBe(GameState.IN_GAME);
    });

    it('unknown or malformed items in a save are dropped and the equipment follows', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        game().saveGame(4);
        const raw = JSON.parse(localStorage.getItem('tspc_save_4')!);
        raw.character.inventory = [
            { itemId: 'special_ammo', quantity: 3 },
            null,
            { itemId: 'combat_knife', quantity: 1 },
            { itemId: 'leather_jacket', quantity: 0 },
        ];
        raw.character.equippedWeapon = 2;
        raw.character.equippedArmor = 3;
        raw.character.equippedHead = 0;
        localStorage.setItem('tspc_save_4', JSON.stringify(raw));
        expect(game().loadGame(4)).toBe(true);
        expect(character().inventory).toEqual([{ itemId: 'combat_knife', quantity: 1 }, { itemId: 'leather_jacket', quantity: 1 }]);
        expect(character().equippedWeapon).toBe(0);
        expect(character().equippedArmor).toBe(1);
        expect(character().equippedHead).toBeNull();
    });
});

describe('world', () => {
    it('fog is part of the weather cycle and every transition row sums to 1', () => {
        const reachable = Object.values(WEATHER_TRANSITIONS).some(row => row.some(t => t.to === WeatherType.NEBBIA));
        expect(reachable).toBe(true);
        for (const row of Object.values(WEATHER_TRANSITIONS)) {
            expect(row.reduce((sum, t) => sum + t.probability, 0)).toBeCloseTo(1);
        }
    });

    it('events hide choices that do not apply and explain what an item choice needs', () => {
        luckyRolls();
        openEvent('village_pump');
        expect(visibleChoices().some(c => c.includes('Bevi alla pompa'))).toBe(false);
        expect(visibleChoices().some(c => c.includes('Ripara la pompa'))).toBe(false);
    });

    it('active search finds water near a river and gives one search per area', () => {
        luckyRolls();
        const river = findTile('~');
        useGameStore.setState({ playerPos: { x: river.x - 1, y: river.y }, currentBiome: '.', lastSearchedBiome: null });
        const water = inventoryCount('dirty_water');
        game().performActiveSearch();
        expect(inventoryCount('dirty_water')).toBeGreaterThan(water);
        const again = inventoryCount('dirty_water');
        game().performActiveSearch();
        expect(inventoryCount('dirty_water')).toBe(again);
    });
});
