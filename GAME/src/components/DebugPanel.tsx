import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';

/**
 * DebugPanel Component
 *
 * @description Real-time debug panel showing critical game state variables.
 * Hidden by default, activated with secret key combination: Ctrl+Shift+D
 *
 * Displays:
 * - Current game state
 * - Player position and biome
 * - Active game flags
 * - Active quests with current stage
 * - Quest kill counts
 * - Wandering trader position
 *
 * Development builds only (see GameScreen).
 * @secret Activation: Ctrl+Shift+D (toggle on/off)
 */
export const DebugPanel: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const gameState = useGameStore(state => state.gameState);
  const playerPos = useGameStore(state => state.playerPos);
  const currentBiome = useGameStore(state => state.currentBiome);
  const gameFlags = useGameStore(state => state.gameFlags);
  const wanderingTrader = useGameStore(state => state.wanderingTrader);
  const mainStoryStage = useGameStore(state => state.mainStoryStage);
  
  const activeQuests = useCharacterStore(state => state.activeQuests);
  const questKillCounts = useCharacterStore(state => state.questKillCounts);
  const questFlags = useCharacterStore(state => state.questFlags);
  const level = useCharacterStore(state => state.level);
  const xp = useCharacterStore(state => state.xp);

  // Secret key combination: Ctrl+Shift+D to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) return null;

  return (
    <div className="surface fixed right-2 top-2 z-50 max-h-[90vh] max-w-md overflow-y-auto p-4 font-mono text-xs text-ink2">
      <div className="text-ember font-bold mb-2 text-sm">DEBUG PANEL</div>
      
      {/* Game State */}
      <div className="mb-3">
        <div className="text-teal font-bold">GAME STATE:</div>
        <div className="ml-2">{gameState}</div>
      </div>

      {/* Player Info */}
      <div className="mb-3">
        <div className="text-teal font-bold">PLAYER:</div>
        <div className="ml-2">Position: ({playerPos.x}, {playerPos.y})</div>
        <div className="ml-2">Biome: {currentBiome}</div>
        <div className="ml-2">Level: {level} | XP: {xp.current}/{xp.next}</div>
      </div>

      {/* Main Story */}
      <div className="mb-3">
        <div className="text-teal font-bold">MAIN STORY:</div>
        <div className="ml-2">Stage: {mainStoryStage}</div>
      </div>

      {/* Active Quests */}
      <div className="mb-3">
        <div className="text-teal font-bold">ACTIVE QUESTS ({Object.keys(activeQuests).length}):</div>
        {Object.keys(activeQuests).length === 0 ? (
          <div className="ml-2 text-ink4">None</div>
        ) : (
          Object.entries(activeQuests).map(([questId, stage]) => (
            <div key={questId} className="ml-2">
              • {questId}: Stage {stage}
            </div>
          ))
        )}
      </div>

      {/* Quest Kill Counts */}
      {Object.keys(questKillCounts).length > 0 && (
        <div className="mb-3">
          <div className="text-teal font-bold">KILL COUNTS:</div>
          {Object.entries(questKillCounts).map(([questId, counts]) => (
            <div key={questId} className="ml-2">
              {questId}:
              {Object.entries(counts as Record<string, number>).map(([enemyId, count]) => (
                <div key={enemyId} className="ml-4 text-xs">
                  {enemyId}: {count}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Quest Flags */}
      {Object.keys(questFlags).length > 0 && (
        <div className="mb-3">
          <div className="text-teal font-bold">QUEST FLAGS:</div>
          {Object.entries(questFlags).map(([flag, value]) => (
            <div key={flag} className="ml-2">
              • {flag}: {value ? '✓' : '✗'}
            </div>
          ))}
        </div>
      )}

      {/* Game Flags */}
      <div className="mb-3">
        <div className="text-teal font-bold">GAME FLAGS ({gameFlags.size}):</div>
        <div className="ml-2 max-h-32 overflow-y-auto">
          {gameFlags.size === 0 ? (
            <div className="text-ink4">None</div>
          ) : (
            Array.from(gameFlags).sort().map(flag => (
              <div key={flag} className="text-xs">• {flag}</div>
            ))
          )}
        </div>
      </div>

      {/* Wandering Trader */}
      {wanderingTrader && (
        <div className="mb-3">
          <div className="text-teal font-bold">WANDERING TRADER:</div>
          <div className="ml-2">Position: ({wanderingTrader.position.x}, {wanderingTrader.position.y})</div>
          <div className="ml-2">Moves in: {wanderingTrader.turnsUntilMove} turns</div>
        </div>
      )}

      <div className="text-xs text-ink4 mt-2 pt-2 border-t border-line">
        Press F12 to open browser console for detailed logs
      </div>
    </div>
  );
};