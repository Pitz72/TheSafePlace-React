import { create } from 'zustand';
// FIX: Added GameState and JournalEntryType to imports to use enums instead of strings.
import { CombatState, EnemyTactic, PlayerCombatActionPayload, GameState, JournalEntryType } from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useEnemyDatabaseStore } from '../data/enemyDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { audioManager } from '../utils/audio';
import * as N from '../data/combatNarrative';

/**
 * @interface CombatStoreState
 * @description Represents the state of the combat store.
 * @property {CombatState | null} activeCombat - The currently active combat, or null if no combat is active.
 * @property {(enemyId: string) => void} startCombat - Function to start a new combat.
 * @property {(result: 'win' | 'flee' | 'lose') => void} endCombat - Function to end the current combat.
 * @property {(action: PlayerCombatActionPayload) => void} playerCombatAction - Function to handle a player's combat action.
 * @property {() => void} cleanupCombat - Function to clean up after a combat has ended.
 * @property {() => void} reset - Function to reset the combat store to its initial state.
 */
interface CombatStoreState {
    activeCombat: CombatState | null;
    startCombat: (enemyId: string) => void;
    endCombat: (result: 'win' | 'flee' | 'lose') => void;
    playerCombatAction: (action: PlayerCombatActionPayload) => void;
    cleanupCombat: () => void;
    reset: () => void;
    toJSON: () => object;
    fromJSON: (json: any) => void;
}

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const initialState = {
    activeCombat: null,
};

export const useCombatStore = create<CombatStoreState>((set, get) => ({
    ...initialState,
    /**
     * @function startCombat
     * @description Starts a new combat with a specified enemy.
     * @param {string} enemyId - The ID of the enemy to start combat with.
     */
    startCombat: (enemyId) => {
        const enemy = useEnemyDatabaseStore.getState().enemyDatabase[enemyId];
        if (!enemy) return;
        audioManager.playSound('combat_start');

        const characterState = useCharacterStore.getState();
        const currentBiome = useGameStore.getState().currentBiome;
        let initialHp = enemy.hp;
        let log = [{ text: `Sei stato attaccato da un ${enemy.name}!`, color: '#facc15' }];

        if (characterState.unlockedTalents.includes('guerrilla_fighter') && currentBiome === 'F') {
            const weaponItem = characterState.equippedWeapon !== null ? characterState.inventory[characterState.equippedWeapon] : null;
            const weaponDetails = weaponItem ? useItemDatabaseStore.getState().itemDatabase[weaponItem.itemId] : null;
            const baseDamage = weaponDetails?.damage || 2;
            // v1.9.8: Thrown weapons use DEX like ranged
            const usesDex = weaponDetails?.weaponType === 'ranged' || weaponDetails?.weaponType === 'thrown';
            const damageBonus = characterState.getAttributeModifier(usesDex ? 'des' : 'for');
            const damage = baseDamage + damageBonus;
            initialHp = Math.max(0, initialHp - damage);
            log.push({ text: `[Guerrigliero] Tendi un'imboscata e colpisci per primo! Infliggi ${damage} danni.`, color: '#38bdf8' });
            if(weaponItem) characterState.damageEquippedItem('weapon', 1);
        }

        set({
            activeCombat: {
                enemy: { ...enemy },
                enemyHp: { current: initialHp, max: enemy.hp },
                playerTurn: true,
                log: log,
                revealedTactics: false,
                availableTacticalActions: [],
                victory: false,
                biome: currentBiome, // v1.9.1 - Track biome for environmental actions
                environmentalBonusActive: false,
                environmentalBonusTurns: 0,
                specialAmmoActive: null,
                specialAmmoRounds: 0,
                enemyBurning: false,
                enemyBurningTurns: 0,
                turnCount: 0,
                abilityUsedThisCombat: false
            }
        });
        // FIX: Use GameState enum instead of string.
        useGameStore.getState().setGameState(GameState.COMBAT);
    },
    /**
     * @function endCombat
     * @description Ends the current combat.
     * @param {'win' | 'flee' | 'lose'} result - The result of the combat.
     */
    endCombat: (result) => {
        const { addJournalEntry, setGameState } = useGameStore.getState();
        if (result === 'win') audioManager.playSound('victory');
        // FIX: Use JournalEntryType enum instead of string.
        else if (result === 'flee') addJournalEntry({ text: "Sei fuggito dal combattimento.", type: JournalEntryType.NARRATIVE });
        else if (result === 'lose') {
             useGameStore.getState().setGameOver('COMBAT');
             return; // Game over handles the rest
        }
        set({ activeCombat: null });
        // FIX: Use GameState enum instead of string.
        setGameState(GameState.IN_GAME);
    },
    /**
     * @function cleanupCombat
     * @description Cleans up after a combat has ended.
     */
    cleanupCombat: () => {
        set({ activeCombat: null });
        // FIX: Use GameState enum instead of string.
        useGameStore.getState().setGameState(GameState.IN_GAME);
    },
    /**
     * @function playerCombatAction
     * @description Handles a player's combat action.
     * @param {PlayerCombatActionPayload} action - The action taken by the player.
     */
    playerCombatAction: (action) => {
        const combatState = get().activeCombat;
        if (!combatState || !combatState.playerTurn || combatState.victory) return;

        const { getPlayerAC, performSkillCheck, takeDamage, getAttributeModifier, equippedWeapon, inventory, removeItem, heal, addXp, damageEquippedItem, updateFatigue, unlockedTalents, addItem } = useCharacterStore.getState();
        const { itemDatabase } = useItemDatabaseStore.getState();
        
        updateFatigue(1);

        let newLog = [...combatState.log];
        let newEnemyHp = { ...combatState.enemyHp };
        let newPlayerTurn = false;
        let victory = false;
        
        const addLog = (text: string, color?: string) => newLog.push({ text, color });

        switch (action.type) {
            case 'attack': {
                addLog(getRandom(N.PLAYER_ATTACK_DESCRIPTIONS));
                
                const weaponItem = equippedWeapon !== null ? inventory[equippedWeapon] : null;
                const weaponDetails = weaponItem ? itemDatabase[weaponItem.itemId] : null;

                if (weaponItem && weaponItem.durability && weaponItem.durability.current <= 0) {
                     addLog(`La tua arma è rotta! Non puoi attaccare.`, '#ff8c00');
                } else {
                    const attackRoll = Math.floor(Math.random() * 20) + 1;
                    // v1.9.8: Thrown weapons use DEX like ranged
                    const usesDex = weaponDetails?.weaponType === 'ranged' || weaponDetails?.weaponType === 'thrown';
                    const attackBonus = getAttributeModifier(usesDex ? 'des' : 'for');
                    const totalAttack = attackRoll + attackBonus;
                    
                    // v1.9.1 - Special ammo effects on AC
                    let effectiveEnemyAC = combatState.enemy.ac;
                    if (combatState.specialAmmoActive === 'piercing' && combatState.specialAmmoRounds! > 0) {
                        effectiveEnemyAC = Math.max(10, effectiveEnemyAC - 3); // Ignore 3 AC (min 10)
                        addLog(`[Munizioni Perforanti] Ignori parte dell'armatura nemica!`, '#f59e0b');
                    }
                    
                    addLog(`Tiro per colpire: ${attackRoll} + ${attackBonus} = ${totalAttack} vs CA ${effectiveEnemyAC}`, '#a3a3a3');
                    
                    if (totalAttack >= effectiveEnemyAC) {
                        audioManager.playSound('hit_enemy');
                        const baseDamage = weaponDetails?.damage || 2;
                        // v1.9.8: Thrown weapons use DEX like ranged
                        const usesDex = weaponDetails?.weaponType === 'ranged' || weaponDetails?.weaponType === 'thrown';
                        let damage = baseDamage + getAttributeModifier(usesDex ? 'des' : 'for') + Math.floor(Math.random() * 4) - 2;
                        
                        // v1.9.1 - Special ammo damage effects
                        if (combatState.specialAmmoActive === 'hollow_point' && combatState.specialAmmoRounds! > 0) {
                            const bonusDamage = Math.floor(Math.random() * 4) + 1; // +1d4
                            damage += bonusDamage;
                            addLog(`[Munizioni a Espansione] Danno extra: +${bonusDamage}!`, '#f59e0b');
                        }
                        
                        newEnemyHp.current = Math.max(0, newEnemyHp.current - damage);
                        addLog(`${getRandom(N.PLAYER_HIT_DESCRIPTIONS)} Infliggi ${damage} danni.`, '#60BF77');
                        
                        // v1.9.1 - Incendiary ammo sets enemy on fire
                        if (combatState.specialAmmoActive === 'incendiary' && combatState.specialAmmoRounds! > 0) {
                            set(state => ({
                                activeCombat: {
                                    ...state.activeCombat!,
                                    enemyBurning: true,
                                    enemyBurningTurns: 3
                                }
                            }));
                            addLog(`[Munizioni Incendiarie] Il nemico prende fuoco!`, '#f59e0b');
                        }
                        
                        // Decrement special ammo rounds
                        if (combatState.specialAmmoActive && combatState.specialAmmoRounds! > 0) {
                            const newRounds = combatState.specialAmmoRounds! - 1;
                            set(state => ({
                                activeCombat: {
                                    ...state.activeCombat!,
                                    specialAmmoRounds: newRounds,
                                    specialAmmoActive: newRounds > 0 ? state.activeCombat!.specialAmmoActive : null
                                }
                            }));
                            if (newRounds === 0) {
                                addLog(`Munizioni speciali esaurite.`, '#a3a3a3');
                            }
                        }
                    } else {
                        addLog(getRandom(N.PLAYER_MISS_DESCRIPTIONS), '#ff8c00');
                    }
                }
                 if(weaponItem) damageEquippedItem('weapon', 1);
                break;
            }
            case 'analyze': {
                addLog("Passi il turno a studiare il nemico...");
                const check = performSkillCheck('percezione', combatState.enemy.tactics.revealDc);
                addLog(`Prova di Percezione (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                if (check.success) {
                    audioManager.playSound('confirm');
                    addLog("SUCCESSO! " + combatState.enemy.tactics.description, '#38bdf8');
                    set(state => ({ activeCombat: { ...state.activeCombat!, revealedTactics: true, availableTacticalActions: combatState.enemy.tactics.actions }}));
                    
                    // v1.9.0: Set quest flag for Main Quest "Prove del Padre"
                    useCharacterStore.getState().setQuestFlag('hasRevealedTactic', true);
                    console.log('[COMBAT] Quest flag set: hasRevealedTactic = true');
                    
                    // Check quest triggers for tacticRevealed
                    import('../services/questService').then(({ questService }) => {
                        questService.checkQuestTriggers();
                    });
                } else {
                    audioManager.playSound('error');
                    addLog("FALLIMENTO. Non noti nulla di particolare.", '#ff8c00');
                }
                break;
            }
            case 'flee': {
                addLog("Tenti di fuggire...");
                const check = performSkillCheck('furtivita', 12);
                addLog(`Prova di Furtività (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                if (check.success) {
                    addLog("Riesci a dileguarti!", '#60BF77');
                    
                    // v1.9.0: Set quest flag for Main Quest "Prove del Padre"
                    useCharacterStore.getState().setQuestFlag('hasSuccessfullyFled', true);
                    console.log('[COMBAT] Quest flag set: hasSuccessfullyFled = true');
                    
                    // Check quest triggers for successfulFlee
                    import('../services/questService').then(({ questService }) => {
                        questService.checkQuestTriggers();
                    });
                    
                    get().endCombat('flee');
                    return;
                } else {
                    addLog("FALLIMENTO. Il nemico ti blocca la strada!", '#ff8c00');
                }
                break;
            }
            case 'tactic': {
                const tactic = combatState.availableTacticalActions.find((t: EnemyTactic) => t.id === action.tacticId);
                if (tactic && tactic.skillCheck) {
                    addLog(tactic.description);
                    const check = performSkillCheck(tactic.skillCheck.skill, tactic.skillCheck.dc);
                    addLog(`Prova di ${check.skill} (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                    if (check.success) {
                        audioManager.playSound('hit_enemy');
                        const bonusDamage = 15;
                        addLog(`SUCCESSO! Infliggi ${bonusDamage} danni extra.`, '#38bdf8');
                        newEnemyHp.current = Math.max(0, newEnemyHp.current - bonusDamage);
                    } else {
                        audioManager.playSound('error');
                        addLog('FALLIMENTO! La tua mossa non riesce.', '#ff8c00');
                    }
                }
                break;
            }
            case 'use_item': {
                const item = itemDatabase[action.itemId];
                if(item) {
                    addLog(`Usi ${item.name}...`);
                    removeItem(action.itemId, 1);
                    item.effects?.forEach(effect => {
                        if (effect.type === 'heal') {
                            heal(effect.value as number);
                            addLog(`Recuperi ${effect.value} HP.`, '#60BF77');
                        }
                    });
                }
                break;
            }
            
            case 'environmental': {
                // v1.9.1 - Environmental combat actions
                if (action.actionId === 'hide_in_trees') {
                    // Forest: Hide in trees (Furtività DC 13)
                    addLog("Tenti di nasconderti tra il fitto fogliame...");
                    const check = performSkillCheck('furtivita', 13);
                    addLog(`Prova di Furtività (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                    
                    if (check.success) {
                        audioManager.playSound('confirm');
                        addLog("SUCCESSO! Scompari tra gli alberi. Il nemico ti perde di vista.", '#60BF77');
                        // Set environmental bonus: next enemy attack will miss
                        set(state => ({
                            activeCombat: {
                                ...state.activeCombat!,
                                environmentalBonusActive: true,
                                environmentalBonusTurns: 1
                            }
                        }));
                    } else {
                        audioManager.playSound('error');
                        addLog("FALLIMENTO! Fai troppo rumore. Il nemico ti individua!", '#ff8c00');
                    }
                } else if (action.actionId === 'seek_cover') {
                    // City/Village: Seek cover (Percezione DC 12)
                    addLog("Cerchi rapidamente una copertura...");
                    const check = performSkillCheck('percezione', 12);
                    addLog(`Prova di Percezione (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                    
                    if (check.success) {
                        audioManager.playSound('confirm');
                        addLog("SUCCESSO! Ti ripari dietro un muro crollato. (+4 AC per 2 turni)", '#60BF77');
                        // Set environmental bonus: +4 AC for 2 turns
                        set(state => ({
                            activeCombat: {
                                ...state.activeCombat!,
                                environmentalBonusActive: true,
                                environmentalBonusTurns: 2
                            }
                        }));
                    } else {
                        audioManager.playSound('error');
                        addLog("FALLIMENTO! Non trovi una copertura adeguata in tempo.", '#ff8c00');
                    }
                }
                break;
            }
            
            case 'load_special_ammo': {
                // v1.9.1 - Load special ammunition
                const ammoItemIds: Record<string, string> = {
                    'piercing': 'ammo_piercing',
                    'incendiary': 'ammo_incendiary',
                    'hollow_point': 'ammo_hollow_point'
                };
                
                const ammoItemId = ammoItemIds[action.ammoType];
                const hasAmmo = inventory.some(i => i.itemId === ammoItemId && i.quantity > 0);
                
                if (!hasAmmo) {
                    addLog(`Non hai munizioni ${action.ammoType} disponibili!`, '#ff8c00');
                    audioManager.playSound('error');
                    break;
                }
                
                // Consume ammo and activate effect
                removeItem(ammoItemId, 3); // Use 3 rounds
                addLog(`Carichi munizioni ${action.ammoType}. (3 colpi disponibili)`, '#38bdf8');
                
                set(state => ({
                    activeCombat: {
                        ...state.activeCombat!,
                        specialAmmoActive: action.ammoType,
                        specialAmmoRounds: 3
                    }
                }));
                break;
            }
        }
        
        if (newEnemyHp.current <= 0) {
            addLog(getRandom(N.ENEMY_DEATH_DESCRIPTIONS).replace('{enemy}', combatState.enemy.name), '#f59e0b');
            addXp(combatState.enemy.xp);
            addLog(`Hai guadagnato ${combatState.enemy.xp} XP.`, '#f59e0b');
            
            // Enemy loot system
            const hasScavenger = unlockedTalents.includes('scavenger');
            const lootRolls = hasScavenger ? 2 : 1; // Scavenger gets 2 rolls
            
            // Calculate loot tier based on enemy power
            const enemyTier = combatState.enemy.xp < 80 ? 'common' : combatState.enemy.xp < 120 ? 'uncommon' : 'rare';
            
            // v1.9.9 - Loot pools by tier with EQUIPMENT from humanoids
            const enemyIsHumanoid = combatState.enemy.type === 'humanoid';
            
            const lootTables = {
                common: [
                    { id: 'scrap_metal', weight: 30, quantity: [1, 3] },
                    { id: 'clean_cloth', weight: 25, quantity: [1, 2] },
                    { id: 'MED_BANDAGE_BASIC', weight: 20, quantity: [1, 2] },
                    { id: 'bottle_empty', weight: 15, quantity: [1, 2] },
                    { id: 'CONS_001', weight: 10, quantity: [1, 1] },
                    // v1.9.9 - Humanoids can drop basic armor
                    ...(enemyIsHumanoid ? [
                        { id: 'armor_makeshift_helmet', weight: 8, quantity: [1, 1] },
                        { id: 'armor_durable_boots', weight: 8, quantity: [1, 1] }
                    ] : [])
                ],
                uncommon: [
                    { id: 'animal_hide', weight: 25, quantity: [1, 2] },
                    { id: 'scrap_metal', weight: 20, quantity: [2, 4] },
                    { id: 'CONS_003', weight: 15, quantity: [1, 2] },
                    { id: 'durable_cloth', weight: 15, quantity: [1, 2] },
                    { id: 'CONS_002', weight: 10, quantity: [1, 1] },
                    { id: 'adhesive_tape', weight: 10, quantity: [1, 1] },
                    { id: 'MED_ANTISEPTIC', weight: 5, quantity: [1, 1] },
                    // v1.9.9 - Humanoids can drop better armor
                    ...(enemyIsHumanoid ? [
                        { id: 'armor_leather_chestpiece', weight: 12, quantity: [1, 1] },
                        { id: 'leather_leggings', weight: 12, quantity: [1, 1] },
                        { id: 'combat_helmet', weight: 10, quantity: [1, 1] }
                    ] : [])
                ],
                rare: [
                    { id: 'scrap_metal_high_quality', weight: 20, quantity: [1, 2] },
                    { id: 'animal_hide', weight: 20, quantity: [2, 3] },
                    { id: 'first_aid_kit', weight: 15, quantity: [1, 1] },
                    { id: 'CONS_003', weight: 15, quantity: [2, 3] },
                    { id: 'MED_ANTISEPTIC', weight: 10, quantity: [1, 2] },
                    { id: 'tech_components', weight: 10, quantity: [1, 1] },
                    { id: 'MED_PAINKILLER', weight: 10, quantity: [1, 1] },
                    // v1.9.9 - Humanoids can drop rare armor
                    ...(enemyIsHumanoid ? [
                        { id: 'kevlar_vest', weight: 15, quantity: [1, 1] },
                        { id: 'reinforced_jeans', weight: 12, quantity: [1, 1] },
                        { id: 'tactical_helmet', weight: 12, quantity: [1, 1] }
                    ] : [])
                ]
            };
            
            const lootTable = lootTables[enemyTier];
            const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
            
            for (let i = 0; i < lootRolls; i++) {
                const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
                const roll = Math.random() * totalWeight;
                let cumulativeWeight = 0;
                
                for (const lootEntry of lootTable) {
                    cumulativeWeight += lootEntry.weight;
                    if (roll < cumulativeWeight) {
                        const [min, max] = lootEntry.quantity;
                        const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
                        addItem(lootEntry.id, quantity);
                        const itemName = itemDatabase[lootEntry.id]?.name || lootEntry.id;
                        addLog(`Hai recuperato: ${itemName} x${quantity}`, '#60BF77');
                        break;
                    }
                }
            }
            
            victory = true;
            audioManager.playSound('victory');
            
            // Increment total combat wins counter
            useGameStore.setState(state => ({
                totalCombatWins: state.totalCombatWins + 1
            }));
            
            // Increment quest kill counts for bounty quests (v1.8.3)
            import('../services/questService').then(({ questService }) => {
                questService.incrementQuestKillCount(combatState.enemy.id);
            });
            
            // Trigger CS_FIRST_KILL cutscene only after first HUMANOID kill
            const { gameFlags, startCutscene } = useGameStore.getState();
            const isHumanoid = combatState.enemy.type === 'humanoid';
            if (isHumanoid && !gameFlags.has('FIRST_HUMAN_KILL_PLAYED')) {
                setTimeout(() => {
                    useGameStore.setState(state => ({
                        gameFlags: new Set(state.gameFlags).add('FIRST_HUMAN_KILL_PLAYED')
                    }));
                    useGameStore.getState().startCutscene('CS_FIRST_KILL');
                }, 2000); // 2 second delay after combat ends
            }
        }

        set(state => ({ activeCombat: { ...state.activeCombat!, log: newLog, enemyHp: newEnemyHp, playerTurn: newPlayerTurn, victory } }));

        if (!victory && !get().activeCombat?.playerTurn) {
            setTimeout(() => {
                const currentCombatState = get().activeCombat;
                if(!currentCombatState || currentCombatState.victory) return;

                const enemy = currentCombatState.enemy;
                let enemyLog = [...currentCombatState.log];
                const addEnemyLog = (text: string, color?: string) => enemyLog.push({ text, color });
                
                // v1.9.1 - Apply burning damage at start of enemy turn
                if (currentCombatState.enemyBurning && currentCombatState.enemyBurningTurns! > 0) {
                    const burnDamage = 3;
                    newEnemyHp.current = Math.max(0, newEnemyHp.current - burnDamage);
                    addEnemyLog(`[FUOCO] Il nemico brucia! Subisce ${burnDamage} danni.`, '#f59e0b');
                    
                    // Decrement burning turns
                    const newBurningTurns = currentCombatState.enemyBurningTurns! - 1;
                    if (newBurningTurns === 0) {
                        addEnemyLog(`Le fiamme si spengono.`, '#a3a3a3');
                    }
                    
                    // Update burning status
                    set(state => ({
                        activeCombat: {
                            ...state.activeCombat!,
                            enemyHp: newEnemyHp,
                            enemyBurning: newBurningTurns > 0,
                            enemyBurningTurns: newBurningTurns
                        }
                    }));
                    
                    // Check if enemy died from burning
                    if (newEnemyHp.current <= 0) {
                        addEnemyLog(`Il nemico cade, consumato dalle fiamme!`, '#f59e0b');
                        set(state => ({ activeCombat: { ...state.activeCombat!, log: enemyLog, victory: true } }));
                        return;
                    }
                }
                
                // v1.9.1 - Increment turn counter
                const currentTurn = (currentCombatState.turnCount || 0) + 1;
                
                // v1.9.1 - Elite enemy special abilities
                if (enemy.isElite && enemy.specialAbility && !currentCombatState.abilityUsedThisCombat) {
                    const ability = enemy.specialAbility;
                    let shouldTrigger = false;
                    
                    // Check trigger condition
                    if (ability.trigger === 'turn_2' && currentTurn === 2) {
                        shouldTrigger = Math.random() < (ability.probability || 1.0);
                    }
                    
                    if (shouldTrigger) {
                        if (ability.id === 'pack_call') {
                            // Capobranco: Richiamo del Branco
                            addEnemyLog(`[ABILITÀ ELITE] ${enemy.name} ulula! Un altro lupo risponde alla chiamata!`, '#f59e0b');
                            // Start a new combat with a regular wolf (this would need more complex logic)
                            // For now, just heal the alpha wolf to simulate reinforcement
                            newEnemyHp.current = Math.min(newEnemyHp.max, newEnemyHp.current + 15);
                            addEnemyLog(`Il Capobranco si rinvigorisce con l'arrivo del rinforzo! (+15 HP)`, '#f59e0b');
                            
                            set(state => ({
                                activeCombat: {
                                    ...state.activeCombat!,
                                    enemyHp: newEnemyHp,
                                    abilityUsedThisCombat: true,
                                    turnCount: currentTurn
                                }
                            }));
                        }
                    }
                }
                
                // Update turn count
                set(state => ({
                    activeCombat: {
                        ...state.activeCombat!,
                        turnCount: currentTurn
                    }
                }));
                
                // v1.9.1 - Check environmental bonus
                const { environmentalBonusActive, environmentalBonusTurns, biome } = currentCombatState;
                
                if (environmentalBonusActive && environmentalBonusTurns! > 0) {
                    if (biome === 'Foresta' || biome === 'F') {
                        // Hidden in trees - enemy attack auto-misses
                        addEnemyLog(getRandom(N.ENEMY_ATTACK_DESCRIPTIONS).replace('{enemy}', enemy.name));
                        addEnemyLog("Il nemico attacca a vuoto! Sei ben nascosto tra il fogliame.", '#60BF77');
                        
                        // Deactivate bonus after use
                        set(state => ({
                            activeCombat: {
                                ...state.activeCombat!,
                                log: enemyLog,
                                playerTurn: true,
                                environmentalBonusActive: false,
                                environmentalBonusTurns: 0
                            }
                        }));
                    } else {
                        // In cover - bonus AC
                        addEnemyLog(getRandom(N.ENEMY_ATTACK_DESCRIPTIONS).replace('{enemy}', enemy.name));
                        const enemyAttackRoll = Math.floor(Math.random() * 20) + 1;
                        const totalEnemyAttack = enemyAttackRoll + enemy.attack.bonus;
                        const playerAC = getPlayerAC() + 4; // +4 AC from cover
                        addEnemyLog(`Tiro per colpire del nemico: ${enemyAttackRoll} + ${enemy.attack.bonus} = ${totalEnemyAttack} vs CA ${playerAC} (+4 copertura)`, '#a3a3a3');
                        
                        if (totalEnemyAttack >= playerAC) {
                            audioManager.playSound('hit_player');
                            damageEquippedItem('armor', 1);
                            const damage = enemy.attack.damage + Math.floor(Math.random() * 3) - 1;
                            takeDamage(damage, 'COMBAT');
                            addEnemyLog(`${getRandom(N.ENEMY_HIT_DESCRIPTIONS)} Subisci ${damage} danni.`, '#ef4444');
                        } else {
                            addEnemyLog("L'attacco colpisce la copertura! Sei al sicuro.", '#60BF77');
                        }
                        
                        // Decrement bonus turns
                        const newBonusTurns = environmentalBonusTurns! - 1;
                        set(state => ({
                            activeCombat: {
                                ...state.activeCombat!,
                                log: enemyLog,
                                playerTurn: true,
                                environmentalBonusActive: newBonusTurns > 0,
                                environmentalBonusTurns: newBonusTurns
                            }
                        }));
                    }
                } else {
                    // Normal enemy attack (no environmental bonus)
                    addEnemyLog(getRandom(N.ENEMY_ATTACK_DESCRIPTIONS).replace('{enemy}', enemy.name));
                    const enemyAttackRoll = Math.floor(Math.random() * 20) + 1;
                    const totalEnemyAttack = enemyAttackRoll + enemy.attack.bonus;
                    const playerAC = getPlayerAC();
                    addEnemyLog(`Tiro per colpire del nemico: ${enemyAttackRoll} + ${enemy.attack.bonus} = ${totalEnemyAttack} vs CA ${playerAC}`, '#a3a3a3');
                    
                    if (totalEnemyAttack >= playerAC) {
                        audioManager.playSound('hit_player');
                        damageEquippedItem('armor', 1);
                        const damage = enemy.attack.damage + Math.floor(Math.random() * 3) - 1;
                        takeDamage(damage, 'COMBAT');
                        addEnemyLog(`${getRandom(N.ENEMY_HIT_DESCRIPTIONS)} Subisci ${damage} danni.`, '#ef4444');
                    } else {
                        addEnemyLog(getRandom(N.ENEMY_MISS_DESCRIPTIONS), '#60BF77');
                    }

                    if (useCharacterStore.getState().hp.current > 0) {
                         set(state => ({ activeCombat: { ...state.activeCombat!, log: enemyLog, playerTurn: true } }));
                    }
                }
            }, 1500);
        }
    },
    /**
     * @function reset
     * @description Resets the combat store to its initial state.
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