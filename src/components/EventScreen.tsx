// src/components/EventScreen.tsx
import React, { useState, useEffect } from 'react';
import { useEventStore } from '../stores/events/eventStore';
import { useNotificationStore } from '../stores/notifications/notificationStore';
import { useTimeStore } from '../stores/time/timeStore';


/**
 * Componente per visualizzare gli eventi dinamici del gioco.
 * Appare come overlay quando un evento è attivo.
 * KEYBOARD-ONLY: Navigazione con W/S, selezione con ENTER
 */
const EventScreen: React.FC = () => {
  const { currentEvent, currentEventResult, resolveChoice, dismissCurrentEvent, activeSequence, advanceSequence } = useEventStore();
  const { addLogEntry } = useNotificationStore();
  const { advanceTime } = useTimeStore();
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  const hasChoices = currentEvent?.choices && currentEvent.choices.length > 0;
  const showingResult = currentEventResult !== null;
  const inSequence = activeSequence.sequenceId !== null;

  // Reset selezione quando cambia evento
  useEffect(() => {
    setSelectedChoiceIndex(0);
  }, [currentEvent]);

  // Per eventi senza scelte (NON main quest), chiudi automaticamente dopo 6 secondi
  useEffect(() => {
    if (currentEvent && !hasChoices && !showingResult) {
      // Escludi eventi main quest dal timer automatico - devono chiudersi manualmente
      const isMainQuest = currentEvent.id?.startsWith('mq_') ||
                         currentEvent.title?.includes('Ricordo:');

      if (!isMainQuest) {
        const timer = setTimeout(() => {
          dismissCurrentEvent();
        }, 6000); // 6 secondi per leggere

        return () => clearTimeout(timer);
      }
    }
  }, [currentEvent, hasChoices, showingResult, dismissCurrentEvent]);

  // Gestione input keyboard-only
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Se siamo in una sequenza, solo ENTER avanzi la pagina
      if (inSequence) {
        if (event.key.toLowerCase() === 'enter') {
          event.preventDefault();
          advanceSequence();
        }
        return;
      }

      if (!currentEvent) return;

      // Se stiamo mostrando il risultato, solo ENTER chiude l'evento
      if (showingResult) {
        if (event.key.toLowerCase() === 'enter') {
          event.preventDefault();
          dismissCurrentEvent();
        }
        return;
      }

      // Se non ci sono scelte, solo ENTER chiude l'evento
      if (!hasChoices) {
        if (event.key.toLowerCase() === 'enter') {
          event.preventDefault();
          dismissCurrentEvent();
        }
        return;
      }

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
          if (currentEvent.choices[selectedChoiceIndex]) {
            resolveChoice(currentEvent.choices[selectedChoiceIndex], addLogEntry, advanceTime);
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault();
          const choiceIndex = parseInt(event.key) - 1;
          if (choiceIndex >= 0 && choiceIndex < currentEvent.choices.length) {
            if (currentEvent.choices[choiceIndex]) {
              resolveChoice(currentEvent.choices[choiceIndex], addLogEntry, advanceTime);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentEvent, selectedChoiceIndex, resolveChoice, dismissCurrentEvent, hasChoices, showingResult, advanceTime, inSequence, advanceSequence]);

  // Non renderizzare nulla se non c'è un evento attivo e non siamo in sequenza
  if (!currentEvent && !inSequence) {
    return null;
  }



  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <div className="w-full max-w-4xl border border-phosphor-700 bg-gray-900 p-8 rounded-lg shadow-lg glow-phosphor-dim">
        {inSequence ? (
          // Modalità sequenza narrativa
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-phosphor-300 glow-phosphor-bright">
              La Ninnananna della Cenere
            </h2>
            <div className="text-center mb-4 text-phosphor-500 text-sm">
              Pagina {activeSequence.currentPage} di {activeSequence.totalPages}
            </div>
            <p className="text-lg mb-8 text-phosphor-400 whitespace-pre-wrap leading-relaxed">
              {activeSequence.pages[activeSequence.currentPage - 1]?.text || 'Testo non disponibile'}
            </p>
            <div className="mt-6 text-center text-phosphor-500 text-sm">
              [ENTER] Continua
            </div>
          </>
        ) : (
          // Modalità evento normale
          <>
            <h2 className="text-4xl font-bold mb-4 text-center text-phosphor-300 glow-phosphor-bright">
              {currentEvent?.title || 'Evento'}
            </h2>

            {showingResult ? (
              // Mostra il risultato della scelta
              <div className="text-center">
                <p className="text-lg mb-8 text-phosphor-400 whitespace-pre-wrap">
                  {currentEventResult || 'Risultato elaborato con successo.'}
                </p>
                <div className="mt-6 text-center text-phosphor-500 text-sm">
                  [ENTER] Continua
                </div>
              </div>
            ) : (
              // Mostra descrizione e scelte
              <>
                <p className="text-lg mb-8 text-phosphor-400 whitespace-pre-wrap">
                  {currentEvent?.description || 'Descrizione non disponibile'}
                </p>
                <div className="space-y-3">
                  {hasChoices && currentEvent?.choices.map((choice, index) => (
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
                  {hasChoices ? (
                    '[↑↓/W/S] Naviga | [ENTER] Seleziona | [1-5] Scelta Diretta'
                  ) : (
                    <div>
                      <div className="mb-2">Questo ricordo svanirà automaticamente tra pochi secondi...</div>
                      <div>[ENTER] Chiudi ora</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventScreen;