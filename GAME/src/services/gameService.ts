/**
 * Game Service — player movement and the world's reaction to it.
 *
 * Every successful step goes through the same pipeline: time and survival
 * costs, exploration XP, quest checks, then whatever the destination tile
 * opens (refuge, outpost, special place, point of interest, encounter).
 */
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { useEventStore } from '../store/eventStore';
import { useCombatStore } from '../store/combatStore';
import { useInteractionStore } from '../store/interactionStore';
import { useMainStoryDatabaseStore } from '../data/mainStoryDatabase';
import { GameState, JournalEntryType, Position, WeatherType } from '../types';
import { MOUNTAIN_MESSAGES, BIOME_MESSAGES, ATMOSPHERIC_MESSAGES, BIOME_COLORS } from '../constants';
import { questService } from './questService';
import { narrativeService } from './NarrativeService';
import { isNightHour, toAbsoluteMinutes } from '../utils/time';

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const BASE_TIME_COST_PER_MOVE = 10;
const WALKABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~', 'A', 'N', 'L', 'B', 'H']);
/** Biomes whose first entry always brings an event. */
const GUARANTEED_EVENT_BIOMES = new Set(['F', 'C', 'V', '~']);
/** Tiles the wandering trader can walk on. */
const TRADER_TILES = new Set(['.', 'F', 'C', 'V']);

const WEATHER_TIME_PENALTY: Partial<Record<WeatherType, number>> = {
  [WeatherType.PIOGGIA]: 5,
  [WeatherType.TEMPESTA]: 10,
  [WeatherType.NEBBIA]: 5,
};

const isInGame = () => useGameStore.getState().gameState === GameState.IN_GAME;
const samePos = (a: Position, b: Position) => a.x === b.x && a.y === b.y;

export const gameService = {
  movePlayer: (dx: number, dy: number) => {
    const game = useGameStore.getState();
    if (game.gameState !== GameState.IN_GAME) return;
    const { map, playerPos, playerStatus, addJournalEntry } = game;
    const { advanceTime } = useTimeStore.getState();

    // Leaving a river takes a whole extra move.
    if (playerStatus.isExitingWater) {
      useGameStore.setState({ playerStatus: { ...playerStatus, isExitingWater: false } });
      addJournalEntry({ text: "Con fatica, esci dall'acqua.", type: JournalEntryType.NARRATIVE });
      advanceTime(BASE_TIME_COST_PER_MOVE * 2);
      gameService.updateWanderingTrader();
      return;
    }

    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };
    if (newPos.y < 0 || newPos.y >= map.length || newPos.x < 0 || newPos.x >= map[newPos.y].length) return;

    // Bumping into the wandering trader opens the encounter.
    const { wanderingTrader } = game;
    if (wanderingTrader && samePos(newPos, wanderingTrader.position)) {
      advanceTime(BASE_TIME_COST_PER_MOVE);
      if (!isInGame()) return;
      useEventStore.getState().openEvent('unique_wandering_trader_encounter');
      return;
    }

    const destinationTile = map[newPos.y][newPos.x];
    if (destinationTile === 'M') {
      addJournalEntry({ text: getRandom(MOUNTAIN_MESSAGES), type: JournalEntryType.ACTION_FAILURE });
      return;
    }
    if (!WALKABLE_TILES.has(destinationTile)) return;

    const usedRefuge = destinationTile === 'R' && game.visitedRefuges.some(p => samePos(p, newPos));
    // A used refuge is just ruins: walk through it like open ground.
    const terrain = usedRefuge ? '.' : destinationTile;
    const previousBiome = game.currentBiome;

    // --- Step costs ---
    gameService.takeStep(newPos, terrain);
    if (!isInGame()) return;

    // --- Biome change ---
    const biomeChanged = terrain !== previousBiome;
    if (biomeChanged) {
      const visitedBiomes = new Set(useGameStore.getState().visitedBiomes).add(terrain);
      useGameStore.setState({ currentBiome: terrain, visitedBiomes });
      const message = usedRefuge ? "Le rovine di un rifugio che hai già usato: non c'è più nulla qui." : BIOME_MESSAGES[terrain];
      if (message) addJournalEntry({ text: message, type: JournalEntryType.NARRATIVE, color: BIOME_COLORS[terrain] });
      if (['.', 'F', 'C', 'V', '~'].every(b => visitedBiomes.has(b))) {
        useCharacterStore.getState().unlockTrophy('trophy_explore_all_biomes');
      }
    }

    if (terrain === '~') gameService.enterWater();
    if (!isInGame()) return;

    questService.checkQuestTriggers({ source: 'move' });
    if (!isInGame()) return;

    // --- Places that take over the screen ---
    if (gameService.handleSpecialTile(terrain)) return;
    if (gameService.handlePointOfInterest(newPos)) return;

    useGameStore.getState().checkMainStoryTriggers();
    if (!isInGame()) return;
    useGameStore.getState().checkCutsceneTriggers();
    if (!isInGame()) return;

    if (terrain === 'E') gameService.hintSafePlace();

    // --- Encounters ---
    if (GUARANTEED_EVENT_BIOMES.has(terrain) && biomeChanged) {
      useEventStore.getState().triggerEncounter(true);
    } else {
      useEventStore.getState().triggerEncounter();
    }
    if (!isInGame() || useEventStore.getState().activeEvent || useCombatStore.getState().activeCombat) return;

    gameService.atmosphere(terrain);
    gameService.updateWanderingTrader();
  },

  /** Time, survival, XP and fatigue for one step onto `newPos`. */
  takeStep: (newPos: Position, terrain: string) => {
    const { addJournalEntry } = useGameStore.getState();
    const { advanceTime, gameTime, weather } = useTimeStore.getState();
    const character = useCharacterStore.getState();

    let timeCost = BASE_TIME_COST_PER_MOVE;
    if (terrain === 'F') timeCost += 10;
    const weatherPenalty = WEATHER_TIME_PENALTY[weather.type] ?? 0;
    if (weatherPenalty > 0) {
      timeCost += weatherPenalty;
      addJournalEntry({ text: `${weather.type}: ti muovi più lentamente. (+${weatherPenalty} min)`, type: JournalEntryType.SYSTEM_WARNING });
    }
    if (character.status.has('ESAUSTO')) timeCost += 5;
    if (character.hasTalent('wasteland_runner')) timeCost = Math.max(5, timeCost - 2);

    // Darkness and bad weather make you stumble — unless you carry a light.
    const lightActive = useGameStore.getState().lightUntil > toAbsoluteMinutes(gameTime);
    if (isNightHour(gameTime.hour) && !lightActive && Math.random() < 0.20) {
      character.takeDamage(1, 'ENVIRONMENT');
      addJournalEntry({ text: "L'oscurità ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === WeatherType.TEMPESTA && Math.random() < 0.15) {
      character.takeDamage(1, 'ENVIRONMENT');
      addJournalEntry({ text: "Il vento violento ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === WeatherType.PIOGGIA && Math.random() < 0.08) {
      character.takeDamage(1, 'ENVIRONMENT');
      addJournalEntry({ text: "Il terreno scivoloso ti fa cadere. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (!isInGame()) return;

    const totalSteps = useGameStore.getState().totalSteps + 1;
    useGameStore.setState({ playerPos: newPos, totalSteps });
    if (totalSteps === 100) character.unlockTrophy('trophy_explore_100_steps');
    if (totalSteps === 500) character.unlockTrophy('trophy_explore_500_steps');

    advanceTime(timeCost);
    if (!isInGame()) return;
    useCharacterStore.getState().gainExplorationXp();
    useCharacterStore.getState().updateFatigue(useCharacterStore.getState().hasTalent('wasteland_runner') ? 0.075 : 0.1);
  },

  enterWater: () => {
    const { addJournalEntry } = useGameStore.getState();
    const character = useCharacterStore.getState();
    const check = character.performSkillCheck('atletica', 12);
    if (check.success) {
      addJournalEntry({ text: "Riesci a contrastare la corrente e ad entrare in acqua senza problemi.", type: JournalEntryType.SKILL_CHECK_SUCCESS });
    } else {
      addJournalEntry({ text: "La corrente è più forte del previsto. Scivoli e urti una roccia. (-2 HP)", type: JournalEntryType.SKILL_CHECK_FAILURE });
      character.takeDamage(2, 'ENVIRONMENT');
    }
    useGameStore.setState(state => ({ playerStatus: { ...state.playerStatus, isExitingWater: true } }));
  },

  /** Refuges, the outpost and the unique map places. Returns true if a screen opened. */
  handleSpecialTile: (terrain: string): boolean => {
    const game = useGameStore.getState();
    const openOnce = (flag: string, eventId: string) => {
      if (game.hasFlag(flag)) return false;
      game.setFlag(flag);
      useEventStore.getState().openEvent(eventId);
      return true;
    };
    switch (terrain) {
      case 'R':
        useInteractionStore.getState().enterRefuge();
        return true;
      case 'A':
        useInteractionStore.getState().enterOutpost();
        return true;
      case 'H':
        game.addJournalEntry({ text: "Sei arrivato alla Capanna dell'Erborista. Un'oasi di vita in un mondo di morte.", type: JournalEntryType.NARRATIVE });
        narrativeService.startDialogue('olivia_main', GameState.IN_GAME);
        return true;
      case 'N':
        return openOnce('ASH_NEST_VISITED', 'lore_ash_nest');
      case 'L':
        return openOnce('LAB_VISITED', 'unique_scientist_notes');
      case 'B':
        return openOnce('LIBRARY_VISITED', 'unique_ancient_library');
      default:
        return false;
    }
  },

  /** Opens the event of a point of interest the player just stepped on. */
  handlePointOfInterest: (pos: Position): boolean => {
    const game = useGameStore.getState();
    const poi = game.pois.find(p => samePos(p, pos) && p.eventId && !p.consumed);
    if (!poi || !poi.eventId) return false;
    if (!poi.revealed) game.revealPOI(poi.id);
    if (poi.oneShot) {
      useGameStore.setState(state => ({ pois: state.pois.map(p => p.id === poi.id ? { ...p, consumed: true } : p) }));
    }
    return useEventStore.getState().openEvent(poi.eventId);
  },

  /** On the 'E' tile before the last memory: tell the player why nothing happens. */
  hintSafePlace: () => {
    const { mainStoryStage, addJournalEntry } = useGameStore.getState();
    const chapters = useMainStoryDatabaseStore.getState().mainStoryChapters;
    const finalStage = chapters.length;
    if (mainStoryStage >= finalStage) return;
    const missing = finalStage - mainStoryStage;
    addJournalEntry({
      text: `Il Safe Place è qui, a pochi passi. Ma i tuoi ricordi sono ancora frammentati: ti mancano ${missing} Echi della Memoria prima di poter varcare la soglia.`,
      type: JournalEntryType.SYSTEM_WARNING,
    });
  },

  atmosphere: (terrain: string) => {
    if (Math.random() >= 0.15) return;
    const messages = ATMOSPHERIC_MESSAGES[terrain];
    if (!messages) return;
    const { gameTime, weather } = useTimeStore.getState();
    const pool: string[] = [];
    if ((weather.type === WeatherType.PIOGGIA || weather.type === WeatherType.TEMPESTA) && messages.rain) pool.push(...messages.rain);
    pool.push(...(isNightHour(gameTime.hour) ? messages.night : messages.day));
    if (pool.length > 0) useGameStore.getState().addJournalEntry({ text: getRandom(pool), type: JournalEntryType.NARRATIVE });
  },

  /** The wandering trader moves to a random adjacent tile every 5 player moves. */
  updateWanderingTrader: () => {
    const { wanderingTrader, map, playerPos, advanceTraderTurn, moveTrader } = useGameStore.getState();
    if (!wanderingTrader) return;
    if (wanderingTrader.turnsUntilMove > 1) {
      advanceTraderTurn();
      return;
    }
    const { x, y } = wanderingTrader.position;
    const directions = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }]
      .sort(() => Math.random() - 0.5);
    for (const { dx, dy } of directions) {
      const next = { x: x + dx, y: y + dy };
      const tile = map[next.y]?.[next.x];
      if (tile && TRADER_TILES.has(tile) && !samePos(next, playerPos)) {
        moveTrader(next);
        return;
      }
    }
    advanceTraderTurn();
  },
};
