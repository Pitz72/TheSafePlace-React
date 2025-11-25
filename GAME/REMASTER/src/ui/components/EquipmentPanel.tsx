import React from 'react';

export const EquipmentPanel: React.FC = () => {
    return (
        <div className="h-40 border border-green-800 bg-black p-2 rounded text-xs">
            <h2 className="text-center border-b border-green-900 mb-2 font-bold">EQUIPAGGIAMENTO</h2>
            <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center border-b border-green-900/30 pb-1">
                    <span className="text-gray-400">ARMA</span>
                    <span>Nessuna</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-900/30 pb-1">
                    <span className="text-gray-400">TESTA</span>
                    <span>Nessuna</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-900/30 pb-1">
                    <span className="text-gray-400">TORSO</span>
                    <span>Nessuna</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">GAMBE</span>
                    <span>Nessuna</span>
                </div>
            </div>
        </div>
    );
};
