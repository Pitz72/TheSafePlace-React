import React from 'react';
import './App.css';
import { useGameScale } from './hooks/useGameScale';
import { useKeyboardCommands } from './hooks/useKeyboardCommands';
import { GameProvider } from './contexts/GameProvider';
import { useGameContext } from './hooks/useGameContext';
import { useSettingsStore } from './stores/settingsStore';
import { runAllResolutionTests } from './utils/resolutionTest';
import { performanceMonitor } from './utils/performanceMonitor';

// Importa le nuove schermate
import CharacterCreationScreen from './components/CharacterCreationScreen';
import CharacterSheetScreen from './components/CharacterSheetScreen';
import InventoryScreen from './components/InventoryScreen';

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
import StartScreen from './components/StartScreen';
import InstructionsScreen from './components/InstructionsScreen';
import StoryScreen from './components/StoryScreen';
import OptionsScreen from './components/OptionsScreen';
import MapViewport from './components/MapViewport';
import Player from './components/Player';
import GameJournal from './components/GameJournal';
import InventoryPanel from './components/InventoryPanel';

// Componente "headless" per inizializzare la logica di gioco globale
const GameLogic = () => {
  useKeyboardCommands();
  return null; // Non renderizza nulla
};

const GameContent = () => {
  const { scale, viewportWidth, viewportHeight } = useGameScale();
  const {
    isMapLoading, playerPosition, mapData, timeState,
    characterSheet, getModifier, currentScreen, setCurrentScreen
  } = useGameContext();
  const { videoMode } = useSettingsStore();
  
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
        
        {/* Container principale */}
        <div className="h-full flex flex-col">
          {/* Schermate a schermo intero */}
          {currentScreen === 'menu' && <StartScreen />}
          {currentScreen === 'instructions' && <InstructionsScreen />}
          {currentScreen === 'story' && <StoryScreen />}
          {currentScreen === 'options' && <OptionsScreen onBack={() => setCurrentScreen('menu')} />}
          {currentScreen === 'characterCreation' && <CharacterCreationScreen />}
          {currentScreen === 'characterSheet' && <CharacterSheetScreen />}
          {currentScreen === 'inventory' && <InventoryScreen />}
          
          {/* Schermata di Gioco Principale */}
          {currentScreen === 'game' && (
            <>
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
                        <h2 className="panel-title">SOPRAVVIVENZA</h2>
                        <ul className="space-y-2 text-uniform">
                          <li>HP: <span className="text-phosphor-400">{characterSheet.currentHP}</span>/<span className="text-phosphor-400">{characterSheet.maxHP}</span></li>
                          <li>Sazietà: <span className="text-phosphor-400">100</span>/<span className="text-phosphor-400">100</span></li>
                          <li>Idratazione: <span className="text-phosphor-400">100</span>/<span className="text-phosphor-400">100</span></li>
                          <li>Status: <span className={characterSheet.currentHP <= 0 ? 'text-red-400' : characterSheet.currentHP < characterSheet.maxHP * 0.25 ? 'text-red-400' : characterSheet.currentHP < characterSheet.maxHP * 0.5 ? 'text-yellow-400' : 'text-phosphor-400'}>{characterSheet.currentHP <= 0 ? 'Morto' : characterSheet.currentHP < characterSheet.maxHP * 0.25 ? 'Critico' : characterSheet.currentHP < characterSheet.maxHP * 0.5 ? 'Ferito' : 'Normale'}</span></li>
                        </ul>
                        <InventoryPanel />
                      </div>
                    </aside>

                    {/* Colonna centrale */}
                    <section className="flex-1 flex flex-col">
                      <div className="panel flex-1 m-4 flex flex-col">
                        <h2 className="panel-title">MAPPA DEL MONDO</h2>
                        <div className="flex-1 relative min-h-0">
                          <MapViewport className="absolute inset-0" />
                          <Player />
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
                          <li>Ora: <span className={`font-bold ${timeState.isDay ? 'text-phosphor-400' : 'text-blue-400'}`}>{formattedTime}</span> <span className={`font-bold ${timeState.isDay ? 'text-phosphor-400' : 'text-blue-400'}`}>Giorno {timeState.day}</span></li>
                        </ul>
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
                          <div>ARMA: <span className="text-phosphor-400">Nessuna</span></div>
                          <div>ARMATURA: <span className="text-phosphor-400">Nessuna</span></div>
                        </div>
                        <h2 className="panel-title mt-6">COMANDI</h2>
                        <div className="space-y-1 text-uniform">
                          <div>[<strong className="text-phosphor-400">WASD</strong>] Movimento</div>
            <div>[<strong className="text-phosphor-400">I</strong>]nventario</div>
            <div>[<strong className="text-phosphor-400">R</strong>]iposa</div>
            <div>[<strong className="text-phosphor-400">L</strong>]ivella Personaggio</div>
            <div>[<strong className="text-phosphor-400">S</strong>]alva</div>
            <div>[<strong className="text-phosphor-400">C</strong>]arica</div>
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
      </div>
    </div>
  );
};

const AppUI = () => {
  return (
    <>
      <GameLogic />
      <GameContent />
    </>
  );
};

function App() {
  return (
    <GameProvider>
      <AppUI />
    </GameProvider>
  );
}

export default App;
