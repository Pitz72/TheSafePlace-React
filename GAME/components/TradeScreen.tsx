import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { useTraderDatabaseStore } from '../data/traderDatabase';
import { useCharacterStore } from '../store/characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { tradingService } from '../services/tradingService';
import { TradeItem } from '../types';

/**
 * TradeScreen component (v1.7.0).
 * Renders the barter/trading interface with dual-panel layout.
 * 
 * @description Full-screen trading interface with:
 * - Left panel: Player inventory
 * - Right panel: Trader inventory
 * - Center: Trade offers and balance indicator
 * - Keyboard-only navigation (arrows, space, enter, esc)
 * 
 * @returns {JSX.Element} The rendered TradeScreen component.
 */
const TradeScreen: React.FC = () => {
  const {
    activeTraderId,
    playerOffer,
    traderOffer,
    playerOfferValue,
    traderOfferValue,
    effectiveMarkup,
    balance,
    selectedPanel,
    selectedIndex,
    setSelectedPanel,
    setSelectedIndex,
    addToPlayerOffer,
    addToTraderOffer,
    removeFromPlayerOffer,
    removeFromTraderOffer,
  } = useTradingStore();

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const { traders } = useTraderDatabaseStore();
  const { inventory } = useCharacterStore();
  const { itemDatabase } = useItemDatabaseStore();

  const trader = activeTraderId ? traders[activeTraderId] : null;

  // Build trader inventory with item details
  const traderInventory = useMemo(() => {
    if (!trader) return [];
    return trader.inventory.map((invItem, index) => {
      const itemData = itemDatabase[invItem.itemId];
      if (!itemData) {
        console.warn(`[TRADE] Item ${invItem.itemId} not found in database`);
      }
      return {
        index,
        itemId: invItem.itemId,
        name: itemData?.name || `[${invItem.itemId}]`,
        quantity: invItem.quantity,
        value: itemData?.value || 0,
        color: itemData?.color || '#a3a3a3',
      };
    });
  }, [trader, itemDatabase]);

  // Build player inventory with item details
  const playerInventory = useMemo(() => {
    return inventory.map((invItem, index) => {
      const itemData = itemDatabase[invItem.itemId];
      if (!itemData) {
        console.warn(`[TRADE] Item ${invItem.itemId} not found in database`);
      }
      return {
        index,
        itemId: invItem.itemId,
        name: itemData?.name || `[${invItem.itemId}]`,
        quantity: invItem.quantity,
        value: itemData?.value || 0,
        color: itemData?.color || '#a3a3a3',
      };
    });
  }, [inventory, itemDatabase]);

  // Current inventory being viewed
  const currentInventory = selectedPanel === 'player' ? playerInventory : traderInventory;

  // Navigation
  const navigate = useCallback((direction: number) => {
    const maxIndex = currentInventory.length - 1;
    setSelectedIndex(Math.max(0, Math.min(selectedIndex + direction, maxIndex)));
  }, [selectedIndex, currentInventory.length, setSelectedIndex]);

  const switchPanel = useCallback(() => {
    setSelectedPanel(selectedPanel === 'player' ? 'trader' : 'player');
  }, [selectedPanel, setSelectedPanel]);

  // Adjust quantity for selected item
  const adjustQuantity = useCallback((delta: number) => {
    if (currentInventory.length === 0) return;
    const selectedItem = currentInventory[selectedIndex];
    if (!selectedItem) return;
    
    const newQuantity = Math.max(1, Math.min(selectedItem.quantity, selectedQuantity + delta));
    setSelectedQuantity(newQuantity);
  }, [currentInventory, selectedIndex, selectedQuantity]);

  // Reset quantity when selection changes
  useEffect(() => {
    setSelectedQuantity(1);
  }, [selectedIndex, selectedPanel]);

  // Toggle item in/out of offer
  const toggleItem = useCallback(() => {
    if (currentInventory.length === 0) return;

    const selectedItem = currentInventory[selectedIndex];
    if (!selectedItem) return;

    if (selectedPanel === 'player') {
      // Check if item is already in player offer
      const offerIndex = playerOffer.findIndex(
        item => item.inventoryIndex === selectedItem.index
      );

      if (offerIndex >= 0) {
        // Remove from offer
        removeFromPlayerOffer(offerIndex);
      } else {
        // Add to offer with selected quantity
        const tradeItem: TradeItem = {
          inventoryIndex: selectedItem.index,
          itemId: selectedItem.itemId,
          quantity: selectedQuantity,
          value: selectedItem.value * selectedQuantity,
        };
        addToPlayerOffer(tradeItem);
        setSelectedQuantity(1); // Reset after adding
      }
    } else {
      // Trader panel
      const offerIndex = traderOffer.findIndex(
        item => item.inventoryIndex === selectedItem.index
      );

      if (offerIndex >= 0) {
        // Remove from offer
        removeFromTraderOffer(offerIndex);
      } else {
        // Add to offer with selected quantity
        const tradeItem: TradeItem = {
          inventoryIndex: selectedItem.index,
          itemId: selectedItem.itemId,
          quantity: selectedQuantity,
          value: selectedItem.value * selectedQuantity,
        };
        addToTraderOffer(tradeItem);
        setSelectedQuantity(1); // Reset after adding
      }
    }
  }, [selectedPanel, selectedIndex, currentInventory, playerOffer, traderOffer, addToPlayerOffer, addToTraderOffer, removeFromPlayerOffer, removeFromTraderOffer, selectedQuantity]);

  // Confirm trade
  const confirmTrade = useCallback(() => {
    tradingService.finalizeTrade();
  }, []);

  // Cancel trade
  const cancelTrade = useCallback(() => {
    tradingService.cancelTrade();
  }, []);

  // Keyboard input
  const handleKeyPress = useCallback((key: string) => {
    switch (key) {
      case 'w':
      case 'ArrowUp':
        navigate(-1);
        break;
      case 's':
      case 'ArrowDown':
        navigate(1);
        break;
      case 'a':
      case 'ArrowLeft':
        adjustQuantity(-1);
        break;
      case 'd':
      case 'ArrowRight':
        adjustQuantity(1);
        break;
      case 'q':
      case 'Q':
        if (selectedPanel === 'trader') switchPanel();
        break;
      case 'e':
      case 'E':
        if (selectedPanel === 'player') switchPanel();
        break;
      case 'Tab':
        switchPanel();
        break;
      case ' ':
        toggleItem();
        break;
      case 'Enter':
        if (balance >= 0 && playerOffer.length > 0 && traderOffer.length > 0) {
          confirmTrade();
        }
        break;
      case 'Escape':
        cancelTrade();
        break;
    }
  }, [navigate, switchPanel, adjustQuantity, toggleItem, confirmTrade, cancelTrade, balance, playerOffer, traderOffer]);

  const handlerMap = useMemo(() => ({
    'w': () => handleKeyPress('w'),
    'ArrowUp': () => handleKeyPress('ArrowUp'),
    's': () => handleKeyPress('s'),
    'ArrowDown': () => handleKeyPress('ArrowDown'),
    'a': () => handleKeyPress('a'),
    'ArrowLeft': () => handleKeyPress('ArrowLeft'),
    'd': () => handleKeyPress('d'),
    'ArrowRight': () => handleKeyPress('ArrowRight'),
    'q': () => handleKeyPress('q'),
    'Q': () => handleKeyPress('Q'),
    'e': () => handleKeyPress('e'),
    'E': () => handleKeyPress('E'),
    'Tab': () => handleKeyPress('Tab'),
    ' ': () => handleKeyPress(' '),
    'Enter': () => handleKeyPress('Enter'),
    'Escape': () => handleKeyPress('Escape'),
  }), [handleKeyPress]);

  useKeyboardInput(handlerMap);

  if (!trader) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <p className="text-4xl text-red-500">Errore: Mercante non trovato</p>
      </div>
    );
  }

  const markupPercent = Math.round((effectiveMarkup - 1) * 100);
  const tradeValid = balance >= 0 && playerOffer.length > 0 && traderOffer.length > 0;

  return (
    <div className="absolute inset-0 bg-black/95 flex flex-col p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-5xl font-bold tracking-widest uppercase text-amber-500">
          ═══ COMMERCIO CON {trader.name.toUpperCase()} ═══
        </h1>
        <p className="text-2xl text-amber-400/70 mt-2">
          Markup: {markupPercent}% | Sistema di Baratto
        </p>
      </div>

      {/* Main Trading Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel - Player Inventory */}
        <div className={`flex-1 border-4 ${selectedPanel === 'player' ? 'border-green-500' : 'border-gray-600'} flex flex-col p-4`}>
          <h2 className="text-3xl font-bold text-green-400 mb-3">IL TUO INVENTARIO</h2>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {playerInventory.map((item, index) => {
              const isSelected = selectedPanel === 'player' && selectedIndex === index;
              const isInOffer = playerOffer.some(o => o.inventoryIndex === item.index);
              return (
                <div
                  key={`player-${item.index}`}
                  className={`text-2xl px-2 py-1 ${
                    isSelected ? 'bg-green-500 text-black' : isInOffer ? 'bg-green-900/50 text-green-300' : 'text-gray-300'
                  }`}
                  style={{ color: !isSelected && !isInOffer ? item.color : undefined }}
                >
                  {isSelected && '> '}{item.name} x{item.quantity} [{item.value}v]
                  {isSelected && selectedPanel === 'player' && item.quantity > 1 && (
                    <span className="ml-2 text-yellow-400">[Qtà: {selectedQuantity}]</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Trade Offers */}
        <div className="w-96 flex flex-col gap-4">
          {/* Player Offer */}
          <div className="flex-1 border-4 border-green-600/50 p-4 flex flex-col">
            <h3 className="text-2xl font-bold text-green-400 mb-2">LA TUA OFFERTA</h3>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {playerOffer.length === 0 ? (
                <p className="text-xl text-gray-500 italic">Vuoto</p>
              ) : (
                playerOffer.map((item, index) => {
                  const itemData = itemDatabase[item.itemId];
                  return (
                    <div key={index} className="text-xl text-green-300">
                      {itemData?.name || item.itemId} x{item.quantity} [{item.value}v]
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-2xl font-bold text-green-400 mt-2 pt-2 border-t-2 border-green-600/50">
              Totale: {playerOfferValue}v
            </div>
          </div>

          {/* Trader Offer */}
          <div className="flex-1 border-4 border-amber-600/50 p-4 flex flex-col">
            <h3 className="text-2xl font-bold text-amber-400 mb-2">LA SUA OFFERTA</h3>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {traderOffer.length === 0 ? (
                <p className="text-xl text-gray-500 italic">Vuoto</p>
              ) : (
                traderOffer.map((item, index) => {
                  const itemData = itemDatabase[item.itemId];
                  return (
                    <div key={index} className="text-xl text-amber-300">
                      {itemData?.name || item.itemId} x{item.quantity} [{item.value}v]
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2 pt-2 border-t-2 border-amber-600/50">
              Totale: {Math.round(traderOfferValue * effectiveMarkup)}v
            </div>
          </div>
        </div>

        {/* Right Panel - Trader Inventory */}
        <div className={`flex-1 border-4 ${selectedPanel === 'trader' ? 'border-amber-500' : 'border-gray-600'} flex flex-col p-4`}>
          <h2 className="text-3xl font-bold text-amber-400 mb-3">INVENTARIO {trader.name.toUpperCase()}</h2>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {traderInventory.map((item, index) => {
              const isSelected = selectedPanel === 'trader' && selectedIndex === index;
              const isInOffer = traderOffer.some(o => o.inventoryIndex === item.index);
              return (
                <div
                  key={`trader-${item.index}`}
                  className={`text-2xl px-2 py-1 ${
                    isSelected ? 'bg-amber-500 text-black' : isInOffer ? 'bg-amber-900/50 text-amber-300' : 'text-gray-300'
                  }`}
                  style={{ color: !isSelected && !isInOffer ? item.color : undefined }}
                >
                  {isSelected && '> '}{item.name} x{item.quantity} [{item.value}v]
                  {isSelected && selectedPanel === 'trader' && item.quantity > 1 && (
                    <span className="ml-2 text-yellow-400">[Qtà: {selectedQuantity}]</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Balance Indicator */}
      <div className={`text-center py-4 text-4xl font-bold border-4 mt-4 ${
        balance >= 0 ? 'border-green-500 text-green-400 bg-green-950/30' : 'border-red-500 text-red-400 bg-red-950/30'
      }`}>
        BILANCIO: {balance >= 0 ? '+' : ''}{balance} Valore
        {balance < 0 && <span className="text-2xl block mt-1">Offerta insufficiente!</span>}
        {balance >= 0 && playerOffer.length > 0 && traderOffer.length > 0 && (
          <span className="text-2xl block mt-1 text-green-300">Scambio valido - Premi INVIO</span>
        )}
      </div>

      {/* Controls */}
      <div className="text-center text-2xl mt-4 border-t-4 border-double border-gray-600 pt-4 text-gray-400">
        [W/S / ↑↓] Naviga | [A/D / ←→] Quantità | [Q/E / TAB] Cambia Pannello | [SPAZIO] Aggiungi/Rimuovi | [INVIO] Conferma | [ESC] Annulla
      </div>
    </div>
  );
};

export default TradeScreen;