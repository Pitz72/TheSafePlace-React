/**
 * CombatScreen.tsx
 *
 * Componente principale che assembla l'intera interfaccia di combattimento.
 * Gestisce il layout e il flusso di dati tra lo store e i componenti figli.
 */
import React from 'react';
import { useCombatStore } from '../../stores/combatStore';
import { useGameStore } from '../../stores/gameStore';

// Import dei componenti di combattimento
import SceneDescription from './SceneDescription';
import CombatStatus from './CombatStatus';
import CombatLog from './CombatLog';
import ActionMenu from './ActionMenu';
import TargetSelector from './TargetSelector';

export const CombatScreen: React.FC = () => {
  const combatState = useCombatStore();
  const gameCharacter = useGameStore(state => state.characterSheet);

  if (!combatState.isInCombat || !gameCharacter) {
    // TODO: Aggiungere una schermata di caricamento o errore più robusta
    return null;
  }

  const handleExecuteAction = () => {
    if (combatState.selectedAction && combatState.selectedTargetId) {
      combatState.executePlayerAction();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-mono p-4 border-2 border-red-900 shadow-lg shadow-red-900/30">
      <header className="mb-2 border-b border-gray-700 pb-2">
        <SceneDescription description={combatState.encounter?.description || 'Un incontro inaspettato.'} />
      </header>

      <main className="flex-grow flex gap-4 overflow-hidden">
        <div className="w-3/4 flex flex-col gap-4">
          <div className="flex-shrink-0">
            <CombatStatus player={gameCharacter} enemies={combatState.enemies} />
          </div>
          <div className="flex-grow overflow-y-auto pr-2">
            <CombatLog entries={combatState.log} />
          </div>
        </div>

        <aside className="w-1/4 flex flex-col justify-between border-l border-gray-700 pl-4">
          <div>
            <ActionMenu
              availableActions={combatState.availableActions}
              selectedAction={combatState.selectedAction}
              onSelectAction={combatState.selectAction}
            />
            {combatState.selectedAction && combatState.enemies.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg text-yellow-400 mb-2">Seleziona Bersaglio:</h3>
                <TargetSelector
                  enemies={combatState.enemies}
                  selectedTargetId={combatState.selectedTargetId}
                  onSelectTarget={combatState.selectTarget}
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              className="w-full p-3 text-lg bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={handleExecuteAction}
              disabled={!combatState.selectedAction || (combatState.selectedAction !== 'escape' && !combatState.selectedTargetId)}
            >
              {combatState.selectedAction === 'escape' ? 'TENTA LA FUGA' : 'CONFERMA AZIONE'}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CombatScreen;
