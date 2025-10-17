import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { CutscenePage } from '../types';
import { audioManager } from '../utils/audio';

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
        <div className="absolute inset-0 bg-black flex items-center justify-center p-8">
            <div className="w-full max-w-6xl h-full flex flex-col justify-center">
                <div className="border-y-4 border-double border-[var(--border-primary)] py-8">
                    <pre className="whitespace-pre-wrap text-4xl leading-relaxed text-center">
                        {displayedText}{isTyping && <span className="bg-[var(--text-primary)] w-5 h-8 inline-block animate-pulse ml-1"></span>}
                    </pre>
                </div>

                {!isTyping && currentPage.choices && (
                    <div className="mt-12 text-center text-3xl space-y-4">
                        {currentPage.choices.map((choice, index) => (
                            <p key={index}>{choice.text}</p>
                        ))}
                    </div>
                )}
                
                <div className="mt-12 text-center text-3xl animate-pulse">
                   {!isTyping && !currentPage.choices && "[INVIO per continuare]"}
                </div>
            </div>
        </div>
    );
};

export default CutsceneScreen;