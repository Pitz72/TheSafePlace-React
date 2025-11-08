import React, { useState } from 'react';
import Header from './components/Header';
import Section from './components/Section';
import FeatureCard from './components/FeatureCard';
import Timeline from './components/Timeline';
import Button from './components/Button';
import Footer from './components/Footer';
import IntroAnimation from './components/IntroAnimation';
import { FEATURES, TIMELINE_EVENTS } from './constants';
import copertina from '/image/01.png';
import ragazzoInRovine from '/image/02.png';
import artworkPrincipale from '/image/03.jpg';

const App: React.FC = () => {
  const [introFinished, setIntroFinished] = useState(false);

  const handleIntroFinish = () => {
    setIntroFinished(true);
  };

  if (!introFinished) {
    return <IntroAnimation onFinished={handleIntroFinish} />;
  }

  return (
    <div className="bg-[#050a06] text-[#00ff41] text-xl overflow-x-hidden animate-fade-in">
      <div className="fixed top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.3),rgba(0,0,0,0.3)_1px,transparent_1px,transparent_3px)] pointer-events-none z-[9999] animate-flicker"></div>
      
      <Header />
      
      <main className="max-w-5xl mx-auto px-5">
        <Section title="[AVVIO PROTOCOLLO_MANIFESTO.LOG]">
          <div className="text-center max-w-4xl mx-auto">
            <p className="mb-4">
              <strong>The Safe Place Chronicles</strong> è un prototipo concettuale di gioco di ruolo (RPG) che si ispira ai classici testuali degli anni '80. Nato come un esperimento tecnico e narrativo, è stato sviluppato in simbiosi creativa con l'intelligenza artificiale (Gemini 2.5 Pro) per creare un'opera strutturata, coerente e dotata di un'anima.
            </p>
            <p>
              Il gioco è costruito con una filosofia "keyboard-only" per replicare il feeling autentico di quell'epoca, con un'interfaccia che richiama i vecchi monitor a fosfori verdi. Con la versione 1.9.7, il progetto è sostanzialmente completo: un'avventura giocabile dall'inizio alla fine, un viaggio dentro un'idea che attende solo di essere vissuta.
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

        <Section title="[SOSTIENI_LO_SVILUPPO.CMD]">
          <div className="text-center max-w-4xl mx-auto">
            <p className="mb-4">
              "The Safe Place Chronicles" è più di un gioco: è un omaggio ai classici RPG testuali degli anni '80, nato dalla passione per la narrazione e l'estetica di un'epoca passata. Non partiamo da una semplice idea, ma da un prototipo concettuale completo, con un arco narrativo concluso e meccaniche di gioco solide.
            </p>
            <p className="mb-8">
              Ora abbiamo bisogno del tuo aiuto per il passo finale. Il vostro sostegno ci permetterà di trasformare questo prototipo in un'opera rifinita, espandendo il mondo con nuove quest, eventi e la cura che questo progetto merita. L'obiettivo è raccogliere <strong>500€</strong> per completare lo sviluppo.
            </p>
            <Button href="https://www.gofundme.com/f/sostieni-the-safe-place-un-rpg-retro-con-unanima" variant="primary">
              SOSTIENI LA CAMPAGNA SU GOFUNDME
            </Button>
          </div>
        </Section>
        
        <Section title="[IMAGE ARCHIVE.IMG]">
          <div className="flex flex-col items-center gap-8">
            <img src={copertina} alt="Copertina ufficiale di The Safe Place Chronicles: The Echo of the Journey." className="w-full md:w-2/3 h-auto border-2 border-[#008f25] hover:border-[#00ff41] transition-colors duration-300"/>
            <img src={ragazzoInRovine} alt="Un ragazzo con uno zaino osserva una città futuristica in rovina, illuminata di verde." className="w-full md:w-2/3 h-auto border-2 border-[#008f25] hover:border-[#00ff41] transition-colors duration-300"/>
            <img src={artworkPrincipale} alt="Artwork principale per il gioco The Safe Place Chronicles." className="w-full md:w-2/3 h-auto border-2 border-[#008f25] hover:border-[#00ff41] transition-colors duration-300"/>
          </div>
        </Section>
        
        <Section title="[CARICAMENTO_TRASMISSIONE_UFFICIALE.MP4]">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-2 border-[#008f25] hover:border-[#00ff41] hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all duration-300"
              src="https://www.youtube.com/embed/6PJaJECxwhM"
              title="Teaser Trailer Ufficiale - The Safe Place Chronicles"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </Section>

        <Section title="[LOG_SVILUPPO_PRINCIPALI.TXT]">
          <Timeline events={TIMELINE_EVENTS} />
        </Section>
        
        <Section title="[PROIEZIONE_SVILUPPI_FUTURI.EXE]">
          <p className="mb-6">Il viaggio verso la versione definitiva è quasi concluso. Con la v1.9.7, il gioco è stabile e sostanzialmente completo. Le prossime tappe sono focalizzate sul polish finale e sull'accessibilità globale:</p>
          <ul className="list-['>_'] pl-8 space-y-4">
            <li><span className="pl-2"><strong>Traduzioni Multilingua:</strong> Portare l'esperienza di The Safe Place Chronicles a un pubblico internazionale (EN, ES, FR, DE, PT).</span></li>
            <li><span className="pl-2"><strong>Contenuti Aggiuntivi:</strong> Inserimento degli ultimi omaggi creativi dedicati ai donatori che hanno supportato il progetto.</span></li>
            <li><span className="pl-2"><strong>Polish Finale:</strong> Un'ultima fase di testing approfondito e bilanciamento per garantire un'esperienza di gioco impeccabile.</span></li>
          </ul>
        </Section>

        <Section title="[CONNESSIONE_DIRETTA.CMD]">
            <div className="text-center">
                <p className="max-w-3xl mx-auto">La tua storia ti attende. Il mondo di The Safe Place Chronicles è pronto ad essere esplorato. Ogni feedback è prezioso per il futuro di questo progetto. Gioca, sopravvivi, scopri la verità e condividi la tua esperienza.</p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mt-10">
                    <Button href="gioco/" variant="primary">INIZIA IL TUO VIAGGIO</Button>
                    <Button href="https://www.gofundme.com/f/sostieni-the-safe-place-un-rpg-retro-con-unanima" variant="primary">SUPPORTA SU GOFUNDME</Button>
                </div>
                <p className="mt-10">Per suggerimenti o segnalazioni, scrivi a: <strong className="text-[#aaffbe]">runtimeradio@gmail.com</strong></p>
            </div>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;