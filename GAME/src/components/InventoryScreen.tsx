import React, { useMemo, useEffect, useRef } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { IItem, InventoryItem, ItemEffect } from '../types';
import { useInteractionStore } from '../store/interactionStore';

const DetailLine: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex">
        <span className="w-44 flex-shrink-0 opacity-70">{label}:</span>
        <span>{value}</span>
    </div>
);

const ITEM_TYPES: Record<string, string> = {
    weapon: 'Arma',
    armor: 'Armatura',
    consumable: 'Consumabile',
    material: 'Materiale',
    quest: 'Oggetto Missione',
    ammo: 'Munizioni',
    manual: 'Manuale',
    tool: 'Strumento',
    valuable: 'Oggetto di valore',
};

const RARITIES: Record<string, { text: string, color: string }> = {
    common: { text: 'Comune', color: '#a3a3a3' },
    uncommon: { text: 'Non Comune', color: '#22c55e' },
    rare: { text: 'Raro', color: '#3b82f6' },
    epic: { text: 'Epico', color: '#a855f7' },
    quest: { text: 'Missione', color: '#facc15' },
};

const formatEffect = (effect: ItemEffect): string => {
    const v = effect.value;
    switch (effect.type) {
        case 'heal': return `+${v} HP`;
        case 'satiety': return Number(v) >= 0 ? `+${v} Sazietà` : `${v} Sazietà`;
        case 'hydration': return Number(v) >= 0 ? `+${v} Idratazione` : `${v} Idratazione`;
        case 'fatigue': return `-${v} Stanchezza`;
        case 'cureStatus': return `Cura ${v}`;
        case 'light': return `Luce per ${v} ore`;
        case 'repair': return `Ripara ${v} punti`;
        case 'container': return `+${v} kg di capacità`;
        case 'vision': return 'Scruta l\'orizzonte';
        case 'shelter': return 'Riparo per la notte';
        case 'trap': return 'Trappola (combattimento)';
        case 'smoke': return 'Fuga garantita (combattimento)';
        case 'random': return 'Contenuto a sorpresa';
        case 'power': return 'Alimentazione';
        case 'fishing': return 'Pesca';
        case 'communication': return 'Radio';
        case 'fire': return 'Accende un fuoco';
        case 'repel': return `Tiene lontane le creature per ${v} ore`;
        case 'spoiled': return `Avariato (${v}% di ammalarsi)`;
        default: return String(effect.type);
    }
};

const ItemDetails: React.FC<{ item: IItem | null, invItem: InventoryItem | null }> = ({ item, invItem }) => {
    const itemDatabase = useItemDatabaseStore(state => state.itemDatabase);
    if (!item) {
        return <div className="h-full flex items-center justify-center text-green-400/50 text-3xl">Seleziona un oggetto per vederne i dettagli.</div>;
    }
    const rarity = RARITIES[item.rarity] ?? { text: item.rarity, color: '#ffffff' };
    const effects = item.effects?.map(formatEffect).join(' | ');
    const weaponType = item.weaponType === 'melee' ? 'Mischia' : item.weaponType === 'ranged' ? 'Distanza' : item.weaponType === 'thrown' ? 'Lancio' : item.weaponType;
    const slot = item.slot === 'head' ? 'Testa' : item.slot === 'legs' ? 'Gambe' : item.slot === 'chest' ? 'Torso' : item.slot;
    const durabilityLabel = item.type === 'tool' ? 'Usi rimasti' : 'Durabilità';

    return (
        <div className="space-y-4 text-3xl h-full flex flex-col">
            <h3 className="text-4xl font-bold mb-2 pb-2 border-b-2 border-green-400/20" style={{ color: item.color, textShadow: `0 0 8px ${item.color}` }}>
                {item.name}
            </h3>
            <p className="text-green-400/80 italic flex-grow h-28 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>{item.description}</p>
            <div className="flex-shrink-0 space-y-2 pt-4 border-t-2 border-green-400/20">
                <DetailLine label="Tipo" value={ITEM_TYPES[item.type] ?? item.type} />
                <DetailLine label="Rarità" value={<span style={{ color: rarity.color }}>{rarity.text}</span>} />
                <DetailLine label="Peso" value={`${item.weight} kg${invItem && invItem.quantity > 1 ? ` (tot. ${(item.weight * invItem.quantity).toFixed(1)} kg)` : ''}`} />
                <DetailLine label="Valore" value={item.value} />
                {invItem?.durability && <DetailLine label={durabilityLabel} value={`${invItem.durability.current} / ${invItem.durability.max}`} />}
                {item.damage !== undefined && <DetailLine label="Danno" value={item.damage} />}
                {weaponType && <DetailLine label="Tipo Arma" value={weaponType} />}
                {item.ammoType && <DetailLine label="Munizioni" value={itemDatabase[item.ammoType]?.name ?? item.ammoType} />}
                {item.defense !== undefined && <DetailLine label="Difesa" value={`+${item.defense + (invItem?.upgradeBonus ?? 0)} CA${invItem?.upgradeBonus ? ` (potenziata +${invItem.upgradeBonus})` : ''}`} />}
                {slot && <DetailLine label="Slot" value={slot} />}
                {effects && <DetailLine label="Effetti" value={effects} />}
                {item.consumes && <DetailLine label="Consuma" value={`${itemDatabase[item.consumes.itemId]?.name ?? item.consumes.itemId} x${item.consumes.quantity}`} />}
            </div>
        </div>
    );
};

const ActionMenu: React.FC = () => {
    const { options, selectedIndex, mode } = useInteractionStore(state => state.actionMenuState);
    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black border-2 border-green-400 shadow-lg shadow-green-500/20 p-2 z-10 min-w-[28rem]">
            {mode === 'repair' && <div className="text-2xl px-4 py-1 text-yellow-400 border-b border-green-400/40 mb-1">Cosa vuoi riparare?</div>}
            <ul className="text-3xl">
                {options.map((option, index) => (
                    <li key={`${option}-${index}`} className={`px-4 py-1 ${index === selectedIndex ? 'bg-green-400 text-black' : ''}`}>
                        {index === selectedIndex && '> '}{option}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const InventoryScreen: React.FC = () => {
    const {
        toggleInventory, inventorySelectedIndex, setInventorySelectedIndex, actionMenuState,
        openActionMenu, navigateActionMenu, confirmActionMenuSelection, closeActionMenu,
    } = useInteractionStore();
    const inventory = useCharacterStore(s => s.inventory);
    const equippedWeapon = useCharacterStore(s => s.equippedWeapon);
    const equippedHead = useCharacterStore(s => s.equippedHead);
    const equippedArmor = useCharacterStore(s => s.equippedArmor);
    const equippedLegs = useCharacterStore(s => s.equippedLegs);
    const attributes = useCharacterStore(s => s.attributes);
    const itemDatabase = useItemDatabaseStore(state => state.itemDatabase);

    const selectedInvItem = inventory[inventorySelectedIndex] ?? null;
    const selectedItemDetails = selectedInvItem ? itemDatabase[selectedInvItem.itemId] ?? null : null;
    const selectedItemRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        selectedItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [inventorySelectedIndex]);

    const handlerMap = useMemo(() => actionMenuState.isOpen
        ? {
            w: () => navigateActionMenu(-1), ArrowUp: () => navigateActionMenu(-1),
            s: () => navigateActionMenu(1), ArrowDown: () => navigateActionMenu(1),
            Enter: () => {
                // "Annulla" closes the menu in every mode.
                if (actionMenuState.options[actionMenuState.selectedIndex] === 'Annulla') closeActionMenu();
                else confirmActionMenuSelection();
            },
            Escape: closeActionMenu,
        }
        : {
            i: toggleInventory, I: toggleInventory, Escape: toggleInventory,
            w: () => setInventorySelectedIndex(prev => prev - 1), ArrowUp: () => setInventorySelectedIndex(prev => prev - 1),
            s: () => setInventorySelectedIndex(prev => prev + 1), ArrowDown: () => setInventorySelectedIndex(prev => prev + 1),
            Enter: () => { if (selectedItemDetails) openActionMenu(); },
        }, [actionMenuState, navigateActionMenu, confirmActionMenuSelection, closeActionMenu, toggleInventory, setInventorySelectedIndex, openActionMenu, selectedItemDetails]);

    useKeyboardInput(handlerMap);

    // inventory and attributes drive the weight figures below.
    const { totalWeight, maxCarryWeight } = useMemo(() => {
        const character = useCharacterStore.getState();
        return { totalWeight: character.getTotalWeight(), maxCarryWeight: character.getMaxCarryWeight() };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inventory, attributes, itemDatabase]);
    const ratio = maxCarryWeight > 0 ? totalWeight / maxCarryWeight : 0;
    const weightColor = ratio > 1 ? 'var(--text-danger)' : ratio >= 0.8 ? 'var(--text-accent)' : 'var(--text-primary)';
    const equipped = new Set([equippedWeapon, equippedHead, equippedArmor, equippedLegs].filter((i): i is number => i !== null));

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6 relative">
                {actionMenuState.isOpen && <ActionMenu />}
                <div className="text-center mb-6">
                    <h1 className="text-6xl font-bold tracking-widest uppercase">═══ INVENTARIO ═══</h1>
                    <div className={`text-3xl mt-2 ${ratio > 1 ? 'animate-pulse' : ''}`} style={{ color: weightColor }}>
                        Peso: {totalWeight.toFixed(1)} / {maxCarryWeight.toFixed(1)} kg
                        {ratio > 1 && <span className="ml-2 text-2xl">[SOVRACCARICO: ti stanchi il doppio]</span>}
                    </div>
                </div>
                <div className="flex-grow flex space-x-6 overflow-hidden">
                    <div className="w-2/5 h-full border-2 border-green-400/30 p-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {inventory.length > 0 ? (
                            <ul className="space-y-2 text-4xl">
                                {inventory.map((invItem, index) => {
                                    const details = itemDatabase[invItem.itemId];
                                    const isSelected = index === inventorySelectedIndex;
                                    let name = details?.name ?? `[${invItem.itemId}]`;
                                    if (invItem.durability) {
                                        name += invItem.durability.current <= 0 ? ' [ROTTO]' : ` (${invItem.durability.current}/${invItem.durability.max})`;
                                    }
                                    if (invItem.quantity > 1) name += ` x${invItem.quantity}`;
                                    if (equipped.has(index)) name += ' (E)';
                                    return (
                                        <li
                                            key={index}
                                            ref={isSelected ? selectedItemRef : null}
                                            className={`pl-4 py-1 ${isSelected ? 'bg-green-400 text-black' : ''}`}
                                            style={{ color: isSelected ? undefined : details?.color }}
                                        >
                                            {isSelected ? `> ${name}` : `  ${name}`}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-green-400/50 text-4xl text-center h-full flex items-center justify-center">-- Inventario Vuoto --</div>
                        )}
                    </div>
                    <div className="w-3/5 h-full border-2 border-green-400/30 p-4">
                        <ItemDetails item={selectedItemDetails} invItem={selectedInvItem} />
                    </div>
                </div>
                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    {actionMenuState.isOpen ? '[↑↓] Scegli | [INVIO] Conferma | [ESC] Indietro' : '[W/S / ↑↓] Seleziona | [INVIO] Azioni | [ESC/I] Chiudi'}
                </div>
            </div>
        </div>
    );
};

export default InventoryScreen;
