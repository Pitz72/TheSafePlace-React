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
import { useEventStore } from '../stores/events/eventStore';
import { useNarrativeStore } from '../stores/narrative/narrativeStore';
import { MessageType } from '../data/MessageArchive';


const ShelterScreen: React.FC = () => {
  const { setCurrentScreen, playerPosition, advanceTime } = useGameStore();
  const { addLogEntry } = useNotificationStore();
  const { performAbilityCheck, updateHP } = useCharacterStore();
  const { getInventory } = useInventoryStore();
  const { triggerEvent } = useEventStore();
  const [selectedOption, setSelectedOption] = useState(0);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // TODO: Implementare sistema di investigazione rifugi persistente
  // Per ora, l'investigazione è temporanea per sessione

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
    // Controllo condizioni per l'evento "La Ninnananna della Cenere"
    if (checkAshLullabyConditions()) {
      triggerAshLullabyEvent();
      return;
    }

    // Riposo normale se le condizioni non sono soddisfatte
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

  const checkAshLullabyConditions = (): boolean => {
    // 1. Il giocatore deve possedere il "Carillon Annerito"
    const inventory = getInventory();
    const hasMusicBox = inventory.some(slot => slot?.itemId === 'quest_music_box');
    if (!hasMusicBox) return false;

    // 2. Deve essere allo Stage 10 ("L'Eco di una Scelta") della quest principale
    const narrativeState = useNarrativeStore.getState();
    if (narrativeState.currentStage !== 10) {
      return false;
    }

    // 3. Il rifugio deve essere nella metà più a est della mappa
    const worldState = useWorldStore.getState();
    const mapWidth = worldState.mapData[0]?.length || 0;
    const eastThreshold = Math.floor(mapWidth * 0.5); // Metà est della mappa
    if (playerPosition.x < eastThreshold) return false;

    // 4. L'evento deve essere unico (non già vissuto)
    const eventState = useEventStore.getState();
    if (eventState.isEncounterCompleted('lore_ash_lullaby')) return false;

    console.log('🎭 Condizioni soddisfatte per "La Ninnananna della Cenere"');
    return true;
  };

  const triggerAshLullabyEvent = () => {
    // Trigger dell'evento lore
    const loreEvent = {
      id: 'lore_ash_lullaby',
      title: 'Un Suono nel Silenzio',
      description: 'La stanchezza ti pesa sulle ossa come un macigno. Qui, nel silenzio di questo rifugio, il mondo là fuori sembra lontano. Dalla tasca interna, le tue dita sfiorano il metallo gelido del carillon. Ricordi le parole di tuo padre, quasi un ringhio di terrore represso: \'Non aprirlo mai. Il suo suono \'attira i ricordi sbagliati.\' Ma la solitudine, stanotte, è un nemico più vicino di qualsiasi ricordo.',
      choices: [
        {
          text: 'Apri il carillon.',
          consequences: { type: 'sequence' as const, sequenceId: 'ash_lullaby_sequence' }
        },
        {
          text: 'Cerca di dormire senza aprirlo.',
          resultText: 'L\'avvertimento di tuo padre risuona nella tua mente. Decidi di non sfidare il destino stanotte. Ti rannicchi nel sonno, ma è un riposo inquieto.',
          consequences: { type: 'end_event' as const }
        },
        {
          text: 'Rimani di guardia.',
          resultText: 'Decidi che il sonno non è un\'opzione. Passi le ore a vegliare, il monito di tuo padre troppo forte per essere ignorato.',
          consequences: { type: 'end_event' as const }
        }
      ]
    };

    // Converte in GameEvent per il sistema esistente
    const gameEvent = {
      id: 'lore_ash_lullaby',
      title: loreEvent.title,
      description: loreEvent.description,
      choices: loreEvent.choices.map(choice => ({
        text: choice.text,
        resultText: choice.resultText,
        consequences: choice.consequences
      })),
      isUnique: true // L'evento è unico per sessione
    };

    triggerEvent(gameEvent);
  };

  const handleSearch = () => {
    // Versione semplificata per ora - TODO: Implementare sistema completo di investigazione
    if (searchResult) {
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'investigazione già completata'
      });
      return;
    }

    const checkResult = performAbilityCheck('percezione', 15);
    let outcomeMessage: string;

    if (checkResult.success) {
      outcomeMessage = `SUCCESSO nella ricerca!\n`;
      const findChance = Math.random();
      if (findChance < 0.4) {
        outcomeMessage += 'Trovi alcuni oggetti utili sparsi nel rifugio.';
      } else if (findChance < 0.7) {
        outcomeMessage += 'Il rifugio è già stato saccheggiato, ma sembra sicuro.';
      } else {
        outcomeMessage += 'Dopo un\'attenta ricerca, non trovi nulla di utile.';
      }
      addLogEntry(MessageType.SKILL_CHECK_SUCCESS, { action: 'investigazione rifugio' });
    } else {
      outcomeMessage = `FALLIMENTO nella ricerca. La tua investigazione è stata superficiale.`;
      addLogEntry(MessageType.SKILL_CHECK_FAILURE, { ability: 'percezione', action: 'investigazione rifugio' });
    }

    setSearchResult(outcomeMessage);
  };

  const handleWorkbench = () => {
    // Verifica se il crafting è disponibile (solo nei rifugi)
    // Usa direttamente il worldStore per evitare problemi di sincronizzazione
    const worldStore = useWorldStore.getState();
    const { x, y } = worldStore.playerPosition;
    const currentTile = worldStore.mapData[y]?.[x];
    
    // Verifica che la mappa sia caricata e la posizione sia valida
    if (!worldStore.mapData || worldStore.mapData.length === 0) {
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'mappa non caricata correttamente'
      });
      return;
    }
    
    if (x === -1 || y === -1) {
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'posizione del giocatore non valida'
      });
      return;
    }
    
    if (currentTile !== 'R') {
      addLogEntry(MessageType.ACTION_FAIL, {
        reason: 'il banco di lavoro è disponibile solo nei rifugi sicuri'
      });
      return;
    }
    
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