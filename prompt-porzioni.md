Prompt per IDE LLM: Implementazione del Sistema di Porzioni per Oggetti Consumabili

Obiettivo: Modificare il codice sorgente del gioco per attivare il sistema di "porzioni" per gli oggetti consumabili. Attualmente, il gioco consuma oggetti interi (es. una bottiglia d'acqua intera) invece di singole porzioni (es. un sorso). Questa modifica deve applicarsi sia all'uso manuale degli oggetti da parte del giocatore sia al consumo automatico di risorse a fine giornata.

Contesto Principale: I file chiave da modificare sono:

src/contexts/GameProvider.tsx: Contiene la logica di gioco principale, incluse le funzioni useItem e handleNightConsumption.
src/interfaces/gameState.ts: Definisce l'interfaccia per lo stack di oggetti nell'inventario (IItemStack).
src/data/items/consumables.json: Contiene i dati degli oggetti, incluse le proprietà portionsPerUnit e portionEffect che al momento vengono ignorate.
Istruzioni Dettagliate:

Passo 1: Aggiornare la Struttura Dati dell'Inventario

Nel file src/interfaces/gameState.ts, modifica l'interfaccia IItemStack per includere una proprietà opzionale per le porzioni rimanenti. Questo è necessario per tenere traccia delle porzioni di un'unità di un oggetto.

// File: src/interfaces/gameState.ts

export interface IItemStack {
  itemId: string;
  quantity: number;
  portions?: number; // Aggiungi questa proprietà opzionale
}
Passo 2: Refactoring della Funzione useItem

Nel file src/contexts/GameProvider.tsx, modifica la funzione useItem per implementare la logica di consumo delle porzioni.

Verifica e Inizializzazione Porzioni: Quando un oggetto viene usato, controlla se ha una proprietà portionsPerUnit nel database (items). Se l'oggetto nello stack dell'inventario non ha ancora una proprietà portions inizializzata, impostala al valore di item.portionsPerUnit.

Logica di Consumo:

Se l'oggetto ha delle porzioni, decrementa il contatore portions dello stack di 1.
Applica l'effetto al giocatore usando il valore di item.portionEffect dal JSON, non un valore hardcoded.
Se il contatore portions raggiunge 0:
Decrementa la quantity dello stack di 1.
Se la quantity è ancora maggiore di 0, reimposta portions al valore massimo (item.portionsPerUnit).
Se la quantity diventa 0, rimuovi l'intero stack dall'inventario (null).
Esempio di logica per useItem:

// File: src/contexts/GameProvider.tsx

const useItem = useCallback((slotIndex: number) => {
  const itemStack = characterSheet.inventory[slotIndex];
  // ... controlli iniziali ...
  const item = items[itemStack.itemId];
  
  if (item.portionsPerUnit) {
    // Logica per oggetti con porzioni
    let currentPortions = itemStack.portions ?? item.portionsPerUnit;
    currentPortions -= 1;

    // Applica l'effetto della porzione
    // (es. updateHP(item.portionEffect) o setSurvivalState(...))

    if (currentPortions > 0) {
      // Aggiorna solo le porzioni
      itemStack.portions = currentPortions;
    } else {
      // Le porzioni sono finite, consuma un'unità
      itemStack.quantity -= 1;
      if (itemStack.quantity > 0) {
        // Resetta le porzioni per la prossima unità
        itemStack.portions = item.portionsPerUnit;
      } else {
        // Rimuovi l'oggetto dall'inventario
        // ... logica per settare lo slot a null ...
      }
    }
    // Aggiorna lo stato del characterSheet
  } else {
    // Logica esistente per oggetti senza porzioni (consuma intera unità)
  }
}, [/* ... dipendenze ... */]);
Passo 3: Refactoring della Funzione handleNightConsumption

Sempre in src/contexts/GameProvider.tsx, modifica la funzione handleNightConsumption affinché utilizzi la stessa logica di consumo delle porzioni.

Cerca Oggetti Consumabili: Itera sull'inventario per trovare un oggetto con effect: 'satiety' e uno con effect: 'hydration'.
Consuma una Porzione: Per ogni oggetto trovato, applica la stessa logica implementata in useItem:
Decrementa il contatore delle porzioni di 1.
Se le porzioni si esauriscono, decrementa la quantità dello stack di 1 e, se necessario, resetta le porzioni.
Non applicare alcun effetto di recupero (fame/sete), poiché il consumo notturno previene solo le penalità.
Passo 4: Verifica Finale

Assicurati che le modifiche siano coerenti. Quando un nuovo oggetto "porzionabile" viene aggiunto all'inventario per la prima volta (addItem), non è necessario inizializzare subito le porzioni; può essere fatto "lazy" al primo utilizzo, come suggerito nello snippet per useItem.

