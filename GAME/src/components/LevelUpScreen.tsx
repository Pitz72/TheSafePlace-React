import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { GameState, SkillName } from '../types';
import { ATTRIBUTES, ATTRIBUTE_LABELS, SKILLS, SKILL_LABELS } from '../constants';
import { useTalentDatabaseStore } from '../data/talentDatabase';
import { audioManager } from '../utils/audio';

/**
 * Level up: +1 to an attribute, plus a talent — or, when no talent is
 * available yet, a new skill proficiency (which can open the way to talents).
 */
const LevelUpScreen: React.FC = () => {
    const setGameState = useGameStore(state => state.setGameState);
    const { levelUpPending, applyLevelUp, skills, level, unlockedTalents, attributes } = useCharacterStore();
    const talents = useTalentDatabaseStore(state => state.talents);

    const [section, setSection] = useState<'attribute' | 'second'>('attribute');
    const [attributeIndex, setAttributeIndex] = useState(0);
    const [secondIndex, setSecondIndex] = useState(0);

    const availableTalents = useMemo(() => talents.filter(talent =>
        level + 1 >= talent.levelRequirement &&
        skills[talent.requiredSkill]?.proficient &&
        !unlockedTalents.includes(talent.id)), [talents, level, skills, unlockedTalents]);

    const learnableSkills = useMemo(
        () => (Object.keys(SKILLS) as SkillName[]).filter(skill => !skills[skill]?.proficient),
        [skills]);

    const mode: 'talent' | 'proficiency' | 'none' =
        availableTalents.length > 0 ? 'talent' : learnableSkills.length > 0 ? 'proficiency' : 'none';
    const secondOptions = mode === 'talent' ? availableTalents.length : mode === 'proficiency' ? learnableSkills.length : 0;

    useEffect(() => {
        if (!levelUpPending) setGameState(GameState.IN_GAME);
    }, [levelUpPending, setGameState]);
    useEffect(() => { setSecondIndex(0); }, [mode]);

    const navigate = useCallback((direction: 'up' | 'down' | 'switch') => {
        audioManager.playSound('navigate');
        if (direction === 'switch') {
            if (mode !== 'none') setSection(prev => (prev === 'attribute' ? 'second' : 'attribute'));
            return;
        }
        const delta = direction === 'up' ? -1 : 1;
        if (section === 'attribute') setAttributeIndex(prev => (prev + delta + ATTRIBUTES.length) % ATTRIBUTES.length);
        else if (secondOptions > 0) setSecondIndex(prev => (prev + delta + secondOptions) % secondOptions);
    }, [section, secondOptions, mode]);

    const confirm = useCallback(() => {
        // Attribute first, then the second choice.
        if (section === 'attribute' && mode !== 'none') {
            audioManager.playSound('confirm');
            setSection('second');
            return;
        }
        const attribute = ATTRIBUTES[attributeIndex];
        applyLevelUp({
            attribute,
            talentId: mode === 'talent' ? availableTalents[secondIndex]?.id : undefined,
            proficiency: mode === 'proficiency' ? learnableSkills[secondIndex] : undefined,
        });
        // Several levels at once: start the next one from the top.
        setSection('attribute');
        setSecondIndex(0);
    }, [section, mode, attributeIndex, secondIndex, availableTalents, learnableSkills, applyLevelUp]);

    const handlerMap = useMemo(() => ({
        ArrowUp: () => navigate('up'), w: () => navigate('up'),
        ArrowDown: () => navigate('down'), s: () => navigate('down'),
        ArrowLeft: () => navigate('switch'), a: () => navigate('switch'),
        ArrowRight: () => navigate('switch'), d: () => navigate('switch'),
        Tab: () => navigate('switch'),
        Enter: confirm,
        Escape: () => setGameState(GameState.IN_GAME),
    }), [navigate, confirm, setGameState]);

    useKeyboardInput(handlerMap);

    const selectedTalent = mode === 'talent' ? availableTalents[secondIndex] : undefined;
    const selectedSkill = mode === 'proficiency' ? learnableSkills[secondIndex] : undefined;
    const talentsForSkill = selectedSkill ? talents.filter(t => t.requiredSkill === selectedSkill && !unlockedTalents.includes(t.id)) : [];
    const sectionClass = (active: boolean) => `h-full border-2 p-4 ${active ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-green-400/30'}`;

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-4">═══ LIVELLO {level + 1} ═══</h1>
                <p className="text-3xl text-center text-green-400/80 mb-6">
                    {mode === 'talent' && 'Migliora un attributo e scegli un nuovo talento.'}
                    {mode === 'proficiency' && 'Migliora un attributo e diventa competente in una nuova abilità.'}
                    {mode === 'none' && 'Migliora un attributo.'}
                    {' '}Salendo di livello recuperi tutti gli HP.
                </p>

                <div className="flex-grow flex space-x-6 overflow-hidden">
                    <div className={`w-1/3 ${sectionClass(section === 'attribute')}`}>
                        <h2 className="text-4xl text-center mb-4 border-b-2 border-green-400/30 pb-2">1. Attributo (+1)</h2>
                        <ul className="space-y-2 text-4xl">
                            {ATTRIBUTES.map((attr, index) => {
                                const isSelected = index === attributeIndex;
                                return (
                                    <li key={attr} className={`pl-4 py-1 flex justify-between ${isSelected && section === 'attribute' ? 'bg-green-400 text-black' : isSelected ? 'text-yellow-400' : ''}`}>
                                        <span>{isSelected && '> '}{ATTRIBUTE_LABELS[attr]}</span>
                                        <span className="pr-2">{attributes[attr]}{isSelected ? ` → ${attributes[attr] + 1}` : ''}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {mode !== 'none' && (
                        <div className={`w-2/3 flex flex-col ${sectionClass(section === 'second')}`}>
                            <h2 className="text-4xl text-center mb-4 border-b-2 border-green-400/30 pb-2">
                                2. {mode === 'talent' ? 'Talento' : 'Nuova Competenza'}
                            </h2>
                            <div className="flex-grow flex overflow-hidden">
                                <ul className="w-1/2 space-y-2 text-3xl overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
                                    {(mode === 'talent' ? availableTalents.map(t => ({ id: t.id, label: t.name })) : learnableSkills.map(s => ({ id: s, label: SKILL_LABELS[s] })))
                                        .map((option, index) => {
                                            const isSelected = index === secondIndex;
                                            return (
                                                <li key={option.id} className={`pl-4 py-1 ${isSelected && section === 'second' ? 'bg-green-400 text-black' : isSelected ? 'text-yellow-400' : ''}`}>
                                                    {isSelected && '> '}{option.label}
                                                </li>
                                            );
                                        })}
                                </ul>
                                <div className="w-1/2 pl-4 border-l-2 border-green-400/30 text-2xl space-y-3">
                                    {selectedTalent && (
                                        <>
                                            <h3 className="text-3xl font-bold text-yellow-400">{selectedTalent.name}</h3>
                                            <p className="text-green-400/80 italic">{selectedTalent.description}</p>
                                            <p>Richiede: {SKILL_LABELS[selectedTalent.requiredSkill]}, livello {selectedTalent.levelRequirement}</p>
                                        </>
                                    )}
                                    {selectedSkill && (
                                        <>
                                            <h3 className="text-3xl font-bold text-yellow-400">{SKILL_LABELS[selectedSkill]}</h3>
                                            <p className="text-green-400/80">Bonus di competenza alle prove di {SKILL_LABELS[selectedSkill]} ({ATTRIBUTE_LABELS[SKILLS[selectedSkill].attribute]}).</p>
                                            {talentsForSkill.length > 0 && (
                                                <p>Apre la strada ai talenti: {talentsForSkill.map(t => `${t.name} (liv. ${t.levelRequirement})`).join(', ')}.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [↑↓] Scegli | [←→/TAB] Cambia sezione | [INVIO] {section === 'attribute' && mode !== 'none' ? 'Avanti' : 'Conferma'} | [ESC] Più tardi
                </div>
            </div>
        </div>
    );
};

export default LevelUpScreen;
