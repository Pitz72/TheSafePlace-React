/**
 * @fileoverview Game Service - Core gameplay logic layer
 *
 * @description Service layer that handles complex game logic, particularly player movement.
 * Separates business logic from state management (stores) following the Service Layer pattern.
 *
 * Architecture:
 * - Services contain complex logic and coordinate between multiple stores
 * - Stores focus on state management only
 * - Components call services, not stores directly (for complex operations)
 *
 * @module services/gameService
 */

import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { useEventStore } from '../store/eventStore';
import { useCombatStore } from '../store/combatStore';
import { useInteractionStore } from '../store/interactionStore';
import { GameState, JournalEntryType } from '../types';
import { MOUNTAIN_MESSAGES, BIOME_MESSAGES, ATMOSPHERIC_MESSAGES, BIOME_COLORS } from '../constants';
import { questService } from './questService';

/**
 * Gets a random element from an array.
 * @template T
 * @param {T[]} arr - Array to pick from
 * @returns {T} Random element
 */
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Mapping of tile characters to Italian display names.
 * @constant
 */
const TILE_NAMES: Record<string, string> = {
    '.': 'Pianura', 'F': 'Foresta', '~': 'Acqua', 'M': 'Montagna',
    'R': 'Rifugio', 'C': 'Città', 'V': 'Villaggio',
    'S': 'Punto di Partenza', 'E': 'Destinazione', '@': 'Tu'
};

/**
 * Set of tile types that block player movement.
 * @constant
 */
const IMPASSABLE_TILES = new Set(['M']);

/**
 * Set of tile types that allow player movement.
 * @constant
 */
const TRAVERSABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~']);

/**
 * Base time cost in minutes for a single movement.
 * @constant
 */
const BASE_TIME_COST_PER_MOVE = 10;

/**
 * Game Service - Core gameplay logic
 *
 * @description Service object containing complex game logic functions.
 * Currently focused on player movement, but designed to be extended.
 */
export const gameService = {
  /**
   * Moves the player on the map and handles all movement-related logic.
   *
   * @description This is the core movement function that coordinates:
   * - Position validation and boundary checking
   * - Tile traversability checks
   * - Water entry/exit mechanics
   * - Refuge entry system
   * - Biome transitions and messages
   * - Time advancement with weather/terrain modifiers
   * - Environmental hazards (night, weather)
   * - XP gain and fatigue accumulation
   * - Story/cutscene trigger checks
   * - Event/combat encounter triggers
   * - Atmospheric flavor messages
   * - Trophy unlocks (steps, biomes)
   *
   * Movement Flow:
   * 1. Check if exiting water (special 2-turn mechanic)
   * 2. Validate new position (bounds, impassable tiles)
   * 3. Handle refuge entry (one-time use)
   * 4. Process biome transitions
   * 5. Handle water entry (Atletica DC 12 check)
   * 6. Calculate time cost (base + terrain + weather)
   * 7. Apply environmental hazards (night, weather damage)
   * 8. Update position and step counter
   * 9. Advance time and update survival stats
   * 10. Gain exploration XP and fatigue
   * 11. Check story/cutscene triggers
   * 12. Trigger encounters (guaranteed for new biomes)
   * 13. Add atmospheric flavor messages (15% chance)
   *
   * @param {number} dx - Horizontal movement delta (-1 left, +1 right, 0 none)
   * @param {number} dy - Vertical movement delta (-1 up, +1 down, 0 none)
   *
   * @remarks
   * Time Costs:
   * - Base: 10 minutes
   * - Forest: +10 minutes (dense vegetation)
   * - Water: ×2 (entry + exit turns)
   * - Pioggia: +5 minutes
   * - Tempesta: +10 minutes
   *
   * Environmental Hazards:
   * - Night (20:00-6:00): 20% chance -1 HP per move
   * - Tempesta: 15% chance -1 HP per move
   * - Pioggia: 8% chance -1 HP per move
   * - Water entry fail: -2 HP (Atletica DC 12)
   *
   * Guaranteed Events:
   * - First step in Forest: Forest-specific event
   * - First step in City: City-specific event
   * - First step in Village: Village-specific event
   *
   * Trophy Triggers:
   * - 100 steps: trophy_explore_100_steps
   * - 500 steps: trophy_explore_500_steps
   * - All biomes visited: trophy_explore_all_biomes
   *
   * @example
   * // Move player right
   * gameService.movePlayer(1, 0);
   * // Validates position, advances time, triggers events, etc.
   *
   * @see useGameStore for game state
   * @see useEventStore.triggerEncounter for encounter system
   * @see checkMainStoryTriggers for story progression
   * @see checkCutsceneTriggers for cutscene system
   */
  movePlayer: (dx: number, dy: number) => {
    const { map, playerPos, playerStatus, addJournalEntry, visitedRefuges, currentBiome: previousBiome, checkMainStoryTriggers, checkCutsceneTriggers } = useGameStore.getState();
    const { advanceTime, gameTime } = useTimeStore.getState();
    const { unlockTrophy } = useCharacterStore.getState();

    if (playerStatus.isExitingWater) {
        useGameStore.setState({ playerStatus: { ...playerStatus, isExitingWater: false } });
        advanceTime(BASE_TIME_COST_PER_MOVE * 2);
        addJournalEntry({ text: "Con fatica, esci dall'acqua.", type: JournalEntryType.NARRATIVE });
        return;
    }

    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };

    if ( newPos.y < 0 || newPos.y >= map.length || newPos.x < 0 || newPos.x >= map[newPos.y].length ) return;

    const destinationTile = map[newPos.y][newPos.x];
    if (IMPASSABLE_TILES.has(destinationTile)) {
        const message = MOUNTAIN_MESSAGES[Math.floor(Math.random() * MOUNTAIN_MESSAGES.length)];
        addJournalEntry({ text: message, type: JournalEntryType.ACTION_FAILURE });
        return;
    }

    if (destinationTile === 'R') {
        const isVisited = visitedRefuges.some(pos => pos.x === newPos.x && pos.y === newPos.y);
        if (isVisited) {
            addJournalEntry({ text: "Hai già usato questo rifugio. Non offre più riparo.", type: JournalEntryType.ACTION_FAILURE });
            return;
        }
        useGameStore.setState({ playerPos: newPos });
        useInteractionStore.getState().enterRefuge();
        return;
    }

    if (!TRAVERSABLE_TILES.has(destinationTile)) return;

    if (destinationTile !== previousBiome) {
        const biomeMessage = BIOME_MESSAGES[destinationTile];
        if (biomeMessage) {
            addJournalEntry({ text: biomeMessage, type: JournalEntryType.NARRATIVE, color: BIOME_COLORS[destinationTile] });
            const newVisitedBiomes = new Set(useGameStore.getState().visitedBiomes).add(destinationTile);
            useGameStore.setState({ currentBiome: destinationTile, visitedBiomes: newVisitedBiomes });

            if(newVisitedBiomes.has('.') && newVisitedBiomes.has('F') && newVisitedBiomes.has('C') && newVisitedBiomes.has('V') && newVisitedBiomes.has('~')) {
              unlockTrophy('trophy_explore_all_biomes');
            }
        }
    }

    if (destinationTile === '~') {
        const skillCheck = useCharacterStore.getState().performSkillCheck('atletica', 12);
        if(skillCheck.success) {
            addJournalEntry({ text: "Riesci a contrastare la corrente e ad entrare in acqua senza problemi.", type: JournalEntryType.SKILL_CHECK_SUCCESS });
        } else {
            const damage = 2;
            addJournalEntry({ text: "La corrente è più forte del previsto. Scivoli e urti una roccia.", type: JournalEntryType.SKILL_CHECK_FAILURE });
            useCharacterStore.getState().takeDamage(damage, 'ENVIRONMENT');
            addJournalEntry({ text: `Subisci ${damage} danni.`, type: JournalEntryType.COMBAT });
        }
        useGameStore.setState({ playerStatus: { ...useGameStore.getState().playerStatus, isExitingWater: true } });
    }

    let timeCost = BASE_TIME_COST_PER_MOVE;
    if (destinationTile === 'F') timeCost += 10;

    const { weather } = useTimeStore.getState();
    let weatherPenalty = 0;
    if (weather.type === 'Pioggia') weatherPenalty = 5;
    if (weather.type === 'Tempesta') weatherPenalty = 10;
    if (weatherPenalty > 0) {
        timeCost += weatherPenalty;
        addJournalEntry({ text: `${weather.type} rallenta i tuoi movimenti. (+${weatherPenalty} min)`, type: JournalEntryType.SYSTEM_WARNING });
    }

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight && Math.random() < 0.20) {
        useCharacterStore.getState().takeDamage(1, 'ENVIRONMENT');
        addJournalEntry({ text: "L'oscurità ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === 'Tempesta' && Math.random() < 0.15) {
        useCharacterStore.getState().takeDamage(1, 'ENVIRONMENT');
        addJournalEntry({ text: "Il vento violento ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === 'Pioggia' && Math.random() < 0.08) {
        useCharacterStore.getState().takeDamage(1, 'ENVIRONMENT');
        addJournalEntry({ text: "Il terreno scivoloso ti fa cadere. (-1 HP)", type: JournalEntryType.COMBAT });
    }

    const newTotalSteps = useGameStore.getState().totalSteps + 1;
    useGameStore.setState({ playerPos: newPos, totalSteps: newTotalSteps });
    if (newTotalSteps === 100) unlockTrophy('trophy_explore_100_steps');
    if (newTotalSteps === 500) unlockTrophy('trophy_explore_500_steps');

    advanceTime(timeCost);
    useCharacterStore.getState().gainExplorationXp();
    useCharacterStore.getState().updateFatigue(0.1);

    // Check quest triggers after movement (for reachLocation triggers)
    questService.checkQuestTriggers();

    checkMainStoryTriggers();
    if (useGameStore.getState().gameState !== GameState.IN_GAME) return;

    checkCutsceneTriggers();
    if (useGameStore.getState().gameState !== GameState.IN_GAME) return;

    let eventTriggered = false;
    const guaranteedEventBiomes = ['F', 'C', 'V', '~']; // Added water for quest trigger
    if (guaranteedEventBiomes.includes(destinationTile) && destinationTile !== previousBiome) {
      useEventStore.getState().triggerEncounter(true); // Force biome-specific event
      eventTriggered = true;
    }

    if (eventTriggered) return;

    useEventStore.getState().triggerEncounter();
    if (useEventStore.getState().activeEvent || useCombatStore.getState().activeCombat) return;

    if (Math.random() < 0.15) {
        const { currentBiome } = useGameStore.getState();
        const biomeMessages = ATMOSPHERIC_MESSAGES[currentBiome];
        if (biomeMessages) {
            let possibleMessages: string[] = [];
            if ((weather.type === 'Pioggia' || weather.type === 'Tempesta') && biomeMessages.rain) {
                possibleMessages.push(...biomeMessages.rain);
            }
            if (isNight) {
                possibleMessages.push(...biomeMessages.night);
            } else {
                possibleMessages.push(...biomeMessages.day);
            }
            if (possibleMessages.length > 0) {
                addJournalEntry({ text: getRandom(possibleMessages), type: JournalEntryType.NARRATIVE });
            }
        }
    }
  },
};
