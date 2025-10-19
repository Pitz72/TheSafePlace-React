import { useState, useEffect, CSSProperties } from 'react';

// The native resolution of the game. All UI is designed for this size.
const NATIVE_WIDTH = 1920;
const NATIVE_HEIGHT = 1080;

/**
 * Custom hook to calculate the scale and position of the game container.
 * @returns {CSSProperties} The CSS properties to apply to the game container.
 */
export const useGameScale = (): CSSProperties => {
  const [scaleStyle, setScaleStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

      // Define the target container size (95% of the window)
      const targetWidth = windowWidth * 0.95;
      const targetHeight = windowHeight * 0.95;

      // Calculate the scale factor to fit the TARGET container size
      const scale = Math.min(targetWidth / NATIVE_WIDTH, targetHeight / NATIVE_HEIGHT);

      // Calculate the dimensions of the scaled game
      const scaledWidth = NATIVE_WIDTH * scale;
      const scaledHeight = NATIVE_HEIGHT * scale;

      // Calculate the top and left offsets to center the game on the FULL screen
      const offsetX = (windowWidth - scaledWidth) / 2;
      const offsetY = (windowHeight - scaledHeight) / 2;

      setScaleStyle({
        position: 'absolute',
        transform: `scale(${scale})`,
        transformOrigin: 'top left', // Scale from the top-left corner
        left: `${offsetX}px`,
        top: `${offsetY}px`,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return scaleStyle;
};
