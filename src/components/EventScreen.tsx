// src/components/EventScreen.tsx
import React from 'react';
import { useGameContext } from '../hooks/useGameContext';
import type { EventChoice } from '../interfaces/events';

/**
 * Componente per visualizzare gli eventi dinamici del gioco.
 * Appare come overlay quando un evento è attivo.
 */
const EventScreen: React.FC = () => {
  const { currentEvent, resolveChoice } = useGameContext();

  // Non renderizzare nulla se non c'è un evento attivo
  if (!currentEvent) {
    return null;
  }

  const handleChoiceClick = (choice: EventChoice) => {
    resolveChoice(choice);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-phosphor-bright p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Titolo dell'evento */}
        <h2 className="text-2xl font-bold text-phosphor-bright mb-4 text-center">
          {currentEvent.title}
        </h2>
        
        {/* Descrizione dell'evento */}
        <div className="text-phosphor-dim mb-6 leading-relaxed">
          <p>{currentEvent.description}</p>
        </div>
        
        {/* Scelte disponibili */}
        <div className="space-y-3">
          {currentEvent.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoiceClick(choice)}
              className="w-full text-left p-4 bg-gray-800 border border-phosphor-dim hover:border-phosphor-bright hover:bg-gray-700 transition-all duration-200 rounded"
            >
              <div className="text-phosphor-bright font-medium mb-2">
                {choice.text}
              </div>
              
              {/* Mostra skill check se presente */}
              {choice.skillCheck && (
                <div className="text-sm text-phosphor-dim">
                  Richiede: {choice.skillCheck.stat} (CD {choice.skillCheck.difficulty})
                </div>
              )}
              
              {/* Mostra preview delle conseguenze se disponibili */}
              {(choice.reward || choice.penalty) && (
                <div className="text-xs text-gray-400 mt-1">
                  {choice.reward && (
                    <span className="text-green-400">Ricompensa possibile</span>
                  )}
                  {choice.penalty && (
                    <span className="text-red-400 ml-2">Rischio possibile</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Informazioni aggiuntive */}
        <div className="mt-6 text-center text-sm text-phosphor-dim">
          Scegli con saggezza. Le tue decisioni hanno conseguenze.
        </div>
      </div>
    </div>
  );
};

export default EventScreen;