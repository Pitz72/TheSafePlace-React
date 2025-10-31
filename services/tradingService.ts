/**
 * @fileoverview Trading Service - Barter system logic layer
 *
 * @description Service layer that handles all trading-related logic including:
 * - Starting trading sessions
 * - Calculating effective markup based on Persuasion skill
 * - Managing trade balance
 * - Finalizing trades (item exchange)
 *
 * Trading Philosophy:
 * - Barter system (no currency)
 * - Value-based exchange using item.value property
 * - Dynamic markup adjusted by player's Persuasion skill
 * - Fair trade when: playerOfferValue >= (traderOfferValue × effectiveMarkup)
 *
 * @module services/tradingService
 * @version 1.7.0
 */

import { useTradingStore } from '../store/tradingStore';
import { useTraderDatabaseStore } from '../data/traderDatabase';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { GameState, JournalEntryType } from '../types';
import { audioManager } from '../utils/audio';

/**
 * Trading Service - Barter system management
 *
 * @description Service object containing trading management functions.
 * Centralizes all trading logic including markup calculation and trade execution.
 */
export const tradingService = {
  /**
   * Calculates effective markup based on player's Persuasion skill.
   *
   * @description The trader's markup starts high and decreases with better Persuasion.
   * Formula: effectiveMarkup = baseMarkup - (persuasionBonus × 0.02)
   * 
   * @param {number} baseMarkup - Trader's base markup (e.g., 1.5 = 150%)
   * @param {number} persuasionBonus - Player's Persuasion skill bonus
   * @returns {number} Effective markup multiplier
   *
   * @remarks
   * Examples:
   * - Base 150%, Persuasion +0: 150% markup
   * - Base 150%, Persuasion +5: 140% markup
   * - Base 150%, Persuasion +10: 130% markup
   * - Base 150%, Persuasion +20: 110% markup (minimum)
   * 
   * Minimum markup: 1.05 (105%) - even master negotiators pay a small premium
   *
   * @example
   * const markup = tradingService.calculateEffectiveMarkup(1.5, 10);
   * // Returns 1.3 (130% markup)
   */
  calculateEffectiveMarkup: (baseMarkup: number, persuasionBonus: number): number => {
    const reduction = persuasionBonus * 0.02; // 2% reduction per point of bonus
    let effectiveMarkup = baseMarkup - reduction;
    const minimumMarkup = 1.05; // 5% minimum markup
    
    effectiveMarkup = Math.max(effectiveMarkup, minimumMarkup);
    
    return effectiveMarkup;
  },

  /**
   * Starts a new trading session with a trader.
   *
   * @description Initializes trading state, calculates effective markup,
   * and switches to the trading screen.
   *
   * @param {string} traderId - The ID of the trader to trade with
   *
   * @remarks
   * - Validates that trader exists in database
   * - Calculates effective markup based on player's Persuasion
   * - Sets activeTraderId and effectiveMarkup in tradingStore
   * - Switches gameState to TRADING
   * - Plays confirmation sound
   *
   * @example
   * tradingService.startTradingSession('marcus');
   * // Trading screen opens with Marcus's inventory
   */
  startTradingSession: (traderId: string, returnState?: GameState) => {
    const { traders } = useTraderDatabaseStore.getState();
    const { setActiveTrader } = useTradingStore.getState();
    const { setGameState, addJournalEntry, gameState: currentState } = useGameStore.getState();
    const { getSkillBonus } = useCharacterStore.getState();

    const trader = traders[traderId];
    if (!trader) {
      console.error(`[TRADING SERVICE] Trader ${traderId} not found in database`);
      addJournalEntry({
        text: `Errore: mercante ${traderId} non trovato.`,
        type: JournalEntryType.SYSTEM_ERROR
      });
      return;
    }

    // Calculate effective markup based on Persuasion skill
    const persuasionBonus = getSkillBonus('persuasione');
    let effectiveMarkup = tradingService.calculateEffectiveMarkup(trader.baseMarkup, persuasionBonus);
    
    // v1.8.0: Marcus friendship discount (10% additional)
    const hasMarcusFriendship = useGameStore.getState().gameFlags.has('MARCUS_FRIENDSHIP');
    if (hasMarcusFriendship && traderId === 'marcus') {
      effectiveMarkup *= 0.9; // 10% discount
      addJournalEntry({
        text: `[AMICIZIA] Marcus ti fa uno sconto speciale come amico.`,
        type: JournalEntryType.NARRATIVE,
        color: '#22c55e' // green-500
      });
    }

    // Initialize trading session
    // If returnState not specified, use current state (for context preservation)
    const stateToReturn = returnState || (currentState === GameState.OUTPOST ? GameState.OUTPOST : GameState.IN_GAME);
    setActiveTrader(traderId, effectiveMarkup, stateToReturn);
    setGameState(GameState.TRADING);
    
    audioManager.playSound('confirm');
    
    const markupPercent = Math.round((effectiveMarkup - 1) * 100);
    addJournalEntry({
      text: `Inizi a commerciare con ${trader.name}. Markup: ${markupPercent}% [Persuasione: ${persuasionBonus >= 0 ? '+' : ''}${persuasionBonus}]`,
      type: JournalEntryType.NARRATIVE
    });
    
    console.log(`[TRADING SERVICE] ✅ Started trading with ${traderId} (${trader.name})`);
    console.log(`[TRADING SERVICE] Base markup: ${trader.baseMarkup}, Persuasion: ${persuasionBonus}, Effective: ${effectiveMarkup}`);
  },

  /**
   * Finalizes the trade and exchanges items.
   *
   * @description Validates trade balance, then:
   * - Removes player offer items from player inventory
   * - Adds trader offer items to player inventory
   * - Updates trader inventory (removes sold items)
   * - Closes trading screen
   *
   * @returns {boolean} True if trade was successful, false otherwise
   *
   * @remarks
   * Trade Requirements:
   * - balance >= 0 (player offering enough value)
   * - Both offers must have at least one item
   * 
   * On Success:
   * - Items exchanged
   * - Journal entries added
   * - Trading screen closes
   * - Success sound plays
   * 
   * On Failure:
   * - Error message shown
   * - Trading screen remains open
   * - Error sound plays
   *
   * @example
   * const success = tradingService.finalizeTrade();
   * if (success) {
   *   // Trade completed
   * }
   */
  finalizeTrade: (): boolean => {
    const { 
      activeTraderId, 
      playerOffer, 
      traderOffer, 
      balance,
      reset 
    } = useTradingStore.getState();
    
    const { setGameState, addJournalEntry } = useGameStore.getState();
    const { addItem, removeItem, inventory } = useCharacterStore.getState();
    const { itemDatabase } = useItemDatabaseStore.getState();

    // Validation
    if (!activeTraderId) {
      console.error('[TRADING SERVICE] No active trader');
      return false;
    }

    if (playerOffer.length === 0 || traderOffer.length === 0) {
      addJournalEntry({
        text: 'Entrambe le parti devono offrire almeno un oggetto.',
        type: JournalEntryType.ACTION_FAILURE
      });
      audioManager.playSound('error');
      return false;
    }

    if (balance < 0) {
      const deficit = Math.abs(balance);
      addJournalEntry({
        text: `La tua offerta è insufficiente. Mancano ${deficit} punti valore.`,
        type: JournalEntryType.ACTION_FAILURE
      });
      audioManager.playSound('error');
      return false;
    }

    // Execute trade
    try {
      // Remove items from player inventory
      playerOffer.forEach(tradeItem => {
        removeItem(tradeItem.itemId, tradeItem.quantity);
      });

      // Add items to player inventory
      traderOffer.forEach(tradeItem => {
        addItem(tradeItem.itemId, tradeItem.quantity);
      });

      // Build trade summary for journal
      const playerGaveText = playerOffer.map(item => {
        const itemData = itemDatabase[item.itemId];
        return `${itemData?.name || item.itemId} x${item.quantity}`;
      }).join(', ');

      const playerReceivedText = traderOffer.map(item => {
        const itemData = itemDatabase[item.itemId];
        return `${itemData?.name || item.itemId} x${item.quantity}`;
      }).join(', ');

      addJournalEntry({
        text: `Scambio completato! Hai dato: ${playerGaveText}`,
        type: JournalEntryType.NARRATIVE
      });

      addJournalEntry({
        text: `Hai ricevuto: ${playerReceivedText}`,
        type: JournalEntryType.ITEM_ACQUIRED
      });

      // Close trading screen and return to previous state
      const targetState = useTradingStore.getState().returnState || GameState.IN_GAME;
      reset();
      setGameState(targetState);
      audioManager.playSound('confirm');

      console.log('[TRADING SERVICE] ✅ Trade completed successfully');
      return true;

    } catch (error) {
      console.error('[TRADING SERVICE] Error finalizing trade:', error);
      addJournalEntry({
        text: 'Errore durante lo scambio. Riprova.',
        type: JournalEntryType.SYSTEM_ERROR
      });
      audioManager.playSound('error');
      return false;
    }
  },

  /**
   * Cancels the current trading session.
   *
   * @description Resets trading store and returns to game without exchanging items.
   *
   * @example
   * tradingService.cancelTrade();
   * // Trading screen closes, no items exchanged
   */
  cancelTrade: () => {
    const { reset, returnState } = useTradingStore.getState();
    const { setGameState, addJournalEntry } = useGameStore.getState();

    const targetState = returnState || GameState.IN_GAME;
    reset();
    setGameState(targetState);
    audioManager.playSound('cancel');
    
    addJournalEntry({
      text: 'Hai annullato lo scambio.',
      type: JournalEntryType.NARRATIVE
    });
    
    console.log('[TRADING SERVICE] Trade cancelled');
  },
};