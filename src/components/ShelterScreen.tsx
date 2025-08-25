/**
 * ShelterScreen.tsx — Schermata rifugio
 * Gestisce le interazioni nei rifugi durante il giorno
 */
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { MessageType } from '../data/MessageArchive';
import type { AbilityCheckResult } from '../interfaces/gameState';

const ShelterScreen: React.FC = () => {
  const { goBack, addLogEntry, performAbilityCheck, updateHP, advanceTime, items, addItem } = useGameContext();
  const [selectedOption, setSelectedOption] = useState(0);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const options = [
    { id: 'rest', name: 'Riposare (2-3 ore)', description: 'Recupera alcuni HP riposando nel rifugio' },
    { id: 'search', name: 'Investigare il rifugio', description: 'Cerca oggetti utili o indizi' },
    { id: 'workbench', name: 'Usare il banco di lavoro', description: 'Crafting e riparazioni (placeholder)' },
    { id: 'leave', name: 'Lasciare il rifugio', description: 'Torna alla mappa' }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        goBack();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedOption(prev => Math.max(0, prev - 1));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedOption(prev => Math.min(options.length - 1, prev + 1));
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleOptionSelect(options[selectedOption].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, goBack]);

  const handleOptionSelect = (optionId: string) => {
    switch (optionId) {
      case 'rest':
        handleRest();
        break;
      case 'search':
        handleSearch();
        break;
      case 'workbench':
        handleWorkbench();
        break;
      case 'leave':
        goBack();
        break;
    }
  };

  const handleRest = () => {
    const restTime = Math.floor(Math.random() * 60) + 120; // 120-180 minuti
    const healingAmount = Math.floor(Math.random() * 5) + 3; // 3-7 HP
    
    updateHP(healingAmount);
    advanceTime(restTime);
    addLogEntry(MessageType.REST_SUCCESS, { 
      healingAmount, 
      location: 'rifugio',
      time: Math.floor(restTime / 60)
    });
    
    goBack();
  };

  const handleSearch = () => {
    if (searchResult) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'hai già investigato questo rifugio' });
      return;
    }

    const checkResult = performAbilityCheck('percezione', 15, false);
    const checkDetails = `Prova di Percezione (CD ${checkResult.difficulty}): ${checkResult.roll} + ${checkResult.modifier} = ${checkResult.total}.`;
    
    let outcomeMessage: string;

    if (checkResult.success) {
      outcomeMessage = `${checkDetails} SUCCESSO.\n`;
      const findChance = Math.random();
      if (findChance < 0.4) {
        const lootTables = {
          consumables: ['CONS_001', 'CONS_002', 'CONS_003'],
          crafting: ['CRAFT_001', 'CRAFT_002'],
          weapons: ['WEAP_001'],
          armor: ['ARM_001'],
          medical: ['CONS_003']
        };
        const categoryRoll = Math.random();
        let category: keyof typeof lootTables;
        if (categoryRoll < 0.4) category = 'consumables';
        else if (categoryRoll < 0.6) category = 'crafting';
        else if (categoryRoll < 0.75) category = 'weapons';
        else if (categoryRoll < 0.9) category = 'armor';
        else category = 'medical';
        
        const categoryItems = lootTables[category];
        const foundItemId = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        const foundItem = items[foundItemId];
        
        if (foundItem) {
          const quantity = foundItem.stackable ? (Math.floor(Math.random() * 2) + 1) : 1;
          const added = addItem(foundItemId, quantity);
          if (added) {
            outcomeMessage += `La tua attenzione viene ripagata. Trovi: ${foundItem.name}${quantity > 1 ? ` x${quantity}` : ''}`;
          } else {
            outcomeMessage += `Trovi ${foundItem.name}, ma il tuo inventario è pieno!`;
          }
        } else {
          outcomeMessage += 'Trovi qualcosa di interessante, ma non riesci a identificarlo.';
        }
      } else if (findChance < 0.7) {
        outcomeMessage += 'Il rifugio è già stato saccheggiato, ma sembra sicuro.';
      } else {
        outcomeMessage += 'Dopo un\'attenta ricerca, non trovi nulla di utile. Solo polvere e detriti.';
      }
      addLogEntry(MessageType.SKILL_CHECK_SUCCESS, { action: 'investigazione rifugio' });
    } else {
      outcomeMessage = `${checkDetails} FALLIMENTO.\nLa tua ricerca è stata frettolosa e superficiale.`;
      addLogEntry(MessageType.SKILL_CHECK_FAILURE, { ability: 'percezione', action: 'investigazione rifugio' });
    }
    setSearchResult(outcomeMessage);
  };

  const handleWorkbench = () => {
    addLogEntry(MessageType.ACTION_SUCCESS, { 
      action: 'esamini il banco di lavoro - funzionalità in sviluppo' 
    });
    setSearchResult('Il banco di lavoro sembra funzionante, ma non hai ancora le competenze per usarlo.');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
        RIFUGIO SICURO
      </h2>
      
      <div className="w-full max-w-4xl bg-gray-900 bg-opacity-80 border border-phosphor-500 p-8 rounded-lg glow-phosphor-dim">
        <div className="mb-6 text-center text-phosphor-300">
          <p>Hai trovato un rifugio abbandonato. Le pareti offrono protezione dal mondo esterno.</p>
          <p className="mt-2 text-phosphor-700">Cosa vuoi fare?</p>
        </div>

        <div className="space-y-3 mb-6">
          {options.map((option, index) => (
            <div
              key={option.id}
              className={`p-4 rounded border transition-all duration-200 ${
                index === selectedOption
                  ? 'border-phosphor-400 bg-phosphor-400 bg-opacity-20 glow-phosphor-primary'
                  : 'border-phosphor-600 hover:border-phosphor-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-bold ${
                  index === selectedOption ? 'text-phosphor-200' : 'text-phosphor-400'
                }`}>
                  {index === selectedOption ? '► ' : '  '}{option.name}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                index === selectedOption ? 'text-phosphor-300' : 'text-phosphor-600'
              }`}>
                {option.description}
              </p>
            </div>
          ))}
        </div>

        {searchResult && (
          <div className="mb-6 p-4 bg-gray-800 bg-opacity-50 border border-phosphor-600 rounded">
            <h3 className="text-phosphor-400 font-bold mb-2">Risultato Investigazione:</h3>
            <p className="text-phosphor-300">{searchResult}</p>
          </div>
        )}

        <div className="text-center text-phosphor-400 font-mono">
          <p>[↑↓] Naviga | [ENTER] Seleziona | [ESC] Esci</p>
        </div>
      </div>
    </div>
  );
};

export default ShelterScreen;