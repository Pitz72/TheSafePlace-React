import React, { useId } from 'react';

/**
 * The emblem: a road that runs to a door of light inside a rising sun, with
 * the echoes spreading above it. The journey, the Safe Place, the echo.
 */
export const Emblem: React.FC<{ size?: number; className?: string; ring?: boolean; simple?: boolean }> = ({ size = 72, className = '', ring = true, simple = false }) => {
    // Small sizes (favicons): fewer, thicker lines.
    const line = simple ? 4.5 : 2;
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const sun = `sun-${uid}`;
    const clip = `clip-${uid}`;
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={sun} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6c27a" />
                    <stop offset="1" stopColor="#e2793a" />
                </linearGradient>
                <clipPath id={clip}>
                    <circle cx="50" cy="50" r="43" />
                </clipPath>
            </defs>
            {ring && <circle cx="50" cy="50" r={simple ? 45 : 46.5} fill="none" stroke="currentColor" strokeWidth={line} opacity="0.9" />}
            <g clipPath={`url(#${clip})`}>
                {/* Echoes. */}
                <path d="M23 58a27 27 0 0 1 54 0" fill="none" stroke="#e8893f" strokeWidth={simple ? 4 : 2} opacity="0.75" />
                {!simple && <path d="M15 58a35 35 0 0 1 70 0" fill="none" stroke="#e8893f" strokeWidth="1.6" opacity="0.4" />}
                {/* Sun and the door of light. */}
                <path d="M30 58a20 20 0 0 1 40 0z" fill={`url(#${sun})`} />
                <path d="M45.2 58v-7.4a4.8 4.8 0 0 1 9.6 0V58z" fill="#fff4dc" />
                {/* Horizon and the road. */}
                <path d="M6 58h88" stroke="currentColor" strokeWidth={line} />
                <path d="M47.6 58L33 100M52.4 58L67 100" stroke="currentColor" strokeWidth={line} fill="none" />
                {!simple && <path d="M50 63v4M50 72v6M50 84v9" stroke="#e8893f" strokeWidth="1.8" strokeLinecap="round" />}
            </g>
        </svg>
    );
};

interface LogoProps {
    /** 'stacked': emblem, series name and title one under the other. 'inline': compact, emblem on the left. */
    layout?: 'stacked' | 'inline';
    /** Scale of the whole logo (1 = main menu size). */
    scale?: number;
    align?: 'left' | 'center';
    className?: string;
}

/** Game logo: emblem, "THE SAFE PLACE CHRONICLES", "The Echo of the Journey". */
const Logo: React.FC<LogoProps> = ({ layout = 'stacked', scale = 1, align = 'left', className = '' }) => {
    if (layout === 'inline') {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                <Emblem size={52 * scale} className="text-ink" />
                <div>
                    <div className="font-cond font-semibold uppercase text-ink2" style={{ fontSize: 13 * scale, letterSpacing: '0.38em' }}>The Safe Place Chronicles</div>
                    <div className="title-display italic text-ink" style={{ fontSize: 34 * scale, fontWeight: 500 }}>The Echo of the Journey</div>
                </div>
            </div>
        );
    }
    const center = align === 'center';
    return (
        <div className={`flex flex-col ${center ? 'items-center text-center' : 'items-start'} ${className}`}>
            <Emblem size={78 * scale} className="text-ink" />
            <div
                className="mt-7 flex items-center font-cond font-semibold uppercase text-ink2"
                style={{ fontSize: 19 * scale, letterSpacing: '0.42em', gap: 14 * scale }}
            >
                <span className="text-ink">The Safe Place</span>
                <span className="h-px bg-ember" style={{ width: 34 * scale }} />
                <span>Chronicles</span>
            </div>
            <h1 className="title-display mt-3 italic text-ink" style={{ fontSize: 104 * scale, fontWeight: 500, lineHeight: 0.92 }}>
                The Echo
                <span className="block" style={{ paddingLeft: center ? 0 : 0.5 * 104 * scale * 0.5 }}>
                    <span className="text-ink2" style={{ fontSize: '0.62em' }}>of the </span>Journey
                </span>
            </h1>
        </div>
    );
};

export default Logo;
