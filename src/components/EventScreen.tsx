// src/components/EventScreen.tsx
import React from 'react';
import { useGameStore } from '../stores/gameStore';


/**
 * Componente per visualizzare gli eventi dinamici del gioco.
 * Appare come overlay quando un evento è attivo.
 */
const EventScreen: React.FC = () => {
  const { currentEvent, resolveChoice } = useGameStore();

  // Non renderizzare nulla se non c'è un evento attivo
  if (!currentEvent) {
    return null;
  }



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
            <button
              key={index}
              onClick={() => resolveChoice(choice)}
              className="w-full text-left p-4 rounded border transition-all duration-200 border-phosphor-600 hover:border-phosphor-500 hover:bg-phosphor-600 hover:bg-opacity-10"
            >
              <span className="font-bold text-phosphor-400">
                {choice.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventScreen;