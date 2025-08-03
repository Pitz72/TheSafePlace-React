### Roadmap Operativa: Implementazione del Sistema di Inventario Interattivo

**Stato Generale: [x] Fatto


**Contesto e Obiettivo Strategico:**
Ciao Trae, abbiamo raggiunto un traguardo fondamentale: il nostro gioco ha un sistema di regole D&D e un database completo di oggetti reali. Il prossimo passo è connettere il personaggio al mondo attraverso la meccanica più importante per un sopravvissuto: l'**inventario**.

L'obiettivo di questa fase è implementare un sistema di inventario completo, funzionale e fedele ai principi di design del nostro progetto: **testuale, immersivo e interamente controllabile da tastiera (`keyboard-only`)**. L'interfaccia visiva per l'inventario esiste già nel pannello di sinistra; ora dobbiamo popolarla con dati reali e renderla interattiva.

---

#### **FASE 1: Architettura dei Dati dell'Inventario**

**Stato:** [x] Fatto


Prima di scrivere qualsiasi logica o componente, dobbiamo definire come l'inventario esiste all'interno del nostro stato di gioco.

**Azione:**
Nel tuo modulo dedicato ai tipi e alle interfacce delle regole di gioco, definisci la struttura dati per l'inventario.
1.  **[x] Definisci lo Slot dell'Inventario (`IInventorySlot`)**: Ogni slot non conterrà l'oggetto intero, ma un riferimento ad esso, più i dati di stato. L'interfaccia deve includere:
    * `itemId: string`: L'ID univoco dell'oggetto, che si collega al nostro database di oggetti.
    * `quantity: number`: Quanti oggetti di quel tipo sono presenti nello slot.
    * `portions?: number`: Un campo opzionale per gli oggetti consumabili con usi multipli.
2.  **[x] Integra l'Inventario nella Scheda del Personaggio**: Aggiorna l'interfaccia principale del personaggio (`ICharacterSheet`) per includere il suo inventario.
    * Aggiungi una nuova proprietà: `inventory: (IInventorySlot | null)[]`. Sarà un array di slot, dove `null` rappresenta uno slot vuoto.
3.  **[x] Aggiungi l'Inventario allo Stato Globale**: Nel tuo gestore di stato centrale (`GameContext`), assicurati che la `characterSheet` includa questo nuovo array per l'inventario, inizializzandolo come un array di **10 elementi `null`**, per rappresentare i 10 slot vuoti.

---

#### **FASE 2: Logica di Gestione dell'Inventario**

**Stato:** [x] Fatto


Ora implementiamo il "cervello" dell'inventario. Queste funzioni pure andranno nel nostro motore di regole o saranno gestite come azioni all'interno del `GameContext`.

**Azione:**
Crea le funzioni di base per manipolare l'inventario del personaggio.
1.  **[x] `addItem(characterSheet, itemId, quantity)`**: Questa funzione deve contenere la logica per aggiungere un oggetto.
    * **Gestione Oggetti Impilabili (`stackable`)**: Se l'oggetto da aggiungere è `stackable` e un'istanza è già presente, incrementa la `quantity` di quello slot.
    * **Nuovi Oggetti**: Se l'oggetto non è presente (o non è impilabile), trova il primo slot vuoto (`null`) e inseriscilo lì.
    * **Inventario Pieno**: Se non ci sono slot disponibili e l'oggetto non può essere impilato, l'operazione deve fallire e restituire un feedback appropriato (es. un `false`).
2.  **[x] `removeItem(characterSheet, slotIndex, quantity)`**: Una funzione per rimuovere una certa quantità di oggetti da uno slot specifico. Se la quantità arriva a zero, lo slot deve tornare a essere `null`.

---

#### **FASE 3: Implementazione dell'Interfaccia Utente (`InventoryPanel`)**

**Stato:** [x] Fatto


È il momento di dare una forma visiva all'inventario, sostituendo i dati finti con quelli reali.

**Azione:**
Modifica o crea il componente che renderizza il pannello dell'inventario.
1.  **[x] Lettura Dati**: Il componente deve leggere l'array `inventory` dallo stato globale (`GameContext`).
2.  **[x] Rendering degli Slot**: Deve renderizzare sempre e comunque **10 righe**, una per ogni slot.
3.  **[x] Visualizzazione Dinamica**:
    * **Oggetti Presenti**: Se uno slot non è `null`, visualizza le informazioni dell'oggetto. Il nome deve essere colorato in base alla sua **tipologia (`type`)**, usando la logica che abbiamo già definito. Mostra la quantità se è maggiore di 1 e le porzioni se presenti (es. `Acqua Purificata (2/3)`).
    * **Slot Vuoti**: Se uno slot è `null`, visualizza un testo segnaposto come `[ - Vuoto - ]`.
    * **Hotkey Numerici**: Aggiungi un prefisso numerico a ogni riga, da `[1]` a `[0]` (per il decimo slot).

---

#### **FASE 4: Interattività `Keyboard-Only`**

**Stato:** [x] Fatto


Questa è la fase che rende l'inventario una vera feature di gioco e non una semplice lista.

**Azione:**
Implementa la logica di interazione nel tuo gestore di comandi da tastiera.
1.  **[x] Selezione Oggetto**:
    * Aggiungi uno stato al `GameContext` per tracciare l'oggetto attualmente selezionato: `selectedInventoryIndex: number`, inizializzato a `0`.
    * Nel gestore dei comandi da tastiera, implementa la logica per i tasti `W`/`Freccia Su` e `S`/`Freccia Giù` per incrementare o decrementare `selectedInventoryIndex`, assicurandoti che il valore rimanga sempre tra `0` e `9`.
    * Nel componente dell'inventario, usa `selectedInventoryIndex` per applicare un **indicatore di selezione visivo** (es. il carattere `>`) alla riga corrispondente.
2.  **[x] Uso Rapido con Hotkey**:
    * Nel gestore dei comandi da tastiera, implementa la logica per i tasti numerici da `1` a `0`.
    * La pressione di un tasto numerico deve chiamare una nuova funzione nel `GameContext`, ad esempio `useItem(slotIndex)`. Il tasto `1` corrisponde allo `slotIndex` 0, `2` a 1, ..., e `0` a 9.
    * Per ora, la funzione `useItem` può semplicemente registrare un messaggio nel diario (es. `Hai usato [nome oggetto]`). La logica degli effetti reali la implementeremo in seguito.

---
**Riepilogo e Verifica:**
Al termine di questa implementazione, dovremo avere un pannello dell'inventario completamente funzionale: visualizzerà gli oggetti reali del giocatore con i colori corretti, sarà navigabile con le frecce, mostrerà un indicatore di selezione e permetterà l'uso rapido degli oggetti tramite i tasti numerici.