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
- Migrata tutta la logica relativa alla UI da `gameStore.ts` a `uiStore.ts`.
- Aggiornato `gameStore.ts` per agire come una *facade*.
- Eseguiti test di regressione per confermare l'assenza di rotture.

**Stato:** Completato.

---

### **Task 3: Migrare logica del Personaggio in `characterStore.ts`**
*Data: 2025-09-01*

**Operazioni:**
- Creato `characterStore.ts` per gestire la `characterSheet`.
- Migrata la logica di gestione di HP, XP, statistiche e abilità da `gameStore.ts`.
- Refactoring di `gameStore.ts` per utilizzare il nuovo store, mantenendo la coerenza.
- Eseguiti test di regressione, tutti superati con successo.

**Stato:** Completato.

---

### **Task 4: Isolare logica Inventario in `inventoryStore.ts`**
*Data: 2025-09-01*

**Operazioni:**
- Creato `inventoryStore.ts` per gestire le azioni relative all'inventario.
- Spostate le azioni `addItem`, `removeItem`, e `equipItemFromInventory` da `characterStore.ts` a `inventoryStore.ts`.
- Il nuovo store agisce come un orchestratore, interagendo con `characterStore` (che detiene lo stato dell'inventario) e `gameStore` (per il logging).
- Refactoring del codice per utilizzare il nuovo `inventoryStore`.
- Eseguiti test di regressione, tutti superati con successo.

**Stato:** Completato.

---

### **Task 5: Isolare logica del Mondo in `worldStore.ts`**
*Data: 2025-09-01*

**Operazioni:**
- Creato `worldStore.ts` per gestire lo stato del mondo di gioco (mappa, posizione, tempo, bioma).
- Migrata la logica relativa da `gameStore.ts`.
- Il `gameStore` ora delega la gestione del mondo al nuovo store.
- Gestite le complesse dipendenze incrociate tra `worldStore`, `characterStore` e `gameStore`.
- Eseguiti test di regressione, tutti superati con successo, confermando la validità del refactoring.

**Stato:** Completato.

---

### **Task 6: Isolare logica Eventi in `eventStore.ts`**
*Data: Inizio 2025-09-01*

**Obiettivo:** Estrarre la gestione degli eventi di gioco (database eventi, evento corrente, trigger) nel suo store dedicato.

**Stato:** In corso.
