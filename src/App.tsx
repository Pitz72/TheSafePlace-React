import React, { useEffect } from 'react';
import './App.css';
import { useGameScale } from './hooks/useGameScale';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { useGameStore } from './stores/gameStore';
import { useCombatStore } from './stores/combatStore';
import { shallow } from 'zustand/shallow';
import { useSettingsStore } from './stores/settingsStore';
import { runAllResolutionTests } from './utils/resolutionTest';
import { performanceMonitor } from './utils/performanceMonitor';
import { GameErrorBoundary } from './utils/errorHandler';
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
  usePlayerMovement();
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const shortRest = useGameStore(state => state.shortRest);
  const handleQuickSave = useGameStore(state => state.handleQuickSave);
  const handleQuickLoad = useGameStore(state => state.handleQuickLoad);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      switch (event.key.toLowerCase()) {
        case 'i': event.preventDefault(); setCurrentScreen('inventory'); break;
        case 'l': event.preventDefault(); setCurrentScreen('levelUp'); break;
        case 'r': event.preventDefault(); shortRest(); break;
        case 'tab': event.preventDefault(); setCurrentScreen('characterSheet'); break;
        case 'escape': event.preventDefault(); setCurrentScreen('menu'); break;
        case 'f5': event.preventDefault(); handleQuickSave(); break;
        case 'f9': event.preventDefault(); handleQuickLoad(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentScreen, shortRest, handleQuickSave, handleQuickLoad]);

  return null;
};

const GameContent = () => {
  const { viewportWidth, viewportHeight } = useGameScale();
  // Optimized selectors to prevent re-render loops
  const currentScreen = useGameStore(state => state.currentScreen);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const loadSavedGame = useGameStore(state => state.loadSavedGame);
  const initializeGame = useGameStore(state => state.initializeGame);
  const isMapLoading = useGameStore(state => state.isMapLoading);
  const removeNotification = useGameStore(state => state.removeNotification);

  // Granular selectors to prevent infinite loops
  const playerPosition = useGameStore(state => state.playerPosition);
  const mapData = useGameStore(state => state.mapData);
  const timeState = useGameStore(state => state.timeState);
  const characterSheet = useGameStore(state => state.characterSheet);
  const items = useGameStore(state => state.items);
  const survivalState = useGameStore(state => state.survivalState);
  const notifications = useGameStore(state => state.notifications);
  const getModifier = useGameStore(state => state.getModifier);

  const isInCombat = useCombatStore(state => state.isActive);
  const combatResult = useCombatStore(state => state.combatResult);
  const clearCombatResults = useCombatStore(state => state.clearCombatResults);
  const { videoMode } = useSettingsStore();

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
                      <li>Status: <span className={`${(characterSheet.currentHP / characterSheet.maxHP) * 100 < 25 ? 'text-red-400' : (characterSheet.currentHP / characterSheet.maxHP) * 100 < 50 ? 'text-yellow-400' : 'text-green-400'}`}>{characterSheet.currentHP <= 0 ? 'Morto' : (characterSheet.currentHP / characterSheet.maxHP) * 100 < 25 ? 'Critico' : (characterSheet.currentHP / characterSheet.maxHP) * 100 < 50 ? 'Ferito' : 'Normale'}</span></li>
                    </ul>
                    <InventoryPanel />
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
                      <div>ARMA: {characterSheet.equipment.weapon.itemId ? items[characterSheet.equipment.weapon.itemId]?.name || 'Sconosciuta' : 'Nessuna'}</div>
                      <div>ARMATURA: {characterSheet.equipment.armor.itemId ? items[characterSheet.equipment.armor.itemId]?.name || 'Sconosciuta' : 'Nessuna'}</div>
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
        <NotificationSystem notifications={notifications} onRemove={removeNotification} />
        <div className="h-full flex flex-col">
          {combatResult ? (
            <PostCombatScreen
              result={combatResult}
              xpGained={combatResult.xpGained || 0}
              loot={combatResult.loot || []}
              onContinue={clearCombatResults}
              onLoadGame={() => loadSavedGame('quicksave')}
              onMainMenu={initializeGame}
            />
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
  const isMapLoading = useGameStore(state => state.isMapLoading);

  useEffect(() => {
    if (isMapLoading) {
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
