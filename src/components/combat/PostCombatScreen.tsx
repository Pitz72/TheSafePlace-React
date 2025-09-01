/**
 * PostCombatScreen.tsx
 *
 * Schermata mostrata alla fine di un combattimento.
 * Visualizza il risultato (vittoria/sconfitta), XP guadagnati e loot ottenuto.
 */
import React from 'react';
import type { CombatResult, LootItem } from '../../types/combat';

interface PostCombatScreenProps {
  result: CombatResult;
  xpGained: number;
  loot: LootItem[];
  onContinue: () => void;
  onLoadGame: () => void;
  onMainMenu: () => void;
}

export const PostCombatScreen: React.FC<PostCombatScreenProps> = ({
  result,
  xpGained,
  loot,
  onContinue,
  onLoadGame,
  onMainMenu,
}) => {
  const isVictory = result.type === 'victory';

  const title = isVictory ? 'VITTORIA' : 'SCONFITTA';
  const titleColor = isVictory ? 'text-green-400' : 'text-red-500';
  const description = isVictory
    ? 'Hai sconfitto tutti i nemici.'
    : 'Sei stato sopraffatto e hai perso conoscenza.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center font-mono z-50">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg shadow-lg p-8 w-full max-w-lg text-center">
        <h1 className={`text-4xl font-bold mb-4 ${titleColor}`}>{title}</h1>
        <p className="text-lg text-gray-300 mb-6">{description}</p>

        {isVictory && (
          <div className="text-left mb-6 bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold text-yellow-400 mb-3">Ricompense</h2>
            <div className="space-y-2">
              <p className="text-green-300">
                <span className="font-bold">Esperienza Guadagnata:</span> {xpGained} XP
              </p>
              <div>
                <h3 className="font-bold text-green-300">Oggetti Recuperati:</h3>
                {loot.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 text-gray-400">
                    {loot.map((item, index) => (
                      <li key={index}>
                        {item.name} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 ml-4">Nessun oggetto recuperato.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          {isVictory ? (
            <button
              onClick={onContinue}
              className="w-full p-3 text-lg bg-blue-600 hover:bg-blue-500 transition-colors duration-200 rounded"
            >
              Continua
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={onLoadGame}
                className="w-full p-3 text-lg bg-gray-600 hover:bg-gray-500 transition-colors duration-200 rounded"
              >
                Carica Ultimo Salvataggio
              </button>
              <button
                onClick={onMainMenu}
                className="w-full p-3 text-lg bg-red-800 hover:bg-red-700 transition-colors duration-200 rounded"
              >
                Torna al Menu Principale
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCombatScreen;
