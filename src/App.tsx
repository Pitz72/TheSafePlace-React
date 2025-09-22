import React, { useEffect } from 'react';
import './App.css';
import { useGameScale } from './hooks/useGameScale';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { useGameStore } from './stores/gameStore';
import { useCombatStore } from './stores/combatStore';
import { useSettingsStore } from './stores/settingsStore';
import { useCharacterStore } from './stores/character/characterStore';
import { useWorldStore } from './stores/world/worldStore';
import { useSaveStore } from './stores/save/saveStore';
import { useSurvivalStore } from './stores/survival/survivalStore';
import { useNotificationStore } from './stores/notifications/notificationStore';
import { useInventoryStore } from './stores/inventory/inventoryStore';
import { itemDatabase } from './data/items/itemDatabase';
import { GameErrorBoundary } from './utils/errorHandler';
import NarrativeManager from './components/narrative/NarrativeManager';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import CharacterSheetScreen from './components/CharacterSheetScreen';
import InventoryScreen from './components/InventoryScreen';
import EventScreen from './components/EventScreen';
import LoadScreen from './components/LoadScreen';
import NotificationSystem from './components/NotificationSystem';
import StartScreen from './components/StartScreen';
import InstructionsScreen from './components/InstructionsScreen';
import StoryScreen from './components/StoryScreen';
import OptionsScreen from './components/OptionsScreen';
import MapViewport from './components/MapViewport';
import GameJournal from './components/GameJournal';
import InventoryPanel from './components/InventoryPanel';
import LevelUpScreen from './components/LevelUpScreen';
import ShelterScreen from './components/ShelterScreen';
import CraftingScreenRedesigned from './components/CraftingScreenRedesigned';
import WeatherDisplay from './components/WeatherDisplay';
import CombatScreen from './components/combat/CombatScreen';
import PostCombatScreen from './components/combat/PostCombatScreen';
import KeyboardCommandsPanel from './components/KeyboardCommandsPanel';

const getTileDescription = (char: string): string => {
  switch (char) {
    case '.': return 'Pianura';
    case '~': return 'Acqua';
    case 'C': return 'Città';
    case 'F': return 'Foresta';
    case 'M': return 'Montagna';
    case 'V': return 'Villaggio';
    case 'R': return 'Risorsa';
    case 'S': return 'Start';
    case 'E': return 'End';
    default: return 'Sconosciuto';
  }
};

const GameScreenInputHandler = () => {
  const { setCurrentScreen, pauseGame, currentScreen } = useGameStore();
  usePlayerMovement({ setCurrentScreen });
  const { shortRest } = useSurvivalStore();
  const { addLogEntry } = useNotificationStore();
  const { handleQuickSave, handleQuickLoad } = useSaveStore();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Non gestire eventi se siamo in schermate che hanno i propri gestori
      const screensWithOwnHandlers = ['shelter', 'crafting', 'inventory', 'characterSheet', 'levelUp'];
      if (screensWithOwnHandlers.includes(currentScreen)) {
        return;
      }
      
      // Evita conflitti con i tasti di movimento gestiti da usePlayerMovement
      const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      if (movementKeys.includes(event.key.toLowerCase())) {
        return; // Lascia che usePlayerMovement gestisca questi tasti
      }
      
      switch (event.key.toLowerCase()) {
        case 'i': event.preventDefault(); setCurrentScreen('inventory'); break;
        case 'l': event.preventDefault(); setCurrentScreen('levelUp'); break;
        case 'r': event.preventDefault(); shortRest(addLogEntry); break;
        case 'tab': event.preventDefault(); setCurrentScreen('characterSheet'); break;
        case 'escape': event.preventDefault(); pauseGame(); break;
        case 'f5': event.preventDefault(); handleQuickSave(); break;
        case 'f9': event.preventDefault(); handleQuickLoad(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentScreen, shortRest, addLogEntry, handleQuickSave, handleQuickLoad, currentScreen]);

  return null;
};

const GameContent = () => {
  const { viewportWidth, viewportHeight } = useGameScale();
  // Optimized selectors to prevent re-render loops
  const currentScreen = useGameStore(state => state.currentScreen);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const initializeGame = useGameStore(state => state.initializeGame);
  const { loadSavedGame } = useSaveStore();

  // Granular selectors to prevent infinite loops
  const { playerPosition, mapData, timeState, isMapLoading } = useWorldStore();
  const { characterSheet, getModifier } = useCharacterStore();
  const { getInventory } = useInventoryStore();
  const items = getInventory();
  const { survivalState } = useSurvivalStore();
  const { notifications, removeNotification } = useNotificationStore();

  const isInCombat = useCombatStore(state => state.isActive);
  const combatResult = useCombatStore(state => state.combatResult);
  const clearCombatResults = useCombatStore(state => state.clearCombatResults);
  const { videoMode } = useSettingsStore();

  // Check for game over condition
  const isGameOver = characterSheet.currentHP <= 0;

  const getCurrentTile = (): string => {
    if (!mapData || mapData.length === 0 || playerPosition.x === -1 || playerPosition.y === -1) return '.';
    const row = mapData[playerPosition.y];
    if (!row || playerPosition.x >= row.length) return '.';
    return row[playerPosition.x];
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  const currentTile = getCurrentTile();
  const currentLocation = getTileDescription(currentTile);
  const formattedTime = timeState?.currentTime ? formatTime(timeState.currentTime) : '00:00';

  const renderGameScreens = () => {
    if (currentScreen === 'menu') return <StartScreen />;
    if (currentScreen === 'instructions') return <InstructionsScreen />;
    if (currentScreen === 'story') return <StoryScreen />;
    if (currentScreen === 'options') return <OptionsScreen />;
    if (currentScreen === 'characterCreation') return <CharacterCreationScreen />;
    if (currentScreen === 'characterSheet') return <CharacterSheetScreen />;
    if (currentScreen === 'inventory') return <InventoryScreen />;
    if (currentScreen === 'levelUp') return <LevelUpScreen />;
    if (currentScreen === 'shelter') return <ShelterScreen />;
    if (currentScreen === 'crafting') return <CraftingScreenRedesigned onExit={() => setCurrentScreen('shelter')} />;
    if (currentScreen === 'event') return <EventScreen />;
    if (currentScreen === 'loadGame') return <LoadScreen />;

    if (currentScreen === 'game') {
      return (
        <>
          <GameScreenInputHandler />
          {isMapLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-phosphor-400 text-2xl mb-4 animate-pulse">CARICAMENTO...</div>
                <div className="text-phosphor-700">Inizializzazione del mondo di gioco</div>
              </div>
            </div>
          ) : (
            <main className="flex-1 flex flex-col">
              <div className="flex-1 flex">
                <aside className="w-1/4 border-r border-phosphor-600">
                  <div className="panel h-full">
                    <h3 className="panel-title">SOPRAVVIVENZA</h3>
                    <ul className="space-y-2 text-uniform">
                      <li>HP: <span className={`${(characterSheet.currentHP / characterSheet.maxHP) * 100 < 25 ? 'text-red-400' : (characterSheet.currentHP / characterSheet.maxHP) * 100 < 50 ? 'text-yellow-400' : 'text-green-400'}`}>{characterSheet.currentHP}</span>/<span className="text-phosphor-400">{characterSheet.maxHP}</span></li>
                      <li>Sazietà: <span className={`${survivalState.hunger < 25 ? 'text-red-400' : survivalState.hunger < 50 ? 'text-yellow-400' : 'text-phosphor-400'}`}>{Math.floor(survivalState.hunger)}</span>/100</li>
                      <li>Idratazione: <span className={`${survivalState.thirst < 25 ? 'text-red-400' : survivalState.thirst < 50 ? 'text-yellow-400' : 'text-phosphor-400'}`}>{Math.floor(survivalState.thirst)}</span>/100</li>
                      <li>Status: <span className={`${characterSheet.status.currentStatus === 'dead' ? 'text-red-600' : characterSheet.status.currentStatus === 'sick' ? 'text-yellow-500' : characterSheet.status.currentStatus === 'wounded' ? 'text-orange-400' : 'text-green-400'}`}>{characterSheet.status.currentStatus === 'dead' ? 'Morto' : characterSheet.status.currentStatus === 'sick' ? 'Malato' : characterSheet.status.currentStatus === 'wounded' ? 'Ferito' : characterSheet.status.currentStatus === 'poisoned' ? 'Avvelenato' : characterSheet.status.currentStatus === 'starving' ? 'Affamato' : characterSheet.status.currentStatus === 'dehydrated' ? 'Disidratato' : 'Normale'}</span></li>
                    </ul>
                    <InventoryPanel />
                    <KeyboardCommandsPanel />
                  </div>
                </aside>
                <section className="flex-1 flex flex-col">
                  <div className="panel flex-1 m-4 flex flex-col">
                    <h2 className="panel-title">MAPPA DEL MONDO</h2>
                    <div className="flex-1 relative min-h-0 h-full">
                      <MapViewport className="absolute inset-0" viewportWidth={viewportWidth} viewportHeight={viewportHeight} />
                    </div>
                  </div>
                </section>
                <aside className="w-1/4 border-l border-phosphor-600">
                  <div className="panel h-full">
                    <h2 className="panel-title">INFORMAZIONI</h2>
                    <ul className="space-y-2 text-uniform">
                      <li>Posizione: ({playerPosition.x}, {playerPosition.y})</li>
                      <li>Luogo: {currentLocation}</li>
                      <li>Ora: {formattedTime} Giorno {timeState?.day || 1}</li>
                    </ul>
                    <h2 className="panel-title mt-4">METEO</h2>
                    <WeatherDisplay />
                    <h2 className="panel-title mt-6">STATISTICHE</h2>
                    <div className="space-y-1 text-uniform">
                      <div>Potenza: {characterSheet.stats.potenza} ({getModifier('potenza') >= 0 ? '+' : ''}{getModifier('potenza')})</div>
                      <div>Agilità: {characterSheet.stats.agilita} ({getModifier('agilita') >= 0 ? '+' : ''}{getModifier('agilita')})</div>
                      <div>Vigore: {characterSheet.stats.vigore} ({getModifier('vigore') >= 0 ? '+' : ''}{getModifier('vigore')})</div>
                      <div>Percezione: {characterSheet.stats.percezione} ({getModifier('percezione') >= 0 ? '+' : ''}{getModifier('percezione')})</div>
                      <div>Adattamento: {characterSheet.stats.adattamento} ({getModifier('adattamento') >= 0 ? '+' : ''}{getModifier('adattamento')})</div>
                      <div>Carisma: {characterSheet.stats.carisma} ({getModifier('carisma') >= 0 ? '+' : ''}{getModifier('carisma')})</div>
                    </div>
                    <h2 className="panel-title mt-6">EQUIPAGGIAMENTO</h2>
                    <div className="space-y-1 text-uniform">
                      <div>ARMA: {characterSheet.equipment.weapon.itemId ? itemDatabase[characterSheet.equipment.weapon.itemId]?.name || 'Sconosciuta' : 'Nessuna'}</div>
                      <div>ARMATURA: {characterSheet.equipment.armor.itemId ? itemDatabase[characterSheet.equipment.armor.itemId]?.name || 'Sconosciuta' : 'Nessuna'}</div>
                    </div>
                  </div>
                </aside>
              </div>
              <div className="h-[280px] border-t border-phosphor-600">
                <GameJournal />
              </div>
            </main>
          )}
        </>
      );
    }
    return <div>Schermata Sconosciuta: {currentScreen}</div>;
  };

  return (
    <div className="game-container-wrapper">
      <div className={`game-container ${currentScreen === 'game' && videoMode !== 'no-effects' ? 'no-warmup' : ''}`}>
        <div className="crt-premium-overlay"></div>
        <NotificationSystem 
          notifications={notifications.map(n => ({ ...n, title: n.message }))} 
          onRemove={removeNotification} 
        />
        <div className="h-full flex flex-col">
          <NarrativeManager />
          {combatResult ? (
            <PostCombatScreen
              result={combatResult}
              xpGained={combatResult.xpGained || 0}
              loot={combatResult.loot || []}
              onContinue={clearCombatResults}
              onLoadGame={() => loadSavedGame('quicksave')}
              onMainMenu={initializeGame}
            />
          ) : isGameOver ? (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
              <div className="w-full max-w-2xl border border-red-600 bg-gray-900 p-8 rounded-lg shadow-lg">
                <h2 className="text-6xl font-bold mb-8 text-center text-red-400 glow-red">
                  GAME OVER
                </h2>
                <div className="text-center mb-8">
                  <p className="text-xl mb-4 text-phosphor-400">
                    Il viaggio di Ultimo è giunto al termine.
                  </p>
                  <p className="text-lg text-phosphor-500 mb-8">
                    {characterSheet.status.currentStatus === 'starving' ? 'La fame ha avuto la meglio...' :
                     characterSheet.status.currentStatus === 'dehydrated' ? 'La sete ha vinto...' :
                     characterSheet.status.currentStatus === 'sick' ? 'La malattia ha trionfato...' :
                     characterSheet.status.currentStatus === 'poisoned' ? 'Il veleno ha fatto il suo corso...' :
                     'Il combattimento è stato fatale...'}
                  </p>
                  <p className="text-sm text-phosphor-600 mb-8">
                    "Non tutti i viaggi hanno una destinazione felice, ma ogni storia merita di essere raccontata."
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-phosphor-600 hover:bg-phosphor-500 text-black font-bold rounded transition-colors"
                  >
                    NUOVA PARTITA
                  </button>
                  <button
                    onClick={() => {
                      const { initializeGame } = useGameStore.getState();
                      initializeGame();
                      setCurrentScreen('menu');
                    }}
                    className="px-6 py-3 border border-phosphor-600 hover:bg-phosphor-600 hover:text-black text-phosphor-400 font-bold rounded transition-colors"
                  >
                    MENU PRINCIPALE
                  </button>
                </div>
              </div>
            </div>
          ) : isInCombat ? (
            <CombatScreen />
          ) : (
            renderGameScreens()
          )}
        </div>
      </div>
    </div>
  );
};

const AppUI = () => {
  return <GameContent />;
};

function App() {
  const initializeGame = useGameStore(state => state.initializeGame);
  const { isMapLoading } = useWorldStore();

  useEffect(() => {
    if (!isMapLoading) {
      initializeGame();
    }
  }, [initializeGame, isMapLoading]);

  return (
    <GameErrorBoundary>
      <AppUI />
    </GameErrorBoundary>
  );
}

export default App;
