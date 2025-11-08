import React from 'react';
import Button from './Button';
import sfondo from '/sfondo.png';

const Header: React.FC = () => {
  return (
    <header 
      className="h-screen flex flex-col justify-center items-center text-center p-5 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${sfondo})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a06] via-[#050a06]/80 to-[#050a06]/40"></div>
      <div className="relative z-10 text-glow">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-widest leading-tight">
          &gt; THE SAFE PLACE CHRONICLES_
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-[#aaffbe] mb-5 mt-4">
          THE ECHO OF THE JOURNEY
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Le lezioni dal passato. Una lotta per il futuro. Un viaggio narrativo di sopravvivenza nel cuore di un mondo in rovina.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          <Button href="gioco/" variant="primary">ACCEDI AL TERMINALE &gt; GIOCA ORA</Button>
          <Button href="https://www.gofundme.com/f/sostieni-the-safe-place-un-rpg-retro-con-unanima" variant="primary">SUPPORTA SU GOFUNDME</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
