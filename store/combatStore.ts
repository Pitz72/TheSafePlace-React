import { create } from 'zustand';
// FIX: Added GameState and JournalEntryType to imports to use enums instead of strings.
import { CombatState, EnemyTactic, PlayerCombatActionPayload, GameState, JournalEntryType } from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useEnemyDatabaseStore } from '../data/enemyDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { audioManager } from '../utils/audio';
import * as N from '../data/combatNarrative';

interface CombatStoreState {
    activeCombat: CombatState | null;
    startCombat: (enemyId: string) => void;
    endCombat: (result: 'win' | 'flee' | 'lose') => void;
    playerCombatAction: (action: PlayerCombatActionPayload) => void;
    cleanupCombat: () => void;
    reset: () => void;
}

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const initialState = {
    activeCombat: null,
};

export const useCombatStore = create<CombatStoreState>((set, get) => ({
    ...initialState,
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
            const damageBonus = characterState.getAttributeModifier(weaponDetails?.weaponType === 'ranged' ? 'des' : 'for');
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
                victory: false
            }
        });
        // FIX: Use GameState enum instead of string.
        useGameStore.getState().setGameState(GameState.COMBAT);
    },
    endCombat: (result) => {
        const { addJournalEntry, setGameState } = useGameStore.getState();
        if (result === 'win') audioManager.playSound('victory');
        // FIX: Use JournalEntryType enum instead of string.
        else if (result === 'flee') addJournalEntry({ text: "Sei fuggito dal combattimento.", type: JournalEntryType.NARRATIVE });
        else if (result === 'lose') {
            audioManager.playSound('defeat');
            // FIX: Use JournalEntryType enum instead of string.
            addJournalEntry({ text: "Sei stato sconfitto...", type: JournalEntryType.SYSTEM_ERROR });
        }
        set({ activeCombat: null });
        // FIX: Use GameState enum instead of string.
        setGameState(GameState.IN_GAME);
    },
    cleanupCombat: () => {
        set({ activeCombat: null });
        // FIX: Use GameState enum instead of string.
        useGameStore.getState().setGameState(GameState.IN_GAME);
    },
    playerCombatAction: (action) => {
        const combatState = get().activeCombat;
        if (!combatState || !combatState.playerTurn || combatState.victory) return;

        const { getPlayerAC, performSkillCheck, takeDamage, getAttributeModifier, equippedWeapon, inventory, removeItem, heal, addXp, damageEquippedItem } = useCharacterStore.getState();
        const { itemDatabase } = useItemDatabaseStore.getState();
        
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
                    const attackBonus = getAttributeModifier(weaponDetails?.weaponType === 'ranged' ? 'des' : 'for');
                    const totalAttack = attackRoll + attackBonus;
                    addLog(`Tiro per colpire: ${attackRoll} + ${attackBonus} = ${totalAttack} vs CA ${combatState.enemy.ac}`, '#a3a3a3');
                    if (totalAttack >= combatState.enemy.ac) {
                        audioManager.playSound('hit_enemy');
                        const baseDamage = weaponDetails?.damage || 2;
                        const damage = baseDamage + getAttributeModifier(weaponDetails?.weaponType === 'ranged' ? 'des' : 'for') + Math.floor(Math.random() * 4) - 2;
                        newEnemyHp.current = Math.max(0, newEnemyHp.current - damage);
                        addLog(`${getRandom(N.PLAYER_HIT_DESCRIPTIONS)} Infliggi ${damage} danni.`, '#60BF77');
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
        }
        
        if (newEnemyHp.current <= 0) {
            addLog(getRandom(N.ENEMY_DEATH_DESCRIPTIONS).replace('{enemy}', combatState.enemy.name), '#f59e0b');
            addXp(combatState.enemy.xp);
            addLog(`Hai guadagnato ${combatState.enemy.xp} XP.`, '#f59e0b');
            victory = true;
            audioManager.playSound('victory');
        }

        set(state => ({ activeCombat: { ...state.activeCombat!, log: newLog, enemyHp: newEnemyHp, playerTurn: newPlayerTurn, victory } }));

        if (!victory && !get().activeCombat?.playerTurn) {
            setTimeout(() => {
                const currentCombatState = get().activeCombat;
                if(!currentCombatState || currentCombatState.victory) return;

                const enemy = currentCombatState.enemy;
                let enemyLog = [...currentCombatState.log];
                const addEnemyLog = (text: string, color?: string) => enemyLog.push({ text, color });
                
                addEnemyLog(getRandom(N.ENEMY_ATTACK_DESCRIPTIONS).replace('{enemy}', enemy.name));
                const enemyAttackRoll = Math.floor(Math.random() * 20) + 1;
                const totalEnemyAttack = enemyAttackRoll + enemy.attack.bonus;
                const playerAC = getPlayerAC();
                addEnemyLog(`Tiro per colpire del nemico: ${enemyAttackRoll} + ${enemy.attack.bonus} = ${totalEnemyAttack} vs CA ${playerAC}`, '#a3a3a3');
                
                if (totalEnemyAttack >= playerAC) {
                    audioManager.playSound('hit_player');
                    damageEquippedItem('armor', 1);
                    const damage = enemy.attack.damage + Math.floor(Math.random() * 3) - 1;
                    takeDamage(damage);
                    addEnemyLog(`${getRandom(N.ENEMY_HIT_DESCRIPTIONS)} Subisci ${damage} danni.`, '#ef4444');
                } else {
                    addEnemyLog(getRandom(N.ENEMY_MISS_DESCRIPTIONS), '#60BF77');
                }

                if (useCharacterStore.getState().hp.current <= 0) {
                    addEnemyLog("Sei stato sconfitto...", '#ff0000');
                    get().endCombat('lose');
                } else {
                     set(state => ({ activeCombat: { ...state.activeCombat!, log: enemyLog, playerTurn: true } }));
                }
            }, 1500);
        }
    },
    reset: () => {
        set(initialState);
    }
}));