# RECOVERY ROADMAP - The Safe Place Chronicles

**Data Roadmap:** 2025-10-01
**Autore:** Jules, Consulente Sviluppatore Senior
**Obiettivo:** Definire i passi tecnici, prioritari e sequenziali necessari per stabilizzare il progetto e renderlo una base solida per lo sviluppo futuro.

---

## Principio Guida: Prima la Stabilità, Poi l'Espansione

Questa roadmap segue un principio fondamentale: **nessuna nuova funzionalità deve essere sviluppata fino al completamento di tutte le fasi qui descritte.** L'unica priorità è rendere la codebase esistente stabile, funzionante e affidabile.

---

## Fase 1: Stabilizzazione della Suite di Test (Priorità Assoluta)

**Obiettivo:** Far passare tutti i 283 test. Il comando `npm test` deve restituire "PASS" senza errori.

**Azioni Concrete (in ordine di priorità per sbloccare le dipendenze):**

1.  **Fix delle API Incoerenti del `characterStore`:**
    *   **Problema:** Molti store (`survivalStore`, `combatStore`) chiamano una funzione `updateHP()` che non esiste.
    *   **Soluzione:** Sostituire tutte le chiamate a `updateHP(valorePositivo)` con `healDamage(valorePositivo)` e le chiamate a `updateHP(valoreNegativo)` con `takeDamage(valoreNegativo)`. Questo risolverà una grossa fetta di errori di integrazione.

2.  **Fix del Proxy Getter del `gameStore`:**
    *   **Problema:** Il getter `inventory` nel `gameStore` restituisce la funzione `getInventory` invece del suo risultato.
    *   **Soluzione:** Modificare la linea in `gameStore.ts` da `return useInventoryStore.getState().getInventory;` a `return useInventoryStore.getState().getInventory();`. Questo risolverà i test di sincronizzazione di base.

3.  **Fix del `saveStore`:**
    *   **Problema:** Il sistema di salvataggio è completamente rotto.
    *   **Soluzione:**
        *   Correggere tutte le chiamate a proprietà inesistenti (es. `survivalStore.health`). Fare riferimento allo `STATUS_REPORT.md` per mappare i dati corretti.
        *   Correggere le chiamate a funzioni con firme errate (es. `timeStore.setTime`).
        *   Scrivere test di integrazione minimi per `save` e `load` per garantire che il ciclo funzioni.

4.  **Fix della Logica del `combatStore`:**
    *   **Problema:** La salute del giocatore non viene aggiornata al termine del combattimento.
    *   **Soluzione:** Nella funzione `endCombat`, dopo aver calcolato i danni e prima di resettare lo stato, aggiungere una chiamata a `useCharacterStore.getState().takeDamage(danniSubiti)` per persistere i danni.

5.  **Fix della Sincronizzazione del `craftingStore`:**
    *   **Problema:** I test di `crafting-knownRecipeIds-fix.test.ts` falliscono a causa di una fragile logica di sincronizzazione.
    *   **Soluzione:** Rivedere la logica delle funzioni `syncWithGameStore` e `unlockStarterRecipes` per garantire che lo stato delle ricette conosciute sia gestito in modo atomico e coerente, specialmente durante l'inizializzazione e il reset dei test.

---

## Fase 2: Completamento della Copertura dei Test

**Obiettivo:** Eliminare tutti i 9 test saltati (`skipped`).

**Azioni Concrete:**

1.  **Implementare i Test Saltati:**
    *   **Problema:** I test per le funzioni critiche del `characterStore` e del `combatStore` sono stati saltati a causa della "complessità del mocking".
    *   **Soluzione:** Affrontare questa complessità. Implementare mock robusti per le dipendenze (come il `notificationStore`) per permettere di testare la logica di `addExperience`, `takeDamage`, etc., in modo isolato e affidabile.

---

## Fase 3: Completamento delle Funzionalità Incomplete

**Obiettivo:** Rimuovere tutti i commenti `// TODO:` dal codice sorgente, completando le funzionalità lasciate a metà.

**Azioni Concrete:**

1.  **Connettere l'UI del Crafting:**
    *   **Problema:** I componenti React del sistema di crafting non sono collegati alla logica del `craftingStore`.
    *   **Soluzione:** Rimuovere i `TODO` e i dati fittizi dai file in `src/components/crafting/` e collegarli alle azioni e ai selettori reali del `craftingStore`.

2.  **Implementare le Azioni di Combattimento:**
    *   **Problema:** Le azioni `defend`, `flee`, e `inventory` nel `combatStore` sono vuote.
    *   **Soluzione:** Implementare la logica di base per queste azioni.

---

## Fase 4: Bonifica del Debito Tecnico Residuo

**Obiettivo:** Migliorare la qualità e la manutenibilità del codice ora che è stabile e funzionante.

**Azioni Concrete:**

1.  **Eliminazione Sistematica di `any`:**
    *   **Azione:** Con la sicurezza di una suite di test completa e funzionante, avviare un refactoring mirato per sostituire i tipi `any` residui con interfacce e tipi specifici, specialmente nei file di `utils/` e `services/`.

2.  **Refactoring delle Dipendenze di Logging:**
    *   **Azione:** Rimuovere il pattern per cui la funzione `addLogEntry` viene passata come parametro (es. in `survivalStore`). Ogni store che necessita di loggare deve importare e usare direttamente il `useNotificationStore`.

---

## Conclusione

Questa roadmap è il percorso per trasformare "The Safe Place Chronicles" da un prototipo fragile a una piattaforma stabile. Ogni fase si basa sulla precedente. Il completamento di questa roadmap segnerà la vera "rinascita" del progetto e darà il via libera allo sviluppo di nuovi contenuti su fondamenta solide.