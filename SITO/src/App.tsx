import React, { useState } from 'react';
import Header from './components/Header';
import Section from './components/Section';
import FeatureCard from './components/FeatureCard';
import Timeline from './components/Timeline';
import Button from './components/Button';
import Footer from './components/Footer';
import IntroAnimation from './components/IntroAnimation';
import DownloadSection from './components/DownloadSection';
import { FEATURES, TIMELINE_EVENTS } from './constants';
import copertina from '/image/01.png';
import ragazzoInRovine from '/image/02.png';
import artworkPrincipale from '/image/03.jpg';

const App: React.FC = () => {
  // ?skipintro nell'URL salta la sequenza di boot (utile per anteprime/deep-link)
  const [introFinished, setIntroFinished] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skipintro')
  );

  const handleIntroFinish = () => {
    setIntroFinished(true);
  };

  if (!introFinished) {
    return <IntroAnimation onFinished={handleIntroFinish} />;
  }

  return (
    <div className="bg-[#050a05] text-[#33ff33] text-xl overflow-x-hidden animate-fade-in relative min-h-screen">
      <div className="fixed top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] pointer-events-none z-[9998] animate-flicker"></div>
      <div className="fixed top-0 left-0 w-full h-full vignette z-[9999]"></div>

      <Header />

      <main className="max-w-5xl mx-auto px-5">
        <Section title="[AVVIO PROTOCOLLO_MANIFESTO.LOG]">
          <div className="text-center max-w-4xl mx-auto">
            <p className="mb-4">
              <strong>The Safe Place Chronicles</strong> è un gioco di ruolo (RPG) narrativo di sopravvivenza che si ispira ai classici testuali degli anni '80. Nato come esperimento tecnico e narrativo, è stato sviluppato in simbiosi creativa con il supporto di modelli linguistici (LLM) per creare un'opera strutturata, coerente e dotata di un'anima.
            </p>
            <p>
              Il gioco è costruito con una filosofia "keyboard-only" per replicare il feeling autentico di quell'epoca, con un'interfaccia che richiama i vecchi monitor a fosfori verdi. Con la versione <strong>2.0.17</strong> il progetto è completo e giocabile dall'inizio alla fine, rilasciato come <strong>applicazione desktop open source</strong> per Windows, macOS e Linux. Costruito in React (mappa su HTML Canvas, narrativa gestita da Ink) e impacchettato con Electron.
            </p>
          </div>
        </Section>

        <Section title="[CARICAMENTO_SPECIFICHE_SISTEMA.DAT]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
            ))}
          </div>
        </Section>

        <Section title="[IMAGE ARCHIVE.IMG]">
          <div className="flex flex-col items-center gap-8">
            <img src={copertina} alt="Copertina ufficiale di The Safe Place Chronicles: The Echo of the Journey." className="w-full md:w-2/3 h-auto border-2 border-[#28cc28] hover:border-[#33ff33] transition-colors duration-300" />
            <img src={ragazzoInRovine} alt="Un ragazzo con uno zaino osserva una città futuristica in rovina, illuminata di verde." className="w-full md:w-2/3 h-auto border-2 border-[#28cc28] hover:border-[#33ff33] transition-colors duration-300" />
            <img src={artworkPrincipale} alt="Artwork principale per il gioco The Safe Place Chronicles." className="w-full md:w-2/3 h-auto border-2 border-[#28cc28] hover:border-[#33ff33] transition-colors duration-300" />
          </div>
        </Section>

        <Section title="[CARICAMENTO_TRASMISSIONE_UFFICIALE.MP4]">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-2 border-[#28cc28] hover:border-[#33ff33] hover:shadow-[0_0_15px_rgba(51,255,51,0.3)] transition-all duration-300"
              src="https://www.youtube.com/embed/6PJaJECxwhM"
              title="Teaser Trailer Ufficiale - The Safe Place Chronicles"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </Section>

        <Section title="[SCARICA_IL_GIOCO.EXE]">
          <DownloadSection />
        </Section>

        <Section title="[LOG_SVILUPPO_PRINCIPALI.TXT]">
          <Timeline events={TIMELINE_EVENTS} />
        </Section>

        <Section title="[PROIEZIONE_SVILUPPI_FUTURI.EXE]">
          <p className="mb-6">Il viaggio è concluso. Con la <strong>v2.0.17</strong> il gioco è completo, giocabile dall'inizio alla fine e distribuito come applicazione desktop <strong>open source</strong> per Windows, macOS e Linux. Lo sviluppo prosegue in modo aperto, sul repository pubblico:</p>
          <ul className="list-['>_'] pl-8 space-y-4">
            <li><span className="pl-2"><strong>Progetto Open Source:</strong> Codice sorgente pubblico su GitHub, aperto a contributi, fork e segnalazioni della community.</span></li>
            <li><span className="pl-2"><strong>Traduzioni Multilingua:</strong> Portare l'esperienza di The Safe Place Chronicles a un pubblico internazionale (EN, ES, FR, DE, PT).</span></li>
            <li><span className="pl-2"><strong>Polish e Playtest:</strong> Testing approfondito e bilanciamento continui per un'esperienza di gioco sempre più solida.</span></li>
          </ul>
        </Section>

        <Section title="[CONNESSIONE_DIRETTA.CMD]">
          <div className="text-center">
            <p className="max-w-3xl mx-auto">La tua storia ti attende. Il mondo di The Safe Place Chronicles è pronto ad essere esplorato. Ogni feedback è prezioso per il futuro di questo progetto. Gioca, sopravvivi, scopri la verità e condividi la tua esperienza.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mt-10">
              <Button href="#download" variant="primary">SCARICA IL GIOCO</Button>
              <Button href="https://github.com/Pitz72/TheSafePlace-React" variant="secondary">REPOSITORY OPEN SOURCE</Button>
            </div>
            <p className="mt-10">Per suggerimenti o segnalazioni, scrivi a: <strong className="text-[#ccffcc]">runtimeradio@gmail.com</strong></p>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default App;