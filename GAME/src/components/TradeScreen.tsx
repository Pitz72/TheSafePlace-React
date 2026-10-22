import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { useTraderDatabaseStore } from '../data/traderDatabase';
import { useCharacterStore } from '../store/characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { tradingService } from '../services/tradingService';
import { TradeItem } from '../types';
import Modal from './ui/Modal';
import Icon from './ui/Icon';
import { harmonize } from '../utils/palette';

interface TradeRow {
  index: number;
  itemId: string;
  name: string;
  quantity: number;
  value: number;
  color: string;
  tradable: boolean;
  note: string;
}

/** One side of the barter: a scrollable list of goods with their value. */
const GoodsPanel: React.FC<{
  title: string;
  rows: TradeRow[];
  active: boolean;
  selectedIndex: number;
  offered: Set<number>;
  selectedQuantity: number;
}> = ({ title, rows, active, selectedIndex, offered, selectedQuantity }) => {
  const selectedRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (active) selectedRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [active, selectedIndex]);

  return (
    <div
      className="surface-flat flex min-h-0 min-w-0 flex-1 flex-col px-5 py-5 transition-all duration-300"
      style={active ? { borderColor: 'rgb(var(--accent) / 0.5)', boxShadow: '0 0 0 1px rgb(var(--accent) / 0.15), 0 20px 50px -30px rgb(var(--accent) / 0.6)' } : { opacity: 0.8 }}
    >
      <div className="mb-3 flex items-center gap-2.5 px-2">
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-accent' : 'bg-ink4'}`} />
        <h2 className={`eyebrow flex-1 ${active ? '!text-ink' : ''}`}>{title}</h2>
        <span className="tnum text-[16px] text-ink4">{rows.length}</span>
      </div>
      <ul className="scroll-y fade-edges flex min-h-0 flex-1 flex-col gap-1 py-1">
        {rows.length === 0 && <li className="px-3 py-6 text-center text-[19px] italic text-ink4">Niente da offrire</li>}
        {rows.map((row, index) => {
          const isSelected = active && index === selectedIndex;
          const inOffer = offered.has(row.index);
          return (
            <li
              key={row.index}
              ref={isSelected ? selectedRef : null}
              className={`choice !gap-3 !px-4 !py-2.5 text-[19px] ${isSelected ? 'is-selected' : ''} ${!row.tradable ? 'is-disabled' : ''}`}
              style={inOffer && !isSelected ? { background: 'rgb(var(--c-sage) / 0.08)', borderColor: 'rgb(var(--c-sage) / 0.3)' } : undefined}
            >
              {inOffer
                ? <Icon name="check" size={18} strokeWidth={2.4} className="text-sage" />
                : <span className="mx-[5px] h-2 w-2 flex-shrink-0 rounded-full" style={{ background: harmonize(row.color) }} />}
              <span className="min-w-0 flex-1 truncate">
                <span className={isSelected || inOffer ? 'text-ink' : row.tradable ? 'text-ink2' : 'text-ink4'}>{row.name}</span>
                {row.note && <span className="ml-2 text-[16px] text-ink4">{row.note}</span>}
              </span>
              {isSelected && row.quantity > 1 && (
                <span className="flex items-center gap-1 rounded-full border border-accent/50 px-2.5 text-[16px] text-accent">
                  <Icon name="chevronLeft" size={14} strokeWidth={2.4} />
                  <span className="tnum">{selectedQuantity}</span>
                  <Icon name="chevronRight" size={14} strokeWidth={2.4} />
                </span>
              )}
              <span className="tnum w-12 text-right text-[17px] text-ink3">×{row.quantity}</span>
              <span className={`tnum w-14 text-right text-[17px] ${row.tradable ? 'text-gold' : 'text-ink4'}`}>
                {row.tradable ? `${row.value}v` : <Icon name="lock" size={16} className="ml-auto" />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/** What one side puts on the table, with its total. */
const OfferCard: React.FC<{ title: string; items: TradeItem[]; total: number; tone: 'sage' | 'ember'; names: (itemId: string) => string }> = ({ title, items, total, tone, names }) => {
  // The newest item stays in view when the offer is longer than the card.
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [items.length]);
  return (
  <div className="surface-flat flex min-h-0 flex-1 flex-col px-5 py-4">
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="eyebrow">{title}{items.length > 0 ? ` · ${items.length}` : ''}</span>
      <span className={`tnum text-[24px] font-semibold ${tone === 'sage' ? 'text-sage' : 'text-ember2'}`}>{total}v</span>
    </div>
    <ul ref={listRef} className="scroll-y fade-bottom min-h-0 flex-1">
      {items.length === 0
        ? <li className="text-[18px] italic text-ink4">Ancora nulla</li>
        : items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 py-1 text-[18px]">
            <span className="min-w-0 flex-1 truncate text-ink2">{names(item.itemId)}</span>
            <span className="tnum text-ink3">×{item.quantity}</span>
            <span className="tnum w-14 text-right text-gold">{item.value}v</span>
          </li>
        ))}
    </ul>
  </div>
  );
};

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
    traderStock,
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

  const traders = useTraderDatabaseStore(state => state.traders);
  const inventory = useCharacterStore(state => state.inventory);
  const equippedSlots = useCharacterStore(state => [state.equippedWeapon, state.equippedArmor, state.equippedHead, state.equippedLegs].join(','));
  const itemDatabase = useItemDatabaseStore(state => state.itemDatabase);

  const trader = activeTraderId ? traders[activeTraderId] : null;

  const traderInventory = useMemo(() => traderStock.map((entry, index) => {
    const itemData = itemDatabase[entry.itemId];
    return {
      index,
      itemId: entry.itemId,
      name: itemData?.name || `[${entry.itemId}]`,
      quantity: entry.quantity,
      value: tradingService.unitValue({ itemId: entry.itemId }),
      color: itemData?.color || '#a3a3a3',
      tradable: true,
      note: '',
    };
  }), [traderStock, itemDatabase]);

  // Worn gear is worth less; quest items can't be traded.
  const playerInventory = useMemo(() => {
    const equipped = new Set(equippedSlots.split(',').filter(Boolean).map(Number));
    return inventory.map((invItem, index) => {
      const itemData = itemDatabase[invItem.itemId];
      const tradable = tradingService.isTradable(invItem.itemId);
      const notes = [
        invItem.durability ? `${invItem.durability.current}/${invItem.durability.max}` : '',
        equipped.has(index) ? 'E' : '',
        tradable ? '' : 'missione',
      ].filter(Boolean);
      return {
        index,
        itemId: invItem.itemId,
        name: itemData?.name || `[${invItem.itemId}]`,
        quantity: invItem.quantity,
        value: tradingService.unitValue(invItem),
        color: itemData?.color || '#a3a3a3',
        tradable,
        note: notes.length ? ` (${notes.join(', ')})` : '',
      };
    });
  }, [inventory, itemDatabase, equippedSlots]);

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
      if (!selectedItem.tradable) return;
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
  }, [navigate, switchPanel, adjustQuantity, toggleItem, confirmTrade, cancelTrade, balance, playerOffer, traderOffer, selectedPanel]);

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
      <Modal eyebrow="Baratto" icon="warning" accent="danger" title="Mercante non trovato" size="sm" hints={[{ keys: ['ESC'], label: 'Chiudi' }]}>
        <p className="px-12 pb-10 text-[21px] text-ink2">Il mercante con cui stavi trattando non esiste più.</p>
      </Modal>
    );
  }

  const markupPercent = Math.round((effectiveMarkup - 1) * 100);
  const canTrade = balance >= 0 && playerOffer.length > 0 && traderOffer.length > 0;
  const nameOf = (itemId: string) => itemDatabase[itemId]?.name || itemId;

  return (
    <Modal
      eyebrow="Baratto"
      icon="coins"
      title={`Commercio con ${trader.name}`}
      subtitle={`Ricarico ${markupPercent}% · offri oggetti di valore pari o superiore a quello che chiedi.`}
      size="full"
      hints={[
        { keys: ['↑↓'], label: 'Naviga' },
        { keys: ['←→'], label: 'Quantità' },
        { keys: ['TAB'], label: 'Cambia lato' },
        { keys: ['SPAZIO'], label: 'Aggiungi / togli' },
        { keys: ['INVIO'], label: 'Scambia', muted: !canTrade, active: canTrade },
        { keys: ['ESC'], label: 'Annulla' },
      ]}
    >
      <div className="flex h-full gap-5 px-10 pb-7">
        <GoodsPanel
          title="Il tuo inventario"
          rows={playerInventory}
          active={selectedPanel === 'player'}
          selectedIndex={selectedIndex}
          offered={new Set(playerOffer.map(o => o.inventoryIndex))}
          selectedQuantity={selectedQuantity}
        />

        <div className="flex w-[420px] flex-shrink-0 flex-col gap-4">
          <OfferCard title="La tua offerta" items={playerOffer} total={playerOfferValue} tone="sage" names={nameOf} />
          <OfferCard title={`L'offerta di ${trader.name}`} items={traderOffer} total={Math.round(traderOfferValue * effectiveMarkup)} tone="ember" names={nameOf} />
          <div
            className="flex-shrink-0 rounded-2xl border px-5 py-3 transition-colors duration-300"
            style={{
              borderColor: balance >= 0 ? 'rgb(var(--c-sage) / 0.45)' : 'rgb(var(--c-danger) / 0.45)',
              background: balance >= 0 ? 'rgb(var(--c-sage) / 0.08)' : 'rgb(var(--c-danger) / 0.08)',
            }}
          >
            <div className="flex items-baseline gap-4">
              <div className="eyebrow">Bilancio</div>
              <div className={`tnum text-[32px] font-semibold leading-none ${balance >= 0 ? 'text-sage' : 'text-danger'}`}>
                {balance >= 0 ? '+' : ''}{balance}
              </div>
            </div>
            <div className={`mt-1 text-[17px] ${balance < 0 ? 'text-danger' : canTrade ? 'text-sage' : 'text-ink3'}`}>
              {balance < 0 ? 'Offerta insufficiente' : canTrade ? 'Scambio valido: premi INVIO' : 'Scegli cosa dare e cosa prendere'}
            </div>
          </div>
        </div>

        <GoodsPanel
          title={`Scorte di ${trader.name}`}
          rows={traderInventory}
          active={selectedPanel === 'trader'}
          selectedIndex={selectedIndex}
          offered={new Set(traderOffer.map(o => o.inventoryIndex))}
          selectedQuantity={selectedQuantity}
        />
      </div>
    </Modal>
  );
};

export default TradeScreen;
