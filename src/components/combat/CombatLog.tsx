import React, { useEffect, useRef } from 'react';
import type { CombatLogEntry } from '@/types/combat';

interface CombatLogProps {
  logEntries: CombatLogEntry[];
}

const getEntryColor = (type: CombatLogEntry['type']): string => {
  switch (type) {
    case 'damage':
      return 'text-red-400';
    case 'healing':
      return 'text-green-400';
    case 'info':
      return 'text-cyan-400';
    case 'roll':
        return 'text-gray-400';
    case 'error':
        return 'text-orange-500';
    default:
      return 'text-phosphor-400';
  }
};

const CombatLog: React.FC<CombatLogProps> = ({ logEntries }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom of the log
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries]);

  return (
    <div className="panel h-full flex flex-col">
      <h2 className="panel-title">LOG COMBATTIMENTO</h2>
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 text-sm"
        aria-live="polite"
      >
        {logEntries.length === 0 ? (
          <p className="text-gray-500">In attesa di azioni...</p>
        ) : (
          logEntries.map((entry) => (
            <div key={entry.id} className={`font-mono ${getEntryColor(entry.type)}`}>
              <span className="text-gray-500 mr-2">[{entry.timestamp}]</span>
              <span>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CombatLog;
