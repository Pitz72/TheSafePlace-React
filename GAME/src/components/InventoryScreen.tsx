import React, { useMemo, useEffect, useRef } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { IItem, InventoryItem, ItemEffect } from '../types';
import { useInteractionStore } from '../store/interactionStore';
import Modal from './ui/Modal';
import Icon, { IconName } from './ui/Icon';
import ChoiceList from './ui/ChoiceList';
import { Meter } from './ui/Meter';
import { Tone, harmonize, toneColor } from '../utils/palette';

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

const RARITIES: Record<string, { text: string, tone: Tone }> = {
    common: { text: 'Comune', tone: 'ink2' },
    uncommon: { text: 'Non Comune', tone: 'sage' },
    rare: { text: 'Raro', tone: 'lena' },
    epic: { text: 'Epico', tone: 'violet' },
    quest: { text: 'Missione', tone: 'gold' },
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

const EFFECT_ICONS: Partial<Record<ItemEffect['type'], IconName>> = {
    heal: 'heart', satiety: 'food', hydration: 'drop', fatigue: 'fatigue', cureStatus: 'flask', light: 'flame',
    repair: 'hammer', container: 'backpack', vision: 'eye', shelter: 'tent', trap: 'attack', smoke: 'flee',
    random: 'sparkle', power: 'bolt', fishing: 'water', communication: 'radio', fire: 'campfire', repel: 'shield', spoiled: 'warning',
};

/** Icon of an item: by category, and for consumables by what they restore. */
const itemIcon = (item: IItem): IconName => {
    switch (item.type) {
        case 'weapon': return 'weapon';
        case 'armor': return item.slot === 'head' ? 'helmet' : item.slot === 'legs' ? 'legs' : 'torso';
        case 'ammo': return 'attack';
        case 'material': return 'weight';
        case 'quest': return 'star';
        case 'manual': return 'book';
        case 'tool': return 'hammer';
        case 'valuable': return 'coins';
        case 'consumable':
            if (item.effects?.some(e => e.type === 'heal' || e.type === 'cureStatus')) return 'heart';
            if (item.effects?.some(e => e.type === 'hydration')) return 'drop';
            if (item.effects?.some(e => e.type === 'satiety')) return 'food';
            return 'flask';
        default: return 'diamond';
    }
};

const Stat: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="rounded-xl border border-line bg-white/[0.025] px-4 py-3">
        <div className="font-cond text-[15px] font-semibold uppercase tracking-[0.18em] text-ink4">{label}</div>
        <div className="mt-1 text-[21px] leading-snug text-ink">{value}</div>
    </div>
);

const ItemDetails: React.FC<{ item: IItem | null, invItem: InventoryItem | null, equipped: boolean }> = ({ item, invItem, equipped }) => {
    const itemDatabase = useItemDatabaseStore(state => state.itemDatabase);
    if (!item) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-ink4">
                <Icon name="backpack" size={48} strokeWidth={1.3} />
                <p className="prose-story text-[22px] italic text-ink3">Seleziona un oggetto per vederne i dettagli.</p>
            </div>
        );
    }
    const rarity = RARITIES[item.rarity] ?? { text: item.rarity, tone: 'ink2' as Tone };
    const color = harmonize(item.color);
    const weaponType = item.weaponType === 'melee' ? 'Mischia' : item.weaponType === 'ranged' ? 'Distanza' : item.weaponType === 'thrown' ? 'Lancio' : item.weaponType;
    const slot = item.slot === 'head' ? 'Testa' : item.slot === 'legs' ? 'Gambe' : item.slot === 'chest' ? 'Torso' : item.slot;
    const durabilityLabel = item.type === 'tool' ? 'Usi rimasti' : 'Durabilità';
    const durability = invItem?.durability;

    return (
        <div key={item.id} className="flex h-full flex-col anim-fade-in">
            <div className="flex items-start gap-5">
                <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-2xl border" style={{ color, borderColor: 'currentColor', background: 'color-mix(in srgb, currentColor 12%, transparent)' }}>
                    <Icon name={itemIcon(item)} size={36} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="title-display text-[44px] text-ink">{item.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="chip text-ink2">{ITEM_TYPES[item.type] ?? item.type}</span>
                        <span className="chip" style={{ color: toneColor(rarity.tone) }}>{rarity.text}</span>
                        {equipped && <span className="chip text-ember">Equipaggiato</span>}
                        {durability && durability.current <= 0 && <span className="chip text-danger">Rotto</span>}
                    </div>
                </div>
            </div>

            <p className="prose-story scroll-y mt-6 max-h-[150px] text-[21px] italic text-ink2">{item.description}</p>

            <div className="hairline my-6" />

            <div className="grid grid-cols-3 gap-3">
                <Stat label="Peso" value={<span className="tnum">{item.weight} kg{invItem && invItem.quantity > 1 && <span className="text-ink3"> · tot. {(item.weight * invItem.quantity).toFixed(1)}</span>}</span>} />
                <Stat label="Valore" value={<span className="tnum">{item.value}</span>} />
                {invItem && invItem.quantity > 1 && <Stat label="Quantità" value={<span className="tnum">×{invItem.quantity}</span>} />}
                {durability && (
                    <Stat
                        label={durabilityLabel}
                        value={
                            <div>
                                <span className="tnum">{durability.current} / {durability.max}</span>
                                <Meter value={durability.current} max={durability.max} tone={durability.current / durability.max < 0.3 ? 'danger' : 'sage'} height={4} className="mt-2" />
                            </div>
                        }
                    />
                )}
                {item.damage !== undefined && <Stat label="Danno" value={<span className="tnum">{item.damage}</span>} />}
                {weaponType && <Stat label="Tipo arma" value={weaponType} />}
                {item.ammoType && <Stat label="Munizioni" value={itemDatabase[item.ammoType]?.name ?? item.ammoType} />}
                {item.defense !== undefined && (
                    <Stat label="Difesa" value={<span className="tnum">+{item.defense + (invItem?.upgradeBonus ?? 0)} CA{invItem?.upgradeBonus ? <span className="text-sage"> · potenziata +{invItem.upgradeBonus}</span> : null}</span>} />
                )}
                {slot && <Stat label="Slot" value={slot} />}
                {item.consumes && <Stat label="Consuma" value={`${itemDatabase[item.consumes.itemId]?.name ?? item.consumes.itemId} ×${item.consumes.quantity}`} />}
            </div>

            {item.effects && item.effects.length > 0 && (
                <div className="mt-6">
                    <div className="eyebrow mb-3">Effetti</div>
                    <div className="flex flex-wrap gap-2.5">
                        {item.effects.map((effect, index) => (
                            <span key={index} className="flex items-center gap-2 rounded-full border border-line2 bg-white/[0.03] px-4 py-1.5 text-[19px] text-ink">
                                <Icon name={EFFECT_ICONS[effect.type] ?? 'sparkle'} size={18} className={effect.type === 'spoiled' ? 'text-danger' : 'text-ember2'} />
                                {formatEffect(effect)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionMenu: React.FC = () => {
    const { options, selectedIndex, mode } = useInteractionStore(state => state.actionMenuState);
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6" style={{ background: 'rgb(var(--c-bg0) / 0.55)' }}>
            <div className="surface flex max-h-full w-[560px] flex-col px-8 py-7 anim-scale-in" style={{ background: 'var(--glass-strong)' }}>
                <div className="eyebrow mb-4 flex flex-shrink-0 items-center gap-2.5 text-accent">
                    <Icon name={mode === 'repair' ? 'hammer' : 'sparkle'} size={18} />
                    {mode === 'repair' ? 'Cosa vuoi riparare?' : 'Azioni'}
                </div>
                {/* Long repair lists scroll inside the card: the prompt and "Annulla" stay reachable. */}
                <div className="scroll-y min-h-0 flex-1">
                    <ChoiceList
                        size="md"
                        selected={selectedIndex}
                        items={options.map((option, index) => ({ id: `${option}-${index}`, label: option, icon: option === 'Annulla' ? 'arrowLeft' : undefined }))}
                    />
                </div>
            </div>
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
        selectedItemRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
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
    const weightTone: Tone = ratio > 1 ? 'danger' : ratio >= 0.8 ? 'gold' : 'sage';
    const equipped = new Set([equippedWeapon, equippedHead, equippedArmor, equippedLegs].filter((i): i is number => i !== null));

    return (
        <Modal
            eyebrow="Zaino"
            icon="backpack"
            title="Inventario"
            size="xl"
            className="h-full"
            aside={
                <div className="w-[340px] text-right">
                    <div className="tnum text-[30px] font-semibold leading-none" style={{ color: toneColor(ratio > 1 ? 'danger' : 'ink') }}>
                        {totalWeight.toFixed(1)}<span className="text-[20px] font-normal text-ink3"> / {maxCarryWeight.toFixed(1)} kg</span>
                    </div>
                    <Meter value={totalWeight} max={maxCarryWeight} tone={weightTone} className="mt-3" />
                    {ratio > 1 && <div className="mt-2 text-[17px] text-danger anim-breathe">Sovraccarico: ti stanchi il doppio</div>}
                </div>
            }
            hints={actionMenuState.isOpen
                ? [{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }, { keys: ['ESC'], label: 'Indietro' }]
                : [{ keys: ['↑↓'], label: 'Seleziona' }, { keys: ['INVIO'], label: 'Azioni' }, { keys: ['ESC', 'I'], label: 'Chiudi' }]}
        >
            <div className="flex h-full gap-6 px-12 pb-8">
                <div className="scroll-y fade-edges w-[44%] flex-shrink-0 py-2 pr-1">
                    {inventory.length > 0 ? (
                        <ul className="flex flex-col gap-1">
                            {inventory.map((invItem, index) => {
                                const details = itemDatabase[invItem.itemId];
                                const isSelected = index === inventorySelectedIndex;
                                const broken = !!invItem.durability && invItem.durability.current <= 0;
                                return (
                                    <li
                                        key={index}
                                        ref={isSelected ? selectedItemRef : null}
                                        className={`choice !gap-3.5 !py-3 text-[21px] ${isSelected ? 'is-selected' : ''}`}
                                    >
                                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ color: harmonize(details?.color), background: 'color-mix(in srgb, currentColor 13%, transparent)' }}>
                                            {details && <Icon name={itemIcon(details)} size={19} />}
                                        </span>
                                        <span className={`min-w-0 flex-1 truncate ${broken ? 'text-danger' : isSelected ? 'text-ink' : 'text-ink2'}`}>
                                            {details?.name ?? `[${invItem.itemId}]`}
                                        </span>
                                        {equipped.has(index) && <span className="rounded border border-ember/50 px-1.5 font-cond text-[15px] font-semibold tracking-wider text-ember">E</span>}
                                        {invItem.durability && (
                                            <span className={`tnum text-[16px] ${broken ? 'text-danger' : 'text-ink4'}`}>
                                                {broken ? 'rotto' : `${invItem.durability.current}/${invItem.durability.max}`}
                                            </span>
                                        )}
                                        {invItem.quantity > 1 && <span className="tnum w-12 text-right text-[18px] text-ink3">×{invItem.quantity}</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-ink4">
                            <Icon name="backpack" size={44} strokeWidth={1.3} />
                            <p className="prose-story text-[22px] italic text-ink3">Lo zaino è vuoto.</p>
                        </div>
                    )}
                </div>
                <div className="surface-flat relative min-w-0 flex-1 overflow-hidden px-9 py-8">
                    <ItemDetails item={selectedItemDetails} invItem={selectedInvItem} equipped={equipped.has(inventorySelectedIndex)} />
                    {actionMenuState.isOpen && <ActionMenu />}
                </div>
            </div>
        </Modal>
    );
};

export default InventoryScreen;
