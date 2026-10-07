import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNarrativeStore } from '../store/narrativeStore';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { narrativeService } from '../services/NarrativeService';
import { audioManager } from '../utils/audio';

const FALLBACK_SPEAKER = 'Sconosciuto';
const TYPING_SPEED_MS = 10;

/** Ink dialogue with an NPC: typewriter text and numbered choices. */
const DialogueScreen: React.FC = () => {
  const { currentText, currentChoices, currentSpeaker, revision } = useNarrativeStore();
  const [shownChars, setShownChars] = useState(0);
  const [selected, setSelected] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const isTyping = shownChars < currentText.length;

  useEffect(() => {
    setShownChars(0);
    setSelected(0);
    if (!currentText) return;
    const timer = setInterval(() => {
      setShownChars(prev => {
        if (prev >= currentText.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, TYPING_SPEED_MS);
    return () => clearInterval(timer);
  }, [currentText, revision]);

  useEffect(() => {
    if (textRef.current) textRef.current.scrollTop = textRef.current.scrollHeight;
  }, [shownChars]);

  const choose = useCallback((index: number) => {
    const choice = currentChoices[index];
    if (!choice) return;
    audioManager.playSound('confirm');
    narrativeService.chooseChoiceIndex(choice.index);
  }, [currentChoices]);

  const navigate = useCallback((direction: number) => {
    if (currentChoices.length === 0) return;
    setSelected(prev => (prev + direction + currentChoices.length) % currentChoices.length);
    audioManager.playSound('navigate');
  }, [currentChoices.length]);

  const handlerMap = useMemo((): KeyHandlerMap => {
    if (isTyping) {
      const skip = () => setShownChars(currentText.length);
      return { ' ': skip, Enter: skip, Escape: skip };
    }
    const map: KeyHandlerMap = {
      w: () => navigate(-1), ArrowUp: () => navigate(-1),
      s: () => navigate(1), ArrowDown: () => navigate(1),
      Enter: () => choose(selected),
      ' ': () => choose(selected),
      // Emergency exit, should Ink ever stall without choices.
      Escape: () => narrativeService.endDialogue(),
    };
    for (let i = 1; i <= 9; i++) map[String(i)] = () => choose(i - 1);
    return map;
  }, [isTyping, currentText.length, navigate, choose, selected]);

  useKeyboardInput(handlerMap);

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl max-h-full border-8 border-double border-amber-600/50 flex flex-col p-8 bg-black/80">
        <h1 className="text-center mb-6 text-6xl font-bold tracking-widest uppercase text-amber-500">
          ═══ {(currentSpeaker || FALLBACK_SPEAKER).toUpperCase()} ═══
        </h1>
        <div ref={textRef} className="min-h-[200px] max-h-[440px] overflow-y-auto mb-8 p-6 border-2 border-amber-600/30 bg-amber-950/20" style={{ scrollbarWidth: 'none' }}>
          <p className="text-3xl text-amber-100 leading-relaxed whitespace-pre-wrap">
            {currentText.slice(0, shownChars)}
            {isTyping && <span className="animate-pulse">▮</span>}
          </p>
        </div>
        {!isTyping && (
          <div className="space-y-3 mb-6">
            {currentChoices.map((option, index) => (
              <div key={`${revision}-${index}`} className={`text-3xl pl-4 py-2 border-l-4 ${index === selected ? 'border-amber-500 bg-amber-500/20 text-amber-100' : 'border-transparent text-amber-300'}`}>
                <span className="text-amber-500 font-bold">[{index + 1}]</span> {option.text}
              </div>
            ))}
            {currentChoices.length === 0 && (
              <div className="text-3xl text-amber-300/50 italic text-center mt-4">(Premi ESC per chiudere)</div>
            )}
          </div>
        )}
        <div className="flex-shrink-0 text-center text-2xl mt-auto border-t-4 border-double border-amber-600/50 pt-4 text-amber-400/70">
          {isTyping ? '[SPAZIO/INVIO] Mostra tutto' : '[1-9] oppure [↑↓] + [INVIO] Scegli'}
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;
