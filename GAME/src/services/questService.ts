/**
 * Quest engine.
 *
 * A quest is a list of stages; each stage has a trigger (the completion
 * condition) and optionally a location (shown as a marker on the map).
 * Location events are NOT handled here: they belong to points of interest and
 * are opened by gameService when the player steps on the tile, so quest checks
 * can run any number of times without reopening events.
 *
 * Trigger kinds:
 * - state triggers (getItem, hasItems, hasFlags, reachLocation, enemyDefeated,
 *   mainStoryComplete, craftItem, successfulFlee, tacticRevealed) are evaluated
 *   on every check against the current game state;
 * - signal triggers (talkToNPC, interactWithObject, completeEvent) fire when a
 *   dialogue or an event reports the matching id. A signal may also match a
 *   LATER stage: the quest then catches up to it (the player already did the
 *   intermediate steps another way).
 */
import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useQuestDatabaseStore } from '../data/questDatabase';
import { JournalEntryType, Position, Quest, QuestCheckContext, QuestLocation, QuestStage, QuestType } from '../types';
import { debugLog } from '../utils/logger';

const SIGNAL_TRIGGERS = new Set(['talkToNPC', 'interactWithObject', 'completeEvent']);

export function resolveQuestLocation(location: QuestLocation | undefined | null): Position | null {
  if (!location) return null;
  if ('poi' in location) {
    const poi = useGameStore.getState().getPOI(location.poi);
    return poi ? { x: poi.x, y: poi.y } : null;
  }
  if (typeof location.x === 'number' && typeof location.y === 'number') return { x: location.x, y: location.y };
  return null;
}

const stageLocation = (stage: QuestStage | undefined): Position | null => {
  if (!stage) return null;
  if (stage.location) return resolveQuestLocation(stage.location);
  if (stage.trigger.type === 'reachLocation') return resolveQuestLocation(stage.trigger.value);
  return null;
};

const currentStageOf = (quest: Quest, stageNumber: number): QuestStage | undefined =>
  quest.stages.find(s => s.stage === stageNumber);

/** Markers for the current stage of every active quest that has a location. */
export const getActiveQuestMarkers = (
  activeQuests: Record<string, number> = useCharacterStore.getState().activeQuests,
): Array<{ pos: Position, type: QuestType, id: string }> => {
  const { quests } = useQuestDatabaseStore.getState();
  const markers: Array<{ pos: Position, type: QuestType, id: string }> = [];
  for (const questId of Object.keys(activeQuests)) {
    const quest = quests[questId];
    if (!quest) continue;
    const pos = stageLocation(currentStageOf(quest, activeQuests[questId]));
    if (pos) markers.push({ pos, type: quest.type, id: questId });
  }
  return markers;
};

/** Human readable progress for stages that track counts (quest log). */
export const getStageProgress = (questId: string): string | null => {
  const quest = useQuestDatabaseStore.getState().quests[questId];
  const { activeQuests, questKillCounts, getItemCount } = useCharacterStore.getState();
  const stage = quest ? currentStageOf(quest, activeQuests[questId]) : undefined;
  if (!stage) return null;
  const { type, value } = stage.trigger;
  if (type === 'enemyDefeated') {
    const killed = Math.min(value.quantity, questKillCounts[questId]?.[value.enemyId] ?? 0);
    return `${killed}/${value.quantity}`;
  }
  if (type === 'hasItems') {
    return (value as Array<{ itemId: string; quantity: number }>)
      .map(req => `${Math.min(req.quantity, getItemCount(req.itemId))}/${req.quantity}`)
      .join(' · ');
  }
  if (type === 'hasFlags') {
    const { gameFlags } = useGameStore.getState();
    const flags = value as string[];
    return `${flags.filter(f => gameFlags.has(f)).length}/${flags.length}`;
  }
  return null;
};

function isStateTriggerMet(stage: QuestStage, questId: string): boolean {
  const { type, value } = stage.trigger;
  const character = useCharacterStore.getState();
  const game = useGameStore.getState();
  switch (type) {
    case 'reachLocation': {
      const target = resolveQuestLocation(value);
      return !!target && game.playerPos.x === target.x && game.playerPos.y === target.y;
    }
    case 'getItem':
      return character.getItemCount(value as string) > 0;
    case 'hasItems':
      return (value as Array<{ itemId: string; quantity: number }>)
        .every(req => character.getItemCount(req.itemId) >= req.quantity);
    case 'hasFlags':
      return (value as string[]).every(flag => game.gameFlags.has(flag));
    case 'enemyDefeated': {
      const { enemyId, quantity } = value as { enemyId: string; quantity: number };
      return (character.questKillCounts[questId]?.[enemyId] ?? 0) >= quantity;
    }
    case 'mainStoryComplete':
      return game.mainStoryStage >= (value as number);
    case 'craftItem':
      return character.getQuestFlag(`crafted_${value}`);
    case 'successfulFlee':
      return character.getQuestFlag('hasSuccessfullyFled');
    case 'tacticRevealed':
      return character.getQuestFlag('hasRevealedTactic');
    default:
      return false;
  }
}

function signalMatches(stage: QuestStage, ctx: QuestCheckContext): boolean {
  const { type, value } = stage.trigger;
  if (type === 'completeEvent') return !!ctx.eventId && ctx.eventId === value;
  return !!ctx.nodeId && ctx.nodeId === value;
}

function setStage(questId: string, stage: number) {
  useCharacterStore.setState(state => ({ activeQuests: { ...state.activeQuests, [questId]: stage } }));
}

export const questService = {
  startQuest: (questId: string) => {
    const quest = useQuestDatabaseStore.getState().quests[questId];
    if (!quest) {
      console.error(`[QUEST SERVICE] Quest ${questId} not found in database`);
      return;
    }
    const { activeQuests, completedQuests, failedQuests } = useCharacterStore.getState();
    if (activeQuests[questId] || completedQuests.includes(questId) || failedQuests.includes(questId)) return;

    setStage(questId, 1);
    const { addJournalEntry, revealPOI } = useGameStore.getState();
    addJournalEntry({ text: `[MISSIONE AVVIATA] ${quest.title}`, type: JournalEntryType.XP_GAIN, color: '#facc15' });
    addJournalEntry({ text: quest.startText, type: JournalEntryType.NARRATIVE });
    quest.revealPOIs?.forEach(poiId => revealPOI(poiId));
    debugLog(`[QUEST] started ${questId}`);

    // The player may already satisfy the first stages (items in the pack, flags...).
    questService.checkQuestTriggers({ source: 'story' });
  },

  /** Moves to the next stage. With fromStage, only advances from that exact stage. */
  advanceQuest: (questId: string, fromStage?: number) => {
    const quest = useQuestDatabaseStore.getState().quests[questId];
    const current = useCharacterStore.getState().activeQuests[questId];
    if (!quest || !current) return;
    if (fromStage !== undefined && current !== fromStage) return;

    const next = current + 1;
    if (next > quest.stages.length) {
      questService.completeQuest(questId);
      return;
    }
    setStage(questId, next);
    const objective = currentStageOf(quest, next)?.objective;
    useGameStore.getState().addJournalEntry({
      text: `[MISSIONE AGGIORNATA] ${quest.title}${objective ? ` — ${objective}` : ''}`,
      type: JournalEntryType.XP_GAIN,
      color: '#facc15',
    });
  },

  completeQuest: (questId: string) => {
    const quest = useQuestDatabaseStore.getState().quests[questId];
    if (!quest) {
      console.error(`[QUEST SERVICE] Quest ${questId} not found in database`);
      return;
    }
    const character = useCharacterStore.getState();
    if (!character.activeQuests[questId]) return;

    const activeQuests = { ...character.activeQuests };
    delete activeQuests[questId];
    useCharacterStore.setState({ activeQuests, completedQuests: [...character.completedQuests, questId] });

    const { addJournalEntry, setFlag } = useGameStore.getState();
    addJournalEntry({ text: `[MISSIONE COMPLETATA] ${quest.title}`, type: JournalEntryType.XP_GAIN, color: '#22c55e' });

    const reward = quest.finalReward ?? {};
    if (reward.xp) {
      character.addXp(reward.xp);
      addJournalEntry({ text: `Hai guadagnato ${reward.xp} XP!`, type: JournalEntryType.XP_GAIN });
    }
    reward.items?.forEach(item => character.addItem(item.itemId, item.quantity));
    if (reward.statBoost) {
      character.boostAttribute(reward.statBoost.stat, reward.statBoost.amount);
      addJournalEntry({
        text: `Il tuo attributo ${reward.statBoost.stat.toUpperCase()} aumenta di ${reward.statBoost.amount}!`,
        type: JournalEntryType.XP_GAIN,
      });
    }
    if (reward.lore) character.addLoreEntry(reward.lore);
    reward.flags?.forEach(flag => setFlag(flag));
    if (quest.completionText) {
      addJournalEntry({ text: quest.completionText, type: JournalEntryType.XP_GAIN, color: '#22c55e' });
    }
    debugLog(`[QUEST] completed ${questId}`);
  },

  failQuest: (questId: string, reason?: string) => {
    const quest = useQuestDatabaseStore.getState().quests[questId];
    const character = useCharacterStore.getState();
    if (!quest || !character.activeQuests[questId]) return;
    const activeQuests = { ...character.activeQuests };
    delete activeQuests[questId];
    useCharacterStore.setState({ activeQuests, failedQuests: [...character.failedQuests, questId] });
    useGameStore.getState().addJournalEntry({
      text: `[MISSIONE FALLITA] ${quest.title}${reason ? ` — ${reason}` : ''}`,
      type: JournalEntryType.SYSTEM_WARNING,
      color: '#ef4444',
    });
  },

  incrementQuestKillCount: (enemyId: string) => {
    const { activeQuests, questKillCounts } = useCharacterStore.getState();
    const { quests } = useQuestDatabaseStore.getState();
    let changed = false;
    const counts = { ...questKillCounts };
    for (const questId of Object.keys(activeQuests)) {
      const quest = quests[questId];
      const stage = quest ? currentStageOf(quest, activeQuests[questId]) : undefined;
      if (stage?.trigger.type !== 'enemyDefeated' || stage.trigger.value.enemyId !== enemyId) continue;
      counts[questId] = { ...(counts[questId] ?? {}), [enemyId]: (counts[questId]?.[enemyId] ?? 0) + 1 };
      changed = true;
      const { quantity } = stage.trigger.value;
      if (counts[questId][enemyId] <= quantity) {
        useGameStore.getState().addJournalEntry({
          text: `[TAGLIA] ${quest!.title}: ${counts[questId][enemyId]}/${quantity}`,
          type: JournalEntryType.SYSTEM_MESSAGE,
        });
      }
    }
    if (changed) {
      useCharacterStore.setState({ questKillCounts: counts });
      questService.checkQuestTriggers({ source: 'combat' });
    }
  },

  /**
   * Evaluates every active quest against the current state and the given
   * context, advancing/completing as many stages as are satisfied.
   */
  checkQuestTriggers: (ctx: QuestCheckContext = { source: 'story' }) => {
    const { quests } = useQuestDatabaseStore.getState();
    // A signal is consumed by the first stage it advances, so it can't
    // complete two consecutive stages that share the same trigger id.
    const consumedSignal = new Set<string>();

    for (let pass = 0; pass < 20; pass++) {
      let progressed = false;
      const { activeQuests } = useCharacterStore.getState();

      for (const questId of Object.keys(activeQuests)) {
        const quest = quests[questId];
        const current = activeQuests[questId];
        const stage = quest ? currentStageOf(quest, current) : undefined;
        if (!quest || !stage) continue;

        let met = false;
        if (SIGNAL_TRIGGERS.has(stage.trigger.type) || ctx.nodeId || ctx.eventId) {
          if (!consumedSignal.has(questId)) {
            // Signal for the current stage or a later one (catch-up).
            const target = quest.stages.find(s => s.stage >= current && SIGNAL_TRIGGERS.has(s.trigger.type) && signalMatches(s, ctx));
            if (target) {
              if (target.stage !== current) setStage(questId, target.stage);
              consumedSignal.add(questId);
              met = true;
            }
          }
        }
        if (!met && !SIGNAL_TRIGGERS.has(stage.trigger.type)) {
          met = isStateTriggerMet(stage, questId);
        }

        if (met) {
          const stageNow = useCharacterStore.getState().activeQuests[questId];
          if (stageNow >= quest.stages.length) {
            questService.completeQuest(questId);
          } else {
            questService.advanceQuest(questId);
          }
          progressed = true;
        }
      }
      if (!progressed) break;
    }
  },
};
