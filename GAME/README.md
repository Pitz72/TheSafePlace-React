# The Safe Place Chronicles: The Echo of the Journey (v1.9.9.83)

## Un Gioco di Ruolo Testuale Retrò

**The Safe Place Chronicles** è un prototipo concettuale di gioco di ruolo (RPG) che si ispira ai classici videogiochi testuali e basati su griglia dei primi anni '80. Con il raggiungimento della versione 1.0.3, il prototipo offre un'esperienza narrativa e di gameplay completa, giocabile dall'inizio alla fine, arricchita da segreti nascosti, conseguenze definitive e un sistema di obiettivi a lungo termine.

### Filosofia del Progetto

Questo progetto nasce come esperimento tecnico e narrativo, con l'obiettivo di mettere alla prova la tecnologia LLM (nello specifico, Gemini 2.5 Pro) come partner creativo nello sviluppo di un'opera strutturata, coerente e dotata di un'anima. Non è un prodotto definitivo, ma un viaggio dentro un'idea in divenire.

Il gioco è costruito con una filosofia "keyboard-only", per replicare il feeling dei giochi per computer di quell'epoca, con un'interfaccia grafica minimale ma funzionale che richiama i vecchi monitor a fosfori verdi.

### Tecnologie Utilizzate

*   **Frontend:** React con TypeScript
*   **Gestione dello Stato:** Zustand (con architettura a "slice")
*   **Stile:** TailwindCSS
*   **Rendering Mappa:** HTML Canvas

### Caratteristiche Principali

Il prototipo vanta un ciclo di gameplay robusto, con tutti i pilastri fondamentali implementati e integrati.

#### 1. Esplorazione e Mondo di Gioco
*   **Mappa Vasta e Diversificata:** Un'ampia mappa con biomi unici (Pianure, Foreste, Villaggi, Città) che influenzano movimento e incontri.
*   **Sistema Temporale e Meteo Dinamico:** Un orologio di gioco e un sistema meteo che influenzano movimento, consumo di risorse, pericoli e persino l'attivazione degli eventi di trama, con feedback visivo in tempo reale.
*   **Immersione Atmosferica:** Messaggi descrittivi contestuali basati su bioma, ora del giorno e meteo.
*   **Pericoli Notturni:** Esplorare di notte comporta un rischio costante di subire danni, rendendo la ricerca di un riparo una decisione strategica.
*   **Diario di Viaggio Dettagliato:** Un log cronologico di tutte le azioni e gli eventi, con timestamp e codifica a colori.

#### 2. Meccaniche di Sopravvivenza Impegnative
*   **Gestione Risorse Critica:** Statistiche di HP, Sazietà e Idratazione con tassi di consumo che rendono la ricerca di cibo e acqua una priorità costante.
*   **Sistema di Stati del Giocatore:** Il personaggio può subire stati multipli contemporaneamente (`FERITO`, `MALATO`, `AVVELENATO`), ognuno con penalità uniche che richiedono cure specifiche.
*   **Durabilità e Manutenzione:** Le armi e le armature si degradano con l'uso. Gli oggetti rotti possono essere smantellati per recuperare materiali, mentre i kit di riparazione (trovati o creati) sono essenziali per la manutenzione.

#### 3. Sviluppo del Personaggio e Scelte Morali
*   **Progressione tramite XP:** I Punti Esperienza si guadagnano da esplorazione, eventi e combattimenti.
*   **Sistema di Talenti:** Ad ogni level-up, il giocatore sceglie un talento che fornisce bonus significativi e definisce lo stile di gioco (es. `Scavenger`, `Medico da Campo`, `Guerrigliero`), richiedendo una pianificazione a lungo termine.
*   **Bussola Morale con Effetti:** Un sistema di allineamento (Lena/Elian) traccia le decisioni morali. Raggiungere una forte inclinazione verso la compassione o il pragmatismo sblocca bonus passivi permanenti a determinate abilità.

#### 4. Sistemi Narrativi Stratificati
*   **Storia Principale ("Main Story"):** Una trama completa in 12 capitoli chiamati "Echi della Memoria" che guida il giocatore in un viaggio emotivo alla scoperta della verità sul suo passato. Gli eventi sono attivati da trigger organici legati al gameplay e rispettano il ciclo giorno/notte per una maggiore immersione (un ricordo del sole non si attiverà in piena notte, a meno che non sia tematicamente appropriato).
*   **Cutscene Cinematiche Testuali:** Momenti narrativi cruciali vengono presentati con un'interfaccia immersiva a schermo intero, con scelte che possono avere conseguenze permanenti.
*   **Sistema di Eventi Intelligente:** Un gestore di incontri garantisce varietà e coerenza. Il primo passo in un'area speciale (Foresta, Villaggio) attiva sempre un evento a tema. Un cooldown dinamico previene la ripetitività, e un sistema di priorità assicura che gli eventi di trama vengano vissuti dal giocatore.
*   **Eventi Segreti (Easter Egg):** Il mondo contiene eventi unici ed estremamente rari, progettati per sorprendere e deliziare i giocatori più attenti o fortunati. Offrono ricompense uniche e aggiungono strati di mistero o umorismo che alludono a un mondo pre-catastrofe più complesso.

#### 5. Combattimento Tattico e Narrativo
*   **Combattimento a Turni:** Un sistema testuale che si concentra sulla narrazione e sulle scelte tattiche.
*   **Azione "Analizza":** Spendendo un turno per studiare il nemico, il giocatore può scoprirne le debolezze e sbloccare opzioni di combattimento uniche.
*   **Fuga Strategica:** Fuggire è una tattica valida, risolta con un test di abilità che comporta dei rischi.

#### 6. Gestione Oggetti e Crafting Progressivo
*   **Inventario e Equipaggiamento:** Un sistema di inventario completo e navigabile da tastiera, con menu di azione contestuali.
*   **Sistema di Crafting Progressivo:** Le ricette devono essere trovate nel mondo sotto forma di "Manuali di Crafting". L'apprendimento di nuove formule è una parte fondamentale della progressione.

#### 7. Qualità della Vita e Immersione
*   **Sistema Audio Retrò Programmato:** Ogni suono è generato in tempo reale tramite la Web Audio API per emulare l'audio dei PC dei primi anni '80.
*   **Sistema di Temi Visivi Dinamici:** Il giocatore può scegliere tra un tema Standard, un'emulazione ad alta fedeltà di un monitor CRT (con scanline, glow e wobble) e un tema ad Alto Contrasto.
*   **Leggibilità e Coerenza Visiva:** Il sistema di temi è stato perfezionato per garantire che tutti gli elementi dell'interfaccia, in particolare il diario di viaggio, mantengano i loro colori distintivi e la loro leggibilità in ogni modalità visiva.
*   **Sistema di Salvataggio Professionale (v2.0.0):** 
    * **5 Slot di Salvataggio** con metadata dettagliati (livello, giorno, bioma)
    * **Export/Import JSON** per backup manuali e trasferimento tra dispositivi
    * **Migrazione Automatica** delle versioni precedenti
    * **Validazione Robusta** con error handling completo
    * **Eliminazione Sicura** dei salvataggi non più necessari
*   **Game Over Contestuale:** La morte del personaggio non è solo la fine della partita, ma viene presentata con una schermata dedicata che varia in base alla causa del decesso (combattimento, fame, malattia, ecc.), con l'aggiunta di una rara schermata easter egg per un tocco di umorismo nero.

#### 8. Sistema di Trofei e Obiettivi a Lungo Termine
*   **50 Trofei Unici:** È stato implementato un sistema di achievement completo con 50 trofei che coprono ogni aspetto del gioco: Missione Principale, Esplorazione, Combattimento, Sopravvivenza, Crafting, Sviluppo del Personaggio e Segreti.
*   **Persistenza Globale (v1.2.1):** I trofei sbloccati vengono salvati **permanentemente nel browser**, indipendentemente dai salvataggi. Una volta conquistato un trofeo, resta per sempre, anche senza salvare la partita o eliminando tutti i file di salvataggio.
*   **Tracciamento dei Progressi:** Una nuova schermata "Trofei", accessibile dal menu principale, permette al giocatore di visualizzare i traguardi sbloccati e quelli ancora nascosti.
*   **Feedback Immediato:** Lo sblocco di un trofeo viene celebrato in tempo reale con una notifica speciale nel diario di viaggio.
*   **Rigiocabilità:** Il sistema è progettato per premiare la maestria, incoraggiare stili di gioco differenti e aumentare significativamente la longevità e la rigiocabilità del titolo.

### Come Giocare

L'interazione avviene interamente tramite tastiera:
*   **Movimento/Navigazione:** `W, A, S, D` o `Frecce Direzionali`.
*   **Inventario:** `I`.
*   **Riposo Rapido:** `R`.
*   **Ricerca Attiva:** `F` (cerca risorse nell'area circostante).
*   **Level Up:** `L` (quando disponibile).
*   **Interazione:** `Invio` per confermare, `ESC` per annullare/indietro.

### Deployment

Il gioco è configurato per essere eseguito da una sottocartella di un dominio (es. `www.miosito.com/gioco`). La configurazione di Vite (`base: './'`) gestisce automaticamente la creazione di percorsi relativi in fase di build, garantendo che tutte le risorse vengano caricate correttamente.

Per il deploy:
1. Eseguire `npm run build`.
2. Caricare il **contenuto** della cartella `dist` generata nella sottocartella desiderata sul server.

### Stato del Progetto e Sviluppi Futuri

**Versione Corrente: v1.9.9.83** - Data Restoration & Polish

**MILESTONE RAGGIUNTA: Il gioco è completo e production-ready (99%)**

Con la versione 1.9.9, il progetto raggiunge la massima stabilità con risoluzione di bug critici, bilanciamento strutturale completo e sistema di navigazione/debug enterprise-grade.

**Cosa Rimane:**
- Traduzioni multilingua (EN, ES, FR, DE, PT) - **IN CORSO (v1.9.9.7)**
- Ulteriori omaggi ai donatori rimanenti (~20)
- Testing finale end-to-end

#### Novità v1.9.9.83 (22 Novembre 2025) - **DATA RESTORATION & POLISH**

Versione definitiva del recupero dati. Ripristinati 42 oggetti mancanti, risolti i crash degli eventi e corrette le proprietà di impilamento (stackable) per una gestione ottimale dell'inventario.

---

#### Novità v1.9.9.81 (20 Novembre 2025) - **HOTFIX TRADER**

Risolto crash critico legato all'evento del Mercante Errante.

---

#### Novità v1.9.9.8 (20 Novembre 2025) - **CRAFTING REFACTOR**

Patch di bilanciamento che semplifica drasticamente il crafting per sbloccare la progressione.

**MODIFICHE CRAFTING:**
- **Ingredienti Semplificati**: Rimossi item rari (nastro, colla) dalle ricette base.
- **Materiali Comuni**: Ora si usano `scrap_metal`, `firewood`, `clean_cloth` per quasi tutto.
- **Nuova Ricetta**: Aggiunta `Torcia` (Legna + Stracci).
- **Zuppa Accessibile**: Ora richiede `dirty_water` + `Razione` invece di verdure rare.

**IMPATTO:**
- Crafting accessibile fin da subito.
- Niente più blocchi dovuti all'RNG.

---

#### Novità v1.9.9.7 (20 Novembre 2025) - **LOCALIZATION KICKOFF**

Inizio ufficiale dei lavori di localizzazione in inglese.

**LOCALIZZAZIONE:**
- Creata infrastruttura `_localization_work/en`
- Completata traduzione automatica di tutti i file `data/` (Eventi, Narrativa, Database)
- Predisposto ambiente per traduzione UI

---

#### Novità v1.9.9 (13 Novembre 2025) - **THE GREAT DEBUGGING**

Patch critica che risolve bug game-breaking e implementa sistema di navigazione.

**BUG FIX CRITICI:**
- **QUEST TALISMANO**: JSON malformato corretto
  - Fix: Evento unique_find_elara estratto da nesting errato
  - Impatto: Quest "Il Messaggio del Fiume" completabile
  
- **CAPANNA ERBORISTA**: Location garantita con tile 'H'
  - Fix: Tile speciale (105, 89) + handler dialogo diretto
  - Impatto: Quest "La Donna che Attende" accessibile
  
- **QUEST MARCUS**: Dialogo ora avvia e completa quest
  - Fix: Consequence startQuest + completeQuest con ricompensa
  - Impatto: "Indagine al Crocevia" funzionante end-to-end
  
- **WANDERING TRADER**: Fallback inizializzazione in loadGame
  - Fix: Auto-spawn se assente in save caricato
  - Impatto: Commerciante sempre visibile

**BILANCIAMENTO STRUTTURALE:**
- **CRAFTING ACCESSIBILE**:
  - Ricette iniziali: 5 → 7 (+40%, aggiunte Frecce e Lancia)
  - Drop manuali rifugi: 20% → 40% (+100%)
  - Legna aggiunta al loot per crafting armi
  - Manuali garantiti in 3 eventi città chiave
  
- **EQUIPAGGIAMENTI DISPONIBILI**:
  - Nemici umanoidi droppano 6 tipi armature
  - Tier-based: improvvisato → cuoio → tattico
  - Slot testa/gambe finalmente riempibili

**NUOVE FEATURE UX:**
- **COMPASS ROSE**: Indicatori direzionali POI sui bordi mappa
  - Mostra direzione (↑↓←→) e distanza a quest/locations/trader
  - Top 3 POI per direzione, colori codificati
  - Navigazione intuitiva su mappa 150x150
  
- **DEBUG PANEL**: Sistema debug enterprise-grade
  - Attivazione: Ctrl+Shift+D (tasto segreto)
  - Display real-time: stato, position, quests, flags, trader
  - Logging avanzato su questService, dialogueService, eventStore

**IMPATTO:**
- 5 bug critici risolti
- Crafting da "orpello" a "meccanica core"
- Equipaggiamenti da "inesistenti" a "accessibili"
- Navigazione da "confusa" a "intuitiva"
- Debug da "impossibile" a "enterprise-grade"
- 17 file modificati (3 nuovi componenti)

**Risultato:** Il gioco raggiunge il 99% di completezza con zero bug critici noti, pronto per testing finale e rilascio.

---

#### Novità v1.9.8.1 (9 Novembre 2025) - **WIP POLISH**

Micro-patch di rifinitura che completa il lavoro di v1.9.8.

**BUG FIX:**
- **TRADING ID**: Case sensitivity risolto (ammo/kit lowercase)
  - Fix: AMMO_9MM → ammo_9mm, AMMO_556 → ammo_rifle, AMMO_12G → ammo_shotgun
  - Impatto: Trading completamente funzionale, zero errori console

- **INVENTORY DESCRIZIONI**: Formattazione professionale
  - Fix: Tipo, rarità, effetti tradotti in linguaggio naturale
  - Impatto: UX significativamente migliorata

- **EVENTI NOMI OGGETTI**: Logging e fallback
  - Fix: Nomi sempre leggibili, logging per debug
  - Impatto: Messaggi sempre chiari

- **QUEST DEBOUNCE**: Previene duplicazioni
  - Fix: Cooldown 100ms tra update
  - Impatto: Journal pulito, no duplicati

- **EVENTI SPECIAL EFFECTS**: Messaggi specifici
  - Fix: learn_disease_symptoms con testo narrativo
  - Impatto: Nessun messaggio generico

- **EVENTO EREMITA**: Dialogo funzionante
  - Fix: Struttura outcome corretta
  - Impatto: Evento completamente funzionale

**IMPATTO:**
- 6 bug risolti (2 alti, 3 medi, 1 basso)
- Trading system perfettamente funzionante
- Inventory UX professionale
- Eventi tutti funzionali
- Zero bug noti rimanenti

**Risultato:** Il gioco raggiunge il massimo standard di qualità e stabilità. Pronto per testing finale.

---

#### Novità v1.9.8 (8 Novembre 2025) - **THE POLISHING PASS**

Patch di rifinitura completa che risolve bug game-breaking, implementa feature richieste e migliora significativamente l'esperienza utente.

**BUG FIX CRITICI:**
- **MAIN QUEST FINALE**: Coordinate marker corrette (149,146 → 145,146)
  - Fix: Marker ora punta alla tile 'E' corretta
  - Impatto: Finale del gioco raggiungibile
  
- **LOOP QUEST MULINO**: Quest "Il Messaggio del Fiume" fixata
  - Fix: Flag WINDMILL_EVENT_TRIGGERED previene loop infinito
  - Impatto: Quest completabile senza bug
  
- **EVENTO LADRO**: Fallimento furto ora triggera combattimento
  - Fix: Aggiunto nemico "Predone Ladro" + combat trigger
  - Impatto: Scelta più rischiosa e narrativamente coerente
  
- **EVENTO PIROMANE**: Condizionato a quest attiva
  - Fix: Evento alternativo "Cella Vuota" se quest non attiva
  - Impatto: Narrativa coerente in entrambi i casi

- **SISTEMA EVENTI**: Supporto combat trigger
  - Fix: Eventi possono triggerare combattimenti e gestire quest
  - Impatto: Sistema eventi molto più versatile

**BUG FIX MEDI:**
- **ENCUMBRANCE**: Aggiunta Furtività a skill penalizzate (-2 quando sovraccarico)
- **DIALOGHI HUB**: Marcus ristrutturato con nodo "hub" per conversazioni naturali
- **DIALOGO ANYA**: Fix nodo eurocenter che saltava a risposta sbagliata
- **ARMI THROWN**: Ora usano modificatore DES invece di FOR (balance corretto)

**BUG FIX MINORI:**
- **STATUS MALATO**: Testo corretto ("col tempo" invece di "ad ogni passo")
- **VERSIONING**: Sincronizzati constants.ts e package.json (1.9.8)
- **TRADING LOGGING**: Validazione e diagnostica migliorata

**FEATURE IMPLEMENTATE:**
- **TRADING QUANTITÀ VARIABILE**: Controlli A/D per modificare quantità (1 fino a max)
  - Nuovi controlli: Q/E per cambiare pannello
  - Indicatore visivo quantità selezionata
  - Scambi precisi ora possibili

**MIGLIORAMENTI UX:**
- **CUTSCENE**: Paragrafi progressivi (1s delay) invece di typewriter lento
  - Lettura più fluida e naturale
  - INVIO per mostrare tutto immediatamente
  
- **DIALOGHI**: Typewriter velocizzato 3x (30ms → 10ms)
  - Dialoghi più scorrevoli
  - Meno attesa per il giocatore
  
- **OUTPOST**: Navigazione keyboard-only pura
  - Rimossi effetti hover mouse
  - Coerente con filosofia retro del gioco

**NUOVI CONTENUTI:**
- Nemico: Predone Ladro (HP 32, AC 13, XP 95)
- Evento: Cella Vuota 403 (alternativo per Piromane)
- Meccaniche: Conditional events, Variable trading, Thrown DEX

**IMPATTO:**
- 12 bug risolti (5 critici, 4 medi, 3 minori)
- 2 feature implementate (trading, combat)
- 3 miglioramenti UX (cutscene, dialoghi, outpost)
- Stabilità e user experience massimizzate
- 20/20 task completati (100%)

**Risultato:** Il gioco raggiunge il massimo standard di qualità, stabilità e user-friendliness. Pronto per testing finale e rilascio.

---

#### Novità v1.9.7 (6 Novembre 2025) - **ALIGNMENT FIX**

Patch rapida che risolve il bug del sistema di allineamento morale.

**BUG FIX:**
- **ALLINEAMENTO MORALE**: Messaggi duplicati rimossi
  - Fix: Rimosso messaggio generico da eventStore
  - Impatto: Solo il messaggio corretto appare nel diario
  - Barra visiva ora si aggiorna correttamente
  - Sistema completamente funzionale

**Risultato:** Il sistema di allineamento, pilastro narrativo del gioco, è ora perfettamente funzionante.

---

#### Novità v1.9.6 (5 Novembre 2025) - **CRITICAL BUGFIXES**

Patch critica che risolve bug game-breaking emersi durante i test della v1.9.5.

**BUG FIX CRITICI:**
- ✅ **RISOLTO CRASH**: Errore "require is not defined" su eventi speciali (marker viola)
  - Fix: Sostituito require() con import() async in interactionStore
  - Impatto: Eventi speciali ora funzionano senza crash
  
- ✅ **TITOLI CORRETTI**: Duplicazione "Echi della Memoria" rimossa
  - Fix: Rimossi prefissi duplicati da mainStory.json
  - Impatto: Titoli ora formattati correttamente
  
- ✅ **UX MIGLIORATA**: Box di testo eventi ingranditi (+50%)
  - Fix: h-64 → h-96 + scroll con W/S
  - Impatto: Tutti i testi eventi completamente leggibili

**IMPATTO:**
- Gioco ora stabile e completamente giocabile
- Zero crash su eventi speciali
- Esperienza utente significativamente migliorata
- Tutti i contenuti v1.9.5 accessibili senza problemi

**Risultato:** Patch essenziale che rende la v1.9.5 completamente stabile e giocabile.

---

#### Novità v1.9.5 (5 Novembre 2025) - **ECHOES OF THE DONORS**

Questa versione completa il gioco con omaggi creativi ai donatori e polish dell'esperienza utente.

**SCHERMATA CREDITI PROFESSIONALE:**
- Trasformata schermata iniziale in crediti scrollabili
- Navigazione: Frecce SU/GIÙ + INVIO per procedere
- 27 contributori in ordine alfabetico
- Crediti team completi con audio feedback

**QUEST "LA DONNA CHE ATTENDE":**
- Olivia l'Erborista - botanica isolata nella foresta
- 2 stage: Trova Fiore di Ghiaccio → Consegna
- Ricompensa: 500 XP + SAG +1 + Ricetta Elisir Epic
- NPC completo: dialogo (5 nodi) + trading specializzato
- Nuovo consumabile: Elisir della Tempra (heal + anti-freddo + buff 12h)

**EVENTO "IL CAVALIERE SILENTE":**
- Leonardus Vargeon - guerriero medievale anacronistico
- Mistero poetico in radura isolata
- 3 scelte: Spadone epic / Medaglione / Scelta morale
- Arma più potente del gioco: Spadone di Vargeon (28 dmg)

**QUEST "IL TUBO N.403":**
- Storia horror del Piromane - Angelo della Cenere fallito
- 3 stage investigativi: Lettera → Archivi → Confronto
- Boss Elite: Angelo Aberrante (abilità Esplosione Piromaniacale)
- Ricompensa: Accendino Infinito (game-changer quality of life)
- 3 scelte finali: Compassione / Combattimento / Fuga

**EVENTO "L'UTILITARIA AZZURRINA":**
- Omaggio The Elder Radio e Capitano Keith Arrow
- Studio radio mobile in auto azzurra "The Katzus"
- 3 scelte: Cassetta audio / Mappa POI / Rispetto
- Integrazione con Anya (potenziamento elmo)

**CONTENUTI AGGIUNTI:**
- Items: 156 (+25, +19%)
- Eventi: 99 (+50, +102%)
- Quest: 21 (+2, +11%)
- Dialogues: 6 (+1, +20%)
- Traders: 5 (+1, +25%)
- Enemies: 15 (+1 boss Elite)

**IMPATTO:**
- Gioco dichiarato sostanzialmente completo
- Omaggi donatori integrati creativamente
- Narrativa arricchita con storie personali
- Quality of life massimizzata
- Esperienza utente professionale

**Risultato:** The Safe Place Chronicles raggiunge la sua forma definitiva, un RPG post-apocalittico completo che attende solo traduzioni e ulteriori personalizzazioni.

---

#### Novità v1.9.1 (4 Novembre 2025) - **TACTICAL COMBAT**

Questa versione espande massivamente il sistema di combattimento con meccaniche tattiche avanzate.

**AZIONI AMBIENTALI CONTESTUALI:**
- **Foresta**: [Nasconditi tra gli Alberi] - Furtività DC 13, prossimo attacco nemico auto-miss
- **Città/Villaggio**: [Cerca Copertura] - Percezione DC 12, +4 AC per 2 turni
- **Pianura**: Nessuna azione (terreno puro, identità strategica unica)

**SISTEMA MUNIZIONI SPECIALI:**
- **Perforanti**: Ignorano 3 punti AC nemico (vs nemici corazzati)
- **Incendiarie**: Applicano status "In Fiamme" (3 HP/turno × 3 turni)
- **Hollow Point**: +1d4 danno bonus (massimizzano danno)
- Caricamento: 3 munizioni = 3 colpi speciali

**2 NEMICI ELITE (+14%):**
- **Capobranco Lupi Mutati**: HP 55, AC 14, XP 200
  - Abilità: Richiamo Branco (turno 2, 50% prob, +15 HP)
  - Counterplay: Spara in Aria (Intimidire DC 15)
- **Capo Predone Veterano**: HP 50, AC 16, XP 250
  - Abilità: Contrattacco (su player miss, 30% prob, 75% danno)
  - Counterplay: Finta Elaborata (Inganno DC 16)

**BIOME INTEGRATION:**
- Combat tracking bioma corrente
- Azioni disponibili basate su ambiente
- Bonus ambientali (hide/cover)
- Decremento automatico turni

**BURNING STATUS EFFECT:**
- Applicato da munizioni incendiarie
- 3 HP danno/turno per 3 turni
- Check morte da fuoco
- Visual feedback in combat log

**IMPATTO:**
- Combattimento tattico vs ripetitivo
  - Ambiente risorsa strategica
  - Preparazione premiata (munizioni)
  - Boss memorabili e sfidanti
  - Skill Furtività/Percezione valorizzate

**Risultato:** Il combattimento evolve da "meccanica isolata" a "sistema tattico integrato" dove ambiente, equipaggiamento e preparazione determinano vittoria## 📦 Version 1.9.9.6

**Current Release:** v1.9.9.6 "Echoes of Gratitude" (November 2025)

### Recent Updates
- **Credits Update:** Complete overhaul of the credits screen to honor all supporters.
- **Donor Events:** Added 10 unique "Echoes of Donors" events.
- **Dynamic Names:** Implemented a system to display random donor names in specific game contexts (graves, badges).
- **Bug Fixes:** 
    - Fixed "undefined item" error in donor events.
    - Fixed missing Village tileset rendering.

See `log/` directory for full changelogs.trutturato con "Prove" attive che valorizzano le lezioni del padre.

Con la versione 1.9.0, il gioco introduce il **sistema Main Quest multi-stage** - la quest principale diventa un viaggio strutturato con "Prove" attive che valorizzano le lezioni del padre.

#### Novità v1.9.0 (4 Novembre 2025) - **LE PROVE DEL PADRE**

Questa versione trasforma la Main Quest da obiettivo passivo a sistema multi-stage con prove attive.

**MAIN QUEST MULTI-STAGE:**
- 7 stage totali (3 prove + 4 narrativi)
- Alternanza tra obiettivi narrativi e prove concrete
- Integrazione perfetta con "Echi della Memoria"
- Auto-attivazione all'inizio del gioco

**3 PROVE ATTIVE:**
- **Prova dell'Acqua**: Purifica acqua (craftItem CONS_002)
- **Prova della Fuga**: Fuggi da combattimento (successfulFlee)
- **Prova dell'Analisi**: Studia nemico (tacticRevealed)

**4 NUOVI TRIGGER TYPES (+44%):**
- `mainStoryComplete`: Trigger quando Main Story avanza
- `craftItem`: Trigger quando oggetto specifico craftato
- `successfulFlee`: Trigger dopo fuga riuscita
- `tacticRevealed`: Trigger dopo analisi nemica

**SISTEMA QUEST FLAGS:**
- Tracking achievements player (hasCraftedWater, etc.)
- Persistenza save/load completa
- Skip automatico prove già completate
- Journal feedback intelligente

**SKIP-AHEAD LOGIC:**
- Se prova già completata → skip automatico
- Journal: "Ti rendi conto di averlo già fatto"
- Progressione fluida senza ripetizioni
- Valorizza azioni precedenti

**INTEGRAZIONE GAMEPLAY:**
- Crafting → Set flag + trigger check
- Combat flee → Set flag + trigger check
- Combat analyze → Set flag + trigger check
- Main Story complete → Trigger quest advance

**IMPATTO:**
- Viaggio strutturato invece di dispersivo
- Obiettivi concreti tra Echi narrativi
- Lezioni del padre valorizzate meccanicamente
- Progressione gratificante e dinamica

**Risultato:** Il gioco evolve da "survival RPG con storia passiva" a "survival RPG con Main Quest attiva e obiettivi strutturati".

---

#### Novità v1.8.5 (4 Novembre 2025) - **DATABASE INTEGRITY**

Con la versione 1.8.5, è stato risolto un bug critico che impediva il caricamento dei file JSON delle subquest, rendendo finalmente accessibili tutti i contenuti implementati nelle versioni 1.8.0-1.8.4.

Con la versione 1.8.5, è stato risolto un bug critico che impediva il caricamento dei file JSON delle subquest, rendendo finalmente accessibili tutti i contenuti implementati nelle versioni 1.8.0-1.8.4.

#### Novità v1.8.5 (4 Novembre 2025) - **DATABASE INTEGRITY**

Questa patch risolve errori 404 critici nel caricamento dei database JSON.

**BUG FIX CRITICO:**
- ✅ Risolti errori 404 per 6 file JSON mancanti
- ✅ Copiati file eventi subquest in public/data/events/
- ✅ Copiato lore_archive.json in public/data/
- ✅ Sistema quest ora completamente funzionante

**LOGGING DETTAGLIATO:**
- Aggiunto logging enterprise-grade a eventDatabase.ts
- Monitoraggio caricamento: [EVENT DB] e [EVENT STORE]
- Diagnostica facilitata per problemi futuri

**FILE COPIATI (6):**
- village_pump.json - Eventi pompa villaggio
- forest_thief.json - Eventi ladro foresta
- special_locations.json - Location speciali
- hermit_location.json - Capanna eremita
- repair_quests.json - Quest riparazione
- lore_archive.json - Archivio scoperte lore

**DATABASE CARICATI:**
- Items: 131 ✅
- Events: 47 ✅ (24 biome + 15 encounters + 4 lore + 4 easter eggs)
- Quests: 1 ✅
- Dialogues: 5 ✅
- Traders: 4 ✅
- Lore Archive: 3 ✅

**IMPATTO:**
- Zero errori 404 in console
- Contenuti v1.8.0-v1.8.4 finalmente accessibili
- Quest subquest completamente funzionanti
- Eventi speciali attivabili

**Risultato:** Il sistema quest implementato nelle ultime 5 versioni è ora completamente operativo.

---

#### Novità v1.8.4 (31 Ottobre 2025) - **BROKEN LEGACIES**

Con la versione 1.8.4, il gioco introduce il **sistema di riparazione e ricostruzione** - 3 quest che trasformano reliquie rotte in funzionalità ripristinate, con ricompense uniche e modifiche permanenti al mondo.

#### Novità v1.8.4 (31 Ottobre 2025) - **BROKEN LEGACIES**

Questa versione introduce quest di riparazione con fallimento permanente e ricompense uniche.

**3 REPAIR QUEST:**
- **La Melodia Spezzata** (Pianoforte): CAR +1, momento artistico
- **La Luce nella Torre** (Radio): Contatto Stazione Delta, walkie-talkie
- **L'Acqua della Vita** (Impianto): Modifica mondo, acqua pulita area

**SISTEMA RIPARAZIONE:**
- Componenti rari richiesti
- Skill check critici (DC 15-17)
- Fallimento permanente possibile
- Ricompense uniche (stat, discoveries, world changes)

**NUOVI OGGETTI (4):**
- Generatore Portatile (15kg, rare)
- Filtri Industriali (3kg, uncommon)
- Batteria Veicoli Pesanti (20kg, rare)
- Manuale Idraulico (uncommon)

**WORLD STATE EXPANSION:**
- Water plant tracking
- Area effect per Active Search
- Modifiche permanenti persistenti

**VALORIZZA INT/INVESTIGARE:**
- Tutte 3 quest usano Investigare
- DC alti (15-17) premiano skill investment
- Bilanciamento con combat/survival

**RICOMPENSE EMOTIVE:**
- Pianoforte = arte in mondo silenzioso
- Torre = speranza (altri sopravvissuti)
- Impianto = civiltà ripristinata

**IMPATTO:**
- Reliquie rotte → Funzionalità ripristinate
- Ricompense oltre XP/items
- Mondo modificabile permanentemente
- Playstyle "Rebuilder" supportato

**Risultato:** Il gioco evolve da "survival RPG" a "survival RPG con ricostruzione del mondo perduto".

---

#### Novità v1.8.3 (31 Ottobre 2025) - **HUNTERS & PREY**

Questa versione introduce un sistema di bounty completo con quest ripetibili e il trigger `enemyDefeated`.

**SISTEMA BOUNTY - CONTENUTI ENDLESS:**
- 3 bounty quest ripetibili (Cinghiali, Lupi, Predoni)
- Trigger `enemyDefeated` completamente implementato
- Kill count tracking automatico e persistente
- Ricompense garantite (munizioni, materiali, XP)

**NUOVO PNG: SILAS, IL CACCIATORE:**
- Cacciatore esperto al Crocevia
- Bacheca taglie con 3 contratti sempre disponibili
- Insegnamento ricette in cambio di pelli
- Trading specializzato (munizioni, trappole)

**3 BOUNTY INIZIALI:**
- **Cinghiali** (3 kill): 350 XP + 15× Munizioni Fucile + 5× Pelli
- **Lupi** (4 kill): 400 XP + 20× Frecce + 6× Pelli
- **Predoni** (5 kill): 500 XP + 30× Munizioni 9mm + 2× Medkit

**KILL COUNT SYSTEM:**
- Tracking automatico nemici uccisi per quest
- Progresso visibile in tempo reale
- Persistenza save/load completa
- Reset automatico su quest complete

**ECONOMIA SOSTENIBILE:**
- Munizioni consumate → Munizioni guadagnate (+50% ROI)
- Pelli per crafting e insegnamenti
- Ciclo auto-sostenibile senza grind

**COMBAT VALORIZZATO:**
- Combattimento = attività proattiva scelta
- Ricompense specifiche e garantite
- Playstyle combat-focused supportato

**IMPATTO:**
- Contenuti infiniti post-story
- Hub Crocevia con 3 PNG specializzati
- Economia circolare funzionante
- Rigiocabilità massimizzata

**Risultato:** Il gioco evolve da "RPG con quest finite" a "RPG con contenuti endless e ciclo economico sostenibile".

---

#### Novità v1.8.2 (31 Ottobre 2025) - **SIGNS OF ASH**

Questa versione introduce una quest investigativa profonda con meccaniche multi-flag innovative.

**QUEST INVESTIGATIVA: "I SEGNI DELLA CENERE":**
- 4 stage progressivi (esplorazione → decifrazione → raccolta → completamento)
- 3 location rituali da scoprire (ordine libero)
- Sistema multi-flag per progressione (prima implementazione)
- Ricompensa: Manuale Dissuasore Sonico (ricetta epic)

**NUOVO PNG: L'ASCOLTATORE (EREMITA):**
- Ex-tecnico del suono, quasi cieco, udito sovrumano
- Capanna nascosta in Foresta (evento casuale)
- Unico in grado di decifrare diario Ascoltatori
- Rivela: "cultisti" erano scienziati, non pazzi

**3 LOCATION RITUALI:**
- **Cerchio Rituale** (Foresta) - Modificato, avvia quest
- **Grotta dei Sussurri** (Montagna) - Nuovo, flag CAVE
- **Albero Segnato** (Foresta) - Nuovo, flag TREE

**DISSUASORE SONICO - OGGETTO TATTICO UNICO:**
- Consumabile epic-tier
- Effetto: 6 ore protezione da Angeli della Cenere
- Ricetta: Investigare DC 17, ingredienti rari
- Game-changer per attraversamento zone pericolose

**NUOVE MECCANICHE:**
- Multi-flag quest trigger (AND di 2+ flags)
- SetFlag event handler con auto-check
- Conditional dialogue basato su quest stage
- Ricompensa tattica invece di solo XP

**LORE EXPANSION:**
- Ascoltatori: scienziati che studiavano frequenze
- Rituale di schermatura: protezione da Ash Angels
- Grande Silenzio: "canto" invece di silenzio
- Ash Angels: "note" di una frequenza più grande

**IMPATTO:**
- Evento singolo → Avventura multi-location
- Lore sorprendente e sovversiva
- PNG memorabile con ruolo chiave
- Ricompensa unica che cambia gameplay
- Sistema multi-flag per future quest complesse

**Risultato:** Il gioco evolve da "RPG con quest lineari" a "RPG con investigazioni complesse e ricompense tattiche".

---

#### Novità v1.8.1 (31 Ottobre 2025) - **ECHOES OF THE LOST WORLD**

Questa versione introduce un sistema di collezione profondo che valorizza ogni oggetto unico del gioco.

**NUOVO PNG: ANYA, LA TECNICA:**
- Scrapper brillante al Crocevia
- Trasforma artefatti rari in potenziamenti
- 5 "Echi" collezionabili con ricompense uniche
- Dialoghi condizionali basati su inventory

**QUEST A COLLEZIONE:**
- "Echi del Mondo Perduto" - Quest persistente
- 5 artefatti consegnabili per ricompense progressive
- Ricompensa finale: 500 XP + INT +2
- Tracking tramite gameFlags

**5 ECHI COLLEZIONABILI:**
- **Placca PixelDebh**: Ricetta Advanced Repair Kit
- **Chip Drone**: Potenziamento armatura chest (+2 Difesa)
- **Registrazione Criptica**: Rivela Deposito Medico + 75 XP
- **Note Progetto Rinascita**: Potenziamento legs (+1 Difesa, Resistenza MALATO)
- **Biglietto Eurocenter**: Multitool Professionale (tool raro)

**NUOVE MECCANICHE:**
- Sistema potenziamento armature (upgradeEquippedArmor)
- 3 nuovi consequence types (upgradeArmor, learnRecipe, revealMapPOI)
- Eventi special locations (Laboratorio, Biblioteca)
- Tracking consegne via gameFlags

**OGGETTI VALORIZZATI:**
- Easter eggs ora meccanicamente rilevanti
- Oggetti quest hanno "seconda vita"
- Lore discoveries = ricompense tangibili

**IMPATTO:**
- Scopo concreto per ogni oggetto unico
- Hub potenziamento alternativo (Anya vs Marcus)
- Incentivo esplorazione totale
- Rigiocabilità massimizzata
- End-game content espanso

**Risultato:** Il gioco evolve da "RPG con quest" a "RPG con sistema di collezione e potenziamento profondo".

---

#### Novità v1.8.0 (31 Ottobre 2025) - **QUEST EXPANSION & WORLD INTERACTION**

Questa versione trasforma il Quest System da framework base a sistema completo e versatile con varietà narrativa.

**10 SUBQUEST GIOCABILI (+900%):**
- **"La Pompa Silenziosa"**: Ripara pompa d'acqua per fonte permanente
- **"Indagine al Crocevia"**: Recupera orologio rubato, guadagna amicizia Marcus
- **"La Conoscenza Perduta"**: Scopri segreti Progetto Eco (lore quest)
- **"L'Eco del Silenzio"**: Scopri segreti Progetto Rinascita (lore quest)
- **"Il Messaggio del Fiume"**: Espansa con stage 3, integrazione Marcus
- **"L'Ultimo Messaggero"**: Consegna pacco sigillato al Crocevia
- **"L'Occhio nel Cielo"**: Decifrare chip drone (con possibilità fallimento)
- **"Il Debito del Sopravvissuto"**: Salva Liam e scorta Elara al sicuro
- **"La Promessa del Bambino"**: Trova tesoro famiglia sotto torre radio
- **"Il Peso della Scelta"**: Scopri destino famiglia Alenko (narrativa agrodolce)

**6 TRIGGER TYPES (+200%):**
- **hasItems**: Check inventario multiplo (raccolta materiali)
- **talkToNPC**: Dialogo con NPC specifico (integrazione sociale)
- **completeEvent**: Evento unico completato (lore quests)
- **interactWithObject**: Interazione oggetto/terminale (quest tecnologiche)

**WORLD STATE SYSTEM:**
- Modifiche permanenti al mondo (pompe riparate/distrutte)
- Interazioni ripetibili con oggetti riparati
- Persistenza completa save/load
- Base per espansioni (ponti, giardini, rifugi)

**ARCHIVIO LORE:**
- Nuova colonna in QuestScreen: "ARCHIVIO LORE"
- 3 lore entries sbloccabili (Progetto Eco, Rinascita, Clan Corvo)
- Testo completo rileggibile
- Ricompensa per esplorazione e scoperte

**SISTEMA REPUTAZIONE:**
- Marcus Friendship flag
- Sconto permanente 10% in scambi
- Base per sistema fazioni futuro

**INTEGRAZIONE DIALOGHI/QUEST:**
- Conditional dialogue options basate su quest attive
- Quest completabili tramite dialoghi
- Ricompense scelte in dialogo

**MECCANICHE AVANZATE:**
- Fallimento quest permanente (chip drone)
- Conseguenze dialogo (completeQuest, failQuest)
- Quest multi-stage complesse (fino a 4 stage)
- Ricompense variegate (XP, items, stat, lore, reputation, world changes)

**VARIETÀ NARRATIVA:**
- Quest eroiche (salvare Elara)
- Quest investigative (orologio, drone)
- Quest di consegna (messaggero)
- Quest tecnologiche (terminale)
- Quest emotive (famiglia Alenko)
- Lore quests (auto-complete)

**IMPATTO:**
- Quest system enterprise-grade (10 quest, 6 trigger types)
- Mondo modificabile permanentemente (pompe)
- Scoperte narrative valorizzate (archivio lore)
- Relazioni PNG profonde (Marcus friendship)
- Conseguenze permanenti (fallimenti, reputazione)
- Base solida per espansioni infinite

**Risultato:** Il gioco evolve da "RPG con quest base" a "RPG con mondo interattivo, persistente e narrativamente profondo".

---

**Versione Corrente: v1.7.0** - Social Hub & Interactive NPCs

Con la versione 1.7.0, il gioco completa la trasformazione in un **RPG sociale completo** con sistemi di dialogo interattivo e baratto economico funzionanti.

#### Novità v1.7.0 (30 Ottobre 2025) - **SOCIAL HUB & INTERACTIVE NPCS**

Questa versione introduce sistemi sociali ed economici che trasformano i PNG in partner di gioco reali.

**SISTEMA DI DIALOGO INTERATTIVO:**
- Alberi di dialogo ramificati con 10 nodi totali
- 2 PNG parlanti: Marcus (Avamposto) + Giona (Wandering Trader)
- Effetto macchina da scrivere immersivo (30ms/carattere)
- Skill check integrati (Persuasione DC 12)
- Navigazione keyboard-only (1-9 per opzioni)
- Conditional options basate su quest/alignment/items
- Context preservation (ritorno intelligente)

**SISTEMA DI BARATTO ECONOMICO:**
- Scambio basato su valore oggetti (no valuta)
- Markup dinamico influenzato da Persuasione
- Formula: `effectiveMarkup = baseMarkup - (persuasionBonus × 0.02)`
- Range markup: 105% (master) → 150% (novizio)
- Balance real-time con indicatore verde/rosso
- 2 mercanti: Marcus (19 item) + Giona (10 item)
- UI dual-panel: Player | Offers | Trader

**HUB INTERATTIVI COMPLETI:**
- **Avamposto**: Dialogo + Commercio + Riposo funzionanti
- **Wandering Trader**: Dialogo + Commercio + movimento forzato
- Ritorno automatico al menu dopo interazioni
- Scelte multiple per PNG (parla poi commercia)

**PERSUASIONE MECCANICAMENTE UTILE:**
- Riduce costi commercio (2% per punto bonus)
- Sblocca informazioni nei dialoghi
- Skill ora critica per economia

**OGGETTI DI VALORE FUNZIONALI:**
- Monete, gioielli, gemme = valuta di scambio
- Convertire loot inutile in risorse essenziali
- Economia strategica implementata

**IMPATTO:**
- PNG con personalità e voci
- Dimensione sociale ed economica
- Persuasione skill critica
- Hub sociali completi
- Base per fazioni e reputazione

**Risultato:** Il gioco evolve da "survival RPG con mondo vivo" a "survival RPG sociale" con economia e interazioni profonde.

---

**Versione Corrente: v1.6.0** - Living World & Special Locations

Con la versione 1.6.0, il gioco introduce un **mondo vivo e dinamico** con location speciali uniche, il primo PNG autonomo, e un hub sociale completamente funzionante.

#### Novità v1.6.0 (30 Ottobre 2025) - **LIVING WORLD & SPECIAL LOCATIONS**

Questa versione trasforma il mondo di gioco da mappa generica a paesaggio narrativo vivo.

**5 NUOVE LOCATION SPECIALI:**
- **Avamposto "Il Crocevia" (A)**: Primo hub sociale con riposo sicuro (8h)
- **Nido della Cenere (N)**: Dungeon end-game, rivela natura Angeli della Cenere
- **Laboratorio (L)**: Svela segreti del "Progetto Rinascita"
- **Biblioteca (B)**: Archivio del "Progetto Eco" e Grande Silenzio
- **Commerciante Itinerante (T)**: PNG dinamico che si muove ogni 5 turni

**SISTEMA PNG DINAMICO:**
- Commerciante spawna casualmente all'inizio partita
- Si muove autonomamente ogni 5 turni del player
- Visibile sulla mappa con icona dorata
- Interazione ripetibile con informazioni utili
- Gameplay emergente: "caccia al commerciante"

**EVENTI UNICI GARANTITI:**
- Entrare in location speciale = evento narrativo garantito
- 4 nuovi eventi con lore profonda
- Skill check: Investigare, Storia, Percezione
- Ricompense: Oggetti unici, XP, stat boost

**NUOVI OGGETTI QUEST:**
- Note di Ricerca (Progetto Rinascita)
- Campione Tessuto Cenere (epic rarity)

**QUEST MARKER FIX:**
- Marker ora scompaiono istantaneamente quando quest completata
- Rendering reattivo a cambiamenti activeQuests
- Bug critico risolto

**IMPATTO:**
- Mondo trasformato da statico a vivo
- Esplorazione intenzionale vs casuale
- Primo PNG autonomo funzionante
- Base per espansioni future (commercio, fazioni, dialoghi)

**Risultato:** Il gioco evolve da "survival RPG" a "survival RPG con mondo vivo e dinamico".

---

**Versione Corrente: v1.5.0** - Quest System Framework

Con la versione 1.5.0, il gioco introduce il **Quest System Framework** - un'infrastruttura completa per missioni principali e secondarie che trasforma il gioco da esperienza narrativa passiva a RPG con obiettivi attivi.

#### Novità v1.5.0 (30 Ottobre 2025) - **QUEST SYSTEM FRAMEWORK**

Questa versione implementa le fondamenta per un sistema di quest completo, validato con la prima subquest giocabile.

**SPRINT 1 - INFRASTRUTTURA QUEST:**
- **Sistema Tipi Completo**: 6 tipi trigger, quest MAIN/SUB, ricompense multi-tipo
- **Database Quest**: Store Zustand con caricamento asincrono ([`questDatabase.ts`](data/questDatabase.ts:1))
- **Quest Service**: 308 righe di logica centralizzata ([`questService.ts`](services/questService.ts:1))
- **Character Integration**: activeQuests, completedQuests, persistenza save/load
- **Quest Log UI**: Schermata dedicata [J] con layout due colonne ([`QuestScreen.tsx`](components/QuestScreen.tsx:1))

**SPRINT 2 - PRIMA QUEST GIOCABILE:**
- **"Il Talismano Perduto"**: Subquest completa in 2 stage
- **Evento Attivatore**: "Messaggio nella Bottiglia" (fiume)
- **Evento Obiettivo**: "Il Vecchio Mulino a Vento" (78, 9)
- **Trigger Implementati**: reachLocation, getItem
- **Ricompense**: 150 XP + 2x Miele

**QUEST MARKERS VISIVI:**
- **! ROSSO**: MAIN quest (priorità massima)
- **! GIALLO**: SUB quest (obiettivi secondari)
- Indicatori sulla mappa mostrano dove andare
- Scompaiono quando obiettivo raggiunto

**CICLO QUEST COMPLETO:**
1. Trova bottiglia in fiume → Leggi messaggio → Quest attivata
2. **! GIALLO appare a (78, 9)** sulla mappa
3. Viaggia verso il marker → Evento ricerca automatico
4. Skill check Percezione DC 12 → Trova talismano
5. Quest completata → Marker scompare → Ricompense assegnate

**ARCHITETTURA:**
- Service Layer pattern per logica complessa
- Event-driven trigger system
- Persistenza integrata in save system v2.0.0
- UI keyboard-only coerente con design

**DOCUMENTAZIONE:**
- **QUEST-SYSTEM-v1.5.0-IMPLEMENTATION.md**: Analisi completa (308 righe)
- **log/v1.5.0.md**: Changelog dettagliato (158 righe)
- JSDoc enterprise-grade per tutte le funzioni

**IMPATTO:**
- Primo vero sistema di obiettivi attivi
- Base per espansione narrativa (quest chain, branch, timer)
- Rigiocabilità aumentata (contenuti opzionali)
- Preparazione per Main Quest integration

**Risultato:** Il gioco evolve da "survival narrative" a "survival RPG" con quest system robusto e scalabile.

---

**Versione Corrente: v1.4.5** - Technical Excellence & Encumbrance

Con la versione 1.0.3, il prototipo ha raggiunto la sua **piena completezza narrativa e meccanica**. La versione 1.2.0 ha introdotto un'espansione massiva di contenuti, le versioni 1.2.x hanno risolto bug critici e bilanciamenti, la **v1.3.x rivoluziona completamente i sistemi di sopravvivenza**, eliminando la dipendenza dalla fortuna e dando al giocatore controllo strategico sulle risorse, e la **v1.4.x ridefinisce concettualmente la struttura narrativa** del gioco:

#### Novità v1.4.5 (29 Ottobre 2025) - **TECHNICAL EXCELLENCE & ENCUMBRANCE**

Questa versione solidifica le fondamenta tecniche del progetto per preparare espansioni future complesse.

**FASE 1 - DOCUMENTAZIONE ENTERPRISE-GRADE (COMPLETATA):**
- **60 funzioni documentate** con JSDoc premium (gameStore, characterStore, gameService)
- **Standard enterprise:** Formule, esempi, tabelle di riferimento, edge cases
- **IntelliSense potenziato:** Hover su funzione → documentazione completa
- **Onboarding facilitato:** Nuovo sviluppatore capisce codice immediatamente
- **Coverage:** 15% → 50% (+233%)

**SISTEMA DI INGOMBRO COMPLETO:**
- **Formula realistica:** 15 + (FOR_modifier × 2) kg (era FOR × 10)
- **Penalità skill:** -2 Atletica/Acrobazia quando sovraccarico
- **Fatigue accelerata:** ×2 quando sovraccarico (già esistente, ora documentato)
- **Journal feedback:** Messaggi automatici quando diventi/esci da sovraccarico
- **UI migliorata:** Indicatori peso con codifica colori (verde/giallo/rosso)
- **Supporto zaini:** Preparato per zaini che aumentano capacità (+5kg/+10kg)

**UX FIXES CRITICI:**
- **Cutscene overflow:** Layout flex, scroll automatico, font ottimizzato
- **Inventory auto-scroll:** scrollIntoView smooth quando selezione cambia
- **Tutte le schermate narrative:** Ora completamente leggibili

**DOCUMENTAZIONE TECNICA:**
- **ROADMAP-v1.4.5-TECHNICAL-EXCELLENCE.md:** 8 fasi pianificate (400 righe)
- **SISTEMA-INGOMBRO-IMPLEMENTATO.md:** Documentazione completa (250 righe)
- **FASE1-JSDOC-PROGRESS.md:** Tracker progresso documentazione

**IMPATTO:**
- Fondamenta tecniche solidificate per espansioni future
- FOR diventa statistica critica (capacità carico)
- Scelte strategiche su cosa portare
- Codice pronto per collaboratori esterni
- Pronto per sistemi complessi (quest, fazioni, base building)

**Risultato:** Progetto tecnicamente maturo, documentato a livello enterprise, pronto per crescita.

---

#### Novità v1.4.4 (29 Ottobre 2025) - **UX POLISH & CRT PREMIUM**

Questa versione migliora drasticamente l'esperienza utente per i nuovi giocatori e introduce un tema CRT di qualità premium.

**SISTEMA PAGINAZIONE SCHERMATE INFORMATIVE:**
- **Istruzioni:** 14 pagine navigate con keyboard (era scrolling veloce illeggibile)
- **Storia:** 5 pagine narrative con testo completo (nessun taglio)
- **Navigazione:** [A/←] Indietro, [D/→] Avanti, [INVIO] Avanti, [ESC] Menu
- **UX:** Indicatore pagina, audio feedback, layout fisso (no spostamento orizzontale)
- **Stato:** DEFINITIVO - Approvato e documentato nel codice

**OPZIONI COMPLETATE:**
- **Portoghese** aggiunto alle lingue selezionabili (preparazione i18n)
- **Fullscreen** ora funzionante (attiva/disattiva modalità fullscreen browser)

**TEMA CRT PREMIUM QUALITY:**
- **Colore Fosforo P3 Autentico:** #33ff33 (IBM 5151, Apple Monitor III, DEC VT100)
- **Multi-Layer Phosphor Glow:** 5 layer di bloom + aberrazione cromatica rossa
- **Scanline Realistiche:** Gradiente intensità, pattern 4px, scroll lento (12s)
- **Vignette Avanzata:** Gradiente 4-stop + phosphor bloom verde negli angoli
- **Animazioni Premium:** Phosphor flicker, wobble ottimizzato, CRT flicker irregolare
- **Filtri Avanzati:** Contrast 1.1, Brightness 1.05, Blur 0.3px

**DOCUMENTAZIONE:**
- **Template Changelog Ufficiale:** Standard per tutte le versioni future
- **Analisi Sistema Temi:** Architettura completa (400 righe)
- **CRT Premium Upgrade:** Dettagli tecnici upgrade (300 righe)

**IMPATTO:**
- Esperienza nuovi giocatori drasticamente migliorata
- Schermate informative ora leggibili e professionali
- Tema CRT di qualità premium con emulazione autentica anni '80
- Base documentale solida per sviluppo futuro

**Risultato:** UX professionale e immersione autentica nei monitor CRT vintage.

---

#### Novità v1.4.3 (22 Ottobre 2025) - **ECHOES OF THE PAST & ASH NESTS**

Questa versione arricchisce profondamente la lore del mondo e migliora l'impatto narrativo degli eventi esistenti.

**NUOVI EVENTI LORE:**
    - **"L'Ultimo Messaggio"**: Un nuovo evento in ambiente urbano che offre una spiegazione parziale e inquietante del "Grande Silenzio", introducendo il "Progetto Eco" come un'interfaccia neurale collettiva.- **"Il Nido della Cenere"**: Un evento unico in aree remote che rivela la vera natura degli Angeli della Cenere: non solo predatori, ma entità che "raccolgono" e "trasformano" i corpi umani, aggiungendo un senso di orrore cosmico e conseguenze a lungo termine per le interazioni con gli NPC.

**MIGLIORAMENTI EVENTI LORE ESISTENTI:**
- **"L'Eco di una Tosse"**: La descrizione della malattia della ragazza è stata resa più specifica, aumentando la profondità narrativa e la potenziale rilevanza futura.
- **"Voci nel Silenzio"**: La scelta di riparare la radio ora ricompensa il giocatore con un oggetto quest "Registrazione Criptica" in caso di successo, bilanciando la scelta "Lena" con una ricompensa tangibile e un potenziale di sviluppo narrativo a lungo termine.

**IMPATTO:**
- **Profondità Narrativa Accresciuta:** Il mondo di gioco diventa più misterioso e stratificato, con indizi sulla sua storia e sul ruolo di Lena.
- **Scelte Più Significative:** Le decisioni del giocatore negli eventi lore hanno ora conseguenze più tangibili e ramificate.
- **Angeli della Cenere Più Complessi:** La loro natura viene ridefinita, rendendoli antagonisti più intriganti.

**Risultato:** Un mondo più vivo, misterioso e reattivo alle scelte del giocatore, con una lore che si svela gradualmente e in modo più coinvolgente.

---

#### Novità v1.4.1 (22 Ottobre 2025) - **THE HUMANOID FIX**

Questa patch risolve **tre problemi narrativi critici** e aggiunge profondità cinematica, trasformando il gioco da un'esperienza **narrativamente fragile** a una **narrativamente robusta**.

**FIX NARRATIVI CRITICI:**
- **CS_FIRST_KILL:** La cutscene sull'uccisione di un umano ora si attiva correttamente **solo** dopo aver sconfitto un nemico `humanoid`, risolvendo una grave incoerenza narrativa. È stata introdotta una categorizzazione per tutti i 14 nemici.
- **CS_BEING_WATCHED:** Trigger spostato da un'azione opzionale (riposo) a un evento **automatico e garantito** all'inizio del giorno 3.
- **CS_ASH_LULLABY:** Trigger semplificato e reso **garantito** al primo rifugio notturno dal giorno 3 in poi, assicurando che la rivelazione chiave sulla madre non venga mai mancata.

**NUOVE CUTSCENE CONTESTUALI:**
- **4 nuove cutscene** brevi e potenti per trasformare momenti meccanici in eventi cinematici:
  - `CS_THE_WEIGHT_OF_CHOICE`: Si attiva dopo la prima scelta morale significativa.
  - `CS_CITY_OF_GHOSTS`: Aggiunge un impatto monumentale al primo ingresso in una città.
  - `CS_STRANGERS_REFLECTION`: Collega il raggiungimento del livello 5 a una riflessione sulla trasformazione del personaggio.
  - `CS_THE_BRINK`: Trasforma il momento in cui gli HP scendono sotto il 10% in un power-up narrativo e meccanico, fornendo un **bonus permanente a tutte le statistiche**.

**IMPATTO:**
- **Coerenza Narrativa Assoluta:** I momenti chiave della storia sono ora garantiti e contestualmente corretti.
- **Impatto Emotivo Massimizzato:** Le nuove cutscene arricchiscono l'esperienza, dando peso a scelte, traguardi e momenti di difficoltà.
- **Gameplay e Narrazione Sincronizzati:** Meccaniche come il level-up e la salute bassa diventano parte integrante del racconto.

**Risultato:** Ogni storia viene raccontata, e il peso della sopravvivenza ha ora il peso giusto.

---

#### Novità v1.4.0 (21 Ottobre 2025) - **THE STORY TRANSFORMATION**

Questa versione rappresenta una trasformazione strutturale fondamentale nella concezione narrativa del gioco, preparando il terreno per future espansioni del gameplay.

**REFACTORING ARCHITETTURALE COMPLETO:**
- Trasformazione da "Main Quest" a "Main Story" in tutto il codebase
- Ridefinizione concettuale: la narrazione principale è ora chiaramente identificata come la storia emotiva di Ultimo, separata da future meccaniche di quest attive
- Aggiornamento di tipi, interfacce, store, componenti e servizi per coerenza semantica totale

**ESPANSIONE NARRATIVA:**
- I 12 capitoli della Main Story sono stati riscritti e arricchiti con maggiore profondità emotiva
- Nuova struttura: "Echi della Memoria" che svelano progressivamente il trauma rimosso del protagonista
- Migliore progressione drammatica e connessioni narrative più forti tra gli eventi

**ISTRUZIONI RIDISEGNATE:**
- Schermata istruzioni completamente riscritta come guida professionale alla sopravvivenza
- Organizzata per sezioni tematiche invece di formato lettera
- Maggiore chiarezza per nuovi giocatori, separazione netta tra meccaniche e narrazione

**APERTURA AL FUTURO:**
- La distinzione tra "storia" (narrazione passiva) e "quest" (obiettivi attivi) prepara l'introduzione di vere e proprie quest secondarie
- Sistema pronto per espansioni narrative e ludiche senza conflitti strutturali

**Risultato:** Codebase più chiaro, coerente e pronto per l'evoluzione futura del gioco, con una narrazione emotivamente più profonda e un'architettura che supporta nuove possibilità di gameplay.

---

#### Novità v1.3.2 (20 Ottobre 2025) - **THE MEDICAL OVERHAUL**

Questa versione risolve un problema critico nel sistema di cure degli status, rendendo ogni condizione negativa gestibile strategicamente.

**🏥 SISTEMA CURE BILANCIATO:**
- Nuovi oggetti: Antibiotici (cura MALATO), Erbe Curative (cura INFEZIONE)
- Ogni status ora ha almeno 2 vie di accesso alla cura (crafting + eventi)
- Descrizioni oggetti aggiornate per chiarezza immediata
- Nessuno status è più incurabile

**🧪 RICETTE MEDICHE:**
- Antibiotici: 2x Antibiotici Scaduti + Sostanze Chimiche + Disinfettante (Medicina DC 16)
- Erbe Curative: 2x Funghi Commestibili + Bacche Selvatiche (Medicina DC 12)
- Il crafting medico diventa una via strategica per l'autosufficienza

**🏙️ EVENTI CITTÀ POTENZIATI:**
- Farmacia: Antibiotici validi + nuova opzione frigorifero con Antidoti
- Ospedale Abbandonato (NUOVO): fonte ripetibile di cure avanzate
- Eventi bilanciati per difficoltà e ricompense

**🌲 EVENTI FORESTA/VILLAGGIO:**
- Rifugio Eremita: orto con Erbe Curative
- Clinica Medico: Antibiotici + giardino medicinale
- Cure naturali accessibili con skill Sopravvivenza

**📊 DISTRIBUZIONE LOGICA:**
- Città: Medicine moderne (Antibiotici, Antidoti)
- Foresta: Rimedi naturali (Erbe, Funghi)
- Villaggio: Mix bilanciato di entrambi
- Skill Medicina ora centrale per accesso cure migliori

**Risultato:** Ogni status è curabile. La morte è sempre conseguenza di scelte, mai di impossibilità sistemica.

---

#### ⚡ Novità v1.3.1 (21 Ottobre 2025) - **THE SURVIVAL OVERHAUL**

Questa versione risolve i problemi fondamentali di game design che rendevano il gioco eccessivamente dipendente dalla fortuna. Ora la sopravvivenza è una questione di decisioni strategiche, non di RNG.

**🆕 SISTEMA "RICERCA ATTIVA" (Tasto F):**
- Nuova meccanica proattiva per cercare risorse
- Consuma 30 minuti, check Sopravvivenza CD 10
- Loot specifico per bioma (acqua in pianura, legna in foresta, metallo in città, cibo in villaggio)
- Bonus su tile Fiume: acqua garantita + idratazione immediata
- Il talento Scavenger raddoppia le quantità

**💧 SISTEMA ACQUA RIVOLUZIONATO:**
- **3 nuove ricette:** Purifica Acqua, Raccogli Acqua, Benda di Fortuna
- **4 nuovi materiali:** Acqua Contaminata, Bottiglia Vuota, Straccio Pulito, Nastro Adesivo
- **Starter kit completo:** 2 acqua, 2 cibo, 3 bende, materiali per crafting
- **5 ricette iniziali** (era 3): incluse cure base e gestione acqua
- L'acqua è ora gestibile strategicamente, non dipendente dalla fortuna

**⚔️ LOOT DAI NEMICI:**
- I combattimenti ora droppano materiali e consumabili
- 3 tier di loot (common/uncommon/rare) basati su potenza nemico
- Scavenger ottiene 2 roll invece di 1
- Combattere diventa una scelta strategica valida

**🎯 LOOT RIFUGI AMPLIATO:**
- 15 oggetti diversi nel pool (prima: 10)
- Acqua Contaminata, Stracci Puliti e Bottiglie Vuote aggiunti
- Materiali per crafting più accessibili
- Bilanciamento generale migliorato

**📊 IMPATTO:**
- **Acqua:** Da "quasi introvabile" a "gestibile strategicamente"
- **Crafting:** Da "inaccessibile" a "disponibile dall'inizio"
- **Combattimento:** Da "sempre perdente" a "risk/reward bilanciato"
- **Skill Sopravvivenza:** Da "situazionale" a "centrale"
- **Controllo Giocatore:** Da "passivo" a "proattivo"

**Risultato:** Il gioco rimane molto difficile, ma ora è giusto. La morte è sempre colpa di una decisione sbagliata, mai della RNG.

---

#### 🔧 Novità v1.2.4 (20 Ottobre 2025)

**Correzioni Critiche:**
- **Bug Cutscene:** Risolto errore che causava crash dopo eventi narrativi
- **HP Decimali:** Tutti i valori di salute ora sono numeri interi (era possibile vedere 56.25/98 HP)
- **Sonno Rifugi:** Dormire sempre consentito, anche senza risorse (con penalità)
- **Talenti Doppi:** I talenti già appresi non compaiono più durante il level-up
- **Bussola Morale:** Barra allineamento Lena-Elian ora chiaramente visibile

**Ribilanciamento Risorse:**
- **Acqua:** Drop rate aumentato del 25%, quantità trovata raddoppiata/triplicata
- **Manuali Crafting:** Probabilità aumentata dal ~3% al 20% nei rifugi
- **Nuovo Sistema Loot:** Loot table pesata con 15 oggetti diversi invece di 3

**Sistema Sonno Migliorato:**
- Con risorse sufficienti: 100% HP + 50 fatica (come prima)
- Senza risorse: 30% HP + 25 fatica + status MALATO (nuovo)

**Impatto:** Il gioco rimane sfidante ma elimina situazioni di stallo inevitabili. La gestione delle risorse è ora strategica, non casuale.

---

#### 🔧 Novità v1.2.3 (20 Ottobre 2025)

**🐛 BUGFIX CRITICI - Giocabilità Ripristinata:**

**Sistema Crafting - Bug Bloccante Risolto:**
- ✅ **Fix Crafting Completo:** Risolto bug critico che impediva di craftare oggetti all'inizio del gioco
- ✅ **Messaggio Vuoto:** Corretto "hai creato: ." → "Hai creato: Coltello di Fortuna x1."
- ✅ **Oggetto Non Aggiunto:** Gli oggetti craftati ora appaiono correttamente nell'inventario
- ✅ **Equipaggiamento Disequipaggiato:** Risolto bug che disequipaggiava armi/armature durante il crafting
- ✅ **Validazione Robusta:** Aggiunto error handling per race condition nel caricamento database
- ✅ **Database Sincronizzato:** `public/data/recipes.json` e `talents.json` allineati con versioni corrette

**Sistema Stanchezza - Ribilanciamento Completo:**
- ⚖️ **Quick Rest (R):** Ora recupera 15 fatica (prima: 0) + 20 HP
- ⚖️ **Riposo Diurno Rifugi:** Recupero aumentato a 15 fatica (prima: 10)
- ⚖️ **Riposo Notturno Rifugi:** Ribilanciato a 50 fatica (prima: 100) per creare scelte strategiche
- ⚖️ **Cibo e Bevande:** Ora recuperano 10 fatica + messaggio "Ti senti meno stanco"
- ⚖️ **Status ESAUSTO:** Soglia corretta a 85 fatica (prima: 80) per apparire in situazioni critiche
- ⚖️ **Sistema Sostenibile:** 16 ore esplorazione ora gestibili con riposi brevi e alimentazione

**Menu Rifugio - UX Fix:**
- ✅ **Cursore Menu:** Dopo aver dormito fino all'alba, il menu si aggiorna correttamente e il cursore torna alla prima opzione
- ✅ **Opzioni Dinamiche:** "Dormi fino all'alba" → "Aspetta un'ora" quando diventa giorno

**📊 Analisi Combattimenti:**
- ℹ️ **Sistema RNG Verificato:** Probabilità 7% per step è corretta (20% encounter × 35% combat)
- ℹ️ **Cooldown:** 90-240 minuti tra encounter per evitare spam
- ℹ️ **Normalità:** 10-15 step senza combattimenti = comportamento atteso

**📚 Documentazione Tecnica Completa:**
- 📄 **log/v1.2.3.md:** Documentazione completa della sessione di debugging con analisi tecnica dettagliata, changelog e test consigliati

**🎯 Impatto Gameplay:**
- Sistema crafting completamente funzionante fin dall'inizio
- Gestione fatica strategica e sostenibile senza grind obbligatorio
- UI rifugi più intuitiva e coerente
- Zero bug bloccanti residui

#### 🎯 Novità v1.2.0 (Ottobre 2025)

**Espansione Eventi (+741%):**
- **88 nuovi eventi** distribuiti su tutti i biomi
- Pianura: 25 eventi totali (23 nuovi)
- Foresta: 25 eventi totali (22 nuovi)  
- Città: 26 eventi totali (23 nuovi + 1 speciale)
- Villaggio: 25 eventi totali (21 nuovi)

**Nuovi Nemici (+240%):**
- **12 nuovi avversari** con tattiche uniche analizzabili
- Distribuzione bilanciata per bioma (Pianura, Foresta, Città)
- HP: 20-60, AC: 10-15, XP: 60-120
- Ogni nemico con descrizioni narrative immersive

**Sistema Talenti Espanso (+233%):**
- **7 nuovi talenti** (totale: 10)
- 3 tier di progressione (Livello 2, 5, 8)
- Bonus strategici non solo numerici
- Synergy con diversi playstyle (stealth, combat, survival)

**Crafting Completo (+233%):**
- **14 nuove ricette** (totale: 20)
- Armi, armature, consumabili, utility
- 2 nuovi manuali aggiunti e distribuiti
- Tutti i materiali trovabili nell'esplorazione

**Nuove Cutscene (+100%):**
- **4 cutscene narrative emotive** (17 pagine totali)
- CS_FIRST_KILL: Riflessione sulla violenza necessaria
- CS_HALF_JOURNEY: Solitudine e dubbio esistenziale
- CS_MOTHERS_ECHO: Scoperta del nome della madre (Lena)
- CS_POINT_OF_NO_RETURN: Scelta morale finale prima della destinazione

**Sistema Status Completo (+166%):**
- **5 nuovi status** con meccaniche uniche (totale: 8)
- IPOTERMIA, ESAUSTO, AFFAMATO, DISIDRATATO, INFEZIONE
- Effetti su skill checks e HP
- Auto-applicazione/rimozione basata su condizioni

**Slot Armor Completo (+50%):**
- **4 nuove armature per legs** (common → rare)
- Sistema multi-slot (head, chest, legs)
- AC ora somma tutti gli slot
- Progressione naturale di equipaggiamento

**Varietà Narrativa (+200%):**
- **60+ nuove descrizioni combattimento**
- Attacchi, colpi, miss, morti nemici
- Ogni combattimento narrativamente unico

**Bilanciamento Progressione:**
- XP requisiti ridotti ~50-70% (livello 2-6)
- XP da esplorazione: 1 → 3 (+200%)
- Requisiti day 7 ridotti per accessibilità contenuti
- Easter eggs: 2% → 7% (+250%)

**Bug Fix Critici:**
- ✅ Crafting rifugio (error handling robusto)
- ✅ Stage 11 main quest (trigger dinamico `nearEnd`)
- ✅ 2 manuali crafting incompleti aggiunti
- ✅ Sistema font e UI ottimizzati (font -40%, layout compatto)
- ✅ Equipment panel completo con visualizzazione 4 slot
- ✅ Tutti i pannelli visibili senza overflow

**Risultato:** Il gioco ora offre **~100 ore di contenuti potenziali** con rigiocabilità massima, progressione bilanciata e narrativa emotivamente profonda.

#### ✨ Novità v1.2.2 (19 Ottobre 2025)

**UX Critical Fixes - Leggibilità Interfaccia:**
- ✅ **Font Interfaccia di Gioco Aumentati del ~69%:** Pannelli Sopravvivenza, Inventario, Equipaggiamento, Statistiche e Diario finalmente leggibili
- ✅ **Font Schermata Presentazione Aumentati del 20%:** Disclaimer, credits e informazioni perfettamente visibili
- ✅ **Fix CSS Loading:** Risolto problema critico che impediva il caricamento di `src/index.css` (mancava import in `index.tsx`)
- ✅ **Sistema Font Modulare:** Override CSS specifici solo per GameScreen, altre schermate invariate
- ✅ **Coerenza Visiva:** Colore testo "Generazione statistiche" ora verde (era bianco)
- ✅ **Cursore Stabile:** Fix cursore lampeggiante in creazione personaggio (nessuno spostamento testo)

**Save System - Export Feature Complete:**
- ✅ **Esportazione Salvataggi Keyboard-Driven:** Sistema completo per scaricare slot in file JSON
- ✅ **Modalità Export Dedicata:** Interfaccia "═══ ESPORTA SLOT ═══" per selezione intuitiva dello slot
- ✅ **Menu Contestuali Differenziati:**
  - Menu SALVA PARTITA → "Esporta Slot in File JSON"
  - Menu CARICA PARTITA → "Importa da File JSON"
- ✅ **Keybindings Completi:** [E] Esporta, [I] Importa, [D] Elimina, [A] Azioni - tutto da tastiera
- ✅ **Formato File Descrittivo:** `TSP_Save_Slot1_Lv5_Day10_2025-10-19.json`
- ✅ **100% Keyboard-First:** Nessun mouse richiesto, coerente con filosofia del gioco

**Backup e Documentazione:**
- 📚 **CONFIGURAZIONE-FONT-FUNZIONANTE.md:** Documentazione tecnica completa della soluzione
- 📚 **ROLLBACK-FONT-GAMESCREEN.md:** Guida per tornare indietro in caso di problemi
- 💾 **3 Backup Incrementali:** `.backup`, `.WORKING_BACKUP`, `.QUASI_PERFETTA`

**Impatto Utente:**
- 🎮 Esperienza di gioco trasformata: da difficile a leggibile a perfettamente accessibile
- 💾 Sistema backup completo: salvataggi interni + export JSON
- ⌨️ Accessibilità totale: 100% keyboard-driven senza eccezioni
- 🔒 Sicurezza dati: possibilità di backup manuale preventivo

#### 🏆 Novità v1.2.1 (19 Ottobre 2025)

**UI/UX Improvements:**
- ✅ **Schermata Disclaimer Ottimizzata:** Font ridotto del 25%, box allargato, firma visibile senza scroll
- ✅ **Cursore Lampeggiante Fixato:** Eliminato fastidioso spostamento del testo (opacity invece di conditional rendering)
- ✅ **Istruzioni Aggiornate:** Testo completamente riscritto con meccaniche v1.2.0, organizzato in sezioni tematiche (~+150% contenuti)

**Save System v2.0.0 - Major Overhaul:**
- ✅ **5 Slot Save** (era 3) con metadata dettagliati
- ✅ **Export/Import JSON** per backup e trasferimento tra dispositivi
- ✅ **Migrazione Automatica** da versioni precedenti (1.0.0 → 2.0.0)
- ✅ **Validazione Robusta:** Multi-layer validation con error handling completo
- ✅ **UI Migliorata:** Opzione "Importa da File JSON" sempre visibile, azioni Export/Delete con tasto [A]
- ✅ **Messaggi di Errore Specifici:** Feedback chiaro per ogni tipo di problema

**Global Trophy System - Feature Rivoluzionaria:**
- ✅ **Persistenza Permanente:** Trofei salvati nel browser indipendentemente dai salvataggi
- ✅ **Nessuna Perdita:** I trofei restano per sempre, anche senza salvare o eliminando i file
- ✅ **Merge Automatico:** Caricando un save, i trofei si unificano con quelli globali
- ✅ **Export/Import Backup:** Condivisione e protezione dei progressi trofei

**Impatto Utente:**
- 🎮 Esperienza più sicura e flessibile
- 💾 3 metodi di backup dati (5 slot + JSON + trofei globali)
- 🏆 Motivazione aumentata (nessun trofeo viene mai perso)
- 🔄 Rigiocabilità massimizzata (accumulo trofei tra run diverse)

## ⚠️ ATTENZIONE CRITICA PER SVILUPPATORI

### 🚨 NON AGGIORNARE MAI TAILWIND CSS

**Questo progetto usa Tailwind CSS v4.1.14 tramite CDN.**

**MOTIVO:** Tailwind v4 ha un'architettura completamente diversa da v3 e richiede una configurazione PostCSS complessa che è incompatibile con il setup attuale. Qualsiasi tentativo di:
- ❌ Aggiornare Tailwind a versioni successive
- ❌ Rimuovere il CDN per usare build locale
- ❌ Installare `@tailwindcss/postcss`

...causerà la **perdita completa del layout, stili e funzionalità visive**.

**SE NECESSARIO** ottimizzare per produzione:
1. Creare branch separato per test
2. Effettuare downgrade a Tailwind CSS v3.x
3. Testare approfonditamente TUTTO prima di merge
4. Mantenere backup del codice funzionante

**REGOLA D'ORO:** "Don't fix what isn't broken" - Il CDN funziona perfettamente.

---

**Novità v1.1.3 (19 Ottobre 2025):**
- 🐛 **Fix Critico:** Risolto errore "Database oggetti vuoto" in build preview
- 🔧 **Path JSON:** Corretti tutti i path da `./data/` a `/data/` per compatibilità build
- 🎨 **Rollback CSS:** Ripristinato CDN Tailwind + CSS inline dopo tentativo fallito di ottimizzazione
- 🛠️ **Debug Tools:** Aggiunto logging dettagliato per diagnostica futura
- ✅ **Layout:** Completamente ripristinato (font, colori, animazioni, mappa tileset)
- 📚 **Documentazione:** Changelog epico della sessione di debugging più lunga della storia

**Novità v1.1.2 (19 Ottobre 2025):**
- 🔒 **Security:** Rimosso potenziale rischio security (GEMINI_API_KEY)
- 🎨 **Branding:** Favicon personalizzata con logo del gioco
- 🌐 **SEO:** Meta tags ottimizzati per condivisione e ricerca
- 🛡️ **Robustezza:** Sistema di error handling con UI dedicata
- 📦 **Deploy:** Configurazione base path per deploy flessibile

**Novità v1.1.1 (19 Ottobre 2025):**
- ✅ **Fix Critico:** Risolto errore import che impediva l'avvio del gioco
- ✅ **Fix Rifugi:** I rifugi ora funzionano correttamente con tutte le opzioni
- ✅ **Fix Crafting:** Eliminato crash dello schermo nero nel banco da lavoro
- ✅ **Stabilità:** Zero crash durante gameplay normale
- 📚 **Documentazione:** Analisi completa per distribuzione web inclusa

Il progetto continuerà a essere aggiornato con fix e bilanciamenti basati sui feedback. Per suggerimenti o segnalazioni di bug, è possibile scrivere a: `runtimeradio@gmail.com`.

Le prossime, importanti implementazioni previste sono:

#### 1. Gestione del Peso e Ingombro (Encumbrance)
*   **Il Concetto:** Gli oggetti hanno già una proprietà `weight`, ma non ha ancora un impatto meccanico. Verrà introdotto un limite di peso trasportabile, calcolato in base alla statistica **Forza** del personaggio.
*   **L'Impatto sul Gameplay:**
    *   **Scelte Difficili:** L'inventario non sarà più solo una questione di "slot", ma di peso. "Vale la pena portare con sé questa pesante clava d'osso, o è meglio prendere più cibo e medicine?".
    *   **Progressione Gratificante:** Aumentare la Forza diventerà ancora più desiderabile. Trovare uno zaino migliore diventerà un momento di svolta nel gioco.
    *   **Dinamiche Emergenti:** Un giocatore sovraccarico potrebbe muoversi più lentamente o consumare più risorse, creando un ulteriore livello di strategia.

#### 2. Raccolta Attiva di Risorse e Caccia
*   **Il Concetto:** Verrà introdotta un'azione di "Ricerca Attiva" eseguibile in qualsiasi casella della mappa per cercare risorse.
*   **L'Impatto sul Gameplay:**
    *   **Ruolo della Sopravvivenza:** L'abilità **Sopravvivenza** diventerà centrale, determinando il successo della ricerca in base al bioma.
    *   **Risorse Contestuali:** Un successo in una foresta potrebbe fruttare legna o bacche. Vicino a un fiume, potrebbe permettere di purificare dell'acqua. In una pianura, di cacciare piccola selvaggina.
    *   **Rischio vs. Ricompensa:** L'azione consumerà tempo e potrebbe avere una piccola probabilità di innescare un incontro negativo.

#### 3. Interazione Ambientale in Combattimento
*   **Il Concetto:** Il bioma in cui avviene lo scontro offrirà opzioni tattiche uniche.
*   **L'Impatto sul Gameplay:**
    *   **Foresta:** Aggiungerà un'opzione "Nasconditi tra gli alberi" (test di Furtività per evitare il prossimo attacco).
    *   **Città/Rovine:** Aggiungerà un'opzione "Cerca Copertura" (aumenta temporaneamente la Classe Armatura).
    *   **Pianura:** L'assenza di coperture potrebbe rendere la fuga più difficile.
    *   **Immersione Totale:** L'ambiente diventerà una risorsa (o un ostacolo) attiva anche durante gli scontri.

### Configurazione

1.  **Clonare il repository:**
    ```bash
    git clone https://github.com/SimonePizzi/the-safe-place-chronicles.git
    ```
2.  **Installare le dipendenze:**
    ```bash
    npm install
    ```
3.  **Avviare il server di sviluppo:**
    ```bash
    npm run dev
    ```
Il gioco sarà disponibile all'indirizzo `http://localhost:3000`.

### Aggiunta di Nuovi Contenuti

Il gioco è progettato per essere facilmente espandibile. Tutti i dati di gioco, come oggetti, ricette, eventi e nemici, sono archiviati in file JSON nella directory `data`.

#### Struttura dei Dati

*   **Oggetti:** `data/items/*.json` - I file degli oggetti sono separati per categoria (armi, armature, consumabili, ecc.).
*   **Ricette:** `data/recipes.json`
*   **Eventi:** `data/events.json`
*   **Nemici:** `data/enemies.json`
*   **Trama Principale:** `data/main_quest.json`
*   **Scene d'intermezzo:** `data/cutscenes.json`
*   **Trofei:** `data/trophies.json`

#### Convalida dei Dati

Per garantire la coerenza e prevenire errori, è disponibile uno script di convalida. Dopo aver aggiunto o modificato i file di dati, esegui il seguente comando per verificare la presenza di problemi:

```bash
npm run validate:data
```

Lo script verificherà che tutti i file di dati abbiano il formato corretto e che tutti gli ID degli oggetti a cui si fa riferimento esistano.

### 📂 Documentazione di Sviluppo

Tutta la documentazione relativa al processo di sviluppo, al game design e all'analisi tecnica è archiviata nella cartella `/docs`.

*   **[Changelog delle Versioni](/docs/changelog/)**: Contiene i log dettagliati per ogni versione del gioco.
*   **[Documenti di Game Design](/docs/design/)**: Include le analisi approfondite delle meccaniche di gioco, delle quest e della roadmap di sviluppo dei contenuti.
*   **[Documentazione Tecnica](/docs/technical/)**: Raccoglie i report di analisi del codice, le guide per i fix e le note sull'architettura del software.

### Ringraziamenti

Un ringraziamento speciale a Michela, mia moglie, per la pazienza e il sostegno, a PixelDebh, Giuseppe "MagnetarMan" Pugliese e al Prof. Leonardo Boselli per aver creduto e dato spazio a questa visione. Un grazie speciale anche a tutti gli amici e i membri del gruppo Telegram "Progetto GDR Anni 80 (WIP)".