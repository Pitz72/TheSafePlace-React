import React, { useEffect } from 'react';

interface BlackScreenProps {
  duration: number; // in milliseconds
  onComplete: () => void;
  onSkip?: () => void;
  skipOnClick?: boolean;
}

const BlackScreen: React.FC<BlackScreenProps> = ({ duration, onComplete, onSkip, skipOnClick = true }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const handleClick = () => {
    if (skipOnClick && onSkip) {
      onSkip();
    }
  };

  return (
    <div
      className="h-full flex items-center justify-center overflow-hidden crt-screen scan-lines cursor-pointer"
      onClick={handleClick}
      title="Clicca per saltare la sequenza di avvio"
    >
      {/* Effetti CRT di sfondo */}
      <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-10"></div>

      {/* Schermata nera con effetti CRT */}
      <div className="w-full h-full bg-gray-900 relative">
        {/* Contenuto invisibile - solo sfondo CRT */}
      </div>
    </div>
  );
};

export default BlackScreen;