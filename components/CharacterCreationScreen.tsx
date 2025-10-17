import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState, AttributeName, Attributes } from '../types';
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '../constants';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

// Simula il lancio di 4d6, scartando il più basso
const rollStat = (): number => {  
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => a - b);
  rolls.shift(); // Rimuove il più basso
  return rolls.reduce((sum, current) => sum + current, 0);
};


const CharacterCreationScreen: React.FC = () => {
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
          setRollingValue(Math.floor(Math.random() * 16) + 3); // Valori casuali tra 3 e 18
        }, 50);

        await new Promise(resolve => setTimeout(resolve, 2000)); // Durata del "roll"

        clearInterval(rollInterval);
        const finalValue = rollStat();
        finalStats[attr] = finalValue;
        setRolledStats({ ...finalStats });
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Pausa tra i roll
      }
      
      setCurrentAttribute(null);
      setIsComplete(true);
    };

    rollSequence();
  }, []);
  
  // Cursore lampeggiante
  useEffect(() => {
    if (isComplete) {
      const cursorInterval = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [isComplete]);

  const startGame = useCallback(() => {
    if (isComplete) {
      setAttributes(rolledStats as Attributes);
      setGameState(GameState.IN_GAME);
    }
  }, [isComplete, rolledStats, setAttributes, setGameState]);

  const handlerMap = useMemo(() => ({
    Enter: startGame,
  }), [startGame]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl md:text-6xl mb-8 text-center">═══ CREAZIONE PERSONAGGIO ═══</h1>
      <p className="text-2xl md:text-3xl mb-12 text-center text-[var(--text-secondary)]">Generazione statistiche in corso...</p>
      
      <div className="w-full max-w-2xl text-4xl space-y-4 border-2 border-[var(--border-primary)] p-8">
        {ATTRIBUTES.map((attr) => {
          const label = ATTRIBUTE_LABELS[attr].padEnd(12, ' ');
          let value: string | number = '...';
          
          if (rolledStats[attr] !== undefined) {
            value = rolledStats[attr]!;
          } else if (currentAttribute === attr) {
            value = rollingValue;
          }

          return (
            <div key={attr} className="flex justify-between font-mono">
              <span>{label}:</span>
              <span className={currentAttribute === attr ? 'animate-yellow-flash' : ''}>
                {String(value).padStart(2, ' ')}
              </span>
            </div>
          );
        })}
      </div>

      {isComplete && (
        <div className="mt-12 text-3xl text-center">
            <p className="animate-pulse">
                Creazione completata. [Premi INVIO per iniziare l'avventura]
                {cursorVisible && <span className="bg-[var(--highlight-bg)] w-5 h-7 inline-block ml-2"></span>}
            </p>
        </div>
      )}
    </div>
  );
};

export default CharacterCreationScreen;