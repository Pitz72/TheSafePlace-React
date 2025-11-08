import React, { useState, useEffect, useRef } from 'react';

const BOOT_MESSAGES_POOL = [
  'Initializing memory...',
  'Calibrating quantum entangler...',
  'Verifying BIOS checksum...',
  'Decompressing kernel image...',
  'Loading audio drivers [AUI_83_DRIVER]...',
  'Mounting root filesystem...',
  'WARN::Neural interface link unstable...',
  'WARN::Sub-optimal power readings detected...',
  'FAIL::Memory allocation error at 0xDEADBEEF...',
  'FAIL::Corruption detected in SYS_CONFIG...',
  'CORR::Rerouting power flow...',
  'CORR::Bypassing memory integrity check...',
  'CORR::Loading backup configuration from last known stable state...',
];

const LOGO = `
████████╗██╗  ██╗███████╗     ██████╗ ██╗  ██╗ ██████╗████████╗
╚══██╔══╝██║  ██║██╔════╝    ██╔═══██╗██║  ██║██╔════╝╚══██╔══╝
   ██║   ███████║█████╗      ██║   ██║███████║██║        ██║   
   ██║   ██╔══██║██╔══╝      ██║   ██║██╔══██║██║        ██║   
   ██║   ██║  ██║███████╗    ╚██████╔╝██║  ██║╚██████╗   ██║   
   ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝   ╚═╝   
`;

interface IntroAnimationProps {
  onFinished: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onFinished }) => {
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [showLogo, setShowLogo] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const regularPool = BOOT_MESSAGES_POOL.filter(l => !l.startsWith('FAIL::') && !l.startsWith('CORR::'));
    const failPool = BOOT_MESSAGES_POOL.filter(l => l.startsWith('FAIL::'));
    const corrPool = BOOT_MESSAGES_POOL.filter(l => l.startsWith('CORR::'));
    
    const generatedSequence: string[] = [];
    const sequenceLength = 4 + Math.floor(Math.random() * 2); // 4 or 5 lines
    let hasFailed = false;

    for (let i = 0; i < sequenceLength; i++) {
      const shouldFail = Math.random() < 0.25 && !hasFailed && failPool.length > 0 && corrPool.length > 0;

      if (shouldFail) {
        hasFailed = true;
        const failIndex = Math.floor(Math.random() * failPool.length);
        generatedSequence.push(failPool.splice(failIndex, 1)[0]);
        const corrIndex = Math.floor(Math.random() * corrPool.length);
        generatedSequence.push(corrPool.splice(corrIndex, 1)[0]);
        i++;
      } else {
        const regularIndex = Math.floor(Math.random() * regularPool.length);
        if(regularPool.length > 0) {
            generatedSequence.push(regularPool.splice(regularIndex, 1)[0]);
        }
      }
    }

    generatedSequence.push('Establishing connection...');
    generatedSequence.push('Booting TSC-OS v1.0.3...');
    setBootSequence(generatedSequence);
  }, []);

  useEffect(() => {
    if (bootSequence.length === 0) return;

    let lineIndex = 0;
    let timeoutId: number;

    const showNextLine = () => {
        if (lineIndex < bootSequence.length) {
            const currentLineText = bootSequence[lineIndex];
            setLines(prev => [...prev, currentLineText]);

            const isFail = currentLineText.startsWith('FAIL::');
            const delay = isFail ? 1200 : (400 + Math.random() * 300);
            
            lineIndex++;
            timeoutId = window.setTimeout(showNextLine, delay);
        } else {
            setTimeout(() => setShowLogo(true), 500);
            setTimeout(() => setShowPrompt(true), 1500);
        }
    };
    
    timeoutId = window.setTimeout(showNextLine, 700);

    return () => clearTimeout(timeoutId);
  }, [bootSequence]);

  const handleSkip = () => {
    if (showPrompt) {
      setFadeOut(true);
      setTimeout(onFinished, 500); 
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);

    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [showPrompt]);
  
  const renderLine = (line: string, index: number) => {
    let text = line;
    let status = null;

    if (line.endsWith('...')) {
        status = <span className="text-[#aaffbe]">[OK]</span>;
    }

    if (line.startsWith('WARN::')) {
        text = line.replace('WARN::', '');
        status = <span className="text-yellow-400">[WARNING]</span>;
    } else if (line.startsWith('FAIL::')) {
        text = line.replace('FAIL::', '');
        status = <span className="text-red-500">[FAILED]</span>;
    } else if (line.startsWith('CORR::')) {
        text = line.replace('CORR::', '');
    }

    return (
        <p key={index} className="text-glow whitespace-pre-wrap">
            &gt; {text} {status}
        </p>
    );
  };


  return (
    <div 
        ref={containerRef}
        className={`bg-[#050a06] text-[#00ff41] text-xl h-screen w-screen flex flex-col justify-center items-center transition-opacity duration-500 ease-in ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
        <div className="fixed top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.3),rgba(0,0,0,0.3)_1px,transparent_1px,transparent_3px)] pointer-events-none z-[9999] animate-flicker"></div>
        <div className="w-full max-w-5xl px-5 text-left">
            {lines.map((line, index) => renderLine(line, index))}
            {showLogo && (
                <pre className="text-sm text-glow animate-text-flicker mt-8 whitespace-pre-wrap text-center">
                    {LOGO}
                </pre>
            )}
            {showLogo && (
                <div className="text-center mt-4 text-glow animate-text-flicker">
                    <h1 className="text-4xl md:text-5xl tracking-widest leading-none">
                        &gt; THE SAFE PLACE_ CHRONICLES
                    </h1>
                    <p className="text-lg text-[#aaffbe] mt-2">
                        [AN ECHO OF THE JOURNEY]
                    </p>
                </div>
            )}
        </div>
        
        {showPrompt && (
            <div className="absolute bottom-10 text-2xl text-glow animate-text-flicker">
                <p>PRESS ANY KEY TO CONTINUE<span className="animate-blink">_</span></p>
            </div>
        )}
    </div>
  );
};

export default IntroAnimation;
