import type { ReactNode } from 'react';

interface ResourceLineProps {
  label: string;
  val: ReactNode;
  max?: ReactNode;
  accent?: boolean;
}

export function ResourceLine({ label, val, max, accent }: ResourceLineProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px dashed rgba(20,24,30,0.25)', padding: '4px 0' }}>
      <span className="t-label" style={{ fontSize: 10 }}>{label}</span>
      <span className="t-serif" style={{ fontSize: 15, color: accent ? 'var(--tsp-rust)' : 'var(--tsp-ink)' }}>
        {val}{max != null && <span style={{ color: 'var(--tsp-slate-light)', fontSize: 12 }}> / {max}</span>}
      </span>
    </div>
  );
}
