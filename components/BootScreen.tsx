import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { BOOT_TEXT } from '../constants';
import { audioManager } from '../utils/audio';

/**
 * BootScreen component.
 * This component renders the boot screen of the game.
 * @returns {JSX.Element | null} The rendered BootScreen component or null.
 */
const BootScreen: React.FC = () => {
  const { gameState, setGameState } = useGameStore();
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    if (gameState === GameState.INITIAL_BLACK_SCREEN) {
      const timer = setTimeout(() => setGameState(GameState.PRESENTS_SCREEN), 2000);
      return () => clearTimeout(timer);
    }
    if (gameState === GameState.PRESENTS_SCREEN) {
      const handleKeyPress = () => {
        audioManager.playSound('confirm'); // Play sound on user interaction to unlock audio
        setGameState(GameState.INTERSTITIAL_BLACK_SCREEN);
      };
      window.addEventListener('keydown', handleKeyPress, { once: true });
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
    if (gameState === GameState.INTERSTITIAL_BLACK_SCREEN) {
      const timer = setTimeout(() => setGameState(GameState.BOOTING_SCREEN), 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.BOOTING_SCREEN) {
      let lineIndex = 0;
      const interval = setInterval(() => {
        if (lineIndex < BOOT_TEXT.length) {
          audioManager.playSound('navigate'); // Sound for each boot line
          setBootLines(prev => [...prev, BOOT_TEXT[lineIndex]]);
          lineIndex++;
        } else {
          clearInterval(interval);
          audioManager.playSound('confirm'); // Sound for boot completion
          setBootComplete(true); // Boot finished, wait for key press
        }
      }, 150); // Slowed down animation
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);
  
  // Wait for any key press after boot is complete
  useEffect(() => {
    if (bootComplete) {
      const handleKeyPress = () => {
        setGameState(GameState.MAIN_MENU);
      };
      window.addEventListener('keydown', handleKeyPress, { once: true });

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [bootComplete, setGameState]);


  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  if (gameState === GameState.INITIAL_BLACK_SCREEN || gameState === GameState.INTERSTITIAL_BLACK_SCREEN) {
    return null; // Renders black background from Monitor
  }

  if (gameState === GameState.PRESENTS_SCREEN) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-3xl">
        <div className="w-full max-w-7xl h-[80%] border-2 border-[var(--border-primary)] p-6 overflow-y-auto text-left" style={{ scrollbarWidth: 'none' }}>
          <p className="text-center text-4xl mb-4 text-[var(--text-accent)]">[ ATTENZIONE ]</p>
          <p className="text-center mb-6">Benvenuti in The Safe Place Chronicles: The Echo of the Journey</p>
          
          <p className="mb-4">Questo progetto nasce come esperimento tecnico e narrativo, iniziato mesi fa con l’obiettivo di mettere alla prova la tecnologia LLM allora più avanzata: Gemini 2.5 Pro.</p>
          <p className="mb-4">La mia sfida era semplice e ambiziosa allo stesso tempo: scoprire se un modello linguistico potesse contribuire alla creazione di un progetto strutturato, coerente e dotato di un’anima.</p>
          <p className="mb-4">La risposta? Non posso riassumerla in queste poche righe — ne parlerò presto nei miei podcast, nelle dirette di chi vorrà ospitarmi e in un libro tecnico (e non solo) di prossima pubblicazione.</p>
          
          <p className="mb-4">Questo che state per giocare è un prototipo concettuale, arricchito con elementi narrativi e meccaniche sperimentali.</p>
          <p className="mb-4">Nei prossimi mesi il progetto crescerà, si evolverà e darà vita ad altre opere.</p>
          <p className="mb-4">Non aspettatevi un prodotto definitivo, ma un viaggio dentro un’idea in divenire.</p>
          
          <p className="mb-4">Per feedback, suggerimenti o segnalazioni, potete scrivere a:<br/>[E-MAIL] runtimeradio@gmail.com</p>
          
          <p className="mb-4">Un ringraziamento speciale a Michela, mia moglie, per la pazienza e il sostegno anche quando vorrebbe tirarmi una ciabatta, a PixelDebh, Giuseppe "MagnetarMan" Pugliese e al Prof. Leonardo Boselli per aver creduto e dato spazio a questa visione. Un grazie speciale anche a tutti gli amici e i membri del gruppo Telegram Progetto GDR Anni 80 (WIP).</p>
          
          <p className="text-center mt-6">Simone Pizzi<br/>© Runtime Radio 2025<br/>The Safe Place Chronicles: The Echo of the Journey</p>
        </div>
        <p className="whitespace-pre mt-8 animate-pulse text-4xl">
          PREMI UN TASTO PER PARTIRE
          {showCursor && <span className="bg-green-400 w-6 h-10 inline-block ml-2 align-bottom"></span>}
        </p>
      </div>
    );
  }

  if (gameState === GameState.BOOTING_SCREEN) {
    return (
      <div className="w-full h-full font-mono text-left p-4 text-5xl">
        {bootLines.map((line, index) => (
          <p key={index} className="whitespace-pre">{line}</p>
        ))}
        {bootComplete ? (
          <p className="whitespace-pre mt-4 animate-pulse">
            PREMI UN TASTO PER INIZIARE
            {showCursor && <span className="bg-green-400 w-6 h-10 inline-block ml-2 align-bottom"></span>}
          </p>
        ) : (
          showCursor && <span className="bg-green-400 w-6 h-10 inline-block align-bottom"></span>
        )}
      </div>
    );
  }

  return null;
};

export default BootScreen;