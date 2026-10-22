import React, { useId } from 'react';

/**
 * The emblem of the game (GAME/src/components/art/Logo.tsx): a road that runs
 * to a door of light inside a rising sun, with the echoes spreading above it.
 */
export const Emblem: React.FC<{ size?: number; className?: string }> = ({ size = 72, className = '' }) => {
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
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <g clipPath={`url(#${clip})`}>
        {/* Echoes. */}
        <path d="M23 58a27 27 0 0 1 54 0" fill="none" stroke="#e8893f" strokeWidth="2" opacity="0.75" />
        <path d="M15 58a35 35 0 0 1 70 0" fill="none" stroke="#e8893f" strokeWidth="1.6" opacity="0.4" />
        {/* Sun and the door of light. */}
        <path d="M30 58a20 20 0 0 1 40 0z" fill={`url(#${sun})`} />
        <path d="M45.2 58v-7.4a4.8 4.8 0 0 1 9.6 0V58z" fill="#fff4dc" />
        {/* Horizon and the road. */}
        <path d="M6 58h88" stroke="currentColor" strokeWidth="2" />
        <path d="M47.6 58L33 100M52.4 58L67 100" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M50 63v4M50 72v6M50 84v9" stroke="#e8893f" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

/**
 * Game logo as the page title: emblem, "THE SAFE PLACE — CHRONICLES",
 * "The Echo of the Journey". Centered on phones, aligned left from `lg`.
 * From `sm` it shrinks on short screens (laptops, phones held sideways) so
 * the hero stays above the fold.
 */
const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-col items-center text-center lg:items-start lg:text-left ${className}`}>
    <Emblem className="h-16 w-16 text-ink sm:h-[clamp(48px,11vh,72px)] sm:w-[clamp(48px,11vh,72px)] lg:h-[clamp(52px,8.7vh,78px)] lg:w-[clamp(52px,8.7vh,78px)]" />
    <h1 className="mt-6 lg:mt-[clamp(1rem,3vh,1.75rem)]">
      <span className="flex items-center justify-center gap-3 font-cond text-[13px] font-semibold uppercase tracking-[0.42em] text-ink2 sm:text-[16px] lg:justify-start lg:gap-[14px] lg:text-[19px]">
        <span className="text-ink">The Safe Place</span>
        <span className="h-px w-6 bg-ember lg:w-[34px]" aria-hidden="true" />
        {/* The negative margin cancels the tracking after the last letter, so the line stays centered. */}
        <span className="-mr-[0.42em] lg:mr-0">Chronicles</span>
      </span>
      <span className="sr-only">: </span>
      <span className="title-display mt-3 block text-[clamp(3.4rem,13vw,4.6rem)] font-medium italic leading-[0.92] text-ink sm:text-[clamp(3.4rem,14vh,5.5rem)] lg:text-[clamp(4.25rem,11.5vh,6.5rem)]">
        The Echo
        <span className="block lg:pl-[0.25em]">
          <span className="text-[0.62em] text-ink2">of the </span>Journey
        </span>
      </span>
    </h1>
  </div>
);

export default Logo;
