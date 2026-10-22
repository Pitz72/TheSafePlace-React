import React, { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { STORY_PAGES } from '../constants';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import Modal from './ui/Modal';
import ScreenBackdrop from './ui/ScreenBackdrop';
import PageDots from './ui/PageDots';

/**
 * The approved story text keeps its old typewriter layout (a title in
 * capitals framed by ═ lines): the title is lifted out, the rest is prose.
 */
const parsePage = (text: string): { title: string | null; paragraphs: string[] } => {
  const lines = text.split('\n').filter(line => !/^═+$/.test(line.trim()));
  const first = lines.findIndex(line => line.trim().length > 0);
  const firstLine = lines[first]?.trim() ?? '';
  const isTitle = firstLine.length > 0 && firstLine === firstLine.toUpperCase() && firstLine.length < 40;
  const body = (isTitle ? lines.slice(first + 1) : lines).join('\n');
  const title = isTitle ? firstLine.charAt(0) + firstLine.slice(1).toLowerCase() : null;
  return { title, paragraphs: body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean) };
};

const PAGES = STORY_PAGES.map(parsePage);
const STORY_TITLE = PAGES.find(page => page.title)?.title ?? 'La storia';

/** The prologue: how Ultimo ended up alone on the road. */
const StoryScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = PAGES.length;
  const page = PAGES[pageIndex];

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
        eyebrow={`La storia · ${pageIndex + 1} di ${totalPages}`}
        icon="echo"
        title={STORY_TITLE}
        size="lg"
        aside={<PageDots count={totalPages} current={pageIndex} />}
        hints={[
          { keys: ['←'], label: 'Indietro', muted: pageIndex === 0 },
          { keys: ['→', 'INVIO'], label: 'Avanti', muted: pageIndex === totalPages - 1 },
          { keys: ['ESC'], label: 'Torna al menu' },
        ]}
      >
        <div key={pageIndex} className="flex min-h-[470px] flex-col justify-center px-24 pb-14">
          <div className="hairline mb-10" />
          {page.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`prose-story mx-auto mb-7 max-w-[1000px] text-[29px] anim-fade-up ${paragraph.startsWith('"') ? 'italic text-ember2' : ''}`}
              style={{ animationDelay: `${index * 220}ms` }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default StoryScreen;
