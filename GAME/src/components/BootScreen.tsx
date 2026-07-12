import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';

/**
 * BootScreen component (v2.0.15).
 * Replaces the old credits + fake-BIOS boot sequence with a single splash:
 * Runtime Multimedia logo for 5 seconds → fade to black → main menu.
 * Any key skips straight to the menu.
 */
const BootScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const [phase, setPhase] = useState<'logo' | 'black'>('logo');

  useEffect(() => {
    const toBlack = setTimeout(() => setPhase('black'), 5000);
    const toMenu = setTimeout(() => setGameState(GameState.MAIN_MENU), 6000);

    const skip = () => setGameState(GameState.MAIN_MENU);
    window.addEventListener('keydown', skip);

    return () => {
      clearTimeout(toBlack);
      clearTimeout(toMenu);
      window.removeEventListener('keydown', skip);
    };
  }, [setGameState]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <img
        src="./logo_runtime.png"
        alt="Runtime Multimedia"
        style={{
          maxWidth: '40%',
          maxHeight: '40%',
          opacity: phase === 'logo' ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      />
    </div>
  );
};

export default BootScreen;
