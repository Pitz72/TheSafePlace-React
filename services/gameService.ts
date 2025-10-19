import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { useEventStore } from '../store/eventStore';
import { useCombatStore } from '../store/combatStore';
import { useInteractionStore } from '../store/interactionStore';
import { GameState, JournalEntryType } from '../types';
import { MOUNTAIN_MESSAGES, BIOME_MESSAGES, ATMOSPHERIC_MESSAGES, BIOME_COLORS } from '../constants';

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const TILE_NAMES: Record<string, string> = {
    '.': 'Pianura', 'F': 'Foresta', '~': 'Acqua', 'M': 'Montagna',
    'R': 'Rifugio', 'C': 'Città', 'V': 'Villaggio',
    'S': 'Punto di Partenza', 'E': 'Destinazione', '@': 'Tu'
};
const IMPASSABLE_TILES = new Set(['M']);
const TRAVERSABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~']);
const BASE_TIME_COST_PER_MOVE = 10;

export const gameService = {
  movePlayer: (dx: number, dy: number) => {
    const { map, playerPos, playerStatus, addJournalEntry, visitedRefuges, currentBiome: previousBiome, checkMainQuestTriggers, checkCutsceneTriggers } = useGameStore.getState();
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

    checkMainQuestTriggers();
    if (useGameStore.getState().gameState !== GameState.IN_GAME) return;

    checkCutsceneTriggers();
    if (useGameStore.getState().gameState !== GameState.IN_GAME) return;

    let eventTriggered = false;
    const guaranteedEventBiomes = ['F', 'C', 'V'];
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
