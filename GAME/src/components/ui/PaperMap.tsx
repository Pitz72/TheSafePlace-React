import { Compass } from './Compass';

type MapMood = 'day' | 'night' | 'storm' | 'dawn';

interface PaperMapProps {
  showRoute?: boolean;
  showCompass?: boolean;
  weather?: string;
  mood?: MapMood;
}

export function PaperMap({ showRoute = true, showCompass = true, mood = 'day' }: PaperMapProps) {
  const moodFilter =
    mood === 'night' ? 'brightness(0.55) saturate(0.7) hue-rotate(-10deg)' :
    mood === 'storm' ? 'brightness(0.78) saturate(0.6) contrast(1.05)' :
    mood === 'dawn'  ? 'brightness(0.92) sepia(0.08)' :
    'none';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', filter: moodFilter }}>
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="paperRough">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7"/>
            <feDisplacementMap in="SourceGraphic" scale="2"/>
          </filter>
          <filter id="inkBleed">
            <feGaussianBlur stdDeviation="0.4"/>
          </filter>
          <radialGradient id="vignette">
            <stop offset="60%" stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(20,24,30,0.35)"/>
          </radialGradient>
        </defs>

        {/* paper base */}
        <rect width="600" height="400" fill="#cdcdc2"/>

        {/* fold creases */}
        <line x1="300" y1="0" x2="300" y2="400" stroke="rgba(20,24,30,0.10)" strokeWidth="1"/>
        <line x1="0" y1="133" x2="600" y2="133" stroke="rgba(20,24,30,0.08)" strokeWidth="1"/>
        <line x1="0" y1="266" x2="600" y2="266" stroke="rgba(20,24,30,0.08)" strokeWidth="1"/>

        {/* biome washes */}
        <g filter="url(#paperRough)" opacity="0.55">
          <path d="M 40 30 Q 120 20 200 40 Q 240 80 220 140 Q 160 170 80 150 Q 30 110 40 30 Z" fill="#9aa89a" opacity="0.45"/>
          <path d="M 240 60 Q 360 50 460 70 Q 500 130 450 180 Q 340 200 250 180 Q 210 130 240 60 Z" fill="#c8c2a8" opacity="0.35"/>
          <path d="M 380 200 Q 480 190 560 230 Q 580 290 530 340 Q 440 360 380 320 Q 350 260 380 200 Z" fill="#a8a89e" opacity="0.55"/>
          <path d="M 0 220 Q 100 200 180 240 Q 280 280 380 250 Q 480 220 600 240" fill="none" stroke="#7a8a98" strokeWidth="6" opacity="0.45"/>
          <path d="M 0 220 Q 100 200 180 240 Q 280 280 380 250 Q 480 220 600 240" fill="none" stroke="#5a6a78" strokeWidth="2" opacity="0.55"/>
          <rect x="120" y="290" width="80" height="55" fill="#8a8378" opacity="0.5"/>
        </g>

        {/* contour lines */}
        <g fill="none" stroke="rgba(20,24,30,0.42)" strokeWidth="0.6" filter="url(#inkBleed)">
          <ellipse cx="120" cy="90" rx="60" ry="36" opacity="0.5"/>
          <ellipse cx="120" cy="90" rx="42" ry="24" opacity="0.4"/>
          <ellipse cx="120" cy="90" rx="22" ry="12" opacity="0.35"/>
          <ellipse cx="470" cy="280" rx="80" ry="50" opacity="0.5"/>
          <ellipse cx="470" cy="280" rx="56" ry="34" opacity="0.4"/>
          <ellipse cx="470" cy="280" rx="32" ry="18" opacity="0.35"/>
        </g>

        {/* drawn roads */}
        <g fill="none" stroke="rgba(20,24,30,0.55)" strokeWidth="1.2" strokeDasharray="4 3" filter="url(#inkBleed)">
          <path d="M 60 360 Q 180 320 260 280 Q 340 240 420 220 Q 500 200 560 180"/>
          <path d="M 160 320 Q 200 260 280 220 Q 320 180 360 120"/>
        </g>

        {/* hand-drawn trees */}
        <g fill="none" stroke="var(--tsp-ink)" strokeWidth="1" filter="url(#inkBleed)" opacity="0.7">
          {([[80,70],[120,55],[105,95],[150,80],[90,115],[140,120],[170,100]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <path d={`M ${cx} ${cy+6} L ${cx} ${cy-3}`} strokeWidth="1.2"/>
              <path d={`M ${cx-5} ${cy} Q ${cx} ${cy-9} ${cx+5} ${cy}`}/>
              <path d={`M ${cx-3} ${cy-3} Q ${cx} ${cy-10} ${cx+3} ${cy-3}`}/>
            </g>
          ))}
        </g>

        {/* mountain triangles */}
        <g fill="none" stroke="var(--tsp-ink)" strokeWidth="1" filter="url(#inkBleed)" opacity="0.75">
          {([[420,260],[460,250],[500,265],[480,290],[520,285],[440,300]] as [number,number][]).map(([x,y],i) => (
            <path key={i} d={`M ${x-7} ${y+6} L ${x} ${y-6} L ${x+7} ${y+6} M ${x-3} ${y+2} L ${x-1} ${y} M ${x+1} ${y} L ${x+3} ${y+2}`}/>
          ))}
        </g>

        {/* city ruin */}
        <g fill="none" stroke="var(--tsp-ink)" strokeWidth="1.2" filter="url(#inkBleed)">
          <rect x="135" y="295" width="14" height="38"/>
          <rect x="153" y="305" width="11" height="28"/>
          <rect x="170" y="290" width="16" height="43"/>
          <rect x="190" y="308" width="9" height="25"/>
          <line x1="135" y1="333" x2="199" y2="333" strokeWidth="0.8"/>
        </g>

        {/* player route */}
        {showRoute && (
          <g fill="none" stroke="var(--tsp-rust)" strokeWidth="1.8" filter="url(#inkBleed)">
            <path d="M 80 340 Q 150 310 200 290 Q 250 260 290 230 Q 330 210 370 200" strokeDasharray="6 4" opacity="0.85"/>
          </g>
        )}

        {/* POI markers */}
        <g filter="url(#inkBleed)">
          {/* current position */}
          <circle cx="370" cy="200" r="6" fill="var(--tsp-rust)" stroke="var(--tsp-ink)" strokeWidth="1.2"/>
          <circle cx="370" cy="200" r="12" fill="none" stroke="var(--tsp-rust)" strokeWidth="1" opacity="0.6"/>
          {/* settlement */}
          <g transform="translate(170 318)">
            <rect x="-6" y="-6" width="12" height="12" fill="var(--tsp-paper)" stroke="var(--tsp-ink)" strokeWidth="1.3"/>
            <path d="M -6 -6 L 0 -12 L 6 -6 Z" fill="var(--tsp-paper)" stroke="var(--tsp-ink)" strokeWidth="1.3"/>
          </g>
          {/* shelter */}
          <g transform="translate(290 100)">
            <circle r="8" fill="var(--tsp-paper)" stroke="var(--tsp-ink)" strokeWidth="1.3"/>
            <path d="M -4 0 L 4 0 M 0 -4 L 0 4" stroke="var(--tsp-ink)" strokeWidth="1.4"/>
          </g>
          {/* quest objective */}
          <g transform="translate(485 285)">
            <path d="M 0 -10 L 3 -3 L 10 -3 L 4 2 L 7 9 L 0 5 L -7 9 L -4 2 L -10 -3 L -3 -3 Z" fill="var(--tsp-rust)" opacity="0.85" stroke="var(--tsp-ink)" strokeWidth="0.8"/>
          </g>
        </g>

        {/* place labels */}
        <g fontFamily="var(--tsp-hand)" fill="var(--tsp-ink)" opacity="0.85">
          <text x="100" y="50" fontSize="14" transform="rotate(-3 100 50)">Foresta dei Sospiri</text>
          <text x="280" y="115" fontSize="13" transform="rotate(-2 280 115)">Rifugio · Cap. III</text>
          <text x="160" y="285" fontSize="13" transform="rotate(-2 160 285)">Vecchia Città</text>
          <text x="460" y="245" fontSize="13" transform="rotate(2 460 245)">Le Spine</text>
          <text x="350" y="225" fontSize="11" fill="var(--tsp-rust)" transform="rotate(-1 350 225)">tu sei qui</text>
        </g>

        {/* coffee stain */}
        <ellipse cx="510" cy="60" rx="42" ry="28" fill="rgba(74,52,32,0.18)" filter="url(#paperRough)"/>
        <ellipse cx="510" cy="60" rx="32" ry="20" fill="rgba(74,52,32,0.12)"/>

        {/* vignette */}
        <rect width="600" height="400" fill="url(#vignette)"/>
      </svg>

      {showCompass && (
        <div style={{ position: 'absolute', right: 12, bottom: 10, width: 70, height: 70, opacity: 0.85 }}>
          <Compass size={70}/>
        </div>
      )}

      {mood === 'night' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(22,30,50,0.0) 30%, rgba(22,30,50,0.55) 100%), linear-gradient(rgba(22,30,50,0.35), rgba(22,30,50,0.35))',
          pointerEvents: 'none', mixBlendMode: 'multiply',
        }}/>
      )}
      {mood === 'storm' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(rgba(74,84,96,0.28), rgba(74,84,96,0.28))',
          pointerEvents: 'none', mixBlendMode: 'multiply',
        }}/>
      )}
    </div>
  );
}
