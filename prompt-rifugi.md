Prompt per IDE LLM: Correzione Completa della Meccanica dei Rifugi

Obiettivo: Eseguire una serie di modifiche per correggere due problemi nella meccanica dei rifugi:

Risolvere un bug per cui gli oggetti trovati non vengono aggiunti all'inventario, anche se c'è spazio. Verrà inserito del codice di debug per analizzare il problema.
Rendere trasparente il test di abilità (skill check) durante la ricerca, mostrando al giocatore i dettagli del tiro.
Istruzioni Dettagliate:

1. Modifica il file: src/interfaces/gameState.ts

Aggiungi la nuova interfaccia AbilityCheckResult e aggiorna la firma della funzione performAbilityCheck come segue:

// Aggiungi questa interfaccia all'inizio del file
export interface AbilityCheckResult {
  success: boolean;
  roll: number;
  modifier: number;
  total: number;
  difficulty: number;
}

// All'interno dell'interfaccia GameState, modifica questa riga:
// da così:
performAbilityCheck: (ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal?: boolean, successMessageType?: MessageType) => boolean;
// a così:
performAbilityCheck: (ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal?: boolean, successMessageType?: MessageType) => AbilityCheckResult;
2. Modifica il file: src/contexts/GameProvider.tsx

Devi eseguire due sostituzioni in questo file:

Aggiungi l'importazione per AbilityCheckResult all'inizio del file:

// Modifica questa riga di importazione
import type { GameState, TimeState, Screen, AbilityCheckResult } from '../interfaces/gameState';
Sostituisci l'intera funzione performAbilityCheck con questa nuova versione:

const performAbilityCheck = useCallback((ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal = true, successMessageType?: MessageType): AbilityCheckResult => {
    const modifier = getModifier(ability);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    const success = total >= difficulty;
    
    if (success) {
      const xpGained = Math.floor(Math.random() * 6) + 5;
      addExperience(xpGained);
    } else {
      const xpGained = Math.floor(Math.random() * 3) + 1;
      addExperience(xpGained);
    }
    
    const result: AbilityCheckResult = { success, roll, modifier, total, difficulty };
    
    if (addToJournal) {
      addLogEntry(success ? (successMessageType || MessageType.SKILL_CHECK_SUCCESS) : MessageType.SKILL_CHECK_FAILURE, { ability, roll, modifier, total, difficulty });
    }
    return result;
  }, [getModifier, addLogEntry, addExperience]);
Sostituisci l'intera funzione addItem con questa versione potenziata per il debug:

const addItem = useCallback((itemId: string, quantity: number = 1): boolean => {
    console.log(`[addItem DEBUG] --- Inizio Aggiunta Oggetto ---`);
    console.log(`[addItem DEBUG] Richiesto: ${quantity}x ${itemId}`);

    const item = items[itemId];
    if (!item) {
      console.error(`[addItem DEBUG] FALLIMENTO: Oggetto con ID '${itemId}' non trovato nel database.`);
      addLogEntry(MessageType.ACTION_FAIL, { reason: `Oggetto ${itemId} non trovato nel database` });
      return false;
    }

    const newInventory = [...characterSheet.inventory];
    let itemAdded = false;

    if (item.stackable) {
      console.log(`[addItem DEBUG] L'oggetto è impilabile. Cerco uno stack esistente...`);
      for (let i = 0; i < newInventory.length; i++) {
        const slot = newInventory[i];
        if (slot && slot.itemId === itemId) {
          slot.quantity += quantity;
          console.log(`[addItem DEBUG] SUCCESSO (Stack): Aggiunto a slot ${i}. Nuova quantità: ${slot.quantity}`);
          addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity: quantity, total: slot.quantity });
          itemAdded = true;
          break;
        }
      }
      if (!itemAdded) {
        console.log(`[addItem DEBUG] Nessuno stack esistente trovato.`);
      }
    } else {
      console.log(`[addItem DEBUG] L'oggetto non è impilabile.`);
    }

    if (!itemAdded) {
      console.log(`[addItem DEBUG] Cerco uno slot vuoto...`);
      for (let i = 0; i < newInventory.length; i++) {
        console.log(`[addItem DEBUG] Controllo slot ${i}:`, newInventory[i]);
        if (!newInventory[i]) {
          newInventory[i] = { itemId, quantity };
          console.log(`[addItem DEBUG] SUCCESSO (Slot Vuoto): Oggetto inserito nello slot ${i}.`);
          addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity: quantity });
          itemAdded = true;
          break;
        }
      }
    }
    
    console.log(`[addItem DEBUG] Flag 'itemAdded' finale: ${itemAdded}`);
    if (itemAdded) {
      console.log(`[addItem DEBUG] Chiamo setCharacterSheet per aggiornare l'inventario.`);
      setCharacterSheet(prev => ({ ...prev, inventory: newInventory }));
      console.log(`[addItem DEBUG] --- Fine Aggiunta Oggetto (SUCCESSO) ---`);
      return true;
    } else {
      console.log(`[addItem DEBUG] FALLIMENTO: Nessuno stack o slot vuoto trovato. Inventario pieno.`);
      addLogEntry(MessageType.INVENTORY_FULL, { item: item.name });
      console.log(`[addItem DEBUG] --- Fine Aggiunta Oggetto (FALLIMENTO) ---`);
      return false;
    }
  }, [characterSheet.inventory, items, addLogEntry]);
3. Modifica il file: src/components/ShelterScreen.tsx

Anche qui, devi eseguire due sostituzioni:

Aggiungi l'importazione per AbilityCheckResult all'inizio del file:

import { AbilityCheckResult } from '../interfaces/gameState';
Sostituisci l'intera funzione handleSearch con questa nuova versione:

const handleSearch = () => {
    if (searchResult) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'hai già investigato questo rifugio' });
      return;
    }

    const checkResult = performAbilityCheck('percezione', 15, false);
    const checkDetails = `Prova di Percezione (CD ${checkResult.difficulty}): ${checkResult.roll} + ${checkResult.modifier} = ${checkResult.total}.`;
    
    let outcomeMessage: string;

    if (checkResult.success) {
      outcomeMessage = `${checkDetails} SUCCESSO.\n`;
      const findChance = Math.random();
      if (findChance < 0.4) {
        const lootTables = {
          consumables: ['CONS_001', 'CONS_002', 'CONS_003'],
          crafting: ['CRAFT_001', 'CRAFT_002'],
          weapons: ['WEAP_001'],
          armor: ['ARM_001'],
          medical: ['CONS_003']
        };
        const categoryRoll = Math.random();
        let category: keyof typeof lootTables;
        if (categoryRoll < 0.4) category = 'consumables';
        else if (categoryRoll < 0.6) category = 'crafting';
        else if (categoryRoll < 0.75) category = 'weapons';
        else if (categoryRoll < 0.9) category = 'armor';
        else category = 'medical';
        
        const categoryItems = lootTables[category];
        const foundItemId = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        const foundItem = items[foundItemId];
        
        if (foundItem) {
          const quantity = foundItem.stackable ? (Math.floor(Math.random() * 2) + 1) : 1;
          const added = addItem(foundItemId, quantity);
          if (added) {
            outcomeMessage += `La tua attenzione viene ripagata. Trovi: ${foundItem.name}${quantity > 1 ? ` x${quantity}` : ''}`;
          } else {
            outcomeMessage += `Trovi ${foundItem.name}, ma il tuo inventario è pieno!`;
          }
        } else {
          outcomeMessage += 'Trovi qualcosa di interessante, ma non riesci a identificarlo.';
        }
      } else if (findChance < 0.7) {
        outcomeMessage += 'Il rifugio è già stato saccheggiato, ma sembra sicuro.';
      } else {
        outcomeMessage += 'Dopo un\'attenta ricerca, non trovi nulla di utile. Solo polvere e detriti.';
      }
      addLogEntry(MessageType.SKILL_CHECK_SUCCESS, { action: 'investigazione rifugio' });
    } else {
      outcomeMessage = `${checkDetails} FALLIMENTO.\nLa tua ricerca è stata frettolosa e superficiale.`;
      addLogEntry(MessageType.SKILL_CHECK_FAILURE, { ability: 'percezione', action: 'investigazione rifugio' });
    }
    setSearchResult(outcomeMessage);
  };
