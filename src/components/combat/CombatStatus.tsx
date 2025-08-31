import React from 'react';
import type { CombatState } from '../../types/combat';
import PlayerStatus from './PlayerStatus';
import EnemyStatus from './EnemyStatus';

interface CombatStatusProps {
  combatState: CombatState;
  selectedTarget: number | null;
}

const CombatStatus: React.FC<CombatStatusProps> = ({ combatState, selectedTarget }) => {
  return (
    <div className="panel flex">
      <PlayerStatus playerState={combatState.player} />
      <EnemyStatus enemies={combatState.enemies} selectedTarget={selectedTarget} />
    </div>
  );
};

export default CombatStatus;
