import { useState, useEffect, useMemo } from 'react';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced;
}

export const useGameScale = () => {
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    const debouncedHandleResize = debounce(handleResize, 150);
    window.addEventListener('resize', debouncedHandleResize);
    handleResize();
    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, []);

  const scale = useMemo(() => {
    const usableWidth = viewportSize.width * 0.9;
    const usableHeight = viewportSize.height * 0.9;
    const scaleX = usableWidth / 1920;
    const scaleY = usableHeight / 1080;
    return Math.max(0.4, Math.min(1.0, Math.min(scaleX, scaleY)));
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