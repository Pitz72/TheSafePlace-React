
import React from 'react';
import { useGameContext } from '../hooks/useGameContext';

const InventoryPopup: React.FC = () => {
  const { characterSheet, items, selectedInventoryIndex, isInventoryOpen } = useGameContext();

  if (!isInventoryOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-phosphor-bright rounded-lg p-6 max-w-lg w-full crt-screen">
        <h2 className="text-2xl font-bold text-phosphor-bright mb-4">Inventario</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-bold text-phosphor-bright mb-2">Oggetti</h3>
            <ul>
              {characterSheet.inventory.map((itemStack, index) => {
                const item = itemStack ? items[itemStack.itemId] : null;
                return (
                  <li key={index} className={`p-2 rounded ${selectedInventoryIndex === index ? 'bg-phosphor-bright text-black' : 'text-phosphor-dim'}`}>
                    {item ? `${item.name} (x${itemStack.quantity})` : '-'}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-phosphor-bright mb-2">Descrizione</h3>
            {characterSheet.inventory[selectedInventoryIndex] && items[characterSheet.inventory[selectedInventoryIndex]!.itemId] ? (
              <div>
                <p className="text-phosphor-bright">{items[characterSheet.inventory[selectedInventoryIndex]!.itemId].name}</p>
                <p className="text-phosphor-dim">{items[characterSheet.inventory[selectedInventoryIndex]!.itemId].description}</p>
              </div>
            ) : (
              <p className="text-phosphor-dim">Seleziona un oggetto per vederne la descrizione.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPopup;
