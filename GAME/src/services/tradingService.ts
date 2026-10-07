/**
 * Barter between the player and the traders.
 *
 * A trade is fair when what the player offers is worth at least the trader's
 * goods times the markup; Persuasion lowers the markup. Traders have a real,
 * finite stock (saved in gameStore.traderStock) that refills every few days;
 * whatever the player sells is added to it.
 */
import { useTradingStore, StockEntry } from '../store/tradingStore';
import { useTraderDatabaseStore } from '../data/traderDatabase';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore, isProtectedItem } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { GameState, InventoryItem, JournalEntryType } from '../types';
import { audioManager } from '../utils/audio';
import { toAbsoluteMinutes } from '../utils/time';

const DEFAULT_RESTOCK_HOURS = 72;
const MINIMUM_MARKUP = 1.05;

export const tradingService = {
  /** 2% less markup per point of Persuasion bonus, never below 105%. */
  calculateEffectiveMarkup: (baseMarkup: number, persuasionBonus: number): number =>
    Math.max(baseMarkup - persuasionBonus * 0.02, MINIMUM_MARKUP),

  /** Value of one unit; worn gear is worth less (down to a quarter). */
  unitValue: (item: Pick<InventoryItem, 'itemId' | 'durability'>): number => {
    const base = useItemDatabaseStore.getState().itemDatabase[item.itemId]?.value ?? 0;
    if (!item.durability || item.durability.max <= 0) return base;
    return Math.round(base * Math.max(0.25, item.durability.current / item.durability.max));
  },

  isTradable: (itemId: string): boolean => !isProtectedItem(itemId),

  /** Current stock of a trader, refilled when the restock time has passed. */
  getTraderStock: (traderId: string): StockEntry[] => {
    const trader = useTraderDatabaseStore.getState().traders[traderId];
    if (!trader) return [];
    const now = toAbsoluteMinutes(useTimeStore.getState().gameTime);
    const saved = useGameStore.getState().traderStock[traderId];
    const restockMinutes = (trader.restockHours ?? DEFAULT_RESTOCK_HOURS) * 60;
    if (!saved || now - saved.restockedAt >= restockMinutes) {
      const items: Record<string, number> = {};
      trader.inventory.forEach(entry => { items[entry.itemId] = (items[entry.itemId] ?? 0) + entry.quantity; });
      useGameStore.setState(state => ({ traderStock: { ...state.traderStock, [traderId]: { items, restockedAt: now } } }));
      return Object.entries(items).map(([itemId, quantity]) => ({ itemId, quantity }));
    }
    return Object.entries(saved.items).filter(([, quantity]) => quantity > 0).map(([itemId, quantity]) => ({ itemId, quantity }));
  },

  startTradingSession: (traderId: string, returnState?: GameState) => {
    const trader = useTraderDatabaseStore.getState().traders[traderId];
    const game = useGameStore.getState();
    if (!trader) {
      console.error(`[TRADING SERVICE] Trader ${traderId} not found in database`);
      game.addJournalEntry({ text: `Errore: mercante ${traderId} non trovato.`, type: JournalEntryType.SYSTEM_ERROR });
      return;
    }

    const baseMarkup = Number.isFinite(trader.baseMarkup) ? trader.baseMarkup : 1.3;
    const persuasionBonus = useCharacterStore.getState().getSkillBonus('persuasione');
    let markup = tradingService.calculateEffectiveMarkup(baseMarkup, persuasionBonus);
    const friendship = traderId === 'marcus' && game.hasFlag('MARCUS_FRIENDSHIP');
    if (friendship) markup = Math.max(1, markup * 0.9);

    const stateToReturn = returnState ?? (game.gameState === GameState.OUTPOST ? GameState.OUTPOST : GameState.IN_GAME);
    useTradingStore.getState().setActiveTrader(traderId, markup, tradingService.getTraderStock(traderId), stateToReturn);
    game.setGameState(GameState.TRADING);
    audioManager.playSound('confirm');

    const markupPercent = Math.round((markup - 1) * 100);
    game.addJournalEntry({
      text: `Inizi a commerciare con ${trader.name}. Ricarico: ${markupPercent}% [Persuasione ${persuasionBonus >= 0 ? '+' : ''}${persuasionBonus}]${friendship ? ' [Amicizia: -10%]' : ''}`,
      type: JournalEntryType.NARRATIVE,
    });
  },

  finalizeTrade: (): boolean => {
    const { activeTraderId, playerOffer, traderOffer, balance, traderStock, returnState, reset } = useTradingStore.getState();
    const game = useGameStore.getState();
    const { itemDatabase } = useItemDatabaseStore.getState();
    if (!activeTraderId) return false;

    if (playerOffer.length === 0 || traderOffer.length === 0) {
      game.addJournalEntry({ text: 'Entrambe le parti devono offrire almeno un oggetto.', type: JournalEntryType.ACTION_FAILURE });
      audioManager.playSound('error');
      return false;
    }
    if (balance < 0) {
      game.addJournalEntry({ text: `La tua offerta è insufficiente. Mancano ${Math.abs(balance)} punti valore.`, type: JournalEntryType.ACTION_FAILURE });
      audioManager.playSound('error');
      return false;
    }
    const { inventory } = useCharacterStore.getState();
    const offerValid = playerOffer.every(o => inventory[o.inventoryIndex]?.itemId === o.itemId && inventory[o.inventoryIndex].quantity >= o.quantity && tradingService.isTradable(o.itemId))
      && traderOffer.every(o => traderStock[o.inventoryIndex]?.itemId === o.itemId && traderStock[o.inventoryIndex].quantity >= o.quantity);
    if (!offerValid) {
      game.addJournalEntry({ text: "Lo scambio non è più valido. Ricomponi l'offerta.", type: JournalEntryType.ACTION_FAILURE });
      audioManager.playSound('error');
      return false;
    }

    // Exact slots the player picked, from the last one so indices stay valid.
    const character = useCharacterStore.getState();
    [...playerOffer].sort((a, b) => b.inventoryIndex - a.inventoryIndex)
      .forEach(o => useCharacterStore.getState().discardItem(o.inventoryIndex, o.quantity));
    traderOffer.forEach(o => character.addItem(o.itemId, o.quantity));

    const items: Record<string, number> = {};
    traderStock.forEach(entry => { items[entry.itemId] = entry.quantity; });
    traderOffer.forEach(o => { items[o.itemId] = (items[o.itemId] ?? 0) - o.quantity; });
    playerOffer.forEach(o => { items[o.itemId] = (items[o.itemId] ?? 0) + o.quantity; });
    useGameStore.setState(state => ({
      traderStock: {
        ...state.traderStock,
        [activeTraderId]: { items, restockedAt: state.traderStock[activeTraderId]?.restockedAt ?? toAbsoluteMinutes(useTimeStore.getState().gameTime) },
      },
    }));

    const describe = (list: typeof playerOffer) => list.map(o => `${itemDatabase[o.itemId]?.name ?? o.itemId} x${o.quantity}`).join(', ');
    game.addJournalEntry({ text: `Scambio completato! Hai dato: ${describe(playerOffer)}.`, type: JournalEntryType.NARRATIVE });
    game.addJournalEntry({ text: `Hai ricevuto: ${describe(traderOffer)}.`, type: JournalEntryType.ITEM_ACQUIRED });

    reset();
    game.setGameState(returnState ?? GameState.IN_GAME);
    audioManager.playSound('confirm');
    return true;
  },

  cancelTrade: () => {
    const { reset, returnState } = useTradingStore.getState();
    const game = useGameStore.getState();
    reset();
    game.setGameState(returnState ?? GameState.IN_GAME);
    audioManager.playSound('cancel');
    game.addJournalEntry({ text: 'Hai chiuso le trattative.', type: JournalEntryType.NARRATIVE });
  },
};
