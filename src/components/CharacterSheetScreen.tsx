import React, { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useItemStore } from '../stores/item/itemStore'; // <-- Cambiato

/**
 * ⚠️ AVVISO CRITICO DI IMMUTABILITÀ ⚠️
 * 
 * Questo componente è DEFINITIVO e IMMUTABILE.
 * 
 * NON PUÒ ESSERE MODIFICATO per nessuna ragione se non tramite
 * ESPLICITA E SCRITTA AUTORIZZAZIONE dell'operatore umano.
 * 
 * Qualsiasi tentativo di modifica non autorizzata costituisce
 * violazione del patto di cooperazione e compromette l'integrità
 * architettonica del sistema.
 *
 * Refactoring autorizzato in data 2025-10-01 per rimuovere dipendenza circolare.
 */

const CharacterSheetScreen: React.FC = () => {
  const { characterSheet, getModifier } = useCharacterStore();
  const { items } = useItemStore(); // <-- Cambiato
  const { goBack } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Tab') {
        event.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack]);

  if (!characterSheet) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-red-400">
        Errore: Scheda personaggio non disponibile.
      </div>
    );
  }

  const statKeys = Object.keys(characterSheet.stats) as Array<keyof typeof characterSheet.stats>;
  const armorClass = 10 + getModifier('agilita');
  const carryCapacity = characterSheet.stats.potenza * 10;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright">SCHEDA PERSONAGGIO</h2>
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
            <h3 className="text-phosphor-400 font-bold mb-4 text-center text-3xl tracking-wider">STATISTICHE PRIMARIE</h3>
            <div className="space-y-4 text-2xl tracking-wider">
              {statKeys.map((stat) => (
                <div key={stat as string} className="flex justify-between">
                  <span className="capitalize">{stat}:</span>
                  <span className="text-phosphor-400 font-bold">
                    {characterSheet.stats[stat]} ({getModifier(stat) >= 0 ? '+' : ''}{getModifier(stat)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
            <h3 className="text-phosphor-400 font-bold mb-4 text-center text-3xl tracking-wider">STATISTICHE DERIVATE</h3>
            <div className="space-y-4 text-2xl tracking-wider">
              <div className="flex justify-between">
                <span>Punti Vita:</span>
                <span className={`${characterSheet.currentHP < characterSheet.maxHP * 0.25 ? 'text-red-400' : 'text-phosphor-400'} font-bold`}>
                  {characterSheet.currentHP}/{characterSheet.maxHP}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Classe Armatura:</span>
                <span className="text-phosphor-400 font-bold">{armorClass}</span>
              </div>
              <div className="flex justify-between">
                <span>Capacità Carico:</span>
                <span className="text-phosphor-400 font-bold">{carryCapacity} kg</span>
              </div>
            </div>
          </div>
          <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
            <h3 className="text-phosphor-400 font-bold mb-4 text-center text-3xl tracking-wider">EQUIPAGGIAMENTO</h3>
            <div className="space-y-3 text-2xl">
              <div className="flex justify-between">
                <span>Arma:</span>
                <span className="text-phosphor-400 font-bold">
                  {characterSheet.equipment.weapon.itemId && items[characterSheet.equipment.weapon.itemId]
                    ? items[characterSheet.equipment.weapon.itemId].name
                    : 'Nessuna'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Armatura:</span>
                <span className="text-phosphor-400 font-bold">
                  {characterSheet.equipment.armor.itemId && items[characterSheet.equipment.armor.itemId]
                    ? items[characterSheet.equipment.armor.itemId].name
                    : 'Nessuna'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-2xl text-phosphor-400 font-mono tracking-wider">
        [ESC] o [TAB] per tornare al gioco
      </div>
    </div>
  );
};

export default CharacterSheetScreen;