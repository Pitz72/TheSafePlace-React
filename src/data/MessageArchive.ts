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
    return 'Messaggio non disponibile.';
  }
  
  // Se i messaggi sono organizzati per bioma (come BIOME_ENTER)
  if (typeof messages === 'object' && !Array.isArray(messages) && context?.biome) {
    const biomeMessages = messages[context.biome];
    if (biomeMessages && Array.isArray(biomeMessages)) {
      return biomeMessages[Math.floor(Math.random() * biomeMessages.length)];
    }
  }
  
  // Se i messaggi sono un array semplice
  if (Array.isArray(messages)) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  console.warn(`Formato messaggio non riconosciuto per il tipo: ${type}`);
  return 'Messaggio non disponibile.';
}

export const JOURNAL_CONFIG = {
  MAX_ENTRIES: 100,
  WELCOME_DELAY: 1000,
  AMBIANCE_PROBABILITY: 0.02, // 2% di probabilità per messaggi d'atmosfera
};

export enum MessageType {
  // Da ROADMAP-DIARIO-DINAMICO-NARRATIVO-v0.1.5
  GAME_START = 'GAME_START',
  BIOME_ENTER = 'BIOME_ENTER',
  MOVEMENT_FAIL_MOUNTAIN = 'MOVEMENT_FAIL_MOUNTAIN',
  MOVEMENT_ACTION_RIVER = 'MOVEMENT_ACTION_RIVER',
  AMBIANCE_RANDOM = 'AMBIANCE_RANDOM',

  // Da IMPLEMENTAZIONE-SHORT-REST-v0.2.0
  HP_RECOVERY = 'HP_RECOVERY',
  HP_DAMAGE = 'HP_DAMAGE',
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  REST_BLOCKED = 'REST_BLOCKED',
  
  // Da nuove funzionalità e per risolvere errori
  SKILL_CHECK_SUCCESS = 'SKILL_CHECK_SUCCESS',
  SKILL_CHECK_FAILURE = 'SKILL_CHECK_FAILURE',
  SKILL_CHECK_RIVER_SUCCESS = 'SKILL_CHECK_RIVER_SUCCESS',
  ACTION_SUCCESS = 'ACTION_SUCCESS',
  ACTION_FAIL = 'ACTION_FAIL',
}

export const MESSAGE_ARCHIVE: Record<string, any> = {
  [MessageType.GAME_START]: [
    "La sopravvivenza dipende dalle tue scelte.",
    "Ogni passo è una decisione. Muoviti con [WASD] o le frecce.",
    "Il viaggio inizia ora. Che la fortuna ti accompagni.",
  ],
  [MessageType.BIOME_ENTER]: {
    'F': ["Entri in una fitta foresta. Gli alberi sussurrano segreti antichi."],
    '.': ["Una vasta pianura si apre davanti a te. L'orizzonte sembra infinito."],
    'C': ["Rovine di una città emergono dalla desolazione."],
    'S': ["Un piccolo insediamento appare all'orizzonte."],
    'R': ["Una risorsa preziosa attira la tua attenzione."]
  },
  [MessageType.MOVEMENT_FAIL_MOUNTAIN]: [
    "Quella montagna non sembra volersi spostare.",
    "Anche con la rincorsa, non se ne parla.",
    "La montagna ti guarda con aria di sfida. Tu declini educatamente.",
    "Fisica: 1, Ottimismo: 0."
  ],
  [MessageType.MOVEMENT_ACTION_RIVER]: [
    "L'acqua gelida ti toglie il fiato per un istante.",
    "Guadare il fiume richiede uno sforzo notevole.",
  ],
  [MessageType.AMBIANCE_RANDOM]: [
    "Un silenzio innaturale ti circonda.",
    "Il vento ulula tra le rovine in lontananza.",
    "Per un attimo, hai la strana sensazione di essere osservato.",
  ],
  [MessageType.HP_RECOVERY]: [
    "Ti senti rinvigorito dopo il riposo.",
    "Le tue ferite si stanno rimarginando.",
  ],
  [MessageType.HP_DAMAGE]: [
    "Senti un dolore acuto attraversarti.",
    "Le tue forze ti stanno abbandonando.",
  ],
  [MessageType.CHARACTER_CREATION]: [
    "Ultimo emerge dalle nebbie del tempo.",
    "Un nuovo viaggio sta per iniziare.",
  ],
  [MessageType.REST_BLOCKED]: [
    "Il tuo corpo non ha ancora bisogno di riposo.",
    "Troppo presto per riposare di nuovo. Devi aspettare.",
  ],
  [MessageType.SKILL_CHECK_RIVER_SUCCESS]: [
    "Con un balzo agile, superi il fiume senza bagnarti i piedi.",
    "Attraversi il corso d'acqua con sorprendente destrezza."
  ],
  [MessageType.ACTION_SUCCESS]: [
    "L'azione è stata completata con successo.",
    "Tutto procede secondo i piani."
  ],
  [MessageType.ACTION_FAIL]: [
    "L'azione non è riuscita come previsto.",
    "Qualcosa è andato storto."
  ]
};