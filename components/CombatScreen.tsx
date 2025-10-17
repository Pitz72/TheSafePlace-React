import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { Stat, InventoryItem } from '../types';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useCombatStore } from '../store/combatStore';

const getEnemyHealthDescription = (hpState: Stat): string => {
    const ratio = hpState.current / hpState.max;
    if (ratio > 0.9) return "Illeso";
    if (ratio > 0.6) return "Leggermente Ferito";
    if (ratio > 0.3) return "Ferito";
    if (ratio > 0) return "In Fin di Vita";
    return "Sconfitto";
};

type CombatAction = 
    | { type: 'attack' | 'analyze' | 'use_item' | 'flee'; name: string }
    | { type: 'tactic'; name: string; id: string };

const CombatScreen: React.FC = () => {
    const { activeCombat, playerCombatAction, cleanupCombat } = useCombatStore();
    const hp = useCharacterStore(state => state.hp);
    const inventory = useCharacterStore(state => state.inventory);
    const { itemDatabase } = useItemDatabaseStore();
    
    const [mainMenuIndex, setMainMenuIndex] = useState(0);
    const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);
    const [itemMenuIndex, setItemMenuIndex] = useState(0);

    const combatLogRef = useRef<HTMLDivElement>(null);

    const usableItems = useMemo((): InventoryItem[] => {
        return inventory.filter(invItem => {
            const details = itemDatabase[invItem.itemId];
            return details && (details.type === 'consumable' || details.weaponType === 'thrown');
        });
    }, [inventory, itemDatabase]);

    const availableActions = useMemo((): CombatAction[] => {
        if (!activeCombat) return [];
        const baseActions: CombatAction[] = [
            { type: 'attack', name: 'Attacca' },
            { type: 'analyze', name: 'Analizza' },
        ];
        if (usableItems.length > 0) {
            baseActions.push({ type: 'use_item', name: 'Usa Oggetto' });
        }
        baseActions.push({ type: 'flee', name: 'Fuggi' });

        const tacticalActions: CombatAction[] = activeCombat.availableTacticalActions.map(tactic => ({
            type: 'tactic',
            name: tactic.name,
            id: tactic.id
        }));
        return [...baseActions, ...tacticalActions];
    }, [activeCombat, usableItems.length]);

    // Auto-scroll combat log
    useEffect(() => {
        if (combatLogRef.current) {
            combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
        }
    }, [activeCombat?.log]);
    
    // Reset selected index when menus change
    useEffect(() => setMainMenuIndex(0), [availableActions.length]);
    useEffect(() => setItemMenuIndex(0), [isItemMenuOpen]);


    const handleNavigate = useCallback((direction: number) => {
        if (!activeCombat?.playerTurn) return;
        setMainMenuIndex(prev => (prev + direction + availableActions.length) % availableActions.length);
    }, [activeCombat, availableActions.length]);

    const handleItemMenuNavigate = useCallback((direction: number) => {
        setItemMenuIndex(prev => (prev + direction + usableItems.length) % usableItems.length);
    }, [usableItems.length]);

    const handleConfirm = useCallback(() => {
        if (!activeCombat?.playerTurn || !availableActions[mainMenuIndex]) return;
        
        const action = availableActions[mainMenuIndex];
        if (action.type === 'use_item') {
            setIsItemMenuOpen(true);
        } else if (action.type === 'tactic') {
            playerCombatAction({ type: 'tactic', tacticId: action.id });
        } else {
            playerCombatAction({ type: action.type as 'attack' | 'analyze' | 'flee' });
        }
    }, [activeCombat, mainMenuIndex, availableActions, playerCombatAction]);

    const handleItemConfirm = useCallback(() => {
        const selectedItem = usableItems[itemMenuIndex];
        if (selectedItem) {
            playerCombatAction({ type: 'use_item', itemId: selectedItem.itemId });
            setIsItemMenuOpen(false);
        }
    }, [itemMenuIndex, usableItems, playerCombatAction]);


    const handlerMap = useMemo(() => {
        if (!activeCombat) return {};
        if (activeCombat.victory) {
            return { Enter: cleanupCombat };
        }
        if (!activeCombat.playerTurn) return {};

        if (isItemMenuOpen) {
            return {
                'w': () => handleItemMenuNavigate(-1), 'ArrowUp': () => handleItemMenuNavigate(-1),
                's': () => handleItemMenuNavigate(1), 'ArrowDown': () => handleItemMenuNavigate(1),
                'Enter': handleItemConfirm,
                'Escape': () => setIsItemMenuOpen(false),
            };
        } else {
            return {
                'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
                's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
                'Enter': handleConfirm,
            };
        }
    }, [activeCombat, isItemMenuOpen, handleNavigate, handleConfirm, handleItemMenuNavigate, handleItemConfirm, cleanupCombat]);

    useKeyboardInput(handlerMap);

    if (!activeCombat) return null;

    if (activeCombat.victory) {
        return (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
                <div className="w-full h-full max-w-7xl border-8 border-double border-[var(--text-danger)]/50 flex flex-col p-6 items-center justify-center">
                    <h2 className="text-6xl text-[var(--text-accent)] mb-8 animate-pulse">VITTORIA</h2>
                    <div className="text-3xl text-[var(--text-primary)] space-y-4 mb-12 text-center">
                       <p>{activeCombat.log[activeCombat.log.length - 2]?.text}</p>
                       <p className="italic text-[var(--text-secondary)]/70">{activeCombat.log[activeCombat.log.length - 1]?.text}</p>
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
                    {/* Combat Log (Left Column) */}
                    <div ref={combatLogRef} className="w-3/5 h-full border-2 border-[var(--border-primary)] p-4 bg-black/30 overflow-y-auto text-3xl" style={{ scrollbarWidth: 'none' }}>
                        {activeCombat.log.map((entry, index) => (
                            <p key={index} style={{ color: entry.color || 'var(--text-secondary)' }} className="mb-1">{`> ${entry.text}`}</p>
                        ))}
                        {!activeCombat.playerTurn && <span className="animate-cursor-blink text-4xl">_</span>}
                    </div>

                    {/* Info & Actions (Right Column) */}
                    <div className="w-2/5 h-full flex flex-col">
                        <div className="flex-grow flex flex-col border-2 border-[var(--border-primary)] p-4">
                             {/* Status */}
                            <div className="border-b-2 border-[var(--text-danger)]/30 pb-2 mb-2 text-3xl">
                                 <div className="flex justify-between"><span>TU:</span> <span className="font-bold">{hp.current}/{hp.max} HP</span></div>
                                 <div className="flex justify-between"><span>{activeCombat.enemy.name}:</span> <span className="font-bold">{getEnemyHealthDescription(activeCombat.enemyHp)}</span></div>
                            </div>
                            
                            {/* Actions */}
                            <h2 className="text-3xl mb-2">AZIONI:</h2>
                            <div className="grid grid-cols-1 gap-y-2 text-4xl mt-auto">
                                {isItemMenuOpen ? (
                                     usableItems.map((item, index) => {
                                        const details = itemDatabase[item.itemId];
                                        const isSelected = index === itemMenuIndex;
                                        return (
                                            <div key={item.itemId + index} className={`${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''} pl-2`}>
                                               {isSelected ? '> ' : ''}{details.name} x{item.quantity}
                                            </div>
                                        );
                                     })
                                ) : (
                                    availableActions.map((action, index) => {
                                        const isSelected = index === mainMenuIndex;
                                        const isDisabled = !activeCombat.playerTurn;
                                        return (
                                            <div key={action.name} className={`${isSelected && !isDisabled ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : ''} ${isDisabled ? 'text-[var(--text-secondary)]/50' : ''} pl-2`}>
                                               {isSelected && !isDisabled ? '> ' : ''}{action.name}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
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