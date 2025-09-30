/**
 * useTerminalOptimizations.ts
 * 
 * Hook personalizzato per ottimizzazioni performance del rendering terminale.
 * Implementa memoizzazione, debouncing e cache per migliorare le prestazioni.
 */

import { useMemo, useCallback, useRef } from 'react';

// ===== CONSTANTS =====

const TERMINAL_LAYOUT = {
  SCREEN_WIDTH: 78,
  BORDER_CHARS: {
    TOP_LEFT: '╔',
    TOP_RIGHT: '╗',
    BOTTOM_LEFT: '╚',
    BOTTOM_RIGHT: '╝',
    HORIZONTAL: '═',
    VERTICAL: '║',
    SEPARATOR: '─',
  }
} as const;

// ===== INTERFACES =====

interface TerminalCache {
  borders: Record<string, string>;
  spaces: string[];
  maxWidth: number;
}

// ===== HOOK =====

export const useTerminalOptimizations = () => {
  // Cache for expensive calculations
  const cache = useMemo<TerminalCache>(() => {
    const { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, HORIZONTAL, SEPARATOR } = TERMINAL_LAYOUT.BORDER_CHARS;
    const width = TERMINAL_LAYOUT.SCREEN_WIDTH - 2;
    const maxWidth = TERMINAL_LAYOUT.SCREEN_WIDTH - 4;

    return {
      borders: {
        top: TOP_LEFT + HORIZONTAL.repeat(width) + TOP_RIGHT,
        bottom: BOTTOM_LEFT + HORIZONTAL.repeat(width) + BOTTOM_RIGHT,
        separator: '║' + SEPARATOR.repeat(width) + '║'
      },
      spaces: Array.from({ length: maxWidth + 1 }, (_, i) => ' '.repeat(i)),
      maxWidth
    };
  }, []);

  // Debounced state updates
  const debounceRef = useRef<NodeJS.Timeout>();

  const debounce = useCallback((fn: () => void, delay: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(fn, delay);
  }, []);

  // Optimized border rendering
  const renderBorder = useCallback((type: 'top' | 'bottom' | 'separator') => {
    return cache.borders[type];
  }, [cache.borders]);

  // Optimized line padding
  const renderPaddedLine = useCallback((content: string, align: 'left' | 'center' = 'left') => {
    const { maxWidth, spaces } = cache;
    const trimmed = content.slice(0, maxWidth);
    
    let padded: string;
    if (align === 'center') {
      const padding = Math.max(0, maxWidth - trimmed.length);
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      padded = spaces[leftPad] + trimmed + spaces[rightPad];
    } else {
      const paddingNeeded = Math.max(0, maxWidth - trimmed.length);
      padded = trimmed + spaces[paddingNeeded];
    }
    
    return '║ ' + padded + ' ║';
  }, [cache]);

  // Memoized line renderer
  const renderLines = useCallback((lines: string[], className?: string) => {
    return lines.map((line, index) => ({
      key: `line-${index}`,
      content: line,
      className: className || "font-mono text-sm leading-none"
    }));
  }, []);

  // Performance monitoring
  const performanceRef = useRef({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  const trackPerformance = useCallback((renderFn: () => any) => {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    performanceRef.current.renderCount++;
    performanceRef.current.lastRenderTime = renderTime;
    
    // Calculate rolling average
    const count = performanceRef.current.renderCount;
    const prevAvg = performanceRef.current.averageRenderTime;
    performanceRef.current.averageRenderTime = (prevAvg * (count - 1) + renderTime) / count;
    
    // Log performance in development
    if (import.meta.env.DEV && renderTime > 16) {
      console.warn(`Slow terminal render: ${renderTime.toFixed(2)}ms`);
    }
    
    return result;
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    // Rendering utilities
    renderBorder,
    renderPaddedLine,
    renderLines,
    
    // Performance utilities
    debounce,
    trackPerformance,
    cleanup,
    
    // Cache access
    cache,
    
    // Performance stats
    getPerformanceStats: () => ({ ...performanceRef.current })
  };
};

// ===== UTILITY FUNCTIONS =====

/**
 * Memoizza il risultato di una funzione costosa
 */
export const memoizeExpensive = <T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
};

/**
 * Throttle per limitare la frequenza di aggiornamenti
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T => {
  const lastCallRef = useRef(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      return fn(...args);
    }
  }, [fn, delay]) as T;
};

export default useTerminalOptimizations;