# The Safe Place

**Versione:** 0.9.7.2
**Codename:** Architectural Integrity

GDR Retrò a Fosfori Verdi. Un sistema di gioco avanzato con meccaniche D&D, atmosfera CRT anni '80 e sistema narrativo canonico immersivo che segue la storia di Ultimo attraverso frammenti di quest, eventi lore e scelte morali che influenzano l'evoluzione emotiva del personaggio.

---

## 🚀 Quick Start

### Prerequisiti

- Node.js (versione 18.x o superiore)
- npm (solitamente incluso con Node.js)

### Installazione

Clona il repository ed esegui il seguente comando nella root del progetto per installare le dipendenze:

```bash
npm install
```

### Avvio Server di Sviluppo

Per avviare il server di sviluppo locale, esegui:

```bash
npm run dev
```

Il server sarà disponibile all'indirizzo `http://localhost:5173` (o la prima porta disponibile).

### Eseguire i Test

Per lanciare la suite di test unitari e di integrazione, esegui:

```bash
npm run test
```

---

## 🏗️ Architettura

Il progetto utilizza una moderna stack front-end basata su **React** e **TypeScript**.

La gestione dello stato globale è affidata a **Zustand**, con un'architettura **multi-store** dove ogni "store" gestisce una porzione specifica e verticale dello stato dell'applicazione (es. `worldStore`, `characterStore`, `inventoryStore`, `narrativeStore`). Il nuovo `narrativeStore` gestisce il sistema narrativo canonico con progressione della quest principale, eventi lore e sistema emotivo. Questo garantisce modularità e manutenibilità.

Il processo di build e sviluppo è gestito da **Vite** per la massima velocità e performance.