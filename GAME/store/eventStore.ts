import { create } from 'zustand';
import { GameEvent, EventResult, AttributeName, JournalEntryType, GameState, Enemy, DeathCause } from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useEventDatabaseStore } from '../data/eventDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useEnemyDatabaseStore } from '../data/enemyDatabase';
import { useCombatStore } from './combatStore';
import { useTimeStore } from './timeStore';
import { questService } from '../services/questService';

/**
 * @interface EventStoreState
 * @description Represents the state of the event store.
 * @property {GameEvent | null} activeEvent - The currently active event, or null if no event is active.
 * @property {string[]} eventHistory - A list of IDs of events that have already occurred.
 * @property {string | null} eventResolutionText - The text to display after an event has been resolved.
 * @property {(forceBiomeEvent?: boolean) => void} triggerEncounter - Function to trigger a new encounter.
 * @property {(choiceIndex: number) => void} resolveEventChoice - Function to resolve a choice made during an event.
 * @property {() => void} dismissEventResolution - Function to dismiss the event resolution text.
 * @property {() => void} reset - Function to reset the event store to its initial state.
 */
interface EventStoreState {
    activeEvent: GameEvent | null;
    eventHistory: string[];
    eventResolutionText: string | null;
    triggerEncounter: (forceBiomeEvent?: boolean) => void;
    resolveEventChoice: (choiceIndex: number) => void;
    dismissEventResolution: () => void;
    reset: () => void;
    toJSON: () => object;
    fromJSON: (json: any) => void;
}

const timeToMinutes = (time: any) => (time.day - 1) * 1440 + time.hour * 60 + time.minute;
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const initialState = {
    activeEvent: null,
    eventHistory: [],
    eventResolutionText: null,
};

export const useEventStore = create<EventStoreState>((set, get) => ({
    ...initialState,

    /**
     * @function triggerEncounter
     * @description Triggers a new encounter, which can be either a combat or a narrative event.
     * @param {boolean} [forceBiomeEvent=false] - Whether to force a biome-specific event.
     */
    triggerEncounter: (forceBiomeEvent = false) => {
        const { lastEncounterTime, currentBiome, lastLoreEventDay, addJournalEntry, setGameState } = useGameStore.getState();
        const { gameTime } = useTimeStore.getState();
        const { startCombat } = useCombatStore.getState();
        const { eventHistory } = get();
        const { loreEvents, biomeEvents, globalEncounters, easterEggEvents } = useEventDatabaseStore.getState();

        const biomeCharToName: Record<string, string> = { '.': 'Pianura', 'F': 'Foresta', 'V': 'Villaggio', 'C': 'Città', '~': 'Acqua' };
        const currentBiomeName = biomeCharToName[currentBiome] || 'Global';
        
        if (!forceBiomeEvent) {
            const cooldownMinutes = currentBiome === '.' ? 240 : 90;
            if (lastEncounterTime && (timeToMinutes(gameTime) - timeToMinutes(lastEncounterTime) < cooldownMinutes)) {
                return;
            }

            const EASTER_EGG_PROBABILITY = 0.07; // 7% chance (v1.2.0: increased from 2%)
            if (Math.random() < EASTER_EGG_PROBABILITY) {
                const possibleEasterEggs = (easterEggEvents as GameEvent[]).filter(event =>
                    event.biomes.includes(currentBiomeName) && !eventHistory.includes(event.id)
                );
                if (possibleEasterEggs.length > 0) {
                    const eventToTrigger = getRandom(possibleEasterEggs);
                    useGameStore.setState({ lastEncounterTime: gameTime });
                    set({ activeEvent: eventToTrigger, eventResolutionText: null });
                    setGameState(GameState.EVENT_SCREEN);
                    addJournalEntry({ text: `EVENTO: ${eventToTrigger.title}`, type: JournalEntryType.EVENT });
                    return;
                }
            }

            const ENCOUNTER_PROBABILITY = 0.20;
            if (Math.random() > ENCOUNTER_PROBABILITY) {
                return;
            }
        }

        useGameStore.setState({ lastEncounterTime: gameTime });

        // --- NEW LOGIC: Decide Combat vs. Narrative upfront ---
        const isCombatEncounter = !forceBiomeEvent && Math.random() < 0.35;

        if (isCombatEncounter) {
            // --- COMBAT ENCOUNTER ---
            if (currentBiome === 'R' || currentBiome === 'S') return;
            const enemyDb = useEnemyDatabaseStore.getState().enemyDatabase;
            const possibleEnemies = (Object.values(enemyDb) as Enemy[]).filter(enemy => enemy.biomes.includes("Global") || (currentBiomeName && enemy.biomes.includes(currentBiomeName)));
            if (possibleEnemies.length > 0) {
                startCombat(getRandom(possibleEnemies).id);
            }
        } else {
            // --- NARRATIVE EVENT ENCOUNTER ---
            // 1. Prioritize Lore Events if one is due for the day (and not a forced biome event)
            if (!forceBiomeEvent && gameTime.day > (lastLoreEventDay || 0)) {
                const possibleLoreEvents = (loreEvents as GameEvent[]).filter((event: GameEvent) => (event.biomes.includes(currentBiomeName) || event.biomes.includes("Global")) && !eventHistory.includes(event.id));
                if (possibleLoreEvents.length > 0) {
                    const eventToTrigger = getRandom(possibleLoreEvents);
                    useGameStore.setState({ lastLoreEventDay: gameTime.day });
                    set({ activeEvent: eventToTrigger, eventResolutionText: null });
                    setGameState(GameState.EVENT_SCREEN);
                    addJournalEntry({ text: `EVENTO: ${eventToTrigger.title}`, type: JournalEntryType.EVENT });
                    return; // Lore event triggered, stop here.
                }
            }
            
            // 2. If no Lore event, trigger a regular Biome/Global event
            const allPossibleEvents = forceBiomeEvent 
                ? (biomeEvents as GameEvent[]).filter((e: GameEvent) => e.biomes.includes(currentBiomeName))
                : [...(biomeEvents as GameEvent[]).filter((e: GameEvent) => e.biomes.includes(currentBiomeName)), ...(globalEncounters as GameEvent[])];
                
            const unseenUniqueEvents = allPossibleEvents.filter((e: GameEvent) => e.isUnique && !eventHistory.includes(e.id));
            const repeatableEvents = allPossibleEvents.filter((e: GameEvent) => !e.isUnique);
            let eventToTrigger: GameEvent | null = null;
            
            if (unseenUniqueEvents.length > 0) eventToTrigger = getRandom(unseenUniqueEvents);
            else if (repeatableEvents.length > 0) eventToTrigger = getRandom(repeatableEvents);

            if (eventToTrigger) {
                set({ activeEvent: eventToTrigger, eventResolutionText: null });
                setGameState(GameState.EVENT_SCREEN);
                addJournalEntry({ text: `EVENTO: ${eventToTrigger.title}`, type: JournalEntryType.EVENT });
            }
        }
    },

    /**
     * @function dismissEventResolution
     * @description Dismisses the event resolution text and returns to the game.
     */
    dismissEventResolution: () => {
        const activeEventId = get().activeEvent?.id;
        if (!activeEventId) {
            set({ activeEvent: null, eventResolutionText: null });
            useGameStore.getState().setGameState(GameState.IN_GAME);
            return;
        }
        
        // If this was a wandering trader encounter, force trader to move
        if (activeEventId === 'unique_wandering_trader_encounter') {
            import('../services/gameService').then(({ gameService }) => {
                gameService.updateWanderingTrader();
            });
        }
        
        // Check quest triggers after event completion (v1.8.0: completeEvent trigger)
        import('../services/questService').then(({ questService }) => {
            questService.checkQuestTriggers(undefined, undefined, activeEventId);
        });
        
        // Auto-start and auto-complete lore quests (v1.8.0)
        if (activeEventId === 'unique_ancient_library') {
            import('../services/questService').then(({ questService }) => {
                questService.startQuest('lore_quest_library');
                // Small delay to ensure quest is started before completing
                setTimeout(() => {
                    questService.completeQuest('lore_quest_library');
                    useCharacterStore.getState().addLoreEntry('lore_project_echo');
                }, 100);
            });
        }
        
        if (activeEventId === 'unique_scientist_notes') {
            import('../services/questService').then(({ questService }) => {
                questService.startQuest('lore_quest_laboratory');
                // Small delay to ensure quest is started before completing
                setTimeout(() => {
                    questService.completeQuest('lore_quest_laboratory');
                    useCharacterStore.getState().addLoreEntry('lore_project_rebirth');
                }, 100);
            });
        }
        
        set(state => ({
            eventHistory: state.activeEvent?.isUnique ? [...state.eventHistory, activeEventId] : state.eventHistory,
            activeEvent: null,
            eventResolutionText: null,
        }));
        useGameStore.getState().setGameState(GameState.IN_GAME);
    },

    /**
     * @function resolveEventChoice
     * @description Resolves a choice made during an event.
     * @param {number} choiceIndex - The index of the choice made.
     */
    resolveEventChoice: (choiceIndex: number) => {
        const { activeEvent } = get();
        const { addJournalEntry } = useGameStore.getState();
        const { advanceTime } = useTimeStore.getState();
        const { addItem, removeItem, addXp, takeDamage, performSkillCheck, changeAlignment, heal, addStatus, boostAttribute } = useCharacterStore.getState();
        const { itemDatabase } = useItemDatabaseStore.getState();
        if (!activeEvent) return;

        const choice = activeEvent.choices[choiceIndex];
        if (!choice) return;

        addJournalEntry({ text: `Hai scelto: "${choice.text}"`, type: JournalEntryType.NARRATIVE });
        let resolutionSummary: string[] = [];

        const applyResult = (result: EventResult): string | null => {
            let message: string | null = null;
            switch (result.type) {
                case 'addItem':
                    addItem(result.value.itemId, result.value.quantity);
                    const addedItem = itemDatabase[result.value.itemId];
                    if (!addedItem) {
                        console.warn(`[EVENT] Item ${result.value.itemId} not found in database`);
                    }
                    message = addedItem
                        ? `Hai ottenuto: ${addedItem.name} x${result.value.quantity}.`
                        : `Hai ottenuto un oggetto sconosciuto (${result.value.itemId}).`;
                    break;
                case 'removeItem':
                    removeItem(result.value.itemId, result.value.quantity);
                    const removedItem = itemDatabase[result.value.itemId];
                    if (!removedItem) {
                        console.warn(`[EVENT] Item ${result.value.itemId} not found in database`);
                    }
                    message = removedItem
                        ? `Hai perso: ${removedItem.name} x${result.value.quantity}.`
                        : `Hai perso un oggetto (${result.value.itemId}).`;
                    break;
                case 'addXp': addXp(result.value); message = `Hai guadagnato ${result.value} XP.`; break;
                case 'takeDamage': takeDamage(result.value, 'ENVIRONMENT'); message = `Subisci ${result.value} danni.`; break;
                case 'advanceTime': advanceTime(result.value, true); message = `Passano ${result.value} minuti.`; break;
                case 'journalEntry': if (result.text) message = result.text; break;
                case 'alignmentChange':
                    changeAlignment(result.value.type, result.value.amount);
                    message = null; // changeAlignment handles its own journal entries
                    break;
                case 'statusChange': addStatus(result.value); message = `Sei ora in stato: ${result.value}.`; break;
                case 'statBoost': {
                    const { stat, amount } = result.value as { stat: AttributeName; amount: number };
                    boostAttribute(stat, amount);
                    message = `La tua statistica ${stat.toUpperCase()} è aumentata permanentemente di ${amount}!`;
                    break;
                }
                case 'revealMapPOI': message = result.text || "Hai scoperto un nuovo punto di interesse sulla mappa!"; break;
                case 'heal': heal(result.value); message = `Recuperi ${result.value} HP.`; break;
                case 'special': {
                    // Handle special effects (v1.7.0: dialogue and trading, v1.8.0: world state, v1.8.2: flags, v1.9.8.1: learn effects)
                    if (result.value && typeof result.value === 'object') {
                        const { effect, dialogueId, traderId, location, flag } = result.value;
                        
                        if (effect === 'learn_disease_symptoms') {
                            // v1.9.8.1: Learn to recognize disease symptoms
                            message = "Studiando gli appunti del dottore, ora sei in grado di riconoscere i primi sintomi delle infezioni più comuni.";
                        } else if (effect === 'setFlag' && flag) {
                            // v1.8.2: Set game flag for quest tracking
                            useGameStore.setState(state => ({
                                gameFlags: new Set(state.gameFlags).add(flag)
                            }));
                            message = result.text || `Flag ${flag} impostato.`;
                            
                            // Check if this completes any quest triggers
                            import('../services/questService').then(({ questService }) => {
                                questService.checkQuestTriggers();
                            });
                        } else if (effect === 'startDialogue' && dialogueId) {
                            // Import dialogueService dynamically to avoid circular dependency
                            import('../services/dialogueService').then(({ dialogueService }) => {
                                dialogueService.startDialogue(dialogueId, GameState.EVENT_SCREEN);
                            });
                            message = result.text || "Inizi una conversazione...";
                        } else if (effect === 'startTrading' && traderId) {
                            // Import tradingService dynamically to avoid circular dependency
                            import('../services/tradingService').then(({ tradingService }) => {
                                tradingService.startTradingSession(traderId, GameState.EVENT_SCREEN);
                            });
                            message = result.text || "Inizi a commerciare...";
                        } else if (effect === 'activateWaterPump' && location) {
                            // v1.8.0: Activate water pump
                            useGameStore.getState().activateWaterPump(location);
                            message = result.text || "La pompa è ora funzionante!";
                        } else if (effect === 'destroyWaterPump' && location) {
                            // v1.8.0: Destroy water pump
                            useGameStore.getState().destroyWaterPump(location);
                            message = result.text || "La pompa è stata distrutta.";
                        } else if (effect === 'activateWaterPlant' && location) {
                            // v1.8.4: Activate water treatment plant
                            useGameStore.getState().activateWaterPlant(location);
                            message = result.text || "L'impianto di depurazione è attivo!";
                        } else if (effect === 'completeQuestFromEvent') {
                            // v1.8.0: Complete quest from event
                            const { questId } = result.value;
                            import('../services/questService').then(({ questService }) => {
                                questService.completeQuest(questId);
                            });
                            message = result.text || "Quest completata!";
                        } else if (effect === 'failQuestFromEvent') {
                            // v1.8.0: Fail quest from event
                            const { questId } = result.value;
                            const { activeQuests } = useCharacterStore.getState();
                            const newActiveQuests = { ...activeQuests };
                            delete newActiveQuests[questId];
                            useCharacterStore.setState({ activeQuests: newActiveQuests });
                            addJournalEntry({
                                text: `[MISSIONE FALLITA] La quest è stata abbandonata.`,
                                type: JournalEntryType.SYSTEM_WARNING,
                                color: '#ef4444'
                            });
                            message = result.text || "Quest fallita.";
                        } else if (effect === 'triggerCombat' || effect === 'start_combat') {
                            // v1.9.8: Trigger combat from event
                            const { enemyId } = result.value;
                            if (enemyId) {
                                import('./combatStore').then(({ useCombatStore }) => {
                                    useCombatStore.getState().startCombat(enemyId);
                                });
                                message = result.text || "Il combattimento inizia!";
                            }
                        } else if (effect === 'advance_quest_stage') {
                            // v1.9.8: Advance quest from event
                            const { questId } = result.value;
                            import('../services/questService').then(({ questService }) => {
                                questService.advanceQuest(questId);
                            });
                            message = result.text || "Quest avanzata!";
                        } else if (effect === 'complete_quest') {
                            // v1.9.8: Complete quest from event
                            const { questId } = result.value;
                            import('../services/questService').then(({ questService }) => {
                                questService.completeQuest(questId);
                            });
                            message = result.text || "Quest completata!";
                        } else {
                            message = result.text || `Si è verificato un evento speciale.`;
                        }
                    } else {
                        message = result.text || `Si è verificato un evento speciale.`;
                    }
                    break;
                }
                case 'startQuest':
                    questService.startQuest(result.value as string);
                    message = null; // Quest service handles journal entries
                    break;
            }
            if (result.type !== 'journalEntry' && message) addJournalEntry({ text: message, type: JournalEntryType.NARRATIVE });
            return message;
        };

        for (const outcome of choice.outcomes) {
            if (outcome.type === 'direct' && outcome.results) {
                outcome.results.forEach(result => {
                    const msg = applyResult(result);
                    if (msg) resolutionSummary.push(msg);
                });
            } else if (outcome.type === 'skillCheck' && outcome.skill && outcome.dc !== undefined) {
                const skillCheck = performSkillCheck(outcome.skill, outcome.dc);
                let checkText = `Prova di ${skillCheck.skill} (CD ${skillCheck.dc}): ${skillCheck.roll} (d20) + ${skillCheck.bonus} (mod) = ${skillCheck.total}. `;
                if (skillCheck.success) {
                    checkText += "SUCCESSO.";
                    addJournalEntry({ text: checkText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
                    if (outcome.successText) resolutionSummary.push(outcome.successText);
                    outcome.success?.forEach(result => { const msg = applyResult(result); if (msg) resolutionSummary.push(msg); });
                } else {
                    checkText += "FALLIMENTO.";
                    addJournalEntry({ text: checkText, type: JournalEntryType.SKILL_CHECK_FAILURE });
                    if (outcome.failureText) resolutionSummary.push(outcome.failureText);
                    outcome.failure?.forEach(result => { const msg = applyResult(result); if (msg) resolutionSummary.push(msg); });
                }
            }
        }
        set({ eventResolutionText: resolutionSummary.join('\\n') });
    },
    /**
     * @function reset
     * @description Resets the event store to its initial state.
     */
    reset: () => {
        set(initialState);
    },

    /**
     * @function toJSON
     * @description Serializes the store's state to a JSON object.
     * @returns {object} The serialized state.
     */
    toJSON: () => {
        return get();
    },

    /**
     * @function fromJSON
     * @description Deserializes the store's state from a JSON object.
     * @param {object} json - The JSON object to deserialize.
     */
    fromJSON: (json) => {
        set(json);
    }
}));