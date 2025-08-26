import React, { useEffect, ReactNode } from 'react';
import { useGameStore } from '../stores/gameStore';

/**
 * GameProvider è ora un semplice wrapper di inizializzazione.
 * Il suo unico scopo è chiamare `initializeGame` una sola volta
 * all'avvio dell'applicazione. Non fornisce più alcun Context.
 * Tutta la gestione dello stato avviene tramite il direct-access
 * a `useGameStore`.
 */
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initializeGame = useGameStore(state => state.initializeGame);
  const isMapLoading = useGameStore(state => state.isMapLoading);

  useEffect(() => {
    // Chiama initializeGame solo se la mappa non è già stata caricata o in caricamento.
    // Questo previene reinizializzazioni durante l'hot-reloading in sviluppo.
    if (isMapLoading) {
      initializeGame();
    }
  }, [initializeGame, isMapLoading]);

  return <>{children}</>;
};