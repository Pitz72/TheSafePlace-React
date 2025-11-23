import { Feature, TimelineEvent } from './types';

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
    title: "Echoes of the Donors",
    description: "Il gioco raggiunge la sua forma quasi definitiva con l'aggiunta di quest, eventi e oggetti unici dedicati ai sostenitori del progetto, arricchendo la narrativa."
  },
  {
    version: "v1.9.9.9",
    title: "Golden Master Stabilization",
    description: "Versione definitiva per il rilascio. Unificazione di tutti i fix critici (Quest, Commercio, Dati, UI) e stabilizzazione completa del sistema. Il gioco è ora completo al 100%."
  }
];
