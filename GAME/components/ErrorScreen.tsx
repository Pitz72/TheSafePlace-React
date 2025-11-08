import React from 'react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

/**
 * ErrorScreen component.
 * Displays an error message with retry functionality.
 * Used when database loading fails or other critical errors occur.
 * @returns {JSX.Element} The rendered ErrorScreen component.
 */
const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-center max-w-2xl p-8 border-2 border-[var(--border-primary)] rounded-lg">
        <h1 className="text-5xl mb-6 text-[var(--text-danger)] font-bold animate-pulse">
          ⚠️ ERRORE DI CARICAMENTO
        </h1>
        <p className="text-2xl mb-8 text-[var(--text-primary)] leading-relaxed">
          {message}
        </p>
        <button
          onClick={onRetry}
          className="px-8 py-4 text-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] 
                     hover:scale-110 transition-transform cursor-pointer font-bold
                     border-2 border-[var(--text-primary)] rounded"
        >
          🔄 RIPROVA
        </button>
        <p className="text-xl mt-8 text-[var(--text-secondary)] opacity-70">
          Se il problema persiste, verifica la tua connessione internet e ricarica la pagina.
        </p>
      </div>
    </div>
  );
};

export default ErrorScreen;

