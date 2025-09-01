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

### **Task 2: Implementare `uiStore.ts` e Facade**
*Data: 2025-09-01*

**Operazioni:**
- Creato il file `src/stores/ui/uiStore.ts` con stato e azioni dedicate alla UI.
- Definite le interfacce `Screen`, `Notification`, e `UIState`.
- Migrata tutta la logica relativa alla UI (gestione schermate, notifiche, indici selezionati) da `gameStore.ts` al nuovo `uiStore.ts`.
- Aggiornato `gameStore.ts` per agire come una *facade*, riesportando la logica da `uiStore` per mantenere la retrocompatibilità durante il refactoring.
- Eseguiti test di regressione (`npm test`) per confermare che nessuna funzionalità esistente sia stata compromessa.

**Stato:** Completato.

---

### **Task 3: Migrare logica del Personaggio in `characterStore.ts`**
*Data: Inizio 2025-09-01*

**Obiettivo:** Isolare tutta la gestione dello stato del personaggio (scheda, statistiche, PE, vita, modificatori) nel suo store dedicato.

**Stato:** In corso.
