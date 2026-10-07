import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { narrativeService } from '../services/NarrativeService';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { Cutscene, CutscenePage } from '../types';
import { audioManager } from '../utils/audio';

const PARAGRAPH_REVEAL_MS = 1000;

/** Reveals paragraphs one by one; `key` restarts the reveal. */
function useParagraphReveal(paragraphs: string[], key: unknown) {
    const [visible, setVisible] = useState(0);
    useEffect(() => {
        setVisible(0);
        if (paragraphs.length === 0) return;
        let count = 0;
        const interval = setInterval(() => {
            count++;
            setVisible(count);
            if (count >= paragraphs.length) clearInterval(interval);
        }, PARAGRAPH_REVEAL_MS);
        return () => clearInterval(interval);
    }, [paragraphs, key]);
    return { visible, allVisible: visible >= paragraphs.length, showAll: () => setVisible(paragraphs.length) };
}

const splitParagraphs = (text: string) => text.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);

const CutsceneFrame: React.FC<{
    paragraphs: string[];
    visible: number;
    choices: string[];
    selected: number;
    footer: string;
}> = ({ paragraphs, visible, choices, selected, footer }) => (
    <div className="absolute inset-0 bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-6xl h-full flex flex-col justify-between py-8">
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="border-y-4 border-double border-[var(--border-primary)] py-6 px-4 max-h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    <div className="text-3xl leading-snug text-center font-mono max-w-5xl mx-auto space-y-6">
                        {paragraphs.slice(0, visible).map((paragraph, index) => (
                            <p key={index} className="whitespace-pre-wrap">{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>
            {choices.length > 0 && (
                <div className="mt-6 text-center text-2xl space-y-3 flex-shrink-0">
                    {choices.map((choice, index) => (
                        <p key={index} className={index === selected ? 'text-black bg-amber-400 inline-block px-3' : 'text-amber-400'}>
                            <span className="font-bold">[{index + 1}]</span> {choice}
                        </p>
                    ))}
                </div>
            )}
            <div className="mt-6 text-center text-2xl animate-pulse flex-shrink-0 text-[var(--text-accent)]">{footer}</div>
        </div>
    </div>
);

/**
 * Cutscene player. Ink cutscenes (the opening) run through NarrativeService;
 * the others are page-based JSON cutscenes (gameStore.activeCutscene).
 */
const CutsceneScreen: React.FC = () => {
    const isStoryActive = useNarrativeStore(s => s.isStoryActive);
    const activeCutscene = useGameStore(s => s.activeCutscene);
    if (isStoryActive) return <InkCutscene />;
    // A new cutscene always starts from its first page.
    return activeCutscene ? <LegacyCutscene key={activeCutscene.id} cutscene={activeCutscene} /> : null;
};

const InkCutscene: React.FC = () => {
    const { currentText, currentChoices, revision } = useNarrativeStore();
    const paragraphs = useMemo(() => splitParagraphs(currentText), [currentText]);
    const { visible, allVisible, showAll } = useParagraphReveal(paragraphs, revision);
    const [selected, setSelected] = useState(0);
    useEffect(() => setSelected(0), [revision]);

    const choose = useCallback((index: number) => {
        const choice = currentChoices[index];
        if (!allVisible || !choice) return;
        audioManager.playSound('confirm');
        narrativeService.chooseChoiceIndex(choice.index);
    }, [allVisible, currentChoices]);

    const handlerMap = useMemo((): KeyHandlerMap => {
        const map: KeyHandlerMap = {
            Enter: () => {
                if (!allVisible) showAll();
                else if (currentChoices.length === 0) { audioManager.playSound('confirm'); narrativeService.continue(); }
                else choose(selected);
            },
            // Skipping still applies every item and flag along the way.
            Escape: () => narrativeService.skipCutscene(),
            w: () => setSelected(s => Math.max(0, s - 1)), ArrowUp: () => setSelected(s => Math.max(0, s - 1)),
            s: () => setSelected(s => Math.min(currentChoices.length - 1, s + 1)), ArrowDown: () => setSelected(s => Math.min(currentChoices.length - 1, s + 1)),
        };
        for (let i = 0; i < currentChoices.length && i < 9; i++) map[String(i + 1)] = () => choose(i);
        return map;
    }, [allVisible, showAll, currentChoices.length, choose, selected]);
    useKeyboardInput(handlerMap);

    return (
        <CutsceneFrame
            paragraphs={paragraphs}
            visible={visible}
            choices={allVisible ? currentChoices.map(c => c.text) : []}
            selected={selected}
            footer={!allVisible ? '[INVIO] Mostra tutto | [ESC] Salta' : currentChoices.length > 1 ? '[1-9] oppure [↑↓] + [INVIO] Scegli | [ESC] Salta' : '[INVIO] Continua | [ESC] Salta'}
        />
    );
};

const LegacyCutscene: React.FC<{ cutscene: Cutscene }> = ({ cutscene }) => {
    const processCutsceneConsequences = useGameStore(s => s.processCutsceneConsequences);
    const endCutscene = useGameStore(s => s.endCutscene);
    const [pageIndex, setPageIndex] = useState(0);
    const [selected, setSelected] = useState(0);
    // Consequences apply once per page, even if React re-runs effects.
    const processedPages = useRef(new Set<number>());

    const page: CutscenePage | undefined = cutscene.pages[pageIndex];
    const paragraphs = useMemo(() => (page ? splitParagraphs(page.text) : []), [page]);
    const { visible, allVisible, showAll } = useParagraphReveal(paragraphs, pageIndex);

    const applyPage = useCallback((index: number) => {
        const target = cutscene.pages[index];
        if (!target || processedPages.current.has(index)) return;
        processedPages.current.add(index);
        if (target.consequences) processCutsceneConsequences(target.consequences);
    }, [cutscene, processCutsceneConsequences]);

    useEffect(() => {
        applyPage(pageIndex);
        setSelected(0);
    }, [pageIndex, applyPage]);

    const goTo = useCallback((next: number | null | undefined) => {
        if (next === null || next === undefined || !cutscene.pages[next]) {
            audioManager.playSound('confirm');
            endCutscene();
            return;
        }
        audioManager.playSound('navigate');
        setPageIndex(next);
    }, [cutscene, endCutscene]);

    /** Fast-forward along the first choice, applying every page's consequences. */
    const skip = useCallback(() => {
        let index: number | null | undefined = pageIndex;
        for (let guard = 0; index !== null && index !== undefined && cutscene.pages[index] && guard < 50; guard++) {
            applyPage(index);
            const current: CutscenePage = cutscene.pages[index];
            index = current.choices?.length ? current.choices[0].targetPage : current.nextPage;
        }
        endCutscene();
    }, [pageIndex, cutscene, applyPage, endCutscene]);

    const choices = useMemo(() => page?.choices ?? [], [page]);
    const handlerMap = useMemo((): KeyHandlerMap => {
        const map: KeyHandlerMap = {
            Enter: () => {
                if (!allVisible) showAll();
                else if (choices.length > 0) goTo(choices[selected]?.targetPage);
                else goTo(page?.nextPage);
            },
            Escape: skip,
            w: () => setSelected(s => Math.max(0, s - 1)), ArrowUp: () => setSelected(s => Math.max(0, s - 1)),
            s: () => setSelected(s => Math.min(choices.length - 1, s + 1)), ArrowDown: () => setSelected(s => Math.min(choices.length - 1, s + 1)),
        };
        choices.forEach((choice, index) => { if (index < 9) map[String(index + 1)] = () => { if (allVisible) goTo(choice.targetPage); }; });
        return map;
    }, [allVisible, showAll, choices, selected, goTo, page, skip]);
    useKeyboardInput(handlerMap);

    if (!page) return null;
    return (
        <CutsceneFrame
            paragraphs={paragraphs}
            visible={visible}
            choices={allVisible ? choices.map(c => c.text) : []}
            selected={selected}
            footer={!allVisible ? '[INVIO] Mostra tutto | [ESC] Salta' : choices.length > 0 ? '[1-9] oppure [↑↓] + [INVIO] Scegli | [ESC] Salta' : '[INVIO] Continua | [ESC] Salta'}
        />
    );
};

export default CutsceneScreen;
