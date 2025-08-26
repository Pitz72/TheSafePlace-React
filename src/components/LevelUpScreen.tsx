/**
 * LevelUpScreen.tsx — Schermata avanzamento personaggio
 * Sistema D&D-style per miglioramento statistiche e abilità
 */
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { 
  getAvailableLevelUpOptions, 
  createLevelUpPreview, 
  applyLevelUp,
  updateCharacterSheetAfterLevelUp,
  getAvailablePoints
} from '../rules/levelUpSystem';
import type { ILevelUpOption } from '../interfaces/levelUp';
import { MessageType } from '../data/MessageArchive';

const LevelUpScreen: React.FC = () => {
  const characterSheet = useGameStore(state => state.characterSheet);
  const goBack = useGameStore(state => state.goBack);
  const addLogEntry = useGameStore(state => state.addLogEntry);
  const updateCharacterSheet = useGameStore(state => state.updateCharacterSheet);
  const [selectedOptions, setSelectedOptions] = useState<ILevelUpOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const availableOptions = getAvailableLevelUpOptions(characterSheet);
  const levelUpState = createLevelUpPreview(characterSheet, selectedOptions);
  const totalPoints = getAvailablePoints(characterSheet);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (showConfirmation) {
          setShowConfirmation(false);
        } else {
          goBack(); // Ancora necessario per la logica a due livelli (schermata -> conferma)
        }
        return;
      }

      if (showConfirmation) {
        if (event.key === 'Enter' || event.key.toLowerCase() === 'y') {
          event.preventDefault();
          handleConfirmLevelUp();
        } else if (event.key.toLowerCase() === 'n') {
          event.preventDefault();
          setShowConfirmation(false);
        }
        return;
      }

      // Navigazione opzioni
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(prev => Math.min(availableOptions.length - 1, prev + 1));
      }

      // Selezione/Deselezione opzione
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggleOption(availableOptions[selectedIndex]);
      }

      // Conferma level up
      if (event.key.toLowerCase() === 'l' && levelUpState.canLevelUp) {
        event.preventDefault();
        setShowConfirmation(true);
      }

      // Reset selezioni
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setSelectedOptions([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableOptions, selectedIndex, showConfirmation, levelUpState.canLevelUp, goBack]);

  const handleToggleOption = (option: ILevelUpOption) => {
    const isSelected = selectedOptions.some(opt => opt.id === option.id);
    
    if (isSelected) {
      // Rimuovi opzione
      setSelectedOptions(prev => prev.filter(opt => opt.id !== option.id));
    } else {
      // Aggiungi opzione se ci sono punti sufficienti
      const newTotal = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0) + option.cost;
      if (newTotal <= totalPoints) {
        setSelectedOptions(prev => [...prev, option]);
      }
    }
  };

  const handleConfirmLevelUp = () => {
    const result = applyLevelUp(characterSheet, selectedOptions);
    
    if (result.success) {
      const updatedCharacterSheet = updateCharacterSheetAfterLevelUp(characterSheet, result);
      
      // Aggiorna il character sheet nel GameProvider
      updateCharacterSheet(updatedCharacterSheet);
      
      // Aggiungi messaggi al journal
      addLogEntry(MessageType.LEVEL_UP, { 
        level: result.newLevel,
        statsGained: Object.entries(result.statsGained).map(([stat, value]) => `${stat}: +${value}`).join(', '),
        hpGained: result.hpGained
      });
      
      if (result.abilitiesGained.length > 0) {
        result.abilitiesGained.forEach(ability => {
          addLogEntry(MessageType.ACTION_SUCCESS, { action: `Nuova abilità acquisita: ${ability}` });
        });
      }
      
      goBack();
    } else {
      addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
    }
    
    setShowConfirmation(false);
  };

  const getStatColor = (statName: string): string => {
    const currentValue = characterSheet.stats[statName as keyof typeof characterSheet.stats];
    const previewValue = levelUpState.previewStats[statName as keyof typeof levelUpState.previewStats];
    
    if (previewValue > currentValue) {
      return 'text-green-400'; // Migliorato
    }
    return 'text-phosphor-400'; // Normale
  };

  const isOptionSelected = (option: ILevelUpOption): boolean => {
    return selectedOptions.some(opt => opt.id === option.id);
  };

  const canSelectOption = (option: ILevelUpOption): boolean => {
    if (isOptionSelected(option)) return true;
    const currentCost = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
    return currentCost + option.cost <= totalPoints;
  };

  if (showConfirmation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
        <div className="max-w-4xl w-full bg-gray-900 bg-opacity-80 border border-phosphor-500 p-8 rounded-lg">
          <h2 className="text-4xl font-bold mb-6 text-center text-phosphor-400 glow-phosphor-bright">
            CONFERMA LEVEL UP
          </h2>
          
          <div className="space-y-4 text-xl">
            <p className="text-center text-phosphor-300">
              Sei sicuro di voler applicare questi miglioramenti?
            </p>
            
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded border border-phosphor-600">
              <h3 className="text-phosphor-400 font-bold mb-2">Miglioramenti Selezionati:</h3>
              {selectedOptions.map(option => (
                <div key={option.id} className="text-phosphor-300">
                  • {option.name} (Costo: {option.cost})
                </div>
              ))}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-green-400">Livello: {characterSheet.level} → {characterSheet.level + 1}</p>
              {levelUpState.previewMaxHP > characterSheet.maxHP && (
                <p className="text-green-400">
                  HP Massimi: {characterSheet.maxHP} → {levelUpState.previewMaxHP}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-2xl">
            <p className="text-phosphor-400 mb-4">
              [<span className="text-green-400">Y</span>] Conferma | [<span className="text-red-400">N</span>] Annulla
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
        LEVEL UP
      </h2>
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Colonna Sinistra: Statistiche Attuali */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim">
          <h3 className="text-2xl font-bold mb-4 text-center text-phosphor-400">STATISTICHE ATTUALI</h3>
          
          {/* Progressi XP */}
          <div className="mb-6 p-4 bg-gray-800 bg-opacity-50 border border-phosphor-600 rounded">
            <h4 className="text-phosphor-400 font-bold mb-2">ESPERIENZA</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-phosphor-300">Livello:</span>
                <span className="text-phosphor-400">{characterSheet.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-phosphor-300">XP Attuali:</span>
                <span className="text-phosphor-400">{characterSheet.experience.currentXP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-phosphor-300">XP per Prossimo Livello:</span>
                <span className="text-phosphor-400">{characterSheet.experience.xpForNextLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-phosphor-300">XP Mancanti:</span>
                <span className={characterSheet.experience.canLevelUp ? "text-green-400" : "text-yellow-400"}>
                  {Math.max(0, characterSheet.experience.xpForNextLevel - characterSheet.experience.currentXP)}
                </span>
              </div>
              {characterSheet.experience.canLevelUp && (
                <div className="text-center mt-2">
                  <span className="text-green-400 font-bold animate-pulse">✓ PRONTO PER LEVEL UP!</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2 text-lg">
            <div className="flex justify-between">
              <span>Livello:</span>
              <span className="text-phosphor-400 font-bold">{characterSheet.level}</span>
            </div>
            <div className="flex justify-between">
              <span>HP:</span>
              <span className="text-phosphor-400">{characterSheet.currentHP}/{characterSheet.maxHP}</span>
            </div>
            <div className="border-t border-phosphor-600 pt-2 mt-4">
              <div className="flex justify-between">
                <span>Potenza:</span>
                <span className={getStatColor('potenza')}>{levelUpState.previewStats.potenza}</span>
              </div>
              <div className="flex justify-between">
                <span>Agilità:</span>
                <span className={getStatColor('agilita')}>{levelUpState.previewStats.agilita}</span>
              </div>
              <div className="flex justify-between">
                <span>Vigore:</span>
                <span className={getStatColor('vigore')}>{levelUpState.previewStats.vigore}</span>
              </div>
              <div className="flex justify-between">
                <span>Percezione:</span>
                <span className={getStatColor('percezione')}>{levelUpState.previewStats.percezione}</span>
              </div>
              <div className="flex justify-between">
                <span>Adattamento:</span>
                <span className={getStatColor('adattamento')}>{levelUpState.previewStats.adattamento}</span>
              </div>
              <div className="flex justify-between">
                <span>Carisma:</span>
                <span className={getStatColor('carisma')}>{levelUpState.previewStats.carisma}</span>
              </div>
            </div>
            
            {levelUpState.previewMaxHP > characterSheet.maxHP && (
              <div className="border-t border-phosphor-600 pt-2 mt-4">
                <div className="flex justify-between">
                  <span>HP Massimi:</span>
                  <span className="text-green-400">{characterSheet.maxHP} → {levelUpState.previewMaxHP}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonna Centrale: Opzioni Level Up */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim">
          <h3 className="text-2xl font-bold mb-4 text-center text-phosphor-400">MIGLIORAMENTI</h3>
          <div className="mb-4 text-center">
            <span className="text-phosphor-300">Punti Disponibili: </span>
            <span className="text-green-400 font-bold text-xl">{levelUpState.availablePoints}</span>
            <span className="text-phosphor-700"> / {totalPoints}</span>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableOptions.map((option, index) => {
              const isSelected = isOptionSelected(option);
              const canSelect = canSelectOption(option);
              const isHighlighted = index === selectedIndex;
              
              return (
                <div
                  key={option.id}
                  className={`p-3 rounded border transition-all duration-200 ${
                    isHighlighted
                      ? 'border-phosphor-400 bg-phosphor-400 bg-opacity-20 glow-phosphor-primary'
                      : isSelected
                        ? 'border-green-400 bg-green-400 bg-opacity-10'
                        : canSelect
                          ? 'border-phosphor-600 hover:border-phosphor-500'
                          : 'border-gray-600 opacity-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${
                      isSelected ? 'text-green-400' : 
                      canSelect ? 'text-phosphor-300' : 'text-gray-500'
                    }`}>
                      {isSelected ? '✓ ' : ''}{option.name}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      isSelected ? 'bg-green-400 text-black' :
                      canSelect ? 'bg-phosphor-600 text-phosphor-200' : 'bg-gray-600 text-gray-400'
                    }`}>
                      {option.cost} pt
                    </span>
                  </div>
                  <p className={`text-sm ${
                    canSelect ? 'text-phosphor-400' : 'text-gray-500'
                  }`}>
                    {option.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonna Destra: Selezioni e Comandi */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim">
          <h3 className="text-2xl font-bold mb-4 text-center text-phosphor-400">SELEZIONI</h3>
          
          {selectedOptions.length > 0 ? (
            <div className="space-y-2 mb-6">
              {selectedOptions.map(option => (
                <div key={option.id} className="bg-green-400 bg-opacity-10 border border-green-400 p-2 rounded">
                  <div className="flex justify-between">
                    <span className="text-green-400 font-bold">{option.name}</span>
                    <span className="text-green-300">{option.cost} pt</span>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-phosphor-600 pt-2 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Totale:</span>
                  <span className="text-green-400">
                    {selectedOptions.reduce((sum, opt) => sum + opt.cost, 0)} pt
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-phosphor-600 mb-6 italic">
              Nessun miglioramento selezionato
            </div>
          )}
          
          <div className="space-y-4">
            {levelUpState.canLevelUp && (
              <button
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded border-2 border-green-400 glow-green transition-colors"
                onClick={() => setShowConfirmation(true)}
              >
                [L] LEVEL UP!
              </button>
            )}
            
            <button
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded border border-gray-400 transition-colors"
              onClick={() => setSelectedOptions([])}
              disabled={selectedOptions.length === 0}
            >
              [R] Reset Selezioni
            </button>
          </div>
        </div>
      </div>

      <div className="text-2xl text-phosphor-400 font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-pulse text-center">
        <div>[↑↓] Naviga | [ENTER/SPAZIO] Seleziona | [L] Level Up | [R] Reset | [ESC] Esci</div>
      </div>
    </div>
  );
};

export default LevelUpScreen;