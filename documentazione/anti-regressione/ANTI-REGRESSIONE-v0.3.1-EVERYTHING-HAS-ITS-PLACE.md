# Documento di Anti-Regressione v0.3.1
## Everything has its place

**Data:** 2025-08-04

L'obiettivo di questo documento è verificare che il refactoring architetturale dal sistema di **Popup** al sistema di **Schermate Dedicate** sia stato implementato con successo e non abbia introdotto regressioni nelle funzionalità esistenti.

### ✅ Checklist di Verifica Funzionale

#### 1. Flusso di Creazione del Personaggio
- [ ] **Test:** Avviare una "Nuova Partita" dal menu principale.
- [ ] **Risultato Atteso:** L'applicazione deve passare alla nuova schermata `CharacterCreationScreen` a schermo intero.
- [ ] **Test:** Attendere il completamento dell'animazione di creazione.
- [ ] **Risultato Atteso:** Deve apparire il messaggio che invita a premere `ESC` o `SPAZIO`.
- [ ] **Test:** Premere `ESC` o `SPAZIO`.
- [ ] **Risultato Atteso:** L'applicazione deve passare correttamente alla schermata di gioco principale (`currentScreen === 'game'`).

#### 2. Accesso e Uscita dalla Scheda Personaggio
- [ ] **Test:** Dalla schermata di gioco, premere il tasto `TAB`.
- [ ] **Risultato Atteso:** L'applicazione deve passare alla nuova schermata `CharacterSheetScreen` a schermo intero.
- [ ] **Test:** Dalla `CharacterSheetScreen`, premere `ESC` o `TAB`.
- [ ] **Risultato Atteso:** L'applicazione deve tornare correttamente alla schermata di gioco (`currentScreen === 'game'`).

#### 3. Accesso e Uscita dall'Inventario
- [ ] **Test:** Dalla schermata di gioco, premere il tasto `I`.
- [ ] **Risultato Atteso:** L'applicazione deve passare alla nuova schermata `InventoryScreen` a schermo intero.
- [ ] **Test:** Dalla `InventoryScreen`, premere `ESC` o `I`.
- [ ] **Risultato Atteso:** L'applicazione deve tornare correttamente alla schermata di gioco (`currentScreen === 'game'`).

#### 4. Navigazione nell'Inventario
- [ ] **Test:** Nella `InventoryScreen`, usare i tasti `Freccia Su` e `Freccia Giù`.
- [ ] **Risultato Atteso:** La selezione dell'oggetto nell'elenco deve cambiare visivamente.
- [ ] **Test:** Selezionare un oggetto.
- [ ] **Risultato Atteso:** La descrizione dell'oggetto deve apparire correttamente nel pannello di destra.

#### 5. Stabilità delle Schermate Esistenti
- [ ] **Test:** Navigare nelle schermate `Istruzioni`, `Storia` e `Opzioni` dal menu principale.
- [ ] **Risultato Atteso:** Le schermate devono essere visualizzate correttamente.
- [ ] **Test:** Tornare al menu principale da ciascuna di queste schermate usando `ESC`.
- [ ] **Risultato Atteso:** La navigazione deve funzionare come previsto.

#### 6. Funzionalità di Gioco Principale
- [ ] **Test:** Muovere il giocatore sulla mappa con i tasti `WASD`.
- [ ] **Risultato Atteso:** Il movimento deve funzionare e il diario di gioco deve aggiornarsi.
- [ ] **Test:** Eseguire un'azione di riposo con il tasto `R`.
- [ ] **Risultato Atteso:** L'azione deve essere eseguita e registrata nel diario.

---

**Esito della Verifica:** Se tutti i punti della checklist sono stati superati, la versione `0.3.1` è considerata stabile e il refactoring un successo.