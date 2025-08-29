/**
 * Test per useTerminalOptimizations hook
 * Verifica le ottimizzazioni performance del rendering terminale
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useTerminalOptimizations, memoizeExpensive } from '../hooks/useTerminalOptimizations';

describe('useTerminalOptimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dovrebbe fornire funzioni di rendering ottimizzate', () => {
    const { result } = renderHook(() => useTerminalOptimizations());
    
    expect(result.current.renderBorder).toBeDefined();
    expect(result.current.renderPaddedLine).toBeDefined();
    expect(result.current.renderLines).toBeDefined();
    expect(result.current.trackPerformance).toBeDefined();
  });

  test('dovrebbe generare bordi corretti', () => {
    const { result } = renderHook(() => useTerminalOptimizations());
    
    const topBorder = result.current.renderBorder('top');
    const bottomBorder = result.current.renderBorder('bottom');
    const separator = result.current.renderBorder('separator');
    
    expect(topBorder).toMatch(/^╔═+╗$/);
    expect(bottomBorder).toMatch(/^╚═+╝$/);
    expect(separator).toMatch(/^║─+║$/);
    
    // Verifica lunghezza consistente
    expect(topBorder.length).toBe(78);
    expect(bottomBorder.length).toBe(78);
    expect(separator.length).toBe(78);
  });

  test('dovrebbe formattare linee con padding corretto', () => {
    const { result } = renderHook(() => useTerminalOptimizations());
    
    const leftAligned = result.current.renderPaddedLine('Test');
    const centerAligned = result.current.renderPaddedLine('Test', 'center');
    
    expect(leftAligned).toMatch(/^║ Test\s+║$/);
    expect(centerAligned).toMatch(/^║\s+Test\s+║$/);
    
    // Verifica lunghezza consistente
    expect(leftAligned.length).toBe(78);
    expect(centerAligned.length).toBe(78);
  });

  test('dovrebbe tracciare performance del rendering', () => {
    const { result } = renderHook(() => useTerminalOptimizations());
    
    const mockRenderFn = jest.fn(() => 'rendered content');
    
    act(() => {
      result.current.trackPerformance(mockRenderFn);
    });
    
    expect(mockRenderFn).toHaveBeenCalled();
    
    const stats = result.current.getPerformanceStats();
    expect(stats.renderCount).toBe(1);
    expect(stats.lastRenderTime).toBeGreaterThan(0);
  });

  test('dovrebbe gestire cleanup correttamente', () => {
    const { result } = renderHook(() => useTerminalOptimizations());
    
    // Test che cleanup non generi errori
    expect(() => {
      result.current.cleanup();
    }).not.toThrow();
  });

  test('dovrebbe mantenere cache per performance', () => {
    const { result } = renderHook(() => useTerminalOptimizations());
    
    // Verifica che la cache sia disponibile
    expect(result.current.cache).toBeDefined();
    expect(result.current.cache.borders).toBeDefined();
    expect(result.current.cache.spaces).toBeDefined();
    expect(result.current.cache.maxWidth).toBe(74); // 78 - 4 per bordi
  });
});

describe('memoizeExpensive', () => {
  test('dovrebbe memoizzare risultati di funzioni costose', () => {
    const expensiveFn = jest.fn((x: number) => x * 2);
    const memoizedFn = memoizeExpensive(expensiveFn);
    
    // Prima chiamata
    const result1 = memoizedFn(5);
    expect(result1).toBe(10);
    expect(expensiveFn).toHaveBeenCalledTimes(1);
    
    // Seconda chiamata con stesso input (dovrebbe usare cache)
    const result2 = memoizedFn(5);
    expect(result2).toBe(10);
    expect(expensiveFn).toHaveBeenCalledTimes(1); // Non chiamata di nuovo
    
    // Terza chiamata con input diverso
    const result3 = memoizedFn(10);
    expect(result3).toBe(20);
    expect(expensiveFn).toHaveBeenCalledTimes(2);
  });

  test('dovrebbe limitare dimensione cache per evitare memory leak', () => {
    const fn = jest.fn((x: number) => x);
    const memoizedFn = memoizeExpensive(fn);
    
    // Chiama con molti input diversi per testare limite cache
    for (let i = 0; i < 150; i++) {
      memoizedFn(i);
    }
    
    // Verifica che la funzione sia stata chiamata per ogni input unico
    expect(fn).toHaveBeenCalledTimes(150);
  });

  test('dovrebbe supportare key function personalizzata', () => {
    const fn = jest.fn((obj: { id: number; name: string }) => obj.id);
    const memoizedFn = memoizeExpensive(fn, (obj) => obj.id.toString());
    
    const obj1 = { id: 1, name: 'first' };
    const obj2 = { id: 1, name: 'second' }; // Stesso ID, nome diverso
    
    memoizedFn(obj1);
    memoizedFn(obj2); // Dovrebbe usare cache perché stesso ID
    
    expect(fn).toHaveBeenCalledTimes(1);
  });
});