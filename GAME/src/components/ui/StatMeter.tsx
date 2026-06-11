
type MeterColor = 'ink' | 'rust' | 'mint' | 'slate';

interface StatMeterProps {
  label: string;
  value?: number;
  max?: number;
  color?: MeterColor;
  showVal?: boolean;
  compact?: boolean;
}

export function StatMeter({ label, value = 80, max = 100, color = 'ink', showVal = true, compact = false }: StatMeterProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tint =
    color === 'rust'  ? 'var(--tsp-rust)'  :
    color === 'mint'  ? 'var(--tsp-mint)'  :
    color === 'slate' ? 'var(--tsp-slate)' :
    'var(--tsp-ink)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 12, width: '100%' }}>
      <div
        className="t-label"
        style={{ width: compact ? 62 : 84, fontSize: compact ? 11 : 12, color: 'var(--tsp-slate)', flex: '0 0 auto' }}
      >
        {label}
      </div>
      <div style={{ flex: 1, position: 'relative', height: compact ? 7 : 9 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(20,24,30,0.18) 0 1.5px, transparent 1.5px 6px)',
          borderTop: '1px solid rgba(20,24,30,0.35)',
          borderBottom: '1px solid rgba(20,24,30,0.35)',
        }} />
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: `${pct}%`,
          backgroundImage: `repeating-linear-gradient(90deg, ${tint} 0 1.5px, transparent 1.5px 6px)`,
          transition: 'width 0.6s ease',
        }} />
      </div>
      {showVal && (
        <div className="t-sans" style={{ fontSize: compact ? 12 : 14, color: 'var(--tsp-ink-faded)', width: compact ? 34 : 46, textAlign: 'right', flex: '0 0 auto' }}>
          {value}<span style={{ color: 'var(--tsp-slate-light)' }}>/{max}</span>
        </div>
      )}
    </div>
  );
}
