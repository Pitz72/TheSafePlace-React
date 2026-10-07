import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { PlayerCombatActionPayload, SpecialAmmoType, Stat } from '../types';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useCombatStore, isCombatUsable, SPECIAL_AMMO_ITEMS, SPECIAL_AMMO_NAMES } from '../store/combatStore';
import { audioManager } from '../utils/audio';

const getEnemyHealthDescription = (hp: Stat): string => {
    const ratio = hp.current / hp.max;
    if (ratio > 0.9) return 'Illeso';
    if (ratio > 0.6) return 'Leggermente Ferito';
    if (ratio > 0.3) return 'Ferito';
    if (ratio > 0) return 'In Fin di Vita';
    return 'Sconfitto';
};

type MenuEntry =
    | { kind: 'action'; name: string; payload: PlayerCombatActionPayload }
    | { kind: 'items'; name: string };

const FIREARM_AMMO = new Set(['ammo_9mm', 'ammo_rifle', 'ammo_shotgun']);

const CombatScreen: React.FC = () => {
    const { activeCombat, playerCombatAction, cleanupCombat } = useCombatStore();
    const hp = useCharacterStore(state => state.hp);
    const inventory = useCharacterStore(state => state.inventory);
    const equippedWeapon = useCharacterStore(state => state.equippedWeapon);
    const itemDatabase = useItemDatabaseStore(state => state.itemDatabase);

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

    if (activeCombat.victory) {
        // Everything logged from the killing blow on: XP and loot.
        const summary = activeCombat.log.slice(activeCombat.victoryLogStart ?? Math.max(0, activeCombat.log.length - 4));
        return (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
                <div className="w-full h-full max-w-7xl border-8 border-double border-[var(--text-danger)]/50 flex flex-col p-6 items-center justify-center">
                    <h2 className="text-6xl text-[var(--text-accent)] mb-8 animate-pulse">VITTORIA</h2>
                    <div className="text-3xl text-[var(--text-primary)] space-y-3 mb-12 text-center max-h-[60%] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {summary.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>{entry.text}</p>
                        ))}
                    </div>
                    <p className="text-4xl animate-pulse">[INVIO] per continuare</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-7xl border-8 border-double border-[var(--text-danger)]/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-4 text-[var(--text-danger)]" style={{ textShadow: '0 0 8px var(--text-danger)' }}>
                    ═══ COMBATTIMENTO ═══
                </h1>
                <div className="flex-grow flex space-x-6 overflow-hidden">
                    <div ref={combatLogRef} className="w-3/5 h-full border-2 border-[var(--border-primary)] p-4 bg-black/30 overflow-y-auto text-3xl" style={{ scrollbarWidth: 'none' }}>
                        {activeCombat.log.map((entry, index) => (
                            <p key={index} style={{ color: entry.color || 'var(--text-secondary)' }} className="mb-1">{`> ${entry.text}`}</p>
                        ))}
                        {!activeCombat.playerTurn && <span className="animate-cursor-blink text-4xl">_</span>}
                    </div>
                    <div className="w-2/5 h-full flex flex-col border-2 border-[var(--border-primary)] p-4">
                        <div className="border-b-2 border-[var(--text-danger)]/30 pb-2 mb-2 text-3xl space-y-1">
                            <div className="flex justify-between"><span>TU:</span> <span className="font-bold">{hp.current}/{hp.max} HP</span></div>
                            <div className="flex justify-between"><span>{activeCombat.enemy.name}:</span> <span className="font-bold">{getEnemyHealthDescription(activeCombat.enemyHp)}</span></div>
                            <div className="flex justify-between text-2xl opacity-80">
                                <span>Arma:</span>
                                <span>{weaponDetails ? weaponDetails.name : 'A mani nude'}{ammoId ? ` (${ammoCount} colpi)` : ''}</span>
                            </div>
                            {activeCombat.specialAmmoActive && (
                                <div className="text-2xl text-amber-400">Munizioni {SPECIAL_AMMO_NAMES[activeCombat.specialAmmoActive]}: {activeCombat.specialAmmoRounds}</div>
                            )}
                            {activeCombat.enemyBurning && <div className="text-2xl text-orange-400">Il nemico brucia ({activeCombat.enemyBurningTurns})</div>}
                            {(activeCombat.enemyStunnedTurns ?? 0) > 0 && <div className="text-2xl text-cyan-300">Il nemico è bloccato</div>}
                        </div>
                        <h2 className="text-3xl mb-2">{isItemMenuOpen ? 'OGGETTI:' : 'AZIONI:'}</h2>
                        <div className="grid grid-cols-1 gap-y-2 text-3xl mt-auto overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            {isItemMenuOpen
                                ? usableItems.map((item, index) => {
                                    const isSelected = index === itemMenuIndex;
                                    return (
                                        <div key={item.itemId} className={`${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''} pl-2`}>
                                            {isSelected ? '> ' : ''}{itemDatabase[item.itemId]?.name ?? item.itemId} x{item.quantity}
                                        </div>
                                    );
                                })
                                : menu.map((entry, index) => {
                                    const isSelected = index === menuIndex && activeCombat.playerTurn;
                                    return (
                                        <div key={entry.name} className={`${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''} ${!activeCombat.playerTurn ? 'text-[var(--text-secondary)]/50' : ''} pl-2`}>
                                            {isSelected ? '> ' : ''}{entry.name}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-[var(--border-primary)] pt-3">
                    {isItemMenuOpen ? '[↑↓] Seleziona | [INVIO] Usa | [ESC] Indietro' : '[↑↓] Naviga | [INVIO] Conferma'}
                </div>
            </div>
        </div>
    );
};

export default CombatScreen;
