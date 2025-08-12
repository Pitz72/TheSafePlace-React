/**
 * OptionsScreen.tsx — Schermata Opzioni
 * Linee guida dimensioni (v0.3.2 "Size Matters"):
 * - Gerarchia titoli: sezioni [VIDEO/AUDIO/ALTRO] h2 text-2xl; voci navigazione text-2xl
 * - Stato selezionato: mantiene glow/phosphor per accessibilità e focus visivo
 * - Contenitori: p-6, bg-opacity-90 — non ridurre senza testare leggibilità
 * - Interazione tastiera: mappatura frecce/enter/back invarianti (definite negli handler)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface OptionsScreenProps {
  onBack: () => void;
}

interface NavItem {
  id: string;
  label: string;
  action: () => void;
  section: 'video' | 'audio' | 'other';
  shortcut?: string[];
  description?: string;
  isActive?: () => boolean;
}

const OptionsScreen: React.FC<OptionsScreenProps> = ({ onBack }) => {
  const { videoMode, audioEnabled, setVideoMode, setAudioEnabled } = useSettingsStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navMap = useMemo((): NavItem[] => [
    {
      id: 'video_standard',
      label: 'STANDARD CRT',
      description: 'Effetti CRT completi con fosfori verdi',
      action: () => setVideoMode('standard'),
      section: 'video',
      shortcut: ['1', 's'],
      isActive: () => videoMode === 'standard',
    },
    {
      id: 'video_no_effects',
      label: 'SENZA EFFETTI',
      description: 'Interfaccia pulita senza effetti CRT',
      action: () => setVideoMode('no-effects'),
      section: 'video',
      shortcut: ['2', 'n'],
      isActive: () => videoMode === 'no-effects',
    },
    {
      id: 'video_high_contrast',
      label: 'ALTO CONTRASTO',
      description: 'Bianco e nero per accessibilità',
      action: () => setVideoMode('high-contrast'),
      section: 'video',
      shortcut: ['3', 'h'],
      isActive: () => videoMode === 'high-contrast',
    },
    {
      id: 'audio_toggle',
      label: 'AUDIO GENERALE',
      description: 'Attualmente disabilitato',
      action: () => setAudioEnabled(!audioEnabled),
      section: 'audio',
      shortcut: ['a'],
      isActive: () => audioEnabled,
    },
    {
      id: 'other_placeholder',
      label: 'IMPOSTAZIONI AGGIUNTIVE',
      description: 'Disponibili in versioni future',
      action: () => {},
      section: 'other',
      shortcut: ['o'],
    },
  ], [videoMode, audioEnabled, setVideoMode, setAudioEnabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const gameKeys = ['escape','backspace','b','arrowup','w','arrowdown','s','enter',' '];
      if (!gameKeys.includes(key)) return; // Non bloccare altri tasti (DevTools)
      event.preventDefault();

      switch (key) {
        case 'escape':
        case 'backspace':
        case 'b':
          onBack();
          break;
        case 'arrowup':
        case 'w':
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : navMap.length - 1));
          break;
        case 'arrowdown':
        case 's':
          setSelectedIndex(prev => (prev < navMap.length - 1 ? prev + 1 : 0));
          break;
        case 'enter':
        case ' ':
          navMap[selectedIndex].action();
          break;
        default:
          // Handle shortcuts
          const targetIndex = navMap.findIndex(item => item.shortcut?.includes(key));
          if (targetIndex !== -1) {
            navMap[targetIndex].action();
            setSelectedIndex(targetIndex);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navMap, onBack]);

  const renderSection = (section: 'video' | 'audio' | 'other', title: string) => {
    const sectionItems = navMap.filter(item => item.section === section);
    const isSectionSelected = sectionItems.some((_, index) => navMap.indexOf(sectionItems[index]) === selectedIndex);

    return (
      <div className={`border border-phosphor-border p-6 bg-gray-800 bg-opacity-90 glow-phosphor-dim animate-pulse`}>
        <h2 className={`text-2xl font-bold mb-4 font-mono tracking-wider ${
          isSectionSelected ? 'text-phosphor-glow glow-phosphor-bright text-shadow-phosphor-bright animate-glow' : 'text-phosphor-primary glow-phosphor-dim'
        }`}>
          [{section.toUpperCase()}] {title}
        </h2>
        <div className="space-y-4">
          {sectionItems.map(item => {
            const isSelected = navMap[selectedIndex].id === item.id;
            const isActive = item.isActive ? item.isActive() : false;

            return (
              <div
                key={item.id}
                className={`p-4 transition-all duration-200 cursor-pointer text-center font-mono tracking-wider text-2xl ${
                  isSelected ? 'bg-gray-700 bg-opacity-80 text-phosphor-glow font-bold glow-phosphor-bright text-shadow-phosphor-bright animate-glow' :
                  isActive ? 'bg-gray-600 bg-opacity-70 text-phosphor-primary font-bold glow-phosphor-primary' :
                  'text-phosphor-primary hover:bg-gray-800 hover:glow-phosphor-dim'
                }`}
              >
                <div className="mb-2">
                  {isSelected && <span className="text-phosphor-glow mr-2 animate-pulse">►</span>}
                  <span className="text-phosphor-bright glow-phosphor-primary">[{item.shortcut?.[0]?.toUpperCase()}]</span> {item.label}
                  {isActive && <span className="ml-2 text-phosphor-glow animate-pulse glow-phosphor-bright">●</span>}
                  {isSelected && <span className="text-phosphor-glow ml-2 animate-pulse">◄</span>}
                </div>
                <div className={`text-lg font-mono ${isSelected ? 'text-phosphor-bright glow-phosphor-primary animate-pulse' : 'text-phosphor-dim'}`}>
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden bg-gray-900 bg-opacity-80 crt-screen scan-lines animate-crt-flicker">
      <div className="w-full mx-4 text-center" style={{ maxHeight: '90vh' }}>
        <div className="mb-8">
          <h1 className="text-phosphor-bright font-bold mb-2 text-6xl glow-phosphor-bright text-shadow-phosphor-bright animate-glow font-mono tracking-wider">
            ═══ IMPOSTAZIONI ═══
          </h1>
          <p className="text-phosphor-primary text-lg mb-6 font-mono animate-pulse glow-phosphor-dim">
            Configura le opzioni di gioco
          </p>
        </div>

        <div className="space-y-6 mb-6">
          {renderSection('video', 'MODALITÀ VIDEO')}
          {renderSection('audio', 'AUDIO')}
          {renderSection('other', 'ALTRE IMPOSTAZIONI')}
        </div>

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