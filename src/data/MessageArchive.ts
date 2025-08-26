export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: MessageType;
  context?: Record<string, any>;
}

// Funzione per ottenere un messaggio casuale dal tipo specificato
export function getRandomMessage(type: MessageType, context?: Record<string, any>): string | null {
  const messages = MESSAGE_ARCHIVE[type];
  
  if (!messages) {
    console.warn(`Nessun messaggio trovato per il tipo: ${type}`);
    return 'Un evento misterioso accade nel mondo desolato.';
  }
  
  // Gestione speciale per MessageType che utilizzano parametri specifici dal context
  if (type === MessageType.ACTION_SUCCESS && context?.action) {
    return context.action;
  }
  
  if (type === MessageType.ACTION_FAIL && context?.reason) {
    return `Azione fallita: ${context.reason}`;
  }
  
  if (type === MessageType.DISCOVERY && context?.discovery) {
    return `Hai scoperto: ${context.discovery}`;
  }
  
  if (type === MessageType.INVENTORY_FULL && context?.item) {
    return `Non puoi raccogliere ${context.item}: inventario pieno.`;
  }
  
  if (type === MessageType.INVENTORY_CHANGE && context?.action) {
    return context.action;
  }
  
  if (type === MessageType.REST_SUCCESS && context?.healingAmount) {
    return `Riposo completato. Hai recuperato ${context.healingAmount} punti vita.`;
  }
  
  if (type === MessageType.REST_BLOCKED && context?.reason) {
    return `Riposo bloccato: ${context.reason}`;
  }
  
  if (type === MessageType.HP_RECOVERY && context?.healing) {
    return `Hai recuperato ${context.healing} punti vita.`;
  }
  
  if (type === MessageType.HP_DAMAGE && context?.damage) {
    const reason = context.reason ? ` (${context.reason})` : '';
    return `Hai subito ${context.damage} danni${reason}.`;
  }
  
  // Sistema anti-spam per BIOME_ENTER
  if (type === MessageType.BIOME_ENTER && context?.biome && JOURNAL_CONFIG.BIOME_ANTI_SPAM) {
    const biomeKey = `${context.biome}`;
    if (JOURNAL_STATE.visitedBiomes.has(biomeKey)) {
      return null; // Non mostrare il messaggio se il bioma è già stato visitato
    }
    JOURNAL_STATE.visitedBiomes.add(biomeKey);
  }
  
  // Gestione messaggi con testo personalizzato (per meteo, eventi speciali, etc.)
  if (context?.text) {
    return context.text;
  }
  
  // Gestione messaggi meteo con descrizione
  if (context?.weather && context?.description) {
    return context.description;
  }
  
  // Cooldown per AMBIANCE_RANDOM
  if (type === MessageType.AMBIANCE_RANDOM) {
    const now = Date.now();
    if (now - JOURNAL_STATE.lastAmbianceTime < JOURNAL_CONFIG.AMBIANCE_COOLDOWN) {
      return null; // Non mostrare il messaggio se è ancora in cooldown
    }
    JOURNAL_STATE.lastAmbianceTime = now;
  }
  
  // Sequenza GAME_START
  if (type === MessageType.GAME_START && Array.isArray(messages)) {
    const message = messages[JOURNAL_STATE.gameStartSequenceIndex];
    JOURNAL_STATE.gameStartSequenceIndex = (JOURNAL_STATE.gameStartSequenceIndex + 1) % messages.length;
    return message || messages[0];
  }
  
  // Se i messaggi sono organizzati per bioma (come BIOME_ENTER)
  if (typeof messages === 'object' && !Array.isArray(messages)) {
    if (context?.biome) {
      // Prova prima con il bioma specifico
      const biomeMessages = messages[context.biome];
      if (biomeMessages && Array.isArray(biomeMessages)) {
        return biomeMessages[Math.floor(Math.random() * biomeMessages.length)];
      }
      
      // Fallback ai messaggi default se il bioma non è mappato
      const defaultMessages = messages['default'];
      if (defaultMessages && Array.isArray(defaultMessages)) {
        console.warn(`Bioma '${context.biome}' non mappato, usando messaggio default`);
        return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
      }
    }
    
    // Se non c'è contesto bioma, prova a prendere il primo array disponibile
    const firstArrayKey = Object.keys(messages).find(key => Array.isArray(messages[key]));
    if (firstArrayKey) {
      const firstArray = messages[firstArrayKey];
      return firstArray[Math.floor(Math.random() * firstArray.length)];
    }
  }
  
  // Se i messaggi sono un array semplice
  if (Array.isArray(messages)) {
    if (messages.length === 0) {
      console.warn(`Array messaggi vuoto per il tipo: ${type}`);
      return 'Qualcosa accade nel silenzio del mondo perduto.';
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  console.warn(`Formato messaggio non riconosciuto per il tipo: ${type}`);
  return 'Gli echi del passato sussurrano storie dimenticate.';
}

export const JOURNAL_CONFIG = {
  MAX_ENTRIES: 50,
  WELCOME_DELAY: 1000,
  AMBIANCE_PROBABILITY: 0.02, // 2% di probabilità per messaggio ambientale
  AMBIANCE_COOLDOWN: 30000, // 30 secondi per test (era 2 ore: 7200000)
  BIOME_ANTI_SPAM: true, // Sistema anti-spam per BIOME_ENTER
};

// Stato globale per il sistema anti-spam e cooldown
export const JOURNAL_STATE = {
  visitedBiomes: new Set<string>(), // Biomi già visitati
  lastAmbianceTime: 0, // Timestamp ultimo messaggio ambientale
  gameStartSequenceIndex: 0, // Indice per la sequenza GAME_START
};

// Funzione per resettare lo stato del journal
export function resetJournalState(): void {
  JOURNAL_STATE.visitedBiomes.clear();
  JOURNAL_STATE.lastAmbianceTime = 0;
  JOURNAL_STATE.gameStartSequenceIndex = 0;
}

export enum MessageType {
  // Sistema base
  GAME_START = 'GAME_START',
  BIOME_ENTER = 'BIOME_ENTER',
  AMBIANCE_RANDOM = 'AMBIANCE_RANDOM',

  // Movimento e terreno
  MOVEMENT_FAIL_OBSTACLE = 'MOVEMENT_FAIL_OBSTACLE', // Rinominato da MOVEMENT_FAIL_MOUNTAIN per GDD
  MOVEMENT_FAIL_MOUNTAIN = 'MOVEMENT_FAIL_MOUNTAIN', // Mantenuto per compatibilità
  ACTION_RIVER_CROSSING = 'ACTION_RIVER_CROSSING', // Nuovo secondo GDD
  MOVEMENT_ACTION_RIVER = 'MOVEMENT_ACTION_RIVER', // Mantenuto per compatibilità
  MOVEMENT_SUCCESS = 'MOVEMENT_SUCCESS',
  MOVEMENT_NIGHT_PENALTY = 'MOVEMENT_NIGHT_PENALTY', // Nuovo secondo GDD

  // Skill checks
  SKILL_CHECK_SUCCESS = 'SKILL_CHECK_SUCCESS',
  SKILL_CHECK_FAILURE = 'SKILL_CHECK_FAILURE',
  SKILL_CHECK_RIVER_SUCCESS = 'SKILL_CHECK_RIVER_SUCCESS',
  SKILL_CHECK_RIVER_FAILURE = 'SKILL_CHECK_RIVER_FAILURE', // Nuovo secondo GDD
  SKILL_CHECK_RIVER_DAMAGE = 'SKILL_CHECK_RIVER_DAMAGE', // Nuovo secondo GDD
  ACTION_RIVER_EXHAUSTION = 'ACTION_RIVER_EXHAUSTION', // Nuovo secondo GDD

  // Salute e riposo
  HP_RECOVERY = 'HP_RECOVERY',
  HP_DAMAGE = 'HP_DAMAGE',
  REST_BLOCKED = 'REST_BLOCKED',
  REST_SUCCESS = 'REST_SUCCESS',

  // Sopravvivenza (nuovi secondo GDD)
  SURVIVAL_NIGHT_CONSUME = 'SURVIVAL_NIGHT_CONSUME',
  SURVIVAL_PENALTY = 'SURVIVAL_PENALTY',

  // Azioni generiche
  ACTION_SUCCESS = 'ACTION_SUCCESS',
  ACTION_FAIL = 'ACTION_FAIL',

  // Sistema personaggio
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  LEVEL_UP = 'LEVEL_UP',
  XP_GAIN = 'XP_GAIN', // Nuovo secondo GDD
  STAT_INCREASE = 'STAT_INCREASE', // Nuovo secondo GDD
  STATUS_CHANGE = 'STATUS_CHANGE', // Nuovo secondo GDD

  // Inventario e oggetti (aggiornati secondo GDD)
  INVENTORY_OPEN = 'INVENTORY_OPEN', // Nuovo secondo GDD
  ITEM_CONSUME = 'ITEM_CONSUME', // Nuovo secondo GDD
  ITEM_EQUIP = 'ITEM_EQUIP', // Nuovo secondo GDD
  INVENTORY_ADD = 'INVENTORY_ADD', // Nuovo secondo GDD
  INVENTORY_REMOVE = 'INVENTORY_REMOVE', // Nuovo secondo GDD
  ITEM_FOUND = 'ITEM_FOUND', // Mantenuto per compatibilità
  ITEM_USED = 'ITEM_USED', // Mantenuto per compatibilità
  INVENTORY_FULL = 'INVENTORY_FULL',
  INVENTORY_CHANGE = 'INVENTORY_CHANGE',

  // Sistema tempo
  TIME_DAWN = 'TIME_DAWN',
  TIME_DUSK = 'TIME_DUSK',
  TIME_MIDNIGHT = 'TIME_MIDNIGHT',

  // Eventi speciali
  DISCOVERY = 'DISCOVERY',
  DANGER = 'DANGER',
  MYSTERY = 'MYSTERY',
  EVENT_CHOICE = 'EVENT_CHOICE', // Per le scelte degli eventi dinamici
}

export const MESSAGE_ARCHIVE: Record<string, any> = {
  [MessageType.GAME_START]: [
    "BENVENUTO IN THE SAFE PLACE",
    "Un mondo post-apocalittico ti aspetta...",
    "La sopravvivenza dipende dalle tue scelte.",
    "Ogni passo è una decisione. Muoviti con i comandi di movimento.",
    "L'esplorazione e le tue azioni ti renderanno più forte.",
    "Il viaggio inizia ora. Che la fortuna ti accompagni."
  ],
  [MessageType.BIOME_ENTER]: {
    'F': [
      "Entri in una fitta foresta. Gli alberi sussurrano segreti antichi.",
      "La vegetazione selvaggia ha riconquistato questo territorio.",
      "Rami e foglie creano un labirinto naturale intorno a te.",
      "L'aria profuma di muschio e di vita che resiste."
    ],
    '.': [
      "Una vasta pianura si apre davanti a te. L'orizzonte sembra infinito.",
      "Erba alta ondeggia nel vento come un mare verde.",
      "La pianura si estende a perdita d'occhio, silenziosa e desolata.",
      "Qui la natura ha ripreso il controllo, cancellando ogni traccia del passato."
    ],
    'C': [
      "Rovine di una città emergono dalla desolazione.",
      "Scheletri di grattacieli si stagliano contro il cielo plumbeo.",
      "Le strade sono crepe e invase dalla vegetazione.",
      "Echi di una civiltà perduta risuonano tra i detriti."
    ],
    'V': [
      "Un piccolo insediamento appare all'orizzonte.",
      "Segni di vita umana: fumo che sale da camini improvvisati.",
      "Un villaggio di sopravvissuti, costruito con materiali di recupero.",
      "Qui qualcuno ha deciso di ricominciare da capo."
    ],
    'S': [
      "Il punto di partenza del tuo viaggio.",
      "Da qui tutto è iniziato.",
      "Un luogo familiare in un mondo che non lo è più."
    ],
    'E': [
      "La destinazione finale si avvicina.",
      "Qui termina il viaggio, ma inizia una nuova storia.",
      "Il punto di arrivo che hai tanto cercato."
    ],
    'R': [
      "Un rifugio sicuro si presenta davanti a te.",
      "Questo luogo offre riparo dalle intemperie del mondo.",
      "Un posto dove riposare e recuperare le forze.",
      "Un rifugio abbandonato ma ancora utilizzabile."
    ],
    'M': [
      "Imponenti montagne bloccano il passaggio.",
      "Picchi rocciosi si ergono minacciosi verso il cielo.",
      "La natura ha eretto qui una barriera invalicabile.",
      "Queste vette hanno resistito a ogni catastrofe."
    ],
    '~': [
      "Un corso d'acqua scorre davanti a te.",
      "L'acqua riflette il cielo come uno specchio liquido.",
      "Un fiume che ha continuato a scorrere nonostante tutto.",
      "La corrente sussurra storie di tempi migliori."
    ],
    // Fallback per biomi non mappati
    'default': [
      "Ti trovi in un territorio inesplorato.",
      "Questo luogo nasconde ancora i suoi segreti.",
      "Un'area misteriosa si apre davanti a te."
    ]
  },
  [MessageType.MOVEMENT_FAIL_MOUNTAIN]: [
    "Quella montagna non sembra volersi spostare.",
    "Anche con la rincorsa, non se ne parla.",
    "La montagna ti guarda con aria di sfida. Tu declini educatamente.",
    "Fisica: 1, Ottimismo: 0.",
    "Le leggi della gravità sono ancora in vigore, a quanto pare.",
    "La roccia risulta essere più testarda di te.",
    "Nemmeno i supereroi attraversano le montagne a piedi.",
    "Hai mai sentito parlare di 'aggirare' gli ostacoli?",
    "La montagna vince per abbandono. Letteralmente.",
    "Congratulazioni: hai appena scoperto l'immobilità della materia."
  ],
  [MessageType.MOVEMENT_ACTION_RIVER]: [
    "L'acqua gelida ti toglie il fiato per un istante.",
    "Guadare il fiume richiede uno sforzo notevole.",
    "La corrente è più forte di quanto sembrasse.",
    "Ogni passo nell'acqua è una sfida contro la natura.",
    "Il fiume mette alla prova la tua determinazione."
  ],
  [MessageType.AMBIANCE_RANDOM]: [
    "Un silenzio innaturale ti circonda.",
    "Il vento ulula tra le rovine in lontananza.",
    "Per un attimo, hai la strana sensazione di essere osservato.",
    "Un rumore lontano ti fa voltare, ma non vedi nulla.",
    "L'aria si fa improvvisamente più fredda.",
    "Qualcosa si muove nell'ombra, poi scompare.",
    "Il mondo sembra trattenere il respiro.",
    "Un brivido ti percorre la schiena senza motivo apparente."
  ],
  [MessageType.HP_RECOVERY]: [
    "Ti senti rinvigorito dopo il riposo.",
    "Le tue ferite si stanno rimarginando.",
    "Il dolore si attenua gradualmente.",
    "La tua resistenza sta tornando.",
    "Il corpo inizia a guarire dalle fatiche del viaggio.",
    "Un po' di riposo ha fatto miracoli."
  ],
  [MessageType.HP_DAMAGE]: [
    "Senti un dolore acuto attraversarti.",
    "Le tue forze ti stanno abbandonando.",
    "Il corpo protesta contro gli sforzi eccessivi.",
    "Ogni movimento diventa più difficile.",
    "La stanchezza si fa sentire pesantemente.",
    "Il dolore ti ricorda la tua fragilità."
  ],
  [MessageType.CHARACTER_CREATION]: [
    "Ultimo emerge dalle nebbie del tempo.",
    "Un nuovo viaggio sta per iniziare.",
    "Il destino ha scelto il suo campione.",
    "Una nuova storia prende forma.",
    "Il mondo attende il tuo risveglio."
  ],
  [MessageType.REST_BLOCKED]: [
    "Il tuo corpo non ha ancora bisogno di riposo.",
    "Troppo presto per riposare di nuovo. Devi aspettare.",
    "Le tue energie sono ancora sufficienti.",
    "Non è ancora il momento di fermarsi.",
    "Il riposo precedente ti sostiene ancora."
  ],
  [MessageType.SKILL_CHECK_SUCCESS]: [
    "Le tue abilità non ti hanno deluso.",
    "Esperienza e fortuna si combinano perfettamente.",
    "Un successo meritato dopo tanto allenamento.",
    "La preparazione ripaga sempre.",
    "Hai superato la sfida con eleganza."
  ],
  [MessageType.SKILL_CHECK_FAILURE]: [
    "Non sempre le cose vanno come previsto.",
    "Questa volta la fortuna non è dalla tua parte.",
    "Un piccolo errore di valutazione.",
    "Anche i migliori sbagliano qualche volta.",
    "La prossima volta andrà meglio."
  ],
  [MessageType.SKILL_CHECK_RIVER_SUCCESS]: [
    "Con un balzo agile, superi il fiume senza bagnarti i piedi.",
    "Attraversi il corso d'acqua con sorprendente destrezza.",
    "La tua agilità ti permette di danzare sull'acqua.",
    "Salti da pietra a pietra con grazia felina.",
    "Il fiume si arrende alla tua abilità."
  ],
  [MessageType.ACTION_SUCCESS]: [
    "L'azione si conclude con successo.",
    "Tutto procede secondo i piani.",
    "Un risultato soddisfacente.",
    "La tua competenza fa la differenza.",
    "Missione compiuta."
  ],
  [MessageType.ACTION_FAIL]: [
    "L'azione non produce i risultati sperati.",
    "Qualcosa è andato storto.",
    "Non è andata come previsto.",
    "Un intoppo imprevisto complica le cose.",
    "Meglio riprovare con un approccio diverso."
  ],

  // Nuovi MessageType
  [MessageType.MOVEMENT_SUCCESS]: [
    "Ti muovi con sicurezza nel territorio.",
    "Ogni passo ti avvicina alla destinazione.",
    "Il cammino procede senza intoppi."
  ],

  [MessageType.REST_SUCCESS]: [
    "Un riposo ristoratore ti ridona energie.",
    "Il sonno ha riparato le fatiche del viaggio.",
    "Ti svegli più forte di prima."
  ],

  [MessageType.LEVEL_UP]: [
    "Le tue esperienze ti hanno reso più forte.",
    "Senti di aver imparato qualcosa di importante.",
    "La sopravvivenza ti ha temprato."
  ],

  [MessageType.ITEM_FOUND]: [
    "Qualcosa di utile attira la tua attenzione.",
    "Un oggetto abbandonato potrebbe tornarti utile.",
    "I resti della civiltà offrono ancora tesori."
  ],

  [MessageType.ITEM_USED]: [
    "L'oggetto si rivela utile come speravi.",
    "Un uso sapiente delle risorse disponibili.",
    "La preparazione ripaga sempre.",
    "Hai consumato una porzione con saggezza.",
    "Ogni risorsa conta in questo mondo desolato."
  ],

  [MessageType.INVENTORY_FULL]: [
    "Non puoi portare altro con te.",
    "Il tuo zaino è già al limite.",
    "Devi scegliere cosa tenere e cosa lasciare."
  ],

  [MessageType.INVENTORY_CHANGE]: [
    "Il tuo inventario è stato aggiornato.",
    "Hai sistemato gli oggetti nel tuo zaino.",
    "Le tue risorse sono cambiate.",
    "Il contenuto del tuo inventario si è modificato."
  ],

  [MessageType.TIME_DAWN]: [
    "I primi raggi di sole squarciano l'oscurità.",
    "Un nuovo giorno inizia nel mondo desolato.",
    "L'alba porta sempre nuove speranze."
  ],

  [MessageType.TIME_DUSK]: [
    "Il sole tramonta all'orizzonte, tingendo tutto di rosso.",
    "Le ombre si allungano mentre cala la sera.",
    "La notte si avvicina con i suoi misteri."
  ],

  [MessageType.TIME_MIDNIGHT]: [
    "La mezzanotte avvolge il mondo nel silenzio.",
    "Le stelle brillano fredde nel cielo notturno.",
    "È l'ora in cui i fantasmi del passato si risvegliano."
  ],

  [MessageType.DISCOVERY]: [
    "Qualcosa di inaspettato cattura la tua attenzione.",
    "Una scoperta interessante si rivela ai tuoi occhi.",
    "Il mondo nasconde ancora sorprese."
  ],

  [MessageType.DANGER]: [
    "Un senso di pericolo ti mette in allerta.",
    "Qualcosa non va in questo posto.",
    "I tuoi istinti ti avvertono di stare attento."
  ],

  [MessageType.MYSTERY]: [
    "Questo luogo nasconde segreti antichi.",
    "Qualcosa di misterioso aleggia nell'aria.",
    "Le risposte che cerchi potrebbero essere qui."
  ],

  // Nuovi messaggi secondo GDD
  [MessageType.SURVIVAL_NIGHT_CONSUME]: [
    "La notte consuma le tue energie. Hai perso 1 punto fame.",
    "Il freddo notturno ti ha indebolito. -1 Fame.",
    "Dormire all'aperto ha un prezzo. La tua fame aumenta."
  ],

  [MessageType.SURVIVAL_PENALTY]: [
    "La fame ti sta consumando. Le tue forze diminuiscono.",
    "La sete ti tormenta. Devi trovare dell'acqua presto.",
    "Il tuo corpo protesta per la mancanza di cibo."
  ],

  [MessageType.MOVEMENT_FAIL_OBSTACLE]: [
    "Un ostacolo insormontabile blocca il tuo cammino.",
    "Non riesci a proseguire in questa direzione.",
    "Il terreno è troppo difficile da attraversare."
  ],

  [MessageType.ACTION_RIVER_CROSSING]: [
    "Ti avvicini cautamente alla riva del fiume.",
    "L'acqua scorre veloce davanti a te. Serve abilità per attraversare.",
    "Il fiume rappresenta una sfida. Puoi tentare di attraversarlo."
  ],

  [MessageType.MOVEMENT_NIGHT_PENALTY]: [
    "Muoversi di notte è pericoloso e faticoso.",
    "L'oscurità rende ogni passo più difficile.",
    "La notte rallenta i tuoi movimenti."
  ],

  [MessageType.SKILL_CHECK_RIVER_FAILURE]: [
    "Il tentativo di attraversare il fiume fallisce.",
    "La corrente è troppo forte. Non riesci ad attraversare.",
    "Le tue abilità non sono sufficienti per questo fiume."
  ],

  [MessageType.SKILL_CHECK_RIVER_DAMAGE]: [
    "La corrente ti trascina. Subisci danni nell'attraversamento.",
    "L'acqua gelida ti ferisce mentre lotti contro la corrente.",
    "Il fiume ti punisce per la tua audacia. Perdi energia."
  ],

  [MessageType.ACTION_RIVER_EXHAUSTION]: [
    "L'attraversamento del fiume ti ha sfinito completamente.",
    "Le tue energie sono esaurite dopo la lotta con la corrente.",
    "Il fiume ha prosciugato le tue forze."
  ],

  [MessageType.XP_GAIN]: [
    "Hai acquisito esperienza dalle tue azioni.",
    "Le sfide superate ti rendono più forte.",
    "Ogni prova affrontata ti fa crescere."
  ],

  [MessageType.STAT_INCREASE]: [
    "Le tue abilità migliorano con l'esperienza.",
    "Senti di essere diventato più capace.",
    "Il tuo potenziale si sta manifestando."
  ],

  [MessageType.STATUS_CHANGE]: [
    "Il tuo stato è cambiato.",
    "Qualcosa in te si è modificato.",
    "Una trasformazione ha avuto luogo."
  ],

  [MessageType.INVENTORY_OPEN]: [
    "Controlli il contenuto del tuo zaino.",
    "Esamini gli oggetti che porti con te.",
    "Fai un inventario delle tue risorse."
  ],

  [MessageType.ITEM_CONSUME]: [
    "Consumi l'oggetto e ne senti gli effetti.",
    "L'oggetto viene utilizzato e scompare dal tuo inventario.",
    "Usi l'oggetto per il suo scopo."
  ],

  [MessageType.ITEM_EQUIP]: [
    "Equipaggi l'oggetto e ti senti più preparato.",
    "L'oggetto è ora parte del tuo equipaggiamento.",
    "Ti prepari indossando l'oggetto."
  ],

  [MessageType.INVENTORY_ADD]: [
    "Aggiungi l'oggetto al tuo inventario.",
    "L'oggetto trova posto nel tuo zaino.",
    "Raccogli l'oggetto per un uso futuro."
  ],

  [MessageType.INVENTORY_REMOVE]: [
    "Rimuovi l'oggetto dal tuo inventario.",
    "L'oggetto non è più nel tuo zaino.",
    "Abbandoni l'oggetto."
  ],

  [MessageType.EVENT_CHOICE]: [
    "La tua scelta ha delle conseguenze.",
    "Decidi di agire secondo il tuo istinto.",
    "Una decisione che potrebbe cambiare tutto.",
    "Le tue azioni determinano il tuo destino."
  ]
};