import { AttributeName, SkillDefinition, SkillName, JournalEntryType } from "./types";

export const GAME_VERSION = "1.3.2";

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

export const INSTRUCTIONS_TEXT = `
  GUida di Gioco - The Safe Place Chronicles

  Benvenuto. Questa guida ti fornirà le informazioni essenziali per sopravvivere.

  --- COMANDI PRINCIPALI ---

  [W, A, S, D] o [Frecce Direzionali]
  Muovi il personaggio sulla mappa e naviga nei menu.

  [Invio]
  Conferma una selezione o un'azione.

  [ESC]
  Annulla, torna indietro o apri il menu di pausa durante il gioco.

  [I] - Inventario
  Apre e chiude l'inventario.

  [R] - Riposo Rapido
  Esegui un riposo di un'ora all'aperto. Consuma tempo e recupera una piccola quantità di HP e fatica.

  [F] - Ricerca Attiva
  Esegui una ricerca di 30 minuti nel bioma attuale per trovare risorse. L'esito dipende dalla tua abilità di Sopravvivenza e dal tipo di ambiente.

  [L] - Level Up
  Quando hai abbastanza XP, premi questo tasto per accedere alla schermata di aumento di livello.

  --- MECCANICHE DI SOPRAVVIVENZA ---

  - SALUTE (HP): I tuoi Punti Ferita. Se raggiungono lo zero, il gioco finisce.
  - SAZIETÀ: Diminuisce col tempo. Se arriva a zero, inizierai a perdere HP.
  - IDRATAZIONE: Diminuisce col tempo, più velocemente della sazietà. Se arriva a zero, perderai HP rapidamente.
  - FATICA: Aumenta con le azioni. Una fatica elevata applica penalità alle tue abilità e può portare allo stato "Esausto".

  - TEMPO E NOTTE: Il tempo scorre con ogni azione. Esplorare di notte è pericoloso e causa una lenta perdita di HP a meno che tu non sia in un rifugio.

  - RIFUGI: Luoghi sicuri dove puoi riposare fino all'alba, usare il banco da lavoro e cercare risorse.

  --- CRAFTING E INVENTARIO ---

  - Il crafting è essenziale. Puoi creare oggetti presso un banco da lavoro in un rifugio.
  - Inizi con 5 ricette di base per acqua, bende e strumenti.
  - Trova "Manuali di Crafting" per imparare nuove ricette.
  - Gestisci il tuo inventario: alcuni oggetti sono impilabili, altri no. Le armi e le armature hanno una durabilità che si consuma con l'uso.

  --- COMBATTIMENTO E PROGRESSIONE ---

  - Il combattimento è a turni e testuale.
  - L'azione "Analizza" può rivelare le debolezze di un nemico.
  - Sconfiggere nemici fornisce Punti Esperienza (XP) e a volte dei materiali.
  - Accumula XP per salire di livello (tasto L), potenziare un attributo e scegliere un Talento.
  - I Talenti sono abilità passive potenti che definiscono il tuo stile di gioco.

  --- SCELTE MORALI ---

  - Le tue decisioni negli eventi influenzeranno il tuo allineamento.
  - VIA DI LENA (Compassione): Privilegia l'aiuto agli altri e l'empatia.
  - VIA DI ELIAN (Pragmatismo): Privilegia la sopravvivenza a ogni costo.
  - Raggiungere una forte inclinazione in una delle due vie sbloccherà bonus passivi permanenti.

  Buona fortuna. La tua sopravvivenza dipende dalle tue scelte.
`;

export const STORY_TEXT = `L'Eco del Silenzio

Il mondo che Ultimo conosceva era fatto di sussurri e acciaio freddo, di lezioni impartite da un padre con occhi stanchi ma mani salde. Diciassette anni vissuti all'ombra di una catastrofe che aveva inghiottito il passato, lasciando solo echi distorti: la "Guerra Inespressa", il "Grande Silenzio".

Della madre, Ultimo conservava solo un calore sbiadito nel petto, un nome quasi dimenticato. Il "prima" era una favola raccontata a bassa voce, un sogno di cieli azzurri e città luminose, così diverso dai grigiori malati e dalle rovine scheletriche che ora graffiavano l'orizzonte dell'Europa Centrale.

Suo padre gli aveva insegnato a leggere i segni del vento carico di polveri tossiche, a distinguere il fruscio di una bestia mutata da quello innocuo delle lamiere contorte, a trovare acqua dove sembrava esserci solo aridità. Ogni giorno era una lezione di sopravvivenza, ogni notte un monito sulla fragilità della vita.

Poi, anche il padre era partito. Una missione avvolta nel mistero, un addio affrettato con la promessa di un ritorno che tardava troppo. Le scorte lasciate con cura si assottigliavano, e con esse la speranza. Rimaneva solo un messaggio frammentario, l'ultima eco della voce paterna: "...trova il Safe Place, Ultimo. È la nostra unica possibilità..."

Ora, il silenzio è il suo unico compagno. Davanti a lui, un viaggio disperato attraverso un continente irriconoscibile, armato solo degli insegnamenti paterni e di una mappa verso un luogo che potrebbe essere leggenda, trappola, o forse, davvero, salvezza. Il peso della solitudine è grande, ma la volontà di onorare la memoria del padre, e la primordiale necessità di vivere, lo spingono a muovere il primo passo in quel mondo ostile. Il Safe Place attende, da qualche parte oltre la desolazione.`;

// ... (resto del file constants.ts)
