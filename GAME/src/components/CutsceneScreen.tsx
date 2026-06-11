/**
 * CutsceneScreen — dual-mode cutscene player, v3 "Diario del Sopravvissuto".
 *
 * Resa visiva: variante B del design handoff — solo lettera di carta
 * centrata su fondo scuro con polvere, pieno focus sul testo. Stessa
 * lettera per entrambe le modalità.
 *
 * - Ink mode (preferita): NarrativeService via narrativeStore; ogni
 *   "pagina" è il blocco di testo tra due set di scelte. 1–9 sceglie,
 *   ESC è uscita di emergenza. Usata oggi per l'intro.
 * - Legacy mode: player a pagine da `useGameStore.activeCutscene` per
 *   le cutscene non ancora riscritte in Ink.
 *
 * Il routing è deciso in `gameStore.startCutscene` (mappa
 * LEGACY_CUTSCENE_TO_INK_KNOT). Input misto: click sulla lettera
 * avanza, click sulle scelte sceglie, Invio/1–9 come prima.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { narrativeService } from '../services/NarrativeService';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { CutscenePage } from '../types';
import { audioManager } from '../utils/audio';
import { Pin } from './ui';

const PARAGRAPH_REVEAL_MS = 1000;

const CHOICE_TINTS = ['var(--tsp-rust)', 'var(--tsp-mint)', 'var(--tsp-slate)'];

interface LetterChoice {
  text: string;
}

interface CutsceneLetterProps {
  paragraphs: string[];
  visibleCount: number;
  allVisible: boolean;
  choices: LetterChoice[];
  onAdvance: () => void;
  onChoice: (index: number) => void;
}

/** Shared paper-letter rendering for both cutscene modes. */
const CutsceneLetter: React.FC<CutsceneLetterProps> = ({
  paragraphs, visibleCount, allVisible, choices, onAdvance, onChoice,
}) => (
  <div
    onClick={() => { if (!allVisible || choices.length === 0) onAdvance(); }}
    style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'radial-gradient(ellipse 60% 50% at 50% 50%, #1a1d22, #0a0d12 100%)',
      cursor: allVisible && choices.length > 0 ? 'default' : 'pointer',
      zIndex: 25,
    }}
  >
    {/* dust particles */}
    {Array.from({ length: 22 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: 1 + (i % 2), height: 1 + (i % 2),
        left: `${(i * 41) % 100}%`, top: `${(i * 29) % 100}%`,
        background: 'rgba(220,228,235,0.3)', borderRadius: '50%',
      }} />
    ))}

    {/* the letter */}
    <div className="paper" style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transform: 'translate(-50%, -50%) rotate(-1deg)',
      width: 'min(680px, calc(100% - 64px))',
      maxHeight: 'calc(100% - 96px)',
      overflowY: 'auto', scrollbarWidth: 'none',
      padding: '44px 52px',
      boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.4)',
    }}>
      {/* burn mark */}
      <div style={{
        position: 'absolute', top: -8, right: 60,
        width: 80, height: 24,
        background: 'radial-gradient(ellipse, rgba(74,52,32,0.35), transparent 70%)',
        filter: 'blur(3px)', pointerEvents: 'none',
      }} />

      <div className="t-label" style={{ fontSize: 13, marginBottom: 16 }}>DAL DIARIO DI ULTIMO</div>
      <hr className="ink-rule" style={{ marginBottom: 24 }} />

      {paragraphs.slice(0, visibleCount).map((paragraph, index) => (
        <p key={index} className="t-serif" style={{
          fontSize: 20, lineHeight: 1.65, textWrap: 'pretty',
          color: index % 2 === 0 ? 'var(--tsp-ink)' : 'var(--tsp-ink-faded)',
          fontStyle: index % 2 === 0 ? 'normal' : 'italic',
          marginBottom: 14,
          whiteSpace: 'pre-wrap',
          animation: 'tspFadeIn 0.8s ease both',
        }}>
          {paragraph}
        </p>
      ))}

      {allVisible && choices.length > 0 && (
        <>
          <hr className="ink-rule-dashed" style={{ margin: '20px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {choices.map((choice, index) => (
              <div
                key={index}
                onClick={(e) => { e.stopPropagation(); onChoice(index); }}
                style={{
                  padding: '12px 16px 10px',
                  borderLeft: `2px solid ${CHOICE_TINTS[index % CHOICE_TINTS.length]}`,
                  cursor: 'pointer',
                }}
              >
                <div className="t-serif" style={{ fontSize: 18, lineHeight: 1.4, fontStyle: 'italic' }}>
                  "{choice.text}"
                </div>
                <div className="t-sans" style={{ fontSize: 11, letterSpacing: '0.32em', color: 'var(--tsp-slate)', marginTop: 6 }}>
                  {index + 1} · SCEGLI
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="t-hand" style={{ fontSize: 17, color: 'var(--tsp-slate)' }}>
          — la pagina gira da sola —
        </span>
        <span className="t-sans" style={{ fontSize: 12, letterSpacing: '0.3em', color: 'var(--tsp-slate)' }}>
          {!allVisible ? 'INVIO MOSTRA TUTTO'
            : choices.length > 0 ? '1–9 SCEGLI'
            : 'INVIO CONTINUA'}
        </span>
      </div>

      <Pin top={-8} left={50} variant="rust" />
      <Pin bottom={-8} right={50} variant="bone" />
    </div>
  </div>
);

/**
 * Dual-mode router: Ink branch when isStoryActive, legacy otherwise.
 */
const CutsceneScreen: React.FC = () => {
  const isStoryActive = useNarrativeStore(s => s.isStoryActive);

  if (isStoryActive) {
    return <InkCutscene />;
  }
  return <LegacyCutscene />;
};

// ───────────────────────────────────────────────────────────────────────────
// Ink-driven cutscene
// ───────────────────────────────────────────────────────────────────────────

const InkCutscene: React.FC = () => {
  const { currentText, currentChoices } = useNarrativeStore();

  const paragraphs = useMemo(
    () => currentText.split('\n\n').map(p => p.trim()).filter(p => p.length > 0),
    [currentText]
  );

  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const [allParagraphsVisible, setAllParagraphsVisible] = useState(false);

  useEffect(() => {
    setVisibleParagraphs(0);
    setAllParagraphsVisible(false);
    if (paragraphs.length === 0) {
      setAllParagraphsVisible(true);
      return;
    }
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleParagraphs(count);
      if (count >= paragraphs.length) {
        clearInterval(interval);
        setAllParagraphsVisible(true);
      }
    }, PARAGRAPH_REVEAL_MS);
    return () => clearInterval(interval);
  }, [paragraphs]);

  const showAll = useCallback(() => {
    setVisibleParagraphs(paragraphs.length);
    setAllParagraphsVisible(true);
  }, [paragraphs.length]);

  const handleAdvance = useCallback(() => {
    if (!allParagraphsVisible) {
      showAll();
      return;
    }
    // No choices means Ink can keep going — continue (drains the next block).
    // If the story has ended, NarrativeService.continue() auto-calls endDialogue().
    if (currentChoices.length === 0) {
      audioManager.playSound('confirm');
      narrativeService.continue();
    }
  }, [allParagraphsVisible, showAll, currentChoices.length]);

  const handleChoice = useCallback((zeroBasedIndex: number) => {
    if (!allParagraphsVisible) return;
    const choice = currentChoices[zeroBasedIndex];
    if (!choice) return;
    audioManager.playSound('confirm');
    narrativeService.chooseChoiceIndex(choice.index);
  }, [allParagraphsVisible, currentChoices]);

  const handlerMap = useMemo(() => {
    const map: Record<string, () => void> = {
      Enter: handleAdvance,
      Escape: () => narrativeService.endDialogue(),
    };
    for (let i = 0; i < currentChoices.length && i < 9; i++) {
      map[`${i + 1}`] = () => handleChoice(i);
    }
    return map;
  }, [handleAdvance, handleChoice, currentChoices.length]);

  useKeyboardInput(handlerMap);

  return (
    <CutsceneLetter
      paragraphs={paragraphs}
      visibleCount={visibleParagraphs}
      allVisible={allParagraphsVisible}
      choices={allParagraphsVisible ? currentChoices : []}
      onAdvance={handleAdvance}
      onChoice={handleChoice}
    />
  );
};

// ───────────────────────────────────────────────────────────────────────────
// Legacy page-based cutscene (unchanged behaviour, kept for non-Ink cutscenes)
// ───────────────────────────────────────────────────────────────────────────

const LegacyCutscene: React.FC = () => {
  const { activeCutscene, processCutsceneConsequences, endCutscene } = useGameStore();
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const [allParagraphsVisible, setAllParagraphsVisible] = useState(false);

  const currentPage: CutscenePage | null = activeCutscene ? activeCutscene.pages[pageIndex] : null;

  const paragraphs = useMemo(() => {
    if (!currentPage) return [];
    return currentPage.text.split('\n\n').filter(p => p.trim().length > 0);
  }, [currentPage]);

  useEffect(() => {
    if (!currentPage) return;

    if (currentPage.consequences) {
      processCutsceneConsequences(currentPage.consequences);
    }

    setVisibleParagraphs(0);
    setAllParagraphsVisible(false);

    let currentParagraph = 0;
    const interval = setInterval(() => {
      currentParagraph++;
      setVisibleParagraphs(currentParagraph);
      if (currentParagraph >= paragraphs.length) {
        clearInterval(interval);
        setAllParagraphsVisible(true);
      }
    }, PARAGRAPH_REVEAL_MS);

    return () => clearInterval(interval);
  }, [currentPage, processCutsceneConsequences, paragraphs.length]);

  const showAllParagraphs = useCallback(() => {
    setVisibleParagraphs(paragraphs.length);
    setAllParagraphsVisible(true);
  }, [paragraphs.length]);

  const handleAdvance = useCallback(() => {
    if (!allParagraphsVisible) {
      showAllParagraphs();
      return;
    }
    if (currentPage && !currentPage.choices) {
      if (currentPage.nextPage !== null && currentPage.nextPage !== undefined) {
        audioManager.playSound('navigate');
        setPageIndex(currentPage.nextPage);
      } else {
        audioManager.playSound('confirm');
        endCutscene();
      }
    }
  }, [allParagraphsVisible, showAllParagraphs, currentPage, endCutscene]);

  const handleChoice = useCallback((choiceIndex: number) => {
    if (!allParagraphsVisible || !currentPage?.choices) return;
    const choice = currentPage.choices[choiceIndex];
    if (choice) {
      audioManager.playSound('confirm');
      setPageIndex(choice.targetPage);
    }
  }, [allParagraphsVisible, currentPage]);

  const handlerMap = useMemo(() => {
    const map: Record<string, () => void> = { Enter: handleAdvance };
    if (currentPage?.choices) {
      currentPage.choices.forEach((_, index) => {
        map[`${index + 1}`] = () => handleChoice(index);
      });
    }
    return map;
  }, [handleAdvance, handleChoice, currentPage]);

  useKeyboardInput(handlerMap);

  if (!activeCutscene || !currentPage) return null;

  return (
    <CutsceneLetter
      key={pageIndex}
      paragraphs={paragraphs}
      visibleCount={visibleParagraphs}
      allVisible={allParagraphsVisible}
      choices={allParagraphsVisible && currentPage.choices ? currentPage.choices : []}
      onAdvance={handleAdvance}
      onChoice={handleChoice}
    />
  );
};

export default CutsceneScreen;
