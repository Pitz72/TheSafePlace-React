import React, { useEffect } from 'react';
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
 * @version 1.9.9
 * @secret Activation: Ctrl+Shift+D (toggle on/off)
 */
export const DebugPanel: React.FC = () => {
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
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const currentFlags = useGameStore.getState().gameFlags;
        const newFlags = new Set(currentFlags);
        
        if (newFlags.has('SHOW_DEBUG_PANEL')) {
          newFlags.delete('SHOW_DEBUG_PANEL');
          console.log('[DEBUG] Panel hidden');
        } else {
          newFlags.add('SHOW_DEBUG_PANEL');
          console.log('[DEBUG] Panel visible');
        }
        
        useGameStore.setState({ gameFlags: newFlags });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hidden by default, show only if flag is set
  const showDebug = gameFlags.has('SHOW_DEBUG_PANEL');
  if (!showDebug) return null;

  return (
    <div className="fixed top-2 right-2 bg-black/90 border-2 border-green-500 p-4 text-green-500 font-mono text-xs max-w-md max-h-[90vh] overflow-y-auto z-50">
      <div className="text-yellow-400 font-bold mb-2 text-sm">🔬 DEBUG PANEL v1.9.9</div>
      
      {/* Game State */}
      <div className="mb-3">
        <div className="text-cyan-400 font-bold">GAME STATE:</div>
        <div className="ml-2">{gameState}</div>
      </div>

      {/* Player Info */}
      <div className="mb-3">
        <div className="text-cyan-400 font-bold">PLAYER:</div>
        <div className="ml-2">Position: ({playerPos.x}, {playerPos.y})</div>
        <div className="ml-2">Biome: {currentBiome}</div>
        <div className="ml-2">Level: {level} | XP: {xp.current}/{xp.next}</div>
      </div>

      {/* Main Story */}
      <div className="mb-3">
        <div className="text-cyan-400 font-bold">MAIN STORY:</div>
        <div className="ml-2">Stage: {mainStoryStage}</div>
      </div>

      {/* Active Quests */}
      <div className="mb-3">
        <div className="text-cyan-400 font-bold">ACTIVE QUESTS ({Object.keys(activeQuests).length}):</div>
        {Object.keys(activeQuests).length === 0 ? (
          <div className="ml-2 text-gray-500">None</div>
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
          <div className="text-cyan-400 font-bold">KILL COUNTS:</div>
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
          <div className="text-cyan-400 font-bold">QUEST FLAGS:</div>
          {Object.entries(questFlags).map(([flag, value]) => (
            <div key={flag} className="ml-2">
              • {flag}: {value ? '✓' : '✗'}
            </div>
          ))}
        </div>
      )}

      {/* Game Flags */}
      <div className="mb-3">
        <div className="text-cyan-400 font-bold">GAME FLAGS ({gameFlags.size}):</div>
        <div className="ml-2 max-h-32 overflow-y-auto">
          {gameFlags.size === 0 ? (
            <div className="text-gray-500">None</div>
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
          <div className="text-cyan-400 font-bold">WANDERING TRADER:</div>
          <div className="ml-2">Position: ({wanderingTrader.position.x}, {wanderingTrader.position.y})</div>
          <div className="ml-2">Moves in: {wanderingTrader.turnsUntilMove} turns</div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
        Press F12 to open browser console for detailed logs
      </div>
    </div>
  );
};