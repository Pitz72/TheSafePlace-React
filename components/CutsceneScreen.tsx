import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { CutscenePage } from '../types';
import { audioManager } from '../utils/audio';

const CutsceneScreen: React.FC = () => {
    const { activeCutscene, processCutsceneConsequences, endCutscene } = useGameStore();
    const { alignment } = useCharacterStore();
    const [pageIndex, setPageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const currentPage: CutscenePage | null = activeCutscene ? activeCutscene.pages[pageIndex] : null;

    const availableChoices = useMemo(() => {
        if (!currentPage?.choices) return [];
        return currentPage.choices.filter(choice => {
            if (!choice.alignmentRequirement) return true;

            const { type, threshold } = choice.alignmentRequirement;
            // Calcola il dominio dell'allineamento
            if (type === 'Lena') {
                return (alignment.lena - alignment.elian) >= threshold;
            }
            if (type === 'Elian') {
                return (alignment.elian - alignment.lena) >= threshold;
            }
            return true; // Se non c'è un requisito o il tipo non è riconosciuto
        });
    }, [currentPage, alignment]);

    useEffect(() => {
        if (!currentPage) return;

        if (currentPage.consequences) {
            processCutsceneConsequences(currentPage.consequences);
        }

        setIsTyping(true);
        setDisplayedText('');
        let charIndex = 0;
        const typingInterval = setInterval(() => {
            if (charIndex < currentPage.text.length) {
                setDisplayedText(prev => currentPage.text.substring(0, charIndex + 1));
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

        if (currentPage && availableChoices.length === 0) {
            if (currentPage.nextPage !== null && currentPage.nextPage !== undefined) {
                audioManager.playSound('navigate');
                setPageIndex(currentPage.nextPage);
            } else {
                audioManager.playSound('confirm');
                endCutscene();
            }
        }
    }, [isTyping, finishTyping, currentPage, availableChoices, endCutscene]);

    const handleChoice = useCallback((choiceIndex: number) => {
        if (isTyping) return;

        const choice = availableChoices[choiceIndex];
        if (choice) {
            audioManager.playSound('confirm');
            setPageIndex(choice.targetPage);
        }
    }, [isTyping, availableChoices]);

    const handlerMap = useMemo(() => {
        const map: { [key: string]: () => void } = { Enter: handleAdvance };
        availableChoices.forEach((_, index) => {
            map[`${index + 1}`] = () => handleChoice(index);
        });
        return map;
    }, [handleAdvance, handleChoice, availableChoices]);

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

                {!isTyping && availableChoices.length > 0 && (
                    <div className="mt-12 text-center text-3xl space-y-4">
                        {availableChoices.map((choice, index) => (
                            <p key={index}>{choice.text}</p>
                        ))}
                    </div>
                )}
                
                <div className="mt-12 text-center text-3xl animate-pulse">
                   {!isTyping && availableChoices.length === 0 && "[INVIO per continuare]"}
                </div>
            </div>
        </div>
    );
};

export default CutsceneScreen;
