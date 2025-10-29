import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { CutscenePage } from '../types';
import { audioManager } from '../utils/audio';

/**
 * CutsceneScreen component.
 * This component renders the cutscene screen.
 * @returns {JSX.Element | null} The rendered CutsceneScreen component or null.
 */
const CutsceneScreen: React.FC = () => {
    const { activeCutscene, processCutsceneConsequences, endCutscene } = useGameStore();
    const [pageIndex, setPageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const currentPage: CutscenePage | null = activeCutscene ? activeCutscene.pages[pageIndex] : null;

    useEffect(() => {
        if (!currentPage) return;

        // Process consequences as soon as the page loads
        if (currentPage.consequences) {
            processCutsceneConsequences(currentPage.consequences);
        }

        setIsTyping(true);
        setDisplayedText('');
        let charIndex = 0;
        const typingInterval = setInterval(() => {
            if (charIndex < currentPage.text.length) {
                setDisplayedText(currentPage.text.substring(0, charIndex + 1));
                charIndex++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, 20);

        return () => clearInterval(typingInterval);
    }, [currentPage, processCutsceneConsequences]);
    
    const finishTyping = useCallback(() => {
        if (currentPage) {
            setIsTyping(false);
            setDisplayedText(currentPage.text);
        }
    }, [currentPage]);

    const handleAdvance = useCallback(() => {
        if (isTyping) {
            finishTyping();
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
    }, [isTyping, finishTyping, currentPage, endCutscene]);

    const handleChoice = useCallback((choiceIndex: number) => {
        if (isTyping || !currentPage?.choices) return;

        const choice = currentPage.choices[choiceIndex];
        if (choice) {
            audioManager.playSound('confirm');
            setPageIndex(choice.targetPage);
        }
    }, [isTyping, currentPage]);

    const handlerMap = useMemo(() => {
        const map: { [key: string]: () => void } = {
            Enter: handleAdvance,
        };
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
                {/* Text Content Area - Scrollable if needed */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="border-y-4 border-double border-[var(--border-primary)] py-6 px-4 max-h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        <div className="whitespace-pre-wrap text-3xl leading-snug text-center font-mono max-w-5xl mx-auto">
                            <span>{displayedText}</span>
                            {isTyping && <span className="bg-[var(--text-primary)] w-4 h-7 inline-block animate-pulse ml-1" />}
                        </div>
                    </div>
                </div>

                {/* Choices Area - Fixed at bottom */}
                {!isTyping && currentPage.choices && (
                    <div className="mt-6 text-center text-2xl space-y-3 flex-shrink-0">
                        {currentPage.choices.map((choice, index) => (
                            <p key={index} className="text-amber-400">{choice.text}</p>
                        ))}
                    </div>
                )}
                
                {/* Continue Prompt - Fixed at bottom */}
                <div className="mt-6 text-center text-2xl animate-pulse flex-shrink-0">
                   {!isTyping && !currentPage.choices && (
                       <span className="text-[var(--text-accent)]">[INVIO per continuare]</span>
                   )}
                </div>
            </div>
        </div>
    );
};

export default CutsceneScreen;