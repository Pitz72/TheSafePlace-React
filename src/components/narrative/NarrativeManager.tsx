import React, { useEffect, useState } from 'react';
import { useNarrativeStore } from '../../stores/narrative/narrativeStore';
import type { MainQuestEvent } from '../../stores/narrative/narrativeStore';
import { mainQuestTrigger } from '../../services/mainQuestTrigger';
import { narrativeIntegration } from '../../services/narrativeIntegration';
import NarrativeScreen from './NarrativeScreen';

interface NarrativeManagerProps {
  isGameActive: boolean;
}

/**
 * Componente che gestisce l'integrazione del sistema narrativo nel gioco
 */
const NarrativeManager: React.FC<NarrativeManagerProps> = ({ isGameActive }) => {
  const {
    currentStage,
    progressCounter,
    flags,
    initializeNarrative,
    advanceToNextStage
  } = useNarrativeStore();

  const [currentEvent, setCurrentEvent] = useState<MainQuestEvent | null>(null);
  const [isEventActive, setIsEventActive] = useState(false);

  // Inizializzazione del sistema narrativo
  useEffect(() => {
    initializeNarrative();
    narrativeIntegration.initialize();
  }, []);

  // Controlla i trigger della main quest ogni volta che cambia lo stato
  useEffect(() => {
    const checkMainQuest = () => {
      const eventToTrigger = mainQuestTrigger.checkMainQuestTrigger();
      if (eventToTrigger && !isEventActive) {
        setCurrentEvent(eventToTrigger);
        setIsEventActive(true);
      }
    };

    checkMainQuest();
  }, [currentStage, progressCounter, flags, isEventActive]);

  // Gestione dell'evento della main quest
  const handleMainQuestContinue = () => {
    if (currentEvent) {
      // Avanza allo stage successivo
      advanceToNextStage();
      
      // Chiudi l'evento
      setIsEventActive(false);
      setCurrentEvent(null);
    }
  };

  // Render del componente narrativo se necessario
  if (!isEventActive || !currentEvent || !isGameActive) {
    return null;
  }

  return (
    <NarrativeScreen
      currentEvent={currentEvent}
      currentFragment={null}
      onChoiceSelected={handleMainQuestContinue}
      onClose={() => {
        setIsEventActive(false);
        setCurrentEvent(null);
      }}
    />
  );
};

export default NarrativeManager;