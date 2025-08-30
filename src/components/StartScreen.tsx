/**
 * StartScreen.tsx — Menu iniziale
 * 
 * ⚠️  COMPONENTE IMMUTABILE - v0.5.1-Look Me Final ⚠️
 * 
 * QUESTA COMPONENTE È CONSIDERATA IMMUTABILE E DEFINITIVA.
 * Modifiche vietate senza autorizzazione esplicita dell'autore.
 * 
 * Documentazione completa: /documentazione/STARTSCREEN-IMMUTABLE-SPEC.md
 * 
 * Specifica Layout Finale (NON MODIFICARE):
 * - ASCII Art: fontSize 0.8rem (inline style per CSS override)
 * - Autore: text-lg, marginTop 2rem (inline style)
 * - Versione: text-base, marginBottom 3rem (inline style) 
 * - Menu: text-[1.8rem] (ottimizzato usabilità)
 * - Footer: text-lg ENTRAMBI paragrafi (match autore size)
 * - Spacing: marginTop 3rem, marginBottom 1rem interno (inline styles)
 * 
 * Soluzioni Tecniche Critiche:
 * - Inline styles per spacing: risolve conflitto .game-container override
 * - Font sizes ottimizzati per viewport senza scrollbar
 * - Color scheme phosphor CRT preservato
 * 
 * Regole tipografiche (v0.5.1-FINAL): 
 * ASCII 0.8rem, menu text-[1.8rem], autore text-lg, versione text-base, footer text-lg
 * 
 * Invarianti: glow CRT, mappatura scorciatoie [N/C/I/T/O/E], no scrollbars
 * 
 * Data: 2025-08-24
 * Autore: Simone Pizzi
 * Stato: IMMUTABILE ✅
 */
import React, { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';

const StartScreen: React.FC = () => {
  const menuSelectedIndex = useGameStore(state => state.menuSelectedIndex);
  const setMenuSelectedIndex = useGameStore(state => state.setMenuSelectedIndex);
  const handleNewGame = useGameStore(state => state.handleNewGame);
  const handleLoadGame = useGameStore(state => state.handleLoadGame);
  const handleStory = useGameStore(state => state.handleStory);
  const handleInstructions = useGameStore(state => state.handleInstructions);
  const handleOptions = useGameStore(state => state.handleOptions);
  const handleExit = useGameStore(state => state.handleExit);
  
  const menuItems = [
    { key: 'N', label: 'Nuova Partita', action: handleNewGame },
    { key: 'C', label: 'Carica Partita', action: handleLoadGame },
    { key: 'I', label: 'Istruzioni', action: handleInstructions },
    { key: 'T', label: 'Storia', action: handleStory },
    { key: 'O', label: 'Opzioni', action: handleOptions },
    { key: 'E', label: 'Esci', action: handleExit }
  ];

  // Listener per input da tastiera locale a questa schermata
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      // Ottiene lo stato più recente direttamente dallo store per evitare loop
      const currentIndex = useGameStore.getState().menuSelectedIndex;

      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        const newIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        setMenuSelectedIndex(newIndex);
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        const newIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        setMenuSelectedIndex(newIndex);
      } else if (key === 'enter') {
        event.preventDefault();
        // L'array menuItems è stabile e contiene già le azioni corrette
        menuItems[currentIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // L'array di dipendenze ora è stabile e non causerà nuove esecuzioni
  }, [setMenuSelectedIndex, handleNewGame, handleLoadGame, handleInstructions, handleStory, handleOptions, handleExit]);

  return (
    <div className="h-full flex items-center justify-center overflow-hidden crt-screen scan-lines">
      <div className="w-full mx-4 text-center relative">
        {/* Effetti CRT di sfondo */}
        <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-10"></div>
        
        {/* Titolo ASCII Art */}
        <div className="text-phosphor-400 font-mono font-bold mb-4 text-shadow-phosphor-bright animate-glow leading-none" style={{ fontSize: '0.8rem' }}>
          <pre className="whitespace-pre">
{`████████ ██   ██ ███████     ███████  █████  ███████ ███████ 
   ██    ██   ██ ██          ██      ██   ██ ██      ██      
   ██    ███████ █████       ███████ ███████ █████   █████   
   ██    ██   ██ ██               ██ ██   ██ ██      ██      
   ██    ██   ██ ███████     ███████ ██   ██ ██      ███████ 
                                                            
██████  ██       █████   ██████ ███████                    
██   ██ ██      ██   ██ ██      ██                         
██████  ██      ███████ ██      █████                      
██      ██      ██   ██ ██      ██                         
██      ███████ ██   ██  ██████ ███████                    `}
          </pre>
        </div>
        
        {/* Autore */}
        <p className="text-phosphor-500 text-lg mb-2 text-shadow-phosphor-primary animate-pulse" style={{ marginTop: '2rem' }}>
          un gioco di Simone Pizzi
        </p>
        
        {/* Versione */}
        <p className="text-phosphor-700 text-base tracking-wider glow-phosphor-dim" style={{ marginBottom: '3rem' }}>
          v0.8.5 - Crafting Full and Real Integration
        </p>
        
        {/* Menu Items Testuali */}
        <div className="space-y-1 mb-4">
          {menuItems.map((item, index) => (
            <div
              key={item.key}
              className={`text-center transition-all duration-200 text-[1.8rem] px-3 py-1 rounded-lg ${
                menuSelectedIndex === index
                  ? 'text-phosphor-400 font-black text-shadow-phosphor-bright animate-glow glow-phosphor-bright bg-phosphor-300 bg-opacity-40 border-2 border-phosphor-400' 
                  : 'text-phosphor-500 glow-phosphor-primary'
              }`}
            >
              <span className="text-phosphor-400 animate-pulse">[{item.key}]</span> {item.label}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="text-phosphor-700 text-lg leading-relaxed mx-auto glow-phosphor-dim animate-pulse" style={{ marginTop: '3rem' }}>
          <p className="text-shadow-phosphor-dim text-lg" style={{ marginBottom: '1rem' }}>
            GDR Retrocomputazionale - Cooperazione umano-AI
          </p>
          <p className="text-shadow-phosphor-dim text-lg">
            (C) Runtime Radio
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;