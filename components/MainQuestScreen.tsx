import React, { useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

/**
 * MainQuestScreen component.
 * This component renders the main quest screen.
 * @returns {JSX.Element | null} The rendered MainQuestScreen component or null.
 */
const MainQuestScreen: React.FC = () => {
    const { activeMainQuestEvent, resolveMainQuest } = useGameStore();

    const handleConfirm = useCallback(() => {
        resolveMainQuest();
    }, [resolveMainQuest]);

    const handlerMap = useMemo(() => ({
        'Enter': handleConfirm,
    }), [handleConfirm]);

    useKeyboardInput(handlerMap);

    if (!activeMainQuestEvent) {
        return null;
    }
    
    const formattedTitle = `Echo della Memoria #${activeMainQuestEvent.stage}: ${activeMainQuestEvent.title.replace('Ricordo: ', '').replace('Frammento: ', '')}`;

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl border-8 border-double border-yellow-400/50 flex flex-col p-8 animate-pulse">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6 text-yellow-300" style={{ textShadow: '0 0 8px #facc15' }}>
                    ═══ {formattedTitle} ═══
                </h1>
                
                <div 
                    className="w-full h-96 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl"
                    style={{ scrollbarWidth: 'none' }}
                >
                    <pre className="whitespace-pre-wrap leading-relaxed">{activeMainQuestEvent.text}</pre>
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4">
                    [INVIO] Continua...
                </div>
            </div>
        </div>
    );
};

export default MainQuestScreen;