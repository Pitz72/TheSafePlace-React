import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from './engine/config';

import { GameLayout } from './ui/layout/GameLayout';
import { CharacterCreationScreen } from './ui/screens/CharacterCreationScreen';
import { storyManager } from './narrative/StoryManager';
import { events, GameEvents } from './core/events';
import { useGameStore } from './store/gameStore';
import { GameState } from './types';

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameState = useGameStore((state) => state.gameState);

  useEffect(() => {
    console.log('StoryManager initialized:', storyManager);

    // Load test story
    fetch('/story/test_story.json')
      .then(response => response.json())
      .then(json => {
        // Small delay to ensure everything is ready
        setTimeout(() => {
          events.emit(GameEvents.START_DIALOGUE, json);
        }, 1000);
      });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Initialize Phaser only when IN_GAME and container exists
  useEffect(() => {
    if (gameState === GameState.IN_GAME && !gameRef.current) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        if (document.getElementById('phaser-game')) {
          gameRef.current = new Phaser.Game(gameConfig);
        }
      }, 100);
    }
  }, [gameState]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000'
    }}>
      {/* 16:9 Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1280px',
        aspectRatio: '16/9',
        backgroundColor: '#000',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>

        {gameState === GameState.CHARACTER_CREATION && (
          <CharacterCreationScreen />
        )}

        {gameState === GameState.IN_GAME && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
            <GameLayout>
              <div id="phaser-game" style={{ width: '100%', height: '100%' }} />
            </GameLayout>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
