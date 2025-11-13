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
 * @version 1.6.0 - Added special location tiles
 */
const TILE_NAMES: Record<string, string> = {
    '.': 'Pianura', 'F': 'Foresta', '~': 'Acqua', 'M': 'Montagna',
    'R': 'Rifugio', 'C': 'Città', 'V': 'Villaggio',
    'S': 'Punto di Partenza', 'E': 'Destinazione', '@': 'Tu',
    'A': 'Avamposto', 'N': 'Nido della Cenere', 'T': 'Commerciante',
    'L': 'Laboratorio', 'B': 'Biblioteca', 'H': 'Capanna Erborista'
};

/**
 * Set of tile types that block player movement.
 * @constant
 */
const IMPASSABLE_TILES = new Set(['M']);

/**
 * Set of tile types that allow player movement.
 * @constant
 * @version 1.6.0 - Added special location tiles
 */
const TRAVERSABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~', 'A', 'N', 'T', 'L', 'B', 'H']);

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

    // ═══════════════════════════════════════════════════════════════════════════
    // WANDERING TRADER INTERACTION CHECK (v1.6.0)
    // ═══════════════════════════════════════════════════════════════════════════
    const { wanderingTrader } = useGameStore.getState();
    if (wanderingTrader && newPos.x === wanderingTrader.position.x && newPos.y === wanderingTrader.position.y) {
      // Player is moving onto trader's position - trigger encounter
      useInteractionStore.getState().startUniqueEvent('unique_wandering_trader_encounter');
      advanceTime(BASE_TIME_COST_PER_MOVE); // Consume movement time
      gameService.updateWanderingTrader(); // Trader moves after interaction
      return;
    }
    // ═══════════════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════════════
    // SPECIAL LOCATION TILES HANDLING (v1.6.0)
    // ═══════════════════════════════════════════════════════════════════════════
    // Priority handling for special locations before random events
    let specialTileActionTaken = false;

    switch (destinationTile) {
      case 'A': // Outpost - "Il Crocevia"
        useGameStore.setState({ playerPos: newPos });
        useInteractionStore.getState().enterOutpost();
        specialTileActionTaken = true;
        break;

      case 'N': // Ash Nest - One-time unique event
        if (!useGameStore.getState().gameFlags.has('ASH_NEST_VISITED')) {
          useGameStore.setState({ playerPos: newPos });
          useInteractionStore.getState().startUniqueEvent('lore_ash_nest');
          useGameStore.setState(state => ({
            gameFlags: new Set(state.gameFlags).add('ASH_NEST_VISITED')
          }));
          specialTileActionTaken = true;
        }
        break;

      case 'L': // Laboratory - One-time unique event
        if (!useGameStore.getState().gameFlags.has('LAB_VISITED')) {
          useGameStore.setState({ playerPos: newPos });
          useInteractionStore.getState().startUniqueEvent('unique_scientist_notes');
          useGameStore.setState(state => ({
            gameFlags: new Set(state.gameFlags).add('LAB_VISITED')
          }));
          specialTileActionTaken = true;
        }
        break;

      case 'B': // Library - One-time unique event
        if (!useGameStore.getState().gameFlags.has('LIBRARY_VISITED')) {
          useGameStore.setState({ playerPos: newPos });
          useInteractionStore.getState().startUniqueEvent('unique_ancient_library');
          useGameStore.setState(state => ({
            gameFlags: new Set(state.gameFlags).add('LIBRARY_VISITED')
          }));
          specialTileActionTaken = true;
        }
        break;

      case 'H': // Herbalist Cabin - Direct dialogue trigger (v1.9.9)
        useGameStore.setState({ playerPos: newPos });
        // Import dialogueService dynamically to avoid circular dependency
        import('./dialogueService').then(({ dialogueService }) => {
          dialogueService.startDialogue('olivia_main');
        });
        addJournalEntry({
          text: "Sei arrivato alla Capanna dell'Erborista. Un'oasi di vita in un mondo di morte.",
          type: JournalEntryType.NARRATIVE
        });
        specialTileActionTaken = true;
        break;
    }

    // If a special tile action was taken, skip normal movement logic
    if (specialTileActionTaken) {
      return;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WATER PUMP INTERACTION (v1.8.0)
    // ═══════════════════════════════════════════════════════════════════════════
    // Check if player is on a repaired water pump
    const canUsePump = useGameStore.getState().canUseWaterPump(newPos);
    if (canUsePump && destinationTile === 'V') {
      useGameStore.setState({ playerPos: newPos });
      useInteractionStore.getState().startUniqueEvent('use_water_pump');
      return;
    }
    // ═══════════════════════════════════════════════════════════════════════════

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

    // Update Wandering Trader position (v1.6.0)
    gameService.updateWanderingTrader();
  },

  /**
   * Updates the Wandering Trader's position (v1.6.0).
   * 
   * @description Manages the trader's movement on the map. Called after each player action
   * that advances time. The trader moves every 5 turns to a random adjacent valid tile.
   * 
   * Movement Logic:
   * - Decrements turnsUntilMove counter
   * - When counter reaches 0, attempts to move to adjacent tile
   * - Valid tiles: Plains (.), Forest (F), City (C), Village (V)
   * - Invalid tiles: Mountains (M), Water (~), Refuges (R), Special locations
   * - Tries directions in random order until valid position found
   * - Resets counter to 5 after successful move
   * 
   * @remarks
   * - Non-blocking: if no valid move exists, waits for next turn
   * - Trader never moves onto player position
   * - Movement is independent of player actions
   * 
   * @example
   * // Called at end of movePlayer
   * gameService.updateWanderingTrader();
   */
  updateWanderingTrader: () => {
    const { wanderingTrader, map, playerPos, advanceTraderTurn, moveTrader } = useGameStore.getState();
    
    if (!wanderingTrader) return;
    
    // Decrement counter
    if (wanderingTrader.turnsUntilMove > 1) {
      advanceTraderTurn();
      return;
    }
    
    // Time to move - try random adjacent tile
    const { x, y } = wanderingTrader.position;
    const directions = [
      { dx: 0, dy: -1 }, // North
      { dx: 0, dy: 1 },  // South
      { dx: 1, dy: 0 },  // East
      { dx: -1, dy: 0 }  // West
    ];
    
    // Shuffle directions for randomness
    const shuffledDirections = directions.sort(() => Math.random() - 0.5);
    
    for (const dir of shuffledDirections) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      
      // Validate new position
      if (
        newY >= 0 && newY < map.length &&
        newX >= 0 && newX < map[newY].length
      ) {
        const tile = map[newY][newX];
        const isPlayerPosition = newX === playerPos.x && newY === playerPos.y;
        
        // Valid tiles for trader: Plains, Forest, City, Village
        if (
          !isPlayerPosition &&
          (tile === '.' || tile === 'F' || tile === 'C' || tile === 'V')
        ) {
          // Valid position found - move trader
          moveTrader({ x: newX, y: newY });
          return;
        }
      }
    }
    
    // No valid move found - try again next turn
    advanceTraderTurn();
  },
};
