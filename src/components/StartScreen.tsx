/**
 * StartScreen.tsx — Menu iniziale
 * 
 * 🚨 AVVISO CRITICO DI IMMUTABILITÀ 🚨
 * 
 * ⚠️  COMPONENTE IMMUTABILE - v0.5.1-Look Me Final ⚠️
 * 
 * 🔒 QUESTA SCHERMATA DEL MENU DI GIOCO È INTOCCABILE E IMMUTABILE 🔒
 * 
 * ❌ MODIFICHE VIETATE SENZA AUTORIZZAZIONE ESPLICITA E SCRITTA DELL'OPERATORE ❌
 * 
 * La schermata del menu principale è considerata un componente critico
 * del sistema e non può essere modificata senza autorizzazione scritta.
 * Qualsiasi tentativo di modifica non autorizzata sarà considerato
 * una violazione delle specifiche di sistema.
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
 * 
 * ULTIMA MODIFICA: 16 Gennaio 2025 - Aggiunto avviso critico di immutabilità
 */
import React, { useEffect, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';

const StartScreen: React.FC = () => {
  const menuSelectedIndex = useGameStore(state => state.menuSelectedIndex);
  const setMenuSelectedIndex = useGameStore(state => state.setMenuSelectedIndex);
  const isPaused = useGameStore(state => state.isPaused);
  const gameInProgress = useGameStore(state => state.gameInProgress);
  const handleNewGame = useGameStore(state => state.handleNewGame);
  const handleLoadGame = useGameStore(state => state.handleLoadGame);
  const handleStory = useGameStore(state => state.handleStory);
  const handleInstructions = useGameStore(state => state.handleInstructions);
  const handleOptions = useGameStore(state => state.handleOptions);
  const handleExit = useGameStore(state => state.handleExit);
  const resumeGame = useGameStore(state => state.resumeGame);
  const startNewGame = useGameStore(state => state.startNewGame);
  
  // Menu diverso se il gioco è in pausa - stabilizzato con useMemo
  const menuItems = useMemo(() => {
    return isPaused && gameInProgress ? [
      { key: 'R', label: 'Riprendi Partita', action: resumeGame },
      { key: 'N', label: 'Nuova Partita', action: startNewGame },
      { key: 'O', label: 'Opzioni', action: handleOptions },
      { key: 'E', label: 'Esci', action: handleExit }
    ] : [
      { key: 'N', label: 'Nuova Partita', action: handleNewGame },
      { key: 'C', label: 'Carica Partita', action: handleLoadGame },
      { key: 'I', label: 'Istruzioni', action: handleInstructions },
      { key: 'T', label: 'Storia', action: handleStory },
      { key: 'O', label: 'Opzioni', action: handleOptions },
      { key: 'E', label: 'Esci', action: handleExit }
    ];
  }, [isPaused, gameInProgress, resumeGame, startNewGame, handleOptions, handleExit, handleNewGame, handleLoadGame, handleInstructions, handleStory]);

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
        // L'array menuItems è ora stabile e contiene già le azioni corrette
        menuItems[currentIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // L'array di dipendenze ora è stabile e non causerà nuove esecuzioni
  }, [setMenuSelectedIndex, menuItems]);

  return (
    <div className="h-full flex items-center justify-center overflow-hidden crt-screen scan-lines">
      <div className="w-full mx-4 text-center relative">
        {/* Effetti CRT di sfondo */}
        <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-10"></div>
        
        {/* Titolo Immagine */}
        <div className="mb-4 animate-glow" style={{ marginBottom: '2rem' }}>
          <img
            src="/titoli/journey.png"
            alt="THE SAFE PLACE CHRONICLES: THE ECHO OF THE JOURNEY"
            className="max-w-full h-auto object-contain mx-auto"
            style={{
              maxHeight: '40vh',
              filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 0.5))'
            }}
          />
        </div>
        
        {/* Autore */}
        <p className="text-phosphor-500 text-lg mb-2 text-shadow-phosphor-primary animate-pulse" style={{ marginTop: '2rem' }}>
          un gioco di Simone Pizzi
        </p>
        
        {/* Versione e stato pausa */}
        <p className="text-phosphor-700 text-base tracking-wider glow-phosphor-dim" style={{ marginBottom: '1rem' }}>
          v0.9.9.7 - Yet Another Last-Minute Rescue
        </p>
        
        {/* Indicatore di pausa */}
        {isPaused && gameInProgress && (
          <p className="text-phosphor-400 text-lg font-bold animate-pulse glow-phosphor-bright" style={{ marginBottom: '2rem' }}>
            GIOCO IN PAUSA
          </p>
        )}
        
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