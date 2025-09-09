# The Safe Place

**Versione:** 0.9.5
**Codename:** Ammappa

GDR Retrò a Fosfori Verdi. Un sistema di gioco avanzato con meccaniche D&D e un'atmosfera CRT anni '80.

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

La gestione dello stato globale è affidata a **Zustand**, con un'architettura **multi-store** dove ogni "store" gestisce una porzione specifica e verticale dello stato dell'applicazione (es. `worldStore`, `characterStore`, `inventoryStore`). Questo garantisce modularità e manutenibilità.

Il processo di build e sviluppo è gestito da **Vite** per la massima velocità e performance.