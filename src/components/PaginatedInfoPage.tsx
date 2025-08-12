import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../hooks/useGameContext';

interface PaginatedInfoPageProps {
  title: string;
  content: React.ReactNode[];
}

/**
 * PaginatedInfoPage.tsx — Template semplice con SCORRIMENTO (usato da Istruzioni/Storia)
 * v0.3.5 "The Survival Game": non è il template avanzato; per UI standard usare UniversalInfoPage.
 *
 * Regole per FUTURI aggiustamenti dimensioni:
 * - Contenitore: w-[85%] h-[60vh] con p-8 — se cambi, verifica che SCROLL_AMOUNT resti adeguato
 * - Tipografia: attualmente "text-7xl" (molto grande). Per coerenza con template unificato
 *   considera text-[28px] + leading-relaxed + mb-4. In tal caso, riduci SCROLL_AMOUNT (es. 32)
 * - Interazione: W/↑ e S/↓ per scorrere, ESC/B per tornare indietro (invarianti)
 */
const PaginatedInfoPage: React.FC<PaginatedInfoPageProps> = ({ title, content }) => {
  const { handleBackToMenu } = useGameContext();
  const contentBoxRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const SCROLL_AMOUNT = 50; // Pixel per step di scroll — regola insieme al font-size effettivo

  // Scorrimento tastiera + ESC — non cambiare mappatura tasti senza aggiornare le istruzioni UI
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const gameKeys = ['w','arrowup','s','arrowdown','escape','b'];
      if (!gameKeys.includes(key)) return; // Non bloccare altri tasti (DevTools)
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

  // Applica la posizione di scroll calcolata
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
            {/* PUNTO DI REGOLAZIONE TIPOGRAFIA: text-7xl => valuta text-[28px] + leading-relaxed + mb-4 per coerenza */}
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
