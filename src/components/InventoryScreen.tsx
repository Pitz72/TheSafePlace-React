/**
 * InventoryScreen.tsx — Layout a 2 colonne (UI stabile)
 * Linee guida dimensioni (coerenti con v0.3.7 "Tailwind Omologation"):
 * - Titoli: H2 5xl, H3 3xl — se riduci, mantieni gerarchie visive
 * - Liste: text-2xl; Dettagli: text-xl/2xl — verificare overflow su 1366x768
 * - Box: max-w-6xl + gap-8 — non ridurre senza verificare leggibilità
 * - Interazione: [↑↓] selezione, [1-9] usa, [ESC]/[I] chiudi — invarianti
 */
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getItemColorClass } from '../utils/itemColors';
import { getAvailableActions, getDefaultAction, executeItemAction, getDetailedExamination } from '../utils/itemActions';
import { getPortionDescription, isPortionableItem, getTotalPortions } from '../utils/portionSystem';

const InventoryScreen: React.FC = () => {
  const {
    characterSheet,
    items,
    selectedInventoryIndex,
    goBack,
    useItem,
    equipItemFromInventory,
    dropItem
  } = useGameStore(state => ({
    characterSheet: state.characterSheet,
    items: state.items,
    selectedInventoryIndex: state.selectedInventoryIndex,
    goBack: state.goBack,
    useItem: state.useItem,
    equipItemFromInventory: state.equipItemFromInventory,
    dropItem: state.dropItem,
  }));
  const [showActions, setShowActions] = useState(false);
  const [examinationText, setExaminationText] = useState<string[] | null>(null);

  const selectedItemStack = selectedInventoryIndex !== null ? characterSheet.inventory[selectedInventoryIndex] : null;
  const selectedItem = selectedItemStack ? items[selectedItemStack.itemId] : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // La navigazione base (ESC, I, frecce, numeri) è gestita da useKeyboardCommands.
      // Questo useEffect gestisce solo la logica contestuale a questa schermata.

      if (event.key === 'Escape') {
        if (showActions || examinationText) {
          event.preventDefault();
          setShowActions(false);
          setExaminationText(null);
        }
        // Il goBack() generale è gestito dall'hook globale
        return;
      }

      // Gestione azioni oggetti
      if (showActions && selectedItemStack && selectedItem) {
        const actions = getAvailableActions(selectedItem);
        const action = actions.find(a => a.key.toLowerCase() === event.key.toLowerCase());

        if (action && action.available) {
          event.preventDefault();
          executeItemAction(
            action,
            selectedItem,
            selectedInventoryIndex,
            (slotIndex) => useItem(slotIndex), // USO
            (_item, slotIndex) => equipItemFromInventory(slotIndex), // EQUIPAGGIA
            (item) => {
              // ESAMINA
              setExaminationText(getDetailedExamination(item));
              setShowActions(false);
            },
            (slotIndex) => dropItem(slotIndex) // GETTA
          );

          if (action.key !== 'X') { // Non chiudere per esame
            setShowActions(false);
          }
        }
        return;
      }

      // Mostra opzioni con ENTER
      if (event.key === 'Enter' && selectedItemStack && selectedItem) {
        event.preventDefault();
        setShowActions(true);
        setExaminationText(null);
        return;
      }

      // La logica di navigazione (frecce) e uso (numeri) sarà in useKeyboardCommands
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, showActions, selectedInventoryIndex, selectedItemStack, selectedItem, useItem, equipItemFromInventory, dropItem]);

  const availableActions = selectedItem ? getAvailableActions(selectedItem) : [];
  const defaultAction = selectedItem ? getDefaultAction(selectedItem) : null;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      <h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">
        INVENTARIO
      </h2>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Colonna Sinistra: Lista Oggetti */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim animate-pulse">
          <h3 className="text-3xl font-bold mb-4 text-center text-phosphor-400 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright">ZAINO</h3>
          <ul className="space-y-2 text-2xl pl-4">
            {characterSheet.inventory.map((itemStack, index) => {
              const item = itemStack ? items[itemStack.itemId] : null;

              // Genera label con informazioni porzioni
              let label = '[Vuoto]';
              if (itemStack && item) {
                const portionDesc = getPortionDescription(item, itemStack);
                label = `${item.name} (${portionDesc})`;
              }

              const itemColorClass = item ? getItemColorClass(item) : '';
              const isSelected = selectedInventoryIndex === index;

              return (
                <li
                  key={index}
                  className={`p-3 rounded-lg transition-all duration-300 transform ${isSelected
                      ? 'bg-phosphor-400 text-black font-bold border-2 border-phosphor-bright glow-phosphor-bright scale-105 shadow-lg shadow-phosphor-400/50'
                      : item
                        ? `${itemColorClass} border border-transparent`
                        : 'text-phosphor-700'
                    }`}>
                  <span className="ml-2">{label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Colonna Destra: Descrizione Oggetto */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80 glow-phosphor-dim animate-pulse min-h-[300px]">
          <h3 className="text-3xl font-bold mb-4 text-center text-phosphor-400 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright">
            DESCRIZIONE
            <span className="text-lg ml-2 text-phosphor-700">
              [Slot {selectedInventoryIndex + 1}]
            </span>
          </h3>
          {examinationText ? (
            <div className="space-y-2 text-lg">
              <div className="text-phosphor-400 font-bold mb-4">ESAME DETTAGLIATO</div>
              {examinationText.map((line, index) => (
                <p key={index} className={line === '' ? 'h-2' : 'text-phosphor-300'}>
                  {line}
                </p>
              ))}
              <div className="mt-4 pt-4 border-t border-phosphor-700">
                <p className="text-phosphor-400 text-sm">[ESC] Torna alla descrizione</p>
              </div>
            </div>
          ) : showActions && selectedItem ? (
            <div className="space-y-4 text-xl">
              <p className={`text-2xl font-bold glow-phosphor-primary text-shadow-phosphor-bright ${getItemColorClass(selectedItem)}`}>
                {selectedItem.name}
              </p>
              <div className="border border-phosphor-500 p-4 bg-gray-800 bg-opacity-50">
                <p className="text-phosphor-400 font-bold mb-3">AZIONI DISPONIBILI:</p>
                <div className="space-y-2">
                  {availableActions.map((action) => (
                    <div key={action.key} className={`flex items-center space-x-3 p-2 rounded ${action.available ? 'hover:bg-gray-700' : ''}`}>
                      <span className={`font-bold text-lg w-8 ${action.available ? 'text-phosphor-400' : 'text-gray-600'}`}>
                        [{action.key}]
                      </span>
                      <span className={`font-bold ${action.color}`}>
                        {action.label}
                      </span>
                      <span className={`text-sm ${action.available ? 'text-phosphor-300' : 'text-gray-600'}`}>
                        - {action.description}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-phosphor-700">
                  <p className="text-phosphor-400 text-sm">
                    Premi il tasto corrispondente per eseguire l'azione
                  </p>
                  <p className="text-phosphor-700 text-xs mt-1">
                    [ESC] Annulla
                  </p>
                </div>
              </div>
            </div>
          ) : selectedItem ? (
            <div className="space-y-4 text-xl">
              <p className={`text-2xl font-bold glow-phosphor-primary text-shadow-phosphor-bright ${getItemColorClass(selectedItem)}`}>
                {selectedItem.name}
              </p>
              <p className="text-phosphor-700 italic">{selectedItem.description}</p>
              <div className="mt-4 space-y-2">
                <p><span className="font-bold text-phosphor-400">Tipo:</span> <span className={getItemColorClass(selectedItem)}>{selectedItem.type}</span></p>
                {selectedItem.rarity && (
                  <p><span className="font-bold text-phosphor-400">Rarità:</span> <span className={getItemColorClass(selectedItem)}>{selectedItem.rarity}</span></p>
                )}
                <p><span className="font-bold text-phosphor-400">Peso:</span> {selectedItem.weight} kg</p>
                {selectedItem.value && (
                  <p><span className="font-bold text-phosphor-400">Valore:</span> {selectedItem.value} crediti</p>
                )}
                {selectedItem.damage && (
                  <p><span className="font-bold text-phosphor-400">Danno:</span> <span className="item-weapon">{selectedItem.damage}</span></p>
                )}
                {selectedItem.armor && (
                  <p><span className="font-bold text-phosphor-400">Armatura:</span> <span className="item-armor">+{selectedItem.armor} AC</span></p>
                )}
                {selectedItem.effect && (
                  <p><span className="font-bold text-phosphor-400">Effetto:</span> <span className="item-consumable">{selectedItem.effect}</span></p>
                )}

                {/* Informazioni porzioni per consumabili */}
                {selectedItemStack && isPortionableItem(selectedItem) && (
                  <div className="mt-4 p-3 border border-phosphor-500 bg-gray-800 bg-opacity-30 rounded">
                    <p className="text-phosphor-400 font-bold mb-2">INFORMAZIONI PORZIONI:</p>
                    <p><span className="font-bold text-phosphor-400">Porzioni totali:</span> {getTotalPortions(selectedItem, selectedItemStack)}</p>
                    <p><span className="font-bold text-phosphor-400">Dimensione porzione:</span> <span className="item-consumable">{selectedItem.portionSize}</span></p>
                    <p><span className="font-bold text-phosphor-400">Effetto per porzione:</span> <span className="item-consumable">+{selectedItem.portionEffect}</span></p>
                    {selectedItem.portionsPerUnit && (
                      <p><span className="font-bold text-phosphor-400">Porzioni per unità:</span> {selectedItem.portionsPerUnit}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Azione di default */}
              <div className="mt-6 p-3 border border-phosphor-500 bg-gray-800 bg-opacity-30 rounded">
                <p className="text-phosphor-400 text-lg">
                  <span className="font-bold">[ENTER]</span> Mostra opzioni disponibili
                </p>
              </div>
            </div>
          ) : (
            <p className="text-phosphor-700 text-xl italic">Seleziona un oggetto per vederne i dettagli.</p>
          )}
        </div>
      </div>

      <div className="text-2xl text-phosphor-400 font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-pulse">
        {showActions ? (
          "[U/E/X/G] Azioni | [ESC] Annulla"
        ) : examinationText ? (
          "[ESC] Torna alla descrizione"
        ) : (
          "[↑↓] Seleziona | [ENTER] Opzioni | [ESC] o [I] Chiudi"
        )}
      </div>
    </div>
  );
};

export default InventoryScreen;
