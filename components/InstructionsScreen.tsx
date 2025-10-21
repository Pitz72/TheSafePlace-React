import React, { useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { INSTRUCTIONS_TEXT } from '../constants';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

/**
 * InstructionsScreen component.
 * This component displays the game instructions as a scrollable guide.
 * @returns {JSX.Element} The rendered InstructionsScreen component.
 */
const InstructionsScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((amount: number) => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop += amount;
    }
  }, []);

  const handleExit = useCallback(() => {
    setGameState(GameState.MAIN_MENU);
  }, [setGameState]);

  const handlerMap = useMemo(() => ({
    ArrowUp: () => handleScroll(-50),
    w: () => handleScroll(-50),
    ArrowDown: () => handleScroll(50),
    s: () => handleScroll(50),
    Escape: handleExit,
  }), [handleScroll, handleExit]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl md:text-6xl mb-4 text-center">ISTRUZIONI DI GIOCO</h1>
      <div 
        ref={textContainerRef}
        className="w-full h-[70%] border-2 border-[var(--border-primary)] p-4 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }} // Hide scrollbar for Firefox
      >
        <pre className="whitespace-pre-wrap leading-relaxed text-4xl">{INSTRUCTIONS_TEXT}</pre>
      </div>
      <div className="mt-4 text-2xl md:text-3xl text-center w-full flex justify-between px-4">
        <span>[W/A/S/D / Frecce] Scorri</span>
        <span>[ESC] Torna al Menu</span>
      </div>
    </div>
  );
};

export default InstructionsScreen;
