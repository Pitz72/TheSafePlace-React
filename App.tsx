import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { useCharacterStore } from './store/characterStore';
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
import EventScreen from './components/EventScreen';
import CraftingScreen from './components/CraftingScreen';
import LevelUpScreen from './components/LevelUpScreen';
import CombatScreen from './components/CombatScreen';
import { useItemDatabaseStore } from './data/itemDatabase';
import { useEventDatabaseStore } from './data/eventDatabase';
import { useRecipeDatabaseStore } from './data/recipeDatabase';
import { useEnemyDatabaseStore } from './data/enemyDatabase';
import { useMainQuestDatabaseStore } from './data/mainQuestDatabase';
import { useCutsceneDatabaseStore } from './data/cutsceneDatabase';
import MainQuestScreen from './components/MainQuestScreen';
import CutsceneScreen from './components/CutsceneScreen';
import AshLullabyChoiceScreen from './components/AshLullabyChoiceScreen';
import InGameMenuScreen from './components/InGameMenuScreen';
import SaveLoadScreen from './components/SaveLoadScreen';
import { useInteractionStore } from './store/interactionStore';
import { useTalentDatabaseStore } from './data/talentDatabase';
import GameOverScreen from './components/GameOverScreen';
import TrophyScreen from './components/TrophyScreen';
import { useTrophyDatabaseStore } from './data/trophyDatabase';

const App: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setVisualTheme = useGameStore((state) => state.setVisualTheme);
  const isInventoryOpen = useInteractionStore((state) => state.isInventoryOpen);
  const isInRefuge = useInteractionStore((state) => state.isInRefuge);
  const isCraftingOpen = useInteractionStore((state) => state.isCraftingOpen);
  const setMap = useGameStore((state) => state.setMap);
  const initCharacter = useCharacterStore((state) => state.initCharacter);
  const scaleStyle = useGameScale();

  const { loadDatabase: loadItemDatabase, isLoaded: itemsLoaded } = useItemDatabaseStore();
  const { loadDatabase: loadEventDatabase, isLoaded: eventsLoaded } = useEventDatabaseStore();
  const { loadDatabase: loadRecipeDatabase, isLoaded: recipesLoaded } = useRecipeDatabaseStore();
  const { loadDatabase: loadEnemyDatabase, isLoaded: enemiesLoaded } = useEnemyDatabaseStore();
  const { loadDatabase: loadMainQuestDatabase, isLoaded: mainQuestLoaded } = useMainQuestDatabaseStore();
  const { loadDatabase: loadCutsceneDatabase, isLoaded: cutscenesLoaded } = useCutsceneDatabaseStore();
  const { loadDatabase: loadTalentDatabase, isLoaded: talentsLoaded } = useTalentDatabaseStore();
  const { loadDatabase: loadTrophyDatabase, isLoaded: trophiesLoaded } = useTrophyDatabaseStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('tspc_visual_theme') as VisualTheme | null;
    if (savedTheme) {
      setVisualTheme(savedTheme);
    } else {
      setVisualTheme('standard'); // Imposta il tema di default se non ce n'è uno salvato
    }
  }, [setVisualTheme]);

  useEffect(() => {
    loadItemDatabase();
    loadEventDatabase();
    loadRecipeDatabase();
    loadEnemyDatabase();
    loadMainQuestDatabase();
    loadCutsceneDatabase();
    loadTalentDatabase();
    loadTrophyDatabase();
  }, [loadItemDatabase, loadEventDatabase, loadRecipeDatabase, loadEnemyDatabase, loadMainQuestDatabase, loadCutsceneDatabase, loadTalentDatabase, loadTrophyDatabase]);

  useEffect(() => {
    // The game should not automatically start a new game on load.
    // This will be handled by the "New Game" option in the main menu.
  }, [itemsLoaded, eventsLoaded, recipesLoaded, enemiesLoaded, mainQuestLoaded, cutscenesLoaded, talentsLoaded, trophiesLoaded, setMap, initCharacter]);

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
       case GameState.MAIN_QUEST:
        return <MainQuestScreen />;
      case GameState.ASH_LULLABY_CHOICE:
        return <AshLullabyChoiceScreen />;
      case GameState.GAME_OVER:
        return <GameOverScreen />;
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

  return (
    <div className="w-screen h-screen relative bg-black">
      {/* Il Monitor Virtuale */}
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
