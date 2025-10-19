import React, { useCallback, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { IItem, InventoryItem } from '../types';
import { useInteractionStore } from '../store/interactionStore';

/**
 * DetailLine component.
 * This component renders a line of detail with a label and a value.
 * @param {object} props - The props for the component.
 * @param {string} props.label - The label for the detail.
 * @param {React.ReactNode} props.value - The value for the detail.
 * @returns {JSX.Element} The rendered DetailLine component.
 */
const DetailLine: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex">
        <span className="w-36 flex-shrink-0 opacity-70">{label}:</span>
        <span>{value}</span>
    </div>
);

/**
 * ItemDetails component.
 * This component renders the details of a selected item.
 * @param {object} props - The props for the component.
 * @param {IItem | null} props.item - The item to display details for.
 * @param {InventoryItem | null} props.invItem - The inventory item to display details for.
 * @returns {JSX.Element} The rendered ItemDetails component.
 */
const ItemDetails: React.FC<{ item: IItem | null, invItem: InventoryItem | null }> = ({ item, invItem }) => {
    if (!item) {
        return (
            <div className="h-full flex items-center justify-center text-green-400/50 text-3xl">
                Seleziona un oggetto per vederne i dettagli.
            </div>
        );
    }

    const formattedEffects = item.effects?.map(e => `${e.type} (+${e.value})`).join(', ');

    return (
        <div className="space-y-4 text-3xl h-full flex flex-col">
            <h3 className="text-4xl font-bold mb-2 pb-2 border-b-2 border-green-400/20" style={{ color: item.color, textShadow: `0 0 8px ${item.color}` }}>
                {item.name}
            </h3>
            <p className="text-green-400/80 italic flex-grow h-28 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {item.description}
            </p>
            <div className="flex-shrink-0 space-y-3 pt-4 border-t-2 border-green-400/20">
                <DetailLine label="Tipo" value={item.type} />
                <DetailLine label="Rarità" value={item.rarity} />
                <DetailLine label="Peso" value={item.weight} />
                <DetailLine label="Valore" value={item.value} />
                {invItem?.durability && <DetailLine label="Durabilità" value={`${invItem.durability.current} / ${invItem.durability.max}`} />}
                {item.damage !== undefined && <DetailLine label="Danno" value={item.damage} />}
                {item.weaponType && <DetailLine label="Tipo Arma" value={item.weaponType} />}
                {item.defense !== undefined && <DetailLine label="Difesa" value={item.defense} />}
                {item.slot && <DetailLine label="Slot" value={item.slot} />}
                {formattedEffects && <DetailLine label="Effetti" value={formattedEffects} />}
            </div>
        </div>
    );
};

/**
 * ActionMenu component.
 * This component renders the action menu for an item.
 * @returns {JSX.Element} The rendered ActionMenu component.
 */
const ActionMenu: React.FC = () => {
    const { options, selectedIndex } = useInteractionStore(state => state.actionMenuState);

    return (
        <div className="absolute bg-black border-2 border-green-400 shadow-lg shadow-green-500/20 p-2 z-10">
            <ul className="text-3xl">
                {options.map((option, index) => (
                    <li key={option} className={`px-4 py-1 ${index === selectedIndex ? 'bg-green-400 text-black' : ''}`}>
                       {index === selectedIndex && '> '}{option}
                    </li>
                ))}
            </ul>
        </div>
    );
};

/**
 * InventoryScreen component.
 * This component renders the inventory screen.
 * @returns {JSX.Element} The rendered InventoryScreen component.
 */

const InventoryScreen: React.FC = () => {
    const { 
        toggleInventory, 
        inventorySelectedIndex, 
        setInventorySelectedIndex, 
        actionMenuState, 
        openActionMenu, 
        navigateActionMenu, 
        confirmActionMenuSelection, 
        closeActionMenu 
    } = useInteractionStore();
    
    const inventory = useCharacterStore(s => s.inventory);
    const equippedWeapon = useCharacterStore(s => s.equippedWeapon);
    const equippedHead = useCharacterStore(s => s.equippedHead);
    const equippedArmor = useCharacterStore(s => s.equippedArmor);
    const equippedLegs = useCharacterStore(s => s.equippedLegs);
    const itemDatabase = useItemDatabaseStore((state) => state.itemDatabase);

    const displayInventory = inventory;
    
    const selectedInvItem = displayInventory.length > 0 ? displayInventory[inventorySelectedIndex] : null;
    const selectedItemDetails = selectedInvItem ? itemDatabase[selectedInvItem.itemId] : null;

    const keyHandler = useCallback((key: string) => {
        if (actionMenuState.isOpen) {
            switch (key) {
                case 'w':
                case 'ArrowUp':
                    navigateActionMenu(-1);
                    break;
                case 's':
                case 'ArrowDown':
                    navigateActionMenu(1);
                    break;
                case 'Enter':
                    confirmActionMenuSelection();
                    break;
                case 'Escape':
                    closeActionMenu();
                    break;
            }
        } else {
            switch (key) {
                case 'i':
                case 'I':
                case 'Escape':
                    toggleInventory();
                    break;
                case 'w':
                case 'ArrowUp':
                    setInventorySelectedIndex(prev => prev - 1);
                    break;
                case 's':
                case 'ArrowDown':
                    setInventorySelectedIndex(prev => prev + 1);
                    break;
                case 'Enter':
                    if (selectedItemDetails) openActionMenu();
                    break;
            }
        }
    }, [
        actionMenuState.isOpen, 
        navigateActionMenu, 
        confirmActionMenuSelection, 
        toggleInventory, 
        setInventorySelectedIndex, 
        openActionMenu,
        closeActionMenu,
        selectedItemDetails
    ]);

    const handlerMap = useMemo(() => ({
        'i': () => keyHandler('i'), 'I': () => keyHandler('I'), 'Escape': () => keyHandler('Escape'),
        'w': () => keyHandler('w'), 'ArrowUp': () => keyHandler('ArrowUp'),
        's': () => keyHandler('s'), 'ArrowDown': () => keyHandler('ArrowDown'),
        'Enter': () => keyHandler('Enter'),
    }), [keyHandler]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6 relative">
                {actionMenuState.isOpen && <ActionMenu />}

                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ INVENTARIO ═══</h1>
                <div className="flex-grow flex space-x-6 overflow-hidden">
                    {/* Item List */}
                    <div className="w-2/5 h-full border-2 border-green-400/30 p-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                       {displayInventory.length > 0 ? (
                           <ul className="space-y-2 text-4xl">
                               {displayInventory.map((invItem, index) => {
                                   const itemDetails = itemDatabase[invItem.itemId];
                                   if (!itemDetails) return null;
                                   
                                   const isSelected = index === inventorySelectedIndex;
                                   const isEquipped = index === equippedWeapon || 
                                                     index === equippedHead || 
                                                     index === equippedArmor || 
                                                     index === equippedLegs;
                                   
                                   let displayName = itemDetails.name;
                                   if (invItem.durability) {
                                     if (invItem.durability.current <= 0) {
                                       displayName += ' [ROTTO]';
                                     } else {
                                       displayName += ` (${invItem.durability.current}/${invItem.durability.max})`;
                                     }
                                   }
                                   if (invItem.quantity > 1) {
                                     displayName += ` x${invItem.quantity}`;
                                   }
                                   if (isEquipped) {
                                     displayName += ' (E)';
                                   }
                                   
                                   return (
                                       <li 
                                        key={`${invItem.itemId}-${index}`} 
                                        className={`pl-4 py-1 ${isSelected ? 'bg-green-400 text-black' : ''}`}
                                        style={{ color: isSelected ? undefined : itemDetails.color }}
                                       >
                                          {isSelected ? `> ${displayName}` : `  ${displayName}`}
                                       </li>
                                   );
                               })}
                           </ul>
                       ) : (
                           <div className="text-green-400/50 text-4xl text-center h-full flex items-center justify-center">-- Inventario Vuoto --</div>
                       )}
                    </div>

                    {/* Item Details */}
                    <div className="w-3/5 h-full border-2 border-green-400/30 p-4">
                        <ItemDetails item={selectedItemDetails} invItem={selectedInvItem} />
                    </div>
                </div>
                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [W/S / ↑↓] Seleziona | [INVIO] Azioni | [ESC] Chiudi
                </div>
            </div>
        </div>
    );
};

export default InventoryScreen;