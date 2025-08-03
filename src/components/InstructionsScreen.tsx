import React from 'react';
import PaginatedInfoPage from './PaginatedInfoPage';

const InstructionsScreen: React.FC = () => {
  const legendItems = [
    { symbol: ".", description: "Pianura", colorClass: "text-phosphor-plains" },
    { symbol: "#", description: "Muro", colorClass: "text-phosphor-forest" },
    { symbol: "~", description: "Acqua", colorClass: "text-phosphor-water" },
    { symbol: "%", description: "Rovina", colorClass: "text-phosphor-ruin" },
    { symbol: "$", description: "Tesoro", colorClass: "text-phosphor-special" },
    { symbol: "@", description: "Tuo personaggio", colorClass: "text-phosphor-bright" },
    { symbol: "E", description: "Safe Place", colorClass: "text-phosphor-bright" },
    { symbol: "R", description: "Rifugio", colorClass: "text-phosphor-bright" },
    { symbol: "V", description: "Villaggio", colorClass: "text-phosphor-bright" },
    { symbol: "C", description: "Città", colorClass: "text-phosphor-bright" }
  ];

  const instructionsPages = [
    // Pagina 1
    [
      <p key="i1">Figlio Mio, Ultimo...</p>,
      <p key="i2">Se stai leggendo queste parole, significa che non sono tornato in tempo, e le scorte che ti ho lasciato stanno per finire. Il mio cuore è pesante, ma non c'è tempo per il dolore adesso. Devi essere forte, come ti ho insegnato. Il mondo là fuori è un lupo affamato, ma tu hai gli strumenti per non diventare la sua preda.</p>,
      <p key="i3">Ricorda le basi, sempre. La mappa è la tua guida; la E segna la speranza, il 'Safe Place'. Raggiungila. I tasti direzionali (o W, A, S, D) saranno le tue gambe. Ogni passo ha un costo: cibo e acqua sono vita. Non lasciarli mai scarseggiare, o la debolezza e il logorio degli HP ti consumeranno. Vigila sulla tua Condizione – ferite, malanni, veleni – sono nemici silenziosi.</p>,
    ],
    // Pagina 2
    [
      <p key="i4">Il tempo è un fiume crudele, il giorno un breve respiro prima del gelo e dei pericoli della notte. Prima che il sole muoia, cerca un Rifugio ('R'). Lì troverai riposo fino all'alba e, con un po' di fortuna, qualcosa di utile. Esplorali di giorno, ma ricorda che ogni azione costa tempo. Villaggi ('V') e Città ('C') sono rovine piene di echi e pericoli, non fidarti ciecamente del loro apparente riparo notturno.</p>,
      <p key="i5">Il tuo Inventario è piccolo, riempilo con ciò che è essenziale. Premi 'I' per aprirlo e naviga con i tasti direzionali. Premi il numero corrispondente per usare un oggetto.</p>,
      <p key="i6">La strada ti metterà di fronte a Eventi e scelte difficili. Fidati del tuo Presagio, delle tue Abilità, ma soprattutto del tuo giudizio. Non tutte le lotte vanno combattute; a volte, la saggezza sta nel sapere quando fuggire.</p>,
    ],
    // Pagina 3
    [
      <p key="i7">Ti ho insegnato tutto ciò che potevo. Ora sei solo, è vero, ma non sei impreparato. La mia missione mi chiama lontano, e non so se queste parole saranno il mio ultimo abbraccio o solo un arrivederci. Ma tu, Ultimo, tu devi sopravvivere. Trova il Safe Place. Con tutto l'amore che un padre può dare, Papà.</p>,
      <div key="legend">
        <p>Leggenda mappa:</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-2xl">
          {legendItems.map((item) => (
            <div key={item.symbol} className="flex items-center">
              <span className={`${item.colorClass} glow-phosphor-bright w-8 text-center`}>{item.symbol}</span>
              <span className="text-phosphor-bright glow-phosphor-bright">= {item.description}</span>
            </div>
          ))}
        </div>
      </div>
    ]
  ];

  return (
    <PaginatedInfoPage
      title="ISTRUZIONI DEL GIOCO"
      pages={instructionsPages}
    />
  );
};

export default InstructionsScreen;