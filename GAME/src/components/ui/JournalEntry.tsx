import type { ReactNode } from 'react';

type EntryTone = 'ink' | 'rust' | 'mint' | 'muted';

interface JournalEntryProps {
  time?: string;
  tone?: EntryTone;
  children: ReactNode;
  hand?: boolean;
}

export function JournalEntry({ time, tone = 'ink', children, hand = false }: JournalEntryProps) {
  const color =
    tone === 'rust'  ? 'var(--tsp-rust)'  :
    tone === 'mint'  ? 'var(--tsp-mint)'  :
    tone === 'muted' ? 'var(--tsp-slate)' :
    'var(--tsp-ink)';

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'baseline' }}>
      {time && (
        <div className="t-sans" style={{ fontSize: 12, color: 'var(--tsp-slate-light)', letterSpacing: '0.1em', minWidth: 42, flex: '0 0 auto', paddingTop: 2 }}>
          {time}
        </div>
      )}
      <div
        className={hand ? 't-hand' : 't-serif'}
        style={{
          fontSize: hand ? 20 : 16,
          lineHeight: hand ? 1.2 : 1.45,
          color,
          fontStyle: tone === 'muted' ? 'italic' : 'normal',
        }}
      >
        {children}
      </div>
    </div>
  );
}
