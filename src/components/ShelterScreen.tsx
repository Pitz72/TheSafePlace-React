/**
 * ShelterScreen.tsx — Schermata rifugio
 * Gestisce le interazioni nei rifugi durante il giorno
 */
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/world/worldStore';
import { useNotificationStore } from '../stores/notifications/notificationStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useInventoryStore } from '../stores/inventory/inventoryStore';
import { MessageType } from '../data/MessageArchive';


const ShelterScreen: React.FC = () => {
  const { setCurrentScreen, playerPosition, canInvestigateShelter, updateShelterAccess, getShelterInfo, advanceTime } = useGameStore();
  const { addLogEntry } = useNotificationStore();
  const { performAbilityCheck, updateHP } = useCharacterStore();
  const { addItem, items } = useInventoryStore();
  const [selectedOption, setSelectedOption] = useState(0);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // Controlla se c'è già un risultato di investigazione salvato
  useEffect(() => {
    const { x, y } = playerPosition;
    const shelterInfo = getShelterInfo(x, y);
    if (shelterInfo && shelterInfo.hasBeenInvestigated && shelterInfo.investigationResults && shelterInfo.investigationResults.length > 0) {
      setSearchResult(shelterInfo.investigationResults[0]);
    }
  }, [playerPosition, getShelterInfo]);

  const options = [
    { id: 'rest', name: 'Riposare (2-3 ore)', description: 'Recupera alcuni HP riposando nel rifugio' },
    { id: 'search', name: 'Investigare il rifugio', description: 'Cerca oggetti utili o indizi' },
    { id: 'workbench', name: '[B]anco di Lavoro', description: 'Crea e migliora oggetti usando i materiali raccolti' },
    { id: 'leave', name: 'Lasciare il rifugio', description: 'Torna alla mappa' }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const key = event.key.toLowerCase();
      
      // Gestione ESC standardizzata - torna alla mappa di gioco
      if (key === 'escape' || key === 'b' || key === 'backspace') {
        event.preventDefault();
        setCurrentScreen('game');
        return;
      }

      // Navigazione con frecce e WASD
      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        setSelectedOption(prev => Math.max(0, prev - 1));
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        setSelectedOption(prev => Math.min(options.length - 1, prev + 1));
      }

      // Selezione con ENTER
      if (key === 'enter') {
        event.preventDefault();
        handleOptionSelect(options[selectedOption].id);
      }

      // Scorciatoie dirette per azioni
      switch (key) {
        case 'r':
          event.preventDefault();
          handleRest();
          break;
        case 'i':
          event.preventDefault();
          handleSearch();
          break;
        case 'b':
          event.preventDefault();
          handleWorkbench();
          break;
        case 'l':
          event.preventDefault();
          setCurrentScreen('game');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, setCurrentScreen]);

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
        setCurrentScreen('game');
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

    setCurrentScreen('game');
  };

  const handleSearch = () => {
    const { x, y } = playerPosition;

    // Controlla se l'investigazione è già stata fatta in questa sessione
    if (!canInvestigateShelter(x, y)) {
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'hai già investigato questo rifugio in questa sessione di gioco'
      });
      setSearchResult('Hai già perquisito accuratamente questo rifugio durante questa sessione di gioco. Torna in un\'altra sessione per investigare di nuovo.');
      return;
    }

    // ANTI-EXPLOIT: Se c'è già un risultato mostrato, non permettere nuove investigazioni
    if (searchResult) {
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'investigazione già completata'
      });
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
          crafting: ['CRAFT_001'],
          weapons: ['WEAP_001'],
          armor: ['ARMOR_001'],
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

    // Marca l'investigazione come completata per questa sessione
    updateShelterAccess(x, y, {
      hasBeenInvestigated: true,
      investigationResults: [outcomeMessage]
    });

    setSearchResult(outcomeMessage);
  };

  const handleWorkbench = () => {
    // Verifica se il crafting è disponibile (solo nei rifugi)
    // Usa direttamente il worldStore per evitare problemi di sincronizzazione
    const worldStore = useWorldStore.getState();
    const { x, y } = worldStore.playerPosition;
    const currentTile = worldStore.mapData[y]?.[x];
    
    // DEBUG: Aggiungi logging per investigare il problema
    console.log('[WORKBENCH DEBUG] Player position from worldStore:', { x, y });
    console.log('[WORKBENCH DEBUG] Current tile:', currentTile);
    console.log('[WORKBENCH DEBUG] Map data at position:', worldStore.mapData[y]);
    console.log('[WORKBENCH DEBUG] Full map data length:', worldStore.mapData.length);
    
    // Verifica che la mappa sia caricata e la posizione sia valida
    if (!worldStore.mapData || worldStore.mapData.length === 0) {
      console.log('[WORKBENCH DEBUG] Map data not loaded');
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'mappa non caricata correttamente'
      });
      return;
    }
    
    if (x === -1 || y === -1) {
      console.log('[WORKBENCH DEBUG] Invalid player position');
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'posizione del giocatore non valida'
      });
      return;
    }
    
    if (currentTile !== 'R') {
      console.log('[WORKBENCH DEBUG] Tile verification failed - expected R, got:', currentTile);
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'il banco di lavoro è disponibile solo nei rifugi sicuri'
      });
      return;
    }
    
    console.log('[WORKBENCH DEBUG] Tile verification passed - opening crafting screen');
    
    // Apri la schermata di crafting
    setCurrentScreen('crafting');
    
    addLogEntry(MessageType.ACTION_SUCCESS, {
      action: 'ti avvicini al banco di lavoro'
    });
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
              className={`p-4 rounded border transition-all duration-200 ${index === selectedOption
                ? 'border-phosphor-400 bg-phosphor-400 bg-opacity-20 glow-phosphor-primary'
                : 'border-phosphor-600'
                }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-bold ${index === selectedOption ? 'text-phosphor-200' : 'text-phosphor-400'
                  }`}>
                  {index === selectedOption ? '► ' : '  '}{option.name}
                </span>
              </div>
              <p className={`text-sm mt-1 ${index === selectedOption ? 'text-phosphor-300' : 'text-phosphor-600'
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
          <p>[↑↓/W/S] Naviga | [ENTER] Seleziona | [ESC/B] Esci</p>
          <p className="text-sm text-phosphor-600 mt-1">
            Scorciatoie: [R]iposa | [I]nvestiga | [B]anco | [L]ascia
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShelterScreen;