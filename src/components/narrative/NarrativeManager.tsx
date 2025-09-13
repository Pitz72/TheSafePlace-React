import React, { useEffect, useState } from 'react';
import { useNarrativeStore } from '../../stores/narrative/narrativeStore';
import { useCombatStore } from '../../stores/combatStore';
import { useCharacterStore } from '../../stores/character/characterStore';
import { useWorldStore } from '../../stores/world/worldStore';
import NarrativeScreen from './NarrativeScreen';
import { narrativeIntegration } from '../../services/narrativeIntegration';
import { storyProgression } from '../../services/storyProgression';
import {
  LoreEvent,
  QuestFragment,
  NarrativeChoice
} from '../../interfaces/narrative';

interface NarrativeManagerProps {
  isGameActive: boolean;
}

/**
 * Componente che gestisce l'integrazione del sistema narrativo nel gioco
 */
const NarrativeManager: React.FC<NarrativeManagerProps> = ({ isGameActive }) => {
  const {
    currentQuestStage,
    discoveredFragments,
    availableLoreEvents,
    emotionalState,
    recordMoralChoice,
    discoverFragment,
    updateEmotionalState
  } = useNarrativeStore();

  // Rimuovo useEventStore che non esiste più

  const [currentNarrativeEvent, setCurrentNarrativeEvent] = useState<LoreEvent | null>(null);
  const [currentQuestFragment, setCurrentQuestFragment] = useState<QuestFragment | null>(null);
  const [showNarrativeScreen, setShowNarrativeScreen] = useState(false);

  // Inizializza l'integrazione narrativa e il sistema di progressione
  useEffect(() => {
    // Inizializza l'integrazione narrativa
    narrativeIntegration.initialize();
    
    // Avvia il sistema di progressione della storia
    storyProgression.startProgressionSystem();

    return () => {
      // Cleanup
      storyProgression.stopProgressionSystem();
    };
  }, []);

  // Controlla periodicamente la progressione della quest
  useEffect(() => {
    if (!isGameActive) return;

    const checkProgressionInterval = setInterval(() => {
      narrativeIntegration.checkQuestProgression();
    }, 5000); // Controlla ogni 5 secondi

    return () => clearInterval(checkProgressionInterval);
  }, [isGameActive]);

  // Monitora gli eventi del sistema esistente per trigger narrativi
  useEffect(() => {
    const handleCombatEnd = (result: any) => {
      if (result.victory) {
        // Aggiorna stato emotivo per vittoria
        storyProgression.onCombatVictory();
        checkForNarrativeEvents('combat_victory', result);
      } else {
        // Aggiorna stato emotivo per sconfitta
        storyProgression.onCombatDefeat();
        checkForNarrativeEvents('combat_defeat', result);
      }
    };

    // Monitora i cambiamenti nello store di combattimento
    const unsubscribeCombat = useCombatStore.subscribe(
      (state) => state.combatResult,
      (combatResult) => {
        if (combatResult) {
          handleCombatEnd(combatResult);
        }
      }
    );
    
    return () => {
      unsubscribeCombat();
    };
  }, []);

  // Sistema di trigger narrativi basato su eventi di gioco
  const checkForNarrativeEvents = (eventType: string, eventData?: any) => {
    const narrativeEvent = availableLoreEvents.find(event => 
      event.triggerConditions.some(condition => condition.type === eventType)
    );
    
    if (narrativeEvent) {
       setCurrentNarrativeEvent(narrativeEvent);
       setShowNarrativeScreen(true);
     }
   };

  // Trigger automatico di frammenti di quest basato sullo stato emotivo
  useEffect(() => {
    if (!isGameActive) return;

    const triggerQuestFragments = () => {
      // Logica semplificata per i frammenti di quest
      const mockFragment: QuestFragment = {
        id: `fragment_${Date.now()}`,
        title: 'Memoria del Passato',
        content: 'Un ricordo emerge dalla nebbia della memoria...',
        emotionalTrigger: emotionalState.dominantEmotion,
        stageRequirement: currentQuestStage,
        choices: []
      };
      
      if (!discoveredFragments.some(f => f.id === mockFragment.id)) {
        setCurrentQuestFragment(mockFragment);
        setShowNarrativeScreen(true);
        discoverFragment(mockFragment);
      }
    };

    // Trigger frammenti con un delay per evitare spam
    const fragmentTimer = setTimeout(triggerQuestFragments, 2000);
    return () => clearTimeout(fragmentTimer);
  }, [emotionalState, currentQuestStage, isGameActive]);

  // Funzioni di utilità rimosse - logica semplificata nel checkForNarrativeEvents

  // Funzione getEligibleQuestFragments rimossa - logica integrata nel useEffect

  /**
   * Gestisce la selezione di una scelta narrativa
   */
  const handleNarrativeChoice = (choice: NarrativeChoice) => {
    // Registra la scelta morale
    const moralChoice = {
      id: `${Date.now()}_${choice.id}`,
      eventId: currentNarrativeEvent?.id || currentQuestFragment?.id || 'unknown',
      choiceText: choice.text,
      alignment: choice.alignment,
      emotionalImpact: choice.emotionalImpact,
      reflectionText: choice.reflectionText,
      timestamp: Date.now()
    };

    recordMoralChoice(moralChoice);

    // Applica l'impatto emotivo
    if (choice.emotionalImpact) {
      updateEmotionalState(choice.emotionalImpact);
    }

    // Chiudi la schermata narrativa
    handleCloseNarrativeScreen();
  };

  /**
   * Gestisce la chiusura della schermata narrativa
   */
  const handleCloseNarrativeScreen = () => {
    setShowNarrativeScreen(false);
    setCurrentNarrativeEvent(null);
    setCurrentQuestFragment(null);
    
    // Se c'era un evento del sistema esistente, dismissalo
    if (currentEvent) {
      dismissCurrentEvent();
    }
  };

  // Render del componente narrativo se necessario
  if (!showNarrativeScreen || !isGameActive) {
    return null;
  }

  return (
    <NarrativeScreen
      currentEvent={currentNarrativeEvent}
      currentFragment={currentQuestFragment}
      onChoiceSelected={handleNarrativeChoice}
      onClose={handleCloseNarrativeScreen}
    />
  );
};

export default NarrativeManager;