import React, { useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useTrophyDatabaseStore } from '../data/trophyDatabase';
import { useCharacterStore } from '../store/characterStore';
import Modal from './ui/Modal';
import ScreenBackdrop from './ui/ScreenBackdrop';
import Icon from './ui/Icon';
import { Meter } from './ui/Meter';

/** Trophies unlocked in every game so far; the others stay hidden. */
const TrophyScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const { trophies } = useTrophyDatabaseStore();
  const unlockedTrophies = useCharacterStore((state) => state.unlockedTrophies);
  const scrollRef = useRef<HTMLDivElement>(null);

  const unlockedCount = unlockedTrophies.size;
  const totalCount = trophies.length;
  // Unlocked first, in database order.
  const ordered = useMemo(
    () => [...trophies].sort((a, b) => Number(unlockedTrophies.has(b.id)) - Number(unlockedTrophies.has(a.id))),
    [trophies, unlockedTrophies]);

  const handleScroll = useCallback((amount: number) => {
    scrollRef.current?.scrollBy({ top: amount, behavior: 'smooth' });
  }, []);

  const handleExit = useCallback(() => {
    setGameState(GameState.MAIN_MENU);
  }, [setGameState]);

  const handlerMap = useMemo(() => ({
    ArrowUp: () => handleScroll(-160), w: () => handleScroll(-160),
    ArrowDown: () => handleScroll(160), s: () => handleScroll(160),
    Escape: handleExit,
  }), [handleScroll, handleExit]);

  useKeyboardInput(handlerMap);

  return (
    <div className="relative h-full w-full">
      <ScreenBackdrop />
      <Modal
        backdrop="soft"
        eyebrow="Trofei"
        icon="trophy"
        accent="gold"
        title="Traguardi"
        subtitle="Restano sbloccati da una partita all'altra."
        size="xl"
        className="h-full"
        aside={
          <div className="w-[300px] text-right">
            <div className="font-display text-[54px] font-semibold leading-none text-ink tnum">
              {unlockedCount}<span className="text-[30px] text-ink3"> / {totalCount}</span>
            </div>
            <Meter value={unlockedCount} max={totalCount} tone="gold" className="mt-4" />
          </div>
        }
        hints={[{ keys: ['↑↓'], label: 'Scorri' }, { keys: ['ESC'], label: 'Torna al menu' }]}
      >
        <div ref={scrollRef} className="scroll-y fade-edges h-full px-12 pb-8">
          <div className="grid grid-cols-2 gap-3 py-4">
            {ordered.map((trophy, index) => {
              const isUnlocked = unlockedTrophies.has(trophy.id);
              return (
                <div
                  key={trophy.id}
                  className={`surface-flat flex items-center gap-5 px-6 py-5 anim-fade-up ${isUnlocked ? '' : 'opacity-55'}`}
                  style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                >
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border ${isUnlocked ? 'border-gold/60 bg-gold/15 text-gold' : 'border-line2 text-ink4'}`}>
                    <Icon name={isUnlocked ? 'trophy' : 'lock'} size={26} />
                  </div>
                  <div className="min-w-0">
                    <h2 className={`text-[22px] font-semibold leading-tight ${isUnlocked ? 'text-ink' : 'text-ink3'}`}>
                      {isUnlocked ? trophy.name : 'Trofeo nascosto'}
                    </h2>
                    <p className="mt-1 text-[18px] leading-snug text-ink3">
                      {isUnlocked ? trophy.description : 'Continua a giocare per sbloccarlo.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TrophyScreen;
