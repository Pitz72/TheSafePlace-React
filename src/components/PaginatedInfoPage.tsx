import React, { useState, useEffect, useRef, useMemo } from 'react';

interface PaginatedInfoPageProps {
  title: string;
  content: React.ReactNode[];
  onBack: () => void;
}

const PaginatedInfoPage: React.FC<PaginatedInfoPageProps> = ({ title, content, onBack }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const contentBoxRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);

  // Calcola le pagine in modo stabile
  useEffect(() => {
    const calculatePages = () => {
      if (textWrapperRef.current && contentBoxRef.current) {
        const containerHeight = contentBoxRef.current.clientHeight;
        if (containerHeight === 0) return;
        const scrollHeight = textWrapperRef.current.scrollHeight;
        const pages = Math.ceil(scrollHeight / containerHeight);
        if (pages > 0) {
          setTotalPages(pages);
        }
      }
    };
    // Un timeout di 0ms sposta il calcolo alla fine della coda di eventi,
    // garantendo che il DOM sia stato completamente renderizzato.
    const timer = setTimeout(calculatePages, 0);
    return () => clearTimeout(timer);
  }, [content]); // Si ricalcola solo se il contenuto cambia

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      switch (event.key.toLowerCase()) {
        case 'a': case 'arrowleft':
          setCurrentPage(prev => Math.max(0, prev - 1));
          break;
        case 'd': case 'arrowright':
          setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
          break;
        case 'escape': case 'b':
          onBack();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, onBack]);

  return (
    <div className="h-full flex items-center justify-center overflow-y-auto p-8">
      <div className="w-full">
        <h2 className="text-green-400 text-5xl font-bold mb-8 text-center font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
          {title}
        </h2>

        <div className="flex justify-center mb-8 -mt-8">
          <div ref={contentBoxRef} className="bg-gray-900 bg-opacity-80 rounded-lg shadow-lg w-[85%] mx-auto overflow-hidden p-8 glow-phosphor-dim h-[60vh]">
            <div
              ref={textWrapperRef}
              className="text-green-300 leading-relaxed space-y-8 font-mono tracking-wide text-5xl transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${currentPage * (contentBoxRef.current?.clientHeight || 0)}px)` }}
            >
              {content}
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          {totalPages > 1 && (
            <div className="text-green-500 text-lg font-mono tracking-wider glow-phosphor-dim animate-pulse">
              Pagina {currentPage + 1} di {totalPages} |
              <span className="text-green-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[←]</span> Precedente |
              <span className="text-green-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[→]</span> Successiva
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="text-green-500 text-xl mb-6 font-mono tracking-wider glow-phosphor-dim animate-pulse">
            Premere <span className="text-green-400 glow-phosphor-bright text-shadow-phosphor-bright">[ESC]</span> per tornare al menu
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginatedInfoPage;
