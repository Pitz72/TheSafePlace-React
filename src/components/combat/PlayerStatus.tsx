import React from 'react';
import type { PlayerCombatState } from '../../types/combat';

interface PlayerStatusProps {
  playerState: PlayerCombatState;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ playerState }) => {
  const { hp, maxHp, ac, weapon, armor, temporaryBonuses } = playerState;

  const hpPercentage = (hp / maxHp) * 100;
  const hpColor = hpPercentage > 50 ? 'text-green-400' : hpPercentage > 25 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="w-1/2 p-2 border-r border-phosphor-600">
      <h3 className="panel-title">STATO GIOCATORE</h3>
      <div className="space-y-1 text-uniform">
        <div>HP: <span className={hpColor}>{hp} / {maxHp}</span></div>
        <div>AC: <span className="text-cyan-400">{ac}</span></div>
        <div>Arma: <span className="text-phosphor-400">{weapon.name}</span></div>
        <div>Armatura: <span className="text-phosphor-400">{armor?.name || 'Nessuna'}</span></div>
        {temporaryBonuses.map(bonus => (
          <div key={bonus.type}>
            Bonus: <span className="text-yellow-400">Difesa (+{bonus.value} AC)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus;
