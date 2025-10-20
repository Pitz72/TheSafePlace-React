import { create } from 'zustand';
import { ActionMenuState, RefugeMenuState, CraftingMenuState, GameState, JournalEntryType, PlayerStatusCondition, IItem } from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { audioManager } from '../utils/audio';
import { useMainQuestDatabaseStore } from '../data/mainQuestDatabase';
import { useTimeStore } from './timeStore';

/**
 * @interface InteractionStoreState
 * @description Represents the state of the interaction store.
 * @property {boolean} isInventoryOpen - Whether the inventory is open.
 * @property {boolean} isInRefuge - Whether the player is in a refuge.
 * @property {boolean} isCraftingOpen - Whether the crafting menu is open.
 * @property {number} inventorySelectedIndex - The index of the selected item in the inventory.
 * @property {ActionMenuState} actionMenuState - The state of the action menu.
 * @property {RefugeMenuState} refugeMenuState - The state of the refuge menu.
 * @property {CraftingMenuState} craftingMenuState - The state of the crafting menu.
 * @property {string | null} refugeActionMessage - A message to display after a refuge action.
 * @property {boolean} refugeJustSearched - Whether the refuge has just been searched.
 * @property {() => void} toggleInventory - Toggles the inventory open or closed.
 * @property {(updater: (prev: number) => number) => void} setInventorySelectedIndex - Sets the selected index in the inventory.
 * @property {() => void} openActionMenu - Opens the action menu for the selected item.
 * @property {() => void} closeActionMenu - Closes the action menu.
 * @property {(direction: number) => void} navigateActionMenu - Navigates the action menu.
 * @property {() => void} confirmActionMenuSelection - Confirms the selected action in the action menu.
 * @property {() => void} enterRefuge - Enters a refuge.
 * @property {() => void} leaveRefuge - Leaves a refuge.
 * @property {(direction: number) => void} navigateRefugeMenu - Navigates the refuge menu.
 * @property {() => void} confirmRefugeMenuSelection - Confirms the selected action in the refuge menu.
 * @property {() => void} searchRefuge - Searches the current refuge for items.
 * @property {() => void} clearRefugeActionMessage - Clears the refuge action message.
 * @property {() => void} toggleCrafting - Toggles the crafting menu open or closed.
 * @property {(direction: number) => void} navigateCraftingMenu - Navigates the crafting menu.
 * @property {() => void} performCrafting - Performs the selected crafting recipe.
 * @property {() => void} reset - Resets the store to its initial state.
 */
interface InteractionStoreState {
    isInventoryOpen: boolean;
    isInRefuge: boolean;
    isCraftingOpen: boolean;
    inventorySelectedIndex: number;
    actionMenuState: ActionMenuState;
    refugeMenuState: RefugeMenuState;
    craftingMenuState: CraftingMenuState;
    refugeActionMessage: string | null;
    refugeJustSearched: boolean;

    toggleInventory: () => void;
    setInventorySelectedIndex: (updater: (prev: number) => number) => void;
    openActionMenu: () => void;
    closeActionMenu: () => void;
    navigateActionMenu: (direction: number) => void;
    confirmActionMenuSelection: () => void;
    
    enterRefuge: () => void;
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

const initialState = {
    isInventoryOpen: false,
    isInRefuge: false,
    isCraftingOpen: false,
    inventorySelectedIndex: 0,
    actionMenuState: { isOpen: false, options: [], selectedIndex: 0 },
    refugeMenuState: { isOpen: false, options: [], selectedIndex: 0 },
    craftingMenuState: { selectedIndex: 0 },
    refugeActionMessage: null,
    refugeJustSearched: false,
};

export const useInteractionStore = create<InteractionStoreState>((set, get) => ({
    ...initialState,
    
    /**
     * @function toggleInventory
     * @description Toggles the inventory open or closed.
     */
    toggleInventory: () => {
        set(state => {
            if (state.actionMenuState.isOpen) {
                return { actionMenuState: { ...state.actionMenuState, isOpen: false } };
            }
            if (state.isCraftingOpen) return {};
            const isOpen = !state.isInventoryOpen;
            audioManager.playSound(isOpen ? 'confirm' : 'cancel');
            return { isInventoryOpen: isOpen, inventorySelectedIndex: 0 };
        });
    },

    /**
     * @function setInventorySelectedIndex
     * @description Sets the selected index in the inventory.
     * @param {function} updater - A function that takes the previous index and returns the new index.
     */
    setInventorySelectedIndex: (updater) => {
        const inventory = useCharacterStore.getState().inventory;
        if (inventory.length === 0) { set({ inventorySelectedIndex: 0 }); return; }
        set(state => {
            const newIndex = updater(state.inventorySelectedIndex);
            if (newIndex < 0) return { inventorySelectedIndex: inventory.length - 1 };
            if (newIndex >= inventory.length) return { inventorySelectedIndex: 0 };
            return { inventorySelectedIndex: newIndex };
        });
        audioManager.playSound('navigate');
    },

    /**
     * @function openActionMenu
     * @description Opens the action menu for the selected item.
     */
    openActionMenu: () => {
        const { inventorySelectedIndex } = get();
        const { inventory, equippedWeapon, equippedArmor } = useCharacterStore.getState();
        const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
        if (!inventory[inventorySelectedIndex]) return;
        
        const selectedItem = inventory[inventorySelectedIndex];
        const itemDetails = itemDatabase[selectedItem.itemId];
        if (!itemDetails) return;
        
        let options: string[] = [];
        const isEquipped = equippedWeapon === inventorySelectedIndex || equippedArmor === inventorySelectedIndex;
        const isBroken = selectedItem.durability && selectedItem.durability.current <= 0;

        if (isBroken) {
             options = ['Recupera Materiali', 'Scarta', 'Annulla'];
        } else {
             switch(itemDetails.type) {
                case 'consumable': options = ['Usa', 'Scarta', 'Annulla']; break;
                case 'manual': options = ['Leggi', 'Scarta', 'Annulla']; break;
                case 'weapon': case 'armor':
                    if (isEquipped) { options = ['Togli', 'Scarta', 'Annulla']; } 
                    else { options = ['Equipaggia', 'Scarta', 'Annulla']; }
                    break;
                case 'tool':
                    if(itemDetails.effects?.some(e => e.type === 'repair')) {
                        options = ['Ripara Oggetto', 'Scarta', 'Annulla'];
                    } else {
                        options = ['Usa', 'Scarta', 'Annulla'];
                    }
                    break;
                default: options = ['Esamina', 'Scarta', 'Annulla']; break;
            }
        }

        set({ actionMenuState: { isOpen: true, options, selectedIndex: 0 } });
        audioManager.playSound('confirm');
    },

    /**
     * @function closeActionMenu
     * @description Closes the action menu.
     */
    closeActionMenu: () => {
        set({ actionMenuState: { isOpen: false, options: [], selectedIndex: 0 } });
        audioManager.playSound('cancel');
    },

    /**
     * @function navigateActionMenu
     * @description Navigates the action menu.
     * @param {number} direction - The direction to navigate (-1 for up, 1 for down).
     */
    navigateActionMenu: (direction) => {
        set(state => {
            const { options, selectedIndex } = state.actionMenuState;
            let newIndex = selectedIndex + direction;
            if (newIndex < 0) newIndex = options.length - 1;
            if (newIndex >= options.length) newIndex = 0;
            return { actionMenuState: { ...state.actionMenuState, selectedIndex: newIndex } };
        });
        audioManager.playSound('navigate');
    },
    
    /**
     * @function confirmActionMenuSelection
     * @description Confirms the selected action in the action menu.
     */
    confirmActionMenuSelection: () => {
        const { actionMenuState, inventorySelectedIndex } = get();
        const charState = useCharacterStore.getState();
        const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
        const selectedAction = actionMenuState.options[actionMenuState.selectedIndex];
        
        if (!charState.inventory[inventorySelectedIndex]) { get().closeActionMenu(); return; }
        
        const itemToActOn = charState.inventory[inventorySelectedIndex];
        const itemDetails = itemDatabase[itemToActOn.itemId];
        if (!itemDetails) { get().closeActionMenu(); return; }
        
        audioManager.playSound('confirm');

        const findItemToRepair = (itemType: 'weapon' | 'armor'): number | null => {
            const equippedIndex = itemType === 'weapon' ? charState.equippedWeapon : charState.equippedArmor;
            if (equippedIndex === null) return null;
            const equippedItem = charState.inventory[equippedIndex];
            if (equippedItem && equippedItem.durability && equippedItem.durability.current < equippedItem.durability.max) {
                return equippedIndex;
            }
            return null;
        };

        switch (selectedAction) {
            case 'Usa':
                if (itemDetails.type === 'consumable' && itemDetails.effects) {
                    let baseMessage = `Hai usato: ${itemDetails.name}.`;
                    let effectMessages: string[] = [];
                    let hasFoodOrDrink = false;
                    itemDetails.effects.forEach(effect => {
                        switch(effect.type) {
                            case 'heal': {
                                let healAmount = effect.value as number;
                                const hasFieldMedic = charState.unlockedTalents.includes('field_medic');
                                if (hasFieldMedic) {
                                    healAmount = Math.floor(healAmount * 1.25);
                                }
                                charState.heal(healAmount);
                                effectMessages.push(`Recuperi ${healAmount} HP.${hasFieldMedic ? ' [Medico da Campo]' : ''}`);
                                break;
                            }
                            case 'satiety': 
                                charState.restoreSatiety(effect.value as number); 
                                effectMessages.push(`Recuperi ${effect.value} sazietà.`); 
                                hasFoodOrDrink = true;
                                break;
                            case 'hydration': 
                                charState.restoreHydration(effect.value as number); 
                                effectMessages.push(`Recuperi ${effect.value} idratazione.`); 
                                hasFoodOrDrink = true;
                                break;
                            case 'cureStatus':
                                if (charState.status.has(effect.value as PlayerStatusCondition)) {
                                    charState.removeStatus(effect.value as PlayerStatusCondition);
                                    effectMessages.push(`Ti senti meglio. Lo stato ${effect.value} è svanito.`);
                                } else {
                                    effectMessages.push(`Non ha avuto alcun effetto...`);
                                }
                                break;
                            default: effectMessages.push(`Senti un effetto strano...`); break;
                        }
                    });
                    // FIX: Mangiare/bere riduce la stanchezza di 10
                    if (hasFoodOrDrink) {
                        charState.rest(10);
                        effectMessages.push(`Ti senti meno stanco.`);
                    }
                    useGameStore.getState().addJournalEntry({ text: [baseMessage, ...effectMessages].join(' '), type: JournalEntryType.NARRATIVE });
                    charState.discardItem(inventorySelectedIndex, 1);
                }
                break;
            case 'Leggi':
                if (itemDetails.type === 'manual' && itemDetails.unlocksRecipe) {
                    charState.learnRecipe(itemDetails.unlocksRecipe);
                    charState.discardItem(inventorySelectedIndex, 1);
                }
                break;
            case 'Equipaggia': charState.equipItem(inventorySelectedIndex); useGameStore.getState().addJournalEntry({ text: `Hai equipaggiato: ${itemDetails.name}.`, type: JournalEntryType.NARRATIVE }); break;
            case 'Togli': charState.unequipItem(itemDetails.type === 'weapon' ? 'weapon' : 'armor'); useGameStore.getState().addJournalEntry({ text: `Hai tolto: ${itemDetails.name}.`, type: JournalEntryType.NARRATIVE }); break;
            case 'Scarta':
                charState.discardItem(inventorySelectedIndex, 1);
                useGameStore.getState().addJournalEntry({ text: `Hai scartato: ${itemDetails.name}.`, type: JournalEntryType.NARRATIVE }); 
                break;
            case 'Esamina': useGameStore.getState().addJournalEntry({ text: `Esamini: ${itemDetails.name}. ${itemDetails.description}`, type: JournalEntryType.NARRATIVE }); break;
            case 'Recupera Materiali': charState.salvageItem(inventorySelectedIndex); break;
            case 'Ripara Oggetto': {
                const repairValue = itemDetails.effects?.find(e => e.type === 'repair')?.value as number;
                if(!repairValue) break;
                
                let repaired = false;
                const repairTargets = [
                    ...charState.inventory.filter(i => i.durability && i.durability.current < i.durability.max)
                ];

                if(repairTargets.length > 0) {
                    // For now, let's just repair the first damaged item found for simplicity.
                    // A more complex system could let the user choose.
                    const itemToRepairIndex = charState.inventory.findIndex(i => i.itemId === repairTargets[0].itemId);
                    if(itemToRepairIndex !== -1) {
                        charState.repairItem(itemToRepairIndex, repairValue);
                        const repairedItemDetails = itemDatabase[repairTargets[0].itemId];
                        useGameStore.getState().addJournalEntry({ text: `Hai usato ${itemDetails.name} per riparare ${repairedItemDetails.name}.`, type: JournalEntryType.NARRATIVE });
                        charState.discardItem(inventorySelectedIndex, 1);
                        repaired = true;
                    }
                }
                
                if (!repaired) {
                     useGameStore.getState().addJournalEntry({ text: `Non hai oggetti da riparare.`, type: JournalEntryType.ACTION_FAILURE });
                }
                break;
            }
        }
        
        get().closeActionMenu();
        if (useCharacterStore.getState().inventory.length <= inventorySelectedIndex) {
            set({ inventorySelectedIndex: Math.max(0, useCharacterStore.getState().inventory.length - 1) });
        }
    },

    /**
     * @function clearRefugeActionMessage
     * @description Clears the refuge action message.
     */
    clearRefugeActionMessage: () => set({ refugeActionMessage: null }),

    /**
     * @function enterRefuge
     * @description Enters a refuge.
     */
    enterRefuge: () => {
        const { visitedRefuges, mainQuestStage, setGameState, activeMainQuestEvent, addJournalEntry, playerPos, lootedRefuges } = useGameStore.getState();
        const { gameTime } = useTimeStore.getState();
        const { refugeJustSearched } = get();

        const isFirstRefuge = visitedRefuges.length === 0;
        if (isFirstRefuge) {
            const { mainQuestChapters } = useMainQuestDatabaseStore.getState();
            const nextChapter = mainQuestChapters.find(c => c.stage === mainQuestStage);
            if (nextChapter && nextChapter.trigger.type === 'firstRefugeEntry') {
                const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
                if (!isNight || nextChapter.allowNightTrigger) {
                    useGameStore.setState({ activeMainQuestEvent: nextChapter, gameState: GameState.MAIN_QUEST });
                    // Don't show the refuge menu until the quest is resolved
                    return;
                }
            }
        }

        const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
        const isLooted = lootedRefuges.some(pos => pos.x === playerPos.x && pos.y === playerPos.y);

        const options = [ isNight ? "Dormi fino all'alba" : "Aspetta un'ora" ];
        if (!isLooted && !refugeJustSearched) {
            options.push("Cerca nei dintorni");
        }
        options.push("Banco di Lavoro", "Gestisci Inventario", "Esci dal Rifugio");

        set({
            isInRefuge: true,
            refugeJustSearched: false,
            refugeMenuState: { isOpen: true, options, selectedIndex: 0 }
        });
        addJournalEntry({ text: "Sei entrato in un rifugio. Sei al sicuro.", type: JournalEntryType.NARRATIVE });
    },

    /**
     * @function leaveRefuge
     * @description Leaves a refuge.
     */
    leaveRefuge: () => {
        set(state => {
            useGameStore.setState(gs => {
                const newFlags = new Set(gs.gameFlags);
                newFlags.delete('LULLABY_CHOICE_OFFERED_THIS_REST');
                return { gameFlags: newFlags };
            });
            return {
                isInRefuge: false,
                refugeMenuState: { isOpen: false, options: [], selectedIndex: 0 },
                refugeActionMessage: null,
                refugeJustSearched: false,
            };
        });
        useGameStore.getState().addJournalEntry({ text: "Lasci la sicurezza del rifugio.", type: JournalEntryType.NARRATIVE });
        audioManager.playSound('cancel');
    },

    /**
     * @function navigateRefugeMenu
     * @description Navigates the refuge menu.
     * @param {number} direction - The direction to navigate (-1 for up, 1 for down).
     */
    navigateRefugeMenu: (direction) => {
        get().clearRefugeActionMessage();
        set(state => {
            if (!state.isInRefuge) return {};
            const { options, selectedIndex } = state.refugeMenuState;
            let newIndex = selectedIndex + direction;
            if (newIndex < 0) newIndex = options.length - 1;
            if (newIndex >= options.length) newIndex = 0;
            return { refugeMenuState: { ...state.refugeMenuState, selectedIndex: newIndex } };
        });
        audioManager.playSound('navigate');
    },

    /**
     * @function searchRefuge
     * @description Searches the current refuge for items.
     */
    searchRefuge: () => {
        const { addJournalEntry, playerPos } = useGameStore.getState();
        const { advanceTime } = useTimeStore.getState();
        advanceTime(30, true);

        const skillCheckResult = useCharacterStore.getState().performSkillCheck('percezione', 10);
        let journalText = `Prova di Percezione (CD ${skillCheckResult.dc}): ${skillCheckResult.roll} (d20) + ${skillCheckResult.bonus} (mod) = ${skillCheckResult.total}. `;

        if (skillCheckResult.success) {
            journalText += "SUCCESSO. ";
            
            // FIX v1.2.4: Expanded loot table with manuals and better balance
            const hasScavenger = useCharacterStore.getState().unlockedTalents.includes('scavenger');
            const lootTable = [
                // Water & Food (35% combined)
                { id: 'CONS_002', weight: 15, quantity: hasScavenger ? 3 : 2 }, // Clean water
                { id: 'dirty_water', weight: 10, quantity: hasScavenger ? 4 : 2 }, // Dirty water (common)
                { id: 'CONS_001', weight: 10, quantity: hasScavenger ? 2 : 1 }, // Food
                
                // Medical supplies (15%)
                { id: 'CONS_003', weight: 7, quantity: hasScavenger ? 2 : 1 }, // Bandages
                { id: 'MED_BANDAGE_BASIC', weight: 5, quantity: hasScavenger ? 3 : 2 },
                { id: 'MED_ANTISEPTIC', weight: 3, quantity: 1 },
                
                // Crafting materials (25%)
                { id: 'scrap_metal', weight: 7, quantity: hasScavenger ? 3 : 2 },
                { id: 'clean_cloth', weight: 6, quantity: hasScavenger ? 3 : 2 }, // For water purification & bandages
                { id: 'bottle_empty', weight: 5, quantity: hasScavenger ? 3 : 2 }, // For water collection
                { id: 'adhesive_tape', weight: 4, quantity: 1 },
                { id: 'durable_cloth', weight: 3, quantity: 1 },
                
                // Manuals (20% - significantly increased)
                { id: 'manual_field_medicine', weight: 5, quantity: 1 },
                { id: 'manual_survival_basics', weight: 5, quantity: 1 },
                { id: 'manual_archery_basics', weight: 5, quantity: 1 },
                { id: 'manual_advanced_repairs', weight: 5, quantity: 1 },
                
                // Advanced consumables (5%)
                { id: 'MED_PAINKILLER', weight: 3, quantity: 1 },
                { id: 'first_aid_kit', weight: 2, quantity: 1 },
            ];
            
            const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
            const roll = Math.random() * totalWeight;
            let cumulativeWeight = 0;
            let foundItem = lootTable[0];
            
            for (const item of lootTable) {
                cumulativeWeight += item.weight;
                if (roll < cumulativeWeight) {
                    foundItem = item;
                    break;
                }
            }
            
            const itemDetails = useItemDatabaseStore.getState().itemDatabase[foundItem.id];
            if(itemDetails) {
                useCharacterStore.getState().addItem(foundItem.id, foundItem.quantity);
                journalText += `Frugando sotto un'asse del pavimento, trovi: ${itemDetails.name} (x${foundItem.quantity}).`;
                if (hasScavenger) journalText += " [Scavenger]";
                addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
            } else {
                journalText += "Non trovi nulla di valore.";
                addJournalEntry({ text: journalText, type: JournalEntryType.ACTION_FAILURE });
            }
        } else {
            journalText += "FALLIMENTO. Hai cercato ovunque, ma non trovi nulla di utile.";
            addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_FAILURE });
        }

        set({ refugeActionMessage: journalText, refugeJustSearched: true });

        const isNight = useTimeStore.getState().gameTime.hour >= 20 || useTimeStore.getState().gameTime.hour < 6;
        const newOptions = [ isNight ? "Dormi fino all'alba" : "Aspetta un'ora", "Banco di Lavoro", "Gestisci Inventario", "Esci dal Rifugio" ];
        set(state => ({ refugeMenuState: { ...state.refugeMenuState, options: newOptions, selectedIndex: 0 } }));
    },

    /**
     * @function confirmRefugeMenuSelection
     * @description Confirms the selected action in the refuge menu.
     */
    confirmRefugeMenuSelection: () => {
        get().clearRefugeActionMessage();
        const { refugeMenuState } = get();
        const { addJournalEntry, setGameState, mainQuestStage, playerPos, gameFlags } = useGameStore.getState();
        const { gameTime, advanceTime } = useTimeStore.getState();
        const { satiety, hydration } = useCharacterStore.getState();
        const selectedAction = refugeMenuState.options[refugeMenuState.selectedIndex];
        
        if (selectedAction === "Aspetta un'ora" || selectedAction === "Dormi fino all'alba") {
            const hasMusicBox = useCharacterStore.getState().inventory.some(i => i.itemId === 'carillon_annerito');
            if ( mainQuestStage >= 10 && playerPos.x > 80 && !gameFlags.has('ASH_LULLABY_PLAYED') && !gameFlags.has('LULLABY_CHOICE_OFFERED_THIS_REST') && hasMusicBox ) {
                useGameStore.setState(state => ({ gameFlags: new Set(state.gameFlags).add('LULLABY_CHOICE_OFFERED_THIS_REST') }));
                setGameState(GameState.ASH_LULLABY_CHOICE);
                audioManager.playSound('confirm');
                return;
            }
        }
        
        audioManager.playSound('confirm');

        switch(selectedAction) {
          case "Aspetta un'ora": {
            addJournalEntry({ text: "Decidi di riposare per un'ora.", type: JournalEntryType.NARRATIVE });
            advanceTime(60, true);
            const { fatigue, heal, rest } = useCharacterStore.getState();
            let healAmount = 5;
            if (fatigue.current > 75) {
                healAmount = Math.floor(healAmount / 2);
            }
            heal(healAmount);
            rest(15);
            set({ refugeActionMessage: `Hai recuperato ${healAmount} HP e ti senti meno stanco.` });
            break;
          }
          case "Dormi fino all'alba": {
            let hoursToRest = (24 - gameTime.hour) + 6;
            if (gameTime.hour < 6) hoursToRest = 6 - gameTime.hour;
            const minutesToRest = (hoursToRest * 60) - gameTime.minute;
            const { satietyCost, hydrationCost } = useCharacterStore.getState().calculateSurvivalCost(minutesToRest);
            
            // FIX v1.2.4: Always allow sleep, but apply penalties if malnourished/dehydrated
            const hasSufficientResources = satiety.current >= satietyCost && hydration.current >= hydrationCost;
            
            if (!hasSufficientResources) {
                addJournalEntry({ 
                    text: "Ti addormenti nonostante la fame e la sete...", 
                    type: JournalEntryType.NARRATIVE 
                });
            } else {
                addJournalEntry({ 
                    text: "Ti addormenti profondamente...", 
                    type: JournalEntryType.NARRATIVE 
                });
            }
            
            advanceTime(minutesToRest, true);
            const { heal, rest, hp, addStatus } = useCharacterStore.getState();
            
            if (hasSufficientResources) {
                // Full recovery
                heal(hp.max);
                rest(50);
                set({ refugeActionMessage: "Ti svegli all'alba, rinvigorito." });
            } else {
                // Penalized recovery
                const healAmount = Math.floor(hp.max * 0.3); // Only 30% HP recovery
                heal(healAmount);
                rest(25); // Only 25 fatigue recovery
                addStatus('MALATO');
                addJournalEntry({
                    text: "Il sonno è stato inquieto. La mancanza di cibo e acqua ti ha lasciato debole.",
                    type: JournalEntryType.SYSTEM_WARNING
                });
                set({ refugeActionMessage: "Ti svegli all'alba, ma sei debole e malato." });
            }
            break;
          }
          case "Cerca nei dintorni":
              get().searchRefuge();
              return;
          case "Banco di Lavoro": get().toggleCrafting(); break;
          case "Gestisci Inventario": get().toggleInventory(); break;
          case "Esci dal Rifugio": get().leaveRefuge(); break;
        }
        
        if (get().isInRefuge) {
            const { playerPos, lootedRefuges } = useGameStore.getState();
            const { gameTime: newGameTime } = useTimeStore.getState();
            const { refugeJustSearched } = get();
            const isNight = newGameTime.hour >= 20 || newGameTime.hour < 6;
            const isLooted = lootedRefuges.some(pos => pos.x === playerPos.x && pos.y === playerPos.y);
            const newOptions = [ isNight ? "Dormi fino all'alba" : "Aspetta un'ora" ];
            if (!isLooted && !refugeJustSearched) newOptions.push("Cerca nei dintorni");
            newOptions.push("Banco di Lavoro", "Gestisci Inventario", "Esci dal Rifugio");
            // FIX: Reset selectedIndex a 0 quando il menu cambia per evitare confusione
            set(state => ({ refugeMenuState: { options: newOptions, selectedIndex: 0 } }));
        }
    },

    /**
     * @function toggleCrafting
     * @description Toggles the crafting menu open or closed.
     */
    toggleCrafting: () => {
        set(state => {
            if (state.isInventoryOpen) return {};
            const isOpening = !state.isCraftingOpen;
            audioManager.playSound(isOpening ? 'confirm' : 'cancel');
            return { isCraftingOpen: isOpening, craftingMenuState: { selectedIndex: 0 }};
        });
    },

    /**
     * @function navigateCraftingMenu
     * @description Navigates the crafting menu.
     * @param {number} direction - The direction to navigate (-1 for up, 1 for down).
     */
    navigateCraftingMenu: (direction) => {
        const { knownRecipes } = useCharacterStore.getState();
        const displayableRecipes = useRecipeDatabaseStore.getState().recipes.filter(r => knownRecipes.includes(r.id));
        if (displayableRecipes.length === 0) return;

        set(state => {
            let newIndex = state.craftingMenuState.selectedIndex + direction;
            if (newIndex < 0) newIndex = displayableRecipes.length - 1;
            if (newIndex >= displayableRecipes.length) newIndex = 0;
            return { craftingMenuState: { selectedIndex: newIndex } };
        });
        audioManager.playSound('navigate');
    },
    
    /**
     * @function performCrafting
     * @description Performs the selected crafting recipe.
     */
    performCrafting: () => {
        const { craftingMenuState } = get();
        const { addJournalEntry } = useGameStore.getState();
        const { advanceTime } = useTimeStore.getState();
        const { inventory, knownRecipes, performSkillCheck, removeItem, addItem } = useCharacterStore.getState();
        const { recipes } = useRecipeDatabaseStore.getState();
        const { itemDatabase } = useItemDatabaseStore.getState();
        
        const displayableRecipes = recipes.filter(r => knownRecipes.includes(r.id));
        const recipe = displayableRecipes[craftingMenuState.selectedIndex];
        if (!recipe) {
            console.error('[CRAFTING] Recipe not found at index', craftingMenuState.selectedIndex);
            return;
        }

        // FIX: Validate recipe has results
        if (!recipe.results || recipe.results.length === 0) {
            console.error('[CRAFTING] Recipe has no results:', recipe.id);
            addJournalEntry({ text: "Errore: ricetta senza risultato.", type: JournalEntryType.SYSTEM_ERROR });
            audioManager.playSound('error');
            return;
        }

        if (!recipe.ingredients.every(ing => (inventory.find(i => i.itemId === ing.itemId)?.quantity || 0) >= ing.quantity)) {
            addJournalEntry({ text: "Ingredienti insufficienti.", type: JournalEntryType.ACTION_FAILURE });
            audioManager.playSound('error');
            return;
        }

        // FIX: Check if itemDatabase is loaded before crafting
        if (Object.keys(itemDatabase).length === 0) {
            console.error('[CRAFTING] Item database not loaded yet!');
            addJournalEntry({ text: "Errore: database oggetti non caricato. Riprova.", type: JournalEntryType.SYSTEM_ERROR });
            audioManager.playSound('error');
            return;
        }

        // Crafting sempre con successo (skillcheck rimosso)
        advanceTime(recipe.timeCost, true);
        audioManager.playSound('confirm');
        
        // Rimuovi ingredienti PRIMA di aggiungere i risultati
        recipe.ingredients.forEach(ing => removeItem(ing.itemId, ing.quantity));

        // Crea gli item e costruisci il messaggio
        const createdItemsText = recipe.results.map(result => {
            const item = itemDatabase[result.itemId];
            if (!item) {
                console.error(`[CRAFTING] Item ${result.itemId} not found in database. Available items:`, Object.keys(itemDatabase).slice(0, 10));
                addJournalEntry({ text: `ERRORE: Oggetto ${result.itemId} non trovato nel database.`, type: JournalEntryType.SYSTEM_ERROR });
                return null;
            }
            
            // Add item to inventory
            addItem(result.itemId, result.quantity);
            
            // Return formatted string
            return `${item.name} x${result.quantity}`;
        }).filter(text => text !== null).join(', ');

        if (createdItemsText.length > 0) {
            const journalText = `Hai creato: ${createdItemsText}.`;
            addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
        } else {
            addJournalEntry({ text: "Crafting fallito: nessun oggetto creato.", type: JournalEntryType.SYSTEM_ERROR });
        }
    },

    /**
     * @function reset
     * @description Resets the store to its initial state.
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