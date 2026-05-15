import type { CSSProperties } from 'react';

type StampColor = 'rust' | 'ink' | 'slate';

interface StampProps {
  children: React.ReactNode;
  rotate?: number;
  color?: StampColor;
  style?: CSSProperties;
}

export function Stamp({ children, rotate = -4, color = 'rust', style }: StampProps) {
  const c =
    color === 'rust'  ? 'var(--tsp-rust)'  :
    color === 'ink'   ? 'var(--tsp-ink)'   :
    'var(--tsp-slate)';

  return (
    <div style={{
      display: 'inline-block',
      fontFamily: 'var(--tsp-sans)',
      textTransform: 'uppercase',
      letterSpacing: '0.32em',
      fontWeight: 700,
      fontSize: 14,
      color: c,
      border: `2.5px solid ${c}`,
      padding: '5px 12px 3px',
      transform: `rotate(${rotate}deg)`,
      opacity: 0.74,
      ...style,
    }}>
      {children}
    </div>
  );
}
