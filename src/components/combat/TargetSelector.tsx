import React from 'react';
import type { EnemyCombatState } from '../../types/combat';

interface TargetSelectorProps {
  enemies: EnemyCombatState[];
  selectedIndex: number;
  onTargetSelect: (index: number) => void;
  onCancel: () => void;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({ enemies, selectedIndex }) => {
  return (
    <div className="panel h-full flex flex-col justify-between">
      <div>
        <h2 className="panel-title">SELEZIONA BERSAGLIO</h2>
        <div className="p-2 space-y-2">
          {enemies.map((enemy, index) => (
            <div
              key={enemy.id}
              className={`flex items-center p-2 rounded ${
                index === selectedIndex ? 'bg-phosphor-900' : ''
              }`}
            >
              {index === selectedIndex && <span className="text-red-500 mr-2">►</span>}
              <span className="flex-1">{enemy.name}</span>
              <span className="text-gray-400">{enemy.healthDescription}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center p-2 border-t border-phosphor-600 text-xs text-gray-400">
        [W/S] Naviga | [Enter] Conferma | [ESC] Annulla
      </div>
    </div>
  );
};

export default TargetSelector;
