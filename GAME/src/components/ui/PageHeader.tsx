interface PageHeaderProps {
  chapter?: number | string;
  day?: number | string;
  time?: string;
  location: string;
  weather?: string;
}

export function PageHeader({ chapter, day, time, location, weather }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid var(--tsp-ink)', paddingBottom: 8, marginBottom: 14 }}>
      <div>
        {chapter != null && (
          <div className="t-label" style={{ fontSize: 9, marginBottom: 3 }}>Capitolo {chapter}</div>
        )}
        <div className="t-serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1, letterSpacing: '0.01em' }}>{location}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {weather && (
          <div className="t-hand" style={{ fontSize: 16, color: 'var(--tsp-slate)', lineHeight: 1 }}>{weather}</div>
        )}
        {(day != null || time) && (
          <div className="t-sans" style={{ fontSize: 11, color: 'var(--tsp-ink-faded)', letterSpacing: '0.18em', marginTop: 4 }}>
            {day != null && `GIORNO ${day}`}{day != null && time && ' · '}{time}
          </div>
        )}
      </div>
    </div>
  );
}
