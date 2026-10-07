import React, { useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

/** Fatal error (game data that can't be loaded). ENTER retries. */
const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => {
  const handlerMap = useMemo(() => ({ Enter: onRetry }), [onRetry]);
  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-center max-w-3xl p-8 border-2 border-[var(--border-primary)] rounded-lg">
        <h1 className="text-5xl mb-6 text-[var(--text-danger)] font-bold animate-pulse">ERRORE DI CARICAMENTO</h1>
        <p className="text-2xl mb-8 text-[var(--text-primary)] leading-relaxed whitespace-pre-line break-words">{message}</p>
        <button
          onClick={onRetry}
          className="px-8 py-4 text-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] hover:scale-110 transition-transform cursor-pointer font-bold border-2 border-[var(--text-primary)] rounded"
        >
          [INVIO] RIPROVA
        </button>
        <p className="text-xl mt-8 text-[var(--text-secondary)] opacity-70">
          Se il problema persiste, i file del gioco potrebbero essere danneggiati: reinstalla il gioco o segnala il problema.
        </p>
      </div>
    </div>
  );
};

export default ErrorScreen;
