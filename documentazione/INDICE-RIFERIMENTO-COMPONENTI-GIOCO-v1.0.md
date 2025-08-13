# INDICE DI RIFERIMENTO COMPONENTI GIOCO
**The Safe Place - Analisi Architetturale Completa v1.0**

*Documento generato automaticamente dall'analisi del codebase*  
*Data: 2025-01-25 (Font Tailwind Corretto)*  
*Versione Gioco: v0.3.5 "The Survival Game"*  
*Ultima Modifica: 2025-01-25 (Sincronizzazione Completata)*

---

## 📋 PANORAMICA GENERALE

**The Safe Place** è un roguelike RPG con estetica monitor fosforescente anni '80, sviluppato in React + TypeScript con sistema di regole D&D-style. Il gioco presenta un'architettura modulare ben strutturata con separazione netta tra logica di business, interfaccia utente e gestione dello stato.

### 🎯 Caratteristiche Principali
- **Genere**: Roguelike RPG di sopravvivenza
- **Estetica**: Monitor CRT fosforescente verde
- **Sistema Regole**: D&D-style con 6 statistiche primarie
- **Architettura**: React Context + Hooks pattern
- **Linguaggio**: TypeScript strict mode
- **Styling**: TailwindCSS + CSS personalizzato

## 📊 SOMMARIO ARCHITETTURALE

### 🎯 Componenti Totali: **13**
- **4 Schermate Principali** (Start, Story, Instructions, Options)
- **3 Schermate Specializzate** (CharacterCreation, CharacterSheet, Inventory)
- **4 Componenti di Gioco** (MapViewport, Player, GameJournal, InventoryPanel)
- **2 Template UI** (UniversalInfoPage, PaginatedInfoPage)
- **5 Utilità Testing** (Performance, Browser, Resolution, Font, Readability)

---

## 🏗️ ARCHITETTURA GENERALE

### 📁 Struttura Directory Principale
```
src/
├── components/          # Componenti React UI (15+ componenti)
├── contexts/           # Gestione stato globale (GameProvider)
├── hooks/              # Logica riutilizzabile (3 hook principali)
├── rules/              # Sistema regole D&D (4 moduli)
├── data/               # Database oggetti e messaggi
├── interfaces/         # Definizioni TypeScript
├── utils/              # Utilità e testing
└── App.tsx            # Componente radice
```

### 🔄 Flusso Dati Principale
```
GameProvider (Context)
    ↓
useGameContext (Hook)
    ↓
Screen Manager (currentScreen)
    ↓
Schermate Dedicate Full-Screen
    ↓
Azioni Utente (Keyboard)
    ↓
Aggiornamento Stato Globale
```

---

## 🎮 COMPONENTI INTERFACCIA UTENTE

### 🖥️ Schermate Principali

#### **StartScreen** (`src/components/StartScreen.tsx`)
- **Funzione**: Menu principale del gioco
- **Caratteristiche**: 
  - Layout centrato con grid responsive
  - Navigazione con frecce W/S
  - Effetti glow e transizioni
  - Versione dinamica dal package.json
- **Stato**: Utilizza `menuSelectedIndex` per selezione
- **Comandi**: W/S per navigazione, Enter per conferma

#### **InstructionsScreen** (`src/components/InstructionsScreen.tsx`)
- **Funzione**: Schermata istruzioni di gioco
- **Template**: Utilizza `UniversalInfoPage` per layout unificato
- **Contenuto**: Comandi tastiera, meccaniche base, tips
- **Navigazione**: ESC/B per tornare al menu

#### **StoryScreen** (`src/components/StoryScreen.tsx`)
- **Funzione**: Narrativa e background del gioco
- **Template**: Utilizza `UniversalInfoPage`
- **Contenuto**: Storia del mondo, contesto narrativo
- **Caratteristiche**: Paginazione automatica, scroll fluido

#### **OptionsScreen** (`src/components/OptionsScreen.tsx`)
- **Funzione**: Configurazione temi e impostazioni
- **Temi Disponibili**: Standard, No-Effects, High-Contrast
- **Persistenza**: Salvataggio automatico in localStorage
- **Integrazione**: Sistema Zustand per gestione stato

#### **CharacterCreationScreen** (`src/components/CharacterCreationScreen.tsx`)
- **Funzione**: Schermata dedicata per la creazione del personaggio
- **Sistema**: Generazione "4d6 drop lowest" standard D&D
- **Visualizzazione**: Statistiche complete con modificatori
- **Integrazione**: Rules system completo
- **Navigazione**: ESC per tornare al menu

#### **CharacterSheetScreen** (`src/components/CharacterSheetScreen.tsx`)
- **Funzione**: Schermata dedicata per visualizzare la scheda del personaggio
- **Attivazione**: Tasto TAB durante il gioco
- **Contenuto**: Tutte le 6 statistiche, HP, AC, Carry Capacity
- **Layout**: Design IBM PC/MS-DOS compatibile
- **Navigazione**: ESC/TAB per tornare al gioco

#### **InventoryScreen** (`src/components/InventoryScreen.tsx`)
- **Funzione**: Schermata dedicata per la gestione dell'inventario
- **Attivazione**: Tasto I durante il gioco
- **Layout**: Griglia oggetti con navigazione
- **Interazione**: Frecce per navigazione, Enter per selezione
- **Navigazione**: ESC/I per tornare al gioco

### 🎯 Componenti di Gioco

#### **MapViewport** (`src/components/MapViewport.tsx`)
- **Funzione**: Rendering della mappa di gioco
- **Caratteristiche**:
  - Viewport virtualizzato per performance
  - Caricamento asincrono mappa da `/map.txt`
  - Sistema camera dinamica
  - Rendering caratteri ASCII colorati
- **Dimensioni**: 150x150 caratteri
- **Performance**: Ottimizzato per 60fps
- **Colori**: Mappatura terreni con palette fosfori

#### **Player** (`src/components/Player.tsx`)
- **Funzione**: Rendering del personaggio giocatore
- **Simbolo**: `@` con effetti glow animati
- **Posizionamento**: Relativo alla camera, coordinate assolute
- **Animazioni**: Blink effect, phosphor glow
- **Dimensioni**: 25.6px x 38.4px (carattere monospace)

#### **GameJournal** (`src/components/GameJournal.tsx`)
- **Funzione**: Diario di gioco dinamico e narrativo
- **Caratteristiche**:
  - Auto-scroll verso nuovi messaggi
  - Colori categorizzati per tipo messaggio
  - Sistema messaggi dinamici
- **Tipi Messaggio**: 9 categorie (movimento, azioni, HP, ecc.)
- **Integrazione**: MessageArchive per contenuti

#### **InventoryPanel** (`src/components/InventoryPanel.tsx`)
- **Funzione**: Visualizzazione inventario personaggio
- **Layout**: Griglia 3x3 slot oggetti
- **Interazione**: Navigazione con frecce, selezione evidenziata
- **Stato**: `selectedInventoryIndex` per slot attivo
- **Integrazione**: Database oggetti completo

### 🔧 Componenti Template e Base

#### **PaginatedInfoPage** (`src/components/PaginatedInfoPage.tsx`)
- **Funzione**: Template per contenuti paginati
- **Caratteristiche**:
  - Navigazione pagine con frecce
  - Indicatore pagina corrente
  - Layout responsive
  - Gestione contenuti lunghi
- **Styling**: Tailwind CSS completo

#### **UniversalInfoPage** (`src/components/UniversalInfoPage.tsx`)
- **Funzione**: Template universale per pagine informative
- **Caratteristiche**:
  - Layout standardizzato
  - Supporto markdown-like
  - Navigazione unificata
  - Effetti CRT integrati
- **Styling**: Tailwind CSS completo

### 📄 Template e Utilità UI

#### **UniversalInfoPage** (`src/components/UniversalInfoPage.tsx`)
- **Funzione**: Template unificato per schermate informative
- **Utilizzato da**: InstructionsScreen, StoryScreen
- **Caratteristiche**: Layout consistente, navigazione standardizzata
- **Responsive**: Adattamento automatico risoluzione

#### **PaginatedInfoPage** (`src/components/PaginatedInfoPage.tsx`)
- **Funzione**: Template con scorrimento per contenuti lunghi
- **Controlli**: W/↑ e S/↓ per scroll, ESC/B per uscita
- **Configurazione**: SCROLL_AMOUNT regolabile

---

## 🔗 SISTEMA HOOKS E LOGICA

### 🎯 Hook Principali

#### **useGameContext** (`src/hooks/useGameContext.ts`)
- **Funzione**: Accesso al contesto globale del gioco
- **Ritorna**: Interfaccia GameState completa
- **Validazione**: Controllo esistenza contesto
- **Utilizzo**: Tutti i componenti che necessitano stato globale

#### **useKeyboardCommands** (`src/hooks/useKeyboardCommands.ts`)
- **Funzione**: Gestione unificata comandi tastiera
- **Comandi Supportati**:
  - **WASD**: Movimento giocatore
  - **Frecce**: Navigazione menu/inventario
  - **TAB**: Apertura character sheet
  - **I**: Toggle inventario
  - **R**: Riposo breve
  - **ESC**: Uscita/indietro
- **Caratteristiche**:
  - Prevenzione conflitti input
  - Gestione per schermata
  - Cleanup automatico event listener

#### **useGameScale** (`src/hooks/useGameScale.ts`)
- **Funzione**: Scaling dinamico per multi-risoluzione
- **Calcolo**: Fattore scala basato su viewport
- **CSS Variables**: Aggiornamento `--scale-ratio` in tempo reale
- **Supporto**: 5+ risoluzioni (1920x1080 → 375x667)
- **Performance**: Event listener ottimizzato

#### **usePlayerMovement** (`src/hooks/usePlayerMovement.ts`)
- **Funzione**: Logica movimento giocatore (legacy)
- **Stato**: Posizione, validazione terreno
- **Integrazione**: Rules system per skill check
- **Note**: Parzialmente sostituito da useKeyboardCommands

---

## ⚙️ SISTEMA REGOLE E MECCANICHE

### 📊 Modulo Types (`src/rules/types.ts`)
- **ICharacterStats**: 6 statistiche D&D (Potenza, Agilità, Vigore, Percezione, Adattamento, Carisma)
- **ICharacterSheet**: Scheda personaggio completa
- **ISkillCheckResult**: Risultati controlli abilità
- **SkillDifficulty**: Enum difficoltà (Facile=10, Medio=15, Difficile=20)
- **IDamageResult**: Sistema danni per combattimenti futuri

### 🎲 Character Generator (`src/rules/characterGenerator.ts`)
- **Metodo Generazione**: "4d6 drop lowest" standard D&D
- **Funzioni Principali**:
  - `rollStat()`: Generazione singola statistica
  - `generateStats()`: Tutte le 6 statistiche
  - `createCharacter()`: Personaggio "Ultimo" completo
  - `createTestCharacter()`: Versione debug
- **Formule Derivate**:
  - `maxHP = 10 + modificatore(vigore)`
  - `baseAC = 10 + modificatore(agilità)`
  - `carryCapacity = potenza * 10`

### ⚔️ Mechanics (`src/rules/mechanics.ts`)
- **Sistema Modificatori**: Formula D&D `Math.floor((stat - 10) / 2)`
- **Skill Check**: D20 + modificatore vs difficoltà
- **Sistema HP**: Gestione punti vita con clamping
- **Riposo Breve**: Recupero 1d4 HP con cooldown 24h
- **Dadi**: Implementazione D20, D4 per vari controlli

### 🚶 Movement Integration (`src/rules/movementIntegration.ts`)
- **Integrazione Movimento**: Rules system + movement
- **Controlli Terreno**: Skill check per fiumi (Agilità)
- **Blocco Montagne**: Prevenzione movimento su terreni invalidi
- **Journal Integration**: Messaggi automatici per azioni

---

## 🗄️ GESTIONE STATO E DATI

### 🌐 GameProvider (`src/contexts/GameProvider.tsx`)
- **Funzione**: Provider principale per stato globale
- **Stati Gestiti**:
  - Mappa e caricamento
  - Posizione giocatore e camera
  - Sistema tempo (giorno/notte)
  - Character sheet completo
  - Journal entries
  - Inventario e oggetti
  - Schermata corrente
- **Funzioni Esposte**: 25+ azioni per gestione gioco
- **Performance**: Ottimizzato con useCallback e useRef

### 📝 GameState Interface (`src/interfaces/gameState.ts`)
- **Definizione**: Interfaccia TypeScript per stato globale
- **Sezioni**:
  - Map state (mappa, loading)
  - Player state (posizione)
  - Camera state (viewport)
  - Time state (tempo di gioco)
  - Character state (statistiche, HP)
  - Journal state (log entries)
  - UI state (schermata corrente)
- **Actions**: Tutte le funzioni disponibili nel contesto

### 🎒 Sistema Oggetti

#### **Item Interfaces** (`src/interfaces/items.ts`)
- **IItem**: Interfaccia base per tutti gli oggetti
- **Enum**: Rarity, ItemType, ItemEffect
- **Compatibilità**: Supporto stringhe JSON + enum TypeScript
- **Campi**: id, name, description, type, rarity, weight, value

#### **Item Database** (`src/data/items/itemDatabase.ts`)
- **Struttura**: Database unificato da file JSON multipli
- **Categorie**: weapons, ammo, armor, consumables, crafting_materials, quest_items, unique_items
- **Formato**: Record<string, IItem> per accesso rapido
- **Integrazione**: Caricamento automatico in GameProvider

### 📰 Sistema Messaggi (`src/data/MessageArchive.ts`)
- **MessageType**: 9 tipi di messaggio categorizzati
- **Archivio**: Database messaggi dinamici per journal
- **Colori**: Sistema colori per categorizzazione visiva
- **Funzioni**: Generazione messaggi casuali per varietà

---

## 🛠️ UTILITÀ E STRUMENTI

### 📊 Performance Monitoring (`src/utils/performanceMonitor.ts`)
- **Funzione**: Monitoraggio real-time prestazioni
- **Metriche**: FPS, Memory usage, CPU performance
- **Reporting**: Console logging con assessment
- **Auto-start**: Attivazione automatica dopo 2 secondi

### 🌐 Browser Testing (`src/utils/browserTest.ts`)
- **Funzione**: Test compatibilità browser
- **Browser Supportati**: Chrome 120+, Firefox 115+, Safari 17+, Edge 120+
- **Feature Tests**: 10 test per funzionalità critiche
- **Score System**: Valutazione 0-100 compatibilità

### 📐 Resolution Testing (`src/utils/resolutionTest.ts`)
- **Funzione**: Test multi-risoluzione automatizzato
- **Risoluzioni**: 5+ configurazioni standard
- **Validazione**: Layout consistency, scaling corretto
- **Reporting**: Risultati dettagliati per debugging

### 🔤 Font Testing (`src/utils/fontTest.ts`)
- **Funzione**: Classe FontTester singleton per test dei font
- **Caratteristiche**: Verifica disponibilità e rendering dei caratteri
- **Pattern**: Singleton con metodo getInstance() per accesso globale
- **Integrazione**: Test automatici per font IBM Plex Mono

### 📖 Readability Testing (`src/utils/readabilityTest.ts`)
- **Funzione**: Classe ReadabilityTester singleton per test di leggibilità
- **Metodo Principale**: runCompleteReadabilityTest() per analisi completa
- **Validazione**: Contrasto e accessibilità del testo
- **Pattern**: Singleton per consistenza globale

---

## ⚙️ CONFIGURAZIONE E BUILD

### 📦 Package.json
- **Nome**: "the-safe-place"
- **Versione**: 0.3.5 "The Survival Game"
- **Dipendenze Principali**:
  - React 18.3.1
  - TypeScript 5.2.2
  - TailwindCSS 4.1.11
  - Zustand 4.5.2 (state management)
  - Vite 5.3.4 (build tool)

### 🎨 Tailwind Config (`tailwind.config.js`)
- **Estensioni Personalizzate**:
  - Palette phosphor (50+ varianti verdi)
  - Font family IBM Plex Mono
  - Animazioni CRT (glow, scan, pulse)
  - Width definitions personalizzate
- **Configurazione**: Ottimizzata per estetica CRT

### 🔧 TypeScript Config
- **tsconfig.json**: Configurazione principale con references
- **tsconfig.app.json**: Configurazione applicazione (strict mode)
- **tsconfig.node.json**: Configurazione Node.js per scripts
- **Modalità**: Strict mode attivo, zero errori tollerati

### 🚀 Vite Config
- **Plugin**: React SWC per performance ottimali
- **Build**: Ottimizzazioni per produzione
- **Dev Server**: HMR configurato per sviluppo rapido

---

## 🎨 SISTEMA ESTETICO

### 🖥️ Effetti CRT
- **Scan Lines**: Linee di scansione statiche (opacità 0.15)
- **Phosphor Glow**: Effetti bagliore su tutti gli elementi
- **Animazioni**: warm-up, flicker, phosphor decay
- **Colori**: Palette completa fosfori verdi (50+ varianti)

### 🎭 Sistema Temi
- **Standard**: Effetti CRT completi
- **No-Effects**: Versione senza effetti per performance
- **High-Contrast**: Accessibilità migliorata
- **Persistenza**: Salvataggio automatico preferenze

### 📱 Responsive Design
- **Scaling Dinamico**: Adattamento automatico risoluzione
- **Breakpoints**: Supporto desktop, tablet, mobile
- **Performance**: Mantenimento 60fps su tutte le risoluzioni

---

## 🔒 PROTEZIONI ANTI-REGRESSIONE

### 📋 Documenti Protezione
- **27 documenti** anti-regressione attivi
- **Baseline Immutabile**: Screen Adaptation v0.1.2
- **Versioni Protette**: v0.0.6, v0.1.6, v0.2.0, v0.2.3, v0.3.5

### 🚫 Modifiche Vietate
- Interfacce TypeScript in `src/rules/types.ts`
- Logica generazione personaggio
- Meccaniche D&D core
- Sistema messaggi MessageArchive
- Export centralizzato rules

### ✅ Controlli Obbligatori
- Build produzione senza errori
- Zero errori TypeScript
- Test funzionalità core
- Verifica effetti CRT
- Performance mantenute

---

## 📊 METRICHE E PERFORMANCE

### 🏗️ Build Metrics
- **Build Time**: <800ms
- **CSS Size**: 16.53 kB (3.56 kB gzipped)
- **JS Size**: 214.97 kB (66.52 kB gzipped)
- **Modules**: 37 moduli trasformati
- **TypeScript**: Zero errori, zero warnings

### 🎮 Runtime Performance
- **Target FPS**: 60fps costanti
- **Memory Usage**: <55MB (+5MB per rules system)
- **Popup Performance**: Apertura/chiusura <100ms
- **HMR**: Hot reload <1s

### 🌐 Browser Support
- **Chrome**: 120+ (supporto completo)
- **Firefox**: 115+ (supporto completo)
- **Safari**: 17+ (supporto completo)
- **Edge**: 120+ (supporto completo)

---

## 🚀 ROADMAP E SVILUPPO FUTURO

### 🎯 Prossime Fasi Pianificate
1. **Fase 3.0 - Inventory & Items**: Sistema inventario avanzato
2. **Fase 4.0 - Survival Mechanics**: Meccaniche sopravvivenza
3. **Fase 5.0 - World Interaction**: Interazione mondo
4. **Fase 6.0 - Combat System**: Sistema combattimento
5. **Fase 7.0 - The Living World**: Mondo dinamico

### 📈 Miglioramenti Pianificati
- **GameOverScreen**: Schermata game over con statistiche
- **StatisticsScreen**: Pagina statistiche dettagliate
- **HelpScreen**: Sistema aiuto contestuale
- **Advanced Template Features**: Funzionalità UI avanzate

---

## 📚 DOCUMENTAZIONE CORRELATA

### 🔗 Documenti Chiave
- **LLM Pact**: Protocollo operativo sviluppo
- **DSAR Attivo**: Baseline immutabile v0.1.2
- **Anti-Regressione v0.3.5**: Protezioni correnti
- **README Progetto**: Panoramica generale

### 📁 Struttura Documentazione
- **8 sezioni organizzate**: ~85 documenti totali
- **Root pulita**: Solo documenti essenziali
- **Convenzioni**: Naming standardizzato per tipologia
- **Statistiche**: Tracciamento versioni e protezioni

---

## 🏁 CONCLUSIONI

**The Safe Place** rappresenta un esempio di architettura React moderna ben strutturata, con separazione netta delle responsabilità, sistema di regole complesso ma mantenibile, e un'estetica distintiva accuratamente implementata. Il progetto dimostra l'uso efficace di pattern moderni (Context + Hooks), TypeScript strict, e un sistema di protezioni anti-regressione che garantisce stabilità durante lo sviluppo.

L'architettura modulare facilita l'estensione e la manutenzione, mentre il sistema di documentazione completo assicura la continuità del progetto nel tempo.

---

*Documento generato automaticamente dall'analisi completa del codebase*  
*The Safe Place v0.3.5 "The Survival Game"*  
*Un progetto Runtime Radio - Sviluppo Umano-AI*

**Ultima Analisi**: 2025-01-25  
**Prossimo Aggiornamento**: Su richiesta o major release  
**Status**: ✅ COMPLETO E AGGIORNATO