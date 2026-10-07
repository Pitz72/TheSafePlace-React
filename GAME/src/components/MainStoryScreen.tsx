import React, { useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

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
    
    const formattedTitle = `Echo della Memoria #${activeMainStoryEvent.stage}: ${activeMainStoryEvent.title.replace('Ricordo: ', '').replace('Frammento: ', '').replace('Eco ', '')}`;

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl border-8 border-double border-yellow-400/50 flex flex-col p-8">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6 text-yellow-300" style={{ textShadow: '0 0 8px #facc15' }}>
                    ═══ {formattedTitle} ═══
                </h1>
                
                <div
                    ref={textRef}
                    className="w-full h-96 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl"
                    style={{ scrollbarWidth: 'none' }}
                >
                    <pre className="whitespace-pre-wrap leading-relaxed font-[inherit]">{activeMainStoryEvent.text}</pre>
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4 animate-pulse">
                    [W/S] Scorri | [INVIO] Continua...
                </div>
            </div>
        </div>
    );
};

export default MainStoryScreen;

