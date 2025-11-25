import React from 'react';

export const InfoPanel: React.FC = () => {
    return (
        <div className="h-32 border border-green-800 bg-black p-2 rounded text-sm">
            <h2 className="text-center border-b border-green-900 mb-2 font-bold">INFORMAZIONI</h2>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-gray-400">Posizione:</span>
                    <span>(1, 1)</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Luogo:</span>
                    <span>Pianura</span>
                </div>
                <div className="flex justify-between border-b border-green-900/50 pb-1">
                    <span className="text-xl font-bold">08:10</span>
                    <span className="self-end">Giorno 1</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-yellow-500">☀ Sereno</span>
                    <span className="text-xs text-gray-500 italic">Nessun effetto</span>
                </div>
            </div>
        </div>
    );
};
