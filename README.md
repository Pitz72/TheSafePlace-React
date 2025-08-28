# The Safe Place v0.7.0 "Top-Ranking Kid"

## 🎮 GDR Retrocomputazionale a Fosfori Verdi anni '80

**The Safe Place** è un gioco di ruolo roguelike postapocalittico che ricrea l'esperienza visiva di un monitor a fosfori verdi degli anni '80, combinando gameplay testuale con interfaccia moderna React e sistema narrativo avanzato.

### 🌟 Caratteristiche Principali v0.7.0

#### 🔧 Stabilizzazione Architetturale Completa
- **Sistema Zustand Stabilizzato**: Risolti crash e loop infiniti dopo il refactoring architetturale
- **Gestione Stato Centralizzata**: Eliminazione del vecchio GameProvider che causava reset indesiderati
- **Performance Ottimizzate**: Sistema di state management unificato e performante
- **Architettura Solida**: Fondamenta stabili per sviluppi futuri

#### 🎯 Sistema Level Up Completamente Ricostruito
- **Meccaniche D&D Autentiche**: Sistema fedele alle specifiche del Game Design Document
- **Multi-Level-Up Innovativo**: Possibilità di salire più livelli consecutivamente in una sessione
- **9 Opzioni di Potenziamento**: Statistiche base, HP boost, addestramenti specializzati
- **Progressione Fluida**: Esperienza utente senza interruzioni per level up multipli
- **Persistenza Garantita**: Stato del personaggio salvato correttamente

#### 🎮 Stabilità UI e Navigazione
- **Navigazione Corretta**: Tasto ESC funziona correttamente per chiudere schermate
- **Pannello Impostazioni Riparato**: Bug critico CRT che nascondeva la schermata risolto
- **Camera di Gioco Restaurata**: Algoritmo di movimento camera recuperato e reimplementato
- **Transizioni Fluide**: Navigazione tra schermate stabile e senza errori

#### 🎲 Sistema Eventi Robusto
- **Funzione resolveChoice Riscritta**: Gestione corretta di tutte le ricompense e penalità
- **Meccaniche Bilanciate**: Danno, esperienza, oggetti gestiti correttamente
- **Feedback Migliorato**: Risultati eventi chiari e informativi
- **Integrazione Completa**: Eventi collegati correttamente con progressione personaggio

#### 🌧️ Sistemi Precedenti Mantenuti
- **Sistema Meteo Dinamico**: Integrazione movimento-meteo preservata
- **Sistema Rifugi**: Regole accesso e investigazione mantenute
- **Attraversamento Fiumi**: Meccaniche strategiche preservate
- **Compatibilità Salvataggi**: Retrocompatibilità garantita

### 🚀 Tecnologie

- **Frontend**: React 18.3.1 + TypeScript 5.7.3
- **Build Tool**: Vite 6.0.3 + SWC
- **Styling**: TailwindCSS 3.4.17 + CSS Custom Properties
- **State Management**: Zustand 5.0.1
- **Testing**: Jest 29.7.0 + Testing Library
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

- [x] **v0.0.1 - v0.3.0**: Funzionalità di base, interfaccia, sistemi di gioco e correzioni. ✅ **COMPLETATE**
- [x] **v0.3.1**: Refactoring architetturale da Popup a Schermate Dedicate. ✅ **COMPLETATA**
- [x] **v0.3.2**: Correzione dimensioni font e ottimizzazione leggibilità testo. ✅ **COMPLETATA**
- [x] **v0.3.5**: Correzione bug critico di re-inizializzazione e consolidamento versione. ✅ **COMPLETATA**
- [x] **v0.4.0**: Journal Bug Fix e sincronizzazione documentazione. ✅ **COMPLETATA**
- [x] **v0.4.1**: The Best Synchronization - Sistema di analisi automatica e consolidamento perfetto. ✅ **COMPLETATA**
- [x] **v0.4.2**: LevelUp and Miscellaneous - Sistema progressione personaggio e inventario avanzato. ✅ **COMPLETATA**
- [x] **v0.4.3**: Shelter - Sistema sopravvivenza completo e rifugi funzionanti. ✅ **COMPLETATA**
- [x] **v0.4.4**: Refinement - Gameplay loop completo con manipolazione oggetti. ✅ **COMPLETATA**
- [x] **v0.5.0**: Sistema inventario avanzato e oggetti (effetti e utilizzo). ✅ **COMPLETATA**
- [x] **v0.6.0**: Lazarus Rising Again - Refactoring architetturale completo e stabilità. ✅ **COMPLETATA**
- [x] **v0.6.2**: I Save You - Sistema Save/Load avanzato e miglioramenti gameplay. ✅ **COMPLETATA**
- [ ] **v0.7.0**: Sistema combattimento e meccaniche avanzate
- [ ] **v1.0.0**: Gioco completo con tutte le funzionalità

### 🎯 Stato Attuale

**The Safe Place v0.7.0 "Top-Ranking Kid" (ATTUALE)** - Stabilizzazione Completa e Sistema Level Up Ricostruito:
- ✅ **Stabilità Sistema Zustand**: Crash e loop infiniti completamente risolti
- ✅ **Sistema Level Up Ricostruito**: Meccaniche D&D complete con multi-level-up
- ✅ **Navigazione UI Corretta**: Tasto ESC e transizioni schermate funzionanti
- ✅ **Camera di Gioco Restaurata**: Movimento e centraggio camera completamente riparati
- ✅ **Sistema Eventi Robusto**: Gestione ricompense e penalità completamente riscritta
- ✅ **Persistenza Dati Stabile**: Stato personaggio salvato correttamente senza reset

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

### 🆕 Novità v0.6.2 "I Save You"

Questa versione intermedia introduce un sistema di salvataggio e caricamento completamente rinnovato, insieme a significativi miglioramenti ai sistemi di gioco esistenti per un'esperienza più profonda e coinvolgente.

#### 📁 Sistema Save/Load Rivoluzionario
- **LoadScreen Avanzato**: Interfaccia elegante con preview dettagliati (nome, livello, posizione, tempo gioco)
- **Sistema Notifiche**: Feedback immediato per tutte le operazioni con animazioni fluide
- **Export/Import Sicuro**: Backup e condivisione salvataggi con validazione robusta
- **Recovery Intelligente**: Riparazione automatica salvataggi corrotti con feedback dettagliato
- **Compatibilità Versioni**: Gestione automatica migrazione tra versioni diverse

#### 🌤️ Sistema Meteo Dinamico
- **6 Condizioni Meteorologiche**: Sereno, Pioggia Leggera/Intensa, Tempesta, Nebbia, Vento
- **Effetti Realistici**: Modificatori movimento, skill check e consumo risorse
- **Transizioni Naturali**: Cambi meteo basati su probabilità e durata variabile
- **Integrazione Completa**: Influenza su tutti i sistemi di gioco

#### 🌊 Attraversamento Fiumi Pericoloso
- **Conseguenze Reali**: 1-3 danni HP per skill check falliti
- **Difficoltà Dinamica**: Modificata da meteo, salute e equipaggiamento
- **Skill Check Trasparenti**: Calcoli visibili per comprensione meccaniche

#### 🎲 Eventi Completamente Trasparenti
- **Calcoli Visibili**: "Dado + Stat + Equip + Meteo = Totale vs Difficoltà"
- **Probabilità Successo**: Percentuale mostrata prima della scelta
- **Modificatori Equipaggiamento**: Bonus armi/armature negli eventi
- **Risultati Dettagliati**: Feedback specifico per ogni conseguenza

#### 🏠 Sistema Rifugi Anti-Exploit
- **Accesso Limitato**: Una visita diurna per rifugio, accesso notturno sempre disponibile
- **Investigazione Unica**: Una sola investigazione per sessione per rifugio
- **Stato Persistente**: Tracking completo tra sessioni di gioco

### 🆕 Novità Precedenti v0.6.0 "Lazarus Rising Again"

Questa versione rappresenta una vera e propria **resurrezione** del progetto. The Safe Place si trovava in uno stato critico a causa di un bug architetturale fondamentale che impediva il funzionamento del sistema di eventi dinamici, cuore del gameplay.

#### 🏗️ Grande Refactoring Architetturale
- **Zustand al Comando**: Lo store gameStore.ts è diventato l'unica fonte di verità per tutto lo stato del gioco
- **Pensionamento Context API**: Eliminazione completa del sistema GameContext/useGameContext che causava instabilità
- **Migrazione Componenti**: Aggiornamento di tutti i componenti (App.tsx, MapViewport, etc.) per utilizzare Zustand
- **Single Source of Truth**: Architettura unificata che garantisce coerenza e stabilità dei dati

#### 🐛 Risoluzione Problemi Critici
- **Sistema Eventi Dinamici**: Risolto il bug che impediva l'attivazione degli eventi di gioco
- **Loop Infiniti**: Eliminati tutti gli errori "Maximum update depth exceeded" tramite selettori stabili
- **Stale State**: Risolto il problema di dati obsoleti che causava malfunzionamenti
- **Sistema Input**: Riprogettazione completa della gestione comandi da tastiera

#### 🎨 Miglioramenti Visivi e Funzionali
- **Allineamento Giocatore**: Risolto il disallineamento del carattere @ sulla mappa
- **Monitor-in-a-Monitor**: Ripristinato l'effetto di margine dello schermo
- **Gestione Viewport**: Centralizzazione delle dimensioni tramite useGameScale
- **Stabilità Runtime**: Eliminazione completa dei problemi di rendering

#### ✨ Risultati della Resurrezione
- ✅ **Bug Originale Risolto**: Sistema di eventi dinamici completamente funzionante
- ✅ **Architettura Moderna**: Fondamenta stabili e manutenibili per il futuro
- ✅ **Regressioni Corrette**: Flusso di avvio e comandi da tastiera completamente ripristinati
- ✅ **Stabilità Garantita**: Zero loop di rendering e comportamenti imprevedibili

### 🆕 Novità v0.5.3 "Important Object Bug Fix"

Questa versione corregge una serie di bug critici relativi alla gestione degli oggetti e dell'inventario, migliorando significativamente la stabilità del gameplay loop.

#### 🐛 Bug Corretti
- **Sistema di Porzioni Funzionante**: Ora gli oggetti consumabili vengono usati in porzioni, come da design, invece che in intere unità.
- **Correzione Aggiunta Oggetti**: Risolto un bug critico che impediva l'aggiunta di oggetti all'inventario anche quando c'era spazio.
- **Impilamento Oggetti (Stacking)**: Gli oggetti consumabili ora si impilano correttamente nell'inventario.
- **Trasparenza Skill Check**: I risultati dei test di abilità (es. cercare in un rifugio) ora mostrano i dettagli del tiro, rendendo il gioco più chiaro.

### 🆕 Novità v0.4.4 "Refinement"

#### 🔄 Gameplay Loop Completo
- **Sistema addItem()**: Aggiunta oggetti all'inventario con gestione stackable e slot vuoti
- **Sistema removeItem()**: Rimozione oggetti con quantità variabile
- **Investigazione Rifugi Funzionale**: Trova realmente oggetti casuali (40% successo)
- **Rifugi Unici**: Sistema visitedShelters previene investigazioni multiple

#### ⚔️ Sistema Equipaggiamento Completo
- **Slot Equipaggiamento**: equippedWeapon e equippedArmor nel character sheet
- **Equipaggiamento Automatico**: Swap intelligente tra inventario e equipaggiamento
- **Visualizzazione**: Sezione dedicata nella schermata personaggio
- **Integrazione Inventario**: Tasto Enter equipaggia armi/armature automaticamente

#### 🎲 Sistema Loot Bilanciato
- **Pool Oggetti Categorizzati**: Consumabili (40%), Crafting (20%), Armi (15%), Armature (15%), Medicali (10%)
- **Quantità Variabili**: Oggetti stackable con quantità 1-3
- **Feedback Narrativo**: Messaggi dettagliati per ogni tipo di scoperta
- **Gestione Inventario Pieno**: Avvisi quando non c'è spazio

#### 🏠 Rifugi Migliorati
- **Visite Uniche**: Ogni rifugio può essere investigato solo una volta
- **Tracking Posizione**: Sistema coordinate per identificare rifugi visitati
- **Messaggi Informativi**: Feedback chiaro quando un rifugio è già stato perquisito

### 🆕 Novità Precedenti v0.4.3 "Shelter"

#### 🏠 Sistema Rifugi Completo
- **Rifugi Automatici**: Entrando in tile 'R' si attivano automaticamente
- **Modalità Giorno**: Menu interattivo con riposo, investigazione e banco di lavoro
- **Modalità Notte**: Passaggio automatico al giorno successivo con recupero HP
- **Investigazione**: Skill check per trovare oggetti o scoprire lo stato del rifugio

#### 🍖 Sistema Sopravvivenza Realistico
- **Fame e Sete**: Diminuiscono gradualmente durante l'esplorazione
- **Consumo Automatico**: Cibo e bevande consumati automaticamente ogni notte
- **Penalità**: Perdita HP se mancano risorse per il consumo notturno
- **Indicatori Visivi**: Colori e animazioni per stati critici

#### ⚡ Miglioramenti Sistema XP
- **XP per Movimento**: 1-2 XP per ogni passo sulla mappa
- **XP per Skill Check**: 5-10 XP per successo, 1-3 XP per fallimento
- **Progressione Costante**: Esperienza guadagnata attraverso l'esplorazione

#### 🔧 Correzioni e Ottimizzazioni
- **Messaggi Duplicati**: Risolti i messaggi temporali e skill check duplicati
- **Sistema Riposo**: Recupero migliorato (80-95% HP) con consumo tempo realistico
- **Colori Status**: Corretti i colori degli status di salute (verde/giallo/rosso)
- **Schermata Level Up**: Sempre accessibile con indicatori XP dettagliati

### 🆕 Novità Precedenti v0.4.2 "LevelUp and Miscellaneous"

#### 🆙 Sistema Level Up Completo
- **Progressione D&D-style** con 9 opzioni di upgrade bilanciate
- **Sistema esperienza** con requisiti XP progressivi
- **UI professionale** con layout a 3 colonne e anteprima in tempo reale
- **Navigazione keyboard** completa con tasti dedicati
- **Abilità speciali** sbloccate ai livelli avanzati

#### 🎒 Inventario Avanzato
- **Opzioni oggetti intelligenti** (USE/EQUIP/EXAMINE/DROP)
- **Sistema equipaggiamento** con slot arma/armatura
- **Sistema porzioni** per consumabili realistici
- **Interfaccia ottimizzata** con navigazione migliorata

#### 🎨 Esperienza Utente Migliorata
- **Bug Journal Risolto**: Corretto il problema di collasso progressivo del Game Journal con implementazione di dimensioni fisse (`h-[280px]`).
- **Sincronizzazione Documentazione**: Implementato sistema di analisi automatica per monitorare allineamento codice-documentazione con framework completo.
- **Refactoring Architetturale**: Rimosso doppio GameProvider e eliminati riferimenti obsoleti per architettura più pulita.
- **Documentazione Consolidata**: Creato indice consolidato con organizzazione di 85+ documenti e identificazione documenti attivi vs obsoleti.
- **Sistema di Monitoraggio**: Framework automatico per controllo continuo sincronizzazione con report strutturati e raccomandazioni actionable.
