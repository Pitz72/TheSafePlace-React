import { create } from 'zustand';
import {
    CombatLogEntry, CombatState, Enemy, GameState, IItem, JournalEntryType, PlayerCombatActionPayload, SpecialAmmoType,
} from '../types';
import { useGameStore } from './gameStore';
import { useCharacterStore } from './characterStore';
import { useTimeStore } from './timeStore';
import { useEnemyDatabaseStore } from '../data/enemyDatabase';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useLootTableStore, rollLoot, LootEntry } from '../data/lootTableDatabase';
import { questService } from '../services/questService';
import { audioManager } from '../utils/audio';
import * as N from '../data/combatNarrative';
import { SKILL_LABELS } from '../constants';

/** Pause before the enemy acts, so the player can read the log. */
export const ENEMY_TURN_DELAY = 1200;

export const SPECIAL_AMMO_ITEMS: Record<SpecialAmmoType, string> = {
    piercing: 'ammo_piercing',
    incendiary: 'ammo_incendiary',
    hollow_point: 'ammo_hollow_point',
};
export const SPECIAL_AMMO_NAMES: Record<SpecialAmmoType, string> = {
    piercing: 'Perforanti',
    incendiary: 'Incendiarie',
    hollow_point: 'a Espansione',
};
/** Ammo that fits a firearm: special rounds only load into guns. */
const FIREARM_AMMO = new Set(['ammo_9mm', 'ammo_rifle', 'ammo_shotgun']);
const SPECIAL_AMMO_ROUNDS = 3;
const BURN_DAMAGE = 3;
const TACTIC_DAMAGE = 15;
const COVER_AC_BONUS = 4;

interface CombatStoreState {
    activeCombat: CombatState | null;
    /** Increases with every fight: a pending enemy turn of an old fight is ignored. */
    combatId: number;
    startCombat: (enemyId: string) => void;
    endCombat: (result: 'win' | 'flee' | 'lose') => void;
    playerCombatAction: (action: PlayerCombatActionPayload) => void;
    enemyTurn: () => void;
    cleanupCombat: () => void;
    reset: () => void;
}

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const d = (sides: number) => Math.floor(Math.random() * sides) + 1;
const itemDb = () => useItemDatabaseStore.getState().itemDatabase;

/** What the player hits with right now. */
interface Weapon {
    name: string;
    details: IItem | null;
    damage: number;
    ranged: boolean;
    /** Melee strike, also used when a ranged weapon has no ammo. */
    melee: boolean;
    ammoId: string | null;
    thrown: boolean;
}

function currentWeapon(): Weapon {
    const character = useCharacterStore.getState();
    const invItem = character.equippedWeapon !== null ? character.inventory[character.equippedWeapon] : null;
    const details = invItem ? itemDb()[invItem.itemId] ?? null : null;
    if (!details || (invItem?.durability && invItem.durability.current <= 0)) {
        return { name: 'pugni', details: null, damage: 2, ranged: false, melee: true, ammoId: null, thrown: false };
    }
    const thrown = details.weaponType === 'thrown';
    const ranged = details.weaponType === 'ranged';
    if (ranged && details.ammoType && character.getItemCount(details.ammoType) <= 0) {
        // No rounds left: the gun becomes a club.
        return { name: `${details.name} (calcio)`, details, damage: 3, ranged: false, melee: true, ammoId: null, thrown: false };
    }
    return {
        name: details.name,
        details,
        damage: details.damage ?? 2,
        ranged: ranged || thrown,
        melee: !ranged && !thrown,
        ammoId: ranged ? details.ammoType ?? null : null,
        thrown,
    };
}

/** Items the combat "Usa Oggetto" menu offers. */
export const isCombatUsable = (details: IItem): boolean =>
    (details.weaponType === 'thrown' && !!details.damage) ||
    (details.effects ?? []).some(e => e.type === 'trap' || e.type === 'smoke' || e.type === 'heal' || e.type === 'cureStatus');

function lootTableFor(enemy: Enemy): LootEntry[] {
    const tier = enemy.xp < 80 ? 'common' : enemy.xp < 120 ? 'uncommon' : 'rare';
    return (useLootTableStore.getState().tables.combat[tier] ?? [])
        .filter(e => !(e.humanoidOnly && enemy.type !== 'humanoid') && !(e.beastOnly && enemy.type !== 'beast'));
}

export const useCombatStore = create<CombatStoreState>((set, get) => {
    /** XP, loot, counters, trophies and quest progress for a defeated enemy. */
    const grantVictoryRewards = (combat: CombatState, log: CombatLogEntry[]) => {
        const enemy = combat.enemy;
        const character = useCharacterStore.getState();
        const addLog = (text: string, color?: string) => log.push({ text, color });

        character.addXp(enemy.xp);
        addLog(`Hai guadagnato ${enemy.xp} XP.`, '#f59e0b');

        const loot: Array<{ itemId: string; quantity: number }> = [...(enemy.guaranteedLoot ?? [])];
        const table = lootTableFor(enemy);
        const rolls = character.hasTalent('scavenger') ? 2 : 1;
        for (let i = 0; i < rolls; i++) {
            const drop = rollLoot(table);
            if (drop) loot.push(drop);
        }
        const hunter = enemy.type === 'beast' && character.hasTalent('expert_hunter');
        for (const drop of loot) {
            const quantity = hunter ? Math.ceil(drop.quantity * 1.5) : drop.quantity;
            useCharacterStore.getState().addItem(drop.itemId, quantity);
            addLog(`Hai recuperato: ${itemDb()[drop.itemId]?.name ?? drop.itemId} x${quantity}${hunter ? ' [Cacciatore Esperto]' : ''}`, '#60BF77');
        }

        const totalCombatWins = useGameStore.getState().totalCombatWins + 1;
        useGameStore.setState({ totalCombatWins });
        character.unlockTrophy('trophy_combat_first_win');
        if (totalCombatWins >= 10) character.unlockTrophy('trophy_combat_10_wins');
        if ((combat.damageTaken ?? 0) === 0) character.unlockTrophy('trophy_combat_no_damage');
        if (combat.usedTactic) character.unlockTrophy('trophy_combat_tactic');
        audioManager.playSound('victory');

        questService.incrementQuestKillCount(enemy.id);
        if (enemy.defeatTrigger) questService.checkQuestTriggers({ source: 'combat', nodeId: enemy.defeatTrigger });

        const game = useGameStore.getState();
        if (enemy.type === 'humanoid' && !game.hasFlag('FIRST_HUMAN_KILL_PLAYED')) {
            game.setFlag('FIRST_HUMAN_KILL_PLAYED');
            game.queueCutscene('CS_FIRST_KILL');
        }
    };

    /** Hit roll and damage of one attack. Returns the damage dealt (0 on a miss). */
    const resolveAttack = (combat: CombatState, weapon: Weapon, addLog: (text: string, color?: string) => void, autoHit = false): number => {
        const character = useCharacterStore.getState();
        const attackBonus = character.getAttributeModifier(weapon.ranged ? 'des' : 'for')
            + (weapon.ranged && character.hasTalent('hawks_eye') ? 2 : 0);
        const special = weapon.ammoId && FIREARM_AMMO.has(weapon.ammoId) && (combat.specialAmmoRounds ?? 0) > 0 ? combat.specialAmmoActive ?? null : null;
        let ac = combat.enemy.ac;
        if (special === 'piercing') ac = Math.max(10, ac - 3);

        // Ombra del Crepuscolo: the opening strike always lands as a critical.
        const shadowStrike = !combat.playerHasAttacked && character.hasTalent('twilight_shadow');
        const roll = d(20);
        const total = roll + attackBonus;
        const critical = roll === 20 || shadowStrike;
        const hits = autoHit || critical || (roll !== 1 && total >= ac);
        if (!autoHit) {
            addLog(`Tiro per colpire: ${roll} + ${attackBonus} = ${total} vs CA ${ac}${special === 'piercing' ? ' (perforanti)' : ''}`, '#a3a3a3');
        }
        if (!hits) {
            addLog(getRandom(N.PLAYER_MISS_DESCRIPTIONS), '#ff8c00');
            return 0;
        }

        let damage = Math.max(1, weapon.damage + character.getAttributeModifier(weapon.ranged ? 'des' : 'for') + d(4) - 3);
        if (weapon.melee && weapon.details && character.hasTalent('combat_master')) damage += 1;
        if (special === 'hollow_point') {
            const extra = d(4);
            damage += extra;
            addLog(`[Munizioni a Espansione] Danno extra: +${extra}!`, '#f59e0b');
        }
        if (critical) {
            damage *= 2;
            addLog(shadowStrike ? '[Ombra del Crepuscolo] Colpisci dall\'ombra: COLPO CRITICO!' : 'COLPO CRITICO!', '#facc15');
        }
        audioManager.playSound('hit_enemy');
        addLog(`${getRandom(N.PLAYER_HIT_DESCRIPTIONS)} Infliggi ${damage} danni.`, '#60BF77');
        if (special === 'incendiary') {
            combat.enemyBurning = true;
            combat.enemyBurningTurns = 3;
            addLog('[Munizioni Incendiarie] Il nemico prende fuoco!', '#f59e0b');
        }
        return damage;
    };

    /** Ammo, thrown weapons and wear after an attack. */
    const spendAttack = (combat: CombatState, weapon: Weapon, addLog: (text: string, color?: string) => void) => {
        const character = useCharacterStore.getState();
        if (weapon.ammoId) {
            character.removeItem(weapon.ammoId, 1);
            if (combat.specialAmmoActive && (combat.specialAmmoRounds ?? 0) > 0) {
                combat.specialAmmoRounds = (combat.specialAmmoRounds ?? 0) - 1;
                if (combat.specialAmmoRounds <= 0) {
                    combat.specialAmmoActive = null;
                    addLog('Munizioni speciali esaurite.', '#a3a3a3');
                }
            }
            const left = useCharacterStore.getState().getItemCount(weapon.ammoId);
            if (left === 0) addLog(`Hai finito le munizioni (${itemDb()[weapon.ammoId]?.name ?? weapon.ammoId})!`, '#ff8c00');
        }
        if (weapon.thrown && weapon.details) {
            character.removeItem(weapon.details.id, 1);
        } else if (weapon.details) {
            character.damageEquippedItem('weapon', 1);
        }
    };

    const finishVictory = (combat: CombatState, log: CombatLogEntry[]) => {
        combat.victoryLogStart = log.length;
        log.push({ text: getRandom(N.ENEMY_DEATH_DESCRIPTIONS).replace('{enemy}', combat.enemy.name), color: '#f59e0b' });
        grantVictoryRewards(combat, log);
        combat.victory = true;
        combat.playerTurn = true;
    };

    return {
        activeCombat: null,
        combatId: 0,

        startCombat: (enemyId) => {
            const enemy = useEnemyDatabaseStore.getState().enemyDatabase[enemyId];
            if (!enemy) {
                console.error(`[COMBAT] Unknown enemy ${enemyId}`);
                return;
            }
            audioManager.playSound('combat_start');
            const game = useGameStore.getState();
            const character = useCharacterStore.getState();
            useGameStore.setState({ lastCombatDay: useTimeStore.getState().gameTime.day });

            const combat: CombatState = {
                enemy: { ...enemy },
                enemyHp: { current: enemy.hp, max: enemy.hp },
                playerTurn: true,
                log: [{ text: `Sei stato attaccato da: ${enemy.name}!`, color: '#facc15' }],
                revealedTactics: false,
                availableTacticalActions: [],
                victory: false,
                biome: game.currentBiome,
                environmentalBonusActive: false,
                environmentalBonusTurns: 0,
                specialAmmoActive: null,
                specialAmmoRounds: 0,
                enemyBurning: false,
                enemyBurningTurns: 0,
                enemyStunnedTurns: 0,
                turnCount: 0,
                abilityUsedThisCombat: false,
                damageTaken: 0,
                playerHasAttacked: false,
                usedTactic: false,
                lastPlayerAttackMissed: false,
            };
            const addLog = (text: string, color?: string) => combat.log.push({ text, color });

            if (enemy.type === 'beast' && character.hasTalent('expert_hunter')) {
                combat.revealedTactics = true;
                combat.availableTacticalActions = enemy.tactics.actions;
                addLog(`[Cacciatore Esperto] Conosci queste bestie: ${enemy.tactics.description}`, '#38bdf8');
            }
            set(state => ({ activeCombat: combat, combatId: state.combatId + 1 }));
            useGameStore.getState().setGameState(GameState.COMBAT);

            if (game.currentBiome === 'F' && character.hasTalent('guerrilla_fighter')) {
                const ambush: CombatState = { ...combat, enemyHp: { ...combat.enemyHp }, log: [...combat.log] };
                const log = (text: string, color?: string) => ambush.log.push({ text, color });
                log("[Guerrigliero] Tendi un'imboscata e colpisci per primo!", '#38bdf8');
                const weapon = currentWeapon();
                const damage = resolveAttack(ambush, weapon, log, true);
                spendAttack(ambush, weapon, log);
                ambush.playerHasAttacked = true;
                ambush.enemyHp.current = Math.max(0, ambush.enemyHp.current - damage);
                if (ambush.enemyHp.current <= 0) finishVictory(ambush, ambush.log);
                set({ activeCombat: ambush });
            }
        },

        endCombat: (result) => {
            if (result === 'win') {
                get().cleanupCombat();
                return;
            }
            if (result === 'lose') {
                useGameStore.getState().setGameOver('COMBAT');
                return;
            }
            if (result === 'flee') {
                useGameStore.getState().addJournalEntry({ text: 'Sei fuggito dal combattimento.', type: JournalEntryType.NARRATIVE });
            }
            set({ activeCombat: null });
            useGameStore.getState().setGameState(GameState.IN_GAME);
        },

        cleanupCombat: () => {
            const combat = get().activeCombat;
            if (combat?.victory) {
                useGameStore.getState().addJournalEntry({ text: `Hai sconfitto: ${combat.enemy.name}.`, type: JournalEntryType.COMBAT });
            }
            set({ activeCombat: null });
            if (useGameStore.getState().gameState === GameState.COMBAT) {
                useGameStore.getState().setGameState(GameState.IN_GAME);
            }
        },

        playerCombatAction: (action) => {
            const current = get().activeCombat;
            if (!current || !current.playerTurn || current.victory) return;
            const character = useCharacterStore.getState();
            const combat: CombatState = { ...current, enemyHp: { ...current.enemyHp }, log: [...current.log] };
            const addLog = (text: string, color?: string) => combat.log.push({ text, color });
            let damage = 0;
            let keepTurn = false;

            character.updateFatigue(1);
            switch (action.type) {
                case 'attack': {
                    const weapon = currentWeapon();
                    addLog(getRandom(N.PLAYER_ATTACK_DESCRIPTIONS));
                    damage = resolveAttack(combat, weapon, addLog);
                    combat.lastPlayerAttackMissed = damage === 0;
                    spendAttack(combat, weapon, addLog);
                    combat.playerHasAttacked = true;
                    break;
                }
                case 'analyze': {
                    addLog('Passi il turno a studiare il nemico...');
                    const check = character.performSkillCheck('percezione', combat.enemy.tactics.revealDc);
                    addLog(`Prova di Percezione (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                    if (check.success) {
                        audioManager.playSound('confirm');
                        addLog(`SUCCESSO! ${combat.enemy.tactics.description}`, '#38bdf8');
                        combat.revealedTactics = true;
                        combat.availableTacticalActions = combat.enemy.tactics.actions;
                        character.setQuestFlag('hasRevealedTactic', true);
                        questService.checkQuestTriggers({ source: 'combat' });
                    } else {
                        audioManager.playSound('error');
                        addLog('FALLIMENTO. Non noti nulla di particolare.', '#ff8c00');
                    }
                    break;
                }
                case 'flee': {
                    addLog('Tenti di fuggire...');
                    const shadow = character.hasTalent('twilight_shadow') ? 4 : 0;
                    const check = character.performSkillCheck('furtivita', 12);
                    const total = check.total + shadow;
                    addLog(`Prova di Furtività (CD 12): ${check.roll} + ${check.bonus + shadow} = ${total}.${shadow ? ' [Ombra del Crepuscolo]' : ''}`);
                    if (total >= 12) {
                        character.setQuestFlag('hasSuccessfullyFled', true);
                        set({ activeCombat: combat });
                        get().endCombat('flee');
                        questService.checkQuestTriggers({ source: 'combat' });
                        return;
                    }
                    addLog('FALLIMENTO. Il nemico ti blocca la strada!', '#ff8c00');
                    break;
                }
                case 'tactic': {
                    const tactic = combat.availableTacticalActions.find(t => t.id === action.tacticId);
                    if (!tactic) return;
                    combat.usedTactic = true;
                    addLog(tactic.description);
                    if (tactic.skillCheck) {
                        const check = character.performSkillCheck(tactic.skillCheck.skill, tactic.skillCheck.dc);
                        addLog(`Prova di ${SKILL_LABELS[check.skill] ?? check.skill} (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                        if (check.success) {
                            audioManager.playSound('hit_enemy');
                            damage = TACTIC_DAMAGE;
                            addLog(`SUCCESSO! Infliggi ${TACTIC_DAMAGE} danni.`, '#38bdf8');
                        } else {
                            audioManager.playSound('error');
                            addLog('FALLIMENTO! La tua mossa non riesce.', '#ff8c00');
                        }
                    }
                    break;
                }
                case 'use_item': {
                    const details = itemDb()[action.itemId];
                    if (!details || !isCombatUsable(details) || character.getItemCount(action.itemId) <= 0) return;
                    const effects = details.effects ?? [];
                    if (effects.some(e => e.type === 'smoke')) {
                        character.removeItem(action.itemId, 1);
                        addLog(`Lanci ${details.name}: una nube densa avvolge tutto e ti dilegui!`, '#60BF77');
                        character.setQuestFlag('hasSuccessfullyFled', true);
                        set({ activeCombat: combat });
                        get().endCombat('flee');
                        questService.checkQuestTriggers({ source: 'combat' });
                        return;
                    }
                    character.removeItem(action.itemId, 1);
                    if (details.weaponType === 'thrown' && details.damage) {
                        damage = Math.max(1, details.damage + character.getAttributeModifier('des'));
                        addLog(`Lanci ${details.name}! Infliggi ${damage} danni.`, '#60BF77');
                        audioManager.playSound('hit_enemy');
                        const fire = effects.find(e => e.type === 'fire');
                        if (fire) {
                            combat.enemyBurning = true;
                            combat.enemyBurningTurns = Number(fire.value) || 3;
                            addLog('Le fiamme avvolgono il nemico!', '#f59e0b');
                        }
                        break;
                    }
                    const trap = effects.find(e => e.type === 'trap');
                    if (trap) {
                        damage = 4 * (Number(trap.value) || 1) + d(6);
                        combat.enemyStunnedTurns = 1;
                        addLog(`Piazzi ${details.name} sul suo cammino: scatta! Infliggi ${damage} danni e il nemico resta bloccato.`, '#60BF77');
                        audioManager.playSound('hit_enemy');
                        break;
                    }
                    addLog(`Usi ${details.name}...`);
                    for (const effect of effects) {
                        if (effect.type === 'heal') {
                            const amount = Math.floor(Number(effect.value) * character.getHealingMultiplier());
                            character.heal(amount);
                            addLog(`Recuperi ${amount} HP.`, '#60BF77');
                        } else if (effect.type === 'cureStatus' && useCharacterStore.getState().status.has(effect.value as never)) {
                            character.removeStatus(effect.value as never);
                            addLog(`Lo stato ${effect.value} è svanito.`, '#60BF77');
                        }
                    }
                    break;
                }
                case 'environmental': {
                    if (action.actionId === 'hide_in_trees') {
                        addLog('Tenti di nasconderti tra il fitto fogliame...');
                        const check = character.performSkillCheck('furtivita', 13);
                        addLog(`Prova di Furtività (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                        if (check.success) {
                            addLog('SUCCESSO! Scompari tra gli alberi: il prossimo attacco nemico andrà a vuoto.', '#60BF77');
                            combat.environmentalBonusActive = true;
                            combat.environmentalBonusTurns = 1;
                        } else {
                            addLog('FALLIMENTO! Fai troppo rumore. Il nemico ti individua!', '#ff8c00');
                        }
                    } else {
                        addLog('Cerchi rapidamente una copertura...');
                        const check = character.performSkillCheck('percezione', 12);
                        addLog(`Prova di Percezione (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
                        if (check.success) {
                            addLog(`SUCCESSO! Ti ripari dietro un muro crollato. (+${COVER_AC_BONUS} CA per 2 turni)`, '#60BF77');
                            combat.environmentalBonusActive = true;
                            combat.environmentalBonusTurns = 2;
                        } else {
                            addLog('FALLIMENTO! Non trovi una copertura adeguata in tempo.', '#ff8c00');
                        }
                    }
                    break;
                }
                case 'load_special_ammo': {
                    const weapon = currentWeapon();
                    const itemId = SPECIAL_AMMO_ITEMS[action.ammoType];
                    if (!weapon.ammoId || !FIREARM_AMMO.has(weapon.ammoId)) {
                        addLog('Le munizioni speciali servono a un\'arma da fuoco carica.', '#ff8c00');
                        keepTurn = true;
                        break;
                    }
                    if (character.getItemCount(itemId) <= 0) {
                        addLog(`Non hai munizioni ${SPECIAL_AMMO_NAMES[action.ammoType]}.`, '#ff8c00');
                        keepTurn = true;
                        break;
                    }
                    character.removeItem(itemId, 1);
                    combat.specialAmmoActive = action.ammoType;
                    combat.specialAmmoRounds = SPECIAL_AMMO_ROUNDS;
                    addLog(`Carichi munizioni ${SPECIAL_AMMO_NAMES[action.ammoType]}: ${SPECIAL_AMMO_ROUNDS} colpi speciali.`, '#38bdf8');
                    break;
                }
            }

            combat.enemyHp.current = Math.max(0, combat.enemyHp.current - damage);
            if (combat.enemyHp.current <= 0) {
                finishVictory(combat, combat.log);
                set({ activeCombat: combat });
                return;
            }
            if (useCharacterStore.getState().hp.current <= 0) return;

            combat.playerTurn = keepTurn;
            set({ activeCombat: combat });
            if (!keepTurn) {
                const id = get().combatId;
                setTimeout(() => {
                    if (get().combatId === id) get().enemyTurn();
                }, ENEMY_TURN_DELAY);
            }
        },

        enemyTurn: () => {
            const current = get().activeCombat;
            if (!current || current.victory || current.playerTurn) return;
            if (useGameStore.getState().gameState !== GameState.COMBAT) return;
            const character = useCharacterStore.getState();
            const combat: CombatState = { ...current, enemyHp: { ...current.enemyHp }, log: [...current.log] };
            const addLog = (text: string, color?: string) => combat.log.push({ text, color });
            const enemy = combat.enemy;
            combat.turnCount = (combat.turnCount ?? 0) + 1;

            if (combat.enemyBurning && (combat.enemyBurningTurns ?? 0) > 0) {
                combat.enemyHp.current = Math.max(0, combat.enemyHp.current - BURN_DAMAGE);
                combat.enemyBurningTurns = (combat.enemyBurningTurns ?? 0) - 1;
                combat.enemyBurning = combat.enemyBurningTurns > 0;
                addLog(`[FUOCO] ${enemy.name} brucia! Subisce ${BURN_DAMAGE} danni.`, '#f59e0b');
                if (!combat.enemyBurning) addLog('Le fiamme si spengono.', '#a3a3a3');
                if (combat.enemyHp.current <= 0) {
                    addLog(`${enemy.name} cade, consumato dalle fiamme!`, '#f59e0b');
                    finishVictory(combat, combat.log);
                    set({ activeCombat: combat });
                    return;
                }
            }

            if ((combat.enemyStunnedTurns ?? 0) > 0) {
                combat.enemyStunnedTurns = (combat.enemyStunnedTurns ?? 0) - 1;
                addLog(`${enemy.name} si dibatte, bloccato: perde il turno!`, '#60BF77');
                combat.playerTurn = true;
                set({ activeCombat: combat });
                return;
            }

            // Elite abilities: each fires at most once per fight.
            const ability = enemy.isElite ? enemy.specialAbility : undefined;
            let extraDamage = 0;
            if (ability && !combat.abilityUsedThisCombat) {
                const conditionMet =
                    (ability.trigger === 'turn_2' && combat.turnCount === 2) ||
                    (ability.trigger === 'player_miss' && combat.lastPlayerAttackMissed) ||
                    (ability.trigger === 'low_hp' && combat.enemyHp.current < combat.enemyHp.max / 2);
                if (conditionMet && Math.random() < (ability.probability ?? 1)) {
                    combat.abilityUsedThisCombat = true;
                    addLog(`[ABILITÀ ELITE] ${ability.name}!`, '#f59e0b');
                    if (ability.id === 'pack_call') {
                        const healed = Math.min(15, combat.enemyHp.max - combat.enemyHp.current);
                        combat.enemyHp.current += healed;
                        addLog(`Un altro lupo risponde all'ululato e si unisce all'assalto! (${enemy.name} +${healed} HP, attacco più feroce)`, '#f59e0b');
                        extraDamage = 3;
                    } else if (ability.id === 'counterattack') {
                        const dmg = Math.max(1, Math.floor(enemy.attack.damage / 2));
                        addLog(`Approfitta del tuo errore e ti colpisce di rimessa: subisci ${dmg} danni!`, '#ef4444');
                        combat.damageTaken = (combat.damageTaken ?? 0) + dmg;
                        character.takeDamage(dmg, 'COMBAT');
                    } else if (ability.id === 'pyromaniac_burst') {
                        const dmg = 8 + d(4);
                        addLog(`Il suo corpo esplode in una vampata di fuoco: subisci ${dmg} danni!`, '#ef4444');
                        combat.damageTaken = (combat.damageTaken ?? 0) + dmg;
                        character.takeDamage(dmg, 'COMBAT');
                    }
                    // Game over already reset the fight.
                    if (useCharacterStore.getState().hp.current <= 0) return;
                }
            }
            combat.lastPlayerAttackMissed = false;

            addLog(getRandom(N.ENEMY_ATTACK_DESCRIPTIONS).replace('{enemy}', enemy.name));
            const hidden = combat.environmentalBonusActive && combat.biome === 'F';
            if (hidden) {
                addLog("Il nemico attacca a vuoto! Sei ben nascosto tra il fogliame.", '#60BF77');
                combat.environmentalBonusActive = false;
                combat.environmentalBonusTurns = 0;
            } else {
                const cover = combat.environmentalBonusActive && (combat.environmentalBonusTurns ?? 0) > 0;
                const playerAC = useCharacterStore.getState().getPlayerAC() + (cover ? COVER_AC_BONUS : 0);
                const roll = d(20);
                const total = roll + enemy.attack.bonus;
                addLog(`Tiro per colpire del nemico: ${roll} + ${enemy.attack.bonus} = ${total} vs CA ${playerAC}${cover ? ` (+${COVER_AC_BONUS} copertura)` : ''}`, '#a3a3a3');
                if (roll !== 1 && (roll === 20 || total >= playerAC)) {
                    audioManager.playSound('hit_player');
                    const dmg = Math.max(1, enemy.attack.damage + d(3) - 2 + extraDamage) * (roll === 20 ? 2 : 1);
                    // The blow lands on a random piece of armour.
                    const slots = (['chest', 'head', 'legs'] as const).filter(slot =>
                        (slot === 'chest' ? character.equippedArmor : slot === 'head' ? character.equippedHead : character.equippedLegs) !== null);
                    if (slots.length > 0) character.damageEquippedItem(getRandom([...slots]), 1);
                    addLog(`${roll === 20 ? 'COLPO CRITICO! ' : ''}${getRandom(N.ENEMY_HIT_DESCRIPTIONS)} Subisci ${dmg} danni.`, '#ef4444');
                    combat.damageTaken = (combat.damageTaken ?? 0) + dmg;
                    character.takeDamage(dmg, 'COMBAT');
                } else {
                    addLog(cover ? "L'attacco colpisce la copertura! Sei al sicuro." : getRandom(N.ENEMY_MISS_DESCRIPTIONS), '#60BF77');
                }
                if (cover) {
                    combat.environmentalBonusTurns = (combat.environmentalBonusTurns ?? 0) - 1;
                    combat.environmentalBonusActive = combat.environmentalBonusTurns > 0;
                }
            }

            if (useCharacterStore.getState().hp.current <= 0) return;
            combat.playerTurn = true;
            set({ activeCombat: combat });
        },

        reset: () => set(state => ({ activeCombat: null, combatId: state.combatId + 1 })),
    };
});
