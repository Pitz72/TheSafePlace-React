import React, { useState, useEffect } from 'react';
import { useNarrativeStore } from '../../stores/narrative/narrativeStore';
import {
  LoreEvent,
  NarrativeChoice,
  QuestFragment,
  TextTone,
  MoralAlignment
} from '../../interfaces/narrative';

interface NarrativeScreenProps {
  currentEvent?: LoreEvent;
  currentFragment?: QuestFragment;
  onChoiceSelected: (choice: NarrativeChoice) => void;
  onClose: () => void;
}

const NarrativeScreen: React.FC<NarrativeScreenProps> = ({
  currentEvent,
  currentFragment,
  onChoiceSelected,
  onClose
}) => {
  const {
    emotionalState,
    currentQuestStage,
    recordMoralChoice,
    generateReflection,
    getLastReflection
  } = useNarrativeStore();

  const [showReflection, setShowReflection] = useState(false);
  const [currentReflection, setCurrentReflection] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentEvent, currentFragment]);

  const getToneClass = (tone: TextTone): string => {
    const toneClasses = {
      malinconico: 'text-blue-200 bg-gradient-to-b from-slate-800 to-blue-900',
      poetico: 'text-purple-200 bg-gradient-to-b from-slate-800 to-purple-900',
      introspettivo: 'text-amber-200 bg-gradient-to-b from-slate-800 to-amber-900',
      nostalgico: 'text-rose-200 bg-gradient-to-b from-slate-800 to-rose-900',
      speranzoso: 'text-green-200 bg-gradient-to-b from-slate-800 to-green-900',
      doloroso: 'text-red-200 bg-gradient-to-b from-slate-800 to-red-900'
    };
    return toneClasses[tone] || 'text-gray-200 bg-gradient-to-b from-slate-800 to-gray-900';
  };

  const getAlignmentColor = (alignment: MoralAlignment): string => {
    switch (alignment) {
      case MoralAlignment.LENA:
        return 'border-rose-400 bg-rose-900/30 hover:bg-rose-800/40';
      case MoralAlignment.ELIAN:
        return 'border-blue-400 bg-blue-900/30 hover:bg-blue-800/40';
      case MoralAlignment.NEUTRAL:
        return 'border-amber-400 bg-amber-900/30 hover:bg-amber-800/40';
      default:
        return 'border-gray-400 bg-gray-900/30 hover:bg-gray-800/40';
    }
  };

  const getAlignmentLabel = (alignment: MoralAlignment): string => {
    switch (alignment) {
      case MoralAlignment.LENA:
        return '💝 Compassione di Lena';
      case MoralAlignment.ELIAN:
        return '🛡️ Pragmatismo di Elian';
      case MoralAlignment.NEUTRAL:
        return '⚖️ Equilibrio';
      default:
        return '';
    }
  };

  const handleChoiceClick = (choice: NarrativeChoice) => {
    // Registra la scelta morale
    const moralChoice = {
      id: `${Date.now()}_${choice.id}`,
      eventId: currentEvent?.id || currentFragment?.id || 'unknown',
      choiceText: choice.text,
      alignment: choice.alignment,
      emotionalImpact: choice.emotionalImpact,
      reflectionText: choice.reflectionText,
      timestamp: Date.now()
    };

    recordMoralChoice(moralChoice);

    // Genera riflessione
    const reflection = generateReflection({
      eventType: 'moral_choice',
      choiceAlignment: choice.alignment
    });

    setCurrentReflection(choice.reflectionText);
    setShowReflection(true);

    // Chiama il callback
    onChoiceSelected(choice);
  };

  const handleReflectionClose = () => {
    setShowReflection(false);
    setCurrentReflection(null);
    onClose();
  };

  if (showReflection && currentReflection) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-600/50 rounded-lg p-8 max-w-2xl mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-amber-300 mb-2">💭 Riflessioni di Ultimo</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto rounded"></div>
          </div>
          
          <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-6 mb-6">
            <p className="text-amber-100 leading-relaxed text-lg italic">
              "{currentReflection}"
            </p>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleReflectionClose}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all duration-200 font-semibold"
            >
              Continua il Viaggio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = currentEvent || currentFragment;
  if (!content) return null;

  const tone = currentEvent?.tone || currentFragment?.tone || TextTone.INTROSPETTIVO;
  const choices = currentEvent?.choices || [];

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className={`${getToneClass(tone)} border border-white/20 rounded-lg max-w-4xl mx-4 shadow-2xl transform transition-all duration-500 ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="border-b border-white/20 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {currentEvent?.title || currentFragment?.title}
              </h2>
              <div className="flex items-center gap-4 text-sm opacity-80">
                <span>📖 Stage {currentQuestStage}</span>
                <span>💫 {tone}</span>
                {currentEvent && (
                  <span className="px-2 py-1 bg-white/10 rounded text-xs">
                    {currentEvent.category}
                  </span>
                )}
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
          {/* Description */}
          {currentEvent?.description && (
            <div className="mb-6 p-4 bg-black/20 border border-white/10 rounded-lg">
              <p className="text-lg opacity-90 italic">
                {currentEvent.description}
              </p>
            </div>
          )}

          {/* Main narrative text */}
          <div className="mb-8 p-6 bg-black/30 border border-white/20 rounded-lg">
            <div className="prose prose-invert max-w-none">
              {(currentEvent?.narrativeText || currentFragment?.narrativeText || '').split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Emotional State Display */}
          <div className="mb-6 p-4 bg-black/20 border border-white/10 rounded-lg">
            <h4 className="text-sm font-semibold mb-3 opacity-80">💭 Stato Emotivo di Ultimo</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Compassione:</span>
                <span className="text-rose-300">{emotionalState.compassionLevel}%</span>
              </div>
              <div className="flex justify-between">
                <span>Pragmatismo:</span>
                <span className="text-blue-300">{emotionalState.pragmatismLevel}%</span>
              </div>
              <div className="flex justify-between">
                <span>Comprensione:</span>
                <span className="text-amber-300">{emotionalState.understandingLevel}%</span>
              </div>
              <div className="flex justify-between">
                <span>Ricordi di Lena:</span>
                <span className="text-purple-300">{emotionalState.lenaMemoryStrength}%</span>
              </div>
            </div>
          </div>

          {/* Choices */}
          {choices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">🤔 Come reagisce Ultimo?</h3>
              {choices.map((choice, index) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceClick(choice)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                    getAlignmentColor(choice.alignment)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">
                      {index === 0 ? '🅰️' : index === 1 ? '🅱️' : '🅲️'}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg mb-2">{choice.text}</p>
                      <div className="text-sm opacity-75">
                        {getAlignmentLabel(choice.alignment)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Fragment completion */}
          {currentFragment && choices.length === 0 && (
            <div className="text-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all duration-200 font-semibold text-lg"
              >
                Continua
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarrativeScreen;