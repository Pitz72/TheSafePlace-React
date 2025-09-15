import React from 'react';

/**
 * COMPONENTE IMMUTABILE - PATTO DI SVILUPPO
 * 
 * Questo componente è DEFINITIVO e IMMUTABILE.
 * NON deve essere modificato per nessuna ragione al mondo
 * se non previa autorizzazione esplicita dell'operatore.
 * 
 * Il pannello comandi da tastiera rappresenta un elemento
 * di riferimento fondamentale per l'usabilità del gioco
 * e deve rimanere invariato per garantire la coerenza
 * dell'interfaccia utente e dell'esperienza di gioco.
 * 
 * Qualsiasi modifica non autorizzata a questo componente
 * costituisce una violazione del patto di sviluppo.
 */

interface KeyboardCommand {
  key: string;
  description: string;
  category: 'movement' | 'interface' | 'actions' | 'system';
}

const KEYBOARD_COMMANDS: KeyboardCommand[] = [
  // Movimento
  { key: 'WASD/↑↓←→', description: 'Movimento/Navigazione', category: 'movement' },
  
  // Interfaccia
  { key: 'I', description: 'Inventario', category: 'interface' },
  { key: 'TAB', description: 'Scheda Personaggio', category: 'interface' },
  { key: 'ESC', description: 'Menu/Indietro', category: 'interface' },
  
  // Azioni
  { key: 'R', description: 'Riposo Breve', category: 'actions' },
  { key: 'L', description: 'Level Up', category: 'actions' },
  { key: 'C', description: 'Crafting', category: 'actions' },
  
  // Sistema
  { key: 'F5', description: 'Salvataggio Rapido', category: 'system' },
  { key: 'F9', description: 'Caricamento Rapido', category: 'system' }
];

const KeyboardCommandsPanel: React.FC = () => {
  return (
    <div className="mt-4">
      <h3 className="panel-title text-sm mb-2">COMANDI</h3>
      <div className="space-y-1 text-xs">
        {KEYBOARD_COMMANDS.map((command, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-phosphor-300 font-mono">[{command.key}]</span>
            <span className="text-phosphor-400 text-right flex-1 ml-2">{command.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardCommandsPanel;