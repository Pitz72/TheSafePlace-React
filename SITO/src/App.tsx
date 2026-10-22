import React from 'react';
import SiteNav from './components/SiteNav';
import Hero from './components/Hero';
import Section from './components/Section';
import Reveal from './components/Reveal';
import FeatureCard from './components/FeatureCard';
import Gallery from './components/Gallery';
import DownloadSection from './components/DownloadSection';
import Timeline from './components/Timeline';
import Button from './components/Button';
import Icon, { IconName } from './components/Icon';
import Footer from './components/Footer';
import { CONTACT_EMAIL, FEATURES, RELEASE_VERSION, REPO_URL, TIMELINE_EVENTS } from './constants';
import { imageUrl, srcSet } from './images';

const NEXT_STEPS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'sparkle',
    title: 'Dopo la 3.1',
    description: 'La nuova identità visiva e il paesaggio sonoro sono usciti con la 3.0 e la 3.1. Prossimi passi: ritratti e illustrazioni dei personaggi, e nuove rifiniture dal playtest.',
  },
  {
    icon: 'code',
    title: 'Progetto open source',
    description: 'Codice sorgente pubblico su GitHub, aperto a contributi, fork e segnalazioni della community.',
  },
  {
    icon: 'globe',
    title: 'Traduzioni multilingua',
    description: 'Portare The Safe Place Chronicles a un pubblico internazionale: inglese, spagnolo, francese, tedesco e portoghese.',
  },
  {
    icon: 'compass',
    title: 'Rifinitura e playtest',
    description: 'Test approfonditi e bilanciamento continui, per un’esperienza di gioco sempre più solida.',
  },
];

// A warm glow from the top of a section, like the light on the horizon.
const GLOW = 'bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(232,137,63,0.08),transparent_70%)]';

const App: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg0 text-ink">
      <a href="#gioco" className="sr-only z-50 rounded-lg bg-ember px-4 py-2 text-bg1 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Vai al contenuto
      </a>

      <SiteNav />
      <Hero />

      <main>
        <Section id="gioco" eyebrow="Il gioco" title="Un viaggio a piedi verso l’ultimo luogo sicuro">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="prose-story space-y-6 text-[18px] text-ink2 lg:col-span-7">
              <p>
                <strong className="font-semibold text-ink">The Safe Place Chronicles: The Echo of the Journey</strong> è un gioco di ruolo
                narrativo di sopravvivenza. Ti svegli nel rifugio e tuo padre non c’è più: ti ha lasciato una lettera e una vecchia mappa
                che porta a Est, verso un luogo chiamato The Safe Place. Comincia così il viaggio di Ultimo, a piedi e da solo, attraverso
                un mondo che il Grande Silenzio ha svuotato e che la natura si sta riprendendo.
              </p>
              <p>
                Ogni giornata è fatta di scelte: dove cercare acqua e cibo, quando fermarti per la notte, chi aiutare e di chi diffidare.
                Lungo la strada i ricordi tornano come echi e, frammento dopo frammento, ricompongono la storia di tuo padre, di tua madre
                e del mondo che è finito.
              </p>
              <p>
                Nato come esperimento tecnico e narrativo, il gioco è stato sviluppato da Simone Pizzi in simbiosi creativa con il supporto
                di modelli linguistici (LLM). È completo e giocabile dall’inizio alla fine, si gioca da tastiera ed è
                un’<strong className="font-semibold text-ink">applicazione desktop gratuita e open source</strong> per Windows e Linux,
                costruita in React, con la narrativa in Ink, e impacchettata con Electron.
              </p>
            </Reveal>

            <Reveal className="lg:col-span-5" delay={150}>
              <figure className="surface relative overflow-hidden p-8 sm:p-10">
                <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ember/10 blur-3xl" aria-hidden="true" />
                <span className="title-display block text-7xl leading-[0.5] text-ember" aria-hidden="true">“</span>
                <blockquote className="prose-story mt-2 space-y-4 text-[19px] italic leading-relaxed text-ink">
                  <p>
                    Nel tuo sacco, sotto le provviste, troverai una mappa. È vecchia, ma è l’unica che ho. Ti condurrà a Est, verso un
                    luogo chiamato “The Safe Place”.
                  </p>
                  <p>Sii forte, Ultimo. Sii migliore di me. Sopravvivi.</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 font-cond text-[14px] font-semibold uppercase tracking-[0.22em] text-ink3">
                  <span className="h-px w-8 bg-ember" aria-hidden="true" />
                  Dalla lettera di tuo padre
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Section>

        <Section id="caratteristiche" eyebrow="Caratteristiche" title="Cosa ti aspetta lungo la strada" className={`bg-bg1 ${GLOW}`}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 100}>
                <FeatureCard feature={feature} />
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="galleria"
          eyebrow="Galleria"
          title="Il mondo al crepuscolo"
          lead="Copertine, poster e key art ufficiali, disegnati in illustrazione vettoriale dal codice stesso del gioco."
        >
          <Gallery />
        </Section>

        <Section
          id="download"
          eyebrow="Scarica"
          title="Gratis, per Windows e Linux"
          className={`bg-bg1 ${GLOW}`}
          lead={
            <>
              <p>
                <strong className="font-semibold text-ink">The Safe Place Chronicles</strong> è completo, gratuito e open source. Scarica
                l’ultima versione stabile, <strong className="font-semibold text-ink">{RELEASE_VERSION}</strong>, per il tuo sistema
                operativo direttamente dalla release pubblica su GitHub. Non serve registrarsi e non c’è una versione web: è
                un’applicazione desktop nativa.
              </p>
            </>
          }
        >
          <DownloadSection />
        </Section>

        <Section id="sviluppo" eyebrow="Diario di sviluppo" title="Da esperimento a gioco completo">
          <Timeline events={TIMELINE_EVENTS} />
        </Section>

        <Section
          id="futuro"
          eyebrow="Prossimi passi"
          title="Il viaggio continua"
          className={GLOW}
          lead="Il gioco è completo, giocabile dall’inizio alla fine e distribuito come applicazione desktop open source per Windows e Linux. Lo sviluppo prosegue in modo aperto, sul repository pubblico."
        >
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {NEXT_STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 100} className="surface-flat h-full p-6">
                  <Icon name={step.icon} className="text-ember" />
                  <h3 className="title-display mt-5 text-2xl text-ink">{step.title}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-ink2">{step.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        <section id="contatti" aria-labelledby="contatti-title" className="relative isolate overflow-hidden py-28 sm:py-40">
          <img
            src={imageUrl('keyart-alba', 1920)}
            srcSet={srcSet('keyart-alba', [960, 1920])}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[65%_70%]"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(9,10,13)_0%,rgba(9,10,13,0.5)_30%,rgba(9,10,13,0.5)_70%,rgb(9,10,13)_100%)]" />
          <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="eyebrow">Contatti</p>
            <h2 id="contatti-title" className="title-display mt-4 text-[2.6rem] text-ink sm:text-6xl">La tua storia ti attende</h2>
            <p className="prose-story mx-auto mt-6 max-w-2xl text-lg text-ink">
              Il mondo di The Safe Place Chronicles è pronto a essere esplorato. Ogni feedback è prezioso per il futuro di questo progetto:
              gioca, sopravvivi, scopri la verità e racconta la tua esperienza.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="#download" icon="download">Scarica il gioco</Button>
              <Button href={REPO_URL} variant="secondary" icon="code" external>Repository open source</Button>
            </div>
            <p className="mt-10 text-[16px] text-ink2">
              Per suggerimenti o segnalazioni, scrivi a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-ember/60 underline-offset-4 hover:decoration-ember">
                <Icon name="mail" size={18} />
                {CONTACT_EMAIL}
              </a>
            </p>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
