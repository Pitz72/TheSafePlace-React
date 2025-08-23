export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: MessageType;
  context?: Record<string, any>;
}

// Funzione per ottenere un messaggio casuale dal tipo specificato
export function getRandomMessage(type: MessageType, context?: Record<string, any>): string {
  const messages = MESSAGE_ARCHIVE[type];
  
  if (!messages) {
    console.warn(`Nessun messaggio trovato per il tipo: ${type}`);
    return 'Un evento misterioso accade nel mondo desolato.';
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
  MAX_ENTRIES: 100,
  WELCOME_DELAY: 1000,
  AMBIANCE_PROBABILITY: 0.02, // 2% di probabilità per messaggi d'atmosfera
};

export enum MessageType {
  // Sistema base
  GAME_START = 'GAME_START',
  BIOME_ENTER = 'BIOME_ENTER',
  AMBIANCE_RANDOM = 'AMBIANCE_RANDOM',

  // Movimento e terreno
  MOVEMENT_FAIL_MOUNTAIN = 'MOVEMENT_FAIL_MOUNTAIN',
  MOVEMENT_ACTION_RIVER = 'MOVEMENT_ACTION_RIVER',
  MOVEMENT_SUCCESS = 'MOVEMENT_SUCCESS',

  // Skill checks
  SKILL_CHECK_SUCCESS = 'SKILL_CHECK_SUCCESS',
  SKILL_CHECK_FAILURE = 'SKILL_CHECK_FAILURE',
  SKILL_CHECK_RIVER_SUCCESS = 'SKILL_CHECK_RIVER_SUCCESS',

  // Salute e riposo
  HP_RECOVERY = 'HP_RECOVERY',
  HP_DAMAGE = 'HP_DAMAGE',
  REST_BLOCKED = 'REST_BLOCKED',
  REST_SUCCESS = 'REST_SUCCESS',

  // Azioni generiche
  ACTION_SUCCESS = 'ACTION_SUCCESS',
  ACTION_FAIL = 'ACTION_FAIL',

  // Sistema personaggio
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  LEVEL_UP = 'LEVEL_UP',

  // Inventario e oggetti
  ITEM_FOUND = 'ITEM_FOUND',
  ITEM_USED = 'ITEM_USED',
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
}

export const MESSAGE_ARCHIVE: Record<string, any> = {
  [MessageType.GAME_START]: [
    "La sopravvivenza dipende dalle tue scelte.",
    "Ogni passo è una decisione. Muoviti con [WASD] o le frecce.",
    "Il viaggio inizia ora. Che la fortuna ti accompagni.",
    "Il mondo post-apocalittico si estende davanti a te.",
    "Ultimo si risveglia in un mondo che non riconosce più.",
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
  ]
};