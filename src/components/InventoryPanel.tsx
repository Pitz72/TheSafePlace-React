import React from 'react';
import { useGameStore } from '../stores/gameStore';
import type { IItem, IInventorySlot } from '../interfaces/items';
import { shallow } from 'zustand/shallow';

const InventoryPanel: React.FC = () => {
  const inventory = useGameStore(state => state.characterSheet.inventory, shallow);
  const itemDatabase = useGameStore(state => state.items);

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
    <div className="p-2 border border-gray-700 rounded-lg text-white font-mono">
      <h2 className="text-lg font-bold mb-2 border-b border-gray-600 pb-1">Inventario</h2>
      <div className="grid grid-cols-1 gap-1">
        {inventory.map((slot: IInventorySlot | null, index: number) => {
          const item = slot ? itemDatabase[slot.itemId] : null;
          return (
            <div key={index} className="flex items-center py-0.5 rounded">

              {item && slot ? (
                <div className="flex-grow text-left">
                  <span className={getItemColor(item)}>{item.name}</span>
                  <span className="text-gray-400 ml-1"> x{slot.quantity}</span>
                  {slot.portions && <span className="text-yellow-400 ml-1">({slot.portions})</span>}
                </div>
              ) : (
                <span className="text-gray-600 text-left">- Vuoto -</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPanel;