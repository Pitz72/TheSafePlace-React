import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { INSTRUCTIONS_TEXT } from '../constants';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

/**
 * InstructionsScreen component.
 * This component displays the instructions for the game.
 * @returns {JSX.Element} The rendered InstructionsScreen component.
 */
const InstructionsScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < INSTRUCTIONS_TEXT.length) {
        setDisplayedText(prev => INSTRUCTIONS_TEXT.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 10); // Intervallo veloce per l'effetto macchina da scrivere

    return () => clearInterval(typingInterval);
  }, []);
  
  useEffect(() => {
    // Auto-scroll to bottom while typing
    if (isTyping && textContainerRef.current) {
        textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [displayedText, isTyping]);

  const handleScroll = useCallback((amount: number) => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop += amount;
    }
  }, []);

  const handleExit = useCallback(() => {
    setGameState(GameState.MAIN_MENU);
  }, [setGameState]);

  const handlerMap = useMemo(() => ({
    ArrowUp: () => handleScroll(-30),
    w: () => handleScroll(-30),
    ArrowDown: () => handleScroll(30),
    s: () => handleScroll(30),
    Escape: handleExit,
  }), [handleScroll, handleExit]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl md:text-6xl mb-4 text-center">ISTRUZIONI</h1>
      <div 
        ref={textContainerRef}
        className="w-full h-[70%] border-2 border-[var(--border-primary)] p-4 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }} // Hide scrollbar for Firefox
      >
        <pre className="whitespace-pre-wrap leading-relaxed text-4xl">{displayedText}{isTyping && <span className="bg-[var(--text-primary)] w-4 h-6 inline-block animate-pulse ml-1"></span>}</pre>
      </div>
      <div className="mt-4 text-2xl md:text-3xl text-center w-full flex justify-between px-4">
        <span>[W/A/S/D / Frecce] Scorri</span>
        <span>[ESC] Torna al Menu</span>
      </div>
    </div>
  );
};

export default InstructionsScreen;