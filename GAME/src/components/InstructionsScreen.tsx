import React, { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { INSTRUCTIONS_PAGES } from '../constants';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import Modal from './ui/Modal';
import ScreenBackdrop from './ui/ScreenBackdrop';
import RichText from './ui/RichText';
import PageDots from './ui/PageDots';

/** The survival guide, one page at a time. */
const InstructionsScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const [pageIndex, setPageIndex] = useState(0);
  const page = INSTRUCTIONS_PAGES[pageIndex];
  const totalPages = INSTRUCTIONS_PAGES.length;

  const turn = useCallback((delta: number) => {
    const next = pageIndex + delta;
    if (next < 0 || next >= totalPages) return;
    audioManager.playSound('navigate');
    setPageIndex(next);
  }, [pageIndex, totalPages]);

  const handleExit = useCallback(() => {
    audioManager.playSound('back');
    setGameState(GameState.MAIN_MENU);
  }, [setGameState]);

  const handlerMap = useMemo(() => ({
    ArrowRight: () => turn(1), d: () => turn(1), Enter: () => turn(1),
    ArrowLeft: () => turn(-1), a: () => turn(-1),
    Escape: handleExit,
  }), [turn, handleExit]);

  useKeyboardInput(handlerMap);

  return (
    <div className="relative h-full w-full">
      <ScreenBackdrop />
      <Modal
        backdrop="soft"
        eyebrow={`Istruzioni · ${pageIndex + 1} di ${totalPages}`}
        icon="book"
        title={page.title}
        size="lg"
        aside={<PageDots count={totalPages} current={pageIndex} />}
        hints={[
          { keys: ['←'], label: 'Indietro', muted: pageIndex === 0 },
          { keys: ['→', 'INVIO'], label: 'Avanti', muted: pageIndex === totalPages - 1 },
          { keys: ['ESC'], label: 'Torna al menu' },
        ]}
      >
        <div key={pageIndex} className="min-h-[420px] px-12 pb-12 anim-fade-up">
          <div className="hairline mb-9" />
          {page.intro && <p className="prose-story max-w-[1000px] text-[30px] leading-[1.55]">{page.intro}</p>}
          {page.points && (
            <ul className="flex flex-col gap-6">
              {page.points.map(point => (
                <li key={point} className="flex gap-5 text-[25px] leading-[1.5] text-ink2">
                  <span className="mt-[15px] h-2 w-2 flex-shrink-0 rotate-45 bg-ember" />
                  <span><RichText text={point} lead /></span>
                </li>
              ))}
            </ul>
          )}
          {page.outro && <p className="prose-story mt-10 text-[26px] italic text-ember2">{page.outro}</p>}
        </div>
      </Modal>
    </div>
  );
};

export default InstructionsScreen;
