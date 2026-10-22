import { Feature, TimelineEvent, DownloadTarget } from './types';

// --- Repository e Release pubblica (open source) ---
export const REPO_URL = 'https://github.com/Pitz72/TheSafePlace-React';
export const RELEASES_URL = 'https://github.com/Pitz72/TheSafePlace-React/releases';
export const RELEASE_VERSION = 'v3.1.0';
const RELEASE_BASE = 'https://github.com/Pitz72/TheSafePlace-React/releases/download/v3.1.0/';

export const DOWNLOAD_BASE_URL = RELEASE_BASE;

export const CONTACT_EMAIL = 'runtimeradio@gmail.com';

export const DOWNLOAD_TARGETS: DownloadTarget[] = [
  {
    os: 'Windows',
    icon: 'windows',
    requirement: 'Windows 10/11 - 64 bit (x64)',
    primary: { label: 'Installer (.exe)', file: 'TheSafePlace-3.1.0-win-x64.exe', size: '~97 MB' },
    notice: 'Windows SmartScreen potrebbe mostrare un avviso ("Windows ha protetto il PC") perché l’eseguibile non è firmato con un certificato commerciale. È normale per un progetto open source: clicca su "Ulteriori informazioni" e poi "Esegui comunque".',
  },
  {
    os: 'Linux',
    icon: 'linux',
    requirement: 'Distribuzioni 64 bit (x86_64 / amd64)',
    primary: { label: 'AppImage', file: 'TheSafePlace-3.1.0-linux-x86_64.AppImage', size: '~125 MB' },
    secondary: { label: 'Pacchetto Debian (.deb)', file: 'TheSafePlace-3.1.0-linux-amd64.deb', size: '~96 MB' },
    notice: 'Per l’AppImage: dopo il download rendila eseguibile (chmod +x) e avviala con un doppio clic. In alternativa usa il pacchetto .deb su Debian/Ubuntu e derivate.',
  },
];

export const FEATURES: Feature[] = [
  {
    icon: 'map',
    title: 'Un mondo vivo',
    description: "Esplora una vasta mappa con biomi unici (pianure, foreste, città) influenzati dal meteo e dal ciclo del giorno e della notte. Col buio i pericoli crescono e cercare riparo diventa una decisione strategica; ogni incontro finisce nel tuo Diario di Viaggio."
  },
  {
    icon: 'heart',
    title: 'Sopravvivenza impegnativa',
    description: "Gestisci fame, sete e salute, e cura stati come ferite, malattie e avvelenamento. Armi e armature si consumano con l'uso: riparale, smontale e recupera i materiali per tenere in vita il tuo equipaggiamento."
  },
  {
    icon: 'book',
    title: 'Una storia a strati',
    description: "Una trama principale in 12 capitoli che si svela mentre giochi. Eventi a tema, incontri rari ed Easter Egg raccontano il mondo perduto, e le cutscene danno respiro ai momenti che contano."
  },
  {
    icon: 'compass',
    title: 'Crescita e scelte morali',
    description: "Sali di livello e definisci il tuo stile scegliendo tra Talenti come Scavenger o Guerrigliero. Le tue decisioni orientano la Bussola Interiore, tra Lena ed Elian, e sbloccano bonus che riflettono il tuo cammino."
  },
  {
    icon: 'shield',
    title: 'Combattimento tattico',
    description: "Scontri a turni raccontati come una storia. Spendi un turno per analizzare il nemico, scoprirne le debolezze e sbloccare attacchi mirati; anche l'ambiente è una risorsa: nasconditi tra gli alberi o cerca copertura tra le rovine."
  },
  {
    icon: 'hammer',
    title: 'Crafting progressivo',
    description: "Non conosci tutte le ricette fin dall'inizio: trova manuali e schemi lungo la strada e impara a costruire ciò che ti serve, dalle bende migliorate alle munizioni speciali, trasformando materiali grezzi in strumenti di sopravvivenza."
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
    description: "Impacchettamento come applicazione desktop con Electron per Windows e Linux, con build automatiche via CI. Prima release pubblica scaricabile su GitHub."
  },
  {
    version: "v2.0.17",
    title: "Rifiniture Desktop",
    description: "Installer NSIS per Windows, avvio a schermo intero, nuova icona ufficiale dell'app e miglioramenti alle cutscene di apertura."
  },
  {
    version: "v2.1.0",
    title: "Revisione Completa",
    description: "La trama principale arriva sempre fino al finale e tutte le 21 quest si avviano e si completano. Dialoghi, talenti e oggetti fanno quello che promettono, e test automatici giocano davvero il gioco a ogni modifica.",
  },
  {
    version: "v3.0.0",
    title: "Nuova Identità Visiva",
    description: "Dal terminale al gioco narrativo: interfaccia ridisegnata da zero, nuovo logo, key art e copertine in illustrazione vettoriale, mappa illustrata con la luce dell'ora e il meteo. Regole e salvataggi restano gli stessi."
  },
  {
    version: "v3.1.0",
    title: "Paesaggio Sonoro",
    description: "Dal beep al mondo che respira: suoni morbidi di legno, feltro e vetro e un ambiente che segue luogo, ora e meteo, con vento, pioggia, uccelli all'alba e grilli di notte. Tutto sintetizzato in tempo reale, anche offline. Da questa versione le release sono per Windows e Linux."
  }
];
