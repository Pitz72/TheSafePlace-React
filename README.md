# The Safe Place Chronicles: The Echo of the Journey (v1.2.0)

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
*   **Missione Principale ("Main Quest"):** Una trama completa in 12 capitoli che guida il giocatore in un viaggio alla scoperta della verità. Gli eventi sono attivati da trigger organici legati al gameplay e rispettano il ciclo giorno/notte per una maggiore immersione (un ricordo del sole non si attiverà in piena notte, a meno che non sia tematicamente appropriato).
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
*   **Salvataggio e Caricamento Robusto:** Supporto a 5 slot di salvataggio, con funzionalità di import/export dei file di salvataggio per la massima portabilità.
*   **Game Over Contestuale:** La morte del personaggio non è solo la fine della partita, ma viene presentata con una schermata dedicata che varia in base alla causa del decesso (combattimento, fame, malattia, ecc.), con l'aggiunta di una rara schermata easter egg per un tocco di umorismo nero.

#### 8. Sistema di Trofei e Obiettivi a Lungo Termine
*   **50 Trofei Unici:** È stato implementato un sistema di achievement completo con 50 trofei che coprono ogni aspetto del gioco: Missione Principale, Esplorazione, Combattimento, Sopravvivenza, Crafting, Sviluppo del Personaggio e Segreti.
*   **Tracciamento dei Progressi:** Una nuova schermata "Trofei", accessibile dal menu principale, permette al giocatore di visualizzare i traguardi sbloccati e quelli ancora nascosti.
*   **Feedback Immediato:** Lo sblocco di un trofeo viene celebrato in tempo reale con una notifica speciale nel diario di viaggio.
*   **Rigiocabilità:** Il sistema è progettato per premiare la maestria, incoraggiare stili di gioco differenti e aumentare significativamente la longevità e la rigiocabilità del titolo.

### Come Giocare

L'interazione avviene interamente tramite tastiera:
*   **Movimento/Navigazione:** `W, A, S, D` o `Frecce Direzionali`.
*   **Inventario:** `I`.
*   **Riposo Rapido:** `R`.
*   **Level Up:** `L` (quando disponibile).
*   **Interazione:** `Invio` per confermare, `ESC` per annullare/indietro.

### Stato del Progetto e Sviluppi Futuri

**Versione Corrente: v1.2.0** - Espansione Contenuti Massiva

Con la versione 1.0.3, il prototipo ha raggiunto la sua **piena completezza narrativa e meccanica**. La versione 1.2.0 introduce un'espansione massiva di contenuti con:

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