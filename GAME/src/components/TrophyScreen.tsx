import React, { useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useTrophyDatabaseStore } from '../data/trophyDatabase';
import { useCharacterStore } from '../store/characterStore';

/**
 * TrophyScreen component.
 * This component displays the unlocked trophies.
 * @returns {JSX.Element} The rendered TrophyScreen component.
 */
const TrophyScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const { trophies } = useTrophyDatabaseStore();
  const unlockedTrophies = useCharacterStore((state) => state.unlockedTrophies);
  const textContainerRef = useRef<HTMLDivElement>(null);
  
  const unlockedCount = unlockedTrophies.size;
  const totalCount = trophies.length;

  const handleScroll = useCallback((amount: number) => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop += amount;
    }
  }, []);

  const handleExit = useCallback(() => {
    setGameState(GameState.MAIN_MENU);
  }, [setGameState]);

  const handlerMap = useMemo(() => ({
    ArrowUp: () => handleScroll(-40),
    w: () => handleScroll(-40),
    ArrowDown: () => handleScroll(40),
    s: () => handleScroll(40),
    Escape: handleExit,
  }), [handleScroll, handleExit]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl md:text-6xl mb-4 text-center">TROFEI SBLOCCATI ({unlockedCount}/{totalCount})</h1>
      <div 
        ref={textContainerRef}
        className="w-full h-[70%] border-2 border-[var(--border-primary)] p-6 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }} // Hide scrollbar for Firefox
      >
        <div className="space-y-6">
            {trophies.map((trophy) => {
                const isUnlocked = unlockedTrophies.has(trophy.id);
                return (
                    <div key={trophy.id} className={`transition-opacity duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
                        <h2 className="text-4xl" style={{ color: isUnlocked ? 'var(--text-accent)' : 'var(--text-secondary)' }}>
                           {isUnlocked ? `[SBLOCCATO] ${trophy.name}` : '[NASCOSTO] Trofeo Misterioso'}
                        </h2>
                        <p className="text-3xl pl-4 text-[var(--text-secondary)] italic">
                           {isUnlocked ? trophy.description : 'Continua a giocare per sbloccare questo trofeo.'}
                        </p>
                    </div>
                );
            })}
        </div>
      </div>
      <div className="mt-4 text-2xl md:text-3xl text-center w-full flex justify-between px-4">
        <span>[W/A/S/D / Frecce] Scorri</span>
        <span>[ESC] Torna al Menu</span>
      </div>
    </div>
  );
};

export default TrophyScreen;
