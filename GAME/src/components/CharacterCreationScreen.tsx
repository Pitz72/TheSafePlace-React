import { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { Stamp } from './ui/Stamp';

// Fixed stats per GDD v3 — Ultimo, 16 anni
const ULTIMO_STATS: { key: string; label: string; value: number }[] = [
  { key: 'for', label: 'FOR', value: 9  },
  { key: 'des', label: 'DES', value: 12 },
  { key: 'cos', label: 'COS', value: 10 },
  { key: 'int', label: 'INT', value: 13 },
  { key: 'sag', label: 'SAG', value: 11 },
  { key: 'car', label: 'CAR', value: 11 },
];

// Moral compass questions per GDD v3
const QUESTIONS = [
  {
    text: 'Quando trovi qualcosa di valore, la tua prima reazione è…',
    options: [
      { label: 'tenerla per te',                   side: 'elian' as const },
      { label: 'pensare a chi potrebbe averne bisogno', side: 'lena' as const },
    ],
  },
  {
    text: 'Di fronte a qualcuno che chiede aiuto e non puoi permettertelo…',
    options: [
      { label: 'vai avanti',             side: 'elian' as const },
      { label: 'cerchi comunque un modo', side: 'lena'  as const },
    ],
  },
  {
    text: 'Nel dubbio, ti fidi…',
    options: [
      { label: 'raramente',          side: 'elian' as const },
      { label: 'forse troppo spesso', side: 'lena'  as const },
    ],
  },
];

function statMod(v: number): string {
  const m = Math.floor((v - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const CharacterCreationScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const setAttributes = useCharacterStore((state) => state.setAttributes);

  // answers[i] = 'lena' | 'elian' | null
  const [answers, setAnswers] = useState<Array<'lena' | 'elian' | null>>([null, null, null]);

  const allAnswered = answers.every((a) => a !== null);

  // Compass position: -30 (full Lena) to +30 (full Elian)
  const compassValue = answers.reduce((acc, a) => {
    if (a === 'lena')  return acc - 10;
    if (a === 'elian') return acc + 10;
    return acc;
  }, 0);
  // Normalize to 0-100% for the indicator (0 = full Lena, 100 = full Elian, 50 = center)
  const compassPct = 50 + (compassValue / 30) * 50;

  const handleAnswer = useCallback((qIndex: number, side: 'lena' | 'elian') => {
    setAnswers((prev) => {
      const next = [...prev] as Array<'lena' | 'elian' | null>;
      next[qIndex] = side;
      return next;
    });
  }, []);

  const handleStart = useCallback(() => {
    if (!allAnswered) return;
    // Fixed stats per GDD v3
    setAttributes({ for: 9, des: 12, cos: 10, int: 13, sag: 11, car: 11 });
    // Set alignment directly — bypasses threshold journal entries during init
    const lena  = answers.filter((a) => a === 'lena').length  * 10;
    const elian = answers.filter((a) => a === 'elian').length * 10;
    useCharacterStore.setState({ alignment: { lena, elian } });
    setGameState(GameState.IN_GAME);
  }, [allAnswered, answers, setAttributes, setGameState]);

  const handleBack = useCallback(() => setGameState(GameState.MAIN_MENU), [setGameState]);

  const keyMap = useMemo(() => ({
    Enter:  handleStart,
    Escape: handleBack,
  }), [handleStart, handleBack]);

  useKeyboardInput(keyMap);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0e1115', overflow: 'hidden' }}>
      {/* subtle ambient light */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(120,130,145,0.10), transparent 70%), linear-gradient(180deg, #181b21, #0e1115)',
      }}/>

      {/* Open book container */}
      <div style={{
        position: 'absolute', left: 24, right: 24, top: 24, bottom: 24,
        display: 'flex',
        background: 'var(--tsp-paper)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.4)',
      }}>
        {/* Center binding shadow */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 40,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse 100% 100% at center, rgba(20,24,30,0.35), transparent 70%)',
          pointerEvents: 'none', zIndex: 10,
        }}/>
        {/* Binding line */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
          background: 'rgba(20,24,30,0.55)', transform: 'translateX(-50%)', zIndex: 11,
        }}/>

        {/* ── LEFT PAGE — identità fissa ─────────────────────────── */}
        <div className="paper" style={{ flex: 1, padding: '32px 36px 32px 44px', position: 'relative', overflow: 'hidden' }}>
          {/* page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid var(--tsp-ink)', paddingBottom: 8, marginBottom: 18 }}>
            <div>
              <div className="t-label">SCHEDA SOPRAVVISSUTO</div>
              <div className="t-serif" style={{ fontSize: 28, lineHeight: 1, fontWeight: 500 }}>Chi sei.</div>
            </div>
            <Stamp rotate={-4} color="rust" style={{ fontSize: 10, padding: '3px 8px 2px', borderWidth: 2 }}>FISSO</Stamp>
          </div>

          {/* name */}
          <div style={{ marginBottom: 16 }}>
            <div className="t-label-sm" style={{ marginBottom: 4 }}>NOME</div>
            <div style={{ borderBottom: '1.5px solid var(--tsp-ink)', paddingBottom: 4 }}>
              <span className="t-serif" style={{ fontSize: 26, fontStyle: 'italic' }}>Ultimo</span>
            </div>
            <div className="t-hand" style={{ fontSize: 16, color: 'var(--tsp-slate)', marginTop: 4 }}>
              "non è davvero il mio nome, ma lo è diventato"
            </div>
          </div>

          {/* portrait + identity */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="tsp-photo" style={{ width: 110, aspectRatio: '4/5', border: '1.5px solid var(--tsp-ink)', flex: '0 0 auto', position: 'relative' }}>
              <svg viewBox="0 0 100 125" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <rect width="100" height="125" fill="#2a3340"/>
                <circle cx="50" cy="46" r="22" fill="#3a4654"/>
                <path d="M 16 125 Q 50 78 84 125 Z" fill="#3a4654"/>
                <path d="M 36 43 L 34 56 M 64 43 L 66 56" stroke="#1a1d22" strokeWidth="1.2" fill="none"/>
                <path d="M 42 67 Q 50 72 58 67" stroke="#1a1d22" strokeWidth="1" fill="none"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="t-label-sm" style={{ marginBottom: 4 }}>ASPETTO</div>
              <div className="t-hand" style={{ fontSize: 17, color: 'var(--tsp-ink)', lineHeight: 1.4 }}>
                giacca consumata,<br/>
                cicatrice sul mento,<br/>
                occhi attenti
              </div>
              <hr className="ink-rule-dashed" style={{ margin: '8px 0' }}/>
              <div className="t-label-sm" style={{ marginBottom: 2 }}>ETÀ</div>
              <div className="t-serif" style={{ fontSize: 18 }}>16 anni</div>
              <div className="t-hand" style={{ fontSize: 12, color: 'var(--tsp-slate)' }}>cinque dopo la fine</div>
            </div>
          </div>

          {/* stats grid */}
          <hr className="ink-rule-dashed" style={{ marginBottom: 12 }}/>
          <div className="t-label" style={{ marginBottom: 10 }}>ABILITÀ PRIMARIE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
            {ULTIMO_STATS.map(({ label, value }) => {
              const mod = statMod(value);
              const isPos = !mod.startsWith('-');
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px dotted rgba(20,24,30,0.3)', paddingBottom: 4 }}>
                  <span className="t-sans" style={{ fontSize: 12, letterSpacing: '0.2em', color: 'var(--tsp-slate)', minWidth: 32 }}>{label}</span>
                  <span className="t-serif" style={{ fontSize: 22, fontWeight: 500 }}>{value}</span>
                  <span className="t-sans" style={{ fontSize: 12, color: isPos ? 'var(--tsp-mint)' : 'var(--tsp-rust)' }}>{mod}</span>
                </div>
              );
            })}
          </div>

          {/* footnote */}
          <div style={{ position: 'absolute', bottom: 14, left: 44 }}>
            <span className="t-sans" style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--tsp-slate-light)' }}>— pag. 1 —</span>
          </div>
        </div>

        {/* ── RIGHT PAGE — bussola morale ────────────────────────── */}
        <div className="paper" style={{ flex: 1, padding: '32px 44px 80px 36px', position: 'relative', overflow: 'hidden' }}>
          {/* page header */}
          <div style={{ borderBottom: '1.5px solid var(--tsp-ink)', paddingBottom: 8, marginBottom: 20 }}>
            <div className="t-label">CHI SEI DENTRO</div>
            <div className="t-serif" style={{ fontSize: 28, lineHeight: 1, fontWeight: 500 }}>Come ti muovi nel mondo.</div>
          </div>

          {/* questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {QUESTIONS.map((q, qi) => (
              <div key={qi}>
                <div className="t-serif" style={{ fontSize: 18, lineHeight: 1.45, fontStyle: 'italic', marginBottom: 8, color: 'var(--tsp-ink)' }}>
                  {qi + 1}. {q.text}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {q.options.map((opt, oi) => {
                    const chosen = answers[qi] === opt.side;
                    return (
                      <div
                        key={oi}
                        onClick={() => handleAnswer(qi, opt.side)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px',
                          border: chosen ? '1.5px solid var(--tsp-rust)' : '1px solid rgba(20,24,30,0.25)',
                          background: chosen ? 'rgba(125,58,42,0.07)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, flex: '0 0 auto',
                          border: `1.5px solid ${chosen ? 'var(--tsp-rust)' : 'var(--tsp-ink-faded)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: chosen ? 'var(--tsp-rust)' : 'transparent',
                          fontSize: 11, color: 'var(--tsp-paper)',
                        }}>
                          {chosen ? '✓' : ''}
                        </div>
                        <span className="t-serif" style={{ fontSize: 16, color: chosen ? 'var(--tsp-ink)' : 'var(--tsp-ink-faded)' }}>
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* moral compass bar */}
          <div style={{ marginTop: 22 }}>
            <div className="t-label-sm" style={{ marginBottom: 8, textAlign: 'center' }}>BUSSOLA MORALE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="t-hand" style={{ fontSize: 14, color: 'var(--tsp-mint)', flex: '0 0 auto' }}>Lena</span>
              <div style={{ flex: 1, height: 6, background: 'rgba(20,24,30,0.12)', position: 'relative', borderRadius: 1 }}>
                {/* fill based on compass */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: compassValue < 0
                    ? `linear-gradient(to right, var(--tsp-mint) 0%, transparent ${compassPct}%)`
                    : compassValue > 0
                    ? `linear-gradient(to left, var(--tsp-rust) 0%, transparent ${100 - compassPct}%)`
                    : 'transparent',
                  transition: 'all 0.4s ease',
                }}/>
                {/* indicator needle */}
                <div style={{
                  position: 'absolute',
                  left: `${compassPct}%`,
                  top: -5, width: 2, height: 16,
                  background: 'var(--tsp-ink)',
                  transform: 'translateX(-50%)',
                  transition: 'left 0.4s ease',
                }}/>
              </div>
              <span className="t-hand" style={{ fontSize: 14, color: 'var(--tsp-rust)', flex: '0 0 auto' }}>Elian</span>
            </div>
            <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--tsp-slate-light)', marginTop: 6, textAlign: 'center' }}>
              {allAnswered ? 'le tue scelte hanno parlato' : 'le tue scelte lo decideranno'}
            </div>
          </div>

          {/* footnote */}
          <div style={{ position: 'absolute', bottom: 14, right: 44 }}>
            <span className="t-sans" style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--tsp-slate-light)' }}>— pag. 2 —</span>
          </div>

          {/* action buttons */}
          <div style={{
            position: 'absolute', bottom: 22, left: 36, right: 44,
            display: 'flex', gap: 10,
          }}>
            <button className="tsp-btn tsp-btn-ghost" onClick={handleBack} style={{ flex: 1, textAlign: 'center' }}>
              ← INDIETRO
            </button>
            <button
              className="tsp-btn tsp-btn-rust"
              onClick={handleStart}
              disabled={!allAnswered}
              style={{
                flex: 2, textAlign: 'center',
                opacity: allAnswered ? 1 : 0.35,
                cursor: allAnswered ? 'pointer' : 'default',
              }}
            >
              COMINCIA IL VIAGGIO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationScreen;
