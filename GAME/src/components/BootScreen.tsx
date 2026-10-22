import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';

/**
 * Opening splash: the Runtime Multimedia logo fades in, holds, fades out,
 * then the main menu. Any key skips straight to the menu.
 */
const BootScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const [phase, setPhase] = useState<'in' | 'logo' | 'out'>('in');

  useEffect(() => {
    const show = setTimeout(() => setPhase('logo'), 120);
    const hide = setTimeout(() => setPhase('out'), 4400);
    const toMenu = setTimeout(() => setGameState(GameState.MAIN_MENU), 5400);

    const skip = () => setGameState(GameState.MAIN_MENU);
    window.addEventListener('keydown', skip);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearTimeout(toMenu);
      window.removeEventListener('keydown', skip);
    };
  }, [setGameState]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg0">
      <img
        src="./logo_runtime.png"
        alt="Runtime Multimedia"
        style={{
          maxWidth: '36%',
          maxHeight: '36%',
          opacity: phase === 'logo' ? 1 : 0,
          transform: phase === 'logo' ? 'scale(1)' : 'scale(0.97)',
          transition: 'opacity 1s ease, transform 4s ease-out',
        }}
      />
    </div>
  );
};

export default BootScreen;
