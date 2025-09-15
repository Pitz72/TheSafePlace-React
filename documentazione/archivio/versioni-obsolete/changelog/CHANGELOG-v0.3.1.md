# Changelog - The Safe Place v0.3.1
## Everything has its place

**Data di Rilascio:** 2025-08-04
**Autore:** LLM Assistant (su direzione dell'Operatore)
**Tipo:** Release di Refactoring Strutturale

---

### 🌟 Miglioramenti Principali

Questa versione segna un cambiamento architetturale fondamentale nel modo in cui vengono gestite le interfacce secondarie come la Scheda Personaggio e l'Inventario. L'approccio basato su popup sovrapposti, che si è rivelato tecnicamente problematico e tematicamente incoerente, è stato completamente abbandonato in favore di **schermate dedicate a schermo intero**.

Questo non è solo un fix, ma un miglioramento che rafforza l'estetica retro del gioco, eliminando un paradigma (le finestre sovrapposte) anacronistico per l'ambientazione "terminale anni '80".

- **Da Popup a Schermate:** I componenti `CharacterSheetPopup`, `InventoryPopup` e `CharacterCreationPopup` sono stati eliminati e sostituiti dalle nuove schermate `CharacterSheetScreen`, `InventoryScreen` e `CharacterCreationScreen`.
- **Coerenza Tematica:** L'esperienza utente è ora più autentica e immersiva, mimando il comportamento delle applicazioni a terminale dell'epoca che operavano tramite cambi di schermata completi.
- **Risoluzione Definitiva dei Bug di Rendering:** Questo refactoring risolve alla radice tutti i problemi di visibilità legati a `z-index`, `stacking context` e `overflow` che affliggevano il sistema di popup.

### 🔧 Modifiche Tecniche

- **Refactoring del `GameContext`:**
  - Lo stato `currentScreen` è stato ampliato per includere i nuovi stati: `'characterCreation'`, `'characterSheet'`, `'inventory'`.
  - È stato introdotto un nuovo stato `previousScreen` per gestire la logica di navigazione "Indietro" (es. tasto `ESC`).
  - Gli stati booleani (`isCharacterSheetOpen`, `isInventoryOpen`, `showCharacterCreation`) sono stati rimossi, semplificando l'interfaccia del contesto.
  - Le funzioni di `toggle` sono state sostituite da un sistema di navigazione unificato (`navigateTo`, `goBack`).

- **Refactoring di `useKeyboardCommands`:**
  - Il gestore dei comandi da tastiera è stato completamente riscritto per operare in base allo stato `currentScreen`.
  - La logica è ora più pulita, centralizzata e priva di controlli condizionali complessi basati su stati booleani multipli.

- **Refactoring di `App.tsx`:**
  - Il componente principale è stato aggiornato per renderizzare le nuove schermate in base allo stato `currentScreen`, eliminando del tutto la logica di rendering dei popup.

- **Pulizia del Codice:**
  - I file non più necessari (`BasePopup.tsx`, `CharacterCreationPopup.tsx`, `CharacterSheetPopup.tsx`, `InventoryPopup.tsx`) sono stati rimossi dal progetto.

### 🐛 Correzioni di Bug

- **Risolto Definitivamente:** Il bug che rendeva i popup invisibili a causa di conflitti con i layer di rendering del contenitore di gioco e degli overlay CRT.

--- 
**Stato della Release:** STABILE E CONSOLIDATA.