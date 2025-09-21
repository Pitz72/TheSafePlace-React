// src/interfaces/events.ts

/**
 * Definisce la struttura di un test di abilità (Skill Check) all'interno di un evento.
 */
export interface SkillCheck {
  stat: 'potenza' | 'agilita' | 'vigore' | 'percezione' | 'adattamento' | 'carisma'; // Le statistiche che possono essere testate
  difficulty: number; // La soglia da superare (CD)
}

/**
 * Definisce la struttura di un oggetto ottenuto come ricompensa.
 */
export interface ItemReward {
  id: string; // ID dell'oggetto dal database
  quantity: number;
}

/**
 * Definisce una penalità risultante da una scelta.
 */
export interface Penalty {
  type: 'damage' | 'time' | 'stat_reduction' | 'special' | 'status'; // Tipi di penalità
  amount?: number; // Valore per 'damage', 'time' (in minuti)
  stat?: 'potenza' | 'agilita' | 'vigore' | 'percezione' | 'adattamento' | 'carisma'; // Statistica per 'stat_reduction'
  effect?: string; // Per penalità speciali come 'attract_predators'
  status?: string; // Per penalità di status come 'WOUNDED'
}

/**
 * Tipi di ricompensa specifici che il giocatore può ottenere.
 */
type StatBoostReward = {
  type: 'stat_boost';
  stat: 'potenza' | 'agilita' | 'vigore' | 'percezione' | 'adattamento' | 'carisma';
  amount: number;
  duration: 'temporary' | 'permanent';
};

type XpGainReward = {
  type: 'xp_gain';
  amount: number;
};

type HpGainReward = {
  type: 'hp_gain';
  amount: number;
};

type SpecialReward = {
  type: 'special';
  effect: string; // Es. 'reveal_map_area', 'unlock_shelter'
};

type RevealMapPoiReward = {
  type: 'reveal_map_poi';
};

/**
 * Definisce una ricompensa generica, che può essere di vari tipi.
 * Questa è un'unione discriminata basata sulla proprietà 'type'.
 */
export type Reward = StatBoostReward | XpGainReward | HpGainReward | SpecialReward | RevealMapPoiReward;

/**
 * Definisce le conseguenze specifiche per eventi rest stop.
 */
export interface RestStopConsequences {
  hp?: number; // Recupero HP
  stamina?: number; // Recupero stamina (futuro)
  narrative_text?: string; // Testo narrativo
}

/**
 * Definisce una singola scelta che il giocatore può compiere durante un evento.
 */
export interface EventChoice {
  id?: string; // ID della scelta (per rest stop)
  text: string; // Il testo mostrato al giocatore
  skillCheck?: SkillCheck; // Il test di abilità opzionale associato a questa scelta
  successText?: string; // Testo in caso di successo dello skill check
  failureText?: string; // Testo in caso di fallimento dello skill check
  resultText?: string; // Testo per scelte che non hanno uno skill check
  items_gained?: ItemReward[]; // Array di oggetti ottenuti
  penalty?: Penalty; // La penalità subita
  reward?: Reward; // La ricompensa ottenuta
  actionKey?: 'ignore'; // Chiave per azioni speciali come ignorare l'evento
  consequences?: RestStopConsequences; // Conseguenze specifiche per rest stop
  actions?: Array<{ type: string; payload: any }>; // Azioni da eseguire (es. start_combat)
}

/**
 * Definisce la struttura completa di un evento di gioco dinamico.
 */
export interface GameEvent {
  id: string; // ID univoco dell'evento
  title: string; // Titolo mostrato nella schermata dell'evento
  description: string; // Descrizione della situazione
  choices: EventChoice[]; // Array delle scelte disponibili per il giocatore
  isUnique?: boolean; // Se true, l'evento può accadere solo una volta
  biome?: string; // Bioma specifico per l'evento (per rest stop)
}