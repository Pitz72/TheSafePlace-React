/**
 * CRT Renderer - Sistema di rendering canvas ottimizzato per performance
 * Gestisce il rendering del mondo di gioco con stile CRT
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useCRTTheme } from '../theme/crtTheme';

interface CRTRendererProps {
  width: number;
  height: number;
  pixelRatio?: number;
  className?: string;
  onRender?: (ctx: CanvasRenderingContext2D, deltaTime: number) => void;
}

export const CRTRenderer: React.FC<CRTRendererProps> = ({
  width,
  height,
  pixelRatio = window.devicePixelRatio || 1,
  className = '',
  onRender
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const { classes } = useCRTTheme();

  const render = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !onRender) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Clear canvas with CRT background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Apply CRT filter
    ctx.filter = 'contrast(1.1) brightness(1.1) saturate(1.2)';

    // Call render callback
    onRender(ctx, deltaTime);

    // Reset filter
    ctx.filter = 'none';

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(render);
  }, [width, height, onRender]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size with pixel ratio for crisp rendering
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
      // Enable image smoothing for better text rendering
      ctx.imageSmoothingEnabled = false;
    }

    // Start render loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, pixelRatio, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`crt-filter ${classes.scanlines} ${className}`}
      style={{
        imageRendering: 'pixelated',
        backgroundColor: '#000000'
      }}
    />
  );
};

/**
 * Utility functions per rendering CRT-style
 */
export const CRTRenderUtils = {
  /**
   * Disegna testo con effetto CRT
   */
  drawCRTText: (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options: {
      fontSize?: number;
      color?: string;
      glow?: boolean;
      align?: 'left' | 'center' | 'right';
    } = {}
  ) => {
    const {
      fontSize = 16,
      color = '#00ff00',
      glow = false,
      align = 'left'
    } = options;

    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';

    if (glow) {
      // Draw glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeText(text, x, y);
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  },

  /**
   * Disegna un rettangolo con stile CRT
   */
  drawCRTRect: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      fillColor?: string;
      strokeColor?: string;
      glow?: boolean;
      lineWidth?: number;
    } = {}
  ) => {
    const {
      fillColor = 'rgba(0, 255, 0, 0.1)',
      strokeColor = '#00ff00',
      glow = false,
      lineWidth = 1
    } = options;

    if (glow) {
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 4;
    }

    // Fill
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    // Stroke
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);

    // Reset shadow
    ctx.shadowBlur = 0;
  },

  /**
   * Disegna una linea con effetto scanline
   */
  drawCRTLine: (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: {
      color?: string;
      lineWidth?: number;
      glow?: boolean;
    } = {}
  ) => {
    const {
      color = '#00ff00',
      lineWidth = 1,
      glow = false
    } = options;

    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 2;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.shadowBlur = 0;
  },

  /**
   * Crea effetto scanline sul canvas
   */
  applyScanlines: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Applica effetto scanline ogni 4 righe
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        // Riduci luminosità delle righe pari
        if (y % 8 === 0) {
          data[index] *= 0.9;     // R
          data[index + 1] *= 0.9; // G
          data[index + 2] *= 0.9; // B
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  },

  /**
   * Applica effetto flicker casuale
   */
  applyFlicker: (ctx: CanvasRenderingContext2D, intensity: number = 0.02) => {
    const flicker = 1 + (Math.random() - 0.5) * intensity;
    ctx.globalAlpha = flicker;
  }
};