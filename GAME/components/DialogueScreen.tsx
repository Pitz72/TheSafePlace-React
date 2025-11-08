import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDialogueStore } from '../store/dialogueStore';
import { useDialogueDatabaseStore } from '../data/dialogueDatabase';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { dialogueService } from '../services/dialogueService';

/**
 * DialogueScreen component (v1.7.0).
 * Renders interactive dialogue with NPCs using a typewriter effect.
 * 
 * @description Full-screen modal dialogue interface with:
 * - NPC name display
 * - Typewriter effect for NPC text
 * - Numbered dialogue options
 * - Skill check result display
 * - Keyboard-only navigation (1-9 for options, ESC to exit)
 * 
 * @returns {JSX.Element} The rendered DialogueScreen component.
 */
const DialogueScreen: React.FC = () => {
  const { activeDialogueId, currentNodeId, skillCheckResult } = useDialogueStore();
  const { dialogues } = useDialogueDatabaseStore();
  const { activeQuests, completedQuests, inventory, alignment } = useCharacterStore();
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fullText, setFullText] = useState('');

  // Get current dialogue and node
  const dialogue = activeDialogueId ? dialogues[activeDialogueId] : null;
  const currentNode = dialogue && currentNodeId ? dialogue.nodes[currentNodeId] : null;

  // Typewriter effect
  useEffect(() => {
    if (!currentNode) return;
    
    const text = currentNode.npcText;
    setFullText(text);
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const typingSpeed = 10; // v1.9.8: Reduced from 30ms to 10ms for faster typing

    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [currentNode]);

  // Filter options based on show conditions
  const visibleOptions = useMemo(() => {
    if (!currentNode) return [];
    
    return currentNode.options.filter(option => {
      if (!option.showCondition) return true;
      
      const condition = option.showCondition;
      
      // Check quest active condition
      if (condition.questActive && !activeQuests[condition.questActive]) {
        return false;
      }
      
      // Check quest completed condition
      if (condition.questCompleted && !completedQuests.includes(condition.questCompleted)) {
        return false;
      }
      
      // Check has item condition
      if (condition.hasItem && !inventory.some(i => i.itemId === condition.hasItem)) {
        return false;
      }
      
      // Check alignment condition
      if (condition.alignment && condition.minAlignmentValue) {
        const alignmentValue = alignment[condition.alignment];
        if (alignmentValue < condition.minAlignmentValue) {
          return false;
        }
      }
      
      return true;
    });
  }, [currentNode, activeQuests, completedQuests, inventory, alignment]);

  // Keyboard input handler
  const handleKeyPress = useCallback((key: string) => {
    // Don't allow input while typing or showing skill check result
    if (isTyping || skillCheckResult) return;
    
    // ESC to exit dialogue
    if (key === 'Escape') {
      dialogueService.endDialogue();
      return;
    }
    
    // Number keys 1-9 for options
    const numberMatch = key.match(/^[1-9]$/);
    if (numberMatch) {
      const optionIndex = parseInt(key, 10) - 1;
      if (optionIndex < visibleOptions.length) {
        dialogueService.selectOption(optionIndex);
      }
    }
    
    // SPACE to skip typewriter effect
    if (key === ' ' && isTyping) {
      setDisplayedText(fullText);
      setIsTyping(false);
    }
  }, [isTyping, skillCheckResult, visibleOptions, fullText]);

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

  // Safety check
  if (!dialogue || !currentNode) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <p className="text-4xl text-red-500">Errore: Dialogo non trovato</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl border-8 border-double border-amber-600/50 flex flex-col p-8 bg-black/80">
        
        {/* NPC Name Header */}
        <div className="text-center mb-6">
          <h1 className="text-6xl font-bold tracking-widest uppercase text-amber-500">
            ═══ {dialogue.npcName.toUpperCase()} ═══
          </h1>
        </div>

        {/* NPC Text with Typewriter Effect */}
        <div className="min-h-[200px] mb-8 p-6 border-2 border-amber-600/30 bg-amber-950/20">
          <p className="text-3xl text-amber-100 leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">▮</span>}
          </p>
        </div>

        {/* Skill Check Result Display */}
        {skillCheckResult && (
          <div className={`mb-6 p-4 border-2 text-center text-3xl ${
            skillCheckResult.success 
              ? 'border-green-500 bg-green-950/30 text-green-400' 
              : 'border-red-500 bg-red-950/30 text-red-400'
          }`}>
            {skillCheckResult.text}
          </div>
        )}

        {/* Dialogue Options */}
        {!isTyping && !skillCheckResult && (
          <div className="space-y-3 mb-6">
            {visibleOptions.map((option, index) => (
              <div
                key={index}
                className="text-3xl text-amber-300 hover:text-amber-100 transition-colors pl-4 py-2 border-l-4 border-transparent hover:border-amber-500"
              >
                <span className="text-amber-500 font-bold">[{index + 1}]</span> {option.text}
              </div>
            ))}
          </div>
        )}

        {/* Controls Help */}
        <div className="flex-shrink-0 text-center text-2xl mt-auto border-t-4 border-double border-amber-600/50 pt-4 text-amber-400/70">
          {isTyping ? (
            '[SPAZIO] Salta animazione'
          ) : skillCheckResult ? (
            'Attendere...'
          ) : (
            '[1-9] Seleziona opzione | [ESC] Termina dialogo'
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;