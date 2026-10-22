import React, { useMemo } from 'react';
import Logo from './Logo';
import Icon from './Icon';
import Button from './Button';
import { KEYART, imageUrl, srcSet } from '../images';
import { REPO_URL } from '../constants';

/** Small deterministic random generator: the motes are the same at every visit. */
const createRng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Ash and pollen floating in the warm air, as in the main menu of the game. */
const Motes: React.FC = () => {
  const motes = useMemo(() => {
    const rng = createRng(91);
    return Array.from({ length: 26 }, (_, i) => ({
      left: `${(rng() * 100).toFixed(1)}%`,
      top: `${(50 + rng() * 50).toFixed(1)}%`,
      size: 2 + rng() * 3.5,
      duration: 16 + rng() * 22,
      delay: -rng() * 30,
      dx: `${(rng() * 160 - 40).toFixed(0)}px`,
      opacity: (0.3 + rng() * 0.55).toFixed(2),
      // Half of them only on large screens.
      wide: i % 2 === 1,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {motes.map((mote, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-[#ffd7a0] ${mote.wide ? 'hidden md:block' : ''}`}
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
            boxShadow: `0 0 ${mote.size * 3}px #ffd7a0`,
            opacity: 0,
            animation: `rise ${mote.duration}s linear ${mote.delay}s infinite`,
            ['--dx' as string]: mote.dx,
            ['--o' as string]: mote.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const Hero: React.FC = () => (
  <header id="top" className="relative isolate flex min-h-[100svh] overflow-hidden bg-bg0">
    {/* The key art: the road toward the light, between the ruins. */}
    <div className="anim-fade-in absolute inset-0 -z-10">
      <div className="anim-ken-burns absolute inset-0">
        <picture>
          <source media={KEYART.portraitMedia} srcSet={srcSet(KEYART.portrait.name, KEYART.portrait.widths)} sizes="100vw" type="image/webp" />
          <img
            src={imageUrl(KEYART.landscape.name, 1920)}
            srcSet={srcSet(KEYART.landscape.name, KEYART.landscape.widths)}
            sizes="100vw"
            alt=""
            decoding="async"
            className="h-full w-full object-cover object-[65%_50%]"
          />
        </picture>
      </div>
      <Motes />
      {/* Vignette, and the shade behind the texts: top and bottom on phones, the left side from lg. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_60%_55%,transparent_50%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,11,0.82)_0%,rgba(6,7,11,0.35)_30%,rgba(6,7,11,0)_46%,rgba(6,7,11,0)_60%,rgba(6,7,11,0.88)_86%)] lg:hidden" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(5,6,10,0.86)_0%,rgba(5,6,10,0.6)_30%,rgba(5,6,10,0)_58%)] lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg0" />
    </div>

    <div className="mx-auto flex w-full max-w-7xl flex-col justify-between px-5 pb-12 pt-24 sm:px-8 sm:pb-16 lg:justify-center lg:px-12 lg:pb-16 lg:pt-20">
      <div className="anim-fade-up" style={{ animationDelay: '300ms' }}>
        <Logo />
        <p className="prose-story mt-6 text-center text-lg italic text-ink2 sm:text-xl lg:mt-[clamp(1rem,3.5vh,2rem)] lg:text-left">
          Ogni passo è un’eco. Ogni eco, una scelta.
        </p>
      </div>

      <div className="anim-fade-up mx-auto mt-10 w-full max-w-md lg:mx-0 lg:mt-[clamp(1.25rem,4.5vh,2.5rem)] lg:max-w-xl" style={{ animationDelay: '700ms' }}>
        <p className="hidden text-lg leading-relaxed text-ink2 sm:block sm:text-center lg:text-left">
          Un gioco di ruolo narrativo di sopravvivenza in un’Europa post-apocalittica:
          un viaggio a piedi verso l’ultimo luogo sicuro.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:mt-[clamp(1.25rem,3.5vh,2rem)] lg:justify-start">
          <Button href="#download" icon="download">Scarica gratis</Button>
          <Button href={REPO_URL} variant="secondary" icon="code" external>Codice sorgente</Button>
        </div>
        <p className="mt-6 text-center font-cond text-[13px] font-semibold uppercase tracking-[0.3em] text-ink2 lg:text-left">
          <span className="block sm:inline">Windows · Linux</span>
          <span className="hidden text-ember sm:inline"> · </span>
          <span className="mt-1 block sm:mt-0 sm:inline">Gratuito e open source</span>
        </p>
      </div>
    </div>

    <a
      href="#gioco"
      className="anim-breathe absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink2 hover:text-ink lg:block"
      aria-label="Scopri il gioco"
    >
      <Icon name="chevronDown" size={30} />
    </a>
  </header>
);

export default Hero;
