# The Safe Place - Piano di Recupero

**Versione Attuale:** 0.9.9.3 "We're Almost There"
**Stato:** ⚠️ **In fase di recupero tecnico e refactoring architetturale.**

Questo progetto sta attraversando un'importante fase di stabilizzazione per allineare il codice a standard di alta qualità e risolvere criticità architetturali identificate da un' analisi approfondita.

---

## 🎮 Che Cos'è "The Safe Place"?

"The Safe Place" è un prototipo avanzato di Gioco di Ruolo (GDR) post-apocalittico, costruito con tecnologie web moderne (React, TypeScript, Vite). La visione è quella di creare un'esperienza immersiva, `keyboard-only`, con un'estetica retrocomputazionale ispirata ai monitor a fosfori verdi degli anni '80.

## 🚧 Stato Attuale del Progetto (Analisi di Settembre 2025)

Un' analisi strutturale ha rivelato diverse criticità che stiamo affrontando sistematicamente. Per una trasparenza totale, il registro completo del nostro debito tecnico è tracciato nel file [DEBT_LOG.md](./DEBT_LOG.md).

Le sfide principali includono:
- **Debito Tecnico:** Dipendenze obsolete, import relativi fragili.
- **Qualità del Codice:** Uso non sicuro dei tipi (`any`) e funzionalità incomplete.
- **Testing:** Copertura dei test  insufficiente.
- **Architettura:** Componenti e store monolitici ("God Objects" ) da refattorizzare.

Questa roadmap ha lo scopo di risolvere questi problemi per creare una base di codice stabile e manutenibile per il futuro.

## 🚀 Quick Start (Per lo Sviluppo)

### Prerequisiti
- **Node.js** (versione 18 o superiore)
- **Git**

### Installazione e Avvio
```bash
# 1. Clona il repository
git clone  [URL_DEL_TUO_REPOSITORY]
cd  TheSafePlace-React

# 2. Passa al branch di recupero (IMPORTANTE!)
git checkout recovery/architecture-reset

# 3. Installa le dipendenze
npm install

# 4. Avvia il server di sviluppo
npm run dev
