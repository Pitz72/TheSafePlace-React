import { useState, useEffect } from 'react';

interface GameScale {
  scale: number;
  gameWidth: number;
  gameHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.0;

export const useGameScale = (): GameScale => {
  const [scale, setScale] = useState<number>(1);
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);

  const calculateGameScale = (width: number, height: number): number => {
    // Riduci lo spazio utilizzabile del 10% per creare un margine
    const usableWidth = width * 0.9;
    const usableHeight = height * 0.9;
    
    const scaleX = usableWidth / GAME_WIDTH;
    const scaleY = usableHeight / GAME_HEIGHT;
    
    // Usa il fattore di scala minore per mantenere le proporzioni
    const calculatedScale = Math.min(scaleX, scaleY);
    
    // Limita il scale tra MIN_SCALE e MAX_SCALE
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, calculatedScale));
  };

  const updateScale = () => {
    const newViewportWidth = window.innerWidth;
    const newViewportHeight = window.innerHeight;
    
    setViewportWidth(newViewportWidth);
    setViewportHeight(newViewportHeight);
    
    const newScale = calculateGameScale(newViewportWidth, newViewportHeight);
    setScale(newScale);
    
    // Aggiorna le CSS variables in tempo reale
    document.documentElement.style.setProperty('--scale-ratio', newScale.toString());
    document.documentElement.style.setProperty('--game-width', `${GAME_WIDTH}px`);
    document.documentElement.style.setProperty('--game-height', `${GAME_HEIGHT}px`);
  };

  useEffect(() => {
    // Calcolo iniziale
    updateScale();
    
    // Event listener per resize
    const handleResize = () => {
      updateScale();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    scale,
    gameWidth: GAME_WIDTH,
    gameHeight: GAME_HEIGHT,
    viewportWidth,
    viewportHeight
  };
};