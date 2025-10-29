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
  GameState,
} from '../types';
import { SKILLS, XP_PER_LEVEL } from '../constants';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useGameStore } from './gameStore';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { audioManager } from '../utils/audio';
import { useTrophyDatabaseStore } from '../data/trophyDatabase';
import { addGlobalTrophy, loadGlobalTrophies, mergeWithGlobalTrophies } from '../services/globalTrophyService';

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
    fatigue: { current: 0, max: 100 },
    attributes: { ...initialAttributes },
    skills: { ...initialSkills },
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    equippedHead: null,
    equippedLegs: null,
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

        // Carica i trofei globali all'inizio di una nuova partita
        const globalTrophies = loadGlobalTrophies();

        set({
            level: 1,
            xp: { current: 0, next: XP_PER_LEVEL[2] },
            attributes: { ...initialAttributes },
            hp: { current: maxHp, max: maxHp },
            satiety: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
            hydration: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
            fatigue: { current: 0, max: 100 },
            skills: newSkills,
            alignment: { ...initialAlignment },
            // FIX: Explicitly type new Set() to avoid it being inferred as Set<unknown>.
            status: new Set<PlayerStatusCondition>(),
            levelUpPending: false,
            inventory: [
                { itemId: 'carillon_annerito', quantity: 1 },
                // Survival starter kit
                { itemId: 'CONS_001', quantity: 2 }, // 2 razioni cibo
                { itemId: 'CONS_002', quantity: 2 }, // 2 bottiglie acqua
                { itemId: 'MED_BANDAGE_BASIC', quantity: 3 }, // 3 bende di fortuna
                // Crafting materials
                { itemId: 'scrap_metal', quantity: 3 },
                { itemId: 'clean_cloth', quantity: 3 },
                { itemId: 'bottle_empty', quantity: 2 }
            ],
            equippedWeapon: null,
            equippedArmor: null,
            equippedHead: null,
            equippedLegs: null,
            knownRecipes: [
                'recipe_purify_water',
                'recipe_makeshift_bandage', 
                'recipe_collect_water',
                'recipe_makeshift_knife', 
                'recipe_repair_kit_basic'
            ],
            unlockedTalents: [],
            unlockedTrophies: globalTrophies, // Inizia con i trofei globali
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
        
        const { alignment, level, skills, status, fatigue } = get();
        const attributeModifier = get().getAttributeModifier(skillDef.attribute);
        const proficiencyBonus = skills[skill].proficient ? Math.floor((level - 1) / 4) + 2 : 0;
        
        // --- Fatigue Penalty ---
        let fatiguePenalty = 0;
        if (fatigue.current > 75) {
            fatiguePenalty = -2;
        } else if (fatigue.current > 50) {
            fatiguePenalty = -1;
        }

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
        const physicalSkills: SkillName[] = ['atletica', 'acrobazia', 'furtivita', 'rapiditaDiMano'];
        const perceptionSkills: SkillName[] = ['percezione', 'intuizione', 'medicina', 'sopravvivenza', 'addestrareAnimali'];
        const intelligenceSkills: SkillName[] = ['arcanismo', 'storia', 'investigare', 'natura', 'religione'];
        
        if (status.has('FERITO') && physicalSkills.includes(skill)) {
            statusPenalty -= 2;
        }
        if (status.has('IPOTERMIA')) {
            statusPenalty -= 3;
        }
        if (status.has('ESAUSTO') && physicalSkills.includes(skill)) {
            statusPenalty -= 2;
        }
        if (status.has('AFFAMATO')) {
            statusPenalty -= 1;
        }
        if (status.has('DISIDRATATO')) {
            if (perceptionSkills.includes(skill) || intelligenceSkills.includes(skill)) {
                statusPenalty -= 2;
            }
        }
        if (status.has('INFEZIONE')) {
            statusPenalty -= 2;
        }

        return attributeModifier + proficiencyBonus + alignmentBonus + statusPenalty + fatiguePenalty;
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
     * v1.2.0: Increased from 1 to 3 XP per step for better progression
     */
    gainExplorationXp: () => {
        get().addXp(3);
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
                const gameStore = useGameStore.getState();
                gameStore.checkMainStoryTriggers();
                gameStore.checkCutsceneTriggers();
                
                // CS_STRANGERS_REFLECTION trigger: Reaching level 5 (mid-game)
                if (newLevel === 5 && !gameStore.gameFlags.has('STRANGERS_REFLECTION_PLAYED')) {
                    useGameStore.setState(state => ({ 
                        gameFlags: new Set(state.gameFlags).add('STRANGERS_REFLECTION_PLAYED') 
                    }));
                    setTimeout(() => {
                        if (useGameStore.getState().gameState === GameState.IN_GAME) {
                            useGameStore.getState().startCutscene('CS_STRANGERS_REFLECTION');
                        }
                    }, 500);
                }
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
            let removedIndices: number[] = [];
            
            let newEquippedWeapon = state.equippedWeapon;
            let newEquippedArmor = state.equippedArmor;
            let newEquippedHead = state.equippedHead;
            let newEquippedLegs = state.equippedLegs;
    
            if (itemDetails.stackable) {
                const itemIndex = newInventory.findIndex(i => i.itemId === itemId);
                if (itemIndex > -1) {
                    if (newInventory[itemIndex].quantity > remainingToRemove) {
                        newInventory[itemIndex].quantity -= remainingToRemove;
                    } else {
                        newInventory.splice(itemIndex, 1);
                        removedIndices.push(itemIndex);
                    }
                }
            } else {
                // For non-stackable, remove one by one from the end
                for (let i = newInventory.length - 1; i >= 0; i--) {
                    if (remainingToRemove > 0 && newInventory[i].itemId === itemId) {
                        newInventory.splice(i, 1);
                        removedIndices.push(i);
                        remainingToRemove--;
                    }
                }
            }
            
            // FIX: Recalculate equipped indices after removing items
            removedIndices.sort((a, b) => a - b); // Sort in ascending order
            for (const removedIndex of removedIndices) {
                if (newEquippedWeapon !== null) {
                    if (newEquippedWeapon === removedIndex) {
                        newEquippedWeapon = null;
                    } else if (newEquippedWeapon > removedIndex) {
                        newEquippedWeapon--;
                    }
                }
                if (newEquippedArmor !== null) {
                    if (newEquippedArmor === removedIndex) {
                        newEquippedArmor = null;
                    } else if (newEquippedArmor > removedIndex) {
                        newEquippedArmor--;
                    }
                }
                if (newEquippedHead !== null) {
                    if (newEquippedHead === removedIndex) {
                        newEquippedHead = null;
                    } else if (newEquippedHead > removedIndex) {
                        newEquippedHead--;
                    }
                }
                if (newEquippedLegs !== null) {
                    if (newEquippedLegs === removedIndex) {
                        newEquippedLegs = null;
                    } else if (newEquippedLegs > removedIndex) {
                        newEquippedLegs--;
                    }
                }
            }
            
            return { 
                inventory: newInventory,
                equippedWeapon: newEquippedWeapon,
                equippedArmor: newEquippedArmor,
                equippedHead: newEquippedHead,
                equippedLegs: newEquippedLegs
            };
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
            const isEquipped = state.equippedWeapon === inventoryIndex || 
                             state.equippedArmor === inventoryIndex ||
                             state.equippedHead === inventoryIndex ||
                             state.equippedLegs === inventoryIndex;
            
            let newEquippedWeapon = state.equippedWeapon;
            let newEquippedArmor = state.equippedArmor;
            let newEquippedHead = state.equippedHead;
            let newEquippedLegs = state.equippedLegs;
            
            if (isEquipped) {
                 if(state.equippedWeapon === inventoryIndex) newEquippedWeapon = null;
                 if(state.equippedArmor === inventoryIndex) newEquippedArmor = null;
                 if(state.equippedHead === inventoryIndex) newEquippedHead = null;
                 if(state.equippedLegs === inventoryIndex) newEquippedLegs = null;
            }
            
            if (newInventory[inventoryIndex].quantity > quantity) {
                newInventory[inventoryIndex].quantity -= quantity;
            } else {
                newInventory.splice(inventoryIndex, 1);
                // After removing an item, equipped indices might shift
                if (newEquippedWeapon !== null && newEquippedWeapon > inventoryIndex) newEquippedWeapon--;
                if (newEquippedArmor !== null && newEquippedArmor > inventoryIndex) newEquippedArmor--;
                if (newEquippedHead !== null && newEquippedHead > inventoryIndex) newEquippedHead--;
                if (newEquippedLegs !== null && newEquippedLegs > inventoryIndex) newEquippedLegs--;
            }

            return { 
                inventory: newInventory, 
                equippedWeapon: newEquippedWeapon, 
                equippedArmor: newEquippedArmor,
                equippedHead: newEquippedHead,
                equippedLegs: newEquippedLegs
            };
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
                // Determine which slot based on armor's slot property
                if (itemDetails.slot === 'chest') {
                    return { equippedArmor: inventoryIndex };
                } else if (itemDetails.slot === 'head') {
                    return { equippedHead: inventoryIndex };
                } else if (itemDetails.slot === 'legs') {
                    return { equippedLegs: inventoryIndex };
                }
                // Default to chest if slot is not specified
                return { equippedArmor: inventoryIndex };
            }
            return {};
        });
    },

    /**
     * @function unequipItem
     * @description Unequips an item from a specified slot.
     * @param {'weapon' | 'armor' | 'head' | 'chest' | 'legs'} slot - The slot to unequip.
     */
    unequipItem: (slot) => {
        set(() => {
            if (slot === 'weapon') return { equippedWeapon: null };
            if (slot === 'armor' || slot === 'chest') return { equippedArmor: null };
            if (slot === 'head') return { equippedHead: null };
            if (slot === 'legs') return { equippedLegs: null };
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
            // FIX v1.2.4: Always round damage to ensure HP remains integer
            const roundedDamage = Math.floor(amount);
            const newHp = Math.max(0, state.hp.current - roundedDamage);
            
            // CS_THE_BRINK trigger: HP drops below 10% for the first time
            const hpPercentage = (newHp / state.hp.max) * 100;
            if (hpPercentage > 0 && hpPercentage < 10 && !useGameStore.getState().gameFlags.has('THE_BRINK_TRIGGERED')) {
                useGameStore.setState(s => ({ 
                    gameFlags: new Set(s.gameFlags).add('THE_BRINK_TRIGGERED') 
                }));
                
                // Trigger cutscene with delay to allow damage to register visually
                setTimeout(() => {
                    if (useGameStore.getState().gameState === GameState.IN_GAME) {
                        useGameStore.getState().startCutscene('CS_THE_BRINK');
                    }
                }, 1000);
                
                // Grant 25% bonus to all attributes as one-time reward
                const bonusedAttributes = { ...state.attributes };
                (Object.keys(bonusedAttributes) as AttributeName[]).forEach(attr => {
                    const bonus = Math.ceil(bonusedAttributes[attr] * 0.25);
                    bonusedAttributes[attr] += bonus;
                });
                
                useGameStore.getState().addJournalEntry({
                    text: "[SOPRAVVISSUTO ALL'ORLO] La tua determinazione ti ha reso più forte! +25% a tutti gli attributi!",
                    type: JournalEntryType.XP_GAIN
                });
                
                return { 
                    hp: { ...state.hp, current: newHp },
                    attributes: bonusedAttributes
                };
            }
            
            if (newHp <= 0 && state.hp.current > 0) {
                useGameStore.getState().setGameOver(cause);
            }
            if (roundedDamage > 0) {
                useGameStore.getState().triggerDamageFlash();
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
            deathCause = deathCause || 'SICKNESS';
            addJournalEntry({
                text: `Il tuo stato di MALATO ti indebolisce... (-${Math.ceil(damage)} HP)`,
                type: JournalEntryType.COMBAT
            });
        }
        if (currentState.status.has('IPOTERMIA')) {
            const damage = (minutes / 60) * 1;
            hpLossFromStatus += damage;
            deathCause = deathCause || 'ENVIRONMENT';
            addJournalEntry({
                text: `L'IPOTERMIA ti gela le ossa... (-${Math.ceil(damage)} HP)`,
                type: JournalEntryType.COMBAT
            });
        }
        if (currentState.status.has('INFEZIONE')) {
            const damage = (minutes / 60) * 1;
            hpLossFromStatus += damage;
            deathCause = deathCause || 'SICKNESS';
            addJournalEntry({
                text: `L'INFEZIONE si diffonde nel tuo corpo... (-${Math.ceil(damage)} HP)`,
                type: JournalEntryType.COMBAT
            });
        }
        
        if (hpLossFromSurvival > 0) {
            deathCause = deathCause || (newSatiety === 0 ? 'STARVATION' : 'DEHYDRATION');
        }

        // FIX v1.2.4: Always round HP loss to ensure HP remains integer
        const totalHpLoss = Math.floor(hpLossFromSurvival + hpLossFromStatus);
        const newHp = Math.max(0, currentState.hp.current - totalHpLoss);

        if (newHp <= 0 && currentState.hp.current > 0) {
            setGameOver(deathCause || 'UNKNOWN');
        }

        let fatigueGain = (minutes / 60) * 1;
        const totalWeight = get().getTotalWeight();
        const maxCarryWeight = get().getMaxCarryWeight();
        if (totalWeight > maxCarryWeight) {
            fatigueGain *= 2;
        }
        const newFatigue = Math.min(currentState.fatigue.max, currentState.fatigue.current + fatigueGain);

        // Auto-apply/remove status conditions based on stats
        const newStatus = new Set(currentState.status);
        
        // ESAUSTO: Fatigue >= 85
        if (newFatigue >= 85 && !newStatus.has('ESAUSTO')) {
            newStatus.add('ESAUSTO');
            addJournalEntry({
                text: `Sei completamente ESAUSTO. La fatica ti opprime.`,
                type: JournalEntryType.SYSTEM_WARNING
            });
        } else if (newFatigue < 70 && newStatus.has('ESAUSTO')) {
            newStatus.delete('ESAUSTO');
            addJournalEntry({
                text: `Ti senti meno esausto. Lo stato ESAUSTO è svanito.`,
                type: JournalEntryType.NARRATIVE
            });
        }
        
        // AFFAMATO: Satiety < 20
        if (newSatiety < 20 && !newStatus.has('AFFAMATO')) {
            newStatus.add('AFFAMATO');
            addJournalEntry({
                text: `La fame ti consuma. Sei AFFAMATO.`,
                type: JournalEntryType.SYSTEM_WARNING
            });
        } else if (newSatiety >= 40 && newStatus.has('AFFAMATO')) {
            newStatus.delete('AFFAMATO');
            addJournalEntry({
                text: `La fame si attenua. Lo stato AFFAMATO è svanito.`,
                type: JournalEntryType.NARRATIVE
            });
        }
        
        // DISIDRATATO: Hydration < 20
        if (newHydration < 20 && !newStatus.has('DISIDRATATO')) {
            newStatus.add('DISIDRATATO');
            addJournalEntry({
                text: `La sete ti tormenta. Sei DISIDRATATO.`,
                type: JournalEntryType.SYSTEM_WARNING
            });
        } else if (newHydration >= 40 && newStatus.has('DISIDRATATO')) {
            newStatus.delete('DISIDRATATO');
            addJournalEntry({
                text: `La sete si placa. Lo stato DISIDRATATO è svanito.`,
                type: JournalEntryType.NARRATIVE
            });
        }

        set({
            satiety: { ...currentState.satiety, current: newSatiety },
            hydration: { ...currentState.hydration, current: newHydration },
            hp: { ...currentState.hp, current: newHp },
            fatigue: { ...currentState.fatigue, current: newFatigue },
            status: newStatus
        });
    },
    
    /**
     * @function heal
     * @description Heals the character.
     * @param {number} amount - The amount to heal.
     */
    heal: (amount) => {
        set(state => ({
            // FIX v1.2.4: Always round healing to ensure HP remains integer
            hp: { ...state.hp, current: Math.min(state.hp.max, state.hp.current + Math.ceil(amount)) }
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
     * @function updateFatigue
     * @description Updates the character's fatigue level.
     * @param {number} amount - The amount to increase fatigue by.
     */
    updateFatigue: (amount) => {
        set(state => ({
            fatigue: { ...state.fatigue, current: Math.min(state.fatigue.max, state.fatigue.current + amount) }
        }));
    },

    /**
     * @function rest
     * @description Reduces the character's fatigue level.
     * @param {number} amount - The amount to decrease fatigue by.
     */
    rest: (amount) => {
        set(state => ({
            fatigue: { ...state.fatigue, current: Math.max(0, state.fatigue.current - amount) }
        }));
    },
    /**
     * @function changeAlignment
     * @description Changes the character's alignment.
     * @param {'lena' | 'elian'} type - The type of alignment to change.
     * @param {number} amount - The amount to change the alignment by.
     */
    changeAlignment: (type, amount) => {
        // CS_THE_WEIGHT_OF_CHOICE trigger: Significant moral choice (±3+)
        if (Math.abs(amount) >= 3 && !useGameStore.getState().gameFlags.has('WEIGHT_OF_CHOICE_PLAYED')) {
            useGameStore.setState(state => ({ 
                gameFlags: new Set(state.gameFlags).add('WEIGHT_OF_CHOICE_PLAYED') 
            }));
            // Delay cutscene to allow current event to complete
            setTimeout(() => {
                if (useGameStore.getState().gameState === GameState.IN_GAME) {
                    useGameStore.getState().startCutscene('CS_THE_WEIGHT_OF_CHOICE');
                }
            }, 1000);
        }
        
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
     * @description Gets the player's armor class, summing defense from all equipped armor slots.
     * @returns {number} The player's armor class.
     */
    getPlayerAC: () => {
        const { getAttributeModifier, equippedArmor, equippedHead, equippedLegs, inventory } = get();
        const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
        const dexMod = getAttributeModifier('des');
        
        let totalArmorBonus = 0;
        
        // Check chest armor
        const chestItem = equippedArmor !== null ? inventory[equippedArmor] : null;
        if (chestItem && (!chestItem.durability || chestItem.durability.current > 0)) {
            const chestDetails = itemDatabase[chestItem.itemId];
            totalArmorBonus += chestDetails?.defense || 0;
        }
        
        // Check head armor
        const headItem = equippedHead !== null ? inventory[equippedHead] : null;
        if (headItem && (!headItem.durability || headItem.durability.current > 0)) {
            const headDetails = itemDatabase[headItem.itemId];
            totalArmorBonus += headDetails?.defense || 0;
        }
        
        // Check legs armor
        const legsItem = equippedLegs !== null ? inventory[equippedLegs] : null;
        if (legsItem && (!legsItem.durability || legsItem.durability.current > 0)) {
            const legsDetails = itemDatabase[legsItem.itemId];
            totalArmorBonus += legsDetails?.defense || 0;
        }
        
        return 10 + dexMod + totalArmorBonus;
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
            
            // Salva immediatamente in localStorage globale
            addGlobalTrophy(trophyId);
            
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
    },

    /**
     * @function toJSON
     * @description Serializes the character's state to a JSON object.
     * @returns {object} The serialized state.
     */
    toJSON: () => {
        const state = get();
        return {
            ...state,
            status: Array.from(state.status),
            unlockedTrophies: Array.from(state.unlockedTrophies),
        };
    },

    /**
     * @function fromJSON
     * @description Deserializes the character's state from a JSON object.
     * @param {object} json - The JSON object to deserialize.
     */
    fromJSON: (json) => {
        // Merge dei trofei del save con quelli globali
        const saveTrophies = new Set<string>(json.unlockedTrophies || []);
        const mergedTrophies = mergeWithGlobalTrophies(saveTrophies);
        
        set({
            ...json,
            status: new Set(json.status),
            unlockedTrophies: mergedTrophies, // Usa il set unificato
        });
    },

    /**
     * @function getTotalWeight
     * @description Calculates the total weight of the character's inventory.
     * @returns {number} The total weight of the inventory.
     */
    getTotalWeight: () => {
        const { inventory } = get();
        const { itemDatabase } = useItemDatabaseStore.getState();
        return inventory.reduce((total, item) => {
            const itemDetails = itemDatabase[item.itemId];
            return total + (itemDetails ? itemDetails.weight * item.quantity : 0);
        }, 0);
    },

    /**
     * @function getMaxCarryWeight
     * @description Calculates the maximum weight the character can carry.
     * @returns {number} The maximum weight the character can carry.
     */
    getMaxCarryWeight: () => {
        const { attributes } = get();
        return attributes.for * 10;
    }
}));