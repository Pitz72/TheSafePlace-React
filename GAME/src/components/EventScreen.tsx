/**
 * EventScreen — narrative event overlay, v3 "Diario del Sopravvissuto".
 *
 * Variante A del design handoff: backdrop atmosferico scuro con grana,
 * narrazione su lettera di carta nella metà inferiore, scelte numerate
 * con tag meccanico visibile (skill/DC, allineamento, requisiti oggetto).
 *
 * Gestisce sia gli eventi legacy (eventStore) sia le cutscene Ink
 * (narrativeStore, quando isStoryActive) — stessa resa visiva.
 * Input misto: click sulle scelte, 1–9 per selezionare, ↑↓/W/S + Invio.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { useEventStore } from '../store/eventStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { narrativeService } from '../services/NarrativeService';
import { DONOR_NAMES } from '../constants';
import { EventChoice } from '../types';
import { Tape } from './ui';

type TagColor = 'ink' | 'rust' | 'mint' | 'slate';

interface ChoiceTag {
  text: string;
  color: TagColor;
}

/** Derive the visible mechanic tag for a legacy choice (GDD v3: tag meccanico visibile). */
function choiceTag(choice: EventChoice): ChoiceTag | null {
  const check = choice.outcomes.find((o) => o.type === 'skillCheck');
  if (check?.skill && check.dc !== undefined) {
    return { text: `${check.skill.toUpperCase()} DC ${check.dc}`, color: 'slate' };
  }
  if (choice.alignment === 'Lena') return { text: 'COMPASSIONE', color: 'mint' };
  if (choice.alignment === 'Elian') return { text: 'PRAGMATISMO', color: 'rust' };
  return null;
}

const TAG_TINTS: Record<TagColor, string> = {
  ink: 'var(--tsp-ink-faded)',
  rust: 'var(--tsp-rust)',
  mint: 'var(--tsp-mint)',
  slate: 'var(--tsp-slate)',
};

/** Dark atmospheric backdrop — gradient, dust, grain. */
const Backdrop: React.FC = () => (
  <>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 55% at 50% 42%, #2a3340, #161a22 60%, #0a0d12 100%)',
    }} />
    {Array.from({ length: 22 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: 1 + (i % 2), height: 1 + (i % 2),
        left: `${(i * 41) % 100}%`, top: `${(i * 29) % 100}%`,
        background: 'rgba(220,228,235,0.3)', borderRadius: '50%',
      }} />
    ))}
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none',
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence baseFrequency='0.8' numOctaves='2'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>\")",
      mixBlendMode: 'overlay',
    }} />
  </>
);

const EventScreen: React.FC = () => {
  const { activeEvent, resolveEventChoice, eventResolutionText, dismissEventResolution } = useEventStore();
  const { isStoryActive, currentText, currentChoices, currentTags } = useNarrativeStore();

  const inventory = useCharacterStore((state) => state.inventory);
  const playerPos = useGameStore((state) => state.playerPos);
  const getTileInfo = useGameStore((state) => state.getTileInfo);
  const gameTime = useTimeStore((state) => state.gameTime);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const paperRef = useRef<HTMLDivElement>(null);

  const isInkMode = isStoryActive;

  useEffect(() => {
    setSelectedIndex(0);
  }, [currentChoices, activeEvent, eventResolutionText]);

  // Stable random donor name per event instance
  const randomDonorName = useMemo(() => {
    return DONOR_NAMES[Math.floor(Math.random() * DONOR_NAMES.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvent]);

  const processedDescription = useMemo(() => {
    if (isInkMode) return currentText;
    if (!activeEvent) return '';
    return activeEvent.description.replace(/{RANDOM_DONOR}/g, randomDonorName).replace(/\\n/g, '\n');
  }, [activeEvent, randomDonorName, isInkMode, currentText]);

  const processedResolutionText = useMemo(() => {
    if (!eventResolutionText) return '';
    return eventResolutionText.replace(/{RANDOM_DONOR}/g, randomDonorName).replace(/\\n/g, '\n');
  }, [eventResolutionText, randomDonorName]);

  const choiceStatus = useMemo(() => {
    if (isInkMode) return currentChoices.map(() => ({ met: true, text: '' }));
    if (!activeEvent) return [];
    return activeEvent.choices.map((choice) => {
      if (!choice.itemRequirements) return { met: true, text: '' };
      for (const req of choice.itemRequirements) {
        const playerItem = inventory.find((item) => item.itemId === req.itemId);
        if (!playerItem || playerItem.quantity < req.quantity) {
          return { met: false, text: `richiede ${req.itemId} ×${req.quantity}` };
        }
      }
      return { met: true, text: '' };
    });
  }, [activeEvent, inventory, isInkMode, currentChoices]);

  const handleNavigate = useCallback((direction: number) => {
    if (eventResolutionText) return;
    const choices = isInkMode ? currentChoices : (activeEvent?.choices || []);
    const numChoices = choices.length;
    if (numChoices === 0) return;

    setSelectedIndex((prev) => {
      let newIndex = (prev + direction + numChoices) % numChoices;
      if (!isInkMode) {
        let attempts = 0;
        while (!choiceStatus[newIndex]?.met && attempts < numChoices) {
          newIndex = (newIndex + direction + numChoices) % numChoices;
          attempts++;
        }
      }
      return newIndex;
    });
    audioManager.playSound('navigate');
  }, [activeEvent, choiceStatus, eventResolutionText, isInkMode, currentChoices]);

  const confirmChoice = useCallback((index: number) => {
    if (isInkMode) {
      if (currentChoices.length > 0) {
        narrativeService.chooseChoiceIndex(currentChoices[index].index);
        audioManager.playSound('confirm');
      }
      return;
    }
    if (activeEvent && choiceStatus[index]?.met) {
      resolveEventChoice(index);
      audioManager.playSound('confirm');
    } else {
      audioManager.playSound('error');
    }
  }, [isInkMode, currentChoices, activeEvent, choiceStatus, resolveEventChoice]);

  const handleConfirm = useCallback(() => {
    if (eventResolutionText) {
      dismissEventResolution();
      audioManager.playSound('confirm');
      return;
    }
    confirmChoice(selectedIndex);
  }, [eventResolutionText, dismissEventResolution, confirmChoice, selectedIndex]);

  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (paperRef.current) {
      paperRef.current.scrollBy({ top: direction === 'down' ? 100 : -100, behavior: 'smooth' });
      audioManager.playSound('navigate');
    }
  }, []);

  const handlerMap = useMemo(() => {
    if (eventResolutionText) {
      return {
        w: () => handleScroll('up'),   ArrowUp: () => handleScroll('up'),
        s: () => handleScroll('down'), ArrowDown: () => handleScroll('down'),
        Enter: handleConfirm,
      };
    }
    const map: { [key: string]: () => void } = {
      w: () => handleNavigate(-1), ArrowUp: () => handleNavigate(-1),
      s: () => handleNavigate(1),  ArrowDown: () => handleNavigate(1),
      Enter: handleConfirm,
    };
    const numChoices = isInkMode ? currentChoices.length : (activeEvent?.choices.length ?? 0);
    for (let n = 1; n <= Math.min(numChoices, 9); n++) {
      map[String(n)] = () => {
        setSelectedIndex(n - 1);
        audioManager.playSound('navigate');
      };
    }
    return map;
  }, [handleNavigate, handleConfirm, handleScroll, eventResolutionText, isInkMode, currentChoices.length, activeEvent]);

  useKeyboardInput(handlerMap);

  if (!activeEvent && !isInkMode) return null;

  const tileInfo = getTileInfo(playerPos.x, playerPos.y);
  const time = `${String(gameTime.hour).padStart(2, '0')}:${String(gameTime.minute).padStart(2, '0')}`;
  const title = isInkMode
    ? (currentTags.find((t) => t.startsWith('title:'))?.split(':')[1]?.trim() || 'EVENTO')
    : (activeEvent?.title ?? 'EVENTO');
  const choices = isInkMode ? currentChoices : (activeEvent?.choices || []);
  const isResolution = Boolean(eventResolutionText);
  const bodyText = isResolution ? processedResolutionText : processedDescription;
  const paragraphs = bodyText.split('\n').map((p) => p.trim()).filter(Boolean);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0a0d12', zIndex: 20 }}>
      <Backdrop />

      {/* top label */}
      <div style={{ position: 'absolute', top: 32, left: 0, right: 0, textAlign: 'center', color: 'var(--tsp-paper-edge)' }}>
        <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.5em', marginBottom: 6, opacity: 0.55, color: 'var(--tsp-paper)' }}>
          {isResolution ? 'ESITO' : 'EVENTO'} · {tileInfo.name.toUpperCase()}
        </div>
        <div className="t-hand" style={{ fontSize: 18, color: 'var(--tsp-ice-glow)', opacity: 0.85 }}>
          ogni scelta lascia un segno
        </div>
      </div>

      {/* paper letter */}
      <div className="paper" style={{
        position: 'absolute',
        left: '50%', bottom: 48,
        transform: 'translateX(-50%) rotate(-0.8deg)',
        width: 'min(720px, calc(100% - 64px))',
        maxHeight: 'calc(100% - 140px)',
        padding: '32px 40px 24px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column',
      }}>
        <Tape top={-10} left={310} w={100} h={22} rot={-2} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, flex: '0 0 auto' }}>
          <div className="t-label" style={{ fontSize: 10 }}>{title.toUpperCase()}</div>
          <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--tsp-slate)' }}>
            GIORNO {gameTime.day} · {time}
          </div>
        </div>
        <hr className="ink-rule" style={{ marginBottom: 16, flex: '0 0 auto' }} />

        {/* narration — scrollable when long */}
        <div ref={paperRef} style={{ overflowY: 'auto', scrollbarWidth: 'none', flex: '0 1 auto', minHeight: 0 }}>
          {paragraphs.map((p, i) => (
            <p key={i} className="t-serif" style={{
              fontSize: i === 0 ? 18 : 16,
              lineHeight: 1.55,
              textWrap: 'pretty',
              marginBottom: 12,
              color: i === 0 ? 'var(--tsp-ink)' : 'var(--tsp-ink-faded)',
              fontStyle: i === 0 ? 'normal' : 'italic',
            }}>
              {p}
            </p>
          ))}
        </div>

        <hr className="ink-rule-dashed" style={{ margin: '4px 0 14px', flex: '0 0 auto' }} />

        {isResolution ? (
          <div style={{ flex: '0 0 auto' }}>
            <button
              className="tsp-btn tsp-btn-rust"
              onClick={handleConfirm}
              style={{ width: '100%', textAlign: 'center' }}
            >
              CONTINUA IL VIAGGIO
            </button>
            <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--tsp-slate-light)', marginTop: 10, textAlign: 'center' }}>
              INVIO CONTINUA
            </div>
          </div>
        ) : (
          <div style={{ flex: '0 0 auto' }}>
            <div className="t-label-sm" style={{ marginBottom: 10 }}>COSA FAI?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {choices.map((choice, index) => {
                const isSelected = index === selectedIndex;
                const status = choiceStatus[index];
                const met = status?.met ?? true;
                const tag: ChoiceTag | null = !met
                  ? { text: status!.text.toUpperCase(), color: 'rust' }
                  : isInkMode ? null : choiceTag((choice as EventChoice));
                const text = isInkMode ? (choice as { text: string }).text : (choice as EventChoice).text;

                return (
                  <div
                    key={index}
                    onClick={() => { if (met) { setSelectedIndex(index); confirmChoice(index); } }}
                    onMouseEnter={() => { if (met) setSelectedIndex(index); }}
                    style={{
                      display: 'flex', alignItems: 'baseline', gap: 14,
                      padding: '9px 12px 7px',
                      border: isSelected && met ? '1.5px solid var(--tsp-rust)' : '1px solid rgba(20,24,30,0.3)',
                      background: isSelected && met ? 'rgba(125,58,42,0.07)' : 'rgba(20,24,30,0.02)',
                      cursor: met ? 'pointer' : 'default',
                      opacity: met ? 1 : 0.45,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div className="t-sans" style={{
                      fontSize: 12, fontWeight: 600,
                      width: 22, height: 22, lineHeight: '22px', textAlign: 'center',
                      border: `1px solid ${isSelected && met ? 'var(--tsp-rust)' : 'var(--tsp-ink)'}`,
                      background: isSelected && met ? 'var(--tsp-rust)' : 'transparent',
                      color: isSelected && met ? 'var(--tsp-paper)' : 'var(--tsp-ink)',
                      flex: '0 0 auto',
                    }}>{index + 1}</div>
                    <div className="t-serif" style={{ flex: 1, fontSize: 15, lineHeight: 1.3 }}>
                      {text}
                    </div>
                    {tag && (
                      <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.22em', color: TAG_TINTS[tag.color], flex: '0 0 auto' }}>
                        {tag.text}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between' }}>
              <span className="t-sans" style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--tsp-slate-light)' }}>
                {choices.length > 0 ? `1–${Math.min(choices.length, 9)} SCEGLI · INVIO CONFERMA` : 'INVIO CONTINUA'}
              </span>
              <span className="t-hand" style={{ fontSize: 13, color: 'var(--tsp-slate)', opacity: 0.8 }}>
                — il diario ricorderà —
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventScreen;
