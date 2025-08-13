# The Safe Place v0.3.9 "Consistency is Key"

## 🎮 GDR Retrocomputazionale a Fosfori Verdi anni '80

**The Safe Place** è un gioco di ruolo roguelike postapocalittico che ricrea l'esperienza visiva di un monitor a fosfori verdi degli anni '80, combinando gameplay testuale con interfaccia moderna React e sistema narrativo avanzato.

### 🌟 Caratteristiche Principali

- **Animazioni Ottimizzate**: Effetto phosphor-decay velocizzato (0.2s) per maggiore reattività e fluidità dell'interfaccia.
- **Spaziatura Migliorata**: Layout ottimizzato nella schermata di creazione personaggio per una migliore leggibilità.
- **Leggibilità Ottimizzata**: Testo narrativo ingrandito del 75% e interfacce del 60% per massima accessibilità e comfort visivo.
- **Architettura a Schermate Dedicate**: Sistema di navigazione robusto che sostituisce i popup per una maggiore coerenza tematica e stabilità tecnica.
- **Flusso di Gioco Immersivo**: Creazione del personaggio, inventario e scheda personaggio gestiti come schermate a sé stanti, in puro stile terminale anni '80.
- **Schermata Opzioni Completa**: Navigazione keyboard-only con tre modalità video e testo ingrandito proporzionalmente.
- **Sistema Temi Avanzato**: Standard CRT, Senza Effetti, Altissimo Contrasto con supporto completo per testi ingranditi.
- **Keyboard Navigation Completa**: Controllo totale tramite tastiera per un'esperienza autentica.
- **Architettura Moderna**: React 18 + TypeScript + TailwindCSS + Vite.

### 🚀 Tecnologie

- **Frontend**: React 18.3.1 + TypeScript 5.2.2
- **Build Tool**: Vite 5.3.4 + SWC
- **Styling**: TailwindCSS 3.4.17 + CSS Custom Properties
- **State Management**: Zustand 4.5.2
- **Development**: ESLint + PostCSS + Autoprefixer

### 📦 Installazione

```bash
# Clona il repository
git clone [repository-url]
cd TSP

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build
```

### 🎯 Struttura Progetto

```
TSP/
├── src/
│   ├── App.tsx              # Componente principale
│   ├── index.css            # Tema fosfori verdi globale
│   └── main.tsx             # Entry point
├── documentazione/          # Documentazione di progetto
├── tailwind.config.js       # Configurazione tema
├── postcss.config.js        # Configurazione PostCSS
└── package.json             # Dipendenze e script
```

### 📋 Roadmap

- [x] **v0.0.1 - v0.3.0**: Funzionalità di base, interfaccia, sistemi di gioco e correzioni.
- [x] **v0.3.1**: Refactoring architetturale da Popup a Schermate Dedicate. ✅ **RILASCIATA E CONSOLIDATA**
- [x] **v0.3.2**: Correzione dimensioni font e ottimizzazione leggibilità testo. ✅ **RILASCIATA E CONSOLIDATA**
- [ ] **v0.3.5**: Correzione bug critico di re-inizializzazione e consolidamento versione. ✅ **IN CORSO**
- [ ] **v0.4.0**: Sistema di movimento e mappa avanzato
- [ ] **v0.5.0**: Sistema inventario e oggetti (effetti e utilizzo)
- [ ] **v0.6.0**: Sistema combattimento
- [ ] **v1.0.0**: Gioco completo

### 🎯 Stato Attuale

**The Safe Place v0.3.5 "The Survival Game" (In Corso)** - Correzione Bug Critico e Consolidamento:
- ✅ **Bug Loop di Gioco Risolto**: Corretto un problema critico che causava la re-inizializzazione del gioco ad ogni mossa del giocatore, risolvendo log duplicati e problemi di layout della mappa.
- ✅ **Stabilità del Gioco**: Migliorata la stabilità generale dell'applicazione attraverso la correzione di una catena di dipendenze instabili nel `GameProvider`.
- ✅ **Logica di Inizializzazione Unificata**: Rimossa una chiamata di inizializzazione ridondante per garantire che il gioco si avvii in modo pulito e controllato una sola volta.

### 🛠️ Sviluppo

**Comandi Utili:**
```bash
npm run dev          # Server sviluppo
npm run build        # Build produzione
npm run lint         # Linting
npm run preview      # Preview build
```

### 📄 Licenza

Progetto privato - Tutti i diritti riservati

### 🆕 Novità v0.3.1 "Everything has its place"

#### 🏛️ Refactoring Architetturale: Da Popup a Schermate
- **Causa del Problema:** La precedente architettura basata su popup sovrapposti causava complessi e irrisolvibili problemi di rendering, dovuti a conflitti tra `z-index`, `stacking context` (creati dalla proprietà `transform` del contenitore di gioco) e overlay di effetti CRT globali.
- **Soluzione:** Il concetto di popup è stato eliminato. Le interfacce per la Creazione del Personaggio, la Scheda Personaggio e l'Inventario sono state trasformate in **schermate dedicate a schermo intero**.
- **Implementazione:**
  - **`GameContext`**: Lo stato `currentScreen` è stato ampliato per includere le nuove schermate. È stato aggiunto `previousScreen` per gestire la navigazione all'indietro.
  - **Nuovi Componenti**: Creati `CharacterCreationScreen`, `CharacterSheetScreen`, `InventoryScreen`.
  - **`useKeyboardCommands`**: Riscritto per gestire la navigazione tra stati di schermata invece di mostrare/nascondere popup.
  - **Pulizia**: Rimossi i componenti `*Popup.tsx` e `BasePopup.tsx`.
- **Risultato:** Un'applicazione più stabile, performante e tematicamente coerente.
