# The Safe Place

**Versione:** 0.9.8
**Codename:** Lullaby of Ashes

GDR Retrò a Fosfori Verdi. Un sistema di gioco avanzato con meccaniche D&D, atmosfera CRT anni '80 e **sistema narrativo canonico immersivo** che segue la storia di Ultimo attraverso frammenti di quest, eventi lore e scelte morali che influenzano l'evoluzione emotiva del personaggio.

## 🔥 **FEATURE PRINCIPALE: "LA NINNANANNA DELLA CENERE"**

**L'evento narrativo culminante** che rivela finalmente la verità sulla madre di Ultimo. Una sequenza di 7 pagine di rivelazione straziante che si attiva solo nel momento perfetto del viaggio, quando il giocatore è emotivamente pronto per questa verità devastante.

**Attivazione Condizionale:** Si manifesta solo quando tutte le condizioni narrative sono allineate - un'esperienza unica e indimenticabile per ogni giocatore.

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

La gestione dello stato globale è affidata a **Zustand**, con un'architettura **multi-store** dove ogni "store" gestisce una porzione specifica e verticale dello stato dell'applicazione (es. `worldStore`, `characterStore`, `inventoryStore`, `narrativeStore`).

### **Sistema Narrativo Avanzato**
- **`narrativeStore`**: Gestisce il sistema narrativo canonico con progressione della quest principale, eventi lore e sistema emotivo
- **`eventStore`**: Sistema di eventi dinamici con supporto per sequenze narrative condizionali
- **Eventi Lore Condizionali**: Sistema di attivazione intelligente che garantisce impatto narrativo massimo
- **Sistema Sequenze**: Supporto per eventi narrativi multipagina con navigazione fluida

### **Feature Principale v0.9.8**
**"La Ninnananna della Cenere"** - Evento narrativo di 7 pagine che si attiva solo quando tutte le condizioni narrative sono perfettamente allineate, garantendo un'esperienza unica e indimenticabile.

Il processo di build e sviluppo è gestito da **Vite** per la massima velocità e performance.