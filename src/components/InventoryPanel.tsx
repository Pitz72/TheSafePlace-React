import React from 'react';
import { useGameContext } from '../hooks/useGameContext';
import type { IItem, IInventorySlot } from '../interfaces/items';

const InventoryPanel: React.FC = () => {
  const { characterSheet, items: itemDatabase, selectedInventoryIndex, isInventoryOpen } = useGameContext();

  const { inventory } = characterSheet;

  const getItemColor = (item: IItem): string => {
    switch (item.type) {
      case 'Weapon':
        return 'text-red-400';
      case 'Armor':
        return 'text-blue-400';
      case 'Consumable':
        return 'text-green-400';
      case 'Quest':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-black bg-opacity-75 p-4 border rounded-lg text-white font-mono transition-all duration-300 ${isInventoryOpen ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-gray-700'}`}>
      <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">Inventario</h2>
      <div className="grid grid-cols-1 gap-2">
        {inventory.map((slot: IInventorySlot | null, index: number) => {
          const item = slot ? itemDatabase[slot.itemId] : null;
          const isSelected = index === selectedInventoryIndex;
          return (
            <div key={index} className={`flex items-center p-1 rounded ${isSelected ? 'bg-gray-700' : ''}`}>

              {item && slot ? (
                <div className="flex-grow">
                  <span className={getItemColor(item)}>{item.name}</span>
                  <span className="text-gray-400 ml-2"> x{slot.quantity}</span>
                  {slot.portions && <span className="text-yellow-400 ml-1">({slot.portions})</span>}
                </div>
              ) : (
                <span className="text-gray-600">- Vuoto -</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPanel;