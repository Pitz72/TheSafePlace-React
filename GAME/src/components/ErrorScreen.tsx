import React, { useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import Icon from './ui/Icon';
import KeyHints from './ui/KeyHints';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

/** Fatal error (game data that can't be loaded). ENTER retries. */
const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => {
  const handlerMap = useMemo(() => ({ Enter: onRetry }), [onRetry]);
  useKeyboardInput(handlerMap);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg0 p-10">
      <div className="surface w-full max-w-[760px] px-12 py-10 text-center">
        <Icon name="warning" size={44} className="mx-auto text-danger" />
        <div className="eyebrow mt-5 text-danger">Errore di caricamento</div>
        <p className="mt-5 whitespace-pre-line break-words text-[21px] leading-relaxed text-ink">{message}</p>
        <button
          onClick={onRetry}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-3 text-[19px] font-semibold text-bg0 transition-transform hover:scale-105"
        >
          <Icon name="resume" size={20} /> Riprova
        </button>
        <div className="mt-5"><KeyHints hints={[{ keys: ['INVIO'], label: 'Riprova' }]} /></div>
        <p className="mt-8 text-[17px] leading-relaxed text-ink3">
          Se il problema persiste, i file del gioco potrebbero essere danneggiati: reinstalla il gioco o segnala il problema.
        </p>
      </div>
    </div>
  );
};

export default ErrorScreen;
