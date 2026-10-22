import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNarrativeStore } from '../store/narrativeStore';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { narrativeService } from '../services/NarrativeService';
import { audioManager } from '../utils/audio';
import { Tone, toneColor } from '../utils/palette';
import { PORTRAITS } from '../assets/art';
import Modal from './ui/Modal';
import ChoiceList from './ui/ChoiceList';

const FALLBACK_SPEAKER = 'Sconosciuto';
const TYPING_SPEED_MS = 10;

const AVATAR_TONES: Tone[] = ['ember', 'teal', 'sage', 'violet', 'gold', 'lena', 'elian'];

/** The speaker's portrait, or their initial in a colored ring (always the same color for a name). */
const SpeakerAvatar: React.FC<{ name: string }> = ({ name }) => {
  const portrait = PORTRAITS[name.toLowerCase()];
  const tone = AVATAR_TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_TONES.length];
  const color = toneColor(tone);
  return (
    <span
      className="relative flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ boxShadow: `0 0 0 2px ${color}, 0 0 0 7px ${toneColor(tone, 0.15)}, 0 12px 30px -10px ${toneColor(tone, 0.7)}`, background: `radial-gradient(circle at 35% 30%, ${toneColor(tone, 0.35)}, rgb(var(--c-bg1)) 75%)` }}
    >
      {portrait
        ? <img src={portrait} alt="" className="h-full w-full object-cover" />
        : <span className="title-display text-[44px] leading-none" style={{ color }}>{name.charAt(0).toUpperCase()}</span>}
    </span>
  );
};

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

  const speaker = currentSpeaker || FALLBACK_SPEAKER;

  return (
    <Modal
      backdrop="blur"
      accent="ember"
      eyebrow="Dialogo"
      icon="chat"
      title={<span className="flex items-center gap-6"><SpeakerAvatar name={speaker} />{speaker}</span>}
      size="lg"
      bodyClassName="flex flex-col"
      hints={isTyping
        ? [{ keys: ['SPAZIO', 'INVIO'], label: 'Mostra tutto' }]
        : currentChoices.length > 0
          ? [{ keys: ['1-9'], label: 'Scegli' }, { keys: ['↑↓'], label: 'Seleziona' }, { keys: ['INVIO'], label: 'Conferma' }]
          : [{ keys: ['ESC'], label: 'Chiudi' }]}
    >
      <div ref={textRef} className="scroll-y fade-edges min-h-[160px] flex-shrink px-12">
        <div className="hairline mb-6" />
        <p className="prose-story whitespace-pre-wrap pb-4 text-[26px]">
          {currentText.slice(0, shownChars)}
          {isTyping && <span className="anim-caret ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] bg-ember" />}
        </p>
      </div>
      <div className="min-h-[72px] flex-shrink-0 px-12 pb-8 pt-3">
        {!isTyping && (
          currentChoices.length > 0 ? (
            <div className="anim-fade-up">
              <ChoiceList
                numbered
                selected={selected}
                items={currentChoices.map((option, index) => ({ id: `${revision}-${index}`, label: option.text }))}
              />
            </div>
          ) : (
            <p className="text-center text-[19px] italic text-ink3 anim-fade-in">Il dialogo è finito. Premi ESC per chiudere.</p>
          )
        )}
      </div>
    </Modal>
  );
};

export default DialogueScreen;
