import { create } from 'zustand';
import { TradeItem, GameState } from '../types';

export interface StockEntry {
  itemId: string;
  quantity: number;
}

/** State of the trade in progress. Ephemeral: never saved. */
interface TradingStoreState {
  activeTraderId: string | null;
  /** The trader's goods for this session (remaining stock). */
  traderStock: StockEntry[];
  playerOffer: TradeItem[];
  traderOffer: TradeItem[];
  playerOfferValue: number;
  traderOfferValue: number;
  effectiveMarkup: number;
  /** playerOfferValue - traderOfferValue × markup: the trade is fair at >= 0. */
  balance: number;
  selectedPanel: 'player' | 'trader';
  selectedIndex: number;
  returnState: GameState | null;

  setActiveTrader: (traderId: string, markup: number, stock: StockEntry[], returnState: GameState) => void;
  addToPlayerOffer: (item: TradeItem) => void;
  addToTraderOffer: (item: TradeItem) => void;
  removeFromPlayerOffer: (index: number) => void;
  removeFromTraderOffer: (index: number) => void;
  updateBalance: () => void;
  setSelectedPanel: (panel: 'player' | 'trader') => void;
  setSelectedIndex: (index: number) => void;
  reset: () => void;
}

const initialState = () => ({
  activeTraderId: null,
  traderStock: [],
  playerOffer: [],
  traderOffer: [],
  playerOfferValue: 0,
  traderOfferValue: 0,
  effectiveMarkup: 1.0,
  balance: 0,
  selectedPanel: 'player' as const,
  selectedIndex: 0,
  returnState: null,
});

export const useTradingStore = create<TradingStoreState>((set, get) => ({
  ...initialState(),

  setActiveTrader: (traderId, markup, stock, returnState) => {
    set({ ...initialState(), activeTraderId: traderId, effectiveMarkup: markup, traderStock: stock, returnState });
  },

  addToPlayerOffer: (item) => {
    set(state => ({ playerOffer: [...state.playerOffer, item] }));
    get().updateBalance();
  },

  addToTraderOffer: (item) => {
    set(state => ({ traderOffer: [...state.traderOffer, item] }));
    get().updateBalance();
  },

  removeFromPlayerOffer: (index) => {
    set(state => ({ playerOffer: state.playerOffer.filter((_, i) => i !== index) }));
    get().updateBalance();
  },

  removeFromTraderOffer: (index) => {
    set(state => ({ traderOffer: state.traderOffer.filter((_, i) => i !== index) }));
    get().updateBalance();
  },

  updateBalance: () => {
    const { playerOffer, traderOffer, effectiveMarkup } = get();
    const playerOfferValue = playerOffer.reduce((sum, item) => sum + item.value, 0);
    const traderOfferValue = traderOffer.reduce((sum, item) => sum + item.value, 0);
    set({ playerOfferValue, traderOfferValue, balance: Math.round(playerOfferValue - traderOfferValue * effectiveMarkup) });
  },

  setSelectedPanel: (panel) => set({ selectedPanel: panel, selectedIndex: 0 }),

  setSelectedIndex: (index) => set({ selectedIndex: index }),

  reset: () => set(initialState()),
}));
