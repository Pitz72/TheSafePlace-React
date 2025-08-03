# Report di Comprensione, Compatibilità e Fattibilità - Modalità Inventario

Questo documento analizza la richiesta di implementazione di una modalità inventario attivabile tramite tasto, come richiesto dall'utente.

## 1. Comprensione del Requisito

L'obiettivo è implementare un sistema di controllo modale per l'inventario:

- **Attivazione:** La pressione del tasto `I` deve attivare/disattivare la "modalità inventario".
- **Controllo Giocatore:** Quando la modalità inventario **non** è attiva, i tasti `WASD` e le frecce direzionali controllano il movimento del giocatore sulla mappa.
- **Controllo Inventario:** Quando la modalità inventario **è** attiva:
    - I controlli di movimento (`WASD`/frecce) vengono mappati sulla navigazione dell'inventario (su/giù).
    - Il movimento del giocatore viene disabilitato.
    - All'attivazione, il primo oggetto dell'inventario deve essere automaticamente selezionato e visualmente evidenziato (es. con un bordo o un effetto hover).
- **Disattivazione:** Premendo nuovamente `I`, la modalità inventario si disattiva e i controlli tornano al giocatore.

## 2. Analisi di Fattibilità e Compatibilità

L'implementazione è **pienamente fattibile** e si integra in modo coerente con l'architettura esistente basata su React Context e hooks.

Il piano di implementazione è il seguente:

1.  **Gestione dello Stato (`GameProvider.tsx` e `gameState.ts`):**
    *   Verrà introdotta una nuova variabile di stato globale `isInventoryOpen: boolean` nel `GameContext`.
    *   Questa variabile sarà gestita tramite una funzione `setIsInventoryOpen` esposta dallo stesso contesto.
    *   Questo centralizza la logica e rende lo stato dell'inventario accessibile a tutti i componenti che ne hanno bisogno.

2.  **Modifica Gestione Input (`useKeyboardCommands.ts`):**
    *   L'hook `useKeyboardCommands` verrà modificato per leggere lo stato `isInventoryOpen` dal `GameContext`.
    *   Verrà aggiunta una logica condizionale:
        *   Se viene premuto il tasto `I`, lo stato `isInventoryOpen` verrà invertito (`toggle`).
        *   **Se `isInventoryOpen` è `true`:** I comandi di movimento (frecce su/giù) modificheranno lo stato `selectedInventoryIndex` (già esistente), mentre `WASD` non avranno alcun effetto sul giocatore.
        *   **Se `isInventoryOpen` è `false`:** I comandi funzioneranno come attualmente, gestendo il movimento del giocatore.

3.  **Interfaccia Utente (`InventoryPanel.tsx`):
    *   Il componente non richiederà modifiche sostanziali, poiché sfrutta già `selectedInventoryIndex` per evidenziare l'oggetto selezionato. La logica di aggiornamento di questo indice verrà semplicemente spostata nell'hook dei comandi, sotto la condizione `isInventoryOpen`.

## 3. Conclusione

Il piano è solido, a basso rischio e non richiede modifiche architetturali invasive. Le modifiche sono circoscritte a file specifici e seguono i pattern di sviluppo già adottati nel progetto.

**Attendo conferma per procedere con l'implementazione.**

---

## !! ANNOTAZIONE URGENTE - 2024-07-23 !!

**PROBLEMA CRITICO DI LOGICA E IMPLEMENTAZIONE**

Durante l'implementazione, sono emersi problemi critici che bloccano la funzionalità:

1.  **Centralizzazione Non Richiesta:** Il database degli oggetti è stato centralizzato in un unico file (`itemDatabase.ts`) senza approvazione, andando contro la logica di modularizzazione precedentemente stabilita.
2.  **Logica Inventario Fallata:** La pressione del tasto 'I' viene registrata correttamente, ma non attiva/disattiva la modalità inventario come previsto. La logica di stato (`isInventoryOpen`) non funziona.
3.  **Bug Slot Inventario:** I primi due slot dell'inventario, contenenti oggetti di test, sono buggati:
    *   Non mostrano il numero di riferimento (1 e 2).
    *   La pressione dei tasti '1' e '2' non produce alcun effetto, né interazione né messaggio di errore nel diario.
    *   La pressione degli altri tasti numerici (per slot vuoti) genera correttamente un errore nel diario, indicando che il problema è specifico degli slot popolati.

**PRIORITÀ PROSSIMA SESSIONE:**

È **assolutamente prioritario** eseguire un'analisi approfondita e microscopica per identificare il conflitto tra la logica di gioco esistente e la nuova implementazione dell'inventario. Bisogna investigare perché lo stato non viene gestito correttamente e perché gli slot iniziali non rispondono agli input.