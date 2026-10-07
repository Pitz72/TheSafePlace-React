import { useItemDatabaseStore } from './itemDatabase';
import { useEventDatabaseStore } from './eventDatabase';
import { useRecipeDatabaseStore } from './recipeDatabase';
import { useEnemyDatabaseStore } from './enemyDatabase';
import { useMainStoryDatabaseStore } from './mainStoryDatabase';
import { useCutsceneDatabaseStore } from './cutsceneDatabase';
import { useQuestDatabaseStore } from './questDatabase';
import { useTraderDatabaseStore } from './traderDatabase';
import { useLoreArchiveDatabaseStore } from './loreArchiveDatabase';
import { useTalentDatabaseStore } from './talentDatabase';
import { useTrophyDatabaseStore } from './trophyDatabase';
import { usePoiDatabaseStore } from './poiDatabase';
import { useLootTableStore } from './lootTableDatabase';

/** Loads every game database in parallel. Rejects if any file is missing or invalid. */
export async function loadAllGameData(): Promise<void> {
    await Promise.all([
        useItemDatabaseStore.getState().loadDatabase(),
        useEventDatabaseStore.getState().loadDatabase(),
        useRecipeDatabaseStore.getState().loadDatabase(),
        useEnemyDatabaseStore.getState().loadDatabase(),
        useMainStoryDatabaseStore.getState().loadDatabase(),
        useCutsceneDatabaseStore.getState().loadDatabase(),
        useQuestDatabaseStore.getState().loadDatabase(),
        useTraderDatabaseStore.getState().loadDatabase(),
        useLoreArchiveDatabaseStore.getState().loadDatabase(),
        useTalentDatabaseStore.getState().loadDatabase(),
        useTrophyDatabaseStore.getState().loadDatabase(),
        usePoiDatabaseStore.getState().loadDatabase(),
        useLootTableStore.getState().loadDatabase(),
    ]);
}
