import React from 'react';
import type { CombatActionType } from '../../types/combat';

interface ActionMenuProps {
  availableActions: { type: CombatActionType; label: string; enabled: boolean }[];
  selectedActionIndex: number;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ availableActions, selectedActionIndex }) => {
  return (
    <div className="panel h-full flex flex-col justify-between">
      <div>
        <h2 className="panel-title">AZIONI</h2>
        <div className="p-2 space-y-2">
          {availableActions.map((action, index) => (
            <div
              key={action.type}
              className={`flex items-center p-2 rounded ${
                index === selectedActionIndex ? 'bg-phosphor-900' : ''
              } ${!action.enabled ? 'text-gray-600' : ''}`}
            >
              {index === selectedActionIndex && <span className="text-red-500 mr-2">►</span>}
              <span className="flex-1">{action.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center p-2 border-t border-phosphor-600 text-xs text-gray-400">
        [W/S] Naviga | [Enter] Seleziona
      </div>
    </div>
  );
};

export default ActionMenu;
