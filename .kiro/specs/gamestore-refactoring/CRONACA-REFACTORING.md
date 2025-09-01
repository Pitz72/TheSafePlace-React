# Cronaca del Refactoring del GameStore

Questo documento traccia le operazioni eseguite durante il refactoring del `gameStore` monolitico in un'architettura modulare multi-store, come definito nel `design.md`.

---

### **Task 1: Setup base infrastructure e struttura store**
*Data: 2025-09-01*

**Operazioni:**
- Creazione del file di cronaca `CRONACA-REFACTORING.md`.
- Creata la struttura di directory per 8 store specializzati in `src/stores/`.
- Creati i file `store.ts` vuoti per ogni store.
- Corretto un errore di battitura (`eventsStore.ts` -> `eventStore.ts`).

**Stato:** Completato.

---

### **Task 2: Implementare `uiStore.ts`**
*Data: 2025-09-01*

**Operazioni:**
- Creato il file `src/stores/ui/uiStore.ts` con stato e azioni dedicate alla UI.
- Definite le interfacce `Screen`, `Notification`, e `UIState`.
- Migrata tutta la logica relativa alla UI (gestione schermate, notifiche, indici selezionati) da `gameStore.ts` al nuovo `uiStore.ts`.
- Rimosse le proprietà e le azioni corrispondenti dal `gameStore.ts` e dall'interfaccia `GameState` per eliminare la duplicazione.

**Stato:** Completato.
