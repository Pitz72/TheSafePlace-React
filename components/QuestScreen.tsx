import React, { useCallback, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useQuestDatabaseStore } from '../data/questDatabase';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { GameState } from '../types';

/**
 * QuestScreen component.
 * 
 * @description Full-screen modal interface for viewing active and completed quests.
 * Displays main quests and subquests in separate sections with current objectives.
 * 
 * @remarks
 * - Activated when gameState is QUEST_LOG
 * - Keyboard-only navigation (ESC to close)
 * - Shows active quests with current objective
 * - Shows completed quests in strikethrough gray
 * - Two-column layout: Main Quests | Subquests
 * 
 * @returns {JSX.Element} The rendered QuestScreen component
 */
const QuestScreen: React.FC = () => {
    const { activeQuests, completedQuests } = useCharacterStore();
    const { quests } = useQuestDatabaseStore();
    const { setGameState } = useGameStore();

    const closeQuestLog = useCallback(() => {
        setGameState(GameState.IN_GAME);
    }, [setGameState]);

    const keyHandler = useCallback((key: string) => {
        if (key === 'Escape' || key === 'j' || key === 'J') {
            closeQuestLog();
        }
    }, [closeQuestLog]);

    const handlerMap = useMemo(() => ({
        'Escape': () => keyHandler('Escape'),
        'j': () => keyHandler('j'),
        'J': () => keyHandler('J'),
    }), [keyHandler]);

    useKeyboardInput(handlerMap);

    // Separate quests by type
    const activeMainQuests = Object.keys(activeQuests)
        .map(questId => ({ questId, quest: quests[questId], currentStage: activeQuests[questId] }))
        .filter(q => q.quest && q.quest.type === 'MAIN');

    const activeSubQuests = Object.keys(activeQuests)
        .map(questId => ({ questId, quest: quests[questId], currentStage: activeQuests[questId] }))
        .filter(q => q.quest && q.quest.type === 'SUB');

    const completedMainQuests = completedQuests
        .map(questId => quests[questId])
        .filter(q => q && q.type === 'MAIN');

    const completedSubQuests = completedQuests
        .map(questId => quests[questId])
        .filter(q => q && q.type === 'SUB');

    /**
     * Renders a quest entry with title and current objective.
     */
    const renderActiveQuest = (questId: string, quest: any, currentStage: number) => {
        const stageData = quest.stages.find((s: any) => s.stage === currentStage);
        const objective = stageData ? stageData.objective : 'Obiettivo sconosciuto';

        return (
            <div key={questId} className="mb-4 pb-4 border-b border-green-400/20">
                <div className="text-4xl font-bold mb-2" style={{ color: '#facc15', textShadow: '0 0 8px #facc15' }}>
                    {quest.title}
                </div>
                <div className="text-3xl text-green-400/80 pl-4">
                    • {objective}
                </div>
            </div>
        );
    };

    /**
     * Renders a completed quest entry (strikethrough, gray).
     */
    const renderCompletedQuest = (quest: any) => {
        return (
            <div key={quest.id} className="mb-3 text-3xl text-green-400/40 line-through">
                {quest.title}
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6">
                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-6xl font-bold tracking-widest uppercase">═══ DIARIO MISSIONI ═══</h1>
                </div>

                {/* Two-column layout */}
                <div className="flex-grow flex space-x-6 overflow-hidden">
                    {/* Main Quests Column */}
                    <div className="w-1/2 h-full border-2 border-green-400/30 p-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        <h2 className="text-5xl font-bold mb-4 pb-2 border-b-2 border-green-400/30">
                            MISSIONI PRINCIPALI
                        </h2>
                        
                        {/* Active Main Quests */}
                        {activeMainQuests.length > 0 ? (
                            <div className="mb-6">
                                {activeMainQuests.map(q => renderActiveQuest(q.questId, q.quest, q.currentStage))}
                            </div>
                        ) : (
                            <div className="text-green-400/50 text-3xl mb-6">
                                -- Nessuna missione principale attiva --
                            </div>
                        )}

                        {/* Completed Main Quests */}
                        {completedMainQuests.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-green-400/20">
                                <h3 className="text-4xl font-bold mb-3 text-green-400/60">COMPLETATE</h3>
                                {completedMainQuests.map(renderCompletedQuest)}
                            </div>
                        )}
                    </div>

                    {/* Subquests Column */}
                    <div className="w-1/2 h-full border-2 border-green-400/30 p-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        <h2 className="text-5xl font-bold mb-4 pb-2 border-b-2 border-green-400/30">
                            MISSIONI SECONDARIE
                        </h2>
                        
                        {/* Active Subquests */}
                        {activeSubQuests.length > 0 ? (
                            <div className="mb-6">
                                {activeSubQuests.map(q => renderActiveQuest(q.questId, q.quest, q.currentStage))}
                            </div>
                        ) : (
                            <div className="text-green-400/50 text-3xl mb-6">
                                -- Nessuna missione secondaria attiva --
                            </div>
                        )}

                        {/* Completed Subquests */}
                        {completedSubQuests.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-green-400/20">
                                <h3 className="text-4xl font-bold mb-3 text-green-400/60">COMPLETATE</h3>
                                {completedSubQuests.map(renderCompletedQuest)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [ESC] Chiudi | [J] Chiudi
                </div>
            </div>
        </div>
    );
};

export default QuestScreen;