import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../hooks/useGameContext';

interface PaginatedInfoPageProps {
  title: string;
  content: React.ReactNode[];
}

const PaginatedInfoPage: React.FC<PaginatedInfoPageProps> = ({ title, content }) => {
  const { handleBackToMenu } = useGameContext();
  const contentBoxRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const SCROLL_AMOUNT = 50; // Pixels to scroll on each key press

  // Effect for keyboard-driven scrolling and ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const contentBox = contentBoxRef.current;
      if (!contentBox) return;

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setScrollTop(prev => Math.max(0, prev - SCROLL_AMOUNT));
          break;
        case 's':
        case 'arrowdown':
          setScrollTop(prev => {
            const maxScroll = contentBox.scrollHeight - contentBox.clientHeight;
            return Math.min(maxScroll, prev + SCROLL_AMOUNT);
          });
          break;
        case 'escape':
        case 'b':
          handleBackToMenu();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBackToMenu]);

  // Effect to apply the scroll position
  useEffect(() => {
    if (contentBoxRef.current) {
      contentBoxRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full">
        <h2 className="text-green-400 text-5xl font-bold mb-8 text-center font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
          {title}
        </h2>

        <div className="flex justify-center mb-8 -mt-8">
          <div
            ref={contentBoxRef}
            className="bg-gray-900 bg-opacity-80 rounded-lg shadow-lg w-[85%] mx-auto p-8 glow-phosphor-dim h-[60vh] overflow-y-auto no-scrollbar"
          >
            <div className="text-green-300 leading-relaxed space-y-8 font-mono tracking-wide text-7xl">
              {content}
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-green-500 text-lg font-mono tracking-wider glow-phosphor-dim animate-pulse">
            <span className="text-green-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[↑]</span> Su |
            <span className="text-green-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[↓]</span> Giù |
            <span className="text-green-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[ESC]</span> Indietro
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginatedInfoPage;
