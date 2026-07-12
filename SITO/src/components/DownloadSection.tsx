import React from 'react';
import { DOWNLOAD_TARGETS, DOWNLOAD_BASE_URL, REPO_URL, RELEASES_URL, RELEASE_VERSION } from '../constants';
import { DownloadTarget } from '../types';
import Button from './Button';

const DownloadCard: React.FC<{ target: DownloadTarget }> = ({ target }) => {
  return (
    <div className="flex flex-col border-2 border-[#28cc28] bg-[rgba(51,255,51,0.04)] p-6 transition-all duration-300 ease-in-out hover:border-[#33ff33] hover:shadow-[0_0_15px_rgba(51,255,51,0.3)]">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-5xl leading-none text-[#33ff33] text-glow" aria-hidden="true">{target.icon}</span>
        <div>
          <h3 className="text-3xl text-[#ccffcc] text-glow leading-none">{target.os}</h3>
          <p className="text-sm text-[#28cc28] mt-1">{target.requirement}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <a
          href={`${DOWNLOAD_BASE_URL}${target.primary.file}`}
          download=""
          className="block text-center px-5 py-3 border-2 border-[#33ff33] text-[#33ff33] text-lg text-glow transition-all duration-300 hover:bg-[#33ff33] hover:text-[#050a05] hover:shadow-[0_0_25px_rgba(51,255,51,0.8)]"
        >
          &gt; SCARICA {target.primary.label}
          <span className="block text-xs opacity-70">{target.primary.size}</span>
        </a>

        {target.secondary && (
          <a
            href={`${DOWNLOAD_BASE_URL}${target.secondary.file}`}
            download=""
            className="block text-center px-5 py-2 border border-[#28cc28] text-[#28cc28] text-base transition-all duration-300 hover:bg-[#28cc28] hover:text-[#050a05]"
          >
            Alternativa: {target.secondary.label} <span className="opacity-70">({target.secondary.size})</span>
          </a>
        )}
      </div>

      {target.notice && (
        <div className="mt-4 border-l-4 border-[#facc15] bg-[rgba(250,204,21,0.06)] pl-4 py-2 text-sm text-[#e8e8c0]">
          <p><strong className="text-[#facc15]">[!] AVVISO DI SICUREZZA</strong></p>
          <p className="mt-1 leading-snug">{target.notice}</p>
        </div>
      )}
    </div>
  );
};

const DownloadSection: React.FC = () => {
  return (
    <div id="download" className="scroll-mt-8">
      <div className="text-center max-w-4xl mx-auto mb-10">
        <p className="mb-3">
          <strong>The Safe Place Chronicles</strong> è <strong className="text-[#ccffcc]">completo, gratuito e open source</strong>. Scarica l’ultima versione stabile <strong className="text-[#ccffcc]">{RELEASE_VERSION}</strong> per il tuo sistema operativo direttamente dalla release pubblica su GitHub.
        </p>
        <p className="text-base text-[#28cc28]">
          Non è richiesta alcuna registrazione. Nessuna versione web: è un’applicazione desktop nativa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {DOWNLOAD_TARGETS.map((t) => (
          <DownloadCard key={t.os} target={t} />
        ))}
      </div>

      <div className="text-center max-w-4xl mx-auto mt-12">
        <p className="mb-6 text-base text-[#28cc28]">
          Preferisci compilare da sorgente, aprire una issue o dare un’occhiata al codice? Tutto lo sviluppo è aperto e pubblico.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          <Button href={RELEASES_URL} variant="primary" external>TUTTE LE RELEASE ({RELEASE_VERSION})</Button>
          <Button href={REPO_URL} variant="secondary" external>REPOSITORY OPEN SOURCE</Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadSection;
