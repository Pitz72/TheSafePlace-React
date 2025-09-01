import React from 'react';
import type { EnemyCombatState } from '../../types/combat';

interface EnemyStatusProps {
  enemies: EnemyCombatState[];
  selectedTarget: number | null;
}

const getHealthColor = (description: EnemyCombatState['healthDescription']): string => {
    switch(description) {
        case 'Illeso': return 'text-green-400';
        case 'Ferito': return 'text-yellow-400';
        case 'Gravemente Ferito': return 'text-orange-500';
        case 'Morente': return 'text-red-500 animate-pulse';
        default: return 'text-gray-400';
    }
}

const EnemyStatus: React.FC<EnemyStatusProps> = ({ enemies, selectedTarget }) => {
  return (
    <div className="w-1/2 p-2">
      <h3 className="panel-title">NEMICI</h3>
      <div className="space-y-1 text-uniform">
        {enemies.map((enemy, index) => (
          <div
            key={enemy.id}
            className={`flex justify-between items-center p-1 rounded ${index === selectedTarget ? 'bg-phosphor-900' : ''}`}
          >
            <span>
              {index === selectedTarget && <span className="text-red-500 mr-2">►</span>}
              {enemy.name}
            </span>
            <span className={getHealthColor(enemy.healthDescription)}>
              {enemy.healthDescription}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnemyStatus;
