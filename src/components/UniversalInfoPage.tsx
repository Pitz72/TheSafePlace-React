/**
 * UniversalInfoPage.tsx — TEMPLATE BASE per pagine informative
 * Versione di riferimento: v0.3.2 "Size Matters"
 *
 * Linee guida per FUTURE MODIFICHE alle dimensioni testo e layout:
 * - Invarianti UI (NON modificare salvo nuova major/minor esplicita):
 *   1) Frame CRT con bordo e glow
 *   2) Container testo centrato: w-[85%] x h-[65%] (proporzioni fisse)
 *   3) Titolo centrato in alto, navigazione centrata in basso
 * - Punti di regolazione ammessi per dimensioni:
 *   a) Dimensione paragrafi: className "text-[28px]" (uniforma la tipografia)
 *   b) Spaziatura: leading-relaxed, mb-4 (line-height e distanze)
 *   c) Algoritmo di pagination smart: lineHeight, paragraphSpacing, stima chars/line
 * - Se aumenti/diminuisci il font:
 *   • Aggiorna SIA le classi di stile SIA i parametri usati in calculateSmartPages()
 *   • Esegui i test di anti-regressione "Size Matters" su leggibilità e overflow
 */
import React, { useState, useEffect } from 'react';

interface UniversalInfoPageProps {
  title: string;
  pages: string[][];
  onBack: () => void;
  showLegend?: boolean;
  legendItems?: Array<{
    symbol: string;
    description: string;
    colorClass: string;
  }>;
}

const UniversalInfoPage: React.FC<UniversalInfoPageProps> = ({
  title,
  pages,
  onBack,
  showLegend = false,
  legendItems = []
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const [showBackButton, setShowBackButton] = useState(false);
  const [smartPages, setSmartPages] = useState<string[][]>([]);
  
  // Smart pagination: calcola la quantità di testo che entra nel riquadro
  // PUNTI DI REGOLAZIONE DIMENSIONI (coerenti con v0.3.2):
  // - textBoxHeight: proporzione verticale del contenitore (h-[65%] del layout)
  // - lineHeight: stima in px della line-height per text-[28px] + leading-relaxed
  // - paragraphSpacing: margine verticale tra paragrafi (mb-4 ≈ 16px)
  // - 80 chars/line: stima media per wrapping su text-[28px]
  useEffect(() => {
    const calculateSmartPages = () => {
      const allContent: string[] = [];
      
      // Flatten di tutte le pagine in un singolo array di paragrafi
      pages.forEach(page => {
        page.forEach(paragraph => {
          allContent.push(paragraph);
        });
      });
      
      // Calcolo spazio disponibile — se modifichi le dimensioni globali, aggiorna questi parametri
      const screenHeight = window.innerHeight;
      const textBoxHeight = screenHeight * 0.65 * 0.65; // 65% di 65% (frame CRT + box testo)
      const lineHeight = 45; // per text-[28px] con leading-relaxed
      const paragraphSpacing = 16; // mb-4
      const maxLinesPerPage = Math.floor((textBoxHeight - 48) / (lineHeight + paragraphSpacing)); // 48px padding
      
      const newPages: string[][] = [];
      let currentPageContent: string[] = [];
      let currentLines = 0;
      
      allContent.forEach(paragraph => {
        // Stima righe/paragraph — aggiorna "80" se cambi font-size o width del box
        const estimatedLines = Math.ceil(paragraph.length / 80);
        
        if (currentLines + estimatedLines > maxLinesPerPage && currentPageContent.length > 0) {
          newPages.push([...currentPageContent]);
          currentPageContent = [paragraph];
          currentLines = estimatedLines;
        } else {
          currentPageContent.push(paragraph);
          currentLines += estimatedLines;
        }
      });
      
      if (currentPageContent.length > 0) {
        newPages.push(currentPageContent);
      }
      
      setSmartPages(newPages);
    };
    
    calculateSmartPages();
    window.addEventListener('resize', calculateSmartPages);
    return () => window.removeEventListener('resize', calculateSmartPages);
  }, [pages]);
  
  const totalPages = smartPages.length;

  // Reset animazioni quando cambia pagina
  useEffect(() => {
    setVisibleParagraphs(0);
    setShowBackButton(false);
  }, [currentPage]);

  // Apparizione graduale paragrafi — NON correlata alle dimensioni
  useEffect(() => {
    const currentPageContent = smartPages[currentPage] || [];
    const maxParagraphs = Math.min(currentPageContent.length, 10);
    
    if (visibleParagraphs < maxParagraphs) {
      const timer = setTimeout(() => {
        setVisibleParagraphs(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowBackButton(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visibleParagraphs, currentPage, smartPages]);

  // Navigazione da tastiera — invarianti di interazione
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (currentPage > 0) setCurrentPage(prev => prev - 1);
          break;
        case 'ArrowRight':
          if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
          break;
        case 'Escape':
        case 'Enter':
          if (showBackButton) onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, showBackButton, onBack]);

  const currentPageContent = smartPages[currentPage] || [];

  return (
    <div className="h-screen w-screen bg-black text-phosphor-bright font-mono relative crt-screen scan-lines animate-crt-flicker">
      {/* Frame CRT — NON modificare senza nuova decisione di design */}
      <div className="absolute inset-4 border-2 border-phosphor-bright rounded-lg glow-phosphor">
        
        {/* Titolo — se cambi dimensione, aggiorna gli allineamenti verticali */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <h1 className="text-4xl font-bold text-center tracking-wider glow-phosphor-bright animate-phosphor-pulse">
            {title}
          </h1>
        </div>

        {/* Text Box — proporzioni fisse come da screenshot di riferimento */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-[85%] h-[65%] border border-phosphor-bright bg-phosphor-bg bg-opacity-30 glow-phosphor">
          <div className="p-6 h-full overflow-hidden">
            {currentPageContent.slice(0, visibleParagraphs).map((paragraph, index) => {
              // Legenda mappa: il font resta coerente a text-[28px]
              if (showLegend && paragraph.includes('Leggenda mappa:')) {
                return (
                  <p key={index} className="text-[28px] leading-relaxed mb-4 glow-phosphor animate-flicker">
                    <span className="text-phosphor-bright glow-phosphor-bright">Leggenda mappa: </span>
                    {legendItems.map((item, itemIndex) => (
                      <span key={itemIndex}>
                        <span className={`${item.colorClass} glow-phosphor-bright`}>{item.symbol}</span>
                        <span className="text-phosphor-bright glow-phosphor-bright"> = {item.description}</span>
                        {itemIndex < legendItems.length - 1 && <span className="text-phosphor-bright glow-phosphor-bright"> • </span>}
                      </span>
                    ))}
                  </p>
                );
              }
              
              // Paragrafi standard — per cambiare dimensione, intervieni qui E in calculateSmartPages()
              return (
                <p key={index} className="text-[28px] leading-relaxed mb-4 text-phosphor-bright glow-phosphor animate-flicker">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Comandi navigazione — posizione fissa */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center space-y-2">
          {totalPages > 1 && (
            <div className="text-xl text-phosphor-bright glow-phosphor-bright animate-phosphor-pulse">
              Pagina {currentPage + 1} di {totalPages} [←] Precedente [→] Successiva
            </div>
          )}
          <div className="text-lg text-phosphor-bright glow-phosphor-bright">
            {showBackButton && (
              <div className="animate-pulse">
                Premere [ESC], [BACKSPACE] o [B] per tornare al menu
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UniversalInfoPage;