import React, { useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import Modal from './ui/Modal';

/** Concentric echoes behind the memory: the emblem's motif, large and faint. */
const Echoes: React.FC = () => (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
            <radialGradient id="echo-core">
                <stop offset="0" stopColor="rgb(var(--c-violet))" stopOpacity="0.28" />
                <stop offset="1" stopColor="rgb(var(--c-violet))" stopOpacity="0" />
            </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#echo-core)" />
        {[180, 300, 440, 600, 780, 980].map((r, i) => (
            <circle key={r} cx="960" cy="540" r={r} fill="none" stroke="rgb(var(--c-violet))" strokeWidth={1.4} opacity={0.22 - i * 0.03} />
        ))}
    </svg>
);

/** A chapter of the main story ("Eco della Memoria"). */
const MainStoryScreen: React.FC = () => {
    const { activeMainStoryEvent, resolveMainStory } = useGameStore();

    const textRef = useRef<HTMLDivElement>(null);
    const scroll = useCallback((delta: number) => textRef.current?.scrollBy({ top: delta, behavior: 'smooth' }), []);

    const handlerMap = useMemo(() => ({
        Enter: resolveMainStory,
        w: () => scroll(-120), ArrowUp: () => scroll(-120),
        s: () => scroll(120), ArrowDown: () => scroll(120),
    }), [resolveMainStory, scroll]);

    useKeyboardInput(handlerMap);

    if (!activeMainStoryEvent) {
        return null;
    }

    const title = activeMainStoryEvent.title.replace('Ricordo: ', '').replace('Frammento: ', '').replace('Eco ', '');
    const paragraphs = activeMainStoryEvent.text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    return (
        <div className="absolute inset-0 z-20">
            <div className="absolute inset-0 bg-bg0/90" />
            <Echoes />
            <Modal
                backdrop="soft"
                accent="violet"
                icon="echo"
                eyebrow={`Eco della memoria · ${activeMainStoryEvent.stage}`}
                title={title}
                size="lg"
                hints={[{ keys: ['↑↓'], label: 'Scorri' }, { keys: ['INVIO'], label: 'Continua', active: true }]}
            >
                <div ref={textRef} className="scroll-y fade-edges max-h-[600px] px-16 pb-10">
                    <div className="hairline mb-8" />
                    {paragraphs.map((paragraph, index) => (
                        <p
                            key={index}
                            className={`prose-story mb-6 whitespace-pre-wrap text-[27px] anim-fade-up ${/^["“'«]/.test(paragraph) ? 'italic text-violet' : ''}`}
                            style={{ animationDelay: `${Math.min(index, 8) * 160}ms` }}
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default MainStoryScreen;
