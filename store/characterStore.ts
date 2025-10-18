import { create } from 'zustand';
import {
  CharacterState,
  Attributes,
  AttributeName,
  SkillName,
  SkillCheckResult,
  WeatherType,
  InventoryItem,
  Stat,
  Skill,
  Alignment,
  JournalEntryType,
  PlayerStatusCondition,
  DeathCause,
} from '../types';
import { SKILLS, XP_PER_LEVEL } from '../constants';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useGameStore } from './gameStore';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { audioManager } from '../utils/audio';
import { useTrophyDatabaseStore } from '../data/trophyDatabase';

const BASE_STAT_VALUE = 100;

const initialAttributes: Attributes = {
  for: 10,
  des: 10,
  cos: 10,
  int: 10,
  sag: 10,
  car: 10,
};

// Create initial skills record from SKILLS constant
const initialSkills: Record<SkillName, Skill> = Object.keys(SKILLS).reduce((acc, skill) => {
  acc[skill as SkillName] = { proficient: false };
  return acc;
}, {} as Record<SkillName, Skill>);

const initialAlignment: Alignment = {
    lena: 0,
    elian: 0,
};


export const useCharacterStore = create<CharacterState>((set, get) => ({
    // --- State ---
    level: 1,
    xp: { current: 0, next: XP_PER_LEVEL[2] },
    hp: { current: 100, max: 100 },
    satiety: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
    hydration: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
    attributes: { ...initialAttributes },
    skills: { ...initialSkills },
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    alignment: { ...initialAlignment },
    // FIX: Explicitly typed the Set to ensure correct type inference downstream.
    status: new Set<PlayerStatusCondition>(),
    levelUpPending: false,
    knownRecipes: [],
    unlockedTalents: [],
    unlockedTrophies: new Set<string>(),

    // --- Actions ---
    /**
     * @function initCharacter
     * @description Initializes the character with default values.
     */
    initCharacter: () => {
        const maxHp = 100; // Base HP for 10 COS
        const newSkills = { ...initialSkills };
        // Grant starting proficiencies to allow talent choices on level up
        newSkills.sopravvivenza.proficient = true;
        newSkills.medicina.proficient = true;
        newSkills.furtivita.proficient = true;


        set({
            level: 1,
            xp: { current: 0, next: XP_PER_LEVEL[2] },
            attributes: { ...initialAttributes },
            hp: { current: maxHp, max: maxHp },
            satiety: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
            hydration: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
            skills: newSkills,
            alignment: { ...initialAlignment },
            // FIX: Explicitly type new Set() to avoid it being inferred as Set<unknown>.
            status: new Set<PlayerStatusCondition>(),
            levelUpPending: false,
            inventory: [
                { itemId: 'carillon_annerito', quantity: 1 },
                // Add initial items for crafting
                { itemId: 'scrap_metal', quantity: 2 },
                { itemId: 'durable_cloth', quantity: 1 }
            ],
            equippedWeapon: null,
            equippedArmor: null,
            knownRecipes: ['recipe_makeshift_knife', 'recipe_bandage_adv', 'recipe_repair_kit_basic'],
            unlockedTalents: [],
            unlockedTrophies: new Set<string>(),
        });
    },

    /**
     * @function setAttributes
     * @description Sets the character's attributes.
     * @param {Attributes} newAttributes - The new attributes to set.
     */
    setAttributes: (newAttributes) => {
        set(state => {
            const newCos = newAttributes.cos;
            const cosModifier = Math.floor((newCos - 10) / 2);
            // Base HP is 100 for 10 COS. Add 10 HP per constitution modifier point.
            const newMaxHp = 100 + (cosModifier * 10);

            return {
                attributes: newAttributes,
                hp: { max: newMaxHp, current: newMaxHp },
            };
        });
    },

    /**
     * @function getAttributeModifier
     * @description Gets the modifier for a given attribute.
     * @param {AttributeName} attribute - The attribute to get the modifier for.
     * @returns {number} The modifier for the attribute.
     */
    getAttributeModifier: (attribute) => {
        const value = get().attributes[attribute];
        return Math.floor((value - 10) / 2);
    },

    /**
     * @function getSkillBonus
     * @description Gets the bonus for a given skill.
     * @param {SkillName} skill - The skill to get the bonus for.
     * @returns {number} The bonus for the skill.
     */
    getSkillBonus: (skill) => {
        const skillDef = SKILLS[skill];
        if (!skillDef) return 0;
        
        const { alignment, level, skills, status } = get();
        const attributeModifier = get().getAttributeModifier(skillDef.attribute);
        const proficiencyBonus = skills[skill].proficient ? Math.floor((level - 1) / 4) + 2 : 0;
        
        // --- Moral Compass Bonus ---
        let alignmentBonus = 0;
        const alignmentDifference = alignment.lena - alignment.elian;
        const ALIGNMENT_THRESHOLD = 5;

        if (alignmentDifference > ALIGNMENT_THRESHOLD) { // Lena Dominant
            if (skill === 'persuasione' || skill === 'intuizione') {
                alignmentBonus = 2;
            }
        } else if (alignmentDifference < -ALIGNMENT_THRESHOLD) { // Elian Dominant
            if (skill === 'sopravvivenza' || skill === 'intimidire') {
                alignmentBonus = 2;
            }
        }
        
        // --- Status Penalty ---
        let statusPenalty = 0;
        if (status.has('FERITO')) {
            const physicalSkills: SkillName[] = ['atletica', 'acrobazia', 'furtivita', 'rapiditaDiMano'];
            if (physicalSkills.includes(skill)) {
                statusPenalty = -2;
            }
        }

        return attributeModifier + proficiencyBonus + alignmentBonus + statusPenalty;
    },

    /**
     * @function performSkillCheck
     * @description Performs a skill check.
     * @param {SkillName} skill - The skill to check.
     * @param {number} dc - The difficulty class of the check.
     * @returns {SkillCheckResult} The result of the skill check.
     */
    performSkillCheck: (skill, dc) => {
        const roll = Math.floor(Math.random() * 20) + 1;
        const bonus = get().getSkillBonus(skill);
        const total = roll + bonus;
        const success = total >= dc;
        return { skill, roll, bonus, total, dc, success };
    },

    /**
     * @function gainExplorationXp
     * @description Adds exploration experience to the character.
     */
    gainExplorationXp: () => {
        get().addXp(1);
    },

    /**
     * @function addXp
     * @description Adds experience points to the character.
     * @param {number} amount - The amount of experience to add.
     */
    addXp: (amount) => {
        if (get().levelUpPending) {
             set(state => ({ xp: { ...state.xp, current: state.xp.current + amount } }));
             return;
        }
        set(state => {
            const newXp = state.xp.current + amount;
            if (newXp >= state.xp.next) {
                return { 
                    xp: { ...state.xp, current: newXp },
                    levelUpPending: true 
                };
            }
            return { xp: { ...state.xp, current: newXp } };
        });
    },

    /**
     * @function applyLevelUp
     * @description Applies the level up choices to the character.
     * @param {object} choices - The choices made during level up.
     * @param {AttributeName} choices.attribute - The attribute to increase.
     * @param {string} choices.talentId - The ID of the talent to unlock.
     */
    applyLevelUp: (choices) => {
        set(state => {
            if (!state.levelUpPending) return {};

            const newLevel = state.level + 1;
            const xpForNextLevel = XP_PER_LEVEL[newLevel + 1] || state.xp.next;
            const remainingXp = state.xp.current - state.xp.next;
            
            const constitutionModifier = get().getAttributeModifier('cos');
            const hpIncrease = 5 + constitutionModifier;
            const newMaxHp = state.hp.max + hpIncrease;

            const newAttributes = { ...state.attributes };
            newAttributes[choices.attribute] += 1;
            
            const newUnlockedTalents = [...state.unlockedTalents, choices.talentId];
            
            audioManager.playSound('level_up');
            useGameStore.getState().addJournalEntry({
                text: `Sei salito al livello ${newLevel}! Le tue abilità migliorano.`,
                type: JournalEntryType.XP_GAIN
            });

            const newState = {
                level: newLevel,
                xp: { current: remainingXp, next: xpForNextLevel },
                hp: { max: newMaxHp, current: newMaxHp }, // Full heal on level up
                attributes: newAttributes,
                unlockedTalents: newUnlockedTalents,
                levelUpPending: remainingXp >= xpForNextLevel, // Check if another level up is pending
            };

            // Cannot call check triggers inside set state, so we do it after
            Promise.resolve().then(() => {
                useGameStore.getState().checkMainQuestTriggers();
            });

            return newState;
        });
    },

    /**
     * @function addItem
     * @description Adds an item to the character's inventory.
     * @param {string} itemId - The ID of the item to add.
     * @param {number} [quantity=1] - The quantity of the item to add.
     */
    addItem: (itemId, quantity = 1) => {
        set(state => {
            const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
            const itemDetails = itemDatabase[itemId];
            if (!itemDetails) return {};
    
            const newInventory = [...state.inventory];
            
            if (itemDetails.stackable) {
                const existingItemIndex = newInventory.findIndex(i => i.itemId === itemId);
                if (existingItemIndex > -1) {
                    newInventory[existingItemIndex].quantity += quantity;
                } else {
                    newInventory.push({ itemId, quantity });
                }
            } else {
                // Non-stackable items are added as individual entries with quantity 1
                for (let i = 0; i < quantity; i++) {
                    const newItem: InventoryItem = { itemId, quantity: 1 };
                    if (itemDetails.durability) {
                        newItem.durability = { current: itemDetails.durability, max: itemDetails.durability };
                    }
                    newInventory.push(newItem);
                }
            }
            return { inventory: newInventory };
        });
    },

    /**
     * @function removeItem
     * @description Removes an item from the character's inventory.
     * @param {string} itemId - The ID of the item to remove.
     * @param {number} [quantity=1] - The quantity of the item to remove.
     */
    removeItem: (itemId, quantity = 1) => {
        set(state => {
            const itemDetails = useItemDatabaseStore.getState().itemDatabase[itemId];
            if (!itemDetails) return {};
    
            let newInventory = [...state.inventory];
            let remainingToRemove = quantity;
    
            if (itemDetails.stackable) {
                const itemIndex = newInventory.findIndex(i => i.itemId === itemId);
                if (itemIndex > -1) {
                    if (newInventory[itemIndex].quantity > remainingToRemove) {
                        newInventory[itemIndex].quantity -= remainingToRemove;
                    } else {
                        newInventory.splice(itemIndex, 1);
                    }
                }
            } else {
                // For non-stackable, remove one by one from the end
                for (let i = newInventory.length - 1; i >= 0; i--) {
                    if (remainingToRemove > 0 && newInventory[i].itemId === itemId) {
                        newInventory.splice(i, 1);
                        remainingToRemove--;
                    }
                }
            }
            return { inventory: newInventory };
        });
    },
    
    /**
     * @function discardItem
     * @description Discards an item from the character's inventory.
     * @param {number} inventoryIndex - The index of the item in the inventory.
     * @param {number} [quantity=1] - The quantity of the item to discard.
     */
    discardItem: (inventoryIndex: number, quantity = 1) => {
        set(state => {
            const itemInInventory = state.inventory[inventoryIndex];
            if (!itemInInventory) return {};
        
            const newInventory = [...state.inventory];
            const isEquipped = state.equippedWeapon === inventoryIndex || state.equippedArmor === inventoryIndex;
            
            let newEquippedWeapon = state.equippedWeapon;
            let newEquippedArmor = state.equippedArmor;
            
            if (isEquipped) {
                 if(state.equippedWeapon === inventoryIndex) newEquippedWeapon = null;
                 if(state.equippedArmor === inventoryIndex) newEquippedArmor = null;
            }
            
            if (newInventory[inventoryIndex].quantity > quantity) {
                newInventory[inventoryIndex].quantity -= quantity;
            } else {
                newInventory.splice(inventoryIndex, 1);
                // After removing an item, equipped indices might shift
                if (newEquippedWeapon !== null && newEquippedWeapon > inventoryIndex) newEquippedWeapon--;
                if (newEquippedArmor !== null && newEquippedArmor > inventoryIndex) newEquippedArmor--;
            }

            return { inventory: newInventory, equippedWeapon: newEquippedWeapon, equippedArmor: newEquippedArmor };
        });
    },

    /**
     * @function equipItem
     * @description Equips an item from the inventory.
     * @param {number | string} inventoryIndexOrId - The index or ID of the item to equip.
     */
    equipItem: (inventoryIndexOrId: number | string) => {
        set(state => {
            let inventoryIndex: number;

            if (typeof inventoryIndexOrId === 'string') {
                const itemId = inventoryIndexOrId;
                // Find the first non-broken instance of this item
                inventoryIndex = state.inventory.findIndex(i => i.itemId === itemId && (!i.durability || i.durability.current > 0));
                
                if (inventoryIndex === -1) {
                     // Maybe it's broken, find it anyway to give a proper message
                     if (state.inventory.some(i => i.itemId === itemId)) {
                         const itemDetails = useItemDatabaseStore.getState().itemDatabase[itemId];
                         useGameStore.getState().addJournalEntry({ text: `${itemDetails?.name || 'Oggetto'} è rotto e non può essere equipaggiato.`, type: JournalEntryType.ACTION_FAILURE });
                     } else {
                         useGameStore.getState().addJournalEntry({ text: `Oggetto ${itemId} non trovato nell'inventario.`, type: JournalEntryType.SYSTEM_ERROR });
                     }
                     return {};
                }
            } else {
                inventoryIndex = inventoryIndexOrId;
            }

            const item = state.inventory[inventoryIndex];
            const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
            const itemDetails = item ? itemDatabase[item.itemId] : null;

            if (!item || !itemDetails) return {};

            if (item.durability && item.durability.current <= 0) {
                useGameStore.getState().addJournalEntry({ text: `${itemDetails.name} è rotto e non può essere equipaggiato.`, type: JournalEntryType.ACTION_FAILURE });
                return {};
            }

            if (itemDetails.type === 'weapon') {
                return { equippedWeapon: inventoryIndex };
            }
            if (itemDetails.type === 'armor') {
                return { equippedArmor: inventoryIndex };
            }
            return {};
        });
    },

    /**
     * @function unequipItem
     * @description Unequips an item from a specified slot.
     * @param {'weapon' | 'armor'} slot - The slot to unequip.
     */
    unequipItem: (slot) => {
        set(() => {
            if (slot === 'weapon') return { equippedWeapon: null };
            if (slot === 'armor') return { equippedArmor: null };
            return {};
        });
    },

    /**
     * @function damageEquippedItem
     * @description Damages an equipped item.
     * @param {'weapon' | 'armor'} slot - The slot of the item to damage.
     * @param {number} amount - The amount of damage to inflict.
     */
    damageEquippedItem: (slot, amount) => {
        set(state => {
            const equippedIndex = slot === 'weapon' ? state.equippedWeapon : state.equippedArmor;
            if (equippedIndex === null) return {};
            
            const newInventory = [...state.inventory];
            const item = newInventory[equippedIndex];
            if (!item || !item.durability) return {};

            item.durability.current = Math.max(0, item.durability.current - amount);

            if (item.durability.current <= 0) {
                const itemDetails = useItemDatabaseStore.getState().itemDatabase[item.itemId];
                useGameStore.getState().addJournalEntry({
                    text: `Il tuo ${itemDetails.name} si è rotto!`,
                    type: JournalEntryType.SYSTEM_ERROR
                });
                audioManager.playSound('error');
                const newEquipped = slot === 'weapon' ? { equippedWeapon: null } : { equippedArmor: null };
                return { inventory: newInventory, ...newEquipped };
            }
            
            return { inventory: newInventory };
        });
    },

    /**
     * @function repairItem
     * @description Repairs an item in the inventory.
     * @param {number} inventoryIndex - The index of the item to repair.
     * @param {number} amount - The amount to repair.
     */
    repairItem: (inventoryIndex, amount) => {
        set(state => {
            const newInventory = [...state.inventory];
            const item = newInventory[inventoryIndex];
            if (!item || !item.durability) return {};

            item.durability.current = Math.min(item.durability.max, item.durability.current + amount);
            return { inventory: newInventory };
        });
    },

    /**
     * @function salvageItem
     * @description Salvages a broken item for materials.
     * @param {number} inventoryIndex - The index of the item to salvage.
     */
    salvageItem: (inventoryIndex) => {
        const { inventory, addItem, discardItem } = get();
        const item = inventory[inventoryIndex];
        if (!item || (item.durability && item.durability.current > 0)) return;

        const itemDetails = useItemDatabaseStore.getState().itemDatabase[item.itemId];
        let materialId = 'scrap_metal';
        if (itemDetails.rarity === 'rare' || itemDetails.rarity === 'epic') {
            materialId = 'scrap_metal_high_quality';
        }
        
        discardItem(inventoryIndex, 1);
        addItem(materialId, 1);

        useGameStore.getState().addJournalEntry({
            text: `Hai smontato ${itemDetails.name} e recuperato ${useItemDatabaseStore.getState().itemDatabase[materialId].name}.`,
            type: JournalEntryType.NARRATIVE
        });
    },

    /**
     * @function takeDamage
     * @description Inflicts damage to the character.
     * @param {number} amount - The amount of damage to inflict.
     * @param {DeathCause} [cause='UNKNOWN'] - The cause of death if the damage is fatal.
     */
    takeDamage: (amount, cause: DeathCause = 'UNKNOWN') => {
        set(state => {
            const newHp = Math.max(0, state.hp.current - amount);
            if (newHp <= 0 && state.hp.current > 0) {
                useGameStore.getState().setGameOver(cause);
            }
            return { hp: { ...state.hp, current: newHp } };
        });
    },
    
    /**
     * @function calculateSurvivalCost
     * @description Calculates the survival cost for a given amount of time.
     * @param {number} minutes - The number of minutes to calculate the cost for.
     * @returns {{satietyCost: number, hydrationCost: number}} The survival cost.
     */
    calculateSurvivalCost: (minutes) => {
        let satietyDecay = 3.0; 
        let hydrationDecay = 4.5;
        
        const satietyCost = (minutes / 60) * satietyDecay;
        const hydrationCost = (minutes / 60) * hydrationDecay;
        
        return { satietyCost, hydrationCost };
    },

    /**
     * @function updateSurvivalStats
     * @description Updates the character's survival stats based on time passed and weather.
     * @param {number} minutes - The number of minutes that have passed.
     * @param {WeatherType} weather - The current weather.
     */
    updateSurvivalStats: (minutes, weather) => {
        const { setGameOver, addJournalEntry } = useGameStore.getState();
        const currentState = get();
        if (currentState.hp.current <= 0) return;

        let satietyDecay = 3.0;
        let hydrationDecay = 4.5;

        if (weather === WeatherType.TEMPESTA) {
            hydrationDecay *= 1.5;
        }

        const satietyLoss = (minutes / 60) * satietyDecay;
        const hydrationLoss = (minutes / 60) * hydrationDecay;

        const newSatiety = Math.max(0, currentState.satiety.current - satietyLoss);
        const newHydration = Math.max(0, currentState.hydration.current - hydrationLoss);

        let hpLossFromSurvival = 0;
        if (newSatiety === 0) hpLossFromSurvival += (minutes / 60) * 2;
        if (newHydration === 0) hpLossFromSurvival += (minutes / 60) * 3;

        let hpLossFromStatus = 0;
        let deathCause: DeathCause | null = null;

        if (currentState.status.has('AVVELENATO')) {
            const damage = (minutes / 60) * 2;
            hpLossFromStatus += damage;
            deathCause = 'POISON';
            addJournalEntry({
                text: `Il tuo stato di AVVELENATO ti consuma... (-${Math.ceil(damage)} HP)`,
                type: JournalEntryType.COMBAT
            });
        }
        if (currentState.status.has('MALATO')) {
            const damage = (minutes / 60) * 0.5;
            hpLossFromStatus += damage;
            deathCause = deathCause || 'SICKNESS'; // Don't override poison
            addJournalEntry({
                text: `Il tuo stato di MALATO ti indebolisce... (-${Math.ceil(damage)} HP)`,
                type: JournalEntryType.COMBAT
            });
        }
        
        if (hpLossFromSurvival > 0) {
            deathCause = deathCause || (newSatiety === 0 ? 'STARVATION' : 'DEHYDRATION');
        }

        const totalHpLoss = hpLossFromSurvival + hpLossFromStatus;
        const newHp = Math.max(0, currentState.hp.current - totalHpLoss);

        if (newHp <= 0 && currentState.hp.current > 0) {
            setGameOver(deathCause || 'UNKNOWN');
        }

        set({
            satiety: { ...currentState.satiety, current: newSatiety },
            hydration: { ...currentState.hydration, current: newHydration },
            hp: { ...currentState.hp, current: newHp }
        });
    },
    
    /**
     * @function heal
     * @description Heals the character.
     * @param {number} amount - The amount to heal.
     */
    heal: (amount) => {
        set(state => ({
            hp: { ...state.hp, current: Math.min(state.hp.max, state.hp.current + amount) }
        }));
    },
    
    /**
     * @function restoreSatiety
     * @description Restores the character's satiety.
     * @param {number} amount - The amount to restore.
     */
    restoreSatiety: (amount) => {
        set(state => ({
            satiety: { ...state.satiety, current: Math.min(state.satiety.max, state.satiety.current + amount) }
        }));
    },
    
    /**
     * @function restoreHydration
     * @description Restores the character's hydration.
     * @param {number} amount - The amount to restore.
     */
    restoreHydration: (amount) => {
        set(state => ({
            hydration: { ...state.hydration, current: Math.min(state.hydration.max, state.hydration.current + amount) }
        }));
    },
    /**
     * @function changeAlignment
     * @description Changes the character's alignment.
     * @param {'lena' | 'elian'} type - The type of alignment to change.
     * @param {number} amount - The amount to change the alignment by.
     */
    changeAlignment: (type, amount) => {
        const oldAlignment = get().alignment;
        const oldDiff = oldAlignment.lena - oldAlignment.elian;
        
        set(state => ({
            alignment: {
                ...state.alignment,
                [type]: state.alignment[type] + amount,
            }
        }));

        const newAlignment = get().alignment;
        const newDiff = newAlignment.lena - newAlignment.elian;
        const THRESHOLD = 5;
        const { addJournalEntry } = useGameStore.getState();

        // Check for crossing into Lena's territory
        if (oldDiff <= THRESHOLD && newDiff > THRESHOLD) {
            addJournalEntry({ text: "La tua compassione ti guida. Ottieni un bonus a Persuasione e Intuizione.", type: JournalEntryType.XP_GAIN });
        }
        // Check for crossing into Elian's territory
        else if (oldDiff >= -THRESHOLD && newDiff < -THRESHOLD) {
             addJournalEntry({ text: "Il tuo pragmatismo ti tempra. Ottieni un bonus a Sopravvivenza e Intimidire.", type: JournalEntryType.XP_GAIN });
        }
        // Check for returning to neutral from Lena
        else if (oldDiff > THRESHOLD && newDiff <= THRESHOLD) {
             addJournalEntry({ text: "Il tuo percorso è ora più equilibrato. I bonus di allineamento sono svaniti.", type: JournalEntryType.SYSTEM_WARNING });
        }
        // Check for returning to neutral from Elian
        else if (oldDiff < -THRESHOLD && newDiff >= -THRESHOLD) {
             addJournalEntry({ text: "Il tuo percorso è ora più equilibrato. I bonus di allineamento sono svaniti.", type: JournalEntryType.SYSTEM_WARNING });
        }
    },
    /**
     * @function addStatus
     * @description Adds a status condition to the character.
     * @param {PlayerStatusCondition} newStatus - The status condition to add.
     */
    addStatus: (newStatus) => set(state => ({
        status: new Set(state.status).add(newStatus)
    })),
    /**
     * @function removeStatus
     * @description Removes a status condition from the character.
     * @param {PlayerStatusCondition} statusToRemove - The status condition to remove.
     */
    removeStatus: (statusToRemove) => set(state => {
        const newStatus = new Set(state.status);
        newStatus.delete(statusToRemove);
        return { status: newStatus };
    }),
    /**
     * @function boostAttribute
     * @description Boosts an attribute of the character.
     * @param {AttributeName} attribute - The attribute to boost.
     * @param {number} amount - The amount to boost the attribute by.
     */
    boostAttribute: (attribute, amount) => {
        set(state => ({
            attributes: {
                ...state.attributes,
                [attribute]: state.attributes[attribute] + amount,
            }
        }));
    },
    /**
     * @function learnRecipe
     * @description Teaches the character a new recipe.
     * @param {string} recipeId - The ID of the recipe to learn.
     */
    learnRecipe: (recipeId) => {
        set(state => {
            if (state.knownRecipes.includes(recipeId)) {
                useGameStore.getState().addJournalEntry({
                    text: "Hai già studiato questo schema.",
                    type: JournalEntryType.SYSTEM_WARNING,
                });
                return {};
            }
            const recipe = useRecipeDatabaseStore.getState().recipes.find(r => r.id === recipeId);
            if (recipe) {
                useGameStore.getState().addJournalEntry({
                    text: `Hai imparato una nuova ricetta: ${recipe.name}!`,
                    type: JournalEntryType.XP_GAIN,
                });
                return { knownRecipes: [...state.knownRecipes, recipeId] };
            }
            return {};
        });
    },
    /**
     * @function getPlayerAC
     * @description Gets the player's armor class.
     * @returns {number} The player's armor class.
     */
    getPlayerAC: () => {
        const { getAttributeModifier, equippedArmor, inventory } = get();
        const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
        const dexMod = getAttributeModifier('des');
        
        const armorItem = equippedArmor !== null ? inventory[equippedArmor] : null;
        if (!armorItem) return 10 + dexMod;

        const isBroken = armorItem.durability && armorItem.durability.current <= 0;
        if(isBroken) return 10 + dexMod;

        const armorDetails = itemDatabase[armorItem.itemId];
        const armorBonus = armorDetails?.defense || 0;
        return 10 + dexMod + armorBonus;
    },
    /**
     * @function unlockTrophy
     * @description Unlocks a trophy for the character.
     * @param {string} trophyId - The ID of the trophy to unlock.
     */
    unlockTrophy: (trophyId: string) => {
        set(state => {
            if (state.unlockedTrophies.has(trophyId)) {
                return {}; // Already unlocked, do nothing
            }
            
            const { trophies } = useTrophyDatabaseStore.getState();
            const trophy = trophies.find(t => t.id === trophyId);
            
            if (trophy) {
                audioManager.playSound('level_up');
                useGameStore.getState().addJournalEntry({
                    text: `Trofeo sbloccato: ${trophy.name}!`,
                    type: JournalEntryType.TROPHY_UNLOCKED
                });
            }

            const newTrophies = new Set(state.unlockedTrophies);
            newTrophies.add(trophyId);
            return { unlockedTrophies: newTrophies };
        });
    },
    /**
     * @function restoreState
     * @description Restores the character's state from a saved state.
     * @param {CharacterState} newState - The state to restore.
     */
    restoreState: (newState) => {
        set(newState);
    }
}));