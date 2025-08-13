/**
 * GameJournal.tsx
 * 
 * Componente UI per la visualizzazione del Diario di Gioco Dinamico e Narrativo.
 * Mostra le voci del diario con colori categorizzati e auto-scroll.
 */

import React, { useEffect, useRef } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { MessageType } from '../data/MessageArchive';

const GameJournal: React.FC = () => {
  const { logEntries } = useGameContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll per mantenere i messaggi più recenti visibili in alto
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logEntries]);
  
  // Determina la classe CSS per il colore del messaggio
  const getMessageClass = (type: MessageType): string => {
    switch (type) {
      case MessageType.GAME_START:
        return 'journal-welcome';
      case MessageType.MOVEMENT_FAIL_MOUNTAIN:
        return 'journal-warning';
      case MessageType.MOVEMENT_ACTION_RIVER:
        return 'journal-river'; // Azzurro per azioni fiume
      case MessageType.AMBIANCE_RANDOM:
        return 'journal-ambiance';
      case MessageType.SKILL_CHECK_SUCCESS:
        return 'text-phosphor-400';
      case MessageType.SKILL_CHECK_FAILURE:
        return 'text-red-400';
      case MessageType.ACTION_SUCCESS:
        return 'text-phosphor-400'; // Verde per azioni riuscite
      case MessageType.ACTION_FAIL:
        return 'text-red-400'; // Rosso per azioni fallite
      case MessageType.SKILL_CHECK_RIVER_SUCCESS:
        return 'journal-river';
      case MessageType.HP_RECOVERY:
        return 'text-phosphor-400'; // Verde per guarigione
      case MessageType.HP_DAMAGE:
        return 'text-red-400'; // Rosso per danni
      case MessageType.CHARACTER_CREATION:
        return 'text-phosphor-accent'; // Blu per creazione personaggio
      case MessageType.REST_BLOCKED:
        return 'text-yellow-400'; // Giallo per riposo bloccato
      case MessageType.BIOME_ENTER:
      default:
        return 'journal-standard';
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-900 bg-opacity-80 border border-phosphor-400 rounded-lg overflow-hidden crt-screen scan-lines animate-crt-flicker glow-phosphor-dim">
      {/* Header del diario */}
      <div className="bg-gray-800 bg-opacity-90 border-b border-phosphor-400 p-3 glow-phosphor-primary">
        <h3 className="text-phosphor-400 text-lg font-bold text-center font-mono tracking-wider text-shadow-phosphor-bright animate-glow">
          DIARIO DI VIAGGIO
        </h3>
        <div className="text-phosphor-700 text-xs text-center mt-1 animate-pulse">
          {logEntries.length} {logEntries.length === 1 ? 'voce' : 'voci'}
        </div>
      </div>
      
      {/* Contenuto del diario */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 text-sm leading-relaxed glow-phosphor-dim scrollbar-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        {logEntries.length === 0 ? (
          // Stato vuoto
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-phosphor-700 italic font-mono animate-pulse text-shadow-phosphor-dim">
                Il tuo viaggio inizierà presto...
              </div>
              <div className="text-phosphor-700 text-xs mt-2 font-mono animate-pulse">
                Le tue avventure saranno registrate qui
              </div>
            </div>
          </div>
        ) : (
          // Voci del diario - ordine invertito (più recenti in alto)
          [...logEntries].reverse().map((entry, index) => (
            <div 
              key={entry.id} 
              className="border-l-2 border-phosphor-bright pl-3 py-2 hover:bg-gray-800 hover:bg-opacity-50 transition-colors duration-200 hover:glow-phosphor-primary"
            >
              {/* Timestamp e messaggio sulla stessa riga */}
              <div className="flex items-start gap-2">
                <div className="text-phosphor-dim text-xs font-mono whitespace-nowrap animate-pulse">
                  {entry.timestamp} - 
                </div>
                <div className={`${getMessageClass(entry.type)} font-mono leading-relaxed flex-1 text-shadow-phosphor-dim`}>
                  {entry.message}
                </div>
              </div>
              
              {/* Separatore visivo per la prima voce (più recente) */}
              {index === 0 && logEntries.length > 1 && (
                <div className="mt-2 border-t border-phosphor-bright opacity-30 animate-pulse"></div>
              )}
            </div>
          ))
        )}
        
        {/* Indicatore di fine diario */}
        {logEntries.length > 0 && (
          <div className="text-center py-2">
            <div className="text-phosphor-dim text-xs font-mono opacity-50 animate-pulse text-shadow-phosphor-dim">
              --- FINE DIARIO ---
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameJournal;