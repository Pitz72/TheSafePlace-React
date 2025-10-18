import React, { useState, useCallback, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { useEventStore } from '../store/eventStore';

/**
 * EventScreen component.
 * This component renders the event screen, which displays an event and allows the player to make a choice.
 * @returns {JSX.Element | null} The rendered EventScreen component or null.
 */
const EventScreen: React.FC = () => {
    const { activeEvent, resolveEventChoice, eventResolutionText, dismissEventResolution } = useEventStore();
    const inventory = useCharacterStore(state => state.inventory);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const choiceStatus = useMemo(() => {
        if (!activeEvent) return [];
        return activeEvent.choices.map(choice => {
            if (!choice.itemRequirements) return { met: true, text: '' };

            for (const req of choice.itemRequirements) {
                const playerItem = inventory.find(item => item.itemId === req.itemId);
                if (!playerItem || playerItem.quantity < req.quantity) {
                    return { met: false, text: ` (Richiede: ${req.itemId} x${req.quantity})` };
                }
            }
            return { met: true, text: '' };
        });
    }, [activeEvent, inventory]);

    const handleNavigate = useCallback((direction: number) => {
        if (!activeEvent || eventResolutionText) return;
        const numChoices = activeEvent.choices.length;
        setSelectedIndex(prev => {
            let newIndex = (prev + direction + numChoices) % numChoices;
            // Skip disabled choices
            let attempts = 0;
            while (!choiceStatus[newIndex]?.met && attempts < numChoices) {
                newIndex = (newIndex + direction + numChoices) % numChoices;
                attempts++;
            }
            return newIndex;
        });
        audioManager.playSound('navigate');
    }, [activeEvent, choiceStatus, eventResolutionText]);

    const handleConfirm = useCallback(() => {
        if (eventResolutionText) {
            dismissEventResolution();
            audioManager.playSound('confirm');
        } else if (activeEvent && choiceStatus[selectedIndex]?.met) {
            resolveEventChoice(selectedIndex);
            audioManager.playSound('confirm');
        } else {
            audioManager.playSound('error');
        }
    }, [activeEvent, selectedIndex, resolveEventChoice, choiceStatus, eventResolutionText, dismissEventResolution]);
    
    const handlerMap = useMemo(() => ({
        'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
        's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
        'Enter': handleConfirm,
    }), [handleNavigate, handleConfirm]);

    useKeyboardInput(handlerMap);

    if (!activeEvent) {
        return null;
    }

    if (eventResolutionText) {
        return (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
                <div className="w-full max-w-6xl border-8 border-double border-green-400/50 flex flex-col p-8">
                    <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">
                        ═══ ESITO: {activeEvent.title} ═══
                    </h1>
                    
                    <div 
                        className="w-full h-64 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        <pre className="whitespace-pre-wrap leading-relaxed">{eventResolutionText.replace(/\\n/g, '\n')}</pre>
                    </div>

                    <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4 animate-pulse">
                        [INVIO] Continua
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl border-8 border-double border-green-400/50 flex flex-col p-8">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">
                    ═══ {activeEvent.title} ═══
                </h1>
                
                <div 
                    className="w-full h-64 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl"
                    style={{ scrollbarWidth: 'none' }}
                >
                    <pre className="whitespace-pre-wrap leading-relaxed">{activeEvent.description.replace(/\\n/g, '\n')}</pre>
                </div>

                <div className="w-full max-w-4xl mx-auto text-4xl space-y-4">
                    {activeEvent.choices.map((choice, index) => {
                         const isSelected = index === selectedIndex;
                         const isMet = choiceStatus[index]?.met;
                         const requirementText = choiceStatus[index]?.text;

                        return (
                        <div
                            key={index}
                            className={`pl-4 py-2 transition-colors duration-100 ${
                                isSelected && isMet ? 'bg-green-400 text-black' 
                                : isMet ? 'bg-transparent' : 'text-gray-500'
                            }`}
                        >
                            {isSelected && isMet && '> '}{choice.text}
                            {!isMet && <span className="text-red-500/80 italic">{requirementText}</span>}
                        </div>
                    )})}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4">
                    [W/S / ↑↓] Seleziona | [INVIO] Conferma la Scelta
                </div>
            </div>
        </div>
    );
};

export default EventScreen;