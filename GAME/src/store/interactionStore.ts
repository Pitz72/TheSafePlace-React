import { create } from 'zustand';
import { ActionMenuState, RefugeMenuState, CraftingMenuState, GameState, JournalEntryType } from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useTimeStore } from './timeStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useLootTableStore, rollLoot } from '../data/lootTableDatabase';
import { audioManager } from '../utils/audio';
import { isNightHour, minutesUntilDawn } from '../utils/time';
import { craftingService } from '../services/CraftingService';
import {
    ACTION, applyItemUse, describeItem, getItemActions, getRepairTargets, repairWith, studyItem,
} from '../services/itemUseService';

export const REFUGE_ACTION = {
    WAIT: "Aspetta un'ora",
    SLEEP: "Dormi fino all'alba",
    SEARCH: 'Cerca nei dintorni',
    WORKBENCH: 'Banco di Lavoro',
    INVENTORY: 'Gestisci Inventario',
    LEAVE: 'Esci dal Rifugio',
} as const;

interface InteractionStoreState {
    isInventoryOpen: boolean;
    isInRefuge: boolean;
    isCraftingOpen: boolean;
    inventorySelectedIndex: number;
    actionMenuState: ActionMenuState;
    refugeMenuState: RefugeMenuState;
    craftingMenuState: CraftingMenuState;
    refugeActionMessage: string | null;
    /** The refuge being visited was already searched. */
    refugeSearched: boolean;

    toggleInventory: () => void;
    setInventorySelectedIndex: (updater: (prev: number) => number) => void;
    openActionMenu: () => void;
    closeActionMenu: () => void;
    navigateActionMenu: (direction: number) => void;
    confirmActionMenuSelection: () => void;

    enterRefuge: () => void;
    enterOutpost: () => void;
    leaveRefuge: () => void;
    navigateRefugeMenu: (direction: number) => void;
    confirmRefugeMenuSelection: () => void;
    searchRefuge: () => void;
    clearRefugeActionMessage: () => void;

    toggleCrafting: () => void;
    navigateCraftingMenu: (direction: number) => void;
    performCrafting: () => void;

    reset: () => void;
    toJSON: () => object;
    fromJSON: (json: any) => void;
}

const closedActionMenu = (): ActionMenuState => ({ isOpen: false, options: [], selectedIndex: 0, mode: 'actions' });
const closedRefugeMenu = (): RefugeMenuState => ({ isOpen: false, options: [], selectedIndex: 0 });

const initialState = () => ({
    isInventoryOpen: false,
    isInRefuge: false,
    isCraftingOpen: false,
    inventorySelectedIndex: 0,
    actionMenuState: closedActionMenu(),
    refugeMenuState: closedRefugeMenu(),
    craftingMenuState: { selectedIndex: 0 },
    refugeActionMessage: null,
    refugeSearched: false,
});

const journal = (text: string, type: JournalEntryType = JournalEntryType.NARRATIVE) =>
    useGameStore.getState().addJournalEntry({ text, type });

const refugeOptions = (searched: boolean): string[] => {
    const night = isNightHour(useTimeStore.getState().gameTime.hour);
    return [
        night ? REFUGE_ACTION.SLEEP : REFUGE_ACTION.WAIT,
        ...(searched ? [] : [REFUGE_ACTION.SEARCH]),
        REFUGE_ACTION.WORKBENCH,
        REFUGE_ACTION.INVENTORY,
        REFUGE_ACTION.LEAVE,
    ];
};

const knownRecipeList = () => {
    const { knownRecipes } = useCharacterStore.getState();
    return useRecipeDatabaseStore.getState().recipes.filter(r => knownRecipes.includes(r.id));
};

export const useInteractionStore = create<InteractionStoreState>((set, get) => ({
    ...initialState(),

    toggleInventory: () => {
        const state = get();
        if (state.actionMenuState.isOpen) {
            set({ actionMenuState: closedActionMenu() });
            return;
        }
        if (state.isCraftingOpen) return;
        const isOpen = !state.isInventoryOpen;
        audioManager.playSound(isOpen ? 'confirm' : 'cancel');
        set({ isInventoryOpen: isOpen, inventorySelectedIndex: 0 });
    },

    setInventorySelectedIndex: (updater) => {
        const { length } = useCharacterStore.getState().inventory;
        if (length === 0) {
            set({ inventorySelectedIndex: 0 });
            return;
        }
        set(state => {
            const next = updater(state.inventorySelectedIndex);
            return { inventorySelectedIndex: ((next % length) + length) % length };
        });
        audioManager.playSound('navigate');
    },

    openActionMenu: () => {
        const index = get().inventorySelectedIndex;
        if (!useCharacterStore.getState().inventory[index]) return;
        set({ actionMenuState: { isOpen: true, options: getItemActions(index), selectedIndex: 0, mode: 'actions' } });
        audioManager.playSound('confirm');
    },

    closeActionMenu: () => {
        set({ actionMenuState: closedActionMenu() });
        audioManager.playSound('cancel');
    },

    navigateActionMenu: (direction) => {
        set(state => {
            const { options, selectedIndex } = state.actionMenuState;
            if (options.length === 0) return {};
            const next = (selectedIndex + direction + options.length) % options.length;
            return { actionMenuState: { ...state.actionMenuState, selectedIndex: next } };
        });
        audioManager.playSound('navigate');
    },

    confirmActionMenuSelection: () => {
        const { actionMenuState, inventorySelectedIndex: index } = get();
        const character = useCharacterStore.getState();
        const invItem = character.inventory[index];
        const details = invItem ? useItemDatabaseStore.getState().itemDatabase[invItem.itemId] : undefined;
        const choice = actionMenuState.options[actionMenuState.selectedIndex];
        if (!invItem || !details || choice === undefined) {
            set({ actionMenuState: closedActionMenu() });
            return;
        }
        audioManager.playSound('confirm');

        // Second step of "Ripara un oggetto": the player picked the target.
        if (actionMenuState.mode === 'repair') {
            const target = actionMenuState.targetIndices?.[actionMenuState.selectedIndex];
            if (target !== undefined) repairWith(index, target);
            set({ actionMenuState: closedActionMenu() });
        } else {
            switch (choice) {
                case ACTION.USE:
                    applyItemUse(index);
                    break;
                case ACTION.REPAIR: {
                    const targets = getRepairTargets(index);
                    if (targets.length === 0) {
                        journal('Non hai nulla da riparare.', JournalEntryType.ACTION_FAILURE);
                        break;
                    }
                    const db = useItemDatabaseStore.getState().itemDatabase;
                    const options = targets.map(t => {
                        const item = character.inventory[t];
                        return `${db[item.itemId]?.name ?? item.itemId} (${item.durability!.current}/${item.durability!.max})`;
                    });
                    set({ actionMenuState: { isOpen: true, options: [...options, ACTION.CANCEL], selectedIndex: 0, mode: 'repair', targetIndices: targets } });
                    return;
                }
                case ACTION.READ:
                case ACTION.STUDY:
                    studyItem(index);
                    break;
                case ACTION.EQUIP:
                    character.equipItem(index);
                    if (useCharacterStore.getState().getEquippedSlot(index)) journal(`Hai equipaggiato: ${details.name}.`);
                    break;
                case ACTION.UNEQUIP: {
                    const slot = character.getEquippedSlot(index);
                    if (slot) {
                        character.unequipItem(slot);
                        journal(`Hai tolto: ${details.name}.`);
                    }
                    break;
                }
                case ACTION.SALVAGE:
                    character.salvageItem(index);
                    break;
                case ACTION.EXAMINE:
                    journal(describeItem(index));
                    break;
                case ACTION.DISCARD:
                    character.discardItem(index, 1);
                    journal(`Hai scartato: ${details.name}.`);
                    break;
            }
            set({ actionMenuState: closedActionMenu() });
        }

        // Keep the cursor on a valid slot after items disappear.
        const { length } = useCharacterStore.getState().inventory;
        if (get().inventorySelectedIndex >= length) set({ inventorySelectedIndex: Math.max(0, length - 1) });
        // Something took over the screen (an ambush while camping): close the bag.
        if (useGameStore.getState().gameState !== GameState.IN_GAME) set({ isInventoryOpen: false });
    },

    clearRefugeActionMessage: () => set({ refugeActionMessage: null }),

    enterRefuge: () => {
        set({
            isInRefuge: true,
            refugeSearched: false,
            refugeActionMessage: null,
            refugeMenuState: { isOpen: true, options: refugeOptions(false), selectedIndex: 0 },
        });
        audioManager.playSound('enter_refuge');
        journal('Sei entrato in un rifugio. Sei al sicuro.');
        // Chapters waiting for the player to walk into a refuge.
        useGameStore.getState().checkMainStoryTriggers({ refugeEntry: true });
    },

    enterOutpost: () => {
        useGameStore.getState().setGameState(GameState.OUTPOST);
        audioManager.playSound('enter_refuge');
        journal('Sei arrivato al Crocevia. Un insediamento di fortuna, ma il primo segno di civiltà da settimane.');
    },

    /** Leaving uses the refuge up: it stays on the map as ruins. */
    leaveRefuge: () => {
        useGameStore.setState(game => {
            const gameFlags = new Set(game.gameFlags);
            gameFlags.delete('LULLABY_CHOICE_OFFERED_THIS_REST');
            const known = game.visitedRefuges.some(p => p.x === game.playerPos.x && p.y === game.playerPos.y);
            return {
                gameFlags,
                visitedRefuges: known ? game.visitedRefuges : [...game.visitedRefuges, { ...game.playerPos }],
            };
        });
        set({ isInRefuge: false, isCraftingOpen: false, isInventoryOpen: false, refugeMenuState: closedRefugeMenu(), refugeActionMessage: null, refugeSearched: false });
        journal('Lasci la sicurezza del rifugio. Alle tue spalle restano solo rovine.');
        audioManager.playSound('cancel');
    },

    navigateRefugeMenu: (direction) => {
        set(state => {
            if (!state.isInRefuge) return {};
            const { options, selectedIndex } = state.refugeMenuState;
            const next = (selectedIndex + direction + options.length) % options.length;
            return { refugeMenuState: { ...state.refugeMenuState, selectedIndex: next }, refugeActionMessage: null };
        });
        audioManager.playSound('navigate');
    },

    searchRefuge: () => {
        useTimeStore.getState().advanceTime(30, true);
        const character = useCharacterStore.getState();
        const check = character.performSkillCheck('percezione', 10);
        let text = `Prova di Percezione (CD ${check.dc}): ${check.roll} (d20) + ${check.bonus} (mod) = ${check.total}. `;
        if (check.success) {
            const loot = rollLoot(useLootTableStore.getState().tables.refugeSearch);
            const details = loot ? useItemDatabaseStore.getState().itemDatabase[loot.itemId] : undefined;
            if (loot && details) {
                const bonus = character.hasTalent('scavenger') && details.stackable ? 1 : 0;
                character.addItem(loot.itemId, loot.quantity + bonus);
                text += `SUCCESSO. Frugando sotto un'asse del pavimento, trovi: ${details.name} (x${loot.quantity + bonus}).${bonus ? ' [Scavenger]' : ''}`;
                journal(text, JournalEntryType.SKILL_CHECK_SUCCESS);
            } else {
                text += 'SUCCESSO, ma non trovi nulla di valore.';
                journal(text, JournalEntryType.ACTION_FAILURE);
            }
        } else {
            text += 'FALLIMENTO. Hai cercato ovunque, ma non trovi nulla di utile.';
            journal(text, JournalEntryType.SKILL_CHECK_FAILURE);
        }
        set({ refugeActionMessage: text, refugeSearched: true });
    },

    confirmRefugeMenuSelection: () => {
        const { refugeMenuState } = get();
        const game = useGameStore.getState();
        const { gameTime, advanceTime } = useTimeStore.getState();
        const choice = refugeMenuState.options[refugeMenuState.selectedIndex];
        set({ refugeActionMessage: null });

        if (choice === REFUGE_ACTION.WAIT || choice === REFUGE_ACTION.SLEEP) {
            // The blackened music box calls once, on a night in a refuge from day 3 on.
            if (gameTime.day >= 3 && isNightHour(gameTime.hour) && !game.hasFlag('ASH_LULLABY_PLAYED') && !game.hasFlag('LULLABY_CHOICE_OFFERED_THIS_REST')) {
                game.setFlag('LULLABY_CHOICE_OFFERED_THIS_REST');
                game.setGameState(GameState.ASH_LULLABY_CHOICE);
                audioManager.playSound('confirm');
                return;
            }
        }
        audioManager.playSound('confirm');

        switch (choice) {
            case REFUGE_ACTION.WAIT: {
                journal("Decidi di riposare per un'ora.");
                advanceTime(60, true);
                const character = useCharacterStore.getState();
                const healAmount = character.fatigue.current > 75 ? 2 : 5;
                character.heal(healAmount);
                character.rest(15);
                set({ refugeActionMessage: `Hai recuperato ${healAmount} HP e ti senti meno stanco.` });
                break;
            }
            case REFUGE_ACTION.SLEEP: {
                const minutes = minutesUntilDawn(gameTime);
                const before = useCharacterStore.getState();
                const { satietyCost, hydrationCost } = before.calculateSurvivalCost(minutes);
                const fed = before.satiety.current >= satietyCost && before.hydration.current >= hydrationCost;
                journal(fed ? 'Ti addormenti profondamente...' : 'Ti addormenti nonostante la fame e la sete...');
                advanceTime(minutes, true);
                const character = useCharacterStore.getState();
                if (character.hp.current <= 0) return;
                if (fed) {
                    character.heal(character.hp.max);
                    character.rest(50);
                    set({ refugeActionMessage: "Ti svegli all'alba, rinvigorito." });
                } else {
                    character.heal(Math.floor(character.hp.max * 0.3));
                    character.rest(25);
                    character.addStatus('MALATO');
                    journal('Il sonno è stato inquieto. La mancanza di cibo e acqua ti ha lasciato debole e MALATO.', JournalEntryType.SYSTEM_WARNING);
                    set({ refugeActionMessage: "Ti svegli all'alba, ma sei debole e malato." });
                }
                break;
            }
            case REFUGE_ACTION.SEARCH:
                get().searchRefuge();
                break;
            case REFUGE_ACTION.WORKBENCH:
                get().toggleCrafting();
                break;
            case REFUGE_ACTION.INVENTORY:
                get().toggleInventory();
                break;
            case REFUGE_ACTION.LEAVE:
                get().leaveRefuge();
                return;
        }

        if (get().isInRefuge) {
            set(state => ({ refugeMenuState: { isOpen: true, options: refugeOptions(state.refugeSearched), selectedIndex: 0 } }));
        }
    },

    toggleCrafting: () => {
        const state = get();
        if (state.isInventoryOpen) return;
        const isOpening = !state.isCraftingOpen;
        audioManager.playSound(isOpening ? 'confirm' : 'cancel');
        set({ isCraftingOpen: isOpening, craftingMenuState: { selectedIndex: 0 } });
    },

    navigateCraftingMenu: (direction) => {
        const count = knownRecipeList().length;
        if (count === 0) return;
        set(state => ({ craftingMenuState: { selectedIndex: (state.craftingMenuState.selectedIndex + direction + count) % count } }));
        audioManager.playSound('navigate');
    },

    performCrafting: () => {
        const recipe = knownRecipeList()[get().craftingMenuState.selectedIndex];
        if (recipe) craftingService.craft(recipe.id);
    },

    reset: () => set(initialState()),

    toJSON: () => ({ isInRefuge: get().isInRefuge, refugeSearched: get().refugeSearched }),

    /** A game saved inside a refuge reopens it. */
    fromJSON: (json) => {
        const isInRefuge = Boolean(json?.isInRefuge);
        const refugeSearched = Boolean(json?.refugeSearched ?? json?.refugeJustSearched);
        set({
            ...initialState(),
            isInRefuge,
            refugeSearched,
            refugeMenuState: isInRefuge ? { isOpen: true, options: refugeOptions(refugeSearched), selectedIndex: 0 } : closedRefugeMenu(),
        });
    },
}));
