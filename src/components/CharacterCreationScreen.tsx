/**
 * CharacterCreationScreen.tsx — Schermata dedicata (UI/UX consolidata v0.3.5 "The Survival Game")
 *
 * Regole per future modifiche alle DIMENSIONI (font/spaziature):
 * - Invarianti: struttura full-screen, titolo grande centrato, box contenuto w-[85%] max-w-[1400px]
 * - Font principali:
 *   • Titolo: 47px
 *   • Step testo: 38px (verificato leggibile su 1366x768 e superiori)
 *   • Hint enter: 16px — Hint skip: 13px — Footer: 11px
 * - Se cambi questi valori: aggiorna l'anti-regressione e verifica overflow/troncamenti.
 */
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../hooks/useGameContext';

const CharacterCreationScreen: React.FC = () => {
  const { characterSheet, setCurrentScreen } = useGameContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSkipHint, setShowSkipHint] = useState(false);

  const creationSteps = [
    { text: 'Generazione personaggio "Ultimo"...', duration: 1000 },
    { text: 'Lancio dadi per le statistiche...', duration: 1500 },
    { text: `[■] Potenza: ${characterSheet.stats.potenza}`, duration: 800 },
    { text: `[■] Agilità: ${characterSheet.stats.agilita}`, duration: 800 },
    { text: `[■] Adattamento: ${characterSheet.stats.adattamento}`, duration: 800 },
    { text: `[■] Vigore: ${characterSheet.stats.vigore}`, duration: 800 },
    { text: `[■] Percezione: ${characterSheet.stats.percezione}`, duration: 800 },
    { text: `[■] Carisma: ${characterSheet.stats.carisma}`, duration: 800 },
    { text: `>>> Personaggio "${characterSheet.name.replace(' (Test)', '')}" creato!`, duration: 1200 }
  ];

  const handleConfirm = () => {
    setCurrentScreen('game');
  };

  useEffect(() => {
    if (!isAnimating) return;

    const hintTimer = setTimeout(() => setShowSkipHint(true), 2000);

    if (currentStep < creationSteps.length - 1) {
      const timer = setTimeout(() => setCurrentStep(prev => prev + 1), creationSteps[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }

    return () => clearTimeout(hintTimer);
  }, [currentStep, isAnimating]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Il tasto SPAZIO può saltare l'animazione in qualsiasi momento
      if (event.code === 'Space') {
        event.preventDefault();
        handleConfirm();
      }
      // Il tasto ENTER funziona solo a fine animazione
      if (!isAnimating && event.key === 'Enter') {
        event.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating, handleConfirm]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full text-center">
        {/* Titolo */}
        <h2
          className="text-phosphor-bright font-bold mb-10 font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow"
          style={{ fontSize: '47px' }}
        >
          CREAZIONE PERSONAGGIO
        </h2>

        {/* Box contenuto (senza riduzioni di scala aggiuntive) */}
        <div className="flex justify-center">
          <div className="w-[85%] max-w-[1400px] mx-auto">
            <div className="text-left mx-auto text-phosphor-primary font-mono tracking-wide leading-relaxed space-y-4">
              {creationSteps.slice(0, currentStep + 1).map((step, index) => (
                <div
                  key={index}
                  className={`${index === currentStep
                    ? 'text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright animate-glow'
                    : 'text-phosphor-primary glow-phosphor-primary animate-pulse'} animate-flicker`}
                  style={{ fontSize: '38px' }}
                >
                  {step.text}
                </div>
              ))}

              {/* Hints */}
              {!isAnimating && (
                <div className="mt-8 text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright animate-pulse" style={{ fontSize: '16px' }}>
                  Premi [ENTER] per iniziare l'avventura
                </div>
              )}
              {isAnimating && showSkipHint && (
                <div className="mt-4 text-phosphor-dim animate-pulse" style={{ fontSize: '13px' }}>
                  Premi [SPAZIO] per saltare
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer comandi base (piccolo, come nel menu) */}
        <div className="text-center mt-10">
          <div className="text-phosphor-dim font-mono tracking-wider animate-pulse" style={{ fontSize: '11px' }}>
            [↑] Su  [↓] Giù  [ESC] Indietro
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationScreen;
