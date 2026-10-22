import React from 'react';
import { DOWNLOAD_TARGETS, DOWNLOAD_BASE_URL, REPO_URL, RELEASES_URL, RELEASE_VERSION } from '../constants';
import { DownloadTarget } from '../types';
import Button from './Button';
import Icon from './Icon';
import Reveal from './Reveal';

const DownloadCard: React.FC<{ target: DownloadTarget }> = ({ target }) => {
  return (
    <div className="surface flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line2 bg-white/[0.04] text-ink">
          <Icon name={target.icon} size={28} />
        </span>
        <div>
          <h3 className="title-display text-[2rem] leading-none text-ink">{target.os}</h3>
          <p className="mt-1.5 text-[14px] text-ink3">{target.requirement}</p>
        </div>
      </div>

      <a
        href={`${DOWNLOAD_BASE_URL}${target.primary.file}`}
        download=""
        aria-label={`Scarica ${target.primary.label} per ${target.os} (${target.primary.size})`}
        className="btn btn-primary mt-7 w-full justify-between px-5 normal-case tracking-[0.04em]"
      >
        <span className="flex items-center gap-2.5">
          <Icon name="download" size={20} />
          {target.primary.label}
        </span>
        <span className="text-[15px] opacity-70">{target.primary.size}</span>
      </a>

      {target.secondary && (
        <a
          href={`${DOWNLOAD_BASE_URL}${target.secondary.file}`}
          download=""
          aria-label={`Scarica ${target.secondary.label} per ${target.os} (${target.secondary.size})`}
          className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line2 px-5 py-2.5 text-[15px] text-ink2 transition-colors hover:border-ember/60 hover:bg-ember/[0.08] hover:text-ink"
        >
          <span>
            <span className="block font-cond text-[12px] font-semibold uppercase tracking-[0.18em] text-ink3">Alternativa</span>
            {target.secondary.label}
          </span>
          <span className="shrink-0 whitespace-nowrap text-[14px] text-ink3">{target.secondary.size}</span>
        </a>
      )}

      {target.notice && (
        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-4 text-[14px] leading-relaxed text-ink2">
            <p className="flex items-center gap-2 font-cond text-[13px] font-semibold uppercase tracking-[0.18em] text-gold">
              <Icon name="warning" size={16} />
              Al primo avvio
            </p>
            <p className="mt-2">{target.notice}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const DownloadSection: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {DOWNLOAD_TARGETS.map((target, i) => (
          <Reveal key={target.os} delay={i * 100}>
            <DownloadCard target={target} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14 flex flex-col items-center gap-6 text-center">
        <p className="max-w-2xl text-[17px] leading-relaxed text-ink2">
          Preferisci compilare da sorgente, aprire una issue o dare un’occhiata al codice? Tutto lo sviluppo è aperto e pubblico.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={RELEASES_URL} variant="secondary" external>
            Tutte le release <span className="normal-case">({RELEASE_VERSION})</span>
          </Button>
          <Button href={REPO_URL} variant="secondary" external>Repository open source</Button>
        </div>
      </Reveal>
    </>
  );
};

export default DownloadSection;
