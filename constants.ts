import { AttributeName, SkillDefinition, SkillName, JournalEntryType } from "./types";

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

export const INSTRUCTIONS_TEXT = `Figlio Mio, Ultimo...

Se stai leggendo queste parole, significa che non sono tornato in tempo, e le scorte che ti ho lasciato stanno per finire. Il mio cuore è pesante, ma non c'è tempo per il dolore adesso. Devi essere forte, come ti ho insegnato. Il mondo là fuori è un lupo affamato, ma tu hai gli strumenti per non diventare la sua preda.

Ricorda le basi, sempre. La mappa è la tua guida; la E segna la speranza, il 'Safe Place'. Raggiungila. I tasti direzionali (o W, A, S, D) saranno le tue gambe. Ogni passo ha un costo: cibo e acqua sono vita. Non lasciarli mai scarseggiare, o la debolezza e il logorio degli HP ti consumeranno. Vigila sulla tua Condizione – ferite, malanni, veleni – sono nemici silenziosi.

Il tempo è un fiume crudele, il giorno un breve respiro prima del gelo e dei pericoli della notte. Prima che il sole muoia, cerca un Rifugio ('R'). Lì troverai riposo fino all'alba e, con un po' di fortuna, qualcosa di utile. Esplorali di giorno, ma ricorda che ogni azione costa tempo. Villaggi ('V') e Città ('C') sono rovine piene di echi e pericoli, non fidarti ciecamente del loro apparente riparo notturno.

Il tuo Inventario è piccolo, riempilo con ciò che è essenziale. Premi 'I' per aprirlo e naviga con i tasti direzionali. Premi il numero corrispondente per usare un oggetto.

La strada ti metterà di fronte a Eventi e scelte difficili. Fidati del tuo Presagio, delle tue Abilità, ma soprattutto del tuo giudizio. Non tutte le lotte vanno combattute; a volte, la saggezza sta nel sapere quando fuggire.

Ti ho insegnato tutto ciò che potevo. Ora sei solo, è vero, ma non sei impreparato. La mia missione mi chiama lontano, e non so se queste parole saranno il mio ultimo abbraccio o solo un arrivederci. Ma tu, Ultimo, tu devi sopravvivere. Trova il Safe Place. Con tutto l'amore che un padre può dare, Papà.

Leggenda mappa:

@ = Giocatore
C = Città
F = Foresta
~ = Acqua
M = Montagna
R = Rifugio
S = Start
E = End`;

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
    'E': "La destinazione finale è vicina."
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
// e.g., XP_PER_LEVEL[2] = 300 XP to reach level 2.
export const XP_PER_LEVEL = [
  0,      // Livello 0 (non usato)
  0,      // Livello 1
  300,    // Livello 2
  900,    // Livello 3
  2700,   // Livello 4
  6500,   // Livello 5
  14000,  // ...e così via
  23000,
  34000,
  48000,
  64000,
  85000,
  100000,
  120000,
  140000,
  165000,
  195000,
  225000,
  265000,
  305000,
  355000,
];