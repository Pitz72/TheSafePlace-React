/**
 * CharacterSheetScreen.tsx — Scheda personaggio (UI stabile)
 * Linee guida dimensioni (v0.3.2 "Size Matters"):
 * - H2 titolo: text-5xl; H3 sezioni: text-3xl; Valori: text-2xl
 * - Mantieni contrasto e glow per valori chiave (HP, CA, Peso)
 * - Layout 2 colonne: non comprimere sotto max-w-6xl senza test leggibilità
 * - Interazione: [ESC]/[TAB] per uscire — invarianti
 */
import React, { useEffect } from 'react';
import { useGameContext } from '../hooks/useGameContext';

const CharacterSheetScreen: React.FC = () => {
  const { characterSheet, getModifier, goBack } = useGameContext();

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
      <div className="h-full flex items-center justify-center bg-black text-phosphor-danger">
        Errore: Scheda personaggio non disponibile.
      </div>
    );
  }

  // Tipi sicuri per le chiavi delle statistiche
  const statKeys = Object.keys(characterSheet.stats) as Array<keyof typeof characterSheet.stats>;

  const armorClass = 10 + getModifier('agilita' as keyof typeof characterSheet.stats);
  const carryCapacity = characterSheet.stats.potenza * 10;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-primary font-mono">
      <h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
        SCHEDA PERSONAGGIO
      </h2>
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Colonna Sinistra */}
        <div className="space-y-6">
          <div className="border border-phosphor-primary p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim animate-pulse">
            <h3 className="text-phosphor-bright font-bold mb-4 text-center text-3xl tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
              STATISTICHE PRIMARIE
            </h3>
            <div className="space-y-4 text-2xl tracking-wider">
              {statKeys.map((stat) => (
                <div key={stat as string} className="flex justify-between">
                  <span className="capitalize">{stat}:</span>
                  <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                    {characterSheet.stats[stat]} ({getModifier(stat) >= 0 ? '+' : ''}{getModifier(stat)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonna Destra */}
        <div className="space-y-6">
          <div className="border border-phosphor-primary p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim animate-pulse">
            <h3 className="text-phosphor-bright font-bold mb-4 text-center text-3xl tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
              STATISTICHE DERIVATE
            </h3>
            <div className="space-y-4 text-2xl tracking-wider">
              <div className="flex justify-between">
                <span>Punti Vita:</span>
                <span className={`${characterSheet.currentHP < characterSheet.maxHP * 0.25 ? 'text-phosphor-danger' : 'text-phosphor-bright'} font-bold`}>
                  {characterSheet.currentHP}/{characterSheet.maxHP}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Classe Armatura:</span>
                <span className="text-phosphor-bright font-bold">{armorClass}</span>
              </div>
              <div className="flex justify-between">
                <span>Capacità Carico:</span>
                <span className="text-phosphor-bright font-bold">{carryCapacity} kg</span>
              </div>
            </div>
          </div>
          <div className="border border-phosphor-primary p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim animate-pulse">
            <h3 className="text-phosphor-bright font-bold mb-4 text-center text-3xl tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
              INFORMAZIONI
            </h3>
            <div className="text-center">
              <div className="text-4xl text-phosphor-highlight font-bold glow-phosphor-bright text-shadow-phosphor-bright animate-glow">{characterSheet.name}</div>
              <div className="text-2xl text-phosphor-dim">Sopravvissuto delle Terre Desolate</div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-2xl text-phosphor-bright font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-pulse">
        [ESC] o [TAB] per tornare al gioco
      </div>
    </div>
  );
};

export default CharacterSheetScreen;
