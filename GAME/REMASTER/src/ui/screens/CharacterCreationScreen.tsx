import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCharacterStore } from '../../store/characterStore';
import { GameState, type Attributes, type AttributeName } from '../../types';
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '../../constants';
import { CRTOverlay } from '../components/CRTOverlay';

const rollStat = (): number => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    rolls.shift(); // Drop lowest
    return rolls.reduce((sum, current) => sum + current, 0);
};

export const CharacterCreationScreen: React.FC = () => {
    const setGameState = useGameStore((state) => state.setGameState);
    const setAttributes = useCharacterStore((state) => state.setAttributes);

    const [rolledStats, setRolledStats] = useState<Partial<Attributes>>({});
    const [currentAttribute, setCurrentAttribute] = useState<AttributeName | null>(null);
    const [rollingValue, setRollingValue] = useState<number>(0);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        const rollSequence = async () => {
            const finalStats: Partial<Attributes> = {};

            for (const attr of ATTRIBUTES) {
                setCurrentAttribute(attr);
                const rollInterval = setInterval(() => {
                    setRollingValue(Math.floor(Math.random() * 16) + 3);
                }, 50);

                await new Promise(resolve => setTimeout(resolve, 1000)); // Faster than original (2s -> 1s)

                clearInterval(rollInterval);
                const finalValue = rollStat();
                finalStats[attr] = finalValue;
                setRolledStats({ ...finalStats });

                await new Promise(resolve => setTimeout(resolve, 300));
            }

            setCurrentAttribute(null);
            setIsComplete(true);
        };

        rollSequence();
    }, []);

    useEffect(() => {
        if (isComplete) {
            const cursorInterval = setInterval(() => {
                setCursorVisible(prev => !prev);
            }, 500);
            return () => clearInterval(cursorInterval);
        }
    }, [isComplete]);

    const handleStart = useCallback(() => {
        if (isComplete) {
            setAttributes(rolledStats as Attributes);
            setGameState(GameState.IN_GAME);
        }
    }, [isComplete, rolledStats, setAttributes, setGameState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') handleStart();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleStart]);

    return (
        <div className="relative w-full h-full bg-black text-green-500 font-mono flex flex-col items-center justify-center p-8">
            <CRTOverlay />

            <h1 className="text-4xl mb-8 text-center border-b-2 border-green-500 pb-2">
                CREAZIONE PERSONAGGIO
            </h1>

            <div className="w-full max-w-md space-y-4 text-2xl">
                {ATTRIBUTES.map((attr) => {
                    const label = ATTRIBUTE_LABELS[attr].padEnd(12, ' ');
                    let value: string | number = '...';

                    if (rolledStats[attr] !== undefined) {
                        value = rolledStats[attr]!;
                    } else if (currentAttribute === attr) {
                        value = rollingValue;
                    }

                    return (
                        <div key={attr} className="flex justify-between border-b border-green-900/50 pb-1">
                            <span>{label}</span>
                            <span className={currentAttribute === attr ? 'text-white animate-pulse' : ''}>
                                {String(value).padStart(2, ' ')}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 h-16 text-center">
                {currentAttribute && (
                    <p className="text-green-700 animate-pulse">Generazione statistiche in corso...</p>
                )}
                {isComplete && (
                    <div className="animate-pulse">
                        <p className="text-xl">Creazione completata.</p>
                        <p className="text-yellow-500 mt-2">
                            [PREMI INVIO PER INIZIARE]
                            <span className={`inline-block w-3 h-5 bg-green-500 ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}></span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
