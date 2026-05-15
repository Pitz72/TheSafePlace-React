import type { CSSProperties } from 'react';

type PinVariant = 'rust' | 'bone' | 'mint' | 'ink';

interface PinProps {
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  variant?: PinVariant;
}

export function Pin({ left, top, right, bottom, variant = 'rust' }: PinProps) {
  const bg =
    variant === 'rust' ? 'radial-gradient(circle at 35% 30%, #a14a32, #4a1f15 70%)' :
    variant === 'bone' ? 'radial-gradient(circle at 35% 30%, #d8d2c2, #888377 70%)' :
    variant === 'mint' ? 'radial-gradient(circle at 35% 30%, #a8c0b6, #4a605a 70%)' :
    'radial-gradient(circle at 35% 30%, #4a5460, #161a22 70%)';

  const style: CSSProperties = {
    position: 'absolute',
    width: 14, height: 14, borderRadius: '50%',
    background: bg,
    boxShadow: '0 3px 4px rgba(0,0,0,0.45), inset 0 -2px 2px rgba(0,0,0,0.3), inset 1.5px 1.5px 1px rgba(255,200,180,0.35)',
    zIndex: 7, pointerEvents: 'none',
  };
  if (left !== undefined) style.left = left;
  if (top !== undefined) style.top = top;
  if (right !== undefined) style.right = right;
  if (bottom !== undefined) style.bottom = bottom;

  return <div style={style} />;
}
