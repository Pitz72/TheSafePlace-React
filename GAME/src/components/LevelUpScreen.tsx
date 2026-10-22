import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { GameState, SkillName } from '../types';
import { ATTRIBUTES, ATTRIBUTE_LABELS, SKILLS, SKILL_LABELS } from '../constants';
import { useTalentDatabaseStore } from '../data/talentDatabase';
import { audioManager } from '../utils/audio';
import Modal from './ui/Modal';
import Icon from './ui/Icon';
import ChoiceList from './ui/ChoiceList';

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
    const sectionStyle = (active: boolean): React.CSSProperties => active
        ? { borderColor: 'rgb(var(--accent) / 0.5)', boxShadow: '0 0 0 1px rgb(var(--accent) / 0.12), 0 24px 60px -36px rgb(var(--accent) / 0.7)' }
        : { opacity: 0.75 };
    const stepBadge = (n: number, active: boolean) => (
        <span className={`flex h-9 w-9 items-center justify-center rounded-full border font-cond text-[18px] font-semibold ${active ? 'border-accent bg-accent text-bg0' : 'border-line2 text-ink3'}`}>{n}</span>
    );

    return (
        <Modal
            eyebrow={`Livello ${level + 1}`}
            icon="levelUp"
            accent="gold"
            title="Sei cresciuto"
            subtitle={
                <>
                    {mode === 'talent' && 'Migliora un attributo e scegli un nuovo talento.'}
                    {mode === 'proficiency' && 'Migliora un attributo e diventa competente in una nuova abilità.'}
                    {mode === 'none' && 'Migliora un attributo.'}
                    {' '}Salendo di livello recuperi tutti gli HP.
                </>
            }
            size="xl"
            className="h-full"
            hints={[
                { keys: ['↑↓'], label: 'Scegli' },
                { keys: ['←→', 'TAB'], label: 'Cambia sezione', muted: mode === 'none' },
                { keys: ['INVIO'], label: section === 'attribute' && mode !== 'none' ? 'Avanti' : 'Conferma' },
                { keys: ['ESC'], label: 'Più tardi' },
            ]}
        >
            <div className="flex h-full gap-6 px-12 pb-8">
                <section className={`surface-flat flex flex-col px-6 py-6 transition-all duration-300 ${mode === 'none' ? 'mx-auto w-[640px]' : 'w-[36%] flex-shrink-0'}`} style={sectionStyle(section === 'attribute')}>
                    <header className="mb-5 flex items-center gap-3">
                        {stepBadge(1, section === 'attribute')}
                        <div>
                            <div className="eyebrow">Primo passo</div>
                            <h2 className="text-[24px] font-medium text-ink">Attributo +1</h2>
                        </div>
                    </header>
                    <ul className="flex flex-col gap-1.5">
                        {ATTRIBUTES.map((attr, index) => {
                            const isCursor = index === attributeIndex;
                            const isSelected = isCursor && section === 'attribute';
                            return (
                                <li key={attr} className={`choice !py-3.5 text-[22px] ${isSelected ? 'is-selected' : ''} ${isCursor && !isSelected ? '!border-line2' : ''}`}>
                                    <span className="w-12 font-cond text-[16px] font-semibold uppercase tracking-[0.2em] text-ink4">{attr}</span>
                                    <span className="flex-1">{ATTRIBUTE_LABELS[attr]}</span>
                                    <span className="tnum flex items-center gap-2 text-[22px]">
                                        <span className={isCursor ? 'text-ink3' : 'text-ink2'}>{attributes[attr]}</span>
                                        {isCursor && (
                                            <>
                                                <Icon name="arrowRight" size={16} className="text-ink4" />
                                                <span className="font-semibold text-accent">{attributes[attr] + 1}</span>
                                            </>
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                {mode !== 'none' && (
                    <section className="surface-flat flex min-w-0 flex-1 flex-col px-6 py-6 transition-all duration-300" style={sectionStyle(section === 'second')}>
                        <header className="mb-5 flex items-center gap-3">
                            {stepBadge(2, section === 'second')}
                            <div>
                                <div className="eyebrow">Secondo passo</div>
                                <h2 className="text-[24px] font-medium text-ink">{mode === 'talent' ? 'Un nuovo talento' : 'Una nuova competenza'}</h2>
                            </div>
                        </header>
                        <div className="flex min-h-0 flex-1 gap-6">
                            <div className="scroll-y fade-edges w-1/2 py-1 pr-1">
                                <ChoiceList
                                    size="md"
                                    selected={secondIndex}
                                    active={section === 'second'}
                                    items={mode === 'talent'
                                        ? availableTalents.map(t => ({ id: t.id, label: t.name, icon: 'sparkle' as const }))
                                        : learnableSkills.map(skill => ({ id: skill, label: SKILL_LABELS[skill], icon: 'check' as const }))}
                                />
                            </div>
                            <div className="min-w-0 flex-1 border-l border-line pl-6">
                                {selectedTalent && (
                                    <div key={selectedTalent.id} className="anim-fade-in">
                                        <div className="eyebrow text-gold">Talento</div>
                                        <h3 className="title-display mt-2 text-[40px] text-ink">{selectedTalent.name}</h3>
                                        <p className="prose-story mt-4 text-[21px] italic text-ink2">{selectedTalent.description}</p>
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            <span className="chip text-ink2">{SKILL_LABELS[selectedTalent.requiredSkill]}</span>
                                            <span className="chip text-ink2">Livello {selectedTalent.levelRequirement}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedSkill && (
                                    <div key={selectedSkill} className="anim-fade-in">
                                        <div className="eyebrow text-gold">Competenza</div>
                                        <h3 className="title-display mt-2 text-[40px] text-ink">{SKILL_LABELS[selectedSkill]}</h3>
                                        <p className="prose-story mt-4 text-[21px] text-ink2">
                                            Bonus di competenza alle prove di {SKILL_LABELS[selectedSkill]} ({ATTRIBUTE_LABELS[SKILLS[selectedSkill].attribute]}).
                                        </p>
                                        {talentsForSkill.length > 0 && (
                                            <div className="mt-6">
                                                <div className="eyebrow mb-3">Apre la strada ai talenti</div>
                                                <ul className="flex flex-col gap-2">
                                                    {talentsForSkill.map(t => (
                                                        <li key={t.id} className="flex items-center gap-3 text-[19px] text-ink2">
                                                            <Icon name="sparkle" size={16} className="text-gold" />
                                                            <span className="flex-1">{t.name}</span>
                                                            <span className="tnum text-[17px] text-ink4">liv. {t.levelRequirement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </Modal>
    );
};

export default LevelUpScreen;
