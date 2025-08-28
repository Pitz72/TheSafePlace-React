// src/components/EventScreen.tsx
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';


/**
 * Componente per visualizzare gli eventi dinamici del gioco.
 * Appare come overlay quando un evento è attivo.
 * KEYBOARD-ONLY: Navigazione con W/S, selezione con ENTER
 */
const EventScreen: React.FC = () => {
  const { currentEvent, resolveChoice } = useGameStore();
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  // Non renderizzare nulla se non c'è un evento attivo
  if (!currentEvent) {
    return null;
  }

  // Reset selezione quando cambia evento
  useEffect(() => {
    setSelectedChoiceIndex(0);
  }, [currentEvent]);

  // Gestione input keyboard-only
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentEvent) return;

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          event.preventDefault();
          setSelectedChoiceIndex(prev => 
            prev > 0 ? prev - 1 : currentEvent.choices.length - 1
          );
          break;
        case 's':
        case 'arrowdown':
          event.preventDefault();
          setSelectedChoiceIndex(prev => 
            prev < currentEvent.choices.length - 1 ? prev + 1 : 0
          );
          break;
        case 'enter':
          event.preventDefault();
          resolveChoice(currentEvent.choices[selectedChoiceIndex]);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault();
          const choiceIndex = parseInt(event.key) - 1;
          if (choiceIndex >= 0 && choiceIndex < currentEvent.choices.length) {
            resolveChoice(currentEvent.choices[choiceIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentEvent, selectedChoiceIndex, resolveChoice]);



  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <div className="w-full max-w-4xl border border-phosphor-700 bg-gray-900 p-8 rounded-lg shadow-lg glow-phosphor-dim">
        <h2 className="text-4xl font-bold mb-4 text-center text-phosphor-300 glow-phosphor-bright">
          {currentEvent.title}
        </h2>
        <p className="text-lg mb-8 text-phosphor-400 whitespace-pre-wrap">
          {currentEvent.description}
        </p>
        <div className="space-y-3">
          {currentEvent.choices.map((choice, index) => (
            <div
              key={index}
              className={`w-full text-left p-4 rounded border transition-all duration-200 ${
                index === selectedChoiceIndex
                  ? 'border-phosphor-400 bg-phosphor-400 bg-opacity-20 glow-phosphor-primary'
                  : 'border-phosphor-600'
              }`}
            >
              <span className={`font-bold ${
                index === selectedChoiceIndex ? 'text-phosphor-200' : 'text-phosphor-400'
              }`}>
                {index === selectedChoiceIndex ? '► ' : '  '}
                [{index + 1}] {choice.text}
              </span>
            </div>
          ))}
        </div>
        
        {/* Controlli keyboard */}
        <div className="mt-6 text-center text-phosphor-500 text-sm">
          [↑↓/W/S] Naviga | [ENTER] Seleziona | [1-5] Scelta Diretta
        </div>
      </div>
    </div>
  );
};

export default EventScreen;