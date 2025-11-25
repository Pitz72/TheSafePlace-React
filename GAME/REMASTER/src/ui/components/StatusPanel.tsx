import React from 'react';
import { useCharacterStore } from '../../store/characterStore';

export const StatusPanel: React.FC = () => {
    const { hp, satiety, hydration, fatigue } = useCharacterStore();

    return (
        <div className="h-1/4 border border-green-800 bg-black p-2 rounded">
            <h2 className="text-center border-b border-green-900 mb-2 font-bold">SOPRAVVIVENZA</h2>
            <div className="text-sm space-y-1">
                <div className="flex justify-between">
                    <span>HP:</span>
                    <span className="text-green-400">{hp.current}/{hp.max}</span>
                </div>
                <div className="flex justify-between">
                    <span>Sazietà:</span>
                    <span className="text-green-400">{satiety.current}/{satiety.max}</span>
                </div>
                <div className="flex justify-between">
                    <span>Idratazione:</span>
                    <span className="text-green-400">{hydration.current}/{hydration.max}</span>
                </div>
                <div className="flex justify-between">
                    <span>Stanchezza:</span>
                    <span className="text-green-400">{fatigue.current}/{fatigue.max}</span>
                </div>
                <div className="mt-2 pt-1 border-t border-green-900 text-center text-xs text-gray-400">
                    Status: <span className="text-green-400">Normale</span>
                </div>
            </div>
        </div>
    );
};
