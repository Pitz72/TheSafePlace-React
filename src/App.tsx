import React, { useEffect } from 'react';
import './App.css';
import { useGameScale } from './hooks/useGameScale';
import { usePlayerMovement } from './hooks/usePlayerMovement';



import { useGameStore } from './stores/gameStore';
import { useCombatStore } from './stores/combatStore';
import { useSettingsStore } from './stores/settingsStore';
import { runAllResolutionTests } from './utils/resolutionTest';
import { performanceMonitor } from './utils/performanceMonitor';
import { GameErrorBoundary } from './utils/errorHandler';

// Importa le nuove schermate
import CharacterCreationScreen from './components/CharacterCreationScreen';
import CharacterSheetScreen from './components/CharacterSheetScreen';
import InventoryScreen from './components/InventoryScreen';
import EventScreen from './components/EventScreen';
import LoadScreen from './components/LoadScreen';
import NotificationSystem from './components/NotificationSystem';

// Funzione per mappare i caratteri della mappa ai nomi dei luoghi - v0.1.3
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

// Componente headless per la gestione degli input nella schermata di gioco
const GameScreenInputHandler = () => {
  usePlayerMovement(); // Attiva i comandi di movimento WASD

  // Recupera le azioni necessarie dallo store
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const shortRest = useGameStore(state => state.shortRest);
  const handleQuickSave = useGameStore(state => state.handleQuickSave);
  const handleQuickLoad = useGameStore(state => state.handleQuickLoad);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Non intercettare input se l'utente sta scrivendo
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Gestisce solo i tasti non legati al movimento
      switch (event.key.toLowerCase()) {
        case 'i':
          event.preventDefault();
          setCurrentScreen('inventory');
          break;
        case 'l':
          event.preventDefault();
          setCurrentScreen('levelUp');
          break;
        case 'r':
          event.preventDefault();
          shortRest();
          break;
        case 'tab':
          event.preventDefault();
          setCurrentScreen('characterSheet');
          break;
        case 'escape':
          event.preventDefault();
          setCurrentScreen('menu');
          break;
        case 'f5':
          event.preventDefault();
          handleQuickSave();
          break;
        case 'f9':
          event.preventDefault();
          handleQuickLoad();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentScreen, shortRest, handleQuickSave, handleQuickLoad]); // Dipendenze stabili

  return null; // Questo componente non renderizza nulla
};
import StartScreen from './components/StartScreen';
import InstructionsScreen from './components/InstructionsScreen';
import StoryScreen from './components/StoryScreen';
import OptionsScreen from './components/OptionsScreen';
import MapViewport from './components/MapViewport';

import GameJournal from './components/GameJournal';
import InventoryPanel from './components/InventoryPanel';

import LevelUpScreen from './components/LevelUpScreen';
import ShelterScreen from './components/ShelterScreen';
import CraftingScreen from './components/crafting/CraftingScreen';
import TerminalCraftingScreen from './components/crafting/TerminalCraftingScreen';
import CraftingScreenRedesigned from './components/CraftingScreenRedesigned';
import WeatherDisplay from './components/WeatherDisplay';
import CombatScreen from './components/combat/CombatScreen';
import PostCombatScreen from './components/combat/PostCombatScreen';



const GameContent = () => {
  const { scale, viewportWidth, viewportHeight } = useGameScale();
  const { currentScreen, setCurrentScreen, loadSavedGame, initializeGame } = useGameStore(state => ({
    currentScreen: state.currentScreen,
    setCurrentScreen: state.setCurrentScreen,
    loadSavedGame: state.loadSavedGame,
    initializeGame: state.initializeGame,
  }));
  const { isInCombat, combatResult, clearCombatResults } = useCombatStore(state => ({
    isInCombat: state.isActive,
    combatResult: state.combatResult,
    clearCombatResults: state.clearCombatResults,
  }));
  const playerPosition = useGameStore(state => state.playerPosition);
  const isMapLoading = useGameStore(state => state.isMapLoading);
  const mapData = useGameStore(state => state.mapData);
  const timeState = useGameStore(state => state.timeState);
  const characterSheet = useGameStore(state => state.characterSheet);
  const getModifier = useGameStore(state => state.getModifier);
  const items = useGameStore(state => state.items);
  const survivalState = useGameStore(state => state.survivalState);
  const notifications = useGameStore(state => state.notifications);
  const removeNotification = useGameStore(state => state.removeNotification);
  const { videoMode } = useSettingsStore();
  
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (state, prevState) => {
        console.log('[Zustand State Change] Lo stato è cambiato.', {
          newState: JSON.parse(JSON.stringify(state)),
          previousState: JSON.parse(JSON.stringify(prevState))
        });
      }
    );
    return unsubscribe;
  }, []);

  // Calcola il tile corrente per le informazioni dinamiche - v0.1.3
  const getCurrentTile = (): string => {
    if (mapData.length === 0 || playerPosition.x === -1 || playerPosition.y === -1) {
      return '.';
    }
    const row = mapData[playerPosition.y];
    if (!row || playerPosition.x >= row.length) {
      return '.';
    }
    return row[playerPosition.x];
  };
  
  // Formattazione del tempo per il pannello INFORMAZIONI
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  const currentTile = getCurrentTile();
  const currentLocation = getTileDescription(currentTile);
  const formattedTime = formatTime(timeState.currentTime);

  // Debug info per testing (rimuovere in produzione)
  console.log(`Scale: ${scale.toFixed(2)}, Viewport: ${viewportWidth}x${viewportHeight}`);
  
  // Performance debug (rimuovere in produzione)
  const currentFPS = performanceMonitor.getFPS();
  if (currentFPS > 0) {
    console.log(`FPS: ${currentFPS}`);
  }
  
  // Esegui test multi-risoluzione una sola volta all'avvio
  React.useEffect(() => {
    runAllResolutionTests();
  }, []);

  // Performance monitoring
  React.useEffect(() => {
    const updatePerformance = () => {
      performanceMonitor.updateFPS();
    };

    let animationId: number;
    const animate = () => {
      updatePerformance();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Render based on current screen
  return (
    <div className="game-container-wrapper">
      <div className={`game-container ${currentScreen === 'game' && videoMode !== 'no-effects' ? 'no-warmup' : ''}`}>
        {/* CRT Effects Overlays */}
          <div className="crt-premium-overlay"></div>
        
        {/* Notification System */}
        <NotificationSystem 
          notifications={notifications} 
          onRemove={removeNotification} 
        />
        
        {/* Container principale */}
        <div className="h-full flex flex-col">
          {/* Schermata Post-Combattimento (priorità massima) */}
          {combatResult ? (
            <PostCombatScreen
              result={combatResult}
              xpGained={combatResult.xpGained || 0}
              loot={combatResult.loot || []}
              onContinue={() => {
                clearCombatResults();
                // Non cambiamo schermata, torniamo semplicemente al gioco
              }}
              onLoadGame={() => loadSavedGame('quicksave')}
              onMainMenu={() => initializeGame()}
            />
          ) : isInCombat ? (
            <CombatScreen />
          ) : (
            <>
              {/* Schermate a schermo intero */}
              {currentScreen === 'menu' && <StartScreen />}
              {currentScreen === 'instructions' && <InstructionsScreen />}
          {currentScreen === 'story' && <StoryScreen />}
          {currentScreen === 'options' && <OptionsScreen />}
          {currentScreen === 'characterCreation' && <CharacterCreationScreen />}
          {currentScreen === 'characterSheet' && <CharacterSheetScreen />}
          {currentScreen === 'inventory' && <InventoryScreen />}
          {currentScreen === 'levelUp' && <LevelUpScreen />}
          {currentScreen === 'shelter' && <ShelterScreen />}
          {currentScreen === 'crafting' && <CraftingScreenRedesigned onExit={() => setCurrentScreen('shelter')} />}
          {currentScreen === 'event' && <EventScreen />}
          {currentScreen === 'loadGame' && <LoadScreen />}
          
          {/* Schermata di Gioco Principale */}
          {currentScreen === 'game' && (
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
                    {/* Colonna sinistra */}
                    <aside className="w-1/4 border-r border-phosphor-600">
                      <div className="panel h-full">
                        <h3 className="panel-title">SOPRAVVIVENZA</h3>
                        <ul className="space-y-2 text-uniform">
                          <li>
                            HP: <span className={`${
                              characterSheet.currentHP <= 0 ? 'text-red-400 animate-pulse' :
                              (characterSheet.currentHP / characterSheet.maxHP) * 100 < 25 ? 'text-red-400' :
                              (characterSheet.currentHP / characterSheet.maxHP) * 100 < 50 ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {characterSheet.currentHP}
                            </span>/<span className="text-phosphor-400">{characterSheet.maxHP}</span>
                          </li>
                          <li>
                            Sazietà: <span className={`${
                              survivalState.hunger <= 0 ? 'text-red-400 animate-pulse' :
                              survivalState.hunger < 25 ? 'text-red-400' :
                              survivalState.hunger < 50 ? 'text-yellow-400' :
                              'text-phosphor-400'
                            }`}>
                              {Math.floor(survivalState.hunger)}
                            </span>/<span className="text-phosphor-400">100</span>
                          </li>
                          <li>
                            Idratazione: <span className={`${
                              survivalState.thirst <= 0 ? 'text-red-400 animate-pulse' :
                              survivalState.thirst < 25 ? 'text-red-400' :
                              survivalState.thirst < 50 ? 'text-yellow-400' :
                              'text-phosphor-400'
                            }`}>
                              {Math.floor(survivalState.thirst)}
                            </span>/<span className="text-phosphor-400">100</span>
                          </li>
                          <li>
                            Status: <span className={`${
                              characterSheet.currentHP <= 0 ? 'text-red-400 animate-pulse' :
                              (characterSheet.currentHP / characterSheet.maxHP) * 100 < 25 ? 'text-red-400' :
                              (characterSheet.currentHP / characterSheet.maxHP) * 100 < 50 ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {characterSheet.currentHP <= 0 ? 'Morto' :
                               (characterSheet.currentHP / characterSheet.maxHP) * 100 < 25 ? 'Critico' :
                               (characterSheet.currentHP / characterSheet.maxHP) * 100 < 50 ? 'Ferito' :
                               'Normale'}
                            </span>
                          </li>
                        </ul>
                        <InventoryPanel />
                      </div>
                    </aside>

                    {/* Colonna centrale */}
                    <section className="flex-1 flex flex-col">
                      <div className="panel flex-1 m-4 flex flex-col">
                        <h2 className="panel-title">MAPPA DEL MONDO</h2>
                        <div className="flex-1 relative min-h-0 h-full">
                          <MapViewport className="absolute inset-0" viewportWidth={viewportWidth} viewportHeight={viewportHeight} />
                        </div>
                        <div className="text-center mt-2 text-xs">
                          <span style={{color: 'rgb(192, 192, 192)'}}>C</span> = Città{' '}
                          <span className="text-phosphor-700">F</span> = Foresta{' '}
                          <span className="text-blue-400">~</span> = Acqua{' '}
                          <span style={{color: 'rgb(101, 67, 33)'}}>M</span> = Montagna{' '}
                          <span style={{color: '#ffff00'}}>R</span> = Rifugio{' '}
                          <span style={{color: '#00ff00'}}>S/E</span> = Start/End
                        </div>
                      </div>
                    </section>

                    {/* Colonna destra */}
                    <aside className="w-1/4 border-l border-phosphor-600">
                      <div className="panel h-full">
                        <h2 className="panel-title">INFORMAZIONI</h2>
                        <ul className="space-y-2 text-uniform">
                          <li>Posizione: (<span className="text-phosphor-400">{playerPosition.x}</span>, <span className="text-phosphor-400">{playerPosition.y}</span>)</li>
                          <li>Luogo: <span className="text-phosphor-400">{currentLocation}</span></li>
                          <li>Ora: <span className={`font-bold ${timeState.isDay ? 'text-phosphor-400' : 'text-phosphor-night-blue'}`}>{formattedTime}</span> <span className={`font-bold ${timeState.isDay ? 'text-phosphor-400' : 'text-phosphor-night-blue'}`}>Giorno {timeState.day}</span></li>
                        </ul>
                        <h2 className="panel-title mt-4">METEO</h2>
                        <WeatherDisplay />
                        <h2 className="panel-title mt-6">STATISTICHE</h2>
                        <div className="space-y-1 text-uniform">
                          <div>Potenza: <span className="text-phosphor-400">{characterSheet.stats.potenza}</span> <span className="text-phosphor-700">({getModifier('potenza') >= 0 ? '+' : ''}{getModifier('potenza')})</span></div>
                          <div>Agilità: <span className="text-phosphor-400">{characterSheet.stats.agilita}</span> <span className="text-phosphor-700">({getModifier('agilita') >= 0 ? '+' : ''}{getModifier('agilita')})</span></div>
                          <div>Vigore: <span className="text-phosphor-400">{characterSheet.stats.vigore}</span> <span className="text-phosphor-700">({getModifier('vigore') >= 0 ? '+' : ''}{getModifier('vigore')})</span></div>
                          <div>Percezione: <span className="text-phosphor-400">{characterSheet.stats.percezione}</span> <span className="text-phosphor-700">({getModifier('percezione') >= 0 ? '+' : ''}{getModifier('percezione')})</span></div>
                          <div>Adattamento: <span className="text-phosphor-400">{characterSheet.stats.adattamento}</span> <span className="text-phosphor-700">({getModifier('adattamento') >= 0 ? '+' : ''}{getModifier('adattamento')})</span></div>
                          <div>Carisma: <span className="text-phosphor-400">{characterSheet.stats.carisma}</span> <span className="text-phosphor-700">({getModifier('carisma') >= 0 ? '+' : ''}{getModifier('carisma')})</span></div>
                        </div>
                        <h2 className="panel-title mt-6">EQUIPAGGIAMENTO</h2>
                        <div className="space-y-1 text-uniform">
                          <div>ARMA: <span className="text-phosphor-400">
                            {characterSheet.equipment.weapon.itemId 
                              ? items[characterSheet.equipment.weapon.itemId]?.name || 'Sconosciuta'
                              : 'Nessuna'}
                          </span></div>
                          <div>ARMATURA: <span className="text-phosphor-400">
                            {characterSheet.equipment.armor.itemId 
                              ? items[characterSheet.equipment.armor.itemId]?.name || 'Sconosciuta'
                              : 'Nessuna'}
                          </span></div>
                        </div>
                        <h2 className="panel-title mt-6">COMANDI</h2>
                        <div className="space-y-1 text-uniform">
                          <div>[<strong className="text-phosphor-400">WASD</strong>] Movimento</div>
            <div>[<strong className="text-phosphor-400">I</strong>]nventario</div>
            <div>[<strong className="text-phosphor-400">R</strong>]iposa</div>
            <div>[<strong className="text-phosphor-400">L</strong>]ivella Personaggio</div>
            <div>[<strong className="text-phosphor-400">F5</strong>] Salvataggio Rapido</div>
            <div>[<strong className="text-phosphor-400">F9</strong>] Caricamento Rapido</div>
            <div>[<strong className="text-phosphor-400">ESC</strong>] Menu</div>
            <div>[<strong className="text-phosphor-400">TAB</strong>] Scheda Personaggio</div>
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
          )}
        </div>
      )}
    </div>
  );
};

const AppUI = () => {
  return (
    <GameContent />
  );
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
