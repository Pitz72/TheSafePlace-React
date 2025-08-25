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
  type: 'damage' | 'time' | 'stat_reduction' | 'special'; // Tipi di penalità
  amount?: number; // Valore per 'damage', 'time' (in minuti)
  stat?: 'potenza' | 'agilita' | 'vigore' | 'percezione' | 'adattamento' | 'carisma'; // Statistica per 'stat_reduction'
  effect?: string; // Per penalità speciali come 'attract_predators'
}

/**
 * Definisce una ricompensa speciale risultante da una scelta.
 */
export interface Reward {
  type: 'stat_boost';
  stat: 'stamina'; // Statistica da potenziare
  amount: number;
  duration: 'temporary' | 'permanent';
}

/**
 * Definisce una singola scelta che il giocatore può compiere durante un evento.
 */
export interface EventChoice {
  text: string; // Il testo mostrato al giocatore
  skillCheck?: SkillCheck; // Il test di abilità opzionale associato a questa scelta
  successText?: string; // Testo in caso di successo dello skill check
  failureText?: string; // Testo in caso di fallimento dello skill check
  resultText?: string; // Testo per scelte che non hanno uno skill check
  items_gained?: ItemReward[]; // Array di oggetti ottenuti
  penalty?: Penalty; // La penalità subita
  reward?: Reward; // La ricompensa ottenuta
  actionKey?: 'ignore'; // Chiave per azioni speciali come ignorare l'evento
}

/**
 * Definisce la struttura completa di un evento di gioco dinamico.
 */
export interface GameEvent {
  id: string; // ID univoco dell'evento
  title: string; // Titolo mostrato nella schermata dell'evento
  description: string; // Descrizione della situazione
  choices: EventChoice[]; // Array delle scelte disponibili per il giocatore
}