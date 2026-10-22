import React from 'react';
import { Emblem } from './Logo';
import { REPO_URL } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line bg-bg0">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center sm:px-8 md:flex-row md:items-start md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Emblem size={44} className="text-ink" />
          <div>
            <p className="font-cond text-[14px] font-semibold uppercase tracking-[0.32em] text-ink">The Safe Place Chronicles</p>
            <p className="title-display mt-1 text-xl italic text-ink2">The Echo of the Journey</p>
          </div>
        </div>
        <div className="space-y-2 text-[14px] leading-relaxed text-ink3 md:text-right">
          <p>
            © 2025–2026 Runtime Radio · un gioco di Simone Pizzi, sviluppato con il supporto di un LLM.
          </p>
          <p>
            Progetto open source ·{' '}
            <a href={REPO_URL} className="whitespace-nowrap text-ink2 underline decoration-line3 underline-offset-4 transition-colors hover:text-ink hover:decoration-ember" target="_blank" rel="noopener noreferrer">
              github.com/Pitz72/TheSafePlace-React
            </a>
          </p>
          <p>
            Caratteri Barlow, Cormorant Garamond e Literata ·{' '}
            <a href="/fonts/OFL.txt" className="whitespace-nowrap text-ink2 underline decoration-line3 underline-offset-4 transition-colors hover:text-ink hover:decoration-ember">
              SIL Open Font License
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
