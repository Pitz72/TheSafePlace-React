/**
 * InventoryScreen.tsx — Layout a 2 colonne (UI stabile)
 * Linee guida dimensioni (coerenti con v0.3.7 "Tailwind Omologation"):
 * - Titoli: H2 5xl, H3 3xl — se riduci, mantieni gerarchie visive
 * - Liste: text-2xl; Dettagli: text-xl/2xl — verificare overflow su 1366x768
 * - Box: max-w-6xl + gap-8 — non ridurre senza verificare leggibilità
 * - Interazione: [↑↓] selezione, [1-9] usa, [ESC]/[I] chiudi — invarianti
 */
import React, { useEffect } from 'react';
import { useGameContext } from '../hooks/useGameContext';

const InventoryScreen: React.FC = () => {
  const { characterSheet, items, selectedInventoryIndex, goBack } = useGameContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key.toLowerCase() === 'i') {
        event.preventDefault();
        goBack();
      }
      // La logica di navigazione (frecce) e uso (numeri) sarà in useKeyboardCommands
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack]);

  const selectedItemStack = characterSheet.inventory[selectedInventoryIndex];
  const selectedItem = selectedItemStack ? items[selectedItemStack.itemId] : null;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
        INVENTARIO
      </h2>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Colonna Sinistra: Lista Oggetti */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim animate-pulse">
          <h3 className="text-3xl font-bold mb-4 text-center text-phosphor-400 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright">ZAINO</h3>
          <ul className="space-y-2 text-2xl">
            {characterSheet.inventory.map((itemStack, index) => {
              const item = itemStack ? items[itemStack.itemId] : null;
              const label = itemStack && item ? `${item.name} (x${itemStack.quantity})` : '[Vuoto]';
              return (
                <li 
                  key={index} 
                  className={`p-2 rounded transition-colors duration-200 ${selectedInventoryIndex === index ? 'bg-phosphor-400 text-black font-bold' : 'text-phosphor-700'}`}>
                  {index + 1}. {label}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Colonna Destra: Descrizione Oggetto */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim animate-pulse min-h-[300px]">
          <h3 className="text-3xl font-bold mb-4 text-center text-phosphor-400 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright">DESCRIZIONE</h3>
          {selectedItem ? (
            <div className="space-y-4 text-xl">
              <p className="text-2xl text-phosphor-400 font-bold glow-phosphor-primary text-shadow-phosphor-bright">{selectedItem.name}</p>
              <p className="text-phosphor-700 italic">{selectedItem.description}</p>
              <p className="mt-4"><span className="font-bold">Tipo:</span> {selectedItem.type}</p>
              <p><span className="font-bold">Peso:</span> {selectedItem.weight} kg</p>
            </div>
          ) : (
            <p className="text-phosphor-700 text-xl italic">Seleziona un oggetto per vederne i dettagli.</p>
          )}
        </div>
      </div>

      <div className="text-2xl text-phosphor-400 font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-pulse">
        [↑↓] Seleziona | [1-9] Usa | [ESC] o [I] Chiudi
      </div>
    </div>
  );
};

export default InventoryScreen;
