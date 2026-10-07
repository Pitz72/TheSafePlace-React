import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { GameState, VisualTheme } from './types';
import { useGameScale } from './hooks/useGameScale';
import BootScreen from './components/BootScreen';
import MainMenuScreen from './components/MainMenuScreen';
import InstructionsScreen from './components/InstructionsScreen';
import StoryScreen from './components/StoryScreen';
import OptionsScreen from './components/OptionsScreen';
import GameScreen from './components/GameScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import InventoryScreen from './components/InventoryScreen';
import RefugeScreen from './components/RefugeScreen';
import OutpostScreen from './components/OutpostScreen';
import EventScreen from './components/EventScreen';
import CraftingScreen from './components/CraftingScreen';
import LevelUpScreen from './components/LevelUpScreen';
import CombatScreen from './components/CombatScreen';
import QuestScreen from './components/QuestScreen';
import DialogueScreen from './components/DialogueScreen';
import TradeScreen from './components/TradeScreen';
import MainStoryScreen from './components/MainStoryScreen';
import CutsceneScreen from './components/CutsceneScreen';
import AshLullabyChoiceScreen from './components/AshLullabyChoiceScreen';
import InGameMenuScreen from './components/InGameMenuScreen';
import SaveLoadScreen from './components/SaveLoadScreen';
import GameOverScreen from './components/GameOverScreen';
import VictoryScreen from './components/VictoryScreen';
import TrophyScreen from './components/TrophyScreen';
import ErrorScreen from './components/ErrorScreen';
import GameErrorBoundary from './components/GameErrorBoundary';
import { useInteractionStore } from './store/interactionStore';
import { loadAllGameData } from './data/loadAllGameData';
import { inkStoryData } from './data/inkStoryDatabase';
import { narrativeService } from './services/NarrativeService';

const THEMES: VisualTheme[] = ['standard', 'crt', 'high_contrast'];

const App: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setVisualTheme = useGameStore((state) => state.setVisualTheme);
  const isInventoryOpen = useInteractionStore((state) => state.isInventoryOpen);
  const isInRefuge = useInteractionStore((state) => state.isInRefuge);
  const isCraftingOpen = useInteractionStore((state) => state.isCraftingOpen);
  const scaleStyle = useGameScale();

  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let savedTheme: string | null = null;
    try {
      savedTheme = localStorage.getItem('tspc_visual_theme');
    } catch {
      savedTheme = null;
    }
    setVisualTheme(THEMES.includes(savedTheme as VisualTheme) ? savedTheme as VisualTheme : 'standard');
  }, [setVisualTheme]);

  useEffect(() => {
    let cancelled = false;
    loadAllGameData()
      .then(() => {
        narrativeService.initialize(inkStoryData);
        if (!cancelled) setIsLoading(false);
      })
      .catch((error: unknown) => {
        console.error('Errore caricamento database:', error);
        if (cancelled) return;
        setLoadingError(
          'Impossibile caricare i dati di gioco.\n' +
          (error instanceof Error ? error.message : String(error))
        );
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.INITIAL_BLACK_SCREEN:
      case GameState.PRESENTS_SCREEN:
      case GameState.INTERSTITIAL_BLACK_SCREEN:
      case GameState.BOOTING_SCREEN:
        return <BootScreen />;
      case GameState.MAIN_MENU:
        return <MainMenuScreen />;
      case GameState.INSTRUCTIONS_SCREEN:
        return <InstructionsScreen />;
      case GameState.STORY_SCREEN:
        return <StoryScreen />;
      case GameState.OPTIONS_SCREEN:
        return <OptionsScreen />;
      case GameState.TROPHY_SCREEN:
        return <TrophyScreen />;
      case GameState.SAVE_GAME:
        return <SaveLoadScreen mode="save" />;
      case GameState.LOAD_GAME:
        return <SaveLoadScreen mode="load" />;
      case GameState.CUTSCENE:
        return <CutsceneScreen />;
      case GameState.CHARACTER_CREATION:
        return <CharacterCreationScreen />;
      case GameState.EVENT_SCREEN:
        return <EventScreen />;
      case GameState.LEVEL_UP_SCREEN:
        return <LevelUpScreen />;
      case GameState.MAIN_STORY:
        return <MainStoryScreen />;
      case GameState.ASH_LULLABY_CHOICE:
        return <AshLullabyChoiceScreen />;
      case GameState.GAME_OVER:
        return <GameOverScreen />;
      case GameState.VICTORY:
        return <VictoryScreen />;
      case GameState.QUEST_LOG:
        return <QuestScreen />;
      case GameState.OUTPOST:
        return <OutpostScreen />;
      case GameState.DIALOGUE:
        return <DialogueScreen />;
      case GameState.TRADING:
        return <TradeScreen />;
      case GameState.COMBAT:
        return (
          <>
            <GameScreen />
            <CombatScreen />
          </>
        );
      case GameState.PAUSE_MENU:
        return (
          <>
            <GameScreen />
            <InGameMenuScreen />
          </>
        );
      case GameState.IN_GAME:
        return (
          <>
            <GameScreen />
            {isInventoryOpen && <InventoryScreen />}
            {isInRefuge && !isInventoryOpen && !isCraftingOpen && <RefugeScreen />}
            {isCraftingOpen && <CraftingScreen />}
          </>
        );
      default:
        return null;
    }
  };

  if (loadingError) {
    return <ErrorScreen message={loadingError} onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-5xl text-[var(--text-primary)] font-bold animate-pulse mb-4">
            CARICAMENTO...
          </p>
          <p className="text-2xl text-[var(--text-secondary)] opacity-70">
            Inizializzazione database di gioco
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative bg-black">
      <div
        id="game-container"
        className="bg-[var(--bg-primary)] overflow-hidden"
        style={{
          width: '1920px',
          height: '1080px',
          ...scaleStyle
        }}
      >
        <div className="w-full h-full relative">
          <GameErrorBoundary>{renderContent()}</GameErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default App;
