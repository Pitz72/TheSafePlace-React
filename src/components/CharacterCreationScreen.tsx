import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useCharacterStore } from '../stores/character/characterStore';

/**
 * COMPONENTE IMMUTABILE - PATTO DI SVILUPPO
 * 
 * Questo componente è DEFINITIVO e IMMUTABILE.
 * NON deve essere modificato per nessuna ragione al mondo
 * se non previa autorizzazione esplicita dell'operatore.
 * 
 * La schermata di creazione del personaggio all'avvio del gioco
 * rappresenta un elemento fondamentale dell'esperienza utente
 * e deve rimanere invariata per garantire la coerenza del gameplay.
 * 
 * Qualsiasi modifica non autorizzata a questo componente
 * costituisce una violazione del patto di sviluppo.
 * 
 * MODIFICA AUTORIZZATA: Aggiunta gestione errori per initializeGame() - 16 Gennaio 2025
 */

const CharacterCreationScreen: React.FC = () => {
  const { characterSheet } = useCharacterStore();
  const { setCurrentScreen, initializeGame, enterGame } = useGameStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const creationSteps = useMemo(() => [
    { text: 'Generazione personaggio "Ultimo"...', duration: 1000 },
    { text: 'Lancio dadi per le statistiche...', duration: 1500 },
    { text: `[■] Potenza: ${characterSheet.stats.potenza}`, duration: 800 },
    { text: `[■] Agilità: ${characterSheet.stats.agilita}`, duration: 800 },
    { text: `[■] Adattamento: ${characterSheet.stats.adattamento}`, duration: 800 },
    { text: `[■] Vigore: ${characterSheet.stats.vigore}`, duration: 800 },
    { text: `[■] Percezione: ${characterSheet.stats.percezione}`, duration: 800 },
    { text: `[■] Carisma: ${characterSheet.stats.carisma}`, duration: 800 },
    { text: `>>> Personaggio "${characterSheet.name.replace(' (Test)', '')}" creato!`, duration: 1200 }
  ], [characterSheet]);

  const handleConfirm = useCallback(async () => {
    if (isInitializing) return; // Previeni chiamate multiple
    
    setIsInitializing(true);
    setInitializationError(null);
    
    try {
      await initializeGame();
      enterGame();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto durante l\'inizializzazione';
      setInitializationError(errorMessage);
      console.error('Errore inizializzazione gioco:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [enterGame, initializeGame, isInitializing]);

  useEffect(() => {
    if (!isAnimating) return;

    const hintTimer = setTimeout(() => setShowSkipHint(true), 2000);

    if (currentStep < creationSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, creationSteps[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }

    return () => clearTimeout(hintTimer);
  }, [currentStep, isAnimating, creationSteps]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInitializing) return; // Disabilita input durante inizializzazione
      
      if (event.code === 'Space') {
        event.preventDefault();
        handleConfirm();
      }
      if (!isAnimating && event.key === 'Enter') {
        event.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnimating, handleConfirm, isInitializing]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full text-center">
        <h2
          className="text-phosphor-bright font-bold mb-10 font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow"
          style={{ fontSize: '47px' }}
        >
          CREAZIONE PERSONAGGIO
        </h2>
        <div className="flex justify-center">
          <div className="w-[85%] max-w-[1400px] mx-auto">
            <div className="text-left mx-auto text-phosphor-500 font-mono tracking-wide leading-relaxed space-y-4">
              {creationSteps.slice(0, currentStep + 1).map((step, index) => (
                <div
                  key={index}
                  className={`${index === currentStep
                    ? 'text-phosphor-400 glow-phosphor-bright text-shadow-phosphor-bright animate-glow'
                    : 'text-phosphor-500 glow-phosphor-primary animate-pulse'} animate-flicker`}
                  style={{ fontSize: '38px' }}
                >
                  {step.text}
                </div>
              ))}
              
              {/* Stato di inizializzazione */}
              {isInitializing && (
                <div className="mt-8 text-phosphor-400 glow-phosphor-bright text-shadow-phosphor-bright animate-pulse" style={{ fontSize: '16px' }}>
                  Inizializzazione del mondo in corso...
                </div>
              )}
              
              {/* Errore di inizializzazione */}
              {initializationError && (
                <div className="mt-8 space-y-2">
                  <div className="text-red-400 glow-red text-shadow-red animate-pulse" style={{ fontSize: '16px' }}>
                    ERRORE: {initializationError}
                  </div>
                  <div className="text-phosphor-700 animate-pulse" style={{ fontSize: '13px' }}>
                    Premi [ENTER] per riprovare
                  </div>
                </div>
              )}
              
              {/* Prompt normale */}
              {!isAnimating && !isInitializing && !initializationError && (
                <div className="mt-8 text-phosphor-400 glow-phosphor-bright text-shadow-phosphor-bright animate-pulse" style={{ fontSize: '16px' }}>
                  Premi [ENTER] per iniziare l'avventura
                </div>
              )}
              
              {/* Hint per saltare animazione */}
              {isAnimating && showSkipHint && !isInitializing && (
                <div className="mt-4 text-phosphor-700 animate-pulse" style={{ fontSize: '13px' }}>
                  Premi [SPAZIO] per saltare
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationScreen;
