import React, { useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import BlackScreen from './BlackScreen';
import ProductionScreen from './ProductionScreen';
import BootSimulation from './BootSimulation';

const BootSequenceManager: React.FC = () => {
  const { bootPhase, advanceBootPhase, skipBootSequence, isBootSequenceActive } = useGameStore();

  const handlePhaseComplete = useCallback(() => {
    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      advanceBootPhase();
    }, 0);
  }, [advanceBootPhase]);

  const handleSkip = useCallback(() => {
    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      skipBootSequence();
    }, 0);
  }, [skipBootSequence]);

  // Don't render if boot sequence is not active
  if (!isBootSequenceActive) {
    return null;
  }

  switch (bootPhase) {
    case 'black-screen-1':
      return (
        <BlackScreen
          duration={2000} // 2 seconds
          onComplete={handlePhaseComplete}
          onSkip={handleSkip}
        />
      );

    case 'production':
      return (
        <ProductionScreen
          duration={2000} // 2 seconds for ASCII logo
          onComplete={handlePhaseComplete}
          onSkip={handleSkip}
        />
      );

    case 'black-screen-2':
      return (
        <BlackScreen
          duration={1000} // 1 second
          onComplete={handlePhaseComplete}
          onSkip={handleSkip}
        />
      );

    case 'boot-simulation':
      return (
        <BootSimulation
          onComplete={handlePhaseComplete}
          onSkip={handleSkip}
        />
      );

    case 'black-screen-3':
      return (
        <BlackScreen
          duration={500} // 0.5 seconds
          onComplete={handlePhaseComplete}
          onSkip={handleSkip}
        />
      );

    default:
      return null;
  }
};

export default BootSequenceManager;