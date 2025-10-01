/**
 * CombatScreen.tsx
 *
 * Componente principale che assembla l'intera interfaccia di combattimento.
 * Gestisce il layout e il flusso di dati tra lo store e i componenti figli.
 */
import React from 'react';
import { useCombatStore } from '@/stores/combatStore';
import { useGameStore } from '@/stores/gameStore';

// Import dei componenti di combattimento
import SceneDescription from './SceneDescription';
import CombatStatus from './CombatStatus';
import CombatLog from './CombatLog';
import ActionMenu from './ActionMenu';
import TargetSelector from './TargetSelector';
import PostCombatScreen from './PostCombatScreen';

export const CombatScreen: React.FC = () => {
  const combatState = useCombatStore();
  const gameCharacter = useGameStore((state: any) => state.characterSheet);

  // La schermata post-combattimento ha la priorità
  if (combatState.combatResult) {
    return <PostCombatScreen />;
  }

  // Se il combattimento non è attivo e non ci sono risultati, non renderizzare nulla
  if (!combatState.isActive || !gameCharacter) {
    return null;
  }

  const handleExecuteAction = () => {
    if (combatState.selectedAction && (combatState.selectedAction === 'flee' || combatState.selectedTarget !== null)) {
      combatState.executePlayerAction();
    }
  };

  // Available actions for the action menu
  const availableActions = [
    { type: 'attack' as const, label: 'ATTACCA', enabled: true },
    { type: 'defend' as const, label: 'DIFENDI', enabled: true },
    { type: 'inventory' as const, label: 'INVENTARIO', enabled: true },
    { type: 'flee' as const, label: 'FUGGI', enabled: true },
  ];

  const selectedActionIndex = availableActions.findIndex(action => action.type === combatState.selectedAction);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-mono p-4 border-2 border-red-900 shadow-lg shadow-red-900/30">
      <header className="mb-2 border-b border-gray-700 pb-2">
        <SceneDescription description={combatState.currentState?.encounter?.description || 'Un incontro inaspettato.'} />
      </header>

      <main className="flex-grow flex gap-4 overflow-hidden">
        <div className="w-3/4 flex flex-col gap-4">
          <div className="flex-shrink-0">
            <CombatStatus combatState={combatState.currentState!} selectedTarget={combatState.selectedTarget} />
          </div>
          <div className="flex-grow overflow-y-auto pr-2">
            <CombatLog logEntries={combatState.currentState?.log || []} />
          </div>
        </div>

        <aside className="w-1/4 flex flex-col justify-between border-l border-gray-700 pl-4">
          <div>
            <ActionMenu
              availableActions={availableActions}
              selectedActionIndex={selectedActionIndex}
            />
            {combatState.selectedAction === 'attack' && combatState.currentState?.enemies && combatState.currentState.enemies.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg text-yellow-400 mb-2">Seleziona Bersaglio:</h3>
                <TargetSelector
                  enemies={combatState.currentState.enemies}
                  selectedIndex={combatState.selectedTarget || 0}
                  onTargetSelect={combatState.selectTarget}
                  onCancel={() => {}}
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              className="w-full p-3 text-lg bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={handleExecuteAction}
              disabled={!combatState.selectedAction || (combatState.selectedAction === 'attack' && combatState.selectedTarget === null)}
            >
              {combatState.selectedAction === 'flee' ? 'TENTA LA FUGA' : 'CONFERMA AZIONE'}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CombatScreen;