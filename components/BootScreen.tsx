import React, { useState, useEffect, useRef } from 'react';
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
  const creditsBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState === GameState.INITIAL_BLACK_SCREEN) {
      const timer = setTimeout(() => setGameState(GameState.PRESENTS_SCREEN), 2000);
      return () => clearTimeout(timer);
    }
    if (gameState === GameState.PRESENTS_SCREEN) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          // Scroll down
          if (creditsBoxRef.current) {
            creditsBoxRef.current.scrollBy({ top: 100, behavior: 'smooth' });
            audioManager.playSound('navigate');
          }
        } else if (e.key === 'ArrowUp') {
          // Scroll up
          if (creditsBoxRef.current) {
            creditsBoxRef.current.scrollBy({ top: -100, behavior: 'smooth' });
            audioManager.playSound('navigate');
          }
        } else if (e.key === 'Enter') {
          // Proceed to next screen
          audioManager.playSound('confirm');
          setGameState(GameState.INTERSTITIAL_BLACK_SCREEN);
        }
      };
      window.addEventListener('keydown', handleKeyPress);
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
        <div
          ref={creditsBoxRef}
          className="w-[90%] h-[80%] border-2 border-[var(--border-primary)] p-6 overflow-y-auto text-left presents-screen-content-box"
          style={{ scrollbarWidth: 'none' }}
        >
          <p className="text-center mb-6 text-[var(--text-accent)] presents-title text-4xl">THE SAFE PLACE CHRONICLES</p>
          <p className="text-center mb-8 text-3xl">The Echo of the Journey</p>
          
          <p className="text-center mb-6 text-3xl">Progettato e realizzato da<br/><span className="text-[var(--text-accent)]">Simone Pizzi</span></p>
          
          <p className="text-center mb-6 text-2xl">Supporto tecnico, consulenza e sviluppo esecutivo:<br/>Gemini 2.5 Pro, Kilo Code, Claude Sonnet 4.5</p>
          
          <p className="text-center mb-6 text-2xl">Supporto tecnico nella gestione git:<br/>Giuseppe Pugliese</p>
          
          <p className="text-center mb-6 text-2xl">Design dello sprite del player:<br/>Carlo Santagostino</p>
          
          <p className="text-center mb-8 text-2xl">Ringraziamento speciale:<br/>Michela De Paola</p>
          
          <p className="text-center mb-4 text-3xl text-[var(--text-accent)]">Questo progetto è stato realizzato ed espanso grazie al contributo di:</p>
          
          <p className="text-center mb-6 text-2xl leading-relaxed">
            Adriana Coppe, Alessandro Raccuglia Giaminardi, Alirio Bruni, Angelo Mastrogiacomo,<br/>
            Claudio Marro Filosa, Cristian Spaccapaniccia, Cristiano Caliendo,<br/>
            Ennio Vitelli, Gabriel Mele, Jimmy Romero, Leonardo Tomassetti,<br/>
            Luca Francesca, Massimiliano Libralesso, Matteo Garza, Mattia Seppolini,<br/>
            Michele Bancheri, Monica Piu, Olivia Quattrocchi, Paolo Sammartino,<br/>
            Roberto Tomaiuolo, Ruggero Celva, Samuele Palazzolo, Simone Di Resta,<br/>
            Stefano Paganini, Tommaso Sciara, Valerio Galano, Vincenzo Falce
          </p>
          
          <p className="text-center mb-6 text-2xl">Si ringraziano i canali YouTube di<br/>PixelDebh e di Mille e Una Avventura</p>
          
          <p className="text-center mb-6 text-2xl">Produzione, collaborazione e supporto diretto:<br/>Runtime Radio, Archeologia Informatica,<br/>Glitch Podcast, Good Vibrations Podcast</p>
          
          <p className="text-center mt-8 presents-signature text-2xl">© Runtime Radio 2025</p>
        </div>
        <p className="whitespace-pre mt-8 text-center text-3xl">
          <span className="animate-pulse">PREMI FRECCE PER SCORRERE - INVIO PER ANDARE AVANTI</span>
          <span className="bg-green-400 w-6 h-10 inline-block ml-2 align-bottom" style={{ opacity: showCursor ? 1 : 0 }}></span>
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
            <span className="bg-green-400 w-6 h-10 inline-block ml-2 align-bottom" style={{ opacity: showCursor ? 1 : 0 }}></span>
          </p>
        ) : (
          <span className="bg-green-400 w-6 h-10 inline-block align-bottom" style={{ opacity: showCursor ? 1 : 0 }}></span>
        )}
      </div>
    );
  }

  return null;
};

export default BootScreen;