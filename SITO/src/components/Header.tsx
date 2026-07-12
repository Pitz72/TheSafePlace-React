import React from 'react';
import Button from './Button';
import sfondo from '/sfondo.png';

const Header: React.FC = () => {
  return (
    <header 
      className="h-screen flex flex-col justify-center items-center text-center p-5 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${sfondo})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a05] via-[#050a05]/80 to-[#050a05]/40"></div>
      <div className="relative z-10 text-glow">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-widest leading-tight">
          &gt; THE SAFE PLACE CHRONICLES_
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-[#ccffcc] mb-5 mt-4">
          THE ECHO OF THE JOURNEY
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Le lezioni dal passato. Una lotta per il futuro. Un viaggio narrativo di sopravvivenza nel cuore di un mondo in rovina.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          <Button href="#download" variant="primary">ACCEDI AL TERMINALE &gt; SCARICA IL GIOCO</Button>
          <Button href="https://github.com/Pitz72/TheSafePlace-React" variant="secondary">CODICE SORGENTE (OPEN SOURCE)</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
