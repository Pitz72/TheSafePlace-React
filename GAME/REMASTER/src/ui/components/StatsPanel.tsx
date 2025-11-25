import React from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { ATTRIBUTES } from '../../constants';
import type { AttributeName } from '../../types';

export const StatsPanel: React.FC = () => {
    const { attributes, level, xp } = useCharacterStore();

    const getModifier = (value: number) => Math.floor((value - 10) / 2);
    const formatModifier = (mod: number) => (mod >= 0 ? `(+${mod})` : `(${mod})`);
    const getModifierColor = (mod: number) => (mod >= 0 ? 'text-green-500' : 'text-red-500');

    return (
        <div className="flex-grow border border-green-800 bg-black p-2 rounded text-xs">
            <h2 className="text-center border-b border-green-900 mb-2 font-bold">STATISTICHE</h2>
            <div className="flex justify-between mb-2 px-1">
                <span>Livello: <span className="text-white">{level}</span></span>
                <span className="text-gray-400">XP: {xp.current} / {xp.max}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {ATTRIBUTES.map((attr: AttributeName) => {
                    const value = attributes[attr];
                    const mod = getModifier(value);
                    return (
                        <div key={attr} className="flex justify-between">
                            <span className="text-gray-400">{attr.toUpperCase()}</span>
                            <span>
                                {value} <span className={getModifierColor(mod)}>{formatModifier(mod)}</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
