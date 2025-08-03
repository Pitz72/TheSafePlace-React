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
  
  // Smart pagination: calculate how much text fits in the text box
  useEffect(() => {
    const calculateSmartPages = () => {
      const allContent: string[] = [];
      
      // Flatten all pages into a single array of paragraphs
      pages.forEach(page => {
        page.forEach(paragraph => {
          allContent.push(paragraph);
        });
      });
      
      // Calculate available space
      // Text box height is 65% of screen minus padding
      // With 28px font and leading-relaxed (1.625), each line is ~45px
      // With mb-4 (16px), each paragraph takes ~61px per line
      const screenHeight = window.innerHeight;
      const textBoxHeight = screenHeight * 0.65 * 0.65; // 65% of 65% (accounting for CRT frame)
      const lineHeight = 45; // 28px font with leading-relaxed
      const paragraphSpacing = 16; // mb-4
      const maxLinesPerPage = Math.floor((textBoxHeight - 48) / (lineHeight + paragraphSpacing)); // 48px for padding
      
      const newPages: string[][] = [];
      let currentPageContent: string[] = [];
      let currentLines = 0;
      
      allContent.forEach(paragraph => {
        // Estimate lines needed for this paragraph
        const estimatedLines = Math.ceil(paragraph.length / 80); // ~80 chars per line at 28px
        
        // If adding this paragraph would exceed the page, start a new page
        if (currentLines + estimatedLines > maxLinesPerPage && currentPageContent.length > 0) {
          newPages.push([...currentPageContent]);
          currentPageContent = [paragraph];
          currentLines = estimatedLines;
        } else {
          currentPageContent.push(paragraph);
          currentLines += estimatedLines;
        }
      });
      
      // Add the last page if it has content
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

  // Reset animation when page changes
  useEffect(() => {
    setVisibleParagraphs(0);
    setShowBackButton(false);
  }, [currentPage]);

  // Gradual text appearance effect
  useEffect(() => {
    const currentPageContent = smartPages[currentPage] || [];
    const maxParagraphs = Math.min(currentPageContent.length, 10);
    
    if (visibleParagraphs < maxParagraphs) {
      const timer = setTimeout(() => {
        setVisibleParagraphs(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Show back button after all paragraphs are visible
      const timer = setTimeout(() => {
        setShowBackButton(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visibleParagraphs, currentPage, smartPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
          }
          break;
        case 'ArrowRight':
          if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
          }
          break;
        case 'Escape':
        case 'Enter':
          if (showBackButton) {
            onBack();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, showBackButton, onBack]);

  const currentPageContent = smartPages[currentPage] || [];

  return (
    <div className="h-screen w-screen bg-black text-phosphor-bright font-mono relative crt-screen scan-lines animate-crt-flicker">
      {/* CRT Monitor Frame - Immutable */}
      <div className="absolute inset-4 border-2 border-phosphor-bright rounded-lg glow-phosphor">
        
        {/* Title - Fixed position at top */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <h1 className="text-4xl font-bold text-center tracking-wider glow-phosphor-bright animate-phosphor-pulse">
            {title}
          </h1>
        </div>

        {/* Text Box - Fixed proportions and position like in screenshot */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-[85%] h-[65%] border border-phosphor-bright bg-phosphor-bg bg-opacity-30 glow-phosphor">
          <div className="p-6 h-full overflow-hidden">
            {currentPageContent.slice(0, visibleParagraphs).map((paragraph, index) => {
              // Handle legend formatting if this is a legend paragraph
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
              
              return (
                <p key={index} className="text-[28px] leading-relaxed mb-4 text-phosphor-bright glow-phosphor animate-flicker">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Navigation controls - Fixed position at bottom like in screenshot */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center space-y-2">
          {/* Page indicator */}
          {totalPages > 1 && (
            <div className="text-xl text-phosphor-bright glow-phosphor-bright animate-phosphor-pulse">
              Pagina {currentPage + 1} di {totalPages} [←] Precedente [→] Successiva
            </div>
          )}

          {/* Navigation instructions */}
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