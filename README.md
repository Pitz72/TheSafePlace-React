# The Safe Place Chronicles: The Echo of the Journey (v1.0.3)

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

Con la versione 1.0.3, il prototipo ha raggiunto la sua **piena completezza narrativa e meccanica**. Il ciclo di gioco è robusto, bilanciato e l'arco narrativo è giocabile dall'inizio alla fine.

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

### Ringraziamenti

Un ringraziamento speciale a Michela, mia moglie, per la pazienza e il sostegno, a PixelDebh, Giuseppe "MagnetarMan" Pugliese e al Prof. Leonardo Boselli per aver creduto e dato spazio a questa visione. Un grazie speciale anche a tutti gli amici e i membri del gruppo Telegram "Progetto GDR Anni 80 (WIP)".