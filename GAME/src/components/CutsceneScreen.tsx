import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { narrativeService } from '../services/NarrativeService';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { CutscenePage } from '../types';
import { audioManager } from '../utils/audio';

const PARAGRAPH_REVEAL_MS = 1000;

/**
 * Dual-mode cutscene player.
 *
 * - Ink mode (preferred): listens to NarrativeService via the narrativeStore. The story is
 *   driven by Inkjs; each "page" is the block of text accumulated between two sets of
 *   choices (or between a choice and the next END). Choices are picked with [1-9] like
 *   in dialogues. ESC is an emergency exit. Used today for the opening intro.
 *
 * - Legacy mode: keeps the original page-based player driven by `useGameStore.activeCutscene`
 *   and the JSON cutscenes database. Still in use for cutscenes that have not been rewritten
 *   in Ink (CS_ASH_LULLABY, CS_THE_BRINK, ...).
 *
 * Routing is decided in `gameStore.startCutscene`: if the legacy id maps to an Ink knot,
 * control is handed to NarrativeService and `isStoryActive` becomes true, so this component
 * renders the Ink branch. Otherwise the legacy branch runs as before.
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

    // Split the drained Ink block into paragraphs and reveal them one by one.
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
        // No choices means Ink can keep going — continue (which drains the next block).
        // If the story has actually ended, NarrativeService.continue() will auto-call endDialogue().
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
        <div className="absolute inset-0 bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-6xl h-full flex flex-col justify-between py-8">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div
                        className="border-y-4 border-double border-[var(--border-primary)] py-6 px-4 max-h-full overflow-y-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        <div className="text-3xl leading-snug text-center font-mono max-w-5xl mx-auto space-y-6">
                            {paragraphs.slice(0, visibleParagraphs).map((paragraph, index) => (
                                <p key={index} className="whitespace-pre-wrap">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {allParagraphsVisible && currentChoices.length > 0 && (
                    <div className="mt-6 text-center text-2xl space-y-3 flex-shrink-0">
                        {currentChoices.map((choice, index) => (
                            <p key={index} className="text-amber-400">
                                <span className="font-bold">[{index + 1}]</span> {choice.text}
                            </p>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-center text-2xl animate-pulse flex-shrink-0">
                    {!allParagraphsVisible && (
                        <span className="text-[var(--text-accent)]">[INVIO per mostrare tutto]</span>
                    )}
                    {allParagraphsVisible && currentChoices.length === 0 && (
                        <span className="text-[var(--text-accent)]">[INVIO per continuare]</span>
                    )}
                </div>
            </div>
        </div>
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
        <div className="absolute inset-0 bg-black flex items-center justify-center p-4">
            <div key={pageIndex} className="w-full max-w-6xl h-full flex flex-col justify-between py-8">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div
                        className="border-y-4 border-double border-[var(--border-primary)] py-6 px-4 max-h-full overflow-y-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        <div className="text-3xl leading-snug text-center font-mono max-w-5xl mx-auto space-y-6">
                            {paragraphs.slice(0, visibleParagraphs).map((paragraph, index) => (
                                <p key={index} className="whitespace-pre-wrap">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {allParagraphsVisible && currentPage.choices && (
                    <div className="mt-6 text-center text-2xl space-y-3 flex-shrink-0">
                        {currentPage.choices.map((choice, index) => (
                            <p key={index} className="text-amber-400">{choice.text}</p>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-center text-2xl animate-pulse flex-shrink-0">
                    {!allParagraphsVisible && (
                        <span className="text-[var(--text-accent)]">[INVIO per mostrare tutto]</span>
                    )}
                    {allParagraphsVisible && !currentPage.choices && (
                        <span className="text-[var(--text-accent)]">[INVIO per continuare]</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CutsceneScreen;
