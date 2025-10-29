# The Safe Place Chronicles: The Echo of the Journey (v1.4.5)

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

### Stato del Progetto e Sviluppi Futuri

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

### Ringraziamenti

Un ringraziamento speciale a Michela, mia moglie, per la pazienza e il sostegno, a PixelDebh, Giuseppe "MagnetarMan" Pugliese e al Prof. Leonardo Boselli per aver creduto e dato spazio a questa visione. Un grazie speciale anche a tutti gli amici e i membri del gruppo Telegram "Progetto GDR Anni 80 (WIP)".