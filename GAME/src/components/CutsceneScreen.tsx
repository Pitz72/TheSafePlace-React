import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { narrativeService } from '../services/NarrativeService';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { Cutscene, CutscenePage } from '../types';
import { audioManager } from '../utils/audio';
import KeyArt from './art/KeyArt';
import ChoiceList from './ui/ChoiceList';
import KeyHints, { KeyHint } from './ui/KeyHints';

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

/** Short lines in quotes are spoken: set apart in italics. */
const isSpoken = (paragraph: string) => /^["“'«]/.test(paragraph);

/** Pages with this many paragraphs (or characters) use a tighter layout so they fit. */
const DENSE_PARAGRAPHS = 8;
const DENSE_CHARACTERS = 1100;

const CutsceneFrame: React.FC<{
    paragraphs: string[];
    visible: number;
    choices: string[];
    selected: number;
    hints: KeyHint[];
    page: unknown;
}> = ({ paragraphs, visible, choices, selected, hints, page }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const shownBefore = useRef(0);
    const [overflows, setOverflows] = useState(false);
    const dense = paragraphs.length > DENSE_PARAGRAPHS || paragraphs.join('').length > DENSE_CHARACTERS;

    // While paragraphs appear one by one, follow the newest; when the whole page
    // is shown at once, start from the top so nothing is skipped.
    useEffect(() => {
        const box = scrollRef.current;
        if (!box) return;
        if (visible - shownBefore.current === 1) {
            box.lastElementChild?.lastElementChild?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
        } else {
            box.scrollTo({ top: 0 });
        }
        shownBefore.current = visible;
        setOverflows(box.scrollHeight > box.clientHeight + 2);
    }, [visible, page, choices.length]);

    const scrollBy = useCallback((delta: number) => scrollRef.current?.scrollBy({ top: delta, behavior: 'smooth' }), []);
    const scrollKeys = useMemo(() => ({ PageUp: () => scrollBy(-300), PageDown: () => scrollBy(300) }), [scrollBy]);
    useKeyboardInput(scrollKeys);

    return (
        <div className="absolute inset-0 overflow-hidden bg-bg0">
            <KeyArt variant="night" shade="none" className="opacity-40" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 45%, rgb(var(--c-bg0) / 0.72), rgb(var(--c-bg0) / 0.96))' }} />
            {/* Letterbox. */}
            <div className="absolute inset-x-0 top-0 h-[72px] bg-black/80" />
            <div className="absolute inset-x-0 bottom-0 h-[72px] bg-black/80" />

            <div className="relative flex h-full flex-col items-center px-24 py-[110px]">
                <div ref={scrollRef} className="scroll-y fade-edges flex w-full max-w-[1080px] flex-1 flex-col">
                    <div key={String(page)} className={`my-auto flex flex-col ${dense ? 'gap-5 py-6' : 'gap-7 py-10'}`}>
                        {paragraphs.slice(0, visible).map((paragraph, index) => (
                            <p
                                key={index}
                                className={`prose-story whitespace-pre-wrap text-center anim-fade-up ${isSpoken(paragraph) ? `${dense ? 'text-[27px]' : 'text-[31px]'} italic text-ember2` : `${dense ? 'text-[26px] !leading-[1.5]' : 'text-[30px]'} text-ink`}`}
                                style={{ animationDuration: '900ms' }}
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
                {choices.length > 0 && (
                    <div className="mt-6 w-full max-w-[900px] flex-shrink-0 anim-fade-up">
                        <ChoiceList items={choices.map((text, index) => ({ id: `${index}-${text}`, label: text }))} selected={selected} numbered size="md" />
                    </div>
                )}
                <div className="mt-6 flex-shrink-0">
                    <KeyHints hints={overflows ? [{ keys: ['PAG SU', 'PAG GIÙ'], label: 'Scorri' }, ...hints] : hints} />
                </div>
            </div>
        </div>
    );
};

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

const hintsFor = (allVisible: boolean, choices: number): KeyHint[] => {
    if (!allVisible) return [{ keys: ['INVIO'], label: 'Mostra tutto' }, { keys: ['ESC'], label: 'Salta' }];
    if (choices > 1) return [{ keys: ['1-9'], label: 'Scegli' }, { keys: ['↑↓', 'INVIO'], label: 'Conferma' }, { keys: ['ESC'], label: 'Salta' }];
    if (choices === 1) return [{ keys: ['INVIO'], label: 'Conferma', active: true }, { keys: ['ESC'], label: 'Salta' }];
    return [{ keys: ['INVIO'], label: 'Continua', active: true }, { keys: ['ESC'], label: 'Salta' }];
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
            hints={hintsFor(allVisible, currentChoices.length)}
            page={revision}
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
            hints={hintsFor(allVisible, choices.length > 0 ? Math.max(2, choices.length) : 0)}
            page={pageIndex}
        />
    );
};

export default CutsceneScreen;
