interface CompassProps {
  size?: number;
  dir?: string;
}

export function Compass({ size = 90, dir: _dir = 'N' }: CompassProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <defs>
        <filter id="rough">
          <feTurbulence baseFrequency="0.05" numOctaves="2" seed="3"/>
          <feDisplacementMap in="SourceGraphic" scale="1.2"/>
        </filter>
      </defs>
      <g filter="url(#rough)" fill="none" stroke="var(--tsp-ink)" strokeWidth="1.1" strokeLinecap="round">
        <circle cx="50" cy="50" r="38" opacity="0.6"/>
        <circle cx="50" cy="50" r="30" opacity="0.4"/>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5) * Math.PI / 180;
          const x1 = 50 + Math.sin(a) * 32, y1 = 50 - Math.cos(a) * 32;
          const x2 = 50 + Math.sin(a) * (i % 4 === 0 ? 38 : 35);
          const y2 = 50 - Math.cos(a) * (i % 4 === 0 ? 38 : 35);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity={i % 4 === 0 ? 0.9 : 0.5}/>;
        })}
        <path d="M50 14 L54 50 L50 86 L46 50 Z" fill="var(--tsp-ink)" stroke="none" opacity="0.85"/>
        <path d="M50 14 L54 50 L46 50 Z" fill="var(--tsp-rust)" stroke="none" opacity="0.9"/>
      </g>
      <text x="50" y="10" textAnchor="middle" fontFamily="var(--tsp-sans)" fontSize="9" fontWeight="600" fill="var(--tsp-ink)" letterSpacing="2">N</text>
      <text x="92" y="53" textAnchor="middle" fontFamily="var(--tsp-sans)" fontSize="9" fontWeight="500" fill="var(--tsp-slate)" letterSpacing="1">E</text>
      <text x="50" y="97" textAnchor="middle" fontFamily="var(--tsp-sans)" fontSize="9" fontWeight="500" fill="var(--tsp-slate)" letterSpacing="1">S</text>
      <text x="8"  y="53" textAnchor="middle" fontFamily="var(--tsp-sans)" fontSize="9" fontWeight="500" fill="var(--tsp-slate)" letterSpacing="1">O</text>
    </svg>
  );
}
