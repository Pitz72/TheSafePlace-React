import React, { useState, useCallback, useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { MENU_ITEMS } from '../constants';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState, JournalEntryType } from '../types';
import { audioManager } from '../utils/audio';
import { handleLoadGame } from '../services/saveGameService';

/**
 * MainMenuScreen component.
 * This component renders the main menu screen.
 * @returns {JSX.Element} The rendered MainMenuScreen component.
 */
const MainMenuScreen: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setGameState, setMap, startCutscene, addJournalEntry, initializeWanderingTrader } = useGameStore();
  const initCharacter = useCharacterStore((state) => state.initCharacter);

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : MENU_ITEMS.length - 1));
    audioManager.playSound('navigate');
  }, []);

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((prev) => (prev < MENU_ITEMS.length - 1 ? prev + 1 : 0));
    audioManager.playSound('navigate');
  }, []);

  const handleEnter = useCallback(() => {
    const selectedItem = MENU_ITEMS[selectedIndex];
    audioManager.playSound('confirm');

    switch (selectedItem) {
      case "Nuova Partita":
        setMap(); // Resetta il mondo di gioco
        initCharacter(); // Resetta lo stato del personaggio a vuoto
        initializeWanderingTrader(); // Spawna il commerciante itinerante (v1.6.0)
        startCutscene('CS_OPENING'); // Avvia la cutscene di apertura
        break;
      case "Continua Partita": {
        const lastSaveSlot = localStorage.getItem('tspc_last_save_slot');
        if (lastSaveSlot) {
          handleLoadGame(parseInt(lastSaveSlot, 10));
        } else {
          addJournalEntry({ text: "Nessun salvataggio precedente trovato.", type: JournalEntryType.SYSTEM_ERROR });
        }
        break;
      }
      case "Carica Partita":
        setGameState(GameState.LOAD_GAME);
        break;
      case "Istruzioni":
        setGameState(GameState.INSTRUCTIONS_SCREEN);
        break;
      case "Storia":
        setGameState(GameState.STORY_SCREEN);
        break;
      case "Opzioni":
        setGameState(GameState.OPTIONS_SCREEN);
        break;
      case "Trofei":
        setGameState(GameState.TROPHY_SCREEN);
        break;
      case "Esci":
        // In a real app, you might close the window or go to a goodbye screen.
        // For this prototype, we'll just log it.
        console.log("Exiting game...");
        break;
    }
  }, [selectedIndex, setGameState, setMap, initCharacter, initializeWanderingTrader, startCutscene, addJournalEntry]);

  const handlerMap = useMemo(() => ({
    ArrowUp: handleArrowUp,
    ArrowDown: handleArrowDown,
    Enter: handleEnter,
  }), [handleArrowUp, handleArrowDown, handleEnter]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
      <div className="mb-24 text-[var(--text-primary)]" style={{ textShadow: '0 0 8px var(--shadow-primary)' }}>
        <h2 className="text-4xl tracking-widest">THE SAFE PLACE CHRONICLES</h2>
        <h1 className="text-9xl font-black leading-none">THE ECHO</h1>
        <p className="text-2xl leading-none -mt-4">OF THE</p>
        <h1 className="text-9xl font-black leading-none -mt-4">JOURNEY</h1>
        <p className="text-4xl mt-6">Un GDR di Simone Pizzi</p>
      </div>

      <div className="text-3xl md:text-4xl lg:text-5xl space-y-2">
        {MENU_ITEMS.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={item}
              className={`px-4 py-1 transition-colors duration-100 ${isSelected ? 'bg-[var(--highlight-bg)] text-[var(--highlight-text)]' : 'bg-transparent text-[var(--text-primary)]'
                }`}
            >
              {item}
            </div>
          );
        })}
      </div>
      <div className="mt-auto pb-4">
        <p className="text-xl text-[var(--text-primary)]/70">
          (C) 2025 Runtime Radio - gioco di ispirazione retrocomputazionale realizzato tramite supporto LLM
        </p>
      </div>
    </div>
  );
};

export default MainMenuScreen;
