import { Feature, TimelineEvent, DownloadTarget } from './types';

// --- Repository e Release pubblica (open source) ---
export const REPO_URL = 'https://github.com/Pitz72/TheSafePlace-React';
export const RELEASES_URL = 'https://github.com/Pitz72/TheSafePlace-React/releases';
export const RELEASE_VERSION = 'v2.0.17';
const RELEASE_BASE = 'https://github.com/Pitz72/TheSafePlace-React/releases/download/v2.0.17/';

export const DOWNLOAD_BASE_URL = RELEASE_BASE;

export const DOWNLOAD_TARGETS: DownloadTarget[] = [
  {
    os: 'Windows',
    icon: '⊞', // ⊞ finestra
    requirement: 'Windows 10/11 - 64 bit (x64)',
    primary: { label: 'Installer (.exe)', file: 'TheSafePlace-2.0.17-win-x64.exe', size: '~115 MB' },
    notice: 'Windows SmartScreen potrebbe mostrare un avviso ("Windows ha protetto il PC") perché l’eseguibile non è firmato con un certificato commerciale. È normale per un progetto open source: clicca su "Ulteriori informazioni" e poi "Esegui comunque".',
  },
  {
    os: 'macOS',
    icon: '⌘', // ⌘
    requirement: 'macOS su Apple Silicon (arm64) - M1 o superiore',
    primary: { label: 'Disk Image (.dmg)', file: 'TheSafePlace-2.0.17-mac-arm64.dmg', size: '~154 MB' },
    secondary: { label: 'Archivio (.zip)', file: 'TheSafePlace-2.0.17-mac-arm64.zip', size: '~147 MB' },
    notice: 'L’app non è firmata né notarizzata da Apple, quindi Gatekeeper la bloccherà al primo avvio. Fai clic destro sull’app → "Apri", oppure vai in Impostazioni di Sistema → Privacy e sicurezza → "Apri comunque". Disponibile solo per Apple Silicon (arm64).',
  },
  {
    os: 'Linux',
    icon: '⚇', // ⚇
    requirement: 'Distribuzioni 64 bit (x86_64 / amd64)',
    primary: { label: 'AppImage', file: 'TheSafePlace-2.0.17-linux-x86_64.AppImage', size: '~150 MB' },
    secondary: { label: 'Pacchetto Debian (.deb)', file: 'TheSafePlace-2.0.17-linux-amd64.deb', size: '~114 MB' },
    notice: 'Per l’AppImage: dopo il download rendila eseguibile (chmod +x) e avviala con un doppio clic. In alternativa usa il pacchetto .deb su Debian/Ubuntu e derivate.',
  },
];

export const FEATURES: Feature[] = [
  {
    title: "MONDO VIVO E DINAMICO",
    description: "Esplora una vasta mappa con biomi unici (Pianure, Foreste, Città) influenzati da un sistema meteo e temporale dinamico. Sopravvivi ai pericoli notturni, dove cercare riparo è una decisione strategica, e tieni traccia di ogni evento nel tuo dettagliato Diario di Viaggio."
  },
  {
    title: "SOPRAVVIVENZA IMPEGNATIVA",
    description: "Gestisci fame, sete e salute mentre curi stati multipli come Ferite, Malattie e Avvelenamento. Le armi e le armature si degradano con l'uso, costringendoti a riparare, smantellare e recuperare materiali preziosi per mantenere il tuo equipaggiamento funzionante."
  },
  {
    title: "STORIA STRATIFICATA",
    description: "Vivi una trama principale in 12 capitoli, svelata organicamente attraverso il gameplay. Un sistema di eventi intelligente garantisce varietà, incontri a tema e la scoperta di rari Easter Egg che raccontano storie del mondo perduto, presentate con cutscene testuali immersive."
  },
  {
    title: "CRESCITA E SCELTE MORALI",
    description: "Sali di livello e definisci il tuo stile di gioco scegliendo tra Talenti unici come 'Scavenger' o 'Guerrigliero'. Le tue decisioni morali modelleranno la tua Bussola Interiore (Lena/Elian), sbloccando potenti bonus passivi che riflettono il tuo cammino."
  },
  {
    title: "COMBATTIMENTO TATTICO",
    description: "Affronta un combattimento a turni, testuale e narrativo. Spendi un turno per 'Analizzare' il nemico, scoprirne le debolezze e sbloccare opzioni di attacco uniche. L'ambiente stesso diventa una risorsa: nasconditi tra gli alberi o cerca copertura tra le rovine."
  },
  {
    title: "CRAFTING PROGRESSIVO",
    description: "L'ingegno è progressione. Non conosci tutte le ricette fin dall'inizio. Trova manuali e schemi nel mondo per apprendere come creare oggetti essenziali, da bende migliorate a munizioni speciali, trasformando materiali grezzi in strumenti di sopravvivenza."
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    version: "v1.3.1",
    title: "The Survival Overhaul",
    description: "Introduzione della 'Ricerca Attiva' e revisione del loot. La sopravvivenza diventa una questione di strategia e non più di fortuna, dando al giocatore il pieno controllo sulle risorse."
  },
  {
    version: "v1.5.0",
    title: "Quest System Framework",
    description: "Implementazione di un'infrastruttura completa per missioni, con obiettivi attivi e indicatori visivi sulla mappa. Il gioco si trasforma in un vero RPG."
  },
  {
    version: "v1.7.0",
    title: "Social Hub & Interactive NPCs",
    description: "Il mondo si popola con PNG interattivi, alberi di dialogo ramificati e un sistema di baratto economico. L'abilità Persuasione diventa cruciale."
  },
  {
    version: "v1.9.1",
    title: "Tactical Combat",
    description: "Il combattimento si evolve con azioni ambientali contestuali e munizioni speciali. L'ambiente diventa una risorsa strategica per la vittoria."
  },
  {
    version: "v1.9.5",
    title: "Content Expansion",
    description: "Il gioco raggiunge la sua forma quasi definitiva con l'aggiunta di quest, eventi e oggetti unici che arricchiscono la narrativa e il mondo di gioco."
  },
  {
    version: "v2.0.0",
    title: "Golden Master Release",
    description: "Il progetto raggiunge la sua forma definitiva. Tutti i sistemi sono stabili, testati e verificati. Suite di test completa superata."
  },
  {
    version: "v2.0.14",
    title: "Campagna di Chiusura",
    description: "Audit completo del gioco e revisione dei sistemi: correzioni di flusso, creazione del personaggio, salvataggi e bilanciamento. Il gioco è ora completabile dall'inizio fino al finale morale."
  },
  {
    version: "v2.0.16",
    title: "Rilascio Desktop Open Source",
    description: "Impacchettamento come applicazione desktop con Electron per Windows, macOS e Linux, con build automatiche via CI. Prima release pubblica scaricabile su GitHub."
  },
  {
    version: "v2.0.17",
    title: "Rifiniture Desktop",
    description: "Installer NSIS per Windows, avvio a schermo intero, nuova icona ufficiale dell'app e miglioramenti alle cutscene di apertura."
  }
];
