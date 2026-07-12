import React, { useState, useEffect, useCallback } from 'react';

/**
 * IntroAnimation — sequenza di boot CRT cinematica, allineata al menu
 * principale del gioco (tema fosfori verdi P3, font VT323).
 *
 * Fasi: 'power' (accensione CRT) → 'boot' (log di sistema) →
 *       'title' (rivelazione titolo) → 'ready' (prompt) → 'exit' (spegnimento).
 *
 * Ispirata ai principi di animazione di Remotion: timeline deterministica,
 * easing "a molla" e messa a fuoco (blur→nitido) per ogni elemento.
 */

type Phase = 'power' | 'boot' | 'title' | 'ready';

const BOOT_MESSAGES_POOL = [
  'Initializing memory core...',
  'Calibrating phosphor emitters...',
  'Verifying BIOS checksum...',
  'Decompressing kernel image...',
  'Loading audio drivers [AUI_83]...',
  'Mounting root filesystem...',
  'Restoring narrative index...',
  'WARN::Neural interface link unstable...',
  'WARN::Sub-optimal power readings detected...',
  'FAIL::Memory allocation error at 0xDEADBEEF...',
  'FAIL::Corruption detected in SYS_CONFIG...',
  'CORR::Rerouting power flow...',
  'CORR::Bypassing memory integrity check...',
  'CORR::Loading backup from last known stable state...',
];

interface IntroAnimationProps {
  onFinished: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onFinished }) => {
  const [phase, setPhase] = useState<Phase>('power');
  const [exiting, setExiting] = useState(false);
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  // Genera la sequenza di boot (con eventuale glitch FAIL→CORR)
  useEffect(() => {
    const regularPool = BOOT_MESSAGES_POOL.filter((l) => !l.startsWith('FAIL::') && !l.startsWith('CORR::'));
    const failPool = BOOT_MESSAGES_POOL.filter((l) => l.startsWith('FAIL::'));
    const corrPool = BOOT_MESSAGES_POOL.filter((l) => l.startsWith('CORR::'));

    const seq: string[] = [];
    const length = 5 + Math.floor(Math.random() * 2); // 5 o 6
    let failed = false;

    for (let i = 0; i < length; i++) {
      const shouldFail = Math.random() < 0.28 && !failed && failPool.length > 0 && corrPool.length > 0;
      if (shouldFail) {
        failed = true;
        seq.push(failPool.splice(Math.floor(Math.random() * failPool.length), 1)[0]);
        seq.push(corrPool.splice(Math.floor(Math.random() * corrPool.length), 1)[0]);
        i++;
      } else if (regularPool.length > 0) {
        seq.push(regularPool.splice(Math.floor(Math.random() * regularPool.length), 1)[0]);
      }
    }
    seq.push('Establishing connection...');
    seq.push('Booting TSPC-OS v2.0.16...');
    setBootSequence(seq);
  }, []);

  // Fase 'power' → 'boot' dopo l'accensione del CRT
  useEffect(() => {
    const t = window.setTimeout(() => setPhase('boot'), 680);
    return () => clearTimeout(t);
  }, []);

  // Fase 'boot': rivelazione riga per riga, poi passaggio al titolo
  useEffect(() => {
    if (phase !== 'boot' || bootSequence.length === 0) return;
    let idx = 0;
    let timeoutId: number;

    const showNext = () => {
      if (idx < bootSequence.length) {
        const line = bootSequence[idx];
        setVisibleLines((prev) => [...prev, line]);
        const isFail = line.startsWith('FAIL::');
        const delay = isFail ? 1000 : 260 + Math.random() * 220;
        idx++;
        timeoutId = window.setTimeout(showNext, delay);
      } else {
        timeoutId = window.setTimeout(() => setPhase('title'), 650);
      }
    };
    timeoutId = window.setTimeout(showNext, 350);
    return () => clearTimeout(timeoutId);
  }, [phase, bootSequence]);

  // Fase 'title' → 'ready' (abilita lo skip) dopo la rivelazione
  useEffect(() => {
    if (phase !== 'title') return;
    const t = window.setTimeout(() => setPhase('ready'), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  // Skip: disponibile una volta partito il boot (l'accensione CRT resta intatta).
  // Mantiene a video il contenuto corrente mentre il CRT si "spegne".
  const handleSkip = useCallback(() => {
    if (phase === 'power' || exiting) return;
    setExiting(true);
    window.setTimeout(onFinished, 520);
  }, [phase, exiting, onFinished]);

  useEffect(() => {
    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);
    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [handleSkip]);

  const renderBootLine = (line: string, index: number) => {
    let text = line;
    let status: React.ReactNode = null;

    if (line.startsWith('WARN::')) {
      text = line.replace('WARN::', '');
      status = <span className="text-[#facc15]"> [WARNING]</span>;
    } else if (line.startsWith('FAIL::')) {
      text = line.replace('FAIL::', '');
      status = <span className="text-[#ff3333]"> [FAILED]</span>;
    } else if (line.startsWith('CORR::')) {
      text = line.replace('CORR::', '');
      status = <span className="text-[#ccffcc]"> [RECOVERED]</span>;
    } else if (line.endsWith('...')) {
      status = <span className="text-[#ccffcc]"> [OK]</span>;
    }

    return (
      <p key={index} className="boot-line-in text-glow whitespace-pre-wrap">
        <span className="text-[#28cc28]">&gt;</span> {text}{status}
      </p>
    );
  };

  const showTitle = phase === 'title' || phase === 'ready';

  return (
    <div className="fixed inset-0 z-[100] bg-[#050a05] overflow-hidden">
      {/* Overlay CRT: scanline + vignetta */}
      <div className="scanline fixed inset-0 z-[120] pointer-events-none opacity-70"></div>
      <div className="vignette fixed inset-0 z-[121] pointer-events-none"></div>

      {/* Contenuto dentro il "tubo" CRT */}
      <div className={`w-full h-full ${exiting ? 'animate-crt-off' : 'animate-crt-on'}`}>
        <div className="w-full h-full flex flex-col justify-center items-center px-5 text-[#33ff33]">

          {/* BOOT LOG */}
          {phase === 'boot' && (
            <div className="w-full max-w-4xl text-left text-lg md:text-xl leading-relaxed">
              {visibleLines.map((line, i) => renderBootLine(line, i))}
              <span className="text-glow caret-blink">&#9608;</span>
            </div>
          )}

          {/* TITOLO — layout identico al menu principale del gioco */}
          {showTitle && (
            <div className="text-center text-glow phosphor-pulse">
              <h2 className="title-reveal text-2xl sm:text-3xl md:text-5xl tracking-[0.2em]" style={{ animationDelay: '0ms' }}>
                THE SAFE PLACE CHRONICLES
              </h2>
              <h1 className="title-reveal text-6xl sm:text-7xl md:text-9xl leading-none mt-2" style={{ animationDelay: '160ms' }}>
                THE ECHO
              </h1>
              <p className="title-reveal text-xl sm:text-2xl leading-none mt-1" style={{ animationDelay: '340ms' }}>
                OF THE
              </p>
              <h1 className="title-reveal text-6xl sm:text-7xl md:text-9xl leading-none mt-1" style={{ animationDelay: '440ms' }}>
                JOURNEY
              </h1>
              <p className="title-reveal text-2xl md:text-4xl text-[#ccffcc] mt-8" style={{ animationDelay: '720ms' }}>
                Un GDR di Simone Pizzi
              </p>
            </div>
          )}

          {/* PROMPT */}
          {phase === 'ready' && (
            <div className="absolute bottom-12 text-center text-glow">
              <p className="text-xl md:text-2xl tracking-widest">
                PREMI UN TASTO PER CONTINUARE<span className="caret-blink">_</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
