import { useEffect } from 'react';

/** Key (KeyboardEvent.key) -> handler. Missing or undefined keys are ignored. */
export type KeyHandlerMap = Partial<Record<string, (() => void) | undefined>>;

const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Tab']);

/** Listens to keydown while the component is mounted and calls the matching handler. */
export const useKeyboardInput = (handlerMap: KeyHandlerMap) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat && event.key === 'Enter') return;
      const handler = handlerMap[event.key];
      if (!handler) return;
      // Keep the browser from scrolling the page or moving focus.
      if (GAME_KEYS.has(event.key)) event.preventDefault();
      handler();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlerMap]);
};
