import React, { useEffect, useState } from 'react';

interface BootSimulationProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const BootSimulation: React.FC<BootSimulationProps> = ({ onComplete, onSkip }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);

  // Retro PC boot sequence - simulating old computer boot
  const bootLines = [
    'THE SAFE PLACE CHRONICLES BOOT LOADER v1.0',
    'Copyright (C) 1985 The Safe Place Chronicles Inc.',
    '',
    'CPU: Intel 8086 @ 4.77 MHz',
    'Memory: 640KB OK',
    'Floppy Drive A: OK',
    'Floppy Drive B: OK',
    'Hard Disk: Not detected',
    '',
    'Loading SYSTEM.SYS...',
    'Loading MSDOS.SYS...',
    'Loading CONFIG.SYS...',
    'Loading AUTOEXEC.BAT...',
    '',
    'Initializing graphics mode...',
    'Setting 320x200 4-color CGA mode',
    'Loading TSP_CHRONICLES.EXE...',
    '',
    'Memory allocation: 512KB free',
    'Initializing game engine...',
    'Loading world data...',
    'Loading character data...',
    'Loading item database...',
    '',
    'System ready.',
    'Starting THE SAFE PLACE CHRONICLES...',
    '',
    'Welcome to THE SAFE PLACE CHRONICLES',
    'THE ECHO OF THE JOURNEY',
    'A retro RPG experience',
    '',
    'Press any key to continue...'
  ];

  useEffect(() => {
    if (currentLine >= bootLines.length) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500); // Reduced from 1000ms to 500ms
      return () => clearTimeout(timer);
    }

    const currentBootLine = bootLines[currentLine];
    const charInterval = 15; // Even faster: 15ms per character

    if (currentChar < currentBootLine.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentBootLine[currentChar]);
        setCurrentChar(prev => prev + 1);
      }, charInterval);

      return () => clearTimeout(timer);
    } else {
      // Line complete, move to next line
      const lineTimer = setTimeout(() => {
        setDisplayedText(prev => prev + '\n');
        setCurrentLine(prev => prev + 1);
        setCurrentChar(0);
      }, 100); // Reduced from 200ms to 100ms between lines

      return () => clearTimeout(lineTimer);
    }
  }, [currentLine, currentChar, bootLines, onComplete]);

  const handleClick = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div
      className="h-full w-full bg-gray-900 font-mono text-green-400 cursor-pointer overflow-hidden p-8 crt-screen scan-lines"
      onClick={handleClick}
      title="Clicca per saltare la sequenza di avvio"
    >
      {/* Effetti CRT di sfondo */}
      <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-10"></div>

      <div className="max-w-4xl mx-auto relative">
        {/* Raw boot output - no containers, just text on black screen */}
        <pre className="text-green-600 text-xl whitespace-pre-wrap font-mono leading-tight">
          {displayedText}
          {currentLine < bootLines.length && currentChar <= bootLines[currentLine].length && (
            <span className="animate-pulse">█</span>
          )}
        </pre>
      </div>
    </div>
  );
};

export default BootSimulation;