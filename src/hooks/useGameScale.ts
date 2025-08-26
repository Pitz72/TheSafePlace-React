import { useState, useEffect, useMemo } from 'react';

// Funzione di utilità per il "debouncing"
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
}

interface GameScale {
  scale: number;
  viewportWidth: number;
  viewportHeight: number;
}

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

export const useGameScale = (): GameScale => {
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Applica il debounce all'handler per evitare troppi re-render
    const debouncedHandleResize = debounce(handleResize, 150); // Attendi 150ms dopo la fine del resize

    window.addEventListener('resize', debouncedHandleResize);
    
    // Esegui subito al mount
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  const scale = useMemo(() => {
    const scaleX = viewportSize.width / GAME_WIDTH;
    const scaleY = viewportSize.height / GAME_HEIGHT;
    return Math.min(scaleX, scaleY);
  }, [viewportSize]);

  useEffect(() => {
    document.documentElement.style.setProperty('--scale-ratio', scale.toString());
  }, [scale]);

  return {
    scale,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
  };
};