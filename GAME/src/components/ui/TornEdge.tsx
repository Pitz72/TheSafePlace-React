import { useMemo } from 'react';

interface TornEdgeProps {
  side?: 'top' | 'bottom';
  color?: string;
  h?: number;
}

export function TornEdge({ side = 'bottom', color = 'var(--tsp-paper)', h = 12 }: TornEdgeProps) {
  const pts = useMemo(() => {
    const n = 24;
    const arr: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * 100;
      const y = side === 'bottom'
        ? (Math.sin(i * 1.7) * 0.35 + Math.random() * 0.3) * h
        : h - (Math.sin(i * 2.1) * 0.35 + Math.random() * 0.3) * h;
      arr.push(`${x},${y}`);
    }
    return arr.join(' ');
  }, [side, h]);

  const anchor = side === 'bottom' ? 0 : h;

  return (
    <svg
      viewBox={`0 0 100 ${h}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, [side]: -h + 1, height: h, width: '100%', display: 'block' }}
    >
      <polygon points={`0,${anchor} ${pts} 100,${anchor}`} fill={color} />
    </svg>
  );
}
