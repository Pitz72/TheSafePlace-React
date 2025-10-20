import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { GameState, AttributeName, Talent } from '../types';
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '../constants';
import { useTalentDatabaseStore } from '../data/talentDatabase';

/**
 * LevelUpScreen component.
 * This component renders the level up screen.
 * @returns {JSX.Element} The rendered LevelUpScreen component.
 */
const LevelUpScreen: React.FC = () => {
    const { setGameState } = useGameStore();
    const { levelUpPending, applyLevelUp, skills, level, unlockedTalents } = useCharacterStore();
    const { talents: allTalents } = useTalentDatabaseStore();

    const [selectedSection, setSelectedSection] = useState<'attribute' | 'talent'>('attribute');
    const [attributeIndex, setAttributeIndex] = useState(0);
    const [talentIndex, setTalentIndex] = useState(0);

    // FIX v1.2.4: Exclude already unlocked talents
    const availableTalents = useMemo(() => {
        return allTalents.filter(talent => 
            level + 1 >= talent.levelRequirement && 
            skills[talent.requiredSkill]?.proficient &&
            !unlockedTalents.includes(talent.id)
        );
    }, [allTalents, level, skills, unlockedTalents]);

    // FIX: Imported useEffect to resolve "Cannot find name 'useEffect'" error.
    useEffect(() => {
        if (!levelUpPending) {
            setGameState(GameState.IN_GAME);
        }
    }, [levelUpPending, setGameState]);

    const handleNavigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (direction === 'left' || direction === 'right') {
            setSelectedSection(prev => prev === 'attribute' ? 'talent' : 'attribute');
        } else {
            const delta = direction === 'up' ? -1 : 1;
            if (selectedSection === 'attribute') {
                setAttributeIndex(prev => (prev + delta + ATTRIBUTES.length) % ATTRIBUTES.length);
            } else if (availableTalents.length > 0) {
                setTalentIndex(prev => (prev + delta + availableTalents.length) % availableTalents.length);
            }
        }
    }, [selectedSection, availableTalents.length]);

    const handleConfirm = useCallback(() => {
        const selectedAttribute = ATTRIBUTES[attributeIndex];
        const selectedTalent = availableTalents[talentIndex];

        if (selectedAttribute && selectedTalent) {
            applyLevelUp({ attribute: selectedAttribute, talentId: selectedTalent.id });
        } else {
            // Handle case where no talents are available but level up is triggered
            // For now, we just go back to the game.
            setGameState(GameState.IN_GAME);
        }
    }, [attributeIndex, talentIndex, availableTalents, applyLevelUp, setGameState]);

    const handlerMap = useMemo(() => ({
        'ArrowUp': () => handleNavigate('up'),
        'w': () => handleNavigate('up'),
        'ArrowDown': () => handleNavigate('down'),
        's': () => handleNavigate('down'),
        'ArrowLeft': () => handleNavigate('left'),
        'a': () => handleNavigate('left'),
        'ArrowRight': () => handleNavigate('right'),
        'd': () => handleNavigate('right'),
        'Enter': handleConfirm,
    }), [handleNavigate, handleConfirm]);

    useKeyboardInput(handlerMap);
    
    const selectedTalentInfo = availableTalents[talentIndex];

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ AUMENTO DI LIVELLO ═══</h1>
                <p className="text-3xl text-center text-green-400/80 mb-8">
                    Scegli un attributo da migliorare e un nuovo talento da apprendere.
                </p>

                <div className="flex-grow flex space-x-6 overflow-hidden">
                    {/* Attributes Column */}
                    <div className={`w-1/3 h-full border-2 p-4 ${selectedSection === 'attribute' ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-green-400/30'}`}>
                        <h2 className="text-4xl text-center mb-4 border-b-2 border-green-400/30 pb-2">Attributo (+1)</h2>
                        <ul className="space-y-2 text-4xl">
                            {ATTRIBUTES.map((attr, index) => {
                                const isSelected = index === attributeIndex && selectedSection === 'attribute';
                                return (
                                    <li key={attr} className={`pl-4 py-1 ${isSelected ? 'bg-green-400 text-black' : ''}`}>
                                        {isSelected && '> '}{ATTRIBUTE_LABELS[attr]}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Talents Column */}
                    <div className={`w-2/3 h-full flex flex-col border-2 p-4 ${selectedSection === 'talent' ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-green-400/30'}`}>
                        <h2 className="text-4xl text-center mb-4 border-b-2 border-green-400/30 pb-2">Scegli un Talento</h2>
                        <div className="flex-grow flex overflow-hidden">
                            <ul className="w-1/2 space-y-2 text-4xl overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
                                {availableTalents.length > 0 ? availableTalents.map((talent, index) => {
                                    const isSelected = index === talentIndex && selectedSection === 'talent';
                                    return (
                                        <li key={talent.id} className={`pl-4 py-1 capitalize ${isSelected ? 'bg-green-400 text-black' : ''}`}>
                                            {isSelected && '> '}{talent.name}
                                        </li>
                                    );
                                }) : (
                                    <li className="text-gray-500 italic">Nessun talento disponibile.</li>
                                )}
                            </ul>
                            <div className="w-1/2 pl-4 border-l-2 border-green-400/30 text-2xl">
                                {selectedTalentInfo && (
                                    <>
                                        <h3 className="text-3xl font-bold text-yellow-400">{selectedTalentInfo.name}</h3>
                                        <p className="mt-2 text-green-400/80 italic">{selectedTalentInfo.description}</p>
                                        <p className="mt-4">Richiede: Competenza in {selectedTalentInfo.requiredSkill}, Livello {selectedTalentInfo.levelRequirement}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [←→] Seleziona Sezione | [↑↓] Seleziona Opzione | [INVIO] Conferma
                </div>
            </div>
        </div>
    );
};

export default LevelUpScreen;