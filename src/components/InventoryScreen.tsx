import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getItemColorClass } from '../utils/itemColors';
import { getAvailableActions, executeItemAction, getDetailedExamination } from '../utils/itemActions';
import { getPortionDescription } from '../utils/portionSystem';

const InventoryScreen: React.FC = () => {
  const characterSheet = useGameStore(state => state.characterSheet);
  const items = useGameStore(state => state.items);
  const selectedInventoryIndex = useGameStore(state => state.selectedInventoryIndex);
  const setSelectedInventoryIndex = useGameStore(state => state.setSelectedInventoryIndex);
  const goBack = useGameStore(state => state.goBack);
  const useItem = useGameStore(state => state.useItem);
  const equipItemFromInventory = useGameStore(state => state.equipItemFromInventory);
  const dropItem = useGameStore(state => state.dropItem);

  const [showActions, setShowActions] = useState(false);
  const [examinationText, setExaminationText] = useState<string[] | null>(null);

  const selectedItemStack = selectedInventoryIndex !== null ? characterSheet.inventory[selectedInventoryIndex] : null;
  const selectedItem = selectedItemStack ? items[selectedItemStack.itemId] : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === 'escape' || key === 'i') {
        event.preventDefault();
        if (showActions || examinationText) {
          setShowActions(false);
          setExaminationText(null);
        } else {
          goBack();
        }
        return;
      }

      if (showActions && selectedItemStack && selectedItem) {
        const actions = getAvailableActions(selectedItem);
        const action = actions.find(a => a.key.toLowerCase() === key);
        if (action?.available) {
          event.preventDefault();
          executeItemAction(
             action,
             selectedItem,
             selectedInventoryIndex,
             useItem, // Azione per USARE
             (item, slotIndex) => equipItemFromInventory(slotIndex), // Azione per EQUIPAGGIARE (corretta)
             (item) => { setExaminationText(getDetailedExamination(item)); setShowActions(false); }, // Azione per ESAMINARE
             dropItem // Azione per GETTARE
           );
          if (action.key !== 'X') setShowActions(false);
        }
        return;
      }

      if (key === 'enter' && selectedItemStack && selectedItem) {
        event.preventDefault();
        setShowActions(true);
        setExaminationText(null);
        return;
      }

      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        setSelectedInventoryIndex(selectedInventoryIndex > 0 ? selectedInventoryIndex - 1 : 9);
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        setSelectedInventoryIndex(selectedInventoryIndex < 9 ? selectedInventoryIndex + 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, showActions, examinationText, selectedInventoryIndex, selectedItemStack, selectedItem, useItem, equipItemFromInventory, dropItem, setSelectedInventoryIndex]);

  const availableActions = selectedItem ? getAvailableActions(selectedItem) : [];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <h2 className="text-5xl font-bold mb-8">INVENTARIO</h2>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border p-6">
          <h3 className="text-3xl font-bold mb-4 text-center">ZAINO</h3>
          <ul className="space-y-2 text-2xl pl-4">
            {characterSheet.inventory.map((itemStack, index) => {
              const item = itemStack ? items[itemStack.itemId] : null;
              let label = '[Vuoto]';
              if (itemStack && item) {
                const portionDesc = getPortionDescription(item, itemStack);
                label = `${item.name} (${portionDesc})`;
              }
              const isSelected = selectedInventoryIndex === index;
              return (
                <li key={index} className={`p-3 rounded-lg ${isSelected ? 'bg-phosphor-400 text-black font-bold' : item ? getItemColorClass(item) : 'text-phosphor-700'}`}>
                  <span>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border p-6 min-h-[300px]">
          <h3 className="text-3xl font-bold mb-4 text-center">DESCRIZIONE</h3>
          {examinationText ? (
            <div>
              <div className="font-bold mb-4">ESAME DETTAGLIATO</div>
              {examinationText.map((line, index) => <p key={index}>{line}</p>)}
              <div className="mt-4 pt-4 border-t"><p className="text-sm">[ESC] Torna</p></div>
            </div>
          ) : showActions && selectedItem ? (
            <div>
              <p className={`text-2xl font-bold ${getItemColorClass(selectedItem)}`}>{selectedItem.name}</p>
              <div><p className="font-bold mb-3">AZIONI:</p>
                {availableActions.map(action => (
                  <div key={action.key}><span>[{action.key}]</span> <span>{action.label}</span> - <span>{action.description}</span></div>
                ))}
              </div>
            </div>
          ) : selectedItem ? (
            <div>
              <p className={`text-2xl font-bold ${getItemColorClass(selectedItem)}`}>{selectedItem.name}</p>
              <p className="italic">{selectedItem.description}</p>
              {/* Other item details */}
            </div>
          ) : (
            <p className="italic">Seleziona un oggetto.</p>
          )}
        </div>
      </div>
      <div className="text-2xl">[↑↓] Seleziona | [ENTER] Opzioni | [ESC] o [I] Chiudi</div>
    </div>
  );
};

export default InventoryScreen;
