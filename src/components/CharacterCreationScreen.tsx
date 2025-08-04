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
    { text: `🎲 Potenza: ${characterSheet.stats.potenza}`, duration: 800 },
    { text: `🎲 Agilità: ${characterSheet.stats.agilita}`, duration: 800 },
    { text: `🎲 Adattamento: ${characterSheet.stats.adattamento}`, duration: 800 },
    { text: `🎲 Vigore: ${characterSheet.stats.vigore}`, duration: 800 },
    { text: `🎲 Percezione: ${characterSheet.stats.percezione}`, duration: 800 },
    { text: `🎲 Carisma: ${characterSheet.stats.carisma}`, duration: 800 },
    { text: `✅ Personaggio "${characterSheet.name}" creato!`, duration: 1200 }
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
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-primary">
      <div className="w-full max-w-4xl text-center">
        <h2 className="text-5xl font-bold mb-8 font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
          CREAZIONE PERSONAGGIO
        </h2>
        
        <div className="bg-gray-900 bg-opacity-90 border border-phosphor-bright rounded-lg p-8 min-h-[300px] flex flex-col justify-center glow-phosphor-dim animate-pulse mb-8">
          <div className="space-y-4">
            {creationSteps.slice(0, currentStep + 1).map((step, index) => (
              <div 
                key={index}
                className={`text-2xl font-mono tracking-wider ${
                  index === currentStep 
                    ? 'text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright animate-glow' 
                    : 'text-phosphor-primary glow-phosphor-primary animate-pulse'
                }`}
              >
                {step.text}
              </div>
            ))}
          </div>
        </div>

        {!isAnimating && (
          <div className="text-2xl text-phosphor-bright font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-pulse">
            Premi [ENTER] per iniziare l'avventura
          </div>
        )}

        {isAnimating && showSkipHint && (
          <div className="text-lg text-phosphor-dim font-mono tracking-wider animate-pulse">
            Premi [SPAZIO] per saltare
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreationScreen;
