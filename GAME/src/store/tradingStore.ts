import { create } from 'zustand';
import { TradeItem, GameState } from '../types';

/**
 * @interface TradingStoreState
 * @description Manages the state of an active trading session.
 * 
 * @remarks
 * This store is ephemeral - it only exists while a trade is active.
 * When trade ends (completed or cancelled), state is reset.
 * 
 * @property {string | null} activeTraderId - ID of the trader being traded with
 * @property {TradeItem[]} playerOffer - Items player is offering
 * @property {TradeItem[]} traderOffer - Items trader is offering
 * @property {number} playerOfferValue - Total value of player's offer
 * @property {number} traderOfferValue - Total value of trader's offer (before markup)
 * @property {number} effectiveMarkup - Current markup multiplier (adjusted by Persuasion)
 * @property {number} balance - Trade balance (positive = player overpaying, negative = underpaying)
 * @property {'player' | 'trader'} selectedPanel - Which inventory panel is currently selected
 * @property {number} selectedIndex - Index of selected item in current panel
 */
interface TradingStoreState {
  activeTraderId: string | null;
  playerOffer: TradeItem[];
  traderOffer: TradeItem[];
  playerOfferValue: number;
  traderOfferValue: number;
  effectiveMarkup: number;
  balance: number;
  selectedPanel: 'player' | 'trader';
  selectedIndex: number;
  returnState: GameState | null; // State to return to after trade ends
  
  // Actions
  setActiveTrader: (traderId: string, markup: number, returnState?: GameState) => void;
  addToPlayerOffer: (item: TradeItem) => void;
  addToTraderOffer: (item: TradeItem) => void;
  removeFromPlayerOffer: (index: number) => void;
  removeFromTraderOffer: (index: number) => void;
  updateBalance: () => void;
  setSelectedPanel: (panel: 'player' | 'trader') => void;
  setSelectedIndex: (index: number) => void;
  reset: () => void;
}

const initialState = {
  activeTraderId: null,
  playerOffer: [],
  traderOffer: [],
  playerOfferValue: 0,
  traderOfferValue: 0,
  effectiveMarkup: 1.0,
  balance: 0,
  selectedPanel: 'player' as 'player' | 'trader',
  selectedIndex: 0,
  returnState: null,
};

/**
 * Trading Store (v1.7.0)
 * 
 * @description Zustand store for managing active trading session state.
 * Tracks offers from both sides, calculates values and balance in real-time.
 * 
 * @remarks
 * - Ephemeral state (reset when trade ends)
 * - No persistence (not saved/loaded)
 * - Real-time balance calculation
 * - Markup adjustment based on Persuasion skill
 * 
 * @example
 * const { playerOffer, traderOffer, balance } = useTradingStore();
 * 
 * // Start trading session
 * setActiveTrader('marcus', 1.3);
 * 
 * // Add items to offers
 * addToPlayerOffer({ inventoryIndex: 0, itemId: 'gold_coin', quantity: 1, value: 100 });
 * 
 * // Check balance
 * if (balance >= 0) {
 *   // Trade is valid
 * }
 */
export const useTradingStore = create<TradingStoreState>((set, get) => ({
  ...initialState,
  
  /**
   * Initializes a trading session with a specific trader.
   *
   * @param {string} traderId - ID of the trader
   * @param {number} markup - Effective markup multiplier (after Persuasion adjustment)
   * @param {GameState} returnState - Optional state to return to after trade ends
   */
  setActiveTrader: (traderId: string, markup: number, returnState?: GameState) => {
    set({
      activeTraderId: traderId,
      effectiveMarkup: markup,
      playerOffer: [],
      traderOffer: [],
      playerOfferValue: 0,
      traderOfferValue: 0,
      balance: 0,
      selectedPanel: 'player',
      selectedIndex: 0,
      returnState: returnState || null,
    });
  },
  
  /**
   * Adds an item to the player's offer.
   * 
   * @param {TradeItem} item - Item to add
   */
  addToPlayerOffer: (item: TradeItem) => {
    set(state => ({
      playerOffer: [...state.playerOffer, item],
    }));
    get().updateBalance();
  },
  
  /**
   * Adds an item to the trader's offer.
   * 
   * @param {TradeItem} item - Item to add
   */
  addToTraderOffer: (item: TradeItem) => {
    set(state => ({
      traderOffer: [...state.traderOffer, item],
    }));
    get().updateBalance();
  },
  
  /**
   * Removes an item from the player's offer.
   * 
   * @param {number} index - Index of item to remove
   */
  removeFromPlayerOffer: (index: number) => {
    set(state => ({
      playerOffer: state.playerOffer.filter((_, i) => i !== index),
    }));
    get().updateBalance();
  },
  
  /**
   * Removes an item from the trader's offer.
   * 
   * @param {number} index - Index of item to remove
   */
  removeFromTraderOffer: (index: number) => {
    set(state => ({
      traderOffer: state.traderOffer.filter((_, i) => i !== index),
    }));
    get().updateBalance();
  },
  
  /**
   * Recalculates trade balance based on current offers.
   * 
   * @description Calculates:
   * - playerOfferValue: Sum of all player offer item values
   * - traderOfferValue: Sum of all trader offer item values
   * - balance: playerOfferValue - (traderOfferValue × effectiveMarkup)
   * 
   * Balance interpretation:
   * - Positive: Player is overpaying (trade valid)
   * - Zero: Fair trade (trade valid)
   * - Negative: Player is underpaying (trade invalid)
   */
  updateBalance: () => {
    const { playerOffer, traderOffer, effectiveMarkup } = get();
    
    const playerValue = playerOffer.reduce((sum, item) => sum + item.value, 0);
    const traderValue = traderOffer.reduce((sum, item) => sum + item.value, 0);
    const balance = playerValue - (traderValue * effectiveMarkup);
    
    set({
      playerOfferValue: playerValue,
      traderOfferValue: traderValue,
      balance: Math.round(balance), // Round to avoid floating point issues
    });
  },
  
  /**
   * Sets which inventory panel is currently selected.
   * 
   * @param {('player' | 'trader')} panel - Panel to select
   */
  setSelectedPanel: (panel: 'player' | 'trader') => {
    set({ selectedPanel: panel, selectedIndex: 0 });
  },
  
  /**
   * Sets the selected item index in the current panel.
   * 
   * @param {number} index - Index to select
   */
  setSelectedIndex: (index: number) => {
    set({ selectedIndex: index });
  },
  
  /**
   * Resets the trading store to initial state.
   * Called when trade ends (completed or cancelled).
   */
  reset: () => {
    set(initialState);
  },
}));