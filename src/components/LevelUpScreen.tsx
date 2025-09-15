import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useNotificationStore } from '../stores/notifications/notificationStore';
import { getAvailableLevelUpOptions, applyLevelUpOption } from '../rules/levelUpSystem';
import type { ICharacterStats } from '../rules/types';
import { MessageType } from '../data/MessageArchive';

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
 */

const LevelUpScreen: React.FC = () => {
  // SELETTORI GRANULARI: la soluzione robusta
  const { characterSheet, updateCharacterSheet } = useCharacterStore();
  const { goBack } = useGameStore();
  const { addLogEntry } = useNotificationStore();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const availableOptions = useMemo(() => getAvailableLevelUpOptions(characterSheet), [characterSheet]);
  
  const highlightedOption = availableOptions[selectedIndex];

  const previewStats = useMemo(() => {
    if (!highlightedOption) return characterSheet.stats;
    const newStats = { ...characterSheet.stats };
    if (highlightedOption.effects.stats) {
        Object.entries(highlightedOption.effects.stats).forEach(([stat, value]) => {
            newStats[stat as keyof ICharacterStats] += value;
        });
    }
    return newStats;
  }, [characterSheet.stats, highlightedOption]);

  const previewMaxHP = useMemo(() => {
    if (!highlightedOption || !highlightedOption.effects.maxHP) {
      return characterSheet.maxHP;
    }
    return characterSheet.maxHP + highlightedOption.effects.maxHP;
  }, [characterSheet.maxHP, highlightedOption]);

  const handleConfirmChoice = useCallback(() => {
    if (!highlightedOption) return;
    const updatedCharacterSheet = applyLevelUpOption(characterSheet, highlightedOption);
    updateCharacterSheet(updatedCharacterSheet);
    addLogEntry(MessageType.LEVEL_UP, { 
        level: updatedCharacterSheet.level,
        text: `Hai scelto di ${highlightedOption.name.toLowerCase()}.`
    });
    goBack();
  }, [characterSheet, highlightedOption, updateCharacterSheet, addLogEntry, goBack]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'escape') {
        event.preventDefault();
        goBack();
        return;
      }
      if (!characterSheet.experience.canLevelUp) return;
      switch (key) {
        case 'w':
        case 'arrowup':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 's':
        case 'arrowdown':
          event.preventDefault();
          setSelectedIndex(prev => Math.min(availableOptions.length - 1, prev + 1));
          break;
        case 'enter':
          event.preventDefault();
          handleConfirmChoice();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, availableOptions, goBack, characterSheet.experience.canLevelUp, handleConfirmChoice]);
  
  const getStatColor = (statName: keyof ICharacterStats): string => {
    if (previewStats[statName] > characterSheet.stats[statName]) {
      return 'text-green-400 glow-phosphor-bright';
    }
    return 'text-phosphor-400';
  };

  if (!characterSheet.experience.canLevelUp) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
            <h2 className="text-5xl font-bold mb-8">LEVEL UP</h2>
            <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 w-full max-w-4xl text-center">
                <h3 className="text-2xl font-bold mb-4 text-phosphor-400">PROGRESSO</h3>
                <p className="text-xl">LIVELLO ATTUALE: {characterSheet.level}</p>
                <p className="text-xl">ESPERIENZA: {characterSheet.experience.currentXP} / {characterSheet.experience.xpForNextLevel}</p>
                <p className="text-xl mt-4">Continua a esplorare per diventare più forte.</p>
                <button onClick={goBack} className="mt-8 bg-gray-700 p-2 text-xl">[ESC] Torna al Gioco</button>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-black text-phosphor-500 font-mono">
        <h2 className="text-5xl font-bold mb-4">SCEGLI UN MIGLIORAMENTO</h2>
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
                <h3 className="text-2xl font-bold mb-4 text-center text-phosphor-400">STATO ATTUALE</h3>
                <div className="space-y-2 text-xl">
                    {(Object.keys(characterSheet.stats) as Array<keyof ICharacterStats>).map(stat => (
                        <div key={stat} className="flex justify-between">
                            <span className="capitalize">{stat}:</span>
                            <span>{characterSheet.stats[stat]}</span>
                        </div>
                    ))}
                    <div className="flex justify-between border-t border-phosphor-700 mt-2 pt-2">
                        <span>HP Massimi:</span>
                        <span>{characterSheet.maxHP}</span>
                    </div>
                </div>
            </div>
            <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
                <h3 className="text-2xl font-bold mb-4 text-center text-phosphor-400">OPZIONI</h3>
                <div className="space-y-2">
                    {availableOptions.map((option, index) => (
                        <div key={option.id} className={`p-3 text-xl transition-all duration-150 ${selectedIndex === index ? 'bg-phosphor-400 text-black font-bold' : 'bg-gray-800'}`}>
                            {option.name}
                        </div>
                    ))}
                </div>
            </div>
            <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
                <h3 className="text-2xl font-bold mb-4 text-center text-phosphor-400">ANTEPRIMA</h3>
                {highlightedOption ? (
                    <div>
                        <p className="text-lg mb-4">{highlightedOption.description}</p>
                        <div className="space-y-2 text-xl">
                            {(Object.keys(previewStats) as Array<keyof ICharacterStats>).map(stat => (
                                <div key={stat} className="flex justify-between">
                                    <span className="capitalize">{stat}:</span>
                                    <span className={getStatColor(stat)}>
                                        {characterSheet.stats[stat]} → {previewStats[stat]}
                                    </span>
                                </div>
                            ))}
                            {previewMaxHP > characterSheet.maxHP && (
                                <div className="flex justify-between border-t border-phosphor-700 mt-2 pt-2">
                                    <span>HP Massimi:</span>
                                    <span className="text-green-400 glow-phosphor-bright">
                                        {characterSheet.maxHP} → {previewMaxHP}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : <p>Nessuna opzione disponibile.</p>}
            </div>
        </div>
        <div className="mt-4 text-2xl">[↑↓/WS] Naviga | [Enter] Conferma | [ESC] Annulla</div>
    </div>
  );
};

export default LevelUpScreen;