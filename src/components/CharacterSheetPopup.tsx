import React from 'react';
import BasePopup from './BasePopup';
import { useGameContext } from '../hooks/useGameContext';

interface CharacterSheetPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CharacterSheetPopup: React.FC<CharacterSheetPopupProps> = ({ isOpen, onClose }) => {
  const { characterSheet, getModifier } = useGameContext();

  if (!characterSheet) {
    return (
      <BasePopup isOpen={isOpen} onClose={onClose} title="CHARACTER SHEET">
        <div className="text-center text-phosphor-danger">
          Errore: Character Sheet non disponibile
        </div>
      </BasePopup>
    );
  }

  // Calcolo statistiche derivate
  const armorClass = 10 + getModifier('agilita');
  const carryCapacity = characterSheet.stats.potenza * 10; // kg

  return (
    <BasePopup 
      isOpen={isOpen} 
      onClose={onClose} 
      title="SCHEDA PERSONAGGIO"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonna Sinistra - Statistiche Primarie */}
        <div className="space-y-6">
          <div className="border border-phosphor-primary p-5 bg-gray-800 bg-opacity-90 glow-phosphor-dim animate-pulse">
            <h3 className="text-phosphor-bright font-bold mb-4 text-center text-3xl font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
               ┌─ STATISTICHE PRIMARIE ─┐
             </h3>
             <div className="space-y-4 font-mono text-xl tracking-wider">
              <div className="flex justify-between">
                <span>Potenza:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {characterSheet.stats.potenza} ({getModifier('potenza') >= 0 ? '+' : ''}{getModifier('potenza')})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Agilità:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {characterSheet.stats.agilita} ({getModifier('agilita') >= 0 ? '+' : ''}{getModifier('agilita')})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vigore:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {characterSheet.stats.vigore} ({getModifier('vigore') >= 0 ? '+' : ''}{getModifier('vigore')})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Percezione:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {characterSheet.stats.percezione} ({getModifier('percezione') >= 0 ? '+' : ''}{getModifier('percezione')})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Adattamento:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {characterSheet.stats.adattamento} ({getModifier('adattamento') >= 0 ? '+' : ''}{getModifier('adattamento')})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Carisma:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {characterSheet.stats.carisma} ({getModifier('carisma') >= 0 ? '+' : ''}{getModifier('carisma')})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonna Destra - Statistiche Derivate */}
        <div className="space-y-6">
          <div className="border border-phosphor-primary p-5 bg-gray-800 bg-opacity-90 glow-phosphor-dim animate-pulse">
            <h3 className="text-phosphor-bright font-bold mb-4 text-center text-3xl font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
               ┌─ STATISTICHE DERIVATE ─┐
             </h3>
             <div className="space-y-4 font-mono text-xl tracking-wider">
              <div className="flex justify-between">
                <span>Punti Vita:</span>
                <span className={`font-bold text-2xl ${
                   characterSheet.currentHP === 0 ? 'text-phosphor-danger' :
                   characterSheet.currentHP < characterSheet.maxHP * 0.25 ? 'text-phosphor-danger' :
                   characterSheet.currentHP < characterSheet.maxHP * 0.5 ? 'text-phosphor-warning' :
                   'text-phosphor-bright'
                 }`}>
                  {characterSheet.currentHP}/{characterSheet.maxHP}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Classe Armatura:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {armorClass}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Capacità Carico:</span>
                <span className="text-phosphor-bright font-bold glow-phosphor-primary text-shadow-phosphor-bright animate-pulse">
                  {carryCapacity} kg
                </span>
              </div>
            </div>
          </div>

          {/* Informazioni Personaggio */}
          <div className="border border-phosphor-primary p-5 bg-gray-800 bg-opacity-90 glow-phosphor-dim animate-pulse">
            <h3 className="text-phosphor-bright font-bold mb-4 text-center text-3xl font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
               ┌─ INFORMAZIONI PERSONAGGIO ─┐
             </h3>
             <div className="space-y-4 font-mono text-xl tracking-wider text-center">
              <div>
                <span className="text-phosphor-highlight font-bold text-3xl glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
                   {characterSheet.name}
                 </span>
               </div>
               <div className="text-phosphor-dim text-xl font-mono tracking-wider glow-phosphor-dim animate-pulse">
                Sopravvissuto delle Terre Desolate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con comandi aggiuntivi */}
      <div className="mt-8 border-t border-phosphor-primary pt-6 bg-gray-800 bg-opacity-50 glow-phosphor-dim animate-pulse">
        <div className="text-center text-2xl text-phosphor-bright space-y-4">
           <div className="font-bold font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">[ESC] Chiudi | [TAB] Toggle Scheda Personaggio</div>
           <div className="text-xl text-phosphor-dim font-mono tracking-wider glow-phosphor-dim animate-pulse">
            Sistema D&D - Modificatori calcolati automaticamente
          </div>
        </div>
      </div>
    </BasePopup>
  );
};

export default CharacterSheetPopup;