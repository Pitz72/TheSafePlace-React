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

/**
 * Base value for survival stats (satiety, hydration, fatigue).
 * @constant {number}
 */
const BASE_STAT_VALUE = 100;

/**
 * Initial attribute values for a new character.
 * All attributes start at 10 (modifier +0).
 * @constant {Attributes}
 */
const initialAttributes: Attributes = {
  for: 10,
  des: 10,
  cos: 10,
  int: 10,
  sag: 10,
  car: 10,
};

/**
 * Initial skills record with all skills set to non-proficient.
 * Created dynamically from SKILLS constant to ensure consistency.
 * @constant {Record<SkillName, Skill>}
 */
const initialSkills: Record<SkillName, Skill> = Object.keys(SKILLS).reduce((acc, skill) => {
  acc[skill as SkillName] = { proficient: false };
  return acc;
}, {} as Record<SkillName, Skill>);

/**
 * Initial alignment values (neutral).
 * @constant {Alignment}
 */
const initialAlignment: Alignment = {
    lena: 0,
    elian: 0,
};

/**
 * Character Store - Player character state management
 *
 * @description Manages all aspects of the player character including:
 * - Level, XP, and progression
 * - HP, satiety, hydration, fatigue (survival stats)
 * - Attributes (FOR, DES, COS, INT, SAG, CAR)
 * - Skills (18 total, proficiency-based)
 * - Inventory and equipment (weapon, head, chest, legs)
 * - Status conditions (FERITO, MALATO, AVVELENATO, etc.)
 * - Alignment (Lena vs Elian moral compass)
 * - Talents and recipes
 * - Trophy system
 *
 * @remarks
 * This is the most complex store in the game, handling character progression,
 * survival mechanics, equipment management, and status effects.
 *
 * Architecture:
 * - Integrates with gameStore for journal entries and game state
 * - Integrates with itemDatabase for item details
 * - Integrates with globalTrophyService for persistent achievements
 * - Uses D&D 5e-inspired mechanics (d20, modifiers, proficiency)
 */
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
    activeQuests: {},
    completedQuests: [],

    // --- Actions ---
    /**
     * Initializes a new character with default starting values and equipment.
     *
     * @description Sets up a fresh character for a new game with:
     * - Level 1, 100 HP (base for 10 CON)
     * - All attributes at 10 (modifier +0)
     * - Starting proficiencies: Sopravvivenza, Medicina, Furtività
     * - Survival starter kit (food, water, bandages, crafting materials)
     * - 5 known recipes (water purification, basic repairs, bandages)
     * - Global trophies loaded from localStorage
     *
     * Starting Inventory (10 items):
     * - 1x Carillon Annerito (quest item)
     * - 2x Razione Cibo
     * - 2x Bottiglia Acqua
     * - 3x Benda di Fortuna
     * - 3x Metallo di Scarto
     * - 3x Straccio Pulito
     * - 2x Bottiglia Vuota
     *
     * Starting Recipes (5):
     * - Purifica Acqua
     * - Benda di Fortuna
     * - Raccogli Acqua
     * - Coltello di Fortuna
     * - Kit Riparazione Base
     *
     * @remarks
     * - Called when starting a new game
     * - Loads global trophies from localStorage (persistent across games)
     * - Starting proficiencies allow talent choices at level 2
     * - Starter kit designed for v1.3.0 survival overhaul
     *
     * @see loadGlobalTrophies for trophy persistence system
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
            activeQuests: {},
            completedQuests: [],
        });
    },

    /**
     * Sets the character's attributes and recalculates derived stats.
     *
     * @description Updates all six attributes (FOR, DES, COS, INT, SAG, CAR) and
     * automatically recalculates max HP based on the new Constitution value.
     *
     * HP Calculation:
     * - Base HP: 100 (for 10 CON)
     * - HP per CON modifier: +10 HP per point
     * - Formula: 100 + (CON_modifier × 10)
     *
     * @param {Attributes} newAttributes - The new attribute values to set
     *
     * @remarks
     * - Called during character creation after rolling stats
     * - Heals character to full HP with new max
     * - CON modifier: floor((CON - 10) / 2)
     * - Example: CON 14 → modifier +2 → 120 max HP
     *
     * @example
     * // After character creation with CON 14
     * setAttributes({ for: 12, des: 10, cos: 14, int: 10, sag: 12, car: 8 });
     * // Result: max HP = 100 + (2 × 10) = 120
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
     * Calculates the D&D 5e-style modifier for a given attribute.
     *
     * @description Converts an attribute value (8-20+) to a modifier (-1 to +5+)
     * using the standard D&D formula: floor((value - 10) / 2)
     *
     * Modifier Table:
     * - 8-9: -1
     * - 10-11: +0
     * - 12-13: +1
     * - 14-15: +2
     * - 16-17: +3
     * - 18-19: +4
     * - 20+: +5+
     *
     * @param {AttributeName} attribute - The attribute to calculate modifier for
     * @returns {number} The modifier value (typically -1 to +5)
     *
     * @remarks
     * - Used in skill checks, AC calculation, HP calculation
     * - Formula matches D&D 5e exactly
     * - Negative modifiers possible if attribute < 10
     *
     * @example
     * // Character with FOR 14
     * const forMod = getAttributeModifier('for'); // Returns +2
     * // Used in melee damage: weaponDamage + forMod
     */
    getAttributeModifier: (attribute) => {
        const value = get().attributes[attribute];
        return Math.floor((value - 10) / 2);
    },

    /**
     * Calculates the total bonus for a skill check.
     *
     * @description Computes the complete skill bonus by combining:
     * 1. Attribute modifier (based on skill's governing attribute)
     * 2. Proficiency bonus (if proficient in the skill)
     * 3. Alignment bonus (Lena/Elian moral compass)
     * 4. Encumbrance penalty (when overloaded) - NEW
     * 5. Status penalties (negative conditions)
     * 6. Fatigue penalty (exhaustion)
     *
     * Bonus Components:
     * - Attribute Modifier: floor((attribute - 10) / 2)
     * - Proficiency Bonus: floor((level - 1) / 4) + 2 (if proficient)
     * - Alignment Bonus: +2 for specific skills if alignment > 5
     * - Encumbrance Penalty: -2 to Atletica/Acrobazia if overencumbered
     * - Status Penalties: -1 to -3 depending on condition
     * - Fatigue Penalty: -1 (fatigue > 50) or -2 (fatigue > 75)
     *
     * @param {SkillName} skill - The skill to calculate bonus for
     * @returns {number} The total skill bonus (can be negative)
     *
     * @remarks
     * Alignment Bonuses:
     * - Lena (+5): +2 to Persuasione, Intuizione
     * - Elian (+5): +2 to Sopravvivenza, Intimidire
     *
     * Encumbrance Penalty (NEW):
     * - When totalWeight > maxCarryWeight
     * - Affects: Atletica, Acrobazia (-2)
     * - Makes climbing, dodging, fleeing harder when overloaded
     *
     * Status Penalties:
     * - FERITO: -2 to physical skills
     * - IPOTERMIA: -3 to all skills
     * - ESAUSTO: -2 to physical skills
     * - AFFAMATO: -1 to all skills
     * - DISIDRATATO: -2 to perception/intelligence skills
     * - INFEZIONE: -2 to all skills
     *
     * @example
     * // Level 3, proficient Sopravvivenza, SAG 14, overencumbered
     * const bonus = getSkillBonus('sopravvivenza');
     * // = +2 (SAG) + 2 (prof) + 0 (encumbrance doesn't affect this skill) = +4
     *
     * const atleticaBonus = getSkillBonus('atletica');
     * // = +1 (FOR) + 0 (not prof) - 2 (encumbrance) = -1
     *
     * @see performSkillCheck for how this bonus is used in d20 rolls
     * @see getMaxCarryWeight for capacity calculation
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
        
        // --- Encumbrance Penalty (NEW) ---
        // When overencumbered, physical skills suffer
        let encumbrancePenalty = 0;
        const totalWeight = get().getTotalWeight();
        const maxCarryWeight = get().getMaxCarryWeight();
        const isOverEncumbered = totalWeight > maxCarryWeight;
        
        if (isOverEncumbered) {
            const physicalSkills: SkillName[] = ['atletica', 'acrobazia'];
            if (physicalSkills.includes(skill)) {
                encumbrancePenalty = -2; // Heavy load makes climbing/dodging harder
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

        return attributeModifier + proficiencyBonus + alignmentBonus + statusPenalty + fatiguePenalty + encumbrancePenalty;
    },

    /**
     * Performs a d20 skill check against a difficulty class.
     *
     * @description Rolls 1d20, adds skill bonus, and compares to DC.
     * This is the core mechanic for all skill-based actions in the game.
     *
     * Skill Check Formula:
     * - Roll: 1d20 (random 1-20)
     * - Bonus: getSkillBonus(skill)
     * - Total: roll + bonus
     * - Success: total >= DC
     *
     * Difficulty Classes (DC):
     * - Very Easy: 5
     * - Easy: 10
     * - Medium: 12-13
     * - Hard: 15-16
     * - Very Hard: 18-20
     * - Nearly Impossible: 25+
     *
     * @param {SkillName} skill - The skill to check (e.g., 'sopravvivenza', 'atletica')
     * @param {number} dc - The difficulty class to beat
     * @returns {SkillCheckResult} Complete result object with roll, bonus, total, and success
     *
     * @remarks
     * - Natural 1 (roll = 1) is NOT automatic failure
     * - Natural 20 (roll = 20) is NOT automatic success
     * - Success determined purely by total >= DC
     * - Result object includes all details for journal logging
     *
     * @example
     * // Attempt to climb a wall (Atletica DC 12)
     * const result = performSkillCheck('atletica', 12);
     * if (result.success) {
     *   console.log(`Success! Rolled ${result.roll} + ${result.bonus} = ${result.total}`);
     * }
     *
     * @see getSkillBonus for bonus calculation details
     */
    performSkillCheck: (skill, dc) => {
        const roll = Math.floor(Math.random() * 20) + 1;
        const bonus = get().getSkillBonus(skill);
        const total = roll + bonus;
        const success = total >= dc;
        return { skill, roll, bonus, total, dc, success };
    },

    /**
     * Grants exploration XP for taking a step on the map.
     *
     * @description Awards 3 XP per step (v1.2.0: increased from 1 XP for better progression).
     *
     * @remarks
     * - Called automatically after each successful movement
     * - v1.2.0 balance: 1 XP → 3 XP (+200%)
     * - Allows reaching level 6-8 by endgame instead of 2-3
     *
     * @see addXp for XP addition logic
     */
    gainExplorationXp: () => {
        get().addXp(3);
    },

    /**
     * Adds experience points and checks for level up eligibility.
     *
     * @description Accumulates XP and sets levelUpPending flag when threshold reached.
     * Allows XP overflow for multiple level ups.
     *
     * @param {number} amount - XP to add (typically 3-120)
     *
     * @remarks
     * - XP accumulates even when levelUpPending is true
     * - Player must manually level up (not automatic)
     * - Remaining XP carries over after level up
     * - Can trigger multiple level ups if enough XP
     *
     * @example
     * addXp(60); // After defeating enemy
     *
     * @see applyLevelUp for level up process
     * @see XP_PER_LEVEL for thresholds
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
     * Applies level up choices and advances character to next level.
     *
     * @description Processes player choices (attribute + talent), increases level,
     * grants HP, and checks for cutscenes/story triggers.
     *
     * Level Up Rewards:
     * - Level +1
     * - HP +5 + CON modifier
     * - Full heal to new max HP
     * - +1 to chosen attribute
     * - Unlock chosen talent
     * - XP overflow carries over
     *
     * @param {object} choices - Player's level up choices
     * @param {AttributeName} choices.attribute - Attribute to increase
     * @param {string} choices.talentId - Talent to unlock
     *
     * @remarks
     * Special Triggers:
     * - Level 5: CS_STRANGERS_REFLECTION cutscene (500ms delay)
     * - Checks main story triggers
     * - Checks cutscene triggers
     * - Can chain level ups
     *
     * @example
     * applyLevelUp({ attribute: 'des', talentId: 'guerrilla_fighter' });
     *
     * @see XP_PER_LEVEL for thresholds
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
     * Adds an item to the character's inventory.
     *
     * @description Handles both stackable and non-stackable items correctly.
     * Stackable items merge quantities, non-stackable create separate entries.
     *
     * Item Handling:
     * - Stackable (materials, consumables): Merges with existing stack
     * - Non-stackable (weapons, armor): Creates individual entries
     * - Durability items: Initializes durability to max
     *
     * @param {string} itemId - Item ID from itemDatabase
     * @param {number} [quantity=1] - Quantity to add
     *
     * @remarks
     * - Validates item exists in itemDatabase
     * - Returns early if item not found (no error)
     * - Non-stackable items added as quantity=1 entries
     * - Durability initialized from itemDatabase
     *
     * @example
     * addItem('CONS_002', 3); // Add 3 water bottles (stackable)
     * addItem('WPN_KNIFE_COMBAT', 1); // Add combat knife (non-stackable)
     *
     * @see removeItem for removal logic
     * @see itemDatabase for item definitions
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
        
        // Check quest triggers after adding item (for getItem triggers)
        // Import questService dynamically to avoid circular dependency
        import('../services/questService').then(({ questService }) => {
            questService.checkQuestTriggers(itemId);
        });
    },

    /**
     * Removes an item from inventory and updates equipped indices.
     *
     * @description Removes items by ID, handling stackable/non-stackable correctly.
     * Automatically unequips items if removed and recalculates all equipped indices.
     *
     * Removal Logic:
     * - Stackable: Decreases quantity or removes stack
     * - Non-stackable: Removes from end of inventory (LIFO)
     * - Equipped items: Automatically unequipped if removed
     * - Index shifting: All equipped indices recalculated after removal
     *
     * @param {string} itemId - Item ID to remove
     * @param {number} [quantity=1] - Quantity to remove
     *
     * @remarks
     * Critical Fix (v1.2.3):
     * - Recalculates equipped indices after removal
     * - Prevents equipped items pointing to wrong inventory slots
     * - Handles multiple removals correctly
     *
     * @example
     * removeItem('scrap_metal', 2); // Remove 2 scrap metal
     * // If scrap metal was at index 5 and equipped weapon at index 7
     * // After removal, equipped weapon index becomes 6
     *
     * @see addItem for addition logic
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
     * Discards an item from inventory by index.
     *
     * @description Removes item from specific inventory slot, unequipping if necessary
     * and recalculating equipped indices.
     *
     * @param {number} inventoryIndex - Index of item in inventory array
     * @param {number} [quantity=1] - Quantity to discard
     *
     * @remarks
     * - Automatically unequips if item is equipped
     * - Recalculates all equipped indices after removal
     * - Handles partial quantity removal for stackable items
     * - Used by UI "Scarta" action in inventory screen
     *
     * @example
     * discardItem(5, 1); // Discard 1 item from slot 5
     *
     * @see removeItem for removal by ID
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
     * Equips an item from inventory to appropriate slot.
     *
     * @description Equips weapon or armor to correct slot based on item type.
     * Supports both index-based and ID-based equipping.
     *
     * Equipment Slots:
     * - Weapon: Single slot for any weapon type
     * - Head: Helmet/head armor
     * - Chest: Body armor (default if slot unspecified)
     * - Legs: Leg armor
     *
     * @param {number | string} inventoryIndexOrId - Inventory index OR item ID
     *
     * @remarks
     * ID-based equipping:
     * - Finds first non-broken instance of item
     * - Shows error if all instances broken
     * - Shows error if item not found
     *
     * Validation:
     * - Checks item exists
     * - Checks durability > 0
     * - Determines slot from item.slot property
     * - Defaults to chest for armor without slot
     *
     * @example
     * equipItem(5); // Equip item at index 5
     * equipItem('WPN_KNIFE_COMBAT'); // Equip by ID
     *
     * @see unequipItem for unequipping
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
     * Unequips an item from a specified equipment slot.
     *
     * @description Removes equipped item, returning it to inventory (stays at same index).
     *
     * @param {'weapon' | 'armor' | 'head' | 'chest' | 'legs'} slot - Slot to unequip
     *
     * @remarks
     * - 'armor' and 'chest' are aliases (both unequip chest slot)
     * - Item remains in inventory at same index
     * - Used by UI "Togli" action in inventory screen
     *
     * @example
     * unequipItem('weapon'); // Unequip weapon
     * unequipItem('head'); // Unequip helmet
     *
     * @see equipItem for equipping
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
     * Damages an equipped item's durability.
     *
     * @description Reduces durability of equipped weapon or armor.
     * Automatically unequips if durability reaches 0.
     *
     * @param {'weapon' | 'armor'} slot - Slot of item to damage
     * @param {number} amount - Durability damage (typically 1)
     *
     * @remarks
     * - Called after each attack (weapon) or when hit (armor)
     * - Broken items (durability = 0) auto-unequip
     * - Shows journal message when item breaks
     * - Plays error sound on break
     * - Broken items can be salvaged for materials
     *
     * @example
     * damageEquippedItem('weapon', 1); // After attack
     * damageEquippedItem('armor', 1); // After being hit
     *
     * @see repairItem for repairing
     * @see salvageItem for salvaging broken items
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
     * Repairs an item's durability using a repair kit.
     *
     * @description Restores durability up to item's maximum.
     *
     * @param {number} inventoryIndex - Index of item to repair
     * @param {number} amount - Durability to restore (25 for basic kit, 75 for advanced)
     *
     * @remarks
     * - Cannot exceed max durability
     * - Repair kits consumed on use
     * - Basic kit: +25 durability
     * - Advanced kit: +75 durability
     * - Only works on items with durability property
     *
     * @example
     * repairItem(5, 25); // Repair item at index 5 with basic kit
     * // If durability was 10/50, now 35/50
     *
     * @see damageEquippedItem for durability loss
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
     * Salvages a broken item for crafting materials.
     *
     * @description Dismantles broken item (durability = 0) to recover materials.
     *
     * Material Recovery:
     * - Common/Uncommon items → scrap_metal
     * - Rare/Epic items → scrap_metal_high_quality
     *
     * @param {number} inventoryIndex - Index of broken item
     *
     * @remarks
     * - Only works on broken items (durability = 0)
     * - Returns early if item not broken
     * - Removes item from inventory
     * - Adds material to inventory
     * - Shows journal message with recovered material
     *
     * @example
     * salvageItem(3); // Salvage broken weapon at index 3
     * // Removes weapon, adds scrap_metal
     *
     * @see discardItem for simple removal
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
     * Inflicts damage to the character and handles death/special triggers.
     *
     * @description Reduces HP by damage amount, triggers visual feedback,
     * checks for death, and handles special cutscene triggers.
     *
     * Special Mechanics:
     * - CS_THE_BRINK: Triggers when HP drops below 10% for first time
     *   - Grants permanent +25% to all attributes
     *   - One-time power-up reward
     * - Death: Triggers game over with specified cause
     * - Damage Flash: Visual red flash effect
     *
     * @param {number} amount - Damage amount (will be floored to integer)
     * @param {DeathCause} [cause='UNKNOWN'] - Death cause if fatal
     *
     * @remarks
     * v1.2.4 Fix:
     * - Always rounds damage to ensure HP stays integer
     * - Prevents decimal HP values (was possible before)
     *
     * Death Causes:
     * - COMBAT, STARVATION, DEHYDRATION, SICKNESS, POISON, ENVIRONMENT, UNKNOWN
     *
     * @example
     * takeDamage(15, 'COMBAT'); // Take 15 damage from combat
     * // If HP was 100, now 85
     * // If HP drops to 8/100 (8%), triggers CS_THE_BRINK
     *
     * @see heal for HP restoration
     * @see setGameOver for death handling
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
     * Calculates survival resource costs for a time period (preview only).
     *
     * @description Computes how much satiety/hydration will be consumed.
     * Used for UI preview, not actual stat updates.
     *
     * Decay Rates (per hour):
     * - Satiety: -3.0
     * - Hydration: -4.5
     *
     * @param {number} minutes - Time period to calculate for
     * @returns {{satietyCost: number, hydrationCost: number}} Predicted costs
     *
     * @remarks
     * - Does NOT modify character state
     * - Used for UI display (e.g., "Sleeping will cost X satiety")
     * - Does not account for weather (use updateSurvivalStats for actual)
     * - Does not account for status effects
     *
     * @example
     * const cost = calculateSurvivalCost(480); // 8 hours sleep
     * // Returns: { satietyCost: 24, hydrationCost: 36 }
     *
     * @see updateSurvivalStats for actual stat updates
     */
    calculateSurvivalCost: (minutes) => {
        let satietyDecay = 3.0;
        let hydrationDecay = 4.5;
        
        const satietyCost = (minutes / 60) * satietyDecay;
        const hydrationCost = (minutes / 60) * hydrationDecay;
        
        return { satietyCost, hydrationCost };
    },

    /**
     * Updates all survival stats (satiety, hydration, fatigue, HP) based on time and conditions.
     *
     * @description Core survival system that processes:
     * - Satiety/hydration decay over time
     * - HP loss from starvation/dehydration
     * - HP loss from status conditions
     * - Fatigue accumulation
     * - Auto-application/removal of status conditions
     * - Death from survival failure
     *
     * Decay Rates (per hour):
     * - Satiety: -3.0
     * - Hydration: -4.5 (×1.5 during TEMPESTA)
     * - Fatigue: +1.0 (×2 if overencumbered)
     *
     * HP Loss (per hour):
     * - Satiety = 0: -2 HP
     * - Hydration = 0: -3 HP
     * - AVVELENATO: -2 HP
     * - MALATO: -0.5 HP
     * - IPOTERMIA: -1 HP
     * - INFEZIONE: -1 HP
     *
     * Auto Status Management:
     * - ESAUSTO: Applied at fatigue ≥85, removed at <70
     * - AFFAMATO: Applied at satiety <20, removed at ≥40
     * - DISIDRATATO: Applied at hydration <20, removed at ≥40
     *
     * @param {number} minutes - Time elapsed in minutes
     * @param {WeatherType} weather - Current weather condition
     *
     * @remarks
     * v1.2.4 Fix:
     * - Always rounds HP loss to integer
     * - Prevents decimal HP values
     *
     * Death Priority:
     * 1. Status conditions (POISON, SICKNESS, ENVIRONMENT)
     * 2. Starvation (if satiety = 0)
     * 3. Dehydration (if hydration = 0)
     *
     * @example
     * // After 60 minutes in TEMPESTA
     * updateSurvivalStats(60, WeatherType.TEMPESTA);
     * // Satiety: -3, Hydration: -6.75, Fatigue: +1
     *
     * @see calculateSurvivalCost for cost calculation only
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

        // --- Encumbrance System ---
        // Check if player is overencumbered and apply fatigue penalty
        const totalWeight = get().getTotalWeight();
        const maxCarryWeight = get().getMaxCarryWeight();
        const wasOverEncumbered = currentState.fatigue.current > 0 &&
                                  get().getTotalWeight() > get().getMaxCarryWeight(); // Previous state
        const isOverEncumbered = totalWeight > maxCarryWeight;
        
        let fatigueGain = (minutes / 60) * 1;
        if (isOverEncumbered) {
            fatigueGain *= 2; // Double fatigue gain when overencumbered
        }
        const newFatigue = Math.min(currentState.fatigue.max, currentState.fatigue.current + fatigueGain);
        
        // Journal feedback when encumbrance state changes
        if (!wasOverEncumbered && isOverEncumbered) {
            addJournalEntry({
                text: `[SISTEMA] Sei SOVRACCARICO (${totalWeight.toFixed(1)}/${maxCarryWeight.toFixed(1)} kg). Ti muovi con più fatica.`,
                type: JournalEntryType.SYSTEM_WARNING
            });
        } else if (wasOverEncumbered && !isOverEncumbered) {
            addJournalEntry({
                text: `[SISTEMA] Non sei più sovraccarico. Ti muovi normalmente.`,
                type: JournalEntryType.NARRATIVE
            });
        }

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
     * Heals character's HP.
     *
     * @param {number} amount - HP to restore (rounded up)
     *
     * @remarks
     * - v1.2.4: Rounds up to ensure integer HP
     * - Cannot exceed max HP
     * - Sources: consumables, rest, level up, events
     *
     * @example
     * heal(25); // Restore 25 HP
     *
     * @see takeDamage for HP loss
     */
    heal: (amount) => {
        set(state => ({
            hp: { ...state.hp, current: Math.min(state.hp.max, state.hp.current + Math.ceil(amount)) }
        }));
    },
    
    /**
     * Restores satiety (hunger).
     *
     * @param {number} amount - Satiety to restore (typically 20-50)
     *
     * @remarks
     * - Max: 100
     * - Restoring ≥40 removes AFFAMATO status
     * - Called when consuming food
     *
     * @see updateSurvivalStats for decay
     */
    restoreSatiety: (amount) => {
        set(state => ({
            satiety: { ...state.satiety, current: Math.min(state.satiety.max, state.satiety.current + amount) }
        }));
    },
    
    /**
     * Restores hydration (thirst).
     *
     * @param {number} amount - Hydration to restore (typically 20-50)
     *
     * @remarks
     * - Max: 100
     * - Restoring ≥40 removes DISIDRATATO status
     * - Called when consuming water/drinks
     *
     * @see updateSurvivalStats for decay
     */
    restoreHydration: (amount) => {
        set(state => ({
            hydration: { ...state.hydration, current: Math.min(state.hydration.max, state.hydration.current + amount) }
        }));
    },

    /**
     * Increases fatigue level.
     *
     * @param {number} amount - Fatigue to add (typically 1-10)
     *
     * @remarks
     * - Max: 100
     * - ≥85: ESAUSTO status applied
     * - >75: -2 to physical skills
     * - >50: -1 to physical skills
     *
     * @see rest for reduction
     */
    updateFatigue: (amount) => {
        set(state => ({
            fatigue: { ...state.fatigue, current: Math.min(state.fatigue.max, state.fatigue.current + amount) }
        }));
    },

    /**
     * Reduces fatigue (rest/sleep).
     *
     * @param {number} amount - Fatigue to remove (typically 15-50)
     *
     * @remarks
     * - Min: 0
     * - <70: ESAUSTO status removed
     * - Quick rest: -15
     * - Refuge sleep: -50
     *
     * @see updateFatigue for gain
     */
    rest: (amount) => {
        set(state => ({
            fatigue: { ...state.fatigue, current: Math.max(0, state.fatigue.current - amount) }
        }));
    },
    /**
     * Changes character's moral alignment and triggers related cutscenes/bonuses.
     *
     * @description Adjusts Lena (compassion) or Elian (pragmatism) alignment values
     * and provides feedback when crossing thresholds.
     *
     * Alignment System:
     * - Lena: Compassionate choices (+value)
     * - Elian: Pragmatic choices (+value)
     * - Threshold: ±5 difference triggers bonuses
     *
     * Bonuses (when |difference| > 5):
     * - Lena Dominant: +2 Persuasione, +2 Intuizione
     * - Elian Dominant: +2 Sopravvivenza, +2 Intimidire
     *
     * Special Triggers:
     * - CS_THE_WEIGHT_OF_CHOICE: First significant choice (±3+)
     *
     * @param {'lena' | 'elian'} type - Alignment type to increase
     * @param {number} amount - Amount to add (typically 1-5)
     *
     * @remarks
     * - Tracks threshold crossings (neutral ↔ aligned)
     * - Provides journal feedback on bonus gain/loss
     * - Cutscene triggered with 1000ms delay
     * - Bonuses apply immediately to skill checks
     *
     * @example
     * changeAlignment('lena', 3); // Compassionate choice
     * // If this crosses threshold (+5), grants skill bonuses
     *
     * @see getSkillBonus for how alignment affects skills
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
     * Adds a negative status condition.
     *
     * @param {PlayerStatusCondition} newStatus - Status to apply
     *
     * @remarks
     * Status Effects:
     * - FERITO: -2 physical skills
     * - MALATO: -0.5 HP/hour
     * - AVVELENATO: -2 HP/hour
     * - IPOTERMIA: -1 HP/hour, -3 all skills
     * - ESAUSTO: -2 physical skills, +5min movement
     * - AFFAMATO: -1 all skills
     * - DISIDRATATO: -2 perception/intelligence
     * - INFEZIONE: -1 HP/hour, -2 all skills
     *
     * @see removeStatus for curing
     */
    addStatus: (newStatus) => set(state => ({
        status: new Set(state.status).add(newStatus)
    })),

    /**
     * Removes a status condition (cure).
     *
     * @param {PlayerStatusCondition} statusToRemove - Status to remove
     *
     * @remarks
     * - Called when using curative items
     * - Some auto-remove when stats improve
     * - Idempotent (safe if status not present)
     *
     * @see addStatus for application
     */
    removeStatus: (statusToRemove) => set(state => {
        const newStatus = new Set(state.status);
        newStatus.delete(statusToRemove);
        return { status: newStatus };
    }),

    /**
     * Permanently increases an attribute.
     *
     * @param {AttributeName} attribute - Attribute to boost
     * @param {number} amount - Amount to increase (typically 1-3)
     *
     * @remarks
     * - Permanent (not temporary buff)
     * - Used by CS_THE_BRINK (+25% all attributes)
     * - Used by special events
     * - Affects derived stats (HP, AC, skills)
     *
     * @see applyLevelUp for normal increases
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
     * Teaches a new crafting recipe.
     *
     * @param {string} recipeId - Recipe ID from recipeDatabase
     *
     * @remarks
     * - Checks if already known
     * - Shows journal message
     * - Recipes found via crafting manuals
     * - Starting recipes: 5 (water, bandages, knife, repairs)
     *
     * @example
     * learnRecipe('recipe_arrows'); // Learn arrow crafting
     *
     * @see recipeDatabase for all recipes
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
     * Calculates the player's total Armor Class (AC).
     *
     * @description Computes AC by summing base AC, DEX modifier, and all equipped armor.
     *
     * AC Formula:
     * - Base AC: 10
     * - DEX Modifier: floor((DES - 10) / 2)
     * - Armor Bonus: Sum of all equipped armor defense values
     * - Total: 10 + DEX_mod + armor_bonus
     *
     * Armor Slots Checked:
     * - Chest (equippedArmor)
     * - Head (equippedHead)
     * - Legs (equippedLegs)
     *
     * @returns {number} Total armor class (typically 10-25)
     *
     * @remarks
     * - Broken armor (durability = 0) provides no defense
     * - All three armor slots contribute independently
     * - Higher AC = harder to hit in combat
     * - Used by combat system for attack rolls
     *
     * @example
     * // Character: DES 14 (+2), Leather Chest (5), Combat Helmet (8)
     * const ac = getPlayerAC();
     * // = 10 + 2 + 5 + 8 = 25
     *
     * @see combatStore for how AC is used in combat
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
     * Unlocks a trophy and persists it globally across all games.
     *
     * @description Adds trophy to character's unlocked set and saves to global
     * localStorage for permanent persistence.
     *
     * Trophy System (v1.2.1):
     * - 50 total trophies
     * - Persistent across games (global localStorage)
     * - Never lost, even if save deleted
     * - Merge with save file trophies on load
     *
     * @param {string} trophyId - Trophy ID from trophyDatabase
     *
     * @remarks
     * - Checks if already unlocked (idempotent)
     * - Plays level_up sound on unlock
     * - Adds journal entry with trophy name
     * - Immediately saves to global storage
     * - Global trophies survive game resets
     *
     * @example
     * unlockTrophy('trophy_mq_1'); // Unlock main story chapter 1
     * // Trophy saved to localStorage: 'tspc_global_trophies'
     * // Persists even if all save slots deleted
     *
     * @see addGlobalTrophy for persistence mechanism
     * @see loadGlobalTrophies for loading on new game
     * @see mergeWithGlobalTrophies for save/load merge
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
     * Restores character state (low-level).
     *
     * @param {Partial<CharacterState>} newState - State to restore
     *
     * @warning No validation. Use fromJSON() for safe deserialization.
     * @internal
     */
    restoreState: (newState) => {
        set(newState);
    },

    /**
     * Serializes character state to JSON.
     *
     * @returns {object} JSON-serializable state
     *
     * @remarks
     * - Converts Set → Array (status, trophies)
     * - Compatible with save system v2.0.0
     *
     * @see fromJSON for deserialization
     */
    toJSON: () => {
        const state = get();
        return {
            ...state,
            status: Array.from(state.status),
            unlockedTrophies: Array.from(state.unlockedTrophies),
            activeQuests: state.activeQuests,
            completedQuests: state.completedQuests,
        };
    },

    /**
     * Deserializes character state from JSON.
     *
     * @param {any} json - JSON from save file
     *
     * @remarks
     * Trophy Merge (v1.2.1):
     * - Merges save trophies with global trophies
     * - Union of both sets (never lose trophies)
     * - Global trophies persist even if save deleted
     *
     * @see toJSON for serialization
     * @see mergeWithGlobalTrophies for merge logic
     */
    fromJSON: (json) => {
        const saveTrophies = new Set<string>(json.unlockedTrophies || []);
        const mergedTrophies = mergeWithGlobalTrophies(saveTrophies);
        
        set({
            ...json,
            status: new Set(json.status),
            unlockedTrophies: mergedTrophies,
            activeQuests: json.activeQuests || {},
            completedQuests: json.completedQuests || [],
        });
    },

    /**
     * Calculates total inventory weight.
     *
     * @returns {number} Total weight in kg
     *
     * @remarks
     * - Sums weight × quantity for all items
     * - Used for encumbrance check
     * - Overencumbered: weight > maxCarryWeight → fatigue ×2
     *
     * @see getMaxCarryWeight for limit
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
     * Calculates maximum carry weight based on Strength.
     *
     * @returns {number} Max weight in kg
     *
     * @description Determines how much weight the character can carry before
     * becoming encumbered. Based on Strength attribute with modifier scaling.
     *
     * Formula: 15 + (FOR_modifier × 2)
     *
     * Examples:
     * - FOR 8 (-1 mod): 15 + (-1 × 2) = 13kg
     * - FOR 10 (+0 mod): 15 + (0 × 2) = 15kg
     * - FOR 14 (+2 mod): 15 + (2 × 2) = 19kg
     * - FOR 18 (+4 mod): 15 + (4 × 2) = 23kg
     *
     * @remarks
     * Encumbrance Effects (when totalWeight > maxCarryWeight):
     * - Fatigue gain ×2
     * - -2 to Atletica and Acrobazia skill checks
     * - Status "SOVRACCARICO" displayed in UI
     * - Red warning in inventory panel
     *
     * Capacity Modifiers:
     * - Upgraded backpack: +5kg (future implementation)
     * - Military backpack: +10kg (future implementation)
     *
     * @see getTotalWeight for current weight
     * @see getSkillBonus for skill penalty application
     */
    getMaxCarryWeight: () => {
        const { attributes, inventory } = get();
        const forModifier = Math.floor((attributes.for - 10) / 2);
        let baseCapacity = 15 + (forModifier * 2);
        
        // Check for backpack upgrades (future: zaini che aumentano capacità)
        const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
        const hasUpgradedBackpack = inventory.some(item => {
            const details = itemDatabase[item.itemId];
            return details?.id === 'tool_upgraded_backpack'; // Future item
        });
        
        if (hasUpgradedBackpack) {
            baseCapacity += 5; // Upgraded backpack adds 5kg capacity
        }
        
        return baseCapacity;
    }
}));