import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { INSTRUCTIONS_PAGES } from '../constants';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';

/**
 * InstructionsScreen component.
 * This component displays the instructions for the game with pagination.
 * @returns {JSX.Element} The rendered InstructionsScreen component.
 */
const InstructionsScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const [pageIndex, setPageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentPage = INSTRUCTIONS_PAGES[pageIndex];
  const totalPages = INSTRUCTIONS_PAGES.length;

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < currentPage.length) {
        setDisplayedText(currentPage.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 5); // Veloce ma leggibile

    return () => clearInterval(typingInterval);
  }, [currentPage]);

  const finishTyping = useCallback(() => {
    setIsTyping(false);
    setDisplayedText(currentPage);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (isTyping) {
      finishTyping();
      return;
    }
    if (pageIndex < totalPages - 1) {
      audioManager.playSound('navigate');
      setPageIndex(prev => prev + 1);
    }
  }, [isTyping, finishTyping, pageIndex, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (isTyping) {
      finishTyping();
      return;
    }
    if (pageIndex > 0) {
      audioManager.playSound('navigate');
      setPageIndex(prev => prev - 1);
    }
  }, [isTyping, finishTyping, pageIndex]);

  const handleExit = useCallback(() => {
    audioManager.playSound('back');
    setGameState(GameState.MAIN_MENU);
  }, [setGameState]);

  const handlerMap = useMemo(() => ({
    ArrowRight: handleNextPage,
    d: handleNextPage,
    ArrowLeft: handlePrevPage,
    a: handlePrevPage,
    Enter: handleNextPage,
    Escape: handleExit,
  }), [handleNextPage, handlePrevPage, handleExit]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl md:text-6xl mb-4 text-center">ISTRUZIONI</h1>
      <div className="w-full h-[70%] border-2 border-[var(--border-primary)] p-6 flex items-center justify-center overflow-hidden">
        <div className="whitespace-pre-wrap leading-relaxed text-3xl font-mono max-w-4xl w-full text-left">
          {displayedText}
          {isTyping && <span className="bg-[var(--text-primary)] w-4 h-6 inline-block animate-pulse ml-1" />}
        </div>
      </div>
      <div className="mt-4 text-2xl md:text-3xl text-center w-full">
        <div className="flex justify-between items-center px-4">
          <span className={pageIndex === 0 ? 'opacity-30' : ''}>
            [A / ←] Pagina Precedente
          </span>
          <span className="text-amber-400">
            Pagina {pageIndex + 1} / {totalPages}
          </span>
          <span className={pageIndex === totalPages - 1 ? 'opacity-30' : ''}>
            [D / →] Pagina Successiva
          </span>
        </div>
        <div className="mt-2 text-xl opacity-70">
          [INVIO] Avanti | [ESC] Torna al Menu
        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;