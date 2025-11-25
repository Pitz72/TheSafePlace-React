import React from 'react';
import { useCharacterStore } from '../../store/characterStore';

export const InventoryPanel: React.FC = () => {
    const inventory = useCharacterStore((state) => state.inventory);

    return (
        <div className="flex-grow border border-green-800 bg-black p-2 rounded overflow-hidden flex flex-col">
            <h2 className="text-center border-b border-green-900 mb-2 font-bold">INVENTARIO</h2>
            <div className="text-xs flex-grow overflow-y-auto custom-scrollbar">
                {/* Placeholder for weight calculation */}
                <p className="text-gray-400 mb-2 text-center">Peso: 0.0 / 13.0</p>

                {inventory.length === 0 ? (
                    <p className="text-gray-500 text-center italic mt-4">Inventario vuoto</p>
                ) : (
                    <ul className="space-y-1">
                        {inventory.map((item) => (
                            <li key={item.id} className="cursor-pointer hover:bg-green-900/30 px-1 rounded flex justify-between">
                                <span>{item.name}</span>
                                <span className="text-gray-400">x{item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
