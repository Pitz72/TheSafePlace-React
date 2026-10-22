import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { GameState, VisualTheme } from './types';
import { useGameScale } from './hooks/useGameScale';
import { useAmbience } from './hooks/useAmbience';
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
import { Emblem } from './components/art/Logo';
import ScreenBackdrop from './components/ui/ScreenBackdrop';

const THEMES: VisualTheme[] = ['standard', 'high_contrast'];

const App: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const previousGameState = useGameStore((state) => state.previousGameState);
  const setVisualTheme = useGameStore((state) => state.setVisualTheme);
  const isInventoryOpen = useInteractionStore((state) => state.isInventoryOpen);
  const isInRefuge = useInteractionStore((state) => state.isInRefuge);
  const isCraftingOpen = useInteractionStore((state) => state.isCraftingOpen);
  const scaleStyle = useGameScale();
  useAmbience();

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
    // Overlays of the journey keep the game visible (blurred) behind them; options
    // and saves do the same when they come from the pause menu.
    const behindMenu = previousGameState === GameState.PAUSE_MENU ? <GameScreen /> : <ScreenBackdrop />;
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
        return <>{behindMenu}<OptionsScreen /></>;
      case GameState.TROPHY_SCREEN:
        return <TrophyScreen />;
      case GameState.SAVE_GAME:
        return <>{behindMenu}<SaveLoadScreen mode="save" /></>;
      case GameState.LOAD_GAME:
        return <>{behindMenu}<SaveLoadScreen mode="load" /></>;
      case GameState.CUTSCENE:
        return <CutsceneScreen />;
      case GameState.CHARACTER_CREATION:
        return <CharacterCreationScreen />;
      case GameState.EVENT_SCREEN:
        return <><GameScreen /><EventScreen /></>;
      case GameState.LEVEL_UP_SCREEN:
        return <><GameScreen /><LevelUpScreen /></>;
      case GameState.MAIN_STORY:
        return <MainStoryScreen />;
      case GameState.ASH_LULLABY_CHOICE:
        return <><GameScreen /><AshLullabyChoiceScreen /></>;
      case GameState.GAME_OVER:
        return <GameOverScreen />;
      case GameState.VICTORY:
        return <VictoryScreen />;
      case GameState.QUEST_LOG:
        return <><GameScreen /><QuestScreen /></>;
      case GameState.OUTPOST:
        return <><GameScreen /><OutpostScreen /></>;
      case GameState.DIALOGUE:
        return <><GameScreen /><DialogueScreen /></>;
      case GameState.TRADING:
        return <><GameScreen /><TradeScreen /></>;
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
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-bg0">
        <div className="relative">
          <Emblem size={84} className="text-ink2 anim-breathe" />
          <div className="absolute -inset-3 rounded-full border-2 border-transparent border-t-ember/70 anim-spin" />
        </div>
        <p className="eyebrow">Caricamento</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-bg0">
      <div
        id="game-container"
        className="overflow-hidden"
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
