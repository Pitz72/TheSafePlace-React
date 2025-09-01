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
