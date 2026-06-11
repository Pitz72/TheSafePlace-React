/**
 * DialogueScreen — NPC conversation, v3 "Diario del Sopravvissuto".
 *
 * Dal design handoff: backdrop interno con lanterna, carta NPC in alto
 * (ritratto + nome sticky da tag Ink #speaker), risposte su carta in
 * basso. Backend invariato: narrativeStore + NarrativeService (Inkjs).
 *
 * Input misto: click sulle risposte, 1–9, SPAZIO salta il typewriter,
 * ESC esce (uscita di emergenza — il flusso normale chiude su -> END).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNarrativeStore } from '../store/narrativeStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { narrativeService } from '../services/NarrativeService';
import { Tape } from './ui';

const FALLBACK_SPEAKER = 'Sconosciuto';

/** Warm interior backdrop — lantern glow, floor boards, shelf. */
const Backdrop: React.FC = () => (
  <>
    <svg viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}>
      <defs>
        <radialGradient id="dlgGlow" cx="60%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(232,210,170,0.20)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="1280" height="800" fill="#161a22" />
      <rect width="1280" height="800" fill="url(#dlgGlow)" />
      <ellipse cx="700" cy="700" rx="500" ry="120" fill="rgba(232,210,170,0.10)" />
      <g opacity="0.4">
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={0} y1={600 + i * 40} x2="1280" y2={600 + i * 40} stroke="#3a2a1a" strokeWidth="1" />
        ))}
      </g>
      <g transform="translate(960 110)">
        <line x1="0" y1="-110" x2="0" y2="0" stroke="#1a1d22" strokeWidth="1" />
        <rect x="-14" y="0" width="28" height="34" fill="#3a2a1a" stroke="#0a0d12" strokeWidth="1" />
        <rect x="-10" y="4" width="20" height="22" fill="#e8caa0" opacity="0.7" />
      </g>
      <ellipse cx="960" cy="180" rx="200" ry="80" fill="rgba(232,210,170,0.18)" />
      <g transform="translate(80 480)" fill="#2a2620">
        <rect x="0" y="0" width="240" height="6" />
        <rect x="20" y="-40" width="20" height="40" />
        <rect x="60" y="-30" width="14" height="30" />
        <rect x="100" y="-50" width="18" height="50" />
        <rect x="140" y="-25" width="22" height="25" />
      </g>
    </svg>
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none',
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>\")",
      mixBlendMode: 'overlay',
    }} />
  </>
);

/** Generic NPC portrait sketch (per-NPC art is a future asset pass). */
const PortraitSketch: React.FC = () => (
  <div className="tsp-photo" style={{ width: 100, height: 125, border: '1.5px solid var(--tsp-ink)', flex: '0 0 auto', position: 'relative' }}>
    <svg viewBox="0 0 100 125" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <rect width="100" height="125" fill="#1a1d22" />
      <circle cx="50" cy="48" r="22" fill="#3a2618" />
      <path d="M 14 125 Q 50 70 86 125 Z" fill="#3a2618" />
      <path d="M 38 44 L 36 50 M 64 44 L 66 50" stroke="#0a0d12" strokeWidth="1.2" fill="none" />
    </svg>
  </div>
);

const DialogueScreen: React.FC = () => {
  const { currentText, currentChoices, currentSpeaker } = useNarrativeStore();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastPlayerLine, setLastPlayerLine] = useState<string | null>(null);

  const npcName = currentSpeaker || FALLBACK_SPEAKER;

  // Typewriter effect on each new Ink paragraph
  useEffect(() => {
    if (!currentText) return;
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < currentText.length) {
        setDisplayedText(currentText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 10);

    return () => clearInterval(typeInterval);
  }, [currentText]);

  const skipTypewriter = useCallback(() => {
    setDisplayedText(currentText);
    setIsTyping(false);
  }, [currentText]);

  const chooseOption = useCallback((optionIndex: number) => {
    if (isTyping) return;
    if (optionIndex < currentChoices.length) {
      setLastPlayerLine(currentChoices[optionIndex].text);
      narrativeService.chooseChoiceIndex(currentChoices[optionIndex].index);
    }
  }, [isTyping, currentChoices]);

  const handlerMap = useMemo(() => {
    const map: Record<string, () => void> = {
      Escape: () => narrativeService.endDialogue(),
      ' ': () => { if (isTyping) skipTypewriter(); },
    };
    for (let i = 1; i <= 9; i++) {
      map[String(i)] = () => chooseOption(i - 1);
    }
    return map;
  }, [isTyping, skipTypewriter, chooseOption]);

  useKeyboardInput(handlerMap);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0a0d12', zIndex: 20 }}>
      <Backdrop />

      {/* NPC card — top */}
      <div className="paper" style={{
        position: 'absolute', left: '50%', top: 32,
        transform: 'translateX(-50%) rotate(-0.5deg)',
        width: 'min(720px, calc(100% - 64px))',
        padding: '20px 28px 18px',
        boxShadow: '0 16px 32px rgba(0,0,0,0.65)',
      }}>
        <Tape top={-10} left={310} w={100} h={22} rot={2} />
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <PortraitSketch />
          <div style={{ flex: 1 }}>
            <div className="t-label" style={{ marginBottom: 2 }}>STAI PARLANDO CON</div>
            <div className="t-serif" style={{ fontSize: 32, lineHeight: 1, fontWeight: 500 }}>{npcName}</div>
            <hr className="ink-rule-dashed" style={{ margin: '12px 0 8px' }} />
            {lastPlayerLine && !isTyping && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <span className="t-sans" style={{ fontSize: 12, letterSpacing: '0.2em', color: 'var(--tsp-rust)', paddingTop: 2, flex: '0 0 auto' }}>TU</span>
                <span className="t-serif" style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--tsp-slate)', lineHeight: 1.4 }}>
                  "{lastPlayerLine}"
                </span>
              </div>
            )}
            <p className="t-serif" style={{ fontSize: 19, fontStyle: 'italic', color: 'var(--tsp-ink)', lineHeight: 1.5, textWrap: 'pretty', minHeight: 52 }}>
              "{displayedText}"
              {isTyping && <span style={{ opacity: 0.6 }}>▮</span>}
            </p>
          </div>
        </div>
      </div>

      {/* choices — bottom card */}
      <div className="paper" style={{
        position: 'absolute', left: '50%', bottom: 36,
        transform: 'translateX(-50%) rotate(0.5deg)',
        width: 'min(720px, calc(100% - 64px))',
        padding: '16px 24px 16px',
        boxShadow: '0 16px 32px rgba(0,0,0,0.65)',
      }}>
        <div className="t-label-sm" style={{ marginBottom: 10 }}>COSA RISPONDI?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: isTyping ? 0.35 : 1, transition: 'opacity 0.2s ease' }}>
          {currentChoices.length > 0 ? (
            currentChoices.map((option, index) => (
              <div
                key={index}
                onClick={() => chooseOption(index)}
                style={{
                  display: 'flex', alignItems: 'baseline', gap: 14,
                  padding: '8px 12px 7px',
                  border: '1px solid rgba(20,24,30,0.3)',
                  cursor: isTyping ? 'default' : 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => { if (!isTyping) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--tsp-rust)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(20,24,30,0.3)'; }}
              >
                <div className="t-sans" style={{
                  fontSize: 13, fontWeight: 600, width: 23, height: 23,
                  lineHeight: '23px', textAlign: 'center',
                  border: '1px solid var(--tsp-ink)', color: 'var(--tsp-ink)', flex: '0 0 auto',
                }}>{index + 1}</div>
                <div className="t-serif" style={{ flex: 1, fontSize: 16, lineHeight: 1.3 }}>
                  {option.text}
                </div>
              </div>
            ))
          ) : (
            !isTyping && (
              <div className="t-serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--tsp-slate)', textAlign: 'center', padding: '8px 0' }}>
                (premi ESC per chiudere se il dialogo è bloccato)
              </div>
            )
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <span className="t-sans" style={{ fontSize: 11, letterSpacing: '0.32em', color: 'var(--tsp-slate-light)' }}>
            {isTyping ? 'SPAZIO SALTA' : '1–9 SCEGLI · ESC ESCI'}
          </span>
          <span className="t-hand" style={{ fontSize: 16, color: 'var(--tsp-slate)', opacity: 0.85 }}>
            ogni parola conta
          </span>
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;
