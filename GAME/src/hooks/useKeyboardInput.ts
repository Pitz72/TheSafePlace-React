
import { useEffect } from 'react';
import { useInputStore } from '../store/inputStore';

type KeyHandlerMap = {
  [key: string]: () => void;
};

/**
 * Custom hook to handle keyboard input.
 * @param {KeyHandlerMap} handlerMap - A map of key codes to handler functions.
 */
export const useKeyboardInput = (handlerMap: KeyHandlerMap) => {
  const currentContext = useInputStore((state) => state.currentContext);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = handlerMap[event.key];

      // Global keys (like ESC) might need to work everywhere, but generally
      // UI components using this hook should only respond if they are "focused"
      // or if the context is appropriate.
      // For now, we assume if this hook is mounted, the component is visible.
      // But we should check if we are in a blocking context (like CUTSCENE) if this is a gameplay UI.

      if (handler) {
        // Prevent default browser actions for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(event.key)) {
          event.preventDefault();
        }
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlerMap, currentContext]);
};
