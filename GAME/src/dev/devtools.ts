import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { useInteractionStore } from '../store/interactionStore';
import { useEventStore } from '../store/eventStore';
import { useCombatStore } from '../store/combatStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { useTradingStore } from '../store/tradingStore';
import { startNewGame } from '../services/newGameService';
import { narrativeService } from '../services/NarrativeService';
import { tradingService } from '../services/tradingService';
import { GameState } from '../types';

/** Development builds only: exposes the stores as window.__tsp (screenshot scripts, console). */
export function install() {
    (window as unknown as { __tsp: object }).__tsp = {
        useGameStore, useCharacterStore, useTimeStore, useInteractionStore, useEventStore,
        useCombatStore, useNarrativeStore, useTradingStore, startNewGame, narrativeService, tradingService, GameState,
    };
}
