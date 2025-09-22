# The Safe Place

**Versione:** 0.9.8.1
**Codename:** Fix and Fix

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

### **Stabilizzazione Architetturale v0.9.8.1**
**"Fix and Fix"** - Consolidamento critico del sistema tempo e risoluzione problemi strutturali accumulati. Fine del ciclo "aggiusti una cosa e ne rompi un'altra".

Il processo di build e sviluppo è gestito da **Vite** per la massima velocità e performance.

---

## ⚠️ **PROBLEMI STRUTTURALI DEL PROGETTO**

### **Criticità Architetturali Documentate**

Questa sezione documenta **problemi strutturali evidenti** accumulati durante lo sviluppo che hanno compromesso la stabilità e manutenibilità del progetto.

#### **1. Refactoring Costanti Distruttivi**
**I continui refactoring hanno dilaniato il progetto dopo mesi di lavoro.** Ogni tentativo di miglioramento architetturale ha introdotto nuovi problemi, creando un circolo vizioso di correzioni che generano nuovi bug.

- **Sintomi**: "Aggiusti una cosa e ne rompi un'altra"
- **Impatto**: Ciclo infinito di fix e regressioni
- **Costo**: Sviluppo rallentato, frustrazione elevata

#### **2. Over-Engineering Sistemico**
**Sistema di stores troppo granulare** con separazione eccessiva delle responsabilità.

- **Sintomi**: Architettura fragile che si rompe facilmente
- **Impatto**: Complessità manutenzione elevata
- **Rischio**: Ogni cambiamento richiede fix multipli

#### **3. Mancanza di Architettura Pianificata**
**Design emergente senza visione strategica** ha portato a inconsistenze strutturali.

- **Sintomi**: Dipendenze circolari, code duplicato
- **Impatto**: Scalabilità limitata, debito tecnico elevato
- **Rischio**: Difficoltà espansione futura

### **Raccomandazioni Strategiche**

#### **Opzione Consigliata: Stabilizzazione**
- **Freeze architetturale**: Nessun ulteriore refactoring
- **Focus su feature**: Sviluppo contenuto senza toccare struttura
- **Quality assurance**: Testing rigoroso per prevenzione regressioni

#### **Opzione Drastica: Reset Architetturale**
- **Ricominciare da capo** con GDD completo pianificato
- **LLM-assisted development**: Uso di Kilo Code per sviluppo coerente
- **Architettura solida**: Design system pianificato dall'inizio

### **Lezione Fondamentale**

**Con un LLM come Kilo Code, si potrebbe sviluppare in modo costante e coerente** fin dall'inizio:
- **Progettazione integrata**: GDD completo prima dell'implementazione
- **Architettura pianificata**: Design system solido dall'inizio
- **Sviluppo incrementale**: Feature complete senza refactoring distruttivi
- **Quality built-in**: Testing e documentazione integrati

**La decisione sul futuro del progetto deve considerare seriamente se continuare con l'architettura attuale o ricominciare con fondamenta solide.**