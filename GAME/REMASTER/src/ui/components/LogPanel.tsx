import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const LogPanel: React.FC = () => {
    const journal = useGameStore((state) => state.journal);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return `[${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}]`;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'warning': return 'text-yellow-500';
            case 'error': return 'text-red-500';
            case 'success': return 'text-green-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="h-1/3 border border-green-800 bg-black p-2 rounded overflow-y-auto custom-scrollbar text-sm font-mono">
            <h2 className="text-center border-b border-green-900 mb-2 text-xs font-bold sticky top-0 bg-black/90 py-1">DIARIO DI VIAGGIO</h2>
            <div className="space-y-1.5 px-1">
                {journal.length === 0 ? (
                    <p className="text-gray-500 italic text-center text-xs mt-4">Nessuna voce nel diario...</p>
                ) : (
                    journal.map((entry, index) => (
                        <p key={index}>
                            <span className="text-green-600">{formatTime(entry.timestamp)}</span>{' '}
                            <span className={getTypeColor(entry.type)}>{entry.text}</span>
                        </p>
                    ))
                )}
            </div>
        </div>
    );
};
