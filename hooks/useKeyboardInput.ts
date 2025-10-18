
import { useEffect } from 'react';

type KeyHandlerMap = {
  [key: string]: () => void;
};

/**
 * Custom hook to handle keyboard input.
 * @param {KeyHandlerMap} handlerMap - A map of key codes to handler functions.
 */
export const useKeyboardInput = (handlerMap: KeyHandlerMap) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = handlerMap[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlerMap]);
};
