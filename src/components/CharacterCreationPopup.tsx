import React, { useState, useEffect } from 'react';
import BasePopup from './BasePopup';
import { useGameContext } from '../hooks/useGameContext';

interface CharacterCreationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CharacterCreationPopup: React.FC<CharacterCreationPopupProps> = ({ isOpen, onClose }) => {
  const { characterSheet, skipCharacterCreation } = useGameContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSkipHint, setShowSkipHint] = useState(false);

  // Passi dell'animazione di creazione personaggio
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

  // Gestione animazione automatica
  useEffect(() => {
    if (!isOpen || !isAnimating) return;

    // Mostra hint per saltare dopo 2 secondi
    const hintTimer = setTimeout(() => {
      setShowSkipHint(true);
    }, 2000);

    // Avanza automaticamente attraverso i passi
    if (currentStep < creationSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, creationSteps[currentStep].duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(hintTimer);
      };
    } else {
      // Ultimo passo - ferma l'animazione e mostra il messaggio finale
      setIsAnimating(false);
      return () => {
        clearTimeout(hintTimer);
      };
    }
  }, [currentStep, isOpen, isAnimating]);

  // Gestione tasto SPACE per saltare
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isOpen) {
        event.preventDefault();
        handleSkip();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSkip = () => {
    console.log('⏭️ Animazione creazione personaggio saltata');
    setIsAnimating(false);
    setCurrentStep(creationSteps.length - 1);
    // Chiudi immediatamente dopo aver mostrato l'ultimo messaggio
    setTimeout(() => {
      handleClose();
    }, 500);
  };

  const handleClose = () => {
    skipCharacterCreation();
    onClose();
  };

  // Reset quando il popup si apre
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsAnimating(true);
      setShowSkipHint(false);
    }
  }, [isOpen]);

  return (
    <BasePopup
      isOpen={isOpen}
      onClose={handleClose}
      title="Creazione Personaggio"
    >
      <div className="space-y-6">
        {/* Area principale dell'animazione */}
        <div className="bg-gray-900 bg-opacity-90 border border-phosphor-bright rounded-lg p-6 min-h-[200px] flex flex-col justify-center glow-phosphor-dim animate-pulse">
          <div className="text-center space-y-4">
            {/* Mostra tutti i passi completati + quello corrente */}
            {creationSteps.slice(0, currentStep + 1).map((step, index) => (
              <div 
                key={index}
                className={`text-lg font-mono tracking-wider ${
                  index === currentStep 
                    ? 'text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright animate-glow' 
                    : 'text-phosphor-primary glow-phosphor-primary animate-pulse'
                }`}
              >
                {step.text}
              </div>
            ))}
            
            {/* Indicatore di caricamento per il passo corrente */}
            {isAnimating && currentStep < creationSteps.length - 1 && (
              <div className="flex justify-center mt-4">
                <div className="text-phosphor-bright font-mono glow-phosphor-bright text-shadow-phosphor-bright animate-glow">...</div>
              </div>
            )}
          </div>
        </div>

        {/* Statistiche finali del personaggio */}
        {currentStep >= creationSteps.length - 1 && (
          <div className="bg-gray-800 bg-opacity-90 border border-phosphor-bright rounded-lg p-4 glow-phosphor-dim animate-pulse">
            <h3 className="text-center text-phosphor-bright font-bold font-mono tracking-wider mb-4 glow-phosphor-bright text-shadow-phosphor-bright animate-glow">Statistiche Finali</h3>
            <div className="grid grid-cols-2 gap-4 text-center font-mono">
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">Potenza: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.stats.potenza}</span></div>
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">Agilità: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.stats.agilita}</span></div>
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">Adattamento: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.stats.adattamento}</span></div>
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">Vigore: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.stats.vigore}</span></div>
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">Percezione: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.stats.percezione}</span></div>
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">Carisma: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.stats.carisma}</span></div>
            </div>
            <div className="text-center mt-4 pt-4 border-t border-phosphor-primary font-mono">
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">HP: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.currentHP}/{characterSheet.maxHP}</span></div>
              <div className="text-phosphor-primary glow-phosphor-primary animate-pulse">Livello: <span className="text-phosphor-bright glow-phosphor-bright text-shadow-phosphor-bright">{characterSheet.level}</span></div>
            </div>
          </div>
        )}

        {/* Messaggio finale quando l'animazione è completata */}
        {!isAnimating && currentStep >= creationSteps.length - 1 && (
          <div className="text-center bg-black border border-phosphor-primary rounded p-4">
            <div className="text-phosphor-highlight font-bold text-xl mb-2 font-mono tracking-wider glow-phosphor-highlight text-shadow-phosphor-highlight animate-glow">
              🎉 {characterSheet.name} è pronto! 🎉
            </div>
            <div className="text-phosphor-bright font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright">
              Premi [ESC] per iniziare l'avventura
            </div>
          </div>
        )}

        {/* Hint per saltare */}
        {showSkipHint && isAnimating && (
          <div className="text-center text-phosphor-primary font-mono tracking-wider glow-phosphor-primary animate-pulse">
            [SPACE] Salta animazione
          </div>
        )}
      </div>
    </BasePopup>
  );
};

export default CharacterCreationPopup;