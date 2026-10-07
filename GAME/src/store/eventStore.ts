import { create } from 'zustand';
import {
  GameEvent, EventChoice, EventResult, AttributeName, JournalEntryType, GameState, Enemy,
  PlayerStatusCondition, Position,
} from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useEventDatabaseStore } from '../data/eventDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useEnemyDatabaseStore } from '../data/enemyDatabase';
import { useCombatStore } from './combatStore';
import { useTimeStore } from './timeStore';
import { questService } from '../services/questService';
import { narrativeService } from '../services/NarrativeService';
import { tradingService } from '../services/tradingService';
import { BIOME_NAMES, SKILL_LABELS } from '../constants';
import { toAbsoluteMinutes } from '../utils/time';

const VALID_STATUSES: ReadonlySet<string> = new Set([
  'FERITO', 'MALATO', 'AVVELENATO', 'IPOTERMIA', 'ESAUSTO', 'AFFAMATO', 'DISIDRATATO', 'INFEZIONE',
]);
const ECHO_ITEMS = ['pixeldebh_plate', 'eurocenter_business_card'];
const WOLF_IDS = new Set(['mutated_wolf', 'alpha_wolf_pack_leader']);

/** Freed wolves leave the player alone, unless the player is hunting them for Silas. */
const wolvesSpare = (enemyId: string) =>
  WOLF_IDS.has(enemyId) && useGameStore.getState().hasFlag('WOLF_FRIEND') &&
  !useCharacterStore.getState().activeQuests['bounty_kill_wolves'];

interface EventStoreState {
  activeEvent: GameEvent | null;
  eventHistory: string[];
  eventResolutionText: string | null;
  /** Combat started by the resolved event, begins when the player dismisses it. */
  pendingCombatEnemyId: string | null;
  triggerEncounter: (forceBiomeEvent?: boolean) => void;
  openEvent: (eventId: string) => boolean;
  isChoiceVisible: (choice: EventChoice) => boolean;
  resolveEventChoice: (choiceIndex: number) => void;
  dismissEventResolution: () => void;
  reset: () => void;
  toJSON: () => object;
  fromJSON: (json: any) => void;
}

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const asList = (value: string | string[] | undefined): string[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

const questKnown = (questId: string) => {
  const { activeQuests, completedQuests, failedQuests } = useCharacterStore.getState();
  return Boolean(activeQuests[questId]) || completedQuests.includes(questId) || failedQuests.includes(questId);
};

/** Event-level gating for random encounters. */
const isEventEligible = (event: GameEvent, history: string[]) => {
  if (event.questOnly) return false;
  if (event.isUnique && history.includes(event.id)) return false;
  const { activeQuests } = useCharacterStore.getState();
  const { gameFlags } = useGameStore.getState();
  if (event.requiresQuest && !activeQuests[event.requiresQuest]) return false;
  if (event.excludesQuest && questKnown(event.excludesQuest)) return false;
  if (event.requiresFlag && !gameFlags.has(event.requiresFlag)) return false;
  if (event.excludesFlag && gameFlags.has(event.excludesFlag)) return false;
  return true;
};

const showEvent = (event: GameEvent) => {
  useEventStore.setState({ activeEvent: event, eventResolutionText: null, pendingCombatEnemyId: null });
  useGameStore.getState().setGameState(GameState.EVENT_SCREEN);
  useGameStore.getState().addJournalEntry({ text: `EVENTO: ${event.title}`, type: JournalEntryType.EVENT });
};

/** Random enemies scale with the player: no bears for a level 1 wanderer. */
const pickEnemy = (biomeName: string): Enemy | null => {
  const enemies = (Object.values(useEnemyDatabaseStore.getState().enemyDatabase) as Enemy[])
    .filter(e => e.randomEncounter !== false && (e.biomes.includes('Global') || e.biomes.includes(biomeName)));
  if (enemies.length === 0) return null;
  const level = useCharacterStore.getState().level;
  const maxXp = 70 + level * 30;
  const fitting = enemies.filter(e => e.xp <= maxXp);
  if (fitting.length > 0) return getRandom(fitting);
  return enemies.reduce((weakest, e) => (e.xp < weakest.xp ? e : weakest));
};

/**
 * Enemy that attacks the player where they stand, or null when nothing comes
 * (dissuader active, friendly wolves, no enemy for the biome).
 */
export const pickAmbushEnemy = (): string | null => {
  const game = useGameStore.getState();
  if (game.repelUntil > toAbsoluteMinutes(useTimeStore.getState().gameTime)) return null;
  const enemy = pickEnemy(BIOME_NAMES[game.currentBiome] || 'Global');
  if (!enemy) return null;
  if (wolvesSpare(enemy.id)) return null;
  return enemy.id;
};

export const useEventStore = create<EventStoreState>((set, get) => ({
  activeEvent: null,
  eventHistory: [],
  eventResolutionText: null,
  pendingCombatEnemyId: null,

  triggerEncounter: (forceBiomeEvent = false) => {
    const game = useGameStore.getState();
    const { gameTime } = useTimeStore.getState();
    const { eventHistory } = get();
    const { loreEvents, biomeEvents, globalEncounters, easterEggEvents } = useEventDatabaseStore.getState();
    const { currentBiome, lastEncounterTime, lastLoreEventDay } = game;
    const biomeName = BIOME_NAMES[currentBiome] || 'Global';
    const now = toAbsoluteMinutes(gameTime);

    if (!forceBiomeEvent) {
      const cooldown = currentBiome === '.' ? 240 : 90;
      if (lastEncounterTime && now - toAbsoluteMinutes(lastEncounterTime) < cooldown) return;

      // Easter eggs are rare; much less so while Anya is collecting echoes.
      const hunting = Boolean(useCharacterStore.getState().activeQuests['collect_world_echoes']);
      const eggs = easterEggEvents.filter(e => e.biomes.includes(biomeName) && isEventEligible(e, eventHistory));
      const echoEggs = eggs.filter(e => ECHO_ITEMS.some(id => JSON.stringify(e.choices).includes(`"${id}"`)));
      const eggChance = hunting && echoEggs.length > 0 ? 0.25 : 0.07;
      if (eggs.length > 0 && Math.random() < eggChance) {
        useGameStore.setState({ lastEncounterTime: gameTime });
        showEvent(getRandom(hunting && echoEggs.length > 0 ? echoEggs : eggs));
        return;
      }
      if (Math.random() > 0.20) return;
    }

    useGameStore.setState({ lastEncounterTime: gameTime });

    // --- Combat ---
    if (!forceBiomeEvent && Math.random() < 0.35) {
      if (currentBiome === 'R' || currentBiome === 'S') return;
      if (game.repelUntil > now) {
        game.addJournalEntry({ text: "Qualcosa si muove tra le ombre, ma il ronzio del dissuasore lo tiene lontano.", type: JournalEntryType.NARRATIVE });
        return;
      }
      const enemy = pickEnemy(biomeName);
      if (!enemy) return;
      if (wolvesSpare(enemy.id)) {
        game.addJournalEntry({ text: "Un lupo ti osserva dal limitare degli alberi. Ti riconosce, e se ne va senza attaccare.", type: JournalEntryType.NARRATIVE });
        return;
      }
      useCombatStore.getState().startCombat(enemy.id);
      return;
    }

    // --- Narrative events: one lore event per day first ---
    if (!forceBiomeEvent && gameTime.day > (lastLoreEventDay || 0)) {
      const lore = loreEvents.filter(e => (e.biomes.includes(biomeName) || e.biomes.includes('Global')) && isEventEligible(e, eventHistory));
      if (lore.length > 0) {
        useGameStore.setState({ lastLoreEventDay: gameTime.day });
        showEvent(getRandom(lore));
        return;
      }
    }

    const candidates = (forceBiomeEvent
      ? biomeEvents.filter(e => e.biomes.includes(biomeName))
      : [...biomeEvents.filter(e => e.biomes.includes(biomeName)), ...globalEncounters]
    ).filter(e => isEventEligible(e, eventHistory));

    const unseenUnique = candidates.filter(e => e.isUnique);
    const repeatable = candidates.filter(e => !e.isUnique);
    const event = unseenUnique.length > 0 ? getRandom(unseenUnique) : repeatable.length > 0 ? getRandom(repeatable) : null;
    if (event) showEvent(event);
  },

  openEvent: (eventId) => {
    const event = useEventDatabaseStore.getState().getEvent(eventId);
    if (!event) {
      console.error(`[EVENT] Event ${eventId} not found`);
      return false;
    }
    showEvent(event);
    return true;
  },

  isChoiceVisible: (choice) => {
    const { activeQuests } = useCharacterStore.getState();
    const { gameFlags } = useGameStore.getState();
    if (choice.requiresQuest && !activeQuests[choice.requiresQuest]) return false;
    if (choice.hideIfQuestKnown && questKnown(choice.hideIfQuestKnown)) return false;
    if (!asList(choice.requiresFlag).every(flag => gameFlags.has(flag))) return false;
    if (asList(choice.hideIfFlag).some(flag => gameFlags.has(flag))) return false;
    return true;
  },

  dismissEventResolution: () => {
    const { activeEvent, pendingCombatEnemyId } = get();
    set(state => ({
      eventHistory: activeEvent?.isUnique && !state.eventHistory.includes(activeEvent.id)
        ? [...state.eventHistory, activeEvent.id]
        : state.eventHistory,
      activeEvent: null,
      eventResolutionText: null,
      pendingCombatEnemyId: null,
    }));

    if (activeEvent) {
      questService.checkQuestTriggers({ source: 'event', eventId: activeEvent.id });
      const { easterEggEvents } = useEventDatabaseStore.getState();
      const history = get().eventHistory;
      if (easterEggEvents.length > 0 && easterEggEvents.every(e => history.includes(e.id))) {
        useCharacterStore.getState().unlockTrophy('trophy_secret_all_easter_eggs');
      }
    }

    if (pendingCombatEnemyId && useGameStore.getState().gameState !== GameState.GAME_OVER) {
      useCombatStore.getState().startCombat(pendingCombatEnemyId);
      return;
    }
    if (useGameStore.getState().gameState === GameState.EVENT_SCREEN) {
      useGameStore.getState().setGameState(GameState.IN_GAME);
    }
  },

  resolveEventChoice: (choiceIndex: number) => {
    const { activeEvent } = get();
    if (!activeEvent) return;
    const choice = activeEvent.choices[choiceIndex];
    if (!choice || !get().isChoiceVisible(choice)) return;

    const game = useGameStore.getState();
    const { addJournalEntry } = game;
    const character = useCharacterStore.getState();
    const { itemDatabase } = useItemDatabaseStore.getState();
    const playerPos: Position = { ...game.playerPos };

    addJournalEntry({ text: `Hai scelto: "${choice.text}"`, type: JournalEntryType.NARRATIVE });
    // Lines shown on the resolution screen; each one is also written to the
    // journal with the given type (null = screen only).
    const summary: string[] = [];
    const say = (text: string | null | undefined, type: JournalEntryType | null = JournalEntryType.NARRATIVE) => {
      if (!text) return;
      summary.push(text);
      if (type !== null) addJournalEntry({ text, type });
    };

    const itemRef = (r: EventResult): { itemId: string; quantity: number } => {
      if (typeof r.value === 'string') return { itemId: r.value, quantity: r.quantity ?? 1 };
      return { itemId: r.value?.itemId, quantity: r.value?.quantity ?? 1 };
    };

    const applySpecial = (value: any, text?: string) => {
      const effect = value?.effect;
      switch (effect) {
        case 'startDialogue':
          say(text ?? 'Inizi una conversazione...');
          narrativeService.startDialogue(value.dialogueId, GameState.EVENT_SCREEN);
          break;
        case 'startTrading':
          say(text ?? 'Inizi a commerciare...');
          tradingService.startTradingSession(value.traderId, GameState.EVENT_SCREEN);
          break;
        case 'startCombat':
          say(text ?? 'Il combattimento è inevitabile!');
          set({ pendingCombatEnemyId: value.enemyId });
          break;
        case 'startCutscene':
          say(text);
          game.queueCutscene(value.cutsceneId);
          break;
        case 'setFlag':
          game.setFlag(value.flag);
          say(text);
          questService.checkQuestTriggers({ source: 'flag' });
          break;
        case 'completeQuest':
          questService.completeQuest(value.questId);
          say(text);
          break;
        case 'failQuest':
          questService.failQuest(value.questId);
          say(text);
          break;
        case 'advanceQuest':
          questService.advanceQuest(value.questId, value.fromStage);
          say(text);
          break;
        case 'activateWaterPump':
          game.activateWaterPump(value.location ?? playerPos);
          say(text);
          break;
        case 'destroyWaterPump':
          game.destroyWaterPump(value.location ?? playerPos);
          say(text);
          break;
        case 'activateWaterPlant':
          game.activateWaterPlant(value.location ?? playerPos);
          say(text);
          break;
        case 'revealPOI':
          game.revealPOI(value.poiId);
          say(text);
          break;
        case 'registerPOI':
          game.addPOI({ id: value.poiId, name: value.name, x: playerPos.x, y: playerPos.y, eventId: value.eventId, revealed: true });
          say(text);
          break;
        default:
          console.warn(`[EVENT] Unknown special effect in ${activeEvent.id}:`, value);
          say(text);
      }
    };

    const applyResult = (result: EventResult) => {
      switch (result.type) {
        case 'addItem': {
          const { itemId, quantity } = itemRef(result);
          character.addItem(itemId, quantity);
          say(result.text);
          say(`Hai ottenuto: ${itemDatabase[itemId]?.name ?? itemId} x${quantity}.`, JournalEntryType.ITEM_ACQUIRED);
          break;
        }
        case 'removeItem': {
          const { itemId, quantity } = itemRef(result);
          const owned = useCharacterStore.getState().getItemCount(itemId);
          if (owned <= 0) break;
          character.removeItem(itemId, quantity);
          say(result.text);
          say(`Hai perso: ${itemDatabase[itemId]?.name ?? itemId} x${Math.min(quantity, owned)}.`);
          break;
        }
        case 'addXp':
          character.addXp(result.value);
          say(`Hai guadagnato ${result.value} XP.`, JournalEntryType.XP_GAIN);
          break;
        case 'takeDamage':
          character.takeDamage(result.value, 'ENVIRONMENT');
          say(`Subisci ${result.value} danni.`, JournalEntryType.COMBAT);
          break;
        case 'heal':
          character.heal(result.value);
          say(`Recuperi ${result.value} HP.`);
          break;
        case 'hydration':
          character.restoreHydration(result.value);
          say(`Idratazione ${result.value >= 0 ? '+' : ''}${result.value}.`);
          break;
        case 'satiety':
          character.restoreSatiety(result.value);
          say(`Sazietà ${result.value >= 0 ? '+' : ''}${result.value}.`);
          break;
        case 'advanceTime':
          useTimeStore.getState().advanceTime(result.value, true);
          say(`Passano ${result.value} minuti.`);
          break;
        case 'journalEntry':
          say(result.text ?? result.value?.text);
          break;
        case 'alignmentChange':
          character.changeAlignment(result.value.type, result.value.amount);
          say(result.text);
          break;
        case 'statusChange':
          if (VALID_STATUSES.has(result.value)) {
            character.addStatus(result.value as PlayerStatusCondition);
            say(`Sei ora in stato: ${result.value}.`);
          }
          break;
        case 'removeStatus':
          if (useCharacterStore.getState().status.has(result.value)) {
            character.removeStatus(result.value as PlayerStatusCondition);
            say(`Lo stato ${result.value} è svanito.`);
          }
          break;
        case 'statBoost': {
          const { stat, amount } = result.value as { stat: AttributeName; amount: number };
          character.boostAttribute(stat, amount);
          say(`Il tuo attributo ${stat.toUpperCase()} aumenta permanentemente di ${amount}!`);
          break;
        }
        case 'revealMapPOI': {
          const { x, y, name } = result.value;
          game.addPOI({ id: `poi_${x}_${y}`, name, x, y, revealed: true });
          say(result.text ?? `Hai segnato sulla mappa: ${name}.`);
          break;
        }
        case 'startQuest':
          questService.startQuest(result.value);
          break;
        case 'setFlag':
          game.setFlag(result.value);
          say(result.text);
          questService.checkQuestTriggers({ source: 'flag' });
          break;
        case 'unlockTrophy':
          character.unlockTrophy(result.value);
          break;
        case 'learnRecipe':
          character.learnRecipe(result.value);
          say(result.text);
          break;
        case 'addLore':
          character.addLoreEntry(result.value);
          say(result.text);
          break;
        case 'questTrigger':
          questService.checkQuestTriggers({ source: 'event', nodeId: result.value });
          say(result.text);
          break;
        case 'special':
          applySpecial(result.value, result.text);
          break;
      }
    };

    for (const outcome of choice.outcomes) {
      if (outcome.type === 'direct') {
        outcome.results?.forEach(applyResult);
      } else if (outcome.type === 'special') {
        applySpecial(outcome.value, outcome.text);
        outcome.results?.forEach(applyResult);
      } else if (outcome.type === 'skillCheck' && outcome.skill && outcome.dc !== undefined) {
        const check = useCharacterStore.getState().performSkillCheck(outcome.skill, outcome.dc);
        const line = `Prova di ${SKILL_LABELS[check.skill] ?? check.skill} (CD ${check.dc}): ${check.roll} (d20) + ${check.bonus} (mod) = ${check.total}. ${check.success ? 'SUCCESSO.' : 'FALLIMENTO.'}`;
        say(line, check.success ? JournalEntryType.SKILL_CHECK_SUCCESS : JournalEntryType.SKILL_CHECK_FAILURE);
        if (check.success) {
          say(outcome.successText);
          outcome.success?.forEach(applyResult);
        } else {
          say(outcome.failureText);
          outcome.failure?.forEach(applyResult);
        }
      }
    }

    // Never leave the resolution empty: an empty text would hide the resolution screen.
    if (summary.length === 0) summary.push('Prosegui per la tua strada.');
    // Death during the event: the game over screen takes over.
    if (useGameStore.getState().gameState === GameState.GAME_OVER) return;
    set({ eventResolutionText: summary.join('\n') });
  },

  reset: () => set({ activeEvent: null, eventHistory: [], eventResolutionText: null, pendingCombatEnemyId: null }),

  toJSON: () => ({ eventHistory: get().eventHistory }),

  fromJSON: (json) => {
    set({
      activeEvent: null,
      eventResolutionText: null,
      pendingCombatEnemyId: null,
      eventHistory: Array.isArray(json?.eventHistory) ? json.eventHistory : [],
    });
  },
}));
