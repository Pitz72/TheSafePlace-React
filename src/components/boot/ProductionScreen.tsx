import React, { useEffect, useState } from 'react';

interface ProductionScreenProps {
  duration: number; // in milliseconds
  onComplete: () => void;
  onSkip?: () => void;
}

const ProductionScreen: React.FC<ProductionScreenProps> = ({ duration, onComplete, onSkip }) => {
  // Custom ASCII logo for RUNTIME RADIO GEEK - user's original artistic version
  const asciiLogo = `  o__ __o       o         o    o          o   ____o__ __o____  __o__   o          o    o__ __o__/_       o__ __o                o           o__ __o       __o__       o__ __o
 <|     v\\     <|>       <|>  <|\\        <|>   /   \\   /   \\     |    <|\\        /|>  <|    v           <|     v\\              <|>         <|     v\\        |        /v     v\\
 / \\     <\\    / \\       / \\  / \\\\\\o      / \\        \\\\o/         / \\   / \\\\\\o    o// \\  < >               / \\     <\\             / \\         / \\     <\\      / \\      />       <\\
 \\o/     o/    \\o/       \\o/  \\o/ v\\     \\o/         |          \\o/   \\o/ v\\  /v \\o/   |                \\o/     o/           o/   \\o       \\o/       \\o    \\o/    o/           \\o
  |__  _<|      |         |    |   <\\     |         < >          |     |   <\\/>   |    o__/_             |__  _<|           <|__ __|>       |         |>    |    <|             |>
  |       \\    < >       < >  / \\    \\o  / \\         |          < >   / \\        / \\   |                 |       \\          /       \\      / \\       //    < >    \\\\           //
 <o>       \\o   \\         /   \\o/     v\\ \\o/         o           |    \\o/        \\o/  <o>               <o>       \\o      o/         \\o    \\o/      /       |       \\         /
  |         v\\   o       o     |       <\\ |         <|           o     |          |    |                 |         v\\    /v           v\\    |      o        o        o       o
 / \\         <\\  <\\__ __/>    / \\        < \\        / \\        __|>_  / \\        / \\  / \\  _\\o__/_      / \\         <\\  />             <\\  / \\  __/>      __|>_      <\\__ __/>`;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, duration); // Display for the specified duration (2 seconds)

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  const handleClick = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div
      className="h-full w-full bg-gray-900 flex items-center justify-center cursor-pointer p-4 crt-screen scan-lines"
      onClick={handleClick}
      title="Clicca per saltare la sequenza di avvio"
    >
      {/* Effetti CRT di sfondo */}
      <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-10"></div>

      <div className="text-center max-w-full relative">
        <img
          src="/titoli/runtime.png"
          alt="RUNTIME RADIO GEEK"
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: '80vh' }}
        />
      </div>
    </div>
  );
};

export default ProductionScreen;