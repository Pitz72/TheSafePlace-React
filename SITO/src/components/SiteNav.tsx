import React, { useEffect, useState } from 'react';
import { Emblem } from './Logo';

const LINKS = [
  { href: '#gioco', label: 'Il gioco' },
  { href: '#caratteristiche', label: 'Caratteristiche' },
  { href: '#galleria', label: 'Galleria' },
  { href: '#trailer', label: 'Trailer' },
  { href: '#sviluppo', label: 'Sviluppo' },
];

/**
 * Top bar: transparent over the hero, glass once the page scrolls. The brand
 * and the download button appear only then, so they don't repeat the hero.
 */
const SiteNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hidden = scrolled ? '' : 'pointer-events-none opacity-0';

  return (
    <nav
      aria-label="Sezioni del sito"
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${scrolled ? 'border-line bg-bg0/80 backdrop-blur-xl' : 'border-transparent'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <a
          href="#top"
          className={`flex items-center gap-3 transition-opacity duration-300 ${hidden}`}
          tabIndex={scrolled ? undefined : -1}
          aria-hidden={scrolled ? undefined : true}
        >
          <Emblem size={34} className="text-ink" />
          <span className="font-cond text-[15px] font-semibold uppercase tracking-[0.3em] text-ink">The Safe Place</span>
        </a>

        <div className="flex items-center gap-2">
          <ul className="hidden items-center xl:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2 font-cond text-[15px] font-semibold uppercase tracking-[0.16em] text-ink2 transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#download"
            className={`btn btn-primary ml-3 min-h-[40px] rounded-xl px-4 text-[15px] transition-opacity duration-300 ${hidden}`}
            tabIndex={scrolled ? undefined : -1}
            aria-hidden={scrolled ? undefined : true}
          >
            Scarica
          </a>
        </div>
      </div>
    </nav>
  );
};

export default SiteNav;
