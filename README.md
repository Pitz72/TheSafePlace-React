# The Safe Place v0.2.6 "My backpack has numbers on it"

## 🎮 GDR Retrocomputazionale a Fosfori Verdi anni '80

**The Safe Place** è un gioco di ruolo roguelike postapocalittico che ricrea l'esperienza visiva di un monitor a fosfori verdi degli anni '80, combinando gameplay testuale con interfaccia moderna React e sistema narrativo avanzato.

### 🌟 Caratteristiche

- **Schermata Opzioni Completa**: Navigazione keyboard-only con tre modalità video
- **Sistema Temi Avanzato**: Standard CRT, Senza Effetti, Altissimo Contrasto
- **Comandi Diretti**: Tasti 1, 2, 3 per accesso rapido alle modalità video
- **Scorciatoie Navigazione**: V (Video), A (Audio), C (Controlli) per sezioni
- **Typography Accessibile**: Font ingranditi per migliore leggibilità
- **Layout Fisso**: Dimensioni ottimizzate senza scrolling indesiderato
- **Keyboard Navigation**: Arrow keys, Enter/Space, ESC per controllo completo
- **Indicatori Visivi**: Modalità attiva evidenziata con colori
- **Bug Fixes**: Colori phosphor verdi ripristinati correttamente
- **Architettura Moderna**: React 18 + TypeScript + TailwindCSS + Vite

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

### 🎨 Tema Fosfori Verdi

**Colori Principali:**
- `--phosphor-primary`: #4EA162 (Verde principale)
- `--phosphor-bright`: #79ED95 (Verde chiaro accenti)
- `--phosphor-dim`: #336940 (Verde scuro testo)
- `--phosphor-bg`: #000000 (Sfondo nero)
- `--phosphor-panel`: #111111 (Sfondo pannelli)

**Effetti:**
- Scan line animata
- Glow text con animazione
- Transizioni fluide
- Hover effects

### 🎮 Interfaccia Gioco

**Schermata Opzioni "I can see very well now":**
- **Modalità Video**: Standard CRT (fosfori verdi), Senza Effetti, Altissimo Contrasto
- **Navigazione Keyboard**: Arrow Up/Down, Enter/Space per selezione
- **Comandi Diretti**: 1, 2, 3 per modalità video immediate
- **Scorciatoie Sezioni**: V (Video), A (Audio), C (Controlli)
- **Layout Fisso**: h-screen senza scrolling, max-w-5xl centrato

**Typography Accessibile:**
- Titolo principale: 48px ottimizzato
- Opzioni: text-lg (24px) per leggibilità
- Descrizioni: text-lg (18px) chiare
- Sottotitoli: text-2xl per gerarchia visiva
- Controlli semplificati: 2 righe essenziali

### 📋 Roadmap

- [x] **v0.0.1**: Setup base + Tema fosfori verdi
- [x] **v0.0.2**: Sistema CRT Ultra-Realistico + Interfaccia completa
- [x] **v0.0.3**: Sistema Narrativo Avanzato + Estetica professionale
- [x] **v0.0.4**: Layout "Little Incredible Windows" + Font IBM PC ✅ COMPLETATO
- [x] **v0.0.5**: Schermata Opzioni + Sistema Temi + Accessibilità ✅ COMPLETATO
- [x] **v0.0.6**: Layout Colonne Uniformi + Proporzioni Perfette ✅ COMPLETATO
- [x] **v0.1.0**: Mappa Ottimizzata + Protezioni Anti-Regressione ✅ CONSOLIDATO
- [x] **v0.1.1**: Leggenda Mappa Corretta + Marcatori Colorati ✅ CONSOLIDATO
- [x] **v0.1.2**: Screen Adaptation Fix + Protezione Immutabile ✅ CONSOLIDATO
- [x] **v0.1.3**: Player Blinking + Informazioni Dinamiche ✅ CONSOLIDATO
- [x] **v0.1.4**: The Blue Hour + Sistema Tempo Notturno ✅ CONSOLIDATO
- [x] **v0.1.5**: The Living Journal + Sistema Diario Dinamico ✅ CONSOLIDATO
- [x] **v0.2.0**: Rules are Rules + Sistema Riposo Breve D&D ✅ RILASCIATA E CONSOLIDATA
- [x] **v0.2.2**: But What a Beautiful Page + Interfaccia Migliorata ✅ RILASCIATA E CONSOLIDATA
- [x] **v0.2.3**: Tailwind Migration Complete + CSS Optimization ✅ RILASCIATA E CONSOLIDATA
- [x] **v0.2.4**: Premium Look ✅ RILASCIATA E CONSOLIDATA
- [x] **v0.2.5**: my special little items ✅ RILASCIATA E CONSOLIDATA
- [x] **v0.2.6**: My backpack has numbers on it ✅ RILASCIATA E CONSOLIDATA
- [ ] **v0.1.6**: Sistema Audio Avanzato
- [ ] **v0.3.0**: Sistema di movimento e mappa avanzato
- [ ] **v0.3.0**: Sistema inventario e oggetti
- [ ] **v0.4.0**: Sistema combattimento
- [ ] **v1.0.0**: Gioco completo

### 🎯 Stato Attuale

**The Safe Place v0.2.6 "My backpack has numbers on it" (Rilasciata e Consolidata)** - Inventario Numerato & UI Migliorata:
- ✅ **Migrazione Tailwind Completa**: 100% dei componenti migrati a Tailwind CSS
- ✅ **Componenti Ottimizzati**: CharacterSheetPopup, GameJournal, CharacterCreationPopup, StoryScreen
- ✅ **CSS Cleanup**: Rimosse 15+ classi obsolete (.panel-title, .button-*, .text-phosphor-*, etc.)
- ✅ **Effetti CRT Uniformi**: Applicazione consistente degli effetti CRT su tutti i componenti
- ✅ **Performance Migliorata**: CSS ridotto e ottimizzato, build più veloce
- ✅ **Manutenibilità**: Codice più pulito e consistente con utilities Tailwind
- ✅ **Configurazione Avanzata**: Palette colori phosphor completa in tailwind.config.js
- ✅ **Utilities Personalizzate**: Glow effects, CRT effects, animazioni integrate
- ✅ **Sistema Stabile**: Nessun errore, funzionalità mantenute, HMR attivo
- ✅ **Documentazione Aggiornata**: Roadmap completa, changelog dettagliato
- ✅ **Testing Completo**: Validazione funzionalità, performance, accessibilità
- ✅ **Build Consolidata**: Release stabile con migrazione Tailwind completamente funzionante

### 🛠️ Sviluppo

**Comandi Utili:**
```bash
npm run dev          # Server sviluppo
npm run build        # Build produzione
npm run lint         # Linting
npm run preview      # Preview build
```

**Convenzioni:**
- TypeScript strict mode
- ESLint + Prettier
- CSS Custom Properties per tema
- Componenti funzionali React

### 📄 Licenza

Progetto privato - Tutti i diritti riservati

### 🆕 Novità v0.2.6 "My backpack has numbers on it"

#### 🎒 Inventario Numerato & UI Migliorata
- **🔢 Conteggio Stack**: Gli oggetti nell'inventario ora mostrano la quantità numerica.
- **🎒 UI Zaino**: Interfaccia dell'inventario ridisegnata per maggiore chiarezza e usabilità.
- **⚡ Accesso Rapido**: Migliorata la velocità di accesso e gestione degli oggetti.

### 🆕 Novità v0.2.5 "my special little items"

#### 🎨 Migrazione Tailwind CSS Completa
- **🔄 100% Tailwind**: Tutti i componenti migrati da CSS personalizzato a Tailwind
- **🧹 CSS Cleanup**: Rimosse 15+ classi obsolete (.panel-title, .button-primary, .text-phosphor-*, etc.)
- **⚡ Performance**: CSS ottimizzato, build più veloce, caricamento migliorato
- **🎯 Utilities Personalizzate**: Glow effects, CRT effects, animazioni integrate in Tailwind

#### 🛠️ Componenti Ottimizzati
- **📋 CharacterSheetPopup**: Migrazione completa con effetti CRT uniformi
- **📝 GameJournal**: Migrazione completa con effetti CRT uniformi
- **👤 CharacterCreationPopup**: Migrazione completa con effetti CRT uniformi
- **📖 StoryScreen**: Migrazione completa con effetti CRT uniformi

#### 🔧 Configurazione Avanzata
- **🎨 Palette Phosphor**: Colori completi definiti in tailwind.config.js
- **✨ Effetti CRT**: Scan lines, glow, flicker integrati come utilities
- **📱 Responsive**: Design responsive mantenuto e ottimizzato
- **🔍 Accessibilità**: Standard di accessibilità mantenuti

#### 📋 Tipi di Messaggi Completi (9 Tipi)
1. **🚀 GAME_START**: Messaggi di benvenuto e inizio gioco
2. **🌍 BIOME_ENTER**: Ingresso in nuovi biomi (Città, Foresta, Pianura, etc.)
3. **⛰️ MOVEMENT_FAIL_MOUNTAIN**: Messaggi ironici per tentativi di movimento falliti
4. **✅ SKILL_CHECK_SUCCESS**: Successi nelle prove di abilità
5. **❌ SKILL_CHECK_FAILURE**: Fallimenti nelle prove di abilità
6. **🌊 SKILL_CHECK_RIVER_SUCCESS**: Attraversamento fiumi riuscito
7. **💚 HP_RECOVERY**: Recupero punti ferita (riposo)
8. **❤️ HP_DAMAGE**: Danni subiti
9. **🚫 REST_BLOCKED**: Riposo bloccato (limitazione 24 ore)

---

**The Safe Place v0.2.6 "My backpack has numbers on it"** - GDR Retrocomputazionale a Fosfori Verdi
