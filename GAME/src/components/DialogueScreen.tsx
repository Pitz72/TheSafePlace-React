import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNarrativeStore } from '../store/narrativeStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { narrativeService } from '../services/NarrativeService';

/**
 * DialogueScreen component (v2.0.3).
 * Renders interactive dialogue with NPCs using a typewriter effect.
 * Now powered by Inkjs via NarrativeService.
 * 
 * @description Full-screen modal dialogue interface with:
 * - NPC text from Ink
 * - Numbered dialogue options from Ink
 * - Keyboard-only navigation (1-9 for options, ESC to exit)
 * 
 * @returns {JSX.Element} The rendered DialogueScreen component.
 */
const DialogueScreen: React.FC = () => {
  const { currentText, currentChoices, currentTags } = useNarrativeStore();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fullText, setFullText] = useState('');

  // Extract NPC Name from tags (e.g., #speaker:Marcus)
  const npcName = useMemo(() => {
    const speakerTag = currentTags.find(tag => tag.startsWith('speaker:'));
    return speakerTag ? speakerTag.split(':')[1] : 'Sconosciuto';
  }, [currentTags]);

  // Typewriter effect
  useEffect(() => {
    if (!currentText) return;

    setFullText(currentText);
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const typingSpeed = 10;

    const typeInterval = setInterval(() => {
      if (currentIndex < currentText.length) {
        setDisplayedText(currentText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [currentText]);

  // Keyboard input handler
  const handleKeyPress = useCallback((key: string) => {
    // Don't allow input while typing
    if (isTyping) return;

    // ESC to exit dialogue (if allowed by story logic, usually handled by choices)
    // For now, we allow ESC to force close if needed, but Ink should handle flow.
    if (key === 'Escape') {
      // narrativeService.endDialogue(); // Optional: allow manual exit
      return;
    }

    // Number keys 1-9 for options
    const numberMatch = key.match(/^[1-9]$/);
    if (numberMatch) {
      const optionIndex = parseInt(key, 10) - 1;
      if (optionIndex < currentChoices.length) {
        narrativeService.chooseChoiceIndex(currentChoices[optionIndex].index);
      }
    }

    // SPACE to skip typewriter effect
    if (key === ' ' && isTyping) {
      setDisplayedText(fullText);
      setIsTyping(false);
    } else if (key === ' ' && !isTyping && currentChoices.length === 0) {
      // If no choices, maybe it's a "continue" situation?
      // Ink usually presents choices or ends. If we have a "Continue" button equivalent:
      // narrativeService.continue();
    }
  }, [isTyping, currentChoices, fullText]);

  const handlerMap = useMemo(() => {
    const map: Record<string, () => void> = {
      'Escape': () => handleKeyPress('Escape'),
      ' ': () => handleKeyPress(' '),
    };

    // Add number key handlers
    for (let i = 1; i <= 9; i++) {
      map[i.toString()] = () => handleKeyPress(i.toString());
    }

    return map;
  }, [handleKeyPress]);

  useKeyboardInput(handlerMap);

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl border-8 border-double border-amber-600/50 flex flex-col p-8 bg-black/80">

        {/* NPC Name Header */}
        <div className="text-center mb-6">
          <h1 className="text-6xl font-bold tracking-widest uppercase text-amber-500">
            ═══ {npcName.toUpperCase()} ═══
          </h1>
        </div>

        {/* NPC Text with Typewriter Effect */}
        <div className="min-h-[200px] mb-8 p-6 border-2 border-amber-600/30 bg-amber-950/20">
          <p className="text-3xl text-amber-100 leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">▮</span>}
          </p>
        </div>

        {/* Dialogue Options */}
        {!isTyping && (
          <div className="space-y-3 mb-6">
            {currentChoices.map((option, index) => (
              <div
                key={index}
                className="text-3xl text-amber-300 hover:text-amber-100 transition-colors pl-4 py-2 border-l-4 border-transparent hover:border-amber-500"
              >
                <span className="text-amber-500 font-bold">[{index + 1}]</span> {option.text}
              </div>
            ))}
            {currentChoices.length === 0 && !isTyping && (
              <div className="text-3xl text-amber-300/50 italic text-center mt-4">
                (Premi ESC per chiudere se bloccato)
              </div>
            )}
          </div>
        )}

        {/* Controls Help */}
        <div className="flex-shrink-0 text-center text-2xl mt-auto border-t-4 border-double border-amber-600/50 pt-4 text-amber-400/70">
          {isTyping ? (
            '[SPAZIO] Salta animazione'
          ) : (
            '[1-9] Seleziona opzione'
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;