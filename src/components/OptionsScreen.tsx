import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface OptionsScreenProps {
  onBack: () => void;
}

type VideoMode = 'standard' | 'no-effects' | 'high-contrast';
type AudioEnabled = boolean;

interface MenuSection {
  key: string;
  label: string;
  type: 'video' | 'audio' | 'other';
}

interface VideoOption {
  key: VideoMode;
  label: string;
  description: string;
}

const OptionsScreen: React.FC<OptionsScreenProps> = ({ onBack }) => {
  const { videoMode, audioEnabled, setVideoMode, setAudioEnabled } = useSettingsStore();
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const menuSections: MenuSection[] = [
    { key: 'video', label: 'MODALITÀ VIDEO', type: 'video' },
    { key: 'audio', label: 'AUDIO', type: 'audio' },
    { key: 'other', label: 'ALTRE IMPOSTAZIONI', type: 'other' }
  ];

  const videoOptions: VideoOption[] = [
    {
      key: 'standard',
      label: 'STANDARD CRT',
      description: 'Effetti CRT completi con fosfori verdi'
    },
    {
      key: 'no-effects',
      label: 'SENZA EFFETTI',
      description: 'Interfaccia pulita senza effetti CRT'
    },
    {
      key: 'high-contrast',
      label: 'ALTO CONTRASTO',
      description: 'Bianco e nero per accessibilità'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
        case 'Backspace':
        case 'b':
        case 'B':
          onBack();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (selectedSectionIndex === 0 && selectedOptionIndex > 0) {
            setSelectedOptionIndex(selectedOptionIndex - 1);
          } else if (selectedSectionIndex > 0) {
            setSelectedSectionIndex(selectedSectionIndex - 1);
            setSelectedOptionIndex(0);
          }
          break;
        case 'ArrowDown':
          if (selectedSectionIndex === 0 && selectedOptionIndex < videoOptions.length - 1) {
            setSelectedOptionIndex(selectedOptionIndex + 1);
          } else if (selectedSectionIndex < menuSections.length - 1) {
            setSelectedSectionIndex(selectedSectionIndex + 1);
            setSelectedOptionIndex(0);
          }
          break;
        case 's':
        case 'S':
          // Solo per navigazione se non siamo nella sezione video o se è maiuscolo
          if (selectedSectionIndex !== 0 || event.key === 'S') {
            if (selectedSectionIndex === 0 && selectedOptionIndex < videoOptions.length - 1) {
              setSelectedOptionIndex(selectedOptionIndex + 1);
            } else if (selectedSectionIndex < menuSections.length - 1) {
              setSelectedSectionIndex(selectedSectionIndex + 1);
              setSelectedOptionIndex(0);
            }
          } else {
            // Tasto 's' minuscolo nella sezione video = seleziona Standard
            setVideoMode('standard');
            setSelectedSectionIndex(0);
            setSelectedOptionIndex(0);
          }
          break;
        case 'Enter':
        case ' ':
          if (selectedSectionIndex === 0) {
            setVideoMode(videoOptions[selectedOptionIndex].key);
          } else if (selectedSectionIndex === 1) {
            setAudioEnabled(!audioEnabled);
          }
          break;
        case 'v':
        case 'V':
          setSelectedSectionIndex(0);
          setSelectedOptionIndex(0);
          break;
        case 'a':
        case 'A':
          setSelectedSectionIndex(1);
          setSelectedOptionIndex(0);
          break;
        case 'o':
        case 'O':
          setSelectedSectionIndex(2);
          setSelectedOptionIndex(0);
          break;
        case '1':
          setVideoMode('standard');
          setSelectedSectionIndex(0);
          setSelectedOptionIndex(0);
          break;
        case '2':
        case 'n':
          setVideoMode('no-effects');
          setSelectedSectionIndex(0);
          setSelectedOptionIndex(1);
          break;
        case '3':
        case 'h':
          setVideoMode('high-contrast');
          setSelectedSectionIndex(0);
          setSelectedOptionIndex(2);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSectionIndex, selectedOptionIndex, audioEnabled, onBack, setVideoMode, setAudioEnabled]);

  const renderVideoSection = () => (
    <div className="space-y-4">
      {videoOptions.map((option, index) => {
        const isSelected = selectedSectionIndex === 0 && selectedOptionIndex === index;
        const isActive = videoMode === option.key;
        
        return (
          <div
            key={option.key}
            className={`p-4 border-2 transition-all duration-200 cursor-pointer text-center font-mono tracking-wider text-2xl ${
              isSelected
                ? 'bg-gray-700 bg-opacity-80 border-phosphor-glow text-phosphor-glow font-bold glow-phosphor-bright text-shadow-phosphor-bright animate-glow transform scale-105'
                : isActive
                ? 'bg-gray-600 bg-opacity-70 border-phosphor-primary text-phosphor-primary font-bold glow-phosphor-primary'
                : 'border-phosphor-border text-phosphor-primary hover:border-phosphor-primary hover:glow-phosphor-dim'
            }`}
          >
            <div className="mb-2">
              {isSelected && <span className="text-phosphor-glow mr-2 animate-pulse">►</span>}
              <span className="text-phosphor-bright glow-phosphor-primary">[{option.key.charAt(0).toUpperCase()}]</span> {option.label}
              {isActive && (
                <span className="ml-2 text-phosphor-glow animate-pulse glow-phosphor-bright">●</span>
              )}
              {isSelected && <span className="text-phosphor-glow ml-2 animate-pulse">◄</span>}
            </div>
            <div className={`text-lg font-mono ${
              isSelected ? 'text-phosphor-bright glow-phosphor-primary animate-pulse' : 'text-phosphor-dim'
            }`}>{option.description}</div>
          </div>
        );
      })}
    </div>
  );

  const renderAudioSection = () => (
    <div className="space-y-4">
      <div
        className={`p-4 border transition-colors cursor-pointer text-center font-mono tracking-wider text-2xl ${
          selectedSectionIndex === 1
            ? 'bg-gray-700 bg-opacity-80 border-phosphor-glow text-phosphor-glow font-bold glow-phosphor-bright text-shadow-phosphor-bright animate-glow'
            : 'border-phosphor-border text-phosphor-primary hover:border-phosphor-primary hover:glow-phosphor-dim'
        }`}
      >
        <div className="mb-2">
          <span className="text-phosphor-bright glow-phosphor-primary">[A]</span> AUDIO GENERALE
          <span className="ml-2 text-phosphor-border opacity-50 animate-pulse">○</span>
        </div>
        <div className="text-lg text-phosphor-dim font-mono animate-pulse">Attualmente disabilitato</div>
       </div>
     </div>
   );

  const renderOtherSection = () => (
    <div className="space-y-4">
      <div
        className={`p-4 border transition-colors cursor-pointer text-center font-mono tracking-wider text-2xl ${
          selectedSectionIndex === 2
            ? 'bg-gray-700 bg-opacity-80 border-phosphor-glow text-phosphor-glow font-bold glow-phosphor-bright text-shadow-phosphor-bright animate-glow'
            : 'border-phosphor-border text-phosphor-primary hover:border-phosphor-primary hover:glow-phosphor-dim'
        }`}
      >
        <div className="mb-2">
          <span className="text-phosphor-bright glow-phosphor-primary">[O]</span> IMPOSTAZIONI AGGIUNTIVE
        </div>
        <div className="text-lg text-phosphor-dim font-mono animate-pulse">Disponibili in versioni future</div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden bg-gray-900 bg-opacity-80 crt-screen scan-lines animate-crt-flicker">
      <div className="w-full mx-4 text-center" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-phosphor-bright font-bold mb-2 text-6xl glow-phosphor-bright text-shadow-phosphor-bright animate-glow font-mono tracking-wider">
            ═══ IMPOSTAZIONI ═══
          </h1>
          <p className="text-phosphor-primary text-lg mb-6 font-mono animate-pulse glow-phosphor-dim">
            Configura le opzioni di gioco
          </p>
        </div>

        {/* Menu Sections */}
        <div className="space-y-6 mb-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.key} className="border border-phosphor-border p-6 bg-gray-800 bg-opacity-90 glow-phosphor-dim animate-pulse">
              <h2 className={`text-2xl font-bold mb-4 font-mono tracking-wider ${
                selectedSectionIndex === sectionIndex
                  ? 'text-phosphor-glow glow-phosphor-bright text-shadow-phosphor-bright animate-glow'
                  : 'text-phosphor-primary glow-phosphor-dim'
              }`}>
                [{section.key.toUpperCase()}] {section.label}
              </h2>
              
              {section.type === 'video' && renderVideoSection()}
              {section.type === 'audio' && renderAudioSection()}
              {section.type === 'other' && renderOtherSection()}
            </div>
          ))}
        </div>

        {/* Controls Help */}
        <div className="p-4 border border-phosphor-border bg-gray-800 bg-opacity-90 glow-phosphor-dim animate-pulse">
          <h3 className="text-lg font-bold text-phosphor-primary mb-2 font-mono tracking-wider glow-phosphor-primary">CONTROLLI:</h3>
          <div className="text-center space-y-1">
            <div className="text-phosphor-dim text-base font-mono animate-pulse">↑↓/W/S - Naviga • ENTER/SPAZIO - Seleziona • V/A/O - Vai a sezione</div>
            <div className="text-phosphor-dim text-base font-mono animate-pulse">1/2/3 - Modalità video • ESC/B - Esci</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsScreen;