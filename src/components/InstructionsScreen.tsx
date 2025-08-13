/**
 * InstructionsScreen.tsx — Istruzioni gioco
 * Usa il template semplice PaginatedInfoPage (scorrimento). In futuro, se migri a UniversalInfoPage,
 * aggiorna tipografia a text-[28px] + leading-relaxed + mb-4 e rivedi la paginazione.
 */
import React from 'react';
import PaginatedInfoPage from './PaginatedInfoPage';

const InstructionsScreen: React.FC = () => {
  const legendItems = [
    { symbol: "@", description: "Giocatore", colorClass: "text-phosphor-400" },
    { symbol: "C", description: "Città", colorClass: "text-phosphor-400" },
    { symbol: "F", description: "Foresta", colorClass: "text-green-600" },
     { symbol: "~", description: "Acqua", colorClass: "text-blue-400" },
     { symbol: "M", description: "Montagna", colorClass: "text-gray-400" },
    { symbol: "R", description: "Rifugio", colorClass: "text-phosphor-400" },
    { symbol: "S", description: "Start", colorClass: "text-phosphor-300" },
    { symbol: "E", description: "End", colorClass: "text-phosphor-300" }
  ];

  const content = [
    <p key="i1" className="text-[175%] leading-relaxed">Figlio Mio, Ultimo...</p>,
    <p key="i2" className="text-[175%] leading-relaxed">Se stai leggendo queste parole, significa che non sono tornato in tempo, e le scorte che ti ho lasciato stanno per finire. Il mio cuore è pesante, ma non c'è tempo per il dolore adesso. Devi essere forte, come ti ho insegnato. Il mondo là fuori è un lupo affamato, ma tu hai gli strumenti per non diventare la sua preda.</p>,
    <p key="i3" className="text-[175%] leading-relaxed">Ricorda le basi, sempre. La mappa è la tua guida; la E segna la speranza, il 'Safe Place'. Raggiungila. I tasti direzionali (o W, A, S, D) saranno le tue gambe. Ogni passo ha un costo: cibo e acqua sono vita. Non lasciarli mai scarseggiare, o la debolezza e il logorio degli HP ti consumeranno. Vigila sulla tua Condizione – ferite, malanni, veleni – sono nemici silenziosi.</p>,
    <p key="i4" className="text-[175%] leading-relaxed">Il tempo è un fiume crudele, il giorno un breve respiro prima del gelo e dei pericoli della notte. Prima che il sole muoia, cerca un Rifugio ('R'). Lì troverai riposo fino all'alba e, con un po' di fortuna, qualcosa di utile. Esplorali di giorno, ma ricorda che ogni azione costa tempo. Villaggi ('V') e Città ('C') sono rovine piene di echi e pericoli, non fidarti ciecamente del loro apparente riparo notturno.</p>,
    <p key="i5" className="text-[175%] leading-relaxed">Il tuo Inventario è piccolo, riempilo con ciò che è essenziale. Premi 'I' per aprirlo e naviga con i tasti direzionali. Premi il numero corrispondente per usare un oggetto.</p>,
    <p key="i6" className="text-[175%] leading-relaxed">La strada ti metterà di fronte a Eventi e scelte difficili. Fidati del tuo Presagio, delle tue Abilità, ma soprattutto del tuo giudizio. Non tutte le lotte vanno combattute; a volte, la saggezza sta nel sapere quando fuggire.</p>,
    <p key="i7" className="text-[175%] leading-relaxed">Ti ho insegnato tutto ciò che potevo. Ora sei solo, è vero, ma non sei impreparato. La mia missione mi chiama lontano, e non so se queste parole saranno il mio ultimo abbraccio o solo un arrivederci. Ma tu, Ultimo, tu devi sopravvivere. Trova il Safe Place. Con tutto l'amore che un padre può dare, Papà.</p>,
    <div key="legend" className="text-[175%] leading-relaxed">
      <p>Leggenda mappa:</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-2xl">
        {legendItems.map((item) => (
          <div key={item.symbol} className="flex items-center">
            <span className={`${item.colorClass} w-8 text-center`}>{item.symbol}</span>
            <span className="text-phosphor-400">= {item.description}</span>
          </div>
        ))}
      </div>
    </div>
  ];

  return (
    <PaginatedInfoPage
      title="ISTRUZIONI DEL GIOCO"
      content={content}
    />
  );
};

export default InstructionsScreen;