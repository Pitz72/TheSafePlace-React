import { AttributeName, SkillDefinition, SkillName, JournalEntryType } from "./types";

export const GAME_VERSION = '1.9.9.6';

export const BOOT_TEXT = [
  'Runtime Radio BIOS v1.02',
  'Copyright (C) 1983 Runtime Radio Corp.',
  '',
  'CPU: R-8088 @ 4.77MHz',
  'Memory Test: 640K OK',
  '',
  'Checking drives...',
  'Drive A: Floppy Disk',
  'Drive C: Hard Disk',
  '',
  'Booting from C:...',
  'Starting RR-DOS...',
  '',
  'HIMEM is testing extended memory...done.',
  'RR-DOS Mouse Driver installed.',
  'RR-DOS CD-ROM Driver installed.',
  'Sound Blaster 8 card detected at A220 I5 D1.',
  '',
  'C:\\> autoexec.bat',
  'C:\\> echo off',
  'C:\\> load game.exe',
  'Loading TSP Chronicles...',
];

export const DONOR_NAMES = [
  'Paolo Nicoletti',
  'Michele Bancheri',
  'Ennio Vitelli',
  'Massimiliano Libralesso',
  'Vincenzo Falce',
  'Matteo Garza',
  'Mattia Seppolini',
  'Ruggero Celva',
  'Monica Piu',
  'Adriana Coppe',
  'Gabriel Mele',
  'Claudio Marro Filosa',
  'Angelo Mastrogiacomo',
  'Tommaso Sciara',
  'Samuele Palazzolo'
];

export const MENU_ITEMS = [
  "Nuova Partita",
  "Continua Partita",
  "Carica Partita",
  "Storia",
  "Istruzioni",
  "Opzioni",
  "Trofei",
  "Esci",
];

export const INSTRUCTIONS_TEXT = `═══ THE SAFE PLACE CHRONICLES - GUIDA ALLA SOPRAVVIVENZA ═══

Benvenuto, viaggiatore. Questo mondo non è più quello che era. La Guerra Inespressa ha lasciato solo rovine e silenzio. Ma tu hai gli strumenti per sopravvivere.

═══ MOVIMENTO E ESPLORAZIONE ═══

• WASD o FRECCE DIREZIONALI: Muoviti sulla mappa
• La 'E' sulla mappa indica il tuo obiettivo: The Safe Place
• Ogni passo consuma tempo e risorse vitali (Sazietà, Idratazione)
• Esplora i biomi: Pianure, Foreste, Città, Villaggi, Fiumi
• Alcuni tile (M - Montagna) sono invalicabili

═══ GESTIONE RISORSE ═══

• HP (Punti Vita): La tua sopravvivenza. Monitora costantemente.
• SAZIETÀ: Il cibo è vita. Se scende a 0, morirai di fame.
• IDRATAZIONE: L'acqua è essenziale. Trova fonti o filtra acqua contaminata.
• FATICA: Accumuli stanchezza muovendoti. Riposa per recuperare.
• CONDIZIONI: Ferite, malattie, veleni, ipotermia ti indeboliranno. Cura gli status negativi con oggetti specifici.

═══ TEMPO E METEO ═══

• Il tempo passa ad ogni azione: camminare, riposare, cercare, craftare
• NOTTE (20:00 - 6:00): Molto pericolosa. Subisci danni costanti se sei all'aperto.
• RIFUGI (R sulla mappa): Trova riparo prima del tramonto. Usali per dormire, riposare, cercare risorse e craftare.
• METEO DINAMICO: Pioggia e tempeste rallentano i movimenti e causano danni.

═══ AZIONI PRINCIPALI ═══

• [I] INVENTARIO: Gestisci oggetti, equipaggia armi/armature, usa consumabili
• [R] RIPOSO RAPIDO: Recupera un po' di HP e fatica (1 volta al giorno)
• [F] RICERCA ATTIVA: Cerca risorse nell'area (CD Sopravvivenza 10, 30 min)
• [L] LEVEL UP: Quando disponibile, scegli attributo e talento
• [ESC] PAUSA: Accedi al menu in-game, salva/carica partita

═══ INVENTARIO E EQUIPAGGIAMENTO ═══

• Peso massimo limitato (basato su Forza)
• ARMI: Equipaggiabili, si degradano. Riparale o smontale per materiali.
• ARMATURE: Testa, Petto, Gambe. Aumentano la Classe Armatura (AC).
• CONSUMABILI: Cibo, acqua, medicine. Alcuni curano status specifici.
• MANUALI: Trovane di nuovi per sbloccare ricette di crafting.

═══ CRAFTING ═══

• Nei RIFUGI troverai BANCHI DA LAVORO
• Crea armi, armature, medicine, strumenti di sopravvivenza
• Ogni ricetta richiede: Materiali, Skill (DC), Tempo
• Impara nuove ricette trovando Manuali nel mondo

═══ COMBATTIMENTO ═══

• Combatti nemici che incontri esplorando
• Azioni: ATTACCA, ANALIZZA (svela debolezze), USA OGGETTO, FUGGI
• Analizzando un nemico scopri tattiche speciali utilizzabili
• La fuga è risolta con test di abilità (può fallire!)
• Ogni vittoria dona XP

═══ CRESCITA DEL PERSONAGGIO ═══

• LIVELLI: Ottieni XP da esplorazione, eventi, combattimenti
• TALENTI: Ad ogni level-up scegli un talento che definisce il tuo stile
  - Livello 2: Talenti base (es. Scavenger, Guerrigliero)
  - Livello 5: Talenti avanzati
  - Livello 8: Talenti master
• ATTRIBUTI: Aumenta FOR, DES, COS, INT, SAG, CAR ad ogni livello
• ABILITÀ: 18 skill basate sugli attributi. Allena quelle che usi di più.

═══ ALLINEAMENTO MORALE ═══

• Le tue scelte influenzano l'allineamento: LENA (Compassione) vs ELIAN (Pragmatismo)
• Raggiungendo soglie alte sblocchi bonus passivi permanenti
• Alcune scelte hanno conseguenze immediate o a lungo termine

═══ CONSIGLI DI SOPRAVVIVENZA ═══

• Salva spesso (5 slot disponibili + export/import JSON)
• Esplora durante il giorno, riposati nei Rifugi di notte
• Usa la Ricerca Attiva [F] per trovare risorse specifiche per bioma
• Pianifica i livelli: alcuni talenti sono fondamentali
• Non tutti i combattimenti vanno affrontati. Fuggire è una strategia valida.
• L'acqua è rara: filtra acqua contaminata o cerca fiumi
• Le condizioni negative possono ucciderti. Cura sempre MALATO, AVVELENATO, INFEZIONE.

═══ MAIN STORY ═══

• Durante il viaggio vivrai "Echi della Memoria": flashback narrativi che svelano il passato
• Questi eventi sono attivati da trigger naturali (passi, giorni, posizione)
• Non puoi perderli: si attivano automaticamente quando le condizioni sono soddisfatte
• La tua storia personale è parte integrante del viaggio

═══ SEGRETI E TROFEI ═══

• 50 TROFEI da sbloccare, persistenti tra le partite
• Eventi segreti estremamente rari nascosti nel mondo
• Oggetti unici trovabili solo in determinate condizioni
• La mappa nasconde più di quanto sembri...

Ora vai, viaggiatore. The Safe Place ti aspetta a Est.
Sopravvivi. Scopri la verità. E forse, un giorno, capirai.`;

// ═══════════════════════════════════════════════════════════════════════════
// INSTRUCTIONS_PAGES - Sistema di paginazione per schermata Istruzioni
// STATO: ✅ DEFINITIVO (29 Ottobre 2025)
//
// 14 pagine ottimizzate per leggibilità con navigazione keyboard-only.
// Testo completo al 100%, formattazione compatta, nessun overflow.
// NON MODIFICARE senza testare attentamente il layout visivo.
// ═══════════════════════════════════════════════════════════════════════════
export const INSTRUCTIONS_PAGES = [
  `═══ THE SAFE PLACE CHRONICLES ═══
GUIDA ALLA SOPRAVVIVENZA

Benvenuto, viaggiatore. Questo mondo non è più quello che era. La Guerra Inespressa ha lasciato solo rovine e silenzio. Ma tu hai gli strumenti per sopravvivere.`,

  `═══ MOVIMENTO E ESPLORAZIONE ═══

• WASD o FRECCE DIREZIONALI: Muoviti sulla mappa
• La 'E' sulla mappa indica il tuo obiettivo: The Safe Place
• Ogni passo consuma tempo e risorse vitali (Sazietà, Idratazione)
• Esplora i biomi: Pianure, Foreste, Città, Villaggi, Fiumi
• Alcuni tile (M - Montagna) sono invalicabili`,

  `═══ GESTIONE RISORSE ═══

• HP (Punti Vita): La tua sopravvivenza. Monitora costantemente.
• SAZIETÀ: Il cibo è vita. Se scende a 0, morirai di fame.
• IDRATAZIONE: L'acqua è essenziale. Trova fonti o filtra acqua contaminata.
• FATICA: Accumuli stanchezza muovendoti. Riposa per recuperare.
• CONDIZIONI: Ferite, malattie, veleni, ipotermia ti indeboliranno. Cura gli status negativi con oggetti specifici.`,

  `═══ TEMPO E METEO ═══

• Il tempo passa ad ogni azione: camminare, riposare, cercare, craftare
• NOTTE (20:00 - 6:00): Molto pericolosa. Subisci danni costanti se sei all'aperto.
• RIFUGI (R sulla mappa): Trova riparo prima del tramonto. Usali per dormire, riposare, cercare risorse e craftare.
• METEO DINAMICO: Pioggia e tempeste rallentano i movimenti e causano danni.`,

  `═══ AZIONI PRINCIPALI ═══

• [I] INVENTARIO: Gestisci oggetti, equipaggia armi/armature, usa consumabili
• [R] RIPOSO RAPIDO: Recupera un po' di HP e fatica (1 volta al giorno)
• [F] RICERCA ATTIVA: Cerca risorse nell'area (CD Sopravvivenza 10, 30 min)
• [L] LEVEL UP: Quando disponibile, scegli attributo e talento
• [ESC] PAUSA: Accedi al menu in-game, salva/carica partita`,

  `═══ INVENTARIO E EQUIPAGGIAMENTO ═══

• Peso massimo limitato (basato su Forza)
• ARMI: Equipaggiabili, si degradano. Riparale o smontale per materiali.
• ARMATURE: Testa, Petto, Gambe. Aumentano la Classe Armatura (AC).
• CONSUMABILI: Cibo, acqua, medicine. Alcuni curano status specifici.
• MANUALI: Trovane di nuovi per sbloccare ricette di crafting.`,

  `═══ CRAFTING ═══

• Nei RIFUGI troverai BANCHI DA LAVORO
• Crea armi, armature, medicine, strumenti di sopravvivenza
• Ogni ricetta richiede: Materiali, Skill (DC), Tempo
• Impara nuove ricette trovando Manuali nel mondo`,

  `═══ COMBATTIMENTO ═══

• Combatti nemici che incontri esplorando
• Azioni: ATTACCA, ANALIZZA (svela debolezze), USA OGGETTO, FUGGI
• Analizzando un nemico scopri tattiche speciali utilizzabili
• La fuga è risolta con test di abilità (può fallire!)
• Ogni vittoria dona XP`,

  `═══ CRESCITA DEL PERSONAGGIO ═══

• LIVELLI: Ottieni XP da esplorazione, eventi, combattimenti
• TALENTI: Ad ogni level-up scegli un talento che definisce il tuo stile
  - Livello 2: Talenti base (es. Scavenger, Guerrigliero)
  - Livello 5: Talenti avanzati
  - Livello 8: Talenti master
• ATTRIBUTI: Aumenta FOR, DES, COS, INT, SAG, CAR ad ogni livello
• ABILITÀ: 18 skill basate sugli attributi. Allena quelle che usi di più.`,

  `═══ ALLINEAMENTO MORALE ═══

• Le tue scelte influenzano l'allineamento: LENA (Compassione) vs ELIAN (Pragmatismo)
• Raggiungendo soglie alte sblocchi bonus passivi permanenti
• Alcune scelte hanno conseguenze immediate o a lungo termine`,

  `═══ CONSIGLI DI SOPRAVVIVENZA ═══

• Salva spesso (5 slot disponibili + export/import JSON)
• Esplora durante il giorno, riposati nei Rifugi di notte
• Usa la Ricerca Attiva [F] per trovare risorse specifiche per bioma
• Pianifica i livelli: alcuni talenti sono fondamentali`,

  `═══ CONSIGLI DI SOPRAVVIVENZA (2) ═══

• Non tutti i combattimenti vanno affrontati. Fuggire è una strategia valida.
• L'acqua è rara: filtra acqua contaminata o cerca fiumi
• Le condizioni negative possono ucciderti. Cura sempre MALATO, AVVELENATO, INFEZIONE.`,

  `═══ MAIN STORY ═══

• Durante il viaggio vivrai "Echi della Memoria": flashback narrativi che svelano il passato
• Questi eventi sono attivati da trigger naturali (passi, giorni, posizione)
• Non puoi perderli: si attivano automaticamente quando le condizioni sono soddisfatte
• La tua storia personale è parte integrante del viaggio`,

  `═══ SEGRETI E TROFEI ═══

• 50 TROFEI da sbloccare, persistenti tra le partite
• Eventi segreti estremamente rari nascosti nel mondo
• Oggetti unici trovabili solo in determinate condizioni
• La mappa nasconde più di quanto sembri...

Ora vai, viaggiatore. The Safe Place ti aspetta a Est. Sopravvivi. Scopri la verità. E forse, un giorno, capirai.`
];

// ═══════════════════════════════════════════════════════════════════════════
// STORY_PAGES - Sistema di paginazione per schermata Storia
// STATO: ✅ DEFINITIVO (29 Ottobre 2025)
//
// 5 pagine narrative con testo completo al 100% (nessun taglio o riassunto).
// Divisione naturale per "respiro" narrativo, formattazione perfetta.
// NON MODIFICARE - Approvato come definitivo.
// ═══════════════════════════════════════════════════════════════════════════
export const STORY_PAGES = [
  `═══════════════════════════════
L'ECO DEL SILENZIO
═══════════════════════════════

Il mondo che Ultimo conosceva era fatto di sussurri e acciaio freddo, di lezioni impartite da un padre con occhi stanchi ma mani salde. 

Diciassette anni vissuti all'ombra di una catastrofe che aveva inghiottito il passato, lasciando solo echi distorti: la "Guerra Inespressa", il "Grande Silenzio".`,

  `Della madre, Ultimo conservava solo un calore sbiadito nel petto, un nome quasi dimenticato. 

Il "prima" era una favola raccontata a bassa voce, un sogno di cieli azzurri e città luminose, così diverso dai grigiori malati e dalle rovine scheletriche che ora graffiavano l'orizzonte dell'Europa Centrale.`,

  `Suo padre gli aveva insegnato a leggere i segni del vento carico di polveri tossiche, a distinguere il fruscio di una bestia mutata da quello innocuo delle lamiere contorte, a trovare acqua dove sembrava esserci solo aridità. 

Ogni giorno era una lezione di sopravvivenza, ogni notte un monito sulla fragilità della vita.`,

  `Poi, anche il padre era partito. 

Una missione avvolta nel mistero, un addio affrettato con la promessa di un ritorno che tardava troppo. 

Le scorte lasciate con cura si assottigliavano, e con esse la speranza. 

Rimaneva solo un messaggio frammentario, l'ultima eco della voce paterna: 

"...trova il Safe Place, Ultimo. È la nostra unica possibilità..."`,

  `Ora, il silenzio è il suo unico compagno. 

Davanti a lui, un viaggio disperato attraverso un continente irriconoscibile, armato solo degli insegnamenti paterni e di una mappa verso un luogo che potrebbe essere leggenda, trappola, o forse, davvero, salvezza. 

Il peso della solitudine è grande, ma la volontà di onorare la memoria del padre, e la primordiale necessità di vivere, lo spingono a muovere il primo passo in quel mondo ostile. 

The Safe Place attende, da qualche parte oltre la desolazione.`
];

export const STORY_TEXT = `L'Eco del Silenzio

Il mondo che Ultimo conosceva era fatto di sussurri e acciaio freddo, di lezioni impartite da un padre con occhi stanchi ma mani salde. Diciassette anni vissuti all'ombra di una catastrofe che aveva inghiottito il passato, lasciando solo echi distorti: la "Guerra Inespressa", il "Grande Silenzio".

Della madre, Ultimo conservava solo un calore sbiadito nel petto, un nome quasi dimenticato. Il "prima" era una favola raccontata a bassa voce, un sogno di cieli azzurri e città luminose, così diverso dai grigiori malati e dalle rovine scheletriche che ora graffiavano l'orizzonte dell'Europa Centrale.

Suo padre gli aveva insegnato a leggere i segni del vento carico di polveri tossiche, a distinguere il fruscio di una bestia mutata da quello innocuo delle lamiere contorte, a trovare acqua dove sembrava esserci solo aridità. Ogni giorno era una lezione di sopravvivenza, ogni notte un monito sulla fragilità della vita.

Poi, anche il padre era partito. Una missione avvolta nel mistero, un addio affrettato con la promessa di un ritorno che tardava troppo. Le scorte lasciate con cura si assottigliavano, e con esse la speranza. Rimaneva solo un messaggio frammentario, l'ultima eco della voce paterna: "...trova il Safe Place, Ultimo. È la nostra unica possibilità..."

Ora, il silenzio è il suo unico compagno. Davanti a lui, un viaggio disperato attraverso un continente irriconoscibile, armato solo degli insegnamenti paterni e di una mappa verso un luogo che potrebbe essere leggenda, trappola, o forse, davvero, salvezza. Il peso della solitudine è grande, ma la volontà di onorare la memoria del padre, e la primordiale necessità di vivere, lo spingono a muovere il primo passo in quel mondo ostile. Il Safe Place attende, da qualche parte oltre la desolazione.`;

// --- Journal System Constants ---
export const JOURNAL_ENTRY_COLORS: Record<JournalEntryType, string> = {
  [JournalEntryType.GAME_START]: '#00ff00', // Verde Brillante
  [JournalEntryType.SKILL_CHECK_SUCCESS]: '#60BF77', // Verde
  [JournalEntryType.SKILL_CHECK_FAILURE]: '#ff8c00', // Rosso/Arancione (darkorange)
  [JournalEntryType.ACTION_FAILURE]: '#ffff00', // Giallo
  [JournalEntryType.NARRATIVE]: '#d1d5db', // Bianco/Grigio Chiaro (gray-300)
  [JournalEntryType.ITEM_ACQUIRED]: '#38bdf8', // Ciano/Azzurro (sky-400)
  [JournalEntryType.SYSTEM_ERROR]: '#ff0000', // Rosso Brillante
  [JournalEntryType.SYSTEM_WARNING]: '#fbbf24', // Giallo Brillante (amber-400)
  [JournalEntryType.SYSTEM_MESSAGE]: '#a3a3a3', // Grigio Neutro (neutral-400)
  [JournalEntryType.COMBAT]: '#ef4444', // Rosso (red-500)
  [JournalEntryType.XP_GAIN]: '#f59e0b', // Oro/Giallo Scuro (amber-500)
  [JournalEntryType.EVENT]: '#a78bfa', // Viola (violet-400)
  [JournalEntryType.TROPHY_UNLOCKED]: '#eab308', // Giallo/Oro (yellow-500)
};

export const MOUNTAIN_MESSAGES = [
  "Non puoi passare. È una montagna.",
  "Scalare questa parete rocciosa a mani nude sarebbe un suicidio.",
  "Anche le capre di montagna guarderebbero questa parete e direbbero 'No, grazie'.",
  "La montagna ti osserva, impassibile. Non passerai."
];

export const BIOME_MESSAGES: Record<string, string> = {
  '.': "Ti trovi in una vasta pianura aperta.",
  'F': "Stai entrando in una fitta foresta.",
  '~': "Le acque di un fiume si stendono davanti a te.",
  'M': "Imponenti montagne bloccano il tuo cammino.",
  'C': "Le rovine silenziose di una città si ergono all'orizzonte.",
  'V': "Attraversi i resti di un piccolo villaggio.",
  'R': "Hai trovato un rifugio. Sembra sicuro, per ora.",
  'S': "Inizi il tuo viaggio in un punto relativamente tranquillo.",
  'E': "La destinazione finale è vicina.",
  'A': "Vedi l'Avamposto 'Il Crocevia' davanti a te. Fumo sale da un fuoco centrale.",
  'N': "Un'oscura caverna si apre davanti a te. L'aria è densa e innaturale.",
  'T': "Un commerciante ambulante ti saluta con cautela.",
  'L': "Le porte blindate di un laboratorio abbandonato sono socchiuse.",
  'B': "Una vasta biblioteca si erge davanti a te, custode di conoscenze perdute."
};

export const BIOME_COLORS: Record<string, string> = {
  '.': '#a3a3a3', // neutral-400 (Pianura)
  'F': '#22c55e', // green-500 (Foresta)
  '~': '#38bdf8', // sky-400 (Acqua)
  'M': '#9ca3af', // gray-400 (Montagna)
  'C': '#78716c', // stone-500 (Città)
  'V': '#a16207', // yellow-700 (Villaggio)
  'R': '#d97706', // amber-600 (Rifugio)
  'S': '#f59e0b', // amber-500 (Start)
  'E': '#ef4444', // red-500 (End)
  'A': '#b45309', // amber-700 (Avamposto)
  'N': '#7e22ce', // purple-700 (Nido della Cenere)
  'T': '#f59e0b', // amber-500 (Commerciante)
  'L': '#0891b2', // cyan-600 (Laboratorio)
  'B': '#9f1239', // rose-800 (Biblioteca)
};

export const ATMOSPHERIC_MESSAGES: Record<string, { day: string[], night: string[], rain?: string[] }> = {
  '.': { // Pianura
    day: ["Il vento sibila tra l'erba alta.", "Un falco volteggia in alto nel cielo.", "Il sole picchia sulla tua pelle."],
    night: ["Il richiamo lontano di un predatore notturno ti fa rabbrividire.", "Le stelle brillano intense nel cielo senza nubi.", "Un silenzio innaturale avvolge la pianura."],
    rain: ["Le gocce di pioggia tamburellano sul tuo equipaggiamento.", "Il terreno aperto offre poco riparo dalla pioggia battente."]
  },
  'F': { // Foresta
    day: ["Un raggio di sole filtra attraverso le fitte chiome degli alberi.", "Il fruscio di qualcosa tra i cespugli ti mette in allerta.", "L'odore di terra umida e muschio riempie l'aria."],
    night: ["Il verso di un gufo rompe il silenzio della notte.", "Rami scricchiolano nelle vicinanze, spezzati da un peso invisibile.", "L'oscurità nella foresta è quasi totale."],
    rain: ["La pioggia gocciola dalle foglie, creando una sinfonia costante.", "L'odore di pioggia e terra bagnata è intenso qui."]
  },
  'C': { // Città
    day: ["Il vento ulula tra le rovine degli edifici.", "Un pezzo di metallo cade da un grattacielo scheletrico, echeggiando nel silenzio.", "La polvere si solleva ad ogni tua mossa."],
    night: ["Ombre inquietanti danzano tra i palazzi distrutti.", "Un rumore metallico in lontananza ti fa sussultare.", "La luna illumina spettralmente le strade deserte."],
    rain: ["L'acqua scorre in rivoli scuri lungo le strade dissestate.", "Il rumore della pioggia che colpisce le lamiere contorte è assordante."]
  },
  'V': { // Villaggio
    day: ["Una porta sbatte per il vento in una casa abbandonata.", "Resti di vita quotidiana sono sparsi ovunque, congelati nel tempo.", "Un silenzio spettrale regna tra le case."],
    night: ["Ogni ombra sembra nascondere una minaccia.", "Hai la strana sensazione di essere osservato dalle finestre vuote.", "Il vento fischia attraverso i tetti sfondati."],
    rain: ["La pioggia trasforma le strade sterrate in fango.", "L'acqua gocciola tristemente dai tetti rotti."]
  },
  'R': { // Rifugio
    day: ["Questo posto sembra offrire una tregua temporanea dal mondo esterno.", "Qualcuno ha lasciato delle provviste qui molto tempo fa.", "La polvere danza nei rari raggi di luce che filtrano dall'interno."],
    night: ["I suoni del mondo esterno sembrano attutiti qui dentro.", "È un sollievo essere al riparo, anche se solo per poco.", "Il buio all'interno del rifugio è denso e quasi tangibile."],
  }
};


// --- Character System Constants ---

export const ATTRIBUTES: AttributeName[] = ['for', 'des', 'cos', 'int', 'sag', 'car'];
export const ATTRIBUTE_LABELS: Record<AttributeName, string> = {
  for: 'Forza',
  des: 'Destrezza',
  cos: 'Costituzione',
  int: 'Intelligenza',
  sag: 'Saggezza',
  car: 'Carisma',
};


export const SKILLS: Record<SkillName, SkillDefinition> = {
  // FOR
  atletica: { attribute: 'for' },
  // DES
  acrobazia: { attribute: 'des' },
  furtivita: { attribute: 'des' },
  rapiditaDiMano: { attribute: 'des' },
  // INT
  arcanismo: { attribute: 'int' },
  storia: { attribute: 'int' },
  investigare: { attribute: 'int' },
  natura: { attribute: 'int' },
  religione: { attribute: 'int' },
  // SAG
  addestrareAnimali: { attribute: 'sag' },
  intuizione: { attribute: 'sag' },
  medicina: { attribute: 'sag' },
  percezione: { attribute: 'sag' },
  sopravvivenza: { attribute: 'sag' },
  // CAR
  inganno: { attribute: 'car' },
  intimidire: { attribute: 'car' },
  persuasione: { attribute: 'car' },
  spettacolo: { attribute: 'car' },
};

// XP needed to reach the next level. Index represents the level you are trying to reach.
// e.g., XP_PER_LEVEL[2] = 150 XP to reach level 2.
// v1.2.0: Reduced XP requirements to allow players to reach level 6-8 by endgame
export const XP_PER_LEVEL = [
  0,      // Livello 0 (non usato)
  0,      // Livello 1
  150,    // Livello 2 (was 300)
  400,    // Livello 3 (was 900)
  900,    // Livello 4 (was 2700)
  2000,   // Livello 5 (was 6500)
  4000,   // Livello 6 (was 14000)
  7000,   // Livello 7 (was 23000)
  11000,  // Livello 8 (was 34000)
  16000,  // Livello 9 (was 48000)
  22000,  // Livello 10 (was 64000)
  30000,  // ...e così via
  40000,
  52000,
  66000,
  82000,
  100000,
  120000,
  142000,
  166000,
  192000,
];