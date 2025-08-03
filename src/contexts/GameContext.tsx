import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ICharacterSheet } from '../rules/types';
import type { LogEntry } from '../data/MessageArchive';
import { createTestCharacter } from '../rules/characterGenerator';
import { MessageType } from '../data/MessageArchive';

interface GameState {
  characterSheet: ICharacterSheet;
  logEntries: LogEntry[];
  isInventoryOpen: boolean;
  toggleInventory: () => void;
  selectedInventoryIndex: number;
  setSelectedInventoryIndex: (index: number) => void;
}

export const GameContext = createContext<GameState | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [characterSheet] = useState<ICharacterSheet>(createTestCharacter());
  const [logEntries] = useState<LogEntry[]>([]);
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState(0);

  const toggleInventory = useCallback(() => {
    setInventoryOpen(prev => !prev);
  }, []);

  // ... (Aggiungi qui le altre funzioni del contesto come addLogEntry, movePlayer, etc.)

  const value = { characterSheet, logEntries, isInventoryOpen, toggleInventory, selectedInventoryIndex, setSelectedInventoryIndex /* ... altre funzioni */ };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};