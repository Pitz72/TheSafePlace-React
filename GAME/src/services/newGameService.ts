import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { questService } from './questService';

export const MAIN_QUEST_ID = 'MQ_THE_ECHO_OF_THE_JOURNEY';

/** Fresh world, fresh character, the main quest, then the opening. */
export function startNewGame() {
    const game = useGameStore.getState();
    game.setMap();
    useCharacterStore.getState().initCharacter();
    questService.startQuest(MAIN_QUEST_ID);
    game.initializeWanderingTrader();
    game.startCutscene('CS_OPENING');
}
