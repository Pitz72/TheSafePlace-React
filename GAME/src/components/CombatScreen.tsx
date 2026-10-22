import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { PlayerCombatActionPayload, SpecialAmmoType, Stat } from '../types';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useCombatStore, isCombatUsable, SPECIAL_AMMO_ITEMS, SPECIAL_AMMO_NAMES } from '../store/combatStore';
import { useTimeStore } from '../store/timeStore';
import { audioManager } from '../utils/audio';
import { harmonize } from '../utils/palette';
import Modal from './ui/Modal';
import ChoiceList from './ui/ChoiceList';
import Icon, { IconName } from './ui/Icon';
import { StatMeter } from './ui/Meter';
import BiomeScene from './art/BiomeScene';

const getEnemyHealthDescription = (hp: Stat): string => {
    const ratio = hp.current / hp.max;
    if (ratio > 0.9) return 'Illeso';
    if (ratio > 0.6) return 'Leggermente Ferito';
    if (ratio > 0.3) return 'Ferito';
    if (ratio > 0) return 'In Fin di Vita';
    return 'Sconfitto';
};

/** How many of the four health segments are still lit (same steps as the description). */
const enemyHealthSegments = (hp: Stat): number => {
    const ratio = hp.current / hp.max;
    if (ratio > 0.9) return 4;
    if (ratio > 0.6) return 3;
    if (ratio > 0.3) return 2;
    if (ratio > 0) return 1;
    return 0;
};

type MenuEntry =
    | { kind: 'action'; name: string; payload: PlayerCombatActionPayload }
    | { kind: 'items'; name: string };

const ACTION_ICONS: Record<PlayerCombatActionPayload['type'], IconName> = {
    attack: 'attack',
    analyze: 'eye',
    tactic: 'sparkle',
    environmental: 'tree',
    load_special_ammo: 'bolt',
    use_item: 'flask',
    flee: 'flee',
};

const FIREARM_AMMO = new Set(['ammo_9mm', 'ammo_rifle', 'ammo_shotgun']);

const CombatScreen: React.FC = () => {
    const { activeCombat, playerCombatAction, cleanupCombat } = useCombatStore();
    const hp = useCharacterStore(state => state.hp);
    const inventory = useCharacterStore(state => state.inventory);
    const equippedWeapon = useCharacterStore(state => state.equippedWeapon);
    const itemDatabase = useItemDatabaseStore(state => state.itemDatabase);
    const gameTime = useTimeStore(state => state.gameTime);
    const weather = useTimeStore(state => state.weather);

    const [menuIndex, setMenuIndex] = useState(0);
    const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);
    const [itemMenuIndex, setItemMenuIndex] = useState(0);
    const combatLogRef = useRef<HTMLDivElement>(null);

    /** One entry per usable item id (stacks and copies merged). */
    const usableItems = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of inventory) {
            const details = itemDatabase[item.itemId];
            if (details && isCombatUsable(details)) counts.set(item.itemId, (counts.get(item.itemId) ?? 0) + item.quantity);
        }
        return [...counts.entries()].map(([itemId, quantity]) => ({ itemId, quantity }));
    }, [inventory, itemDatabase]);

    const weapon = equippedWeapon !== null ? inventory[equippedWeapon] : null;
    const weaponDetails = weapon ? itemDatabase[weapon.itemId] : null;
    const ammoId = weaponDetails?.weaponType === 'ranged' ? weaponDetails.ammoType : undefined;
    const ammoCount = ammoId ? inventory.reduce((sum, item) => (item.itemId === ammoId ? sum + item.quantity : sum), 0) : 0;

    const menu = useMemo((): MenuEntry[] => {
        if (!activeCombat) return [];
        const entries: MenuEntry[] = [
            { kind: 'action', name: 'Attacca', payload: { type: 'attack' } },
            { kind: 'action', name: 'Analizza', payload: { type: 'analyze' } },
        ];
        activeCombat.availableTacticalActions.forEach(tactic =>
            entries.push({ kind: 'action', name: tactic.name, payload: { type: 'tactic', tacticId: tactic.id } }));
        if (activeCombat.biome === 'F') {
            entries.push({ kind: 'action', name: '[Ambiente] Nasconditi tra gli alberi', payload: { type: 'environmental', actionId: 'hide_in_trees' } });
        } else if (activeCombat.biome === 'C' || activeCombat.biome === 'V') {
            entries.push({ kind: 'action', name: '[Ambiente] Cerca copertura', payload: { type: 'environmental', actionId: 'seek_cover' } });
        }
        if (ammoId && FIREARM_AMMO.has(ammoId) && ammoCount > 0) {
            (Object.keys(SPECIAL_AMMO_ITEMS) as SpecialAmmoType[]).forEach(type => {
                const owned = inventory.reduce((sum, item) => (item.itemId === SPECIAL_AMMO_ITEMS[type] ? sum + item.quantity : sum), 0);
                if (owned > 0) entries.push({ kind: 'action', name: `Carica munizioni ${SPECIAL_AMMO_NAMES[type]} (x${owned})`, payload: { type: 'load_special_ammo', ammoType: type } });
            });
        }
        if (usableItems.length > 0) entries.push({ kind: 'items', name: 'Usa Oggetto' });
        entries.push({ kind: 'action', name: 'Fuggi', payload: { type: 'flee' } });
        return entries;
    }, [activeCombat, usableItems.length, ammoId, ammoCount, inventory]);

    useEffect(() => {
        if (combatLogRef.current) combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }, [activeCombat?.log]);
    useEffect(() => { setMenuIndex(i => Math.min(i, Math.max(0, menu.length - 1))); }, [menu.length]);
    useEffect(() => { setItemMenuIndex(0); }, [isItemMenuOpen]);
    useEffect(() => { if (usableItems.length === 0) setIsItemMenuOpen(false); }, [usableItems.length]);

    const navigate = useCallback((direction: number) => {
        if (menu.length === 0) return;
        setMenuIndex(prev => (prev + direction + menu.length) % menu.length);
        audioManager.playSound('navigate');
    }, [menu.length]);

    const navigateItems = useCallback((direction: number) => {
        if (usableItems.length === 0) return;
        setItemMenuIndex(prev => (prev + direction + usableItems.length) % usableItems.length);
        audioManager.playSound('navigate');
    }, [usableItems.length]);

    const confirm = useCallback(() => {
        const entry = menu[menuIndex];
        if (!entry) return;
        audioManager.playSound('confirm');
        if (entry.kind === 'items') setIsItemMenuOpen(true);
        else playerCombatAction(entry.payload);
    }, [menu, menuIndex, playerCombatAction]);

    const confirmItem = useCallback(() => {
        const item = usableItems[itemMenuIndex];
        if (!item) return;
        audioManager.playSound('confirm');
        playerCombatAction({ type: 'use_item', itemId: item.itemId });
        setIsItemMenuOpen(false);
    }, [itemMenuIndex, usableItems, playerCombatAction]);

    const handlerMap = useMemo((): KeyHandlerMap => {
        if (!activeCombat) return {};
        if (activeCombat.victory) return { Enter: cleanupCombat };
        if (!activeCombat.playerTurn) return {};
        if (isItemMenuOpen) {
            return {
                w: () => navigateItems(-1), ArrowUp: () => navigateItems(-1),
                s: () => navigateItems(1), ArrowDown: () => navigateItems(1),
                Enter: confirmItem, Escape: () => setIsItemMenuOpen(false),
            };
        }
        return {
            w: () => navigate(-1), ArrowUp: () => navigate(-1),
            s: () => navigate(1), ArrowDown: () => navigate(1),
            Enter: confirm,
        };
    }, [activeCombat, isItemMenuOpen, navigate, confirm, navigateItems, confirmItem, cleanupCombat]);

    useKeyboardInput(handlerMap);

    if (!activeCombat) return null;

    const hour = gameTime.hour + gameTime.minute / 60;

    if (activeCombat.victory) {
        // Everything logged from the killing blow on: XP and loot.
        const summary = activeCombat.log.slice(activeCombat.victoryLogStart ?? Math.max(0, activeCombat.log.length - 4));
        return (
            <Modal
                accent="gold"
                banner={<BiomeScene biome={activeCombat.biome ?? '.'} hour={hour} weather={weather.type} height={190} />}
                eyebrow="Combattimento concluso"
                icon="trophy"
                title="Vittoria"
                subtitle={`${activeCombat.enemy.name} non è più una minaccia.`}
                size="md"
                hints={[{ keys: ['INVIO'], label: 'Continua', active: true }]}
            >
                <div className="scroll-y fade-bottom max-h-[420px] px-12 pb-10">
                    <div className="hairline mb-6" />
                    <div className="flex flex-col gap-3">
                        {summary.map((entry, index) => (
                            <p
                                key={index}
                                className="prose-story text-[24px] anim-fade-up"
                                style={{ color: harmonize(entry.color, 'ink'), animationDelay: `${index * 140}ms` }}
                            >
                                {entry.text}
                            </p>
                        ))}
                    </div>
                </div>
            </Modal>
        );
    }

    const segments = enemyHealthSegments(activeCombat.enemyHp);
    const log = activeCombat.log;
    const hpCritical = hp.current / hp.max <= 0.25;

    return (
        <Modal
            accent="danger"
            banner={<BiomeScene biome={activeCombat.biome ?? '.'} hour={hour} weather={weather.type} danger height={160} />}
            eyebrow="Combattimento"
            icon="attack"
            title={activeCombat.enemy.name}
            size="xl"
            className="h-full"
            bodyClassName="flex gap-6 px-12 pb-8"
            hints={!activeCombat.playerTurn
                ? [{ keys: ['…'], label: 'Turno del nemico', muted: true }]
                : isItemMenuOpen
                    ? [{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Usa' }, { keys: ['ESC'], label: 'Indietro' }]
                    : [{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }]}
        >
            {/* The fight as it unfolds, newest at the bottom. */}
            <div className="surface-flat flex min-h-0 w-3/5 flex-col">
                <div className="eyebrow flex items-center gap-2 px-7 pb-2 pt-5"><Icon name="scroll" size={16} /> Cronaca dello scontro</div>
                <div ref={combatLogRef} className="scroll-y fade-edges min-h-0 flex-1 px-7 pb-6">
                    <div className="flex flex-col gap-3 pt-3">
                        {log.map((entry, index) => {
                            const age = log.length - 1 - index;
                            return (
                                <p
                                    key={index}
                                    className={`prose-story text-[22px] leading-[1.5] ${age === 0 ? 'anim-fade-up' : ''}`}
                                    style={{ color: harmonize(entry.color, 'ink2'), opacity: Math.max(0.45, 1 - age * 0.08) }}
                                >
                                    {entry.text}
                                </p>
                            );
                        })}
                        {!activeCombat.playerTurn && (
                            <p className="flex items-center gap-2 text-[19px] italic text-ink3">
                                <span className="anim-breathe">Il nemico si muove</span>
                                <span className="anim-caret">…</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex min-h-0 w-2/5 flex-col gap-4">
                {/* You and the enemy. */}
                <div className="surface-flat flex flex-col gap-4 px-6 py-5">
                    <StatMeter icon="heart" label="Tu" value={hp.current} max={hp.max} tone="sage" critical={hpCritical} />
                    <div className="flex items-center gap-2.5 text-[18px] text-ink2">
                        <Icon name="weapon" size={20} className="text-ink3" />
                        <span className="min-w-0 flex-1 truncate">{weaponDetails ? weaponDetails.name : 'A mani nude'}</span>
                        {ammoId && <span className="chip text-ink2">{ammoCount} colpi</span>}
                    </div>
                    {(activeCombat.specialAmmoActive || activeCombat.enemyBurning || (activeCombat.enemyStunnedTurns ?? 0) > 0) && (
                        <div className="flex flex-wrap gap-2">
                            {activeCombat.specialAmmoActive && (
                                <span className="chip text-gold">Munizioni {SPECIAL_AMMO_NAMES[activeCombat.specialAmmoActive]}: {activeCombat.specialAmmoRounds}</span>
                            )}
                            {activeCombat.enemyBurning && <span className="chip text-ember">Il nemico brucia ({activeCombat.enemyBurningTurns})</span>}
                            {(activeCombat.enemyStunnedTurns ?? 0) > 0 && <span className="chip text-teal">Il nemico è bloccato</span>}
                        </div>
                    )}
                    <div className="hairline" />
                    <div>
                        <div className="mb-2 flex items-center gap-2.5">
                            <Icon name="skull" size={20} className="text-danger" />
                            <span className="min-w-0 flex-1 truncate text-[18px] text-ink2">{activeCombat.enemy.name}</span>
                            <span className="text-[18px] font-semibold text-ink">{getEnemyHealthDescription(activeCombat.enemyHp)}</span>
                        </div>
                        <div className="flex gap-1.5">
                            {[0, 1, 2, 3].map(i => (
                                <span
                                    key={i}
                                    className="h-1.5 flex-1 rounded-full transition-colors duration-500"
                                    style={{ background: i < segments ? 'rgb(var(--c-danger))' : 'rgb(var(--c-ink4) / 0.35)', boxShadow: i < segments ? '0 0 10px rgb(var(--c-danger) / 0.45)' : undefined }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* What to do. */}
                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="eyebrow mb-2 flex items-center gap-2">
                        {isItemMenuOpen ? <><Icon name="flask" size={16} /> Oggetti</> : <><Icon name="attack" size={16} /> Azioni</>}
                    </div>
                    <div className="scroll-y min-h-0 flex-1">
                        {isItemMenuOpen ? (
                            <ChoiceList
                                size="sm"
                                selected={itemMenuIndex}
                                active={activeCombat.playerTurn}
                                items={usableItems.map(item => ({
                                    id: item.itemId,
                                    icon: 'flask',
                                    label: itemDatabase[item.itemId]?.name ?? item.itemId,
                                    meta: `×${item.quantity}`,
                                }))}
                            />
                        ) : (
                            <ChoiceList
                                size="sm"
                                selected={menuIndex}
                                active={activeCombat.playerTurn}
                                items={menu.map(entry => {
                                    const environmental = entry.kind === 'action' && entry.payload.type === 'environmental';
                                    return {
                                        id: entry.name,
                                        icon: entry.kind === 'items' ? 'flask' : ACTION_ICONS[entry.payload.type],
                                        label: environmental ? entry.name.replace('[Ambiente] ', '') : entry.name,
                                        meta: environmental ? 'Ambiente' : undefined,
                                    };
                                })}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CombatScreen;
