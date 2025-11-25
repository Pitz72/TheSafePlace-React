import React from 'react';

export const CommandPanel: React.FC = () => {
    return (
        <div className="h-32 border border-green-800 bg-black p-2 rounded text-xs">
            <h2 className="text-center border-b border-green-900 mb-1 font-bold">COMANDI</h2>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-1"><span className="text-yellow-500">[WASD / ⬆⬇⬅➡]</span> Muovi</div>
                <div className="flex items-center gap-1"><span className="text-yellow-500">[I]</span> Inventario</div>
                <div className="flex items-center gap-1"><span className="text-yellow-500">[J]</span> Missioni</div>
                <div className="flex items-center gap-1"><span className="text-yellow-500">[R]</span> Riposo</div>
                <div className="flex items-center gap-1"><span className="text-yellow-500">[F]</span> Cerca</div>
                <div className="flex items-center gap-1"><span className="text-yellow-500">[ESC]</span> Menu</div>
            </div>
        </div>
    );
};
