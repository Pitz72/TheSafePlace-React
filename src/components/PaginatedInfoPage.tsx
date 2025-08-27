import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

interface PaginatedInfoPageProps {
  title: string;
  content: React.ReactNode[];
}

/**
 * PaginatedInfoPage.tsx — Template semplice con SCORRIMENTO (usato da Istruzioni/Storia)
 * 
 * ⚠️ TEMPLATE IMMUTABILE - v0.5.1-Look Me Final ⚠️
 * 
 * QUESTO TEMPLATE È CONSIDERATO IMMUTABILE E DEFINITIVO.
 * Modifiche vietate senza autorizzazione esplicita dell'autore.
 * 
 * Documentazione completa: /documentazione/INSTRUCTIONSSCREEN-IMMUTABLE-SPEC.md
 * 
 * Specifica Layout Finale (NON MODIFICARE):
 * - Layout: flex-col con flex-1 per massimo spazio
 * - Titolo: pt-2 pb-4 (posizionamento alto)
 * - Box: 97.5vh height, 85% width (estensione massima)
 * - Font: text-2xl base (compatibile con override componenti)
 * - Scroll: 32px step ottimizzato
 * 
 * v0.3.7 "Tailwind Omologation": non è il template avanzato; per UI standard usare UniversalInfoPage.
 *
 * Regole per FUTURI aggiustamenti dimensioni:
 * - Contenitore: w-[85%] h-[97.5vh] con p-8 — se cambi, verifica che SCROLL_AMOUNT resti adeguato
 * - Tipografia: attualmente "text-2xl" (ottimizzato). Per coerenza con template unificato
 *   considera text-[28px] + leading-relaxed + mb-4. In tal caso, riduci SCROLL_AMOUNT (es. 28)
 * - Interazione: W/↑ e S/↓ per scorrere, ESC/B per tornare indietro (invarianti)
 * 
 * IMPORTANTE: Componenti che usano questo template possono override font size
 * (es. InstructionsScreen usa text-[52.5%] per contenuto specifico)
 * 
 * Data: 2025-08-24
 * Autore: Simone Pizzi  
 * Stato: IMMUTABILE ✅
 */
const PaginatedInfoPage: React.FC<PaginatedInfoPageProps> = ({ title, content }) => {
  const goBack = useGameStore(state => state.goBack);
  const contentBoxRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const SCROLL_AMOUNT = 32;

  // Gestisce solo lo scroll. Il goBack è gestito da useKeyboardCommands
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === 'escape') {
        event.preventDefault();
        goBack();
        return;
      }

      const scrollKeys = ['w', 'arrowup', 's', 'arrowdown'];
      if (!scrollKeys.includes(key)) return;

      event.preventDefault();
      const contentBox = contentBoxRef.current;
      if (!contentBox) return;

      switch (key) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack]);

  // Applica la posizione di scroll calcolata
  useEffect(() => {
    if (contentBoxRef.current) {
      contentBoxRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Titolo più in alto, vicino al bordo del contenitore */}
      <div className="pt-2 pb-4">
        <h2 className="text-phosphor-400 text-5xl font-bold text-center font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
          {title}
        </h2>
      </div>

      {/* Box di testo allargato verso l'alto e verso il basso */}
      <div className="flex-1 flex justify-center">
        <div
          ref={contentBoxRef}
          className="bg-gray-900 bg-opacity-80 rounded-lg shadow-lg w-[85%] mx-auto p-8 glow-phosphor-dim overflow-y-auto no-scrollbar"
          style={{ height: '97.5vh' }}
        >
          {/* Testo ridotto del 70%: da text-7xl a text-2xl (circa 70% in meno) */}
          <div className="text-phosphor-700 leading-relaxed space-y-8 font-mono tracking-wide text-2xl">
            {content}
          </div>
        </div>
      </div>

      <div className="text-center py-4">
        <div className="text-phosphor-500 text-lg font-mono tracking-wider glow-phosphor-dim animate-pulse">
          <span className="text-phosphor-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[↑]</span> Su |
          <span className="text-phosphor-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[↓]</span> Giù |
          <span className="text-phosphor-400 ml-2 glow-phosphor-bright text-shadow-phosphor-bright">[ESC]</span> Indietro
        </div>
      </div>
    </div>
  );
};

export default PaginatedInfoPage;
