import type { CSSProperties } from 'react';

interface TapeProps {
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  w?: number;
  h?: number;
  rot?: number;
}

export function Tape({ left, top, right, bottom, w = 80, h = 22, rot = -8 }: TapeProps) {
  const style: CSSProperties = {
    position: 'absolute',
    width: w,
    height: h,
    transform: `rotate(${rot}deg)`,
    background: 'linear-gradient(180deg, rgba(232,225,200,0.65), rgba(208,200,175,0.55))',
    borderLeft: '1px dashed rgba(0,0,0,0.10)',
    borderRight: '1px dashed rgba(0,0,0,0.10)',
    boxShadow: '0 2px 4px rgba(20,24,32,0.20), inset 0 1px 0 rgba(255,255,255,0.15)',
    pointerEvents: 'none',
    zIndex: 6,
  };
  if (left !== undefined) style.left = left;
  if (top !== undefined) style.top = top;
  if (right !== undefined) style.right = right;
  if (bottom !== undefined) style.bottom = bottom;

  return <div style={style} />;
}
