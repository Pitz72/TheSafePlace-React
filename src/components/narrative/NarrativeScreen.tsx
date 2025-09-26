import React, { useState, useEffect } from 'react';
import type { MainQuestEvent } from '@/stores/narrative/narrativeStore';

interface NarrativeScreenProps {
  currentEvent?: MainQuestEvent;
  currentFragment?: null;
  onChoiceSelected: () => void;
  onClose: () => void;
}

const NarrativeScreen: React.FC<NarrativeScreenProps> = ({
  currentEvent,
  onChoiceSelected,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentEvent]);

  const handleContinue = () => {
    onChoiceSelected();
  };

  if (!currentEvent) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className={`text-amber-200 bg-gradient-to-b from-slate-800 to-amber-900 border border-white/20 rounded-lg max-w-4xl mx-4 shadow-2xl transform transition-all duration-500 ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="border-b border-white/20 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {currentEvent.title}
              </h2>
              <div className="flex items-center gap-4 text-sm opacity-80">
                <span>📖 Stage {currentEvent.stage}</span>
                <span>🎯 Main Quest</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Main narrative text */}
          <div className="mb-8 p-6 bg-black/30 border border-white/20 rounded-lg">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                {currentEvent.description}
              </p>
            </div>
          </div>

          {/* Continue button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all duration-200 font-semibold text-lg"
            >
              [Invio] Continua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeScreen;